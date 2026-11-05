//
// 検証用一時資材の台帳回収・終了判定記録回収の実行面。
// 様式の正は 検証用一時資材のライフサイクル Design「台帳（生成記録）」節・
// 「証跡の保存と読み戻し」節・「削除確認」節・「照合（close時）と全終了経路」節:
// - 台帳（追跡記録）自体も終了時の回収対象とし、保存すべき最終記録は本体
//   Issue/PR へ収束させる（収束材料を返す。材料の記載は呼出側の既存チャネルで行う）
// - 終了判定記録（.agentdev/close-acceptance/）もローカル実行環境状態として
//   終了後に回収する。回収タイミングは終了判定に基づく終了操作の完了後
//   （Tool 境界検証が読み取る必要がある期間は保持する。完了申告なしの回収要求は
//   保持として返し削除しない）
// - 個別エントリの回収記録と台帳回収は、削除確認フローの確認成立と接続する
//   境界（ReclamationConfirmation）を必須とし、確認対象と台帳記録の識別照合が
//   成立しない回収を行わない
// - 正式な成果物（テストコード、テストデータ等）は回収対象に含めない
//   （回収は台帳ファイルと指定された判定記録ファイルに限定する）
//

import {
  readLedger,
  resolveLedgerPath,
  serializeLedger,
  type LedgerIo,
  type VerificationResourceEntry,
} from "./verification-resources-ledger";

/** 回収の確認成立申告（削除確認フローとの接続境界）。 */
export interface ReclamationConfirmation {
  /** 確認の識別（利用者確認または機械工程の回収手続きの成立を示す識別）。 */
  confirmedBy: string;
  /** 確認時刻（ISO 8601）。 */
  confirmedAt: string;
  /** 確認対象の台帳エントリ ID（識別照合に使用）。 */
  targetIds: readonly string[];
}

/** 回収実行面の I/O 注入。台帳 I/O に削除を加えた面。 */
export interface ReclamationIo extends LedgerIo {
  deleteFile(absolutePath: string): void;
}

/** 回収入力の契約違反。fail-closed（確認なし・識別不一致の回収を行わない）。 */
export class ReclamationInputError extends Error {}

/** 回収対象の状態違反。fail-closed（不在台帳への書込み・不存在エントリの回収記録を行わない）。 */
export class ReclamationStateError extends Error {}

/** 個別エントリの回収記録結果。 */
export interface EntryCollectionResult {
  entry: VerificationResourceEntry;
  entries: readonly VerificationResourceEntry[];
  ledgerPath: string;
  /** 今回の呼出で台帳を書換えたか（既に回収済みの再記録は冪等に false）。 */
  written: boolean;
}

/** 台帳回収の結果。 */
export interface LedgerReclamationResult {
  status: "reclaimed" | "uncollected-entries" | "ledger-missing";
  ledgerPath: string;
  /** 最終記録の本体 Issue/PR 収束材料（reclaimed 時のみ非 null）。 */
  convergenceMaterial: string | null;
  reclaimedEntryCount: number;
  /** 未回収のまま残るエントリ ID（uncollected-entries 時のみ）。 */
  uncollectedIds: readonly string[];
}

/** 終了判定記録回収の結果。 */
export interface CloseAcceptanceReclamationResult {
  status: "reclaimed" | "record-missing" | "retained";
  recordPath: string;
}

function isIso8601(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value) && !Number.isNaN(Date.parse(value));
}

function validateConfirmation(confirmation: ReclamationConfirmation): void {
  if (typeof confirmation !== "object" || confirmation === null || Array.isArray(confirmation)) {
    throw new ReclamationInputError("reclamation confirmation must be an object");
  }
  if (typeof confirmation.confirmedBy !== "string" || confirmation.confirmedBy.trim().length === 0) {
    throw new ReclamationInputError("reclamation confirmation.confirmedBy is required");
  }
  if (!isIso8601(confirmation.confirmedAt)) {
    throw new ReclamationInputError("reclamation confirmation.confirmedAt must be an ISO 8601 timestamp");
  }
  if (!Array.isArray(confirmation.targetIds) || !confirmation.targetIds.every((id) => typeof id === "string" && id.trim().length > 0)) {
    throw new ReclamationInputError("reclamation confirmation.targetIds must be an array of non-empty entry ids");
  }
}

function requireLedgerPresent(io: LedgerIo, ledgerPath: string): readonly VerificationResourceEntry[] {
  const read = readLedger(io, ledgerPath);
  if (read.state === "missing") {
    throw new ReclamationStateError(
      `ledger file is missing (a missing ledger is a record gap, not a basis for zero creations): ${ledgerPath}`,
    );
  }
  return read.entries;
}

/**
 * 個別エントリの回収記録（collectedAt の更新）。確認対象 ID に該当エントリが
 * 含まれない回収記録、存在しないエントリ、台帳不在時の記録は拒否する。
 * 既に回収済みのエントリへの再記録は冪等に既存の回収時刻を保持する。
 */
export function recordEntryCollected(
  io: ReclamationIo,
  mainRepoRoot: string,
  caseId: string,
  entryId: string,
  confirmation: ReclamationConfirmation,
  collectedAt: string,
): EntryCollectionResult {
  validateConfirmation(confirmation);
  if (!isIso8601(collectedAt)) {
    throw new ReclamationInputError("collectedAt must be an ISO 8601 timestamp");
  }
  if (!confirmation.targetIds.includes(entryId)) {
    throw new ReclamationInputError(`reclamation confirmation.targetIds does not include the target entry id: ${entryId}`);
  }
  const ledgerPath = resolveLedgerPath(mainRepoRoot, caseId);
  const entries = requireLedgerPresent(io, ledgerPath);
  const target = entries.find((entry) => entry.id === entryId);
  if (target === undefined) {
    throw new ReclamationStateError(`ledger entry is not found: ${entryId}`);
  }
  if (target.collectedAt !== null) {
    return { entry: target, entries, ledgerPath, written: false };
  }
  const updated = entries.map((entry) =>
    entry.id === entryId ? { ...entry, collectedAt } : entry,
  );
  io.writeTextFile(ledgerPath, serializeLedger(updated));
  return {
    entry: { ...target, collectedAt },
    entries: updated,
    ledgerPath,
    written: true,
  };
}

function escapeTableCell(value: string): string {
  return value.replace(/\|/g, "&#124;").replace(/\r\n|\n/g, " ");
}

function buildConvergenceMaterial(
  caseId: string,
  confirmation: ReclamationConfirmation,
  entries: readonly VerificationResourceEntry[],
): string {
  const header = [
    "<!-- verification-resource-ledger-final:v1 -->",
    `案件: ${escapeTableCell(caseId)}`,
    `台帳回収: ${escapeTableCell(confirmation.confirmedAt)}（確認: ${escapeTableCell(confirmation.confirmedBy)}）`,
    "| ID | 種別 | 所在 | 識別情報 | 所有区分 | 子Issue | 作成時刻 | 回収時刻 |",
    "|---|---|---|---|---|---|---|---|",
  ];
  const rows = entries.map((entry) => {
    const identifiers = Object.entries(entry.identifiers)
      .map(([key, value]) => `${key}=${value}`)
      .join("; ");
    return [
      entry.id,
      entry.kind,
      entry.location,
      identifiers,
      entry.ownership,
      entry.childIssue === null ? "-" : String(entry.childIssue),
      entry.createdAt,
      entry.collectedAt ?? "-",
    ]
      .map(escapeTableCell)
      .join(" | ");
  });
  return `${[...header, ...rows.map((row) => `| ${row} |`)].join("\n")}\n`;
}

/**
 * 台帳（追跡記録）自体の終了時回収。確認対象 ID と台帳エントリ集合の完全一致を
 * 照合し、未回収エントリが残る台帳は回収せず拒否として返す（全体未完了の維持）。
 * 台帳不在は記録欠落として返し、作成物なしの根拠に変換しない。回収時は
 * 最終記録の本体 Issue/PR 収束材料を返してから台帳ファイルを削除する。
 */
export function reclaimLedger(
  io: ReclamationIo,
  mainRepoRoot: string,
  caseId: string,
  confirmation: ReclamationConfirmation,
): LedgerReclamationResult {
  validateConfirmation(confirmation);
  if (typeof caseId !== "string" || caseId.trim().length === 0) {
    throw new ReclamationInputError("caseId is required");
  }
  const ledgerPath = resolveLedgerPath(mainRepoRoot, caseId);
  const read = readLedger(io, ledgerPath);
  if (read.state === "missing") {
    return { status: "ledger-missing", ledgerPath, convergenceMaterial: null, reclaimedEntryCount: 0, uncollectedIds: [] };
  }
  const entries = read.entries;
  const uncollectedIds = entries.filter((entry) => entry.collectedAt === null).map((entry) => entry.id);
  if (uncollectedIds.length > 0) {
    return {
      status: "uncollected-entries",
      ledgerPath,
      convergenceMaterial: null,
      reclaimedEntryCount: 0,
      uncollectedIds,
    };
  }
  const entryIds = entries.map((entry) => entry.id);
  const confirmedSet = [...confirmation.targetIds].sort();
  const ledgerSet = [...entryIds].sort();
  if (confirmedSet.length !== ledgerSet.length || confirmedSet.some((id, index) => id !== ledgerSet[index])) {
    throw new ReclamationInputError(
      `reclamation confirmation.targetIds must match the ledger entry ids exactly (confirmed: [${confirmedSet.join(", ")}], ledger: [${ledgerSet.join(", ")}])`,
    );
  }
  const convergenceMaterial = buildConvergenceMaterial(caseId, confirmation, entries);
  io.deleteFile(ledgerPath);
  return {
    status: "reclaimed",
    ledgerPath,
    convergenceMaterial,
    reclaimedEntryCount: entries.length,
    uncollectedIds: [],
  };
}

/**
 * 終了判定記録（.agentdev/close-acceptance/）の終了後回収。終了操作の完了申告が
 * ない回収要求は記録を保持する（Tool 境界検証が読み取る必要がある期間の保持）。
 * 記録不在は回収対象なしとして冪等に受理する。
 */
export function reclaimCloseAcceptanceRecord(
  io: ReclamationIo,
  input: { recordPath: string; terminalOperationCompleted: boolean },
): CloseAcceptanceReclamationResult {
  if (typeof input !== "object" || input === null) {
    throw new ReclamationInputError("close acceptance reclamation input must be an object");
  }
  if (typeof input.recordPath !== "string" || input.recordPath.trim().length === 0) {
    throw new ReclamationInputError("recordPath is required");
  }
  if (typeof input.terminalOperationCompleted !== "boolean") {
    throw new ReclamationInputError("terminalOperationCompleted must be a boolean declaration of the terminal operation completion");
  }
  if (!input.terminalOperationCompleted) {
    return { status: "retained", recordPath: input.recordPath };
  }
  if (!io.exists(input.recordPath)) {
    return { status: "record-missing", recordPath: input.recordPath };
  }
  io.deleteFile(input.recordPath);
  return { status: "reclaimed", recordPath: input.recordPath };
}
