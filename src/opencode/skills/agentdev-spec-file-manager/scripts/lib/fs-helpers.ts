/**
 * ファイル I/O ヘルパー（SPEC 固有スクリプト用）。
 *
 * fs I/O 関数は本ファイル内に隔離し、コア計算は純粋関数として扱う。
 * agentdev-spec-file-manager は SPEC 固有処理（target_area 検索）のみを担うため、
 * REQ/ADR 番号採番ヘルパーは含まない（それらは agentdev-req-file-manager 配下）。
 */

import { readFileSync } from "node:fs";

/** ファイル内容を読む I/O ヘルパー（純粋関数ではない）。 */
export function readFileContent(path: string): string {
  return readFileSync(path, "utf-8");
}
