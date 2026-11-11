/**
 * 共通結果型と stdout/stderr 出力ヘルパー（採番スクリプト用）。
 *
 * 正規所有は agentdev-artifact-validation scripts/lib であり、本ファイルは
 * supported lib interface 経由の再公開のみを行う。
 * 成功時は ok: true を含み、エラー時は非ゼロ終了コード + stderr メッセージとする。
 */

export { emitJson, emitError } from "../../../agentdev-artifact-validation/scripts/lib/result.ts";

export type {
  AllocOk,
  AllocErr,
  AllocResult,
  CheckOk,
  CheckErr,
  CheckResult,
} from "../../../agentdev-artifact-validation/scripts/lib/result.ts";
