// 初期 Vercel adapter（AI Gateway 経由の typesafe/Jev 接続）。
//
// 配布依存境界（REQ-{NNN}・DEC-{NNN} 決定2）: 評価 SDK 固有の名称・型・格納位置は
// 本 adapter パッケージ内部に限定し、公開スキーマと Workflow 層へ漏らさない。
// provider 固有の confidence 格納位置（providerMetadata の typesafe プロバイダ枠）
// も本 adapter が内部吸収し、provider 非依存の生値として返す。
// 自動 retry は行わない（maxRetries: 0。REQ-{NNNN}-{NNN}）。
// 接続設定は AI_GATEWAY_API_KEY 環境変数で解決し、未設定時は呼び出さない。

import { experimental_evaluate } from "ai";
import { createGateway } from "@ai-sdk/gateway";
import type { JevProvider, JevProviderAnswer, JevProviderCall, JevProviderResponse } from "../provider.ts";

export const VERCEL_JEV_PROVIDER_ID = "vercel-ai-gateway";
export const VERCEL_JEV_MODEL_ID = "typesafe-ai/jev";
export const VERCEL_JEV_CREDENTIAL_ENV = "AI_GATEWAY_API_KEY";

type EnvSource = Record<string, string | undefined>;

/** 接続設定の事前判定。未設定時は API 呼出しを行わない（not_configured 区分。Jev API 失敗に含めない）。 */
export function isVercelJevConfigured(env: EnvSource = process.env): boolean {
  const value = env[VERCEL_JEV_CREDENTIAL_ENV];
  return typeof value === "string" && value.length > 0;
}

function extractConfidence(providerMetadata: unknown): number | undefined {
  if (typeof providerMetadata !== "object" || providerMetadata === null) return undefined;
  const typesafe = (providerMetadata as Record<string, unknown>).typesafe;
  if (typeof typesafe !== "object" || typesafe === null) return undefined;
  const confidence = (typesafe as Record<string, unknown>).confidence;
  if (typeof confidence === "number" && Number.isFinite(confidence)) return confidence;
  return undefined;
}

/**
 * Vercel AI Gateway 経由の Jev provider を構築する。
 * 失敗は生エラーのまま throw し、構造化（失敗分類）は Tool 本体 engine が担う。
 */
export function createVercelJevProvider(options: { env?: EnvSource; modelId?: string } = {}): JevProvider {
  const env = options.env ?? process.env;
  const modelId = options.modelId ?? VERCEL_JEV_MODEL_ID;
  const credential = env[VERCEL_JEV_CREDENTIAL_ENV];

  return {
    providerId: VERCEL_JEV_PROVIDER_ID,
    requestedModel: modelId,
    isConfigured(): boolean {
      return typeof credential === "string" && credential.length > 0;
    },
    async evaluate(call: JevProviderCall): Promise<JevProviderResponse> {
      if (typeof credential !== "string" || credential.length === 0) {
        throw new Error(`${VERCEL_JEV_CREDENTIAL_ENV} is not set (provider ${VERCEL_JEV_PROVIDER_ID} refuses to call the API)`);
      }
      const gateway = createGateway({ apiKey: credential });
      const questions: Record<string, unknown> = {};
      for (const question of call.questions) {
        if (question.form === "boolean") {
          questions[question.id] = { type: "boolean", instructions: question.prompt };
        } else if (question.form === "choice") {
          const criteria: Record<string, null> = {};
          for (const option of question.options ?? []) criteria[option] = null;
          questions[question.id] = { type: "choice", instructions: question.prompt, criteria };
        } else {
          // score の criteria は ordered levels の文字列配列（評価 SDK 契約: 最低 2 水準）。
          questions[question.id] = { type: "score", instructions: question.prompt, criteria: question.scale ?? [] };
        }
      }
      const result = await experimental_evaluate({
        model: gateway.evaluationModel(modelId as never),
        state: call.state,
        questions: questions as never,
        maxRetries: 0,
        ...(call.signal !== undefined ? { abortSignal: call.signal } : {}),
      });
      const answers: Record<string, JevProviderAnswer> = {};
      for (const [id, answer] of Object.entries(result.answers)) {
        const typed = answer as {
          type: "boolean" | "choice" | "score";
          probability?: number;
          choice?: string;
          score?: number;
          probabilities?: Record<string, number>;
        };
        if (typed.type === "boolean") {
          answers[id] = { value: typed.probability ?? 0 };
        } else if (typed.type === "choice") {
          answers[id] = {
            value: typed.choice ?? "",
            ...(typed.probabilities !== undefined ? { probabilities: typed.probabilities } : {}),
          };
        } else {
          answers[id] = {
            value: typed.score ?? 0,
            ...(typed.probabilities !== undefined ? { probabilities: typed.probabilities } : {}),
          };
        }
      }
      const inputTokens = result.usage?.inputTokens;
      const resolvedModel = result.response?.modelId;
      const confidenceRaw = extractConfidence(result.providerMetadata);
      return {
        requestedModel: modelId,
        ...(resolvedModel !== undefined && resolvedModel !== "" ? { resolvedModel } : {}),
        ...(inputTokens !== undefined ? { inputTokens } : {}),
        ...(confidenceRaw !== undefined ? { confidenceRaw } : {}),
        answers,
      };
    },
  };
}
