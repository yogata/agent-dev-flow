// ADF-COVERS(implementation): REQ-044-001, REQ-044-003
/**
 * CLI utilities for AgentDevFlow validator scripts.
 * Provides common argument parsing, output formatting, and exit code constants.
 *
 * REQ-0021-021~027: Common CLI contract
 * - Non-interactive execution
 * - --help, --json, --dry-run options
 * - JSON and Markdown report output
 * - stdout for machine-readable, stderr for diagnostics
 * - Exit codes: 0 (ok), 1 (check failed), 2 (input error)
 * - No destructive operations
 */
import { parseArgs as nodeParseArgs } from "node:util";

export const EXIT_OK = 0;
export const EXIT_NG = 1;
export const EXIT_ERROR = 2;

// WP-3 (Issue #1928): integrity checker execution profiles.
// Normative: .omo/plans/agentdev-migration-2026-08-05.md §7.
// `installed` must not use source fallback; `release` keeps the checker on the
// host (REQ-0145-014 `--root`) and never embeds it in the archive.
export type IntegrityProfile = "source" | "installed" | "release";

export const DEFAULT_PROFILE: IntegrityProfile = "source";

export const PROFILE_VALUES: readonly IntegrityProfile[] = [
  "source",
  "installed",
  "release",
] as const;

export type CheckLevel = "ok" | "ng" | "warning" | "info";

export type FindingCategory =
  | "document-drift"
  | "broken-reference"
  | "obsolete-structure"
  | "canonical-conflict"
  | "workflow-gap"
  | "integrity-rule-gap";

export type FindingRoute =
  | "intake"
  | "intake+learning"
  | "req-define"
  | "learning"
  | "none";

export type FindingLevel = "strict" | "heuristic" | "observation";

export interface CheckResult {
  category: string;
  check: string;
  level: CheckLevel;
  message: string;
  file?: string;
  line?: number;
  evidence?: string;
  expected?: string;
  route?: FindingRoute;
  finding_level?: FindingLevel;
  /** Type of artifact: "req", "adr", "skill", "command", "spec", "template", "guide", "docmap", "retired" */
  artifact_type?: string;
  finding_category?: FindingCategory;
}

export interface ScanSummary {
  ok: number;
  ng: number;
  warning: number;
  info: number;
}

export interface IntegrityReport {
  timestamp: string;
  script: string;
  profile: IntegrityProfile;
  archive?: string;
  scanned: Record<string, number>;
  summary: ScanSummary;
  results: CheckResult[];
}

// REQ-0108-196: classification policy support

export interface CliOptions {
  help: boolean;
  json: boolean;
  dryRun: boolean;
  classification: boolean; // REQ-0108-196
  paths: string[];
  root?: string; // REQ-0145-014: explicit repo root for worktree/CI
  profile: IntegrityProfile; // WP-3 (Issue #1928): source|installed|release
  archive?: string; // WP-3: required when profile=release
}

// node:util.parseArgs への委譲（Issue #2354 / OU-003、DEC-019 決定1）。
// 構文解析（オプションと値の結合、`=` 形式、短縮クラスタ、`--`）は標準 API が行い、
// 許容値・必須性・プロファイル依存等の ADF 固有意味検証は後段に残留する。
// 旧実装が未知引数として無視していた形式（`--opt=value`、短縮クラスタ、`--`）は
// 標準 API が受理しても公開 CLI 仕様として新規保証しない（REQ-044-003）。
// strict:false では値を持たない文字列オプションが true になるため、
// token の value === undefined で値欠落を判別する。

interface ParsedTokenOption {
  kind: "option";
  index: number;
  name: string;
  rawName: string;
  value?: string;
  inlineValue?: boolean;
}
interface ParsedTokenPositional {
  kind: "positional";
  index: number;
  value: string;
}
interface ParsedTokenTerminator {
  kind: "option-terminator";
  index: number;
}
type ParsedToken =
  | ParsedTokenOption
  | ParsedTokenPositional
  | ParsedTokenTerminator;

interface ParsedSegment {
  values: Record<string, string | boolean>;
  tokens: ParsedToken[];
}

const CLI_PARSE_OPTIONS = {
  help: { type: "boolean", short: "h" },
  json: { type: "boolean" },
  "dry-run": { type: "boolean" },
  classification: { type: "boolean" },
  root: { type: "string" },
  profile: { type: "string" },
  archive: { type: "string" },
} as const;

function parseSegment(args: readonly string[]): ParsedSegment {
  return nodeParseArgs({
    args: [...args],
    options: CLI_PARSE_OPTIONS,
    strict: false,
    allowPositionals: true,
    tokens: true,
  }) as unknown as ParsedSegment;
}

function clusterArgIndexes(tokens: readonly ParsedToken[]): Set<number> {
  const counts = new Map<number, number>();
  for (const t of tokens) {
    if (t.kind === "option" && !t.rawName.startsWith("--")) {
      counts.set(t.index, (counts.get(t.index) ?? 0) + 1);
    }
  }
  const clustered = new Set<number>();
  for (const [index, count] of counts) {
    if (count > 1) clustered.add(index);
  }
  return clustered;
}

interface SegmentOptions {
  help: boolean;
  json: boolean;
  dryRun: boolean;
  classification: boolean;
  paths: string[];
  root?: string;
  profile?: string;
  archive?: string;
}

function buildSegmentOptions(segment: ParsedSegment): SegmentOptions {
  const { values, tokens } = segment;
  const clustered = clusterArgIndexes(tokens);
  const ignored = new Set<string>();
  for (const t of tokens) {
    if (t.kind !== "option") continue;
    if (t.inlineValue === true || clustered.has(t.index)) ignored.add(t.name);
  }
  for (const name of ignored) delete values[name];
  for (const t of tokens) {
    if (t.kind !== "option" || t.inlineValue === true || clustered.has(t.index))
      continue;
    if (t.value === undefined || t.value === "") {
      if (t.name === "root") throw new Error("--root requires a value");
      if (t.name === "profile")
        throw new Error(
          "--profile requires a value (source|installed|release)",
        );
      if (t.name === "archive")
        throw new Error("--archive requires a value (path to release zip)");
    }
    if (
      t.name === "profile" &&
      !PROFILE_VALUES.includes(t.value as IntegrityProfile)
    ) {
      throw new Error(
        `--profile must be one of: ${PROFILE_VALUES.join(", ")} (got '${t.value}')`,
      );
    }
  }
  const paths: string[] = [];
  for (const t of tokens) {
    if (t.kind === "positional" && !t.value.startsWith("-")) paths.push(t.value);
  }
  return {
    help: values.help === true,
    json: values.json === true,
    dryRun: values["dry-run"] === true,
    classification: values.classification === true,
    paths,
    root: typeof values.root === "string" ? values.root : undefined,
    profile: typeof values.profile === "string" ? values.profile : undefined,
    archive: typeof values.archive === "string" ? values.archive : undefined,
  };
}

function mergeSegmentOptions(
  pre: SegmentOptions,
  post: SegmentOptions,
): SegmentOptions {
  return {
    help: pre.help || post.help,
    json: pre.json || post.json,
    dryRun: pre.dryRun || post.dryRun,
    classification: pre.classification || post.classification,
    paths: [...pre.paths, ...post.paths],
    root: post.root ?? pre.root,
    profile: post.profile ?? pre.profile,
    archive: post.archive ?? pre.archive,
  };
}

function parseSegmentOptions(args: readonly string[]): SegmentOptions {
  const segment = parseSegment(args);
  const terminator = segment.tokens.find(
    (t): t is ParsedTokenTerminator => t.kind === "option-terminator",
  );
  if (terminator) {
    // 旧実装では `--` は不活性な未知引数であり、終端意味論を持たない
    // （`--` 以降の引数も通常どおり解釈される）。標準 API の終端処理を適用しない
    // ため、`--` の前後を再帰的に解析して旧の全 argv 走査順を再現する。
    // ただし値を要求するオプションの直後の `--` は値として結合されるため
    // 終端 token にはならない。
    return mergeSegmentOptions(
      parseSegmentOptions(args.slice(0, terminator.index)),
      parseSegmentOptions(args.slice(terminator.index + 1)),
    );
  }
  return buildSegmentOptions(segment);
}

export function parseArgs(args: string[]): CliOptions {
  const merged = parseSegmentOptions(args);
  // buildSegmentOptions が PROFILE_VALUES 外の値を拒否しているため、
  // ここに到達する profile は必ず妥当な IntegrityProfile である。
  const profile = (merged.profile ?? DEFAULT_PROFILE) as IntegrityProfile;
  if (profile === "release" && !merged.archive) {
    throw new Error("--profile release requires --archive <zip-path>");
  }
  return {
    help: merged.help,
    json: merged.json,
    dryRun: merged.dryRun,
    classification: merged.classification,
    paths: merged.paths,
    root: merged.root,
    profile,
    archive: merged.archive,
  };
}

export function printHelp(
  scriptName: string,
  description: string,
  usage: string,
): void {
  const helpText = `${scriptName} ― ${description}

USAGE:
  ${usage}

OPTIONS:
  --help            Show this help message
  --json            Output results in JSON format
  --dry-run         Show what would be checked without running checks
  --classification  Enable document classification policy checks (REQ-0108-196)
  --root <path>     Explicit repository root (REQ-0145-014: worktree/CI support)
  --profile <p>     Execution profile: source (default), installed, release (Issue #1928 / WP-3)
  --archive <zip>   Path to release archive. Required when --profile=release.
                    Ignored for source/installed.
  --update-ir055-baseline  Regenerate IR-055 baseline file from current violations
  --update-ng-baseline     Regenerate NG baseline file from current NG set (REQ-0161-005)

EXIT CODES:
  0  No issues found
  1  Issues detected (NG or warning)
  2  Input error or execution failure
`;
  console.log(helpText);
}

export interface CheckResultOptions {
  evidence?: string;
  expected?: string;
  route?: FindingRoute;
  artifact_type?: string;
  finding_category?: FindingCategory;
  finding_level?: FindingLevel;
}

export function ok(
  category: string,
  check: string,
  message: string,
  file?: string | CheckResultOptions,
  line?: number,
): CheckResult {
  if (typeof file === "object") {
    return { category, check, level: "ok", message, ...file };
  }
  return { category, check, level: "ok", message, file, line };
}

export function ng(
  category: string,
  check: string,
  message: string,
  file?: string | CheckResultOptions,
  line?: number,
  opts?: CheckResultOptions,
): CheckResult {
  if (typeof file === "object") {
    return { category, check, level: "ng", message, ...file };
  }
  return { category, check, level: "ng", message, file, line, ...opts };
}

export function warn(
  category: string,
  check: string,
  message: string,
  file?: string | CheckResultOptions,
  line?: number,
  opts?: CheckResultOptions,
): CheckResult {
  if (typeof file === "object") {
    return { category, check, level: "warning", message, ...file };
  }
  return { category, check, level: "warning", message, file, line, ...opts };
}

export function info(
  category: string,
  check: string,
  message: string,
  file?: string | CheckResultOptions,
  line?: number,
  opts?: CheckResultOptions,
): CheckResult {
  if (typeof file === "object") {
    return { category, check, level: "info", message, ...file };
  }
  return { category, check, level: "info", message, file, line, ...opts };
}

export function computeSummary(results: CheckResult[]): ScanSummary {
  return {
    ok: results.filter((r) => r.level === "ok").length,
    ng: results.filter(
      (r) => r.level === "ng" && r.finding_level !== "observation",
    ).length,
    warning: results.filter(
      (r) => r.level === "warning" && r.finding_level !== "observation",
    ).length,
    info: results.filter((r) => r.level === "info").length,
  };
}

/**
 * Finding level classification (REQ-0108-100~105):
 * - strict: deterministic, reproducible checks (existence, frontmatter, registry)
 * - heuristic: semantic judgment with clear evidence
 * - observation: informational, not counted in NG/summary
 */
export function classifyFindingLevel(
  level: CheckLevel,
  checkType: string,
): FindingLevel {
  const STRICT_CHECKS = new Set([
    "frontmatter-filename",
    "required-fields",
    "readme-index-sync",
    "adr-req-crossref",
    "load-skills-existence",
    "command-readme-sync",
    "command-inventory",
    "legacy-namespace",
    "name-collision",
    "specs-existence",
    "broken-file-link",
    "broken-section-anchor",
    "broken-req-ref",
    "broken-adr-ref",
    "active-retired-duplication",
    "retired-in-active-index",
    "implementation-pattern",
    "pattern-prohibitions",
    "command-map-consistency",
    "obsolete-reference-dir",
    "variant-existence",
    "variant-required-fields",
    "fragment-patterns",
    "retired-frontmatter-filename",
    "retired-required-fields",
    "variant-path-existence",
    "variant-registry-registered",
    "skill-name-dir-match",
    "skill-use-for-boundary",
    "cmd-implementation-pattern",
    "cmd-secondary-pattern",
    "cmd-load-skills-array",
    "cmd-agent-name",
    "cmd-deprecated-in-inventory",
    "reference-path-existence",
  ]);
  if (STRICT_CHECKS.has(checkType)) return "strict";
  if (level === "ng" || level === "warning") return "heuristic";
  return "observation";
}

export function formatJsonReport(report: IntegrityReport): string {
  return JSON.stringify(report, null, 2);
}

export function formatMarkdownReport(report: IntegrityReport): string {
  const lines: string[] = [];
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  lines.push(`# ${report.script} Report`);
  lines.push("");
  lines.push(`- **実行日時**: ${now}`);
  lines.push(`- **プロファイル**: ${report.profile}`);
  if (report.archive) {
    lines.push(`- **アーカイブ**: ${report.archive}`);
  }
  lines.push(
    `- **スキャン対象**: ${Object.entries(report.scanned)
      .map(([k, v]) => `${k} ${v}件`)
      .join("、")}`,
  );
  lines.push("");
  lines.push("## サマリ");
  lines.push("");
  lines.push("| レベル | 件数 |");
  lines.push("|--------|------|");
  lines.push(`| OK | ${report.summary.ok} |`);
  lines.push(`| NG | ${report.summary.ng} |`);
  lines.push(`| Warning | ${report.summary.warning} |`);
  lines.push(`| Info | ${report.summary.info} |`);
  lines.push("");

  const routingCategories = new Map<
    string,
    { ok: number; ng: number; warning: number; route: string }
  >();
  for (const r of report.results) {
    const existing = routingCategories.get(r.category);
    if (!existing) {
      routingCategories.set(r.category, {
        ok: r.level === "ok" ? 1 : 0,
        ng: r.level === "ng" ? 1 : 0,
        warning: r.level === "warning" ? 1 : 0,
        route: r.route && r.route !== "none" ? r.route : "",
      });
    } else {
      if (r.level === "ok") existing.ok++;
      else if (r.level === "ng") existing.ng++;
      else if (r.level === "warning") existing.warning++;
      if (r.route && r.route !== "none" && !existing.route) {
        existing.route = r.route;
      }
    }
  }

  if (routingCategories.size > 0) {
    lines.push("## ルーティングサマリ");
    lines.push("");
    lines.push("| 検査カテゴリ | OK | NG | Warning | Route |");
    lines.push("|-------------|-----|-----|---------|-------|");
    for (const [cat, counts] of routingCategories) {
      lines.push(
        `| ${cat} | ${counts.ok} | ${counts.ng} | ${counts.warning} | ${counts.route || "-"} |`,
      );
    }
    lines.push("");
  }

  const categories = new Map<string, CheckResult[]>();
  for (const r of report.results) {
    if (r.level === "ok") continue;
    const list = categories.get(r.category) || [];
    list.push(r);
    categories.set(r.category, list);
  }

  if (categories.size > 0) {
    lines.push("## 詳細");
    lines.push("");
    for (const [cat, results] of categories) {
      lines.push(`### ${cat}`);
      for (const r of results) {
        const loc = r.file ? ` (${r.file}${r.line ? `:${r.line}` : ""})` : "";
        let detail = `- **[${r.level.toUpperCase()}]** ${r.check}: ${r.message}${loc}`;
        if (r.route && r.route !== "none") {
          detail += ` → route: ${r.route}`;
        }
        lines.push(detail);
        if (r.evidence) {
          lines.push(`  - evidence: \`${r.evidence}\``);
        }
        if (r.expected) {
          lines.push(`  - expected: \`${r.expected}\``);
        }
      }
      lines.push("");
    }
  } else {
    lines.push("すべての検査項目で問題は検出されませんでした。");
    lines.push("");
  }

  return lines.join("\n");
}

export function determineExitCode(summary: ScanSummary): number {
  if (summary.ng > 0 || summary.warning > 0) return EXIT_NG;
  return EXIT_OK;
}

export function determineRoute(
  category: FindingCategory,
  occurrences: number,
): FindingRoute {
  switch (category) {
    case "broken-reference":
      return occurrences >= 3 ? "intake+learning" : "intake";
    case "obsolete-structure":
      return "intake";
    case "canonical-conflict":
      return "req-define";
    case "document-drift":
      return occurrences >= 3 ? "intake+learning" : "intake";
    case "workflow-gap":
      return "req-define";
    case "integrity-rule-gap":
      return "req-define";
    default:
      return "none";
  }
}

const CHECK_TO_FINDING_CATEGORY: Record<string, FindingCategory> = {
  "frontmatter-filename": "canonical-conflict",
  "required-fields": "canonical-conflict",
  "retired-frontmatter-filename": "canonical-conflict",
  "retired-required-fields": "canonical-conflict",
  "skill-name-dir-match": "canonical-conflict",
  "skill-use-for-boundary": "canonical-conflict",
  "cmd-implementation-pattern": "canonical-conflict",
  "cmd-secondary-pattern": "canonical-conflict",
  "cmd-load-skills-array": "canonical-conflict",
  "cmd-agent-name": "canonical-conflict",
  "cmd-deprecated-in-inventory": "canonical-conflict",
  "command-map-consistency": "canonical-conflict",
  terminology: "canonical-conflict",
  "adr-status-normalization": "canonical-conflict",
  "workflow-status-prohibition": "canonical-conflict",
  "lifecycle-boundary": "canonical-conflict",
  "gh-direct-invocation": "canonical-conflict",
  "readme-index-sync": "broken-reference",
  "adr-readme-index-sync": "broken-reference",
  "spec-readme-index-sync": "broken-reference",
  "docmap-req-sync": "broken-reference",
  "docmap-spec-sync": "broken-reference",
  "docmap-guide-sync": "broken-reference",
  "req-retired-index-sync": "broken-reference",
  "adr-req-crossref": "broken-reference",
  "load-skills-existence": "broken-reference",
  "load-skills-consistency": "broken-reference",
  "command-readme-sync": "broken-reference",
  "expanded-readme-sync": "broken-reference",
  "command-inventory": "broken-reference",
  "specs-existence": "broken-reference",
  "broken-file-link": "broken-reference",
  "broken-section-anchor": "broken-reference",
  "broken-req-ref": "broken-reference",
  "broken-adr-ref": "broken-reference",
  "active-retired-duplication": "broken-reference",
  "retired-in-active-index": "broken-reference",
  "reference-path-existence": "broken-reference",
  "runtime-unresolved-reference": "broken-reference",
  "legacy-namespace": "obsolete-structure",
  "expanded-legacy-namespace": "obsolete-structure",
  "obsolete-reference-dir": "obsolete-structure",
  "req-range-staleness": "obsolete-structure",
  "canonical-boundary": "obsolete-structure",
  "variant-existence": "document-drift",
  "variant-required-fields": "document-drift",
  "variant-path-existence": "document-drift",
  "variant-registry-registered": "document-drift",
  "fragment-patterns": "document-drift",
  "completion-report-templates": "document-drift",
  "inline-completion-body": "document-drift",
  "inline-completion-reports-strict": "document-drift",
  "post-completion-output": "document-drift",
  "implementation-pattern": "workflow-gap",
  "pattern-prohibitions": "workflow-gap",
  "excess-load-skills": "workflow-gap",
  "missing-load-skills": "workflow-gap",
  "use-for-consistency": "workflow-gap",
  "name-collision": "workflow-gap",
  "bare-slash-scoped": "workflow-gap",
  "ruid-ground-reference": "workflow-gap",
  "accepted-adr-only-citation": "workflow-gap",
  "non-accepted-adr-refs": "workflow-gap",
  "draft-spec-staleness": "document-drift",
  "index-generation-consistency": "broken-reference",
};

function classifyArtifactType(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes("req")) return "req";
  if (lower.includes("adr")) return "adr";
  if (lower.includes("skill")) return "skill";
  if (lower.includes("command") || lower.includes("cmd")) return "command";
  if (lower.includes("spec")) return "spec";
  if (lower.includes("template") || lower.includes("variant"))
    return "template";
  if (lower.includes("guide")) return "guide";
  if (lower.includes("docmap")) return "docmap";
  if (lower.includes("retired")) return "retired";
  if (lower.includes("report")) return "report"; // REQ-0108-188
  if (lower.includes("legacy") || lower.includes("namespace")) return "command";
  if (lower.includes("terminology")) return "command";
  return "unknown";
}

function classifyFindingCategory(check: string): FindingCategory {
  return CHECK_TO_FINDING_CATEGORY[check] ?? "workflow-gap";
}

export function classifyResult(r: CheckResult): CheckResult {
  if (!r.artifact_type) {
    r.artifact_type = classifyArtifactType(r.category);
  }
  if (!r.finding_category && r.level !== "ok" && r.level !== "info") {
    r.finding_category = classifyFindingCategory(r.check);
  }
  if (!r.finding_level) {
    r.finding_level = classifyFindingLevel(r.level, r.check);
  }
  if (!r.route && r.finding_category) {
    r.route = determineRoute(r.finding_category, 1);
  }
  return r;
}

export function validateCheckResult(r: CheckResult): string | null {
  if (
    (r.level === "ng" || r.level === "warning") &&
    (!r.finding_category || !r.route)
  ) {
    return `ng/warning finding missing finding_category or route: check=${r.check}, category=${r.category}`;
  }
  return null;
}

export function processResults(results: CheckResult[]): CheckResult[] {
  const enriched = results.map((r) => classifyResult({ ...r }));
  for (const r of enriched) {
    const err = validateCheckResult(r);
    if (err) {
      console.warn(`[integrity] ${err}`);
    }
  }
  return enriched;
}

export function writeReportFile(root: string, report: IntegrityReport): string {
  const { join } = require("path");
  const fs = require("fs") as typeof import("fs");
  const reportsDir = join(root, ".agentdev", "integrity", "reports");
  fs.mkdirSync(reportsDir, { recursive: true });
  const dateStr = new Date().toISOString().slice(0, 10);
  let fileName = `${dateStr}-integrity-report.md`;
  let filePath = join(reportsDir, fileName);
  let seq = 2;
  while (fs.existsSync(filePath)) {
    fileName = `${dateStr}-integrity-report-${seq}.md`;
    filePath = join(reportsDir, fileName);
    seq++;
  }
  const content = formatMarkdownReport(report);
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

/**
 * Resolve the repository root for integrity scans (REQ-0145-014).
 *
 * Resolution priority:
 *   1. options.explicitRoot  — `--root` CLI arg (highest priority)
 *   2. AGENTDEV_INTEGRITY_ROOT env var — CI/local explicit override
 *   3. worktree detection    — walk up for a `.git` *file* (worktree admin pointer)
 *   4. main repo detection   — walk up for `.opencode` (existing behavior), then `.git` dir
 *
 * The worktree branch lets check_integrity.ts resolve the worktree root when
 * invoked inside `.worktrees/{N}-{type}/`, instead of falling through to the
 * main repo root. CI (check_changed_docs.ts --base-ref) and local development
 * both get consistent results because the same resolver is used.
 */
export function findRepoRoot(
  startPath: string,
  options?: { explicitRoot?: string },
): string {
  const { resolve, dirname, join } = require("path");
  const fs = require("fs") as typeof import("fs");

  // 1. explicit --root
  if (options?.explicitRoot) {
    return resolve(options.explicitRoot);
  }

  // 2. env var
  const envRoot = process.env.AGENTDEV_INTEGRITY_ROOT;
  if (envRoot) {
    return resolve(envRoot);
  }

  // 3. worktree detection: .git file (worktree admin pointer) walking up
  let dir = resolve(startPath);
  for (let i = 0; i < 20; i++) {
    const dotGitPath = join(dir, ".git");
    if (fs.existsSync(dotGitPath)) {
      try {
        const stat = fs.statSync(dotGitPath);
        // `.git` as a file → git worktree root (admin pointer to main repo).
        // `.git` as a directory → main repo root, handled in step 4.
        if (stat.isFile()) {
          return dir;
        }
      } catch {
        // stat failed; keep walking
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  // 4. main repo fallback: walk up for `.opencode` (existing behavior)
  dir = resolve(startPath);
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(join(dir, ".opencode"))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  // 5. final fallback: walk up for `.git` directory (main repo without .opencode,
  //    preserves check_changed_docs.ts local findRepoRoot semantics)
  dir = resolve(startPath);
  for (let i = 0; i < 20; i++) {
    const dotGitPath = join(dir, ".git");
    if (fs.existsSync(dotGitPath)) {
      try {
        if (fs.statSync(dotGitPath).isDirectory()) {
          return dir;
        }
      } catch {
        // ignore
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return resolve(startPath);
}
