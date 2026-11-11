/**
 * ファイル I/O ヘルパー（組立・検査スクリプト用）。
 *
 * readFileContent の正規所有は agentdev-artifact-validation scripts/lib であり、
 * supported lib interface 経由の再公開のみを行う。
 * writeFileContent は明示 --write 指定時のみ使用する本スキル公開契約の書込みヘルパーであり、
 * 検証操作の副作用なし契約を持つ共有 lib には含めない。
 */

import { writeFileSync } from "node:fs";

export { readFileContent } from "../../../agentdev-artifact-validation/scripts/lib/fs-helpers.ts";

/** ファイルへ内容を書き込む I/O ヘルパー（純粋関数ではない）。--write 指定時のみ使用する。 */
export function writeFileContent(path: string, content: string): void {
  writeFileSync(path, content, "utf-8");
}
