import type { GraphData } from "./model.ts"
import { deriveProfileParticipation, IMPLEMENTATION_SLOTS, type ProfileKind, type RelationSemantics, type TraceModel } from "./tim.ts"

/**
 * 高位問い合わせの候補5要素 (REQ-{NNNN}-{NNN}/010)。根拠詳細は provenance
 * 低位問い合わせの責務であり、本結果へ重複保持しない。
 */
export type TraceCandidate = {
  readonly candidate: string
  readonly reason: string
  readonly relation_type: string
  readonly direction: "outgoing" | "incoming"
  readonly path: readonly string[]
}

export type TruncationInfo = {
  readonly total_candidates: number
  readonly returned_candidates: number
  readonly applied_rules: readonly string[]
  readonly independent_search_available: true
}

export type TraceQueryResult = {
  readonly profile: ProfileKind
  readonly start: string
  readonly candidates: readonly TraceCandidate[]
  readonly truncation?: TruncationInfo
}

type TraversalSides = { readonly outgoing: boolean; readonly incoming: boolean }

/**
 * 問い合わせプロファイル定義。各プロファイルは TIM 関係意味 (RelationSemantics)
 * から探索方向を導出するデータであり、独立した関係モデルを持たない
 * (REQ-{NNNN}-{NNN}/001、DEC-{N} decision 4, 5)。
 */
type ProfileSpec = {
  readonly sides: (semantics: RelationSemantics) => TraversalSides
  readonly reason: (type: string, semantics: RelationSemantics, side: "outgoing" | "incoming", depth: number) => string
}

const PROFILES: Readonly<Record<Exclude<ProfileKind, "diagnostics">, ProfileSpec>> = {
  related: {
    sides: () => ({ outgoing: true, incoming: true }),
    reason: (type, _semantics, side, depth) => `related via ${type} (${side}) at depth ${depth}`,
  },
  impact: {
    sides: (semantics) => ({
      outgoing:
        semantics.change_impact_direction === "forward" || semantics.change_impact_direction === "bidirectional",
      incoming:
        semantics.change_impact_direction === "backward" || semantics.change_impact_direction === "bidirectional",
    }),
    reason: (type, semantics, _side, depth) =>
      `impact via ${type} (impact=${semantics.change_impact_direction}) at depth ${depth}`,
  },
  dependency: {
    sides: (semantics) => {
      const orientations = deriveProfileParticipation(semantics).dependency
      return {
        outgoing: orientations.includes("forward"),
        incoming: orientations.includes("reverse"),
      }
    },
    reason: (type, semantics, _side, depth) =>
      `depends on via ${type} (dependency=${deriveProfileParticipation(semantics).dependency.join("+")}) at depth ${depth}`,
  },
  implementation: {
    sides: (semantics) => ({
      outgoing: isRealizationSlot(semantics),
      incoming: isRealizationSlot(semantics),
    }),
    reason: (type, semantics, _side, depth) =>
      `realization series via ${type} (slot=${semantics.semantics_slot ?? "unclassified"}) at depth ${depth}`,
  },
}

function isRealizationSlot(semantics: RelationSemantics): boolean {
  return semantics.semantics_slot !== undefined && IMPLEMENTATION_SLOTS.has(semantics.semantics_slot)
}

type Reach = {
  readonly node: string
  readonly distance: number
  readonly path: readonly string[]
  readonly relationType: string
  readonly side: "outgoing" | "incoming"
  readonly semantics: RelationSemantics
}

type StartReach = {
  readonly node: string
  readonly distance: 0
  readonly path: readonly string[]
}

type Visited = Reach | StartReach

function isReach(visited: Visited): visited is Reach {
  return visited.distance > 0
}

type GraphTopology = {
  readonly edgesByNode: ReadonlyMap<string, readonly { readonly edge: GraphEdgeOf; readonly semantics: RelationSemantics; readonly side: "outgoing" | "incoming"; readonly to: string }[]>
  readonly roleExcluded: ReadonlySet<string>
}

type GraphEdgeOf = { readonly type: string; readonly source: string; readonly target: string }

function topology(graph: GraphData, model: TraceModel): GraphTopology {
  const roleExcludedTypes = new Set(
    [...model.nodeRoles.entries()].filter(([, role]) => role === "index" || role === "aggregation").map(([name]) => name),
  )
  const roleExcluded = new Set(graph.nodes.filter((node) => roleExcludedTypes.has(node.type)).map((node) => node.id))
  const edgesByNode = new Map<string, { edge: GraphEdgeOf; semantics: RelationSemantics; side: "outgoing" | "incoming"; to: string }[]>()
  for (const edge of graph.edges) {
    const semantics = model.relationSemantics.get(edge.type)
    if (semantics === undefined) continue
    const outgoing = (edgesByNode.get(edge.source) ?? [])
    outgoing.push({ edge: { type: edge.type, source: edge.source, target: edge.target }, semantics, side: "outgoing", to: edge.target })
    edgesByNode.set(edge.source, outgoing)
    const incoming = (edgesByNode.get(edge.target) ?? [])
    incoming.push({ edge: { type: edge.type, source: edge.source, target: edge.target }, semantics, side: "incoming", to: edge.source })
    edgesByNode.set(edge.target, incoming)
  }
  for (const list of edgesByNode.values()) {
    list.sort((left, right) => `${left.to}:${left.edge.type}`.localeCompare(`${right.to}:${right.edge.type}`))
  }
  return { edgesByNode, roleExcluded }
}

function search(
  topology: GraphTopology,
  spec: ProfileSpec,
  start: string,
  maxDepth: number,
): readonly Reach[] {
  const best = new Map<string, Visited>()
  const startReach: StartReach = { node: start, distance: 0, path: [start] }
  best.set(start, startReach)
  let frontier: readonly Visited[] = [startReach]
  for (let depth = 1; depth <= maxDepth && frontier.length > 0; depth += 1) {
    const next: Reach[] = []
    for (const current of frontier) {
      for (const link of topology.edgesByNode.get(current.node) ?? []) {
        if (!spec.sides(link.semantics)[link.side]) continue
        if (topology.roleExcluded.has(link.to)) continue
        if (best.has(link.to)) continue
        const reach: Reach = {
          node: link.to,
          distance: depth,
          path: [...current.path, link.to],
          relationType: link.edge.type,
          side: link.side,
          semantics: link.semantics,
        }
        best.set(link.to, reach)
        next.push(reach)
      }
    }
    next.sort(compareReach)
    frontier = next
  }
  return [...best.values()].filter(isReach).sort(compareReach)
}

function compareReach(left: Reach, right: Reach): number {
  if (left.distance !== right.distance) return left.distance - right.distance
  return left.path.join(">").localeCompare(right.path.join(">"))
}

export function runTraceQuery(
  graph: GraphData,
  model: TraceModel,
  profile: Exclude<ProfileKind, "diagnostics">,
  start: string,
  limitOverride?: number,
  depthOverride?: number,
): TraceQueryResult {
  const spec = PROFILES[profile]
  const view = topology(graph, model)
  const maxDepth = depthOverride ?? model.querySettings.depths[profile]
  const reaches = search(view, spec, start, maxDepth)
  const candidates: TraceCandidate[] = reaches.map((reach) => ({
    candidate: reach.node,
    reason: spec.reason(reach.relationType, reach.semantics, reach.side, reach.distance),
    relation_type: reach.relationType,
    direction: reach.side,
    path: reach.path,
  }))
  const limit = limitOverride ?? model.querySettings.limits[profile]
  if (candidates.length <= limit) {
    return { profile, start, candidates }
  }
  const applied = ["exclude_index_and_aggregation_nodes", "priority:distance_then_path"]
  return {
    profile,
    start,
    candidates: candidates.slice(0, limit),
    truncation: {
      total_candidates: candidates.length,
      returned_candidates: Math.min(limit, candidates.length),
      applied_rules: applied,
      independent_search_available: true,
    },
  }
}
