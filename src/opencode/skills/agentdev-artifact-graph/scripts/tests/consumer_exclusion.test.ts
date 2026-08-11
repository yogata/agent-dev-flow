import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { buildGraph, loadGraph } from "../lib/graph.ts"
import { DEFAULT_INDEXED_PATHS } from "../lib/config.ts"

const roots: string[] = []

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

async function jsonLines(path: string): Promise<readonly Record<string, unknown>[]> {
  const content = await Bun.file(path).text()
  return content.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line))
}

/**
 * Distribution artifact path patterns that MUST NOT appear in a consumer Graph
 * (REQ\u002D012-008, TS-006 / AG-005). Any node/provenance path matching one of
 * these regexes indicates distribution artifact leakage into the Graph.
 */
const DISTRIBUTION_PATTERNS: readonly RegExp[] = [
  /^\.opencode\/commands\/agentdev\//,
  /^\.opencode\/skills\/agentdev-[^/]+\//,
  /^\.opencode\/skills\/japanese-tech-writing\//,
  /^\.agentdev-plugin\//,
]

function matchesDistributionPattern(path: string): boolean {
  return DISTRIBUTION_PATTERNS.some((pattern) => pattern.test(path))
}

/**
 * Creates a realistic consumer fixture mirroring the layout produced by
 * `install-consumer-opencode.ps1 -Mode apply`: consumer-owned docs\\u002F plus
 * AgentDevFlow distribution artifacts (commands, skills, plugin clone).
 * The distribution directories contain plausible files with frontmatter and
 * cross-references that would be picked up if indexed_paths leaked.
 */
async function createRealisticConsumerFixture(root: string): Promise<void> {
  const consumerDocs: Record<string, string> = {
    "docs\\u002Frequirements/REQ\u002D001.md": `---
id: REQ\u002D001
title: Consumer feature
status: accepted
---
# Consumer feature

See [decision](../decisions/DEC\u002D001.md).
`,
    "docs\\u002Fdecisions/DEC\u002D001.md": `---
id: DEC\u002D001
title: Consumer architecture
status: accepted
---
# Consumer architecture
`,
    "docs\\u002Fspecs/feature.md": `---
title: Feature spec
canonical_owner: consumer-team
---
# Feature spec
`,
  }
  for (const [relativePath, content] of Object.entries(consumerDocs)) {
    await mkdir(join(root, relativePath, ".."), { recursive: true })
    await writeFile(join(root, relativePath), content, "utf8")
  }

  const commandFiles: Record<string, string> = {
    ".opencode/commands/agentdev/req-define.md": `---
description: Define requirements
---
# /agentdev/req-define
Refs: REQ\u002D001
`,
    ".opencode/commands/agentdev/case-open.md": `---
description: Open a case
---
# /agentdev/case-open
`,
  }
  for (const [relativePath, content] of Object.entries(commandFiles)) {
    await mkdir(join(root, relativePath, ".."), { recursive: true })
    await writeFile(join(root, relativePath), content, "utf8")
  }

  const skillFiles: Record<string, string> = {
    ".opencode/skills/agentdev-artifact-graph/SKILL.md": `---
name: agentdev-artifact-graph
description: Build Artifact Graph
---
# agentdev-artifact-graph
Refs: REQ\u002D012, DEC\u002D007
`,
    ".opencode/skills/agentdev-doc-writing/SKILL.md": `---
name: agentdev-doc-writing
description: Review docs
---
# agentdev-doc-writing
`,
    ".opencode/skills/japanese-tech-writing/SKILL.md": `---
name: japanese-tech-writing
description: Japanese writing norms
---
# japanese-tech-writing
`,
  }
  for (const [relativePath, content] of Object.entries(skillFiles)) {
    await mkdir(join(root, relativePath, ".."), { recursive: true })
    await writeFile(join(root, relativePath), content, "utf8")
  }

  const pluginFiles: Record<string, string> = {
    ".agentdev-plugin/src/opencode/commands/agentdev/req-save.md": `---
description: Save requirements
---
# /agentdev/req-save
`,
    ".agentdev-plugin/src/opencode/skills/agentdev-gh-cli/SKILL.md": `---
name: agentdev-gh-cli
description: GitHub CLI I/O
---
# agentdev-gh-cli
`,
    ".agentdev-plugin/scripts/install-consumer-opencode.ps1": `# install script`,
  }
  for (const [relativePath, content] of Object.entries(pluginFiles)) {
    await mkdir(join(root, relativePath, ".."), { recursive: true })
    await writeFile(join(root, relativePath), content, "utf8")
  }
}

describe("REQ\u002D012-008: consumer environment excludes AgentDevFlow distribution artifacts", () => {
  it("default indexed_paths exclude distribution artifact directories", () => {
    expect(DEFAULT_INDEXED_PATHS).not.toContain(".opencode/commands/agentdev")
    expect(DEFAULT_INDEXED_PATHS).not.toContain(".opencode/skills")
    expect(DEFAULT_INDEXED_PATHS).not.toContain(".agentdev-plugin")
  })

  it("AgentDevFlow distribution artifacts produce zero nodes in default config", async () => {
    const root = await mkdtemp(join(tmpdir(), "ag-consumer-"))
    roots.push(root)

    // Simulate consumer environment: docs\\u002F exists + distribution artifacts exist
    await mkdir(join(root, "docs\\u002Frequirements"), { recursive: true })
    await writeFile(
      join(root, "docs\\u002Frequirements/REQ\u002D001.md"),
      "---\nid: REQ\u002D001\ntitle: Consumer req\n---\n# Consumer req\n",
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
    // Only the REQ\u002D001 node should exist
    expect(nodes.length).toBe(1)
    expect(nodes[0]?.["id"]).toBe("requirement:REQ\u002D001")

    // No distribution artifact nodes
    expect(nodes.some((n) => String(n["id"] ?? "").includes("command:"))).toBe(false)
    expect(nodes.some((n) => String(n["id"] ?? "").includes("skill:"))).toBe(false)
    expect(nodes.some((n) => String(n["id"] ?? "").includes("source_file:"))).toBe(false)
  })

  it("consumer with only distribution artifacts and no docs produces empty graph", async () => {
    const root = await mkdtemp(join(tmpdir(), "ag-consumer-empty-"))
    roots.push(root)

    // Only distribution artifacts, no docs\\u002F
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

describe("TS-006 (AG-005): consumer Graph excludes all distribution artifact paths", () => {
  it("realistic consumer fixture produces 0 nodes/edges/provenance from distribution patterns", async () => {
    const root = await mkdtemp(join(tmpdir(), "ag-ts006-"))
    roots.push(root)
    await createRealisticConsumerFixture(root)

    const output = join(root, ".agentdev", "graph")
    const result = await buildGraph({ root, output })
    const graph = await loadGraph(output)

    expect(result.nodeCount).toBe(3)
    expect(result.edgeCount).toBeGreaterThanOrEqual(0)

    const distributionNodeIds = graph.nodes.filter((node) => {
      const specPath = node.id.startsWith("specification:")
        ? node.id.slice("specification:".length)
        : undefined
      return specPath !== undefined && matchesDistributionPattern(specPath)
    })
    expect(distributionNodeIds).toEqual([])

    const distributionProvenance = graph.provenance.filter((entry) =>
      matchesDistributionPattern(entry.path)
    )
    expect(distributionProvenance).toEqual([])

    const allPaths = graph.provenance.map((entry) => entry.path)
    for (const path of allPaths) {
      expect(matchesDistributionPattern(path)).toBe(false)
    }

    const distributionEdgeProvenance = graph.edges.filter((edge) => {
      const prov = graph.provenance.find((entry) => entry.id === edge.provenance_id)
      return prov !== undefined && matchesDistributionPattern(prov.path)
    })
    expect(distributionEdgeProvenance).toEqual([])
  })

  it("manifest indexed_paths contains only the 3 default canonical paths", async () => {
    const root = await mkdtemp(join(tmpdir(), "ag-ts006-manifest-"))
    roots.push(root)
    await createRealisticConsumerFixture(root)

    const output = join(root, ".agentdev", "graph")
    await buildGraph({ root, output })
    const graph = await loadGraph(output)

    expect(graph.manifest.indexed_paths).toEqual([
      "docs\\u002Frequirements",
      "docs\\u002Fdecisions",
      "docs\\u002Fspecs",
    ])
    for (const indexed of graph.manifest.indexed_paths) {
      expect(matchesDistributionPattern(indexed + "/")).toBe(false)
    }
  })

  it("consumer REQ\u002D001 is reachable and distribution artifacts are not", async () => {
    const root = await mkdtemp(join(tmpdir(), "ag-ts006-reach-"))
    roots.push(root)
    await createRealisticConsumerFixture(root)

    const output = join(root, ".agentdev", "graph")
    await buildGraph({ root, output })

    const nodes = await jsonLines(join(output, "nodes.jsonl"))
    const nodeIds = nodes.map((node) => String(node["id"] ?? ""))
    expect(nodeIds).toContain("requirement:REQ\u002D001")
    expect(nodeIds).toContain("decision:DEC\u002D001")
    expect(nodeIds).toContain("specification:docs\\u002Fspecs/feature.md")
    expect(nodeIds.some((id) => id.includes("command:"))).toBe(false)
    expect(nodeIds.some((id) => id.includes("skill:"))).toBe(false)
  })
})
