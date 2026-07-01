/**
 * check_changed_docs.ts — Targeted docs guard (REQ-0158-003).
 *
 * 変更ファイル限定の整合性検査。req-save / spec-save / case-close / docs-check の
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
 *   --workflow req-save|spec-save|case-close|docs-check
 *   --files <path...>             変更ファイル（--base-ref と排他）
 *   --base-ref <git-ref>          git diff の base ref（--files と排他）
 *   --json                        JSON 出力
 *   --fail-level strict|warning   失敗扱いとする最低レベル（デフォルト strict）
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
} from "./cli_utils.ts";

const path = require("path") as typeof import("path");
const fs = require("fs") as typeof import("fs");

const SCRIPT_NAME = "check_changed_docs.ts";
const DESCRIPTION =
  "Targeted docs integrity guard for save workflows (REQ-0158-003)";
const USAGE =
  "bun run check_changed_docs.ts --workflow <name> [--files <path...> | --base-ref <git-ref>] [--json] [--fail-level strict|warning]";

type Workflow = "req-save" | "spec-save" | "case-close" | "docs-check";
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
}

interface ParsedArgs {
  workflow: Workflow | null;
  files: string[];
  baseRef: string | null;
  json: boolean;
  failLevel: FailLevel;
  help: boolean;
}

function parseArgs(args: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    workflow: null,
    files: [],
    baseRef: null,
    json: false,
    failLevel: "strict",
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
        v !== "case-close" &&
        v !== "docs-check"
      ) {
        throw new Error(
          `--workflow must be one of: req-save, spec-save, case-close, docs-check (got: ${v})`,
        );
      }
      parsed.workflow = v as Workflow;
      i++;
    } else if (a === "--files") {
      i++;
      while (i < args.length && !args[i].startsWith("--")) {
        parsed.files.push(args[i]);
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
  console.error("  --workflow <name>   req-save | spec-save | case-close | docs-check (required)");
  console.error("  --files <path...>   changed files (mutually exclusive with --base-ref)");
  console.error("  --base-ref <ref>    git base ref to compute changed files");
  console.error("  --json              emit JSON report (default: text)");
  console.error("  --fail-level <lvl>  strict (default) | warning");
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
      return out
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .map((rel) => path.join(root, rel.replace(/\//g, path.sep)))
        .filter((f) => fs.existsSync(f));
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
    if (/docs\/specs\/integrity\/rules\/IR-057-/.test(rel)) continue;
    if (/docs\/specs\/integrity\/rules\/IR-048-/.test(rel)) continue;
    if (/vocabulary-registry\.md$/.test(rel)) continue;
    if (/repo-agentdev-integrity.*\/(SKILL|references\/)/.test(rel)) continue;
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

function checkSpecFrontmatter(root: string, files: string[]): Failure[] {
  const failures: Failure[] = [];
  for (const f of files) {
    const content = readText(f);
    if (!content) continue;
    const fm = parseSimpleFrontmatter(content);
    if (!fm) continue;
    const status = fm["status"];
    if (status && status !== "draft" && status !== "accepted") {
      failures.push({
        rule_id: "SPEC-STATUS",
        severity: "warning",
        file: path.relative(root, f).replace(/\\/g, "/"),
        line: 3,
        message: `SPEC status '${status}' is not 'draft' or 'accepted'`,
        expected: "draft or accepted (ADR-0123)",
      });
    }
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
): {
  failures: Failure[];
  warnings: string[];
  docMapUpdateRequired: boolean;
  specReadmeUpdateRequired: boolean;
  requirementsReadmeUpdateRequired: boolean;
  fullDocsCheckRecommended: boolean;
} {
  const failures: Failure[] = [];
  const warnings: string[] = [];
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
  const specReadmeUpdateRequired = profile.rules.includes("spec-readme-update-required") ||
    profile.rules.includes("spec-readme-status-sync")
    ? detectUpdateRequired(
        root,
        changedFiles,
        "docs/specs/README.md",
        (rel) => rel.startsWith("docs/specs/"),
      )
    : false;
  const requirementsReadmeUpdateRequired = profile.rules.includes("requirements-readme-sync")
    ? detectUpdateRequired(
        root,
        changedFiles,
        "docs/requirements/README.md",
        (rel) => rel.startsWith("docs/requirements/REQ-"),
      )
    : false;

  // full_docs_check_recommended: integrity rule 追加/削除、DOC-MAP 構造変更、docs/specs 大規模移動等
  const fullDocsCheckRecommended =
    profile.name === "case-close"
    ? changedFiles.some((f) => {
        const rel = path.relative(root, f).replace(/\\/g, "/");
        return (
          /docs\/specs\/integrity\/(rules|integrity-rule-catalog|rule-ownership)\//.test(rel) ||
          /docs\/specs\/foundations\/document-model/.test(rel) ||
          /docs\/specs\/responsibilities\/document-type-responsibilities/.test(rel)
        );
      })
    : false;

  return {
    failures,
    warnings,
    docMapUpdateRequired,
    specReadmeUpdateRequired,
    requirementsReadmeUpdateRequired,
    fullDocsCheckRecommended,
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
  const root = findRepoRoot(scriptDir);

  const profile = profileFor(parsed.workflow);
  const changedFiles = resolveChangedFiles(root, parsed.files, parsed.baseRef);
  const applicable = changedFiles.filter((f) => {
    const rel = path.relative(root, f).replace(/\\/g, "/");
    return profile.appliesTo(rel);
  });
  const coupledFiles = resolveCoupledFiles(root, profile, applicable);

  const obsolete = loadObsoleteTerms(root);

  const runResult = runWorkflowChecks(
    root,
    profile,
    applicable,
    coupledFiles,
    obsolete,
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
  };

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

function findRepoRoot(startPath: string): string {
  let cur = startPath;
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(cur, ".git"))) return cur;
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return startPath;
}

if (import.meta.main) {
  main();
}
