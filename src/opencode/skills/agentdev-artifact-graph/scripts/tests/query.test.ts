import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { buildGraph, loadGraph } from "../lib/graph.ts"
import { queryGraph } from "../lib/query.ts"
import { createFixture, REQ_001_NODE, DEC_001_NODE, DEC_002_NODE, REQ_001_PATH, FEATURE_SPEC_NODE } from "./fixture.ts"

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
    const result = await queryGraph(graph, { kind: "neighbors", node: REQ_001_NODE, depth: 2 })
    expect(result.nodes).toContain(DEC_001_NODE)
    expect(result.edges.length).toBeGreaterThan(0)
    expect(result.provenance.length).toBeGreaterThan(0)
  })

  it("provenance returns evidence for a node", async () => {
    const { graph } = await graphFixture()
    const result = await queryGraph(graph, { kind: "provenance", id: REQ_001_NODE })
    expect(result.provenance.length).toBe(1)
    expect(result.provenance[0]?.path).toBe(REQ_001_PATH)
  })

  it("path finds route between two nodes", async () => {
    const { graph } = await graphFixture()
    const result = await queryGraph(graph, {
      kind: "path",
      source: REQ_001_NODE,
      target: FEATURE_SPEC_NODE,
      maxDepth: 4,
    })
    expect(result.nodes[0]).toBe(REQ_001_NODE)
    expect(result.nodes.at(-1)).toBe(FEATURE_SPEC_NODE)
  })

  it("path returns empty when no route exists", async () => {
    const { graph } = await graphFixture()
    const result = await queryGraph(graph, {
      kind: "path",
      source: REQ_001_NODE,
      target: "nonexistent:node",
      maxDepth: 2,
    })
    expect(result.nodes).toEqual([])
    expect(result.edges).toEqual([])
    expect(result.relations).toEqual([])
  })
})

describe(`query result relations (REQ-{NNNN}-001/002)`, () => {
  it("neighbors exposes relations with id/type/source/target for every edge", async () => {
    const { graph } = await graphFixture()
    const result = await queryGraph(graph, { kind: "neighbors", node: REQ_001_NODE, depth: 2 })
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
      source: REQ_001_NODE,
      target: FEATURE_SPEC_NODE,
      maxDepth: 4,
    })
    expect(result.edges.length).toBeGreaterThan(0)
    expect(result.relations).toHaveLength(result.edges.length)
    const relationSources = new Set(result.relations.map((r) => r.source))
    const relationTargets = new Set(result.relations.map((r) => r.target))
    expect(relationSources.has(REQ_001_NODE)).toBe(true)
    expect(relationTargets.has(FEATURE_SPEC_NODE)).toBe(true)
  })

  it("provenance for a node has empty relations (no edges in scope)", async () => {
    const { graph } = await graphFixture()
    const result = await queryGraph(graph, { kind: "provenance", id: REQ_001_NODE })
    expect(result.edges).toEqual([])
    expect(result.relations).toEqual([])
  })
})

describe("CLI surface (TS-{NNN})", () => {
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
      "neighbors", REQ_001_NODE, "--depth", "1",
    ])
    expect(query.exitCode).toBe(0)
    expect(JSON.parse(query.stdout.toString()).nodes).toContain(DEC_001_NODE)
  })
})

describe(`general reference separation on the default vocabulary (REQ-{NNNN}-021)`, () => {
  it("references-only links do not join impact, dependency or implementation", async () => {
    const { graph } = await graphFixture()
    for (const profile of ["impact", "dependency", "implementation"] as const) {
      const result = await queryGraph(graph, {
        kind: "profile",
        profile,
        node: REQ_001_NODE,
        depth: 2,
        limit: 200,
      })
      expect(result.candidates).toEqual([])
    }
  })

  it("related returns general reference candidates", async () => {
    const { graph } = await graphFixture()
    const result = await queryGraph(graph, {
      kind: "profile",
      profile: "related",
      node: FEATURE_SPEC_NODE,
      depth: 1,
      limit: 200,
    })
    const ids = result.candidates?.map((candidate) => candidate.id)
    expect(ids).toContain(REQ_001_NODE)
    expect(ids).toContain(DEC_002_NODE)
  })

  it("supersedes impact follows the declared reverse direction", async () => {
    const { graph } = await graphFixture()
    const result = await queryGraph(graph, {
      kind: "profile",
      profile: "impact",
      node: DEC_001_NODE,
      depth: 1,
      limit: 200,
    })
    expect(result.candidates?.map((candidate) => candidate.id)).toEqual([DEC_002_NODE])
  })
})
