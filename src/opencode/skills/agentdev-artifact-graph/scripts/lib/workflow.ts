import { join } from "node:path"
import { buildGraphWithConfig, loadGraph, resolveBuildConfig, type BuildOptions, type BuildResult } from "./graph.ts"
import type { GraphData } from "./model.ts"
import { collectInputs, computeInputDigest } from "./input.ts"
import { computeGraphConfigDigest } from "./config.ts"
import { GENERATOR_VERSION } from "./model.ts"
import type { ResolvedConfig } from "./config.ts"

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

export type GraphBuilder = (options: BuildOptions, config: ResolvedConfig) => Promise<BuildResult>

function reason(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/**
 * A loadable existing graph. `undefined` means no loadable graph (absent,
 * unreadable, or schema-incompatible).
 */
type ExistingGraph = {
  readonly graph: GraphData
}

/**
 * Freshness is judged by the 4 elements (REQ-{NNNN}-{NNN}): input_digest,
 * graph_config_digest, generator_version, schema_version. schema_version
 * compatibility is enforced at load time (ManifestSchema literal), so a graph
 * that failed to load is treated as invalid and regeneration is attempted
 * (REQ-{NNNN}-{NNN}). Query-time settings are not part of the comparison.
 */
function isFresh(existing: ExistingGraph, currentInputDigest: string, currentConfigDigest: string): boolean {
  const manifest = existing.graph.manifest
  return manifest.input_digest === currentInputDigest
    && manifest.graph_config_digest === currentConfigDigest
    && manifest.generator_version === GENERATOR_VERSION
}

export async function prepareWorkflowGraph(
  options: BuildOptions,
  build: GraphBuilder = buildGraphWithConfig,
): Promise<WorkflowGraphPreparation> {
  const graphPath = options.output
  const manifestExists = await Bun.file(join(graphPath, "manifest.json")).exists()

  let existing: ExistingGraph | undefined
  if (manifestExists) {
    try {
      existing = { graph: await loadGraph(graphPath) }
    } catch {
      existing = undefined
    }
  }

  let config: ResolvedConfig
  try {
    config = await resolveBuildConfig(options.root, options.augmentationPath)
  } catch (error) {
    if (existing !== undefined) {
      return { status: "limited", freshness: "stale", graphPath, reason: reason(error) }
    }
    return {
      status: "unavailable",
      freshness: manifestExists ? "invalid" : "missing",
      graphPath,
      reason: reason(error),
    }
  }

  let currentInputDigest: string
  let currentConfigDigest: string
  try {
    currentInputDigest = computeInputDigest(await collectInputs(options.root, config))
    currentConfigDigest = computeGraphConfigDigest(config)
  } catch (error) {
    if (existing !== undefined) {
      return { status: "limited", freshness: "stale", graphPath, reason: reason(error) }
    }
    return {
      status: "unavailable",
      freshness: manifestExists ? "invalid" : "missing",
      graphPath,
      reason: reason(error),
    }
  }

  if (existing !== undefined && isFresh(existing, currentInputDigest, currentConfigDigest)) {
    return { status: "ready", freshness: "current", graphPath }
  }

  try {
    await build(options, config)
    return { status: "ready", freshness: "regenerated", graphPath }
  } catch (error) {
    if (existing !== undefined) {
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
