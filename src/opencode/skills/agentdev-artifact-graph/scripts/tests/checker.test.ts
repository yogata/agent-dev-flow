import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { checkGraph } from "../lib/checker.ts"
import { buildGraph, loadGraph } from "../lib/graph.ts"
import { createFixture } from "./fixture.ts"

const roots: string[] = []

async function setup(): Promise<{ readonly root: string; readonly output: string }> {
  const root = await mkdtemp(join(tmpdir(), "ag-check-"))
  roots.push(root)
  await createFixture(root)
  return { root, output: join(root, ".agentdev", "graph") }
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe("graph integrity checks", () => {
  it("accepts a valid generated graph", async () => {
    const fixture = await setup()
    await buildGraph(fixture)
    const graph = await loadGraph(fixture.output)
    const report = checkGraph(graph)
    expect(report.valid).toBe(true)
    expect(report.errors).toEqual([])
  })

  it("rejects a graph with dangling edge target", async () => {
    const fixture = await setup()
    await buildGraph(fixture)
    const graph = await loadGraph(fixture.output)
    const first = graph.edges[0]
    if (first === undefined) throw new TypeError("fixture graph has no edge")

    const invalid = checkGraph({
      ...graph,
      edges: [...graph.edges, { ...first, id: "edge:dangling", target: "missing:node" }],
    })
    expect(invalid.valid).toBe(false)
    expect(invalid.errors.some((e) => e.includes("missing:node"))).toBe(true)
  })

  it("rejects duplicate node IDs", async () => {
    const fixture = await setup()
    await buildGraph(fixture)
    const graph = await loadGraph(fixture.output)
    const first = graph.nodes[0]
    if (first === undefined) throw new TypeError("fixture graph has no node")

    const invalid = checkGraph({
      ...graph,
      nodes: [...graph.nodes, { ...first }],
    })
    expect(invalid.valid).toBe(false)
    expect(invalid.errors.some((e) => e.includes("duplicate"))).toBe(true)
  })

  it("rejects node with missing provenance", async () => {
    const fixture = await setup()
    await buildGraph(fixture)
    const graph = await loadGraph(fixture.output)
    const first = graph.nodes[0]
    if (first === undefined) throw new TypeError("fixture graph has no node")

    const invalid = checkGraph({
      ...graph,
      nodes: [...graph.nodes, { ...first, provenance_id: "provenance:nonexistent" }],
    })
    expect(invalid.valid).toBe(false)
    expect(invalid.errors.some((e) => e.includes("missing provenance"))).toBe(true)
  })
})
