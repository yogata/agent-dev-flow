import type { GraphEdge } from "./model.ts"

export function directedAdjacency(edges: readonly GraphEdge[]): ReadonlyMap<string, readonly string[]> {
  const adjacency = new Map<string, string[]>()
  for (const edge of edges) {
    const list = adjacency.get(edge.source) ?? []
    list.push(edge.target)
    adjacency.set(edge.source, list)
  }
  for (const list of adjacency.values()) list.sort()
  return adjacency
}

export function undirectedAdjacency(edges: readonly GraphEdge[]): ReadonlyMap<string, readonly string[]> {
  const adjacency = new Map<string, string[]>()
  for (const edge of edges) {
    const out = adjacency.get(edge.source) ?? []
    out.push(edge.target)
    adjacency.set(edge.source, out)
    const inc = adjacency.get(edge.target) ?? []
    inc.push(edge.source)
    adjacency.set(edge.target, inc)
  }
  for (const list of adjacency.values()) list.sort()
  return adjacency
}

/** Iterative Tarjan SCC restricted to components that imply directed cycles. */
export function cyclicComponents(edges: readonly GraphEdge[]): readonly (readonly string[])[] {
  const adjacency = directedAdjacency(edges)
  const nodeIds = [...new Set(edges.flatMap((edge) => [edge.source, edge.target]))].sort()
  const index = new Map<string, number>()
  const low = new Map<string, number>()
  const onStack = new Set<string>()
  const stack: string[] = []
  const components: string[][] = []
  let counter = 0
  for (const root of nodeIds) {
    if (index.has(root)) continue
    const work: { readonly node: string; readonly next: readonly string[]; readonly position: number }[] = [
      { node: root, next: adjacency.get(root) ?? [], position: 0 },
    ]
    index.set(root, counter)
    low.set(root, counter)
    counter += 1
    stack.push(root)
    onStack.add(root)
    while (work.length > 0) {
      const frame = work[work.length - 1]
      if (frame === undefined) break
      if (frame.position < frame.next.length) {
        const successor = frame.next[frame.position] ?? ""
        work[work.length - 1] = { node: frame.node, next: frame.next, position: frame.position + 1 }
        if (!index.has(successor)) {
          index.set(successor, counter)
          low.set(successor, counter)
          counter += 1
          stack.push(successor)
          onStack.add(successor)
          work.push({ node: successor, next: adjacency.get(successor) ?? [], position: 0 })
        } else if (onStack.has(successor)) {
          low.set(frame.node, Math.min(low.get(frame.node) ?? 0, index.get(successor) ?? 0))
        }
      } else {
        work.pop()
        const parent = work[work.length - 1]
        if (parent !== undefined) {
          low.set(parent.node, Math.min(low.get(parent.node) ?? 0, low.get(frame.node) ?? 0))
        }
        if ((low.get(frame.node) ?? 0) === (index.get(frame.node) ?? 0)) {
          const component: string[] = []
          for (let popped = stack.pop(); popped !== undefined; popped = stack.pop()) {
            onStack.delete(popped)
            component.push(popped)
            if (popped === frame.node) break
          }
          if (component.length > 1) components.push(component.sort())
        }
      }
    }
  }
  return components
}

/** Shortest representative cycle through `start` inside `component` (BFS). */
export function shortestCycleThrough(
  adjacency: ReadonlyMap<string, readonly string[]>,
  component: readonly string[],
  start: string,
): readonly string[] | undefined {
  const inComponent = new Set(component)
  const parent = new Map<string, string>()
  let frontier = [start]
  // Cycle length is bounded by the component size.
  for (let depth = 0; depth < component.length; depth += 1) {
    const next: string[] = []
    for (const node of frontier) {
      for (const successor of adjacency.get(node) ?? []) {
        if (successor === start) {
          const cycle: string[] = [start]
          for (let walk = node; walk !== start; walk = parent.get(walk) as string) cycle.push(walk)
          return [start, ...cycle.slice(1).reverse(), start]
        }
        if (!inComponent.has(successor) || parent.has(successor)) continue
        parent.set(successor, node)
        next.push(successor)
      }
    }
    next.sort()
    frontier = next
  }
  return undefined
}

/** Count distinct shortest paths from `start` to every node within `maxDepth`. */
export function shortestPathCounts(
  adjacency: ReadonlyMap<string, readonly string[]>,
  start: string,
  maxDepth: number,
): ReadonlyMap<string, number> {
  const depth = new Map<string, number>([[start, 0]])
  const count = new Map<string, number>([[start, 1]])
  let frontier = [start]
  for (let level = 1; level <= maxDepth && frontier.length > 0; level += 1) {
    const contributions = new Map<string, number>()
    for (const node of frontier) {
      for (const neighbor of adjacency.get(node) ?? []) {
        const known = depth.get(neighbor)
        if (known !== undefined && known < level) continue
        if (known === undefined) depth.set(neighbor, level)
        contributions.set(neighbor, (contributions.get(neighbor) ?? 0) + (count.get(node) ?? 0))
      }
    }
    for (const [node, added] of contributions) count.set(node, (count.get(node) ?? 0) + added)
    frontier = [...contributions.keys()].sort()
  }
  return count
}
