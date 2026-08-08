import { dirname, normalize, relative, resolve } from "node:path"
import type {
  Diagnostic,
  ExtractionRule,
  GraphEdge,
  InputFile,
  Provenance,
} from "./model.ts"
import type { RelationTypeRule, ResolvedConfig } from "./config.ts"
import { extractMarkdownLinks, headingAt, parseFrontmatter, type ParsedField } from "./parse.ts"
import { makeProvenance, sha256 } from "./provenance.ts"
import type { NodeIndex } from "./nodes.ts"

export type EdgeIndex = {
  readonly edges: readonly GraphEdge[]
  readonly provenance: readonly Provenance[]
  readonly diagnostics: readonly Diagnostic[]
}

type EdgeSeed = {
  readonly type: string
  readonly category: "declared" | "derived"
  readonly source: string
  readonly target: string
  readonly input: InputFile
  readonly field: ParsedField
  readonly rule: ExtractionRule
}

function normalizeRepoPath(path: string): string {
  return normalize(path).replaceAll("\\", "/").replace(/^\.\//, "")
}

function currentNode(index: NodeIndex, path: string): string | undefined {
  return index.nodeByPath.get(path)
}

function resolveAlias(index: NodeIndex, raw: string): string | undefined {
  const cleaned = raw.replace(/^`|`$/g, "").replace(/^v2:/, "")
  return index.aliases.get(cleaned) ?? index.aliases.get(cleaned.replace(/^\.\//, ""))
}

function makeEdge(seed: EdgeSeed): { readonly edge: GraphEdge; readonly provenance: Provenance } {
  const provenance = makeProvenance({
    path: seed.input.path,
    heading: headingAt(seed.input.content, seed.field.line),
    elementId: `field:${seed.field.key}`,
    matchedText: seed.field.text,
    lineStart: seed.field.line,
    lineEnd: seed.field.line,
    extractionRule: seed.rule,
  })
  const id = `edge:${sha256([seed.type, seed.source, seed.target, provenance.id].join("\0"))}`
  return {
    edge: {
      id,
      type: seed.type,
      category: seed.category,
      source: seed.source,
      target: seed.target,
      provenance_id: provenance.id,
      extraction_rule: seed.rule,
    },
    provenance,
  }
}

function unresolved(input: InputFile, field: ParsedField, value: string): Diagnostic {
  return {
    severity: "warning",
    code: "unresolved_reference",
    message: `Reference does not resolve: ${value}`,
    path: input.path,
    element_id: `field:${field.key}`,
  }
}

function buildFieldToRelationMap(
  rules: readonly RelationTypeRule[],
): Map<string, { type: string; reverse: boolean }> {
  const map = new Map<string, { type: string; reverse: boolean }>()
  for (const rule of rules) {
    for (const f of rule.fields) {
      map.set(f, { type: rule.name, reverse: rule.reverse_direction })
    }
  }
  return map
}

function structuredSeeds(
  input: InputFile,
  index: NodeIndex,
  fieldMap: Map<string, { type: string; reverse: boolean }>,
): {
  readonly seeds: readonly EdgeSeed[]
  readonly diagnostics: readonly Diagnostic[]
} {
  const source = currentNode(index, input.path)
  if (source === undefined) return { seeds: [], diagnostics: [] }

  const fields = parseFrontmatter(input.content)
  const seeds: EdgeSeed[] = []
  const diagnostics: Diagnostic[] = []

  for (const f of fields) {
    const mapping = fieldMap.get(f.key)
    if (mapping === undefined) continue
    for (const value of f.values) {
      const target = resolveAlias(index, value)
      if (target === undefined) {
        diagnostics.push(unresolved(input, f, value))
        continue
      }
      if (mapping.reverse) {
        seeds.push({
          type: mapping.type,
          category: "declared",
          source: target,
          target: source,
          input,
          field: f,
          rule: "structured_field",
        })
      } else {
        seeds.push({
          type: mapping.type,
          category: "declared",
          source,
          target,
          input,
          field: f,
          rule: "structured_field",
        })
      }
    }
  }

  return { seeds, diagnostics }
}

function markdownSeeds(root: string, input: InputFile, index: NodeIndex): {
  readonly seeds: readonly EdgeSeed[]
  readonly diagnostics: readonly Diagnostic[]
} {
  if (!input.path.endsWith(".md")) return { seeds: [], diagnostics: [] }
  const source = currentNode(index, input.path)
  if (source === undefined) return { seeds: [], diagnostics: [] }
  const seeds: EdgeSeed[] = []
  const diagnostics: Diagnostic[] = []
  for (const link of extractMarkdownLinks(input.content)) {
    if (/^[a-z]+:/i.test(link.target) || link.target.startsWith("#")) continue
    const targetPath = normalizeRepoPath(
      relative(root, resolve(root, dirname(input.path), link.target.split("#")[0] ?? "")),
    )
    const target = resolveAlias(index, targetPath)
    const f = { key: "markdown_link", values: [link.target], line: link.line, text: link.text }
    if (target === undefined) {
      diagnostics.push(unresolved(input, f, link.target))
      continue
    }
    seeds.push({
      type: "references",
      category: "declared",
      source,
      target,
      input,
      field: f,
      rule: "markdown_link",
    })
  }
  return { seeds, diagnostics }
}

export function extractEdges(
  root: string,
  inputs: readonly InputFile[],
  index: NodeIndex,
  config: ResolvedConfig,
): EdgeIndex {
  const fieldMap = buildFieldToRelationMap(config.relation_type_rules)
  const seeds: EdgeSeed[] = []
  const diagnostics: Diagnostic[] = []

  for (const input of inputs) {
    const structured = structuredSeeds(input, index, fieldMap)
    const markdown = markdownSeeds(root, input, index)
    seeds.push(...structured.seeds, ...markdown.seeds)
    diagnostics.push(...structured.diagnostics, ...markdown.diagnostics)
  }

  const edgeById = new Map<string, GraphEdge>()
  const provenanceById = new Map<string, Provenance>()
  for (const seed of seeds) {
    const result = makeEdge(seed)
    edgeById.set(result.edge.id, result.edge)
    provenanceById.set(result.provenance.id, result.provenance)
  }

  return {
    edges: [...edgeById.values()].sort((left, right) => left.id.localeCompare(right.id)),
    provenance: [...provenanceById.values()].sort((left, right) => left.id.localeCompare(right.id)),
    diagnostics: diagnostics.sort((left, right) =>
      `${left.path}:${left.element_id}`.localeCompare(`${right.path}:${right.element_id}`)
    ),
  }
}
