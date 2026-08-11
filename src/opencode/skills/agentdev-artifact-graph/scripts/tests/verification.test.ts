import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { buildGraph, loadGraph, resolveBuildConfig } from "../lib/graph.ts"
import { verifyGraph } from "../lib/verification.ts"
import { createFixture } from "./fixture.ts"

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

describe("REQ\u002D012-011: verification feedback (detect/classify/correct)", () => {
  it("detects canonical defect: broken markdown link", async () => {
    const fixture = await setup()
    // Add a file with a broken link
    await writeFile(
      join(fixture.root, "docs\\u002Frequirements/REQ\u002D002.md"),
      "---\nid: REQ\u002D002\ntitle: Broken\n---\n# Broken\n\nSee [nonexistent](../decisions/DEC\u002D099.md).\n",
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
    await writeFile(
      join(fixture.root, "docs\\u002Frequirements/REQ\u002D002.md"),
      "---\nid: REQ\u002D002\ntitle: Broken\n---\n# Broken\n\nSee [nonexistent](../decisions/DEC\u002D099.md).\n",
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
    // Add broken link
    const reqPath = join(fixture.root, "docs\\u002Frequirements/REQ\u002D002.md")
    await writeFile(
      reqPath,
      "---\nid: REQ\u002D002\ntitle: Broken\n---\n# Broken\n\nSee [nonexistent](../decisions/DEC\u002D099.md).\n",
      "utf8",
    )
    await buildGraph(fixture)
    const config = await resolveBuildConfig(fixture.root)
    let graph = await loadGraph(fixture.output)
    let report = await verifyGraph(fixture.root, graph, config)
    expect(report.summary.canonical_defects).toBeGreaterThan(0)

    // Fix: create the missing file
    await writeFile(
      join(fixture.root, "docs\\u002Fdecisions/DEC\u002D099.md"),
      "---\nid: DEC\u002D099\ntitle: Now exists\n---\n# Now exists\n",
      "utf8",
    )
    await buildGraph(fixture)
    graph = await loadGraph(fixture.output)
    report = await verifyGraph(fixture.root, graph, config)
    expect(report.summary.canonical_defects).toBe(0)
  })
})
