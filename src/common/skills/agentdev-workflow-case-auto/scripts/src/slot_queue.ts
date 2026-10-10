/**
 * case-auto orchestration stage 3 のスロット型キュー投入制御の決定的部分。
 *
 * 本モジュールは I/O を行わない（純関数）。stage 3 runtime 制御ループの
 * 「空き枠補充」（横断補充は必須、固定 batch 禁止）と「再開時の二重起動防止」
 * を決定的に判定する。依存充足の判定は wave-gate の依存充足ゲート純関数
 * （isDependencySatisfied、内部で canCompleteChild を再利用）で行い、本モジュール
 * で判定ロジックを新規作成しない。
 *
 * - 投入は依存充足の子 Issue から行う（完了即次投入）。Wave 収束は投入の
 *   前提としない（Wave 構成は意味的依存 DAG から決定的に導出される実行構成の
 *   記録単位として維持する）
 * - 共有 active Issue task 枠（上限は入力で受け取る。既定値は case-auto Design
 *   が所有する数値）を超える投入を行わない
 * - 同一 Issue の二重起動を行わない。active・完了済み（outcome pass で完了）・
 *   状態不明の対象は投入しない。受入評価が拒否している子（acceptance 拒否の
 *   outcome pass 対象）は完了済みと分類せず、修正・再検証へ戻す対象として
 *   新規投入もしない（acceptance-refused。受入評価の拒否結果の消費）
 * - 依存関係のある Definition merge の排他を維持する（統合処理が進行中の間、
 *   当該統合に依存する投入を保留する）
 */

import {
  isDependencySatisfied,
  type ChildExecutionRecord,
  type ChildStatus,
} from "./wave-gate.ts";

/** stage 3 共有 active Issue task 枠の既定上限（case-auto Design「並列実行の判定」節が所有する数値）。 */
export const DEFAULT_MAX_ACTIVE_ISSUE_TASKS = 5;

/** スロット型キューの投入候補1件。 */
export interface SlotCandidate {
  /** 対象 Issue 番号（records のキーと一致させる）。 */
  issue: string;
  /** 対象が意味的依存を持つ依存先 Issue 番号群（依存がない場合は空配列）。 */
  dependsOn: readonly string[];
  /**
   * 対象の開始が依存関係のある Definition merge の統合処理を伴うか。
   * true の場合、統合処理の進行中は排他維持のため投入を保留する。
   */
  requiresDependentMerge?: boolean;
}

/** 投入計画の入力。 */
export interface SlotQueueInput {
  /**
   * 投入候補群。Epic 実行構成・Standard 構成から決定的に導出された記録順で
   * 与える（投入順序の安定性の基準）。
   */
  candidates: readonly SlotCandidate[];
  /**
   * 子 Issue の実行観測レコード（対象自身と依存先の判定に使用）。
   * レコードが存在しない対象は未処理（pending 相当）として扱う。
   */
  records: ReadonlyMap<string, ChildExecutionRecord>;
  /** 現在 active な Issue 実行委譲の Issue 番号群。 */
  activeIssues: readonly string[];
  /** 共有 active Issue task 枠の上限。省略時は既定上限。 */
  maxActive?: number;
  /** 進行中の依存関係のある Definition merge の識別子。排他維持の対象。省略時は進行中なし。 */
  dependentMergeInFlight?: string | null;
}

/** 投入計画の結果。 */
export interface SlotAdmissionPlan {
  /** 今回投入する対象の Issue 番号群（記録順）。 */
  admissions: readonly string[];
  /** 投入しなかった対象と理由。 */
  notAdmitted: readonly { issue: string; reason: NotAdmittedReason }[];
  /** 計画適用後の active Issue 番号群（admissions を含む）。 */
  activeAfterPlan: readonly string[];
}

/** 投入保留・拒否の理由。 */
export type NotAdmittedReason =
  | "dependency-not-satisfied"
  | "no-active-slot"
  | "already-active"
  | "already-completed"
  | "acceptance-refused"
  | "state-unknown"
  | "definition-merge-exclusive";

function statusOf(
  record: ChildExecutionRecord | undefined,
): ChildStatus {
  return record?.status ?? "pending";
}

function completionRecordOf(
  issue: string,
  record: ChildExecutionRecord | undefined,
): ChildExecutionRecord {
  if (record !== undefined) return record;
  return { issue, status: "pending" };
}

/**
 * スロット型キューの投入計画を決定的に算出する。
 *
 * 候補は入力の記録順に評価し、依存充足した候補から空き枠の上限まで投入する。
 * 判定の決定性（同一入力から同一計画）を維持する。
 */
export function planSlotAdmissions(input: SlotQueueInput): SlotAdmissionPlan {
  const maxActive = input.maxActive ?? DEFAULT_MAX_ACTIVE_ISSUE_TASKS;
  const records = input.records;
  const active = new Set(input.activeIssues);
  const admissions: string[] = [];
  const notAdmitted: { issue: string; reason: NotAdmittedReason }[] = [];

  for (const candidate of input.candidates) {
    if (active.has(candidate.issue) || admissions.includes(candidate.issue)) {
      notAdmitted.push({ issue: candidate.issue, reason: "already-active" });
      continue;
    }
    const record = completionRecordOf(candidate.issue, records.get(candidate.issue));
    const status = statusOf(records.get(candidate.issue));
    if (status === "state-unknown") {
      notAdmitted.push({ issue: candidate.issue, reason: "state-unknown" });
      continue;
    }
    if (status === "outcome-determined" && record.outcome === "pass") {
      if (record.acceptance?.closeAllowed === false) {
        notAdmitted.push({ issue: candidate.issue, reason: "acceptance-refused" });
        continue;
      }
      notAdmitted.push({ issue: candidate.issue, reason: "already-completed" });
      continue;
    }
    if (
      candidate.requiresDependentMerge === true &&
      input.dependentMergeInFlight != null
    ) {
      notAdmitted.push({
        issue: candidate.issue,
        reason: "definition-merge-exclusive",
      });
      continue;
    }
    const providers = candidate.dependsOn.map((provider) =>
      completionRecordOf(provider, records.get(provider)),
    );
    const dependency = isDependencySatisfied({ dependencyProviders: providers });
    if (!dependency.satisfied) {
      notAdmitted.push({ issue: candidate.issue, reason: "dependency-not-satisfied" });
      continue;
    }
    if (active.size + admissions.length >= maxActive) {
      notAdmitted.push({ issue: candidate.issue, reason: "no-active-slot" });
      continue;
    }
    admissions.push(candidate.issue);
  }

  return {
    admissions,
    notAdmitted,
    activeAfterPlan: [...input.activeIssues, ...admissions],
  };
}
