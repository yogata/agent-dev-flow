import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { buildGraph } from "../lib/graph.ts"
import { createFixture } from "./fixture.ts"

const OUTPUT_FILES = [
  "manifest.json", "nodes.jsonl", "edges.jsonl", "provenance.jsonl", "diagnostics.json",
] as const
const roots: string[] = []

async function setup(suffix: string): Promise<{ readonly root: string; readonly output: string }> {
  const root = await mkdtemp(join(tmpdir(), `artifact-graph-${suffix}-`))
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

describe("TS-007 and TS-008: deterministic output", () => {
  it("produces byte-identical artifacts across runs at different times", async () => {
    // Given
    const fixture = await setup("determinism")
    await buildGraph(fixture)
    const first = await snapshot(fixture.output)
    await Bun.sleep(5)

    // When
    await buildGraph(fixture)
    const second = await snapshot(fixture.output)

    // Then
    expect(second).toEqual(first)
    expect(JSON.parse(await readFile(join(fixture.output, "manifest.json"), "utf8"))).not.toHaveProperty("generated_at")
  })
})

describe("TS-009: digest inputs and exclusions", () => {
  it("changes for input path or content but ignores graph, Git, cache and temporary files", async () => {
    // Given
    const fixture = await setup("digest")
    await buildGraph(fixture)
    const first = JSON.parse(await readFile(join(fixture.output, "manifest.json"), "utf8"))
    await mkdir(join(fixture.root, ".git"), { recursive: true })
    await mkdir(join(fixture.root, "node_modules", "cache"), { recursive: true })
    await writeFile(join(fixture.root, ".git", "ignored"), "changed", "utf8")
    await writeFile(join(fixture.root, "node_modules", "cache", "ignored.tmp"), "changed", "utf8")

    // When
    await buildGraph(fixture)
    const excluded = JSON.parse(await readFile(join(fixture.output, "manifest.json"), "utf8"))
    await writeFile(join(fixture.root, "scripts", "sample.ts"), "export const sample = false\n", "utf8")
    await buildGraph(fixture)
    const changed = JSON.parse(await readFile(join(fixture.output, "manifest.json"), "utf8"))

    // Then
    expect(excluded.input_digest).toBe(first.input_digest)
    expect(changed.input_digest).not.toBe(first.input_digest)
    expect(changed.excluded_paths).toEqual(expect.arrayContaining([
      ".agentdev/graph/**", ".git/**", "node_modules/**", "**/*.tmp",
    ]))
  })
})
