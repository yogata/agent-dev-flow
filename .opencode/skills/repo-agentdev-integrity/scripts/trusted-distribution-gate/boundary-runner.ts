// Boundary-detection runner.
//
// Invokes the side-effect-free detector on every text artifact per
// projection. Produces one GateResult per projection (five total). Empty
// projections produce an empty-passing GateResult so the launcher can
// iterate uniformly.

import type { GateResult, Projection } from "./types.ts";
import type { LoadedBlob } from "./blob-loader.ts";
import { decideProjection, type DetectorConfig } from "./boundary-pipeline.ts";

const SCANNED_PROJECTIONS: readonly Projection[] = ["source-runtime", "source-bootstrap"];
const PASSTHROUGH_PROJECTIONS: readonly Projection[] = ["link", "archive", "archive-installed"];

export function runBoundaryDetector(
  blobs: readonly LoadedBlob[],
  cfg: DetectorConfig,
): GateResult[] {
  const results: GateResult[] = [];
  for (const projection of SCANNED_PROJECTIONS) {
    const textFiles = blobs
      .filter((b) => b.projection === projection && b.text !== null)
      .map((b) => ({
        filePath: b.entry.path,
        projection,
        text: b.text ?? "",
      }));
    results.push(decideProjection(textFiles, projection, cfg).gate);
  }
  for (const projection of PASSTHROUGH_PROJECTIONS) {
    results.push({ pass: true, failures: [], errors: [], projection });
  }
  return results;
}
