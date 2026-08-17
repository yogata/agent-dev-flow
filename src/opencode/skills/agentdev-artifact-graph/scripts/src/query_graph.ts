import { resolve } from "node:path"
import { loadGraph } from "../lib/graph.ts"
import { loadAugmentation, resolveConfig, resolveTraceModel } from "../lib/augmentation.ts"
import { queryGraph, type GraphQuery } from "../lib/query.ts"
import { PROFILE_KINDS, type ProfileKind } from "../lib/tim.ts"
import { runTraceQuery } from "../lib/trace_query.ts"
import { runDiagnostics } from "../lib/trace_diagnostics.ts"

function value(args: readonly string[], name: string, fallback: string): string {
  const index = args.indexOf(name)
  return index < 0 ? fallback : (args[index + 1] ?? fallback)
}

function option(args: readonly string[], name: string): string | undefined {
  const index = args.indexOf(name)
  return index < 0 ? undefined : args[index + 1]
}

const FLAGS_WITH_VALUE = new Set(["--graph", "--root", "--depth", "--max-depth", "--augmentation", "--roots", "--limit"])

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
  if (command === "index") {
    return { kind: "index", node: args[commandIndex + 1] ?? "" }
  }
  throw new TypeError(`query must be one of: ${[...PROFILE_KINDS, "neighbors", "path", "provenance", "discover", "index"].join(", ")}`)
}

function parseList(args: readonly string[], name: string): readonly string[] {
  const index = args.indexOf(name)
  if (index < 0) return []
  const v = args[index + 1] ?? ""
  return v.split(",").filter(Boolean)
}

function parseLimit(args: readonly string[]): number | undefined {
  const raw = option(args, "--limit")
  return raw === undefined ? undefined : Number(raw)
}

function parseDepth(args: readonly string[]): number | undefined {
  const raw = option(args, "--depth")
  return raw === undefined ? undefined : Number(raw)
}

async function runHighLevel(
  args: readonly string[],
  profile: ProfileKind,
  commandIndex: number,
): Promise<string> {
  const root = resolve(option(args, "--root") ?? ".")
  const augmentation = await loadAugmentation(root, option(args, "--augmentation"))
  const graph = await loadGraph(resolve(value(args, "--graph", ".agentdev/graph")))
  const model = resolveTraceModel(graph.manifest, augmentation)
  const limit = parseLimit(args)
  if (profile === "diagnostics") {
    return JSON.stringify(runDiagnostics(graph, model, limit))
  }
  const node = args[commandIndex + 1] ?? ""
  return JSON.stringify(runTraceQuery(graph, model, profile, node, limit, parseDepth(args)))
}

export async function main(args: readonly string[] = process.argv.slice(2)): Promise<void> {
  const commandIndex = findSubcommandIndex(args)
  if (commandIndex < 0) throw new TypeError("query subcommand required")
  const command = args[commandIndex] ?? ""

  if ((PROFILE_KINDS as readonly string[]).includes(command)) {
    console.log(await runHighLevel(args, command as ProfileKind, commandIndex))
    return
  }

  const query = parseQuery(args)
  // discover doesn't need a loaded graph; others do
  if (query.kind === "discover") {
    let roots = query.roots
    if (!args.includes("--roots")) {
      // REQ-{NNNN}-{NNN}/011: resolve discovery_roots from the applied config;
      // an explicit --roots flag overrides for this run only.
      const augmentation = await loadAugmentation(query.rootDir, option(args, "--augmentation"))
      roots = resolveConfig(augmentation).discovery_roots
    }
    const graph = { manifest: {} as never, nodes: [], edges: [], provenance: [], diagnostics: [] }
    console.log(JSON.stringify(await queryGraph(graph, { ...query, roots })))
    return
  }

  console.log(JSON.stringify(await queryGraph(await loadGraph(resolve(value(args, "--graph", ".agentdev/graph"))), query)))
}

if (import.meta.main) {
  // no-excuse-ok: catch -- CLI boundary converts failures to exit status.
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 2
  })
}
