/**
 * ファイル I/O ヘルパー（組立・検査スクリプト用）。
 *
 * fs I/O 関数は本ファイル内に隔離し、コア組立・検査は純粋関数として扱う。
 * agentdev-design-file-manager scripts/lib/fs-helpers.ts と同一の隔離規約に従う。
 */

import { readFileSync, writeFileSync } from "node:fs";

/** ファイル内容を読む I/O ヘルパー（純粋関数ではない）。 */
export function readFileContent(path: string): string {
  return readFileSync(path, "utf-8");
}

/** ファイルへ内容を書き込む I/O ヘルパー（純粋関数ではない）。--write 指定時のみ使用する。 */
export function writeFileContent(path: string, content: string): void {
  writeFileSync(path, content, "utf-8");
}
