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
  JevObservationOutcome,
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

/** 観測オブジェクトの形式検証（REQ-{NNNN}-{NNN} 必須項目 + 未知 field 拒否 + outcome 条件付き整合）。 */
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
    const judgmentCheck = validateJudgment(judgment, raw.outcome as JevObservationOutcome);
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

function validateJudgment(raw: unknown, outcome: JevObservationOutcome): { ok: true } | { ok: false; kind: JevFailureKind; detail: string } {
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
  if (raw.llmTreatment !== "unchanged" && raw.llmTreatment !== "corrected") {
    return invalid('llmTreatment must be "unchanged" | "corrected"');
  }
  if (typeof raw.llmFinalJudgment !== "string" || raw.llmFinalJudgment.length === 0) {
    return invalid("llmFinalJudgment must be a non-empty string");
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

/**
 * 観測を 1 ファイルとして書き込む（1 Workflow 実行 = 1 JSON。複数判断は同一 JSON 内 judgments）。
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
  const observationId = deps.generateObservationId ? deps.generateObservationId() : defaultObservationId(deps.now ? deps.now() : new Date());
  const dir = observationsDir(worktree);
  const finalPath = path.join(dir, `${observationId}.json`);
  try {
    await fs.mkdir(dir, { recursive: true });
    const payload = JSON.stringify({ observationId, ...observation }, null, 2) + "\n";
    const tmpPath = path.join(dir, `.${observationId}.tmp`);
    await fs.writeFile(tmpPath, payload, "utf8");
    await fs.rename(tmpPath, finalPath);
    return {
      ok: true,
      operation: "observation_write",
      success: {
        writtenPath: path.relative(worktree, finalPath).split(path.sep).join("/"),
        observationId,
      },
    };
  } catch (error) {
    const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    // 書込み失敗は Workflow の成否と独立。rollback・再実行は行わない。
    return { ok: false, operation: "observation_write", failure: { kind: "network_error", retryable: false, detail: `observation write failed: ${detail}` } };
  }
}
