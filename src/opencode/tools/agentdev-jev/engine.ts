// agentdev-jev engine（入力検証・結果正規化・失敗の構造化）。
//
// REQ-{NNNN}-{NNN} の Tool 責務（API 呼出し、入出力形式の検証、provider・接続設定の解決、
// 結果・確率分布・確実性の正規化、呼出し失敗の構造化、機械的処理時間の計測）のうち、
// 検証・正規化・構造化を所有する。判断対象の意味、評価基準、Jev を呼ぶべき箇所、
// 最終判断は所有しない（Workflow/Capability Skill の責務）。

import type {
  JevEvaluateRequest,
  JevEvaluateResult,
  JevFailure,
  JevFailureKind,
  JevProbabilityDistribution,
  JevQuestion,
  JevQuestionResult,
} from "./contracts.ts";
import type { JevProvider, JevProviderResponse } from "./provider.ts";

// ---------- 入力検証（公開スキーマより厳密な実行時 validator） ----------

export type ValidationResult = { ok: true } | { ok: false; kind: JevFailureKind; detail: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** 評価リクエストの構造検証。操作の入力定義に存在しないフィールドは副作用発生前に拒否する。 */
export function validateEvaluateRequest(raw: unknown): ValidationResult {
  if (!isRecord(raw)) {
    return { ok: false, kind: "invalid_input", detail: "request must be an object" };
  }
  const allowed = new Set(["state", "instructions", "criteria", "questions"]);
  for (const key of Object.keys(raw)) {
    if (!allowed.has(key)) {
      return { ok: false, kind: "invalid_input", detail: `unknown field: ${key}` };
    }
  }
  if (typeof raw.state !== "string" || raw.state.length === 0) {
    return { ok: false, kind: "invalid_input", detail: "state must be a non-empty string" };
  }
  if (typeof raw.instructions !== "string" || raw.instructions.length === 0) {
    return { ok: false, kind: "invalid_input", detail: "instructions must be a non-empty string" };
  }
  if (raw.criteria !== undefined) {
    if (!Array.isArray(raw.criteria) || raw.criteria.some((c) => typeof c !== "string")) {
      return { ok: false, kind: "invalid_input", detail: "criteria must be an array of strings" };
    }
  }
  if (!Array.isArray(raw.questions) || raw.questions.length === 0) {
    return { ok: false, kind: "invalid_input", detail: "questions must be a non-empty array" };
  }
  const seen = new Set<string>();
  for (const q of raw.questions) {
    const result = validateQuestion(q, seen);
    if (!result.ok) return result;
  }
  return { ok: true };
}

function validateQuestion(raw: unknown, seen: Set<string>): ValidationResult {
  if (!isRecord(raw)) {
    return { ok: false, kind: "invalid_input", detail: "question must be an object" };
  }
  const allowed = new Set(["id", "form", "prompt", "options", "scale"]);
  for (const key of Object.keys(raw)) {
    if (!allowed.has(key)) {
      return { ok: false, kind: "invalid_input", detail: `unknown question field: ${key}` };
    }
  }
  if (typeof raw.id !== "string" || raw.id.length === 0) {
    return { ok: false, kind: "invalid_input", detail: "question id must be a non-empty string" };
  }
  if (seen.has(raw.id)) {
    return { ok: false, kind: "invalid_input", detail: `duplicate question id: ${raw.id}` };
  }
  seen.add(raw.id);
  if (raw.form !== "boolean" && raw.form !== "choice" && raw.form !== "score") {
    return { ok: false, kind: "invalid_input", detail: `question form must be boolean/choice/score: ${String(raw.id)}` };
  }
  if (typeof raw.prompt !== "string" || raw.prompt.length === 0) {
    return { ok: false, kind: "invalid_input", detail: `question prompt must be a non-empty string: ${raw.id}` };
  }
  if (raw.form === "choice") {
    if (
      !Array.isArray(raw.options) ||
      raw.options.length < 2 ||
      raw.options.some((o) => typeof o !== "string" || o.length === 0)
    ) {
      return { ok: false, kind: "invalid_input", detail: `choice question requires 2+ options: ${raw.id}` };
    }
    if (new Set(raw.options).size !== raw.options.length) {
      return { ok: false, kind: "invalid_input", detail: `choice options must be unique: ${raw.id}` };
    }
  }
  if (raw.form === "score") {
    if (
      !Array.isArray(raw.scale) ||
      raw.scale.length < 2 ||
      raw.scale.some((s) => typeof s !== "string" || s.length === 0)
    ) {
      return { ok: false, kind: "invalid_input", detail: `score question requires 2+ ordered levels: ${raw.id}` };
    }
  }
  return { ok: true };
}

/** 観測書込み要求の observation 部分の検証は observation.ts（形式検証）が担う。 */

// ---------- 正規化 ----------

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** 生確率マップを合計1に正規化する（provider の丸め誤差を吸収。全要素が 0 の場合は退化分布へ）。 */
export function normalizeDistribution(raw: Record<string, number>): JevProbabilityDistribution {
  const keys = Object.keys(raw);
  if (keys.length === 0) return {};
  const finite = keys.filter((k) => Number.isFinite(raw[k]));
  if (finite.length === 0) {
    // 決定的な退化分布（最初のキーのみ 1）
    return { [keys[0] as string]: 1 };
  }
  const sum = finite.reduce((acc, k) => acc + clamp01(raw[k] as number), 0);
  const normalized: JevProbabilityDistribution = {};
  for (const k of finite) {
    normalized[k] = sum > 0 ? clamp01(raw[k] as number) / sum : 0;
  }
  if (sum === 0) {
    normalized[finite[0] as string] = 1;
  }
  return normalized;
}

function booleanDistribution(probability: number): JevProbabilityDistribution {
  const p = clamp01(probability);
  return normalizeDistribution({ true: p, false: 1 - p });
}

/** provider 応答をリクエスト順に正規化する（provider 固有の格納差異はこの境界より内側で吸収済み）。 */
export function normalizeProviderResponse(
  request: JevEvaluateRequest,
  response: JevProviderResponse,
): { results: JevQuestionResult[]; confidence?: number } {
  const results: JevQuestionResult[] = [];
  for (const question of request.questions) {
    results.push(normalizeAnswer(question, response.answers[question.id]));
  }
  // confidence は provider が実際に返した場合のみ保存する。確率分布から代替生成しない。
  const confidence =
    response.confidenceRaw !== undefined && Number.isFinite(response.confidenceRaw) ? clamp01(response.confidenceRaw) : undefined;
  return { results, ...(confidence !== undefined ? { confidence } : {}) };
}

function normalizeAnswer(question: JevQuestion, answer: unknown): JevQuestionResult {
  if (question.form === "boolean") {
    // provider 契約: P(true)。選択は決定的導出（0.5 以上を true）。
    const p = answer !== undefined && typeof (answer as { value?: unknown }).value === "number"
      ? (answer as { value: number }).value
      : 0;
    const distribution = booleanDistribution(p);
    return {
      id: question.id,
      form: question.form,
      value: p >= 0.5,
      probabilityDistribution: distribution,
    };
  }
  if (question.form === "choice") {
    const options = question.options ?? [];
    const rawAnswer = (answer ?? {}) as { value?: unknown; probabilities?: Record<string, number> };
    const rawDist: Record<string, number> = {};
    if (rawAnswer.probabilities !== undefined && isRecord(rawAnswer.probabilities)) {
      for (const option of options) {
        const v = (rawAnswer.probabilities as Record<string, unknown>)[option];
        if (typeof v === "number" && Number.isFinite(v)) rawDist[option] = v;
      }
    }
    // 候補外のキーは正規化分布から除外し、欠落候補は 0 で補完する
    for (const option of options) {
      if (!(option in rawDist)) rawDist[option] = 0;
    }
    const distribution = normalizeDistribution(rawDist);
    // 選択値: provider の選択が有効候補なら採用、無い場合は分布の最大確率候補（決定的導出・同点はリクエスト順）
    let chosen = typeof rawAnswer.value === "string" && options.includes(rawAnswer.value) ? rawAnswer.value : null;
    if (chosen === null) {
      let best = -1;
      for (const option of options) {
        const p = distribution[option] ?? 0;
        if (p > best) {
          best = p;
          chosen = option;
        }
      }
    }
    return {
      id: question.id,
      form: question.form,
      value: chosen ?? (options[0] as string),
      probabilityDistribution: distribution,
    };
  }
  // score: value は水準値（0..levels-1 の数値）。分布は水準名へ写像した正規化分布。
  const scale = question.scale ?? [];
  const rawAnswer = (answer ?? {}) as { value?: unknown; probabilities?: Record<string, number> };
  const rawDist: Record<string, number> = {};
  if (rawAnswer.probabilities !== undefined && isRecord(rawAnswer.probabilities)) {
    for (const [k, v] of Object.entries(rawAnswer.probabilities)) {
      const index = Number(k);
      if (typeof v === "number" && Number.isFinite(v) && Number.isInteger(index) && index >= 0 && index < scale.length) {
        rawDist[scale[index] as string] = v;
      }
    }
  }
  for (const level of scale) {
    if (!(level in rawDist)) rawDist[level] = 0;
  }
  const distribution = normalizeDistribution(rawDist);
  const scoreValue = typeof rawAnswer.value === "number" && Number.isFinite(rawAnswer.value)
    ? clamp01(rawAnswer.value / Math.max(1, scale.length - 1)) * (scale.length - 1)
    : 0;
  const bounded = Math.min(scale.length - 1, Math.max(0, scoreValue));
  return {
    id: question.id,
    form: question.form,
    value: bounded,
    probabilityDistribution: distribution,
  };
}

// ---------- 失敗の構造化 ----------

/**
 * provider から throw された生エラーを構造化失敗分類へ決定的に写像する。
 * SDK 固有の型名には依存せず、エラー名・status 系プロパティの汎用走査で分類する。
 */
export function classifyError(error: unknown): JevFailure {
  const name = error instanceof Error ? error.name : "";
  const cause = error instanceof Error ? error.cause : undefined;
  const causeName = cause instanceof Error ? cause.name : "";
  const statusCode = pickStatusCode(error);
  const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);

  if (name === "AbortError" || name === "TimeoutError" || causeName === "AbortError" || causeName === "TimeoutError") {
    return { kind: "timeout", retryable: false, detail };
  }
  if (statusCode === 429 || /rate.?limit/i.test(name)) {
    return { kind: "rate_limited", retryable: false, detail };
  }
  if (statusCode !== null && statusCode >= 500) {
    return { kind: "server_error", retryable: false, detail };
  }
  if (/type.?validation/i.test(name) || /invalid.?response/i.test(name)) {
    return { kind: "response_invalid", retryable: false, detail };
  }
  return { kind: "network_error", retryable: false, detail };
}

function pickStatusCode(error: unknown): number | null {
  if (typeof error !== "object" || error === null) return null;
  const candidates = [error, (error as { cause?: unknown }).cause];
  for (const candidate of candidates) {
    if (typeof candidate !== "object" || candidate === null) continue;
    for (const key of ["statusCode", "status"]) {
      const value = (candidate as Record<string, unknown>)[key];
      if (typeof value === "number" && Number.isFinite(value)) return value;
    }
  }
  return null;
}

/** not_configured（呼出し前判定。Jev API 失敗に含めない）。 */
export function notConfiguredFailure(detail: string): JevFailure {
  return { kind: "not_configured", retryable: false, detail };
}

// ---------- 操作実行 ----------

export type EvaluateDeps = {
  /** provider 解決の注入点（未解決時は not_configured。動的解決を許容）。 */
  resolveProvider: () => JevProvider | null | Promise<JevProvider | null>;
  /** 中断までの上限ミリ秒（timeout は自動 retry しない）。既定: 120000。 */
  timeoutMs?: number;
  now?: () => number;
};

/** 評価リクエストを実行し、正規化済み結果または構造化失敗を返す（自動 retry なし）。 */
export async function evaluateWithProvider(
  request: JevEvaluateRequest,
  deps: EvaluateDeps,
): Promise<JevEvaluateResult> {
  const validation = validateEvaluateRequest(request);
  if (!validation.ok) {
    return { ok: false, failure: { kind: validation.kind, retryable: false, detail: validation.detail } };
  }
  const provider = await deps.resolveProvider();
  if (provider === null) {
    return {
      ok: false,
      failure: notConfiguredFailure(
        "Jev provider is not configured (set AI_GATEWAY_API_KEY). Falling back to the legacy LLM path is the caller's decision.",
      ),
    };
  }
  if (!provider.isConfigured()) {
    return {
      ok: false,
      failure: notConfiguredFailure(`provider ${provider.providerId} reports no usable credential`),
    };
  }
  const startedAt = deps.now ? deps.now() : Date.now();
  const timeoutMs = deps.timeoutMs ?? 120_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await provider.evaluate({
      state: composeState(request),
      questions: request.questions,
      signal: controller.signal,
    });
    const processingMs = (deps.now ? deps.now() : Date.now()) - startedAt;
    const normalized = normalizeProviderResponse(request, response);
    const success: JevEvaluateResult = {
      ok: true,
      operation: "evaluate",
      success: {
        ...(response.resolvedModel !== undefined ? { resolvedModel: response.resolvedModel } : {}),
        ...(response.inputTokens !== undefined ? { inputTokens: response.inputTokens } : {}),
        ...(normalized.confidence !== undefined ? { confidence: normalized.confidence } : {}),
        processingMs,
        results: normalized.results,
      },
    };
    return success;
  } catch (error) {
    return {
      ok: false,
      failure: classifyError(error),
    };
  } finally {
    clearTimeout(timer);
  }
}

/** 評価リクエストの判断入力（state）を構成する。閉じた判断入力であり、repository 全文を含まない。 */
function composeState(request: JevEvaluateRequest): string {
  const parts = [`指示: ${request.instructions}`];
  if (request.criteria !== undefined && request.criteria.length > 0) {
    parts.push(`評価基準:\n${request.criteria.map((c) => `- ${c}`).join("\n")}`);
  }
  parts.push(`状態:\n${request.state}`);
  return parts.join("\n\n");
}
