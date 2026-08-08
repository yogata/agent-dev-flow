import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { buildGraph } from "../lib/graph.ts"
import { DEFAULT_INDEXED_PATHS } from "../lib/config.ts"

const roots: string[] = []

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

async function jsonLines(path: string): Promise<readonly Record<string, unknown>[]> {
  const content = await Bun.file(path).text()
  return content.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line))
}

describe("REQ-012-008: consumer environment excludes AgentDevFlow distribution artifacts", () => {
  it("default indexed_paths exclude distribution artifact directories", () => {
    expect(DEFAULT_INDEXED_PATHS).not.toContain(".opencode/commands/agentdev")
    expect(DEFAULT_INDEXED_PATHS).not.toContain(".opencode/skills")
    expect(DEFAULT_INDEXED_PATHS).not.toContain(".agentdev-plugin")
  })

  it("AgentDevFlow distribution artifacts produce zero nodes in default config", async () => {
    const root = await mkdtemp(join(tmpdir(), "ag-consumer-"))
    roots.push(root)

    // Simulate consumer environment: docs/ exists + distribution artifacts exist
    await mkdir(join(root, "docs/requirements"), { recursive: true })
    await writeFile(
      join(root, "docs/requirements/REQ-001.md"),
      "---\nid: REQ-001\ntitle: Consumer req\n---\n# Consumer req\n",
      "utf8",
    )

    // Distribution artifacts (should NOT be indexed)
    await mkdir(join(root, ".opencode/commands/agentdev"), { recursive: true })
    await writeFile(
      join(root, ".opencode/commands/agentdev/req-define.md"),
      "---\ndescription: command\n---\n# req-define\n",
      "utf8",
    )
    await mkdir(join(root, ".opencode/skills/agentdev-foo"), { recursive: true })
    await writeFile(
      join(root, ".opencode/skills/agentdev-foo/SKILL.md"),
      "---\nname: agentdev-foo\ndescription: skill\n---\n# agentdev-foo\n",
      "utf8",
    )
    await mkdir(join(root, ".agentdev-plugin"), { recursive: true })
    await writeFile(join(root, ".agentdev-plugin/index.txt"), "plugin", "utf8")

    const output = join(root, ".agentdev", "graph")
    await buildGraph({ root, output })

    const nodes = await jsonLines(join(output, "nodes.jsonl"))
    // Only the REQ-001 node should exist
    expect(nodes.length).toBe(1)
    expect(nodes[0]?.["id"]).toBe("requirement:REQ-001")

    // No distribution artifact nodes
    expect(nodes.some((n) => String(n["id"] ?? "").includes("command:"))).toBe(false)
    expect(nodes.some((n) => String(n["id"] ?? "").includes("skill:"))).toBe(false)
    expect(nodes.some((n) => String(n["id"] ?? "").includes("source_file:"))).toBe(false)
  })

  it("consumer with only distribution artifacts and no docs produces empty graph", async () => {
    const root = await mkdtemp(join(tmpdir(), "ag-consumer-empty-"))
    roots.push(root)

    // Only distribution artifacts, no docs/
    await mkdir(join(root, ".opencode/skills/agentdev-bar"), { recursive: true })
    await writeFile(
      join(root, ".opencode/skills/agentdev-bar/SKILL.md"),
      "---\nname: agentdev-bar\n---\n# agentdev-bar\n",
      "utf8",
    )

    const output = join(root, ".agentdev", "graph")
    const result = await buildGraph({ root, output })
    expect(result.nodeCount).toBe(0)
  })
})
