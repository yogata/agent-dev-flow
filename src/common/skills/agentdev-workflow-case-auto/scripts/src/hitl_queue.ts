/**
 * case-auto orchestration の HITL question スキップ可能キューの決定的部分。
 *
 * 本モジュールは I/O を行わない（純関数）。orchestration 中の警告・確認・
 * 選択肢提示に由来する HITL question をノンブロッキング化し、stage 境界または
 * 完了報告での一括提示のためにキューへ投入・取り出しする。
 *
 * - 人間に留保された判断の新規確定と、既存の安全境界が要求する操作承認を
 *   要する停止は本キューの対象外とし、投入を拒否する
 *   （従来どおりブロッキングする。既存の停止契約は変更しない。キュー対象外の
 *   判定は case-auto Design「承認・HITL 境界」「HITL question のスキップ可能
 *   キュー」節）
 * - スキップ時は既定の安全側の挙動（警告の記録と継続、または当該対象のみの
 *   停止）を question に必須とする
 * - 取り出しは投入順を保持し、重複投入を排除する
 */

/** スキップ可能キューへ投入できる question の種別（警告・確認・選択肢提示）。 */
export type SkippableQuestionKind = "warning" | "confirmation" | "choice";

/** スキップ可能キューの対象外（ブロッキング維持）の question 種別。 */
export type BlockingQuestionKind =
  | "reserved-judgment"
  | "safety-operation-approval";

/** HITL question の種別。 */
export type QuestionKind = SkippableQuestionKind | BlockingQuestionKind;

/** HITL question 1件。 */
export interface HitlQuestion {
  /** question 識別子（キュー内で一意）。 */
  id: string;
  /** question 種別。 */
  kind: QuestionKind;
  /** stage 境界・完了報告での一括提示に使用する要約。 */
  summary: string;
  /** スキップ時に採用される既定の安全側の挙動。 */
  defaultSafeBehavior: string;
}

/** 投入結果。 */
export interface EnqueueResult {
  /** キューへ投入されたか。 */
  accepted: boolean;
  /** 拒否理由（accepted が false の場合のみ）。 */
  reason?: string;
  /** 処理後のキュー（accepted が false の場合は変更なし）。 */
  queue: readonly HitlQuestion[];
}

/**
 * スキップ可能キューへ question を投入する。
 *
 * 留保判断（reserved-judgment）と安全境界の操作承認（safety-operation-approval）
 * は拒否する。同一識別子の重複投入は拒否する。
 */
export function enqueueSkippable(
  queue: readonly HitlQuestion[],
  question: HitlQuestion,
): EnqueueResult {
  if (question.kind === "reserved-judgment") {
    return {
      accepted: false,
      reason:
        "人間に留保された判断の新規確定はスキップ可能キューの対象外であり、ブロッキング停止として扱う",
      queue,
    };
  }
  if (question.kind === "safety-operation-approval") {
    return {
      accepted: false,
      reason:
        "既存の安全境界が要求する操作承認を要する停止はスキップ可能キューの対象外であり、ブロッキング停止として扱う",
      queue,
    };
  }
  if (queue.some((existing) => existing.id === question.id)) {
    return {
      accepted: false,
      reason: `同一識別子の question は重複投入できない: ${question.id}`,
      queue,
    };
  }
  return { accepted: true, queue: [...queue, question] };
}

/**
 * stage 境界・完了報告での一括提示のためにキューを取り出す。
 *
 * 投入順を保持し、取り出し後にキューを空にする。取り出した question は
 * 既定の安全側の挙動とともに一括提示する。
 */
export function drainSkippableQueue(
  queue: readonly HitlQuestion[],
): readonly HitlQuestion[] {
  return [...queue];
}
