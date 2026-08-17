import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, rm, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { buildGraph, loadGraph } from "../lib/graph.ts"
import { loadAugmentation, resolveTraceModel } from "../lib/augmentation.ts"
import { runDiagnostics } from "../lib/trace_diagnostics.ts"
import {
  createTraceFixture,
  traceAugmentationYaml,
  DEC1_NODE,
  DEC2_NODE,
  NOWHERE_MD,
  REQ1_NODE,
  REQ2_NODE,
  REQ3_NODE,
  HUB_NODE,
  SPEC_NODE,
  T_REQ9,
} from "./trace_fixture.ts"

const roots: string[] = []

async function diagnosticsFixture() {
  const root = await mkdtemp(join(tmpdir(), "ag-diag-"))
  roots.push(root)
  await createTraceFixture(root, traceAugmentationYaml({ indexRole: true }))
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

describe("diagnostics findings (TS-{NNN} diagnostics profile)", () => {
  it("reports isolated candidates without declaring anomalies", async () => {
    const { graph, model } = await diagnosticsFixture()
    const result = runDiagnostics(graph, model)
    const isolated = result.findings.filter((finding) => finding.kind === "isolated")
    expect(isolated.map((finding) => finding.candidate)).toEqual([REQ2_NODE])
    for (const finding of result.findings) {
      expect(finding.reason.includes("observation") || finding.reason.startsWith("TIM constraint")).toBe(true)
    }
  })

  it("reports relations to superseded artifacts", async () => {
    const { graph, model } = await diagnosticsFixture()
    const result = runDiagnostics(graph, model)
    const superseded = result.findings.filter((finding) => finding.kind === "superseded_target")
    expect(superseded.length).toBeGreaterThanOrEqual(2)
    for (const finding of superseded) {
      expect(finding.path).toContain(DEC1_NODE)
    }
  })

  it("reports TIM constraint violations only when constraints are defined", async () => {
    const { graph, model } = await diagnosticsFixture()
    const result = runDiagnostics(graph, model)
    const violations = result.findings.filter((finding) => finding.kind === "constraint_violation")
    expect(violations.length).toBe(1)
    expect(violations[0]?.reason).toContain("source type requirement")
  })

  it("reports a representative directed cycle path", async () => {
    const { graph, model } = await diagnosticsFixture()
    const result = runDiagnostics(graph, model)
    const cycle = result.findings.find((finding) => finding.kind === "cycle")
    expect(cycle).toBeDefined()
    expect(cycle?.path[0]).toBe(cycle?.path.at(-1))
    expect(cycle?.path).toContain(REQ3_NODE)
    expect(cycle?.path).toContain(DEC2_NODE)
    expect(cycle?.path).toContain(SPEC_NODE)
  })

  it("reports node pairs with multiple shortest paths", async () => {
    const { graph, model } = await diagnosticsFixture()
    const result = runDiagnostics(graph, model)
    const pair = result.findings.find(
      (finding) => finding.kind === "multiple_paths" && finding.path.includes(REQ1_NODE) && finding.path.includes(DEC2_NODE),
    )
    expect(pair).toBeDefined()
    expect(pair?.reason).toMatch(/\d+ distinct shortest paths/)
    expect(Number(/(\d+) distinct/.exec(pair?.reason ?? "")?.[1] ?? 0)).toBeGreaterThanOrEqual(2)
  })

  it("reports relation concentration above the configured threshold", async () => {
    const { graph, model } = await diagnosticsFixture()
    const result = runDiagnostics(graph, model)
    const concentrated = result.findings
      .filter((finding) => finding.kind === "relation_concentration")
      .map((finding) => finding.candidate)
    expect(concentrated).toContain(SPEC_NODE)
    expect(concentrated).toContain(HUB_NODE)
  })

  it("applies the diagnostics limit with overflow reporting", async () => {
    const { graph, model } = await diagnosticsFixture()
    const full = runDiagnostics(graph, model)
    const result = runDiagnostics(graph, model, 1)
    expect(result.findings).toHaveLength(1)
    expect(result.truncation?.total_candidates).toBe(full.findings.length)
    expect(result.truncation?.independent_search_available).toBe(true)
  })
})

describe("diagnostics on damaged derived index (TS-{NNN})", () => {
  it("detects missing provenance entries after provenance loss", async () => {
    const fixture = await diagnosticsFixture()
    const provenancePath = join(fixture.output, "provenance.jsonl")
    const lines = (await readFile(provenancePath, "utf8")).split(/\r?\n/).filter(Boolean)
    const dropped = new Set(lines.slice(0, 1).map((line) => JSON.parse(line).id))
    await writeFile(provenancePath, `${lines.slice(1).join("\n")}\n`, "utf8")
    const damaged = await loadGraph(fixture.output)
    const result = runDiagnostics(damaged, fixture.model)
    const missing = result.findings.filter((finding) => finding.kind === "missing_provenance")
    expect(missing.length).toBeGreaterThan(0)
    for (const finding of missing) {
      expect(dropped.has(finding.candidate) === false || finding.path.length >= 1).toBe(true)
    }
  })

  it("detects dangling relations pointing to unknown nodes", async () => {
    const fixture = await diagnosticsFixture()
    const edgesPath = join(fixture.output, "edges.jsonl")
    const original = await readFile(edgesPath, "utf8")
    const dangling = {
      id: "edge:dangling",
      type: "references",
      category: "derived",
      source: `requirement:${T_REQ9}`,
      target: `specification:docs/specs/${NOWHERE_MD}`,
      provenance_id: "prov:none",
      extraction_rule: "markdown_link",
    }
    await writeFile(edgesPath, `${original}${JSON.stringify(dangling)}\n`, "utf8")
    const damaged = await loadGraph(fixture.output)
    const result = runDiagnostics(damaged, fixture.model)
    const unresolved = result.findings.filter((finding) => finding.kind === "unresolved_relation")
    expect(unresolved.map((finding) => finding.candidate)).toContain("edge:dangling")
  })
})
