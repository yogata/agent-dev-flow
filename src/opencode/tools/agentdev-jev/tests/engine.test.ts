// engine（入力検証・正規化・失敗構造化）のテスト。

import { describe, expect, test } from "bun:test";
import {
  classifyError,
  evaluateWithProvider,
  normalizeDistribution,
  normalizeProviderResponse,
  validateEvaluateRequest,
} from "../engine.ts";
import type { JevEvaluateRequest } from "../contracts.ts";
import type { JevProvider } from "../provider.ts";

describe("validateEvaluateRequest", () => {
  const base: JevEvaluateRequest = {
    state: "判断状態",
    instructions: "評価指示",
    questions: [{ id: "q1", form: "boolean", prompt: "質問1" }],
  };

  test("有効なリクエストを受理する", () => {
    expect(validateEvaluateRequest(base).ok).toBe(true);
  });

  test("unknown field を拒否する", () => {
    const result = validateEvaluateRequest({ ...base, extra: 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.detail).toContain("unknown field: extra");
  });

  test("空 questions を拒否する", () => {
    const result = validateEvaluateRequest({ ...base, questions: [] });
    expect(result.ok).toBe(false);
  });

  test("choice は候補2つ以上を要求する", () => {
    const result = validateEvaluateRequest({
      ...base,
      questions: [{ id: "q1", form: "choice", prompt: "質問", options: ["のみ"] }],
    });
    expect(result.ok).toBe(false);
  });

  test("score は水準2つ以上を要求する", () => {
    const result = validateEvaluateRequest({
      ...base,
      questions: [{ id: "q1", form: "score", prompt: "質問", scale: ["低"] }],
    });
    expect(result.ok).toBe(false);
  });

  test("重複 id を拒否する", () => {
    const result = validateEvaluateRequest({
      ...base,
      questions: [
        { id: "q1", form: "boolean", prompt: "質問1" },
        { id: "q1", form: "boolean", prompt: "質問2" },
      ],
    });
    expect(result.ok).toBe(false);
  });
});

describe("normalizeDistribution", () => {
  test("合計1に正規化する", () => {
    const dist = normalizeDistribution({ a: 2, b: 2 });
    expect(dist["a"]).toBeCloseTo(0.5);
    expect(dist["b"]).toBeCloseTo(0.5);
  });

  test("丸め誤差（合計0.999）を吸収する", () => {
    const dist = normalizeDistribution({ a: 0.333, b: 0.333, c: 0.333 });
    const sum = Object.values(dist).reduce((acc, v) => acc + v, 0);
    expect(sum).toBeCloseTo(1);
  });
});

describe("normalizeProviderResponse", () => {
  test("boolean は P(true) から値と分布を決定的導出する", () => {
    const { results } = normalizeProviderResponse(
      { state: "s", instructions: "i", questions: [{ id: "q1", form: "boolean", prompt: "質問" }] },
      { requestedModel: "m", answers: { q1: { value: 0.8 } } },
    );
    expect(results[0]?.value).toBe(true);
    expect(results[0]?.probabilityDistribution["true"]).toBeCloseTo(0.8);
    expect(results[0]?.probabilityDistribution["false"]).toBeCloseTo(0.2);
  });

  test("choice は候補外キーを除外し、provider 選択が有効候補なら採用する", () => {
    const { results } = normalizeProviderResponse(
      { state: "s", instructions: "i", questions: [{ id: "q1", form: "choice", prompt: "質問", options: ["採用", "却下"] }] },
      { requestedModel: "m", answers: { q1: { value: "採用", probabilities: { 採用: 0.7, 却下: 0.2, 候補外: 0.1 } } } },
    );
    expect(results[0]?.value).toBe("採用");
    expect(results[0]?.probabilityDistribution["候補外"]).toBeUndefined();
    expect(results[0]?.probabilityDistribution["却下"]).toBeCloseTo(0.2 / 0.9);
  });

  test("score は水準名へ写像した分布を返す", () => {
    const { results } = normalizeProviderResponse(
      { state: "s", instructions: "i", questions: [{ id: "q1", form: "score", prompt: "質問", scale: ["低", "中", "高"] }] },
      { requestedModel: "m", answers: { q1: { value: 2, probabilities: { 0: 0.1, 1: 0.3, 2: 0.6 } } } },
    );
    expect(results[0]?.value).toBe(2);
    expect(results[0]?.probabilityDistribution["高"]).toBeCloseTo(0.6);
    expect(results[0]?.probabilityDistribution["低"]).toBeCloseTo(0.1);
  });

  test("provider が返した confidence 生値は [0,1] に正規化される", () => {
    const { confidence } = normalizeProviderResponse(
      { state: "s", instructions: "i", questions: [{ id: "q1", form: "boolean", prompt: "質問" }] },
      { requestedModel: "m", confidenceRaw: 1.7, answers: { q1: { value: 0.5 } } },
    );
    expect(confidence).toBe(1);
  });

  test("confidence 生値が無い場合は confidence を返さない（確率分布から代替生成しない）", () => {
    const { confidence } = normalizeProviderResponse(
      {
        state: "s",
        instructions: "i",
        questions: [
          { id: "q1", form: "boolean", prompt: "質問1" },
          { id: "q2", form: "boolean", prompt: "質問2" },
        ],
      },
      { requestedModel: "m", answers: { q1: { value: 0.9 }, q2: { value: 0.7 } } },
    );
    expect(confidence).toBeUndefined();
  });
});

describe("classifyError", () => {
  test("AbortError は timeout", () => {
    const error = new DOMException("aborted", "AbortError");
    expect(classifyError(error).kind).toBe("timeout");
  });

  test("status 429 は rate_limited", () => {
    const error = Object.assign(new Error("rate limited"), { statusCode: 429 });
    expect(classifyError(error).kind).toBe("rate_limited");
  });

  test("status 503 は server_error", () => {
    const error = Object.assign(new Error("unavailable"), { statusCode: 503 });
    expect(classifyError(error).kind).toBe("server_error");
  });

  test("型検証系エラーは response_invalid", () => {
    const error = new Error("cannot parse") as Error & { name: string };
    error.name = "TypeValidationError";
    expect(classifyError(error).kind).toBe("response_invalid");
  });

  test("その他は network_error", () => {
    expect(classifyError(new Error("fetch failed")).kind).toBe("network_error");
  });
});

describe("evaluateWithProvider", () => {
  const request: JevEvaluateRequest = {
    state: "判断状態",
    instructions: "評価指示",
    questions: [{ id: "q1", form: "boolean", prompt: "質問1" }],
  };

  function mockProvider(answers: Record<string, { value: boolean | string | number }>, overrides: Partial<JevProvider> = {}): JevProvider {
    return {
      providerId: "mock",
      requestedModel: "mock/jev",
      isConfigured: () => true,
      async evaluate() {
        return { requestedModel: "mock/jev", confidenceRaw: 0.9, answers, ...overrides };
      },
    };
  }

  test("provider 未解決時は not_configured（呼出し前判定）", async () => {
    const result = await evaluateWithProvider(request, { resolveProvider: () => null });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failure.kind).toBe("not_configured");
      expect(result.failure.retryable).toBe(false);
    }
  });

  test("isConfigured false でも not_configured", async () => {
    const provider = mockProvider({});
    provider.isConfigured = () => false;
    const result = await evaluateWithProvider(request, { resolveProvider: () => provider });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.kind).toBe("not_configured");
  });

  test("成功時は正規化済み結果と処理時間を返す", async () => {
    let clock = 1000;
    const result = await evaluateWithProvider(request, {
      resolveProvider: () => mockProvider({ q1: { value: 0.6 } }),
      now: () => ++clock,
    });
    expect(result.ok).toBe(true);
    if (result.ok && result.operation === "evaluate") {
      expect(result.success.confidence).toBeCloseTo(0.9);
      expect(result.success.processingMs).toBeGreaterThan(0);
      expect(result.success.results[0]?.value).toBe(true);
    }
  });

  test("入力検証不合格は invalid_input（副作用発生前）", async () => {
    const result = await evaluateWithProvider(
      { ...request, questions: [] } as unknown as JevEvaluateRequest,
      { resolveProvider: () => mockProvider({ q1: { value: 1 } }) },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.kind).toBe("invalid_input");
  });

  test("provider が throw した失敗は構造化分類される（自動 retry なし）", async () => {
    const provider = mockProvider({});
    provider.evaluate = async () => {
      throw Object.assign(new Error("gateway error"), { statusCode: 500 });
    };
    const result = await evaluateWithProvider(request, { resolveProvider: () => provider });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failure.kind).toBe("server_error");
      expect(result.failure.retryable).toBe(false);
    }
  });
});
