// Boundary-detection runner.
//
// Scans every text artifact across all FOUR canonical projections
// (parent defect #3 + Design distribution-boundary.md §58-67). The manifest
// model exposes exactly source / link / archive / archive-installed; the
// internal source subsets (runtime, bootstrap, archive-extra) are routed
// into the appropriate projection by this runner.
//
// Per-projection scan routing:
//   source            — every LoadedBlob whose subset is runtime or
//                       bootstrap. Detection.projection = "source".
//                       File path is the candidate repo-relative path.
//   link              — runtime blobs mapped to .opencode/** paths.
//                       Detection.projection = "link".
//   archive           — runtime blobs (under candidate path) PLUS
//                       archive-extra blobs (install-from-archive.ps1,
//                       README-INSTALL.md). Detection.projection = "archive".
//   archive-installed — runtime blobs mapped to .opencode/** paths.
//                       Detection.projection = "archive-installed".

import type { GateResult, Projection } from "./types.ts";
import type { LoadedBlob } from "./blob-loader.ts";
import {
  decideProjection,
  type ClassifyFileInput,
} from "./boundary-gate.ts";
import type { DetectorConfig } from "./boundary-pipeline.ts";
import { mapRuntimeToLinkPath } from "./manifest.ts";

const PROJECTIONS: readonly Projection[] = [
  "source",
  "link",
  "archive",
  "archive-installed",
];

export interface BoundaryInput {
  /** Blobs loaded by blob-loader. */
  readonly blobs: readonly LoadedBlob[];
}

function buildProjectionFiles(
  projection: Projection,
  input: BoundaryInput,
): ClassifyFileInput[] {
  const out: ClassifyFileInput[] = [];

  if (projection === "source") {
    for (const b of input.blobs) {
      if (b.subset !== "runtime" && b.subset !== "bootstrap") continue;
      if (b.text !== null) out.push({ filePath: b.entry.path, projection, text: b.text });
    }
    return out;
  }

  if (projection === "archive") {
    for (const b of input.blobs) {
      if (b.subset !== "runtime" && b.subset !== "archive-extra") continue;
      if (b.text !== null) out.push({ filePath: b.entry.path, projection, text: b.text });
    }
    return out;
  }

  for (const b of input.blobs) {
    if (b.subset !== "runtime") continue;
    if (b.text !== null) {
      const mapped = mapRuntimeToLinkPath(b.entry.path);
      out.push({ filePath: mapped, projection, text: b.text });
    }
  }
  return out;
}

export function runBoundaryDetector(
  input: BoundaryInput,
  cfg: DetectorConfig,
): GateResult[] {
  const results: GateResult[] = [];
  for (const projection of PROJECTIONS) {
    const files = buildProjectionFiles(projection, input);
    results.push(decideProjection(files, projection, cfg).gate);
  }
  return results;
}
