// candidate_limit/semantics.ts — TIM 語彙カタログ定義に基づく候補列挙（REQ-{NNNN}-006 回帰計測用）。
//
// 関係意味とノード役割の正規定義は TIM 語彙カタログ SPEC
// （docs/specs/foundations/traceability-model.md）が正とし、その in-code 実体
// （lib/tim.ts の DEFAULT_RELATION_SEMANTICS + augmentation の意味定義）が
// Graph manifest（relation_semantics、node_type_roles）へ解決結果として保存される。
// 本モジュールは manifest を唯一の意味源泉とし、独自の関係意味表を持たない
// （暫定関係意味表は Issue #2204 のカタログ置換で廃止）。
//
// プロファイル参加導出は Trace Query 実装（lib/trace_query.ts の PROFILES）と同一規則:
// - related: 意味定義済み関係を両方向にたどる
// - impact: 変更影響方向から導出（forward/bidirectional → outgoing、backward/bidirectional → incoming）
// - dependency: deriveProfileParticipation の走行方向から導出（forward → outgoing、reverse → incoming）
// - implementation: 実現系列スロット（realize/satisfy/implement）を両方向にたどる
// - 意味未定義の関係型は高位問い合わせに参加させない（低位問い合わせ限定利用）
// - role が index または aggregation のノードは中間経路と到達点の両方から除外する
//   （TIM SPEC「索引・集約成果物の役割識別」、REQ-040-008）

import type { GraphData } from "../../lib/model.ts"
import {
  deriveProfileParticipation,
  IMPLEMENTATION_SLOTS,
  type NodeTypeRole,
  type RelationSemantics,
} from "../../lib/tim.ts"
import type { HighLevelProfile, LimitCandidate } from "./types.ts"

/** Graph manifest から解決済みの TIM カタログ定義（関係意味・ノード役割）。 */
export type CatalogView = {
  readonly semantics: ReadonlyMap<string, RelationSemantics>
  readonly roles: ReadonlyMap<string, NodeTypeRole>
}

export function catalogOf(graph: GraphData): CatalogView {
  return {
    semantics: new Map(Object.entries(graph.manifest.relation_semantics)),
    roles: new Map(Object.entries(graph.manifest.node_type_roles)),
  }
}

/** 一般参照（意味スロット general_reference）。impact/dependency の探索経路として使用しない。 */
export function isGeneralReference(catalog: CatalogView, relationType: string): boolean {
  return catalog.semantics.get(relationType)?.semantics_slot === "general_reference"
}

/** 索引・集約役割ノードの判定（高位問い合わせの探索経路から除外するノード種）。 */
export function hasIndexAggregationRole(catalog: CatalogView, nodeType: string): boolean {
  const role = catalog.roles.get(nodeType)
  return role === "index" || role === "aggregation"
}

function participates(
  catalog: CatalogView,
  profile: HighLevelProfile,
  relationType: string,
  side: "outgoing" | "incoming",
): boolean {
  const semantics = catalog.semantics.get(relationType)
  if (semantics === undefined) return false
  switch (profile) {
    case "related":
      return true
    case "impact": {
      const direction = semantics.change_impact_direction
      if (side === "outgoing") return direction === "forward" || direction === "bidirectional"
      return direction === "backward" || direction === "bidirectional"
    }
    case "dependency": {
      const orientations = deriveProfileParticipation(semantics).dependency
      return side === "outgoing" ? orientations.includes("forward") : orientations.includes("reverse")
    }
    case "implementation":
      return semantics.semantics_slot !== undefined && IMPLEMENTATION_SLOTS.has(semantics.semantics_slot)
    default: {
      const exhaustive: never = profile
      throw new TypeError(`unsupported profile: ${JSON.stringify(exhaustive)}`)
    }
  }
}

type Arrival = {
  readonly to: string
  readonly relationType: string
  readonly side: "outgoing" | "incoming"
}

function arrivalsFor(graph: GraphData, node: string): readonly Arrival[] {
  const arrivals: Arrival[] = []
  for (const edge of graph.edges) {
    if (edge.source === node) {
      arrivals.push({ to: edge.target, relationType: edge.type, side: "outgoing" })
    }
    if (edge.target === node) {
      arrivals.push({ to: edge.source, relationType: edge.type, side: "incoming" })
    }
  }
  return arrivals.sort((left, right) =>
    `${left.to}\u0000${left.relationType}\u0000${left.side}`.localeCompare(
      `${right.to}\u0000${right.relationType}\u0000${right.side}`,
    ),
  )
}

/**
 * プロファイル意味に従う候補列挙（決定論的 BFS）。
 * - 参加条件を満たす関係のみ辿る
 * - 索引・集約役割ノードは中間経路と到達点の両方から除外する
 * - 同一候補への複数経路は最初の決定論的到達のみ記録する（depth 昇順、到達順安定ソート）
 */
type FrontierNode = {
  readonly node: string
  readonly path: readonly string[]
}

export function semanticCandidates(
  graph: GraphData,
  profile: HighLevelProfile,
  start: string,
  maxDepth: number,
): readonly LimitCandidate[] {
  const catalog = catalogOf(graph)
  const nodeTypes = new Map(graph.nodes.map((node) => [node.id, node.type]))
  const excluded = (node: string): boolean => hasIndexAggregationRole(catalog, nodeTypes.get(node) ?? "")
  const candidates = new Map<string, LimitCandidate>()
  const visited = new Set([start])
  let frontier: readonly FrontierNode[] = [{ node: start, path: [start] }]
  for (let depth = 1; depth <= maxDepth; depth += 1) {
    const next = new Map<string, FrontierNode>()
    for (const current of frontier) {
      for (const arrival of arrivalsFor(graph, current.node)) {
        if (arrival.to === start || visited.has(arrival.to)) continue
        if (excluded(arrival.to)) continue
        if (!participates(catalog, profile, arrival.relationType, arrival.side)) continue
        if (!next.has(arrival.to)) {
          next.set(arrival.to, { node: arrival.to, path: [...current.path, arrival.to] })
        }
        if (!candidates.has(arrival.to)) {
          candidates.set(arrival.to, {
            candidate: arrival.to,
            reason: `${profile} via ${arrival.relationType} (${arrival.side}) at depth ${depth}`,
            relation_type: arrival.relationType,
            direction: arrival.side,
            path: [...current.path, arrival.to],
          })
        }
      }
    }
    for (const entry of next.values()) visited.add(entry.node)
    frontier = [...next.values()].sort((left, right) => left.node.localeCompare(right.node))
  }
  return [...candidates.values()].sort((left, right) => left.candidate.localeCompare(right.candidate))
}
