// Antigravity ホストの GitHub プラグインと agentdev_gh runner 契約（PluginMapping）の対応付け。
//
// 公開情報の調査では、Antigravity が既定で提供する GitHub プラグインの tool 名・
// 引数名・応答形式を確認できる文書が存在しない。GitHub の操作は利用者が MCP
// サーバーを構成して使う形が案内されており、サーバー側の tool 面とホスト側の
// 呼出し面（tool 名の名前空間、応答の封筒形式、対象リポジトリの引数への束縛）の
// 対応は公開情報だけでは確認できない。そのため本対応表は全操作を未確認
// （supported: false）とし、plan は呼び出しを組み立てない。未確認の能力は
// 実証済みとせず、createPluginRunner は失敗で停止して利用者の判断まで進む。
// 能力を実機で確認した後は、能力表の当該行の更新と、対応する操作の呼び出し
// 計画（plan）と応答解釈（interpret）の実装だけで接続する。この対応付けは
// 暗黙に gh CLI へ切り替えない。

import type { GhToolOperation } from "../../common/tools/agentdev-gh/contracts.ts";
import type {
  PluginCall,
  PluginMapping,
} from "../../common/tools/agentdev-gh/plugin-runner.ts";
import type {
  GhRunnerFailureClass,
  GhRunnerReply,
  GhRunnerRequest,
} from "../../common/tools/agentdev-gh/runner.ts";

/** 操作ごとの能力の確認状態。evidence は公開文書の出典識別子または "unconfirmed"。 */
export interface AntigravityPluginCapability {
  readonly supported: boolean;
  readonly evidence: string;
}

/** 公開情報で確認できていない操作の能力行。 */
const UNCONFIRMED: AntigravityPluginCapability = {
  supported: false,
  evidence: "unconfirmed",
};

/**
 * 20 操作の能力表。supported は公開文書でプラグインが当該操作を実行できると
 * 確認できた場合にのみ true とする（未確認は false）。supports() はこの表のみを
 * 参照し、能力の確認はこの表の該当行の更新のみで反映される。
 */
export const ANTIGRAVITY_PLUGIN_CAPABILITIES: Readonly<
  Record<GhToolOperation, AntigravityPluginCapability>
> = {
  issue_create: UNCONFIRMED,
  issue_read: UNCONFIRMED,
  issue_update: UNCONFIRMED,
  issue_close: UNCONFIRMED,
  pr_create: UNCONFIRMED,
  pr_read: UNCONFIRMED,
  pr_merge: UNCONFIRMED,
  pr_changed_files: UNCONFIRMED,
  pr_mergeable: UNCONFIRMED,
  pr_update: UNCONFIRMED,
  issue_list: UNCONFIRMED,
  issue_reopen: UNCONFIRMED,
  comment_create: UNCONFIRMED,
  comment_list: UNCONFIRMED,
  comment_update: UNCONFIRMED,
  comment_delete: UNCONFIRMED,
  release_create: UNCONFIRMED,
  release_list: UNCONFIRMED,
  release_read: UNCONFIRMED,
  release_publish: UNCONFIRMED,
};

/** 未確認操作に対する停止応答（runner の失敗応答の形式）。 */
function stoppedForUnconfirmed(operation: GhToolOperation): GhRunnerReply {
  const failureClass: GhRunnerFailureClass = "operation-failed";
  return {
    ok: false,
    exitCode: null,
    failureClass,
    error: `antigravity GitHub plugin capability is unconfirmed for the operation: ${operation}`,
  };
}

/** 空の呼び出し計画（全操作が未確認の間の plan の値）。 */
const NO_CALLS: readonly PluginCall[] = [];

/**
 * Antigravity ホストの GitHub プラグイン対応付け。
 * supports は能力表を唯一の参照元とする。全操作が未確認のため plan は空配列を
 * 返し、interpret は停止応答を返す（いずれも副作用を持たず例外を投げない）。
 */
export const antigravityPluginMapping: PluginMapping = {
  supports(operation) {
    return ANTIGRAVITY_PLUGIN_CAPABILITIES[operation].supported;
  },
  plan(_request) {
    return NO_CALLS;
  },
  interpret(request) {
    return stoppedForUnconfirmed(request.operation);
  },
};
