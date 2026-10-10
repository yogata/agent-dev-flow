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
 * - 受入評価の母集団（終了対象の正規完了条件の取得状態）を入力に受け、
 *   条件の取得失敗・必須条件があるのに判定配列が空・正規契約上の完了条件なしの
 *   3状態を区別する（前二者は close を拒否し、後者は根拠付きで既存契約どおり
 *   処遇する）。母集団情報の欠落、必須条件の判定欠落・重複を検出して close を
 *   拒否する。母集団は終了対象の正規完了条件から独立取得した情報であり、
 *   実行担当の報告（照合入力）から作らない
 * - pass 判定は判定根拠の正規契約導出と証拠の意味命題立証が明示的に確認されて
 *   いることを要求し、未設定（grounds の欠落入力）を許可の根拠にしない
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

/**
 * 受入評価の母集団（終了対象の正規完了条件）の取得状態。
 * 完了条件チェックボックス抽出（close_mechanical_steps.ts の抽出フェーズ）等が
 * 正規完了条件から独立取得した情報であり、実行担当の報告から作らない。
 */
export interface ConditionPopulation {
  /**
   * 正規完了条件の機械的抽出または読取に成功したか。false（条件の取得失敗）
   * は close を拒否する（fail-closed）。抽出失敗を「条件なし」へ変換しない。
   */
  extractionSucceeded: boolean;
  /**
   * 正規契約上の完了条件総数。取得成功時のみ確定する。取得失敗時は
   * null（不明）とし、0（条件なし）に変換しない。
   */
  contractConditionCount: number | null;
  /** 正規契約上の必須完了条件数。取得失敗時は null。 */
  contractRequiredCount: number | null;
  /**
   * 正規必須完了条件の識別子一覧。提供された場合、判定配列との対応照合で
   * 必須条件の判定欠落・重複を検出する。未提供の場合は必須条件数の突合で
   * 欠落を検出する。
   */
  contractRequiredConditionIds?: readonly string[];
  /**
   * 正規契約上の完了条件が存在しないことの根拠（contractConditionCount が 0
   * の場合に正として要求する）。根拠が正規契約から説明できない空の抽出を
   * 「条件なし」として扱わない。
   */
  emptyBasis?: string;
}

/**
 * 母集団の空状態の区分。条件の取得失敗、必須条件があるのに判定配列が空、
 * 正規契約上の完了条件なしの3状態を区別する。
 */
export type PopulationState =
  /** 母集団情報が入力に存在しない。 */
  | "population-missing"
  /** 条件の取得失敗。 */
  | "extraction-failed"
  /** 必須条件が存在するのに判定配列が空。 */
  | "required-conditions-no-verdicts"
  /** 正規契約上の完了条件なし。 */
  | "no-conditions-in-contract"
  /** 母集団あり・判定あり。 */
  | "populated";

/** 評価対象の種別。子 Issue の完了判定と Epic/Root の終了判定で分離する。 */
export type SubjectKind = "child-issue" | "epic" | "root-case";

/** 完了条件単位最終評価の入力。 */
export interface FinalAcceptanceInput {
  subjectKind: SubjectKind;
  /**
   * 受入評価の母集団（終了対象の正規完了条件の取得状態）。実行担当の報告では
   * なく、正規完了条件から独立取得した情報を渡す。未提供は close を拒否する。
   */
  population: ConditionPopulation;
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
  /** 母集団情報が入力に存在しない（母集団の独立取得が行われていない）。 */
  | "population-missing"
  /** 正規完了条件の機械的抽出または読取に失敗した。 */
  | "condition-source-unavailable"
  /** 必須条件が存在するのに判定配列が空。 */
  | "required-condition-verdict-empty"
  /** 正規契約上の完了条件なしの根拠が正として存在しない。 */
  | "empty-population-without-basis"
  /** 正規必須完了条件に対応する判定が存在しない（判定欠落・未判定）。 */
  | "verdict-missing-for-contract-condition"
  /** 同一条件への判定が重複している。 */
  | "duplicate-condition-verdicts"
  /** 判定根拠が正規契約から導出されていない（自己申告依存・未確認を含む）。 */
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
  /** 母集団の空状態の区分（取得失敗・判定空・条件なしの3状態の区別）。 */
  populationState: PopulationState;
}

/**
 * 受入評価の母集団（正規完了条件の取得状態）を検査し、3空状態を区別して
 * 違反を返す。
 *
 * - 母集団情報の欠落 → population-missing（close 拒否）
 * - 条件の取得失敗 → condition-source-unavailable（close 拒否。fail-closed。
 *   抽出失敗を「条件なし」へ変換しない）
 * - 完了条件 0 件 → 根拠（emptyBasis）が正として存在すれば既存契約どおりの
 *   処遇に委ね、根拠がなければ empty-population-without-basis（close 拒否）
 * - 必須条件があるのに判定配列が空 → required-condition-verdict-empty
 * - 必須条件の判定欠落・重複（ID 一覧または必須条件数との突合）→
 *   verdict-missing-for-contract-condition / duplicate-condition-verdicts
 */
function inspectPopulation(
  population: ConditionPopulation | undefined,
  verdicts: readonly ConditionVerdict[],
): AcceptanceViolation[] {
  if (population === undefined) {
    return [
      {
        code: "population-missing",
        conditionId: "population",
        detail: "母集団情報（正規完了条件の取得状態）が入力に存在しない。正規完了条件から母集団を独立取得して受入評価を実行する",
      },
    ];
  }
  if (
    population.extractionSucceeded !== true ||
    population.contractConditionCount === null ||
    population.contractRequiredCount === null
  ) {
    return [
      {
        code: "condition-source-unavailable",
        conditionId: "population",
        detail: "正規完了条件の機械的抽出または読取に失敗している（取得失敗を条件なしや判定対象から除外へ変換せず、fail-closed で close を拒否する）",
      },
    ];
  }
  if (population.contractConditionCount === 0) {
    if (
      typeof population.emptyBasis !== "string" ||
      population.emptyBasis.length === 0
    ) {
      return [
        {
          code: "empty-population-without-basis",
          conditionId: "population",
          detail: "正規契約上の完了条件が存在しないことの根拠が正として存在しない（空の抽出を条件なしとして受理できない）",
        },
      ];
    }
    return [];
  }
  const violations: AcceptanceViolation[] = [];
  if (population.contractRequiredCount > 0 && verdicts.length === 0) {
    violations.push({
      code: "required-condition-verdict-empty",
      conditionId: "population",
      detail: `必須完了条件が ${population.contractRequiredCount} 件存在するのに判定配列が空である（空の判定入力を許可扱いにしない）`,
    });
    return violations;
  }
  if (population.contractRequiredConditionIds !== undefined) {
    const requiredIds = new Set(population.contractRequiredConditionIds);
    const seen = new Map<string, number>();
    for (const verdict of verdicts) {
      seen.set(verdict.conditionId, (seen.get(verdict.conditionId) ?? 0) + 1);
    }
    for (const id of requiredIds) {
      if (!seen.has(id)) {
        violations.push({
          code: "verdict-missing-for-contract-condition",
          conditionId: id,
          detail: "正規必須完了条件に対応する判定が存在しない（照合入力から必須条件を削除しても母集団から欠落を検出する）",
        });
      }
    }
    for (const verdict of verdicts) {
      if (verdict.required && requiredIds.has(verdict.conditionId)) {
        if ((seen.get(verdict.conditionId) ?? 0) > 1) {
          violations.push({
            code: "duplicate-condition-verdicts",
            conditionId: verdict.conditionId,
            detail: "同一条件への判定が重複している（重複した判定で必須条件の欠落を隠せない）",
          });
        }
      }
    }
    return violations;
  }
  const requiredVerdictIds = new Set(
    verdicts.filter((v) => v.required).map((v) => v.conditionId),
  );
  if (requiredVerdictIds.size < population.contractRequiredCount) {
    violations.push({
      code: "verdict-missing-for-contract-condition",
      conditionId: "population",
      detail: `必須完了条件 ${population.contractRequiredCount} 件に対して必須判定が ${requiredVerdictIds.size} 件しか存在しない（照合入力から必須条件を削除しても母集団の必須条件数との突合で欠落を検出する）`,
    });
  }
  return violations;
}

/**
 * 完了条件単位の判定レコード群を構造的に検査し、close 可否を決定的に判定する。
 *
 * - 母集団（正規完了条件の取得状態）を検査し、条件の取得失敗・必須条件がある
 *   のに判定配列が空を close 拒否にし、正規契約上の完了条件なしを根拠付きで
 *   既存契約どおりに処遇する（3空状態の区別）
 * - pass 判定には証拠・根拠の性質検査を適用する（fail / blocked は未達として
 *   集約され、証拠検査の対象にならない）。pass は判定根拠の正規契約導出と
 *   証拠の意味命題立証が明示的に確認されていることを要求し、未設定（grounds
 *   の欠落入力）を許可の根拠にしない
 * - not applicable は正規契約上の根拠を要求する
 * - 必須条件の未達（fail / blocked / not-applicable）は1件でも close を拒否する
 * - 子 Issue では親横断義務を参照せず、Epic/Root では最終終了時に評価する
 */
export function evaluateFinalAcceptance(
  input: FinalAcceptanceInput,
): FinalAcceptanceResult {
  const violations: AcceptanceViolation[] = [];
  const blockingUnmet: string[] = [];

  violations.push(
    ...inspectPopulation(input.population, input.verdicts),
  );

  for (const verdict of input.verdicts) {
    const g = verdict.grounds;

    if (verdict.category === "pass") {
      if (g.derivedFromContract !== true) {
        violations.push({
          code: "verdict-derived-from-self-report",
          conditionId: verdict.conditionId,
          detail: "判定根拠が正規契約から導出・照合されていない（未設定の欠落入力を含む。実装 diff や自己申告だけを最終基準にしている）",
        });
      }
      if (g.evidenceProvesSemanticProposition !== true) {
        violations.push({
          code: "evidence-formal-match-only",
          conditionId: verdict.conditionId,
          detail: "条件ID一致・テスト名類似・関連ファイル検査といった形式的一致のみを達成証拠としている（意味対応評価の未設定の欠落入力を含む）",
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

  const population = input.population;
  const populationState: PopulationState = (() => {
    if (population === undefined) return "population-missing";
    if (
      population.extractionSucceeded !== true ||
      population.contractConditionCount === null ||
      population.contractRequiredCount === null
    ) {
      return "extraction-failed";
    }
    if (population.contractConditionCount === 0) {
      return "no-conditions-in-contract";
    }
    if (population.contractRequiredCount > 0 && input.verdicts.length === 0) {
      return "required-conditions-no-verdicts";
    }
    return "populated";
  })();

  return {
    closeAllowed,
    violations,
    blockingUnmet,
    blockingCrossObligations,
    populationState,
  };
}
