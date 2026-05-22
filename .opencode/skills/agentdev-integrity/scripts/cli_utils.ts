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

export interface CheckResult {
  category: string;
  check: string;
  level: CheckLevel;
  message: string;
  file?: string;
  line?: number;
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

export function ok(category: string, check: string, message: string): CheckResult {
  return { category, check, level: "ok", message };
}

export function ng(category: string, check: string, message: string, file?: string, line?: number): CheckResult {
  return { category, check, level: "ng", message, file, line };
}

export function warn(category: string, check: string, message: string, file?: string, line?: number): CheckResult {
  return { category, check, level: "warning", message, file, line };
}

export function info(category: string, check: string, message: string, file?: string, line?: number): CheckResult {
  return { category, check, level: "info", message, file, line };
}

export function computeSummary(results: CheckResult[]): ScanSummary {
  return {
    ok: results.filter((r) => r.level === "ok").length,
    ng: results.filter((r) => r.level === "ng").length,
    warning: results.filter((r) => r.level === "warning").length,
    info: results.filter((r) => r.level === "info").length,
  };
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
        lines.push(`- **[${r.level.toUpperCase()}]** ${r.check}: ${r.message}${loc}`);
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
