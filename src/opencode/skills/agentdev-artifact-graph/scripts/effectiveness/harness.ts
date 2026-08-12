// effectiveness/harness.ts — Graph と独立探索を走らせ、6 指標を計算する中心処理。
//
// 本 harness は diagnostic 目的のみ（REQ-{NNNN}-{NNN}, TS\u002D010）。性能閾値による合否判定は
// 一切行わず、EffectivenessResult を揃えて返すだけである。parser/graph regression は
// REQ-{NNNN} 傘下の tests/*.test.ts が独立に判断可能であり、本 harness は重複しない。
//
// 入力:
//   - rootDir: 計測対象リポジトリのルート絶対パス
//   - graphDir: build_graph.ts が生成した Graph directory（manifest.json 等）
//
// 出力:
//   - HarnessReport（全クエリの EffectivenessResult を格納）

import { resolve } from "node:path"
import { loadGraph } from "../lib/graph.ts"
import { queryGraph } from "../lib/query.ts"
import type { GraphQuery } from "../lib/query.ts"
import type { GraphData, GraphNode, Provenance } from "../lib/model.ts"
import { executeIndependentSearch } from "./independent_search.ts"
import { QUERY_SUITE } from "./queries.ts"
import type {
  ComparisonMetrics,
  EffectivenessQuery,
  EffectivenessResult,
  GraphResultFilter,
  GraphQuerySpec,
  HarnessReport,
} from "./types.ts"

export interface HarnessOptions {
  readonly rootDir: string
  readonly graphDir: string
  /**
   * suite を差し替えたい場合の注入ポイント。省略時は QUERY_SUITE。
   * テストから部分集合を流すのに使う。
   */
  readonly suite?: readonly EffectivenessQuery[]
}

export async function runEffectivenessHarness(options: HarnessOptions): Promise<HarnessReport> {
  const rootDir = resolve(options.rootDir)
  const graphDir = resolve(options.graphDir)
  const suite = options.suite ?? QUERY_SUITE
  const graph = await loadGraph(graphDir)

  const results: EffectivenessResult[] = []
  for (const query of suite) {
    results.push(await runOneQuery(graph, rootDir, query))
  }

  return {
    rootDir,
    graphDir,
    inputDigest: graph.manifest.input_digest,
    executedAt: new Date().toISOString(),
    diagnosticOnly: true,
    results,
  }
}

async function runOneQuery(
  graph: GraphData,
  rootDir: string,
  query: EffectivenessQuery,
): Promise<EffectivenessResult> {
  const pathToNodeId = buildPathToNodeIdMap(graph)
  const { graphResults, graphOps } = await runGraphSide(graph, rootDir, query.graphQuery, pathToNodeId)
  const { independentPaths, independentOps } = await runIndependentSide(rootDir, query.independentSearch)

  const independentResults = independentPaths
    .map((p) => pathToNodeId.get(p))
    .filter((id): id is string => id !== undefined)

  const groundTruth = new Set(query.groundTruth)
  const graphSet = new Set(graphResults)
  const independentSet = new Set(independentResults)

  const metrics = computeMetrics({
    groundTruth,
    graphResults: graphSet,
    independentResults: independentSet,
    graphOps,
    independentOps,
    graph,
  })

  return {
    queryId: query.id,
    category: query.category,
    question: query.question,
    groundTruth: query.groundTruth,
    groundTruthRationale: query.groundTruthRationale,
    graphResults,
    independentResults,
    metrics,
  }
}

interface GraphSideOutcome {
  readonly graphResults: readonly string[]
  readonly graphOps: number
}

async function runGraphSide(
  graph: GraphData,
  rootDir: string,
  spec: GraphQuerySpec,
  pathToNodeId: Map<string, string>,
): Promise<GraphSideOutcome> {
  // Graph API 呼出は常に 1 回（neighbors / path / provenance / discover いずれも）。
  // その後 resultFilter 適用のため graphOps = 1 + (filter 適用有無) とする。
  if (spec.kind === "discover") {
    const q: GraphQuery = {
      kind: "discover",
      term: spec.term,
      roots: spec.roots,
      rootDir,
    }
    const outcome = await queryGraph(graph, q)
    const paths = outcome.discovered ?? []
    // discover はファイルパスを返すため、path → nodeId 変換を経て artifact node 優先で
    // 正規化する。artifact node が存在しないパスは source_file node へ落ちる。
    const asNodeIds = paths
      .map((p) => pathToNodeId.get(p))
      .filter((id): id is string => id !== undefined)
    return { graphResults: applyFilter(asNodeIds, spec.resultFilter, graph), graphOps: 1 }
  }
  // spec.kind === "graph-query"
  const outcome = await queryGraph(graph, spec.query)
  const filtered = applyFilter(outcome.nodes, spec.resultFilter, graph)
  const ops = spec.resultFilter === undefined ? 1 : 2
  return { graphResults: filtered, graphOps: ops }
}

interface IndependentSideOutcome {
  readonly independentPaths: readonly string[]
  readonly independentOps: number
}

async function runIndependentSide(
  rootDir: string,
  spec: EffectivenessQuery["independentSearch"],
): Promise<IndependentSideOutcome> {
  const outcome = await executeIndependentSearch(rootDir, spec)
  return { independentPaths: outcome.matchedPaths, independentOps: outcome.operationCount }
}

function applyFilter(
  nodeIds: readonly string[],
  filter: GraphResultFilter | undefined,
  graph: GraphData,
): readonly string[] {
  if (filter === undefined) return [...nodeIds].sort()
  const includeTypes = filter.includeTypes === undefined ? null : new Set(filter.includeTypes)
  const exclude = new Set(filter.excludeNodes ?? [])
  const typeById = new Map<string, string>()
  for (const n of graph.nodes) typeById.set(n.id, n.type)
  return nodeIds
    .filter((id) => !exclude.has(id))
    .filter((id) => {
      if (includeTypes === null) return true
      const t = typeById.get(id)
      return t !== undefined && includeTypes.has(t)
    })
    .sort()
}

/**
 * Graph の node 一覧から「ファイルパス → node ID」の逆引きマップを構築する。
 *
 * - source_file node: id が `source_file:<path>` 形式なので、<path> をそのままキーにする
 * - artifact node: provenance.path（当該 node を根拠づけるファイルパス）をキーにする
 *   （同一パスに複数 node が紐づく場合、source_file 以外の artifact node を優先する）
 *
 * 独立探索のマッチ路径を node ID 空間へ載せて Graph 結果と比較するために使う。
 */
function buildPathToNodeIdMap(graph: GraphData): Map<string, string> {
  const provenanceById = new Map<string, Provenance>()
  for (const p of graph.provenance) provenanceById.set(p.id, p)

  const pathToNode = new Map<string, string>()
  // 1 pass: artifact node（source_file 以外）を優先
  const artifactNodes = graph.nodes.filter((n: GraphNode) => n.type !== "source_file")
  for (const node of artifactNodes) {
    const prov = provenanceById.get(node.provenance_id)
    if (prov === undefined) continue
    pathToNode.set(prov.path, node.id)
  }
  // 2 pass: source_file node（未登録パスのみ）
  const sourceNodes = graph.nodes.filter((n: GraphNode) => n.type === "source_file")
  for (const node of sourceNodes) {
    // id は `source_file:<path>` 形式
    const path = node.id.slice("source_file:".length)
    if (!pathToNode.has(path)) pathToNode.set(path, node.id)
  }
  return pathToNode
}

interface MetricInputs {
  readonly groundTruth: Set<string>
  readonly graphResults: Set<string>
  readonly independentResults: Set<string>
  readonly graphOps: number
  readonly independentOps: number
  readonly graph: GraphData
}

function computeMetrics(inputs: MetricInputs): ComparisonMetrics {
  const { groundTruth, graphResults, independentResults, graph } = inputs

  const graphHits = intersect(graphResults, groundTruth)
  const independentHits = intersect(independentResults, groundTruth)
  const graphRecall = groundTruth.size === 0 ? 1 : graphHits.size / groundTruth.size
  const independentRecall = groundTruth.size === 0 ? 1 : independentHits.size / groundTruth.size

  const graphFalse = subtract(graphResults, groundTruth)
  const independentFalse = subtract(independentResults, groundTruth)

  const graphCanonicalReach = canonicalReach(graphResults, graph, true)
  const independentCanonicalReach = canonicalReach(independentResults, graph, false)

  // Graph-only miss = 独立探索が見つけたが Graph が見落とした候補
  const graphOnlyMiss = subtract(independentResults, graphResults)
  // Independent-only miss = Graph が見つけたが独立探索が見落とした候補
  const independentOnlyMiss = subtract(graphResults, independentResults)

  return {
    graphRecall,
    independentRecall,
    graphFalseCandidateCount: graphFalse.size,
    independentFalseCandidateCount: independentFalse.size,
    graphCanonicalReach,
    independentCanonicalReach,
    graphOnlyMiss: [...graphOnlyMiss].sort(),
    independentOnlyMiss: [...independentOnlyMiss].sort(),
    searchEffort: {
      graph: inputs.graphOps,
      independent: inputs.independentOps,
    },
  }
}

function intersect(left: Set<string>, right: Set<string>): Set<string> {
  const out = new Set<string>()
  for (const v of left) if (right.has(v)) out.add(v)
  return out
}

function subtract(left: Set<string>, right: Set<string>): Set<string> {
  const out = new Set<string>()
  for (const v of left) if (!right.has(v)) out.add(v)
  return out
}

/**
 * canonical source 到達可能性の代用指標。
 *
 * - Graph 側 (isGraph=true): 結果 node のうち source_file 以外の artifact node の割合。
 *   Graph の source_file node は「ファイル容器」であり、canonical artifact へ到達するには
 *   さらに type 付き node を引く必要があるため、type 付き node の割合を到達性の代用とする。
 * - 独立探索側 (isGraph=false): 独立探索の結果は既に path → nodeId 変換済み。
 *   こちらも source_file 以外の artifact node に正規化できた割合を代用指標とする。
 */
function canonicalReach(nodeIds: Set<string>, graph: GraphData, _isGraph: boolean): number {
  if (nodeIds.size === 0) return 0
  const typeById = new Map<string, string>()
  for (const n of graph.nodes) typeById.set(n.id, n.type)
  let artifactCount = 0
  for (const id of nodeIds) {
    const t = typeById.get(id)
    if (t !== undefined && t !== "source_file") artifactCount += 1
  }
  return artifactCount / nodeIds.size
}
