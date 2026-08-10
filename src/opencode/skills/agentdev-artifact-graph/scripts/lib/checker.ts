import type { GraphData } from "./model.ts"

export type CheckReport = {
  readonly valid: boolean
  readonly errors: readonly string[]
  readonly warnings: readonly string[]
  readonly info: readonly string[]
}

function duplicateIds(ids: readonly string[], kind: string): readonly string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const id of ids) {
    if (seen.has(id)) duplicates.add(`${kind} has duplicate id: ${id}`)
    seen.add(id)
  }
  return [...duplicates].sort()
}

export function checkGraph(graph: GraphData): CheckReport {
  const nodeIds = new Set(graph.nodes.map((node) => node.id))
  const provenanceIds = new Set(graph.provenance.map((entry) => entry.id))
  const errors = [
    ...duplicateIds(graph.nodes.map((node) => node.id), "node"),
    ...duplicateIds(graph.edges.map((edge) => edge.id), "edge"),
    ...duplicateIds(graph.provenance.map((entry) => entry.id), "provenance"),
  ]
  for (const node of graph.nodes) {
    if (!provenanceIds.has(node.provenance_id)) {
      errors.push(`node ${node.id} has missing provenance: ${node.provenance_id}`)
    }
  }
  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.source)) errors.push(`edge ${edge.id} has missing source: ${edge.source}`)
    if (!nodeIds.has(edge.target)) errors.push(`edge ${edge.id} has missing target: ${edge.target}`)
    if (!provenanceIds.has(edge.provenance_id)) {
      errors.push(`edge ${edge.id} has missing provenance: ${edge.provenance_id}`)
    }
    if (edge.category !== "declared" && edge.category !== "derived") {
      errors.push(`edge ${edge.id} has forbidden category: ${edge.category}`)
    }
  }
  const warnings = graph.diagnostics
    .filter((entry) => entry.severity === "warning")
    .map((entry) => `${entry.code}: ${entry.message}`)
  const info = graph.diagnostics
    .filter((entry) => entry.severity === "observation")
    .map((entry) => `${entry.code}: ${entry.message}`)
  errors.push(
    ...graph.diagnostics
      .filter((entry) => entry.severity === "error")
      .map((entry) => `${entry.code}: ${entry.message}`),
  )
  return { valid: errors.length === 0, errors: errors.sort(), warnings: warnings.sort(), info: info.sort() }
}
