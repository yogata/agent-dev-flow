import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { buildGraph, loadGraph } from "../lib/graph.ts"
import { queryGraph } from "../lib/query.ts"
import { createFixture } from "./fixture.ts"

const roots: string[] = []

async function graphFixture() {
  const root = await mkdtemp(join(tmpdir(), "ag-query-"))
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
  it("neighbors returns depth-limited relations", async () => {
    const { graph } = await graphFixture()
    const result = await queryGraph(graph, { kind: "neighbors", node: "requirement:REQ-001", depth: 2 })
    expect(result.nodes).toContain("adr:ADR-001")
    expect(result.edges.length).toBeGreaterThan(0)
    expect(result.provenance.length).toBeGreaterThan(0)
  })

  it("provenance returns evidence for a node", async () => {
    const { graph } = await graphFixture()
    const result = await queryGraph(graph, { kind: "provenance", id: "requirement:REQ-001" })
    expect(result.provenance.length).toBe(1)
    expect(result.provenance[0]?.path).toBe("docs/requirements/REQ-001.md")
  })

  it("path finds route between two nodes", async () => {
    const { graph } = await graphFixture()
    const result = await queryGraph(graph, {
      kind: "path",
      source: "requirement:REQ-001",
      target: "specification:docs/specs/feature.md",
      maxDepth: 4,
    })
    expect(result.nodes[0]).toBe("requirement:REQ-001")
    expect(result.nodes.at(-1)).toBe("specification:docs/specs/feature.md")
  })

  it("path returns empty when no route exists", async () => {
    const { graph } = await graphFixture()
    const result = await queryGraph(graph, {
      kind: "path",
      source: "requirement:REQ-001",
      target: "nonexistent:node",
      maxDepth: 2,
    })
    expect(result.nodes).toEqual([])
  })
})

describe("CLI surface (TS-001)", () => {
  it("build, check, query through Bun CLIs", async () => {
    const fixture = await graphFixture()
    const scriptRoot = resolve(import.meta.dir, "..", "src")

    const build = Bun.spawnSync([
      "bun", join(scriptRoot, "build_graph.ts"),
      "--root", fixture.root, "--output", fixture.output,
    ])
    expect(build.exitCode).toBe(0)
    expect(JSON.parse(build.stdout.toString()).files).toHaveLength(5)

    const check = Bun.spawnSync(["bun", join(scriptRoot, "check_graph.ts"), "--graph", fixture.output])
    expect(check.exitCode).toBe(0)
    expect(JSON.parse(check.stdout.toString()).valid).toBe(true)

    const query = Bun.spawnSync([
      "bun", join(scriptRoot, "query_graph.ts"), "--graph", fixture.output,
      "neighbors", "requirement:REQ-001", "--depth", "1",
    ])
    expect(query.exitCode).toBe(0)
    expect(JSON.parse(query.stdout.toString()).nodes).toContain("adr:ADR-001")
  })
})
