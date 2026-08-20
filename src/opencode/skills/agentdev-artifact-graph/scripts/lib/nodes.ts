import { basename } from "node:path"
import type { GraphNode, InputFile, Provenance } from "./model.ts"
import type { LabelSourceStep, NodeTypeRule, ResolvedConfig } from "./config.ts"
import { firstHeading, headingAt, parseFrontmatter, type ParsedField } from "./parse.ts"
import { makeProvenance } from "./provenance.ts"

export type NodeIndex = {
  readonly nodes: readonly GraphNode[]
  readonly provenance: readonly Provenance[]
  readonly aliases: ReadonlyMap<string, string>
  readonly nodeByPath: ReadonlyMap<string, string>
  readonly nodeTypeByName: ReadonlyMap<string, string>
}

type ExtractedIdentity = {
  readonly rule: NodeTypeRule
  readonly id: string
  readonly label: string
  readonly status: string | undefined
  readonly field: ParsedField | undefined
  readonly match: RegExpMatchArray
}

function field(fields: readonly ParsedField[], key: string): ParsedField | undefined {
  return fields.find((candidate) => candidate.key === key)
}

function stem(path: string): string {
  return basename(path).replace(/\.[^.]+$/, "")
}

function substituteTemplate(template: string, ctx: { path: string; match: RegExpMatchArray }): string {
  return template
    .replace(/\{path\}/g, ctx.path)
    .replace(/\{stem\}/g, stem(ctx.path))
    .replace(/\{match(\d+)\}/g, (_, n) => ctx.match[Number(n)] ?? "")
}

function resolveLabel(
  steps: readonly LabelSourceStep[],
  input: InputFile,
  frontmatter: readonly ParsedField[],
  match: RegExpMatchArray,
): string {
  for (const step of steps) {
    switch (step.kind) {
      case "frontmatter_field": {
        const f = field(frontmatter, step.field)
        if (f !== undefined && f.values.length > 0 && f.values[0] !== undefined && f.values[0].length > 0) {
          return f.values[0]
        }
        break
      }
      case "first_heading": {
        const h = firstHeading(input.content)
        if (h.length > 0) return h
        break
      }
      case "filename_stem": {
        const s = stem(input.path)
        if (s.length > 0) return s
        break
      }
      case "path_group": {
        const g = match[step.group]
        if (g !== undefined && g.length > 0) return g
        break
      }
      case "literal":
        return step.value
      case "path":
        return input.path
    }
  }
  return input.path
}

function extractIdentity(input: InputFile, rules: readonly NodeTypeRule[]): ExtractedIdentity | undefined {
  for (const rule of rules) {
    const match = new RegExp(rule.path_pattern).exec(input.path)
    if (match === null) continue
    const frontmatter = parseFrontmatter(input.content)
    const id = substituteTemplate(rule.id_template, { path: input.path, match })
    const label = resolveLabel(rule.label_source, input, frontmatter, match)
    const status = field(frontmatter, "status")?.values[0]
    const idField = rule.label_source.some((s) => s.kind === "frontmatter_field" && s.field === "id")
      ? field(frontmatter, "id")
      : undefined
    return { rule, id, label, status, field: idField, match }
  }
  return undefined
}

function addAlias(aliases: Map<string, string>, alias: string, id: string): void {
  if (alias.length > 0 && !aliases.has(alias)) aliases.set(alias, id)
}

export function extractNodes(inputs: readonly InputFile[], config: ResolvedConfig): NodeIndex {
  const nodes: GraphNode[] = []
  const provenance: Provenance[] = []
  const aliases = new Map<string, string>()
  const nodeByPath = new Map<string, string>()
  const nodeTypeByName = new Map<string, string>()
  const rules = config.node_type_rules

  // Source file nodes: generated for every input when source_file is in the
  // vocabulary (containment logic, REQ-{NNNN}-{NNN} self-hosting augmentation).
  // Enables defined_in/contains edges between artifact and source_file nodes.
  const hasSourceFileVocab = config.node_type_vocabulary.includes("source_file")
  if (hasSourceFileVocab) {
    for (const input of inputs) {
      const sourceProvenance = makeProvenance({
        path: input.path,
        heading: "",
        elementId: "file",
        matchedText: input.path,
        lineStart: 1,
        lineEnd: 1,
        extractionRule: "filesystem",
      })
      const sourceId = `source_file:${input.path}`
      nodes.push({
        id: sourceId,
        type: "source_file",
        label: input.path,
        provenance_id: sourceProvenance.id,
      })
      provenance.push(sourceProvenance)
      nodeByPath.set(input.path, sourceId)
      nodeTypeByName.set(sourceId, "source_file")
      addAlias(aliases, input.path, sourceId)
    }
  }

  for (const input of inputs) {
    const identity = extractIdentity(input, rules)
    if (identity === undefined) continue

    const frontmatter = parseFrontmatter(input.content)
    const line = identity.field?.line ?? 1
    const matchedText = identity.field?.text ?? input.content.split(/\r?\n/)[0] ?? input.path
    const artifactProvenance = makeProvenance({
      path: input.path,
      heading: headingAt(input.content, line),
      elementId: identity.field === undefined ? "file" : `field:${identity.field.key}`,
      matchedText,
      lineStart: line,
      lineEnd: line,
      extractionRule: identity.rule.extraction_rule,
    })

    const node: GraphNode = identity.status === undefined
      ? {
          id: identity.id,
          type: identity.rule.name,
          label: identity.label,
          provenance_id: artifactProvenance.id,
        }
      : {
          id: identity.id,
          type: identity.rule.name,
          label: identity.label,
          status: identity.status,
          provenance_id: artifactProvenance.id,
        }

    nodes.push(node)
    provenance.push(artifactProvenance)
    nodeByPath.set(input.path, identity.id)
    nodeTypeByName.set(identity.id, identity.rule.name)
    addAlias(aliases, identity.id, identity.id)
    aliases.set(input.path, identity.id)
    addAlias(aliases, basename(input.path), identity.id)
    addAlias(aliases, stem(input.path), identity.id)
    addAlias(aliases, identity.label, identity.id)
    const idValue = field(frontmatter, "id")?.values[0]
    if (idValue !== undefined) addAlias(aliases, idValue, identity.id)
    if (identity.rule.name === "design") addAlias(aliases, basename(input.path), identity.id)
  }

  return {
    nodes: nodes.sort((left, right) => left.id.localeCompare(right.id)),
    provenance: provenance.sort((left, right) => left.id.localeCompare(right.id)),
    aliases,
    nodeByPath,
    nodeTypeByName,
  }
}
