// agentdev-jev Custom Tool 本体（Jev 先行評価の公開入口）。
//
// 操作契約の正: docs/designs/responsibilities/custom-tool-contracts.md「Jev 先行評価」節。
// 操作カタログ:
//   - evaluate: Jev 先行評価の実行（provider・SDK 非依存の公開契約。API 呼出し、
//     入出力形式の検証、provider・接続設定の解決、結果・確率分布・confidence の
//     正規化、失敗の構造化、機械的処理時間の計測）
//   - observation_write: 観測 JSON の形式検証と書込み（REQ-{NNNN}-{NNN}）
//
// provider 実装（初期 Vercel adapter）は配布依存境界を守るため動的解決する
// （adapter パッケージが存在しない環境では not_configured として構造化失敗を返し、
// 呼出し元 Workflow は従来 LLM 経路へ即座に fallback する）。自動 retry は行わない。

import type {
  JevEvaluateRequest,
  JevEvaluateResult,
  JevFailure,
  JevObservationWriteResult,
} from "./contracts.ts";
import { evaluateWithProvider } from "./engine.ts";
import type { EvaluateDeps } from "./engine.ts";
import type { JevProvider } from "./provider.ts";
import { validateObservation, writeObservation } from "./observation.ts";
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
      "structured failure classification (not_configured when AI_GATEWAY_API_KEY is unset). No auto-retry on API failure.",
  },
  {
    operation: "observation_write",
    sideEffect: true,
    summary:
      "Validate and write one observation JSON (one Workflow run = one JSON) under .agentdev/jev-observations/. " +
      "Per-judgment confidence and llmTreatment are stored as independent primary observations; no confidence-threshold " +
      "classification is admitted. Reconstructable inputs are stored as request digest plus references, not full text.",
  },
];

/** 操作要求の実行時検証（observation_write）。evaluate の検証は engine が副作用発生前に実施する。 */
type OperationDispatch =
  | { operation: "evaluate"; request: JevEvaluateRequest }
  | { operation: "observation_write"; observation: unknown }
  | { operation: null; failure: JevFailure };

function dispatch(raw: unknown): OperationDispatch {
  if (typeof raw !== "object" || raw === null) {
    return { operation: null, failure: { kind: "invalid_input", retryable: false, detail: "request must be an object" } };
  }
  const record = raw as Record<string, unknown>;
  const keys = Object.keys(record);
  const allowed = new Set(["operation", "state", "instructions", "criteria", "questions", "observation"]);
  for (const key of keys) {
    if (!allowed.has(key)) {
      return { operation: null, failure: { kind: "invalid_input", retryable: false, detail: `unknown field: ${key}` } };
    }
  }
  if (record.operation === "evaluate") {
    const { operation: _operation, ...evaluationRequest } = record;
    return { operation: "evaluate", request: evaluationRequest as JevEvaluateRequest };
  }
  if (record.operation === "observation_write") {
    if (!("observation" in record)) {
      return { operation: null, failure: { kind: "invalid_input", retryable: false, detail: "observation_write requires an observation field" } };
    }
    return { operation: "observation_write", observation: record.observation };
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
    return evaluateWithProvider(dispatchResult.request, evaluateDeps);
  }
  const validation = validateObservation(dispatchResult.observation);
  if (!validation.ok) {
    return { ok: false, failure: { kind: validation.kind, retryable: false, detail: validation.detail } };
  }
  const writeDeps: ObservationWriteDeps = {
    ...(deps.now !== undefined ? { now: deps.now } : {}),
    ...(deps.generateObservationId !== undefined ? { generateObservationId: deps.generateObservationId } : {}),
  };
  return writeObservation(worktree, validation.observation, writeDeps);
}

export { validateEvaluateRequest, notConfiguredFailure } from "./engine.ts";
export { validateObservation } from "./observation.ts";
