export type ParsedField = {
  readonly key: string
  readonly values: readonly string[]
  readonly line: number
  readonly text: string
}

export type MarkdownLink = {
  readonly label: string
  readonly target: string
  readonly line: number
  readonly text: string
  readonly heading: string
}

function stripQuotes(value: string): string {
  const trimmed = value.trim()
  if (trimmed.length >= 2) {
    const first = trimmed[0]
    const last = trimmed.at(-1)
    if ((first === "\"" || first === "'") && first === last) return trimmed.slice(1, -1)
  }
  return trimmed
}

function parseValues(value: string): readonly string[] {
  const stripped = stripQuotes(value)
  if (stripped.startsWith("[") && stripped.endsWith("]")) {
    return stripped.slice(1, -1).split(",").map(stripQuotes).filter(Boolean)
  }
  return stripped.length > 0 ? [stripped] : []
}

export function parseFrontmatter(content: string): readonly ParsedField[] {
  const lines = content.split(/\r?\n/)
  if (lines[0] !== "---") return []
  const fields: ParsedField[] = []
  let current: { readonly key: string; readonly line: number; readonly text: string; readonly values: string[] } | undefined
  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index]
    if (line === undefined || line === "---") break
    const listMatch = /^\s*-\s+(.+)$/.exec(line)
    if (listMatch?.[1] !== undefined && current !== undefined) {
      current.values.push(stripQuotes(listMatch[1]))
      continue
    }
    const match = /^([A-Za-z_][A-Za-z0-9_.-]*):\s*(.*)$/.exec(line)
    if (match?.[1] === undefined || match[2] === undefined) continue
    if (current !== undefined) fields.push(current)
    current = {
      key: match[1],
      line: index + 1,
      text: line,
      values: [...parseValues(match[2])],
    }
  }
  if (current !== undefined) fields.push(current)
  return fields
}

export function parseExtensionFields(content: string): readonly ParsedField[] {
  const lines = content.split(/\r?\n/)
  const fields: ParsedField[] = []
  const parents = new Map<number, string>()
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (line === undefined || line.trim().length === 0 || line.trimStart().startsWith("#")) continue
    const indent = line.length - line.trimStart().length
    const listMatch = /^\s*-\s+(.+)$/.exec(line)
    if (listMatch?.[1] !== undefined) {
      const parent = parents.get(indent - 2)
      if (parent !== undefined) {
        fields.push({ key: parent, values: [stripQuotes(listMatch[1])], line: index + 1, text: line })
      }
      continue
    }
    const match = /^\s*([A-Za-z_][A-Za-z0-9_.-]*):\s*(.*)$/.exec(line)
    if (match?.[1] === undefined || match[2] === undefined) continue
    const parent = parents.get(indent - 2)
    const key = parent === undefined ? match[1] : `${parent}.${match[1]}`
    for (const depth of [...parents.keys()]) {
      if (depth >= indent) parents.delete(depth)
    }
    if (match[2].trim().length === 0) {
      parents.set(indent, key)
      continue
    }
    fields.push({ key, values: parseValues(match[2]), line: index + 1, text: line })
  }
  return fields
}

export function headingAt(content: string, targetLine: number): string {
  const lines = content.split(/\r?\n/)
  let heading = ""
  for (let index = 0; index < Math.min(targetLine, lines.length); index += 1) {
    const match = /^#{1,6}\s+(.+)$/.exec(lines[index] ?? "")
    if (match?.[1] !== undefined) heading = match[1].trim()
  }
  return heading
}

export function extractMarkdownLinks(content: string): readonly MarkdownLink[] {
  const lines = content.split(/\r?\n/)
  const links: MarkdownLink[] = []
  let inFence = false
  let heading = ""
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? ""
    if (/^\s*```/.test(line)) {
      inFence = !inFence
      continue
    }
    const headingMatch = /^#{1,6}\s+(.+)$/.exec(line)
    if (headingMatch?.[1] !== undefined) heading = headingMatch[1].trim()
    if (inFence) continue
    const searchable = line.replace(/`[^`]*`/g, "")
    for (const match of searchable.matchAll(/\[([^\]]*)\]\(([^)\s]+)(?:\s+[^)]*)?\)/g)) {
      const label = match[1]
      const target = match[2]
      if (label !== undefined && target !== undefined) {
        links.push({ label, target, line: index + 1, text: match[0], heading })
      }
    }
  }
  return links
}

export function firstHeading(content: string): string {
  for (const line of content.split(/\r?\n/)) {
    const match = /^#\s+(.+)$/.exec(line)
    if (match?.[1] !== undefined) return match[1].trim()
  }
  return ""
}
