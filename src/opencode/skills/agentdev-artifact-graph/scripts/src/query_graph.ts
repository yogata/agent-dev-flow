import { resolve } from "node:path"
import { loadGraph } from "../lib/graph.ts"
import { queryGraph, type GraphQuery } from "../lib/query.ts"

function value(args: readonly string[], name: string, fallback: string): string {
  const index = args.indexOf(name)
  return index < 0 ? fallback : (args[index + 1] ?? fallback)
}

function option(args: readonly string[], name: string): string | undefined {
  const index = args.indexOf(name)
  return index < 0 ? undefined : args[index + 1]
}

const FLAGS_WITH_VALUE = new Set(["--graph", "--root", "--depth", "--max-depth", "--augmentation", "--roots"])

function findSubcommandIndex(args: readonly string[]): number {
  let i = 0
  while (i < args.length) {
    const arg = args[i]
    if (arg === undefined) break
    if (FLAGS_WITH_VALUE.has(arg)) {
      i += 2 // skip flag + value
      continue
    }
    return i // first non-flag argument is the subcommand
  }
  return -1
}

function parseQuery(args: readonly string[]): GraphQuery {
  const commandIndex = findSubcommandIndex(args)
  if (commandIndex < 0) throw new TypeError("query subcommand required")
  const command = args[commandIndex]
  if (command === "neighbors") {
    return {
      kind: "neighbors",
      node: args[commandIndex + 1] ?? "",
      depth: Number(value(args, "--depth", "1")),
    }
  }
  if (command === "path") {
    return {
      kind: "path",
      source: args[commandIndex + 1] ?? "",
      target: args[commandIndex + 2] ?? "",
      maxDepth: Number(value(args, "--max-depth", "4")),
    }
  }
  if (command === "provenance") {
    return { kind: "provenance", id: args[commandIndex + 1] ?? "" }
  }
  if (command === "discover") {
    return {
      kind: "discover",
      term: args[commandIndex + 1] ?? "",
      roots: parseList(args, "--roots"),
      rootDir: resolve(option(args, "--root") ?? "."),
    }
  }
  throw new TypeError(`query must be neighbors, path, provenance, or discover`)
}

function parseList(args: readonly string[], name: string): readonly string[] {
  const index = args.indexOf(name)
  if (index < 0) return []
  const v = args[index + 1] ?? ""
  return v.split(",").filter(Boolean)
}

export async function main(args: readonly string[] = process.argv.slice(2)): Promise<void> {
  const graph = resolve(value(args, "--graph", ".agentdev/graph"))
  const query = parseQuery(args)
  // discover doesn't need a loaded graph; others do
  if (query.kind === "discover") {
    console.log(JSON.stringify(await queryGraph({ manifest: {} as never, nodes: [], edges: [], provenance: [], diagnostics: [] }, query)))
  } else {
    console.log(JSON.stringify(await queryGraph(await loadGraph(graph), query)))
  }
}

if (import.meta.main) {
  // no-excuse-ok: catch -- CLI boundary converts failures to exit status.
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 2
  })
}
