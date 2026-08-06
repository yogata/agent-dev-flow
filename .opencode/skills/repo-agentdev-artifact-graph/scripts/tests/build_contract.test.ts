import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { buildGraph } from "../lib/graph.ts"
import { createFixture } from "./fixture.ts"

const OUTPUT_FILES = [
  "manifest.json",
  "nodes.jsonl",
  "edges.jsonl",
  "provenance.jsonl",
  "diagnostics.json",
] as const

const roots: string[] = []

async function setup(): Promise<{ readonly root: string; readonly output: string }> {
  const root = await mkdtemp(join(tmpdir(), "artifact-graph-contract-"))
  roots.push(root)
  await createFixture(root)
  return { root, output: join(root, ".agentdev", "graph") }
}

async function jsonLines(path: string): Promise<readonly Record<string, unknown>[]> {
  const content = await readFile(path, "utf8")
  return content.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line))
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe("TS-003 and TS-004: graph generation", () => {
  it("writes five artifacts and all declared node and relation types", async () => {
    // Given
    const fixture = await setup()

    // When
    const result = await buildGraph(fixture)

    // Then
    expect(result.files).toEqual(OUTPUT_FILES)
    for (const name of OUTPUT_FILES) {
      expect(await Bun.file(join(fixture.output, name)).exists()).toBe(true)
    }
    const nodes = await jsonLines(join(fixture.output, "nodes.jsonl"))
    const edges = await jsonLines(join(fixture.output, "edges.jsonl"))
    expect(new Set(nodes.map((node) => node["type"]))).toEqual(new Set([
      "requirement", "adr", "specification", "integrity_rule",
      "command", "skill", "extension", "source_file",
    ]))
    expect(new Set(edges.map((edge) => edge["type"]))).toEqual(new Set([
      "references", "supersedes", "defined_in", "contains",
      "extends", "delegates_to", "governs",
    ]))
    expect(edges.some((edge) => edge["category"] === "inferred")).toBe(false)
  })
})

describe("TS-005 and TS-006: extraction and provenance", () => {
  it("extracts all mandatory structured sources with reachable provenance", async () => {
    // Given
    const fixture = await setup()

    // When
    await buildGraph(fixture)

    // Then
    const nodes = await jsonLines(join(fixture.output, "nodes.jsonl"))
    const edges = await jsonLines(join(fixture.output, "edges.jsonl"))
    const provenance = await jsonLines(join(fixture.output, "provenance.jsonl"))
    const provenanceById = new Map(provenance.map((entry) => [entry["id"], entry]))
    const rules = new Set(provenance.map((entry) => entry["extraction_rule"]))
    for (const rule of ["frontmatter", "structured_field", "markdown_link", "extension_field"]) {
      expect(rules.has(rule)).toBe(true)
    }
    for (const item of [...nodes, ...edges]) {
      const evidence = provenanceById.get(item["provenance_id"])
      expect(evidence).toBeDefined()
      for (const field of [
        "path", "heading", "element_id", "matched_text", "matched_text_hash",
        "line_start", "line_end", "extraction_rule",
      ]) {
        expect(evidence).toHaveProperty(field)
      }
      expect(await Bun.file(join(fixture.root, String(evidence?.["path"]))).exists()).toBe(true)
    }
  })
})
