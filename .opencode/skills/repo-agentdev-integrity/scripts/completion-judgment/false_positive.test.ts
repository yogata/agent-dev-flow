// ADF-COVERS(verification): REQ-110-003
// 検証器自身の偽陽性確認の恒常 test。合格とすべき正常系投入と反例投入の双方で、
// 不合格の合格化と正常系の誤不合格化の双方を確認する。
// 偽陽性が存在する場合は検証器側を fail として扱う（REQ-110-003）。
// 偽陽性注入シミュレーションにより、確認手続き自体が偽陽性を検出して
// verifier-fail と判定できることを実証する。

import { describe, expect, test } from "bun:test";
import {
  aggregateVerdict,
  buildNormalClaims,
  evaluateClaim,
  INJECTABLE_CASE_IDS,
  verifyDetector,
  type ClaimDetector,
  type CompletionClaim,
  type IsolationFacts,
  type IsolationFactsProvider,
  type Verdict,
} from "./case-catalog.ts";
import {
  createIsolatedCase,
  fixtureIncompleteMigration,
  fixtureMissingAdoptedArtifact,
  fixtureMissingRelationTarget,
} from "./isolation.ts";

const healthyDetector: ClaimDetector = (claim) => aggregateVerdict(evaluateClaim(claim));

// fs 実体を伴う反例は隔離環境へ実際に投入し、模擬環境の fs 状態から投入事実を導出する。
const FS_FACT_CASE_IDS = new Set(["G4-X01", "G4-X07", "G4-X11"]);
const factsProvider: IsolationFactsProvider = async (caseId) => {
  if (!FS_FACT_CASE_IDS.has(caseId)) return {};
  const isolated = await createIsolatedCase(caseId.toLowerCase());
  try {
    if (caseId === "G4-X01") return await fixtureMissingAdoptedArtifact(isolated);
    if (caseId === "G4-X07") return await fixtureMissingRelationTarget(isolated);
    const facts: IsolationFacts = await fixtureIncompleteMigration(isolated);
    return facts;
  } finally {
    await isolated.cleanup();
  }
};

describe("検証器偽陽性の確認（正常系投入）", () => {
  test("正常系投入は期待判定どおりとなる（誤不合格化なし）", () => {
    const normalClaims = buildNormalClaims();
    expect(normalClaims.length).toBeGreaterThan(0);
    for (const entry of normalClaims) {
      expect(healthyDetector(entry.claim)).toBe(entry.expectedVerdict);
    }
  });
});

describe("検証器偽陽性の確認（反例投入）", () => {
  test("隔離環境への反例投入は合格と判定されない（不合格の合格化なし）", async () => {
    const result = await verifyDetector(
      healthyDetector,
      buildNormalClaims(),
      INJECTABLE_CASE_IDS,
      factsProvider,
    );
    expect(result.detectorVerdict).toBe("healthy");
    expect(result.falsePositives.length).toBe(0);
  });
});

describe("検証器偽陽性の確認（偽陽性注入シミュレーション）", () => {
  test("反例を合格とする検証器は verifier-fail として検出される", async () => {
    // G4-X02（根拠のない設計宣言）を誤って合格とする壊れた検証器。
    const brokenDetector: ClaimDetector = (claim) => {
      if (
        claim.designDeclarations.length > 0 &&
        claim.designDeclarations.every((d) => d.basisRef === null)
      ) {
        return "accept";
      }
      return healthyDetector(claim);
    };
    const result = await verifyDetector(
      brokenDetector,
      buildNormalClaims(),
      INJECTABLE_CASE_IDS,
      factsProvider,
    );
    expect(result.detectorVerdict).toBe("verifier-fail");
    const falsePass = result.falsePositives.find((p) => p.caseId === "G4-X02");
    expect(falsePass?.kind).toBe("false-pass");
  });

  test("正常系を誤不合格化する検証器は verifier-fail として検出される", async () => {
    // 必須成果物の申告を含む正常系を誤って拒否する壊れた検証器。
    const brokenDetector: ClaimDetector = (claim: CompletionClaim): Verdict =>
      claim.declaredArtifacts.some((a) => a.declaredRequired && a.filePresent)
        ? "reject"
        : healthyDetector(claim);
    const result = await verifyDetector(
      brokenDetector,
      buildNormalClaims(),
      INJECTABLE_CASE_IDS,
      factsProvider,
    );
    expect(result.detectorVerdict).toBe("verifier-fail");
    const falseFail = result.falsePositives.find((p) => p.kind === "false-fail");
    expect(falseFail).toBeDefined();
  });
});
