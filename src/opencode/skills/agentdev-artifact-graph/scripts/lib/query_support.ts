import type { GraphData, Provenance } from "./model.ts"
import type { TraversalOrientation } from "./tim.ts"

export type QueryRelation = {
  readonly id: string
  readonly type: string
  readonly source: string
  readonly target: string
}

export type CandidateReason = {
  readonly edge: string
  readonly relation_type: string
  readonly direction: TraversalOrientation
}

export type ProfileCandidate = {
  readonly id: string
  readonly path: readonly string[]
  readonly reasons: readonly CandidateReason[]
}

export type CandidateSummary = {
  readonly total_candidates: number
  readonly returned_candidates: number
  readonly limit: number
  readonly truncated: boolean
  readonly note: string
}

export type IndexEntry = {
  readonly edge: string
  readonly relation_type: string
  readonly node: string
}

export type IndexStructure = {
  readonly node: string
  readonly role: string | null
  readonly entries: readonly IndexEntry[]
}

export type QueryResult = {
  readonly nodes: readonly string[]
  readonly edges: readonly string[]
  readonly relations: readonly QueryRelation[]
  readonly provenance: readonly Provenance[]
  readonly discovered?: readonly string[]
  readonly candidates?: readonly ProfileCandidate[]
  readonly summary?: CandidateSummary
  readonly index?: IndexStructure
}

export function relationsFor(graph: GraphData, edgeIds: readonly string[]): readonly QueryRelation[] {
  const idSet = new Set(edgeIds)
  return graph.edges
    .filter((edge) => idSet.has(edge.id))
    .map((edge) => ({ id: edge.id, type: edge.type, source: edge.source, target: edge.target }))
    .sort((left, right) => left.id.localeCompare(right.id))
}

export function evidenceFor(
  graph: GraphData,
  nodeIds: readonly string[],
  edgeIds: readonly string[],
): readonly Provenance[] {
  const provenanceIds = new Set([
    ...graph.nodes.filter((node) => nodeIds.includes(node.id)).map((node) => node.provenance_id),
    ...graph.edges.filter((edge) => edgeIds.includes(edge.id)).map((edge) => edge.provenance_id),
  ])
  return graph.provenance
    .filter((entry) => provenanceIds.has(entry.id))
    .sort((left, right) => left.id.localeCompare(right.id))
}
