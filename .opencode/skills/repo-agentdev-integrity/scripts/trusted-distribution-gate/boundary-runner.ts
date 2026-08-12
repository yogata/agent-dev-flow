// Boundary-detection runner.
//
// Scans every text artifact represented by all FIVE manifest projections
// (parent defect #3). The previous implementation only scanned
// source-runtime + source-bootstrap and hardcoded the other three as PASS,
// which meant a producer-internal reference inside README-INSTALL.md or
// scripts/install-from-archive.ps1 (archive extras) would slip through, and
// the link/archive-installed copies would not be checked under their mapped
// .opencode/** paths.
//
// Map blob → per-projection file path explicitly so each Detection carries
// the projection-relative path (not the source-runtime path) that the
// consumer sees.

import type { GateResult, Projection } from "./types.ts";
import type { LoadedBlob } from "./blob-loader.ts";
import {
  decideProjection,
  type ClassifyFileInput,
  type DetectorConfig,
} from "./boundary-pipeline.ts";
import { mapRuntimeToLinkPath } from "./manifest.ts";

const PROJECTIONS: readonly Projection[] = [
  "source-runtime",
  "source-bootstrap",
  "link",
  "archive",
  "archive-installed",
];

export interface BoundaryInput {
  /** Blobs loaded by blob-loader. */
  readonly blobs: readonly LoadedBlob[];
  /** Runtime inputs (source-runtime paths) used to build link/archive-installed. */
  readonly runtimeInputs: readonly { readonly path: string; readonly sha256: string; readonly size: number }[];
  /** Bootstrap inputs (source-bootstrap paths). */
  readonly bootstrapInputs: readonly { readonly path: string; readonly sha256: string; readonly size: number }[];
  /** Archive extras (install-from-archive.ps1, README-INSTALL.md). */
  readonly extraInputs: readonly { readonly path: string; readonly sha256: string; readonly size: number }[];
}

interface BlobIndex {
  readonly byPath: Map<string, LoadedBlob>;
}

function indexBlobs(blobs: readonly LoadedBlob[]): BlobIndex {
  const byPath = new Map<string, LoadedBlob>();
  for (const b of blobs) byPath.set(b.entry.path, b);
  return { byPath };
}

function pickText(index: BlobIndex, path: string): string | null {
  const b = index.byPath.get(path);
  if (!b) return null;
  return b.text;
}

function buildProjectionFiles(
  projection: Projection,
  input: BoundaryInput,
  index: BlobIndex,
): ClassifyFileInput[] {
  const out: ClassifyFileInput[] = [];

  if (projection === "source-runtime") {
    for (const e of input.runtimeInputs) {
      const text = pickText(index, e.path);
      if (text !== null) out.push({ filePath: e.path, projection, text });
    }
    return out;
  }

  if (projection === "source-bootstrap") {
    for (const e of input.bootstrapInputs) {
      const text = pickText(index, e.path);
      if (text !== null) out.push({ filePath: e.path, projection, text });
    }
    return out;
  }

  if (projection === "archive") {
    // archive = runtime + extras. Each entry is scanned under its
    // archive-relative path (the candidate repo-relative path verbatim).
    for (const e of input.runtimeInputs) {
      const text = pickText(index, e.path);
      if (text !== null) out.push({ filePath: e.path, projection, text });
    }
    for (const e of input.extraInputs) {
      const text = pickText(index, e.path);
      if (text !== null) out.push({ filePath: e.path, projection, text });
    }
    return out;
  }

  // link and archive-installed share the .opencode/** mapping.
  // The detector sees the mapped file path (what the consumer sees), not
  // the source-runtime path. This ensures violations are reported against
  // the consumer-visible artifact.
  for (const e of input.runtimeInputs) {
    const text = pickText(index, e.path);
    if (text !== null) {
      const mapped = mapRuntimeToLinkPath(e.path);
      out.push({ filePath: mapped, projection, text });
    }
  }
  return out;
}

export function runBoundaryDetector(
  input: BoundaryInput,
  cfg: DetectorConfig,
): GateResult[] {
  const index = indexBlobs(input.blobs);
  const results: GateResult[] = [];
  for (const projection of PROJECTIONS) {
    const files = buildProjectionFiles(projection, input, index);
    results.push(decideProjection(files, projection, cfg).gate);
  }
  return results;
}
