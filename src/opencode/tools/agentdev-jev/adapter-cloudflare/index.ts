// Cloudflare AI Gateway adapter（`/ai/run` 経由の typesafe/jev 接続）。
//
// 配布依存境界: Cloudflare API 固有の endpoint・認証・request/response schema・
// provider 固有の格納位置は本 adapter パッケージ内部に限定し、公開スキーマと
// Workflow 層へ漏らさない。
// 接続は POST /ai/run（model は body で渡す。model-in-path は @cf/ モデル専用）で、
// body は公式カタログ schema（schema-input.json）に一致する { model, input } 形式。
// 認証は Bearer CLOUDFLARE_API_TOKEN、account は path の CLOUDFLARE_ACCOUNT_ID。
// Cloudflare AI Gateway の default Gateway を利用し、Gateway ID を設定契約として
// 要求しない（未設定を理由とする not_configured も存在しない）。
// 自動 retry は行わない（1 回の HTTP 呼出しのみ。失敗は生エラーのまま throw し、
// 構造化（失敗分類）は Tool 本体 engine が担う）。

import type { JevProvider, JevProviderAnswer, JevProviderCall, JevProviderResponse } from "../provider.ts";

export const CLOUDFLARE_JEV_PROVIDER_ID = "cloudflare-ai-gateway";
export const CLOUDFLARE_JEV_MODEL_ID = "typesafe/jev";
export const CLOUDFLARE_JEV_ACCOUNT_ENV = "CLOUDFLARE_ACCOUNT_ID";
export const CLOUDFLARE_JEV_TOKEN_ENV = "CLOUDFLARE_API_TOKEN";

/** /ai/run request の質問オブジェクト（公式カタログ schema-input.json の questions additionalProperties に一致）。 */
type GatewayQuestion =
  | { type: "noul"; instructions: string }
  | { type: "choice"; instructions: string; criteria: Record<string, null> }
  | { type: "score"; instructions: string; criteria: string[] };

/** 応答 schema（schema-output.json）の回答オブジェクト。noul は P(true) を noul field へ格納する。choice/score は回答単位の confidence を必須で持つ。 */
type GatewayAnswer = {
  type?: unknown;
  noul?: unknown;
  choice?: unknown;
  score?: unknown;
  legend?: unknown;
  probabilities?: unknown;
  confidence?: unknown;
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

/** 応答 answers を評価順で走査し、provider が返した回答単位 confidence の最初の値を evaluation 単位の生値として昇格する（noul は confidence を持たない）。評価単位 field は schema に存在しない（実測確認済み）。 */
function promoteConfidence(questions: JevProviderCall["questions"], answers: Record<string, GatewayAnswer>): number | undefined {
  for (const question of questions) {
    const confidence = answers[question.id]?.confidence;
    if (typeof confidence === "number" && Number.isFinite(confidence)) return confidence;
  }
  return undefined;
}

/** 質問形式（boolean/choice/score）を公式カタログ schema-input.json の質問オブジェクトへ写像する。 */
function mapQuestion(question: JevProviderCall["questions"][number]): GatewayQuestion {
  if (question.form === "boolean") {
    // noul の criteria（true/false ラベル）は schema 上省略可。判断条件は Workflow が構成した prompt 文面が担う。
    return { type: "noul", instructions: question.prompt };
  }
  if (question.form === "choice") {
    const criteria: Record<string, null> = {};
    for (const option of question.options ?? []) criteria[option] = null;
    return { type: "choice", instructions: question.prompt, criteria };
  }
  // score の criteria は水準ラベルの2要素以上の文字列配列（schema 必須。ordered scale）。
  return { type: "score", instructions: question.prompt, criteria: question.scale ?? [] };
}

/**
 * Cloudflare AI Gateway `/ai/run` 経由の Jev provider を構築する。
 * request/response の物理 schema（公式カタログ schema-input.json / schema-output.json に一致）。
 * 認証方式（Bearer）、account 識別（path）、provider 固有 metadata の物理表現は本 adapter 内部に閉じる。
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
      // POST /ai/run は model を URL path に入れず body の { model, input } で渡す（model-in-path は @cf/ モデル専用。400 No route の直接原因）。
      const response = await doFetch(
        `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ model: modelId, input: { state: call.state, questions } }),
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
      // 応答は v4 envelope の二重 result（実測確認済み）: 外側 result は実行状態（state 等）、内側 result がモデル出力（model / answers / usage）。
      const outerResult = (envelope as Record<string, unknown>).result;
      const innerResult =
        typeof outerResult === "object" && outerResult !== null
          ? (outerResult as Record<string, unknown>).result
          : undefined;
      if (typeof innerResult !== "object" || innerResult === null) {
        throw responseValidationError("gateway response has no result object");
      }
      const result = innerResult as {
        answers?: unknown;
        usage?: { input_tokens?: unknown };
        model?: unknown;
      };
      if (typeof result.answers !== "object" || result.answers === null) {
        throw responseValidationError("gateway response has no answers object");
      }
      const answers: Record<string, JevProviderAnswer> = {};
      for (const [id, answer] of Object.entries(result.answers as Record<string, GatewayAnswer>)) {
        if (answer.type === "noul") {
          // schema-output.json では noul field 必須。応答形式違反は形式検証失敗として engine へ渡す（response_invalid 分類）。
          if (typeof answer.noul !== "number" || !Number.isFinite(answer.noul)) {
            throw responseValidationError(`noul answer has no probability for question ${id}`);
          }
          answers[id] = { value: answer.noul };
        } else if (answer.type === "choice") {
          const probabilities =
            typeof answer.probabilities === "object" && answer.probabilities !== null
              ? (answer.probabilities as Record<string, number>)
              : undefined;
          answers[id] = {
            value: typeof answer.choice === "string" ? answer.choice : undefined,
            ...(probabilities !== undefined ? { probabilities } : {}),
          };
        } else if (answer.type === "score") {
          const probabilities =
            typeof answer.probabilities === "object" && answer.probabilities !== null
              ? (answer.probabilities as Record<string, number>)
              : undefined;
          // score の生値は既定値 fallback せずそのまま渡す（正規化不能時は engine が response_invalid とする）。
          // probabilities のキーは数値添字の文字列（実測。legend は index → 水準名の対応であり engine の既存正規化が index を解釈するため破棄）。
          answers[id] = {
            value: typeof answer.score === "number" ? answer.score : undefined,
            ...(probabilities !== undefined ? { probabilities } : {}),
          };
        } else {
          throw responseValidationError(`unknown answer type for question ${id}`);
        }
      }
      const inputTokens =
        typeof result.usage?.input_tokens === "number" && Number.isFinite(result.usage.input_tokens)
          ? result.usage.input_tokens
          : undefined;
      const resolvedModel = typeof result.model === "string" && result.model !== "" ? result.model : undefined;
      const confidenceRaw = promoteConfidence(call.questions, result.answers as Record<string, GatewayAnswer>);
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
