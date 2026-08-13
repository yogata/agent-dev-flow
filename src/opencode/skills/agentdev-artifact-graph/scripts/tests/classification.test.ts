import { afterEach, describe, expect, it } from "bun:test"
import { mkdir, writeFile } from "node:fs/promises"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { checkGraph } from "../lib/checker.ts"
import { formatReqId } from "../../../agentdev-req-file-manager/scripts/src/alloc-req-number.ts"
import { formatDecisionId } from "../../../agentdev-decision-file-manager/scripts/src/alloc-decision-number.ts"
import { buildGraph, loadGraph } from "../lib/graph.ts"

const DEC_902 = formatDecisionId(902)
const unresolvedOwnerId = formatReqId(999)

const roots: string[] = []

async function setup(): Promise<{ readonly root: string; readonly output: string }> {
  const root = await mkdtemp(join(tmpdir(), "ag-classify-"))
  roots.push(root)
  const req901 = formatReqId(901)
  const dec901 = formatDecisionId(901)
  const files: Record<string, string> = {
    [`docs/requirements/${req901}.md`]: `---
id: ${req901}
title: Classification test
status: accepted
---
# Classification test

Resolvable: [guide](../guides/guide.md)
Broken: [broken](../missing.md)
Directory: [specs](../specs/)
Barefile: [old](agentdev-doc-map.md)
`,
    [`docs/decisions/${dec901}.md`]: `---
id: ${dec901}
title: Decision test
status: accepted
superseded_by: ${DEC_902}
---
# Decision test
`,
    [`docs/specs/${"classify-owner"}.md`]: `---
title: Classify owner spec
canonical_owner: sample-skill
---
# Classify owner spec
`,
    [`docs/specs/${"id-owner"}.md`]: `---
title: ID owner spec
canonical_owner: ${unresolvedOwnerId}
---
# ID owner spec
`,
    [`docs/guides/guide.md`]: `# Guide

This file exists on disk but is not in default indexed_paths.
`,
  }
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = join(root, relativePath)
    await mkdir(join(fullPath, ".."), { recursive: true })
    await writeFile(fullPath, content, "utf8")
  }
  return { root, output: join(root, ".agentdev", "graph") }
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe(`unresolved reference classification (REQ-{NNNN})`, () => {
  it("classifies resolvable relative path as observation", async () => {
    const fixture = await setup()
    await buildGraph(fixture)
    const graph = await loadGraph(fixture.output)
    const guide = graph.diagnostics.find((d) => d.message.includes("guide.md"))
    expect(guide).toBeDefined()
    expect(guide!.severity).toBe("observation")
    expect(guide!.code).toBe("unresolved_reference:relative_path:resolvable")
    expect(guide!.message).toContain("relative_path")
    expect(guide!.message).toContain("REQ")
  })

  it("keeps broken relative path as warning", async () => {
    const fixture = await setup()
    await buildGraph(fixture)
    const graph = await loadGraph(fixture.output)
    const broken = graph.diagnostics.find((d) => d.message.includes("missing.md"))
    expect(broken).toBeDefined()
    expect(broken!.severity).toBe("warning")
    expect(broken!.code).toBe("unresolved_reference:relative_path:unresolved")
  })

  it("classifies directory path as observation", async () => {
    const fixture = await setup()
    await buildGraph(fixture)
    const graph = await loadGraph(fixture.output)
    const dir = graph.diagnostics.find((d) => d.message.endsWith("../specs/"))
    expect(dir).toBeDefined()
    expect(dir!.severity).toBe("observation")
    expect(dir!.code).toBe("unresolved_reference:directory_path")
  })

  it("classifies bare filename as observation", async () => {
    const fixture = await setup()
    await buildGraph(fixture)
    const graph = await loadGraph(fixture.output)
    const bare = graph.diagnostics.find((d) => d.message.includes("agentdev-doc-map.md"))
    expect(bare).toBeDefined()
    expect(bare!.severity).toBe("observation")
    expect(bare!.code).toBe("unresolved_reference:bare_filename")
  })

  it("classifies explicit ID in structured field as observation", async () => {
    const fixture = await setup()
    await buildGraph(fixture)
    const graph = await loadGraph(fixture.output)
    const explicit = graph.diagnostics.find((d) => d.message.includes(unresolvedOwnerId))
    expect(explicit).toBeDefined()
    expect(explicit!.severity).toBe("observation")
    expect(explicit!.code).toBe("unresolved_reference:explicit_id")
    expect(explicit!.element_id).toBe("field:canonical_owner")
  })

  it("classifies description word in structured field as observation", async () => {
    const fixture = await setup()
    await buildGraph(fixture)
    const graph = await loadGraph(fixture.output)
    const word = graph.diagnostics.find((d) => d.message.includes("sample-skill"))
    expect(word).toBeDefined()
    expect(word!.severity).toBe("observation")
    expect(word!.code).toBe("unresolved_reference:description_word")
  })

  it("classifies non-existent explicit ID (superseded_by) as observation", async () => {
    const fixture = await setup()
    await buildGraph(fixture)
    const graph = await loadGraph(fixture.output)
    const sup = graph.diagnostics.find((d) => d.message.includes(DEC_902))
    expect(sup).toBeDefined()
    expect(sup!.severity).toBe("observation")
    expect(sup!.code).toBe("unresolved_reference:explicit_id")
  })

  it("separates warnings from info in CheckReport", async () => {
    const fixture = await setup()
    await buildGraph(fixture)
    const graph = await loadGraph(fixture.output)
    const report = checkGraph(graph)
    expect(report.valid).toBe(true)
    expect(report.errors).toEqual([])
    expect(report.warnings.length).toBe(1)
    expect(report.warnings[0]).toContain("relative_path:unresolved")
    expect(report.info.length).toBeGreaterThan(0)
    for (const entry of report.info) {
      expect(entry).not.toContain("relative_path:unresolved")
    }
  })
})
