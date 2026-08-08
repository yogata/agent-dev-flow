import { resolve } from "node:path"
import { checkGraph } from "../lib/checker.ts"
import { loadGraph } from "../lib/graph.ts"

function graphPath(args: readonly string[]): string {
  const index = args.indexOf("--graph")
  return resolve(index < 0 ? ".agentdev/graph" : (args[index + 1] ?? ".agentdev/graph"))
}

export async function main(args: readonly string[] = process.argv.slice(2)): Promise<void> {
  const report = checkGraph(await loadGraph(graphPath(args)))
  console.log(JSON.stringify(report))
  if (!report.valid) process.exitCode = 1
}

if (import.meta.main) {
  // no-excuse-ok: catch -- CLI boundary converts failures to exit status.
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 2
  })
}
