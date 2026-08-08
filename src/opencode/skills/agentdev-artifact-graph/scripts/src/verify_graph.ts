import { resolve } from "node:path"
import { loadGraph, resolveBuildConfig } from "../lib/graph.ts"
import { verifyGraph } from "../lib/verification.ts"

function option(args: readonly string[], name: string): string | undefined {
  const index = args.indexOf(name)
  return index < 0 ? undefined : args[index + 1]
}

export async function main(args: readonly string[] = process.argv.slice(2)): Promise<void> {
  const root = resolve(option(args, "--root") ?? ".")
  const graphPath = resolve(option(args, "--graph") ?? `${root}/.agentdev/graph`)
  const augmentationPath = option(args, "--augmentation")
  const graph = await loadGraph(graphPath)
  const config = await resolveBuildConfig(root, augmentationPath)
  const report = await verifyGraph(root, graph, config)
  console.log(JSON.stringify(report))
}

if (import.meta.main) {
  // no-excuse-ok: catch -- CLI boundary converts failures to exit status.
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 2
  })
}
