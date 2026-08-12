import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { buildGraph, loadGraph } from "../lib/graph.ts"
import { queryGraph } from "../lib/query.ts"
import { createFixture, REQ_001_PATH, FEATURE_SPEC_NODE } from "./fixture.ts"

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
    const result = await queryGraph(graph, { kind: "neighbors", node: "requirement:REQ\u002D001", depth: 2 })
    expect(result.nodes).toContain("decision:DEC\u002D001")
    expect(result.edges.length).toBeGreaterThan(0)
    expect(result.provenance.length).toBeGreaterThan(0)
  })

  it("provenance returns evidence for a node", async () => {
    const { graph } = await graphFixture()
    const result = await queryGraph(graph, { kind: "provenance", id: "requirement:REQ\u002D001" })
    expect(result.provenance.length).toBe(1)
    expect(result.provenance[0]?.path).toBe(REQ_001_PATH)
  })

  it("path finds route between two nodes", async () => {
    const { graph } = await graphFixture()
    const result = await queryGraph(graph, {
      kind: "path",
      source: "requirement:REQ\u002D001",
      target: FEATURE_SPEC_NODE,
      maxDepth: 4,
    })
    expect(result.nodes[0]).toBe("requirement:REQ\u002D001")
    expect(result.nodes.at(-1)).toBe(FEATURE_SPEC_NODE)
  })

  it("path returns empty when no route exists", async () => {
    const { graph } = await graphFixture()
    const result = await queryGraph(graph, {
      kind: "path",
      source: "requirement:REQ\u002D001",
      target: "nonexistent:node",
      maxDepth: 2,
    })
    expect(result.nodes).toEqual([])
    expect(result.edges).toEqual([])
    expect(result.relations).toEqual([])
  })
})

describe("query result relations (REQ\u002D023-001/002)", () => {
  it("neighbors exposes relations with id/type/source/target for every edge", async () => {
    const { graph } = await graphFixture()
    const result = await queryGraph(graph, { kind: "neighbors", node: "requirement:REQ\u002D001", depth: 2 })
    expect(result.edges.length).toBeGreaterThan(0)
    for (const edge of result.edges) {
      expect(typeof edge).toBe("string")
    }
    expect(result.relations).toHaveLength(result.edges.length)
    const edgeIdSet = new Set(result.edges)
    for (const relation of result.relations) {
      expect(edgeIdSet.has(relation.id)).toBe(true)
      expect(relation.type.length).toBeGreaterThan(0)
      expect(relation.source.length).toBeGreaterThan(0)
      expect(relation.target.length).toBeGreaterThan(0)
      const match = graph.edges.find((edge) => edge.id === relation.id)
      expect(match).toBeDefined()
      expect(match?.type).toBe(relation.type)
      expect(match?.source).toBe(relation.source)
      expect(match?.target).toBe(relation.target)
    }
  })

  it("path exposes relations matching its edges", async () => {
    const { graph } = await graphFixture()
    const result = await queryGraph(graph, {
      kind: "path",
      source: "requirement:REQ\u002D001",
      target: FEATURE_SPEC_NODE,
      maxDepth: 4,
    })
    expect(result.edges.length).toBeGreaterThan(0)
    expect(result.relations).toHaveLength(result.edges.length)
    const relationSources = new Set(result.relations.map((r) => r.source))
    const relationTargets = new Set(result.relations.map((r) => r.target))
    expect(relationSources.has("requirement:REQ\u002D001")).toBe(true)
    expect(relationTargets.has(FEATURE_SPEC_NODE)).toBe(true)
  })

  it("provenance for a node has empty relations (no edges in scope)", async () => {
    const { graph } = await graphFixture()
    const result = await queryGraph(graph, { kind: "provenance", id: "requirement:REQ\u002D001" })
    expect(result.edges).toEqual([])
    expect(result.relations).toEqual([])
  })
})

describe("CLI surface (TS\u002D001)", () => {
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
      "neighbors", "requirement:REQ\u002D001", "--depth", "1",
    ])
    expect(query.exitCode).toBe(0)
    expect(JSON.parse(query.stdout.toString()).nodes).toContain("decision:DEC\u002D001")
  })
})
