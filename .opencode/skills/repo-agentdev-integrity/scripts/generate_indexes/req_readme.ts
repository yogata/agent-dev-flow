// REQ README 生成（AG-009）の Markdown 生成（generate_indexes.ts 分割モジュール）。

import type { ReqInfo } from "./collectors.ts";
import { sanitizeTableCell } from "./markdown.ts";

/**
 * 現行要件の件数表明キャプション（1行）。
 * 形式: "現在の要件判断では、以下N件を第一参照先とする。"
 */
export function generateReqActiveCaption(activeReqs: ReqInfo[]): string[] {
  return [
    `現在の要件判断では、以下${activeReqs.length}件を第一参照先とする。`,
  ];
}

/**
 * 現行要件一覧表（ヘッダー + active REQ 行）。関心対象列は hand-curated のため
 * AG-009 では REQ ID + タイトルの 2 列自動生成とする（SC-002 混合領域許容）。
 */
export function generateReqActiveTable(
  activeReqs: ReqInfo[],
  linkPrefix = "",
): string[] {
  const lines: string[] = [];
  lines.push("| REQ ID | タイトル |");
  lines.push("|---|---|");
  for (const info of activeReqs) {
    lines.push(
      `| [${info.id}](${linkPrefix}${info.relPath}) | ${sanitizeTableCell(info.title)} |`,
    );
  }
  return lines;
}
