/**
 * case-auto orchestration の進行・終了制御の決定的部分（Wave gate）。
 *
 * 本モジュールは I/O を行わない（純関数）。次の判定を決定的に行い、
 * case-auto の orchestration 手順と case-close の Epic 終了手順が消費する。
 *
 * - dispatch 入口での旧実行契約抑止: 影響する合意変更が下流消費成果物へ反映され
 *   読み戻しが確認されるまで、旧実行契約に基づく新規 dispatch を許可しない
 * - 依存充足ゲート: 子 Issue の開始（スロット型キューへの投入）は当該子に必要な
 *   全ての意味的依存条件の充足（必要な統合・マージの完了を含む）のみを条件とし、
 *   Wave 収束を前提としない。blocked / failed / delegation-unavailable は依存充足と
 *   はみなさない。依存先の完了判定は canCompleteChild（既存純関数）の再利用で行い、
 *   依存充足の判定ロジックを呼出側で新規作成しない
 * - 子完了と親横断義務の分離: 子 Issue の完了は当該子が負う必須完了条件のみで
 *   判定し、親に残る横断義務の未完了を理由に条件を満たした子の終了を禁止しない
 * - 申告と受入の分離: 子の実行担当の合格申告（ownRequiredConditionsMet）は申告
 *   として扱い、受入側（case-close が正規完了条件から独立実行した受入評価）の
 *   結果が提供されている場合はその結果を消費する。受入評価が拒否している子は
 *   申告が合格でも完了伝播させず、Epic の最終終了判定でも Epic 自身の受入評価
 *   の拒否を blocker にする
 * - 義務投影不完全・検証不能申告の停止伝播: 当該申告がある子は完了伝播させず、
 *   依存先からの依存充足・Epic の終了を阻止する
 * - Epic/Root の最終終了は全子完了と親横断義務成立の両方を条件とする
 *
 * 新しい結果状態・新しい品質ゲートを追加しない。判定値は既存の実行結果 4状態
 * （pass / blocked / failed / delegation-unavailable）と対象観測状態のみで
 * 表現する。
 */

/** 子 Issue 実行の結果確定値（委譲 result 4状態）。 */
export type ChildOutcome = "pass" | "blocked" | "failed" | "delegation-unavailable";

/** 子 Issue の orchestration 上の観測状態。 */
export type ChildStatus =
  | "pending"
  | "ready"
  | "active"
  /** 実行結果確定。 */
  | "outcome-determined"
  | "state-unknown";

/** 子 Issue が申告する義務の不全。 */
export type ObligationDefect =
  /** 子 Issue への義務投影が不完全（対応先のない義務がある）。 */
  | "incomplete-projection"
  /** 子が自己の完了条件を検証できない申告。 */
  | "unverifiable-verdict";

/**
 * 受入側（case-close が正規完了条件から独立実行した受入評価）の結果。
 * 実行担当の合格申告（ownRequiredConditionsMet）とは別の照合対象であり、
 * 申告の正ではない。
 */
export interface AcceptanceResult {
  /** 受入評価（final-acceptance.ts の evaluateFinalAcceptance）の close 可否。 */
  closeAllowed: boolean;
  /** 拒否理由（closeAllowed false 時の根拠。報告・照合の記録に使う）。 */
  rejectionReason?: string;
}

/** 子 Issue 1件の実行観測レコード。 */
export interface ChildExecutionRecord {
  issue: string;
  status: ChildStatus;
  outcome?: ChildOutcome;
  /** 子が負う必須完了条件が全て成立しているか（実行担当の申告）。 */
  ownRequiredConditionsMet?: boolean;
  /** 義務投影不完全・検証不能の申告。 */
  obligationDefect?: ObligationDefect;
  /** 受入評価の結果（提供された場合、申告と独立に完了判定へ消費する）。 */
  acceptance?: AcceptanceResult;
}

/** Epic/Root が負う横断義務の成立状態。 */
export interface CrossObligationState {
  obligationId: string;
  satisfied: boolean;
}

/** dispatch gate の入力。 */
export interface DispatchGateInput {
  /**
   * 影響する合意変更が下流消費成果物へ反映され、読み戻しが確認されているか。
   * 未確認の場合は旧実行契約に基づく新規 dispatch を許可しない。
   */
  contractReflectionConfirmed?: boolean;
}

/**
 * dispatch 入口での旧実行契約抑止。
 *
 * 合意変更の反映と読み戻し確認が済むまで、旧実行契約に基づく新規 dispatch を
 * 許可しない。
 */
export function canDispatchNewExecution(
  input: DispatchGateInput,
): { allowed: boolean; reason?: string } {
  if (input.contractReflectionConfirmed !== true) {
    return {
      allowed: false,
      reason: "影響する合意変更が下流消費成果物へ反映され読み戻しが確認されるまで、旧実行契約に基づく新規 dispatch を行わない",
    };
  }
  return { allowed: true };
}

/**
 * Wave 収束を判定する。
 *
 * 全子 Issue が実行結果確定であり、未処理・実行中・状態不明が残らないことを
 * 収束とする。blocked / failed / delegation-unavailable の確定も収束には該当し
 * 得る（依存充足とはみなさない）。収束は Wave 構成の記録単位としての進行評価と
 * Epic/Root 終了側の判定に用い、子 Issue の投入開始の前提とはしない。
 */
export function isWaveConverged(
  children: readonly ChildExecutionRecord[],
): boolean {
  return children.every((child) => child.status === "outcome-determined");
}

/** 依存充足ゲートの入力。 */
export interface DependencyGateInput {
  /**
   * 投入対象の子 Issue が意味的依存を持つ依存先子 Issue 群の実行観測レコード。
   * 必要な統合・マージの完了を含む全ての意味的依存条件の依存先を含める。
   * 依存先がない（必須依存がない）場合は空配列。
   */
  dependencyProviders: readonly ChildExecutionRecord[];
}

/**
 * 依存充足ゲート（スロット型キュー投入の依存充足判定）。
 *
 * 子 Issue の開始は当該子 Issue に必要な全ての意味的依存条件の充足（必要な
 * 統合・マージの完了を含む）のみを条件とし、Wave 収束（全子 Issue の実行結果
 * 確定）を後続の子 Issue 開始の前提としない（完了即次投入のスロット型キュー）。
 * 各依存先の完了判定は canCompleteChild（既存純関数）の再利用で行い、
 * blocked / failed / delegation-unavailable は依存充足とはみなさない。
 */
export function isDependencySatisfied(
  input: DependencyGateInput,
): { satisfied: boolean; blockers: string[] } {
  const blockers: string[] = [];
  for (const provider of input.dependencyProviders) {
    const completion = canCompleteChild(provider);
    if (!completion.allowed) {
      blockers.push(`dependency-not-satisfied:${provider.issue}`);
    }
  }
  return { satisfied: blockers.length === 0, blockers };
}

/**
 * 子 Issue の完了判定。
 *
 * 当該子が負う必須完了条件の成立のみで判定する。親横断義務は入力に含まれず、
 * 親の横断義務の未完了を理由に条件を満たした子の終了を禁止しない。
 * 義務投影不完全・検証不能の申告がある子は停止伝播として完了伝播を阻止する。
 * 受入評価の結果（acceptance）が提供されている場合は申告（ownRequiredConditionsMet）
 * と独立に消費し、受入評価が拒否している子は申告が合格でも完了しない。
 */
export function canCompleteChild(
  child: ChildExecutionRecord,
): { allowed: boolean; reason?: string } {
  if (child.obligationDefect !== undefined) {
    return {
      allowed: false,
      reason: "義務投影不完全・検証不能の申告がある子は停止伝播として扱い、完了伝播させない",
    };
  }
  if (
    child.acceptance !== undefined &&
    child.acceptance.closeAllowed !== true
  ) {
    return {
      allowed: false,
      reason: `受入評価が完了を許可していない（申告と受入の分離。${child.acceptance.rejectionReason ?? "拒否理由未記録"}）`,
    };
  }
  if (
    child.status !== "outcome-determined" ||
    child.outcome !== "pass" ||
    child.ownRequiredConditionsMet !== true
  ) {
    return {
      allowed: false,
      reason: "子が負う必須完了条件が全て成立していない",
    };
  }
  return { allowed: true };
}

/** Epic/Root 最終終了 gate の入力。 */
export interface EpicCloseGateInput {
  children: readonly ChildExecutionRecord[];
  /** Epic/Root 自身が負う横断義務の成立状態。最終終了時に評価する。 */
  crossObligations: readonly CrossObligationState[];
  /** Epic 自身の受入評価結果（親横断義務を含む Epic 最終終了時の受入評価）。 */
  epicAcceptance?: AcceptanceResult;
}

/**
 * Epic/Root の最終終了判定。
 *
 * 全子 Issue の完了と親横断義務の成立の両方を条件とする。条件を満たした子の
 * 完了を親横断義務の未完了だけで阻止しない一方、Epic/Root 自身は親の横断義務が
 * 成立するまで終了しない。Epic 自身の受入評価（epicAcceptance）が提供されて
 * いる場合はその結果を消費し、受入評価が拒否している Epic は横断義務が成立して
 * いても最終終了しない。
 */
export function canCloseEpic(
  input: EpicCloseGateInput,
): { allowed: boolean; blockers: string[] } {
  const blockers: string[] = [];

  if (input.epicAcceptance !== undefined && input.epicAcceptance.closeAllowed !== true) {
    blockers.push(
      `epic-acceptance-denied:${input.epicAcceptance.rejectionReason ?? "拒否理由未記録"}`,
    );
  }
  for (const child of input.children) {
    const completion = canCompleteChild(child);
    if (!completion.allowed) {
      blockers.push(`child-not-complete:${child.issue}`);
    }
  }
  for (const obligation of input.crossObligations) {
    if (!obligation.satisfied) {
      blockers.push(`cross-obligation-unmet:${obligation.obligationId}`);
    }
  }

  return { allowed: blockers.length === 0, blockers };
}
