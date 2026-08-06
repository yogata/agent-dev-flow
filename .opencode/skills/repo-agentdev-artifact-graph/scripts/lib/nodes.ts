import { basename } from "node:path"
import type { GraphNode, InputFile, NodeType, Provenance } from "./model.ts"
import { firstHeading, headingAt, parseExtensionFields, parseFrontmatter, type ParsedField } from "./parse.ts"
import { makeProvenance } from "./provenance.ts"

export type NodeIndex = {
  readonly nodes: readonly GraphNode[]
  readonly provenance: readonly Provenance[]
  readonly aliases: ReadonlyMap<string, string>
  readonly nodeByPath: ReadonlyMap<string, string>
}

type ArtifactIdentity = {
  readonly type: Exclude<NodeType, "source_file">
  readonly id: string
  readonly label: string
  readonly status?: string | undefined
  readonly field?: ParsedField | undefined
  readonly extractionRule: "frontmatter" | "extension_field"
}

function field(fields: readonly ParsedField[], key: string): ParsedField | undefined {
  return fields.find((candidate) => candidate.key === key)
}

function stem(path: string): string {
  return basename(path).replace(/\.[^.]+$/, "")
}

function identifyArtifact(input: InputFile): ArtifactIdentity | undefined {
  const frontmatter = parseFrontmatter(input.content)
  const identifier = field(frontmatter, "id")
  const title = field(frontmatter, "title")?.values[0] ?? (firstHeading(input.content) || stem(input.path))
  const status = field(frontmatter, "status")?.values[0]
  const requirement = /^docs\/requirements\/(REQ-\d+)\.md$/.exec(input.path)
  if (requirement?.[1] !== undefined) {
    return { type: "requirement", id: `requirement:${requirement[1]}`, label: title, status, field: identifier, extractionRule: "frontmatter" }
  }
  const adr = /^docs\/adr\/(?:retired\/)?(ADR-\d+)\.md$/.exec(input.path)
  if (adr?.[1] !== undefined) {
    return { type: "adr", id: `adr:${adr[1]}`, label: title, status, field: identifier, extractionRule: "frontmatter" }
  }
  const rule = /^docs\/specs\/integrity\/rules\/(IR-\d+)[^/]*\.md$/.exec(input.path)
  if (rule?.[1] !== undefined) {
    return { type: "integrity_rule", id: `integrity_rule:${rule[1]}`, label: title, status, field: identifier, extractionRule: "frontmatter" }
  }
  if (input.path.startsWith("docs/specs/") && input.path.endsWith(".md") && !input.path.endsWith("/README.md")) {
    return { type: "specification", id: `specification:${input.path}`, label: title, status, field: title === undefined ? undefined : field(frontmatter, "title"), extractionRule: "frontmatter" }
  }
  const command = /^src\/opencode\/commands\/agentdev\/([^/]+)\.md$/.exec(input.path)
  if (command?.[1] !== undefined && command[1] !== "README") {
    return { type: "command", id: `command:${command[1]}`, label: command[1], field: field(frontmatter, "description"), extractionRule: "frontmatter" }
  }
  const skill = /^(?:src\/opencode|\.opencode)\/skills\/([^/]+)\/SKILL\.md$/.exec(input.path)
  if (skill?.[1] !== undefined) {
    const name = field(frontmatter, "name")?.values[0] ?? skill[1]
    return { type: "skill", id: `skill:${name}`, label: name, field: field(frontmatter, "name"), extractionRule: "frontmatter" }
  }
  if (input.path.startsWith(".agentdev/extensions/") && /\.ya?ml$/.test(input.path)) {
    const extensionFields = parseExtensionFields(input.content)
    const idField = field(extensionFields, "id")
    const id = idField?.values[0] ?? input.path
    return { type: "extension", id: `extension:${id}`, label: id, field: idField, extractionRule: "extension_field" }
  }
  return undefined
}

function addAlias(aliases: Map<string, string>, alias: string, id: string): void {
  if (alias.length > 0 && !aliases.has(alias)) aliases.set(alias, id)
}

export function extractNodes(inputs: readonly InputFile[]): NodeIndex {
  const nodes: GraphNode[] = []
  const provenance: Provenance[] = []
  const aliases = new Map<string, string>()
  const nodeByPath = new Map<string, string>()
  for (const input of inputs) {
    const sourceProvenance = makeProvenance({
      path: input.path, heading: "", elementId: "file", matchedText: input.path,
      lineStart: 1, lineEnd: 1, extractionRule: "filesystem",
    })
    const sourceId = `source_file:${input.path}`
    nodes.push({ id: sourceId, type: "source_file", label: input.path, provenance_id: sourceProvenance.id })
    provenance.push(sourceProvenance)
    nodeByPath.set(input.path, sourceId)
    addAlias(aliases, input.path, sourceId)

    const artifact = identifyArtifact(input)
    if (artifact === undefined) continue
    const line = artifact.field?.line ?? 1
    const matchedText = artifact.field?.text ?? input.content.split(/\r?\n/)[0] ?? input.path
    const artifactProvenance = makeProvenance({
      path: input.path,
      heading: headingAt(input.content, line),
      elementId: artifact.field === undefined ? "file" : `field:${artifact.field.key}`,
      matchedText,
      lineStart: line,
      lineEnd: line,
      extractionRule: artifact.extractionRule,
    })
    const node: GraphNode = artifact.status === undefined
      ? { id: artifact.id, type: artifact.type, label: artifact.label, provenance_id: artifactProvenance.id }
      : { id: artifact.id, type: artifact.type, label: artifact.label, status: artifact.status, provenance_id: artifactProvenance.id }
    nodes.push(node)
    provenance.push(artifactProvenance)
    nodeByPath.set(input.path, artifact.id)
    addAlias(aliases, artifact.id, artifact.id)
    aliases.set(input.path, artifact.id)
    addAlias(aliases, basename(input.path), artifact.id)
    addAlias(aliases, stem(input.path), artifact.id)
    addAlias(aliases, artifact.label, artifact.id)
    const idValue = artifact.field?.values[0]
    if (idValue !== undefined) addAlias(aliases, idValue, artifact.id)
    if (artifact.type === "specification") addAlias(aliases, basename(input.path), artifact.id)
  }
  return {
    nodes: nodes.sort((left, right) => left.id.localeCompare(right.id)),
    provenance: provenance.sort((left, right) => left.id.localeCompare(right.id)),
    aliases,
    nodeByPath,
  }
}
