/** agentdev-gh-cli の検証スクリプトで使う自己完結した CLI 共通処理。 */
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

export function ok(category: string, check: string, message: string): CheckResult {
  return { category, check, level: "ok", message };
}

export function ng(category: string, check: string, message: string, file?: string, line?: number): CheckResult {
  return { category, check, level: "ng", message, file, line };
}

export function info(category: string, check: string, message: string, file?: string, line?: number): CheckResult {
  return { category, check, level: "info", message, file, line };
}

export function computeSummary(results: CheckResult[]): ScanSummary {
  return {
    ok: results.filter((result) => result.level === "ok").length,
    ng: results.filter((result) => result.level === "ng").length,
    warning: results.filter((result) => result.level === "warning").length,
    info: results.filter((result) => result.level === "info").length,
  };
}

export function formatJsonReport(report: IntegrityReport): string {
  return JSON.stringify(report, null, 2);
}

export function formatMarkdownReport(report: IntegrityReport): string {
  const lines = [
    `# ${report.script} Report`,
    "",
    `- OK: ${report.summary.ok}`,
    `- NG: ${report.summary.ng}`,
    `- Warning: ${report.summary.warning}`,
    `- Info: ${report.summary.info}`,
    "",
    "## Results",
    "",
  ];
  for (const result of report.results) {
    lines.push(`- [${result.level.toUpperCase()}] ${result.category} / ${result.check}: ${result.message}`);
  }
  return lines.join("\n");
}

export function determineExitCode(summary: ScanSummary): number {
  return summary.ng > 0 || summary.warning > 0 ? EXIT_NG : EXIT_OK;
}

export function findRepoRoot(startPath: string): string {
  const path = require("path") as typeof import("path");
  const fs = require("fs") as typeof import("fs");
  let current = path.resolve(startPath);
  while (true) {
    if (fs.existsSync(path.join(current, ".git")) || fs.existsSync(path.join(current, ".opencode"))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) return path.resolve(startPath);
    current = parent;
  }
}
