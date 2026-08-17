import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import {
  createTraceFixture,
  traceAugmentationYaml,
  DEC1_NODE,
  REQ1_NODE,
  REQ2_NODE,
  SRC_NODE,
  SRC_PATH,
  SPEC_NODE,
  SPEC_PATH,
} from "./trace_fixture.ts"

const roots: string[] = []
const scriptRoot = resolve(import.meta.dir, "..", "src")

function runCli(args: readonly string[]) {
  return Bun.spawnSync(["bun", join(scriptRoot, "query_graph.ts"), ...args])
}

function runBuild(root: string, args: readonly string[] = []) {
  return Bun.spawnSync(["bun", join(scriptRoot, "build_graph.ts"), "--root", root, ...args])
}

async function cliFixture() {
  const root = await mkdtemp(join(tmpdir(), "ag-trace-cli-"))
  roots.push(root)
  await createTraceFixture(root, traceAugmentationYaml({ indexRole: true }))
  const output = join(root, ".agentdev", "graph")
  const build = runBuild(root, ["--output", output])
  expect(build.exitCode).toBe(0)
  return { root, output }
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe("high-level query CLI (TS-{NNN})", () => {
  it("related subcommand returns candidate JSON", async () => {
    const { output } = await cliFixture()
    const result = runCli(["--graph", output, "related", REQ1_NODE])
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout.toString())
    expect(parsed.profile).toBe("related")
    expect(parsed.start).toBe(REQ1_NODE)
    expect(parsed.candidates.length).toBeGreaterThan(0)
  })

  it("--limit override applies to this run only and reports overflow", async () => {
    const { output } = await cliFixture()
    const result = runCli(["--graph", output, "related", REQ1_NODE, "--limit", "2"])
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout.toString())
    expect(parsed.candidates).toHaveLength(2)
    expect(parsed.truncation.total_candidates).toBe(5)
    expect(parsed.truncation.returned_candidates).toBe(2)
    expect(parsed.truncation.independent_search_available).toBe(true)
  })

  it("diagnostics subcommand returns structural findings", async () => {
    const { output } = await cliFixture()
    const result = runCli(["--graph", output, "diagnostics"])
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout.toString())
    expect(parsed.profile).toBe("diagnostics")
    expect(parsed.findings.length).toBeGreaterThan(0)
  })
})

describe("discovery_roots auto-resolution (REQ-{NNNN}-{NNN}/011)", () => {
  it("discover without --roots resolves discovery_roots from the applied config", async () => {
    const { root, output } = await cliFixture()
    const result = runCli(["--root", root, "--graph", output, "discover", "feature"])
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout.toString())
    expect(parsed.discovered).toEqual([SRC_PATH])
  })

  it("explicit --roots overrides discovery_roots for that run only", async () => {
    const { root, output } = await cliFixture()
    const overridden = runCli(["--root", root, "--graph", output, "discover", "feature", "--roots", "docs"])
    expect(overridden.exitCode).toBe(0)
    const discovered: readonly string[] = JSON.parse(overridden.stdout.toString()).discovered
    expect(discovered.length).toBeGreaterThan(0)
    for (const path of discovered) {
      expect(path.startsWith("docs/")).toBe(true)
    }
    expect(discovered).toContain(SPEC_PATH)

    const again = runCli(["--root", root, "--graph", output, "discover", "feature"])
    expect(JSON.parse(again.stdout.toString()).discovered).toEqual([SRC_PATH])
  })
})

describe("failure modes allow fallback to independent search (TS-{NNN})", () => {
  it("missing derived index exits non-zero with stderr message", async () => {
    const { root } = await cliFixture()
    const result = runCli(["--graph", join(root, ".agentdev", "missing-graph"), "related", REQ1_NODE])
    expect(result.exitCode).toBe(2)
    expect(result.stderr.toString().length).toBeGreaterThan(0)
  })

  it("corrupted nodes file exits non-zero", async () => {
    const { output } = await cliFixture()
    await writeFile(join(output, "nodes.jsonl"), "not-json\n", "utf8")
    const result = runCli(["--graph", output, "related", REQ1_NODE])
    expect(result.exitCode).toBe(2)
    expect(result.stderr.toString().length).toBeGreaterThan(0)
  })

  it("graph build failure exits non-zero", async () => {
    const root = await mkdtemp(join(tmpdir(), "ag-trace-broken-"))
    roots.push(root)
    await createTraceFixture(root, traceAugmentationYaml({ indexRole: true }))
    await writeFile(join(root, "broken.yaml"), "{ invalid yaml\n", "utf8")
    const result = runBuild(root, ["--augmentation", "broken.yaml"])
    expect(result.exitCode).toBe(2)
    expect(result.stderr.toString().length).toBeGreaterThan(0)
  })

  it("unknown query subcommand exits non-zero", async () => {
    const { output } = await cliFixture()
    const result = runCli(["--graph", output, "bogus", REQ1_NODE])
    expect(result.exitCode).toBe(2)
    expect(result.stderr.toString()).toContain("query must be one of")
  })

  it("candidate overflow reports independent_search_available", async () => {
    const { output } = await cliFixture()
    const result = runCli(["--graph", output, "related", REQ1_NODE, "--limit", "1"])
    expect(result.exitCode).toBe(0)
    expect(JSON.parse(result.stdout.toString()).truncation.independent_search_available).toBe(true)
  })
})

describe("low-level public behavior unchanged (TS-{NNN} compatibility)", () => {
  it("neighbors keeps the legacy result shape including index nodes", async () => {
    const { output } = await cliFixture()
    const result = runCli(["--graph", output, "neighbors", REQ1_NODE, "--depth", "1"])
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout.toString())
    expect(Object.keys(parsed).sort()).toEqual(["edges", "nodes", "provenance", "relations"])
    expect(parsed.nodes).toContain(DEC1_NODE)
    expect(parsed.nodes).toContain(SPEC_NODE)
    expect(parsed.relations.every((relation: { type: string }) => typeof relation.type === "string")).toBe(true)
  })

  it("provenance keeps returning evidence for high-level candidates", async () => {
    const { output } = await cliFixture()
    const result = runCli(["--graph", output, "provenance", SRC_NODE])
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout.toString())
    expect(parsed.provenance.length).toBe(1)
    expect(parsed.provenance[0]?.path).toBe(SRC_PATH)
  })

  it("empty high-level result stays exit 0 (normal empty, not an index failure)", async () => {
    const { output } = await cliFixture()
    const result = runCli(["--graph", output, "related", REQ2_NODE])
    expect(result.exitCode).toBe(0)
    expect(JSON.parse(result.stdout.toString()).candidates).toEqual([])
  })
})
