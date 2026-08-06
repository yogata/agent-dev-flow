import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { buildGraph, loadGraph } from "../lib/graph.ts"
import { queryGraph } from "../lib/query.ts"
import { createFixture } from "./fixture.ts"

const roots: string[] = []

async function graphFixture() {
  const root = await mkdtemp(join(tmpdir(), "artifact-graph-query-"))
  roots.push(root)
  await createFixture(root)
  const output = join(root, ".agentdev", "graph")
  await buildGraph({ root, output })
  return { root, output, graph: await loadGraph(output) }
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe("graph queries", () => {
  it("returns depth-limited relations and provenance", async () => {
    // Given
    const { graph } = await graphFixture()

    // When
    const neighbors = queryGraph(graph, { kind: "neighbors", node: "requirement:REQ-001", depth: 2 })
    const provenance = queryGraph(graph, { kind: "provenance", id: "requirement:REQ-001" })

    // Then
    expect(neighbors.nodes).toContain("adr:ADR-001")
    expect(neighbors.edges.length).toBeGreaterThan(0)
    expect(provenance.provenance.length).toBe(1)
  })

  it("finds a path between two nodes", async () => {
    // Given
    const { graph } = await graphFixture()

    // When
    const result = queryGraph(graph, {
      kind: "path", source: "requirement:REQ-001", target: "specification:docs/specs/feature.md", maxDepth: 4,
    })

    // Then
    expect(result.nodes[0]).toBe("requirement:REQ-001")
    expect(result.nodes.at(-1)).toBe("specification:docs/specs/feature.md")
  })
})

describe("CLI surface", () => {
  it("builds, checks and queries the graph through Bun CLIs", async () => {
    // Given
    const fixture = await graphFixture()
    const scriptRoot = join(import.meta.dir, "..")

    // When
    const build = Bun.spawnSync([
      "bun", join(scriptRoot, "build_graph.ts"), "--root", fixture.root, "--output", fixture.output,
    ])
    const check = Bun.spawnSync(["bun", join(scriptRoot, "check_graph.ts"), "--graph", fixture.output])
    const query = Bun.spawnSync([
      "bun", join(scriptRoot, "query_graph.ts"), "--graph", fixture.output,
      "neighbors", "requirement:REQ-001", "--depth", "1",
    ])

    // Then
    expect(build.exitCode).toBe(0)
    expect(JSON.parse(build.stdout.toString()).files).toHaveLength(5)
    expect(check.exitCode).toBe(0)
    expect(JSON.parse(check.stdout.toString()).valid).toBe(true)
    expect(query.exitCode).toBe(0)
    expect(JSON.parse(query.stdout.toString()).nodes).toContain("adr:ADR-001")
  })
})
