// Argument acceptance data for query_graph.ts, fixed before the
// node:util.parseArgs migration (Issue #2354 / OU-003, REQ-044-003).
// Expectations pin the current indexOf/skip-2 parser; the migrated parser must
// reproduce them exactly. Normal-path regressions (related/discover/neighbors
// with real graphs) are covered by trace_cli.test.ts.

import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import {
  createTraceFixture,
  traceAugmentationYaml,
  REQ1_NODE,
  SRC_NODE,
  SRC_PATH,
} from "./trace_fixture.ts"

const roots: string[] = []
const scriptRoot = resolve(import.meta.dir, "..", "src")

function runCli(args: readonly string[]) {
  return Bun.spawnSync(["bun", join(scriptRoot, "query_graph.ts"), ...args])
}

async function cliFixture() {
  const root = await mkdtemp(join(tmpdir(), "ag-cli-args-"))
  roots.push(root)
  await createTraceFixture(root, traceAugmentationYaml({ indexRole: true }))
  const output = join(root, ".agentdev", "graph")
  const build = Bun.spawnSync(["bun", join(scriptRoot, "build_graph.ts"), "--root", root, "--output", output])
  expect(build.exitCode).toBe(0)
  return { root, output }
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe("query_graph argument acceptance data: syntax errors (pre-migration fix, OU-003)", () => {
  it("empty argv reports query subcommand required", () => {
    const r = runCli([])
    expect(r.exitCode).toBe(2)
    expect(r.stderr.toString()).toContain("query subcommand required")
  })

  it("unknown subcommand reports the accepted list", () => {
    const r = runCli(["bogus"])
    expect(r.exitCode).toBe(2)
    expect(r.stderr.toString()).toContain("query must be one of")
  })

  it("unknown long option is treated as the subcommand and rejected", () => {
    const r = runCli(["--bogus", "N"])
    expect(r.exitCode).toBe(2)
    expect(r.stderr.toString()).toContain("query must be one of")
  })

  it("unknown short option is treated as the subcommand and rejected", () => {
    const r = runCli(["-x", "N"])
    expect(r.exitCode).toBe(2)
    expect(r.stderr.toString()).toContain("query must be one of")
  })

  it("--option=value form is treated as the subcommand and rejected", () => {
    const r = runCli(["--limit=2", "related", "N"])
    expect(r.exitCode).toBe(2)
    expect(r.stderr.toString()).toContain("query must be one of")
  })

  it("a mid-arg -- after the subcommand operands is inert (exit 0)", async () => {
    const { output } = await cliFixture()
    const r = runCli(["--graph", output, "related", REQ1_NODE, "--", "extra"])
    expect(r.exitCode).toBe(0)
    expect(JSON.parse(r.stdout.toString()).profile).toBe("related")
  })

  it("a value flag consumes the next arg even when it is the subcommand", () => {
    const r = runCli(["--graph", "related", "N"])
    expect(r.exitCode).toBe(2)
    expect(r.stderr.toString()).toContain("query must be one of")
  })
})

describe("query_graph argument acceptance data: value binding (pre-migration fix, OU-003)", () => {
  it("resolves the subcommand and reaches graph loading (arg syntax accepted)", async () => {
    const missingGraph = join(await mkdtemp(join(tmpdir(), "ag-cli-missing-")), "gone")
    const r = runCli(["--graph", missingGraph, "related", REQ1_NODE])
    expect(r.exitCode).toBe(2)
    expect(r.stderr.toString().length).toBeGreaterThan(0)
    expect(r.stderr.toString()).not.toContain("query must be one of")
  })

  it("consumes -- as the value of a value flag and still resolves the subcommand", async () => {
    const r = runCli(["--graph", "--", "related", "N"])
    expect(r.exitCode).toBe(2)
    expect(r.stderr.toString().length).toBeGreaterThan(0)
    expect(r.stderr.toString()).not.toContain("query must be one of")
  })

  it("a trailing value flag without a value falls back (limit undefined, exit 0)", async () => {
    const { output } = await cliFixture()
    const r = runCli(["--graph", output, "related", REQ1_NODE, "--limit"])
    expect(r.exitCode).toBe(0)
    const parsed = JSON.parse(r.stdout.toString())
    expect(parsed.candidates.length).toBeGreaterThan(0)
  })

  it("first occurrence wins for duplicate value flags (--graph)", async () => {
    const { root, output } = await cliFixture()
    const missing = join(root, "missing-graph")
    const first = runCli(["--graph", missing, "--graph", output, "related", REQ1_NODE])
    expect(first.exitCode).toBe(2)

    const reversed = runCli(["--graph", output, "--graph", missing, "related", REQ1_NODE])
    expect(reversed.exitCode).toBe(0)
  })

  it("extra positional args after the subcommand operand are ignored", async () => {
    const { output } = await cliFixture()
    const r = runCli(["--graph", output, "provenance", SRC_NODE, "extra-arg"])
    expect(r.exitCode).toBe(0)
    const parsed = JSON.parse(r.stdout.toString())
    expect(parsed.provenance[0]?.path).toBe(SRC_PATH)
  })
})
