// agentdev-jev Custom Tool 本体（Jev 先行評価の公開入口）。
//
// 操作契約の正: docs/designs/responsibilities/custom-tool-contracts.md「Jev 先行評価」節。
// 操作カタログ:
//   - evaluate: Jev 先行評価の実行（provider・SDK 非依存の公開契約。API 呼出し、
//     入出力形式の検証、provider・接続設定の解決、結果・確率分布・confidence の
//     正規化、失敗の構造化、機械的処理時間の計測）。評価完了（not_configured を
//     含む）時点で Jev 側観測項目を含む部分レコード（recordState partial）を
//     .agentdev/jev-observations/ へ書込み、書込み失敗は評価結果と独立した warning（REQ-090-013）
//   - observation_write: 観測 JSON の形式検証と書込み（REQ-{NNNN}-{NNN}）。
//     observationId 付きは evaluate 時点部分レコードの同一 JSON への追記完成 mode
//
// provider 実装（初期 Vercel adapter）は配布依存境界を守るため動的解決する
// （adapter パッケージが存在しない環境では not_configured として構造化失敗を返し、
// 呼出し元 Workflow は従来 LLM 経路へ即座に fallback する）。自動 retry は行わない。

import type {
  JevEvaluateRequest,
  JevEvaluateResult,
  JevFailure,
  JevFailureKind,
  JevObservation,
  JevObservationJudgment,
  JevObservationMetadata,
  JevObservationPersistOutcome,
  JevObservationWriteResult,
  JevQuestion,
} from "./contracts.ts";
import { evaluateWithProvider } from "./engine.ts";
import type { EvaluateDeps } from "./engine.ts";
import type { JevProvider } from "./provider.ts";
import { requestDigest, upsertPartialObservation, validateCompletionObservation, validateObservation, completeObservation, writeObservation } from "./observation.ts";
import type { ObservationWriteDeps } from "./observation.ts";

export type * from "./contracts.ts";
export type * from "./provider.ts";

/** 公開操作カタログ（契約テストで固定）。 */
export const AGENTDEV_JEV_PUBLIC_CONTRACTS: ReadonlyArray<{
  operation: "evaluate" | "observation_write";
  sideEffect: boolean;
  summary: string;
}> = [
  {
    operation: "evaluate",
    sideEffect: true,
    summary:
      "Jev prior evaluation over a closed judgment input. Provider/SDK-independent contract: per-question results, " +
      "probability distributions, normalized confidence, inputTokens when available, machine processing time, and " +
      "structured failure classification (not_configured when AI_GATEWAY_API_KEY is unset). No auto-retry on API failure. " +
      "At evaluation completion (including not_configured) a partial observation record (recordState partial, per-question " +
      "Jev result / distribution / confidence / failureKind) is persisted under .agentdev/jev-observations/ (one run = one " +
      "JSON via optional observationMetadata); a persistence failure stays an independent warning on the evaluation result.",
  },
  {
    operation: "observation_write",
    sideEffect: true,
    summary:
      "Validate and write one observation JSON (one Workflow run = one JSON) under .agentdev/jev-observations/. " +
      "With observationId: completion write mode whose accepted input is append-only (llmFinalJudgment, llmTreatment) " +
      "— per-judgment LLM final-judgment fields appended to the same JSON written by evaluate, marking it complete " +
      "(idempotent, no duplicate JSON). Run-level fields (workflow, provider, outcome, durationMs, inputs, etc.) and " +
      "Jev-side observation fields are already recorded in the evaluate-time partial record and are NOT re-accepted " +
      "in the completion input. Without observationId: legacy write of a completed observation as a new file (full " +
      "record shape). Per-judgment confidence and llmTreatment are stored as independent primary observations; no " +
      "confidence-threshold classification is admitted.",
  },
];

/** 操作要求の実行時検証（observation_write）。evaluate の検証は engine が副作用発生前に実施する。 */
type OperationDispatch =
  | { operation: "evaluate"; request: JevEvaluateRequest; observationMetadata: unknown }
  | { operation: "observation_write"; observation: unknown; observationId: string | undefined }
  | { operation: null; failure: JevFailure };

type MetadataValidation = { ok: true } | { ok: false; detail: string };

/** evaluate 時点部分レコードの metadata 検証（副作用発生前の事前検証。詳細検証は部分レコード検証が担う）。 */
function validateObservationMetadata(raw: unknown): MetadataValidation {
  if (raw === undefined) return { ok: true };
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, detail: "observationMetadata must be an object" };
  }
  const record = raw as Record<string, unknown>;
  const allowed = new Set(["workflow", "judgmentKind", "subject", "sourceRevision", "observationId", "references", "snapshot"]);
  for (const key of Object.keys(record)) {
    if (!allowed.has(key)) return { ok: false, detail: `unknown observationMetadata field: ${key}` };
  }
  for (const key of ["workflow", "judgmentKind", "subject", "sourceRevision", "observationId"] as const) {
    const value = record[key];
    if (value !== undefined && (typeof value !== "string" || value.length === 0)) {
      return { ok: false, detail: `observationMetadata.${key} must be a non-empty string` };
    }
  }
  if (record.references !== undefined && !Array.isArray(record.references)) {
    return { ok: false, detail: "observationMetadata.references must be an array" };
  }
  if (record.snapshot !== undefined && typeof record.snapshot !== "string") {
    return { ok: false, detail: "observationMetadata.snapshot must be a string" };
  }
  return { ok: true };
}

function dispatch(raw: unknown): OperationDispatch {
  if (typeof raw !== "object" || raw === null) {
    return { operation: null, failure: { kind: "invalid_input", retryable: false, detail: "request must be an object" } };
  }
  const record = raw as Record<string, unknown>;
  const keys = Object.keys(record);
  const allowed = new Set(["operation", "state", "instructions", "criteria", "questions", "observation", "observationId", "observationMetadata"]);
  for (const key of keys) {
    if (!allowed.has(key)) {
      return { operation: null, failure: { kind: "invalid_input", retryable: false, detail: `unknown field: ${key}` } };
    }
  }
  if (record.operation === "evaluate") {
    if ("observationId" in record) {
      return { operation: null, failure: { kind: "invalid_input", retryable: false, detail: "observationId is only valid for observation_write" } };
    }
    const metadataCheck = validateObservationMetadata(record.observationMetadata);
    if (!metadataCheck.ok) {
      return { operation: null, failure: { kind: "invalid_input", retryable: false, detail: metadataCheck.detail } };
    }
    const { operation: _operation, observationMetadata, ...evaluationRequest } = record;
    return { operation: "evaluate", request: evaluationRequest as JevEvaluateRequest, observationMetadata };
  }
  if (record.operation === "observation_write") {
    if (!("observation" in record)) {
      return { operation: null, failure: { kind: "invalid_input", retryable: false, detail: "observation_write requires an observation field" } };
    }
    const observationId = record.observationId;
    if (observationId !== undefined && typeof observationId !== "string") {
      return { operation: null, failure: { kind: "invalid_input", retryable: false, detail: "observationId must be a string" } };
    }
    return { operation: "observation_write", observation: record.observation, observationId };
  }
  return {
    operation: null,
    failure: { kind: "invalid_input", retryable: false, detail: 'operation must be "evaluate" or "observation_write"' },
  };
}

export type AgentdevJevToolDeps = {
  /** provider 解決の注入点（テストは偽実装を差し込める）。省略時は Vercel adapter を動的解決する。 */
  resolveProvider?: () => JevProvider | null;
  timeoutMs?: number;
  now?: () => number;
};

/** 既定 provider 解決（動的 import により adapter パッケージへ依存境界を閉じる）。 */
async function defaultResolveProvider(): Promise<JevProvider | null> {
  try {
    const adapterUrl = new URL("./adapter-vercel/index.ts", import.meta.url);
    const mod = (await import(adapterUrl.href)) as {
      createVercelJevProvider?: () => JevProvider;
    };
    if (typeof mod.createVercelJevProvider !== "function") return null;
    return mod.createVercelJevProvider();
  } catch {
    return null;
  }
}

export type JevOperationResult = JevEvaluateResult | JevObservationWriteResult | { ok: false; failure: JevFailure };

/** 評価リクエスト全文の digest（部分レコード inputs.requestDigest。全文は保存しない）。 */
function evaluationRequestDigest(request: JevEvaluateRequest): string {
  return requestDigest(request.state, request.instructions, request.criteria, JSON.stringify(request.questions ?? []));
}

/** metadata を部分レコードの run 級 field へ解決する（非提供 field は "unspecified"）。 */
function resolveMetadata(raw: unknown): JevObservationMetadata {
  if (typeof raw !== "object" || raw === null) return {};
  const record = raw as Record<string, unknown>;
  const metadata: JevObservationMetadata = {};
  for (const key of ["workflow", "judgmentKind", "subject", "sourceRevision", "observationId"] as const) {
    const value = record[key];
    if (typeof value === "string") metadata[key] = value;
  }
  if (Array.isArray(record.references)) metadata.references = record.references as NonNullable<JevObservationMetadata["references"]>;
  if (typeof record.snapshot === "string") metadata.snapshot = record.snapshot;
  return metadata;
}

/** 質問ごとの失敗分類 judgment（評価未達成の質問に対する Jev 側観測項目）。 */
function failureJudgments(questions: JevQuestion[], failureKind: JevFailureKind): JevObservationJudgment[] {
  return questions.map((question) => ({
    judgmentId: question.id,
    questionForm: question.form,
    failureKind,
  }));
}

/** 評価結果 payload から recordState partial の部分レコードを構成する（REQ-090-013 時点書込み）。 */
function buildPartialObservation(
  request: JevEvaluateRequest,
  metadata: JevObservationMetadata,
  payload: {
    outcome: JevObservation["outcome"];
    provider: string;
    requestedModel: string;
    durationMs: number;
    resolvedModel?: string;
    inputTokens?: number;
    confidence?: number;
    judgments: JevObservationJudgment[];
  },
): JevObservation {
  const inputs: JevObservation["inputs"] = { requestDigest: evaluationRequestDigest(request) };
  if (metadata.references !== undefined) inputs.references = metadata.references;
  if (metadata.snapshot !== undefined) inputs.snapshot = metadata.snapshot;
  return {
    schemaVersion: 1,
    workflow: metadata.workflow ?? "unspecified",
    judgmentKind: metadata.judgmentKind ?? "unspecified",
    subject: metadata.subject ?? "unspecified",
    provider: payload.provider,
    requestedModel: payload.requestedModel,
    sourceRevision: metadata.sourceRevision ?? "unspecified",
    outcome: payload.outcome,
    durationMs: payload.durationMs,
    ...(payload.resolvedModel !== undefined ? { resolvedModel: payload.resolvedModel } : {}),
    ...(payload.inputTokens !== undefined ? { inputTokens: payload.inputTokens } : {}),
    inputs,
    judgments: payload.judgments,
    recordState: "partial",
  };
}

/** evaluate 時点書込みの結果を JevObservationPersistOutcome（成功 / warning）へ写像する。 */
async function persistPartial(
  worktree: string,
  observation: JevObservation,
  observationId: string | undefined,
  deps: ObservationWriteDeps,
): Promise<JevObservationPersistOutcome> {
  const result = await upsertPartialObservation(worktree, observation, {
    ...deps,
    ...(observationId !== undefined ? { observationId } : {}),
  });
  if (result.ok) {
    return { observationId: result.success.observationId, writtenPath: result.success.writtenPath, recordState: "partial" };
  }
  // evaluate 内部の書込み失敗は評価結果の返却と独立した warning（REQ-090-013。評価結果は失わない）。
  return { warning: `partial observation write failed: ${result.failure.kind}: ${result.failure.detail}` };
}

/** 評価結果（成功・not_configured・API 失敗）に evaluate 時点書込みを付与して返す。 */
async function attachPartialObservation(
  worktree: string,
  request: JevEvaluateRequest,
  rawMetadata: unknown,
  result: JevEvaluateResult,
  elapsedMs: number,
  deps: ObservationWriteDeps,
): Promise<JevOperationResult> {
  if (result.ok) {
    const success = result.success;
    const observation = buildPartialObservation(request, resolveMetadata(rawMetadata), {
      outcome: "completed",
      provider: success.provider,
      requestedModel: success.requestedModel,
      durationMs: success.processingMs,
      ...(success.resolvedModel !== undefined ? { resolvedModel: success.resolvedModel } : {}),
      ...(success.inputTokens !== undefined ? { inputTokens: success.inputTokens } : {}),
      confidence: success.confidence,
      judgments: success.results.map((questionResult) => ({
        judgmentId: questionResult.id,
        questionForm: questionResult.form,
        jevResult: questionResult.value,
        probabilityDistribution: questionResult.probabilityDistribution,
        ...(success.confidence !== undefined ? { confidence: success.confidence } : {}),
      })),
    });
    const persisted = await persistPartial(worktree, observation, resolveMetadata(rawMetadata).observationId, deps);
    return { ...result, success: { ...success, observation: persisted } };
  }
  const failure = result.failure;
  if (failure.kind === "invalid_input") {
    // 評価未実施（入力検証違反）のため部分レコードは作成しない。
    return result;
  }
  const metadata = resolveMetadata(rawMetadata);
  const questions = Array.isArray(request.questions) ? request.questions : [];
  const observation = buildPartialObservation(request, metadata, {
    outcome: failure.kind === "not_configured" ? "not_configured" : "jev_failed",
    provider: result.provider ?? "unknown",
    requestedModel: result.requestedModel ?? "unknown",
    durationMs: failure.kind === "not_configured" ? 0 : elapsedMs,
    judgments: failureJudgments(questions, failure.kind),
  });
  const persisted = await persistPartial(worktree, observation, metadata.observationId, deps);
  return { ...result, observation: persisted };
}

/** 操作要求を実行する（Tool 公開入口）。失敗時も例外を投げず構造化失敗を返す。 */
export async function runAgentdevJevOperation(
  worktree: string,
  raw: unknown,
  deps: AgentdevJevToolDeps & ObservationWriteDeps = {},
): Promise<JevOperationResult> {
  const dispatchResult = dispatch(raw);
  if (dispatchResult.operation === null) {
    return { ok: false, failure: dispatchResult.failure };
  }
  if (dispatchResult.operation === "evaluate") {
    const evaluateDeps: EvaluateDeps = {
      resolveProvider: deps.resolveProvider ?? defaultResolveProvider,
      ...(deps.timeoutMs !== undefined ? { timeoutMs: deps.timeoutMs } : {}),
      ...(deps.now !== undefined ? { now: deps.now } : {}),
    };
    const writeDeps: ObservationWriteDeps = {
      ...(deps.now !== undefined ? { now: deps.now } : {}),
      ...(deps.generateObservationId !== undefined ? { generateObservationId: deps.generateObservationId } : {}),
    };
    const startedAt = deps.now ? deps.now() : Date.now();
    const result = await evaluateWithProvider(dispatchResult.request, evaluateDeps);
    const elapsedMs = (deps.now ? deps.now() : Date.now()) - startedAt;
    return attachPartialObservation(worktree, dispatchResult.request, dispatchResult.observationMetadata, result, elapsedMs, writeDeps);
  }
  const writeDeps: ObservationWriteDeps = {
    ...(deps.now !== undefined ? { now: deps.now } : {}),
    ...(deps.generateObservationId !== undefined ? { generateObservationId: deps.generateObservationId } : {}),
  };
  if (dispatchResult.observationId !== undefined) {
    const completion = validateCompletionObservation(dispatchResult.observation);
    if (!completion.ok) {
      return { ok: false, failure: { kind: completion.kind, retryable: false, detail: completion.detail } };
    }
    return completeObservation(worktree, dispatchResult.observationId, completion.judgments);
  }
  const validation = validateObservation(dispatchResult.observation);
  if (!validation.ok) {
    return { ok: false, failure: { kind: validation.kind, retryable: false, detail: validation.detail } };
  }
  return writeObservation(worktree, validation.observation, writeDeps);
}

export { validateEvaluateRequest, notConfiguredFailure } from "./engine.ts";
export { defaultObservationId, isSafeObservationId, requestDigest, validateObservation } from "./observation.ts";
