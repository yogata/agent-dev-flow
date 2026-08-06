import { join } from "node:path"
import { buildGraph, loadGraph, type BuildOptions, type BuildResult } from "./graph.ts"
import { collectInputs, computeInputDigest } from "./input.ts"

export type WorkflowGraphPreparation =
  | {
    readonly status: "ready"
    readonly freshness: "current" | "regenerated"
    readonly graphPath: string
  }
  | {
    readonly status: "limited"
    readonly freshness: "stale"
    readonly graphPath: string
    readonly reason: string
  }
  | {
    readonly status: "unavailable"
    readonly freshness: "missing" | "invalid"
    readonly graphPath: string
    readonly reason: string
  }

export type GraphBuilder = (options: BuildOptions) => Promise<BuildResult>

function reason(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export async function prepareWorkflowGraph(
  options: BuildOptions,
  build: GraphBuilder = buildGraph,
): Promise<WorkflowGraphPreparation> {
  const graphPath = options.output
  const manifestExists = await Bun.file(join(graphPath, "manifest.json")).exists()
  let previousDigest: string | undefined
  if (manifestExists) {
    try {
      previousDigest = (await loadGraph(graphPath)).manifest.input_digest
    } catch (error) {
      if (!(error instanceof Error)) throw error
      previousDigest = undefined
    }
  }

  let currentDigest: string
  try {
    currentDigest = computeInputDigest(await collectInputs(options.root))
  } catch (error) {
    if (previousDigest !== undefined) {
      return { status: "limited", freshness: "stale", graphPath, reason: reason(error) }
    }
    return {
      status: "unavailable",
      freshness: manifestExists ? "invalid" : "missing",
      graphPath,
      reason: reason(error),
    }
  }

  if (previousDigest === currentDigest) {
    return { status: "ready", freshness: "current", graphPath }
  }

  try {
    await build(options)
    return { status: "ready", freshness: "regenerated", graphPath }
  } catch (error) {
    if (previousDigest !== undefined) {
      return { status: "limited", freshness: "stale", graphPath, reason: reason(error) }
    }
    return {
      status: "unavailable",
      freshness: manifestExists ? "invalid" : "missing",
      graphPath,
      reason: reason(error),
    }
  }
}
