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

export interface CliOptions {
  help: boolean;
  json: boolean;
  dryRun: boolean;
  paths: string[];
}

export function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    help: false,
    json: false,
    dryRun: false,
    paths: [],
  };

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (!arg.startsWith("-")) {
      options.paths.push(arg);
    }
  }

  return options;
}

export function printHelp(scriptName: string, description: string, usage: string): void {
  const helpText = `${scriptName} — ${description}

USAGE:
  ${usage}

OPTIONS:
  --help      Show this help message
  --json      Output results in JSON format
  --dry-run   Show what would be checked without running checks

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
}

export function ok(category: string, check: string, message: string, opts?: CheckResultOptions): CheckResult {
  return { category, check, level: "ok", message, ...opts };
}

export function ng(category: string, check: string, message: string, file?: string | CheckResultOptions, line?: number, opts?: CheckResultOptions): CheckResult {
  if (typeof file === "object") {
    return { category, check, level: "ng", message, ...file };
  }
  return { category, check, level: "ng", message, file, line, ...opts };
}

export function warn(category: string, check: string, message: string, file?: string | CheckResultOptions, line?: number, opts?: CheckResultOptions): CheckResult {
  if (typeof file === "object") {
    return { category, check, level: "warning", message, ...file };
  }
  return { category, check, level: "warning", message, file, line, ...opts };
}

export function info(category: string, check: string, message: string, file?: string | CheckResultOptions, line?: number, opts?: CheckResultOptions): CheckResult {
  if (typeof file === "object") {
    return { category, check, level: "info", message, ...file };
  }
  return { category, check, level: "info", message, file, line, ...opts };
}

export function computeSummary(results: CheckResult[]): ScanSummary {
  return {
    ok: results.filter((r) => r.level === "ok").length,
    ng: results.filter((r) => r.level === "ng" && r.finding_level !== "observation").length,
    warning: results.filter((r) => r.level === "warning" && r.finding_level !== "observation").length,
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
  // Strict checks: existence, reference, frontmatter, index, registry, path
  const STRICT_CHECKS = new Set([
    "frontmatter-filename", "required-fields", "readme-index-sync",
    "adr-req-crossref", "load-skills-existence", "command-readme-sync",
    "command-inventory", "legacy-namespace", "name-collision",
    "specs-existence", "broken-file-link", "broken-section-anchor",
    "broken-req-ref", "broken-adr-ref", "active-retired-duplication",
    "retired-in-active-index", "mapping-table-nonexistent",
    "implementation-pattern", "pattern-prohibitions", "command-map-consistency",
    "obsolete-reference-dir", "variant-existence", "variant-required-fields",
    "fragment-patterns", "retired-frontmatter-filename", "retired-required-fields",
    "mapping-table-completeness", "mapping-table-migration-target",
    "mapping-table-status-enum", "variant-path-existence", "variant-registry-registered",
    "skill-name-dir-match", "skill-use-for-boundary",
    "cmd-implementation-pattern", "cmd-secondary-pattern", "cmd-load-skills-array",
    "cmd-agent-name", "cmd-deprecated-in-inventory",
    "reference-path-existence",
  ]);

  if (STRICT_CHECKS.has(checkType)) return "strict";

  // Heuristic: semantic judgment with clear evidence
  if (level === "ng" || level === "warning") return "heuristic";

  // Observation: informational
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
  lines.push(`- **スキャン対象**: ${Object.entries(report.scanned).map(([k, v]) => `${k} ${v}件`).join("、")}`);
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

/**
 * Determine the routing for a finding based on its category and frequency.
 */
export function determineRoute(category: FindingCategory, occurrences: number): FindingRoute {
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

/**
 * Write the integrity report as a Markdown file.
 * Returns the path of the written file.
 */
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
 * Resolve the repository root by walking up from the given path
 * to find a directory containing `.opencode/`.
 */
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
