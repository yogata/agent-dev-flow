// Mode-aware policy evaluation for the trust-root launcher.
//
// Extracted from launcher.ts to keep that orchestrator under the 250 pure
// LOC ceiling. Pure functions: same inputs → same decision, no I/O, no
// mutation. The orchestrator feeds the aggregated protected-check result
// and a mode in, gets a typed decision out.
//
// Modes (parent defect #4, #5):
//   "final"   — strict. Any protected-path change is fatal. Boundary
//               violations and unclassified entries are fatal. Used by
//               the steady-state trusted distribution gate after the
//               trust root is seeded.
//   "seed"    — first-bootstrap tolerant. Candidate-ADDED protected paths
//               are permitted (the bootstrap-PR case where the trust root
//               itself is being introduced). Modified or deleted protected
//               paths remain FATAL in every mode. Boundary findings and
//               unclassified entries are recorded as evidence but do NOT
//               make the gate fail (the seed PR may legitimately reference
//               producer artifacts that the steady-state detector would
//               reject). Trust/archive integrity failures (path safety,
//               archive verification, archive-installed verification) are
//               still fatal in every mode.
//
// The `--bootstrap-mode` CLI flag is the user-facing alias for `seed`.

import { ExitCode } from "./types.ts";
import type { ProtectedPathOutcome, ProtectedCheckAggregated } from "./protected-check.ts";

export type LauncherMode = "final" | "seed";

export type PolicyDecision =
  | { readonly kind: "pass" }
  | { readonly kind: "fail"; readonly code: typeof ExitCode.ProtectedPathViolation; readonly message: string }
  | { readonly kind: "error"; readonly code: typeof ExitCode.Unexpected; readonly message: string };

/**
 * Apply mode-aware protected-path policy to the aggregated outcomes.
 *
 * Returns:
 *   - pass: every outcome is acceptable under the mode
 *   - fail: at least one protected path was modified or deleted (or, in
 *     final mode, added). The launcher MUST exit with
 *     ExitCode.ProtectedPathViolation.
 *   - error: an internal invariant was violated (e.g. both-missing for a
 *     path the caller expected to exist).
 *
 * Bootstrap/seed mode permits candidate-only paths. Modified or deleted
 * paths are fatal in every mode (parent defect #4).
 */
export function evaluateProtectedPolicy(
  aggregated: ProtectedCheckAggregated,
  mode: LauncherMode,
): PolicyDecision {
  const modified: ProtectedPathOutcome[] = [];
  const deleted: ProtectedPathOutcome[] = [];
  const added: ProtectedPathOutcome[] = [];
  const bothMissing: ProtectedPathOutcome[] = [];

  for (const o of aggregated.outcomes) {
    switch (o.status) {
      case "both-present-same":
        break;
      case "both-present-differ":
        modified.push(o);
        break;
      case "base-only":
        deleted.push(o);
        break;
      case "candidate-only":
        added.push(o);
        break;
      case "both-missing":
        bothMissing.push(o);
        break;
    }
  }

  // Modified/deleted protected paths are fatal in EVERY mode.
  if (modified.length > 0) {
    return failViolation(`protected path(s) modified: ${formatPaths(modified)}`);
  }
  if (deleted.length > 0) {
    return failViolation(`protected path(s) deleted: ${formatPaths(deleted)}`);
  }

  // Added protected paths: fatal in final mode; permitted in seed mode.
  if (mode === "final" && added.length > 0) {
    return failViolation(
      `protected path(s) added in candidate without seed mode: ${formatPaths(added)}`,
    );
  }

  // both-missing: mandatory runtime files are auto-enumerated from
  // current trusted runtime, so candidate MUST contain them. Fatal in
  // EVERY mode (blocker round 5 #9).
  if (bothMissing.length > 0) {
    return failViolation(
      `protected path(s) missing at both base and candidate: ${formatPaths(bothMissing)}`,
    );
  }

  return { kind: "pass" };
}

function failViolation(message: string): PolicyDecision {
  return { kind: "fail", code: ExitCode.ProtectedPathViolation, message };
}

function formatPaths(outcomes: readonly ProtectedPathOutcome[]): string {
  return outcomes.map((o) => o.path).sort().join(", ");
}

/**
 * Decide whether a boundary violation or unclassified error is fatal under
 * the given mode. In `final` mode both are fatal. In `seed` mode both are
 * recorded as evidence (caller MUST include them in the result summary) but
 * neither is fatal.
 */
export function isBoundaryFailureFatal(mode: LauncherMode): boolean {
  return mode === "final";
}
