// agentdev-jev provider 接続契約（provider・SDK 非依存の公開面）。
//
// provider 実装（初期 Vercel adapter）は本契約の構造適合を実装する。
// adapter 内部でのみ評価 SDK を消費し、本契約面と Workflow 層へ SDK 固有の
// 名称・型・格納位置を漏らさない（REQ-{NNNN}-{NNN}）。
// 失敗は生エラーをそのまま throw し、構造化（失敗分類）は engine が担う。

import type { JevQuestionForm } from "./contracts.ts";

/** provider 呼出しの抽象入力（質問型の対応づけ済み入力）。 */
export type JevProviderCall = {
  /** 閉じた判断状態（評価リクエストの state + instructions + criteria を含む判断入力）。 */
  state: string;
  /** 質問群（id、form、prompt、options/scale）。 */
  questions: ReadonlyArray<{
    id: string;
    form: JevQuestionForm;
    prompt: string;
    options?: string[];
    scale?: string[];
  }>;
  /** 中断信号（timeout 制御は呼出し元が所有）。 */
  signal?: AbortSignal;
};

/** provider 呼出しの抽象応答。provider 固有の値は providerId の意味で解釈される。 */
export type JevProviderResponse = {
  requestedModel: string;
  resolvedModel?: string;
  inputTokens?: number;
  /** provider 固有の格納位置から adapter が吸収した生 confidence 値（省略時は engine が分布から決定的導出）。 */
  confidenceRaw?: number;
  /** 質問 ID ごとの応答。value は form に応じた生値、probabilities は生分布（正規化は engine が担う）。 */
  answers: Record<string, JevProviderAnswer>;
};

export type JevProviderAnswer = {
  /** boolean は P(true) を value に格納する（provider 契約上、選択は engine が決定的導出）。 */
  value: boolean | string | number;
  probabilities?: Record<string, number>;
};

/** provider 接続契約。実装は構造適合で足りる（動的解決を許容）。 */
export interface JevProvider {
  /** 接続種別識別子（SDK 名を含まない。初期実装: "vercel-ai-gateway"）。 */
  readonly providerId: string;
  readonly requestedModel: string;
  /** 接続設定の解決可否。false の場合は呼び出さず not_configured として扱う。 */
  isConfigured(): boolean;
  evaluate(call: JevProviderCall): Promise<JevProviderResponse>;
}
