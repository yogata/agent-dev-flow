// ADF-COVERS(implementation): REQ-010-062
/**
 * check_design_frontmatter.ts — docs/designs/** Design frontmatter 必須キー checker (IR-070).
 *
 * checker-execution-contracts Design「Design frontmatter 必須キー検証観点」節の実現:
 * docs/designs/** の Design frontmatter は title / status / created / updated を必須キーとして
 * 機械検査する。キー欠落、updated 値のキー名欠落（行頭空白付きキー行の破損）、値形式不正を検出し、
 * 既存の Knowledge frontmatter 必須キー検査（check_knowledge_docs.ts、REQ-056-010）と同じ
 * 検出基準で整合性ルールカタログ（rules/IR-070-design-frontmatter-required-keys.md）へ登録する。
 *
 * 検出種別:
 *   - missing-frontmatter: frontmatter ブロック（先頭 --- 〜 閉じ ---）が存在しない
 *   - invalid-frontmatter: 必須キー（title / status / created / updated）の欠落・空値、
 *     created / updated の ISO 8601 日付（YYYY-MM-DD）形式不備、status の draft / accepted 値域違反
 *   - leading-whitespace-key: frontmatter 内の行頭空白付き必須キー行（例: " updated: ..."）。
 *     YAML キーとして認識されないキー名破損（「updated値のキー名欠落」の検出）
 *
 * 検出対象外（設計判断、IR-070 該当節に根拠を記録）:
 *   - updated >= created の順序比較は本 checker の検出対象外とする
 *     （正典の検出列挙「キー欠落、updated値のキー名欠落、値形式不正」に含まれないため）
 *
 * frontmatter 境界抽出・ISO 日付妥当性判定は Knowledge frontmatter 検査と同一実装を
 * check_knowledge_docs.ts から import する（REQ-010-062: 既存 checker が所有する規則から
 * 期待値を導出し、構造変更時に片側のみが陳腐化する二重管理を行わない）。
 * 日付値の解釈は YAML フロースカラーの引用符（"..." / '...'）を剥がしたスカラー値で行う
 * （Design corpus の正規運用が引用符付き日付値を含むため）。
 *
 * 検査対象の除外（checker-execution-contracts Design「検出対象除外規定」準拠）:
 *   - ファイル名 README.md: Design インデックスであり Design 文書ではない
 *    （repo-agentdev-integrity SKILL.md の Designs 検査カテゴリ規定「README.md は Design
 *     inventory/status 同期検査でのみ対象、Design本文検査では除外」と整合）
 *   - references/ サブディレクトリ配下: 親 Design の補助資料であり Design 索引の独立行対象外
 *     （docs/designs/README.md「references/ の Design は親 Design 行の備考欄で言及し、
 *     独立行としては登録しない」。frontmatter を持たない references 文書は対象外）
 *   - audits/ baselines/ 配下: 歴史記録・baseline（検出対象除外規定の正規列挙）
 *   - baseline_for / audit_for 信号キー保持ファイル: 監査記録・baseline の免除規定
 *
 * 使用資産: `cli_utils.ts`（共通 CLI 契約）、`lib/glob_walk.ts`（node:fs glob 共有ヘルパー）、
 * `check_knowledge_docs.ts`（frontmatter 境界抽出・ISO 日付妥当性の既存規則）。
 */
import {
  EXIT_OK,
  EXIT_NG,
  EXIT_ERROR,
  findRepoRoot,
  parseArgs,
} from "./cli_utils.ts";
import {
  extractFrontmatterLines,
  isValidIsoDate,
} from "./check_knowledge_docs.ts";
import { globWalkRel } from "./lib/glob_walk.ts";

const path = require("path") as typeof import("path");
const fs = require("fs") as typeof import("fs");

const SCRIPT_NAME = "check_design_frontmatter.ts";
const DESCRIPTION =
  "docs/designs/** Design frontmatter gate — required keys (title / status / created / updated), key-name corruption, and value format (IR-070, checker-execution-contracts Design)";
const USAGE =
  "bun run check_design_frontmatter.ts [--help] [--json] [--dry-run] [--root <path>]";

// ─── 検査対象定義 ─────────────────────────────────────────────────────────

/** Design 文書の配置領域（repo root 相対）。 */
export const DESIGNS_DIR = "docs/designs";

/** frontmatter 必須フィールド（checker-execution-contracts Design「Design frontmatter 必須キー検証観点」）。 */
export const REQUIRED_DESIGN_FRONTMATTER_FIELDS: readonly string[] = [
  "title",
  "status",
  "created",
  "updated",
];

/** status の許容値（patterns Design「Design frontmatter 形式」: draft / accepted）。 */
export const ALLOWED_STATUS_VALUES: readonly string[] = ["draft", "accepted"];

/** 除外対象のサブディレクトリ名（パス区画単位で判定。checker-execution-contracts 検出対象除外規定）。 */
export const EXCLUDED_DIR_SEGMENTS: readonly string[] = [
  "references",
  "audits",
  "baselines",
];

/** 検出制御用の正規信号キー（checker-execution-contracts 検出対象除外規定）。 */
export const SIGNAL_KEYS: readonly string[] = ["baseline_for", "audit_for"];

// ─── 出力契約 ─────────────────────────────────────────────────────────────

export type DesignFrontmatterFindingKind =
  | "missing-frontmatter"
  | "invalid-frontmatter"
  | "leading-whitespace-key";

export interface DesignFrontmatterFinding {
  /** repo root 相対パス（forward slash 区切り）。 */
  file: string;
  /** 違反種別。 */
  kind: DesignFrontmatterFindingKind;
  /** 種別判定根拠（人間が読める形式）。 */
  detail: string;
}

export interface DesignFrontmatterReport {
  /** スクリプト実行の ISO timestamp。 */
  timestamp: string;
  /** スクリプト名。 */
  script: string;
  /** スキャン対象領域の存在。false の場合は領域未設置（違反としない）。 */
  area_present: boolean;
  /** 列挙した Markdown ファイル数（検査対象・対象外の合計。件数整合の二重確認用）。 */
  files_enumerated: number;
  /** 検査対象ファイル数（除外適用後）。 */
  files_scanned: number;
  /** 検査対象外ファイル数（除外規定適用）。 */
  files_skipped: number;
  /** 検出した違反の件数。 */
  findings_count: number;
  /** 違反の内訳。 */
  findings: DesignFrontmatterFinding[];
}

// ─── 検査ロジック ─────────────────────────────────────────────────────────

/**
 * YAML フロースカラーの値から引用符（"..." / '...'）を剥がしたスカラー値を返す。
 * 前後の空白を trim し、先頭末尾が同種の引用符で囲まれている場合のみ中身を返す。
 */
export function stripYamlQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length >= 2)
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

/**
 * frontmatter 内部行から `key: value` 形式のフィールドを抽出する。
 * 行頭がキー文字（A-Za-z0-9_-）で始まる行のみキーとして認識する
 * （行頭空白付きキー行は YAML キーとして認識されないため fields に入らない。
 * この挙動は check_knowledge_docs.ts の findFrontmatterViolations と同じ検出基準）。
 */
export function extractFrontmatterFields(
  lines: readonly string[],
): Map<string, string> {
  const fields = new Map<string, string>();
  for (const line of lines) {
    const m = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
    if (m && !fields.has(m[1])) fields.set(m[1], m[2].trim());
  }
  return fields;
}

/** frontmatter 内部行の中に行頭空白付きの必須キー行（キー名破損）があればキー名を返す。 */
export function findLeadingWhitespaceKeys(
  lines: readonly string[],
): string[] {
  const corrupted: string[] = [];
  for (const line of lines) {
    const m = /^\s+(title|status|created|updated)\s*:/.exec(line);
    if (m) corrupted.push(m[1]);
  }
  return corrupted;
}

export interface DesignFrontmatterViolation {
  kind: DesignFrontmatterFindingKind;
  problem: string;
}

/**
 * Design frontmatter 検査（IR-070、checker-execution-contracts Design
 * 「Design frontmatter 必須キー検証観点」）。問題ごとに1要素を返す:
 *   - ブロック欠落（missing-frontmatter）
 *   - 行頭空白付き必須キー行（leading-whitespace-key: キー名破損）
 *   - 必須キー（title / status / created / updated）の欠落・空値（invalid-frontmatter）
 *   - created / updated の ISO 8601 日付形式不備（invalid-frontmatter、引用符剥がし後の値で判定）
 *   - status の draft / accepted 値域違反（invalid-frontmatter）
 */
export function findDesignFrontmatterViolations(
  content: string,
): DesignFrontmatterViolation[] {
  const lines = extractFrontmatterLines(content);
  if (lines === null) {
    return [
      {
        kind: "missing-frontmatter",
        problem:
          "frontmatter ブロック（先頭 --- 〜 閉じ ---）が存在しない。" +
          "title / status / created / updated を --- で挟んで記述する",
      },
    ];
  }
  const violations: DesignFrontmatterViolation[] = [];
  for (const key of findLeadingWhitespaceKeys(lines)) {
    violations.push({
      kind: "leading-whitespace-key",
      problem:
        `frontmatter 内に行頭空白付きの必須キー行が存在し、キー名「${key}」が YAML キーとして認識されない` +
        "（キー名破損。「updated値のキー名欠落」の検出）。行頭空白を除去する",
    });
  }
  const fields = extractFrontmatterFields(lines);
  for (const field of REQUIRED_DESIGN_FRONTMATTER_FIELDS) {
    const value = fields.get(field);
    if (value === undefined || value === "") {
      violations.push({
        kind: "invalid-frontmatter",
        problem: `必須 frontmatter フィールド「${field}」が存在しないまたは空`,
      });
    }
  }
  for (const name of ["created", "updated"] as const) {
    const raw = fields.get(name);
    if (raw === undefined || raw === "") continue;
    if (!isValidIsoDate(stripYamlQuotes(raw))) {
      violations.push({
        kind: "invalid-frontmatter",
        problem: `frontmatter フィールド「${name}」は ISO 8601 日付（YYYY-MM-DD）とする`,
      });
    }
  }
  const statusRaw = fields.get("status");
  if (statusRaw !== undefined && statusRaw !== "") {
    const status = stripYamlQuotes(statusRaw);
    if (!ALLOWED_STATUS_VALUES.includes(status)) {
      violations.push({
        kind: "invalid-frontmatter",
        problem:
          `frontmatter フィールド「status」は ${ALLOWED_STATUS_VALUES.join(" / ")} のいずれかとする`,
      });
    }
  }
  return violations;
}

/** 相対パス（forward slash 区切り）が検査対象外か判定する（除外規定の適用）。 */
export function isExcludedDesignFile(relPath: string): boolean {
  const segments = relPath.split("/");
  const fileName = segments[segments.length - 1];
  if (fileName === "README.md") return true;
  return segments.slice(0, -1).some((s) => EXCLUDED_DIR_SEGMENTS.includes(s));
}

/** frontmatter 内部行が baseline_for / audit_for 信号キーを保持するか判定する。 */
export function hasDetectionSignalKey(fmLines: readonly string[] | null): boolean {
  if (fmLines === null) return false;
  return fmLines.some((l) =>
    SIGNAL_KEYS.some((k) => new RegExp(`^${k}\\s*:`).test(l)),
  );
}

/**
 * docs/designs/** の frontmatter 検査（IR-070）。
 * 領域（docs/designs/）が存在しない場合は違反としない（領域未設置は検査対象外）。
 * 列挙件数（files_enumerated）と files_scanned + files_skipped の整合を report に含める
 * （checker 共通実行契約の列挙ベース網羅検査と件数整合の二重確認）。
 */
export function scanDesignFrontmatter(root: string): {
  findings: DesignFrontmatterFinding[];
  filesEnumerated: number;
  filesScanned: number;
  filesSkipped: number;
  areaPresent: boolean;
} {
  const findings: DesignFrontmatterFinding[] = [];
  const areaAbs = path.join(root, ...DESIGNS_DIR.split("/"));
  if (!fs.existsSync(areaAbs)) {
    return {
      findings,
      filesEnumerated: 0,
      filesScanned: 0,
      filesSkipped: 0,
      areaPresent: false,
    };
  }
  const relFiles = globWalkRel(areaAbs, { extensions: [".md"], filesOnly: true });
  let filesScanned = 0;
  let filesSkipped = 0;
  for (const rel of relFiles) {
    const repoRel = `${DESIGNS_DIR}/${rel}`;
    if (isExcludedDesignFile(rel)) {
      filesSkipped++;
      continue;
    }
    const content = fs.readFileSync(path.join(areaAbs, rel), "utf-8") as string;
    if (hasDetectionSignalKey(extractFrontmatterLines(content))) {
      filesSkipped++;
      continue;
    }
    filesScanned++;
    for (const v of findDesignFrontmatterViolations(content)) {
      findings.push({
        file: repoRel,
        kind: v.kind,
        detail: `${v.problem}（IR-070、checker-execution-contracts Design「Design frontmatter 必須キー検証観点」）`,
      });
    }
  }
  return {
    findings,
    filesEnumerated: relFiles.length,
    filesScanned,
    filesSkipped,
    areaPresent: true,
  };
}

// ─── 出力 formatter ──────────────────────────────────────────────────────

function formatJson(report: DesignFrontmatterReport): string {
  return JSON.stringify(report, null, 2);
}

function formatText(report: DesignFrontmatterReport): string {
  const lines: string[] = [];
  lines.push(`# ${SCRIPT_NAME} Report`);
  lines.push("");
  lines.push(`- 実行日時: ${report.timestamp}`);
  lines.push(`- スクリプト: ${report.script}`);
  lines.push(`- 領域 (${DESIGNS_DIR}/): ${report.area_present ? "存在" : "未設置"}`);
  lines.push(
    `- 列挙ファイル数: ${report.files_enumerated}（検査対象 ${report.files_scanned} / 対象外 ${report.files_skipped}）`,
  );
  lines.push(`- 検出違反: ${report.findings_count} 件`);
  lines.push("");

  if (report.findings.length > 0) {
    lines.push("## 詳細");
    lines.push("");
    const kindLabel: Record<DesignFrontmatterFindingKind, string> = {
      "missing-frontmatter": "frontmatter 欠落",
      "invalid-frontmatter": "frontmatter 不備",
      "leading-whitespace-key": "キー名破損",
    };
    for (const f of report.findings) {
      lines.push(`### [${kindLabel[f.kind]}] ${f.file}`);
      lines.push(`- 詳細: ${f.detail}`);
      lines.push("");
    }
  } else {
    lines.push("docs/designs/** の Design frontmatter 違反は検出されませんでした。");
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
  // cli_utils.parseArgs（node:util.parseArgs 委譲、REQ-044-001）を利用する。
  const parsed = parseArgs(args);
  return {
    help: parsed.help,
    json: parsed.json,
    dryRun: parsed.dryRun,
    root: parsed.root,
  };
}

function main(): void {
  let options: Options;
  try {
    options = parseCliArgs(process.argv.slice(2));
  } catch (e) {
    console.error(
      `[${SCRIPT_NAME}] ${e instanceof Error ? e.message : String(e)}`,
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
  --dry-run         List scan target area without running checks
  --root <path>     Explicit repository root (worktree/CI support)

EXIT CODES:
  0  No violations found
  1  Violations detected (missing/invalid frontmatter, corrupted key name)
  2  Input error or execution failure

CHECKS (IR-070, checker-execution-contracts Design "Design frontmatter 必須キー検証観点"):
  missing-frontmatter      Design docs without a frontmatter block (leading --- ... closing ---)
  invalid-frontmatter      Missing/empty title, status, created, updated; non ISO 8601 date
                           (YYYY-MM-DD, after YAML quote stripping); status not draft/accepted
  leading-whitespace-key   Required-key lines with leading whitespace inside frontmatter
                           (key-name corruption, not recognized as a YAML key)

EXEMPT (checker-execution-contracts Design "検出対象除外規定"):
  README.md                Design index, not a Design document
  references/ audits/ baselines/ subdirectories (auxiliary refs / historical records)
  baseline_for / audit_for signal-key holders (audit record / baseline exemption)

OUT OF SCOPE:
  updated >= created ordering is NOT checked (not part of the canonical detection
  enumeration: key missing / key-name missing / invalid value format)

RELATED:
  - IR: docs/designs/integrity/rules/IR-070-design-frontmatter-required-keys.md
  - Design: docs/designs/integrity/checker-execution-contracts.md "Design frontmatter 必須キー検証観点"
  - Kinship checker: check_knowledge_docs.ts (REQ-056-010, same detection criteria source)
  - docs-check: /repo/docs-check (STEP-1)
`;
    console.log(helpText);
    process.exit(EXIT_OK);
  }

  const scriptDir =
    (typeof import.meta !== "undefined" && (import.meta as any).dir) ||
    __dirname ||
    process.cwd();
  const root = findRepoRoot(scriptDir, { explicitRoot: options.root });

  if (options.dryRun) {
    const areaAbs = path.join(root, ...DESIGNS_DIR.split("/"));
    const present = fs.existsSync(areaAbs);
    const relFiles = present
      ? globWalkRel(areaAbs, { extensions: [".md"], filesOnly: true })
      : [];
    console.log(
      `[${SCRIPT_NAME}] dry-run: ${DESIGNS_DIR}/ ${present ? "present" : "absent"}, ${relFiles.length} markdown files`,
    );
    for (const rel of relFiles) {
      const excluded = isExcludedDesignFile(rel);
      console.log(`  ${DESIGNS_DIR}/${rel}${excluded ? "  (excluded)" : ""}`);
    }
    process.exit(EXIT_OK);
  }

  const { findings, filesEnumerated, filesScanned, filesSkipped, areaPresent } =
    scanDesignFrontmatter(root);

  const report: DesignFrontmatterReport = {
    timestamp: new Date().toISOString(),
    script: SCRIPT_NAME,
    area_present: areaPresent,
    files_enumerated: filesEnumerated,
    files_scanned: filesScanned,
    files_skipped: filesSkipped,
    findings_count: findings.length,
    findings,
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
