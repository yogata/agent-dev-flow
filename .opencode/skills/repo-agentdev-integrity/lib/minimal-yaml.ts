// ADF-COVERS(implementation): REQ-047-010
// Deterministic YAML-subset parser used as the Bun-independent fallback for
// loading canonical detection-definition YAML.
//
// Why this exists: the canonical YAML load path calls Bun.YAML.parse, which
// only exists under the Bun runtime. The checker standard execution route is
// module import via `node --experimental-strip-types`
// (docs/designs/integrity/checker-execution-contracts.md), where `Bun` is
// undefined and its ReferenceError used to surface as
// "fail-closed: distribution targets file is not valid YAML" even though the
// definition file was present and valid (REQ-047-010 warning noise).
//
// Scope: the subset covers the constructs used by the canonical definition
// YAML (comments, nested mappings, block sequences, sequence items that are
// mappings, literal blocks `|`/`|-`, quoted/plain scalars). Anything else
// (anchors, aliases, flow collections, multi-document, tabs) throws so the
// caller keeps failing closed instead of silently mis-parsing. Equivalence
// with Bun.YAML.parse on the real canonical file is enforced by
// scripts/minimal_yaml_drift.test.ts (bun runtime sees both parsers).

export type YamlScalar = string | number | boolean | null;
export type YamlValue = YamlScalar | { [key: string]: YamlValue } | YamlValue[];

interface Line {
  readonly indent: number;
  readonly text: string;
}

function fail(message: string): never {
  throw new Error(`minimal-yaml: ${message}`);
}

// Strip a trailing comment from a line, honoring quoted sections.
function stripComment(text: string): string {
  let quote: string | null = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (quote !== null) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "#" && (i === 0 || /\s/.test(text[i - 1]!))) {
      return text.slice(0, i).trimEnd();
    }
  }
  return text.trimEnd();
}

function splitKey(text: string): { key: string; rest: string } {
  if (text.startsWith('"') || text.startsWith("'")) {
    const quote = text[0]!;
    for (let i = 1; i < text.length; i++) {
      if (text[i] === "\\") i++;
      else if (text[i] === quote) {
        const after = text.slice(i + 1);
        if (!after.startsWith(":")) fail(`expected ':' after quoted key: ${text}`);
        return { key: text.slice(1, i), rest: after.slice(1) };
      }
    }
    return fail(`unterminated quoted key: ${text}`);
  }
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ":" && (i === text.length - 1 || text[i + 1] === " ")) {
      return { key: text.slice(0, i).trim(), rest: text.slice(i + 1) };
    }
  }
  return fail(`expected 'key:' mapping entry: ${text}`);
}

function isMappingEntry(text: string): boolean {
  if (text.startsWith('"') || text.startsWith("'")) {
    const quote = text[0]!;
    for (let i = 1; i < text.length; i++) {
      if (text[i] === "\\") i++;
      else if (text[i] === quote) return text.slice(i + 1).startsWith(":");
    }
    return false;
  }
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ":" && (i === text.length - 1 || text[i + 1] === " ")) return true;
  }
  return false;
}

function parseScalar(raw: string): YamlScalar {
  const text = raw.trim();
  if (text.length === 0) return null;
  if (text.startsWith('"') || text.startsWith("'")) {
    const quote = text[0]!;
    if (text.length < 2 || !text.endsWith(quote)) fail(`unterminated quoted scalar: ${text}`);
    const inner = text.slice(1, -1);
    if (quote === "'") return inner.replace(/''/g, "'");
    return inner.replace(/\\(.)/g, "$1");
  }
  if (text === "null" || text === "~") return null;
  if (text === "true") return true;
  if (text === "false") return false;
  if (/^[+-]?\d+$/.test(text)) return Number(text);
  if (/^[+-]?\d*\.\d+([eE][+-]?\d+)?$/.test(text)) return Number(text);
  if (/^[&*!?]/.test(text)) fail(`unsupported YAML construct: ${text}`);
  if (text.startsWith("{") || text.startsWith("[")) {
    fail(`flow collections are not supported: ${text}`);
  }
  if (text === "---" || text === "...") fail(`multi-document YAML is not supported: ${text}`);
  return text;
}

function toLines(input: string): Line[] {
  const normalized = input.replace(/\r\n?/g, "\n");
  if (normalized.includes("\t")) fail("tab characters are not supported");
  const out: Line[] = [];
  for (const rawLine of normalized.split("\n")) {
    const text = stripComment(rawLine);
    if (text.trim().length === 0) continue;
    out.push({ indent: text.length - text.trimStart().length, text: text.trimStart() });
  }
  return out;
}

// Literal block scalar (| clip keeps one trailing newline, |- strips it).
function blockScalar(
  lines: readonly Line[],
  start: number,
  strip: boolean,
): { value: string; next: number } {
  const baseIndent = lines[start]!.indent;
  const parts: string[] = [];
  let i = start;
  while (i < lines.length && lines[i]!.indent >= baseIndent) {
    const line = lines[i]!;
    parts.push(" ".repeat(line.indent - baseIndent) + line.text);
    i++;
  }
  let value = parts.join("\n");
  if (!strip) value += "\n";
  return { value, next: i };
}

function parseNode(
  lines: readonly Line[],
  start: number,
  indent: number,
): { value: YamlValue; next: number } {
  const line = lines[start]!;
  if (line.text === "-" || line.text.startsWith("- ")) {
    return parseSequence(lines, start, indent);
  }
  if (isMappingEntry(line.text)) {
    return parseMapping(lines, start, indent);
  }
  return { value: parseScalar(line.text), next: start + 1 };
}

function parseMapping(
  lines: readonly Line[],
  start: number,
  indent: number,
): { value: { [key: string]: YamlValue }; next: number } {
  const out: { [key: string]: YamlValue } = {};
  let i = start;
  while (i < lines.length) {
    const line = lines[i]!;
    if (line.indent < indent) break;
    if (line.indent > indent) fail(`unexpected indentation: ${line.text}`);
    if (line.text === "-" || line.text.startsWith("- ")) break;
    const { key, rest } = splitKey(line.text);
    const valueRest = rest.trim();
    if (valueRest === "|" || valueRest === "|-") {
      if (i + 1 < lines.length && lines[i + 1]!.indent > indent) {
        const block = blockScalar(lines, i + 1, valueRest === "|-");
        out[key] = block.value;
        i = block.next;
      } else {
        out[key] = "";
        i++;
      }
      continue;
    }
    const nextLine = i + 1 < lines.length ? lines[i + 1]! : null;
    if (valueRest.length === 0 && nextLine !== null && nextLine.indent > indent) {
      const child = parseNode(lines, i + 1, nextLine.indent);
      out[key] = child.value;
      i = child.next;
      continue;
    }
    if (
      valueRest.length === 0 &&
      nextLine !== null &&
      nextLine.indent === indent &&
      (nextLine.text === "-" || nextLine.text.startsWith("- "))
    ) {
      const child = parseSequence(lines, i + 1, indent);
      out[key] = child.value;
      i = child.next;
      continue;
    }
    out[key] = valueRest.length === 0 ? null : parseScalar(valueRest);
    i++;
  }
  return { value: out, next: i };
}

function parseSequence(
  lines: readonly Line[],
  start: number,
  indent: number,
): { value: YamlValue[]; next: number } {
  const out: YamlValue[] = [];
  let i = start;
  while (i < lines.length) {
    const line = lines[i]!;
    if (line.indent !== indent || !(line.text === "-" || line.text.startsWith("- "))) {
      if (line.indent > indent) fail(`unexpected indentation: ${line.text}`);
      break;
    }
    const dashLen = line.text === "-" ? 1 : 2;
    const item = line.text.slice(dashLen).trim();
    const itemIndent = indent + dashLen;
    if (item.length === 0) {
      if (i + 1 < lines.length && lines[i + 1]!.indent > indent) {
        const child = parseNode(lines, i + 1, lines[i + 1]!.indent);
        out.push(child.value);
        i = child.next;
      } else {
        out.push(null);
        i++;
      }
      continue;
    }
    if (isMappingEntry(item)) {
      // Item is a mapping: first key is inline after "- ", remaining keys
      // follow on lines indented deeper than the sequence indent.
      const sub: Line[] = [{ indent: itemIndent, text: item }];
      let j = i + 1;
      while (j < lines.length && lines[j]!.indent > indent) {
        sub.push(lines[j]!);
        j++;
      }
      const mapping = parseMapping(sub, 0, itemIndent);
      out.push(mapping.value);
      i = j;
      continue;
    }
    out.push(parseScalar(item));
    i++;
  }
  return { value: out, next: i };
}

// Parse a YAML document restricted to the canonical-definition subset.
// Throws (never returns a guessed value) on any construct outside the
// subset so callers keep their fail-closed contract.
export function parseMinimalYaml(input: string): YamlValue {
  const lines = toLines(input);
  if (lines.length === 0) return null;
  if (lines[0]!.indent !== 0) fail(`first line must not be indented: ${lines[0]!.text}`);
  const parsed = parseNode(lines, 0, 0);
  if (parsed.next !== lines.length) {
    fail(`unexpected content after document: ${lines[parsed.next]!.text}`);
  }
  return parsed.value;
}
