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
export const EXIT_OK = 0;
export const EXIT_NG = 1;
export const EXIT_ERROR = 2;

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
  /** Type of artifact: "req", "adr", "skill", "command", "spec", "template", "guide", "docmap", "retired", "mapping-table" */
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
  scanned: Record<string, number>;
  summary: ScanSummary;
  results: CheckResult[];
}

// REQ-0108-196: classification policy support
export interface CliOptions {
  help: boolean;
  json: boolean;
  dryRun: boolean;
  classification: boolean; // REQ-0108-196: enable classification policy checks
  paths: string[];
}

export function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    help: false,
    json: false,
    dryRun: false,
    classification: false, // REQ-0108-196
    paths: [],
  };
  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--classification") { // REQ-0108-196
      options.classification = true;
    } else if (!arg.startsWith("-")) {
      options.paths.push(arg);
    }
  }
  return options;
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
}

export function ok(
  category: string,
  check: string,
  message: string,
  opts?: CheckResultOptions,
): CheckResult {
  return { category, check, level: "ok", message, ...opts };
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
    "mapping-table-nonexistent",
    "implementation-pattern",
    "pattern-prohibitions",
    "command-map-consistency",
    "obsolete-reference-dir",
    "variant-existence",
    "variant-required-fields",
    "fragment-patterns",
    "retired-frontmatter-filename",
    "retired-required-fields",
    "mapping-table-completeness",
    "mapping-table-migration-target",
    "mapping-table-status-enum",
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
  "vocabulary-compliance": "canonical-conflict",
  terminology: "canonical-conflict",
  "adr-status-normalization": "canonical-conflict",
  "workflow-status-prohibition": "canonical-conflict",
  "lifecycle-boundary": "canonical-conflict",
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
  "legacy-namespace": "obsolete-structure",
  "expanded-legacy-namespace": "obsolete-structure",
  "obsolete-reference-dir": "obsolete-structure",
  "pattern-residual": "obsolete-structure",
  "req-backlog-residual": "obsolete-structure",
  "abolished-skill-reference": "obsolete-structure",
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
  "mapping-table-nonexistent": "workflow-gap",
  "mapping-table-completeness": "workflow-gap",
  "mapping-table-migration-target": "workflow-gap",
  "mapping-table-status-enum": "workflow-gap",
  "mapping-table": "workflow-gap",
  "bare-slash-scoped": "workflow-gap",
  "ruid-ground-reference": "workflow-gap",
  "accepted-adr-only-citation": "workflow-gap",
  "non-accepted-adr-refs": "workflow-gap",
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
  if (lower.includes("mapping")) return "mapping-table";
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

export function findRepoRoot(startPath: string): string {
  const { resolve, dirname, join } = require("path");
  let dir = resolve(startPath);
  for (let i = 0; i < 20; i++) {
    if (require("fs").existsSync(join(dir, ".opencode"))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return resolve(startPath);
}
