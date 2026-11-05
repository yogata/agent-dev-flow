//
// 一時資材回収の削除確認フロー（削除提案の識別情報付与と削除実行の確認境界）。
// 様式の正は 検証用一時資材のライフサイクル Design「削除確認」節:
// - 回収の削除は、利用者の明示確認と対象の正確な識別情報（所在・種別・内容識別・
//   PIDとコマンドライン・URL）との対応が確認できた場合だけ実行する
// - 確認なし、削除提案からの対象の追加変更（識別情報不一致）、別物への入替え時は
//   削除しない。実行担当が生成した approval 等の機械可読値だけを利用者確認として
//   扱わない。同名別物、PID再利用、symlink/junction の参照先誤消去を識別情報照合
//   で防ぐ。確認済み識別情報との対応を残置許容の例外として流用しない
// 純粋関数で構成し、台帳の読取は close_mechanical_steps 側の注入 runner で行う。
// 本モジュールは削除実行そのものを行わない（削除実行は確認境界を通過した後の
// 監督側対応であり、本機械工程の責務ではない）。
//

import { parseLedgerText, type VerificationResourceEntry } from "./verification-resources-ledger.ts";

/** 削除提案（識別情報付きの HITL 提示実体）。 */
export interface DeletionProposal {
  /** 台帳エントリ ID。 */
  entryId: string;
  /** 種別。 */
  kind: VerificationResourceEntry["kind"];
  /** 所在（絶対パスまたは URL）。 */
  location: string;
  /** 識別情報（パス、内容ハッシュ、PID、コマンドライン、URL、linkTarget 等の実採集値）。 */
  identifiers: Readonly<Record<string, string>>;
  /** 利用者提示用の人称文（識別情報の全文を含む）。 */
  presentation: string;
}

/** 利用者削除確認の記録（確認時点の識別情報スナップショットを伴う）。 */
export interface UserDeletionConfirmation {
  /** 対象の台帳エントリ ID。 */
  entryId: string;
  /** 確認の発生源。実行担当が生成した機械可読値（approval 等）は user-explicit にならない。 */
  source: "user-explicit" | "machine-issued";
  /** 確認の目的。deletion 以外（残置許容の例外等）の確認を削除に流用しない。 */
  purpose: "deletion" | "residue-allowance";
  /** 確認時刻（ISO 8601）。 */
  confirmedAt: string;
  /** 利用者が確認した対象の識別情報スナップショット（削除提案の識別情報と突合する）。 */
  identifiers: Record<string, string>;
}

/** 削除実行直前の対象観測（識別情報照合の実測値）。 */
export interface DeletionTargetObservation {
  /** 対象の台帳エントリ ID。 */
  entryId: string;
  /** 現在の所在。 */
  location: string;
  /** 現在の種別。 */
  kind: string;
  /** 削除実行直前に採集した識別情報（削除提案の識別情報と完全照合する）。 */
  identifiers: Record<string, string>;
  /** 削除実行直前に対象が実在するか。 */
  exists: boolean;
}

/** 削除拒否のコード。 */
export type DeletionRefusalCode =
  | "confirmation-missing"
  | "machine-confirmation-not-accepted"
  | "confirmation-purpose-not-deletion"
  | "confirmation-target-mismatch"
  | "observation-missing"
  | "target-missing"
  | "identifier-mismatch"
  | "deletion-confirmation-record-missing";

/** 削除拒否1件（対象単位）。 */
export interface DeletionRefusal {
  entryId: string;
  code: DeletionRefusalCode;
  /** 拒否の具体的根拠（不一致キー等）。 */
  detail: string;
}

/** 削除実行の確認境界の判定結果（機械工程の報告 JSON へ提供する判定材料）。 */
export interface DeletionConfirmationEvaluation {
  /** 提供された確認と観測のもとで、対象すべての削除実行が許可されるか。 */
  permitted: boolean;
  /** 評価した台帳エントリ数（回収済みを除く削除対象）。 */
  evaluatedCount: number;
  /** 削除実行が許可された台帳エントリ ID。 */
  confirmedIds: readonly string[];
  /** 検出した拒否一覧（拒否ゼロのとき空）。 */
  refusals: readonly DeletionRefusal[];
}

/**
 * 台帳エントリから削除提案（識別情報付き）を組み立てる。
 * 完了条件「削除提案が正確な識別情報とともに提示されること」の機械部分。
 */
export function buildDeletionProposal(entry: VerificationResourceEntry): DeletionProposal {
  const identifierText = Object.entries(entry.identifiers)
    .map(([key, value]) => `${key}=${value}`)
    .join("、");
  return {
    entryId: entry.id,
    kind: entry.kind,
    location: entry.location,
    identifiers: { ...entry.identifiers },
    presentation: `削除提案 ${entry.id}: 種別=${entry.kind}、所在=${entry.location}、識別情報: ${identifierText}`,
  };
}

/** 識別情報の完全照合（キー集合の一致と全値の一致）。不一致キーの一覧を返す。 */
function compareIdentifiers(
  expected: Readonly<Record<string, string>>,
  actual: Readonly<Record<string, string>>,
): { match: boolean; mismatchedKeys: readonly string[] } {
  const expectedKeys = Object.keys(expected).sort();
  const actualKeys = Object.keys(actual).sort();
  const mismatchedKeys: string[] = [];
  for (const key of expectedKeys) {
    if (!(key in actual)) {
      mismatchedKeys.push(key);
    } else if (expected[key] !== actual[key]) {
      mismatchedKeys.push(key);
    }
  }
  for (const key of actualKeys) {
    if (!(key in expected)) mismatchedKeys.push(key);
  }
  return { match: mismatchedKeys.length === 0, mismatchedKeys };
}

/**
 * 削除実行の確認境界の決定的判定。
 * 台帳エントリごとに、利用者の明示確認（user-explicit・deletion 目的・識別情報
 * スナップショット一致）と削除実行直前の観測（所在・種別・識別情報の完全一致、
 * 対象の実在）を検証する。いずれかが不成立の対象は削除許可から除外し、拒否一覧
 * として報告する。回収済み（collectedAt 付き）エントリに削除確認記録
 * （deletionConfirmation）が欠落している場合は、削除確認の不存在として検出する
 * （台帳登録済み資材が削除確認記録なしに消失した場合の完了拒否材料）。
 */
export function evaluateDeletionConfirmation(
  entries: readonly VerificationResourceEntry[],
  confirmations: readonly UserDeletionConfirmation[],
  observations: readonly DeletionTargetObservation[],
): DeletionConfirmationEvaluation {
  const refusals: DeletionRefusal[] = [];
  const confirmedIds: string[] = [];
  let evaluatedCount = 0;
  for (const entry of entries) {
    if (entry.collectedAt !== null) {
      // 回収（削除）済みのエントリは削除確認記録の有無だけを検査する。
      // 記録欠落は削除確認の不存在（消失を含む）として完了拒否の材料にする。
      if (entry.deletionConfirmation === undefined || entry.deletionConfirmation === null) {
        refusals.push({
          entryId: entry.id,
          code: "deletion-confirmation-record-missing",
          detail: `collected without a deletion confirmation record (collectedAt=${entry.collectedAt})`,
        });
      }
      continue;
    }
    evaluatedCount += 1;
    const observation = observations.find((candidate) => candidate.entryId === entry.id);
    if (observation === undefined) {
      refusals.push({
        entryId: entry.id,
        code: "observation-missing",
        detail: "no pre-deletion observation was provided (identification matching is impossible)",
      });
      continue;
    }
    if (!observation.exists) {
      refusals.push({
        entryId: entry.id,
        code: "target-missing",
        detail: "target is already missing before deletion execution (residue attribution cannot be confirmed)",
      });
      continue;
    }
    const confirmation = confirmations.find((candidate) => candidate.entryId === entry.id);
    if (confirmation === undefined) {
      refusals.push({
        entryId: entry.id,
        code: "confirmation-missing",
        detail: "no user deletion confirmation was provided for this target",
      });
      continue;
    }
    if (confirmation.source !== "user-explicit") {
      refusals.push({
        entryId: entry.id,
        code: "machine-confirmation-not-accepted",
        detail: `machine-readable values (source=${confirmation.source}) are not treated as user confirmation`,
      });
      continue;
    }
    if (confirmation.purpose !== "deletion") {
      refusals.push({
        entryId: entry.id,
        code: "confirmation-purpose-not-deletion",
        detail: `confirmation purpose is ${confirmation.purpose}; the confirmed identifier correspondence must not be reused for deletion`,
      });
      continue;
    }
    const confirmationMatch = compareIdentifiers(entry.identifiers, confirmation.identifiers);
    if (!confirmationMatch.match) {
      refusals.push({
        entryId: entry.id,
        code: "confirmation-target-mismatch",
        detail: `user confirmation snapshot does not match the ledger identifiers: ${confirmationMatch.mismatchedKeys.join(", ")}`,
      });
      continue;
    }
    if (observation.location !== entry.location) {
      refusals.push({
        entryId: entry.id,
        code: "identifier-mismatch",
        detail: `location changed after the deletion proposal: proposal=${entry.location} observed=${observation.location}`,
      });
      continue;
    }
    if (observation.kind !== entry.kind) {
      refusals.push({
        entryId: entry.id,
        code: "identifier-mismatch",
        detail: `kind changed after the deletion proposal: proposal=${entry.kind} observed=${observation.kind}`,
      });
      continue;
    }
    const observationMatch = compareIdentifiers(entry.identifiers, observation.identifiers);
    if (!observationMatch.match) {
      refusals.push({
        entryId: entry.id,
        code: "identifier-mismatch",
        detail: `target identifiers changed after the deletion proposal (same-name/PID-reuse/link-target substitutions are rejected): ${observationMatch.mismatchedKeys.join(", ")}`,
      });
      continue;
    }
    confirmedIds.push(entry.id);
  }
  return {
    permitted: refusals.length === 0,
    evaluatedCount,
    confirmedIds,
    refusals,
  };
}

/**
 * 台帳テキストから削除確認評価を実行する（close 機械工程の step 呼び出し用）。
 * 台帳不在（記録欠落）は削除確認不存在の検出対象外とし、state: "missing" として
 * 照合本体（base extension）に委ねる（空状態の区別。不在を作成物なしの根拠に
 * しない Wave-1 契約と整合）。
 */
export function evaluateDeletionConfirmationFromLedgerText(
  ledgerText: string | null,
  confirmations: readonly UserDeletionConfirmation[],
  observations: readonly DeletionTargetObservation[],
): { state: "missing" | "present"; evaluation: DeletionConfirmationEvaluation } {
  if (ledgerText === null) {
    return {
      state: "missing",
      evaluation: { permitted: true, evaluatedCount: 0, confirmedIds: [], refusals: [] },
    };
  }
  // 台帳の解析は Wave-1 モジュールの fail-closed 契約を再利用する（破損台帳を
  // 空扱いにしない）。
  const entries = parseLedgerText(ledgerText);
  return { state: "present", evaluation: evaluateDeletionConfirmation(entries, confirmations, observations) };
}
