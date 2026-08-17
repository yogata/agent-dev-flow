import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { buildGraph, loadGraph } from "../lib/graph.ts"
import { queryGraph } from "../lib/query.ts"
import { resolveConfig, type AugmentationFile } from "../lib/augmentation.ts"
import { collectInputs } from "../lib/input.ts"
import { buildGraphWithConfig } from "../lib/graph.ts"
import { createFixture, createSourceFixture } from "./fixture.ts"

const roots: string[] = []

async function setup(): Promise<{ readonly root: string; readonly output: string }> {
  const root = await mkdtemp(join(tmpdir(), "ag-disc-"))
  roots.push(root)
  await createFixture(root)
  await createSourceFixture(root)
  return { root, output: join(root, ".agentdev", "graph") }
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe("TS-{NNN}: discovery_roots with start point → query-time exploration", () => {
  it("default config has empty discovery_roots", async () => {
    const config = resolveConfig(undefined)
    expect(config.discovery_roots).toEqual([])
  })

  it("augmentation adds discovery_roots", async () => {
    const aug: AugmentationFile = {
      discovery_roots: ["src", "tests"],
    }
    const config = resolveConfig(aug)
    expect(config.discovery_roots).toContain("src")
    expect(config.discovery_roots).toContain("tests")
  })

  it("discover query finds term in discovery_roots", async () => {
    const fixture = await setup()
    const aug: AugmentationFile = {
      discovery_roots: ["src", "tests"],
    }
    const config = resolveConfig(aug)
    await buildGraphWithConfig(fixture, config)

    const graph = await loadGraph(fixture.output)
    const result = await queryGraph(graph, {
      kind: "discover",
      term: "agentdev-artifact-graph",
      roots: ["src", "tests"],
      rootDir: fixture.root,
    })
    expect(result.discovered).toBeDefined()
    expect(result.discovered?.length).toBeGreaterThan(0)
    expect(result.discovered?.some((f) => f.includes("foo.ts"))).toBe(true)
  })

  it("discover query respects root boundaries", async () => {
    const fixture = await setup()
    await buildGraph(fixture)
    const graph = await loadGraph(fixture.output)
    const result = await queryGraph(graph, {
      kind: "discover",
      term: "helper",
      roots: ["src"],
      rootDir: fixture.root,
    })
    expect(result.discovered?.some((f) => f.includes("foo.ts"))).toBe(true)
    // tests/ should not be searched when roots only includes src
    expect(result.discovered?.some((f) => f.startsWith("tests/"))).toBe(false)
  })

  it("project-owned source NOT in default indexed_paths (only in discovery_roots)", async () => {
    const fixture = await setup()
    const config = resolveConfig(undefined)
    const inputs = await collectInputs(fixture.root, config)
    // src/ and tests/ should NOT be collected with default config
    expect(inputs.some((i) => i.path.startsWith("src/"))).toBe(false)
    expect(inputs.some((i) => i.path.startsWith("tests/"))).toBe(false)
  })

  it("discover query returns empty for non-existent root", async () => {
    const fixture = await setup()
    await buildGraph(fixture)
    const graph = await loadGraph(fixture.output)
    const result = await queryGraph(graph, {
      kind: "discover",
      term: "anything",
      roots: ["nonexistent"],
      rootDir: fixture.root,
    })
    expect(result.discovered).toEqual([])
  })

  it("discover via CLI", async () => {
    const fixture = await setup()
    await buildGraph(fixture)
    const cli = resolve(import.meta.dir, "..", "src", "query_graph.ts")
    const proc = Bun.spawnSync([
      "bun", cli, "--graph", fixture.output, "--root", fixture.root,
      "discover", "agentdev-artifact-graph", "--roots", "src,tests",
    ])
    expect(proc.exitCode).toBe(0)
    const output = JSON.parse(proc.stdout.toString())
    expect(output.discovered?.length).toBeGreaterThan(0)
  })
})
