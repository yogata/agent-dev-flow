// 現行要件行IDの収集（docs/requirements/REQ-{NNNN}.md の要件テーブル行）。
//
// - 現行 REQ は docs/requirements/ 直下の REQ-\d+.md のみ（retired/ 等のサブディレクトリは廃止扱い）
// - 要件行は `| REQ-{NNNN}-{MMM} |` 形式のテーブル行として抽出する
// - 収集順はファイル名順・出現順で決定的とする

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const DEFAULT_REQUIREMENTS_DIR = "docs/requirements";

export function currentRequirementLineIds(
  root: string,
  requirementsDir: string = DEFAULT_REQUIREMENTS_DIR,
): readonly string[] {
  const dir = join(root, requirementsDir);
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch {
    return [];
  }
  const ids: string[] = [];
  for (const name of names.filter((n) => /^REQ-\d+\.md$/.test(n)).sort()) {
    const content = readFileSync(join(dir, name), "utf-8");
    for (const raw of content.split("\n")) {
      // 行頭アンカー付きの要件テーブル行抽出。桁数上限なし（各セグメント最小1桁）。
      // 後続数字の非消費（(?!\d)）により長い行番号の部分一致を防ぐ。
      const m = raw.match(/^\|\s*(REQ-\d+-\d+)(?!\d)\s*\|/);
      if (m) ids.push(m[1]!);
    }
  }
  return ids;
}
