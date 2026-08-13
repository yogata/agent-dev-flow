// Candidate model and resolution: the typed Candidate union, the URL/path
// classification helpers, and the resolveCandidate switch. Extracted from
// boundary-pipeline.ts to keep that module under the 250 pure LOC ceiling
// (parent defect #12). One responsibility: turning a candidate into a
// classification + category.
//
// DAG position: types -> reconstruction -> ownership -> candidate-model ->
// pipeline -> gate -> runner. This module imports from ownership (Span) and
// reconstruction (ReconstructionOverflowReason); nothing downstream of
// pipeline imports it directly except via pipeline's re-exports.
//
// Side-effect-free: no I/O, pure over inputs and config.

import type {
  DependencyClass,
  Detection,
  DetectionCategory,
  Projection,
} from "./types.ts";
import type {
  ReconstructionOverflowReason,
} from "./boundary-reconstruction.ts";
import type {
  CandidatePrecedence,
  Span,
} from "./boundary-candidate-ownership.ts";
import {
  extractOwnerRepo as authorityExtractOwnerRepo,
  isProducerOwnedUrl as authorityIsProducerOwnedUrl,
} from "./boundary-url-parser.ts";

// ---------------------------------------------------------------------------
// Configuration types
// ---------------------------------------------------------------------------

export interface RepositoryIdentity {
  readonly owner_slash_name: string;
  readonly default_branch: string;
}

export interface DetectorConfig {
  readonly repository_identity: RepositoryIdentity;
  readonly producer_internal_id_prefixes: readonly string[];
  readonly distributed_workflow_control_prefixes: readonly string[];
}

// ---------------------------------------------------------------------------
// Candidate model
// ---------------------------------------------------------------------------

/** Exhaustive reasons detectCandidates/decideProjection turns a typed overflow. */
export type OverflowReason =
  | "candidate-cap-exceeded"
  | "projection-detections-exceeded"
  | ReconstructionOverflowReason;

export const OVERFLOW_MATCHED: Record<OverflowReason, string> = {
  "candidate-cap-exceeded": "[overflow: candidate bound exceeded]",
  "projection-detections-exceeded": "[overflow: projection detections bound exceeded]",
  "token-ids-exceeded": "[overflow: token id bound exceeded]",
  "line-scan-exceeded": "[overflow: line scan bound exceeded]",
};

// Candidate is a discriminated object union so the resolver can switch
// exhaustively at compile time. Every spanned candidate carries a UTF-16
// half-open [start, end) source span used by the ownership stage.
export type Candidate =
  | { readonly type: "direct-id"; readonly value: string; readonly span: Span }
  | {
    readonly type: "reconstructed-id";
    readonly value: string;
    readonly original: string;
    readonly span: Span;
  }
  | { readonly type: "path"; readonly value: string; readonly span: Span }
  | { readonly type: "url"; readonly value: string; readonly span: Span }
  | { readonly type: "overflow"; readonly reason: OverflowReason };

export type CandidateType = Candidate["type"];

function assertNeverCandidate(c: never): never {
  throw new Error(`unhandled candidate: ${JSON.stringify(c)}`);
}

export function precedenceFor(type: CandidateType): CandidatePrecedence {
  switch (type) {
    case "url": return "url";
    case "path": return "path";
    case "reconstructed-id": return "reconstructed";
    case "direct-id": return "direct";
    case "overflow": return "direct";
    default: return assertNeverCandidate(type);
  }
}

export function matchedForCandidate(c: Candidate): string {
  switch (c.type) {
    case "direct-id":
      return c.value;
    case "reconstructed-id":
      return c.original;
    case "path":
      return c.value;
    case "url":
      return c.value;
    case "overflow":
      return OVERFLOW_MATCHED[c.reason];
    default:
      return assertNeverCandidate(c);
  }
}

// ---------------------------------------------------------------------------
// URL classification helpers
// ---------------------------------------------------------------------------

/**
 * Extract `owner/repo` from a URL whose host is exactly `github.com` or
 * `raw.githubusercontent.com` (case-insensitive). Authority-aware: strips
 * userinfo via last `@`, rejects port form, and rejects host suffix /
 * subdomain / path / userinfo-deception lookalikes by returning null.
 */
export function extractOwnerRepo(url: string): string | null {
  return authorityExtractOwnerRepo(url);
}

/** True when the URL points into the producer's own repo (case-insensitive). */
export function isProducerOwnedUrl(url: string, identity: RepositoryIdentity): boolean {
  return authorityIsProducerOwnedUrl(url, identity);
}

// ---------------------------------------------------------------------------
// Path classification helpers
// ---------------------------------------------------------------------------

/** Normalize backslashes and percent-encoded slashes to forward slashes. */
export function normalizePathToken(token: string): string {
  return token.replace(/\\/g, "/").replace(/%2[fF]/g, "/").replace(/%5[cC]/g, "/");
}

/** True when a docs path token is a CONCRETE .md file (not index/template/glob). */
export function isConcreteDocsPath(token: string): boolean {
  const normalized = normalizePathToken(token);
  if (normalized.endsWith("/README.md")) return false;
  if (/[<>{}]/.test(normalized)) return false;
  if (normalized.includes("*")) return false;
  if (!normalized.endsWith(".md")) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Resolution: candidate -> classification + category
// ---------------------------------------------------------------------------

export function resolveCandidate(c: Candidate, cfg: DetectorConfig): {
  classification: DependencyClass;
  category: DetectionCategory;
} {
  switch (c.type) {
    case "direct-id": {
      const m = /^([A-Z]{2,})-\d{1,}$/.exec(c.value);
      if (!m) {
        return { classification: "unclassified", category: "unclassified-entry" };
      }
      const prefix = m[1] ?? "";
      if (cfg.producer_internal_id_prefixes.includes(prefix)) {
        return { classification: "producer-internal", category: "concrete-id" };
      }
      if (cfg.distributed_workflow_control_prefixes.includes(prefix)) {
        return { classification: "generic-or-template", category: "distributed-control" };
      }
      return { classification: "unclassified", category: "unclassified-entry" };
    }
    case "reconstructed-id": {
      const m = /^([A-Z]{2,})-\d{1,}$/.exec(c.value);
      if (!m) {
        return { classification: "unclassified", category: "evasion-attempt" };
      }
      const prefix = m[1] ?? "";
      // Producer wins over distributed on overlap.
      if (cfg.producer_internal_id_prefixes.includes(prefix)) {
        return { classification: "producer-internal", category: "evasion-attempt" };
      }
      return { classification: "unclassified", category: "evasion-attempt" };
    }
    case "path": {
      if (isConcreteDocsPath(c.value)) {
        return { classification: "producer-internal", category: "concrete-path" };
      }
      return { classification: "generic-or-template", category: "concrete-path" };
    }
    case "url": {
      // Classify by repository identity, NOT by path content. A URL into
      // the producer repo is producer-internal at any path; a URL into a
      // different repo is consumer-resolvable. An empty identity fails closed.
      if (cfg.repository_identity.owner_slash_name.length === 0) {
        return { classification: "unclassified", category: "unclassified-entry" };
      }
      if (isProducerOwnedUrl(c.value, cfg.repository_identity)) {
        return { classification: "producer-internal", category: "fixed-url" };
      }
      return { classification: "consumer-resolvable", category: "fixed-url" };
    }
    case "overflow": {
      return { classification: "unclassified", category: "evasion-attempt" };
    }
    default:
      return assertNeverCandidate(c);
  }
}

/**
 * Build a typed projection-overflow Detection. Used by the gate when the
 * per-projection detection cap (combined failures + errors) is reached: one
 * is appended and classification stops. Evidence fields are empty/bounded
 * because the overflow is structural, not line-specific.
 */
export function projectionOverflowDetection(
  filePath: string,
  projection: Projection,
): Detection {
  return {
    text: "",
    line: 0,
    file: filePath,
    projection,
    classification: "unclassified",
    matched: OVERFLOW_MATCHED["projection-detections-exceeded"],
    snippet: "",
    category: "evasion-attempt",
  };
}
