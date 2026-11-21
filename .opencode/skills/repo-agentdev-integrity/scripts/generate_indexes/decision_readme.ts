// Decision README 生成（AG-008 / DEC-009、REQ-059-001..003）の Markdown 生成
// （generate_indexes.ts 分割モジュール）。

import type { DecisionInfo } from "./collectors.ts";
import { sanitizeTableCell } from "./markdown.ts";

export function normalizeSupersedeNote(
  note: string | null,
): string | null {
  if (note === null) return null;
  const normalized = note.replace(/\s+/g, " ").trim();
  return normalized.length > 0 ? normalized : null;
}

/**
 * superseded Decision 行の部分置換注記サフィックス（index-auto-generation.md
 * 「現在稼働している自動生成契約」5「Decision frontmatter の supersede_note 由来の
 * 部分置換注記生成」）。
 *
 * superseded Decision で frontmatter に `supersede_note` フィールドが存在する場合、
 * `superseded_by` と `supersede_note` の両 frontmatter フィールドをデータ源として
 * `〔superseded by DEC-MMM。<note>〕` 形式の注記文字列を返す。
 * status 表（decision-baseline-table）・superseded セクション（decision-status-superseded）
 * 間で同一注記文字列を出力する。
 * supersede_note 未宣言（全体置換等）、空値・空白のみの場合は null を返し、
 * 注記を付与しない（空括弧・区切り文字のみの出力の禁止）。ブロックスカラ由来の
 * 改行を含む内容は正規展開して 1 行注記とする。
 */
export function formatSupersedeNoteSuffix(info: DecisionInfo): string | null {
  if (info.status !== "superseded") return null;
  const note = normalizeSupersedeNote(info.supersedeNote);
  if (note === null) return null;
  const by = info.supersededBy ? `superseded by ${info.supersededBy}。` : "";
  return `〔${by}${note}〕`;
}

/**
 * 現行 Decision の件数表明キャプション（1行）。
 * 形式: "現行の承認済み Decision はN件、提案中の Decision はM件である。"
 */
export function generateDecisionBaselineCaption(
  decisions: DecisionInfo[],
): string[] {
  const accepted = decisions.filter((d) => d.status === "accepted").length;
  const proposed = decisions.filter((d) => d.status === "proposed").length;
  return [
    `現行の承認済み Decision は${accepted}件、提案中の Decision は${proposed}件である。`,
  ];
}

/**
 * 現行 Decision 一覧表（ヘッダー + 全 DEC 行）。
 * ステータス列を持つため accepted 以外（proposed / superseded 等）も全件出力する。
 */
export function generateDecisionBaselineTable(
  decisions: DecisionInfo[],
): string[] {
  const lines: string[] = [];
  lines.push("| Decision番号 | タイトル | ステータス | 作成日 |");
  lines.push("|---------|---------|-----------|--------|");
  for (const info of decisions) {
    const note = formatSupersedeNoteSuffix(info);
    const titleCell = sanitizeTableCell(
      note ? `${info.title}${note}` : info.title,
    );
    lines.push(
      `| ${info.id} | ${titleCell} | ${info.status} | ${info.created} |`,
    );
  }
  return lines;
}

/**
 * ステータス別リスト（bullet 形式）。
 * 形式: "- [DEC-001](DEC-001.md)（title）"
 */
export function generateDecisionStatusList(
  decisions: DecisionInfo[],
  status: string,
): string[] {
  return decisions
    .filter((d) => d.status === status)
    .map((info) => {
      const base = `- [${info.id}](${info.relPath})（${info.title}）`;
      const note = formatSupersedeNoteSuffix(info);
      return note ? `${base}${note}` : base;
    });
}

/**
 * 関連REQ列のセル（frontmatter related_reqs 由来）。空宣言は "-"。
 */
export function formatRelatedReqCell(relatedReqs: string[]): string {
  if (relatedReqs.length === 0) return "-";
  return relatedReqs
    .map((reqId) => `[${reqId}](../requirements/${reqId}.md)`)
    .join(", ");
}

/**
 * 現在の README 内容の「## 関連 REQ」セクション表から DEC ID → 説明列 を抽出する。
 * 説明列は frontmatter から導出できない人手判断列のため、AUTOGEN ブロック囲みの
 * 有無に依存せず見出しスコープで抽出する（初回 AUTOGEN 化時の手動表取り込み対応）。
 */
export function extractRelatedReqNotes(
  readmeContent: string,
): Record<string, string> {
  const notes: Record<string, string> = {};
  const lines = readmeContent.split("\n");
  let inSection = false;
  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      inSection = /^##\s+関連 REQ\s*$/.test(line.trim());
      continue;
    }
    if (!inSection) continue;
    const rowMatch = line.match(/^\|\s*(DEC-\d+)\s*\|/);
    if (!rowMatch) continue;
    const cells = line.split("|").map((c) => c.trim());
    if (cells.length >= 4) {
      notes[rowMatch[1]!] = cells[3]!;
    }
  }
  return notes;
}

/**
 * 未宣言（related_reqs フィールド欠落）Decision の検出（REQ-059-003）。
 * 検出は finding であり工程停止条件としない（DEC-001 決定4）。
 */
export function findUndeclaredRelatedReqDecisions(
  decisions: DecisionInfo[],
): DecisionInfo[] {
  return decisions.filter((d) => d.relatedReqs === null);
}

/**
 * Decision 関連REQ表（混合領域構成）。
 * Decision 列と関連REQ列を frontmatter から生成し、「説明」列は notes（現在 README
 * の人手判断列）を優先して保持する。notes に存在しない行（新規 Decision 等）は "-"。
 */
export function generateDecisionRelatedReqTable(
  decisions: DecisionInfo[],
  notes: Record<string, string>,
): string[] {
  const lines: string[] = [];
  lines.push("| Decision | 関連REQ | 説明 |");
  lines.push("|-----|---------|------|");
  for (const info of decisions) {
    const cell = formatRelatedReqCell(info.relatedReqs ?? []);
    const note = sanitizeTableCell(notes[info.id] ?? "-");
    lines.push(`| ${info.id} | ${cell} | ${note} |`);
  }
  return lines;
}
