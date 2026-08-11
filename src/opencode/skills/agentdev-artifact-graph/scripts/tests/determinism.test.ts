import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { buildGraph } from "../lib/graph.ts"
import { createFixture } from "./fixture.ts"

const OUTPUT_FILES = ["manifest.json", "nodes.jsonl", "edges.jsonl", "provenance.jsonl", "diagnostics.json"] as const
const roots: string[] = []

async function setup(suffix: string): Promise<{ readonly root: string; readonly output: string }> {
  const root = await mkdtemp(join(tmpdir(), `ag-det-${suffix}-`))
  roots.push(root)
  await createFixture(root)
  return { root, output: join(root, ".agentdev", "graph") }
}

async function snapshot(output: string): Promise<readonly Uint8Array[]> {
  return Promise.all(OUTPUT_FILES.map((name) => readFile(join(output, name))))
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe("TS-008: deterministic output (REQ\u002D012-013)", () => {
  it("same input → byte-identical 5 files across runs", async () => {
    const fixture = await setup("det")
    await buildGraph(fixture)
    const first = await snapshot(fixture.output)
    await Bun.sleep(5)

    await buildGraph(fixture)
    const second = await snapshot(fixture.output)

    expect(second).toEqual(first)
  })

  it("manifest has no generated_at timestamp", async () => {
    const fixture = await setup("nots")
    await buildGraph(fixture)
    const manifest = JSON.parse(await readFile(join(fixture.output, "manifest.json"), "utf8"))
    expect(manifest).not.toHaveProperty("generated_at")
    expect(manifest).not.toHaveProperty("built_at")
  })

  it("input_digest excludes graph output, git, node_modules", async () => {
    const { mkdir, writeFile } = await import("node:fs/promises")
    const fixture = await setup("excl")
    await buildGraph(fixture)
    const first = JSON.parse(await readFile(join(fixture.output, "manifest.json"), "utf8"))

    // Add files in excluded paths
    await mkdir(join(fixture.root, ".git"), { recursive: true })
    await mkdir(join(fixture.root, "node_modules", "cache"), { recursive: true })
    await writeFile(join(fixture.root, ".git", "ignored"), "changed", "utf8")
    await writeFile(join(fixture.root, "node_modules", "cache", "ignored.tmp"), "changed", "utf8")

    await buildGraph(fixture)
    const afterExcluded = JSON.parse(await readFile(join(fixture.output, "manifest.json"), "utf8"))

    expect(afterExcluded.input_digest).toBe(first.input_digest)
  })

  it("input_digest changes when canonical input changes", async () => {
    const { writeFile } = await import("node:fs/promises")
    const fixture = await setup("chg")
    await buildGraph(fixture)
    const first = JSON.parse(await readFile(join(fixture.output, "manifest.json"), "utf8"))

    await writeFile(
      join(fixture.root, "docs\\u002Frequirements/REQ\u002D001.md"),
      "---\nid: REQ\u002D001\ntitle: Changed\n---\n# Changed\n",
      "utf8",
    )
    await buildGraph(fixture)
    const changed = JSON.parse(await readFile(join(fixture.output, "manifest.json"), "utf8"))

    expect(changed.input_digest).not.toBe(first.input_digest)
  })
})
