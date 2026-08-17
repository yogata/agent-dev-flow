import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, mkdir, readdir, rename, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { buildGraph, loadGraph } from "../lib/graph.ts"
import { prepareWorkflowGraph } from "../lib/workflow.ts"
import { AUGMENTATION_DEFAULT_PATH } from "../lib/augmentation.ts"
import { createFixture, REQ_001, REQ_001_PATH } from "./fixture.ts"

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

describe(`fail-open: Graph missing/stale/failure does not halt workflow (REQ-{NNNN}-010)`, () => {
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
    const req001File = REQ_001_PATH
    await writeFile(
      join(fixture.root, req001File),
      `---\nid: ${REQ_001}\ntitle: Changed\n---\n# Changed\n`,
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
    const req001File = REQ_001_PATH
    await writeFile(
      join(fixture.root, req001File),
      `---\nid: ${REQ_001}\ntitle: Changed\n---\n# Changed\n`,
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

describe("TS-{NNN} (AG-{NNN}): Graph missing does not halt workflow; fallback discovery works", () => {
  it("renaming .agentdev/graph/ away lets prepare_graph regenerate (workflow continues)", async () => {
    const fixture = await setup()
    await buildGraph(fixture)

    await rename(fixture.output, `${fixture.output}.bak`)
    const graphDirExists = await readdir(join(fixture.root, ".agentdev")).then(
      (entries) => entries.includes("graph"),
      () => false,
    )
    expect(graphDirExists).toBe(false)

    const result = await prepareWorkflowGraph(fixture)
    expect(result.status).toBe("ready")
    if (result.status !== "ready") throw new TypeError("expected ready")
    expect(result.freshness).toBe("regenerated")

    await rm(`${fixture.output}.bak`, { recursive: true, force: true })
  })

  it("discover CLI finds canonical docs via filesystem when no graph exists", async () => {
    const root = await mkdtemp(join(tmpdir(), "ag-ts007-discover-"))
    roots.push(root)
    await createFixture(root)

    const graphExists = await readdir(join(root, ".agentdev")).then(
      (entries) => entries.includes("graph"),
      () => false,
    )
    expect(graphExists).toBe(false)

    const cli = resolve(import.meta.dir, "..", "src", "query_graph.ts")
    const discoverRoot = `docs/requirements`
    const proc = Bun.spawn(
      ["bun", cli, "--root", root, "discover", "sample requirement", "--roots", discoverRoot],
      { stdout: "pipe", stderr: "pipe" },
    )
    const exitCode = await proc.exited
    const output = JSON.parse(await new Response(proc.stdout).text())

    expect(exitCode).toBe(0)
    expect(isRecord(output) ? output["discovered"] : undefined).toContain(REQ_001_PATH)
  })

  it(`consumer not adopting ADF: prepare_graph returns ready with empty but valid graph (REQ-{NNNN}-014)`, async () => {
    const root = await mkdtemp(join(tmpdir(), "ag-ts007-noadf-"))
    roots.push(root)
    await writeFile(join(root, "README.md"), "# Not an ADF project\n", "utf8")

    const output = join(root, ".agentdev", "graph")
    const result = await prepareWorkflowGraph({ root, output })
    expect(result.status).toBe("ready")

    const graph = await loadGraph(output)
    expect(graph.nodes).toEqual([])
    expect(graph.edges).toEqual([])
    expect(graph.manifest.indexed_paths).toEqual([
      "docs/requirements",
      "docs/decisions",
      "docs/specs",
    ])
  })
})

const AUG_WITH_SEMANTIC_RELATION = `relation_types:
  - name: probe
    fields:
      - probe_field
    semantics:
      meaning: "鮮度判定検出用の拡張関係型"
      change_impact_direction: forward
`

describe(`freshness by 4 elements: input, config, generator, schema (REQ-{NNNN}-013/025)`, () => {
  async function prepared() {
    const fixture = await setup()
    await buildGraph(fixture)
    return fixture
  }

  it("regenerates when graph_config_digest changes without input change", async () => {
    const fixture = await prepared()
    const before = JSON.parse(await Bun.file(join(fixture.output, "manifest.json")).text())

    await mkdir(join(fixture.root, ".agentdev"), { recursive: true })
    await writeFile(join(fixture.root, AUGMENTATION_DEFAULT_PATH), AUG_WITH_SEMANTIC_RELATION, "utf8")

    const result = await prepareWorkflowGraph(fixture)
    expect(result.status).toBe("ready")
    if (result.status !== "ready") throw new TypeError("expected ready")
    expect(result.freshness).toBe("regenerated")

    const after = JSON.parse(await Bun.file(join(fixture.output, "manifest.json")).text())
    expect(after.input_digest).toBe(before.input_digest)
    expect(after.graph_config_digest).not.toBe(before.graph_config_digest)
  })

  it("keeps the graph when only query-time settings (discovery_roots) change", async () => {
    const fixture = await prepared()
    await mkdir(join(fixture.root, ".agentdev"), { recursive: true })
    await writeFile(join(fixture.root, AUGMENTATION_DEFAULT_PATH), AUG_WITH_SEMANTIC_RELATION, "utf8")
    await buildGraph(fixture)

    await writeFile(
      join(fixture.root, AUGMENTATION_DEFAULT_PATH),
      `${AUG_WITH_SEMANTIC_RELATION}discovery_roots:
  - src
`,
      "utf8",
    )

    const result = await prepareWorkflowGraph(fixture)
    expect(result.status).toBe("ready")
    if (result.status !== "ready") throw new TypeError("expected ready")
    expect(result.freshness).toBe("current")
  })

  it("regenerates when generator_version differs", async () => {
    const fixture = await prepared()
    const manifestPath = join(fixture.output, "manifest.json")
    const manifest = JSON.parse(await Bun.file(manifestPath).text())
    manifest.generator_version = "0.0.1"
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8")

    const result = await prepareWorkflowGraph(fixture)
    expect(result.status).toBe("ready")
    if (result.status !== "ready") throw new TypeError("expected ready")
    expect(result.freshness).toBe("regenerated")
  })

  it("regenerates when the graph is schema-incompatible or corrupt", async () => {
    for (const corrupt of ["schema", "body"] as const) {
      const fixture = await prepared()
      if (corrupt === "schema") {
        const manifestPath = join(fixture.output, "manifest.json")
        const manifest = JSON.parse(await Bun.file(manifestPath).text())
        manifest.schema_version = "0.9.9"
        await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8")
      } else {
        await writeFile(join(fixture.output, "nodes.jsonl"), "{not json\n", "utf8")
      }

      const result = await prepareWorkflowGraph(fixture)
      expect(result.status).toBe("ready")
      if (result.status !== "ready") throw new TypeError("expected ready")
      expect(result.freshness).toBe("regenerated")
    }
  })

  it("returns unavailable (invalid) when a corrupt graph cannot be regenerated", async () => {
    const fixture = await prepared()
    const manifestPath = join(fixture.output, "manifest.json")
    const manifest = JSON.parse(await Bun.file(manifestPath).text())
    manifest.schema_version = "0.9.9"
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8")

    const failingBuilder = async (): Promise<never> => {
      throw new TypeError("simulated generation failure")
    }
    const result = await prepareWorkflowGraph(fixture, failingBuilder)
    expect(result.status).toBe("unavailable")
    if (result.status !== "unavailable") throw new TypeError("expected unavailable")
    expect(result.freshness).toBe("invalid")
    expect(result.reason).toContain("simulated generation failure")
  })
})
