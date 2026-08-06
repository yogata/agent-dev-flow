import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { EXCLUDED_PATHS, INDEXED_PATHS } from "./config.ts"
import { extractEdges } from "./edges.ts"
import { collectInputs, computeInputDigest } from "./input.ts"
import {
  EdgeSchema,
  DiagnosticSchema,
  ManifestSchema,
  NodeSchema,
  OUTPUT_FILES,
  ProvenanceSchema,
  type Diagnostic,
  type GraphData,
  type GraphEdge,
  type GraphNode,
  type Provenance,
} from "./model.ts"
import { extractNodes } from "./nodes.ts"

export type BuildOptions = {
  readonly root: string
  readonly output: string
}

export type BuildResult = {
  readonly files: readonly string[]
  readonly nodeCount: number
  readonly edgeCount: number
  readonly diagnosticCount: number
  readonly inputDigest: string
}

function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}

function jsonLines(values: readonly unknown[]): string {
  return values.length === 0 ? "" : `${values.map((value) => JSON.stringify(value)).join("\n")}\n`
}

function diagnosticsDocument(diagnostics: readonly Diagnostic[]): object {
  return {
    summary: {
      errors: diagnostics.filter((entry) => entry.severity === "error").length,
      warnings: diagnostics.filter((entry) => entry.severity === "warning").length,
      observations: diagnostics.filter((entry) => entry.severity === "observation").length,
    },
    diagnostics,
  }
}

export async function buildGraph(options: BuildOptions): Promise<BuildResult> {
  const inputs = await collectInputs(options.root)
  const nodeIndex = extractNodes(inputs)
  const edgeIndex = extractEdges(options.root, inputs, nodeIndex)
  const manifest = ManifestSchema.parse({
    schema_version: "1.0.0",
    generator_version: "0.1.0",
    input_digest: computeInputDigest(inputs),
    indexed_paths: [...INDEXED_PATHS],
    excluded_paths: [...EXCLUDED_PATHS],
  })
  const nodes = nodeIndex.nodes.map((node) => NodeSchema.parse(node))
  const edges = edgeIndex.edges.map((edge) => EdgeSchema.parse(edge))
  const provenance = [...new Map(
    [...nodeIndex.provenance, ...edgeIndex.provenance].map((entry) => [entry.id, ProvenanceSchema.parse(entry)]),
  ).values()].sort((left, right) => left.id.localeCompare(right.id))

  await mkdir(options.output, { recursive: true })
  await Promise.all([
    writeFile(join(options.output, "manifest.json"), json(manifest), "utf8"),
    writeFile(join(options.output, "nodes.jsonl"), jsonLines(nodes), "utf8"),
    writeFile(join(options.output, "edges.jsonl"), jsonLines(edges), "utf8"),
    writeFile(join(options.output, "provenance.jsonl"), jsonLines(provenance), "utf8"),
    writeFile(join(options.output, "diagnostics.json"), json(diagnosticsDocument(edgeIndex.diagnostics)), "utf8"),
  ])
  return {
    files: OUTPUT_FILES,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    diagnosticCount: edgeIndex.diagnostics.length,
    inputDigest: manifest.input_digest,
  }
}

function parseJsonLines<T>(content: string, parse: (value: unknown) => T): readonly T[] {
  return content.split(/\r?\n/).filter(Boolean).map((line) => parse(JSON.parse(line)))
}

function parseDiagnostics(value: unknown): readonly Diagnostic[] {
  if (typeof value !== "object" || value === null || !("diagnostics" in value) || !Array.isArray(value.diagnostics)) {
    throw new TypeError("diagnostics.json does not contain diagnostics")
  }
  return value.diagnostics.map((entry) => DiagnosticSchema.parse(entry))
}

export async function loadGraph(output: string): Promise<GraphData> {
  const [manifestText, nodesText, edgesText, provenanceText, diagnosticsText] = await Promise.all(
    OUTPUT_FILES.map((name) => readFile(join(output, name), "utf8")),
  )
  return {
    manifest: ManifestSchema.parse(JSON.parse(manifestText ?? "")),
    nodes: parseJsonLines(nodesText ?? "", (value): GraphNode => NodeSchema.parse(value)),
    edges: parseJsonLines(edgesText ?? "", (value): GraphEdge => EdgeSchema.parse(value)),
    provenance: parseJsonLines(provenanceText ?? "", (value): Provenance => ProvenanceSchema.parse(value)),
    diagnostics: parseDiagnostics(JSON.parse(diagnosticsText ?? "")),
  }
}
