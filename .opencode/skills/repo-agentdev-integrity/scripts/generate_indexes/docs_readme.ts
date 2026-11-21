// docs/README.md 生成（AG-005・AG-006候補2 Phase E 残）の Markdown 生成
// （generate_indexes.ts 分割モジュール）。

import type { DecisionInfo } from "./collectors.ts";
import { sanitizeTableCell } from "./markdown.ts";
import { normalizeSupersedeNote } from "./decision_readme.ts";

/**
 * docs/README.md「要件」セクション冒頭の件数表明 AUTOGEN ブロック本体（1行）。
 * 形式: "REQ: N件"
 *
 * docs/README.md は入口文書であり、REQ 詳細一覧は docs/requirements/README.md へ誘導する。
 * 件数表明のみを AUTOGEN 化し、続く説明文（範囲、関連 ADR 等）は人手編集領域として残置する
 * （SC-002 Design「件数表明」自動生成原則、Wave 5 Phase E 残）。
 */
export function generateReadmeReqSummaryCount(args: {
  activeReqCount: number;
}): string[] {
  return [`REQ: ${args.activeReqCount}件`];
}

/**
 * docs/README.md Decision 静的表（readme-decision-summary-table）の生成本体。
 * 「superseded by DEC-XXX」括弧注記は index-auto-generation.md「docs/README.md
 * Decision 静的表の AUTOGEN 生成」rule 6 の恒常規則に従う。
 * 適用条件は `superseded_by` frontmatter を持つ全 DEC 行（status によらない）、
 * 注記文言のデータ源は `superseded_by` と `supersede_note` の両 frontmatter
 * フィールドである。`supersede_note` を持つ DEC 行は、その内容を notes 記法〔...〕の
 * 部分置換詳細注記として title 直後に展開する。
 * 表上部の件数 caption は生成対象外の手動残置（AG-005 既知限界）。
 */
export function generateDocsReadmeDecisionTable(
  decisions: DecisionInfo[],
): string[] {
  const lines: string[] = [];
  lines.push("| Decision | タイトル |");
  lines.push("|---|---|");
  for (const info of decisions) {
    let titleCell = sanitizeTableCell(info.title);
    if (info.supersededBy) {
      const note = normalizeSupersedeNote(info.supersedeNote);
      const notePart = note !== null ? `〔${sanitizeTableCell(note)}〕` : "";
      titleCell += `（superseded by ${info.supersededBy}${notePart}）`;
    }
    lines.push(`| [${info.id}](decisions/${info.relPath}) | ${titleCell} |`);
  }
  return lines;
}
