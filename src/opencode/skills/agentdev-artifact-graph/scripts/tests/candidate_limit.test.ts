import { afterEach, describe, expect, it } from "bun:test"
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { buildGraph, loadGraph } from "../lib/graph.ts"
import type { GraphData, GraphEdge, GraphNode } from "../lib/model.ts"
import { queryGraph } from "../lib/query.ts"
import { createFixture, REQ_001_NODE, FEATURE_SPEC_NODE, REQ_001 } from "./fixture.ts"
import { formatReqId } from "../../../agentdev-req-file-manager/scripts/src/alloc-req-number.ts"
import {
  applyCandidateLimit,
  RULE_EXCLUDE_INDEX_TAIL,
} from "../effectiveness/candidate_limit/limit.ts"
import { semanticCandidates } from "../effectiveness/candidate_limit/semantics.ts"
import {
  checkBoundaryInvariants,
  checkCandidateForm,
  runCandidateLimitHarness,
} from "../effectiveness/candidate_limit/harness.ts"
import type { LimitCandidate } from "../effectiveness/candidate_limit/types.ts"

const roots: string[] = []

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

function synthNode(id: string, type: string): GraphNode {
  return { id, type, label: id, provenance_id: `prov:${id}` }
}

function synthEdge(id: string, type: string, source: string, target: string): GraphEdge {
  return {
    id,
    type,
    category: "derived",
    source,
    target,
    provenance_id: `prov:${id}`,
    extraction_rule: "markdown_link",
  }
}

function synthGraph(nodes: readonly GraphNode[], edges: readonly GraphEdge[]): GraphData {
  return {
    manifest: {
      schema_version: "1.0.0",
      generator_version: "0.1.0",
      input_digest: "a".repeat(64),
      indexed_paths: [],
      excluded_paths: [],
      node_types: [],
      relation_types: [],
    },
    nodes,
    edges,
    provenance: [],
    diagnostics: [],
  }
}

const R1 = "requirement:r1"
const SPEC = "specification:spec"
const DEC_OLD = "decision:old"
const DEC_NEW = "decision:new"
const EXT = "extension:ext"
const SKILL = "skill:delegate"
const HUB = "hub:idx"

const SEMANTIC_GRAPH = synthGraph(
  [
    synthNode(R1, "requirement"),
    synthNode(SPEC, "specification"),
    synthNode(DEC_OLD, "decision"),
    synthNode(DEC_NEW, "decision"),
    synthNode(EXT, "extension"),
    synthNode(SKILL, "skill"),
    synthNode(HUB, "source_file"),
  ],
  [
    synthEdge("e1", "references", R1, SPEC),
    synthEdge("e2", "supersedes", DEC_NEW, DEC_OLD),
    synthEdge("e3", "delegates_to", EXT, SPEC),
    synthEdge("e4", "extends", EXT, SKILL),
    synthEdge("e5", "references", R1, HUB),
    synthEdge("e6", "references", HUB, DEC_NEW),
    synthEdge("e7", "mystery_link", R1, DEC_OLD),
  ],
)

describe("TS-{NNN}: profile semantics traverse only defined relations", () => {
  it("related returns directly linked nodes but skips undefined relation types", () => {
    const result = semanticCandidates(SEMANTIC_GRAPH, "related", R1, 1)
    expect(result.map((c) => c.candidate).sort()).toEqual([HUB, SPEC].sort())
  })

  it("related does not propagate exploration through index/aggregation role nodes", () => {
    const result = semanticCandidates(SEMANTIC_GRAPH, "related", R1, 3)
    const ids = result.map((c) => c.candidate)
    expect(ids).toContain(EXT)
    expect(ids).toContain(SKILL)
    expect(ids).not.toContain(DEC_NEW)
  })

  it("impact follows supersedes in both directions and yields normal empty result otherwise", () => {
    const fromOld = semanticCandidates(SEMANTIC_GRAPH, "impact", DEC_OLD, 1)
    expect(fromOld.map((c) => c.candidate)).toEqual([DEC_NEW])
    const fromReq = semanticCandidates(SEMANTIC_GRAPH, "impact", R1, 2)
    expect(fromReq).toEqual([])
  })

  it("dependency follows source_depends_on_target only and rejects general references", () => {
    const fromExt = semanticCandidates(SEMANTIC_GRAPH, "dependency", EXT, 1)
    expect(fromExt.map((c) => c.candidate).sort()).toEqual([SKILL, SPEC].sort())
    const fromSpec = semanticCandidates(SEMANTIC_GRAPH, "dependency", SPEC, 1)
    expect(fromSpec).toEqual([])
  })

  it("implementation has no realization-series relations yet and returns normal empty result", () => {
    expect(semanticCandidates(SEMANTIC_GRAPH, "implementation", R1, 2)).toEqual([])
  })

  it("candidates carry the five result elements with a path from start to candidate", async () => {
    const result = semanticCandidates(SEMANTIC_GRAPH, "related", R1, 2)
    expect(result.length).toBeGreaterThan(0)
    for (const candidate of result) {
      expect(candidate.reason.length).toBeGreaterThan(0)
      expect(candidate.relation_type.length).toBeGreaterThan(0)
      expect(candidate.path[0]).toBe(R1)
      expect(candidate.path[candidate.path.length - 1]).toBe(candidate.candidate)
    }
    const failures = checkCandidateForm(
      { profile: "related", start: R1, candidates: result, applied_rules: [] },
      R1,
    )
    expect(failures).toEqual([])
  })
})

describe("TS-{NNN}: README-mediated amplification is reproduced as a regression signal", () => {
  it("naive neighbor walk amplifies through the index hub while semantic walk does not", async () => {
    const naive = await queryGraph(SEMANTIC_GRAPH, { kind: "neighbors", node: R1, depth: 2 })
    const naiveIds = naive.nodes.filter((id) => id !== R1)
    const semanticIds = new Set(semanticCandidates(SEMANTIC_GRAPH, "related", R1, 2).map((c) => c.candidate))
    const amplified = naiveIds.filter((id) => !semanticIds.has(id))
    expect(amplified).toContain(DEC_NEW)
    expect(amplified.length).toBeGreaterThanOrEqual(1)
  })
})

function mkCandidate(id: string, pathLength: number, relationType = "delegates_to"): LimitCandidate {
  const via = Array.from({ length: pathLength - 2 }, (_, k) => `via:${id}:${k}`)
  return {
    candidate: id,
    reason: `related via ${relationType} (outgoing) at depth ${pathLength - 1}`,
    relation_type: relationType,
    direction: "outgoing",
    path: ["start:node", ...via, id],
  }
}

const PLAIN = Array.from({ length: 8 }, (_, i) => mkCandidate(`node:${i}`, 2))

describe("TS-{NNN}: candidate limit boundary invariants", () => {
  it("limit below the candidate count returns the five truncation items without silent truncation", () => {
    const result = applyCandidateLimit("related", "start:node", PLAIN, { candidate_limit: 7 })
    expect(result.truncation).toBeDefined()
    const t = result.truncation
    expect(t?.too_many).toBe(true)
    expect(t?.total_candidates).toBe(8)
    expect(t?.returned_candidates).toBe(7)
    expect(result.candidates.length).toBe(7)
    expect(t?.applied_rules.length).toBeGreaterThan(0)
    expect(t?.independent_search_available).toBe(true)
    expect(result.applied_rules.length).toBeGreaterThan(0)
  })

  it("limit equal to and above the candidate count returns all candidates without truncation", () => {
    const at = applyCandidateLimit("related", "start:node", PLAIN, { candidate_limit: 8 })
    expect(at.truncation).toBeUndefined()
    expect(at.candidates.length).toBe(8)
    const above = applyCandidateLimit("related", "start:node", PLAIN, { candidate_limit: 9 })
    expect(above.truncation).toBeUndefined()
    expect(above.candidates.length).toBe(8)
  })

  it("exclusion rule resolving the overflow is accepted without truncation and reported in applied_rules", () => {
    const mixed = [
      ...Array.from({ length: 5 }, (_, i) => mkCandidate(`node:${i}`, 2)),
      ...Array.from({ length: 3 }, (_, i) => mkCandidate(`hub:${i}`, 3, "references")),
    ]
    const indexRoles = new Set(["hub:0", "hub:1", "hub:2"])
    const result = applyCandidateLimit("related", "start:node", mixed, { candidate_limit: 7 }, indexRoles)
    expect(result.truncation).toBeUndefined()
    expect(result.candidates.length).toBe(5)
    expect(result.applied_rules).toContain(RULE_EXCLUDE_INDEX_TAIL)
    const probe = {
      below: applyCandidateLimit("related", "start:node", mixed, { candidate_limit: 7 }, indexRoles),
      at: applyCandidateLimit("related", "start:node", mixed, { candidate_limit: 8 }, indexRoles),
      above: applyCandidateLimit("related", "start:node", mixed, { candidate_limit: 9 }, indexRoles),
    }
    expect(checkBoundaryInvariants(probe, mixed, indexRoles)).toEqual([])
  })

  it("boundary invariants detect a silent truncation defect", () => {
    const probe = {
      below: { profile: "related" as const, start: "start:node", candidates: PLAIN.slice(0, 5), applied_rules: ["priority:candidate-id"] },
      at: applyCandidateLimit("related", "start:node", PLAIN, { candidate_limit: 8 }),
      above: applyCandidateLimit("related", "start:node", PLAIN, { candidate_limit: 9 }),
    }
    const failures = checkBoundaryInvariants(probe, PLAIN, new Set())
    expect(failures.length).toBeGreaterThan(0)
  })

  it("empty candidate set is a normal empty result without truncation", () => {
    const result = applyCandidateLimit("impact", "start:node", [], { candidate_limit: 3 })
    expect(result.candidates).toEqual([])
    expect(result.truncation).toBeUndefined()
    expect(result.applied_rules.length).toBeGreaterThan(0)
  })

  it("evidence detail fields are rejected from high-level query results", () => {
    const polluted = {
      ...mkCandidate("node:x", 2),
      provenance: "prov:leak",
    } as unknown as LimitCandidate
    const failures = checkCandidateForm(
      { profile: "related", start: "start:node", candidates: [polluted], applied_rules: [] },
      "start:node",
    )
    expect(failures.some((f) => f.includes("根拠詳細フィールド"))).toBe(true)
  })
})

describe("TS-{NNN}: harness end-to-end on a fixture repository", () => {
  it("passes the regression with required candidates and hub-mediated amplification", async () => {
    const root = await mkdtemp(join(tmpdir(), "ag-cl-"))
    roots.push(root)
    await createFixture(root)
    const REQ_009 = formatReqId(9)
    await writeFile(
      join(root, "docs/requirements/README.md"),
      `# index\n\n- [r1](${REQ_001}.md)\n- [r9](${REQ_009}.md)\n`,
      "utf8",
    )
    await writeFile(
      join(root, `docs/requirements/${REQ_009}.md`),
      `---\nid: ${REQ_009}\ntitle: hub only\n---\n# hub only\n`,
      "utf8",
    )
    // source_file 型は augmentation が追加する open extension point。
    // containment logic が全入力ファイルへ source_file node と contains/defined_in を生成する。
    await mkdir(join(root, ".agentdev"), { recursive: true })
    await writeFile(
      join(root, ".agentdev/artifact-graph.yaml"),
      [
        "node_types:",
        "  - name: source_file",
        "    path_pattern: 'a^'",
        "    id_template: 'source_file:{path}'",
        "    label_source:",
        "      - kind: path",
        "    extraction_rule: filesystem",
        "",
      ].join("\n"),
      "utf8",
    )
    const output = join(root, ".agentdev", "graph")
    await buildGraph({ root, output })
    const graph = await loadGraph(output)

    const hubNode = "source_file:docs/requirements/README.md"
    const reqFileNode = `source_file:docs/requirements/${REQ_001}.md`
    expect(graph.nodes.some((n) => n.id === hubNode)).toBe(true)

    const report = await runCandidateLimitHarness({
      rootDir: root,
      graphDir: output,
      cases: [
        {
          id: "e2e-related-hub-amplification",
          profile: "related",
          start: REQ_001_NODE,
          depth: 2,
          caseClass: "amplification",
          selectionRationale: "unit fixture: index README hub mediates known amplification",
          requiredCandidates: [FEATURE_SPEC_NODE, hubNode, reqFileNode],
          minAmplifiedCount: 1,
          independentSearchPattern: `\\b${REQ_001}\\b`,
        },
      ],
    })
    expect(report.passed).toBe(true)
    expect(report.failures).toEqual([])
    const caseReport = report.cases[0]
    expect(caseReport?.requiredMissing).toEqual([])
    expect(caseReport?.amplifiedCount).toBeGreaterThanOrEqual(1)
    expect(caseReport !== undefined && caseReport.semanticCount < caseReport.naiveCount).toBe(true)
    expect(report.recommendedStandardLimit).toBeGreaterThanOrEqual(1)
  })
})
