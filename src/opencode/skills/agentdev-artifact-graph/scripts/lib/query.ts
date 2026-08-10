import type { GraphData, GraphEdge, Provenance } from "./model.ts"
import { readdir, readFile, stat } from "node:fs/promises"
import type { Dirent } from "node:fs"
import { join } from "node:path"

export type GraphQuery =
  | { readonly kind: "neighbors"; readonly node: string; readonly depth: number }
  | { readonly kind: "path"; readonly source: string; readonly target: string; readonly maxDepth: number }
  | { readonly kind: "provenance"; readonly id: string }
  | { readonly kind: "discover"; readonly term: string; readonly roots: readonly string[]; readonly rootDir: string }

export type QueryRelation = {
  readonly id: string
  readonly type: string
  readonly source: string
  readonly target: string
}

export type QueryResult = {
  readonly nodes: readonly string[]
  readonly edges: readonly string[]
  readonly relations: readonly QueryRelation[]
  readonly provenance: readonly Provenance[]
  readonly discovered?: readonly string[]
}

function relationsFor(graph: GraphData, edgeIds: readonly string[]): readonly QueryRelation[] {
  const idSet = new Set(edgeIds)
  return graph.edges
    .filter((edge) => idSet.has(edge.id))
    .map((edge) => ({ id: edge.id, type: edge.type, source: edge.source, target: edge.target }))
    .sort((left, right) => left.id.localeCompare(right.id))
}

function evidenceFor(graph: GraphData, nodeIds: readonly string[], edgeIds: readonly string[]): readonly Provenance[] {
  const provenanceIds = new Set([
    ...graph.nodes.filter((node) => nodeIds.includes(node.id)).map((node) => node.provenance_id),
    ...graph.edges.filter((edge) => edgeIds.includes(edge.id)).map((edge) => edge.provenance_id),
  ])
  return graph.provenance
    .filter((entry) => provenanceIds.has(entry.id))
    .sort((left, right) => left.id.localeCompare(right.id))
}

function adjacent(edges: readonly GraphEdge[], node: string): readonly { readonly node: string; readonly edge: string }[] {
  return edges.flatMap((edge) => {
    if (edge.source === node) return [{ node: edge.target, edge: edge.id }]
    if (edge.target === node) return [{ node: edge.source, edge: edge.id }]
    return []
  }).sort((left, right) => `${left.node}:${left.edge}`.localeCompare(`${right.node}:${right.edge}`))
}

function provenanceResult(graph: GraphData, id: string): QueryResult {
  const node = graph.nodes.find((candidate) => candidate.id === id)
  const edge = graph.edges.find((candidate) => candidate.id === id)
  const provenanceId = node?.provenance_id ?? edge?.provenance_id
  const edgeIds = edge === undefined ? [] : [edge.id]
  return {
    nodes: node === undefined ? [] : [node.id],
    edges: edgeIds,
    relations: relationsFor(graph, edgeIds),
    provenance: provenanceId === undefined ? [] : graph.provenance.filter((entry) => entry.id === provenanceId),
  }
}

function neighborResult(graph: GraphData, start: string, maxDepth: number): QueryResult {
  const visited = new Set([start])
  const edgeIds = new Set<string>()
  let frontier = [start]
  for (let depth = 0; depth < maxDepth && frontier.length > 0; depth += 1) {
    const next = new Set<string>()
    for (const current of frontier) {
      for (const neighbor of adjacent(graph.edges, current)) {
        edgeIds.add(neighbor.edge)
        if (!visited.has(neighbor.node)) next.add(neighbor.node)
      }
    }
    for (const node of next) visited.add(node)
    frontier = [...next].sort()
  }
  const nodes = [...visited].sort()
  const edges = [...edgeIds].sort()
  return { nodes, edges, relations: relationsFor(graph, edges), provenance: evidenceFor(graph, nodes, edges) }
}

function pathResult(graph: GraphData, source: string, target: string, maxDepth: number): QueryResult {
  const queue: { readonly node: string; readonly nodes: readonly string[]; readonly edges: readonly string[] }[] = [
    { node: source, nodes: [source], edges: [] },
  ]
  const visited = new Set([source])
  while (queue.length > 0) {
    const current = queue.shift()
    if (current === undefined) break
    if (current.node === target) {
      return { nodes: current.nodes, edges: current.edges, relations: relationsFor(graph, current.edges), provenance: evidenceFor(graph, current.nodes, current.edges) }
    }
    if (current.edges.length >= maxDepth) continue
    for (const neighbor of adjacent(graph.edges, current.node)) {
      if (visited.has(neighbor.node)) continue
      visited.add(neighbor.node)
      queue.push({
        node: neighbor.node,
        nodes: [...current.nodes, neighbor.node],
        edges: [...current.edges, neighbor.edge],
      })
    }
  }
  return { nodes: [], edges: [], relations: [], provenance: [] }
}

async function walkDir(root: string, dir: string, results: string[]): Promise<void> {
  let entries: Dirent[]
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      await walkDir(root, full, results)
    } else if (entry.isFile()) {
      results.push(full.slice(root.length + 1).replace(/\\/g, "/"))
    }
  }
}

async function discoverResult(query: { readonly term: string; readonly roots: readonly string[]; readonly rootDir: string }): Promise<QueryResult> {
  const term = query.term.toLowerCase()
  const matches: string[] = []
  for (const relRoot of query.roots) {
    const absRoot = join(query.rootDir, relRoot)
    let exists = false
    try {
      const s = await stat(absRoot)
      exists = s.isDirectory()
    } catch {
      exists = false
    }
    if (!exists) continue
    const files: string[] = []
    await walkDir(query.rootDir, absRoot, files)
    for (const file of files.sort()) {
      try {
        const content = await readFile(join(query.rootDir, file), "utf8")
        if (content.toLowerCase().includes(term) || file.toLowerCase().includes(term)) {
          matches.push(file)
        }
      } catch {
        // skip unreadable
      }
    }
  }
  return { nodes: [], edges: [], relations: [], provenance: [], discovered: matches.sort() }
}

export async function queryGraph(graph: GraphData, query: GraphQuery): Promise<QueryResult> {
  switch (query.kind) {
    case "neighbors":
      return neighborResult(graph, query.node, query.depth)
    case "path":
      return pathResult(graph, query.source, query.target, query.maxDepth)
    case "provenance":
      return provenanceResult(graph, query.id)
    case "discover":
      return discoverResult(query)
    default:
      return assertNever(query)
  }
}

function assertNever(value: never): never {
  throw new TypeError(`Unexpected query: ${JSON.stringify(value)}`)
}
