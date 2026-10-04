/**
 * case-auto orchestration の進行・終了制御の決定的部分（Wave gate）。
 *
 * 本モジュールは I/O を行わない（純関数）。次の判定を決定的に行い、
 * case-auto の orchestration 手順と case-close の Epic 終了手順が消費する。
 *
 * - dispatch 入口での旧実行契約抑止: 影響する合意変更が下流消費成果物へ反映され
 *   読み戻しが確認されるまで、旧実行契約に基づく新規 dispatch を許可しない
 * - Wave 収束と依存充足の両条件 gate: 次 Wave の開始は両方の成立を条件とする。
 *   blocked / failed / delegation-unavailable は収束には該当し得るが依存充足とは
 *   みなさない
 * - 子完了と親横断義務の分離: 子 Issue の完了は当該子が負う必須完了条件のみで
 *   判定し、親に残る横断義務の未完了を理由に条件を満たした子の終了を禁止しない
 * - 義務投影不完全・検証不能申告の停止伝播: 当該申告がある子は完了伝播させず、
 *   次 Wave の開始・Epic の終了を阻止する
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

/** 子 Issue 1件の実行観測レコード。 */
export interface ChildExecutionRecord {
  issue: string;
  status: ChildStatus;
  outcome?: ChildOutcome;
  /** 子が負う必須完了条件が全て成立しているか。 */
  ownRequiredConditionsMet?: boolean;
  /** 義務投影不完全・検証不能の申告。 */
  obligationDefect?: ObligationDefect;
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
 * 得る（依存充足とはみなさない）。
 */
export function isWaveConverged(
  children: readonly ChildExecutionRecord[],
): boolean {
  return children.every((child) => child.status === "outcome-determined");
}

/** 次 Wave 開始 gate の入力。 */
export interface NextWaveGateInput {
  children: readonly ChildExecutionRecord[];
  /** 後続 Wave の依存充足（意味的依存条件の成立、必要な統合・マージの完了を含む）。 */
  dependencySatisfied: boolean;
}

/**
 * Wave 収束と依存充足の両条件 gate。
 *
 * 次 Wave の開始は両方の成立を条件とする。義務投影不完全・検証不能の申告が
 * 残る子がある場合は停止伝播として次 Wave の開始を阻止する（完了伝播を
 * 阻止する）。親横断義務の未完了は子の Wave 収束判定に含めず、依存充足の
 * 判断材料として扱わない（子完了と親横断義務の分離）。
 */
export function canStartNextWave(
  input: NextWaveGateInput,
): { allowed: boolean; blockers: string[] } {
  const blockers: string[] = [];

  if (!isWaveConverged(input.children)) {
    blockers.push("wave-not-converged");
  }
  if (!input.dependencySatisfied) {
    blockers.push("dependency-not-satisfied");
  }
  const defectChildren = input.children.filter(
    (child) => child.obligationDefect !== undefined,
  );
  if (defectChildren.length > 0) {
    blockers.push(
      `obligation-defect-reported:${defectChildren.map((child) => child.issue).join(",")}`,
    );
  }

  return { allowed: blockers.length === 0, blockers };
}

/**
 * 子 Issue の完了判定。
 *
 * 当該子が負う必須完了条件の成立のみで判定する。親横断義務は入力に含まれず、
 * 親の横断義務の未完了を理由に条件を満たした子の終了を禁止しない。
 * 義務投影不完全・検証不能の申告がある子は停止伝播として完了伝播を阻止する。
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
}

/**
 * Epic/Root の最終終了判定。
 *
 * 全子 Issue の完了と親横断義務の成立の両方を条件とする。条件を満たした子の
 * 完了を親横断義務の未完了だけで阻止しない一方、Epic/Root 自身は親の横断義務が
 * 成立するまで終了しない。
 */
export function canCloseEpic(
  input: EpicCloseGateInput,
): { allowed: boolean; blockers: string[] } {
  const blockers: string[] = [];

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
