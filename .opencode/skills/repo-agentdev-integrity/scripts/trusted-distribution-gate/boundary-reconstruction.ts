// Bounded lexical token reconstruction for evasion detection.
//
// Wrappers (`<`, `>`, `{`, `}`, `*`) and whitespace are token boundaries,
// never exemptions: an ID reconstructed from escape atoms is flagged even
// when the attacker wraps it in template-like markers. This module exists
// because the prior broad regex evasion match missed prefix escapes,
// suffix digit concatenation, and escaped hyphens while also flagging
// unrelated technical prose (byte 0x41, CPU-0xFF, etc.).
//
// Supported atoms inside a bounded token:
//   - literal `[A-Za-z0-9_-]`
//   - `\uXXXX`  exactly four hex digits (fixed width; decode to one UTF-16
//               code unit). The four-hex-digit contract is unconditional:
//               `\u00310` decodes to '1' and the trailing '0' is a literal,
//               reconstructing `ADR-10`. There is no digit-continuation
//               rejection.
//   - `\xXX`    exactly two hex digits (decode to one byte char)
//   - `0[xX]HH` exactly two hex digits in ASCII digit range (0x30..0x39)
//               and NOT part of a longer hex run; decodes to the digit char.
//               `0[xX]31` decodes to '1'; `0[xX]3F`, `0[xX]41`, `0[xX]FF`,
//               `0[xX]FFFFFF` do NOT match.
//
// Out-of-scope forms (`\u{XXXX}`, `\uXXXXXX` with 6 hex, malformed
// escapes) are left as literal text and produce no detection unless a
// normal direct ID is independently present.
//
// Bounding: the scan is capped at MAX_LINE_SCAN UTF-16 code units per line
// and MAX_IDS_PER_TOKEN reconstructed IDs per token. Either limit turning a
// typed overflow signal that the pipeline maps to a fail-closed candidate.
// Regex matching uses sticky (`y`) regexes against the full line so there is
// no per-character `substring(i)` allocation.

const BOUNDED_LITERAL = /[A-Za-z0-9_-]/;
// Sticky regexes: match must start exactly at lastIndex. No `^` anchor
// (sticky already pins the start); the four/two-hex-digit width is exact.
const U_ESCAPE = /\\u([0-9A-Fa-f]{4})/y;
const X_ESCAPE = /\\x([0-9A-Fa-f]{2})/y;
// `0[xX]HH` digit-reconstruction atom: case-insensitive `0x` prefix,
// exactly two hex digits, value in ASCII digit range (0x30..0x39), and
// not part of a longer hex run.
const HEX_DIGIT_ATOM = /0[xX](3[0-9])(?![0-9A-Fa-f])/y;
const ID_PATTERN = /\b([A-Z]{2,})-(\d{1,})\b/g;
const UTF_ENCODING_LABELS = new Set(["UTF-8", "UTF-16", "UTF-32"]);

// Per-token cap. Closing the exploit ("STEP-1\u0032-").repeat(16) +
// "\u0041DR-1": a single token cannot hide its 17th ID behind the cap.
// When the cap turns, a typed overflow propagates so the gate fails closed
// even if earlier reconstructed candidates are later deduped/owned.
const MAX_IDS_PER_TOKEN = 16;
// Scan budget: bounds per-line work to avoid O(n^2) blowup on pathological
// input. A line longer than this is scanned up to the limit and then
// signals line-scan-exceeded overflow (fail-closed). Exported so the
// pipeline entry and the gate share one authoritative cap.
export const MAX_LINE_SCAN = 65536;

interface DecodedAtom {
  readonly char: string;
  /** Source start index (inclusive) in the original line. */
  readonly srcStart: number;
  /** Source end index (exclusive). */
  readonly srcEnd: number;
  /** True when this atom was decoded from an escape (`\u`, `\x`, `0x`). */
  readonly fromEscape: boolean;
}

export interface ReconstructedId {
  /** Decoded concrete ID (e.g. "ADR-0001"). */
  readonly decoded: string;
  /** Minimal relevant source-form span (e.g. "\\u0041DR-0001"). */
  readonly original: string;
  /** Source start index (inclusive) of `original`. */
  readonly srcStart: number;
  /** Source end index (exclusive) of `original`. */
  readonly srcEnd: number;
}

/** Exhaustive reasons the reconstruction scan turned a typed overflow. */
export type ReconstructionOverflowReason =
  | "token-ids-exceeded"
  | "line-scan-exceeded";

export interface ReconstructionResult {
  readonly ids: readonly ReconstructedId[];
  readonly overflow: boolean;
  readonly overflowReason: ReconstructionOverflowReason | null;
}

interface BoundedToken {
  readonly atoms: readonly DecodedAtom[];
  /** Source chars consumed (start..start+length). */
  readonly length: number;
  readonly hasEscape: boolean;
}

function tokenizeBoundedToken(line: string, start: number, limit: number): BoundedToken | null {
  const atoms: DecodedAtom[] = [];
  let hasEscape = false;
  let i = start;
  while (i < limit) {
    U_ESCAPE.lastIndex = i;
    const u = U_ESCAPE.exec(line);
    if (u && u[0] !== undefined) {
      const code = parseInt(u[1] ?? "", 16);
      atoms.push({ char: String.fromCharCode(code), srcStart: i, srcEnd: i + u[0].length, fromEscape: true });
      hasEscape = true;
      i += u[0].length;
      continue;
    }

    X_ESCAPE.lastIndex = i;
    const x = X_ESCAPE.exec(line);
    if (x && x[0] !== undefined) {
      const code = parseInt(x[1] ?? "", 16);
      atoms.push({ char: String.fromCharCode(code), srcStart: i, srcEnd: i + x[0].length, fromEscape: true });
      hasEscape = true;
      i += x[0].length;
      continue;
    }

    HEX_DIGIT_ATOM.lastIndex = i;
    const h = HEX_DIGIT_ATOM.exec(line);
    if (h && h[1] !== undefined && h[0] !== undefined) {
      const pair = h[1];
      // 0[xX]3N -> digit char 'N' (ASCII 0x30..0x39 == '0'..'9')
      atoms.push({ char: pair.charAt(1), srcStart: i, srcEnd: i + h[0].length, fromEscape: true });
      hasEscape = true;
      i += h[0].length;
      continue;
    }

    const ch = line.charAt(i);
    if (BOUNDED_LITERAL.test(ch)) {
      atoms.push({ char: ch, srcStart: i, srcEnd: i + 1, fromEscape: false });
      i += 1;
      continue;
    }

    break;
  }
  if (atoms.length === 0) return null;
  return { atoms, length: i - start, hasEscape };
}

/**
 * Scan a line for bounded tokens that decode to expose concrete IDs. An ID
 * is emitted when its own decoded span includes an escape atom (ownEscape),
 * OR an escape atom creates the word boundary that exposes it on either
 * side — left (escape immediately before the ID) or right (escape
 * immediately after). Left and right escape-created boundaries are
 * symmetric. A literal ID that merely shares a token with an unrelated
 * escape is NOT emitted. UTF-8/16/32 encoding labels are never emitted as
 * reconstructed IDs (preserved exclusion). `matched`/`original` is the
 * minimal relevant source span, never the maximal token.
 *
 * Pure: same input always yields the same output. The typed overflow signal
 * MUST propagate to a fail-closed candidate even if the emitted ids are
 * later deduped or owned by the pipeline.
 */
export function detectReconstructedIds(line: string): ReconstructionResult {
  const ids: ReconstructedId[] = [];
  const limit = Math.min(line.length, MAX_LINE_SCAN);
  let i = 0;
  while (i < limit) {
    const token = tokenizeBoundedToken(line, i, limit);
    if (token === null) {
      i += 1;
      continue;
    }
    if (token.hasEscape) {
      const decoded = token.atoms.map((a) => a.char).join("");
      ID_PATTERN.lastIndex = 0;
      let m: RegExpExecArray | null;
      let emitted = 0;
      let tokenOverflow = false;
      while ((m = ID_PATTERN.exec(decoded)) !== null) {
        if (UTF_ENCODING_LABELS.has(m[0])) continue;
        const idStart = m.index;
        const idEnd = m.index + m[0].length;
        const startAtom = token.atoms.at(idStart);
        const endAtom = token.atoms.at(idEnd - 1);
        const leftAtom = idStart > 0 ? token.atoms.at(idStart - 1) : undefined;
        const rightAtom = token.atoms.at(idEnd);
        if (startAtom === undefined || endAtom === undefined) continue;
        const ownEscape = token.atoms.slice(idStart, idEnd).some((a) => a.fromEscape);
        const leftBoundary = leftAtom !== undefined && leftAtom.fromEscape;
        const rightBoundary = rightAtom !== undefined && rightAtom.fromEscape;
        if (!ownEscape && !leftBoundary && !rightBoundary) continue;
        if (emitted >= MAX_IDS_PER_TOKEN) { tokenOverflow = true; break; }
        let spanStart: number;
        let spanEnd: number;
        if (ownEscape) {
          spanStart = startAtom.srcStart;
          spanEnd = endAtom.srcEnd;
        } else if (leftBoundary) {
          spanStart = leftAtom?.srcStart ?? startAtom.srcStart;
          spanEnd = endAtom.srcEnd;
        } else {
          spanStart = startAtom.srcStart;
          spanEnd = rightAtom?.srcEnd ?? endAtom.srcEnd;
        }
        ids.push({
          decoded: m[0],
          original: line.substring(spanStart, spanEnd),
          srcStart: spanStart,
          srcEnd: spanEnd,
        });
        emitted += 1;
      }
      if (tokenOverflow) {
        return { ids, overflow: true, overflowReason: "token-ids-exceeded" };
      }
    }
    i += token.length;
  }
  if (line.length > MAX_LINE_SCAN) {
    return { ids, overflow: true, overflowReason: "line-scan-exceeded" };
  }
  return { ids, overflow: false, overflowReason: null };
}
