// ADF-COVERS(verification): REQ-032-031, REQ-032-032, REQ-032-033, REQ-032-034, REQ-032-035, REQ-032-036, REQ-032-037, REQ-032-038
/**
 * Full-route regression for the case-close QG-4 per-completion-condition final
 * acceptance determination (REQ-032-031 ... REQ-032-038).
 *
 * The test drives the deterministic determination consumed by the live route:
 * `src/common/skills/agentdev-workflow-case-close/scripts/src/final-acceptance.ts`
 * is referenced by the case-close STEP-2 reference body
 * (issue-resolution-and-qg4.md) as the decisive structural inspection behind
 * the per-completion-condition final evaluation, and the QG-4 gate reference
 * (qg-4-final-acceptance.md, 検査観点 12) consumes the same function. The
 * false-positive scenarios (FP-1 ... FP-9) assert that the determination
 * rejects each defective acceptance path, the normal route asserts that a
 * fully satisfied subject completes through the very same determination, and
 * the cross-obligation scenarios assert the child/Epic separation
 * (REQ-032-038 second half: a satisfied child is never blocked solely by an
 * unmet parent cross obligation; the Epic/Root stays open until the parent
 * obligations hold).
 *
 * The route connection itself is pinned by reading the reference bodies and
 * asserting the module/function references, so the tests fail if the live
 * route stops consuming this determination.
 */

import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as path from "path";

import {
  evaluateFinalAcceptance,
  type ConditionPopulation,
  type ConditionVerdict,
} from "../src/final-acceptance";

function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(dir, "src", "common"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start);
}

const REPO_ROOT = findRepoRoot(import.meta.dir);

/** 正当な pass 判定の標本（全根拠が正当）。正常系の基盤に使う。 */
function soundPass(conditionId: string, required = true): ConditionVerdict {
  return {
    conditionId,
    required,
    category: "pass",
    grounds: {
      derivedFromContract: true,
      evidenceProvesSemanticProposition: true,
    },
  };
}

/**
 * 取得成功の母集団の標本（正規完了条件から独立取得した状態）。
 * contractConditionCount は正規完了条件総数、requiredCount はそのうち必須の数。
 */
function populated(
  conditionCount: number,
  requiredCount = conditionCount,
  requiredIds?: readonly string[],
): ConditionPopulation {
  return {
    extractionSucceeded: true,
    contractConditionCount: conditionCount,
    contractRequiredCount: requiredCount,
    ...(requiredIds !== undefined ? { contractRequiredConditionIds: requiredIds } : {}),
  };
}

// ---------------------------------------------------------------------------
// 実経路接続の参照関係確認（テストが実経路から利用される判定処理に接続）
// ---------------------------------------------------------------------------

describe("実経路接続の参照関係", () => {
  const reference = fs.readFileSync(
    path.join(
      REPO_ROOT,
      "src",
      "common",
      "skills",
      "agentdev-workflow-case-close",
      "references",
      "issue-resolution-and-qg4.md",
    ),
    "utf-8",
  );
  const qg4Reference = fs.readFileSync(
    path.join(
      REPO_ROOT,
      "src",
      "common",
      "skills",
      "agentdev-quality-gates",
      "references",
      "qg-4-final-acceptance.md",
    ),
    "utf-8",
  );

  test("case-close STEP-2 reference が完了条件単位最終評価の決定的判定処理を実行手順として参照する", () => {
    expect(reference).toContain("scripts/src/final-acceptance.ts");
    expect(reference).toContain("evaluateFinalAcceptance");
    expect(reference).toContain("完了条件単位の最終評価");
  });

  test("reference が本判定処理を既存 QG-4 判定手順の範囲内と明示する（機構追加禁止の境界明示）", () => {
    expect(reference).toContain("既存の QG-4 判定手順が消費する決定的検査であり");
    expect(reference).toContain("新しい品質ゲート、新しい結果状態、恒久的な受け入れ義務台帳を構成しない");
  });

  test("QG-4 gate reference（観点 12）が同一の判定処理を消費する", () => {
    expect(qg4Reference).toContain("### 12. 完了条件単位の最終評価と非循環証拠");
    expect(qg4Reference).toContain("scripts/src/final-acceptance.ts");
    expect(qg4Reference).toContain("evaluateFinalAcceptance");
  });

  test("case-close STEP-3 reference が証拠の追跡可能性保持を既存証拠チャネルで要求する", () => {
    const promotion = fs.readFileSync(
      path.join(
        REPO_ROOT,
        "src",
        "common",
        "skills",
        "agentdev-workflow-case-close",
        "references",
        "docs-and-design-promotion.md",
      ),
      "utf-8",
    );
    expect(promotion).toContain("完了条件証拠の追跡可能性保持");
    expect(promotion).toContain("既存の証拠チャネル");
    expect(promotion).toContain("証拠台帳、専用のメタデータ形式、追加の管理ファイルを新たに導入せず");
  });
});

// ---------------------------------------------------------------------------
// 偽陽性シナリオ（FP-1 〜 FP-9）: 欠陥のある受け入れ経路を全て拒否する
// ---------------------------------------------------------------------------

describe("偽陽性シナリオの拒否", () => {
  test("FP-1: case-run の自己申告だけを最終基準にした pass を拒否する", () => {
    const result = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: populated(1),
      verdicts: [
        {
          conditionId: "AC-1",
          required: true,
          category: "pass",
          grounds: { derivedFromContract: false },
        },
      ],
    });
    expect(result.closeAllowed).toBe(false);
    expect(result.violations.map((v) => v.code)).toContain(
      "verdict-derived-from-self-report",
    );
  });

  test("FP-2: 正規契約に根拠のない not applicable を拒否する", () => {
    const result = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: populated(1),
      verdicts: [
        {
          conditionId: "AC-2",
          required: true,
          category: "not-applicable",
          grounds: { naBasisFromContract: false },
        },
      ],
    });
    expect(result.closeAllowed).toBe(false);
    expect(result.violations.map((v) => v.code)).toContain(
      "not-applicable-without-contract-basis",
    );
    // N/A は必須条件の未達でもある（未達の別名化を禁止する）。
    expect(result.blockingUnmet).toContain("AC-2");
  });

  test("FP-3: 条件ID一致・テスト名類似等の形式的一致のみを達成証拠にした pass を拒否する", () => {
    const result = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: populated(1),
      verdicts: [
        {
          conditionId: "AC-3",
          required: true,
          category: "pass",
          grounds: {
            derivedFromContract: true,
            evidenceProvesSemanticProposition: false,
          },
        },
      ],
    });
    expect(result.closeAllowed).toBe(false);
    expect(result.violations.map((v) => v.code)).toContain(
      "evidence-formal-match-only",
    );
  });

  test("FP-4: 全称条件を変更ファイルのみの確認で達成扱いにした pass を拒否する", () => {
    const result = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: populated(1),
      verdicts: [
        {
          conditionId: "AC-4",
          required: true,
          category: "pass",
          grounds: {
            derivedFromContract: true,
            evidenceProvesSemanticProposition: true,
            counterexampleSearch: {
              applicable: true,
              scopeCoversEvaluationRange: false,
            },
          },
        },
      ],
    });
    expect(result.closeAllowed).toBe(false);
    expect(result.violations.map((v) => v.code)).toContain(
      "counterexample-search-scope-insufficient",
    );
  });

  test("FP-5: 工程状態（PR merged 等）を機能・品質証明へ循環利用した pass を拒否する", () => {
    const result = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: populated(1),
      verdicts: [
        {
          conditionId: "AC-5",
          required: true,
          category: "pass",
          grounds: {
            derivedFromContract: true,
            evidenceProvesSemanticProposition: true,
            evidenceUsesProcessState: true,
            processStateIsExplicitCondition: false,
          },
        },
      ],
    });
    expect(result.closeAllowed).toBe(false);
    expect(result.violations.map((v) => v.code)).toContain(
      "evidence-circular-process-state",
    );
  });

  test("FP-5 但書: 工程状態自体が明示的な完了条件である条件は直接証拠として許可する", () => {
    const result = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: populated(1),
      verdicts: [
        {
          conditionId: "AC-5b",
          required: true,
          category: "pass",
          grounds: {
            derivedFromContract: true,
            evidenceProvesSemanticProposition: true,
            evidenceUsesProcessState: true,
            processStateIsExplicitCondition: true,
          },
        },
      ],
    });
    expect(result.closeAllowed).toBe(true);
    expect(result.violations).toEqual([]);
  });

  test("FP-6: 条件を否定する反例を intake 等へ分類しただけで達成扱いにした pass を拒否する", () => {
    const result = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: populated(1),
      verdicts: [
        {
          conditionId: "AC-6",
          required: true,
          category: "pass",
          grounds: {
            derivedFromContract: true,
            evidenceProvesSemanticProposition: true,
            counterfindingDisposition: "reclassified-only",
          },
        },
      ],
    });
    expect(result.closeAllowed).toBe(false);
    expect(result.violations.map((v) => v.code)).toContain(
      "counterfinding-reclassified-only",
    );
  });

  test("FP-7: 同等性未確認の検証方法変更（通し実行→単体テスト等）による pass を拒否する", () => {
    const weakened = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: populated(1),
      verdicts: [
        {
          conditionId: "AC-7",
          required: true,
          category: "pass",
          grounds: {
            derivedFromContract: true,
            evidenceProvesSemanticProposition: true,
            methodChange: {
              equivalenceConfirmed: false,
              unprovenScopeIncreased: true,
            },
          },
        },
      ],
    });
    expect(weakened.closeAllowed).toBe(false);
    expect(weakened.violations.map((v) => v.code)).toContain(
      "verification-method-weakened",
    );

    const scopeGrown = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: populated(1),
      verdicts: [
        {
          conditionId: "AC-7b",
          required: true,
          category: "pass",
          grounds: {
            derivedFromContract: true,
            evidenceProvesSemanticProposition: true,
            methodChange: {
              equivalenceConfirmed: true,
              unprovenScopeIncreased: true,
            },
          },
        },
      ],
    });
    expect(scopeGrown.closeAllowed).toBe(false);
  });

  test("FP-7 正当変更: 同等以上の観測能力と未証明範囲の不増を確認した変更は許可する", () => {
    const result = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: populated(1),
      verdicts: [
        {
          conditionId: "AC-7c",
          required: true,
          category: "pass",
          grounds: {
            derivedFromContract: true,
            evidenceProvesSemanticProposition: true,
            methodChange: {
              equivalenceConfirmed: true,
              unprovenScopeIncreased: false,
            },
          },
        },
      ],
    });
    expect(result.closeAllowed).toBe(true);
  });

  test("FP-8: 必須条件に fail が1件残る状態での completed/closed 遷移を拒否する", () => {
    const result = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: populated(3),
      verdicts: [
        soundPass("AC-8a"),
        soundPass("AC-8b"),
        {
          conditionId: "AC-8c",
          required: true,
          category: "fail",
          grounds: {},
        },
      ],
    });
    expect(result.closeAllowed).toBe(false);
    expect(result.blockingUnmet).toContain("AC-8c");
  });

  test("FP-9: 必須未達を Gate 全体の warn 相当の緩和入力で通過させない", () => {
    // 判定処理は pass / fail / blocked / not-applicable の 4 区分のみを受理し、
    // warn 相当の緩和区分は存在しない。未達の必須条件はいかなる緩和入力でも
    // close を許可されない。
    const warnLikeAttempts: ConditionVerdict["category"][] = ["fail", "blocked"];
    for (const category of warnLikeAttempts) {
      const result = evaluateFinalAcceptance({
        subjectKind: "child-issue",
      population: populated(1),
        verdicts: [
          {
            conditionId: "AC-9",
            required: true,
            category,
            grounds: {},
          },
        ],
      });
      expect(result.closeAllowed).toBe(false);
    }
    // not-applicable も正規契約上の根拠を欠く場合は緩和として機能しない。
    const naWithoutBasis = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: populated(1),
      verdicts: [
        {
          conditionId: "AC-9b",
          required: true,
          category: "not-applicable",
          grounds: { naBasisFromContract: false },
        },
      ],
    });
    expect(naWithoutBasis.closeAllowed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 母集団の空状態の区別（AC-03）と grounds・母集団照合の拒否（AC-01、AC-02）
// ---------------------------------------------------------------------------

describe("母集団の空状態と grounds 欠落の拒否", () => {
  test("母集団情報が入力に存在しない入力は拒否する（population-missing）", () => {
    const result = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: undefined,
      verdicts: [soundPass("MP-1")],
    } as unknown as Parameters<typeof evaluateFinalAcceptance>[0]);
    expect(result.closeAllowed).toBe(false);
    expect(result.violations.map((v) => v.code)).toContain("population-missing");
    expect(result.populationState).toBe("population-missing");
  });

  test("条件の取得失敗は拒否する（extraction-failed。取得失敗を条件なしへ変換しない）", () => {
    const failedExtraction: ConditionPopulation = {
      extractionSucceeded: false,
      contractConditionCount: null,
      contractRequiredCount: null,
    };
    const result = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: failedExtraction,
      verdicts: [soundPass("EF-1")],
    });
    expect(result.closeAllowed).toBe(false);
    expect(result.violations.map((v) => v.code)).toContain("condition-source-unavailable");
    expect(result.populationState).toBe("extraction-failed");
  });

  test("必須条件があるのに判定配列が空の入力は拒否する（required-conditions-no-verdicts）", () => {
    const result = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: populated(2, 2),
      verdicts: [],
    });
    expect(result.closeAllowed).toBe(false);
    expect(result.violations.map((v) => v.code)).toContain("required-condition-verdict-empty");
    expect(result.populationState).toBe("required-conditions-no-verdicts");
  });

  test("正規契約上の完了条件なしは根拠付きで既存契約どおり処遇する（no-conditions-in-contract）", () => {
    const result = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: {
        extractionSucceeded: true,
        contractConditionCount: 0,
        contractRequiredCount: 0,
        emptyBasis: "Issue 本文に完了条件チェックボックスが存在しない（正規契約上の条件なし）",
      },
      verdicts: [],
    });
    expect(result.closeAllowed).toBe(true);
    expect(result.violations).toEqual([]);
    expect(result.populationState).toBe("no-conditions-in-contract");
  });

  test("正規契約上の完了条件なしの根拠が欠落する空の抽出は拒否する（empty-population-without-basis）", () => {
    const result = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: {
        extractionSucceeded: true,
        contractConditionCount: 0,
        contractRequiredCount: 0,
      },
      verdicts: [],
    });
    expect(result.closeAllowed).toBe(false);
    expect(result.violations.map((v) => v.code)).toContain("empty-population-without-basis");
  });

  test("grounds: {} の欠落入力を pass の根拠として受理しない（AC-02）", () => {
    const result = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: populated(1),
      verdicts: [
        {
          conditionId: "GR-1",
          required: true,
          category: "pass",
          grounds: {},
        },
      ],
    });
    expect(result.closeAllowed).toBe(false);
    const codes = result.violations.map((v) => v.code);
    expect(codes).toContain("verdict-derived-from-self-report");
    expect(codes).toContain("evidence-formal-match-only");
  });

  test("pass 判定で derivedFromContract のみ未設定の入力を拒否する（AC-02）", () => {
    const result = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: populated(1),
      verdicts: [
        {
          conditionId: "GR-2",
          required: true,
          category: "pass",
          grounds: { evidenceProvesSemanticProposition: true },
        },
      ],
    });
    expect(result.closeAllowed).toBe(false);
    expect(result.violations.map((v) => v.code)).toContain("verdict-derived-from-self-report");
  });

  test("pass 判定で evidenceProvesSemanticProposition のみ未設定の入力を拒否する（AC-02）", () => {
    const result = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: populated(1),
      verdicts: [
        {
          conditionId: "GR-3",
          required: true,
          category: "pass",
          grounds: { derivedFromContract: true },
        },
      ],
    });
    expect(result.closeAllowed).toBe(false);
    expect(result.violations.map((v) => v.code)).toContain("evidence-formal-match-only");
  });

  test("照合入力から必須条件を削除しても母集団の ID 突合で欠落を検出する（AC-01）", () => {
    const result = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: populated(3, 3, ["AC-1", "AC-2", "AC-3"]),
      verdicts: [soundPass("AC-1")],
    });
    expect(result.closeAllowed).toBe(false);
    const missing = result.violations.filter(
      (v) => v.code === "verdict-missing-for-contract-condition",
    );
    expect(missing.map((v) => v.conditionId).sort()).toEqual(["AC-2", "AC-3"]);
  });

  test("照合入力から必須条件を削除しても母集団の必須条件数突合で欠落を検出する（ID 一覧未提供。AC-01）", () => {
    const result = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: populated(2, 2),
      verdicts: [soundPass("AC-1")],
    });
    expect(result.closeAllowed).toBe(false);
    expect(result.violations.map((v) => v.code)).toContain(
      "verdict-missing-for-contract-condition",
    );
  });

  test("同一条件の判定重複で必須条件の欠落を隠せない（AC-01）", () => {
    const result = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: populated(2, 2, ["AC-1", "AC-2"]),
      verdicts: [soundPass("AC-1"), soundPass("AC-1")],
    });
    expect(result.closeAllowed).toBe(false);
    expect(result.violations.map((v) => v.code)).toContain("duplicate-condition-verdicts");
    expect(result.violations.map((v) => v.code)).toContain(
      "verdict-missing-for-contract-condition",
    );
  });
});

// ---------------------------------------------------------------------------
// 正常系: 誤完了防止と同じ判定処理・同じ経路で全必須条件成立対象が完了できる
// ---------------------------------------------------------------------------

describe("正常系（全必須条件成立対象の完了許可）", () => {
  test("全必須条件が正当証拠で pass の対象は同一の判定処理で close を許可される", () => {
    const result = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: populated(1),
      verdicts: [
        soundPass("OK-1"),
        {
          conditionId: "OK-2",
          required: false,
          category: "not-applicable",
          grounds: { naBasisFromContract: true },
        },
        {
          conditionId: "OK-3",
          required: false,
          category: "blocked",
          grounds: {},
        },
      ],
    });
    expect(result.closeAllowed).toBe(true);
    expect(result.violations).toEqual([]);
    expect(result.blockingUnmet).toEqual([]);
  });

  test("非必須条件の未達は close を拒否しない（必須完了条件が判定対象）", () => {
    const result = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: populated(1),
      verdicts: [
        soundPass("OK-4"),
        { conditionId: "OK-5", required: false, category: "fail", grounds: {} },
      ],
    });
    expect(result.closeAllowed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 子完了と親横断義務の分離、Epic/Root の最終終了（REQ-032-038 後半）
// ---------------------------------------------------------------------------

describe("子完了と親横断義務の分離・Epic 最終終了", () => {
  test("FN-1（偽陰性拒否）: 条件を満たした子 Issue は親横断義務の未完了だけを理由に終了禁止されない", () => {
    const result = evaluateFinalAcceptance({
      subjectKind: "child-issue",
      population: populated(1),
      verdicts: [soundPass("CH-1")],
      // 子 Issue の完了判定には親横断義務を渡さない（判定が参照しない構造）。
      crossObligations: [
        { obligationId: "X-1", satisfied: false },
      ],
    });
    expect(result.closeAllowed).toBe(true);
    expect(result.blockingCrossObligations).toEqual([]);
  });

  test("Epic は親横断義務が成立するまで終了しない", () => {
    const unmet = evaluateFinalAcceptance({
      subjectKind: "epic",
      population: populated(1, 0),
      verdicts: [soundPass("EP-1", false)],
      crossObligations: [
        { obligationId: "X-1", satisfied: false },
        { obligationId: "X-2", satisfied: true },
      ],
    });
    expect(unmet.closeAllowed).toBe(false);
    expect(unmet.blockingCrossObligations).toContain("X-1");

    const met = evaluateFinalAcceptance({
      subjectKind: "epic",
      population: populated(1, 0),
      verdicts: [soundPass("EP-1", false)],
      crossObligations: [
        { obligationId: "X-1", satisfied: true },
        { obligationId: "X-2", satisfied: true },
      ],
    });
    expect(met.closeAllowed).toBe(true);
  });

  test("Root Case も親横断義務未成立のまま終了しない", () => {
    const result = evaluateFinalAcceptance({
      subjectKind: "root-case",
      population: populated(1, 0),
      verdicts: [soundPass("RT-1", false)],
      crossObligations: [{ obligationId: "X-9", satisfied: false }],
    });
    expect(result.closeAllowed).toBe(false);
    expect(result.blockingCrossObligations).toContain("X-9");
  });

  test("必須未達の Epic は横断義務が成立していても終了しない", () => {
    const result = evaluateFinalAcceptance({
      subjectKind: "epic",
      population: populated(2, 1),
      verdicts: [
        soundPass("EP-2", false),
        { conditionId: "EP-3", required: true, category: "blocked", grounds: {} },
      ],
      crossObligations: [{ obligationId: "X-1", satisfied: true }],
    });
    expect(result.closeAllowed).toBe(false);
    expect(result.blockingUnmet).toContain("EP-3");
  });
});
