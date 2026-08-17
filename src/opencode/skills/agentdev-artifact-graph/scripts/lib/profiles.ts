import type { GraphData, GraphEdge, Manifest } from "./model.ts"
import { evidenceFor, relationsFor, type CandidateReason, type CandidateSummary, type IndexEntry, type IndexStructure, type QueryResult } from "./query_support.ts"
import { deriveProfileParticipation, type ProfileParticipation, type RelationSemantics, type TraversalOrientation } from "./tim.ts"

/**
 * Default candidate limit for purpose-specific queries. The limit is a
 * query-time setting (overridable via --limit), never a regeneration condition.
 * The standard value is provisional until REQ-{NNNN} regression picks a final one.
 */
export const DEFAULT_PROFILE_LIMIT = 200
export const DEFAULT_PROFILE_DEPTH = 2

export type ProfileName = "related" | "impact" | "dependency" | "implementation"

type ParticipationEntry = {
  readonly semantics: RelationSemantics
  readonly participation: ProfileParticipation
}

function participationByType(manifest: Manifest): ReadonlyMap<string, ParticipationEntry> {
  const map = new Map<string, ParticipationEntry>()
  for (const [type, semantics] of Object.entries(manifest.relation_semantics)) {
    map.set(type, { semantics, participation: deriveProfileParticipation(semantics) })
  }
  return map
}

/**
 * Orientations traversable at `edge` when walking from `node`, derived from
 * the relation's declared meaning. `undefined` means the link does not
 * participate in the profile from this node.
 */
function orientationsAt(
  edge: GraphEdge,
  node: string,
  profile: ProfileName,
  participation: ReadonlyMap<string, ParticipationEntry>,
): readonly TraversalOrientation[] | undefined {
  const entry = participation.get(edge.type)
  if (entry === undefined) return undefined
  const isSource = edge.source === node
  const isTarget = edge.target === node
  if (!isSource && !isTarget) return undefined
  const directions: TraversalOrientation[] = []
  switch (profile) {
    case "related":
      directions.push("forward", "reverse")
      break
    case "impact": {
      const d = entry.semantics.change_impact_direction
      if (d === "forward" || d === "bidirectional") directions.push("forward")
      if (d === "backward" || d === "bidirectional") directions.push("reverse")
      break
    }
    case "dependency":
      directions.push(...entry.participation.dependency)
      break
    case "implementation":
      directions.push(...entry.participation.implementation)
      break
  }
  const usable = directions.filter((direction) =>
    direction === "forward" ? isSource : isTarget,
  )
  return usable.length > 0 ? usable : undefined
}

type Reach = {
  readonly path: readonly string[]
  readonly reasons: readonly CandidateReason[]
}

function profileResult(
  graph: GraphData,
  profile: ProfileName,
  start: string,
  maxDepth: number,
  limit: number,
): QueryResult {
  const participation = participationByType(graph.manifest)
  const nodeIds = new Set(graph.nodes.map((node) => node.id))
  const emptySummary: CandidateSummary = {
    total_candidates: 0,
    returned_candidates: 0,
    limit,
    truncated: false,
    note: "",
  }
  if (!nodeIds.has(start)) {
    return { nodes: [], edges: [], relations: [], provenance: [], candidates: [], summary: emptySummary }
  }
  const reached = new Map<string, Reach>([[start, { path: [start], reasons: [] }]])
  const order: string[] = [start]
  let frontier = [start]
  for (let depth = 0; depth < maxDepth && frontier.length > 0; depth += 1) {
    const next = new Map<string, { path: readonly string[]; reasons: CandidateReason[] }>()
    for (const current of frontier) {
      const currentReach = reached.get(current)
      if (currentReach === undefined) continue
      for (const edge of graph.edges) {
        const orientations = orientationsAt(edge, current, profile, participation)
        if (orientations === undefined) continue
        const neighbor = orientations.includes("forward") ? edge.target : edge.source
        if (neighbor === current || reached.has(neighbor)) continue
        const reasons = orientations.map((direction) => ({
          edge: edge.id,
          relation_type: edge.type,
          direction,
        }))
        const existing = next.get(neighbor)
        if (existing === undefined) {
          next.set(neighbor, { path: [...currentReach.path, neighbor], reasons })
        } else {
          existing.reasons.push(...reasons)
        }
      }
    }
    frontier = [...next.keys()].sort()
    for (const node of frontier) {
      const info = next.get(node)
      if (info === undefined) continue
      reached.set(node, info)
      order.push(node)
    }
  }

  const all = order.filter((node) => node !== start)
  const truncated = all.length > limit
  const returned = truncated ? all.slice(0, limit) : all
  const candidates = returned.map((node) => {
    const reach = reached.get(node)
    const deduped = new Map<string, CandidateReason>()
    for (const r of reach?.reasons ?? []) deduped.set(`${r.edge}:${r.direction}`, r)
    return {
      id: node,
      path: reach?.path ?? [node],
      reasons: [...deduped.values()].sort((left, right) =>
        `${left.edge}:${left.direction}`.localeCompare(`${right.edge}:${right.direction}`)
      ),
    }
  })
  const includedNodes = [start, ...returned]
  const edgeIds = new Set(candidates.flatMap((candidate) => candidate.reasons.map((r) => r.edge)))
  const summary: CandidateSummary = {
    total_candidates: all.length,
    returned_candidates: returned.length,
    limit,
    truncated,
    note: truncated
      ? "candidate limit reached; narrow the query or verify with independent search (rg, filesystem)"
      : "",
  }
  return {
    nodes: includedNodes,
    edges: [...edgeIds].sort(),
    relations: relationsFor(graph, [...edgeIds].sort()),
    provenance: evidenceFor(graph, includedNodes, [...edgeIds]),
    candidates,
    summary,
  }
}

function indexResult(graph: GraphData, node: string): QueryResult {
  const target = graph.nodes.find((candidate) => candidate.id === node)
  if (target === undefined) {
    return { nodes: [], edges: [], relations: [], provenance: [], index: { node, role: null, entries: [] } }
  }
  const role = graph.manifest.node_type_roles[target.type] ?? null
  const participation = participationByType(graph.manifest)
  const entries: IndexEntry[] = graph.edges
    .filter((edge) => {
      if (edge.source !== node) return false
      const entry = participation.get(edge.type)
      return entry?.semantics.semantics_slot === "general_reference"
    })
    .map((edge) => ({ edge: edge.id, relation_type: edge.type, node: edge.target }))
    .sort((left, right) => left.node.localeCompare(right.node))
  const edgeIds = entries.map((entry) => entry.edge)
  const entryNodes = entries.map((entry) => entry.node)
  const index: IndexStructure = { node, role, entries }
  return {
    nodes: [node, ...entryNodes].sort(),
    edges: [...edgeIds].sort(),
    relations: relationsFor(graph, [...edgeIds].sort()),
    provenance: evidenceFor(graph, [node, ...entryNodes], [...edgeIds]),
    index,
  }
}

export function runProfileQuery(
  graph: GraphData,
  query: { readonly profile: ProfileName; readonly node: string; readonly depth: number; readonly limit: number },
): QueryResult {
  return profileResult(graph, query.profile, query.node, query.depth, query.limit)
}

export function runIndexQuery(graph: GraphData, node: string): QueryResult {
  return indexResult(graph, node)
}
