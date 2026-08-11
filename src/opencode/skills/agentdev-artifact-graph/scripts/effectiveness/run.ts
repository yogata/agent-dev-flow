// effectiveness/run.ts — harness の CLI entry point。
//
// 使い方:
//   bun effectiveness/run.ts --root <repo-root> --graph <graph-dir>
//   bun effectiveness/run.ts --root . --graph .agentdev/graph
//
// 出力:
//   - stdout: diagnostic report（人間可読テキスト）
//   - --json を付けた場合は JSON 形式の HarnessReport のみを出力
//
// 本検証は診断目的であり、性能閾値による合否判定は行わない（REQ-{NNNN}-{NNN}, TS-010）。
// parser/graph regression は REQ-{NNNN} 傘下の tests/*.test.ts が独立に判断する。
// 本コマンドは終了コード 0 で終了する（diagnostic のため）。

import { resolve } from "node:path"
import { runEffectivenessHarness } from "./harness.ts"
import type { HarnessReport, EffectivenessResult } from "./types.ts"
import { CATEGORY_LABELS, QUERY_CATEGORIES } from "./types.ts"

interface ParsedArgs {
  readonly root: string
  readonly graph: string
  readonly json: boolean
}

function parseArgs(argv: readonly string[]): ParsedArgs {
  let root = "."
  let graph = ".agentdev/graph"
  let json = false
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === undefined) continue
    if (a === "--root") {
      const v = argv[i + 1]
      if (v !== undefined) root = v
      i += 1
    } else if (a === "--graph") {
      const v = argv[i + 1]
      if (v !== undefined) graph = v
      i += 1
    } else if (a === "--json") {
      json = true
    } else if (a === "--help" || a === "-h") {
      printHelp()
      process.exit(0)
    } else {
      console.error(`unknown argument: ${a}`)
      process.exit(2)
    }
  }
  return { root, graph, json }
}

function printHelp(): void {
  console.error(`effectiveness/run.ts — Artifact Graph workflow effectiveness harness (REQ-{NNNN}-{NNN})

Usage:
  bun effectiveness/run.ts --root <repo-root> --graph <graph-dir> [--json]

Options:
  --root <path>     repo root directory (default: .)
  --graph <path>    Graph output directory produced by build_graph.ts (default: .agentdev/graph)
  --json            emit JSON HarnessReport instead of human-readable report
  -h, --help        show this help

Note:
  本検証は診断目的であり、性能閾値による合否判定は行わない。`)
}

export async function main(args: readonly string[] = process.argv.slice(2)): Promise<void> {
  const parsed = parseArgs(args)
  const rootDir = resolve(parsed.root)
  const graphDir = resolve(parsed.graph)
  const report = await runEffectivenessHarness({ rootDir, graphDir })

  if (parsed.json) {
    console.log(JSON.stringify(report, null, 2))
    return
  }
  console.log(renderHumanReport(report))
}

function renderHumanReport(report: HarnessReport): string {
  const lines: string[] = []
  lines.push("# Artifact Graph Workflow Effectiveness Report")
  lines.push("")
  lines.push("**本検証は診断目的であり、性能閾値による合否判定は行わない（REQ-{NNNN}-{NNN}, TS-010）。**")
  lines.push("**Parser/Graph regression は REQ-{NNNN} 傘下の検証層が独立に判断する。**")
  lines.push("")
  lines.push(`- root: ${report.rootDir}`)
  lines.push(`- graph: ${report.graphDir}`)
  lines.push(`- input_digest: ${report.inputDigest}`)
  lines.push(`- executed_at: ${report.executedAt}`)
  lines.push(`- queries: ${report.results.length}`)
  lines.push("")

  // カバレッジ表: 6 category が全て覆盖されているか
  const categoriesCovered = new Set(report.results.map((r) => r.category))
  lines.push("## Category coverage (REQ-{NNNN}-{NNN})")
  lines.push("")
  lines.push("| category | covered |")
  lines.push("|---|---|")
  for (const cat of QUERY_CATEGORIES) {
    const mark = categoriesCovered.has(cat) ? "yes" : "NO"
    lines.push(`| ${cat} — ${CATEGORY_LABELS[cat]} | ${mark} |`)
  }
  lines.push("")

  for (const result of report.results) {
    lines.push(...renderQuery(result))
    lines.push("")
  }

  return lines.join("\n")
}

function renderQuery(result: EffectivenessResult): readonly string[] {
  const m = result.metrics
  const lines: string[] = []
  lines.push(`## ${result.queryId} — ${CATEGORY_LABELS[result.category]}`)
  lines.push("")
  lines.push(`> ${result.question}`)
  lines.push("")
  lines.push(`- ground truth 根拠: ${result.groundTruthRationale}`)
  lines.push(`- ground truth (${result.groundTruth.length}):`)
  for (const gt of result.groundTruth) lines.push(`  - \`${gt}\``)
  lines.push("")
  lines.push("### Graph 側 結果")
  lines.push(`- candidates (${result.graphResults.length}):`)
  for (const id of result.graphResults) lines.push(`  - \`${id}\``)
  lines.push("")
  lines.push("### 独立探索 側 結果")
  lines.push(`- candidates (${result.independentResults.length}):`)
  for (const id of result.independentResults) lines.push(`  - \`${id}\``)
  lines.push("")
  lines.push("### 6 指標（REQ-{NNNN}-{NNN}）")
  lines.push("")
  lines.push("| metric | Graph | independent |")
  lines.push("|---|---|---|")
  lines.push(`| recall | ${m.graphRecall.toFixed(3)} | ${m.independentRecall.toFixed(3)} |`)
  lines.push(`| false candidate count | ${m.graphFalseCandidateCount} | ${m.independentFalseCandidateCount} |`)
  lines.push(`| canonical source reach | ${m.graphCanonicalReach.toFixed(3)} | ${m.independentCanonicalReach.toFixed(3)} |`)
  lines.push(`| search effort (ops) | ${m.searchEffort.graph} | ${m.searchEffort.independent} |`)
  lines.push("")
  lines.push(`- Graph-only miss (独立探索が見つけたが Graph が見落とした, ${m.graphOnlyMiss.length}):`)
  for (const id of m.graphOnlyMiss) lines.push(`  - \`${id}\``)
  if (m.graphOnlyMiss.length === 0) lines.push("  - _(none)_")
  lines.push(`- Independent-only miss (Graph が見つけたが独立探索が見落とした, ${m.independentOnlyMiss.length}):`)
  for (const id of m.independentOnlyMiss) lines.push(`  - \`${id}\``)
  if (m.independentOnlyMiss.length === 0) lines.push("  - _(none)_")
  return lines
}

if (import.meta.main) {
  // catch -- CLI boundary converts failures to exit status.
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
