// candidate_limit/run.ts — 候補数上限回帰の CLI entry point（REQ-{NNNN}-006）。
//
// 使い方:
//   bun effectiveness/candidate_limit/run.ts --root <repo-root> --graph <graph-dir>
//   bun effectiveness/candidate_limit/run.ts --root . --graph .agentdev/graph --limit 20
//
// 出力:
//   - stdout: 回帰レポート（人間可読テキスト）。--json で JSON のみ出力
//   - 終了コード: 全判定 pass で 0、failures があれば 1（回帰試験として扱う）
//
// 代表質問回帰検証（REQ-{NNNN}-003、effectiveness/run.ts）と同じ実行前提
// （build_graph で生成済みの Graph directory）を持ち、同じ契機
// （解析スクリプト・抽出ルールの変更時、および定期回帰検証）で実行する。

import { resolve } from "node:path"
import { runCandidateLimitHarness } from "./harness.ts"
import type { RegressionReport } from "./harness.ts"
import { DEFAULT_CANDIDATE_LIMIT } from "./limit.ts"
import type { CaseReport } from "./harness.ts"

interface ParsedArgs {
  readonly root: string
  readonly graph: string
  readonly json: boolean
  readonly limit: number
}

function parseArgs(argv: readonly string[]): ParsedArgs {
  let root = "."
  let graph = ".agentdev/graph"
  let json = false
  let limit = DEFAULT_CANDIDATE_LIMIT
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
    } else if (a === "--limit") {
      const v = argv[i + 1]
      if (v !== undefined && Number.isInteger(Number(v)) && Number(v) > 0) limit = Number(v)
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
  return { root, graph, json, limit }
}

function printHelp(): void {
  console.error(`effectiveness/candidate_limit/run.ts — 高位問い合わせ候補数上限回帰 (REQ-{NNNN}-006)

Usage:
  bun effectiveness/candidate_limit/run.ts --root <repo-root> --graph <graph-dir> [--limit N] [--json]

Options:
  --root <path>     repo root directory (default: .)
  --graph <path>    Graph output directory produced by build_graph.ts (default: .agentdev/graph)
  --limit <N>       候補数上限（問い合わせ設定の実行時上書き。既定: ${DEFAULT_CANDIDATE_LIMIT}）
  --json            emit JSON RegressionReport instead of human-readable report
  -h, --help        show this help

Note:
  本コマンドは回帰試験である。必須候補欠落、増幅未再現、誤通過、境界違反が
  あれば終了コード 1 を返す。`)
}

export async function main(args: readonly string[] = process.argv.slice(2)): Promise<void> {
  const parsed = parseArgs(args)
  const report = await runCandidateLimitHarness({
    rootDir: resolve(parsed.root),
    graphDir: resolve(parsed.graph),
    settings: { candidate_limit: parsed.limit },
  })
  if (parsed.json) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    console.log(renderHumanReport(report))
  }
  if (!report.passed) process.exitCode = 1
}

function renderHumanReport(report: RegressionReport): string {
  const lines: string[] = []
  lines.push("# 高位問い合わせ候補数上限回帰レポート (REQ-{NNNN}-006)")
  lines.push("")
  lines.push("代表質問回帰検証（REQ-{NNNN}-003）の体系に接続した回帰試験である。")
  lines.push("")
  lines.push(`- root: ${report.rootDir}`)
  lines.push(`- graph: ${report.graphDir}`)
  lines.push(`- input_digest: ${report.inputDigest}`)
  lines.push(`- executed_at: ${report.executedAt}`)
  lines.push(`- candidate_limit (settings): ${report.settings.candidate_limit}`)
  lines.push(`- recommended_standard_limit: ${report.recommendedStandardLimit}`)
  lines.push(`- default_limit_sufficient: ${report.defaultLimitSufficient}`)
  lines.push(`- passed: ${report.passed}`)
  lines.push("")
  lines.push("## 代表ケース別結果")
  lines.push("")
  lines.push("| case | class | profile | semantic | naive | amplified | independent | excluded_by_rule | failures |")
  lines.push("|---|---|---|---|---|---|---|---|---|")
  for (const caseReport of report.cases) {
    lines.push(
      `| ${caseReport.caseId} | ${caseReport.caseClass} | ${caseReport.profile} | ${caseReport.semanticCount}` +
      ` | ${caseReport.naiveCount} | ${caseReport.amplifiedCount} | ${caseReport.independentCount}` +
      ` | ${caseReport.excludedByRuleCount} | ${caseReport.failures.length === 0 ? "pass" : "FAIL"} |`,
    )
  }
  lines.push("")
  for (const caseReport of report.cases) {
    lines.push(...renderCase(caseReport))
    lines.push("")
  }
  if (report.failures.length > 0) {
    lines.push("## failures")
    lines.push("")
    for (const failure of report.failures) lines.push(`- ${failure}`)
    lines.push("")
  }
  return lines.join("\n")
}

function renderCase(caseReport: CaseReport): readonly string[] {
  const lines: string[] = []
  lines.push(`### ${caseReport.caseId}`)
  lines.push("")
  lines.push(`- 返却候補数 (limit 適用後): ${caseReport.limitResult.candidates.length}`)
  lines.push(`- 適用規則: ${caseReport.limitResult.applied_rules.join(" / ")}`)
  if (caseReport.limitResult.truncation !== undefined) {
    const t = caseReport.limitResult.truncation
    lines.push(`- 候補過多: total=${t.total_candidates}, returned=${t.returned_candidates}, rules=${t.applied_rules.join(" / ")}`)
  }
  lines.push(`- 必須候補の欠落: ${caseReport.requiredMissing.length === 0 ? "なし" : caseReport.requiredMissing.join(", ")}`)
  lines.push(`- 独立探索側だけの見逃し (${caseReport.independentOnlyMiss.length}):`)
  for (const id of caseReport.independentOnlyMiss.slice(0, 10)) lines.push(`  - \`${id}\``)
  lines.push(`- 派生索引側だけの見逃し (${caseReport.graphOnlyMiss.length}):`)
  for (const id of caseReport.graphOnlyMiss.slice(0, 10)) lines.push(`  - \`${id}\``)
  if (caseReport.failures.length > 0) {
    lines.push("- failures:")
    for (const failure of caseReport.failures) lines.push(`  - ${failure}`)
  }
  return lines
}

if (import.meta.main) {
  // catch — CLI boundary converts failures to exit status.
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
