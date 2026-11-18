// engine/targeted-gate.ts — targeted docs guard（明示対象指定による変更文書限定検査）。
// 契約所有: docs/designs/integrity/targeted-docs-guard-implementation.md
// （CLI 引数、workflow 別検査項目、false-clean 予防、files_checked 空時の警告）
// および docs/designs/integrity/integrity-contracts.md「TargetedDocsReport 型契約」節。
//
// 検証エンジンの明示対象経路である（Oracle 結論、Issue #4154 Wave-2）:
//  - repoRoot・必須検査カテゴリ（workflow profile）・明示変更列挙（--files /
//    --base-ref）を受け付け、残存ルール（rules レジストリ）を選択実行して
//    対象ファイルの違反のみを報告する
//  - files_checked は入力列挙の写しではなく、実在確認・profile 適合で絞り込まれた
//    実検査対象集合である。除外入力は unchecked_reasons で機械検証可能にする
//  - files_checked 空は検証モード問わず FAILURE（REQ-010-076）
//  - Git 列挙失敗は空成功ではなく error（exit 2）として表面化する
//  - 汎用 --changed（対象外のみ即時 Exit 0、REQ-122-006）は本モードと独立に維持
//    され、engine の終了コード単独で workflow 受入を決めない（ワークフロー側が
//    空・不一致を fail-closed 判定する。REQ-010-076、REQ-032-023）

import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { buildContext } from "./context.ts";
import { selectRules, runRules } from "./runner.ts";
import type { IntegrityContext, IntegrityRule } from "./types.ts";

/** targeted docs guard の workflow 識別子（下位契約の許容集合）。 */
export type TargetedWorkflow =
  | "req-save"
  | "design-save"
  | "case-run"
  | "case-close"
  | "docs-check";

export const TARGETED_WORKFLOWS: readonly TargetedWorkflow[] = [
  "req-save",
  "design-save",
  "case-run",
  "case-close",
  "docs-check",
] as const;

export type TargetedFailLevel = "strict" | "warning";

/** 個別検出違反（TargetedDocsReport.failures の要素）。 */
export interface TargetedFailure {
  rule_id: string;
  severity: "strict" | "warning";
  file: string;
  line: number;
  message: string;
  expected: string;
}

/**
 * 入力パスが files_checked にならなかった理由（機械検証可能な検査証拠）。
 * files_checked と突合することで「入力の写し（未検査のエコー）」でないことを
 * ワークフロー側が確認できる（REQ-031-025、REQ-032-023）。
 */
export interface UncheckedReason {
  path: string;
  reason: "not-found" | "out-of-profile";
}

/** TargetedDocsReport（integrity-contracts.md「TargetedDocsReport 型契約」節）。 */
export interface TargetedDocsReport {
  workflow: TargetedWorkflow;
  files_checked: string[];
  coupled_files_checked: string[];
  unchecked_reasons: UncheckedReason[];
  failures: TargetedFailure[];
  warnings: string[];
  doc_map_update_required: boolean;
  spec_readme_update_required: boolean;
  requirements_readme_update_required: boolean;
  full_docs_check_recommended: boolean;
  extensions_check_required: boolean;
  declared_files_check: {
    declared: string[];
    missing: string[];
    extra: string[];
  } | null;
}

/** 実行入力（CLI から組み立てられる）。 */
export interface TargetedGateInput {
  repoRoot: string;
  workflow: TargetedWorkflow;
  /** 明示変更列挙（repoRoot 相対または絶対パス。untracked を含む）。 */
  files: readonly string[];
  /** コミット済み差分の base ref（files と排他ではなくいずれか必須）。 */
  baseRef: string | null;
  declaredFiles: readonly string[];
  failLevel: TargetedFailLevel;
}

/** 環境依存処理（テストで注入可能）。runGit は失敗時に throw する。 */
export interface TargetedGateDeps {
  pathExists(relPath: string): boolean;
  readRaw(relPath: string): string | null;
  runGit(args: readonly string[]): string;
}

/** 対象確定・列挙の失敗（CLI は終了コード 2 へ変換する）。 */
export class TargetedGateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TargetedGateError";
  }
}

/** 既定の fs/git 実装（repoRoot 相対パスで受ける）。 */
export function createNodeTargetedDeps(repoRoot: string): TargetedGateDeps {
  return {
    pathExists(relPath: string): boolean {
      return fs.existsSync(path.join(repoRoot, ...relPath.split("/")));
    },
    readRaw(relPath: string): string | null {
      try {
        return fs.readFileSync(path.join(repoRoot, ...relPath.split("/")), "utf-8");
      } catch {
        return null;
      }
    },
    runGit(args: readonly string[]): string {
      return execFileSync("git", [...args], {
        cwd: repoRoot,
        encoding: "utf-8",
        maxBuffer: 64 * 1024 * 1024,
      }) as string;
    },
  };
}

interface TargetedWorkflowProfile {
  workflow: TargetedWorkflow;
  appliesTo(rel: string): boolean;
  coupledFor(rel: string): string[];
  computesDocMapUpdate: boolean;
  computesRequirementsReadmeUpdate: boolean;
  computesSpecReadmeUpdate: boolean;
  computesFullDocsCheckRecommendation: boolean;
}

function couplingForReq(relPath: string): string[] {
  const coupled = new Set<string>();
  if (/^docs\/requirements\/REQ-.*\.md$/.test(relPath)) {
    coupled.add("docs/requirements/README.md");
    coupled.add("docs/DOC-MAP.md");
    coupled.add("docs/README.md");
    coupled.add("AGENTS.md");
  }
  return [...coupled];
}

function couplingForDesign(relPath: string): string[] {
  const coupled = new Set<string>();
  if (/^docs\/designs\/.*\.md$/.test(relPath)) {
    coupled.add("docs/designs/README.md");
    coupled.add("docs/DOC-MAP.md");
  }
  return [...coupled];
}

function defaultCoupling(relPath: string): string[] {
  const coupled = new Set<string>();
  if (/^docs\//.test(relPath)) {
    coupled.add("docs/DOC-MAP.md");
    coupled.add("docs/README.md");
  }
  if (/^docs\/designs\//.test(relPath)) coupled.add("docs/designs/README.md");
  if (/^docs\/requirements\//.test(relPath)) {
    coupled.add("docs/requirements/README.md");
  }
  return [...coupled];
}

export function profileFor(workflow: TargetedWorkflow): TargetedWorkflowProfile {
  if (workflow === "req-save") {
    return {
      workflow,
      appliesTo: (rel) => /^docs\/requirements\/REQ-.*\.md$/.test(rel),
      coupledFor: couplingForReq,
      computesDocMapUpdate: true,
      computesRequirementsReadmeUpdate: true,
      computesSpecReadmeUpdate: true,
      computesFullDocsCheckRecommendation: false,
    };
  }
  if (workflow === "design-save") {
    return {
      workflow,
      appliesTo: (rel) => /^docs\/designs\/.*\.md$/.test(rel),
      coupledFor: couplingForDesign,
      computesDocMapUpdate: true,
      computesRequirementsReadmeUpdate: false,
      computesSpecReadmeUpdate: true,
      computesFullDocsCheckRecommendation: false,
    };
  }
  if (workflow === "case-run") {
    return {
      workflow,
      // REQ-010-077: case-run で変更され得る docs 領域を単一 profile で網羅する
      // （docs/knowledge/**・traceability/** を含む。TARGET-EMPTY 恒常化禁止）。
      appliesTo: (rel) =>
        rel.startsWith("docs/") ||
        rel.startsWith("traceability/") ||
        rel === "AGENTS.md" ||
        rel === "README.md",
      coupledFor: defaultCoupling,
      computesDocMapUpdate: true,
      computesRequirementsReadmeUpdate: true,
      computesSpecReadmeUpdate: true,
      computesFullDocsCheckRecommendation: false,
    };
  }
  if (workflow === "case-close") {
    return {
      workflow,
      appliesTo: () => true,
      coupledFor: defaultCoupling,
      computesDocMapUpdate: false,
      computesRequirementsReadmeUpdate: false,
      computesSpecReadmeUpdate: true,
      computesFullDocsCheckRecommendation: true,
    };
  }
  return {
    workflow: "docs-check",
    // 代替検査指定用の全ファイル対象 profile（REQ-010-077 の運用明記）。
    appliesTo: () => true,
    coupledFor: defaultCoupling,
    computesDocMapUpdate: true,
    computesRequirementsReadmeUpdate: true,
    computesSpecReadmeUpdate: true,
    computesFullDocsCheckRecommendation: false,
  };
}

/** 絶対パス・区切り文字を正規化して repoRoot 相対・forward slash へ揃える。 */
export function normalizeRelPath(repoRoot: string, filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/").trim();
  if (path.isAbsolute(filePath)) {
    return path.relative(repoRoot, filePath).replace(/\\/g, "/");
  }
  return normalized;
}

// ─── 変更記述子（行レベル意味差分の導出元影響判定） ──────────────────────────

const INDEX_FRONTMATTER_KEYS = new Set([
  "id",
  "title",
  "status",
  "type",
  "domain",
  "scope",
  "superseded_by",
]);

interface ChangeDescriptor {
  relPath: string;
  lifecycle: "added" | "deleted" | "renamed" | "modified" | "unknown";
  previousRelPath?: string;
  changedFrontmatterKeys: Set<string>;
}

interface GitNameStatus {
  status: "A" | "D" | "R" | "M" | null;
  previousPath?: string;
}

function parseGitNameStatusLine(out: string): GitNameStatus {
  const line = out.split("\n").find((l) => l.trim().length > 0);
  if (!line) return { status: null };
  const parts = line.split("\t");
  const statusCode = parts[0] ?? "";
  if (statusCode.startsWith("R") || statusCode.startsWith("C")) {
    return { status: "R", previousPath: parts[2]?.trim() };
  }
  if (statusCode === "A") return { status: "A" };
  if (statusCode === "D") return { status: "D" };
  if (statusCode === "M") return { status: "M" };
  return { status: null };
}

function parseGitStatusPorcelain(out: string): GitNameStatus {
  const line = out.split("\n").find((l) => l.trim().length > 0);
  if (!line) return { status: null };
  const xy = line.slice(0, 2);
  if (xy === "??") return { status: "A" };
  if (xy[0] === "R" || xy[0] === "C") {
    const rest = line.slice(3);
    const tabIdx = rest.indexOf("\t");
    if (tabIdx >= 0) {
      return { status: "R", previousPath: rest.slice(0, tabIdx).trim() };
    }
    return { status: "R" };
  }
  if (xy.includes("A")) return { status: "A" };
  if (xy.includes("D")) return { status: "D" };
  if (xy.includes("M")) return { status: "M" };
  return { status: null };
}

function gitNameStatusFor(
  deps: TargetedGateDeps,
  rel: string,
  baseRef: string | null,
): GitNameStatus {
  try {
    // --base-ref 時は baseRef...HEAD の committed range を見る。
    // --files 時は HEAD..working-tree を見る（uncommitted 変更）。
    const diffArgs = baseRef
      ? ["diff", "--name-status", "--diff-filter=ADRMCR", `${baseRef}...HEAD`, "--", rel]
      : ["diff", "--name-status", "--diff-filter=ADRMCR", "HEAD", "--", rel];
    const parsed = parseGitNameStatusLine(deps.runGit(diffArgs));
    if (parsed.status) return parsed;

    // --files モードでは未追跡ファイルを git status で検出
    if (!baseRef) {
      try {
        return parseGitStatusPorcelain(deps.runGit(["status", "--porcelain", "--", rel]));
      } catch {
        return { status: null };
      }
    }
    return { status: null };
  } catch {
    return { status: null };
  }
}

function parseSimpleFrontmatter(content: string): Record<string, string> | null {
  const parts = content.split("---");
  if (parts.length < 3) return null;
  const result: Record<string, string> = {};
  for (const line of parts[1]!.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const k = line.slice(0, idx).trim();
    const v = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (k) result[k] = v;
  }
  return result;
}

function frontmatterAtRef(
  deps: TargetedGateDeps,
  ref: string,
  rel: string,
): Record<string, string> | null {
  try {
    const out = deps.runGit(["show", `${ref}:${rel}`]);
    return parseSimpleFrontmatter(out);
  } catch {
    return null;
  }
}

function changedFrontmatterKeysFor(
  deps: TargetedGateDeps,
  rel: string,
  baseRef: string | null,
  lifecycle: ChangeDescriptor["lifecycle"],
): Set<string> {
  // 追加/削除/リネームは lifecycle のみで判定するため frontmatter 差分は不要
  if (lifecycle === "added" || lifecycle === "deleted" || lifecycle === "renamed") {
    return new Set();
  }
  const ref = baseRef ?? "HEAD";
  const oldFm = frontmatterAtRef(deps, ref, rel);
  if (!oldFm) return new Set();
  const content = deps.readRaw(rel);
  if (!content) return new Set();
  const newFm = parseSimpleFrontmatter(content) ?? {};
  const keys = new Set<string>();
  for (const k of new Set([...Object.keys(oldFm), ...Object.keys(newFm)])) {
    if (oldFm[k] !== newFm[k]) keys.add(k);
  }
  return keys;
}

function computeChangeDescriptors(
  deps: TargetedGateDeps,
  files: readonly string[],
  baseRef: string | null,
): ChangeDescriptor[] {
  return files.map((relPath) => {
    const status = gitNameStatusFor(deps, relPath, baseRef);
    let lifecycle: ChangeDescriptor["lifecycle"] = "unknown";
    let previousRelPath: string | undefined;
    if (status.status === "A") lifecycle = "added";
    else if (status.status === "D") lifecycle = "deleted";
    else if (status.status === "R") {
      lifecycle = "renamed";
      previousRelPath = status.previousPath;
    } else if (status.status === "M") lifecycle = "modified";
    const changedKeys = changedFrontmatterKeysFor(deps, relPath, baseRef, lifecycle);
    return { relPath, lifecycle, previousRelPath, changedFrontmatterKeys: changedKeys };
  });
}

/** 導出元影響判定: lifecycle 変更または索引 frontmatter 値変更で true。 */
function isIndexChange(s: ChangeDescriptor): boolean {
  if (s.lifecycle === "added" || s.lifecycle === "deleted" || s.lifecycle === "renamed") {
    return true;
  }
  for (const k of s.changedFrontmatterKeys) {
    if (INDEX_FRONTMATTER_KEYS.has(k)) return true;
  }
  return false;
}

/** 正規 Design ファイル判定（references/ 配下は対象外。Design 判定契約）。 */
function isDesignFile(relPath: string): boolean {
  if (!/^docs\/designs\/.*\.md$/.test(relPath)) return false;
  if (/^docs\/designs\/.+\/references\//.test(relPath)) return false;
  return true;
}

// ─── メイン実行 ────────────────────────────────────────────────────────────

function detectDocMapUpdateRequired(
  deps: TargetedGateDeps,
  changedFiles: readonly string[],
): boolean {
  const content = deps.readRaw("docs/DOC-MAP.md");
  if (!content) return false;
  for (const rel of changedFiles) {
    const mentioned =
      rel.includes("REQ-") || rel.includes("docs/designs/")
        ? content.includes(rel) || content.includes(rel.split("/").pop() ?? rel)
        : false;
    if (mentioned) return false;
  }
  return changedFiles.length > 0;
}

const FULL_DOCS_CHECK_RE: RegExp[] = [
  /docs\/designs\/integrity\/rules\//,
  /docs\/designs\/integrity\/integrity-rule-catalog\.md/,
  /docs\/designs\/integrity\/rule-ownership\.md/,
  /docs\/designs\/foundations\/document-model/,
  /docs\/designs\/responsibilities\/document-type-responsibilities/,
  /docs\/DOC-MAP\.md/,
  /docs\/designs\/README\.md/,
  /^\.agentdev\/config\.yaml$/,
  /^\.agentdev\/extensions\//,
];

/**
 * targeted docs guard の本体実行。TargetedDocsReport を組み立てて終了コード
 * （0 = OK、1 = failLevel 以上の違反あり）を返す。対象確定・列挙の失敗は
 * TargetedGateError として throw する（CLI は終了コード 2 へ変換）。
 */
export async function runTargetedDocsGate(
  input: TargetedGateInput,
  deps: TargetedGateDeps,
  rules: readonly IntegrityRule[],
  buildCtx: (repoRoot: string, changedFiles: readonly string[]) => IntegrityContext = buildContext,
): Promise<{ report: TargetedDocsReport; exitCode: 0 | 1 }> {
  if (input.files.length === 0 && input.baseRef === null) {
    throw new TargetedGateError(
      "either --files or --base-ref is required (対象の特定なしに検査を実行できない)",
    );
  }

  const profile = profileFor(input.workflow);
  const unchecked: UncheckedReason[] = [];
  const candidates: string[] = [];

  if (input.files.length > 0) {
    const seen = new Set<string>();
    for (const raw of input.files) {
      const rel = normalizeRelPath(input.repoRoot, raw);
      if (rel.length === 0 || seen.has(rel)) continue;
      if (rel.startsWith("../") || rel === "..") {
        // repo ルート外の入力は --root 誤解決（誤リポジトリ検査）の兆候のため
        // unchecked 分類で黙示扱いせず error で拒否する（fail-closed）。
        throw new TargetedGateError(
          `--files entry is outside the repository root (${input.repoRoot}): ${raw}`,
        );
      }
      seen.add(rel);
      // files_checked は入力の写しではなく実在確認を通過した対象のみで構成する。
      // --files モードでは存在しないパスを検査対象に含めない（not-found として
      // unchecked_reasons へ記録し、検査見逃しを機械検証可能にする）。
      if (!deps.pathExists(rel)) {
        unchecked.push({ path: rel, reason: "not-found" });
        continue;
      }
      candidates.push(rel);
    }
  } else {
    // --base-ref モード: Git 列挙失敗は空成功ではなく error として表面化する。
    let diffOut: string;
    try {
      diffOut = deps.runGit(["diff", "--name-only", `${input.baseRef}...HEAD`]);
    } catch (e) {
      throw new TargetedGateError(
        `git diff against --base-ref ${input.baseRef} failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
    // 削除・移動されたファイルも files_checked に含め、行レベル意味差分で
    // lifecycle (deleted/renamed) を検出できるようにする（Issue #1784）。
    for (const line of diffOut.split("\n")) {
      const rel = line.trim();
      if (rel.length > 0) candidates.push(rel);
    }
  }

  const filesChecked: string[] = [];
  for (const rel of candidates) {
    if (profile.appliesTo(rel)) {
      filesChecked.push(rel);
    } else {
      unchecked.push({ path: rel, reason: "out-of-profile" });
    }
  }

  const coupledSet = new Set<string>();
  for (const rel of filesChecked) {
    for (const coupled of profile.coupledFor(rel)) {
      if (deps.pathExists(coupled)) coupledSet.add(coupled);
    }
  }
  const coupledFilesChecked = [...coupledSet].sort();

  const failures: TargetedFailure[] = [];
  const warnings: string[] = [];

  // 対象が空の場合はルールを実行しない（全量実行への逸脱防止）。空の判定は
  // ワークフロー側の fail-closed 確認と併せて TARGET-EMPTY FAILURE で報告する。
  if (filesChecked.length > 0) {
    const selection = selectRules(rules, filesChecked, null);
    const ctx = buildCtx(input.repoRoot, filesChecked);
    const results = await runRules(selection.selected, ctx);
    const checkedSet = new Set([...filesChecked, ...coupledFilesChecked]);
    for (const violation of results.flatMap((r) => r.violations)) {
      if (!checkedSet.has(violation.filePath)) continue;
      failures.push({
        rule_id: violation.ruleId,
        severity: violation.severity === "error" ? "strict" : "warning",
        file: violation.filePath,
        line: violation.line ?? 0,
        message: violation.message,
        expected: violation.remediationHint ?? "",
      });
    }
    for (const result of results) {
      if (result.error !== undefined) {
        // ルール実行エラーは当該対象の検査が実施されなかったことを意味するため
        // strict FAILURE として扱う（fail-closed。既定 failLevel=strict で
        // 無視されて合格扱いになる false-green を許容しない）。
        failures.push({
          rule_id: result.ruleId,
          severity: "strict",
          file: "",
          line: 0,
          message: `rule execution error: ${result.error}`,
          expected: "検査ルールの実行エラーを解消して再実行すること（エラーを無視した合格扱いは不可）",
        });
      }
    }
  }

  const descriptors = computeChangeDescriptors(deps, filesChecked, input.baseRef);

  const docMapUpdateRequired = profile.computesDocMapUpdate
    ? detectDocMapUpdateRequired(deps, filesChecked)
    : false;
  const specReadmeUpdateRequired = profile.computesSpecReadmeUpdate
    ? descriptors.some((d) => isDesignFile(d.relPath) && isIndexChange(d))
    : false;
  const requirementsReadmeUpdateRequired = profile.computesRequirementsReadmeUpdate
    ? descriptors.some(
        (d) => /^docs\/requirements\/REQ-.*\.md$/.test(d.relPath) && isIndexChange(d),
      )
    : false;
  const fullDocsCheckRecommended = profile.computesFullDocsCheckRecommendation
    ? filesChecked.some((rel) => FULL_DOCS_CHECK_RE.some((re) => re.test(rel)))
    : false;
  const extensionsCheckRequired = descriptors.some((d) => {
    if (/^docs\/requirements\/REQ-.*\.md$/.test(d.relPath)) return isIndexChange(d);
    if (/^docs\/decisions\/DEC-.*\.md$/.test(d.relPath)) return isIndexChange(d);
    return isDesignFile(d.relPath) && isIndexChange(d);
  });

  const declaredFilesCheck =
    input.declaredFiles.length > 0
      ? (() => {
          const declared = input.declaredFiles.map((d) => normalizeRelPath(input.repoRoot, d));
          const actual = filesChecked;
          const declaredSet = new Set(declared);
          const actualSet = new Set(actual);
          return {
            declared,
            missing: declared.filter((d) => !actualSet.has(d)),
            extra: actual.filter((a) => !declaredSet.has(a)),
          };
        })()
      : null;

  // files_checked 空（TARGET-EMPTY）は検証モード問わず FAILURE（REQ-010-076）。
  // verification-only PR の正当性確認はワークフロー側（case-close）が行う。
  if (filesChecked.length === 0) {
    failures.push({
      rule_id: "TARGET-EMPTY",
      severity: "strict",
      file: "",
      line: 0,
      message:
        "対象ファイルが検出されませんでした（files_checked 空）。指定の不備、workflow profile の対象外、検査対象 root の誤解決、PR 変更ファイル取得の失敗等の確認なく合格扱いにしない（REQ-010-076）",
      expected:
        "--files の実在確認・workflow profile の appliesTo 該否（unchecked_reasons 参照）・--root の解決先を確認して再実行すること",
    });
    warnings.push(
      unchecked.length > 0
        ? `files_checked が空です。除外入力の理由を unchecked_reasons で確認してください: ${unchecked
            .map((u) => `${u.path} (${u.reason})`)
            .join(", ")}`
        : "files_checked が空です（入力なし、または全入力が profile 対象外）。検査見逃しとして扱うこと（REQ-010-076）",
    );
  }

  const report: TargetedDocsReport = {
    workflow: input.workflow,
    files_checked: filesChecked,
    coupled_files_checked: coupledFilesChecked,
    unchecked_reasons: unchecked,
    failures,
    warnings,
    doc_map_update_required: docMapUpdateRequired,
    spec_readme_update_required: specReadmeUpdateRequired,
    requirements_readme_update_required: requirementsReadmeUpdateRequired,
    full_docs_check_recommended: fullDocsCheckRecommended,
    extensions_check_required: extensionsCheckRequired,
    declared_files_check: declaredFilesCheck,
  };

  const hasFailures =
    input.failLevel === "warning"
      ? failures.length > 0
      : failures.some((f) => f.severity === "strict");
  return { report, exitCode: hasFailures ? 1 : 0 };
}

/** text 出力（--json 未指定時）。 */
export function formatTargetedDocsTextReport(report: TargetedDocsReport): string {
  const lines: string[] = [];
  lines.push(`Targeted Docs Guard — workflow: ${report.workflow}`);
  lines.push(`files checked: ${report.files_checked.length}`);
  for (const f of report.files_checked) lines.push(`  ${f}`);
  lines.push(`coupled files checked: ${report.coupled_files_checked.length}`);
  for (const f of report.coupled_files_checked) lines.push(`  ${f}`);
  lines.push(`unchecked reasons: ${report.unchecked_reasons.length}`);
  for (const u of report.unchecked_reasons) lines.push(`  ${u.path} (${u.reason})`);
  lines.push(`failures: ${report.failures.length}`);
  for (const f of report.failures) {
    lines.push(`  [${f.severity}] ${f.rule_id} ${f.file}:${f.line} — ${f.message}`);
  }
  lines.push(`warnings: ${report.warnings.length}`);
  for (const w of report.warnings) lines.push(`  ${w}`);
  lines.push(`doc_map_update_required: ${report.doc_map_update_required}`);
  lines.push(`spec_readme_update_required: ${report.spec_readme_update_required}`);
  lines.push(`requirements_readme_update_required: ${report.requirements_readme_update_required}`);
  lines.push(`full_docs_check_recommended: ${report.full_docs_check_recommended}`);
  lines.push(`extensions_check_required: ${report.extensions_check_required}`);
  if (report.declared_files_check) {
    lines.push(`declared_files_check:`);
    lines.push(`  declared: ${report.declared_files_check.declared.length}`);
    lines.push(`  missing: ${report.declared_files_check.missing.length}`);
    for (const m of report.declared_files_check.missing) lines.push(`    ${m}`);
    lines.push(`  extra: ${report.declared_files_check.extra.length}`);
    for (const e of report.declared_files_check.extra) lines.push(`    ${e}`);
  }
  return lines.join("\n");
}
