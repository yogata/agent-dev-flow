import { resolve } from "node:path"
import { loadGraph } from "./lib/graph.ts"
import { queryGraph, type GraphQuery } from "./lib/query.ts"

function value(args: readonly string[], name: string, fallback: string): string {
  const index = args.indexOf(name)
  return index < 0 ? fallback : (args[index + 1] ?? fallback)
}

function parseQuery(args: readonly string[]): GraphQuery {
  const graphIndex = args.indexOf("--graph")
  const commandIndex = graphIndex < 0 ? 0 : graphIndex + 2
  const command = args[commandIndex]
  if (command === "neighbors") {
    return { kind: "neighbors", node: args[commandIndex + 1] ?? "", depth: Number(value(args, "--depth", "1")) }
  }
  if (command === "path") {
    return {
      kind: "path",
      source: args[commandIndex + 1] ?? "",
      target: args[commandIndex + 2] ?? "",
      maxDepth: Number(value(args, "--max-depth", "4")),
    }
  }
  if (command === "provenance") return { kind: "provenance", id: args[commandIndex + 1] ?? "" }
  throw new TypeError("query must be neighbors, path, or provenance")
}

export async function main(args: readonly string[] = Bun.argv.slice(2)): Promise<void> {
  const graph = resolve(value(args, "--graph", ".agentdev/graph"))
  console.log(JSON.stringify(queryGraph(await loadGraph(graph), parseQuery(args))))
}

if (import.meta.main) {
  // no-excuse-ok: catch -- CLI boundary converts failures to exit status.
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 2
  })
}
