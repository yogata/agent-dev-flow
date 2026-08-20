// Adapter-level shared types for the distribution boundary checker.
//
// Split out of check_distribution_boundary.ts so the orchestrator, baseline
// I/O, exemption I/O, and IR-046/047/048 rules each depend on a focused,
// small type module rather than the whole adapter. Pure type module: no
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
  };
}

export interface BaselineEntry {
  file: string;
  category: BoundaryFailure["category"];
  matched: string;
  count: number;
}

export interface BaselineFile {
  version: 1;
  rule_id: "IR-059";
  generated_at: string;
  description: string;
  entries: BaselineEntry[];
}

// §6.4.1 explicit exemption mechanism (B3). Exemptions are approval-backed
// exceptions, distinct from the baseline (which is unresolved debt). Only
// entries with review_status="accepted" are applied. rationale_ref must
// point at docs/adr/** or an accepted Design.
export type ExemptionRationaleCategory =
  | "harness_reference"
  | "accepted_canonical_doc"
  | "historical_context";

export type ExemptionReviewStatus = "accepted" | "rejected" | "pending";

export interface ExemptionEntry {
  id: string;
  rule: string;
  file: string;
  matched: string;
  rationale_category: ExemptionRationaleCategory;
  rationale_ref: string;
  added_at_commit: string;
  review_status: ExemptionReviewStatus;
}

export interface ExemptionFile {
  version: 1;
  description: string;
  entries: ExemptionEntry[];
}

export interface DeltaReport {
  new_failures: BoundaryFailure[];
  resolved: Array<{
    file: string;
    category: BoundaryFailure["category"];
    matched: string;
    baseline_count: number;
    current_count: number;
  }>;
  ok: boolean;
  stats: {
    current_total: number;
    baseline_total: number;
    new_delta: number;
    resolved_count: number;
  };
}

export interface DistributionRuleFinding {
  rule: "ir046" | "ir047" | "ir048";
  file: string;
  line: number;
  matched: string;
  description: string;
}

export type { Projection };
