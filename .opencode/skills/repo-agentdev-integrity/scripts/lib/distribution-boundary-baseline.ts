// Baseline I/O and delta computation for the distribution boundary adapter.
//
// Split out of check_distribution_boundary.ts so baseline concerns (snapshot
// serialization, structural parsing, drift detection) live in a focused
// module. Strict JSON parsing: loadBaseline validates the parsed value's
// shape before adopting it as a BaselineFile — no `as BaselineFile` cast.
//
// Per docs/specs/integrity/distribution-boundary.md §6.4 baseline policy:
// the baseline is unresolved-debt snapshot; new violations beyond baseline
// fail the gate (computeDelta.ok === false).

import * as fs from "fs";
import type {
  BaselineEntry,
  BaselineFile,
  BoundaryFailure,
  BoundaryReport,
  DeltaReport,
} from "./distribution-boundary-types.ts";
import {
  countBySignature,
  normalizeFileForBaseline,
  type FailureCategory,
} from "./distribution-boundary-fs.ts";

const BASELINE_CATEGORIES: ReadonlySet<FailureCategory> = new Set([
  "concrete-id",
  "concrete-path",
  "fixed-url",
  "unclassified-entry",
  "adapter-failure",
  "evasion-attempt",
]);

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isBaselineEntry(v: unknown): v is BaselineEntry {
  if (!isObject(v)) return false;
  return (
    typeof v.file === "string" &&
    typeof v.category === "string" &&
    BASELINE_CATEGORIES.has(v.category as FailureCategory) &&
    typeof v.matched === "string" &&
    typeof v.count === "number" &&
    Number.isInteger(v.count) &&
    v.count >= 0
  );
}

function parseBaseline(parsed: unknown): BaselineFile | null {
  if (!isObject(parsed)) return null;
  if (parsed.version !== 1) return null;
  if (parsed.rule_id !== "IR-059") return null;
  if (typeof parsed.description !== "string") return null;
  // generated_at is informational but required; any string is accepted.
  if (typeof parsed.generated_at !== "string") return null;
  if (!Array.isArray(parsed.entries)) return null;
  const entries: BaselineEntry[] = [];
  for (const e of parsed.entries) {
    if (!isBaselineEntry(e)) return null;
    entries.push(e);
  }
  return {
    version: 1,
    rule_id: "IR-059",
    generated_at: parsed.generated_at,
    description: parsed.description,
    entries,
  };
}

function readTextForLoad(p: string): string | null {
  try {
    return fs.readFileSync(p, "utf-8");
  } catch {
    return null;
  }
}

export function loadBaseline(baselinePath: string): BaselineFile | null {
  const text = readTextForLoad(baselinePath);
  if (text === null) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  return parseBaseline(parsed);
}

export function buildBaseline(
  report: BoundaryReport,
  repoRoot: string,
  description: string,
): BaselineFile {
  const counts = countBySignature(report.failures, repoRoot);
  const entries = Array.from(counts.values()).sort((a, b) => {
    if (a.file !== b.file) return a.file < b.file ? -1 : 1;
    if (a.category !== b.category) return a.category < b.category ? -1 : 1;
    return a.matched < b.matched ? -1 : a.matched > b.matched ? 1 : 0;
  });
  return {
    version: 1,
    rule_id: "IR-059",
    generated_at: new Date().toISOString().slice(0, 10),
    description,
    entries,
  };
}

export function saveBaseline(baseline: BaselineFile, baselinePath: string): void {
  fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2) + "\n", "utf8");
}

export function computeDelta(
  report: BoundaryReport,
  baseline: BaselineFile,
  repoRoot: string,
): DeltaReport {
  const currentCounts = countBySignature(report.failures, repoRoot);
  const baselineMap = new Map<string, BaselineEntry>();
  for (const e of baseline.entries) {
    baselineMap.set(`${e.file}\u0000${e.category}\u0000${e.matched}`, e);
  }

  const newFailures: BoundaryFailure[] = [];
  const resolved: DeltaReport["resolved"] = [];

  for (const [key, current] of currentCounts) {
    const base = baselineMap.get(key);
    const baselineCount = base ? base.count : 0;
    if (current.count > baselineCount) {
      const overshoot = current.count - baselineCount;
      const matches = report.failures.filter(
        (f) =>
          normalizeFileForBaseline(f.file, repoRoot) === current.file &&
          f.category === current.category &&
          f.matched === current.matched,
      );
      for (let i = 0; i < overshoot; i++) {
        const src = matches[baselineCount + i] ?? matches[matches.length - 1];
        if (src) newFailures.push(src);
      }
    } else if (current.count < baselineCount) {
      resolved.push({
        file: current.file,
        category: current.category,
        matched: current.matched,
        baseline_count: baselineCount,
        current_count: current.count,
      });
    }
  }

  for (const [key, base] of baselineMap) {
    if (!currentCounts.has(key)) {
      resolved.push({
        file: base.file,
        category: base.category,
        matched: base.matched,
        baseline_count: base.count,
        current_count: 0,
      });
    }
  }

  const baselineTotal = baseline.entries.reduce((sum, e) => sum + e.count, 0);
  return {
    new_failures: newFailures,
    resolved: resolved.sort((a, b) => {
      if (a.file !== b.file) return a.file < b.file ? -1 : 1;
      if (a.category !== b.category) return a.category < b.category ? -1 : 1;
      return a.matched < b.matched ? -1 : a.matched > b.matched ? 1 : 0;
    }),
    ok: newFailures.length === 0,
    stats: {
      current_total: report.failures.length,
      baseline_total: baselineTotal,
      new_delta: newFailures.length,
      resolved_count: resolved.length,
    },
  };
}
