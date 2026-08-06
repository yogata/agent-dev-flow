import { resolve } from "node:path"
import { buildGraph } from "./lib/graph.ts"

function option(args: readonly string[], name: string): string | undefined {
  const index = args.indexOf(name)
  return index < 0 ? undefined : args[index + 1]
}

export async function main(args: readonly string[] = Bun.argv.slice(2)): Promise<void> {
  const root = resolve(option(args, "--root") ?? ".")
  const output = resolve(option(args, "--output") ?? `${root}/.agentdev/graph`)
  const result = await buildGraph({ root, output })
  console.log(JSON.stringify(result))
}

if (import.meta.main) {
  // no-excuse-ok: catch -- CLI boundary converts failures to exit status.
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 2
  })
}
