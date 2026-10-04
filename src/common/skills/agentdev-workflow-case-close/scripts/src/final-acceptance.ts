/**
 * case-close QG-4 完了条件単位最終評価の決定的部分。
 *
 * 本モジュールは I/O を行わない（純関数）。完了条件単位の判定入力（評価区分と
 * 証拠の性質）の構造的整合検査、必須未達の集約、close（completed/closed 遷移）
 * の可否判定を決定的に行う。
 *
 * - 完了条件単位の評価区分 pass / fail / blocked / not applicable を区別し、
 *   not applicable には正規契約上の根拠を要求する
 * - 証拠の意味対応、全称・不存在条件の反例探索、非循環証拠、反例の対象外化、
 *   検証方法変更の同等性を構造的検査で検証する
 * - 必須完了条件に未達が1件でも存在する場合、close を許可しない
 *   （必須未達を Gate 全体の warn 等で通過させない）
 * - 子 Issue の完了は当該子が負う必須条件のみで判定し、親に残る横断義務の
 *   未完了を子の終了判定に含めない。親の横断義務は Epic/Root の最終終了時のみ
 *   評価する
 *
 * 判定値は既存の Gate 判定値（pass / warn / fail / partial）に新しい状態を
 * 追加しない。本モジュールは既存の QG-4 判定手順が消費する決定的検査を提供し、
 * 新しい中央判断ルーター、恒久的な受け入れ義務台帳、新しい品質ゲートを
 * 構成しない。
 */

/** 完了条件単位の評価区分。Gate 判定値ではなく完了条件単位の評価値である。 */
export type ConditionCategory = "pass" | "fail" | "blocked" | "not-applicable";

/** 条件を否定する反例 finding の処置。 */
export type CounterfindingDisposition =
  /** 正規な要件変更、対象範囲変更または項目固有処置で反例を元条件から切り離した。 */
  | "resolved-by-contract-change"
  /** intake、learning、後続 Issue、Findings、別途確認等へ分類しただけ。 */
  | "reclassified-only";

/** 完了条件1件の判定に付随する証拠・根拠の性質。 */
export interface ConditionGrounds {
  /**
   * 判定根拠が根拠となる正規契約から導出または照合されているか。
   * 実装 diff や case-run の自己申告だけを最終基準にした判定は false。
   */
  derivedFromContract?: boolean;
  /** not applicable の根拠が正規契約上に存在するか。 */
  naBasisFromContract?: boolean;
  /**
   * 証拠が条件の意味命題を実際に立証しているか。
   * 条件ID一致、テスト名類似、関連ファイルの検査といった形式的一致のみは false。
   */
  evidenceProvesSemanticProposition?: boolean;
  /** 全称・不存在条件（残存0件、全経路、すべて整合、漏れなし等）の反例探索。 */
  counterexampleSearch?: {
    /** 当該条件が全称・不存在条件である。 */
    applicable: boolean;
    /** 反例探索が正規契約から導出した評価範囲を被覆しているか。 */
    scopeCoversEvaluationRange?: boolean;
  };
  /** 証拠が工程状態（Issue closed、PR merged、QG pass、チェック済み等）であるか。 */
  evidenceUsesProcessState?: boolean;
  /**
   * 工程状態自体が明示的な完了条件であるか（当該条件に限り直接証拠として
   * 利用できる例外の成立）。
   */
  processStateIsExplicitCondition?: boolean;
  /** 条件を否定する反例 finding の処置。 */
  counterfindingDisposition?: CounterfindingDisposition;
  /** 合意済み検証方法を別手段へ変更した場合の同等性確認。 */
  methodChange?: {
    /** 元の検証義務に対して同等以上の観測能力を確認したか。 */
    equivalenceConfirmed?: boolean;
    /** 未証明範囲が増えていないか（true は範囲増加を意味する）。 */
    unprovenScopeIncreased?: boolean;
  };
}

/** 完了条件1件の判定レコード。 */
export interface ConditionVerdict {
  conditionId: string;
  /** 必須完了条件か。close 拒否の対象は必須条件である。 */
  required: boolean;
  category: ConditionCategory;
  grounds: ConditionGrounds;
}

/** Epic/Root が最終終了時に評価する横断義務。 */
export interface CrossObligation {
  obligationId: string;
  satisfied: boolean;
}

/** 評価対象の種別。子 Issue の完了判定と Epic/Root の終了判定で分離する。 */
export type SubjectKind = "child-issue" | "epic" | "root-case";

/** 完了条件単位最終評価の入力。 */
export interface FinalAcceptanceInput {
  subjectKind: SubjectKind;
  verdicts: readonly ConditionVerdict[];
  /**
   * 親横断義務。Epic/Root の最終終了時のみ評価し、子 Issue の完了判定では
   * 参照しない。
   */
  crossObligations?: readonly CrossObligation[];
}

/** 構造的検査で検出した違反。 */
export interface AcceptanceViolation {
  code: ViolationCode;
  conditionId: string;
  detail: string;
}

export type ViolationCode =
  /** 判定根拠が正規契約から導出されていない（自己申告依存）。 */
  | "verdict-derived-from-self-report"
  /** not applicable に正規契約上の根拠がない。 */
  | "not-applicable-without-contract-basis"
  /** 証拠が形式的一致のみで意味命題を立証していない。 */
  | "evidence-formal-match-only"
  /** 全称・不存在条件の反例探索が評価範囲を被覆していない。 */
  | "counterexample-search-scope-insufficient"
  /** 工程状態を成立前提の機能・品質証明へ循環利用している。 */
  | "evidence-circular-process-state"
  /** 反例を分類しただけで当該条件を達成扱いにしている。 */
  | "counterfinding-reclassified-only"
  /** 同等以上の観測能力・未証明範囲の不増を確認できない検証方法変更。 */
  | "verification-method-weakened";

/** 完了条件単位最終評価の結果。 */
export interface FinalAcceptanceResult {
  /** close（completed/closed 遷移）を許可するか。 */
  closeAllowed: boolean;
  violations: AcceptanceViolation[];
  /** close 拒否理由となった必須未達の条件ID。 */
  blockingUnmet: string[];
  /**
   * Epic/Root の最終終了拒否理由となった横断義務ID。子 Issue の完了判定には
   * 影響しない。
   */
  blockingCrossObligations: string[];
}

/**
 * 完了条件単位の判定レコード群を構造的に検査し、close 可否を決定的に判定する。
 *
 * - pass 判定には証拠・根拠の性質検査を適用する（fail / blocked は未達として
 *   集約され、証拠検査の対象にならない）
 * - not applicable は正規契約上の根拠を要求する
 * - 必須条件の未達（fail / blocked / not-applicable）は1件でも close を拒否する
 * - 子 Issue では親横断義務を参照せず、Epic/Root では最終終了時に評価する
 */
export function evaluateFinalAcceptance(
  input: FinalAcceptanceInput,
): FinalAcceptanceResult {
  const violations: AcceptanceViolation[] = [];
  const blockingUnmet: string[] = [];

  for (const verdict of input.verdicts) {
    const g = verdict.grounds;

    if (verdict.category === "pass") {
      if (g.derivedFromContract === false) {
        violations.push({
          code: "verdict-derived-from-self-report",
          conditionId: verdict.conditionId,
          detail: "判定根拠が正規契約から導出・照合されていない（実装 diff や自己申告だけを最終基準にしている）",
        });
      }
      if (g.evidenceProvesSemanticProposition === false) {
        violations.push({
          code: "evidence-formal-match-only",
          conditionId: verdict.conditionId,
          detail: "条件ID一致・テスト名類似・関連ファイル検査といった形式的一致のみを達成証拠としている",
        });
      }
      if (
        g.counterexampleSearch?.applicable === true &&
        g.counterexampleSearch.scopeCoversEvaluationRange !== true
      ) {
        violations.push({
          code: "counterexample-search-scope-insufficient",
          conditionId: verdict.conditionId,
          detail: "全称・不存在条件の反例探索が正規契約から導出した評価範囲を被覆していない",
        });
      }
      if (
        g.evidenceUsesProcessState === true &&
        g.processStateIsExplicitCondition !== true
      ) {
        violations.push({
          code: "evidence-circular-process-state",
          conditionId: verdict.conditionId,
          detail: "工程状態を成立前提である機能・品質・契約条件の証明へ循環利用している",
        });
      }
      if (g.counterfindingDisposition === "reclassified-only") {
        violations.push({
          code: "counterfinding-reclassified-only",
          conditionId: verdict.conditionId,
          detail: "条件を否定する反例を intake・learning・後続 Issue・Findings 等へ分類しただけで当該条件を達成扱いにしている",
        });
      }
      if (
        g.methodChange !== undefined &&
        (g.methodChange.equivalenceConfirmed !== true ||
          g.methodChange.unprovenScopeIncreased === true)
      ) {
        violations.push({
          code: "verification-method-weakened",
          conditionId: verdict.conditionId,
          detail: "同等以上の観測能力と未証明範囲の不増を確認できない検証方法変更を達成証拠にしている",
        });
      }
    }

    if (verdict.category === "not-applicable" && g.naBasisFromContract !== true) {
      violations.push({
        code: "not-applicable-without-contract-basis",
        conditionId: verdict.conditionId,
        detail: "not applicable の正規契約上の根拠が存在しない（未投影・未実装・未検証・証拠不足・検証不能等を根拠にできない）",
      });
    }

    // 必須条件の未達（pass 以外）は1件でも close を拒否する。
    // not applicable も正規契約上の根拠を欠く場合は上記違反に加えて拒否理由になる。
    if (verdict.required && verdict.category !== "pass") {
      blockingUnmet.push(verdict.conditionId);
    }
  }

  // 親横断義務は Epic/Root の最終終了時のみ評価する。
  // 子 Issue の完了判定は当該子が負う必須条件のみで行い、親に残る横断義務の
  // 未完了を理由に条件を満たした子の終了を禁止しない。
  const blockingCrossObligations: string[] = [];
  if (input.subjectKind === "epic" || input.subjectKind === "root-case") {
    for (const obligation of input.crossObligations ?? []) {
      if (!obligation.satisfied) {
        blockingCrossObligations.push(obligation.obligationId);
      }
    }
  }

  const closeAllowed =
    violations.length === 0 &&
    blockingUnmet.length === 0 &&
    blockingCrossObligations.length === 0;

  return { closeAllowed, violations, blockingUnmet, blockingCrossObligations };
}
