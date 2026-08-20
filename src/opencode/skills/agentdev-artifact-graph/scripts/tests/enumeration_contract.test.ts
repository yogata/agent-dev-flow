import { afterEach, describe, expect, it } from "bun:test"
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises"
import { readdirSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { collectInputs, computeInputDigest } from "../lib/input.ts"
import { queryGraph } from "../lib/query.ts"
import { verifyGraph } from "../lib/verification.ts"
import { buildGraph, loadGraph, resolveBuildConfig } from "../lib/graph.ts"
import { createFixture } from "./fixture.ts"

// Enumeration contract regression (standard API migration).
//
// Fixes the acceptance behavior of the recursive file enumeration used by
// input collection, discover queries, and the verification scan so that the
// migration to the standard glob API keeps: the enumerated file set,
// exclusion of dependency/cache directories, ENOENT (missing indexed path)
// handling, forward-slash path normalization, determinism, and the
// non-descent of link directories (junctions/symlinks).

const roots: string[] = []

async function tmpRoot(prefix: string): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), prefix))
  roots.push(root)
  return root
}

async function write(root: string, rel: string, content = "content\n"): Promise<void> {
  await mkdir(join(root, ...rel.split("/").slice(0, -1)), { recursive: true })
  await writeFile(join(root, ...rel.split("/")), content, "utf8")
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe("recursive enumeration contract: input collection", () => {
  it("collects the exact file set with forward-slash repo-relative paths", async () => {
    const root = await tmpRoot("ag-enum-input-")
    await write(root, "tree/a.md")
    await write(root, "tree/sub/b.md")
    await write(root, "tree/sub/deep/c.yaml")
    await write(root, "tree/notes.yml")
    await write(root, "other/o.md")
    const base = await resolveBuildConfig(root)
    const config = { ...base, indexed_paths: ["tree", "other"] }

    const inputs = await collectInputs(root, config)

    expect(inputs.map((f) => f.path)).toEqual([
      "other/o.md",
      "tree/a.md",
      "tree/notes.yml",
      "tree/sub/b.md",
      "tree/sub/deep/c.yaml",
    ])
  })

  it("excludes dependency and cache directories and temporary files", async () => {
    const root = await tmpRoot("ag-enum-excl-")
    await write(root, "tree/keep.md")
    await write(root, "tree/node_modules/deep/nm.md")
    await write(root, "tree/.git/g.md")
    await write(root, "tree/.cache/c.md")
    await write(root, "tree/scratch.tmp")
    const base = await resolveBuildConfig(root)
    const config = { ...base, indexed_paths: ["tree"] }

    const inputs = await collectInputs(root, config)

    expect(inputs.map((f) => f.path)).toEqual(["tree/keep.md"])
  })

  it("treats a missing indexed path as empty without failing the run", async () => {
    const root = await tmpRoot("ag-enum-missing-")
    await write(root, "tree/keep.md")
    const base = await resolveBuildConfig(root)
    const config = { ...base, indexed_paths: ["tree", "does/not/exist"] }

    const inputs = await collectInputs(root, config)

    expect(inputs.map((f) => f.path)).toEqual(["tree/keep.md"])
  })

  it("is deterministic: identical inputs produce identical paths and digest", async () => {
    const root = await tmpRoot("ag-enum-det-")
    await write(root, "tree/a.md", "alpha\n")
    await write(root, "tree/sub/b.yaml", "beta: 1\n")
    const base = await resolveBuildConfig(root)
    const config = { ...base, indexed_paths: ["tree"] }

    const first = await collectInputs(root, config)
    const second = await collectInputs(root, config)

    expect(second).toEqual(first)
    expect(computeInputDigest(second)).toBe(computeInputDigest(first))
  })

  it("does not descend into link directories and does not report link files", async () => {
    const root = await tmpRoot("ag-enum-links-")
    await write(root, "tree/real/inner.md")
    await write(root, "tree/plain.md")
    // Junction creation works without elevated privileges on Windows.
    await symlink(join(root, "tree/real"), join(root, "tree/jdir"), "junction")
    let fileLinkCreated = true
    try {
      await symlink(join(root, "tree/plain.md"), join(root, "tree/slink.md"), "file")
    } catch {
      fileLinkCreated = false
    }
    const base = await resolveBuildConfig(root)
    const config = { ...base, indexed_paths: ["tree"] }

    const inputs = await collectInputs(root, config)
    const paths = inputs.map((f) => f.path)

    expect(paths).toContain("tree/plain.md")
    expect(paths).toContain("tree/real/inner.md")
    expect(paths.some((p) => p.startsWith("tree/jdir/"))).toBe(false)
    if (fileLinkCreated) {
      expect(paths).not.toContain("tree/slink.md")
    }
  })
})

describe("recursive enumeration contract: discover query", () => {
  it("finds matches under the query roots with sorted, deduplicated output", async () => {
    const root = await tmpRoot("ag-enum-disc-")
    await write(root, "tree/alpha-term.md", "contains zebra\n")
    await write(root, "tree/sub/zebra.md", "plain\n")
    await write(root, "tree/sub/deep/other.md", "zebra inside\n")
    await write(root, "other/no-term.md")

    const result = await queryGraph(emptyGraph(), {
      kind: "discover",
      term: "zebra",
      roots: ["tree", "missing-root"],
      rootDir: root,
    })

    expect(result.discovered).toEqual([
      "tree/alpha-term.md",
      "tree/sub/deep/other.md",
      "tree/sub/zebra.md",
    ])
  })
})

describe("recursive enumeration contract: verification scan", () => {
  it("counts only markdown files under the indexed paths", async () => {
    const root = await tmpRoot("ag-enum-verify-")
    await createFixture(root)
    // Non-markdown input files must not inflate the verification file count.
    await write(root, "docs/requirements/extra.yaml", "extra: 1\n")
    await buildGraph({ root, output: join(root, ".agentdev", "graph") })
    const graph = await loadGraph(join(root, ".agentdev", "graph"))
    const config = await resolveBuildConfig(root)

    const report = await verifyGraph(root, graph, config)

    // Independent .md count as the oracle: non-markdown inputs (extra.yaml)
    // must not inflate the verification file count.
    const mdCount = ["docs/requirements", "docs/decisions", "docs/designs"]
      .flatMap((p) => readdirSync(join(root, p), { recursive: true }) as string[])
      .filter((f) => f.endsWith(".md")).length
    expect(report.summary.checked_files).toBe(mdCount)
    expect(report.summary.checked_files).toBeGreaterThan(0)
  })
})

function emptyGraph() {
  return {
    meta: { generated_at: "", config_digest: "", schema: "", tool: { name: "", version: "" } },
    nodes: [],
    edges: [],
    provenance: [],
  } as unknown as Parameters<typeof queryGraph>[0]
}
