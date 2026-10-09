// ADF-COVERS(verification): REQ-110-002, REQ-110-003
// G4 反例投入ハーネス: 反例カタログ（Design 期待挙動表の正投影）、模擬申告構造、
// 識別規則、検証器偽陽性の確認手続き。
// 正規原本: docs/designs/quality/v5-completion-judgment.md「G4 反例カタログ（期待挙動表）」節
// 台帳: docs/reports/adf-v5-completion-conditions-ledger.md「G4 反例投入ハーネス」節
// 識別規則は Design の期待挙動表と REQ の義務行から導出する（実装の実行結果から生成しない）。

export type ExpectedBehavior = "reject" | "reserve" | "recover" | "verifier-fail";
export type Verdict = "accept" | "reject" | "reserve" | "recover";

export interface CounterexampleCase {
  readonly id: string;
  readonly name: string;
  readonly expectedBehavior: ExpectedBehavior;
  readonly basisReqLines: readonly string[];
}

// Design「G4 反例カタログ（期待挙動表）」14 行の正投影（行順・名称・期待挙動とも一致させる）。
export const G4_COUNTEREXAMPLE_CASES: readonly CounterexampleCase[] = [
  { id: "G4-X01", name: "採用成果物の欠落", expectedBehavior: "reject", basisReqLines: ["REQ-104-004"] },
  { id: "G4-X02", name: "根拠のない設計宣言", expectedBehavior: "reject", basisReqLines: ["REQ-105-004"] },
  { id: "G4-X03", name: "版不明（依拠上流の版が特定不能）", expectedBehavior: "reject", basisReqLines: ["REQ-106-001", "REQ-106-003"] },
  { id: "G4-X04", name: "空の対応関係", expectedBehavior: "reject", basisReqLines: ["REQ-106-005"] },
  { id: "G4-X05", name: "中間版依拠", expectedBehavior: "reserve", basisReqLines: ["REQ-106-007"] },
  { id: "G4-X06", name: "古い証拠（現行対象・版・条件への適用性未確認）", expectedBehavior: "reject", basisReqLines: ["REQ-107-008"] },
  { id: "G4-X07", name: "追跡先欠落・参照不整合", expectedBehavior: "reject", basisReqLines: ["REQ-107-004"] },
  { id: "G4-X08", name: "Issueなし経路の誤ったIssue強制", expectedBehavior: "reject", basisReqLines: ["REQ-107-001"] },
  { id: "G4-X09", name: "未充足依存", expectedBehavior: "reserve", basisReqLines: ["REQ-108-007"] },
  { id: "G4-X10", name: "権限不足", expectedBehavior: "reserve", basisReqLines: ["REQ-108-010"] },
  { id: "G4-X11", name: "移行情報欠落", expectedBehavior: "reject", basisReqLines: ["REQ-109-005"] },
  { id: "G4-X12", name: "中断（有限作業の未完了再開）", expectedBehavior: "recover", basisReqLines: ["REQ-108-006"] },
  { id: "G4-X13", name: "再実行（冪等性・重複実行）", expectedBehavior: "recover", basisReqLines: ["REQ-108-013"] },
  { id: "G4-X14", name: "検証器偽陽性（反例を合格と誤判定）", expectedBehavior: "verifier-fail", basisReqLines: ["REQ-110-003"] },
];

// G4-X14 は反例投入ではなく検証器偽陽性の確認手続きそのものであるため、
// 投入シナリオの対象から除外する。
export const INJECTABLE_CASE_IDS: readonly string[] = G4_COUNTEREXAMPLE_CASES
  .filter((c) => c.expectedBehavior !== "verifier-fail")
  .map((c) => c.id);

// 反例投入が模擬環境のファイル実体を伴う反例の投入事実。
// isolation.ts が模擬環境を構築し、実際の fs 状態から導出する。
export interface IsolationFacts {
  // G4-X01: 必須採用成果物として宣言され、実体が存在しない成果物名。
  readonly requiredArtifactMissing?: { readonly name: string };
  // G4-X07: 対応関係の参照先が存在しないエントリ。
  readonly missingRelationTarget?: { readonly source: string; readonly target: string };
  // G4-X11: 移行必須情報として列挙され、移行先に存在しない情報名。
  readonly migrationMissing?: readonly string[];
}

export interface DeclaredArtifact {
  readonly name: string;
  readonly declaredRequired: boolean;
  readonly filePresent: boolean;
}

export interface DesignDeclaration {
  readonly subject: string;
  // 設計の根拠となる採用規約が認める成果物への参照。null は根拠のない設計宣言。
  readonly basisRef: string | null;
}

export interface DiffBasis {
  readonly baseVersion: string | null;
  readonly alternativeReconciliationBasis: boolean;
}

export interface RelationEntry {
  readonly source: string;
  readonly target: string;
  readonly targetExists: boolean;
}

export interface EvidenceEntry {
  readonly ref: string;
  readonly applicabilityConfirmed: boolean;
}

export interface DependencyEntry {
  readonly id: string;
  readonly satisfied: boolean;
  readonly predecessorStopped: boolean;
}

export interface ExternalSideEffect {
  readonly requested: boolean;
  readonly permissionConfirmed: boolean;
}

export interface MigrationReport {
  readonly infoComplete: boolean;
}

export interface InterruptionState {
  readonly occurred: boolean;
  readonly resumableFromCanonicalInput: boolean;
}

export interface ReexecutionState {
  readonly idempotent: boolean;
  readonly duplicateSideEffects: boolean;
}

// 完遂申告の構造化模擬表現。識別規則の投入入力であり、完遂判定器そのものではない。
export interface CompletionClaim {
  readonly declaredArtifacts: readonly DeclaredArtifact[];
  readonly designDeclarations: readonly DesignDeclaration[];
  readonly diffBasis: DiffBasis;
  readonly relationMap: readonly RelationEntry[];
  readonly evidence: readonly EvidenceEntry[];
  readonly intermediateVersionDependentDownstream: boolean;
  readonly assertsNoImpact: boolean;
  readonly forcesNonexistentDetailStage: boolean;
  readonly dependencies: readonly DependencyEntry[];
  readonly externalSideEffect: ExternalSideEffect | null;
  readonly migration: MigrationReport | null;
  readonly interruption: InterruptionState | null;
  readonly reexecution: ReexecutionState | null;
}

export interface MatchedRule {
  readonly caseId: string;
  readonly verdict: Exclude<Verdict, "accept">;
  readonly basisReqLines: readonly string[];
}

interface DetectorRule {
  readonly caseId: string;
  readonly verdict: Exclude<Verdict, "accept">;
  readonly basisReqLines: readonly string[];
  readonly matches: (claim: CompletionClaim) => boolean;
}

// 識別規則。各規則の根拠義務行（basisReqLines）は REQ の義務行であり、
// 規則本文は当該義務行の禁止・要求の反例側を識別する条件として導出した。
const DETECTOR_RULES: readonly DetectorRule[] = [
  {
    caseId: "G4-X01",
    verdict: "reject",
    basisReqLines: ["REQ-104-004"],
    matches: (c) =>
      c.declaredArtifacts.some((a) => a.declaredRequired && !a.filePresent),
  },
  {
    caseId: "G4-X02",
    verdict: "reject",
    basisReqLines: ["REQ-105-004"],
    matches: (c) => c.designDeclarations.some((d) => d.basisRef === null),
  },
  {
    caseId: "G4-X03",
    verdict: "reject",
    basisReqLines: ["REQ-106-001", "REQ-106-003"],
    matches: (c) =>
      c.diffBasis.baseVersion === null && !c.diffBasis.alternativeReconciliationBasis,
  },
  {
    caseId: "G4-X04",
    verdict: "reject",
    basisReqLines: ["REQ-106-005"],
    matches: (c) => c.assertsNoImpact && c.relationMap.length === 0,
  },
  {
    caseId: "G4-X05",
    verdict: "reserve",
    basisReqLines: ["REQ-106-007"],
    matches: (c) => c.intermediateVersionDependentDownstream,
  },
  {
    caseId: "G4-X06",
    verdict: "reject",
    basisReqLines: ["REQ-107-008"],
    matches: (c) => c.evidence.some((e) => !e.applicabilityConfirmed),
  },
  {
    caseId: "G4-X07",
    verdict: "reject",
    basisReqLines: ["REQ-107-004"],
    matches: (c) => c.relationMap.some((r) => !r.targetExists),
  },
  {
    caseId: "G4-X08",
    verdict: "reject",
    basisReqLines: ["REQ-107-001"],
    matches: (c) => c.forcesNonexistentDetailStage,
  },
  {
    caseId: "G4-X09",
    verdict: "reserve",
    basisReqLines: ["REQ-108-007"],
    matches: (c) =>
      c.dependencies.some((d) => !d.satisfied && d.predecessorStopped),
  },
  {
    caseId: "G4-X10",
    verdict: "reserve",
    basisReqLines: ["REQ-108-010"],
    matches: (c) =>
      c.externalSideEffect !== null &&
      c.externalSideEffect.requested &&
      !c.externalSideEffect.permissionConfirmed,
  },
  {
    caseId: "G4-X11",
    verdict: "reject",
    basisReqLines: ["REQ-109-005"],
    matches: (c) => c.migration !== null && !c.migration.infoComplete,
  },
  {
    caseId: "G4-X12",
    verdict: "recover",
    basisReqLines: ["REQ-108-006"],
    matches: (c) =>
      c.interruption !== null &&
      c.interruption.occurred &&
      c.interruption.resumableFromCanonicalInput,
  },
  {
    caseId: "G4-X12-reject",
    verdict: "reject",
    basisReqLines: ["REQ-108-006"],
    matches: (c) =>
      c.interruption !== null &&
      c.interruption.occurred &&
      !c.interruption.resumableFromCanonicalInput,
  },
  {
    caseId: "G4-X13",
    verdict: "recover",
    basisReqLines: ["REQ-108-013"],
    matches: (c) =>
      c.reexecution !== null &&
      c.reexecution.idempotent &&
      !c.reexecution.duplicateSideEffects,
  },
  {
    caseId: "G4-X13-reject",
    verdict: "reject",
    basisReqLines: ["REQ-108-013"],
    matches: (c) =>
      c.reexecution !== null &&
      (!c.reexecution.idempotent || c.reexecution.duplicateSideEffects),
  },
];

// 申告に合致した識別規則をすべて返す。
export function evaluateClaim(claim: CompletionClaim): MatchedRule[] {
  const matched: MatchedRule[] = [];
  for (const rule of DETECTOR_RULES) {
    if (rule.matches(claim)) {
      matched.push({
        caseId: rule.caseId,
        verdict: rule.verdict,
        basisReqLines: rule.basisReqLines,
      });
    }
  }
  return matched;
}

// 複数規則が合致した場合の集約。最も厳しい判定を優先する
// （1 つでも拒否事由があれば拒否、拒否事由がなければ留保、留保もなければ回復）。
export function aggregateVerdict(rules: readonly MatchedRule[]): Verdict {
  if (rules.some((r) => r.verdict === "reject")) return "reject";
  if (rules.some((r) => r.verdict === "reserve")) return "reserve";
  if (rules.some((r) => r.verdict === "recover")) return "recover";
  return "accept";
}

// G4-X12 / G4-X13 の規則は recover と reject の分岐を同じ反例系列に持つ。
// 投入シナリオは recover 分岐を期待挙動とするため、分岐接尾辞を除いた識別子へ正規化する。
export function canonicalCaseId(caseId: string): string {
  const suffixIndex = caseId.indexOf("-reject");
  if (suffixIndex < 0) return caseId;
  return caseId.slice(0, suffixIndex);
}

// 正常系（合格とすべき入力）。識別規則が誤って拒否・留保しない健全な申告。
// expectedVerdict は入力の性質に対する正しい判定であり、中断からの正規再開は
// 回復（recover）が正しい判定値となる。
export interface NormalClaimEntry {
  readonly label: string;
  readonly claim: CompletionClaim;
  readonly expectedVerdict: Verdict;
}

export function buildNormalClaims(): readonly NormalClaimEntry[] {
  return [
    {
      label: "健全な完遂申告（中断・再実行なし）",
      claim: {
        declaredArtifacts: [
          { name: "requirements/REQ-104.md", declaredRequired: true, filePresent: true },
        ],
        designDeclarations: [
          { subject: "工程構成", basisRef: "docs/designs/foundations/system.md" },
        ],
        diffBasis: { baseVersion: "abc1234", alternativeReconciliationBasis: false },
        relationMap: [
          { source: "a.md", target: "b.md", targetExists: true },
        ],
        evidence: [
          { ref: "run-log-001", applicabilityConfirmed: true },
        ],
        intermediateVersionDependentDownstream: false,
        assertsNoImpact: false,
        forcesNonexistentDetailStage: false,
        dependencies: [
          { id: "dep-1", satisfied: true, predecessorStopped: false },
        ],
        externalSideEffect: null,
        migration: null,
        interruption: null,
        reexecution: null,
      },
      expectedVerdict: "accept",
    },
    {
      label: "代替整合確認つき申告と正規再開・冪等再実行",
      claim: {
        declaredArtifacts: [],
        designDeclarations: [],
        // 比較基準を特定できない場合、代替整合確認の対象・結果・判断根拠が示されていれば
        // その確認範囲で判断できる（REQ-106-003）。
        diffBasis: { baseVersion: null, alternativeReconciliationBasis: true },
        relationMap: [],
        evidence: [],
        intermediateVersionDependentDownstream: false,
        assertsNoImpact: false,
        forcesNonexistentDetailStage: false,
        dependencies: [],
        externalSideEffect: {
          requested: true,
          permissionConfirmed: true,
        },
        migration: { infoComplete: true },
        interruption: { occurred: true, resumableFromCanonicalInput: true },
        reexecution: { idempotent: true, duplicateSideEffects: false },
      },
      expectedVerdict: "recover",
    },
  ];
}

// 反例投入シナリオの申告を構築する。fsFacts は模擬環境から導出した実体事実。
export function buildCounterexampleClaim(
  caseId: string,
  fsFacts: IsolationFacts,
): CompletionClaim {
  switch (caseId) {
    case "G4-X01":
      return {
        ...emptyClaim(),
        declaredArtifacts: [
          {
            name: fsFacts.requiredArtifactMissing?.name ?? "missing-artifact.md",
            declaredRequired: true,
            filePresent: fsFacts.requiredArtifactMissing === undefined,
          },
        ],
      };
    case "G4-X02":
      return {
        ...emptyClaim(),
        designDeclarations: [{ subject: "設計妥当性", basisRef: null }],
      };
    case "G4-X03":
      return {
        ...emptyClaim(),
        diffBasis: { baseVersion: null, alternativeReconciliationBasis: false },
      };
    case "G4-X04":
      return {
        ...emptyClaim(),
        assertsNoImpact: true,
        relationMap: [],
      };
    case "G4-X05":
      return {
        ...emptyClaim(),
        intermediateVersionDependentDownstream: true,
      };
    case "G4-X06":
      return {
        ...emptyClaim(),
        evidence: [{ ref: "old-evidence-001", applicabilityConfirmed: false }],
      };
    case "G4-X07": {
      const entry = fsFacts.missingRelationTarget ?? { source: "a.md", target: "b.md" };
      return {
        ...emptyClaim(),
        relationMap: [
          { source: entry.source, target: entry.target, targetExists: false },
        ],
      };
    }
    case "G4-X08":
      return {
        ...emptyClaim(),
        forcesNonexistentDetailStage: true,
      };
    case "G4-X09":
      return {
        ...emptyClaim(),
        dependencies: [{ id: "dep-pre", satisfied: false, predecessorStopped: true }],
      };
    case "G4-X10":
      return {
        ...emptyClaim(),
        externalSideEffect: { requested: true, permissionConfirmed: false },
      };
    case "G4-X11":
      return {
        ...emptyClaim(),
        migration: { infoComplete: (fsFacts.migrationMissing ?? []).length === 0 },
      };
    case "G4-X12":
      return {
        ...emptyClaim(),
        interruption: { occurred: true, resumableFromCanonicalInput: true },
      };
    case "G4-X13":
      return {
        ...emptyClaim(),
        reexecution: { idempotent: true, duplicateSideEffects: false },
      };
    default:
      throw new Error(`unknown caseId: ${caseId}`);
  }
}

function emptyClaim(): CompletionClaim {
  return {
    declaredArtifacts: [],
    designDeclarations: [],
    diffBasis: { baseVersion: "base", alternativeReconciliationBasis: false },
    relationMap: [
      { source: "a.md", target: "b.md", targetExists: true },
    ],
    evidence: [{ ref: "evidence-001", applicabilityConfirmed: true }],
    intermediateVersionDependentDownstream: false,
    assertsNoImpact: false,
    forcesNonexistentDetailStage: false,
    dependencies: [{ id: "dep-1", satisfied: true, predecessorStopped: false }],
    externalSideEffect: null,
    migration: null,
    interruption: null,
    reexecution: null,
  };
}

export interface DetectorFalsePositive {
  readonly caseId: string;
  readonly kind: "false-pass" | "false-fail";
  readonly detail: string;
}

export interface DetectorCheckResult {
  // healthy は偽陽性 0 件。verifier-fail は検証器側を fail として扱う判定（REQ-110-003）。
  readonly detectorVerdict: "healthy" | "verifier-fail";
  readonly falsePositives: readonly DetectorFalsePositive[];
}

export type ClaimDetector = (claim: CompletionClaim) => Verdict;

// 投入事実プロバイダ。fs 実体を伴う反例（X01/X07/X11）は
// 隔離環境（isolation.ts の模擬環境）から実際の fs 状態を導出して返す。
export type IsolationFactsProvider = (caseId: string) => Promise<IsolationFacts>;

// 検証器偽陽性の確認手続き。合格とすべき正常系投入と反例投入の双方を
// 隔離環境へ実行し、不合格の合格化（false-pass）と正常系の誤不合格化（false-fail）を確認する。
// 偽陽性が存在する場合は検証器側を fail として扱う（REQ-110-003）。
export async function verifyDetector(
  detector: ClaimDetector,
  normalClaims: readonly NormalClaimEntry[],
  injectableCaseIds: readonly string[],
  factsProvider: IsolationFactsProvider,
): Promise<DetectorCheckResult> {
  const falsePositives: DetectorFalsePositive[] = [];

  for (const caseEntry of G4_COUNTEREXAMPLE_CASES) {
    if (!injectableCaseIds.includes(caseEntry.id)) continue;
    const facts = await factsProvider(caseEntry.id);
    const claim = buildCounterexampleClaim(caseEntry.id, facts);
    const verdict = detector(claim);
    if (verdict === caseEntry.expectedBehavior) continue;
    falsePositives.push({
      caseId: caseEntry.id,
      kind: "false-pass",
      detail: `反例 ${caseEntry.id} が verdict=${verdict} と判定された（期待 ${caseEntry.expectedBehavior}）`,
    });
  }

  for (const entry of normalClaims) {
    const verdict = detector(entry.claim);
    if (verdict === entry.expectedVerdict) continue;
    falsePositives.push({
      caseId: entry.label,
      kind: "false-fail",
      detail: `正常系投入が verdict=${verdict} と判定された（期待 ${entry.expectedVerdict}）`,
    });
  }

  return {
    detectorVerdict: falsePositives.length === 0 ? "healthy" : "verifier-fail",
    falsePositives,
  };
}
