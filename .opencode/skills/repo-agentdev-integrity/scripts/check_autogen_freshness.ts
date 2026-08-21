// ADF-COVERS(verification): REQ-001-026, REQ-001-028
// ADF-COVERS(implementation): REQ-010-059
/**
 * check_autogen_freshness.ts — AUTOGEN ブロック鮮度検出 gate (REQ-010-059).
 *
 * AUTOGEN ブロック（`<!-- AUTOGEN:BEGIN:id=xxx -->`〜`<!-- AUTOGEN:END -->`）を含む
 * 索引ファイル群について、ソース（frontmatter / ファイル名 / status）の rename や
 * status 変更後に AUTOGEN ブロックが陳腐化しているかを検出する。
 * 不合格時は再生成対象を報告し、自動修復は行わない（autogen-freshness-gate Design）。
 *
 * IR-061（check_integrity.ts checkIndexGenerationConsistency）が同一の不整合を
 * 「内容不一致」として検出するのに対し、本 gate は鮮度の「種別」
 * （rename / status_change / content_change）を分類して報告する。両検査は独立し、
 * いずれか単独の実施要否にも他方の結果は影響しない。
 *
 * 参考 Design:  `docs/designs/integrity/autogen-freshness-gate.md`（REQ-010-059）
 * 参考 IR:    `docs/designs/integrity/rules/IR-061-index-generation-consistency.md`
 * 参考 SC-002: `docs/designs/integrity/index-auto-generation.md`（定期再生成）
 *
 * 使用資産: `cli_utils.ts`, `generate_indexes.ts`（生成ロジック再利用）
 * require/import 混在許容（AG-001、既存資産踏襲）。
 */
import {
  EXIT_OK,
  EXIT_NG,
  EXIT_ERROR,
  findRepoRoot,
} from "./cli_utils.ts";
import {
  findAutogenBlocks,
  collectIrFiles,
  collectDecisionFiles,
  collectRetiredDecisionFiles,
  collectReqFiles,
  collectRetiredReqFiles,
  collectReqMetrics,
  generateCatalogBlocks,
  generateRuleOwnershipAppendix,
  generateDecisionBaselineCaption,
  generateDecisionBaselineTable,
  generateDecisionStatusList,
  generateDecisionRetiredTable,
  generateReqActiveCaption,
  generateReqActiveTable,
  generateReqRetiredTable,
  generateReqMetricsTable,
  generateReadmeReqSummaryCount,
  deriveReqMetricsMeasureDate,
  CATALOG_PRE_BLOCK_ID,
  CATALOG_POST_BLOCK_ID,
  RULE_OWNERSHIP_BLOCK_ID,
  DECISION_BASELINE_COUNT_BLOCK_ID,
  DECISION_BASELINE_TABLE_BLOCK_ID,
  DECISION_STATUS_ACCEPTED_BLOCK_ID,
  DECISION_STATUS_PROPOSED_BLOCK_ID,
  DECISION_STATUS_SUPERSEDED_BLOCK_ID,
  DECISION_STATUS_DEPRECATED_BLOCK_ID,
  DECISION_RETIRED_TABLE_BLOCK_ID,
  REQ_ACTIVE_COUNT_BLOCK_ID,
  REQ_ACTIVE_TABLE_BLOCK_ID,
  REQ_RETIRED_TABLE_BLOCK_ID,
  REQ_METRICS_BLOCK_ID,
  README_REQ_SUMMARY_COUNT_BLOCK_ID,
} from "./generate_indexes.ts";

const path = require("path") as typeof import("path");
const fs = require("fs") as typeof import("fs");

const SCRIPT_NAME = "check_autogen_freshness.ts";
const DESCRIPTION =
  "AUTOGEN block freshness gate — detects stale AUTOGEN blocks after source rename or status change (REQ-010-059)";
const USAGE =
  "bun run check_autogen_freshness.ts [--help] [--json] [--dry-run] [--root <path>]";

// ─── 出力契約 ─────────────────────────────────────────────────────────────

/** 鮮度違反の種別。autogen-freshness-gate Design「鮮度判定基準」に対応。 */
type StaleKind = "rename" | "status_change" | "content_change";

interface FreshnessFinding {
  /** AUTOGEN block を持つ索引ファイルの repo root 相対パス。 */
  file: string;
  /** AUTOGEN block ID。 */
  block_id: string;
  /** ブロック開始行からの不一致行（1-based、開始マーカー行を含まない本文行）。 */
  first_mismatch_line: number;
  /** 鮮度違反の種別。 */
  kind: StaleKind;
  /** 種別判定根拠（人間が読める形式）。 */
  detail: string;
  /** 現在の行（切り詰め済み）。 */
  current_line: string;
  /** 期待される行（切り詰め済み）。 */
  expected_line: string;
}

interface FreshnessReport {
  /** スクリプト実行の ISO timestamp。 */
  timestamp: string;
  /** スクリプト名。 */
  script: string;
  /** 検査した索引ファイル数。 */
  files_scanned: number;
  /** 検出した鮮度違反の件数。 */
  findings_count: number;
  /** 鮮度違反の内訳。 */
  findings: FreshnessFinding[];
  /** スキップした索引ファイル（AUTOGEN marker 不在等）。 */
  skipped: { file: string; block_id: string; reason: string }[];
}

// ─── helper: 行配列比較 ──────────────────────────────────────────────────

/** 2つの行配列の最初の不一致インデックスを返す（一致時は -1）。 */
export function findFirstMismatch(
  current: string[],
  expected: string[],
): number {
  const len = Math.max(current.length, expected.length);
  for (let i = 0; i < len; i++) {
    if (current[i] !== expected[i]) return i;
  }
  return -1;
}

/** ログ出力用に行を切り詰める（undefined は "<missing>" 表記）。 */
export function truncateForLog(line: string | undefined, max = 80): string {
  if (line === undefined) return "<missing>";
  const trimmed = line.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max - 1) + "…";
}

function readText(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf-8") as string;
  } catch {
    return null;
  }
}

export function resolveRelative(fullPath: string, root: string): string {
  const rel = path.relative(root, fullPath);
  return rel.replace(/\\/g, "/");
}

// ─── 鮮度種別判定 ────────────────────────────────────────────────────────

/**
 * Markdown 表の本文行（`| ... | ... |`）をセル配列へ分解する。
 * ヘッダー / セパレータ行（`|---|---|`）は null を返す。
 */
export function parseTableRow(line: string): string[] | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return null;
  // セパレータ行（`|---|---|` 等）は除外。
  if (/^\|[-:\s|]+\|$/.test(trimmed)) return null;
  const inner = trimmed.slice(1, -1);
  return inner.split("|").map((c) => c.trim());
}

/**
 * 現在の AUTOGEN block 本文と期待値を比較し、鮮度種別を判定する。
 *
 * 判定規則（リスト順、最初に該当したものを優先）:
 *   1. 行数の増減 → rename（行の追加・削除 = ファイル追加・削除・rename とみなす）
 *   2. Decision baseline 表の同行異 status 列 → status_change
 *   3. Decision README 表の同行異 status 列 → status_change
 *   4. REQ metrics 表の同行異シグナル/備考列 → content_change（status 列を持たないため）
 *   5. 上記以外の不一致 → content_change
 *
 * 注意: 本判定は「鮮度種別の優先的付与」であり、絶対的分類ではない。
 * 例えば Design rename に伴いDesign行数も変化した場合、行追加・削除を伴えば rename、
 * 同行の値変化だけなら status_change / content_change となる。
 * IR-061 は同一不整合を「内容不一致」として扱い、本 gate と判定基準が異なっても
 * 両検査の実施要否は互いに影響しない（独立実施原則、Design「鮮度判定基準」）。
 */
export function classifyStaleness(
  blockId: string,
  currentBody: string[],
  expectedBody: string[],
  mismatchIndex: number,
): { kind: StaleKind; detail: string } {
  // 1. 行数の増減は rename（ファイル追加・削除・rename）とみなす。
  if (currentBody.length !== expectedBody.length) {
    const delta = expectedBody.length - currentBody.length;
    return {
      kind: "rename",
      detail:
        `AUTOGEN block size differs (current=${currentBody.length} lines, expected=${expectedBody.length} lines, ` +
        `delta=${delta > 0 ? "+" : ""}${delta}). Source file add / remove / rename detected without regeneration.`,
    };
  }

  // 2. 同行の値が異なる場合。種別は表の意味構造から判定。
  const cur = currentBody[mismatchIndex];
  const exp = expectedBody[mismatchIndex];
  const curCells = parseTableRow(cur);
  const expCells = parseTableRow(exp);

  if (curCells && expCells && curCells.length > 0 && expCells.length > 0) {
    // Decision baseline 表: 列構成 = Decision番号 | タイトル | ステータス | 作成日
    // status 列（index 2）のみ変化 → status_change
    if (
      blockId === DECISION_BASELINE_TABLE_BLOCK_ID &&
      curCells.length >= 4 &&
      expCells.length >= 4
    ) {
      if (curCells[0] === expCells[0] && curCells[2] !== expCells[2]) {
        return {
          kind: "status_change",
          detail:
            `Decision status changed without regeneration. id=${curCells[0]}, ` +
            `status current="${curCells[2]}" expected="${expCells[2]}".`,
        };
      }
    }
    // Decision retired 表: 列構成 = Decision番号 | タイトル | retired時ステータス
    // retired時ステータス列（index 2）のみ変化 → status_change
    if (
      blockId === DECISION_RETIRED_TABLE_BLOCK_ID &&
      curCells.length >= 3 &&
      expCells.length >= 3
    ) {
      if (curCells[0] === expCells[0] && curCells[2] !== expCells[2]) {
        return {
          kind: "status_change",
          detail:
            `Retired Decision status changed without regeneration. id=${curCells[0]}, ` +
            `status current="${curCells[2]}" expected="${expCells[2]}".`,
        };
      }
    }
  }

  // 3. 上記以外の不一致は content_change（行数値、備考、リンク、キャプション等の変化）。
  return {
    kind: "content_change",
    detail:
      `AUTOGEN block content differs at line ${mismatchIndex + 1}. ` +
      `Likely caused by source content change (line count, title, caption, etc.) without regeneration.`,
  };
}

// ─── 対象ブロック定義 ────────────────────────────────────────────────────

interface BlockTarget {
  /** ファイル絶対パス。 */
  file: string;
  /** AUTOGEN block ID。 */
  blockId: string;
  /** 期待される本文行配列。 */
  expected: string[];
}

/**
 * 対象索引ファイルとその AUTOGEN block 期待値を構築する。
 * generate_indexes.ts と同一の生成関数を呼び出すことで「検査と生成の論理的同一性」を保証する。
 */
function buildBlockTargets(root: string): BlockTarget[] {
  const targets: BlockTarget[] = [];

  const rulesDir = path.join(root, "docs", "designs", "integrity", "rules");
  const catalogPath = path.join(
    root,
    "docs", "designs",
    "integrity",
    "integrity-rule-catalog.md",
  );
  const ruleOwnershipPath = path.join(
    root,
    "docs", "designs",
    "integrity",
    "rule-ownership.md",
  );
  const decisionsDir = path.join(root, "docs", "decisions");
  const decisionRetiredDir = path.join(decisionsDir, "retired");
  const reqDir = path.join(root, "docs", "requirements");
  const reqRetiredDir = path.join(reqDir, "retired");
  const designsDir = path.join(root, "docs", "designs");
  const decisionReadmePath = path.join(decisionsDir, "README.md");
  const reqReadmePath = path.join(reqDir, "README.md");
  const qualityDir = path.join(designsDir, "quality");
  const reqHealthMetricsPath = path.join(qualityDir, "req-health-metrics.md");
  const docsReadmePath = path.join(root, "docs", "README.md");

  // catalog（pre/post IR-045 gap 2ブロック）。IR ファイルが存在しない場合は対象外。
  if (fs.existsSync(rulesDir)) {
    const infos = collectIrFiles(rulesDir);
    if (infos.length > 0) {
      const { pre, post } = generateCatalogBlocks(infos);
      targets.push({ file: catalogPath, blockId: CATALOG_PRE_BLOCK_ID, expected: pre });
      targets.push({
        file: catalogPath,
        blockId: CATALOG_POST_BLOCK_ID,
        expected: post,
      });
      const ruleOwnershipLines = generateRuleOwnershipAppendix(infos);
      targets.push({
        file: ruleOwnershipPath,
        blockId: RULE_OWNERSHIP_BLOCK_ID,
        expected: ruleOwnershipLines,
      });
    }
  }

  // Decision README（7ブロック、decision-* block ID）。DEC-009 移行後の現行契約。
  // docs/decisions/ 配下に Decision ファイルが存在しない場合は対象外。
  if (fs.existsSync(decisionsDir)) {
    const decisionInfos = collectDecisionFiles(decisionsDir);
    const decisionRetiredInfos = fs.existsSync(decisionRetiredDir)
      ? collectRetiredDecisionFiles(decisionRetiredDir)
      : [];
    targets.push({
      file: decisionReadmePath,
      blockId: DECISION_BASELINE_COUNT_BLOCK_ID,
      expected: generateDecisionBaselineCaption(decisionInfos),
    });
    targets.push({
      file: decisionReadmePath,
      blockId: DECISION_BASELINE_TABLE_BLOCK_ID,
      expected: generateDecisionBaselineTable(decisionInfos),
    });
    targets.push({
      file: decisionReadmePath,
      blockId: DECISION_STATUS_ACCEPTED_BLOCK_ID,
      expected: generateDecisionStatusList(decisionInfos, "accepted"),
    });
    targets.push({
      file: decisionReadmePath,
      blockId: DECISION_STATUS_PROPOSED_BLOCK_ID,
      expected: generateDecisionStatusList(decisionInfos, "proposed"),
    });
    targets.push({
      file: decisionReadmePath,
      blockId: DECISION_STATUS_SUPERSEDED_BLOCK_ID,
      expected: generateDecisionStatusList(decisionInfos, "superseded"),
    });
    targets.push({
      file: decisionReadmePath,
      blockId: DECISION_STATUS_DEPRECATED_BLOCK_ID,
      expected: generateDecisionStatusList(decisionInfos, "deprecated"),
    });
    targets.push({
      file: decisionReadmePath,
      blockId: DECISION_RETIRED_TABLE_BLOCK_ID,
      expected: generateDecisionRetiredTable(decisionRetiredInfos),
    });
  }

  // REQ README（3ブロック）。REQ ファイルが存在しない場合は対象外。
  if (fs.existsSync(reqDir)) {
    const reqInfos = collectReqFiles(reqDir);
    const reqRetiredInfos = fs.existsSync(reqRetiredDir)
      ? collectRetiredReqFiles(reqRetiredDir)
      : [];
    targets.push({
      file: reqReadmePath,
      blockId: REQ_ACTIVE_COUNT_BLOCK_ID,
      expected: generateReqActiveCaption(reqInfos),
    });
    targets.push({
      file: reqReadmePath,
      blockId: REQ_ACTIVE_TABLE_BLOCK_ID,
      expected: generateReqActiveTable(reqInfos),
    });
    targets.push({
      file: reqReadmePath,
      blockId: REQ_RETIRED_TABLE_BLOCK_ID,
      expected: generateReqRetiredTable(reqRetiredInfos),
    });
  }

  // DOC-MAP（docmap-inventory）検査は docs/DOC-MAP.md 廃止（DEC-009、REQ-013）に伴い除去。

  // REQ health-metrics（1ブロック）。計測日は対象ドキュメント群の最終コミット日付（SC-002「計測日導出」）。
  // Design 計測例（design-health-metrics）は Design 文書への永続化を廃止（Issue #2349、RU-0001 AG-002）。
  if (fs.existsSync(reqDir)) {
    const reqMetrics = collectReqMetrics(reqDir);
    const reqMeasureDate = deriveReqMetricsMeasureDate(
      root,
      reqDir,
      reqMetrics,
    );
    if (reqMeasureDate === null) {
      console.error(
        `[check_autogen_freshness] measure date derivation failed for docs/requirements/REQ-*.md ` +
          `(no commit history or git failure)`,
      );
      process.exit(EXIT_ERROR);
    }
    targets.push({
      file: reqHealthMetricsPath,
      blockId: REQ_METRICS_BLOCK_ID,
      expected: generateReqMetricsTable(reqMetrics, reqMeasureDate),
    });
  }

  // docs/README.md（1ブロック）。REQ ファイル群が存在しない場合は計測不能のため対象外。
  if (fs.existsSync(reqDir) && fs.existsSync(reqRetiredDir)) {
    targets.push({
      file: docsReadmePath,
      blockId: README_REQ_SUMMARY_COUNT_BLOCK_ID,
      expected: generateReadmeReqSummaryCount({
        activeReqCount: collectReqFiles(reqDir).length,
        retiredReqCount: collectRetiredReqFiles(reqRetiredDir).length,
      }),
    });
  }

  return targets;
}

// ─── 検査本体 ────────────────────────────────────────────────────────────

interface FileScanContext {
  /** 同一ファイル内の block 検査をまとめるためのキャッシュ。 */
  content: string;
  blocks: ReturnType<typeof findAutogenBlocks>;
}

function scanBlocks(
  targets: BlockTarget[],
  root: string,
): { findings: FreshnessFinding[]; skipped: FreshnessReport["skipped"]; filesScanned: Set<string> } {
  const findings: FreshnessFinding[] = [];
  const skipped: FreshnessReport["skipped"] = [];
  const filesScanned = new Set<string>();

  // 同一ファイルの読込をキャッシュ。
  const fileCache = new Map<string, FileScanContext | null>();

  const getCached = (file: string): FileScanContext | null => {
    if (fileCache.has(file)) return fileCache.get(file) ?? null;
    const content = readText(file);
    if (content === null) {
      fileCache.set(file, null);
      return null;
    }
    const ctx: FileScanContext = { content, blocks: findAutogenBlocks(content) };
    fileCache.set(file, ctx);
    return ctx;
  };

  for (const target of targets) {
    const ctx = getCached(target.file);
    if (ctx === null) {
      skipped.push({
        file: resolveRelative(target.file, root),
        block_id: target.blockId,
        reason: "file not found",
      });
      continue;
    }
    filesScanned.add(target.file);
    const block = ctx.blocks.find((b) => b.id === target.blockId);
    if (!block) {
      skipped.push({
        file: resolveRelative(target.file, root),
        block_id: target.blockId,
        reason: "AUTOGEN marker not found in file",
      });
      continue;
    }
    const mismatchIndex = findFirstMismatch(block.currentBody, target.expected);
    if (mismatchIndex === -1) continue; // fresh

    const classification = classifyStaleness(
      target.blockId,
      block.currentBody,
      target.expected,
      mismatchIndex,
    );
    findings.push({
      file: resolveRelative(target.file, root),
      block_id: target.blockId,
      first_mismatch_line: mismatchIndex + 1,
      kind: classification.kind,
      detail: classification.detail,
      current_line: truncateForLog(block.currentBody[mismatchIndex]),
      expected_line: truncateForLog(target.expected[mismatchIndex]),
    });
  }

  return { findings, skipped, filesScanned };
}

// ─── 出力 formatter ──────────────────────────────────────────────────────

function formatJson(report: FreshnessReport): string {
  return JSON.stringify(report, null, 2);
}

function formatText(report: FreshnessReport): string {
  const lines: string[] = [];
  lines.push(`# ${SCRIPT_NAME} Report`);
  lines.push("");
  lines.push(`- 実行日時: ${report.timestamp}`);
  lines.push(`- スクリプト: ${report.script}`);
  lines.push(`- 検査索引ファイル数: ${report.files_scanned}`);
  lines.push(`- 検出鮮度違反: ${report.findings_count} 件`);
  lines.push("");

  const kindCount = new Map<StaleKind, number>();
  for (const f of report.findings) {
    kindCount.set(f.kind, (kindCount.get(f.kind) ?? 0) + 1);
  }
  if (kindCount.size > 0) {
    lines.push("## 鮮度種別内訳");
    lines.push("");
    lines.push("| 種別 | 件数 |");
    lines.push("|------|------|");
    for (const kind of ["rename", "status_change", "content_change"] as StaleKind[]) {
      const c = kindCount.get(kind) ?? 0;
      if (c > 0) lines.push(`| ${kind} | ${c} |`);
    }
    lines.push("");
  }

  if (report.findings.length > 0) {
    lines.push("## 詳細");
    lines.push("");
    for (const f of report.findings) {
      lines.push(
        `### [${f.kind.toUpperCase()}] ${f.file} (block_id=${f.block_id})`,
      );
      lines.push(`- 不一致行: ${f.first_mismatch_line}`);
      lines.push(`- 詳細: ${f.detail}`);
      lines.push(`- 現在: \`${f.current_line}\``);
      lines.push(`- 期待: \`${f.expected_line}\``);
      lines.push("");
    }
    lines.push("## 再生成手順");
    lines.push("");
    lines.push(
      "AUTOGEN ブロックが陳腐化しています。次のコマンドで再生成してください（autogen-freshness-gate Design、不合格時の処置）。",
    );
    lines.push("");
    lines.push(
      "```",
    );
    lines.push(
      "bun run .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts",
    );
    lines.push("```");
    lines.push("");
  } else {
    lines.push("すべての AUTOGEN ブロックは鮮度が保たれています（再生成不要）。");
    lines.push("");
  }

  if (report.skipped.length > 0) {
    lines.push("## スキップ");
    lines.push("");
    for (const s of report.skipped) {
      lines.push(`- ${s.file} (block_id=${s.block_id}): ${s.reason}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

// ─── main ────────────────────────────────────────────────────────────────

interface Options {
  help: boolean;
  json: boolean;
  dryRun: boolean;
  root?: string;
}

function parseCliArgs(args: string[]): Options {
  const options: Options = { help: false, json: false, dryRun: false };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--root") {
      const v = args[i + 1];
      if (!v) throw new Error("--root requires a value");
      options.root = v;
      i++;
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  return options;
}

function main(): void {
  let options: Options;
  try {
    options = parseCliArgs(process.argv.slice(2));
  } catch (e) {
    console.error(
      `[check_autogen_freshness] ${e instanceof Error ? e.message : String(e)}`,
    );
    process.exit(EXIT_ERROR);
  }

  if (options.help) {
    const helpText = `${SCRIPT_NAME} ― ${DESCRIPTION}

USAGE:
  ${USAGE}

OPTIONS:
  --help            Show this help message
  --json            Output results in JSON format
  --dry-run         List scan targets without running freshness checks
  --root <path>     Explicit repository root (worktree/CI support)

EXIT CODES:
  0  All AUTOGEN blocks are fresh (no staleness detected)
  1  Stale AUTOGEN blocks detected (regeneration required)
  2  Input error or execution failure

STALENESS CLASSIFICATION:
  rename           Source file add / remove / rename detected (block size differs)
  status_change    Same source id but status column changed (Decision status)
  content_change   Other content drift (line count, title, caption, link, etc.)

RELATED:
  - Design: docs/designs/integrity/autogen-freshness-gate.md (REQ-010-059)
  - IR:   docs/designs/integrity/rules/IR-061-index-generation-consistency.md
  - SC-002: docs/designs/integrity/index-auto-generation.md
  - Regeneration: bun run .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts
  - docs-check: /repo/docs-check (Step 1)
`;
    console.log(helpText);
    process.exit(EXIT_OK);
  }

  const scriptDir =
    (typeof import.meta !== "undefined" && (import.meta as any).dir) ||
    __dirname ||
    process.cwd();
  const root = findRepoRoot(scriptDir, { explicitRoot: options.root });

  const targets = buildBlockTargets(root);

  if (options.dryRun) {
    console.log(
      `[check_autogen_freshness] dry-run: ${targets.length} AUTOGEN block targets across ${new Set(targets.map((t) => t.file)).size} files`,
    );
    const byFile = new Map<string, string[]>();
    for (const t of targets) {
      const list = byFile.get(t.file) ?? [];
      list.push(t.blockId);
      byFile.set(t.file, list);
    }
    for (const [file, blockIds] of [...byFile.entries()].sort()) {
      console.log(`  ${resolveRelative(file, root)}: ${blockIds.join(", ")}`);
    }
    process.exit(EXIT_OK);
  }

  const { findings, skipped, filesScanned } = scanBlocks(targets, root);

  const report: FreshnessReport = {
    timestamp: new Date().toISOString(),
    script: SCRIPT_NAME,
    files_scanned: filesScanned.size,
    findings_count: findings.length,
    findings,
    skipped,
  };

  if (options.json) {
    console.log(formatJson(report));
  } else {
    console.log(formatText(report));
  }

  process.exit(findings.length > 0 ? EXIT_NG : EXIT_OK);
}

if (import.meta.main) {
  main();
}
