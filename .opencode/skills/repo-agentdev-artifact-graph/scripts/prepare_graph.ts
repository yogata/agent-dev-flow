import { resolve } from "node:path"
import { prepareWorkflowGraph } from "./lib/workflow.ts"

function option(args: readonly string[], name: string): string | undefined {
  const index = args.indexOf(name)
  return index < 0 ? undefined : args[index + 1]
}

export async function main(args: readonly string[] = Bun.argv.slice(2)): Promise<void> {
  const root = resolve(option(args, "--root") ?? ".")
  const output = resolve(option(args, "--output") ?? `${root}/.agentdev/graph`)
  console.log(JSON.stringify(await prepareWorkflowGraph({ root, output })))
}

if (import.meta.main) {
  // no-excuse-ok: catch -- CLI boundary reports unexpected invocation failures.
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 2
  })
}
