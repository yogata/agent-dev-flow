// agentdev-jev 観測書込み支援（形式検証・書込み・final result 反映）。
//
// .agentdev/jev-observations/ を正式な永続 domain state として 1 semantic evaluation = 1 observation
// で保存する。観測は一次事実のみを保存する: evaluator 返却結果と候補別確率分布、provider が実際に
// 返した confidence（evaluation 単位のみ）、入力再構成情報、reasoning model の最終判断結果と
// 差異理由分類（evaluator 成功観測に限定）、呼出し時間、input token 数（provider 返却時のみ）、
// 失敗分類と最小 diagnostic（実際の呼出し開始後の失敗のみ）。質問単位の confidence 複製や
// 確率分布からの代替 confidence 生成は schema が許容しない。
// 再構成可能な入力は判断入力全文を保存せず、request digest と参照で保持し、再構成不能な入力のみ
// 最小 input snapshot を許容する。
// 書込み失敗は構造化失敗として返すが、Workflow の成否とは独立（fail-open。rollback・再実行・
// 擬似再生成は行わない。完了報告で識別可能な warning として扱うのは呼出し元 Workflow の責務）。

import * as crypto from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import type {
  JevDifferenceReason,
  JevFailureKind,
  JevFinalResultItem,
  JevObservation,
  JevObservationFailureKind,
  JevObservationResult,
  JevObservationWriteResult,
  JevQuestionForm,
} from "./contracts.ts";

export const JEV_OBSERVATIONS_DIR = path.join(".agentdev", "jev-observations");

/** 観測 JSON の保存先（worktree 相対）。配下への他の正規状態成果物の書込みは本 tool の対象外。 */
export function observationsDir(worktree: string): string {
  return path.join(worktree, JEV_OBSERVATIONS_DIR);
}

const SHA256_HEX = /^[0-9a-f]{64}$/;
const QUESTION_FORMS = new Set<JevQuestionForm>(["boolean", "choice", "score"]);
const OBSERVATION_FAILURE_KINDS = new Set<JevObservationFailureKind>([
  "timeout",
  "rate_limited",
  "server_error",
  "network_error",
  "response_invalid",
]);
const DIFFERENCE_REASONS = new Set<JevDifferenceReason>([
  "evaluation_input_defect",
  "semantic_disagreement",
  "deterministic_override",
  "unknown",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function invalid(detail: string): { ok: false; kind: JevFailureKind; detail: string } {
  return { ok: false, kind: "invalid_input", detail };
}

function isObservationValue(value: unknown): value is boolean | string | number {
  return typeof value === "boolean" || typeof value === "number" || (typeof value === "string" && value.length > 0);
}

/** 評価リクエスト全文の digest（再構成鍵。全文は保存しない）。 */
export function requestDigest(state: string, instructions: string, criteria: string[] | undefined, questionsJson: string): string {
  const canonical = JSON.stringify({ state, instructions, criteria: criteria ?? [], questions: questionsJson });
  return crypto.createHash("sha256").update(canonical, "utf8").digest("hex");
}

export type ObservationWriteDeps = {
  /** 現在時刻（ミリ秒）。観測 ID 生成の基準（省略時は Date.now）。 */
  now?: () => number;
  /** 観測 ID 生成の注入点（省略時は timestamp + 乱数）。 */
  generateObservationId?: () => string;
};

/** 観測 ID の既定生成規約（物理表現は実装設計の自由度。意味契約に依存しない）。 */
export function defaultObservationId(now: Date): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const rand = crypto.randomBytes(2).toString("hex");
  return `${stamp}-${rand}`;
}

const OBSERVATION_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/** 外部入力の観測 ID の安全検証（パス構成要素への混入防止。ディレクトリ区切り・拡張子連結を不可とする）。 */
export function isSafeObservationId(value: string): boolean {
  return OBSERVATION_ID_PATTERN.test(value);
}

/** 観測オブジェクトの形式検証（必須一次事実 + 未知 field 拒否 + results / failure の排他必須）。 */
export function validateObservation(raw: unknown): { ok: true; observation: JevObservation } | { ok: false; kind: JevFailureKind; detail: string } {
  if (!isRecord(raw)) return invalid("observation must be an object");
  const allowed = new Set([
    "schemaVersion",
    "observationId",
    "workflow",
    "evaluationKind",
    "subject",
    "sourceRevision",
    "durationMs",
    "inputTokens",
    "inputs",
    "identity",
    "results",
    "confidence",
    "failure",
    "finalResult",
  ]);
  for (const key of Object.keys(raw)) {
    if (!allowed.has(key)) return invalid(`unknown observation field: ${key}`);
  }
  // schemaVersion 1 は履歴観測であり、新契約の現行観測として受理しない。
  if (raw.schemaVersion !== 2) return invalid("schemaVersion must be 2");
  for (const key of ["observationId", "workflow", "evaluationKind", "subject", "sourceRevision"] as const) {
    if (typeof raw[key] !== "string" || (raw[key] as string).length === 0) {
      return invalid(`${key} must be a non-empty string`);
    }
  }
  if (!isSafeObservationId(raw.observationId as string)) {
    return invalid(`observationId must match ${OBSERVATION_ID_PATTERN.source}`);
  }
  if (typeof raw.durationMs !== "number" || !Number.isFinite(raw.durationMs) || raw.durationMs < 0) {
    return invalid("durationMs must be a non-negative finite number");
  }
  if (raw.inputTokens !== undefined && (typeof raw.inputTokens !== "number" || !Number.isFinite(raw.inputTokens))) {
    return invalid("inputTokens must be a finite number");
  }
  if (!isRecord(raw.inputs)) return invalid("inputs must be an object");
  const inputsAllowed = new Set(["requestDigest", "references", "snapshot"]);
  for (const key of Object.keys(raw.inputs)) {
    if (!inputsAllowed.has(key)) return invalid(`unknown inputs field: ${key}`);
  }
  if (typeof raw.inputs.requestDigest !== "string" || !SHA256_HEX.test(raw.inputs.requestDigest)) {
    return invalid("inputs.requestDigest must be a sha256 hex digest (64 lowercase hex chars)");
  }
  if (raw.inputs.references !== undefined) {
    if (!Array.isArray(raw.inputs.references)) return invalid("inputs.references must be an array");
    for (const ref of raw.inputs.references) {
      const refCheck = validateReference(ref);
      if (!refCheck.ok) return refCheck;
    }
  }
  if (raw.inputs.snapshot !== undefined && typeof raw.inputs.snapshot !== "string") {
    return invalid("inputs.snapshot must be a string (minimal input snapshot for non-reconstructable inputs only)");
  }
  if (raw.identity !== undefined) {
    const identityCheck = validateIdentity(raw.identity);
    if (!identityCheck.ok) return identityCheck;
  }
  const hasResults = raw.results !== undefined;
  const hasFailure = raw.failure !== undefined;
  if (hasResults === hasFailure) {
    return invalid("exactly one of results (evaluator success) or failure (call failure) must be present");
  }
  if (hasResults) {
    if (!Array.isArray(raw.results) || raw.results.length === 0) return invalid("results must be a non-empty array");
    const seen = new Set<string>();
    for (const result of raw.results) {
      const resultCheck = validateObservationResult(result, seen);
      if (!resultCheck.ok) return resultCheck;
    }
    if (raw.confidence !== undefined) {
      if (typeof raw.confidence !== "number" || !Number.isFinite(raw.confidence) || raw.confidence < 0 || raw.confidence > 1) {
        return invalid("confidence must be a number in [0,1]");
      }
    }
    if (raw.finalResult !== undefined) {
      const finalCheck = validateFinalResult(raw.finalResult, raw.results as JevObservationResult[]);
      if (!finalCheck.ok) return finalCheck;
    }
  } else {
    if (raw.confidence !== undefined) return invalid("confidence requires evaluator results");
    if (raw.finalResult !== undefined) return invalid("finalResult requires evaluator results");
    if (!isRecord(raw.failure)) return invalid("failure must be an object");
    const failureAllowed = new Set(["kind", "detail"]);
    for (const key of Object.keys(raw.failure)) {
      if (!failureAllowed.has(key)) return invalid(`unknown failure field: ${key}`);
    }
    if (typeof raw.failure.kind !== "string" || !OBSERVATION_FAILURE_KINDS.has(raw.failure.kind as JevObservationFailureKind)) {
      return invalid("failure.kind must be a call-failure classification (timeout | rate_limited | server_error | network_error | response_invalid)");
    }
    if (typeof raw.failure.detail !== "string" || raw.failure.detail.length === 0) {
      return invalid("failure.detail must be a non-empty string (minimal diagnostic)");
    }
  }
  return { ok: true, observation: raw as unknown as JevObservation };
}

function validateReference(raw: unknown): { ok: true } | { ok: false; kind: JevFailureKind; detail: string } {
  if (!isRecord(raw)) return invalid("input reference must be an object");
  const allowed = new Set(["label", "path", "digest"]);
  for (const key of Object.keys(raw)) {
    if (!allowed.has(key)) return invalid(`unknown input reference field: ${key}`);
  }
  for (const key of ["label", "path"] as const) {
    if (typeof raw[key] !== "string" || (raw[key] as string).length === 0) {
      return invalid(`input reference ${key} must be a non-empty string`);
    }
  }
  if (typeof raw.digest !== "string" || !SHA256_HEX.test(raw.digest)) {
    return invalid("input reference digest must be a sha256 hex digest (64 lowercase hex chars)");
  }
  return { ok: true };
}

function validateIdentity(raw: unknown): { ok: true } | { ok: false; kind: JevFailureKind; detail: string } {
  if (!isRecord(raw)) return invalid("identity must be an object");
  const allowed = new Set(["resolvedModel"]);
  for (const key of Object.keys(raw)) {
    if (!allowed.has(key)) return invalid(`unknown identity field: ${key}`);
  }
  if (raw.resolvedModel !== undefined && (typeof raw.resolvedModel !== "string" || raw.resolvedModel.length === 0)) {
    return invalid("identity.resolvedModel must be a non-empty string");
  }
  return { ok: true };
}

function validateObservationResult(raw: unknown, seen: Set<string>): { ok: true } | { ok: false; kind: JevFailureKind; detail: string } {
  if (!isRecord(raw)) return invalid("result must be an object");
  const allowed = new Set(["questionId", "questionForm", "value", "probabilityDistribution"]);
  for (const key of Object.keys(raw)) {
    if (!allowed.has(key)) return invalid(`unknown result field: ${key}`);
  }
  if (typeof raw.questionId !== "string" || raw.questionId.length === 0) {
    return invalid("questionId must be a non-empty string");
  }
  if (seen.has(raw.questionId)) return invalid(`duplicate questionId: ${raw.questionId}`);
  seen.add(raw.questionId);
  if (typeof raw.questionForm !== "string" || !QUESTION_FORMS.has(raw.questionForm as JevQuestionForm)) {
    return invalid('questionForm must be "boolean" | "choice" | "score"');
  }
  if (!isObservationValue(raw.value)) return invalid(`value must be a non-empty string, boolean, or number: ${raw.questionId}`);
  if (!isRecord(raw.probabilityDistribution)) return invalid(`probabilityDistribution must be an object: ${raw.questionId}`);
  for (const [k, v] of Object.entries(raw.probabilityDistribution)) {
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 1) {
      return invalid(`probabilityDistribution.${k} must be a number in [0,1]: ${raw.questionId}`);
    }
  }
  return { ok: true };
}

/** evaluator 返却結果と最終判断の canonical result 比較（同型同値で一致）。 */
export function sameCanonicalValue(a: boolean | string | number, b: boolean | string | number): boolean {
  return a === b;
}

function validateFinalResult(raw: unknown, results: JevObservationResult[]): { ok: true; finalResult: { results: JevFinalResultItem[] } } | { ok: false; kind: JevFailureKind; detail: string } {
  if (!isRecord(raw)) return invalid("finalResult must be an object");
  const allowed = new Set(["results"]);
  for (const key of Object.keys(raw)) {
    if (!allowed.has(key)) return invalid(`unknown finalResult field: ${key}`);
  }
  if (!Array.isArray(raw.results) || raw.results.length === 0) return invalid("finalResult.results must be a non-empty array");
  const byQuestionId = new Map(results.map((r) => [r.questionId, r]));
  const seen = new Set<string>();
  for (const item of raw.results) {
    if (!isRecord(item)) return invalid("finalResult result must be an object");
    const itemAllowed = new Set(["questionId", "value", "differenceReason"]);
    for (const key of Object.keys(item)) {
      if (!itemAllowed.has(key)) return invalid(`unknown finalResult result field: ${key}`);
    }
    if (typeof item.questionId !== "string" || item.questionId.length === 0) {
      return invalid("finalResult questionId must be a non-empty string");
    }
    if (seen.has(item.questionId)) return invalid(`duplicate finalResult questionId: ${item.questionId}`);
    seen.add(item.questionId);
    const evaluatorResult = byQuestionId.get(item.questionId);
    if (evaluatorResult === undefined) {
      return invalid(`finalResult questionId does not match any evaluator result: ${item.questionId}`);
    }
    if (!isObservationValue(item.value)) return invalid(`finalResult value must be a non-empty string, boolean, or number: ${item.questionId}`);
    const differs = !sameCanonicalValue(evaluatorResult.value, item.value as boolean | string | number);
    if (item.differenceReason !== undefined) {
      if (!differs) {
        return invalid(`differenceReason requires a difference from the evaluator result: ${item.questionId}`);
      }
      if (typeof item.differenceReason !== "string" || !DIFFERENCE_REASONS.has(item.differenceReason as JevDifferenceReason)) {
        return invalid(`differenceReason must be one of evaluation_input_defect | semantic_disagreement | deterministic_override | unknown: ${item.questionId}`);
      }
    }
  }
  if (seen.size !== results.length) {
    return invalid("finalResult must correspond one-to-one with the evaluator results (missing questions)");
  }
  return { ok: true, finalResult: raw as { results: JevFinalResultItem[] } };
}

/** observation_write（final result 反映）の入力検証（reasoning model 最終判断結果のみを運ぶ追記入力）。 */
export function validateFinalResultObservation(raw: unknown): { ok: true; finalResult: { results: JevFinalResultItem[] } } | { ok: false; kind: JevFailureKind; detail: string } {
  if (!isRecord(raw)) return invalid("observation must be an object");
  const allowed = new Set(["schemaVersion", "finalResult"]);
  for (const key of Object.keys(raw)) {
    if (!allowed.has(key)) return invalid(`unknown observation field: ${key}`);
  }
  if (raw.schemaVersion !== 2) return invalid("schemaVersion must be 2");
  if (raw.finalResult === undefined) return invalid("observation requires a finalResult");
  return validateFinalResultShape(raw.finalResult);
}

/** 呼出し元の追記入力の形状検証（既存観測との1対1対応と差異整合は appendFinalResult が実観測と突合して行う）。 */
function validateFinalResultShape(raw: unknown): { ok: true; finalResult: { results: JevFinalResultItem[] } } | { ok: false; kind: JevFailureKind; detail: string } {
  if (!isRecord(raw)) return invalid("finalResult must be an object");
  const allowed = new Set(["results"]);
  for (const key of Object.keys(raw)) {
    if (!allowed.has(key)) return invalid(`unknown finalResult field: ${key}`);
  }
  if (!Array.isArray(raw.results) || raw.results.length === 0) return invalid("finalResult.results must be a non-empty array");
  const seen = new Set<string>();
  for (const item of raw.results) {
    if (!isRecord(item)) return invalid("finalResult result must be an object");
    const itemAllowed = new Set(["questionId", "value", "differenceReason"]);
    for (const key of Object.keys(item)) {
      if (!itemAllowed.has(key)) return invalid(`unknown finalResult result field: ${key}`);
    }
    if (typeof item.questionId !== "string" || item.questionId.length === 0) {
      return invalid("finalResult questionId must be a non-empty string");
    }
    if (seen.has(item.questionId)) return invalid(`duplicate finalResult questionId: ${item.questionId}`);
    seen.add(item.questionId);
    if (!isObservationValue(item.value)) return invalid(`finalResult value must be a non-empty string, boolean, or number: ${item.questionId}`);
    if (item.differenceReason !== undefined) {
      if (typeof item.differenceReason !== "string" || !DIFFERENCE_REASONS.has(item.differenceReason as JevDifferenceReason)) {
        return invalid(`differenceReason must be one of evaluation_input_defect | semantic_disagreement | deterministic_override | unknown: ${item.questionId}`);
      }
    }
  }
  return { ok: true, finalResult: raw as { results: JevFinalResultItem[] } };
}

function invalidWrite(detail: string): JevObservationWriteResult {
  return { ok: false, operation: "observation_write", failure: { kind: "invalid_input", retryable: false, detail } };
}

function writeFailure(error: unknown): JevObservationWriteResult {
  const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  // 書込み失敗は Workflow の成否と独立（fail-open）。rollback・再実行は行わない。
  return { ok: false, operation: "observation_write", failure: { kind: "network_error", retryable: false, detail: `observation write failed: ${detail}` } };
}

function resolveObservationId(deps: ObservationWriteDeps): string {
  return deps.generateObservationId ? deps.generateObservationId() : defaultObservationId(new Date(deps.now ? deps.now() : Date.now()));
}

async function writeAtomic(dir: string, observationId: string, record: Record<string, unknown>): Promise<void> {
  const finalPath = path.join(dir, `${observationId}.json`);
  const payload = JSON.stringify(record, null, 2) + "\n";
  const tmpPath = path.join(dir, `.${observationId}.tmp`);
  await fs.writeFile(tmpPath, payload, "utf8");
  await fs.rename(tmpPath, finalPath);
}

async function readObservationRecord(finalPath: string): Promise<Record<string, unknown> | null> {
  let raw: string;
  try {
    raw = await fs.readFile(finalPath, "utf8");
  } catch {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * 観測を 1 ファイルとして書き込む（1 semantic evaluation = 1 observation）。
 * evaluate 内部（evaluator 成功後・呼出元 Workflow が reasoning model へ進む前）から呼び出される
 * 時点書込みである。observationId は常にここで生成し、呼出し元による観測 ID 指定・JSON 集約入力は
 * 存在しない。原子的書込み（一時ファイル + rename）で正規状態破損を避ける。JSONL は生成しない。
 */
export async function writeEvaluationObservation(
  worktree: string,
  observation: JevObservation,
  deps: ObservationWriteDeps = {},
): Promise<JevObservationWriteResult> {
  const observationId = resolveObservationId(deps);
  const record: Record<string, unknown> = { ...observation, observationId };
  const validation = validateObservation(record);
  if (!validation.ok) {
    return { ok: false, operation: "observation_write", failure: { kind: validation.kind, retryable: false, detail: validation.detail } };
  }
  const dir = observationsDir(worktree);
  try {
    await fs.mkdir(dir, { recursive: true });
    await writeAtomic(dir, observationId, record);
    return {
      ok: true,
      operation: "observation_write",
      success: {
        writtenPath: path.relative(worktree, path.join(dir, `${observationId}.json`)).split(path.sep).join("/"),
        observationId,
      },
    };
  } catch (error) {
    return writeFailure(error);
  }
}

/**
 * observation_write の実体: evaluator 成功観測の同一 JSON へ reasoning model の最終判断結果を
 * 追記する（追記は冪等・重複 JSON は生成しない）。失敗観測への追記は拒否する（最終判断結果は
 * evaluator 成功観測に限定して保持する）。現行契約以外の観測（履歴観測を含む）は受理しない。
 */
export async function appendFinalResult(
  worktree: string,
  observationId: string,
  finalResult: { results: JevFinalResultItem[] },
): Promise<JevObservationWriteResult> {
  if (!isSafeObservationId(observationId)) {
    return invalidWrite(`observationId must match ${OBSERVATION_ID_PATTERN.source}`);
  }
  const dir = observationsDir(worktree);
  const finalPath = path.join(dir, `${observationId}.json`);
  try {
    const existing = await readObservationRecord(finalPath);
    if (existing === null) {
      return invalidWrite(`observation not found for id: ${observationId}`);
    }
    const validation = validateObservation(existing);
    if (!validation.ok) {
      return invalidWrite(`existing observation is not a current-contract observation: ${validation.detail}`);
    }
    const observation = validation.observation;
    if (observation.results === undefined) {
      return invalidWrite("finalResult can only be appended to an evaluator-success observation");
    }
    const finalCheck = validateFinalResult(finalResult, observation.results);
    if (!finalCheck.ok) {
      return { ok: false, operation: "observation_write", failure: { kind: finalCheck.kind, retryable: false, detail: finalCheck.detail } };
    }
    const record: Record<string, unknown> = { ...existing, finalResult: finalCheck.finalResult };
    await writeAtomic(dir, observationId, record);
    return {
      ok: true,
      operation: "observation_write",
      success: {
        writtenPath: path.relative(worktree, finalPath).split(path.sep).join("/"),
        observationId,
      },
    };
  } catch (error) {
    return writeFailure(error);
  }
}
