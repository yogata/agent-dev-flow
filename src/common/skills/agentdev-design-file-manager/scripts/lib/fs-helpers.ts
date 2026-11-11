/**
 * ファイル I/O ヘルパー（Design 固有スクリプト用）。
 *
 * 正規所有は agentdev-artifact-validation scripts/lib であり、本ファイルは
 * supported lib interface 経由の再公開のみを行う。
 * agentdev-design-file-manager は Design 固有処理（target_area 検索）のみを担うため、
 * REQ/ADR 番号採番ヘルパーは含まない（それらは agentdev-req-file-manager 配下）。
 */

export { readFileContent } from "../../../agentdev-artifact-validation/scripts/lib/fs-helpers.ts";
