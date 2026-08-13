// Bounded docs-path extractor for the distribution boundary detector.
//
// Extracted from boundary-candidate-model.ts so the path lexer is
// independently testable and the candidate-model stays under the 250
// pure LOC ceiling. One responsibility: turn a line into docs-path
// candidate spans whose concrete evidence terminates at an actual `.md`
// endpoint.
//
// Lexing contract (fresh-review blocker D4 + D5):
//   - Standalone left boundary: `docs` must NOT be preceded by an
//     identifier char (`[A-Za-z0-9_-]`) or a path separator (`/`, `\`).
//     Identifier predecessors reject `mydocs`; separator predecessors
//     reject `docs` inside a URL/host path (the URL owns the region).
//   - One-or-more mixed separators after `docs` and after the family
//     name: `/`, `\`, `%2F` (case-insensitive on the hex digit).
//   - Directory family names are case-sensitive: `adr | requirements |
//     specs | decisions`. `Requirements` and `SPECS` are NOT matched.
//   - Concrete evidence terminates at the actual `.md` endpoint. Query
//     (`?`), fragment (`#`), and terminal punctuation (`,`, `;`, `:`,
//     Japanese `。`, `、`, etc.) terminate the path scan BEFORE `.md`,
//     so the matched path ends at `.md`. A trailing `.` (sentence-final)
//     is recognized when it is the only thing after `.md` and is not
//     followed by an alphanumeric path-valid char (so `foo.md.` and
//     `foo.md.,` truncate to `foo.md`, but `foo.md.bak` does not match
//     because `.bak` is a continuation).
//   - `.md.bak` is therefore NOT emitted: there is no `.md` endpoint
//     whose suffix is empty or all terminal-period (`.`) chars.
//
// Side-effect-free: pure over inputs.

import type { Span } from "./boundary-candidate-ownership.ts";

const DOCS_FAMILIES: readonly string[] = ["adr", "requirements", "specs", "decisions"];
const PATH_STOP_CHAR = /[\s)\]\|"'`<>{},;:#?!。 、！]/;

export interface ExtractedPath {
  readonly value: string;
  readonly span: Span;
}

/**
 * Scan one or more mixed separators starting at `pos`. Returns the new
 * position; identical to `pos` when no separator is present.
 */
function scanSeparators(line: string, pos: number): number {
  let p = pos;
  while (p < line.length) {
    const c = line.charAt(p);
    if (c === "/" || c === "\\") { p += 1; continue; }
    if (c === "%" && p + 2 < line.length) {
      const c1 = line.charAt(p + 1);
      const c2 = line.charAt(p + 2);
      if (c1 === "2" && (c2 === "F" || c2 === "f")) { p += 3; continue; }
      if (c1 === "5" && (c2 === "C" || c2 === "c")) { p += 3; continue; }
    }
    break;
  }
  return p;
}

/** Case-sensitive family match at `pos`, or null. */
function matchFamily(line: string, pos: number): string | null {
  for (const family of DOCS_FAMILIES) {
    if (line.length - pos >= family.length && line.startsWith(family, pos)) {
      return family;
    }
  }
  return null;
}

/**
 * Find the `.md` endpoint in the path-content string, returning its
 * starting index, or -1 when none. The endpoint is the LATEST `.md`
 * whose suffix is empty OR consists solely of `.` chars (sentence-final
 * periods). `.md.bak` does not qualify (suffix `.bak` is not all `.`).
 */
function findMdEndpoint(content: string): number {
  const positions: number[] = [];
  let idx = content.indexOf(".md");
  while (idx >= 0) {
    positions.push(idx);
    idx = content.indexOf(".md", idx + 1);
  }
  for (let i = positions.length - 1; i >= 0; i--) {
    const pos = positions[i];
    if (pos === undefined) continue;
    const after = content.substring(pos + 3);
    if (after.length === 0 || /^[.]*$/.test(after)) return pos;
  }
  return -1;
}

/**
 * Left-boundary character set for the `docs` token. Includes ASCII
 * whitespace/punctuation, CJK punctuation that also terminates URL
 * scans (URL_STOP_CHAR parity), and Markdown/URL delimiters (( [ = &).
 * Excludes path separators (/, \) and ASCII dot so they fall through to
 * the dot-segment normalization scanner.
 */
const LEFT_BOUNDARY = /[\s(),;:#?!"'`<>{}|[\]=&\u3001\u3002\uFF01\uFF1A\uFF1B\uFF0C\uFF1F\u2014]/;

/**
 * Validate that the text preceding `docs` forms a relative path prefix
 * that resolves to `docs` after dot-segment normalization. Accepts docs
 * at position 0, after a plain boundary char, or after a prefix whose
 * dot-segments collapse to empty (e.g. ./ ../ x/../). Rejects absolute
 * paths (/docs, \docs, %2Fdocs), hostname form (.docs, mydocs), and
 * prefixes that do not resolve to docs (a/docs).
 */
function isValidRelativePrefix(line: string, pos: number): boolean {
  if (pos === 0) return true;
  const beforeDocs = line.charAt(pos - 1);
  if (LEFT_BOUNDARY.test(beforeDocs)) return true;
  return prefixResolvesToDocs(line, pos);
}

/**
 * Path separators for splitting the prefix into segments.
 * Matches /, \, %2F, %2f, %5C, %5c.
 */
const SEPARATOR_RE = /\/|\\|%2[fF]|%5[cC]/;

/**
 * Backward path-normalization scanner. Collects the prefix between the
 * leftmost boundary char (or line start) and `docs`, splits on path
 * separators, and reduces dot-segments:
 *   "."  -> skip (no-op)
 *   ".." -> cancel the previous normal segment, or accumulate as leading
 *   else -> push as a normal identifier segment
 * Accepts when no normal identifier remains (prefix resolves to docs).
 * Rejects absolute paths (prefix begins with a separator), hostname
 * concatenation (char before `docs` is not a separator), and prefixes
 * where a normal identifier survives normalization.
 */
function prefixResolvesToDocs(line: string, pos: number): boolean {
  if (matchSeparatorBackward(line, pos - 1) === 0) return false;

  let p = pos - 1;
  while (p >= 0) {
    const sepLen = matchSeparatorBackward(line, p);
    if (sepLen > 0) { p -= sepLen; continue; }
    if (LEFT_BOUNDARY.test(line.charAt(p))) break;
    p -= 1;
  }
  const prefixStart = p + 1;

  if (prefixStart < pos && scanSeparators(line, prefixStart) > prefixStart) return false;

  const prefix = line.substring(prefixStart, pos);
  const stack: string[] = [];
  for (const seg of prefix.split(SEPARATOR_RE)) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") {
      const top = stack.length > 0 ? stack[stack.length - 1] : null;
      if (top !== null && top !== "..") stack.pop();
      else stack.push("..");
      continue;
    }
    stack.push(seg);
  }
  return stack.every((s) => s === "..");
}

/**
 * Match a separator at position `p` scanning backward.
 * Returns the length of the separator matched (1-3 chars), or 0 if no match.
 * Recognizes: /, \, %2F, %2f, %5C, %5c
 */
function matchSeparatorBackward(line: string, p: number): number {
  if (p < 0) return 0;

  const c = line.charAt(p);
  if (c === '/' || c === '\\') {
    return 1;
  }

  if (p >= 2) {
    const c1 = line.charAt(p - 1);
    const c2 = line.charAt(p - 2);
    if (c2 === '%' && ((c1 === '2' && (c === 'F' || c === 'f')) || (c1 === '5' && (c === 'C' || c === 'c')))) {
      return 3;
    }
  }

  return 0;
}

/**
 * Scan a line for docs-path candidates. Returns at most `cap` entries;
 * the boolean `overflow` flag is set when the cap is reached mid-scan
 * (caller MUST surface a typed overflow; ownership never suppresses it).
 *
 * Each emitted path's value terminates exactly at `.md` (no trailing
 * query/fragment/punctuation).
 *
 * @param ownerSpans - Optional readonly array of owner spans. A docs-path
 * candidate fully contained by ANY owner span is skipped BEFORE the cap
 * check. Default is an empty array for backward compatibility.
 */
export function extractDocsPaths(
  line: string,
  cap: number,
  ownerSpans: readonly Span[] = [],
): {
  readonly paths: readonly ExtractedPath[];
  readonly overflow: boolean;
} {
  const out: ExtractedPath[] = [];
  let searchFrom = 0;
  while (true) {
    const docsIdx = line.indexOf("docs", searchFrom);
    if (docsIdx < 0) break;
    searchFrom = docsIdx + 1;
    // Left boundary: accept only valid relative dot-segment prefixes or docs at start.
    // Reject: a/../docs, .docs, /docs, identifiers before separators.
    if (!isValidRelativePrefix(line, docsIdx)) continue;
    // After `docs`, expect one or more separators.
    let pos = scanSeparators(line, docsIdx + 4);
    if (pos === docsIdx + 4) continue;
    // Then family (case-sensitive).
    const family = matchFamily(line, pos);
    if (family === null) continue;
    pos += family.length;
    // Then one or more separators.
    const afterFamily = pos;
    pos = scanSeparators(line, pos);
    if (pos === afterFamily) continue;
    // Then path content until a lexical endpoint. Backslashes, percent
    // encoding, and non-ASCII filename characters remain part of the path.
    const contentStart = pos;
    while (pos < line.length && !PATH_STOP_CHAR.test(line.charAt(pos))) pos += 1;
    const content = line.substring(contentStart, pos);
    // Concrete .md endpoint must exist in content.
    const mdIdx = findMdEndpoint(content);
    if (mdIdx < 0) continue;
    const pathEnd = contentStart + mdIdx + 3; // 3 = ".md".length
    const candidateSpan: Span = { start: docsIdx, end: pathEnd };

    // Skip candidates fully contained by any owner span BEFORE cap check.
    if (isFullyContained(candidateSpan, ownerSpans)) continue;

    if (out.length >= cap) return { paths: out, overflow: true };
    out.push({ value: line.substring(docsIdx, pathEnd), span: candidateSpan });
  }
  return { paths: out, overflow: false };
}

/**
 * True when `inner` is fully contained by ANY span in `keepers`.
 * Uses half-open [start, end) bounds: containment requires
 * keeper.start <= inner.start AND inner.end <= keeper.end.
 */
function isFullyContained(inner: Span, keepers: readonly Span[]): boolean {
  for (const keeper of keepers) {
    if (keeper.start <= inner.start && inner.end <= keeper.end) return true;
  }
  return false;
}
