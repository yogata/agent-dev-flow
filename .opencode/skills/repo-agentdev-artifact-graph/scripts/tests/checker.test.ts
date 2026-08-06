import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { checkGraph } from "../lib/checker.ts"
import { buildGraph, loadGraph } from "../lib/graph.ts"
import { createFixture } from "./fixture.ts"

const roots: string[] = []

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe("graph integrity checks", () => {
  it("accepts a generated graph and rejects a dangling relation", async () => {
    // Given
    const root = await mkdtemp(join(tmpdir(), "artifact-graph-check-"))
    roots.push(root)
    await createFixture(root)
    const output = join(root, ".agentdev", "graph")
    await buildGraph({ root, output })
    const graph = await loadGraph(output)
    const first = graph.edges[0]
    if (first === undefined) throw new TypeError("fixture graph has no edge")

    // When
    const valid = checkGraph(graph)
    const invalid = checkGraph({
      ...graph,
      edges: [...graph.edges, { ...first, id: "edge:dangling", target: "missing:node" }],
    })

    // Then
    expect(valid.valid).toBe(true)
    expect(invalid.valid).toBe(false)
    expect(invalid.errors.some((error) => error.includes("missing:node"))).toBe(true)
  })
})
