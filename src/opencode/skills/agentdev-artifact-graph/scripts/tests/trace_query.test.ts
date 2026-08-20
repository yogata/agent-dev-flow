import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { buildGraph, loadGraph } from "../lib/graph.ts"
import { loadAugmentation, resolveTraceModel } from "../lib/augmentation.ts"
import { queryGraph } from "../lib/query.ts"
import { runTraceQuery } from "../lib/trace_query.ts"
import { extractMarkdownLinks } from "../lib/parse.ts"
import {
  createTraceFixture,
  traceAugmentationYaml,
  DEC1_NODE,
  DEC2_NODE,
  HUB_NODE,
  REQ1_NODE,
  REQ3_NODE,
  REQ4_NODE,
  REQ5_NODE,
  REQ2_NODE,
  SRC_NODE,
  SPEC_NODE,
  T_REQ1,
} from "./trace_fixture.ts"

const roots: string[] = []

async function traceFixture(options?: { readonly indexRole?: boolean; readonly relatedLimit?: number }) {
  const root = await mkdtemp(join(tmpdir(), "ag-trace-"))
  roots.push(root)
  const augmentation = traceAugmentationYaml({
    indexRole: options?.indexRole ?? true,
    relatedLimit: options?.relatedLimit,
  })
  await createTraceFixture(root, augmentation)
  const output = join(root, ".agentdev", "graph")
  await buildGraph({ root, output })
  const graph = await loadGraph(output)
  return {
    root,
    output,
    graph,
    model: resolveTraceModel(graph.manifest, await loadAugmentation(root)),
  }
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

function candidateIds(result: ReturnType<typeof runTraceQuery>): readonly string[] {
  return result.candidates.map((candidate) => candidate.candidate)
}

describe("high-level query profiles (TS-{NNN})", () => {
  it("related returns trace and general-reference candidates without index-role hub", async () => {
    const { graph, model } = await traceFixture()
    const result = runTraceQuery(graph, model, "related", REQ1_NODE)
    expect(candidateIds(result)).toEqual([DEC1_NODE, SPEC_NODE, DEC2_NODE, REQ3_NODE, SRC_NODE])
    expect(result.truncation).toBeUndefined()
  })

  it("related reason never states impact or dependency interpretation", async () => {
    const { graph, model } = await traceFixture()
    const result = runTraceQuery(graph, model, "related", REQ1_NODE)
    for (const candidate of result.candidates) {
      expect(candidate.reason.startsWith("related via")).toBe(true)
    }
  })

  it("impact ignores general references: references-only start yields normal empty result", async () => {
    const { graph, model } = await traceFixture()
    const result = runTraceQuery(graph, model, "impact", REQ1_NODE)
    expect(result.candidates).toEqual([])
    expect(result.truncation).toBeUndefined()
  })

  it("impact follows change-impact direction of realization relations", async () => {
    const { graph, model } = await traceFixture()
    const result = runTraceQuery(graph, model, "impact", SPEC_NODE)
    expect(candidateIds(result)).toEqual([SRC_NODE])
    const first = result.candidates[0]
    expect(first?.relation_type).toBe("implemented_by")
    expect(first?.direction).toBe("outgoing")
    expect(first?.path).toEqual([SPEC_NODE, SRC_NODE])
    expect(first?.reason).toContain("impact=forward")
  })

  it("dependency never treats general references as dependencies", async () => {
    const { graph, model } = await traceFixture()
    expect(runTraceQuery(graph, model, "dependency", REQ1_NODE).candidates).toEqual([])
  })

  it("dependency follows the depends-on direction of relations", async () => {
    const { graph, model } = await traceFixture()
    const result = runTraceQuery(graph, model, "dependency", SRC_NODE)
    expect(candidateIds(result)).toEqual([SPEC_NODE, REQ4_NODE])
    expect(result.candidates[0]?.direction).toBe("incoming")
    expect(result.candidates[1]?.direction).toBe("incoming")
  })

  it("implementation uses realization-series relations only and returns normal empty results", async () => {
    const { graph, model } = await traceFixture()
    const result = runTraceQuery(graph, model, "implementation", SPEC_NODE)
    expect(candidateIds(result)).toEqual([SRC_NODE, REQ4_NODE])
    expect(result.candidates[0]?.reason).toContain("slot=implement")
    expect(result.candidates[1]?.direction).toBe("incoming")
    const empty = runTraceQuery(graph, model, "implementation", REQ1_NODE)
    expect(empty.candidates).toEqual([])
    expect(empty.truncation).toBeUndefined()
  })

  it("semantics-undefined relations stay low-level-only", async () => {
    const { graph, model } = await traceFixture()
    const mentioned = graph.edges.filter((edge) => edge.type === "mentioned_in")
    expect(mentioned.length).toBeGreaterThan(0)
    expect(runTraceQuery(graph, model, "related", REQ5_NODE).candidates).toEqual([])
    expect(runTraceQuery(graph, model, "impact", REQ5_NODE).candidates).toEqual([])
    const legacy = await queryGraph(graph, { kind: "neighbors", node: REQ5_NODE, depth: 1 })
    expect(legacy.nodes).toContain(DEC2_NODE)
  })
})

describe("candidate limits and truncation (TS-{NNN})", () => {
  it("boundary below and at the limit never truncates; above the limit reports overflow 5-tuple", async () => {
    const { graph, model } = await traceFixture()
    const base = runTraceQuery(graph, model, "related", REQ1_NODE)
    const total = base.candidates.length
    expect(total).toBe(5)

    expect(runTraceQuery(graph, model, "related", REQ1_NODE, total + 1).truncation).toBeUndefined()
    expect(runTraceQuery(graph, model, "related", REQ1_NODE, total).truncation).toBeUndefined()

    const over = runTraceQuery(graph, model, "related", REQ1_NODE, total - 1)
    expect(over.candidates).toHaveLength(total - 1)
    expect(over.truncation).toEqual({
      total_candidates: total,
      returned_candidates: total - 1,
      applied_rules: ["exclude_index_and_aggregation_nodes", "priority:distance_then_path"],
      independent_search_available: true,
    })
  })

  it("every candidate carries exactly the 5 elements with a start-to-candidate path", async () => {
    const { graph, model } = await traceFixture()
    const result = runTraceQuery(graph, model, "related", REQ1_NODE)
    for (const candidate of result.candidates) {
      expect(Object.keys(candidate).sort()).toEqual(["candidate", "direction", "path", "reason", "relation_type"])
      expect(candidate.path[0]).toBe(REQ1_NODE)
      expect(candidate.path.at(-1)).toBe(candidate.candidate)
      expect(candidate.direction === "outgoing" || candidate.direction === "incoming").toBe(true)
      expect(candidate.relation_type.length).toBeGreaterThan(0)
      expect(candidate.reason.length).toBeGreaterThan(0)
    }
  })

  it("augmentation limit override reduces returned candidates without changing exploration order", async () => {
    const { graph, model } = await traceFixture({ relatedLimit: 1 })
    const result = runTraceQuery(graph, model, "related", REQ1_NODE)
    expect(result.candidates).toHaveLength(1)
    expect(result.candidates[0]?.candidate).toBe(DEC1_NODE)
    expect(result.truncation?.total_candidates).toBe(5)
    expect(result.truncation?.independent_search_available).toBe(true)
  })
})

describe("representative case regression (TS-{NNN})", () => {
  it("depth-1 related matches independent link extraction of the source document", async () => {
    const { root, graph, model } = await traceFixture()
    const content = await Bun.file(join(root, "docs", "requirements", `${T_REQ1}.md`)).text()
    const independentlyLinked = extractMarkdownLinks(content)
      .filter((link) => !/^[a-z]+:/i.test(link.target) && !link.target.startsWith("#"))
      .map((link) => link.target.split("#")[0] ?? "")
    expect(independentlyLinked.length).toBe(2)

    const result = runTraceQuery(graph, model, "related", REQ1_NODE)
    const depth1 = result.candidates.filter((candidate) => candidate.path.length === 2).map((c) => c.candidate)
    expect(new Set(depth1)).toEqual(new Set([DEC1_NODE, SPEC_NODE]))
  })

  it("index hub amplification is reproducible without role and suppressed with role", async () => {
    const amplified = await traceFixture({ indexRole: false })
    expect(candidateIds(runTraceQuery(amplified.graph, amplified.model, "related", REQ1_NODE))).toContain(HUB_NODE)

    const suppressed = await traceFixture({ indexRole: true })
    expect(candidateIds(runTraceQuery(suppressed.graph, suppressed.model, "related", REQ1_NODE))).not.toContain(HUB_NODE)
  })

  it("impact never passes through a no-impact relation even when a link exists", async () => {
    const { graph, model } = await traceFixture()
    const referencesToDecision = graph.edges.some(
      (edge) => edge.type === "references" && edge.source === REQ1_NODE && edge.target === DEC1_NODE,
    )
    expect(referencesToDecision).toBe(true)
    expect(candidateIds(runTraceQuery(graph, model, "impact", REQ1_NODE))).not.toContain(DEC1_NODE)
  })

  it("isolated requirement yields normal empty related result", async () => {
    const { graph, model } = await traceFixture()
    const result = runTraceQuery(graph, model, "related", REQ2_NODE)
    expect(result.candidates).toEqual([])
    expect(result.truncation).toBeUndefined()
  })
})
