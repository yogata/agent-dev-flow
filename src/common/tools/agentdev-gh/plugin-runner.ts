// agentdev-gh Custom Tool の新ホスト接続境界。
//
// Custom Tool を登録できないホストでは、ホスト接続領域の adapter がこの境界を経由して
// 既存の runner 契約（GhRunner）を各ホストの GitHub プラグインで実装する。共通の処理
// （操作の対応判定、呼出しの逐次実行、失敗クラスへの写像）はこの境界の内側で一元化し、
// ホスト固有の変換（プラグインの tool 名と引数、応答の解釈、呼出し手段）は
// PluginMapping と PluginTransport としてホスト接続領域が差し替える。
// この境界は暗黙に gh CLI へ切り替えない。プラグインが操作を提供しない場合や呼出しが
// 失敗した場合は失敗を返し、利用者の判断まで停止する。

import type { GhToolOperation } from "./contracts.ts";
import type {
  GhRunner,
  GhRunnerFailureClass,
  GhRunnerReply,
  GhRunnerRequest,
} from "./runner.ts";

/** ホストの GitHub プラグインへの呼出し 1 件。 */
export interface PluginCall {
  /** プラグインが公開する tool 名。 */
  readonly tool: string;
  readonly args: Readonly<Record<string, unknown>>;
}

export type PluginTransportFailure =
  | "plugin-unavailable"
  | "operation-unsupported"
  | "operation-failed";

export type PluginTransportReply =
  | { readonly ok: true; readonly payload: unknown }
  | {
      readonly ok: false;
      readonly kind: PluginTransportFailure;
      readonly error: string;
    };

/**
 * プラグインへの呼出し手段。実装はホスト接続領域が所有する。
 * 呼出しは副作用を持ち得る。結果が不明な場合は再実行せず operation-failed を返す。
 */
export interface PluginTransport {
  invoke(call: PluginCall): Promise<PluginTransportReply>;
}

/** runner 契約とプラグインの操作面の対応。各関数は副作用を持たず、例外を投げない。 */
export interface PluginMapping {
  /** プラグインが当該操作を実行できると確認できている場合に true。 */
  supports(operation: GhToolOperation): boolean;
  /** runner の操作 1 件に必要な呼出しを実行順に返す。 */
  plan(request: GhRunnerRequest): readonly PluginCall[];
  /** 呼出しの応答（実行順）を runner の応答へ解釈する。 */
  interpret(
    request: GhRunnerRequest,
    payloads: readonly unknown[],
  ): GhRunnerReply;
}

const STOPPED_CLASS: GhRunnerFailureClass = "operation-failed";

function stopped(error: string): GhRunnerReply {
  return { ok: false, error, exitCode: null, failureClass: STOPPED_CLASS };
}

/** PluginMapping と PluginTransport を既存の runner 契約へ接続する。 */
export function createPluginRunner(
  mapping: PluginMapping,
  transport: PluginTransport,
): GhRunner {
  return {
    async run(request: GhRunnerRequest): Promise<GhRunnerReply> {
      const { operation } = request;
      if (!mapping.supports(operation)) {
        return stopped(
          `host GitHub plugin does not provide the operation: ${operation}`,
        );
      }
      const calls = mapping.plan(request);
      if (calls.length === 0) {
        return stopped(
          `host GitHub plugin does not provide the operation: ${operation}`,
        );
      }
      const payloads: unknown[] = [];
      for (const call of calls) {
        const reply = await transport.invoke(call);
        if (!reply.ok) {
          return stopped(reply.error);
        }
        payloads.push(reply.payload);
      }
      return mapping.interpret(request, payloads);
    },
  };
}
