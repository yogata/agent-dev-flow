import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { buildGraph, loadGraph, resolveBuildConfig } from "../lib/graph.ts"
import { verifyGraph } from "../lib/verification.ts"
import { createFixture } from "./fixture.ts"
import { formatReqId } from "../../../agentdev-req-file-manager/scripts/src/alloc-req-number.ts"
import { formatDecisionId } from "../../../agentdev-decision-file-manager/scripts/src/alloc-decision-number.ts"
const REQ_002 = formatReqId(2)
const DEC_099 = formatDecisionId(99)

const roots: string[] = []

async function setup(): Promise<{ readonly root: string; readonly output: string }> {
  const root = await mkdtemp(join(tmpdir(), "ag-verify-"))
  roots.push(root)
  await createFixture(root)
  return { root, output: join(root, ".agentdev", "graph") }
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe(`REQ-{NNNN}-011: verification feedback (detect/classify/correct)`, () => {
  it("detects canonical defect: broken markdown link", async () => {
    const fixture = await setup()
    const req002Path = `docs/requirements/${REQ_002}.md`
    await writeFile(
      join(fixture.root, req002Path),
      `---\nid: ${REQ_002}\ntitle: Broken\n---\n# Broken\n\nSee [nonexistent](../decisions/${DEC_099}.md).\n`,
      "utf8",
    )
    await buildGraph(fixture)
    const graph = await loadGraph(fixture.output)
    const config = await resolveBuildConfig(fixture.root)
    const report = await verifyGraph(fixture.root, graph, config)

    expect(report.summary.differences).toBeGreaterThan(0)
    expect(report.summary.canonical_defects).toBeGreaterThan(0)
    expect(report.differences.some((d) => d.classification === "canonical_defect")).toBe(true)
  })

  it("classifies broken link as canonical_defect", async () => {
    const fixture = await setup()
    const req002Path = `docs/requirements/${REQ_002}.md`
    await writeFile(
      join(fixture.root, req002Path),
      `---\nid: ${REQ_002}\ntitle: Broken\n---\n# Broken\n\nSee [nonexistent](../decisions/${DEC_099}.md).\n`,
      "utf8",
    )
    await buildGraph(fixture)
    const graph = await loadGraph(fixture.output)
    const config = await resolveBuildConfig(fixture.root)
    const report = await verifyGraph(fixture.root, graph, config)

    const brokenLinkDiffs = report.differences.filter((d) => d.kind === "unresolved_link")
    expect(brokenLinkDiffs.length).toBeGreaterThan(0)
    for (const d of brokenLinkDiffs) {
      expect(d.classification).toBe("canonical_defect")
    }
  })

  it("clean fixture produces no canonical defects", async () => {
    const fixture = await setup()
    await buildGraph(fixture)
    const graph = await loadGraph(fixture.output)
    const config = await resolveBuildConfig(fixture.root)
    const report = await verifyGraph(fixture.root, graph, config)

    expect(report.summary.canonical_defects).toBe(0)
    expect(report.summary.checked_files).toBeGreaterThan(0)
  })

  it("correct + regression-verify: fixing canonical defect removes difference", async () => {
    const fixture = await setup()
    const req002Path = `docs/requirements/${REQ_002}.md`
    await writeFile(
      join(fixture.root, req002Path),
      `---\nid: ${REQ_002}\ntitle: Broken\n---\n# Broken\n\nSee [nonexistent](../decisions/${DEC_099}.md).\n`,
      "utf8",
    )
    await buildGraph(fixture)
    const config = await resolveBuildConfig(fixture.root)
    let graph = await loadGraph(fixture.output)
    let report = await verifyGraph(fixture.root, graph, config)
    expect(report.summary.canonical_defects).toBeGreaterThan(0)

    const dec099Path = `docs/decisions/${DEC_099}.md`
    await writeFile(
      join(fixture.root, dec099Path),
      `---\nid: ${DEC_099}\ntitle: Now exists\n---\n# Now exists\n`,
      "utf8",
    )
    await buildGraph(fixture)
    graph = await loadGraph(fixture.output)
    report = await verifyGraph(fixture.root, graph, config)
    expect(report.summary.canonical_defects).toBe(0)
  })
})
