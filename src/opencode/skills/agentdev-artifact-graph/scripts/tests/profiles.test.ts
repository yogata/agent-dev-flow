import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { buildGraph, loadGraph } from "../lib/graph.ts"
import { AUGMENTATION_DEFAULT_PATH } from "../lib/augmentation.ts"
import { queryGraph } from "../lib/query.ts"
import {
  AUGMENTATION_WITH_TIM,
  CATALOG_NODE,
  DEC_001_NODE,
  DEC_002_NODE,
  DESIGN_002_NODE,
  DESIGN_NODE,
  FEATURE_SPEC_NODE,
  REQ_001_NODE,
  RULE_NODE,
  createFixture,
  createTimFixture,
} from "./fixture.ts"

const roots: string[] = []

async function timGraphFixture() {
  const root = await mkdtemp(join(tmpdir(), "ag-profile-"))
  roots.push(root)
  await createFixture(root)
  await createTimFixture(root)
  await mkdir(join(root, ".agentdev"), { recursive: true })
  await writeFile(join(root, AUGMENTATION_DEFAULT_PATH), AUGMENTATION_WITH_TIM, "utf8")
  const output = join(root, ".agentdev", "graph")
  await buildGraph({ root, output })
  return { root, output, graph: await loadGraph(output) }
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe("purpose-specific queries over TIM semantics (TS-{NNN}/TS-{NNN} equivalent)", () => {
  it("general-reference-only artifacts stay out of impact, dependency and implementation", async () => {
    const { graph } = await timGraphFixture()
    for (const profile of ["impact", "dependency", "implementation"] as const) {
      const result = await queryGraph(graph, {
        kind: "profile",
        profile,
        node: CATALOG_NODE,
        depth: 2,
        limit: 200,
      })
      expect(result.candidates).toEqual([])
    }
  })

  it("related returns general reference candidates (TS-{NNN})", async () => {
    const { graph } = await timGraphFixture()
    const result = await queryGraph(graph, {
      kind: "profile",
      profile: "related",
      node: CATALOG_NODE,
      depth: 1,
      limit: 200,
    })
    const ids = result.candidates?.map((candidate) => candidate.id)
    expect(ids).toContain(REQ_001_NODE)
    expect(ids).toContain(DEC_001_NODE)
  })

  it("impact traverses each change impact direction individually (REQ-{NNNN}-{NNN})", async () => {
    const { graph } = await timGraphFixture()
    const idsOf = async (node: string, depth: number) => {
      const result = await queryGraph(graph, { kind: "profile", profile: "impact", node, depth, limit: 200 })
      return result.candidates?.map((candidate) => candidate.id)
    }
    // backward: requirement change impacts the satisfying design
    expect(await idsOf(REQ_001_NODE, 1)).toEqual([DESIGN_NODE])
    // forward: constraint change impacts the constrained requirement; a requirement
    // change does not impact the constraining rule
    expect(await idsOf(RULE_NODE, 1)).toEqual([DESIGN_NODE, REQ_001_NODE])
    // bidirectional: bidirectional sync links are traversed from either end
    expect(await idsOf(DESIGN_NODE, 1)).toEqual([RULE_NODE])
    // none: general references never join impact
    expect(await idsOf(CATALOG_NODE, 2)).toEqual([])
  })

  it("impact propagates across hops following per-hop directions", async () => {
    const { graph } = await timGraphFixture()
    const result = await queryGraph(graph, {
      kind: "profile",
      profile: "impact",
      node: REQ_001_NODE,
      depth: 2,
      limit: 200,
    })
    expect(result.candidates?.map((candidate) => candidate.id)).toEqual([DESIGN_NODE, RULE_NODE])
    const designPath = result.candidates?.find((candidate) => candidate.id === DESIGN_NODE)?.path
    expect(designPath).toEqual([REQ_001_NODE, DESIGN_NODE])
  })

  it("dependency follows slot-derived orientation", async () => {
    const { graph } = await timGraphFixture()
    const result = await queryGraph(graph, {
      kind: "profile",
      profile: "dependency",
      node: REQ_001_NODE,
      depth: 1,
      limit: 200,
    })
    expect(result.candidates?.map((candidate) => candidate.id)).toEqual([DESIGN_NODE])
  })

  it("implementation uses the realization/satisfaction/implement family", async () => {
    const { graph } = await timGraphFixture()
    const result = await queryGraph(graph, {
      kind: "profile",
      profile: "implementation",
      node: REQ_001_NODE,
      depth: 1,
      limit: 200,
    })
    expect(result.candidates?.map((candidate) => candidate.id)).toEqual([DESIGN_NODE])
  })

  it("undefined-semantics relation types stay out of high-level queries but work in low-level queries", async () => {
    const { graph } = await timGraphFixture()
    expect(graph.edges.some((edge) => edge.type === "tracks")).toBe(true)

    const related = await queryGraph(graph, {
      kind: "profile",
      profile: "related",
      node: REQ_001_NODE,
      depth: 3,
      limit: 200,
    })
    const relatedIds = related.candidates?.map((candidate) => candidate.id)
    expect(relatedIds).toContain(DEC_002_NODE)
    expect(relatedIds).not.toContain(DESIGN_002_NODE)

    const neighbors = await queryGraph(graph, { kind: "neighbors", node: DESIGN_002_NODE, depth: 1 })
    expect(neighbors.nodes).toContain(DEC_002_NODE)
  })

  it("index query returns the declared role and general-reference entries (REQ-{NNNN}-{NNN})", async () => {
    const { graph } = await timGraphFixture()
    const catalogIndex = await queryGraph(graph, { kind: "index", node: CATALOG_NODE })
    expect(catalogIndex.index?.role).toBe("index")
    expect(catalogIndex.index?.entries.map((entry) => entry.node)).toEqual([DEC_001_NODE, REQ_001_NODE])

    const plain = await queryGraph(graph, { kind: "index", node: REQ_001_NODE })
    expect(plain.index?.role).toBeNull()
    expect(plain.index?.entries.map((entry) => entry.node)).toEqual([
      DEC_001_NODE,
      FEATURE_SPEC_NODE,
    ])
  })

  it("candidate limit truncates deterministically with an overflow summary", async () => {
    const { graph } = await timGraphFixture()
    const result = await queryGraph(graph, {
      kind: "profile",
      profile: "related",
      node: REQ_001_NODE,
      depth: 1,
      limit: 1,
    })
    expect(result.candidates?.map((candidate) => candidate.id)).toEqual([CATALOG_NODE])
    expect(result.summary?.truncated).toBe(true)
    expect(result.summary?.total_candidates).toBeGreaterThan(1)
    expect(result.summary?.returned_candidates).toBe(1)
    expect(result.summary?.note).toContain("independent search")
  })

  it("profile query for a nonexistent node returns empty candidates", async () => {
    const { graph } = await timGraphFixture()
    const result = await queryGraph(graph, {
      kind: "profile",
      profile: "impact",
      node: "nonexistent:node",
      depth: 2,
      limit: 200,
    })
    expect(result.nodes).toEqual([])
    expect(result.candidates).toEqual([])
  })

  it("CLI exposes high-level profile and index subcommands", async () => {
    const fixture = await timGraphFixture()
    const cli = resolve(import.meta.dir, "..", "src", "query_graph.ts")

    const impact = Bun.spawnSync([
      "bun", cli, "--graph", fixture.output,
      "impact", REQ_001_NODE, "--depth", "1",
    ])
    expect(impact.exitCode).toBe(0)
    const impactOutput = JSON.parse(impact.stdout.toString())
    expect(impactOutput.profile).toBe("impact")
    expect(impactOutput.candidates.map((candidate: { candidate: string }) => candidate.candidate)).toEqual([DESIGN_NODE])

    const index = Bun.spawnSync(["bun", cli, "--graph", fixture.output, "index", CATALOG_NODE])
    expect(index.exitCode).toBe(0)
    const indexOutput = JSON.parse(index.stdout.toString())
    expect(indexOutput.index.role).toBe("index")
  })
})
