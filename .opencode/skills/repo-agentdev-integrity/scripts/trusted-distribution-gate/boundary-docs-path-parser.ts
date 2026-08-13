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
// Same CJK punctuation set as LEFT_BOUNDARY (U+FF1A, U+FF1B, U+FF0C,
// U+FF1F, U+2014): when these terminate a docs path's content, the scan
// must stop so the `.md` endpoint is recognized instead of leaking the
// path as `foo.md<fullwidth>end` (review-v8 blocker #1).
const PATH_STOP_CHAR = /[\s)\]\|"'`<>{},;:#?!。 、！\uFF1A\uFF1B\uFF0C\uFF1F\u2014]/;

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
 * Forward linear precompute of prefix validity for every docs candidate
 * position. prefixValid[i] is true iff a `docs` token at position i has
 * a valid relative prefix under the same grammar as the original
 * backward scanner: i === 0, OR the previous char is a LEFT_BOUNDARY,
 * OR the previous char is a path separator AND the current prefix
 * region (since the last LEFT_BOUNDARY) does not start with a separator
 * AND the dot-segment normalization of that prefix leaves zero
 * surviving normal segments.
 *
 * One forward pass maintains `normalCount` (surviving normal segments
 * after dot-segment reduction), `prefixStart` (start of the current
 * prefix region), and `prefixAbsolute` (whether the region begins with
 * a separator). Each docs candidate is answered in O(1) from this
 * state, giving O(line.length) total. Replaces the per-doc backward
 * scan that made extractDocsPaths O(n^2) on adversarial input such as
 * ("a/docs").repeat(n) (review-v8 blocker #4).
 */
function precomputePrefixValid(line: string): boolean[] {
  const prefixValid: boolean[] = new Array(line.length + 1).fill(false);
  prefixValid[0] = true;

  let normalCount = 0;
  let segBuf = "";
  let inSeg = false;
  let prefixStart = 0;
  let prefixAbsolute = false;

  let pos = 0;
  while (pos < line.length) {
    if (pos > 0) {
      const prevChar = line.charAt(pos - 1);
      if (LEFT_BOUNDARY.test(prevChar)) {
        prefixValid[pos] = true;
      } else {
        const sepLenBefore = matchSeparatorBackward(line, pos - 1);
        prefixValid[pos] = sepLenBefore > 0 && !prefixAbsolute && normalCount === 0;
      }
    }

    const c = line.charAt(pos);

    let sepLen = 0;
    if (c === "/" || c === "\\") {
      sepLen = 1;
    } else if (c === "%" && pos + 2 < line.length) {
      const c1 = line.charAt(pos + 1);
      const c2 = line.charAt(pos + 2);
      if ((c1 === "2" && (c2 === "F" || c2 === "f")) || (c1 === "5" && (c2 === "C" || c2 === "c"))) {
        sepLen = 3;
      }
    }

    if (sepLen > 0) {
      if (inSeg) {
        if (segBuf === "..") {
          if (normalCount > 0) normalCount -= 1;
        } else if (segBuf !== "." && segBuf !== "") {
          normalCount += 1;
        }
      }
      segBuf = "";
      inSeg = false;
      if (pos === prefixStart) prefixAbsolute = true;
      pos += sepLen;
    } else if (LEFT_BOUNDARY.test(c)) {
      normalCount = 0;
      segBuf = "";
      inSeg = false;
      prefixStart = pos + 1;
      prefixAbsolute = false;
      pos += 1;
    } else {
      segBuf += c;
      inSeg = true;
      pos += 1;
    }
  }

  return prefixValid;
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
  const prefixValid = precomputePrefixValid(line);
  let searchFrom = 0;
  while (true) {
    const docsIdx = line.indexOf("docs", searchFrom);
    if (docsIdx < 0) break;
    searchFrom = docsIdx + 1;
    // Left boundary: accept only valid relative dot-segment prefixes or docs at start.
    // Reject: a/../docs, .docs, /docs, identifiers before separators.
    if (!prefixValid[docsIdx]) continue;
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
