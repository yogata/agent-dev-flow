// agentdev-textlint-guard 上限付きワーカー: lint 実行エントリ。
//
// 親プロセスから { id, root, rel, text } を受け取り、共通基盤で規則実行して結果を返す。
// エンジンと規則の初期化は worker 内で root ごとに1回だけ行い、複数 job 間で共有する
// （エンジンと辞書の初期化結果の一実行内共有は独立性違反ではない）。
// worker は規則実行だけを担い、同一性判定・用途付与・照合は親プロセス（pool → runs）
// が行うため、検査条件の計算はここでは行わない。
// この worker は検査基盤内部の実行形態であり、工程受理用の結果には
// 親プロセス（pool → runs）が用途・対象範囲・完了状態を付与する。

import { inspectText, prepareInspection, type InspectPrepared } from "../inspect.ts";

/** Bun Web Worker の runtime global（tsconfig lib は DOM を含まないため最小宣言）。 */
declare const self: {
  onmessage: ((event: MessageEvent) => void) | null;
  postMessage: (message: unknown) => void;
};

export interface WorkerJobMessage {
  readonly kind: "lint";
  readonly id: number;
  readonly root: string;
  readonly rel: string;
  readonly text: string;
}

export type WorkerResultMessage =
  | { readonly kind: "result"; readonly id: number; readonly rel: string; readonly ok: true; readonly result: unknown }
  | {
      readonly kind: "result";
      readonly id: number;
      readonly rel: string;
      readonly ok: false;
      /** 検査異常の種別。context: 初期化失敗（親側の逐次フォールバック対象）、lint: 検査実行の異常終了。 */
      readonly failureKind: "context" | "lint";
      readonly detail: string;
    };

const preparedCache = new Map<string, Promise<InspectPrepared>>();

function prepareFor(root: string): Promise<InspectPrepared> {
  let promise = preparedCache.get(root);
  if (promise === undefined) {
    promise = prepareInspection(root);
    preparedCache.set(root, promise);
  }
  return promise;
}

self.onmessage = async (event: MessageEvent) => {
  const message = (event as MessageEvent<WorkerJobMessage>).data;
  if (message === null || typeof message !== "object" || message.kind !== "lint") return;
  const reply = (payload: WorkerResultMessage) => self.postMessage(payload);
  const prepared = await prepareFor(message.root);
  if (!prepared.ok) {
    reply({ kind: "result", id: message.id, rel: message.rel, ok: false, failureKind: "context", detail: prepared.detail });
    return;
  }
  const inspected = await inspectText(prepared, message.root, message.rel, message.text);
  if (!inspected.ok) {
    reply({ kind: "result", id: message.id, rel: message.rel, ok: false, failureKind: "lint", detail: inspected.detail });
    return;
  }
  reply({ kind: "result", id: message.id, rel: message.rel, ok: true, result: inspected.result });
};
