import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, mkdir, readFile, rm, writeFile, unlink } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { buildGraph, loadGraph } from "../lib/graph.ts"
import { checkGraph } from "../lib/checker.ts"
import { AUGMENTATION_DEFAULT_PATH } from "../lib/config.ts"
import { createFixture, createGuideFixture, AUGMENTATION_WITH_GUIDE } from "./fixture.ts"

const roots: string[] = []

async function setup(): Promise<{ readonly root: string; readonly output: string }> {
  const root = await mkdtemp(join(tmpdir(), "ag-aug-"))
  roots.push(root)
  await createFixture(root)
  return { root, output: join(root, ".agentdev", "graph") }
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

async function jsonLines(path: string): Promise<readonly Record<string, unknown>[]> {
  const content = await readFile(path, "utf8")
  return content.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line))
}

describe("TS-{NNN}: augmentation adds node_type and relation_type", () => {
  it("without augmentation: guide type absent, only 3 default node types", async () => {
    const fixture = await setup()
    await createGuideFixture(fixture.root)

    await buildGraph(fixture)
    const manifest = JSON.parse(await readFile(join(fixture.output, "manifest.json"), "utf8"))
    expect(manifest.node_types).toEqual(["decision", "requirement", "specification"])
    expect(manifest.relation_types).toContain("references")
    expect(manifest.relation_types).not.toContain("documented_in")

    const nodes = await jsonLines(join(fixture.output, "nodes.jsonl"))
    expect(nodes.some((n) => n["type"] === "guide")).toBe(false)
  })

  it("with augmentation: guide node type appears, relation type added", async () => {
    const fixture = await setup()
    await createGuideFixture(fixture.root)

    await mkdir(join(fixture.root, ".agentdev"), { recursive: true })
    await writeFile(join(fixture.root, AUGMENTATION_DEFAULT_PATH), AUGMENTATION_WITH_GUIDE, "utf8")

    await buildGraph(fixture)
    const manifest = JSON.parse(await readFile(join(fixture.output, "manifest.json"), "utf8"))
    expect(manifest.node_types).toContain("guide")
    expect(manifest.indexed_paths).toContain("docs/guides")
    expect(manifest.relation_types).toContain("documented_in")

    const nodes = await jsonLines(join(fixture.output, "nodes.jsonl"))
    expect(nodes.some((n) => n["type"] === "guide")).toBe(true)
    const guideNode = nodes.find((n) => n["type"] === "guide")
    expect(guideNode?.["id"]).toBe("guide:quickstart")

    // Check edges include documented_in
    const edges = await jsonLines(join(fixture.output, "edges.jsonl"))
    expect(edges.some((e) => e["type"] === "documented_in")).toBe(true)

    // Graph is still valid
    const graph = await loadGraph(fixture.output)
    const report = checkGraph(graph)
    expect(report.valid).toBe(true)
  })

  it("removing augmentation reverts to defaults", async () => {
    const fixture = await setup()
    await createGuideFixture(fixture.root)
    const augPath = join(fixture.root, AUGMENTATION_DEFAULT_PATH)

    await mkdir(join(fixture.root, ".agentdev"), { recursive: true })
    await writeFile(augPath, AUGMENTATION_WITH_GUIDE, "utf8")
    await buildGraph(fixture)
    const manifestWith = JSON.parse(await readFile(join(fixture.output, "manifest.json"), "utf8"))
    expect(manifestWith.node_types).toContain("guide")

    await unlink(augPath)
    await buildGraph(fixture)
    const manifestWithout = JSON.parse(await readFile(join(fixture.output, "manifest.json"), "utf8"))
    expect(manifestWithout.node_types).not.toContain("guide")
    expect(manifestWithout.node_types).toEqual(["decision", "requirement", "specification"])
  })

  it("augmentation can add a relation_type without node_types", async () => {
    const fixture = await setup()
    const augContent = `relation_types:
  - name: custom_rel
    fields:
      - custom_field
    reverse_direction: false
`
    await mkdir(join(fixture.root, ".agentdev"), { recursive: true })
    await writeFile(join(fixture.root, AUGMENTATION_DEFAULT_PATH), augContent, "utf8")
    await buildGraph(fixture)
    const manifest = JSON.parse(await readFile(join(fixture.output, "manifest.json"), "utf8"))
    expect(manifest.relation_types).toContain("custom_rel")
    expect(manifest.relation_types).toContain("references") // default still present
  })
})
