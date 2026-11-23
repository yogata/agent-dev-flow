// engine/reporter.ts — 標準出力フォーマット・レポート退避・--emit-intake 自動起票。
// 契約所有: docs/designs/integrity/integrity-engine-plugin-architecture.md
// 「差分実行・自動起票ランナー」。

import * as fs from "node:fs";
import * as path from "node:path";
import type { RuleResult, RuleViolation } from "./types.ts";

export interface ReportMeta {
  timestamp: string;
  /** "full"（全量）/ "changed"（差分）/ "rule"（--rule 指定）。 */
  mode: "full" | "changed" | "rule";
  repoRootLabel: string;
  scannedFiles: number;
  changedFiles: number;
  rulesRun: number;
  skipped: string[];
}

export interface ReportSummary {
  ok: number;
  violations: number;
  warnings: number;
  errors: number;
}

export function computeSummary(results: readonly RuleResult[]): ReportSummary {
  const summary: ReportSummary = { ok: 0, violations: 0, warnings: 0, errors: 0 };
  for (const result of results) {
    if (result.error !== undefined) {
      summary.errors += 1;
      continue;
    }
    if (result.violations.length === 0) {
      summary.ok += 1;
      continue;
    }
    if (result.violations.some((v) => v.severity === "error")) summary.violations += 1;
    else summary.warnings += 1;
  }
  return summary;
}

export function formatMarkdownReport(
  meta: ReportMeta,
  summary: ReportSummary,
  results: readonly RuleResult[],
): string {
  const lines: string[] = [];
  lines.push("# integrity-engine 実行レポート");
  lines.push("");
  lines.push(`- 実行日時: ${meta.timestamp}`);
  lines.push(`- 実行モード: ${meta.mode}`);
  lines.push(`- ルート: ${meta.repoRootLabel}`);
  lines.push(`- 走査ファイル: ${meta.scannedFiles} 件、変更ファイル: ${meta.changedFiles} 件`);
  lines.push(`- 実行ルール: ${meta.rulesRun} 件（skip ${meta.skipped.length} 件）`);
  lines.push("");
  lines.push("## サマリ");
  lines.push("");
  lines.push("| レベル | 件数 |");
  lines.push("|--------|------|");
  lines.push(`| OK | ${summary.ok} |`);
  lines.push(`| NG | ${summary.violations} |`);
  lines.push(`| Warning | ${summary.warnings} |`);
  lines.push(`| Error | ${summary.errors} |`);
  lines.push("");

  const detailLines: string[] = [];
  for (const result of results) {
    if (result.error !== undefined) {
      detailLines.push(`- **[ERROR]** ${result.ruleId}: ${result.error}`);
      continue;
    }
    for (const violation of result.violations) {
      const location = violation.line === undefined ? violation.filePath : `${violation.filePath}:${violation.line}`;
      const level = violation.severity === "error" ? "NG" : "WARNING";
      detailLines.push(
        `- **[${level}]** ${violation.ruleId}: ${violation.message} [${location}]`,
      );
      if (violation.remediationHint !== undefined) {
        detailLines.push(`  - 対応: ${violation.remediationHint}`);
      }
    }
  }
  if (detailLines.length > 0) {
    lines.push("## 違反詳細");
    lines.push("");
    lines.push(...detailLines);
    lines.push("");
  }

  if (meta.skipped.length > 0) {
    lines.push("## スキップルール");
    lines.push("");
    lines.push(meta.skipped.join(", "));
    lines.push("");
  }
  return lines.join("\n");
}

export function formatJsonReport(
  meta: ReportMeta,
  summary: ReportSummary,
  results: readonly RuleResult[],
): string {
  return JSON.stringify(
    {
      timestamp: meta.timestamp,
      mode: meta.mode,
      repoRootLabel: meta.repoRootLabel,
      scannedFiles: meta.scannedFiles,
      changedFiles: meta.changedFiles,
      rulesRun: meta.rulesRun,
      skipped: meta.skipped,
      summary,
      results,
    },
    null,
    2,
  );
}

/** レポートを .agentdev/integrity/reports/ へ退避し、書込先パスを返す。 */
export function writeReportFile(repoRoot: string, content: string): string {
  const reportsDir = path.join(repoRoot, ".agentdev", "integrity", "reports");
  fs.mkdirSync(reportsDir, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const reportPath = path.join(reportsDir, `${date}-integrity-report.md`);
  fs.writeFileSync(reportPath, content, "utf-8");
  return reportPath;
}

export interface IntakeTicket {
  ruleId: string;
  filePath: string;
}

export interface IntakeResult {
  written: IntakeTicket[];
  skipped: string[];
}

/** intake inbox 内の既存自動起票ファイル名一覧（冪等判定用）。 */
export function listAutoTicketNames(repoRoot: string): string[] {
  const inboxDir = path.join(repoRoot, ".agentdev", "intake", "inbox");
  if (!fs.existsSync(inboxDir)) return [];
  return fs.readdirSync(inboxDir).filter((name) => name.endsWith(".md"));
}

/**
 * severity: warning の違反を intake inbox へ自動起票する。
 * 同一 rule-id の自動起票ファイル（`*-auto-<rule-id-lower>.md`）が既に存在する
 * 場合は新規作成せずスキップする（冪等性）。
 */
export function emitIntake(
  repoRoot: string,
  violations: readonly RuleViolation[],
): IntakeResult {
  const warnings = violations.filter((v) => v.severity === "warning");
  const byRule = new Map<string, RuleViolation[]>();
  for (const violation of warnings) {
    const existing = byRule.get(violation.ruleId) ?? [];
    existing.push(violation);
    byRule.set(violation.ruleId, existing);
  }

  const inboxDir = path.join(repoRoot, ".agentdev", "intake", "inbox");
  fs.mkdirSync(inboxDir, { recursive: true });
  const existingNames = listAutoTicketNames(repoRoot);
  const date = new Date().toISOString().slice(0, 10);

  const written: IntakeTicket[] = [];
  const skipped: string[] = [];
  for (const [ruleId, ruleViolations] of byRule.entries()) {
    const ruleIdLower = ruleId.toLowerCase();
    const suffix = `-auto-${ruleIdLower}.md`;
    if (existingNames.some((name) => name.endsWith(suffix))) {
      skipped.push(ruleId);
      continue;
    }
    const fileName = `${date}${suffix}`;
    const filePath = path.join(inboxDir, fileName);
    const body = buildIntakeItem(date, ruleId, ruleViolations);
    fs.writeFileSync(filePath, body, "utf-8");
    written.push({ ruleId, filePath: `.agentdev/backlog/intake/inbox/${fileName}` });
  }
  return { written, skipped };
}

function buildIntakeItem(
  date: string,
  ruleId: string,
  violations: readonly RuleViolation[],
): string {
  const ruleViolations = violations.slice(0, 20);
  const lines: string[] = [];
  lines.push("---");
  lines.push(`id: ${date}-auto-${ruleId.toLowerCase()}`);
  lines.push(`created_at: ${date}`);
  lines.push("source: integrity-engine");
  lines.push("status: pending");
  lines.push("---");
  lines.push("");
  lines.push(`# ${ruleId} 自動起票（integrity-engine --emit-intake）`);
  lines.push("");
  lines.push(`severity: warning の検出違反が ${ruleViolations.length} 件あります（表示は最大20件）。`);
  lines.push("");
  lines.push("## 検出内容");
  lines.push("");
  for (const violation of ruleViolations) {
    const location =
      violation.line === undefined ? violation.filePath : `${violation.filePath}:${violation.line}`;
    lines.push(`- ${violation.message} [${location}]`);
    if (violation.remediationHint !== undefined) {
      lines.push(`  - 対応: ${violation.remediationHint}`);
    }
  }
  lines.push("");
  lines.push("## 根拠");
  lines.push("");
  lines.push(`- 検出ルール: ${ruleId}`);
  lines.push("- 起票経路: integrity-engine --emit-intake（同一 rule-id の既存起票ファイルがある場合はスキップ）");
  lines.push("");
  return lines.join("\n");
}
