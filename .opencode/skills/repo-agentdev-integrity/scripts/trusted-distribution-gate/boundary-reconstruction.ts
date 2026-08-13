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
//   - `\uXXXX`  exactly four hex digits (decode to one UTF-16 code unit)
//   - `\xXX`    exactly two hex digits (decode to one byte char)
//   - `0[xX]HH` exactly two hex digits in ASCII digit range (0x30..0x39)
//               and NOT part of a longer hex run; decodes to the digit char.
//               `0[xX]31` decodes to '1'; `0[xX]3F`, `0[xX]41`, `0[xX]FF`,
//               `0[xX]FFFFFF` do NOT match.
//
// Out-of-scope forms (`\u{XXXX}`, `\uXXXXXX` with 6 hex, malformed
// escapes) are left as literal text and produce no detection unless a
// normal direct ID is independently present.

const BOUNDED_LITERAL = /[A-Za-z0-9_-]/;
const U_ESCAPE = /^\\u([0-9A-Fa-f]{4})/;
// `\xXX` is fixed width 2: consume exactly two hex digits regardless of what
// follows. A trailing hex char is a coincidental literal (e.g. the `D` in
// `\x41DR`), not a longer escape run.
const X_ESCAPE = /^\\x([0-9A-Fa-f]{2})/;
// `0[xX]HH` digit-reconstruction atom: case-insensitive `0x` prefix,
// exactly two hex digits, value in ASCII digit range (0x30..0x39), and
// not part of a longer hex run.
const HEX_DIGIT_ATOM = /^0[xX](3[0-9])(?![0-9A-Fa-f])/;
const HEX_DIGIT = /[0-9A-Fa-f]/;
const ID_PATTERN = /\b([A-Z]{2,})-(\d{1,})\b/g;
const MAX_IDS_PER_TOKEN = 16;

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

// `\uXXXX` exact-contract gate. A digit-valued escape (decodes to '0'..'9')
// immediately followed by another hex digit is a malformed digit-continuation
// run (e.g. `\u00310`); it is left as literal text and produces no decode.
// A non-digit-valued escape is always accepted, so `\u0041D` (decodes to 'A',
// followed by hex 'D') still decodes and reconstructs `\u0041DR-0001`.
function uEscapeAccepts(hex: string, line: string, escapeEnd: number): boolean {
  const decoded = String.fromCharCode(parseInt(hex, 16));
  if (decoded < "0" || decoded > "9") return true;
  const nextCh = line.charAt(escapeEnd);
  return nextCh === "" || !HEX_DIGIT.test(nextCh);
}

interface BoundedToken {
  readonly atoms: readonly DecodedAtom[];
  /** Source chars consumed (start..start+length). */
  readonly length: number;
  readonly hasEscape: boolean;
}

function tokenizeBoundedToken(line: string, start: number): BoundedToken | null {
  const atoms: DecodedAtom[] = [];
  let hasEscape = false;
  let i = start;
  while (i < line.length) {
    const rest = line.substring(i);

    const u = U_ESCAPE.exec(rest);
    if (u && u[0] !== undefined) {
      const hex = u[1] ?? "";
      const consumed = u[0].length;
      if (uEscapeAccepts(hex, line, i + consumed)) {
        const code = parseInt(hex, 16);
        atoms.push({ char: String.fromCharCode(code), srcStart: i, srcEnd: i + consumed, fromEscape: true });
        hasEscape = true;
        i += consumed;
        continue;
      }
    }

    const x = X_ESCAPE.exec(rest);
    if (x && x[0] !== undefined) {
      const hex = x[1] ?? "";
      const consumed = x[0].length;
      const code = parseInt(hex, 16);
      atoms.push({ char: String.fromCharCode(code), srcStart: i, srcEnd: i + consumed, fromEscape: true });
      hasEscape = true;
      i += consumed;
      continue;
    }

    const h = HEX_DIGIT_ATOM.exec(rest);
    if (h && h[1] !== undefined && h[0] !== undefined) {
      const pair = h[1];
      const consumed = h[0].length;
      // 0[xX]3N -> digit char 'N' (ASCII 0x30..0x39 == '0'..'9')
      atoms.push({ char: pair.charAt(1), srcStart: i, srcEnd: i + consumed, fromEscape: true });
      hasEscape = true;
      i += consumed;
      continue;
    }

    const ch = rest.charAt(0);
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
 * is emitted only when its own decoded span includes an escape atom (the ID
 * is reconstructed from escapes) OR an escape atom creates the word boundary
 * that exposes an adjacent literal ID (e.g. `STEP-1\u0020ADR-0002` exposes
 * ADR-0002 via the escaped space). A literal ID that merely shares a token
 * with an unrelated escape is NOT emitted. `matched`/`original` is the
 * minimal relevant source span, never the maximal token.
 *
 * Pure: same input always yields the same output.
 */
export function detectReconstructedIds(line: string): ReconstructedId[] {
  const out: ReconstructedId[] = [];
  let i = 0;
  while (i < line.length) {
    const token = tokenizeBoundedToken(line, i);
    if (token === null) {
      i += 1;
      continue;
    }
    if (token.hasEscape) {
      const decoded = token.atoms.map((a) => a.char).join("");
      const idPattern = new RegExp(ID_PATTERN.source, "g");
      let m: RegExpExecArray | null;
      let emitted = 0;
      while ((m = idPattern.exec(decoded)) !== null) {
        if (emitted >= MAX_IDS_PER_TOKEN) break;
        const idStart = m.index;
        const idEnd = m.index + m[0].length;
        const startAtom = token.atoms.at(idStart);
        const endAtom = token.atoms.at(idEnd - 1);
        const leftAtom = idStart > 0 ? token.atoms.at(idStart - 1) : undefined;
        if (startAtom === undefined || endAtom === undefined) continue;
        const ownEscape = token.atoms.slice(idStart, idEnd).some((a) => a.fromEscape);
        const boundaryEscape = leftAtom !== undefined && leftAtom.fromEscape;
        if (!ownEscape && !boundaryEscape) continue;
        const spanStart = ownEscape ? startAtom.srcStart : (leftAtom?.srcStart ?? startAtom.srcStart);
        const spanEnd = endAtom.srcEnd;
        out.push({
          decoded: m[0],
          original: line.substring(spanStart, spanEnd),
          srcStart: spanStart,
          srcEnd: spanEnd,
        });
        emitted += 1;
      }
    }
    i += token.length;
  }
  return out;
}
