// Cloudflare adapter の request 構成（TS-001 接続契約 assert）と質問形式マッピングの単体テスト。
// fetch を double（fetchImpl 注入）で差し替え、adapter が構築する request URL・headers・body を
// 観測する（実 API 呼出しは行わない。実 gateway 検証は TS-010 で実施）。

import { describe, expect, test } from "bun:test";
import {
  CLOUDFLARE_JEV_ACCOUNT_ENV,
  CLOUDFLARE_JEV_MODEL_ID,
  CLOUDFLARE_JEV_TOKEN_ENV,
  createCloudflareJevProvider,
} from "../index.ts";

const ENV = { [CLOUDFLARE_JEV_ACCOUNT_ENV]: "acct-123", [CLOUDFLARE_JEV_TOKEN_ENV]: "token-value" };

type CapturedRequest = { input: string; init: RequestInit };

function providerWithResponse(responseBody: unknown, status = 200): { provider: ReturnType<typeof createCloudflareJevProvider>; requests: CapturedRequest[] } {
  const requests: CapturedRequest[] = [];
  const provider = createCloudflareJevProvider({
    env: ENV,
    fetchImpl: async (input, init) => {
      requests.push({ input, init });
      return new Response(typeof responseBody === "string" ? responseBody : JSON.stringify(responseBody), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    },
  });
  return { provider, requests };
}

function okEnvelope(): unknown {
  return {
    success: true,
    errors: [],
    result: {
      answers: {
        q1: { type: "boolean", probability: 0.82 },
        c1: { type: "choice", choice: "案B", probabilities: { 案A: 0.2, 案B: 0.7, 案C: 0.1 } },
        s1: { type: "score", score: 2, probabilities: { 0: 0.1, 1: 0.3, 2: 0.6 } },
      },
      usage: { inputTokens: 123 },
      response: { modelId: "typesafe/jev@1" },
      providerMetadata: { cloudflare: { confidence: 0.9 } },
    },
  };
}

describe("TS-001 接続契約（request 構成 assert）", () => {
  test("endpoint は /ai/run、model は typesafe/jev、account は path、Bearer は CLOUDFLARE_API_TOKEN", async () => {
    const { provider, requests } = providerWithResponse(okEnvelope());
    await provider.evaluate({
      state: "判断状態",
      questions: [{ id: "q1", form: "boolean", prompt: "質問" }],
    });
    expect(requests.length).toBe(1);
    const request = requests[0] as CapturedRequest;
    expect(request.input).toBe("https://api.cloudflare.com/client/v4/accounts/acct-123/ai/run/typesafe/jev");
    expect(new URL(request.input).pathname).toBe("/client/v4/accounts/acct-123/ai/run/typesafe/jev");
    expect(request.init.method).toBe("POST");
    const headers = request.init.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer token-value");
    expect(headers["Authorization"]?.startsWith("Bearer ")).toBe(true);
  });

  test("Gateway ID を必須とする request 構成が存在しない（credential 環境変数2つのみで構成）", async () => {
    const { provider, requests } = providerWithResponse(okEnvelope());
    await provider.evaluate({
      state: "判断状態",
      questions: [{ id: "q1", form: "boolean", prompt: "質問" }],
    });
    const request = requests[0] as CapturedRequest;
    // default AI Gateway: gateway URL / Gateway ID の path 要素が含まれない
    expect(new URL(request.input).pathname).not.toMatch(/\/gateways?\//);
    const body = JSON.parse(String(request.init.body)) as Record<string, unknown>;
    expect(body["gateway"]).toBeUndefined();
    expect(body["gatewayId"]).toBeUndefined();
  });

  test("state と questions が request body に含まれる", async () => {
    const { provider, requests } = providerWithResponse(okEnvelope());
    await provider.evaluate({
      state: "閉じた判断入力",
      questions: [{ id: "q1", form: "boolean", prompt: "質問" }],
    });
    const request = requests[0] as CapturedRequest;
    const body = JSON.parse(String(request.init.body)) as { state?: unknown; questions?: unknown };
    expect(body["state"]).toBe("閉じた判断入力");
    expect(typeof body["questions"]).toBe("object");
  });

  test("中断信号は fetch に伝播する", async () => {
    const { provider, requests } = providerWithResponse(okEnvelope());
    const controller = new AbortController();
    await provider.evaluate({
      state: "判断状態",
      questions: [{ id: "q1", form: "boolean", prompt: "質問" }],
      signal: controller.signal,
    });
    const request = requests[0] as CapturedRequest;
    expect(request.init.signal).toBe(controller.signal);
  });
});

describe("質問形式の criteria マッピング（REQ-090-011）", () => {
  test("boolean 形式は type と instructions を送信する", async () => {
    const { provider, requests } = providerWithResponse(okEnvelope());
    await provider.evaluate({
      state: "判断状態",
      questions: [{ id: "q1", form: "boolean", prompt: "契約は妥当か" }],
    });
    const request = requests[0] as CapturedRequest;
    const body = JSON.parse(String(request.init.body)) as { questions: Record<string, { type?: string; instructions?: string }> };
    expect(body.questions["q1"]).toEqual({ type: "boolean", instructions: "契約は妥当か" });
  });

  test("choice 形式は候補ラベルを criteria キーとする候補マップで送信する", async () => {
    const { provider, requests } = providerWithResponse(okEnvelope());
    await provider.evaluate({
      state: "判断状態",
      questions: [{ id: "c1", form: "choice", prompt: "どの案か", options: ["案A", "案B", "案C"] }],
    });
    const request = requests[0] as CapturedRequest;
    const body = JSON.parse(String(request.init.body)) as { questions: Record<string, { type?: string; instructions?: string; criteria?: Record<string, null> }> };
    expect(body.questions["c1"]?.type).toBe("choice");
    expect(body.questions["c1"]?.instructions).toBe("どの案か");
    expect(body.questions["c1"]?.criteria).toEqual({ 案A: null, 案B: null, 案C: null });
  });

  test("score 形式は scale 水準ラベルの空でない文字列配列を criteria として送信する（null を含まない）", async () => {
    const { provider, requests } = providerWithResponse(okEnvelope());
    await provider.evaluate({
      state: "判断状態",
      questions: [{ id: "s1", form: "score", prompt: "どの水準か", scale: ["低", "中", "高"] }],
    });
    const request = requests[0] as CapturedRequest;
    const body = JSON.parse(String(request.init.body)) as {
      questions: Record<string, { type?: string; instructions?: string; criteria?: unknown }>;
    };
    const question = body.questions["s1"] ?? {};
    expect(question.type).toBe("score");
    expect(question.instructions).toBe("どの水準か");
    const criteria = question.criteria;
    expect(Array.isArray(criteria)).toBe(true);
    const levels = criteria as unknown[];
    expect(levels.length).toBeGreaterThanOrEqual(2);
    expect(levels).toEqual(["低", "中", "高"]);
    for (const level of levels) {
      expect(typeof level).toBe("string");
      expect((level as string).length).toBeGreaterThan(0);
    }
  });
});

describe("応答マッピング（provider 固有表現の内部吸収）", () => {
  test("answers / probabilities / inputTokens / resolvedModel / confidence を生値として返す", async () => {
    const { provider } = providerWithResponse(okEnvelope());
    const response = await provider.evaluate({
      state: "判断状態",
      questions: [
        { id: "q1", form: "boolean", prompt: "質問" },
        { id: "c1", form: "choice", prompt: "どの案か", options: ["案A", "案B", "案C"] },
        { id: "s1", form: "score", prompt: "どの水準か", scale: ["低", "中", "高"] },
      ],
    });
    expect(response.requestedModel).toBe(CLOUDFLARE_JEV_MODEL_ID);
    expect(response.resolvedModel).toBe("typesafe/jev@1");
    expect(response.inputTokens).toBe(123);
    expect(response.confidenceRaw).toBe(0.9);
    expect(response.answers["q1"]?.value).toBe(0.82);
    const choice = response.answers["c1"] ?? { value: undefined, probabilities: undefined };
    expect(choice.value).toBe("案B");
    expect(choice.probabilities).toEqual({ 案A: 0.2, 案B: 0.7, 案C: 0.1 });
    // score の生値は正規化せず engine へ渡す（canonical result の正規化は engine 責務）
    expect(response.answers["s1"]?.value).toBe(2);
  });

  test("score 応答の score 値欠落は既定値 0 へフォールバックせず生の欠落を engine へ渡す", async () => {
    const { provider } = providerWithResponse({
      success: true,
      result: { answers: { s1: { type: "score" } } },
    });
    const response = await provider.evaluate({
      state: "判断状態",
      questions: [{ id: "s1", form: "score", prompt: "どの水準か", scale: ["低", "中", "高"] }],
    });
    expect(response.answers["s1"]?.value).toBeUndefined();
  });

  test("provider が confidence を返さない応答では confidenceRaw を返さない", async () => {
    const { provider } = providerWithResponse({
      success: true,
      result: { answers: { q1: { type: "boolean", probability: 0.6 } } },
    });
    const response = await provider.evaluate({
      state: "判断状態",
      questions: [{ id: "q1", form: "boolean", prompt: "質問" }],
    });
    expect(response.confidenceRaw).toBeUndefined();
  });
});

describe("失敗経路（engine の構造化分類へ渡す生エラー）", () => {
  test("HTTP 429 は statusCode 429 を伴うエラー（engine で rate_limited 分類）", async () => {
    const { provider } = providerWithResponse("rate limited", 429);
    await expect(
      provider.evaluate({ state: "判断状態", questions: [{ id: "q1", form: "boolean", prompt: "質問" }] }),
    ).rejects.toMatchObject({ statusCode: 429 });
  });

  test("HTTP 5xx は statusCode を伴うエラー（engine で server_error 分類）", async () => {
    const { provider } = providerWithResponse("boom", 503);
    await expect(
      provider.evaluate({ state: "判断状態", questions: [{ id: "q1", form: "boolean", prompt: "質問" }] }),
    ).rejects.toMatchObject({ statusCode: 503 });
  });

  test("success: false 応答は errors の code を status として報告する", async () => {
    const { provider } = providerWithResponse({
      success: false,
      errors: [{ code: 504, message: "model call failed" }],
    });
    await expect(
      provider.evaluate({ state: "判断状態", questions: [{ id: "q1", form: "boolean", prompt: "質問" }] }),
    ).rejects.toMatchObject({ statusCode: 504 });
  });

  test("answers 欠落応答は形式検証失敗のエラー名で throw（engine で response_invalid 分類）", async () => {
    const { provider } = providerWithResponse({ success: true, result: {} });
    await expect(
      provider.evaluate({ state: "判断状態", questions: [{ id: "q1", form: "boolean", prompt: "質問" }] }),
    ).rejects.toMatchObject({ name: "TypeValidationError" });
  });

  test("JSON でない応答は形式検証失敗のエラー名で throw", async () => {
    const { provider } = providerWithResponse("not json");
    await expect(
      provider.evaluate({ state: "判断状態", questions: [{ id: "q1", form: "boolean", prompt: "質問" }] }),
    ).rejects.toMatchObject({ name: "TypeValidationError" });
  });

  test("未知の answer type は形式検証失敗のエラー名で throw", async () => {
    const { provider } = providerWithResponse({
      success: true,
      result: { answers: { x1: { type: "essay" } } },
    });
    await expect(
      provider.evaluate({ state: "判断状態", questions: [{ id: "x1", form: "boolean", prompt: "質問" }] }),
    ).rejects.toMatchObject({ name: "TypeValidationError" });
  });
});
