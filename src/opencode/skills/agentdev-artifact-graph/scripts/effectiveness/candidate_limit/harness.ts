// candidate_limit/harness.ts — 代表ケース実行と回帰判定の中心処理（REQ-{NNNN}-006）。
//
// effectiveness/ 本体（代表質問回帰、REQ-{NNNN}-003）が diagnostic 専用であるのに対し、
// 本 harness は回帰試験として合否判定を行う:
// - 必須候補の欠落なし（正常代表ケースの必須候補を上限適用後も欠落させない）
// - README 等を経由した既知の候補増幅の再現（意味フィルタなし巡回との差分）
// - 一般参照・変更影響なし関係の誤通過なし（impact/dependency の意味分離）
// - 候補数上限の境界不変式（上限直前、上限一致、上限超過）
// - 根拠分離（根拠詳細は根拠問い合わせ側にのみ存在）

import { loadGraph } from "../../lib/graph.ts"
import { queryGraph } from "../../lib/query.ts"
import type { GraphData, Provenance } from "../../lib/model.ts"
import { executeIndependentSearch } from "../independent_search.ts"
import { applyCandidateLimit, DEFAULT_CANDIDATE_LIMIT } from "./limit.ts"
import { roleOf, semanticsFor, semanticCandidates } from "./semantics.ts"
import { CANDIDATE_LIMIT_CASES } from "./cases.ts"
import type {
  LimitCandidate,
  LimitResult,
  QuerySettings,
  RepresentativeCase,
} from "./types.ts"

export interface HarnessOptions {
  readonly rootDir: string
  readonly graphDir: string
  readonly settings?: QuerySettings
  readonly cases?: readonly RepresentativeCase[]
}

export interface BoundaryProbe {
  readonly below: LimitResult | null
  readonly at: LimitResult
  readonly above: LimitResult
}

export interface CaseReport {
  readonly caseId: string
  readonly profile: RepresentativeCase["profile"]
  readonly caseClass: RepresentativeCase["caseClass"]
  readonly semanticCount: number
  readonly naiveCount: number
  readonly amplifiedCount: number
  readonly independentCount: number
  readonly excludedByRuleCount: number
  readonly limitResult: LimitResult
  readonly requiredMissing: readonly string[]
  readonly graphOnlyMiss: readonly string[]
  readonly independentOnlyMiss: readonly string[]
  readonly generalReferenceFalsePass: readonly string[]
  readonly boundary: BoundaryProbe | null
  readonly failures: readonly string[]
}

export interface RegressionReport {
  readonly rootDir: string
  readonly graphDir: string
  readonly inputDigest: string
  readonly executedAt: string
  readonly settings: QuerySettings
  readonly recommendedStandardLimit: number
  readonly defaultLimitSufficient: boolean
  readonly cases: readonly CaseReport[]
  readonly passed: boolean
  readonly failures: readonly string[]
}

export async function runCandidateLimitHarness(options: HarnessOptions): Promise<RegressionReport> {
  const rootDir = options.rootDir
  const graph = await loadGraph(options.graphDir)
  const settings = options.settings ?? { candidate_limit: DEFAULT_CANDIDATE_LIMIT }
  const cases = options.cases ?? CANDIDATE_LIMIT_CASES
  const pathToNodeId = buildPathToNodeIdMap(graph)
  const indexRoleCandidates = new Set(
    graph.nodes.filter((node) => roleOf(node.type) === "index_aggregation").map((node) => node.id),
  )
  const semanticByCase = new Map<string, readonly LimitCandidate[]>(
    cases.map((c) => [c.id, semanticCandidates(graph, c.profile, c.start, c.depth)]),
  )

  const caseReports: CaseReport[] = []
  for (const representative of cases) {
    caseReports.push(
      await runOneCase(graph, rootDir, representative, settings, pathToNodeId, indexRoleCandidates, semanticByCase.get(representative.id) ?? []),
    )
  }

  const failures = caseReports.flatMap((report) => report.failures.map((f) => `${report.caseId}: ${f}`))
  const recommendedStandardLimit = recommendLimit(cases, semanticByCase, indexRoleCandidates)
  return {
    rootDir,
    graphDir: options.graphDir,
    inputDigest: graph.manifest.input_digest,
    executedAt: new Date().toISOString(),
    settings,
    recommendedStandardLimit,
    defaultLimitSufficient: settings.candidate_limit >= recommendedStandardLimit,
    cases: caseReports,
    passed: failures.length === 0,
    failures,
  }
}

async function runOneCase(
  graph: GraphData,
  rootDir: string,
  representative: RepresentativeCase,
  settings: QuerySettings,
  pathToNodeId: Map<string, string>,
  indexRoleCandidates: ReadonlySet<string>,
  semantic: readonly LimitCandidate[],
): Promise<CaseReport> {
  const limitResult = applyCandidateLimit(
    representative.profile,
    representative.start,
    semantic,
    settings,
    indexRoleCandidates,
  )

  const naive = await queryGraph(graph, { kind: "neighbors", node: representative.start, depth: representative.depth })
  const naiveIds = naive.nodes.filter((id) => id !== representative.start)

  const independentOutcome = await executeIndependentSearch(rootDir, {
    kind: "grep",
    pattern: representative.independentSearchPattern,
    roots: ["docs", "src/opencode", ".agentdev/extensions"],
    extensions: [".md", ".yaml", ".yml"],
  })
  const independentIds = independentOutcome.matchedPaths
    .map((p) => pathToNodeId.get(p))
    .filter((id): id is string => id !== undefined)

  const semanticIds = semantic.map((c) => c.candidate)
  const semanticSet = new Set(semanticIds)
  const independentSet = new Set(independentIds)
  const returnedSet = new Set(limitResult.candidates.map((c) => c.candidate))

  const amplified = naiveIds.filter((id) => !semanticSet.has(id))
  const requiredMissing = representative.requiredCandidates.filter((id) => !returnedSet.has(id))
  const graphOnlyMiss = independentIds.filter((id) => !semanticSet.has(id))
  const independentOnlyMiss = semanticIds.filter((id) => !independentSet.has(id))
  const directionSensitiveProfile = representative.profile === "impact" || representative.profile === "dependency"
  const generalReferenceFalsePass = directionSensitiveProfile
    ? semantic
      .filter((c) => semanticsFor(c.relation_type).general_reference)
      .map((c) => c.candidate)
    : []

  const boundary = semantic.length === 0
    ? null
    : probeBoundary(representative, semantic, indexRoleCandidates)

  const failures: string[] = []
  if (requiredMissing.length > 0) failures.push(`必須候補の欠落: ${requiredMissing.join(", ")}`)
  if (amplified.length < representative.minAmplifiedCount) {
    failures.push(`既知の候補増幅の未再現: amplified=${amplified.length} < ${representative.minAmplifiedCount}`)
  }
  if (generalReferenceFalsePass.length > 0) {
    failures.push(`一般参照の誤通過: ${generalReferenceFalsePass.join(", ")}`)
  }
  if (semantic.length === 0 && limitResult.truncation !== undefined) {
    failures.push("空結果への truncation 付与（空結果は正常な空結果として扱う）")
  }
  if (boundary !== null) failures.push(...checkBoundaryInvariants(boundary, semantic, indexRoleCandidates))
  failures.push(...checkCandidateForm(limitResult, representative.start))

  return {
    caseId: representative.id,
    profile: representative.profile,
    caseClass: representative.caseClass,
    semanticCount: semantic.length,
    naiveCount: naiveIds.length,
    amplifiedCount: amplified.length,
    independentCount: independentIds.length,
    excludedByRuleCount: semantic.length - limitResult.candidates.length,
    limitResult,
    requiredMissing,
    graphOnlyMiss,
    independentOnlyMiss,
    generalReferenceFalsePass,
    boundary,
    failures,
  }
}

function probeBoundary(
  representative: RepresentativeCase,
  semantic: readonly LimitCandidate[],
  indexRoleCandidates: ReadonlySet<string>,
): BoundaryProbe {
  const count = semantic.length
  const run = (limit: number): LimitResult =>
    applyCandidateLimit(representative.profile, representative.start, semantic, { candidate_limit: limit }, indexRoleCandidates)
  return {
    below: count >= 1 ? run(count - 1) : null,
    at: run(count),
    above: run(count + 1),
  }
}

/**
 * 上限直前・上限一致・上限超過の境界不変式（候補過多時の返却5項目を含む）。
 * 上限直前は「除外規則の適用で上限内に収まった場合（過多時5項目なし・生存候補全件返却）」
 * を正当な結果として受理する（契約: 除外規則適用後も上限を超える場合にのみ過多時5項目）。
 */
export function checkBoundaryInvariants(
  probe: BoundaryProbe,
  semantic: readonly LimitCandidate[],
  indexRoleCandidates: ReadonlySet<string>,
): readonly string[] {
  const semanticCount = semantic.length
  const expectedSurviving = semantic.filter(
    (c) => !(indexRoleCandidates.has(c.candidate) && c.path.length > 2),
  )
  const failures: string[] = []
  const { below, at, above } = probe
  if (at.truncation !== undefined || at.candidates.length !== semanticCount) {
    failures.push(`上限一致で全候補返却されていない (returned=${at.candidates.length}/${semanticCount})`)
  }
  if (above.truncation !== undefined || above.candidates.length !== semanticCount) {
    failures.push(`上限+1で全候補返却されていない (returned=${above.candidates.length}/${semanticCount})`)
  }
  if (semanticCount === 0) return failures
  if (below === null) {
    failures.push("境界試験の上限直前ケースが欠落")
    return failures
  }
  const truncation = below.truncation
  if (truncation === undefined) {
    if (below.candidates.length === semanticCount) {
      failures.push("上限-1で全候補返却されている（上限不履行）")
    } else if (below.candidates.length !== expectedSurviving.length) {
      failures.push(
        `上限-1の返却候補数が除外規則の適用結果と不一致 (returned=${below.candidates.length}, expected=${expectedSurviving.length})`,
      )
    } else if (expectedSurviving.length === semanticCount) {
      failures.push("上限-1で truncation がない（黙切的切り捨ての疑い）")
    }
    return failures
  }
  if (truncation.too_many !== true) failures.push("truncation.too_many が true でない")
  if (truncation.total_candidates !== semanticCount) failures.push("truncation.total_candidates 不一致")
  if (truncation.returned_candidates !== below.candidates.length) failures.push("truncation.returned_candidates 不一致")
  if (truncation.applied_rules.length === 0) failures.push("truncation.applied_rules が空")
  if (truncation.independent_search_available !== true) failures.push("独立探索移行可が true でない")
  if (below.candidates.length >= semanticCount) failures.push("上限-1で返却候補数が全候補数未満になっていない")
  return failures
}

/** 結果5要素（候補、理由、関係型、探索方向、到達経路）と根拠分離の形式検証。 */
export function checkCandidateForm(result: LimitResult, start: string): readonly string[] {
  const failures: string[] = []
  for (const candidate of result.candidates) {
    if (candidate.candidate.length === 0) failures.push(`候補 ID が空 (${candidate.reason})`)
    if (candidate.reason.length === 0) failures.push(`理由が空 (${candidate.candidate})`)
    if (candidate.relation_type.length === 0) failures.push(`関係型が空 (${candidate.candidate})`)
    if (candidate.direction !== "outgoing" && candidate.direction !== "incoming") {
      failures.push(`探索方向が不正 (${candidate.candidate})`)
    }
    if (candidate.path.length < 2 || candidate.path[0] !== start) {
      failures.push(`到達経路が起点から始まっていない (${candidate.candidate})`)
    }
    if (candidate.path[candidate.path.length - 1] !== candidate.candidate) {
      failures.push(`到達経路が候補で終わっていない (${candidate.candidate})`)
    }
  }
  const serialized = JSON.stringify(result.candidates)
  for (const evidenceField of ["provenance", "matched_text", "line_start", "element_id"]) {
    if (serialized.includes(`"${evidenceField}"`)) {
      failures.push(`根拠詳細フィールド (${evidenceField}) が高位問い合わせ結果に重複保持されている`)
    }
  }
  return failures
}

/** 必須候補を全ケースで保持する最小上限値（標準上限値決定の根拠値）。 */
function recommendLimit(
  cases: readonly RepresentativeCase[],
  semanticByCase: ReadonlyMap<string, readonly LimitCandidate[]>,
  indexRoleCandidates: ReadonlySet<string>,
): number {
  const maxSemantic = Math.max(...cases.map((c) => semanticByCase.get(c.id)?.length ?? 0), 1)
  for (let limit = 1; limit <= maxSemantic; limit += 1) {
    const allPreserved = cases.every((c) => {
      const semantic = semanticByCase.get(c.id) ?? []
      const result = applyCandidateLimit(c.profile, c.start, semantic, { candidate_limit: limit }, indexRoleCandidates)
      const returned = new Set(result.candidates.map((candidate) => candidate.candidate))
      return c.requiredCandidates.every((id) => returned.has(id))
    })
    if (allPreserved) return limit
  }
  return maxSemantic
}

/** ファイルパス → node ID の逆引き（独立探索結果の比較用）。 */
function buildPathToNodeIdMap(graph: GraphData): Map<string, string> {
  const provenanceById = new Map<string, Provenance>()
  for (const p of graph.provenance) provenanceById.set(p.id, p)
  const pathToNode = new Map<string, string>()
  for (const node of graph.nodes.filter((n) => n.type !== "source_file")) {
    const prov = provenanceById.get(node.provenance_id)
    if (prov !== undefined) pathToNode.set(prov.path, node.id)
  }
  for (const node of graph.nodes.filter((n) => n.type === "source_file")) {
    const path = node.id.slice("source_file:".length)
    if (!pathToNode.has(path)) pathToNode.set(path, node.id)
  }
  return pathToNode
}
