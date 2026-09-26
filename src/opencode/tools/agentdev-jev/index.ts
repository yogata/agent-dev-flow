// agentdev-jev Custom Tool 本体（Jev 先行評価の公開入口）。
//
// 操作契約の正: docs/designs/responsibilities/custom-tool-contracts.md「Jev 先行評価」節。
// 操作カタログ:
//   - evaluate: Jev 先行評価の実行（provider・SDK 非依存の公開契約。API 呼出し、
//     入出力形式の検証、provider・接続設定の解決、結果・確率分布・confidence の
//     正規化、失敗の構造化、機械的処理時間の計測）。evaluator 成功後・呼出元 Workflow が
//     reasoning model へ進む前に当該評価の観測（1 semantic evaluation = 1 observation）を
//     .agentdev/jev-observations/ へ永続化し、永続化失敗は評価結果と独立した warning（fail-open）。
//     実際の呼出し開始後の失敗は失敗観測を永続化する。未設定・入力検証失敗では観測を生成しない
//   - observation_write: evaluator 成功観測の同一 JSON へ reasoning model の最終判断結果
//     （final result）を追記する（evaluator 返却結果と異なる場合のみ差異理由分類を保持）
//
// provider 実装（初期 Vercel adapter）は配布依存境界を守るため動的解決する
// （adapter パッケージが存在しない環境では not_configured として構造化失敗を返し、
// 呼出し元 Workflow は従来 LLM 経路のみで継続できる）。自動 retry は行わない。

import type {
  JevEvaluateRequest,
  JevEvaluateResult,
  JevFailure,
  JevObservation,
  JevObservationFailureKind,
  JevObservationMetadata,
  JevObservationPersistOutcome,
  JevObservationResult,
  JevObservationWriteResult,
  JevQuestion,
} from "./contracts.ts";
import { evaluateWithProvider } from "./engine.ts";
import type { EvaluateDeps } from "./engine.ts";
import type { JevProvider } from "./provider.ts";
import {
  appendFinalResult,
  requestDigest,
  validateFinalResultObservation,
  writeEvaluationObservation,
} from "./observation.ts";
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
      "probability distributions, provider-returned confidence when present (evaluation-level only), inputTokens when " +
      "available, machine processing time, and structured failure classification (not_configured when " +
      "AI_GATEWAY_API_KEY is unset). No auto-retry on API failure. Evaluation language is Japanese. After an " +
      "evaluator success (before the calling workflow proceeds to the reasoning model) one observation per semantic " +
      "evaluation (one JSON) is persisted under .agentdev/jev-observations/; a call failure after the call started " +
      "persists a failure observation with its classification and minimal diagnostic. not_configured and input " +
      "validation failures generate no observation. A persistence failure stays an independent warning on the " +
      "evaluation result (fail-open, no rollback or regeneration).",
  },
  {
    operation: "observation_write",
    sideEffect: true,
    summary:
      "Append the reasoning model's final judgment (final result) to an evaluator-success observation under " +
      ".agentdev/jev-observations/, keyed by observationId. The append input carries only the final-judgment fields " +
      "(schemaVersion, finalResult.results with questionId/value/differenceReason). The tool verifies one-to-one " +
      "correspondence with the evaluator results and records a difference reason (evaluation_input_defect | " +
      "semantic_disagreement | deterministic_override | unknown) only when the final judgment differs from the " +
      "evaluator result. Appends are idempotent (no duplicate JSON) and are rejected for failure observations, " +
      "missing observations, and observations written under a different schema version. The append is independent " +
      "of workflow success.",
  },
];

/** 操作要求の実行時検証（observation_write）。evaluate の検証は engine が副作用発生前に実施する。 */
type OperationDispatch =
  | { operation: "evaluate"; request: JevEvaluateRequest; observationMetadata: unknown }
  | { operation: "observation_write"; observation: unknown; observationId: string | undefined }
  | { operation: null; failure: JevFailure };

type MetadataValidation = { ok: true } | { ok: false; detail: string };

/** 観測永続化 metadata の検証（副作用発生前の事前検証。workflow・評価種別は観測の一意識別に必須）。 */
function validateObservationMetadata(raw: unknown): MetadataValidation {
  if (raw === undefined) {
    return { ok: false, detail: "observationMetadata is required (workflow, evaluationKind, subject, sourceRevision)" };
  }
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, detail: "observationMetadata must be an object" };
  }
  const record = raw as Record<string, unknown>;
  const allowed = new Set(["workflow", "evaluationKind", "subject", "sourceRevision", "references", "snapshot"]);
  for (const key of Object.keys(record)) {
    if (!allowed.has(key)) return { ok: false, detail: `unknown observationMetadata field: ${key}` };
  }
  for (const key of ["workflow", "evaluationKind", "subject", "sourceRevision"] as const) {
    const value = record[key];
    if (typeof value !== "string" || value.length === 0) {
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
    if (typeof record.observationId !== "string" || record.observationId.length === 0) {
      return { operation: null, failure: { kind: "invalid_input", retryable: false, detail: "observation_write requires the observationId written by evaluate" } };
    }
    return { operation: "observation_write", observation: record.observation, observationId: record.observationId };
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

/** 評価リクエスト全文の digest（inputs.requestDigest。全文は保存しない）。 */
function evaluationRequestDigest(request: JevEvaluateRequest): string {
  return requestDigest(request.state, request.instructions, request.criteria, JSON.stringify(request.questions ?? []));
}

/** metadata を観測永続化の識別 metadata へ解決する（dispatch の事前検証済み。型はここで確定させる）。 */
function resolveMetadata(raw: unknown): JevObservationMetadata {
  const record = raw as Record<string, unknown>;
  const metadata: JevObservationMetadata = {
    workflow: record.workflow as string,
    evaluationKind: record.evaluationKind as string,
    subject: record.subject as string,
    sourceRevision: record.sourceRevision as string,
  };
  if (Array.isArray(record.references)) metadata.references = record.references as NonNullable<JevObservationMetadata["references"]>;
  if (typeof record.snapshot === "string") metadata.snapshot = record.snapshot;
  return metadata;
}

/** 質問ごとの evaluator 返却結果を観測 results へ写像する（questionId で評価入力と1対1対応）。 */
function observationResults(request: JevEvaluateRequest, success: Extract<JevEvaluateResult, { ok: true }>["success"]): JevObservationResult[] {
  const forms = new Map(request.questions.map((q: JevQuestion) => [q.id, q.form]));
  return success.results.map((questionResult) => ({
    questionId: questionResult.id,
    questionForm: forms.get(questionResult.id) ?? questionResult.form,
    value: questionResult.value,
    probabilityDistribution: questionResult.probabilityDistribution,
  }));
}

/** evaluate の成功結果から観測（evaluator 成功観測）を構成する。 */
function buildSuccessObservation(
  request: JevEvaluateRequest,
  metadata: JevObservationMetadata,
  success: Extract<JevEvaluateResult, { ok: true }>["success"],
): JevObservation {
  const inputs: JevObservation["inputs"] = { requestDigest: evaluationRequestDigest(request) };
  if (metadata.references !== undefined) inputs.references = metadata.references;
  if (metadata.snapshot !== undefined) inputs.snapshot = metadata.snapshot;
  // provider が解決した model ID は非導出の identity 差異としてのみ保持する（provider・model 構成値は
  // source revision から導出可能なため必須保存しない）。
  const identity = success.resolvedModel !== undefined ? { resolvedModel: success.resolvedModel } : undefined;
  return {
    schemaVersion: 2,
    observationId: "",
    workflow: metadata.workflow,
    evaluationKind: metadata.evaluationKind,
    subject: metadata.subject,
    sourceRevision: metadata.sourceRevision,
    durationMs: success.processingMs,
    ...(success.inputTokens !== undefined ? { inputTokens: success.inputTokens } : {}),
    inputs,
    ...(identity !== undefined ? { identity } : {}),
    results: observationResults(request, success),
    ...(success.confidence !== undefined ? { confidence: success.confidence } : {}),
  };
}

/** 呼出し開始後の失敗から失敗観測を構成する（失敗分類と最小 diagnostic、実測の呼出し時間を保持）。 */
function buildFailureObservation(
  request: JevEvaluateRequest,
  metadata: JevObservationMetadata,
  failureKind: JevObservationFailureKind,
  failureDetail: string,
  durationMs: number,
): JevObservation {
  const inputs: JevObservation["inputs"] = { requestDigest: evaluationRequestDigest(request) };
  if (metadata.references !== undefined) inputs.references = metadata.references;
  if (metadata.snapshot !== undefined) inputs.snapshot = metadata.snapshot;
  return {
    schemaVersion: 2,
    observationId: "",
    workflow: metadata.workflow,
    evaluationKind: metadata.evaluationKind,
    subject: metadata.subject,
    sourceRevision: metadata.sourceRevision,
    durationMs,
    inputs,
    failure: { kind: failureKind, detail: failureDetail },
  };
}

/** 観測永続化の結果を JevObservationPersistOutcome（成功 / warning）へ写像する。 */
async function persistObservation(
  worktree: string,
  observation: JevObservation,
  deps: ObservationWriteDeps,
): Promise<JevObservationPersistOutcome> {
  const result = await writeEvaluationObservation(worktree, observation, deps);
  if (result.ok) {
    return { observationId: result.success.observationId, writtenPath: result.success.writtenPath };
  }
  // evaluate 内部の永続化失敗は評価結果の返却と独立した warning（fail-open。評価結果は失わない）。
  return { warning: `observation write failed: ${result.failure.kind}: ${result.failure.detail}` };
}

/** 評価結果（成功・呼出し後失敗）に観測永続化を付与して返す。未設定・入力検証失敗は観測を生成しない。 */
async function attachObservation(
  worktree: string,
  request: JevEvaluateRequest,
  metadata: JevObservationMetadata,
  result: JevEvaluateResult,
  elapsedMs: number,
  deps: ObservationWriteDeps,
): Promise<JevOperationResult> {
  if (result.ok) {
    const observation = buildSuccessObservation(request, metadata, result.success);
    const persisted = await persistObservation(worktree, observation, deps);
    return { ...result, success: { ...result.success, observation: persisted } };
  }
  const failure = result.failure;
  if (failure.kind === "invalid_input" || failure.kind === "not_configured") {
    // 観測対象外: 入力検証失敗（評価未実施）と未設定（呼出し前判定）では観測を生成しない。
    return result;
  }
  const observation = buildFailureObservation(request, metadata, failure.kind, failure.detail, elapsedMs);
  const persisted = await persistObservation(worktree, observation, deps);
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
    const metadata = resolveMetadata(dispatchResult.observationMetadata);
    return attachObservation(worktree, dispatchResult.request, metadata, result, elapsedMs, writeDeps);
  }
  const completion = validateFinalResultObservation(dispatchResult.observation);
  if (!completion.ok) {
    return { ok: false, failure: { kind: completion.kind, retryable: false, detail: completion.detail } };
  }
  return appendFinalResult(worktree, dispatchResult.observationId as string, completion.finalResult);
}

export { validateEvaluateRequest, notConfiguredFailure } from "./engine.ts";
export { defaultObservationId, isSafeObservationId, requestDigest, sameCanonicalValue, validateFinalResultObservation, validateObservation } from "./observation.ts";
