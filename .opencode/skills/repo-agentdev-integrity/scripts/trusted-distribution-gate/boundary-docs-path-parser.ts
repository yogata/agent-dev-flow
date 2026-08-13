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
 * Strict grammar check for relative path prefix: (("."|"..") separator)+
 * where separator is /, \, %2F, %2f, %5C, or %5c.
 * Accepts empty prefix (docs at line start or after a plain boundary char).
 * Rejects: .../docs, ..../docs, %2Fdocs (no dot), a/../docs (identifier prefix),
 * /docs, \docs (absolute paths).
 */
function isValidRelativePrefix(line: string, pos: number): boolean {
  if (pos === 0) return true;

  const beforeDocs = line.charAt(pos - 1);
  if (/[\s)\]\|'"`<>{},;:#?!。 、！]/.test(beforeDocs)) {
    return true;
  }
  if (/\(/.test(beforeDocs) || /\[/.test(beforeDocs) || /=/.test(beforeDocs) || /&/.test(beforeDocs)) {
    return true;
  }

  return parseRelativePrefix(line, pos);
}

/**
 * Parse the strict relative path prefix grammar:
 * (("."|"..") separator+)+ scanning backwards from `pos`.
 * Consecutive separators (e.g. /\) are allowed between dot-segments.
 * Returns true when the grammar matches.
 */
function parseRelativePrefix(line: string, pos: number): boolean {
  let p = pos - 1;
  let hasValidPair = false;

  while (p >= 0) {
    // Consume one or more consecutive separators.
    let separatorLen = matchSeparatorBackward(line, p);
    if (separatorLen === 0) break;

    while (separatorLen > 0) {
      p -= separatorLen;
      separatorLen = p >= 0 ? matchSeparatorBackward(line, p) : 0;
    }

    if (p < 0) break;

    const dotSegment = matchDotSegmentBackward(line, p);
    if (dotSegment === 0) break;

    p -= dotSegment;
    hasValidPair = true;

    if (p < 0) break;

    const beforePattern = line.charAt(p);
    if (/[\s(\[]/.test(beforePattern) || /=/.test(beforePattern) || /&/.test(beforePattern)) {
      break;
    }

    if (matchSeparatorBackward(line, p) > 0) {
      continue;
    }

    break;
  }

  if (!hasValidPair) return false;

  if (p < 0) return true;

  const beforePattern = line.charAt(p);
  if (/[\s(\[]/.test(beforePattern) || /=/.test(beforePattern) || /&/.test(beforePattern)) {
    return true;
  }

  return false;
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
 * Match a dot-segment (.) or (..) scanning backward.
 * Returns the length of the dot-segment matched (1 or 2), or 0 if no match.
 * Rejects ... and longer dot runs by only matching 1 or 2 dots.
 */
function matchDotSegmentBackward(line: string, p: number): number {
  if (p < 0) return 0;

  const c = line.charAt(p);
  if (c !== '.') return 0;

  if (p >= 1 && line.charAt(p - 1) === '.') {
    if (p >= 2 && line.charAt(p - 2) === '.') {
      return 0;
    }
    return 2;
  }

  return 1;
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
