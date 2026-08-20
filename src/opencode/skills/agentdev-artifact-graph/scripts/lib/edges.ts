import { existsSync } from "node:fs"
import { dirname, join, normalize, relative, resolve } from "node:path"
import type {
  Diagnostic,
  ExtractionRule,
  GraphEdge,
  InputFile,
  Provenance,
} from "./model.ts"
import type { RelationTypeRule, ResolvedConfig } from "./config.ts"
import { extractMarkdownLinks, headingAt, parseExtensionFields, parseFrontmatter, type ParsedField } from "./parse.ts"
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

// ─── Unresolved reference classification (REQ-{NNNN}-{NNN}/002) ───────────────────

type ReferenceKind =
  | "relative_path"
  | "directory_path"
  | "explicit_id"
  | "bare_filename"
  | "description_word"

type SourceFileType =
  | "REQ"
  | "DEC"
  | "Design/command"
  | "Design/skill"
  | "Design/workflow"
  | "Design/foundation"
  | "COMMAND"
  | "SKILL"
  | "SKILL/repo-local"
  | "other"

function classifyReference(value: string): ReferenceKind {
  const cleaned = value.replace(/^`|`$/g, "").replace(/^v2:/, "").trim()
  if (cleaned.endsWith("/")) return "directory_path"
  if (/^(REQ|DEC|IR|ADR|Design|RU|AG)-\d+/i.test(cleaned)) return "explicit_id"
  if (cleaned.includes("/")) return "relative_path"
  if (/\.[a-z0-9]{1,10}$/i.test(cleaned)) return "bare_filename"
  return "description_word"
}

function classifySourceFile(path: string): SourceFileType {
  if (/^docs\/requirements\/REQ-/.test(path)) return "REQ"
  if (/^docs\/decisions\//.test(path)) return "DEC"
  if (/^docs\/specs\/commands\//.test(path)) return "Design/command"
  if (/^docs\/specs\/skills\//.test(path)) return "Design/skill"
  if (/^docs\/specs\/workflows\//.test(path)) return "Design/workflow"
  if (/^docs\/specs\//.test(path)) return "Design/foundation"
  if (/^src\/opencode\/commands\//.test(path)) return "COMMAND"
  if (/^\.opencode\/commands\//.test(path)) return "COMMAND"
  if (/^src\/opencode\/skills\//.test(path)) return "SKILL"
  if (/^\.opencode\/skills\//.test(path)) return "SKILL/repo-local"
  return "other"
}

/**
 * Check whether a candidate file exists for a path-form reference, even when
 * the relative path escapes the repository root (too many ../). Returns true
 * when a resolvable candidate is identifiable on the filesystem.
 */
function candidateExists(root: string, sourcePath: string, target: string): boolean {
  const stripped = target.split("#")[0] ?? ""
  if (stripped === "") return false
  const sourceDir = dirname(sourcePath)
  const resolved = resolve(root, sourceDir, stripped)
  const rel = normalize(relative(root, resolved)).replaceAll("\\", "/")
  if (!rel.startsWith("..") && rel !== "") {
    return existsSync(join(root, rel))
  }
  // Path escapes root: strip leading ../ segments and look for candidate under root.
  const parts = rel.split("/")
  let i = 0
  while (i < parts.length && (parts[i] === ".." || parts[i] === ".")) i += 1
  if (i >= parts.length) return false
  const candidate = parts.slice(i).join("/")
  return candidate !== "" && existsSync(join(root, candidate))
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

function unresolved(root: string, input: InputFile, field: ParsedField, value: string): Diagnostic {
  const kind = classifyReference(value)
  const sourceType = classifySourceFile(input.path)
  let severity: Diagnostic["severity"] = "warning"
  let suffix: string = kind
  if (kind === "relative_path") {
    const resolvable = candidateExists(root, input.path, value)
    suffix = resolvable ? "relative_path:resolvable" : "relative_path:unresolved"
    if (resolvable) severity = "observation"
  } else {
    severity = "observation"
  }
  return {
    severity,
    code: `unresolved_reference:${suffix}`,
    message: `Reference does not resolve (${kind} from ${sourceType}): ${value}`,
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
  root: string,
  input: InputFile,
  index: NodeIndex,
  fieldMap: Map<string, { type: string; reverse: boolean }>,
): {
  readonly seeds: readonly EdgeSeed[]
  readonly diagnostics: readonly Diagnostic[]
} {
  const source = currentNode(index, input.path)
  if (source === undefined || source.startsWith("source_file:")) return { seeds: [], diagnostics: [] }

  const isExtension = input.path.startsWith(".agentdev/extensions/")
  const fields = isExtension ? parseExtensionFields(input.content) : parseFrontmatter(input.content)
  const rule: ExtractionRule = isExtension ? "extension_field" : "structured_field"
  const seeds: EdgeSeed[] = []
  const diagnostics: Diagnostic[] = []

  for (const f of fields) {
    const mapping = fieldMap.get(f.key)
    if (mapping === undefined) continue
    for (const value of f.values) {
      const target = resolveAlias(index, value)
      if (target === undefined) {
        diagnostics.push(unresolved(root, input, f, value))
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
          rule,
        })
      } else {
        seeds.push({
          type: mapping.type,
          category: "declared",
          source,
          target,
          input,
          field: f,
          rule,
        })
      }
    }
  }

  return { seeds, diagnostics }
}

function containmentSeeds(
  inputs: readonly InputFile[],
  index: NodeIndex,
  config: ResolvedConfig,
): readonly EdgeSeed[] {
  if (!config.node_type_vocabulary.includes("source_file")) return []
  const provenanceById = new Map(index.provenance.map((entry) => [entry.id, entry]))
  const inputByPath = new Map(inputs.map((input) => [input.path, input]))
  const seeds: EdgeSeed[] = []
  for (const node of index.nodes) {
    if (node.type === "source_file") continue
    const sourceEvidence = provenanceById.get(node.provenance_id)
    if (sourceEvidence === undefined) continue
    const input = inputByPath.get(sourceEvidence.path)
    if (input === undefined) continue
    const sourceFileId = `source_file:${sourceEvidence.path}`
    const f = { key: "file", values: [sourceEvidence.path], line: 1, text: sourceEvidence.path }
    seeds.push({ type: "defined_in", category: "derived", source: node.id, target: sourceFileId, input, field: f, rule: "filesystem" })
    seeds.push({ type: "contains", category: "derived", source: sourceFileId, target: node.id, input, field: f, rule: "filesystem" })
  }
  return seeds
}

function extensionSeeds(
  inputs: readonly InputFile[],
  index: NodeIndex,
  config: ResolvedConfig,
): readonly EdgeSeed[] {
  if (!config.node_type_vocabulary.includes("extension")) return []
  if (!config.indexed_paths.includes(".agentdev/extensions")) return []
  const seeds: EdgeSeed[] = []
  for (const input of inputs) {
    if (!input.path.startsWith(".agentdev/extensions/")) continue
    const source = index.nodeByPath.get(input.path)
    if (source === undefined || !source.startsWith("extension:")) continue
    const parts = input.path.split("/")
    const subject = parts[2]
    const name = parts.at(-1)?.replace(/\.ya?ml$/, "")
    if (subject === undefined || name === undefined) continue
    const targetType = subject === "commands" ? "command" : "skill"
    const target = index.aliases.get(`${targetType}:${name}`)
    if (target === undefined) continue
    const line = input.content.split(/\r?\n/).findIndex((candidate) => candidate.startsWith("id:")) + 1
    const safeLine = line > 0 ? line : 1
    const f = { key: "extension_path", values: [name], line: safeLine, text: input.path }
    seeds.push({ type: "extends", category: "derived", source, target, input, field: f, rule: "extension_field" })
  }
  return seeds
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
      diagnostics.push(unresolved(root, input, f, link.target))
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
  const seeds: EdgeSeed[] = [...containmentSeeds(inputs, index, config), ...extensionSeeds(inputs, index, config)]
  const diagnostics: Diagnostic[] = []

  for (const input of inputs) {
    const structured = structuredSeeds(root, input, index, fieldMap)
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
