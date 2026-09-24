// agentdev-jev 観測書込み支援（形式検証・書込み）。
//
// REQ-{NNNN}-{NNN} の書込み支援。.agentdev/jev-observations/ を正式な
// 永続 domain state として 1 Workflow 実行 = 1 JSON で保存する。
// 判断単位の confidence と llmTreatment は独立した一次観測値として保存し、
// 観測時に confidence 閾値を固定しない（分類 field は schema が許容しない）。
// 再構成可能な入力は判断入力全文を保存せず、request digest と参照で保持し、
// 再構成不能な入力のみ最小 input_snapshot を許容する。
// 書込み失敗は構造化失敗として返すが、Workflow の成否とは独立（完了報告で
// 識別可能な warning として扱うのは呼出し元 Workflow の責務）。

import * as crypto from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import type {
  JevFailureKind,
  JevObservation,
  JevObservationJudgment,
  JevObservationOutcome,
  JevObservationRecordState,
  JevObservationWriteResult,
} from "./contracts.ts";

export const JEV_OBSERVATIONS_DIR = path.join(".agentdev", "jev-observations");

/** 観測 JSON の保存先（worktree 相対）。混在防止のため配下への正規状態成果物の書込みは本 tool の対象外。 */
export function observationsDir(worktree: string): string {
  return path.join(worktree, JEV_OBSERVATIONS_DIR);
}

const SHA256_HEX = /^[0-9a-f]{64}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function invalid(detail: string): { ok: false; kind: "invalid_input"; detail: string } {
  return { ok: false, kind: "invalid_input", detail };
}

/** 観測オブジェクトの形式検証（REQ-{NNNN}-{NNN} 必須項目 + 未知 field 拒否 + outcome / recordState 条件付き整合）。 */
export function validateObservation(raw: unknown): { ok: true; observation: JevObservation } | { ok: false; kind: JevFailureKind; detail: string } {
  if (!isRecord(raw)) return invalid("observation must be an object");
  const allowed = new Set([
    "schemaVersion",
    "workflow",
    "judgmentKind",
    "subject",
    "provider",
    "requestedModel",
    "sourceRevision",
    "outcome",
    "durationMs",
    "resolvedModel",
    "inputTokens",
    "inputs",
    "judgments",
    "recordState",
  ]);
  for (const key of Object.keys(raw)) {
    if (!allowed.has(key)) return invalid(`unknown observation field: ${key}`);
  }
  if (raw.schemaVersion !== 1) return invalid("schemaVersion must be 1");
  for (const key of ["workflow", "judgmentKind", "subject", "provider", "requestedModel", "sourceRevision"] as const) {
    if (typeof raw[key] !== "string" || (raw[key] as string).length === 0) {
      return invalid(`${key} must be a non-empty string`);
    }
  }
  if (raw.outcome !== "completed" && raw.outcome !== "not_configured" && raw.outcome !== "jev_failed") {
    return invalid('outcome must be "completed" | "not_configured" | "jev_failed"');
  }
  if (raw.recordState !== undefined && raw.recordState !== "partial" && raw.recordState !== "complete") {
    return invalid('recordState must be "partial" | "complete"');
  }
  const recordState: JevObservationRecordState = raw.recordState ?? "complete";
  if (typeof raw.durationMs !== "number" || !Number.isFinite(raw.durationMs) || raw.durationMs < 0) {
    return invalid("durationMs must be a non-negative finite number");
  }
  if (raw.resolvedModel !== undefined && typeof raw.resolvedModel !== "string") {
    return invalid("resolvedModel must be a string");
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
  if (!Array.isArray(raw.judgments)) return invalid("judgments must be an array");
  for (const judgment of raw.judgments) {
    const judgmentCheck = validateJudgment(judgment, raw.outcome as JevObservationOutcome, recordState);
    if (!judgmentCheck.ok) return judgmentCheck;
  }
  if (raw.outcome === "completed" && (raw.judgments as unknown[]).length === 0) {
    return invalid("outcome completed requires at least one judgment");
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

function validateJudgment(
  raw: unknown,
  outcome: JevObservationOutcome,
  recordState: JevObservationRecordState,
): { ok: true } | { ok: false; kind: JevFailureKind; detail: string } {
  if (!isRecord(raw)) return invalid("judgment must be an object");
  const allowed = new Set([
    "judgmentId",
    "questionForm",
    "jevResult",
    "probabilityDistribution",
    "confidence",
    "failureKind",
    "llmFinalJudgment",
    "llmTreatment",
  ]);
  for (const key of Object.keys(raw)) {
    if (!allowed.has(key)) {
      // 閾値依存の分類結果など、schema 外の field は観測に混入させない
      return invalid(`unknown judgment field: ${key}`);
    }
  }
  if (typeof raw.judgmentId !== "string" || raw.judgmentId.length === 0) {
    return invalid("judgmentId must be a non-empty string");
  }
  if (raw.questionForm !== "boolean" && raw.questionForm !== "choice" && raw.questionForm !== "score") {
    return invalid('questionForm must be "boolean" | "choice" | "score"');
  }
  if (raw.llmTreatment !== undefined && raw.llmTreatment !== "unchanged" && raw.llmTreatment !== "corrected") {
    return invalid('llmTreatment must be "unchanged" | "corrected"');
  }
  if (raw.llmFinalJudgment !== undefined && (typeof raw.llmFinalJudgment !== "string" || raw.llmFinalJudgment.length === 0)) {
    return invalid("llmFinalJudgment must be a non-empty string");
  }
  if (recordState !== "partial") {
    if (raw.llmTreatment === undefined) return invalid(`completed record requires llmTreatment: ${raw.judgmentId}`);
    if (raw.llmFinalJudgment === undefined) return invalid(`completed record requires llmFinalJudgment: ${raw.judgmentId}`);
  }
  if (raw.confidence !== undefined) {
    if (typeof raw.confidence !== "number" || !Number.isFinite(raw.confidence) || raw.confidence < 0 || raw.confidence > 1) {
      return invalid("confidence must be a number in [0,1]");
    }
  }
  if (raw.probabilityDistribution !== undefined) {
    if (!isRecord(raw.probabilityDistribution)) return invalid("probabilityDistribution must be an object");
    for (const [k, v] of Object.entries(raw.probabilityDistribution)) {
      if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 1) {
        return invalid(`probabilityDistribution.${k} must be a number in [0,1]`);
      }
    }
  }
  if (raw.failureKind !== undefined) {
    const kinds = new Set<JevFailureKind>([
      "not_configured",
      "invalid_input",
      "timeout",
      "rate_limited",
      "server_error",
      "network_error",
      "response_invalid",
    ]);
    if (typeof raw.failureKind !== "string" || !kinds.has(raw.failureKind as JevFailureKind)) {
      return invalid("failureKind must be a structured failure kind");
    }
  }
  if (outcome === "completed") {
    if (raw.jevResult === undefined) return invalid(`completed judgment requires jevResult: ${raw.judgmentId}`);
    if (typeof raw.confidence !== "number") return invalid(`completed judgment requires confidence: ${raw.judgmentId}`);
    if (!isRecord(raw.probabilityDistribution)) return invalid(`completed judgment requires probabilityDistribution: ${raw.judgmentId}`);
  }
  if (raw.jevResult !== undefined) {
    const value = raw.jevResult;
    const valid =
      typeof value === "boolean" ||
      typeof value === "number" ||
      (typeof value === "string" && value.length > 0);
    if (!valid) return invalid(`jevResult must be a non-empty string, boolean, or number: ${raw.judgmentId}`);
  }
  return { ok: true };
}

/** 評価リクエスト全文の digest（再構成鍵。全文は保存しない）。 */
export function requestDigest(state: string, instructions: string, criteria: string[] | undefined, questionsJson: string): string {
  const canonical = JSON.stringify({ state, instructions, criteria: criteria ?? [], questions: questionsJson });
  return crypto.createHash("sha256").update(canonical, "utf8").digest("hex");
}

export type ObservationWriteDeps = {
  now?: () => Date;
  /** 観測 ID 生成の注入点（省略時は timestamp + 乱数）。 */
  generateObservationId?: () => string;
};

/** 観測 ID の既定生成規約（実装設計時の自由度。REQ-{NNNN}-{NNN} の意味契約に依存しない）。 */
export function defaultObservationId(now: Date): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const rand = crypto.randomBytes(2).toString("hex");
  return `${stamp}-${rand}`;
}

const OBSERVATION_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/** 外部入力の観測 ID の安全検証（路径構成要素への混入防止。ディレクトリ区切り・拡張子連結を不可とする）。 */
export function isSafeObservationId(value: string): boolean {
  return OBSERVATION_ID_PATTERN.test(value);
}

function invalidWrite(detail: string): { ok: false; operation: "observation_write"; failure: { kind: JevFailureKind; retryable: false; detail: string } } {
  return { ok: false, operation: "observation_write", failure: { kind: "invalid_input", retryable: false, detail } };
}

function writeFailure(error: unknown): { ok: false; operation: "observation_write"; failure: { kind: JevFailureKind; retryable: false; detail: string } } {
  const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  // 書込み失敗は Workflow の成否と独立。rollback・再実行は行わない。
  return { ok: false, operation: "observation_write", failure: { kind: "network_error", retryable: false, detail: `observation write failed: ${detail}` } };
}

function resolveObservationId(deps: ObservationWriteDeps): string {
  return deps.generateObservationId ? deps.generateObservationId() : defaultObservationId(deps.now ? deps.now() : new Date());
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
 * 同一 JSON 内 judgments へ judgmentId 単位で merge する（同一 judgmentId は後勝ち上書き = 冪等。
 * 1実行 1 JSON 契約のため重複 JSON は生成しない）。
 */
function mergeJudgments(existing: unknown[], incoming: JevObservationJudgment[]): JevObservationJudgment[] {
  const byId = new Map<string, JevObservationJudgment>();
  for (const judgment of existing) {
    if (isRecord(judgment) && typeof judgment.judgmentId === "string") {
      byId.set(judgment.judgmentId, judgment as unknown as JevObservationJudgment);
    }
  }
  for (const judgment of incoming) {
    byId.set(judgment.judgmentId, judgment);
  }
  return [...byId.values()];
}

/**
 * evaluate 時点書込み（REQ-090-013）。評価完了時点の部分レコード（recordState partial）を
 * 1実行 1 JSON として作成・永続化する。observationId 指定時は既存 partial JSON 内 judgments へ
 * 追記し、重複 JSON を生成しない。原子的書込み（一時ファイル + rename）。
 */
export async function upsertPartialObservation(
  worktree: string,
  observation: JevObservation,
  deps: ObservationWriteDeps & { observationId?: string } = {},
): Promise<JevObservationWriteResult> {
  const partial: JevObservation = { ...observation, recordState: "partial" };
  const validation = validateObservation(partial);
  if (!validation.ok) {
    return { ok: false, operation: "observation_write", failure: { kind: validation.kind, retryable: false, detail: validation.detail } };
  }
  if (deps.observationId !== undefined && !isSafeObservationId(deps.observationId)) {
    return invalidWrite(`observationId must match ${OBSERVATION_ID_PATTERN.source}`);
  }
  const observationId = deps.observationId ?? resolveObservationId(deps);
  const dir = observationsDir(worktree);
  const finalPath = path.join(dir, `${observationId}.json`);
  try {
    await fs.mkdir(dir, { recursive: true });
    const existing = await readObservationRecord(finalPath);
    if (existing !== null && existing.recordState !== "partial") {
      return invalidWrite(`observation already completed for id: ${observationId}`);
    }
    const record: Record<string, unknown> =
      existing === null
        ? { observationId, ...partial }
        : {
            ...existing,
            ...partial,
            observationId,
            judgments: mergeJudgments(Array.isArray(existing.judgments) ? existing.judgments : [], partial.judgments),
          };
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

/**
 * observation_write 追記完成 mode 入力の検証（REQ-090-013）。LLM 最終判断関連 field のみを運び、
 * run 級 field と Jev 側観測項目は既存部分レコードが保持するため要求しない。
 */
export function validateCompletionObservation(raw: unknown): { ok: true; judgments: JevObservationJudgment[] } | { ok: false; kind: JevFailureKind; detail: string } {
  if (!isRecord(raw)) return invalid("observation must be an object");
  const allowed = new Set(["schemaVersion", "recordState", "judgments"]);
  for (const key of Object.keys(raw)) {
    if (!allowed.has(key)) return invalid(`unknown completion observation field: ${key}`);
  }
  if (raw.schemaVersion !== 1) return invalid("schemaVersion must be 1");
  if (raw.recordState !== undefined && raw.recordState !== "complete") {
    return invalid('completion observation requires recordState "complete" (or omitted)');
  }
  if (!Array.isArray(raw.judgments) || raw.judgments.length === 0) return invalid("completion observation requires at least one judgment");
  for (const judgment of raw.judgments) {
    if (!isRecord(judgment)) return invalid("judgment must be an object");
    const judgmentAllowed = new Set(["judgmentId", "questionForm", "llmFinalJudgment", "llmTreatment"]);
    for (const key of Object.keys(judgment)) {
      if (!judgmentAllowed.has(key)) return invalid(`unknown completion judgment field: ${key}`);
    }
    if (typeof judgment.judgmentId !== "string" || judgment.judgmentId.length === 0) {
      return invalid("judgmentId must be a non-empty string");
    }
    if (typeof judgment.llmFinalJudgment !== "string" || judgment.llmFinalJudgment.length === 0) {
      return invalid(`llmFinalJudgment must be a non-empty string: ${judgment.judgmentId}`);
    }
    if (judgment.llmTreatment !== "unchanged" && judgment.llmTreatment !== "corrected") {
      return invalid(`llmTreatment must be "unchanged" | "corrected": ${judgment.judgmentId}`);
    }
  }
  return { ok: true, judgments: raw.judgments as unknown as JevObservationJudgment[] };
}

/**
 * observation_write の追記完成 mode（REQ-090-013）。evaluate 時点部分レコードの同一 JSON へ
 * LLM 最終判断関連 field（llmFinalJudgment、llmTreatment）を judgmentId 単位で追記し、
 * 完了状態 field を complete へ更新する（追記は冪等・重複 JSON は生成しない）。
 * run 級 field と Jev 側観測項目は既存部分レコードの値を保持する。
 */
export async function completeObservation(
  worktree: string,
  observationId: string,
  judgments: JevObservationJudgment[],
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
    const existingJudgments = Array.isArray(existing.judgments) ? existing.judgments : [];
    const merged = mergeLlmFields(existingJudgments, judgments);
    const record: Record<string, unknown> = { ...existing, judgments: merged, recordState: "complete" };
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

/** LLM 最終判断関連 field のみを judgmentId 単位で追記する（他の field は既存値を保持。二重追記で同一結果 = 冪等）。 */
function mergeLlmFields(existing: unknown[], incoming: JevObservationJudgment[]): JevObservationJudgment[] {
  const llmById = new Map<string, JevObservationJudgment>();
  for (const judgment of incoming) {
    llmById.set(judgment.judgmentId, judgment);
  }
  const merged: JevObservationJudgment[] = [];
  const seen = new Set<string>();
  for (const judgment of existing) {
    if (isRecord(judgment) && typeof judgment.judgmentId === "string") {
      seen.add(judgment.judgmentId);
      const incomingJudgment = llmById.get(judgment.judgmentId);
      merged.push(
        incomingJudgment === undefined
          ? (judgment as unknown as JevObservationJudgment)
          : {
              ...(judgment as unknown as JevObservationJudgment),
              ...(incomingJudgment.llmFinalJudgment !== undefined ? { llmFinalJudgment: incomingJudgment.llmFinalJudgment } : {}),
              ...(incomingJudgment.llmTreatment !== undefined ? { llmTreatment: incomingJudgment.llmTreatment } : {}),
            },
      );
    }
  }
  for (const judgment of incoming) {
    if (!seen.has(judgment.judgmentId)) merged.push(judgment);
  }
  return merged;
}

/**
 * 観測を 1 ファイルとして書き込む（1 Workflow 実行 = 1 JSON。複数判断は同一 JSON 内 judgments）。
 * observation_write は完成書込みのみを担う（REQ-090-013）。recordState partial の直接書込みは拒否し、
 * evaluate の時点書込み（upsertPartialObservation）経由でのみ部分レコードを作成する。
 * 原子的書込み（一時ファイル + rename）で正規状態破損を避ける。JSONL は生成しない。
 */
export async function writeObservation(
  worktree: string,
  observation: JevObservation,
  deps: ObservationWriteDeps = {},
): Promise<JevObservationWriteResult> {
  const validation = validateObservation(observation);
  if (!validation.ok) {
    return { ok: false, operation: "observation_write", failure: { kind: validation.kind, retryable: false, detail: validation.detail } };
  }
  if (observation.recordState === "partial") {
    return invalidWrite("observation_write is the completion write only; partial records are written by evaluate (REQ-090-013)");
  }
  const observationId = resolveObservationId(deps);
  const dir = observationsDir(worktree);
  const finalPath = path.join(dir, `${observationId}.json`);
  try {
    await fs.mkdir(dir, { recursive: true });
    const record: Record<string, unknown> = { observationId, ...observation, recordState: observation.recordState ?? "complete" };
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
