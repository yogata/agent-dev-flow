import type { GraphData, GraphEdge, GraphNode } from "./model.ts"
import type { TraceModel } from "./tim.ts"
import type { TruncationInfo } from "./trace_query.ts"
import {
  cyclicComponents,
  directedAdjacency,
  shortestCycleThrough,
  shortestPathCounts,
  undirectedAdjacency,
} from "./trace_graph_analysis.ts"

export const DIAGNOSTICS_KINDS = [
  "isolated",
  "unresolved_relation",
  "superseded_target",
  "constraint_violation",
  "cycle",
  "multiple_paths",
  "relation_concentration",
  "missing_provenance",
] as const
export type DiagnosticsKind = (typeof DIAGNOSTICS_KINDS)[number]

export type DiagnosticsFinding = {
  readonly kind: DiagnosticsKind
  readonly candidate: string
  readonly reason: string
  readonly relation_type: string
  readonly direction: "" | "outgoing" | "incoming"
  readonly path: readonly string[]
}

export type DiagnosticsResult = {
  readonly profile: "diagnostics"
  readonly findings: readonly DiagnosticsFinding[]
  readonly truncation?: TruncationInfo
}

const SUPERSEDED_STATUSES = new Set(["superseded", "retired"])

function isolatedFindings(nodes: readonly GraphNode[], edges: readonly GraphEdge[]): readonly DiagnosticsFinding[] {
  const connected = new Set(edges.flatMap((edge) => [edge.source, edge.target]))
  return nodes
    .filter((node) => !connected.has(node.id))
    .map((node) => ({
      kind: "isolated" as const,
      candidate: node.id,
      reason: "structural observation: node has no relations",
      relation_type: "",
      direction: "" as const,
      path: [node.id],
    }))
}

function unresolvedRelationFindings(nodes: readonly GraphNode[], edges: readonly GraphEdge[]): readonly DiagnosticsFinding[] {
  const nodeIds = new Set(nodes.map((node) => node.id))
  return edges
    .filter((edge) => !nodeIds.has(edge.source) || !nodeIds.has(edge.target))
    .map((edge) => ({
      kind: "unresolved_relation" as const,
      candidate: edge.id,
      reason: `structural observation: relation endpoint is not a node (${!nodeIds.has(edge.source) ? edge.source : edge.target})`,
      relation_type: edge.type,
      direction: "" as const,
      path: [edge.source, edge.target],
    }))
}

function supersededTargetFindings(nodes: readonly GraphNode[], edges: readonly GraphEdge[]): readonly DiagnosticsFinding[] {
  const superseded = new Map(
    nodes
      .filter((node) => node.status !== undefined && SUPERSEDED_STATUSES.has(node.status))
      .map((node) => [node.id, node.status as string]),
  )
  return edges
    .filter((edge) => superseded.has(edge.target) || superseded.has(edge.source))
    .map((edge) => ({
      kind: "superseded_target" as const,
      candidate: edge.id,
      reason: `structural observation: relation touches superseded artifact (${superseded.has(edge.target) ? edge.target : edge.source})`,
      relation_type: edge.type,
      direction: "" as const,
      path: [edge.source, edge.target],
    }))
}

function constraintViolationFindings(
  nodes: readonly GraphNode[],
  edges: readonly GraphEdge[],
  constraints: readonly { readonly relationType: string; readonly allowedSourceTypes: ReadonlySet<string>; readonly allowedTargetTypes: ReadonlySet<string> }[],
): readonly DiagnosticsFinding[] {
  if (constraints.length === 0) return []
  const nodeTypes = new Map(nodes.map((node) => [node.id, node.type]))
  const byType = new Map(constraints.map((constraint) => [constraint.relationType, constraint]))
  const findings: DiagnosticsFinding[] = []
  for (const edge of edges) {
    const constraint = byType.get(edge.type)
    if (constraint === undefined) continue
    const sourceType = nodeTypes.get(edge.source)
    const targetType = nodeTypes.get(edge.target)
    if (sourceType !== undefined && !constraint.allowedSourceTypes.has(sourceType)) {
      findings.push({
        kind: "constraint_violation",
        candidate: edge.id,
        reason: `TIM constraint: source type ${sourceType} not allowed for ${edge.type}`,
        relation_type: edge.type,
        direction: "",
        path: [edge.source, edge.target],
      })
    }
    if (targetType !== undefined && !constraint.allowedTargetTypes.has(targetType)) {
      findings.push({
        kind: "constraint_violation",
        candidate: edge.id,
        reason: `TIM constraint: target type ${targetType} not allowed for ${edge.type}`,
        relation_type: edge.type,
        direction: "",
        path: [edge.source, edge.target],
      })
    }
  }
  return findings
}

function cycleFindings(edges: readonly GraphEdge[]): readonly DiagnosticsFinding[] {
  const adjacency = directedAdjacency(edges)
  const findings: DiagnosticsFinding[] = []
  for (const component of cyclicComponents(edges)) {
    const start = component[0] as string
    const path = shortestCycleThrough(adjacency, component, start)
    if (path !== undefined) {
      findings.push({
        kind: "cycle",
        candidate: start,
        reason: `structural observation: cycle candidate within strongly connected component of ${component.length} nodes`,
        relation_type: "",
        direction: "",
        path,
      })
    }
  }
  return findings
}

function multiplePathsFindings(edges: readonly GraphEdge[], maxDepth: number): readonly DiagnosticsFinding[] {
  const adjacency = undirectedAdjacency(edges)
  const nodeIds = [...adjacency.keys()].sort()
  const findings: DiagnosticsFinding[] = []
  for (const start of nodeIds) {
    const count = shortestPathCounts(adjacency, start, maxDepth)
    for (const [target, paths] of count) {
      if (target > start && paths >= 2) {
        findings.push({
          kind: "multiple_paths",
          candidate: target,
          reason: `structural observation: ${paths} distinct shortest paths from ${start} within depth ${maxDepth}`,
          relation_type: "",
          direction: "",
          path: [start, target],
        })
      }
    }
  }
  return findings
}

function concentrationFindings(
  nodes: readonly GraphNode[],
  edges: readonly GraphEdge[],
  threshold: number,
): readonly DiagnosticsFinding[] {
  const degree = new Map<string, number>()
  for (const edge of edges) {
    degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1)
    degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1)
  }
  return nodes
    .filter((node) => (degree.get(node.id) ?? 0) >= threshold)
    .map((node) => ({
      kind: "relation_concentration" as const,
      candidate: node.id,
      reason: `structural observation: relation degree ${degree.get(node.id) ?? 0} >= threshold ${threshold}`,
      relation_type: "",
      direction: "" as const,
      path: [node.id],
    }))
}

function missingProvenanceFindings(graph: GraphData): readonly DiagnosticsFinding[] {
  const provenanceIds = new Set(graph.provenance.map((entry) => entry.id))
  const findings: DiagnosticsFinding[] = []
  for (const node of graph.nodes) {
    if (!provenanceIds.has(node.provenance_id)) {
      findings.push({
        kind: "missing_provenance",
        candidate: node.id,
        reason: "structural observation: provenance entry missing",
        relation_type: "",
        direction: "",
        path: [node.id],
      })
    }
  }
  for (const edge of graph.edges) {
    if (!provenanceIds.has(edge.provenance_id)) {
      findings.push({
        kind: "missing_provenance",
        candidate: edge.id,
        reason: "structural observation: provenance entry missing",
        relation_type: edge.type,
        direction: "",
        path: [edge.source, edge.target],
      })
    }
  }
  return findings
}

const KIND_ORDER: Readonly<Record<DiagnosticsKind, number>> = Object.fromEntries(
  DIAGNOSTICS_KINDS.map((kind, position) => [kind, position]),
) as Readonly<Record<DiagnosticsKind, number>>

export function runDiagnostics(graph: GraphData, model: TraceModel, limitOverride?: number): DiagnosticsResult {
  const findings = [
    ...isolatedFindings(graph.nodes, graph.edges),
    ...unresolvedRelationFindings(graph.nodes, graph.edges),
    ...supersededTargetFindings(graph.nodes, graph.edges),
    ...constraintViolationFindings(graph.nodes, graph.edges, model.relationConstraints),
    ...cycleFindings(graph.edges),
    ...multiplePathsFindings(graph.edges, model.querySettings.depths.diagnostics),
    ...concentrationFindings(graph.nodes, graph.edges, model.querySettings.concentration_threshold),
    ...missingProvenanceFindings(graph),
  ].sort((left, right) =>
    KIND_ORDER[left.kind] - KIND_ORDER[right.kind] ||
    left.candidate.localeCompare(right.candidate) ||
    left.reason.localeCompare(right.reason),
  )
  const limit = limitOverride ?? model.querySettings.limits.diagnostics
  if (findings.length <= limit) return { profile: "diagnostics", findings }
  return {
    profile: "diagnostics",
    findings: findings.slice(0, limit),
    truncation: {
      total_candidates: findings.length,
      returned_candidates: Math.min(limit, findings.length),
      applied_rules: ["priority:kind_then_candidate"],
      independent_search_available: true,
    },
  }
}
