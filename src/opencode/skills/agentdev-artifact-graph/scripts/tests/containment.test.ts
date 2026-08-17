import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { buildGraph, loadGraph } from "../lib/graph.ts"
import { checkGraph } from "../lib/checker.ts"
import { AUGMENTATION_DEFAULT_PATH } from "../lib/augmentation.ts"
import { createFixture } from "./fixture.ts"

const roots: string[] = []

async function setup(): Promise<{ readonly root: string; readonly output: string }> {
  const root = await mkdtemp(join(tmpdir(), "ag-contain-"))
  roots.push(root)
  await createFixture(root)
  return { root, output: join(root, ".agentdev", "graph") }
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

async function jsonLines(path: string): Promise<readonly Record<string, unknown>[]> {
  const content = await readFile(path, "utf8")
  return content.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line))
}

const SOURCE_FILE_AUG = `node_types:
  - name: source_file
    path_pattern: 'a^'
    id_template: 'source_file:{path}'
    label_source:
      - kind: path
    extraction_rule: filesystem
`

const EXTENSION_AUG = `node_types:
  - name: source_file
    path_pattern: 'a^'
    id_template: 'source_file:{path}'
    label_source:
      - kind: path
    extraction_rule: filesystem
  - name: command
    path_pattern: '^src/opencode/commands/agentdev/([^/]+)\\.md$'
    id_template: 'command:{match1}'
    label_source:
      - kind: path_group
        group: 1
    extraction_rule: frontmatter
  - name: skill
    path_pattern: '^src/opencode/skills/([^/]+)/SKILL\\.md$'
    id_template: 'skill:{match1}'
    label_source:
      - kind: frontmatter_field
        field: name
      - kind: path_group
        group: 1
    extraction_rule: frontmatter
  - name: extension
    path_pattern: '^\\.agentdev/extensions/[^/]+/[^/]+\\.ya?ml$'
    id_template: 'extension:{path}'
    label_source:
      - kind: path
    extraction_rule: extension_field
indexed_paths:
  - src/opencode
  - .agentdev/extensions
`

describe(`REQ-{NNNN}-009: source_file containment via augmentation`, () => {
  it("without source_file vocab: no source_file nodes, no containment edges", async () => {
    const fixture = await setup()
    await buildGraph(fixture)

    const nodes = await jsonLines(join(fixture.output, "nodes.jsonl"))
    expect(nodes.some((n) => n["type"] === "source_file")).toBe(false)

    const edges = await jsonLines(join(fixture.output, "edges.jsonl"))
    expect(edges.some((e) => e["type"] === "defined_in")).toBe(false)
    expect(edges.some((e) => e["type"] === "contains")).toBe(false)
  })

  it("with source_file vocab: source_file nodes and containment edges generated", async () => {
    const fixture = await setup()
    await mkdir(join(fixture.root, ".agentdev"), { recursive: true })
    await writeFile(join(fixture.root, AUGMENTATION_DEFAULT_PATH), SOURCE_FILE_AUG, "utf8")

    await buildGraph(fixture)

    const nodes = await jsonLines(join(fixture.output, "nodes.jsonl"))
    const sourceFileNodes = nodes.filter((n) => n["type"] === "source_file")
    expect(sourceFileNodes.length).toBeGreaterThan(0)

    const edges = await jsonLines(join(fixture.output, "edges.jsonl"))
    const definedIn = edges.filter((e) => e["type"] === "defined_in")
    const contains = edges.filter((e) => e["type"] === "contains")
    expect(definedIn.length).toBeGreaterThan(0)
    expect(contains.length).toBe(definedIn.length)

    const graph = await loadGraph(fixture.output)
    const report = checkGraph(graph)
    expect(report.valid).toBe(true)
  })
})

describe(`REQ-{NNNN}-009: extension extends via augmentation`, () => {
  it("extension files generate extends edges to their target command/skill", async () => {
    const fixture = await setup()

    await mkdir(join(fixture.root, "src/opencode/commands/agentdev"), { recursive: true })
    await writeFile(
      join(fixture.root, "src/opencode/commands/agentdev", "test-cmd.md"),
      "---\ndescription: test command\n---\n# test-cmd\n",
      "utf8",
    )
    await mkdir(join(fixture.root, ".agentdev/extensions/commands"), { recursive: true })
    await writeFile(
      join(fixture.root, ".agentdev/extensions/commands", "test-cmd.yaml"),
      "version: 1\nkind: command-extension\nid: /agentdev/test-cmd\n\nrules: []\n",
      "utf8",
    )

    await mkdir(join(fixture.root, ".agentdev"), { recursive: true })
    await writeFile(join(fixture.root, AUGMENTATION_DEFAULT_PATH), EXTENSION_AUG, "utf8")

    await buildGraph(fixture)

    const edges = await jsonLines(join(fixture.output, "edges.jsonl"))
    const extendsEdges = edges.filter((e) => e["type"] === "extends")
    expect(extendsEdges.length).toBe(1)
    expect(extendsEdges[0]?.["target"]).toBe("command:test-cmd")
    expect(String(extendsEdges[0]?.["source"]).startsWith("extension:")).toBe(true)

    const graph = await loadGraph(fixture.output)
    const report = checkGraph(graph)
    expect(report.valid).toBe(true)
  })
})
