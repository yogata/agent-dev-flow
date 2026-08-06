import { dirname, normalize, relative, resolve } from "node:path"
import type {
  Diagnostic, ExtractionRule, GraphEdge, InputFile, Provenance, RelationType,
} from "./model.ts"
import { extractMarkdownLinks, headingAt, parseExtensionFields, parseFrontmatter, type ParsedField } from "./parse.ts"
import { makeProvenance, sha256 } from "./provenance.ts"
import type { NodeIndex } from "./nodes.ts"

export type EdgeIndex = {
  readonly edges: readonly GraphEdge[]
  readonly provenance: readonly Provenance[]
  readonly diagnostics: readonly Diagnostic[]
}

type EdgeSeed = {
  readonly type: RelationType
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

function structuredSeeds(input: InputFile, index: NodeIndex): {
  readonly seeds: readonly EdgeSeed[]
  readonly diagnostics: readonly Diagnostic[]
} {
  const source = currentNode(index, input.path)
  if (source === undefined || source.startsWith("source_file:")) return { seeds: [], diagnostics: [] }
  const isExtension = input.path.startsWith(".agentdev/extensions/")
  const fields = isExtension ? parseExtensionFields(input.content) : parseFrontmatter(input.content)
  const seeds: EdgeSeed[] = []
  const diagnostics: Diagnostic[] = []
  for (const field of fields) {
    for (const value of field.values) {
      let type: RelationType | undefined
      let edgeSource = source
      let rawTarget = value
      if (field.key === "superseded_by") type = "supersedes"
      if (["related_req", "related_spec", "governed_by"].includes(field.key)) type = "governs"
      if (["canonical_owner", "context.paths"].includes(field.key)) type = "references"
      if (["delegates_to", "rules.skill", "checks.skill"].includes(field.key)) type = "delegates_to"
      if (type === undefined) continue
      const target = resolveAlias(index, rawTarget)
      if (target === undefined) {
        diagnostics.push(unresolved(input, field, value))
        continue
      }
      if (field.key === "superseded_by") edgeSource = target
      if (["related_req", "related_spec", "governed_by"].includes(field.key)) {
        const ruleNode = source.startsWith("integrity_rule:") ? source : target
        const governedNode = source.startsWith("integrity_rule:") ? target : source
        edgeSource = ruleNode
        rawTarget = governedNode
      } else {
        rawTarget = target
      }
      seeds.push({
        type,
        category: "declared",
        source: edgeSource,
        target: rawTarget,
        input,
        field,
        rule: isExtension ? "extension_field" : "structured_field",
      })
    }
  }
  if (isExtension) {
    const subject = input.path.split("/")[2]
    const name = input.path.split("/").at(-1)?.replace(/\.ya?ml$/, "")
    if (subject !== undefined && name !== undefined) {
      const target = resolveAlias(index, subject === "commands" ? `command:${name}` : `skill:${name}`)
      if (target !== undefined) {
        const line = input.content.split(/\r?\n/).findIndex((candidate) => candidate.startsWith("id:")) + 1
        const safeLine = line > 0 ? line : 1
        seeds.push({
          type: "extends", category: "derived", source, target, input,
          field: { key: "extension_path", values: [name], line: safeLine, text: input.path },
          rule: "extension_field",
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
    const targetPath = normalizeRepoPath(relative(root, resolve(root, dirname(input.path), link.target.split("#")[0] ?? "")))
    const target = resolveAlias(index, targetPath)
    const field = { key: "markdown_link", values: [link.target], line: link.line, text: link.text }
    if (target === undefined) {
      diagnostics.push(unresolved(input, field, link.target))
      continue
    }
    seeds.push({ type: "references", category: "declared", source, target, input, field, rule: "markdown_link" })
  }
  return { seeds, diagnostics }
}

function containmentSeeds(inputs: readonly InputFile[], index: NodeIndex): readonly EdgeSeed[] {
  const provenanceById = new Map(index.provenance.map((entry) => [entry.id, entry]))
  const inputByPath = new Map(inputs.map((input) => [input.path, input]))
  const seeds: EdgeSeed[] = []
  for (const node of index.nodes.filter((candidate) => candidate.type !== "source_file")) {
    const sourceEvidence = provenanceById.get(node.provenance_id)
    const input = sourceEvidence === undefined ? undefined : inputByPath.get(sourceEvidence.path)
    if (sourceEvidence === undefined || input === undefined) continue
    const sourceFile = `source_file:${sourceEvidence.path}`
    const field = { key: "file", values: [sourceEvidence.path], line: 1, text: sourceEvidence.path }
    seeds.push({ type: "defined_in", category: "derived", source: node.id, target: sourceFile, input, field, rule: "filesystem" })
    seeds.push({ type: "contains", category: "derived", source: sourceFile, target: node.id, input, field, rule: "filesystem" })
  }
  return seeds
}

export function extractEdges(root: string, inputs: readonly InputFile[], index: NodeIndex): EdgeIndex {
  const seeds: EdgeSeed[] = [...containmentSeeds(inputs, index)]
  const diagnostics: Diagnostic[] = []
  for (const input of inputs) {
    const structured = structuredSeeds(input, index)
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
    diagnostics: diagnostics.sort((left, right) => `${left.path}:${left.element_id}`.localeCompare(`${right.path}:${right.element_id}`)),
  }
}
