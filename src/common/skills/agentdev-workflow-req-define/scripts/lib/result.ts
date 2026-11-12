/**
 * 共通結果型と stdout/stderr 出力ヘルパー（I/O 契約: stdout JSON、エラー時は非ゼロ終了コード + stderr）。
 *
 * 正規所有は agentdev-artifact-validation scripts/lib であり、本ファイルは
 * supported lib interface 経由の再公開のみを行う。
 */

export { emitJson, emitError } from "../../../agentdev-artifact-validation/scripts/lib/result.ts";
