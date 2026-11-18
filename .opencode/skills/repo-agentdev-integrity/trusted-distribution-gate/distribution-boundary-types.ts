// Adapter-level shared types for the distribution boundary checker.
//
// Split out of check_distribution_boundary.ts so the orchestrator and the
// IR-047/048 rules each depend on a focused, small type module rather than
// the whole adapter. Pure type module: no
// runtime values, no I/O imports.

import type { DetectionCategory, Projection } from "./distribution-boundary.ts";

export interface BoundaryFailure {
  category: DetectionCategory;
  file: string;
  line: number;
  snippet: string;
  matched: string;
}

export interface BoundaryReport {
  ok: boolean;
  failures: BoundaryFailure[];
  stats: {
    scanned_files: number;
    concrete_id_hits: number;
    concrete_path_hits: number;
    fixed_url_hits: number;
    /**
     * Producer-side traceability metadata findings (ADF-COVERS declaration
     * marker matches). Counted in both enforcement modes; only "enforce"
     * mode additionally turns them into gate failures.
     */
    producer_metadata_hits: number;
  };
  /**
   * Pre-scan notice channel (RA-004): emitted when the resolved scan-target
   * set is empty so adopters learn the scan did not execute before reading
   * ok/failures. Separate from `failures` on purpose: the invalid-run
   * adapter-failure Detection (`zero-targets:*`) stays the sole
   * gate-accounted record, and warnings are never re-counted into it, into
   * stats, or into the exit code.
   */
  warnings?: readonly string[];
}

export interface DistributionRuleFinding {
  rule: "ir047" | "ir048";
  file: string;
  line: number;
  matched: string;
  description: string;
}

export type { Projection };
