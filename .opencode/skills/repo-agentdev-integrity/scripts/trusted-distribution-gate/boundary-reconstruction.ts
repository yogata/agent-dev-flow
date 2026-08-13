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
// `\xXX` must be exactly two hex digits; the negative lookahead prevents
// consuming a longer hex run like `\x123`.
const X_ESCAPE = /^\\x([0-9A-Fa-f]{2})(?![0-9A-Fa-f])/;
// `0[xX]HH` digit-reconstruction atom: case-insensitive `0x` prefix,
// exactly two hex digits, value in ASCII digit range (0x30..0x39), and
// not part of a longer hex run.
const HEX_DIGIT_ATOM = /^0[xX](3[0-9])(?![0-9A-Fa-f])/;

interface BoundedToken {
  readonly original: string;
  readonly decoded: string;
  readonly hasEscape: boolean;
}

export interface ReconstructedId {
  /** Decoded concrete ID (e.g. "ADR-0001"). */
  readonly decoded: string;
  /** Source-form token (e.g. "\\u0041DR-0001"). */
  readonly original: string;
}

function tokenizeBoundedToken(line: string, start: number): BoundedToken | null {
  let original = "";
  let decoded = "";
  let hasEscape = false;
  let i = start;
  while (i < line.length) {
    const rest = line.substring(i);

    const u = U_ESCAPE.exec(rest);
    if (u) {
      const hex = u[1] ?? "";
      if (hex) {
        const code = parseInt(hex, 16);
        decoded += String.fromCharCode(code);
        original += u[0];
        i += u[0].length;
        hasEscape = true;
        continue;
      }
    }

    const x = X_ESCAPE.exec(rest);
    if (x) {
      const hex = x[1] ?? "";
      if (hex) {
        const code = parseInt(hex, 16);
        decoded += String.fromCharCode(code);
        original += x[0];
        i += x[0].length;
        hasEscape = true;
        continue;
      }
    }

    const h = HEX_DIGIT_ATOM.exec(rest);
    if (h) {
      const pair = h[1] ?? "";
      if (pair.length === 2) {
        // 0[xX]3N -> digit char 'N' (ASCII 0x30..0x39 == '0'..'9')
        const digitChar = pair.charAt(1);
        decoded += digitChar;
        original += h[0];
        i += h[0].length;
        hasEscape = true;
        continue;
      }
    }

    const ch = rest.charAt(0);
    if (BOUNDED_LITERAL.test(ch)) {
      decoded += ch;
      original += ch;
      i += 1;
      continue;
    }

    break;
  }
  if (original.length === 0) return null;
  return { original, decoded, hasEscape };
}

/**
 * Scan a line for bounded tokens that decode to expose one or more
 * concrete IDs. A candidate is emitted for every concrete-ID match in the
 * decoded token when the token contains at least one escape atom. The
 * escape atom may decode INTO the matched ID (prefix/suffix/hyphen
 * reconstruction) OR reconstruct a delimiter that creates the word
 * boundary exposing an adjacent literal ID (e.g. `STEP-1\u0020ADR-0002`).
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
      const idPattern = /\b([A-Z]{2,})-(\d{1,})\b/g;
      let m: RegExpExecArray | null;
      while ((m = idPattern.exec(token.decoded)) !== null) {
        out.push({ decoded: m[0], original: token.original });
      }
    }
    i += token.original.length;
  }
  return out;
}

