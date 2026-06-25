/**
 * ファイル名・番号・ゼロ埋めヘルパー（純粋関数中心）。
 *
 * fs I/O 関数は本ファイル内に隔離し、コア計算は純粋関数として扱う。
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** ファイル名 `REQ-NNNN.md` から番号を取り出す。 */
export function reqNumberFromFilename(filename: string): number | null {
  const m = /^REQ-(\d{4})\.md$/.exec(filename);
  return m && m[1] ? parseInt(m[1], 10) : null;
}

/** ファイル名 `ADR-NNNN.md` から番号を取り出す。 */
export function adrNumberFromFilename(filename: string): number | null {
  const m = /^ADR-(\d{4})\.md$/.exec(filename);
  return m && m[1] ? parseInt(m[1], 10) : null;
}

/** 指定ディレクトリ直下の `.md` ファイル名一覧（非再帰）。存在しない場合は空配列。 */
export function listMarkdownFiles(dir: string): string[] {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && e.name.endsWith(".md"))
      .map((e) => e.name);
  } catch {
    return [];
  }
}

/** ファイル内容を読む I/O ヘルパー（純粋関数ではない）。 */
export function readFileContent(path: string): string {
  return readFileSync(path, "utf-8");
}

/** パス結合ヘルパー（テスト容易性のためラップ）。 */
export function joinPath(...segments: string[]): string {
  return join(...segments);
}

/** 4桁ゼロ埋め。 */
export function pad4(n: number): string {
  return n.toString().padStart(4, "0");
}

/** 3桁ゼロ埋め。 */
export function pad3(n: number): string {
  return n.toString().padStart(3, "0");
}

/** 正の整数のみを max 計算対象とする（NaN/負数を弾く）。 */
export function safeMax(numbers: number[]): number {
  const valid = numbers.filter((n) => Number.isFinite(n) && n > 0);
  if (valid.length === 0) return 0;
  return valid.reduce((a, b) => (a > b ? a : b));
}
