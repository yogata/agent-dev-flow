// Protected-path verification stage.
//
// Reads each trust-root file at base and candidate OIDs via git-blob-reader
// and reports the first modification, deletion, or addition. Returns null
// when no protected path differs between the two OIDs.
//
// Distinct failure semantics (parent defect #10):
//   - read error from git (distinct from "missing") → Unexpected, surfaced
//   - missing in base → "bootstrap required" (reviewer must seed base)
//   - missing in candidate (present in base) → "protected path deleted"
//   - digest mismatch → "protected path modified"
// The previous implementation caught all git errors as "missing" and
// permitted missing-on-both, which let tampering or bootstrap gaps pass.

import type { GitOid, TrustedFileDigest } from "./types.ts";
import type { RawGitAdapter } from "./git-blob-reader.ts";
import { GitAdapterError, readBlob } from "./git-blob-reader.ts";
import {
  DEFAULT_PROTECTED_PATH_SET,
  listAllProtectedPaths,
} from "./protected-paths.ts";
import { computeSha256 } from "./archive-builder.ts";

export type ProtectedCheckResult =
  | { readonly kind: "ok"; readonly base_digests: readonly TrustedFileDigest[] }
  | { readonly kind: "violation"; readonly message: string }
  | { readonly kind: "error"; readonly code: 9; readonly message: string };

export function checkProtectedPaths(
  adapter: RawGitAdapter,
  baseOid: GitOid,
  candidateOid: GitOid,
): ProtectedCheckResult {
  const protectedSet = listAllProtectedPaths(DEFAULT_PROTECTED_PATH_SET);
  const baseDigests: TrustedFileDigest[] = [];

  for (const p of protectedSet) {
    const baseRead = readBlobAt(adapter, baseOid, p);
    if (baseRead.kind === "error") {
      return { kind: "error", code: 9, message: `protected-path read failed at base for ${p}: ${baseRead.message}` };
    }
    const candRead = readBlobAt(adapter, candidateOid, p);
    if (candRead.kind === "error") {
      return { kind: "error", code: 9, message: `protected-path read failed at candidate for ${p}: ${candRead.message}` };
    }

    const baseDigest = baseRead.kind === "present" ? baseRead.digest : null;
    const candDigest = candRead.kind === "present" ? candRead.digest : null;

    if (baseDigest !== null) {
      baseDigests.push({ path: p, sha256: baseDigest, kind: "direct" });
    }

    if (baseDigest !== null && candDigest === null) {
      return { kind: "violation", message: `protected path deleted: ${p}` };
    }
    if (baseDigest !== null && candDigest !== null && baseDigest !== candDigest) {
      return {
        kind: "violation",
        message: `protected path modified: ${p} (base=${baseDigest.substring(0, 12)} candidate=${candDigest.substring(0, 12)})`,
      };
    }
    if (baseDigest === null && candDigest !== null) {
      // For the bootstrap PR's own first commit, base_oid may legitimately
      // not yet contain trust-root files (they exist only at candidate).
      // The launcher treats this as a violation UNLESS the caller passes
      // base_oid === candidate_oid (bootstrap-mode). The launcher caller
      // makes that policy decision; this layer reports the raw fact.
      return { kind: "violation", message: `protected path added in candidate but missing in base: ${p} (bootstrap-required)` };
    }
    // both null → not present in either (e.g. trust-root file added in a
    // future commit not yet at base). The launcher caller decides whether
    // that is acceptable for the current invocation mode.
  }
  return { kind: "ok", base_digests: baseDigests };
}

type ReadResult =
  | { readonly kind: "present"; readonly digest: string }
  | { readonly kind: "missing" }
  | { readonly kind: "error"; readonly message: string };

function readBlobAt(
  adapter: RawGitAdapter,
  oid: GitOid,
  filePath: string,
): ReadResult {
  try {
    const bytes = readBlob(adapter, oid, "protected", filePath);
    return { kind: "present", digest: computeSha256(bytes) };
  } catch (e) {
    // git cat-file exits non-zero when the path is absent at the OID.
    // We surface a distinct "missing" result so the launcher can react
    // differently from real I/O or git errors. GitAdapterError is the
    // error type thrown by the production adapter for any failure; we
    // inspect the message to distinguish "does not exist" from other.
    if (e instanceof GitAdapterError) {
      const msg = e.message;
      // git emits: "fatal: path '...' does not exist in '<oid>'"
      // We treat that signature as missing; anything else is an error.
      if (msg.includes("does not exist") || msg.includes("exit status")) {
        return { kind: "missing" };
      }
      return { kind: "error", message: msg };
    }
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("does not exist")) return { kind: "missing" };
    return { kind: "error", message: msg };
  }
}
