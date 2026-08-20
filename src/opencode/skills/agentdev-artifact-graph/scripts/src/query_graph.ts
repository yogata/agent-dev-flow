import { parseArgs as nodeParseArgs } from "node:util"
import { resolve } from "node:path"
import { loadGraph } from "../lib/graph.ts"
import { loadAugmentation, resolveConfig, resolveTraceModel } from "../lib/augmentation.ts"
import { queryGraph, type GraphQuery } from "../lib/query.ts"
import { PROFILE_KINDS, type ProfileKind } from "../lib/tim.ts"
import { runTraceQuery } from "../lib/trace_query.ts"
import { runDiagnostics } from "../lib/trace_diagnostics.ts"

// node:util.parseArgs への委譲（Issue #2354 / OU-003、DEC-019 決定1）。
// 構文解析（値結合、`=` 形式、`--`、未知オプションの切り分け）は標準 API が行う。
// サブコマンド解釈、位置引数スロット（argv index 基準）、初回出現優先のフラグ値
// 取得は ADF 固有の意味解釈として本ファイルに残留する
// （agentdev-artifact-graph Design「スクリプト実装の標準API移行」）。
// strict:false では値を持たない文字列オプションが true になるため、
// token の value === undefined を値欠落として扱う。

interface QueryTokenOption {
  kind: "option"
  index: number
  name: string
  rawName: string
  value?: string
  inlineValue?: boolean
}
interface QueryTokenPositional {
  kind: "positional"
  index: number
  value: string
}
interface QueryTokenTerminator {
  kind: "option-terminator"
  index: number
}
type QueryToken = QueryTokenOption | QueryTokenPositional | QueryTokenTerminator

const VALUE_FLAG_OPTIONS = {
  graph: { type: "string" },
  root: { type: "string" },
  depth: { type: "string" },
  "max-depth": { type: "string" },
  augmentation: { type: "string" },
  roots: { type: "string" },
  limit: { type: "string" },
} as const

function isValueFlagToken(t: QueryToken): t is QueryTokenOption {
  return t.kind === "option" && t.name in VALUE_FLAG_OPTIONS && t.inlineValue !== true
}

interface ArgView {
  /** argv index of the subcommand (first non value-flag arg), or -1 when absent */
  readonly commandIndex: number
  /** first-occurrence value of a value flag (`--depth` 等)。`=` 形式と値欠落は undefined */
  flag(name: string): string | undefined
  /** whether the value flag appears at all (値欠落も出現扱い) */
  has(name: string): boolean
}

function parseArgView(args: readonly string[]): ArgView {
  const parsed = nodeParseArgs({
    args: [...args],
    options: VALUE_FLAG_OPTIONS,
    strict: false,
    allowPositionals: true,
    tokens: true,
  }) as unknown as { tokens: QueryToken[] }
  const flags = new Map<string, string | undefined>()
  let commandIndex = -1
  for (const t of parsed.tokens) {
    if (commandIndex < 0 && !isValueFlagToken(t)) commandIndex = t.index
    if (isValueFlagToken(t) && !flags.has(t.name)) {
      // 旧実装の indexOf セマンティクスに合わせ初回出現を優先する。
      flags.set(t.name, t.value)
    }
  }
  return {
    commandIndex,
    flag: (name: string) => flags.get(name.replace(/^-+/, "")),
    has: (name: string) => flags.has(name.replace(/^-+/, "")),
  }
}

function parseQuery(view: ArgView, args: readonly string[]): GraphQuery {
  const commandIndex = view.commandIndex
  if (commandIndex < 0) throw new TypeError("query subcommand required")
  const command = args[commandIndex]
  if (command === "neighbors") {
    return {
      kind: "neighbors",
      node: args[commandIndex + 1] ?? "",
      depth: Number(view.flag("--depth") ?? "1"),
    }
  }
  if (command === "path") {
    return {
      kind: "path",
      source: args[commandIndex + 1] ?? "",
      target: args[commandIndex + 2] ?? "",
      maxDepth: Number(view.flag("--max-depth") ?? "4"),
    }
  }
  if (command === "provenance") {
    return { kind: "provenance", id: args[commandIndex + 1] ?? "" }
  }
  if (command === "discover") {
    return {
      kind: "discover",
      term: args[commandIndex + 1] ?? "",
      roots: parseList(view),
      rootDir: resolve(view.flag("--root") ?? "."),
    }
  }
  if (command === "index") {
    return { kind: "index", node: args[commandIndex + 1] ?? "" }
  }
  throw new TypeError(`query must be one of: ${[...PROFILE_KINDS, "neighbors", "path", "provenance", "discover", "index"].join(", ")}`)
}

function parseList(view: ArgView): readonly string[] {
  if (!view.has("--roots")) return []
  return (view.flag("--roots") ?? "").split(",").filter(Boolean)
}

function parseLimit(view: ArgView): number | undefined {
  const raw = view.flag("--limit")
  return raw === undefined ? undefined : Number(raw)
}

function parseDepth(view: ArgView): number | undefined {
  const raw = view.flag("--depth")
  return raw === undefined ? undefined : Number(raw)
}

async function runHighLevel(
  view: ArgView,
  args: readonly string[],
  profile: ProfileKind,
): Promise<string> {
  const root = resolve(view.flag("--root") ?? ".")
  const augmentation = await loadAugmentation(root, view.flag("--augmentation"))
  const graph = await loadGraph(resolve(view.flag("--graph") ?? ".agentdev/graph"))
  const model = resolveTraceModel(graph.manifest, augmentation)
  const limit = parseLimit(view)
  if (profile === "diagnostics") {
    return JSON.stringify(runDiagnostics(graph, model, limit))
  }
  const node = args[view.commandIndex + 1] ?? ""
  return JSON.stringify(runTraceQuery(graph, model, profile, node, limit, parseDepth(view)))
}

export async function main(args: readonly string[] = process.argv.slice(2)): Promise<void> {
  const view = parseArgView(args)
  if (view.commandIndex < 0) throw new TypeError("query subcommand required")
  const command = args[view.commandIndex] ?? ""

  if ((PROFILE_KINDS as readonly string[]).includes(command)) {
    console.log(await runHighLevel(view, args, command as ProfileKind))
    return
  }

  const query = parseQuery(view, args)
  // discover doesn't need a loaded graph; others do
  if (query.kind === "discover") {
    let roots = query.roots
    if (!view.has("--roots")) {
      // REQ-{NNNN}-{NNN}/011: resolve discovery_roots from the applied config;
      // an explicit --roots flag overrides for this run only.
      const augmentation = await loadAugmentation(query.rootDir, view.flag("--augmentation"))
      roots = resolveConfig(augmentation).discovery_roots
    }
    const graph = { manifest: {} as never, nodes: [], edges: [], provenance: [], diagnostics: [] }
    console.log(JSON.stringify(await queryGraph(graph, { ...query, roots })))
    return
  }

  console.log(JSON.stringify(await queryGraph(await loadGraph(resolve(view.flag("--graph") ?? ".agentdev/graph")), query)))
}

if (import.meta.main) {
  // no-excuse-ok: catch -- CLI boundary converts failures to exit status.
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 2
  })
}
