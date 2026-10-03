// 取りまとめ経路の agentdev_gh 呼出側における更新失敗回復・読み戻し規律の決定的実装。
// 部分成功（コメントのみ成功、本文のみ成功、Epic のみ未反映）の区別、読み戻し突合による
// 不足分特定、冪等キーによる重複投稿・重複実行防止、更新回復用ローカル記録の境界検証を
// 純関数として所有する。正本要件は docs/requirements/REQ-101.md（要件行レベルの対応は
// repository top-level の traceability/ sidecar が正であり、本ファイルへ concrete ID を
// 直書きしない）。GitHub I/O は runner.ts のアダプタ注入で行い、本モジュールは純関数に限定する。

import { createHash } from "node:crypto";

// ---------- 型 ----------

export type ReflectKind = "issue-body" | "issue-comment" | "epic-table";

export interface ReflectOperation {
  /** 操作単位の識別子（冪等キー）。同一対象・同一内容の再試行は同キーになる */
  key: string;
  kind: ReflectKind;
  /** 対象 Issue 番号（kind=epic-table の場合は Epic Issue 番号） */
  issueNumber: number;
  /** 反映予定の全文（issue-body / epic-table は本文全文、issue-comment はコメント全文） */
  content: string;
}

export interface ReflectPlan {
  ops: ReflectOperation[];
}

export interface ReflectReadback {
  /** Issue 番号 → 読み戻した本文 */
  bodies: Record<number, string>;
  /** Issue 番号 → 読み戻したコメント列 */
  comments: Record<number, string[]>;
  /** Epic Issue 番号 → 読み戻した本文 */
  epicBodies: Record<number, string>;
}

export type ReflectOutcome = "confirmed" | "unconfirmed";

export interface OperationResult {
  key: string;
  kind: ReflectKind;
  issueNumber: number;
  outcome: ReflectOutcome;
  /** 冪等キー突合で既存反映（重複）を検出した場合に true。再試行対象から除外する */
  duplicate?: boolean;
}

export interface ReflectRecoveryRecord {
  schemaVersion: 1;
  recordType: "adf-reflect-recovery";
  ops: {
    key: string;
    kind: ReflectKind;
    issueNumber: number;
    content: string;
  }[];
}

export interface ReconciliationReport {
  /** complete = 全操作が読み戻しで確認済み。partial = 未反映・重複を含み成功扱いにしない。none = 対象 0 件 */
  status: "complete" | "partial" | "none";
  confirmed: OperationResult[];
  /** 未反映。読み戻し後の不足分再試行の対象 */
  pending: OperationResult[];
  /** 重複検出。再試行せず報告対象とする */
  duplicates: OperationResult[];
  /** 更新回復用ローカル記録（未反映内容と識別情報のみ）。未反映 0 件なら null */
  recoveryRecord: ReflectRecoveryRecord | null;
}

// ---------- 冪等キーと識別署名 ----------

const KIND_SHORT: Record<ReflectKind, string> = {
  "issue-body": "body",
  "issue-comment": "cmnt",
  "epic-table": "epic",
};

/** 操作単位の冪等キーを生成する。対象・種別・反映内容から決定的に導出する */
export function reflectKey(op: Pick<ReflectOperation, "kind" | "issueNumber" | "content">): string {
  const hash = createHash("sha256").update(op.content, "utf8").digest("hex").slice(0, 12);
  return `r-${KIND_SHORT[op.kind]}-${op.issueNumber}-${hash}`;
}

/** コメント反映に埋め込む識別署名。GitHub 上では HTML コメントとして表示されず、読み戻し突合の判定キーになる */
export function reflectSignature(key: string): string {
  return `<!-- adf-reflect:${key} -->`;
}

/** 識別署名を先頭に埋め込んだコメント本文を構成する */
export function signedComment(op: ReflectOperation): string {
  return `${reflectSignature(op.key)}\n${op.content}`;
}

// ---------- 部分成功の区別 ----------

/** 操作結果集合から全体状態を分類する。1 つでも unconfirmed があれば部分成功として成功扱いにしない */
export function classifyOutcome(
  results: OperationResult[],
): { status: ReconciliationReport["status"] } {
  if (results.length === 0) return { status: "none" };
  if (results.every((r) => r.outcome === "confirmed")) return { status: "complete" };
  return { status: "partial" };
}

// ---------- 読み戻し突合 ----------

function normalizeTail(value: string): string {
  return value.replace(/\s+$/u, "");
}

function readOpMatch(
  op: ReflectOperation,
  readback: ReflectReadback,
): { confirmed: boolean; duplicate: boolean } {
  switch (op.kind) {
    case "issue-body": {
      const read = readback.bodies[op.issueNumber];
      // GitHub 側が本文を正規化しない前提。末尾の空白差異のみ等価とみなす
      return { confirmed: read !== undefined && normalizeTail(read) === normalizeTail(op.content), duplicate: false };
    }
    case "issue-comment": {
      const list = readback.comments[op.issueNumber] ?? [];
      const sig = reflectSignature(op.key);
      const hits = list.filter((c) => c.includes(sig)).length;
      if (hits === 0) return { confirmed: false, duplicate: false };
      // 1 件なら反映済み（再試行すると重複投稿になる）。2 件以上は重複投稿が既に発生
      return { confirmed: true, duplicate: hits > 1 };
    }
    case "epic-table": {
      const read = readback.epicBodies[op.issueNumber];
      return { confirmed: read !== undefined && normalizeTail(read) === normalizeTail(op.content), duplicate: false };
    }
  }
}

/**
 * 反映計画と読み戻し結果を突合し、反映済み・未反映・重複を確定する。
 * 未反映（pending）が 1 つでもあれば status は partial となり、成功扱いにならない。
 * 重複（duplicates）が検出された場合も重複投稿が既に発生している状態として
 * 成功扱いにせず、再試行対象から除外して重複投稿・重複実行の拡大を防止する。
 */
export function reconcileAgainstReadback(
  plan: ReflectPlan,
  readback: ReflectReadback,
): ReconciliationReport {
  const confirmed: OperationResult[] = [];
  const pending: OperationResult[] = [];
  const duplicates: OperationResult[] = [];

  for (const op of plan.ops) {
    const match = readOpMatch(op, readback);
    if (match.duplicate) {
      duplicates.push({ key: op.key, kind: op.kind, issueNumber: op.issueNumber, outcome: "confirmed", duplicate: true });
      continue;
    }
    if (match.confirmed) {
      confirmed.push({ key: op.key, kind: op.kind, issueNumber: op.issueNumber, outcome: "confirmed" });
    } else {
      pending.push({ key: op.key, kind: op.kind, issueNumber: op.issueNumber, outcome: "unconfirmed" });
    }
  }

  const status = duplicates.length > 0
    ? "partial"
    : classifyOutcome([...confirmed, ...pending]).status;
  return {
    status,
    confirmed,
    pending,
    duplicates,
    recoveryRecord: buildRecoveryRecord(pending, plan),
  };
}

// ---------- 更新回復用ローカル記録 ----------

/**
 * 未反映分の回復用ローカル記録を生成する。記録は未反映内容と識別情報に限定され、
 * 第二の作業定義・恒久状態源ではない（正は GitHub 側の読み戻し）。
 */
export function buildRecoveryRecord(
  pending: OperationResult[],
  plan: ReflectPlan,
): ReflectRecoveryRecord | null {
  if (pending.length === 0) return null;
  const byKey = new Map(plan.ops.map((o) => [o.key, o] as const));
  return {
    schemaVersion: 1,
    recordType: "adf-reflect-recovery",
    ops: pending.map((p) => {
      const op = byKey.get(p.key);
      if (!op) throw new Error(`回復記録の構成対象が反映計画に存在しない: ${p.key}`);
      return { key: op.key, kind: op.kind, issueNumber: op.issueNumber, content: op.content };
    }),
  };
}

const RECORD_ALLOWED_FIELDS = new Set(["schemaVersion", "recordType", "ops"]);
const RECORD_OP_ALLOWED_FIELDS = new Set(["key", "kind", "issueNumber", "content"]);
const RECORD_KINDS: readonly ReflectKind[] = ["issue-body", "issue-comment", "epic-table"];

/**
 * 回復用ローカル記録の境界検証。未反映内容と識別情報以外（作業定義、完了判定、
 * 進行状態等の恒久状態源語彙）を含む記録を fail-closed で拒否する。
 * 保存済み記録の読み込み時にも呼び出して、記録の境界逸脱を検出する。
 */
export function assertRecoveryRecordBound(value: unknown): asserts value is ReflectRecoveryRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("回復記録はオブジェクトである必要がある");
  }
  const record = value as Record<string, unknown>;
  for (const field of Object.keys(record)) {
    if (!RECORD_ALLOWED_FIELDS.has(field)) {
      throw new Error(`回復記録に許可外フィールドが含まれる（未反映内容と識別情報に限定）: ${field}`);
    }
  }
  if (record.schemaVersion !== 1) {
    throw new Error(`回復記録の schemaVersion が不正: ${String(record.schemaVersion)}`);
  }
  if (record.recordType !== "adf-reflect-recovery") {
    throw new Error(`回復記録の recordType が不正: ${String(record.recordType)}`);
  }
  if (!Array.isArray(record.ops)) {
    throw new Error("回復記録の ops は配列である必要がある");
  }
  for (const raw of record.ops) {
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
      throw new Error("回復記録の ops 要素はオブジェクトである必要がある");
    }
    const op = raw as Record<string, unknown>;
    for (const field of Object.keys(op)) {
      if (!RECORD_OP_ALLOWED_FIELDS.has(field)) {
        throw new Error(`回復記録の ops 要素に許可外フィールドが含まれる: ${field}`);
      }
    }
    if (typeof op.key !== "string" || op.key.length === 0) {
      throw new Error("回復記録の ops 要素の key は空でない文字列である必要がある");
    }
    if (typeof op.kind !== "string" || !RECORD_KINDS.includes(op.kind as ReflectKind)) {
      throw new Error(`回復記録の ops 要素の kind が不正: ${String(op.kind)}`);
    }
    if (!Number.isInteger(op.issueNumber) || (op.issueNumber as number) <= 0) {
      throw new Error(`回復記録の ops 要素の issueNumber が不正: ${String(op.issueNumber)}`);
    }
    if (typeof op.content !== "string") {
      throw new Error("回復記録の ops 要素の content は文字列である必要がある");
    }
  }
}

/** 保存済み回復記録を反映計画へ復元する（中断・担当交代後の再開経路で使用する） */
export function planFromRecoveryRecord(record: ReflectRecoveryRecord): ReflectPlan {
  assertRecoveryRecordBound(record);
  return { ops: record.ops.map((op) => ({ ...op })) };
}

// ---------- 失敗分類（進捗表示と稼働処理の分離） ----------

export type FailureSurface = "progress-display" | "operational";

export interface FailureClassification {
  /** 稼働処理を強制終了するか。進捗表示失敗では true にしない */
  haltOperational: boolean;
  /** 未反映の重要条件に基づく新作業開始を許可するか。読み戻し突合で不足回復を確認するまで常時 false */
  allowNewWorkOnUnreflected: false;
}

/**
 * 失敗の表面を分類する。進捗表示の失敗だけで稼働中の処理を強制終了しない。
 * 一方で未反映の重要条件に基づく新作業開始は常に不許可（読み戻し突合での回復確認を要する）。
 */
export function classifyFailure(surface: FailureSurface): FailureClassification {
  return {
    haltOperational: surface !== "progress-display",
    allowNewWorkOnUnreflected: false,
  };
}
