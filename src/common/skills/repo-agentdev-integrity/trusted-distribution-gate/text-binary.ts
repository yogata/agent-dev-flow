// Strict UTF-8 text / binary classifier for trust-root blob bytes.
//
// Distribution artifacts are validated as strict UTF-8 text so the boundary
// detector can scan them line-by-line. Disguised binaries must be rejected
// (treated as binary) so the detector never silently skips them.
//
// Strict UTF-8 specifically rejects:
//   - NUL bytes (0x00)
//   - overlong encodings (e.g. 0xC0 0x80)
//   - lone continuation bytes (0x80..0xBF without lead)
//   - lead bytes without enough continuation bytes
//   - invalid lead bytes (0xFE, 0xFF, also 0xF5..0xFF which would encode
//     code points beyond U+10FFFF)
//   - surrogate-half code points (U+D800..U+DFFF encoded as 3 bytes)
//
// Side-effect-free: no imports of `fs`, `path`, or any I/O module.

export type ByteSource = Uint8Array;

export interface Classification {
  readonly kind: "text" | "binary";
  /** Present only when kind is "text". */
  readonly text?: string;
  /** Present only when kind is "binary". Brief reason. */
  readonly reason?: string;
}

/**
 * Returns true when the bytes cannot be classified as strict UTF-8 text.
 * NUL bytes always mean binary.
 */
export function isBinaryBytes(bytes: ByteSource): boolean {
  if (hasNul(bytes)) return true;
  return !isValidStrictUtf8(bytes);
}

function hasNul(bytes: ByteSource): boolean {
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === 0) return true;
  }
  return false;
}

/**
 * Validate bytes as strict UTF-8 per the Unicode standard. Returns true when
 * the bytes form a complete, valid UTF-8 sequence with no overlong forms,
 * no surrogates, no code points above U+10FFFF, and no incomplete sequences.
 */
export function isValidStrictUtf8(bytes: ByteSource): boolean {
  let i = 0;
  const len = bytes.length;
  while (i < len) {
    const b0 = bytes[i] ?? 0;
    i++;
    let codePoint: number;
    let needed: number;
    let min: number;

    if (b0 <= 0x7f) {
      // ASCII
      continue;
    } else if (b0 >= 0xc2 && b0 <= 0xdf) {
      // 2-byte: U+0080..U+07FF
      needed = 1;
      min = 0x80;
      codePoint = b0 & 0x1f;
    } else if (b0 >= 0xe0 && b0 <= 0xef) {
      // 3-byte: U+0800..U+FFFF
      needed = 2;
      min = 0x800;
      codePoint = b0 & 0x0f;
      // Reject overlong-form lead 0xE0 with too-small continuation.
      if (b0 === 0xe0) {
        const c = peekContinuation(bytes, i);
        if (c !== null && (c & 0xe0) !== 0xa0) return false;
      }
      // Reject surrogate-half lead 0xED with continuation >= 0xA0.
      if (b0 === 0xed) {
        const c = peekContinuation(bytes, i);
        if (c !== null && (c & 0xe0) !== 0x80) return false;
      }
    } else if (b0 >= 0xf0 && b0 <= 0xf4) {
      // 4-byte: U+10000..U+10FFFF
      needed = 3;
      min = 0x10000;
      codePoint = b0 & 0x07;
      // Reject overlong-form lead 0xF0 with too-small continuation.
      // For 0xF0, continuation must be >= 0x90 (i.e., NOT in 0x80..0x8F).
      if (b0 === 0xf0) {
        const c = peekContinuation(bytes, i);
        if (c !== null && (c & 0xf0) === 0x80) return false;
      }
      // Reject lead 0xF4 with continuation > 0x8F (beyond U+10FFFF).
      // For 0xF4, continuation must be <= 0x8F (i.e., MUST be in 0x80..0x8F).
      if (b0 === 0xf4) {
        const c = peekContinuation(bytes, i);
        if (c !== null && (c & 0xf0) !== 0x80) return false;
      }
    } else {
      // Invalid lead byte: 0x80..0xBF (continuation), 0xC0, 0xC1, 0xF5..0xFF.
      return false;
    }

    // Read needed continuation bytes.
    for (let j = 0; j < needed; j++) {
      const c = bytes[i + j];
      if (c === undefined) return false; // truncated
      if (c < 0x80 || c > 0xbf) return false;
      codePoint = (codePoint << 6) | (c & 0x3f);
    }
    i += needed;

    // Reject overlong encodings.
    if (codePoint < min) return false;
  }
  return true;
}

function peekContinuation(bytes: ByteSource, i: number): number | null {
  const c = bytes[i];
  if (c === undefined) return null;
  return c;
}

/**
 * Decode bytes as strict UTF-8. Throws when the bytes are not valid strict
 * UTF-8 (callers should call isBinaryBytes first, or use classifyBytes).
 */
export function decodeStrictUtf8(bytes: ByteSource): string {
  if (!isValidStrictUtf8(bytes)) {
    throw new InvalidUtf8Error("bytes are not valid strict UTF-8");
  }
  // TextDecoder with fatal: true re-validates and throws on any issue.
  const decoder = new TextDecoder("utf-8", { fatal: true });
  return decoder.decode(bytes);
}

export class InvalidUtf8Error extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidUtf8Error";
  }
}

/**
 * Classify bytes as text or binary. When text, the decoded string is included.
 * When binary, a brief reason is included. Empty bytes are classified as text
 * with an empty string (empty text file).
 */
export function classifyBytes(bytes: ByteSource): Classification {
  if (hasNul(bytes)) {
    return { kind: "binary", reason: "NUL byte present" };
  }
  if (!isValidStrictUtf8(bytes)) {
    return { kind: "binary", reason: "invalid UTF-8 sequence" };
  }
  return { kind: "text", text: decodeStrictUtf8(bytes) };
}
