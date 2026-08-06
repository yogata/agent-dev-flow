import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { buildGraph } from "../lib/graph.ts"
import { prepareWorkflowGraph } from "../lib/workflow.ts"
import { createFixture } from "./fixture.ts"

const roots: string[] = []

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

async function setup(): Promise<{ readonly root: string; readonly output: string }> {
  const root = await mkdtemp(join(tmpdir(), "artifact-graph-workflow-"))
  roots.push(root)
  await createFixture(root)
  return { root, output: join(root, ".agentdev", "graph") }
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe("TS-011: optional workflow preparation", () => {
  it("regenerates the graph when it is missing", async () => {
    // Given
    const fixture = await setup()

    // When
    const result = await prepareWorkflowGraph(fixture)

    // Then
    expect(result.status).toBe("ready")
    expect(result.freshness).toBe("regenerated")
  })

  it("regenerates the graph when indexed input is stale", async () => {
    // Given
    const fixture = await setup()
    const initial = await buildGraph(fixture)
    await writeFile(join(fixture.root, "scripts", "new-input.ts"), "export const changed = true\n", "utf8")

    // When
    const result = await prepareWorkflowGraph(fixture)
    const regenerated = JSON.parse(await Bun.file(join(fixture.output, "manifest.json")).text())

    // Then
    expect(result.status).toBe("ready")
    expect(result.freshness).toBe("regenerated")
    expect(isRecord(regenerated) ? regenerated["input_digest"] : undefined).not.toBe(initial.inputDigest)
  })

  it("limits a stale graph to auxiliary use when regeneration fails", async () => {
    // Given
    const fixture = await setup()
    await buildGraph(fixture)
    await writeFile(join(fixture.root, "scripts", "new-input.ts"), "export const changed = true\n", "utf8")
    const failingBuilder = async (): Promise<never> => {
      throw new TypeError("simulated generation failure")
    }

    // When
    const result = await prepareWorkflowGraph(fixture, failingBuilder)

    // Then
    expect(result.status).toBe("limited")
    if (result.status !== "limited") throw new TypeError("expected a limited graph result")
    expect(result.freshness).toBe("stale")
    expect(result.reason).toContain("simulated generation failure")
  })

  it("returns unavailable instead of throwing when no graph can be generated", async () => {
    // Given
    const fixture = await setup()
    const failingBuilder = async (): Promise<never> => {
      throw new TypeError("simulated generation failure")
    }

    // When
    const result = await prepareWorkflowGraph(fixture, failingBuilder)

    // Then
    expect(result.status).toBe("unavailable")
    if (result.status !== "unavailable") throw new TypeError("expected an unavailable graph result")
    expect(result.freshness).toBe("missing")
    expect(result.reason).toContain("simulated generation failure")
  })

  it("keeps the preparation CLI successful when graph generation is unavailable", async () => {
    // Given
    const root = await mkdtemp(join(tmpdir(), "artifact-graph-cli-failure-"))
    roots.push(root)
    const invalidRoot = join(root, "root-file")
    await writeFile(invalidRoot, "not a directory", "utf8")
    const cli = resolve(import.meta.dir, "..", "prepare_graph.ts")

    // When
    const process = Bun.spawn(["bun", cli, "--root", invalidRoot], { stdout: "pipe", stderr: "pipe" })
    const exitCode = await process.exited
    const output = JSON.parse(await new Response(process.stdout).text())

    // Then
    expect(exitCode).toBe(0)
    expect(isRecord(output) ? output["status"] : undefined).toBe("unavailable")
  })
})
