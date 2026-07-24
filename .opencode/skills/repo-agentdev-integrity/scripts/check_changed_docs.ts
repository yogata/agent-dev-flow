/**
 * check_changed_docs.ts — Targeted docs guard (REQ-0158-003).
 *
 * 変更ファイル限定の整合性検査。req-save / spec-save / case-run / case-close / docs-check の
 * 各 workflow で実行する。全体監査 (`check_integrity.ts`) に処理を密結合させず、
 * 変更ファイルと連動ファイルだけを対象とする薄い入口として振る舞う。
 *
 * 処理層 (5層):
 *   1. changed file resolver    — --files / --base-ref から変更ファイルを特定
 *   2. workflow profile resolver — workflow 別の検査項目を選択
 *   3. coupled file resolver     — 変更ファイルに連動する README/DOC-MAP/related を特定
 *   4. targeted check runner     — 選択された検査項目を実行
 *   5. JSON/text reporter        — 結果を JSON または text で出力
 *
 * CLI:
 *   --workflow req-save|spec-save|case-run|case-close|docs-check
 *   --files <path...>             変更ファイル（main 環境向け。--base-ref と排他）
 *   --base-ref <git-ref>          git diff の base ref（worktree 環境向け。--files と排他）
 *   --json                        JSON 出力
 *   --fail-level strict|warning   失敗扱いとする最低レベル（デフォルト strict）
 *   --root <path>                 明示的リポジトリルート（REQ-0145-014: worktree/CI 対応）
 *
 * 責務境界は全体監査と不変。実行タイミングと対象を保存工程内の変更ファイルへ狭めるだけ。
 * 本機構は REQ-0108-153 delta guard の具体化である。
 */

import {
  EXIT_OK,
  EXIT_NG,
  EXIT_ERROR,
  type FindingRoute,
  type FindingCategory,
  findRepoRoot,
} from "./cli_utils.ts";

const path = require("path") as typeof import("path");
const fs = require("fs") as typeof import("fs");

const SCRIPT_NAME = "check_changed_docs.ts";
const DESCRIPTION =
  "Targeted docs integrity guard for save workflows (REQ-0158-003)";
const USAGE =
  "bun run check_changed_docs.ts --workflow <name> [--files <path...> (space-separated recommended; comma-separated also accepted) | --base-ref <git-ref>] [--json] [--fail-level strict|warning] [--root <path>]";
const REF_USAGE_NOTES =
  "--files は main 環境（マージ後、case-close 等）で PR 変更ファイルを直接指定するときに使用。" +
  "--base-ref は worktree 環境（マージ前、case-run 等）で git diff により変更ファイル検出するときに使用。";
// REQ-0158-001: --files の区切り形式（space 区切り推奨、comma 区切りも受入）。後方互換性を担保。
const FILES_DELIMITER_NOTES =
  "--files の区切り形式: space 区切り（推奨、例: --files a.md b.md c.md）、または comma 区切り（例: --files a.md,b.md,c.md）。両形式の混在も可。";

type Workflow = "req-save" | "spec-save" | "case-run" | "case-close" | "docs-check";
type FailLevel = "strict" | "warning";

interface Failure {
  rule_id: string;
  severity: "strict" | "warning";
  file: string;
  line: number;
  message: string;
  expected: string;
}

interface TargetedDocsReport {
  workflow: Workflow;
  files_checked: string[];
  coupled_files_checked: string[];
  failures: Failure[];
  warnings: string[];
  doc_map_update_required: boolean;
  spec_readme_update_required: boolean;
  requirements_readme_update_required: boolean;
  full_docs_check_recommended: boolean;
  extensions_check_required: boolean;
  // REQ-0158「check_changed_docs.ts report フィールド」節。
  // 検査入力の必要性（boolean）。当該 workflow profile が文書検査入力を
  // 必要とするかを示す。downstream（case-close 等）が silent pass 検出に使用。
  // 現行 5 workflow はすべて文書検査ルールを持つため true。
  docInputsCheckRequired: boolean;
  declared_files_check: { declared: string[]; missing: string[]; extra: string[] } | null;
}

interface ParsedArgs {
  workflow: Workflow | null;
  files: string[];
  baseRef: string | null;
  json: boolean;
  failLevel: FailLevel;
  declaredFiles: string[];
  help: boolean;
  root?: string; // REQ-0145-014
}

function parseArgs(args: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    workflow: null,
    files: [],
    baseRef: null,
    json: false,
    failLevel: "strict",
    declaredFiles: [],
    help: false,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--help" || a === "-h") {
      parsed.help = true;
    } else if (a === "--json") {
      parsed.json = true;
    } else if (a === "--workflow") {
      const v = args[i + 1];
      if (!v) throw new Error("--workflow requires a value");
      if (
        v !== "req-save" &&
        v !== "spec-save" &&
        v !== "case-run" &&
        v !== "case-close" &&
        v !== "docs-check"
      ) {
        throw new Error(
          `--workflow must be one of: req-save, spec-save, case-run, case-close, docs-check (got: ${v})`,
        );
      }
      parsed.workflow = v as Workflow;
      i++;
    } else if (a === "--files") {
      i++;
      while (i < args.length && !args[i].startsWith("--")) {
        // REQ-0158-001: comma 区切り（例: --files a.md,b.md）も受入。各 token を split して個別 file として積む。
        for (const token of args[i].split(",")) {
          const trimmed = token.trim();
          if (trimmed.length > 0) parsed.files.push(trimmed);
        }
        i++;
      }
      i--;
    } else if (a === "--base-ref") {
      const v = args[i + 1];
      if (!v) throw new Error("--base-ref requires a value");
      parsed.baseRef = v;
      i++;
    } else if (a === "--fail-level") {
      const v = args[i + 1];
      if (!v) throw new Error("--fail-level requires a value");
      if (v !== "strict" && v !== "warning") {
        throw new Error(`--fail-level must be strict or warning (got: ${v})`);
      }
      parsed.failLevel = v as FailLevel;
      i++;
    } else if (a === "--root") { // REQ-0145-014
      const v = args[i + 1];
      if (!v) throw new Error("--root requires a value");
      parsed.root = v;
      i++;
    } else if (a === "--declared-files") {
      i++;
      while (i < args.length && !args[i].startsWith("--")) {
        parsed.declaredFiles.push(args[i]);
        i++;
      }
      i--;
    } else {
      throw new Error(`Unknown argument: ${a}`);
    }
  }
  return parsed;
}

function printHelp(): void {
  console.error(`usage: ${USAGE}`);
  console.error("");
  console.error(`description: ${DESCRIPTION}`);
  console.error("");
  console.error("options:");
  console.error("  --workflow <name>   req-save | spec-save | case-run | case-close | docs-check (required)");
  console.error("  --files <path...>   changed files (space-separated recommended; comma-separated also accepted); for main env (post-merge, case-close). mutually exclusive with --base-ref");
  console.error(`  ${FILES_DELIMITER_NOTES}`);
  console.error("  --base-ref <ref>    git base ref to compute changed files; for worktree env (pre-merge, case-run). mutually exclusive with --files");
  console.error(`  ${REF_USAGE_NOTES}`);
  console.error("  --json              emit JSON report (default: text)");
  console.error("  --fail-level <lvl>  strict (default) | warning");
  console.error("  --root <path>        explicit repository root (REQ-0145-014: worktree/CI support)");
  console.error("  --declared-files <path...>  declared doc update targets in Issue/PR (optional)");
}

// ─── Layer 1: changed file resolver ────────────────────────────────────────

function resolveChangedFiles(
  root: string,
  files: string[],
  baseRef: string | null,
): string[] {
  if (files.length > 0) {
    return files
      .map((f) => (path.isAbsolute(f) ? f : path.resolve(root, f)))
      .filter((f) => fs.existsSync(f));
  }
  if (baseRef) {
    const { execSync } = require("child_process") as typeof import("child_process");
    try {
      const out = execSync(
        `git diff --name-only ${baseRef}...HEAD`,
        { cwd: root, encoding: "utf-8" },
      ) as string;
      // Issue #1784: existsSync filter removed for --base-ref mode.
      // 削除・移動されたファイルも files_checked に含め、行レベル意味差分で
      // lifecycle (deleted/renamed) を検出できるようにする。下游の content 系検査は
      // readText が null を返した場合 skip し、flag 系は git status を見るため安全。
      return out
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .map((rel) => path.join(root, rel.replace(/\//g, path.sep)));
    } catch (e) {
      throw new Error(
        `git diff against --base-ref ${baseRef} failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }
  return [];
}

// ─── Layer 2: workflow profile resolver ────────────────────────────────────

interface WorkflowProfile {
  name: Workflow;
  appliesTo: (relPath: string) => boolean;
  coupledFor: (relPath: string) => string[];
  rules: string[];
}

function profileFor(workflow: Workflow): WorkflowProfile {
  if (workflow === "req-save") {
    return {
      name: "req-save",
      appliesTo: (rel) => /^docs\/requirements\/REQ-.*\.md$/.test(rel),
      coupledFor: (rel) => couplingForReq(rel),
      rules: [
        "req-frontmatter-id-filename",
        "req-required-frontmatter",
        "req-what-how-boundary",
        "requirements-readme-sync",
        "docmap-update-required",
        "adr-crossref-update-required",
        "spec-readme-update-required",
        "obsolete-spec-path",
        "legacy-local-generation-vocab",
        "doc-type-responsibility",
      ],
    };
  }
  if (workflow === "spec-save") {
    return {
      name: "spec-save",
      appliesTo: (rel) => /^docs\/specs\/.*\.md$/.test(rel),
      coupledFor: (rel) => couplingForSpec(rel),
      rules: [
        "spec-frontmatter-required",
        "spec-status-valid",
        "spec-readme-status-sync",
        "spec-domain-classification",
        "docmap-update-required",
        "obsolete-spec-path",
        "legacy-local-generation-vocab",
        "spec-responsibility-classification",
      ],
    };
  }
  if (workflow === "case-run") {
    return {
      name: "case-run",
      appliesTo: (rel) =>
        /^docs\/specs\//.test(rel) ||
        /^docs\/requirements\//.test(rel) ||
        /^docs\/adr\//.test(rel) ||
        /^docs\/guides\//.test(rel) ||
        rel === "AGENTS.md" ||
        rel === "README.md" ||
        rel === "docs/DOC-MAP.md" ||
        rel === "docs/README.md",
      coupledFor: (rel) => defaultCoupling(rel),
      rules: [
        "obsolete-spec-path",
        "legacy-local-generation-vocab",
        "doc-type-responsibility",
        "docmap-update-required",
        "spec-readme-update-required",
        "requirements-readme-sync",
      ],
    };
  }
  if (workflow === "case-close") {
    return {
      name: "case-close",
      appliesTo: (_rel) => true,
      coupledFor: (rel) => defaultCoupling(rel),
      rules: [
        "obsolete-spec-path",
        "legacy-local-generation-vocab",
        "spec-status-transition-sync",
        "issue-pr-declared-files-match",
        "full-docs-check-recommendation",
      ],
    };
  }
  return {
    name: "docs-check",
    appliesTo: (_rel) => true,
    coupledFor: (rel) => defaultCoupling(rel),
    rules: ["obsolete-spec-path", "legacy-local-generation-vocab"],
  };
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

function couplingForSpec(relPath: string): string[] {
  const coupled = new Set<string>();
  if (/^docs\/specs\/.*\.md$/.test(relPath)) {
    coupled.add("docs/specs/README.md");
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
  if (/^docs\/specs\//.test(relPath)) coupled.add("docs/specs/README.md");
  if (/^docs\/requirements\//.test(relPath)) {
    coupled.add("docs/requirements/README.md");
  }
  return [...coupled];
}

// ─── Layer 3: coupled file resolver ────────────────────────────────────────

function resolveCoupledFiles(root: string, profile: WorkflowProfile, changedFiles: string[]): string[] {
  const coupled = new Set<string>();
  for (const f of changedFiles) {
    const rel = path.relative(root, f).replace(/\\/g, "/");
    for (const c of profile.coupledFor(rel)) {
      const full = path.join(root, c.replace(/\//g, path.sep));
      if (fs.existsSync(full)) coupled.add(full);
    }
  }
  return [...coupled];
}

// ─── Layer 4: targeted check runner ────────────────────────────────────────

function readText(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf-8") as string;
  } catch {
    return null;
  }
}

function loadObsoleteTerms(root: string): {
  oldPaths: string[];
  vocab: string[];
} {
  const mapPath = path.join(root, "docs", "specs", "integrity", "obsolete-path-map.yaml");
  const content = readText(mapPath);
  if (!content) return { oldPaths: [], vocab: [] };
  const oldPaths: string[] = [];
  const vocab: string[] = [];
  let section = "";
  for (const raw of content.split("\n")) {
    const line = raw.replace(/\r$/, "");
    if (/^entries:/.test(line)) {
      section = "entries";
      continue;
    }
    if (/^legacy_local_generation_vocabulary:/.test(line)) {
      section = "vocab";
      continue;
    }
    if (/^[a-z]/.test(line)) {
      section = "";
      continue;
    }
    if (section === "entries") {
      const m = line.match(/^\s*-\s*old:\s*"([^"]+)"/);
      if (m) oldPaths.push(m[1]);
    }
    if (section === "vocab") {
      const m = line.match(/^\s*-\s*term:\s*"([^"]+)"/);
      if (m) vocab.push(m[1]);
    }
  }
  return { oldPaths, vocab };
}

function checkObsoleteSpecPath(
  root: string,
  files: string[],
  oldPaths: string[],
): Failure[] {
  const failures: Failure[] = [];
  for (const f of files) {
    const rel = path.relative(root, f).replace(/\\/g, "/");
    if (/^docs\/requirements\/retired\//.test(rel)) continue;
    if (/^docs\/adr\/retired\//.test(rel)) continue;
    if (/docs\/specs\/integrity\/obsolete-path-map\.yaml$/.test(rel)) continue;
    if (/docs\/specs\/integrity\/rules\/IR-057-/.test(rel)) continue;
    if (/\.test\.ts$/.test(rel)) continue;
    if (/repo-agentdev-integrity\/scripts\/check_integrity\.ts$/.test(rel)) continue;
    if (/docs\/requirements\/REQ-0158\.md$/.test(rel)) continue;
    if (/docs\/adr\/ADR-0(123|110)\.md$/.test(rel)) continue;
    if (/docs\/requirements\/REQ-010[12]\.md$/.test(rel)) continue;
    const content = readText(f);
    if (!content) continue;
    const lines = content.split("\n");
    for (const old of oldPaths) {
      for (let i = 0; i < lines.length; i++) {
        if (!lines[i].includes(old)) continue;
        if (isInsideCodeBlock(lines, i)) continue;
        failures.push({
          rule_id: "IR-057",
          severity: "strict",
          file: rel,
          line: i + 1,
          message: `Old SPEC direct path reference '${old}' detected`,
          expected: `use current path (see docs/specs/integrity/obsolete-path-map.yaml)`,
        });
      }
    }
  }
  return failures;
}

function checkLegacyVocab(
  root: string,
  files: string[],
  vocab: string[],
): Failure[] {
  const failures: Failure[] = [];
  for (const f of files) {
    const rel = path.relative(root, f).replace(/\\/g, "/");
    if (/^docs\/requirements\/retired\//.test(rel)) continue;
    if (/^docs\/adr\/retired\//.test(rel)) continue;
    // legacy vocabulary を定義・検出する正当な文書は除外
    if (/docs\/requirements\/REQ-0158\.md$/.test(rel)) continue;
    if (/docs\/requirements\/REQ-0141\.md$/.test(rel)) continue;
    if (/docs\/specs\/local\/local-generation\.md$/.test(rel)) continue;
    if (/docs\/specs\/integrity\/integrity-rule-catalog\.md$/.test(rel)) continue;
    if (/docs\/specs\/integrity\/rule-ownership\.md$/.test(rel)) continue;
    if (/docs\/specs\/integrity\/rules\/IR-057-/.test(rel)) continue;
    if (/docs\/specs\/integrity\/rules\/IR-048-/.test(rel)) continue;
    if (/docs\/specs\/integrity\/obsolete-path-map\.yaml$/.test(rel)) continue;
    if (/vocabulary-registry\.md$/.test(rel)) continue;
    if (/docs\/guides\/glossary\.md$/.test(rel)) continue;
    if (/repo-agentdev-integrity.*\/(SKILL|references\/)/.test(rel)) continue;
    if (/repo-agentdev-integrity\/scripts\/check_integrity\.ts$/.test(rel)) continue;
    const content = readText(f);
    if (!content) continue;
    const lines = content.split("\n");
    for (const term of vocab) {
      for (let i = 0; i < lines.length; i++) {
        if (!lines[i].includes(term)) continue;
        if (isInsideCodeBlock(lines, i)) continue;
        failures.push({
          rule_id: "IR-057",
          severity: "strict",
          file: rel,
          line: i + 1,
          message: `Legacy local generation vocabulary '${term}' detected (link mode unified, ADR-0131)`,
          expected: "remove legacy vocabulary; use link mode terminology (ADR-0131)",
        });
      }
    }
  }
  return failures;
}

function isInsideCodeBlock(lines: string[], idx: number): boolean {
  let inCode = false;
  for (let i = 0; i <= idx && i < lines.length; i++) {
    if (/^\s*```/.test(lines[i])) inCode = !inCode;
  }
  if (/^\s*```/.test(lines[idx])) {
    let count = 0;
    for (let i = 0; i < idx; i++) if (/^\s*```/.test(lines[i])) count++;
    return count % 2 === 1;
  }
  return inCode;
}

function checkReqFrontmatter(files: string[]): Failure[] {
  const failures: Failure[] = [];
  for (const f of files) {
    const content = readText(f);
    if (!content) continue;
    const fm = parseSimpleFrontmatter(content);
    if (!fm) {
      failures.push({
        rule_id: "IR-002",
        severity: "strict",
        file: f,
        line: 1,
        message: "REQ missing frontmatter",
        expected: "frontmatter with id, title, ...",
      });
      continue;
    }
    const base = path.basename(f, ".md");
    if (typeof fm["id"] === "string" && fm["id"] !== base) {
      failures.push({
        rule_id: "IR-001",
        severity: "strict",
        file: f,
        line: 2,
        message: `REQ frontmatter id '${fm["id"]}' does not match filename '${base}'`,
        expected: `id: ${base}`,
      });
    }
  }
  return failures;
}

function parseSimpleFrontmatter(content: string): Record<string, string> | null {
  const parts = content.split("---");
  if (parts.length < 3) return null;
  const result: Record<string, string> = {};
  for (const line of parts[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const k = line.slice(0, idx).trim();
    const v = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (k) result[k] = v;
  }
  return result;
}

// ─── Line-level change descriptor (Issue #1784 / OU-007) ────────────────────
//
// 更新要否フラグ（requirements_readme_update_required, spec_readme_update_required,
// extensions_check_required, full_docs_check_recommended）は変更ファイルの存在や
// 変更種別名ではなく、行レベル差分が導出元（文書 lifecycle, 索引 frontmatter 値、公開入口、
// extension 参照対象、DOC-MAP/README 生成元）へ影響するかで判定する（SPEC
// targeted-docs-guard-implementation.md「full_docs_check_recommended 条件」節）。

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
  absPath: string;
  relPath: string;
  // "added" = 新規追加, "deleted" = 削除, "renamed" = 移動/名称変更,
  // "modified" = 変更（lifecycle 影響なし）, "unknown" = git で判定不可
  lifecycle: "added" | "deleted" | "renamed" | "modified" | "unknown";
  previousRelPath?: string;
  changedFrontmatterKeys: Set<string>;
}

interface GitNameStatus {
  status: "A" | "D" | "R" | "M" | null;
  previousPath?: string;
}

function gitNameStatusFor(
  root: string,
  rel: string,
  baseRef: string | null,
): GitNameStatus {
  const { execSync } = require("child_process") as typeof import("child_process");
  try {
    // --base-ref 時は baseRef...HEAD の committed range を見る。
    // --files 時は HEAD..working-tree を見る（uncommitted 変更）。
    const diffCmd = baseRef
      ? `git diff --name-status --diff-filter=ADRMCR ${baseRef}...HEAD -- "${rel}"`
      : `git diff --name-status --diff-filter=ADRMCR HEAD -- "${rel}"`;
    const diffOut = execSync(diffCmd, { cwd: root, encoding: "utf-8" }) as string;
    const parsed = parseGitNameStatusLine(diffOut);
    if (parsed.status) return parsed;

    // --files モードでは未追跡ファイルを git status で検出
    if (!baseRef) {
      try {
        const statusOut = execSync(`git status --porcelain -- "${rel}"`, {
          cwd: root,
          encoding: "utf-8",
        }) as string;
        return parseGitStatusPorcelain(statusOut);
      } catch {
        return { status: null };
      }
    }
    return { status: null };
  } catch {
    return { status: null };
  }
}

function parseGitNameStatusLine(out: string): GitNameStatus {
  const line = out.split("\n").find((l) => l.trim().length > 0);
  if (!line) return { status: null };
  const parts = line.split("\t");
  const statusCode = parts[0];
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
  // R/C の場合は "XY\told\tnew" 形式を取る
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

function frontmatterAtRef(
  root: string,
  ref: string,
  rel: string,
): Record<string, string> | null {
  const { execSync } = require("child_process") as typeof import("child_process");
  try {
    const out = execSync(`git show ${ref}:"${rel}"`, {
      cwd: root,
      encoding: "utf-8",
    }) as string;
    return parseSimpleFrontmatter(out);
  } catch {
    return null;
  }
}

function changedFrontmatterKeysFor(
  root: string,
  rel: string,
  baseRef: string | null,
  lifecycle: ChangeDescriptor["lifecycle"],
): Set<string> {
  // 追加/削除/リネームは lifecycle のみで判定するため frontmatter 差分は不要
  if (lifecycle === "added" || lifecycle === "deleted" || lifecycle === "renamed") {
    return new Set();
  }
  const ref = baseRef ?? "HEAD";
  const oldFm = frontmatterAtRef(root, ref, rel);
  if (!oldFm) return new Set();
  const absPath = path.join(root, rel.replace(/\//g, path.sep));
  const content = readText(absPath);
  if (!content) return new Set();
  const newFm = parseSimpleFrontmatter(content) ?? {};
  const keys = new Set<string>();
  for (const k of new Set([...Object.keys(oldFm), ...Object.keys(newFm)])) {
    if (oldFm[k] !== newFm[k]) keys.add(k);
  }
  return keys;
}

function computeChangeDescriptors(
  root: string,
  files: string[],
  baseRef: string | null,
): ChangeDescriptor[] {
  return files.map((absPath) => {
    const rel = path.relative(root, absPath).replace(/\\/g, "/");
    const status = gitNameStatusFor(root, rel, baseRef);
    let lifecycle: ChangeDescriptor["lifecycle"] = "unknown";
    let previousRelPath: string | undefined;
    if (status.status === "A") lifecycle = "added";
    else if (status.status === "D") lifecycle = "deleted";
    else if (status.status === "R") {
      lifecycle = "renamed";
      previousRelPath = status.previousPath;
    } else if (status.status === "M") lifecycle = "modified";

    const changedKeys = changedFrontmatterKeysFor(root, rel, baseRef, lifecycle);
    return {
      absPath,
      relPath: rel,
      lifecycle,
      previousRelPath,
      changedFrontmatterKeys: changedKeys,
    };
  });
}

// 導出元影響判定: lifecycle 変更（追加/削除/リネーム）または索引 frontmatter 値変更で true。
// SPEC targeted-docs-guard-implementation.md「full_docs_check_recommended 条件」節に基づく。
function isIndexChange(s: ChangeDescriptor): boolean {
  if (
    s.lifecycle === "added" ||
    s.lifecycle === "deleted" ||
    s.lifecycle === "renamed"
  ) {
    return true;
  }
  for (const k of s.changedFrontmatterKeys) {
    if (INDEX_FRONTMATTER_KEYS.has(k)) return true;
  }
  return false;
}

function checkSpecFrontmatter(root: string, files: string[]): Failure[] {
  const failures: Failure[] = [];
  for (const f of files) {
    const content = readText(f);
    if (!content) continue;
    const fm = parseSimpleFrontmatter(content);
    if (!fm) continue;
    const status = fm["status"];
    // status 欠落は accepted 相当（document-model.md 設定規則）。
    if (!status) continue;
    if (status === "draft" || status === "accepted") continue;
    if (status === "superseded") {
      // REQ-0101-076: superseded は superseded_by 必須。保持SPECは通常内容検査対象外。
      if (!fm["superseded_by"]) {
        failures.push({
          rule_id: "SPEC-STATUS",
          severity: "strict",
          file: path.relative(root, f).replace(/\\/g, "/"),
          line: 3,
          message: `SPEC status 'superseded' requires 'superseded_by' frontmatter`,
          expected: "superseded_by: <後継SPEC id> (ADR-0123, REQ-0101-076)",
        });
      }
      continue;
    }
    failures.push({
      rule_id: "SPEC-STATUS",
      severity: "warning",
      file: path.relative(root, f).replace(/\\/g, "/"),
      line: 3,
      message: `SPEC status '${status}' is not 'draft', 'accepted', or 'superseded'`,
      expected: "draft, accepted, or superseded (ADR-0123, REQ-0101-076)",
    });
  }
  return failures;
}

function detectUpdateRequired(
  root: string,
  changedFiles: string[],
  targetFile: string,
  marker: { path: string; basenameMatch?: boolean } | ((rel: string) => boolean),
): boolean {
  const full = path.join(root, targetFile.replace(/\//g, path.sep));
  const content = readText(full);
  if (!content) return false;
  const pred =
    typeof marker === "function"
      ? marker
      : (rel: string) =>
          marker.basenameMatch
            ? content.includes(path.basename(rel))
            : content.includes(rel);
  for (const f of changedFiles) {
    const rel = path.relative(root, f).replace(/\\/g, "/");
    if (pred(rel)) return false;
  }
  return changedFiles.length > 0;
}

function runWorkflowChecks(
  root: string,
  profile: WorkflowProfile,
  changedFiles: string[],
  coupledFiles: string[],
  obsolete: { oldPaths: string[]; vocab: string[] },
  declaredFiles: string[],
  changeDescriptors: ChangeDescriptor[],
): {
  failures: Failure[];
  warnings: string[];
  docMapUpdateRequired: boolean;
  specReadmeUpdateRequired: boolean;
  requirementsReadmeUpdateRequired: boolean;
  fullDocsCheckRecommended: boolean;
  extensionsCheckRequired: boolean;
  declaredFilesCheck: { declared: string[]; missing: string[]; extra: string[] } | null;
} {
  const failures: Failure[] = [];
  const warnings: string[] = [];
  // files_checked 空時の分岐判定は main() 側で行う（REQ-0158 Phase 3）。
  // check_changed_docs.ts は対象選定の十分性を判定せず、対象が空の場合は
  // 「対象ファイルが検出されなかった」旨のメッセージを main() で生成する。
  const allTargets = [...changedFiles, ...coupledFiles];

  if (profile.rules.includes("obsolete-spec-path")) {
    failures.push(...checkObsoleteSpecPath(root, allTargets, obsolete.oldPaths));
  }
  if (profile.rules.includes("legacy-local-generation-vocab")) {
    failures.push(...checkLegacyVocab(root, allTargets, obsolete.vocab));
  }
  if (profile.name === "req-save") {
    failures.push(...checkReqFrontmatter(changedFiles));
  }
  if (profile.name === "spec-save") {
    failures.push(...checkSpecFrontmatter(root, changedFiles));
  }

  const docMapUpdateRequired = profile.rules.includes("docmap-update-required")
    ? detectUpdateRequired(
        root,
        changedFiles,
        "docs/DOC-MAP.md",
        (rel) => rel.includes("REQ-") || rel.includes("docs/specs/"),
      )
    : false;

  // Issue #1784 / OU-007: 更新要否フラグを行レベル意味差分（導出元影響）ベースへ限定。
  // ファイル存在や変更種別名ではなく、文書 lifecycle（追加/削除/移動/名称変更）または
  // 索引 frontmatter 値（id, title, status 等）の変更でのみ true とする。
  // SPEC targeted-docs-guard-implementation.md「full_docs_check_recommended 条件」節。
  const specReadmeUpdateRequired =
    profile.rules.includes("spec-readme-update-required") ||
    profile.rules.includes("spec-readme-status-sync")
      ? changeDescriptors.some((d) => {
          if (!/^docs\/specs\/.*\.md$/.test(d.relPath)) return false;
          return isIndexChange(d);
        })
      : false;
  const requirementsReadmeUpdateRequired = profile.rules.includes(
    "requirements-readme-sync",
  )
    ? changeDescriptors.some((d) => {
        if (!/^docs\/requirements\/REQ-.*\.md$/.test(d.relPath)) return false;
        return isIndexChange(d);
      })
    : false;

  // full_docs_check_recommended: integrity rule 追加/削除、DOC-MAP 構造変更、docs/specs 大規模移動、extensions 変更等
  const fullDocsCheckRecommended =
    profile.name === "case-close"
    ? changedFiles.some((f) => {
        const rel = path.relative(root, f).replace(/\\/g, "/");
        return (
          /docs\/specs\/integrity\/rules\//.test(rel) ||
          /docs\/specs\/integrity\/integrity-rule-catalog\.md/.test(rel) ||
          /docs\/specs\/integrity\/rule-ownership\.md/.test(rel) ||
          /docs\/specs\/foundations\/document-model/.test(rel) ||
          /docs\/specs\/responsibilities\/document-type-responsibilities/.test(rel) ||
          /docs\/DOC-MAP\.md/.test(rel) ||
          /docs\/specs\/README\.md/.test(rel) ||
          /^\.agentdev\/config\.yaml$/.test(rel) ||
          /^\.agentdev\/extensions\//.test(rel)
        );
      })
    : false;

  // extensions_check_required: extension が参照する対象（REQ/ADR/SPEC）の lifecycle
  // または索引 frontmatter 値の変更で true。
  const extensionsCheckRequired = changeDescriptors.some((d) => {
    if (!/^docs\/(requirements\/REQ-|adr\/ADR-|specs\/).*\.md$/.test(d.relPath))
      return false;
    return isIndexChange(d);
  });

  // declared_files_check: --declared-files 指定時、宣言ファイルと実変更ファイルの対応を検査
  const declaredFilesCheck: { declared: string[]; missing: string[]; extra: string[] } | null =
    declaredFiles.length > 0
      ? (() => {
          const declared = declaredFiles.map((d) =>
            path.isAbsolute(d) ? path.relative(root, d).replace(/\\/g, "/") : d.replace(/\\/g, "/"),
          );
          const actual = changedFiles.map((f) =>
            path.relative(root, f).replace(/\\/g, "/"),
          );
          const declaredSet = new Set(declared);
          const actualSet = new Set(actual);
          const missing = declared.filter((d) => !actualSet.has(d));
          const extra = actual.filter((a) => !declaredSet.has(a));
          return { declared, missing, extra };
        })()
      : null;

  return {
    failures,
    warnings,
    docMapUpdateRequired,
    specReadmeUpdateRequired,
    requirementsReadmeUpdateRequired,
    fullDocsCheckRecommended,
    extensionsCheckRequired,
    declaredFilesCheck,
  };
}

// ─── Layer 5: JSON/text reporter ───────────────────────────────────────────

function emitJson(report: TargetedDocsReport): void {
  console.log(JSON.stringify(report, null, 2));
}

function emitText(report: TargetedDocsReport): void {
  console.log(`Targeted Docs Guard — workflow: ${report.workflow}`);
  console.log(`files checked: ${report.files_checked.length}`);
  for (const f of report.files_checked) console.log(`  ${f}`);
  console.log(`coupled files checked: ${report.coupled_files_checked.length}`);
  for (const f of report.coupled_files_checked) console.log(`  ${f}`);
  console.log(`failures: ${report.failures.length}`);
  for (const f of report.failures) {
    console.log(
      `  [${f.severity}] ${f.rule_id} ${f.file}:${f.line} — ${f.message}`,
    );
  }
  console.log(`warnings: ${report.warnings.length}`);
  for (const w of report.warnings) console.log(`  ${w}`);
  console.log(`doc_map_update_required: ${report.doc_map_update_required}`);
  console.log(`spec_readme_update_required: ${report.spec_readme_update_required}`);
  console.log(
    `requirements_readme_update_required: ${report.requirements_readme_update_required}`,
  );
  console.log(`full_docs_check_recommended: ${report.full_docs_check_recommended}`);
  console.log(`extensions_check_required: ${report.extensions_check_required}`);
  console.log(`docInputsCheckRequired: ${report.docInputsCheckRequired}`);
  if (report.declared_files_check) {
    console.log(`declared_files_check:`);
    console.log(`  declared: ${report.declared_files_check.declared.length}`);
    console.log(`  missing: ${report.declared_files_check.missing.length}`);
    for (const m of report.declared_files_check.missing) console.log(`    ${m}`);
    console.log(`  extra: ${report.declared_files_check.extra.length}`);
    for (const e of report.declared_files_check.extra) console.log(`    ${e}`);
  }
}

function main(): void {
  const args = process.argv.slice(2);
  let parsed: ParsedArgs;
  try {
    parsed = parseArgs(args);
  } catch (e) {
    console.error(`[changed_docs] ${e instanceof Error ? e.message : String(e)}`);
    process.exit(EXIT_ERROR);
  }

  if (parsed.help) {
    printHelp();
    process.exit(EXIT_OK);
  }

  if (!parsed.workflow) {
    console.error("[changed_docs] --workflow is required");
    printHelp();
    process.exit(EXIT_ERROR);
  }
  if (parsed.files.length === 0 && !parsed.baseRef) {
    console.error("[changed_docs] either --files or --base-ref is required");
    process.exit(EXIT_ERROR);
  }

  const scriptDir =
    (typeof import.meta !== "undefined" && (import.meta as any).dir) ||
    __dirname ||
    process.cwd();
  const root = findRepoRoot(scriptDir, { explicitRoot: parsed.root });

  const profile = profileFor(parsed.workflow);
  const changedFiles = resolveChangedFiles(root, parsed.files, parsed.baseRef);
  const applicable = changedFiles.filter((f) => {
    const rel = path.relative(root, f).replace(/\\/g, "/");
    return profile.appliesTo(rel);
  });
  const coupledFiles = resolveCoupledFiles(root, profile, applicable);

  const obsolete = loadObsoleteTerms(root);

  const changeDescriptors = computeChangeDescriptors(
    root,
    applicable,
    parsed.baseRef,
  );

  const runResult = runWorkflowChecks(
    root,
    profile,
    applicable,
    coupledFiles,
    obsolete,
    parsed.declaredFiles,
    changeDescriptors,
  );

  const report: TargetedDocsReport = {
    workflow: parsed.workflow,
    files_checked: applicable.map((f) => path.relative(root, f).replace(/\\/g, "/")),
    coupled_files_checked: coupledFiles.map((f) =>
      path.relative(root, f).replace(/\\/g, "/"),
    ),
    failures: runResult.failures,
    warnings: runResult.warnings,
    doc_map_update_required: runResult.docMapUpdateRequired,
    spec_readme_update_required: runResult.specReadmeUpdateRequired,
    requirements_readme_update_required: runResult.requirementsReadmeUpdateRequired,
    full_docs_check_recommended: runResult.fullDocsCheckRecommended,
    extensions_check_required: runResult.extensionsCheckRequired,
    docInputsCheckRequired: profile.rules.length > 0,
    declared_files_check: runResult.declaredFilesCheck,
  };

  // Phase 3（REQ-0158）: 対象確定の命令側移行。
  // --files 指定で files_checked が空の場合は FAILURE、--base-ref 指定で空の場合は WARNING。
  // check_changed_docs.ts は対象選定の十分性を判定せず、対象ファイル未検出のみを報告する。
  if (report.files_checked.length === 0) {
    if (parsed.files.length > 0) {
      report.failures.push({
        rule_id: "TARGET-EMPTY",
        severity: "strict",
        file: "",
        line: 0,
        message:
          "対象ファイルが検出されませんでした（--files 指定）。指定ファイルが workflow profile の対象外、または存在しません。",
        expected:
          "--files に対象ファイルを正しく指定してください（workflow profile の appliesTo に一致するファイルである必要があります）",
      });
    } else if (parsed.baseRef) {
      report.warnings.push(
        "対象ファイルが検出されませんでした（--base-ref 指定）。git diff 結果が空、または workflow profile の対象外です。",
      );
    }
  }

  if (parsed.json) {
    emitJson(report);
  } else {
    emitText(report);
  }

  const hasFailures =
    parsed.failLevel === "warning"
      ? report.failures.length > 0
      : report.failures.some((f) => f.severity === "strict");
  process.exit(hasFailures ? EXIT_NG : EXIT_OK);
}

if (import.meta.main) {
  main();
}
