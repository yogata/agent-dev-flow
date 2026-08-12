// Protected-path verification stage.
//
// Reads each trust-root file at base and candidate OIDs via the git adapter
// and reports a structured per-path outcome for EVERY protected path. The
// launcher applies mode-aware policy (strict / bootstrap / seed) on the
// aggregated result; this layer reports raw facts only.
//
// Distinct typed-error semantics (parent defect #10):
//   - GitBlobMissingError → structured "missing" outcome (no message parsing)
//   - GitAdapterError → surfaced as a stage error (caller fails closed)
//   - PathSafetyError → surfaced as a stage error (caller fails closed)
//
// Aggregation contract (parent defect #4):
//   Earlier implementations returned the FIRST violation, which let a real
//   modification hide behind a benign bootstrap-only add. This layer always
//   scans every protected path and returns the full outcome list so the
//   launcher's policy can distinguish modified/deleted (fatal in every mode)
//   from candidate-added (permitted in bootstrap/seed mode).

import type { GitOid, TrustedFileDigest } from "./types.ts";
import type { RawGitAdapter } from "./git-blob-reader.ts";
import { GitAdapterError, readBlobsBatched } from "./git-blob-reader.ts";
import {
  DEFAULT_PROTECTED_PATH_SET,
  listAllProtectedPaths,
} from "./protected-paths.ts";
import { computeSha256 } from "./archive-builder.ts";

export type PerPathStatus =
  | "both-present-same"
  | "both-present-differ"
  | "base-only"
  | "candidate-only"
  | "both-missing";

export interface ProtectedPathOutcome {
  readonly path: string;
  readonly status: PerPathStatus;
  readonly base_digest: string | null;
  readonly candidate_digest: string | null;
}

export interface ProtectedCheckAggregated {
  readonly outcomes: readonly ProtectedPathOutcome[];
  readonly base_digests: readonly TrustedFileDigest[];
}

export type ProtectedCheckResult =
  | { readonly kind: "ok"; readonly aggregated: ProtectedCheckAggregated }
  | { readonly kind: "error"; readonly code: 9; readonly message: string };

/**
 * Aggregate per-path protected-check outcomes in O(1) git subprocesses.
 * All base and candidate requests are batched into a SINGLE
 * `git cat-file --batch` call per OID (parent blocker #4). The batched
 * result distinguishes missing (typed) from adapter failure (typed
 * throw), so infrastructure/permission errors are NOT silently downgraded
 * to "missing" (parent blocker #5).
 */
export function checkProtectedPaths(
  adapter: RawGitAdapter,
  baseOid: GitOid,
  candidateOid: GitOid,
): ProtectedCheckResult {
  const protectedSet = listAllProtectedPaths(DEFAULT_PROTECTED_PATH_SET);
  const baseReqs = protectedSet.map((p) => `${baseOid}:${p}`);
  const candReqs = protectedSet.map((p) => `${candidateOid}:${p}`);

  let baseBatch, candBatch;
  try {
    baseBatch = readBlobsBatched(adapter, baseReqs);
  } catch (e) {
    return { kind: "error", code: 9, message: `protected-path batched read failed at base: ${errMsg(e)}` };
  }
  try {
    candBatch = readBlobsBatched(adapter, candReqs);
  } catch (e) {
    return { kind: "error", code: 9, message: `protected-path batched read failed at candidate: ${errMsg(e)}` };
  }

  const outcomes: ProtectedPathOutcome[] = [];
  const baseDigests: TrustedFileDigest[] = [];
  for (let i = 0; i < protectedSet.length; i++) {
    const p = protectedSet[i]!;
    const baseReq = baseReqs[i]!;
    const candReq = candReqs[i]!;
    const baseBytes = baseBatch.found.get(baseReq);
    const candBytes = candBatch.found.get(candReq);
    const baseMissing = baseBatch.missing.includes(baseReq);
    const candMissing = candBatch.missing.includes(candReq);

    // If neither found nor explicitly missing, the batched protocol is
    // broken — surface as error (fail-closed) rather than guessing.
    if (baseBytes === undefined && !baseMissing) {
      return { kind: "error", code: 9, message: `protected-path indeterminate at base for ${p}` };
    }
    if (candBytes === undefined && !candMissing) {
      return { kind: "error", code: 9, message: `protected-path indeterminate at candidate for ${p}` };
    }

    const baseDigest = baseBytes ? computeSha256(baseBytes) : null;
    const candDigest = candBytes ? computeSha256(candBytes) : null;
    if (baseDigest !== null) {
      baseDigests.push({ path: p, sha256: baseDigest, kind: "direct" });
    }
    outcomes.push({
      path: p,
      status: classifyOutcome(baseDigest, candDigest),
      base_digest: baseDigest,
      candidate_digest: candDigest,
    });
  }
  return { kind: "ok", aggregated: { outcomes, base_digests: baseDigests } };
}

function classifyOutcome(baseDigest: string | null, candDigest: string | null): PerPathStatus {
  if (baseDigest !== null && candDigest !== null) {
    return baseDigest === candDigest ? "both-present-same" : "both-present-differ";
  }
  if (baseDigest !== null && candDigest === null) return "base-only";
  if (baseDigest === null && candDigest !== null) return "candidate-only";
  return "both-missing";
}

function errMsg(e: unknown): string {
  if (e instanceof GitAdapterError) return e.message;
  return e instanceof Error ? e.message : String(e);
}
