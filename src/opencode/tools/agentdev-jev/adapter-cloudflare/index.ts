// Cloudflare AI Gateway adapter（`/ai/run` 経由の typesafe/jev 接続）。
//
// 配布依存境界: Cloudflare API 固有の endpoint・認証・request/response schema・
// provider 固有の格納位置は本 adapter パッケージ内部に限定し、公開スキーマと
// Workflow 層へ漏らさない。provider 固有の confidence 格納位置（/ai/run response 内の
// provider 固有 field。物理 field 名は adapter 実装の自由度）も本 adapter が内部吸収し、
// provider 非依存の生値として返す。
// 接続設定は CLOUDFLARE_ACCOUNT_ID と CLOUDFLARE_API_TOKEN 環境変数で解決し、
// 未設定時は呼び出さない。Cloudflare AI Gateway の default Gateway を利用し、
// Gateway ID を設定契約として要求しない（未設定を理由とする not_configured も存在しない）。
// 自動 retry は行わない（1 回の HTTP 呼出しのみ。失敗は生エラーのまま throw し、
// 構造化（失敗分類）は Tool 本体 engine が担う）。

import type { JevProvider, JevProviderAnswer, JevProviderCall, JevProviderResponse } from "../provider.ts";

export const CLOUDFLARE_JEV_PROVIDER_ID = "cloudflare-ai-gateway";
export const CLOUDFLARE_JEV_MODEL_ID = "typesafe/jev";
export const CLOUDFLARE_JEV_ACCOUNT_ENV = "CLOUDFLARE_ACCOUNT_ID";
export const CLOUDFLARE_JEV_TOKEN_ENV = "CLOUDFLARE_API_TOKEN";

/** /ai/run request の物理構成（評価 SDK 契約を踏襲した質問オブジェクト）。 */
type GatewayQuestion = {
  type: "boolean" | "choice" | "score";
  instructions: string;
  criteria?: Record<string, null> | string[];
};

type EnvSource = Record<string, string | undefined>;

type FetchImpl = (input: string, init: RequestInit) => Promise<Response>;

/** 接続設定の事前判定。どちらか片方でも未設定なら false（呼出し前判定。Jev API 失敗に含めない）。 */
export function isCloudflareJevConfigured(env: EnvSource = process.env): boolean {
  return nonEmpty(env[CLOUDFLARE_JEV_ACCOUNT_ENV]) && nonEmpty(env[CLOUDFLARE_JEV_TOKEN_ENV]);
}

function nonEmpty(value: string | undefined): value is string {
  return typeof value === "string" && value.length > 0;
}

/** 応答の形式検証失敗。engine の構造化分類（response_invalid）へ委譲するためのエラー名で throw する。 */
function responseValidationError(detail: string): Error {
  const error = new Error(detail);
  error.name = "TypeValidationError";
  return error;
}

function extractConfidence(providerMetadata: unknown): number | undefined {
  if (typeof providerMetadata !== "object" || providerMetadata === null) return undefined;
  const providerEntry = (providerMetadata as Record<string, unknown>).cloudflare;
  if (typeof providerEntry !== "object" || providerEntry === null) return undefined;
  const confidence = (providerEntry as Record<string, unknown>).confidence;
  if (typeof confidence === "number" && Number.isFinite(confidence)) return confidence;
  return undefined;
}

/** 質問形式（boolean/choice/score）を gateway request の質問オブジェクトへ写像する。 */
function mapQuestion(question: JevProviderCall["questions"][number]): GatewayQuestion {
  if (question.form === "boolean") {
    return { type: "boolean", instructions: question.prompt };
  }
  if (question.form === "choice") {
    const criteria: Record<string, null> = {};
    for (const option of question.options ?? []) criteria[option] = null;
    return { type: "choice", instructions: question.prompt, criteria };
  }
  // score の criteria は水準ラベルの空でない文字列配列（gateway schema が必須要求する空でない文字列配列。choice の criteria 構成と対称）。
  return { type: "score", instructions: question.prompt, criteria: question.scale ?? [] };
}

/**
 * Cloudflare AI Gateway `/ai/run` 経由の Jev provider を構築する。
 * request/response の物理 schema、認証方式（Bearer）、account 識別（path）、
 * provider 固有 metadata の物理表現は本 adapter 内部に閉じる。
 */
export function createCloudflareJevProvider(
  options: { env?: EnvSource; modelId?: string; fetchImpl?: FetchImpl } = {},
): JevProvider {
  const env = options.env ?? process.env;
  const modelId = options.modelId ?? CLOUDFLARE_JEV_MODEL_ID;
  const doFetch = options.fetchImpl ?? ((input: string, init: RequestInit) => fetch(input, init));

  return {
    providerId: CLOUDFLARE_JEV_PROVIDER_ID,
    requestedModel: modelId,
    isConfigured(): boolean {
      return isCloudflareJevConfigured(env);
    },
    async evaluate(call: JevProviderCall): Promise<JevProviderResponse> {
      const account = env[CLOUDFLARE_JEV_ACCOUNT_ENV];
      const token = env[CLOUDFLARE_JEV_TOKEN_ENV];
      if (!nonEmpty(account) || !nonEmpty(token)) {
        throw new Error(
          `${CLOUDFLARE_JEV_ACCOUNT_ENV} / ${CLOUDFLARE_JEV_TOKEN_ENV} are not set (provider ${CLOUDFLARE_JEV_PROVIDER_ID} refuses to call the API)`,
        );
      }
      const questions: Record<string, GatewayQuestion> = {};
      for (const question of call.questions) {
        questions[question.id] = mapQuestion(question);
      }
      const response = await doFetch(
        `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${modelId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ state: call.state, questions }),
          ...(call.signal !== undefined ? { signal: call.signal } : {}),
        },
      );
      if (!response.ok) {
        // HTTP status を含む生エラーとして engine へ渡す（429/5xx/その他の分類は engine が担う）。
        const body = await response.text().catch(() => "");
        throw Object.assign(
          new Error(`gateway responded with HTTP ${response.status}: ${body.slice(0, 200)}`),
          { statusCode: response.status },
        );
      }
      const envelope = (await response.json().catch(() => undefined)) as
        | { result?: unknown; success?: boolean; errors?: Array<{ code?: number; message?: string }> }
        | undefined;
      if (envelope === undefined || typeof envelope !== "object") {
        throw responseValidationError("gateway response is not a JSON object");
      }
      if (envelope.success === false) {
        const code = envelope.errors?.[0]?.code;
        const message = envelope.errors?.[0]?.message ?? "gateway reported failure";
        // 成功エンベロープでない応答は例外として engine へ渡す。既知の HTTP status 相当は status 付きで分類可能にする。
        throw Object.assign(new Error(`gateway reported failure: ${message}`), {
          ...(typeof code === "number" ? { statusCode: code } : {}),
        });
      }
      const result = (envelope as Record<string, unknown>).result;
      if (typeof result !== "object" || result === null) {
        throw responseValidationError("gateway response has no result object");
      }
      const resultRecord = result as {
        answers?: unknown;
        usage?: { inputTokens?: unknown };
        response?: { modelId?: unknown };
        providerMetadata?: unknown;
      };
      if (typeof resultRecord.answers !== "object" || resultRecord.answers === null) {
        throw responseValidationError("gateway response has no answers object");
      }
      const answers: Record<string, JevProviderAnswer> = {};
      for (const [id, answer] of Object.entries(resultRecord.answers as Record<string, unknown>)) {
        const typed = answer as {
          type?: unknown;
          probability?: unknown;
          choice?: unknown;
          score?: unknown;
          probabilities?: unknown;
        };
        if (typed.type === "boolean") {
          // boolean は P(true)。欠落時は 0 扱い（engine の決定的導出契約と一致）。
          answers[id] = { value: typeof typed.probability === "number" ? typed.probability : 0 };
        } else if (typed.type === "choice") {
          const probabilities =
            typeof typed.probabilities === "object" && typed.probabilities !== null
              ? (typed.probabilities as Record<string, number>)
              : undefined;
          answers[id] = {
            value: typeof typed.choice === "string" ? typed.choice : undefined,
            ...(probabilities !== undefined ? { probabilities } : {}),
          };
        } else if (typed.type === "score") {
          const probabilities =
            typeof typed.probabilities === "object" && typed.probabilities !== null
              ? (typed.probabilities as Record<string, number>)
              : undefined;
          // score の生値は既定値 fallback せずそのまま渡す（正規化不能時は engine が response_invalid とする）。
          answers[id] = {
            value: typeof typed.score === "number" ? typed.score : undefined,
            ...(probabilities !== undefined ? { probabilities } : {}),
          };
        } else {
          throw responseValidationError(`unknown answer type for question ${id}`);
        }
      }
      const inputTokens =
        typeof resultRecord.usage?.inputTokens === "number" && Number.isFinite(resultRecord.usage.inputTokens)
          ? resultRecord.usage.inputTokens
          : undefined;
      const resolvedModel = typeof resultRecord.response?.modelId === "string" && resultRecord.response.modelId !== ""
        ? resultRecord.response.modelId
        : undefined;
      const confidenceRaw = extractConfidence(resultRecord.providerMetadata);
      return {
        requestedModel: modelId,
        ...(resolvedModel !== undefined ? { resolvedModel } : {}),
        ...(inputTokens !== undefined ? { inputTokens } : {}),
        ...(confidenceRaw !== undefined ? { confidenceRaw } : {}),
        answers,
      };
    },
  };
}
