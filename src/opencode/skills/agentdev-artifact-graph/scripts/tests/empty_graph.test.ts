import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { buildGraph } from "../lib/graph.ts"
import { checkGraph } from "../lib/checker.ts"
import { loadGraph } from "../lib/graph.ts"

const roots: string[] = []

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe(`REQ-{NNNN}-014: empty graph is valid`, () => {
  it("builds successfully with no matching docs", async () => {
    const root = await mkdtemp(join(tmpdir(), "ag-empty-"))
    roots.push(root)
    const output = join(root, ".agentdev", "graph")

    // No docs/ at all — graph should be empty but valid
    const result = await buildGraph({ root, output })
    expect(result.nodeCount).toBe(0)
    expect(result.edgeCount).toBe(0)
    expect(result.diagnosticCount).toBe(0)
  })

  it("generates all 5 files even when empty", async () => {
    const root = await mkdtemp(join(tmpdir(), "ag-empty5-"))
    roots.push(root)
    const output = join(root, ".agentdev", "graph")

    await buildGraph({ root, output })
    for (const name of ["manifest.json", "nodes.jsonl", "edges.jsonl", "provenance.jsonl", "diagnostics.json"]) {
      expect(await Bun.file(join(output, name)).exists()).toBe(true)
    }

    const nodesContent = await readFile(join(output, "nodes.jsonl"), "utf8")
    expect(nodesContent.trim()).toBe("")

    const edgesContent = await readFile(join(output, "edges.jsonl"), "utf8")
    expect(edgesContent.trim()).toBe("")
  })

  it("empty graph passes check", async () => {
    const root = await mkdtemp(join(tmpdir(), "ag-empty-check-"))
    roots.push(root)
    const output = join(root, ".agentdev", "graph")

    await buildGraph({ root, output })
    const graph = await loadGraph(output)
    const report = checkGraph(graph)
    expect(report.valid).toBe(true)
  })

  it("empty graph has correct manifest", async () => {
    const root = await mkdtemp(join(tmpdir(), "ag-empty-manifest-"))
    roots.push(root)
    const output = join(root, ".agentdev", "graph")

    await buildGraph({ root, output })
    const manifest = JSON.parse(await readFile(join(output, "manifest.json"), "utf8"))
    expect(manifest.schema_version).toBe("1.0.0")
    expect(manifest.input_digest).toMatch(/^[a-f0-9]{64}$/)
    expect(manifest.indexed_paths).toEqual(["docs/requirements", "docs/decisions", "docs/specs"])
    expect(manifest.node_types).toEqual(["decision", "requirement", "specification"])
  })
})
