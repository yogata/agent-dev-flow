import { z } from "zod"

export const NODE_TYPES = [
  "requirement", "adr", "specification", "integrity_rule",
  "command", "skill", "extension", "source_file",
] as const
export const RELATION_TYPES = [
  "references", "supersedes", "defined_in", "contains",
  "extends", "delegates_to", "governs",
] as const
export const OUTPUT_FILES = [
  "manifest.json", "nodes.jsonl", "edges.jsonl", "provenance.jsonl", "diagnostics.json",
] as const
export const EXTRACTION_RULES = [
  "filesystem", "frontmatter", "structured_field", "markdown_link", "extension_field",
] as const

export const ProvenanceSchema = z.object({
  id: z.string().min(1),
  path: z.string().min(1),
  heading: z.string(),
  element_id: z.string().min(1),
  matched_text: z.string(),
  matched_text_hash: z.string().regex(/^[a-f0-9]{64}$/),
  line_start: z.number().int().positive(),
  line_end: z.number().int().positive(),
  extraction_rule: z.enum(EXTRACTION_RULES),
})

export const NodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(NODE_TYPES),
  label: z.string().min(1),
  status: z.string().optional(),
  provenance_id: z.string().min(1),
})

export const EdgeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(RELATION_TYPES),
  category: z.enum(["declared", "derived"]),
  source: z.string().min(1),
  target: z.string().min(1),
  provenance_id: z.string().min(1),
  extraction_rule: z.enum(EXTRACTION_RULES),
})

export const ManifestSchema = z.object({
  schema_version: z.literal("1.0.0"),
  generator_version: z.literal("0.1.0"),
  input_digest: z.string().regex(/^[a-f0-9]{64}$/),
  indexed_paths: z.array(z.string()),
  excluded_paths: z.array(z.string()),
})

export const DiagnosticSchema = z.object({
  severity: z.enum(["error", "warning", "observation"]),
  code: z.string().min(1),
  message: z.string().min(1),
  path: z.string(),
  element_id: z.string().min(1),
})

export type NodeType = z.infer<typeof NodeSchema>["type"]
export type RelationType = z.infer<typeof EdgeSchema>["type"]
export type ExtractionRule = z.infer<typeof ProvenanceSchema>["extraction_rule"]
export type Provenance = z.infer<typeof ProvenanceSchema>
export type GraphNode = z.infer<typeof NodeSchema>
export type GraphEdge = z.infer<typeof EdgeSchema>
export type Manifest = z.infer<typeof ManifestSchema>

export type Diagnostic = z.infer<typeof DiagnosticSchema>

export type GraphData = {
  readonly manifest: Manifest
  readonly nodes: readonly GraphNode[]
  readonly edges: readonly GraphEdge[]
  readonly provenance: readonly Provenance[]
  readonly diagnostics: readonly Diagnostic[]
}

export type InputFile = {
  readonly path: string
  readonly content: string
}

export type EvidenceSeed = {
  readonly path: string
  readonly heading: string
  readonly elementId: string
  readonly matchedText: string
  readonly lineStart: number
  readonly lineEnd: number
  readonly extractionRule: ExtractionRule
}
