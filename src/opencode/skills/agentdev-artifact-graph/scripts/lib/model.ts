import { z } from "zod"

export const SCHEMA_VERSION = "1.0.0" as const
export const GENERATOR_VERSION = "0.1.0" as const

export const OUTPUT_FILES = [
  "manifest.json",
  "nodes.jsonl",
  "edges.jsonl",
  "provenance.jsonl",
  "diagnostics.json",
] as const

export const EXTRACTION_RULES = [
  "filesystem",
  "frontmatter",
  "structured_field",
  "markdown_link",
  "extension_field",
] as const

export type ExtractionRule = (typeof EXTRACTION_RULES)[number]

/**
 * Open extension point: node types and relation types are validated against a
 * runtime-resolved vocabulary (defaults + augmentation). They are NOT closed
 * enums (REQ-{NNNN}-{NNN}, DEC-{N} decision 2).
 */
export type NodeType = string
export type RelationType = string

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

/**
 * Build a Node schema that accepts any node type in the resolved vocabulary.
 * Open extensibility: augmentation can add types (REQ-{NNNN}-{NNN}).
 */
export function buildNodeSchema(validNodeTypes: ReadonlySet<string>) {
  return z.object({
    id: z.string().min(1),
    type: z
      .string()
      .min(1)
      .refine((t: string) => validNodeTypes.has(t), "unknown node type"),
    label: z.string().min(1),
    status: z.string().optional(),
    provenance_id: z.string().min(1),
  })
}

export function buildEdgeSchema(validRelationTypes: ReadonlySet<string>) {
  return z.object({
    id: z.string().min(1),
    type: z
      .string()
      .min(1)
      .refine((t: string) => validRelationTypes.has(t), "unknown relation type"),
    category: z.enum(["declared", "derived"]),
    source: z.string().min(1),
    target: z.string().min(1),
    provenance_id: z.string().min(1),
    extraction_rule: z.enum(EXTRACTION_RULES),
  })
}

export const ManifestSchema = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  generator_version: z.literal(GENERATOR_VERSION),
  input_digest: z.string().regex(/^[a-f0-9]{64}$/),
  indexed_paths: z.array(z.string()),
  excluded_paths: z.array(z.string()),
  node_types: z.array(z.string()),
  relation_types: z.array(z.string()),
})

export const DiagnosticSchema = z.object({
  severity: z.enum(["error", "warning", "observation"]),
  code: z.string().min(1),
  message: z.string().min(1),
  path: z.string(),
  element_id: z.string().min(1),
})

export type Provenance = z.infer<typeof ProvenanceSchema>
export type GraphNode = z.infer<ReturnType<typeof buildNodeSchema>>
export type GraphEdge = z.infer<ReturnType<typeof buildEdgeSchema>>
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
