/**
 * 結果型と stdout/stderr 出力ヘルパー（Design 固有スクリプト用）。
 *
 * 正規所有は agentdev-artifact-validation scripts/lib であり、本ファイルは
 * supported lib interface 経由の再公開のみを行う。
 * 本スキル (agentdev-design-file-manager) は Design 固有処理（target_area 検索）のみを
 * 担い、共通検証 script と共有 lib の所有は agentdev-artifact-validation に一つに集約。
 * 成功時は ok: true を含み、エラー時は非ゼロ終了コード + stderr メッセージとする。
 */

export { emitJson, emitError } from "../../../agentdev-artifact-validation/scripts/lib/result.ts";

export type { SearchOk } from "../../../agentdev-artifact-validation/scripts/lib/result.ts";
