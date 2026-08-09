import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { buildGraph } from "../lib/graph.ts"
import { checkGraph } from "../lib/checker.ts"
import { loadGraph } from "../lib/graph.ts"
import { queryGraph } from "../lib/query.ts"
import { createFixture } from "./fixture.ts"
import {
  DEFAULT_INDEXED_PATHS,
  DEFAULT_NODE_TYPE_VOCABULARY,
  DEFAULT_RELATION_TYPE_VOCABULARY,
} from "../lib/config.ts"

const SORTED_NODE_TYPES = [...DEFAULT_NODE_TYPE_VOCABULARY].sort()
const SORTED_RELATION_TYPES = [...DEFAULT_RELATION_TYPE_VOCABULARY].sort()

const roots: string[] = []

async function setup(): Promise<{ readonly root: string; readonly output: string }> {
  const root = await mkdtemp(join(tmpdir(), "ag-contract-"))
  roots.push(root)
  await createFixture(root)
  return { root, output: join(root, ".agentdev", "graph") }
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

const OUTPUT_FILES = ["manifest.json", "nodes.jsonl", "edges.jsonl", "provenance.jsonl", "diagnostics.json"] as const

async function jsonLines(path: string): Promise<readonly Record<string, unknown>[]> {
  const content = await readFile(path, "utf8")
  return content.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line))
}

describe("TS-001: fixture repo → build → check → query", () => {
  it("builds 5 files, check passes, queries respond", async () => {
    const fixture = await setup()

    const result = await buildGraph(fixture)
    expect(result.files).toEqual(OUTPUT_FILES)
    for (const name of OUTPUT_FILES) {
      expect(await Bun.file(join(fixture.output, name)).exists()).toBe(true)
    }

    const graph = await loadGraph(fixture.output)
    const checkReport = checkGraph(graph)
    expect(checkReport.valid).toBe(true)

    const neighbors = await queryGraph(graph, {
      kind: "neighbors",
      node: "requirement:REQ-001",
      depth: 2,
    })
    expect(neighbors.nodes).toContain("decision:DEC-001")

    const provenance = await queryGraph(graph, { kind: "provenance", id: "requirement:REQ-001" })
    expect(provenance.provenance.length).toBe(1)
  })
})

describe("TS-002: default indexed_paths (3 only) and node_types (3 only)", () => {
  it("manifest records exactly the 3 default indexed_paths", async () => {
    const fixture = await setup()
    await buildGraph(fixture)
    const manifest = JSON.parse(await readFile(join(fixture.output, "manifest.json"), "utf8"))
    expect(manifest.indexed_paths).toEqual([...DEFAULT_INDEXED_PATHS])
  })

  it("manifest records exactly the 3 default node_types", async () => {
    const fixture = await setup()
    await buildGraph(fixture)
    const manifest = JSON.parse(await readFile(join(fixture.output, "manifest.json"), "utf8"))
    expect(manifest.node_types).toEqual(SORTED_NODE_TYPES)
  })

  it("manifest records exactly the 5 default relation_types", async () => {
    const fixture = await setup()
    await buildGraph(fixture)
    const manifest = JSON.parse(await readFile(join(fixture.output, "manifest.json"), "utf8"))
    expect(manifest.relation_types).toEqual(SORTED_RELATION_TYPES)
  })

  it("produces only default node types (requirement, decision, specification)", async () => {
    const fixture = await setup()
    await buildGraph(fixture)
    const nodes = await jsonLines(join(fixture.output, "nodes.jsonl"))
    const types = new Set(nodes.map((n) => String(n["type"])))
    for (const t of types) {
      expect((DEFAULT_NODE_TYPE_VOCABULARY as readonly string[]).includes(t)).toBe(true)
    }
    expect(types.has("requirement")).toBe(true)
    expect(types.has("decision")).toBe(true)
    expect(types.has("specification")).toBe(true)
    expect(types.has("source_file")).toBe(false)
    expect(types.has("command")).toBe(false)
    expect(types.has("skill")).toBe(false)
  })

  it("src/opencode etc are NOT in default indexed_paths", async () => {
    expect(DEFAULT_INDEXED_PATHS).not.toContain("src/opencode")
    expect(DEFAULT_INDEXED_PATHS).not.toContain(".opencode")
    expect(DEFAULT_INDEXED_PATHS).not.toContain(".agentdev/extensions")
    expect(DEFAULT_INDEXED_PATHS).not.toContain("scripts")
    expect(DEFAULT_INDEXED_PATHS).not.toContain("tests")
  })
})

describe("TS-004: works without project augmentation", () => {
  it("build, check, query all succeed with no augmentation file", async () => {
    const fixture = await setup()

    const buildResult = await buildGraph(fixture)
    expect(buildResult.nodeCount).toBeGreaterThan(0)

    const graph = await loadGraph(fixture.output)
    const checkReport = checkGraph(graph)
    expect(checkReport.valid).toBe(true)

    const path = await queryGraph(graph, {
      kind: "path",
      source: "requirement:REQ-001",
      target: "specification:docs/specs/feature.md",
      maxDepth: 4,
    })
    expect(path.nodes[0]).toBe("requirement:REQ-001")
    expect(path.nodes.at(-1)).toBe("specification:docs/specs/feature.md")
  })
})

describe("TS-005 (partial): provenance completeness", () => {
  it("every node and edge has reachable provenance", async () => {
    const fixture = await setup()
    await buildGraph(fixture)

    const nodes = await jsonLines(join(fixture.output, "nodes.jsonl"))
    const edges = await jsonLines(join(fixture.output, "edges.jsonl"))
    const provenance = await jsonLines(join(fixture.output, "provenance.jsonl"))
    const provenanceById = new Map(provenance.map((p) => [p["id"], p]))

    for (const item of [...nodes, ...edges]) {
      const evidence = provenanceById.get(item["provenance_id"])
      expect(evidence).toBeDefined()
      for (const field of ["path", "heading", "element_id", "matched_text", "matched_text_hash", "line_start", "line_end", "extraction_rule"]) {
        expect(evidence).toHaveProperty(field)
      }
    }
  })
})
