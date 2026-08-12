// Text / binary / unknown classification for the distribution boundary detector.
//
// Stage A alignment (PR #2092): the trusted detector treats distribution
// artifacts as strict-UTF-8 text and rejects disguised binaries. Unknown
// extensions or missing extensions must NOT silently pass — they fail
// closed at the gate layer via the explicit `unknown` tri-state.
//
// Side-effect-free: no imports of `fs`, `path`, or any I/O module.

export type ByteSource = Uint8Array;

export interface ByteClassification {
  readonly kind: "text" | "binary" | "unknown";
  /** Present only when kind is "text". */
  readonly text?: string;
  /** Present only when kind is "binary" or "unknown". */
  readonly reason?: string;
}

export const TEXT_EXTENSIONS = new Set([
  ".md", ".markdown", ".txt", ".text",
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".cts",
  ".yaml", ".yml",
  ".json", ".jsonc",
  ".ps1", ".psm1", ".psd1",
  ".sh", ".bash", ".zsh",
  ".py",
  ".rs",
  ".go",
  ".xml", ".html", ".htm", ".css", ".scss", ".sass",
  ".toml", ".ini", ".cfg", ".conf",
  ".gitignore", ".gitattributes",
  ".env",
]);

export const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".webp", ".tiff", ".svgz",
  ".pdf",
  ".zip", ".gz", ".tar", ".tgz", ".bz2", ".7z", ".rar",
  ".exe", ".dll", ".so", ".dylib", ".bin",
  ".class", ".jar",
  ".woff", ".woff2", ".ttf", ".otf", ".eot",
  ".mp3", ".mp4", ".avi", ".mov", ".webm",
  ".lockb", ".bin",
  ".DS_Store",
]);

export function isTextFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  const lastDot = lower.lastIndexOf(".");
  if (lastDot < 0) return true;
  const ext = lower.slice(lastDot);
  if (BINARY_EXTENSIONS.has(ext)) return false;
  if (TEXT_EXTENSIONS.has(ext)) return true;
  return true;
}

export function isBinaryFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  const lastDot = lower.lastIndexOf(".");
  if (lastDot < 0) return false;
  const ext = lower.slice(lastDot);
  return BINARY_EXTENSIONS.has(ext);
}

export function isUnknownExtension(filename: string): boolean {
  const lower = filename.toLowerCase();
  const lastDot = lower.lastIndexOf(".");
  if (lastDot < 0) return false;
  const ext = lower.slice(lastDot);
  return !TEXT_EXTENSIONS.has(ext) && !BINARY_EXTENSIONS.has(ext);
}

function hasNul(bytes: ByteSource): boolean {
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === 0) return true;
  }
  return false;
}

function peekContinuation(bytes: ByteSource, i: number): number | null {
  const c = bytes[i];
  if (c === undefined) return null;
  return c;
}

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
      continue;
    } else if (b0 >= 0xc2 && b0 <= 0xdf) {
      needed = 1;
      min = 0x80;
      codePoint = b0 & 0x1f;
    } else if (b0 >= 0xe0 && b0 <= 0xef) {
      needed = 2;
      min = 0x800;
      codePoint = b0 & 0x0f;
      if (b0 === 0xe0) {
        const c = peekContinuation(bytes, i);
        if (c !== null && (c & 0xe0) !== 0xa0) return false;
      }
      if (b0 === 0xed) {
        const c = peekContinuation(bytes, i);
        if (c !== null && (c & 0xe0) !== 0x80) return false;
      }
    } else if (b0 >= 0xf0 && b0 <= 0xf4) {
      needed = 3;
      min = 0x10000;
      codePoint = b0 & 0x07;
      if (b0 === 0xf0) {
        const c = peekContinuation(bytes, i);
        if (c !== null && (c & 0xf0) === 0x80) return false;
      }
      if (b0 === 0xf4) {
        const c = peekContinuation(bytes, i);
        if (c !== null && (c & 0xf0) !== 0x80) return false;
      }
    } else {
      return false;
    }

    for (let j = 0; j < needed; j++) {
      const c = bytes[i + j];
      if (c === undefined) return false;
      if (c < 0x80 || c > 0xbf) return false;
      codePoint = (codePoint << 6) | (c & 0x3f);
    }
    i += needed;

    if (codePoint < min) return false;
  }
  return true;
}

export function isBinaryBytes(bytes: ByteSource): boolean {
  if (hasNul(bytes)) return true;
  return !isValidStrictUtf8(bytes);
}

export class InvalidUtf8Error extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidUtf8Error";
  }
}

export function decodeStrictUtf8(bytes: ByteSource): string {
  if (!isValidStrictUtf8(bytes)) {
    throw new InvalidUtf8Error("bytes are not valid strict UTF-8");
  }
  const decoder = new TextDecoder("utf-8", { fatal: true });
  return decoder.decode(bytes);
}

/**
 * Classify bytes as text or binary using strict UTF-8 validation. Empty bytes
 * are text with an empty string. Never returns `unknown` — bytes are always
 * decidable. The `unknown` tri-state is reserved for extension-based
 * classification (see {@link classifyByExtension}) where the gate layer must
 * fail closed.
 */
export function classifyBytes(bytes: ByteSource): ByteClassification {
  if (hasNul(bytes)) {
    return { kind: "binary", reason: "NUL byte present" };
  }
  if (!isValidStrictUtf8(bytes)) {
    return { kind: "binary", reason: "invalid UTF-8 sequence" };
  }
  return { kind: "text", text: decodeStrictUtf8(bytes) };
}

/**
 * Classify a file by its extension. Binary extensions return binary, known
 * text extensions return text, and unknown / missing extensions return
 * `unknown` so the gate layer fails closed instead of silently scanning or
 * silently skipping.
 */
export function classifyByExtension(filename: string): ByteClassification {
  if (isBinaryFile(filename)) {
    return { kind: "binary", reason: "binary extension" };
  }
  const lower = filename.toLowerCase();
  const lastDot = lower.lastIndexOf(".");
  if (lastDot < 0) {
    return { kind: "unknown", reason: "no extension" };
  }
  const ext = lower.slice(lastDot);
  if (TEXT_EXTENSIONS.has(ext)) {
    return { kind: "text" };
  }
  return { kind: "unknown", reason: `unrecognized extension ${ext}` };
}
