// Batched git blob reads with strict protocol validation.
//
// Reads blobs via `git cat-file --batch` (single subprocess for many
// blobs) and probes presence via `git cat-file --batch-check`.
//
// Typed-error semantics:
//   - GitBlobMissingError → the request received an explicit valid
//     `<original-request> missing\n` response from git. Nothing else
//     triggers missing.
//   - GitAdapterError → every other anomaly: subprocess crash, malformed
//     protocol response, response-count shortfall, truncated header or
//     body, missing post-body delimiter, trailing unparsed bytes,
//     non-blob object kind, invalid size, missing `spawnGitWithInput`
//     on the adapter. None of these are silently downgraded to "missing"
//     (parent blocker round 3 #2, #3).
//
// Lock-step parsing: git --batch responses come in the SAME ORDER as
// stdin requests. The response header for a present object uses the
// RESOLVED blob oid (not the original `<oid>:<path>` request key), but
// the missing response echoes the original input. We walk responses in
// order and re-associate with the request by index. For missing, we
// additionally echo-check that the response key matches the request
// exactly.

import type { GitOid } from "./types.ts";
import { GitAdapterError, GitBlobMissingError } from "./types.ts";
import type { RawGitAdapter } from "./git-blob-reader.ts";

export interface BatchedReadResult {
  readonly found: ReadonlyMap<string, Uint8Array>;
  readonly missing: readonly string[];
}

/**
 * Read many blobs in a SINGLE git subprocess via `git cat-file --batch`.
 * Lines of `<oid>:<path>` are sent on stdin; for each, git writes
 * `<resolved-oid> blob <size>\n<bytes>\n` (or `<input> missing\n`) to
 * stdout.
 *
 * Strict protocol: any deviation from the expected response shape (count
 * shortfall, truncated header/body, missing newline, trailing bytes,
 * non-blob kind, invalid size, malformed missing header) throws
 * GitAdapterError. Only an explicit valid missing response enters the
 * `missing` list.
 */
export function readBlobsBatched(
  adapter: RawGitAdapter,
  requests: readonly string[],
): BatchedReadResult {
  if (requests.length === 0) {
    return { found: new Map(), missing: [] };
  }
  if (typeof adapter.spawnGitWithInput !== "function") {
    throw new GitAdapterError(
      "RawGitAdapter.spawnGitWithInput is required for batched reads",
    );
  }
  const input = Buffer.from(requests.join("\n") + "\n", "utf-8");
  let raw: Buffer;
  try {
    raw = adapter.spawnGitWithInput(["cat-file", "--batch"], input);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new GitAdapterError(`git cat-file --batch failed: ${msg}`);
  }
  return parseBatchedResponse(raw, requests);
}

const OID_PATTERN = /^[0-9a-f]{40}$|^[0-9a-f]{64}$/;

/**
 * Validate that a resolved OID is a canonical 40-hex (SHA-1) or 64-hex
 * (SHA-256) string. Rejects any other shape (parent blocker round 4 #2).
 */
function assertValidResolvedOid(oid: string, context: string): void {
  if (!OID_PATTERN.test(oid)) {
    throw new GitAdapterError(`cat-file --batch: invalid resolved OID '${oid}' in ${context}`);
  }
}

/**
 * Validate that a size string is canonical decimal (no leading zeros, no
 * sign, no whitespace, no non-numeric suffix). Rejects `01`, `+1`, ` 5`.
 */
function parseCanonicalSize(sizeStr: string, context: string): number {
  const size = Number.parseInt(sizeStr, 10);
  if (!Number.isFinite(size) || size < 0 || String(size) !== sizeStr) {
    throw new GitAdapterError(`cat-file --batch: invalid size '${sizeStr}' in ${context}`);
  }
  return size;
}

/**
 * Pure parser for `git cat-file --batch` response bytes. Exported for
 * direct unit testing of the strict protocol rules.
 */
export function parseBatchedResponse(
  raw: Buffer,
  requests: readonly string[],
): BatchedReadResult {
  const found = new Map<string, Uint8Array>();
  const missing: string[] = [];
  let off = 0;
  for (let idx = 0; idx < requests.length; idx++) {
    const req = requests[idx]!;
    const headerEnd = indexOfByte(raw, 0x0a, off);
    if (headerEnd < 0) {
      throw new GitAdapterError(
        `cat-file --batch: missing header newline for request ${idx} (${req}); raw truncated at offset ${off}`,
      );
    }
    const header = raw.toString("utf-8", off, headerEnd);
    off = headerEnd + 1;
    const parts = header.split(" ");
    if (parts.length === 2) {
      if (parts[1] !== "missing") {
        throw new GitAdapterError(
          `cat-file --batch: malformed 2-field header for request ${idx}: ${header}`,
        );
      }
      if (parts[0] !== req) {
        throw new GitAdapterError(
          `cat-file --batch: missing response key mismatch (expected '${req}', got '${parts[0]}')`,
        );
      }
      missing.push(req);
      continue;
    }
    if (parts.length !== 3) {
      throw new GitAdapterError(
        `cat-file --batch: malformed header for request ${idx}: ${header}`,
      );
    }
    const [resolvedOid, kind, sizeStr] = parts as [string, string, string];
    assertValidResolvedOid(resolvedOid, `request ${idx} header`);
    if (kind !== "blob") {
      throw new GitAdapterError(
        `cat-file --batch: non-blob object kind '${kind}' for request ${idx}: ${header}`,
      );
    }
    const size = parseCanonicalSize(sizeStr, `request ${idx} header`);
    if (off + size > raw.length) {
      throw new GitAdapterError(
        `cat-file --batch: truncated body for request ${idx} (need ${size} bytes, have ${raw.length - off})`,
      );
    }
    found.set(req, new Uint8Array(raw.subarray(off, off + size)));
    off += size;
    if (off >= raw.length || raw[off] !== 0x0a) {
      throw new GitAdapterError(
        `cat-file --batch: missing post-body newline for request ${idx}`,
      );
    }
    off += 1;
  }
  if (off !== raw.length) {
    throw new GitAdapterError(
      `cat-file --batch: ${raw.length - off} trailing unparsed byte(s) after ${requests.length} response(s)`,
    );
  }
  return { found, missing };
}

type PresenceCheck =
  | { readonly kind: "present"; readonly size: number }
  | { readonly kind: "missing" }
  | { readonly kind: "error"; readonly error: GitAdapterError };

/**
 * Structured presence check via `git cat-file --batch-check`. The
 * response is parsed strictly; any deviation from the canonical
 * `<resolved-oid> blob <size>\n` or `<input> missing\n` shape throws
 * GitAdapterError. There is no `cat-file -e` fallback (parent blocker
 * round 3 #3): an adapter that cannot supply spawnGitWithInput surfaces
 * the failure as GitAdapterError at the call boundary.
 */
export function checkBlobPresent(
  adapter: RawGitAdapter,
  oid: GitOid,
  filePath: string,
): PresenceCheck {
  const req = `${oid}:${filePath}`;
  if (typeof adapter.spawnGitWithInput !== "function") {
    return {
      kind: "error",
      error: new GitAdapterError(
        "RawGitAdapter.spawnGitWithInput is required for checkBlobPresent",
      ),
    };
  }
  let buf: Buffer;
  try {
    buf = adapter.spawnGitWithInput(["cat-file", "--batch-check"], Buffer.from(req + "\n"));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { kind: "error", error: new GitAdapterError(`git cat-file --batch-check failed: ${msg}`) };
  }
  // Trim only the trailing newline; reject anything else.
  const nl = buf.indexOf(0x0a);
  if (nl < 0) {
    return { kind: "error", error: new GitAdapterError(`cat-file --batch-check: missing newline in response`) };
  }
  if (nl !== buf.length - 1) {
    return { kind: "error", error: new GitAdapterError(`cat-file --batch-check: trailing bytes after newline`) };
  }
  const line = buf.toString("utf-8", 0, nl);
  const parts = line.split(" ");
  if (parts.length === 2 && parts[1] === "missing") {
    if (parts[0] !== req) {
      return {
        kind: "error",
        error: new GitAdapterError(
          `cat-file --batch-check: missing response key mismatch (expected '${req}', got '${parts[0]}')`,
        ),
      };
    }
    return { kind: "missing" };
  }
  if (parts.length === 3 && parts[1] === "blob") {
    const resolvedOid = parts[0]!;
    if (!OID_PATTERN.test(resolvedOid)) {
      return {
        kind: "error",
        error: new GitAdapterError(`cat-file --batch-check: invalid resolved OID '${resolvedOid}'`),
      };
    }
    const sizeStr = parts[2]!;
    const size = Number.parseInt(sizeStr, 10);
    if (!Number.isFinite(size) || size < 0 || String(size) !== sizeStr) {
      return {
        kind: "error",
        error: new GitAdapterError(`cat-file --batch-check: invalid size '${sizeStr}'`),
      };
    }
    return { kind: "present", size };
  }
  return {
    kind: "error",
    error: new GitAdapterError(`cat-file --batch-check: unexpected response: ${line}`),
  };
}

/**
 * Read a single blob's bytes via `git cat-file blob <oid>:<path>`. Uses
 * `git cat-file --batch-check` as a structured existence precheck so
 * missing-vs-error is distinguished by typed result, not by message
 * parsing.
 *
 * Throws GitBlobMissingError when git reports the path absent at the OID.
 * Throws GitAdapterError for any other failure, including a missing
 * `spawnGitWithInput` method on the adapter.
 */
export function readBlob(
  adapter: RawGitAdapter,
  oid: GitOid,
  _label: string,
  filePath: string,
): Uint8Array {
  const check = checkBlobPresent(adapter, oid, filePath);
  if (check.kind === "missing") {
    throw new GitBlobMissingError(oid, filePath);
  }
  if (check.kind === "error") {
    throw check.error;
  }
  const req = `${oid}:${filePath}`;
  let buf: Buffer;
  try {
    buf = adapter.spawnGit(["cat-file", "blob", req]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new GitAdapterError(`git cat-file blob failed for ${filePath}: ${msg}`);
  }
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
}

function indexOfByte(buf: Buffer, byte: number, from: number): number {
  for (let i = from; i < buf.length; i++) {
    if (buf[i] === byte) return i;
  }
  return -1;
}
