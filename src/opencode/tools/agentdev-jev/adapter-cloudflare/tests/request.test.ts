// Cloudflare adapter の request 構成（TS-001 接続契約 assert）と質問形式マッピングの単体テスト。
// fetch を double（fetchImpl 注入）で差し替え、adapter が構築する request URL・headers・body を
// 観測する（実 API 呼出しは行わない。実 gateway 検証は TS-010 で実施）。期待値は公式カタログ
// schema-input.json / schema-output.json と実測応答形状（v4 envelope の二重 result）に一致させる。

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
    result: {
      state: "Completed",
      result: {
        model: "jev-1.13.0",
        answers: {
          q1: { type: "noul", noul: 0.82 },
          c1: { type: "choice", choice: "案B", probabilities: { 案A: 0.2, 案B: 0.7, 案C: 0.1 }, confidence: 0.95 },
          s1: { type: "score", score: 1.7, legend: { "0": "低", "1": "中", "2": "高" }, probabilities: { "0": 0.1, "1": 0.3, "2": 0.6 }, confidence: 0.87 },
        },
        usage: { input_tokens: 123, output_tokens: 45 },
      },
      gatewayMetadata: { keySource: "Unified" },
    },
    success: true,
    errors: [],
    messages: [],
  };
}

describe("TS-001 接続契約（request 構成 assert）", () => {
  test("endpoint は /ai/run（model path なし）、model は body で渡す、Bearer は CLOUDFLARE_API_TOKEN、account は path", async () => {
    const { provider, requests } = providerWithResponse(okEnvelope());
    await provider.evaluate({
      state: "判断状態",
      questions: [{ id: "q1", form: "boolean", prompt: "質問" }],
    });
    expect(requests.length).toBe(1);
    const request = requests[0] as CapturedRequest;
    expect(request.input).toBe("https://api.cloudflare.com/client/v4/accounts/acct-123/ai/run");
    expect(new URL(request.input).pathname).toBe("/client/v4/accounts/acct-123/ai/run");
    expect(request.init.method).toBe("POST");
    const headers = request.init.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer token-value");
    expect(headers["Authorization"]?.startsWith("Bearer ")).toBe(true);
  });

  test("request body は { model, input: { state, questions } } 形式（公式 schema-input.json に一致）", async () => {
    const { provider, requests } = providerWithResponse(okEnvelope());
    await provider.evaluate({
      state: "閉じた判断入力",
      questions: [{ id: "q1", form: "boolean", prompt: "質問" }],
    });
    const request = requests[0] as CapturedRequest;
    const body = JSON.parse(String(request.init.body)) as { model?: unknown; input?: { state?: unknown; questions?: unknown } };
    expect(body.model).toBe("typesafe/jev");
    expect(body.input?.state).toBe("閉じた判断入力");
    expect(typeof body.input?.questions).toBe("object");
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
    const body = JSON.parse(String(request.init.body)) as Record<string, unknown> & { input?: Record<string, unknown> };
    expect(body["gateway"]).toBeUndefined();
    expect(body["gatewayId"]).toBeUndefined();
    expect(body.input?.["gateway"]).toBeUndefined();
    expect(body.input?.["gatewayId"]).toBeUndefined();
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

describe("質問形式の criteria マッピング（REQ-090-011・schema-input.json に一致）", () => {
  test("boolean 形式は noul 型（type と instructions。criteria は省略）を送信する", async () => {
    const { provider, requests } = providerWithResponse(okEnvelope());
    await provider.evaluate({
      state: "判断状態",
      questions: [{ id: "q1", form: "boolean", prompt: "契約は妥当か" }],
    });
    const request = requests[0] as CapturedRequest;
    const body = JSON.parse(String(request.init.body)) as { input: { questions: Record<string, { type?: string; instructions?: string; criteria?: unknown }> } };
    expect(body.input.questions["q1"]).toEqual({ type: "noul", instructions: "契約は妥当か" });
  });

  test("choice 形式は候補ラベルを criteria キーとする候補マップで送信する", async () => {
    const { provider, requests } = providerWithResponse(okEnvelope());
    await provider.evaluate({
      state: "判断状態",
      questions: [{ id: "c1", form: "choice", prompt: "どの案か", options: ["案A", "案B", "案C"] }],
    });
    const request = requests[0] as CapturedRequest;
    const body = JSON.parse(String(request.init.body)) as { input: { questions: Record<string, { type?: string; instructions?: string; criteria?: Record<string, null> }> } };
    expect(body.input.questions["c1"]?.type).toBe("choice");
    expect(body.input.questions["c1"]?.instructions).toBe("どの案か");
    expect(body.input.questions["c1"]?.criteria).toEqual({ 案A: null, 案B: null, 案C: null });
  });

  test("score 形式は scale 水準ラベルの2要素以上の文字列配列を criteria として送信する（null を含まない）", async () => {
    const { provider, requests } = providerWithResponse(okEnvelope());
    await provider.evaluate({
      state: "判断状態",
      questions: [{ id: "s1", form: "score", prompt: "どの水準か", scale: ["低", "中", "高"] }],
    });
    const request = requests[0] as CapturedRequest;
    const body = JSON.parse(String(request.init.body)) as {
      input: { questions: Record<string, { type?: string; instructions?: string; criteria?: unknown }> };
    };
    const question = body.input.questions["s1"] ?? {};
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

describe("応答マッピング（schema-output.json・実測応答形状の内部吸収）", () => {
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
    expect(response.resolvedModel).toBe("jev-1.13.0");
    expect(response.inputTokens).toBe(123);
    // 評価単位 field は schema に存在せず、回答単位 confidence の最初の値（評価順走査）を昇格する
    expect(response.confidenceRaw).toBe(0.95);
    expect(response.answers["q1"]?.value).toBe(0.82);
    const choice = response.answers["c1"] ?? { value: undefined, probabilities: undefined };
    expect(choice.value).toBe("案B");
    expect(choice.probabilities).toEqual({ 案A: 0.2, 案B: 0.7, 案C: 0.1 });
    // score の生値は正規化せず engine へ渡す（canonical result の正規化は engine 責務。probabilities のキーは数値添字文字列）
    expect(response.answers["s1"]?.value).toBe(1.7);
    expect(response.answers["s1"]?.probabilities).toEqual({ "0": 0.1, "1": 0.3, "2": 0.6 });
  });

  test("noul のみの応答では confidence を昇格しない（noul は confidence を持たない）", async () => {
    const { provider } = providerWithResponse({
      result: { state: "Completed", result: { model: "jev-1.13.0", answers: { q1: { type: "noul", noul: 0.6 } }, usage: { input_tokens: 100, output_tokens: 20 } } },
      success: true,
      errors: [],
    });
    const response = await provider.evaluate({
      state: "判断状態",
      questions: [{ id: "q1", form: "boolean", prompt: "質問" }],
    });
    expect(response.confidenceRaw).toBeUndefined();
    expect(response.answers["q1"]?.value).toBe(0.6);
  });

  test("score 応答の score 値欠落は既定値 0 へフォールバックせず生の欠落を engine へ渡す", async () => {
    const { provider } = providerWithResponse({
      result: { state: "Completed", result: { model: "jev-1.13.0", answers: { s1: { type: "score", legend: {}, probabilities: {}, confidence: 0.8 } }, usage: { input_tokens: 1, output_tokens: 1 } } },
      success: true,
      errors: [],
    });
    const response = await provider.evaluate({
      state: "判断状態",
      questions: [{ id: "s1", form: "score", prompt: "どの水準か", scale: ["低", "中", "高"] }],
    });
    expect(response.answers["s1"]?.value).toBeUndefined();
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
      errors: [{ code: 7000, message: "No route for that URI" }],
    });
    await expect(
      provider.evaluate({ state: "判断状態", questions: [{ id: "q1", form: "boolean", prompt: "質問" }] }),
    ).rejects.toMatchObject({ statusCode: 7000 });
  });

  test("内側 result 欠落応答は形式検証失敗のエラー名で throw（engine で response_invalid 分類）", async () => {
    const { provider } = providerWithResponse({ result: { state: "Failed" }, success: true, errors: [] });
    await expect(
      provider.evaluate({ state: "判断状態", questions: [{ id: "q1", form: "boolean", prompt: "質問" }] }),
    ).rejects.toMatchObject({ name: "TypeValidationError" });
  });

  test("answers 欠落応答は形式検証失敗のエラー名で throw", async () => {
    const { provider } = providerWithResponse({ result: { state: "Completed", result: { model: "jev-1.13.0", usage: {} } }, success: true, errors: [] });
    await expect(
      provider.evaluate({ state: "判断状態", questions: [{ id: "q1", form: "boolean", prompt: "質問" }] }),
    ).rejects.toMatchObject({ name: "TypeValidationError" });
  });

  test("noul 応答の noul 欠落は形式検証失敗のエラー名で throw（schema 必須違反）", async () => {
    const { provider } = providerWithResponse({
      result: { state: "Completed", result: { model: "jev-1.13.0", answers: { q1: { type: "noul" } }, usage: {} } },
      success: true,
      errors: [],
    });
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
      result: { state: "Completed", result: { model: "jev-1.13.0", answers: { x1: { type: "essay" } }, usage: {} } },
      success: true,
      errors: [],
    });
    await expect(
      provider.evaluate({ state: "判断状態", questions: [{ id: "x1", form: "boolean", prompt: "質問" }] }),
    ).rejects.toMatchObject({ name: "TypeValidationError" });
  });
});
