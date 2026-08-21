// ADF-COVERS(verification): REQ-001-031
// ADF-COVERS(verification): REQ-002-011, REQ-002-027
// ADF-COVERS(verification): REQ-009-012
// Distribution reference boundary checker (adapter).
//
// This file is the adapter over the canonical side-effect-free detector at
// ./lib/distribution-boundary.ts. Per docs/designs/integrity/distribution-boundary.md
// (stable implementation contract) the canonical detector owns classification;
// this adapter adds filesystem scanning, baseline/exemption/delta bookkeeping,
// the repo-self-hosting-specific IR-046/047/048 rules, and the CLI.
//
// Detection behaviour (patterns, template allowance, README allowance) is
// owned by the lib module. This adapter only translates lib Detection records
// into the legacy BoundaryFailure shape and applies baseline/exemption policy.
//
// PR #2092 review fixes wired into the adapter:
//   - Strict byte-level reading (readArtifactBytes via classifyBytes) so
//     invalid UTF-8 / NUL in text artifacts surfaces as adapter-failure
//     instead of being silently replaced with U+FFFD.
//   - Unknown-extension fail-closed: collectTargets partitions entries into
//     text/binary/unknown via classifyByExtension; unknown-ext files are
//     reported as adapter-failure rather than scanned as text.
//   - Mandatory repository_identity at the adapter boundary: empty
//     owner_slash_name produces a missing-repository-identity adapter-failure
//     and skips scanning. Trusted launcher invocation is unaffected because
//     the launcher invokes its own Stage A pipeline; this adapter is the
//     workflow-skill entry point and must fail closed without a producer pin.
//
// Adapter body is split for the 250 pure-LOC ceiling:
//   - lib/distribution-boundary-types.ts           shared types
//   - lib/distribution-boundary-fs.ts              fs scanning + strict bytes
//   - lib/distribution-boundary-baseline.ts        baseline + delta
//   - lib/distribution-boundary-exemptions.ts      exemption load + apply
//   - lib/distribution-boundary-rules.ts           IR-046/047/048 rules
//
// Exit codes: 0 ok, 1 violation, 2 error.

import {
  classifyContentConfig,
  DEFAULT_DETECTOR_CONFIG,
  type DetectorConfig,
  type Detection,
  type Projection,
} from "./lib/distribution-boundary.ts";
import type {
  BoundaryFailure,
  BoundaryReport,
} from "./lib/distribution-boundary-types.ts";
import {
  collectTargets,
  readArtifactBytes,
} from "./lib/distribution-boundary-fs.ts";
import { runCli } from "./check_distribution_boundary_cli.ts";

export type {
  BoundaryFailure,
  BoundaryReport,
  BaselineEntry,
  BaselineFile,
  ExemptionEntry,
  ExemptionFile,
  ExemptionRationaleCategory,
  ExemptionReviewStatus,
  DeltaReport,
  DistributionRuleFinding,
} from "./lib/distribution-boundary-types.ts";
export {
  buildBaseline,
  saveBaseline,
  loadBaseline,
  computeDelta,
} from "./lib/distribution-boundary-baseline.ts";
export {
  loadExemptions,
  applyExemptions,
} from "./lib/distribution-boundary-exemptions.ts";
export { checkDistributionRules } from "./lib/distribution-boundary-rules.ts";
export {
  CONCRETE_ID_PATTERN,
  DOCS_PATH_PATTERN,
  FIXED_URL_PATTERN,
  RAW_FIXED_URL_PATTERN,
  isConcreteDocsPath,
} from "./lib/distribution-boundary.ts";

function detectionToFailure(d: Detection): BoundaryFailure {
  return {
    category: d.category,
    file: d.file,
    line: d.line,
    snippet: d.snippet,
    matched: d.matched,
  };
}

function emptyStats() {
  return {
    scanned_files: 0,
    concrete_id_hits: 0,
    concrete_path_hits: 0,
    fixed_url_hits: 0,
  };
}

export function checkDistributionBoundary(
  repoRoot: string,
  projection: Projection = "source",
  detectorConfig: DetectorConfig = DEFAULT_DETECTOR_CONFIG,
): BoundaryReport {
  const failures: BoundaryFailure[] = [];
  const stats = emptyStats();

  // Mandatory repository_identity at adapter boundary. An empty owner_slash_name
  // means the consumer did not pin a producer; rather than running the scan
  // with URL classification disabled (the pre-fix false-clean), we fail
  // closed with a single adapter-failure Detection. Trusted launcher
  // invocation is unaffected: the launcher uses its own Stage A pipeline.
  if (detectorConfig.repository_identity.owner_slash_name.length === 0) {
    failures.push({
      category: "adapter-failure",
      file: repoRoot,
      line: 0,
      snippet: "repository_identity.owner_slash_name is empty; producer is not pinned",
      matched: "missing-repository-identity",
    });
    return { ok: false, failures, stats };
  }

  const listing = collectTargets(repoRoot, projection);

  // Unknown extension fail-closed: each unknown-ext file is reported as an
  // adapter-failure Detection rather than silently skipped or scanned.
  for (const file of listing.unknownFiles) {
    failures.push({
      category: "adapter-failure",
      file,
      line: 0,
      snippet: "unknown extension; cannot classify as text or binary",
      matched: `unknown-extension:${file}`,
    });
  }

  stats.scanned_files = listing.textFiles.length;

  // Zero targets is a gate error (missing/unreachable projection), not clean.
  if (listing.textFiles.length === 0 && listing.unknownFiles.length === 0) {
    failures.push({
      category: "adapter-failure",
      file: repoRoot,
      line: 0,
      snippet: `zero scan targets found for projection '${projection}'`,
      matched: `zero-targets:${projection}`,
    });
  }

  for (const file of listing.textFiles) {
    const read = readArtifactBytes(file);
    if (!read.ok) {
      // Strict byte read: invalid UTF-8 / NUL is an adapter-failure, not a
      // silently replaced-charset scan.
      failures.push({
        category: "adapter-failure",
        file,
        line: 0,
        snippet: `artifact ${read.reason}: ${read.detail}`,
        matched: `${read.reason}:${file}`,
      });
      continue;
    }
    const detections = classifyContentConfig(read.text, file, projection, detectorConfig);
    for (const d of detections) {
      const f = detectionToFailure(d);
      if (f.category === "concrete-id") stats.concrete_id_hits += 1;
      else if (f.category === "concrete-path") stats.concrete_path_hits += 1;
      else if (f.category === "fixed-url") stats.fixed_url_hits += 1;
      failures.push(f);
    }
  }

  return {
    ok: failures.length === 0,
    failures,
    stats,
  };
}

if (require.main === module) {
  runCli();
}
