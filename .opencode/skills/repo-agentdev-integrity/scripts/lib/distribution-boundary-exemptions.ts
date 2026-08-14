// Exemption I/O and matching for the distribution boundary adapter.
//
// §6.4.1 explicit exemption mechanism (B3): approval-backed exceptions that
// are distinct from the baseline. Only entries with review_status="accepted"
// are applied by applyExemptions. loadExemptions validates the parsed
// value's shape structurally — no `as ExemptionFile` cast — because the
// exemption file is consumed verbatim and any malformed entry would weaken
// the gate.

import * as fs from "fs";
import type {
  BoundaryFailure,
  ExemptionEntry,
  ExemptionFile,
  ExemptionRationaleCategory,
  ExemptionReviewStatus,
} from "./distribution-boundary-types.ts";
import { normalizeFileForBaseline } from "./distribution-boundary-fs.ts";

const RATIONALE_CATEGORIES: ReadonlySet<ExemptionRationaleCategory> = new Set([
  "harness_reference",
  "accepted_canonical_doc",
  "historical_context",
]);

const REVIEW_STATUSES: ReadonlySet<ExemptionReviewStatus> = new Set([
  "accepted",
  "rejected",
  "pending",
]);

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isExemptionEntry(v: unknown): v is ExemptionEntry {
  if (!isObject(v)) return false;
  return (
    typeof v.id === "string" &&
    typeof v.rule === "string" &&
    typeof v.file === "string" &&
    typeof v.matched === "string" &&
    typeof v.rationale_category === "string" &&
    RATIONALE_CATEGORIES.has(v.rationale_category as ExemptionRationaleCategory) &&
    typeof v.rationale_ref === "string" &&
    typeof v.added_at_commit === "string" &&
    typeof v.review_status === "string" &&
    REVIEW_STATUSES.has(v.review_status as ExemptionReviewStatus)
  );
}

function parseExemptions(parsed: unknown): ExemptionFile | null {
  if (!isObject(parsed)) return null;
  if (parsed.version !== 1) return null;
  if (typeof parsed.description !== "string") return null;
  if (!Array.isArray(parsed.entries)) return null;
  const entries: ExemptionEntry[] = [];
  for (const e of parsed.entries) {
    if (!isExemptionEntry(e)) return null;
    entries.push(e);
  }
  return { version: 1, description: parsed.description, entries };
}

function readTextForLoad(p: string): string | null {
  try {
    return fs.readFileSync(p, "utf-8");
  } catch {
    return null;
  }
}

export function loadExemptions(exemptionsPath: string): ExemptionFile | null {
  const text = readTextForLoad(exemptionsPath);
  if (text === null) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  return parseExemptions(parsed);
}

export interface ExemptionMatchResult {
  exempted: BoundaryFailure[];
  remaining: BoundaryFailure[];
}

export function applyExemptions(
  failures: BoundaryFailure[],
  exemptions: ExemptionFile | null,
  repoRoot: string,
): ExemptionMatchResult {
  if (exemptions === null || exemptions.entries.length === 0) {
    return { exempted: [], remaining: failures };
  }
  const accepted = exemptions.entries.filter((e) => e.review_status === "accepted");
  if (accepted.length === 0) {
    return { exempted: [], remaining: failures };
  }
  const exempted: BoundaryFailure[] = [];
  const remaining: BoundaryFailure[] = [];
  for (const f of failures) {
    const normalizedFile = normalizeFileForBaseline(f.file, repoRoot);
    const hit = accepted.find(
      (e) => e.file === normalizedFile && e.matched === f.matched,
    );
    if (hit) {
      exempted.push(f);
    } else {
      remaining.push(f);
    }
  }
  return { exempted, remaining };
}
