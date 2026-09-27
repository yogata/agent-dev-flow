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

  test("score の重複水準を拒否する（scale 一意性）", () => {
    const result = validateEvaluateRequest({
      ...base,
      questions: [{ id: "q1", form: "score", prompt: "質問", scale: ["低", "中", "低"] }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.detail).toContain("unique");
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
  function normalize(
    questions: JevEvaluateRequest["questions"],
    answers: Record<string, unknown>,
    confidenceRaw?: number,
  ): ReturnType<typeof normalizeProviderResponse> {
    return normalizeProviderResponse(
      { state: "s", instructions: "i", questions },
      { requestedModel: "m", answers: answers as never, ...(confidenceRaw !== undefined ? { confidenceRaw } : {}) },
    );
  }

  test("boolean は P(true) から値と分布を決定的導出する", () => {
    const normalized = normalize([{ id: "q1", form: "boolean", prompt: "質問" }], { q1: { value: 0.8 } });
    expect(normalized.ok).toBe(true);
    if (!normalized.ok) return;
    expect(normalized.results[0]?.value).toBe(true);
    expect(normalized.results[0]?.probabilityDistribution["true"]).toBeCloseTo(0.8);
    expect(normalized.results[0]?.probabilityDistribution["false"]).toBeCloseTo(0.2);
  });

  test("choice は候補外キーを除外し、provider 選択が有効候補なら採用する", () => {
    const normalized = normalize(
      [{ id: "q1", form: "choice", prompt: "質問", options: ["採用", "却下"] }],
      { q1: { value: "採用", probabilities: { 採用: 0.7, 却下: 0.2, 候補外: 0.1 } } },
    );
    expect(normalized.ok).toBe(true);
    if (!normalized.ok) return;
    expect(normalized.results[0]?.value).toBe("採用");
    expect(normalized.results[0]?.probabilityDistribution["候補外"]).toBeUndefined();
    expect(normalized.results[0]?.probabilityDistribution["却下"]).toBeCloseTo(0.2 / 0.9);
  });

  test("score は整数水準値を canonical result として返し、分布は水準名へ写像する", () => {
    const normalized = normalize(
      [{ id: "q1", form: "score", prompt: "質問", scale: ["低", "中", "高"] }],
      { q1: { value: 2, probabilities: { 0: 0.1, 1: 0.3, 2: 0.6 } } },
    );
    expect(normalized.ok).toBe(true);
    if (!normalized.ok) return;
    expect(normalized.results[0]?.value).toBe(2);
    expect(Number.isInteger(normalized.results[0]?.value as number)).toBe(true);
    expect(normalized.results[0]?.probabilityDistribution["高"]).toBeCloseTo(0.6);
    expect(normalized.results[0]?.probabilityDistribution["低"]).toBeCloseTo(0.1);
  });

  test("score の連続値は定義済み scale level へ正規化され、連続値のまま canonical result に残らない（TS-001）", () => {
    const scale = ["低", "中", "高"];
    const low = normalize([{ id: "q1", form: "score", prompt: "質問", scale }], { q1: { value: 0.31 } });
    const mid = normalize([{ id: "q1", form: "score", prompt: "質問", scale }], { q1: { value: 1.25 } });
    expect(low.ok).toBe(true);
    expect(mid.ok).toBe(true);
    if (!low.ok || !mid.ok) return;
    expect(low.results[0]?.value).toBe(0);
    expect(mid.results[0]?.value).toBe(1);
    const values = [...low.results, ...mid.results].map((r) => r.value);
    expect(values.every((v) => Number.isInteger(v))).toBe(true);
  });

  test("score の範囲外連続値は最近接水準へ飽和する（canonical result は scale 内の離散 level）", () => {
    const normalized = normalize([{ id: "q1", form: "score", prompt: "質問", scale: ["低", "中", "高"] }], { q1: { value: 2.9 } });
    expect(normalized.ok).toBe(true);
    if (!normalized.ok) return;
    expect(normalized.results[0]?.value).toBe(2);
  });

  test("score の正規化不能な値（欠落・非数・非有限）は黙示的な level 0 fallback せず response_invalid で拒否する", () => {
    const scale = ["低", "中", "高"];
    const missing = normalize([{ id: "q1", form: "score", prompt: "質問", scale }], {});
    const notNumber = normalize([{ id: "q1", form: "score", prompt: "質問", scale }], { q1: { value: "高" } });
    const nonFinite = normalize([{ id: "q1", form: "score", prompt: "質問", scale }], { q1: { value: Number.NaN } });
    for (const result of [missing, notNumber, nonFinite]) {
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.kind).toBe("response_invalid");
    }
    if (!missing.ok) expect(missing.detail).toContain("not normalizable");
  });

  test("provider が返した confidence 生値は [0,1] に正規化される", () => {
    const normalized = normalize([{ id: "q1", form: "boolean", prompt: "質問" }], { q1: { value: 0.5 } }, 1.7);
    expect(normalized.ok).toBe(true);
    if (!normalized.ok) return;
    expect(normalized.confidence).toBe(1);
  });

  test("confidence 生値が無い場合は confidence を返さない（確率分布から代替生成しない）", () => {
    const normalized = normalize(
      [
        { id: "q1", form: "boolean", prompt: "質問1" },
        { id: "q2", form: "boolean", prompt: "質問2" },
      ],
      { q1: { value: 0.9 }, q2: { value: 0.7 } },
    );
    expect(normalized.ok).toBe(true);
    if (!normalized.ok) return;
    expect(normalized.confidence).toBeUndefined();
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

  function mockProvider(answers: Record<string, { value: boolean | string | number | undefined }>, overrides: Partial<JevProvider> = {}): JevProvider {
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

  test("score の正規化不能応答は response_invalid として構造化失敗になる（level 0 fallback なし）", async () => {
    const scoreRequest: JevEvaluateRequest = {
      state: "判断状態",
      instructions: "評価指示",
      questions: [{ id: "s1", form: "score", prompt: "水準はどれか", scale: ["低", "中", "高"] }],
    };
    const provider = mockProvider({ s1: { value: undefined } });
    const result = await evaluateWithProvider(scoreRequest, { resolveProvider: () => provider });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.kind).toBe("response_invalid");
  });
});
