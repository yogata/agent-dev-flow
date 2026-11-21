// 書き込み・鮮度比較（generate_indexes.ts 分割モジュール）。
// 再生成 content と現行内容の比較（鮮度比較）で差分のあるファイルのみを更新対象として
// 収集し、dry-run レポートまたは実書込みへ振り分ける。

const fs = require("fs") as typeof import("fs");

export interface IndexUpdate {
  file: string;
  content: string;
}

/**
 * 再生成 content が現行内容と異なる場合のみ更新対象へ追加する（鮮度比較）。
 * 差分なし（既に最新）のファイルは対象に含めない。
 */
export function pushIndexUpdateIfChanged(
  updates: IndexUpdate[],
  file: string,
  original: string,
  updated: string,
): void {
  if (updated !== original) {
    updates.push({ file, content: updated });
  }
}

/** dry-run 用: 実書込みを行わず更新予定ファイルを報告する。 */
export function reportDryRunUpdates(updates: IndexUpdate[]): void {
  for (const u of updates) {
    console.log(`[generate_indexes] WOULD UPDATE: ${u.file}`);
  }
}

/** 実書込み: 更新対象ファイルを書き、更新報告または最新報告を出す。 */
export function writeIndexUpdates(updates: IndexUpdate[]): void {
  for (const u of updates) {
    fs.writeFileSync(u.file, u.content, "utf-8");
    console.log(`[generate_indexes] updated: ${u.file}`);
  }
  if (updates.length === 0) {
    console.log(`[generate_indexes] no changes (already up-to-date)`);
  }
}
