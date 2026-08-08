import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { buildGraph } from "../lib/graph.ts"
import { prepareWorkflowGraph } from "../lib/workflow.ts"
import { createFixture } from "./fixture.ts"

const roots: string[] = []

async function setup(): Promise<{ readonly root: string; readonly output: string }> {
  const root = await mkdtemp(join(tmpdir(), "ag-wf-"))
  roots.push(root)
  await createFixture(root)
  return { root, output: join(root, ".agentdev", "graph") }
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

describe("fail-open: Graph missing/stale/failure does not halt workflow (REQ-012-010)", () => {
  it("regenerates the graph when it is missing", async () => {
    const fixture = await setup()
    const result = await prepareWorkflowGraph(fixture)
    expect(result.status).toBe("ready")
    if (result.status !== "ready") throw new TypeError("expected ready")
    expect(result.freshness).toBe("regenerated")
  })

  it("keeps current graph when input is unchanged", async () => {
    const fixture = await setup()
    await buildGraph(fixture)
    const result = await prepareWorkflowGraph(fixture)
    expect(result.status).toBe("ready")
    if (result.status !== "ready") throw new TypeError("expected ready")
    expect(result.freshness).toBe("current")
  })

  it("regenerates when input is stale", async () => {
    const fixture = await setup()
    const initial = await buildGraph(fixture)
    await writeFile(
      join(fixture.root, "docs/requirements/REQ-001.md"),
      "---\nid: REQ-001\ntitle: Changed\n---\n# Changed\n",
      "utf8",
    )
    const result = await prepareWorkflowGraph(fixture)
    expect(result.status).toBe("ready")
    if (result.status !== "ready") throw new TypeError("expected ready")
    expect(result.freshness).toBe("regenerated")
    const regenerated = JSON.parse(await Bun.file(join(fixture.output, "manifest.json")).text())
    expect(isRecord(regenerated) ? regenerated["input_digest"] : undefined).not.toBe(initial.inputDigest)
  })

  it("limits a stale graph when regeneration fails (fail-open)", async () => {
    const fixture = await setup()
    await buildGraph(fixture)
    await writeFile(
      join(fixture.root, "docs/requirements/REQ-001.md"),
      "---\nid: REQ-001\ntitle: Changed\n---\n# Changed\n",
      "utf8",
    )
    const failingBuilder = async (): Promise<never> => {
      throw new TypeError("simulated generation failure")
    }
    const result = await prepareWorkflowGraph(fixture, failingBuilder)
    expect(result.status).toBe("limited")
    if (result.status !== "limited") throw new TypeError("expected limited")
    expect(result.freshness).toBe("stale")
    expect(result.reason).toContain("simulated generation failure")
  })

  it("returns unavailable instead of throwing when no graph can be generated", async () => {
    const fixture = await setup()
    const failingBuilder = async (): Promise<never> => {
      throw new TypeError("simulated generation failure")
    }
    const result = await prepareWorkflowGraph(fixture, failingBuilder)
    expect(result.status).toBe("unavailable")
    if (result.status !== "unavailable") throw new TypeError("expected unavailable")
    expect(result.freshness).toBe("missing")
    expect(result.reason).toContain("simulated generation failure")
  })

  it("prepare CLI exits 0 even when generation fails (fail-open at CLI level)", async () => {
    const root = await mkdtemp(join(tmpdir(), "ag-cli-fail-"))
    roots.push(root)
    const invalidRoot = join(root, "root-file")
    await writeFile(invalidRoot, "not a directory", "utf8")
    const cli = resolve(import.meta.dir, "..", "src", "prepare_graph.ts")

    const proc = Bun.spawn(["bun", cli, "--root", invalidRoot], { stdout: "pipe", stderr: "pipe" })
    const exitCode = await proc.exited
    const output = JSON.parse(await new Response(proc.stdout).text())

    expect(exitCode).toBe(0)
    expect(isRecord(output) ? output["status"] : undefined).toBe("unavailable")
  })
})
