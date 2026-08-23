// Canonical manifest builder for the accepted package contract.
//
// Four canonical projections per docs/designs/integrity/distribution-boundary.md
// §58-67:
//
//   source           — every tracked regular file under
//                      src/opencode/commands/agentdev/**,
//                      src/opencode/skills/agentdev-*/**,
//                      src/opencode/skills/japanese-tech-writing/**
//                      (including tests, fixtures, README, package.json,
//                      tsconfig, lockfiles, and metadata — none excluded)
//                      PLUS the trusted consumer bootstrap entry
//                      scripts/install.ps1 and its runtime dependency
//                      module scripts/consumer/common.ps1 (REQ-050-011:
//                      the public entry and its execution dependency set
//                      must be fully represented in the manifest).
//
//   link             — deterministic .opencode/** mapping of source-runtime
//                      with identical blob digests.
//
//   archive          — source-runtime plus the archive-dedicated installer
//                      original scripts/consumer/archive/install.ps1
//                      (projected as scripts/install.ps1 inside the
//                      archive, REQ-050-010) and README-INSTALL.md,
//                      wrapped under agentdev-release-<short>/ at archive
//                      root.
//
//   archive-installed — deterministic .opencode/** mapping of source-runtime
//                      (no archive installer, no README-INSTALL.md;
//                      the installer is verified separately by trusted
//                      deterministic mapping/digest comparison, never by
//                      execution).
//
// Runtime and bootstrap are internal source subsets (SourceSubset), not
// public projection labels. They exist only so the manifest builder can
// route paths into the correct projection (e.g. bootstrap is in `source`
// but excluded from `link`/`archive-installed`).
//
// The builder is pure: it does not read git, the filesystem, or the network.
// The launcher feeds it the candidate tree's git entries plus their
// digests.

// ADF-COVERS(implementation): REQ-050-011
// ADF-COVERS(verification): REQ-050-011

import type { ManifestEntry, ManifestSet, Projection, SourceSubset } from "./types.ts";

export interface ManifestEntryInput {
  readonly path: string;
  readonly sha256: string;
  readonly size: number;
}

// ---------------------------------------------------------------------------
// Source path predicates (internal subsets)
// ---------------------------------------------------------------------------

const RUNTIME_PREFIXES: readonly string[] = [
  "src/opencode/commands/agentdev/",
  "src/opencode/skills/agentdev-",
  "src/opencode/skills/japanese-tech-writing/",
];

const BOOTSTRAP_PATHS: readonly string[] = [
  "scripts/install.ps1",
  "scripts/consumer/common.ps1",
];

const ARCHIVE_EXTRA_REQUIRED: readonly string[] = [
  // Archive-dedicated installer ORIGINAL (REQ-050-010). Inside the release
  // archive it is placed under the projection name scripts/install.ps1 by
  // the packager; the manifest tracks the repository original path.
  "scripts/consumer/archive/install.ps1",
  "README-INSTALL.md",
];

export function isRequiredRuntimePath(path: string): boolean {
  return RUNTIME_PREFIXES.some((p) => path.startsWith(p));
}

export function isRequiredBootstrapPath(path: string): boolean {
  return BOOTSTRAP_PATHS.includes(path);
}

export function isRequiredArchiveExtraPath(path: string): boolean {
  return ARCHIVE_EXTRA_REQUIRED.includes(path);
}

export function classifySourceSubset(path: string): SourceSubset | null {
  if (isRequiredRuntimePath(path)) return "runtime";
  if (isRequiredBootstrapPath(path)) return "bootstrap";
  if (isRequiredArchiveExtraPath(path)) return "archive-extra";
  return null;
}

// ---------------------------------------------------------------------------
// SHA-256 validation
// ---------------------------------------------------------------------------

const SHA256_PATTERN = /^[0-9a-f]{64}$/;

function assertValidEntry(entry: ManifestEntryInput, projection: Projection): void {
  if (!SHA256_PATTERN.test(entry.sha256)) {
    throw new ManifestError(
      projection,
      `invalid sha256 for ${entry.path}: ${entry.sha256}`,
    );
  }
  if (!Number.isInteger(entry.size) || entry.size < 0) {
    throw new ManifestError(
      projection,
      `invalid size for ${entry.path}: ${entry.size}`,
    );
  }
}

export class ManifestError extends Error {
  constructor(public readonly projection: Projection, message: string) {
    super(message);
    this.name = "ManifestError";
  }
}

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

function toManifestEntry(input: ManifestEntryInput): ManifestEntry {
  return {
    path: input.path,
    sha256: input.sha256,
    size: input.size,
  };
}

function dedupeAndSort(
  projection: Projection,
  entries: readonly ManifestEntry[],
): readonly ManifestEntry[] {
  const seen = new Set<string>();
  for (const e of entries) {
    if (seen.has(e.path)) {
      throw new ManifestError(projection, `duplicate path: ${e.path}`);
    }
    seen.add(e.path);
  }
  return [...entries].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

/**
 * Build the canonical `source` projection. Source includes runtime
 * (src/opencode/**) AND bootstrap artifacts (scripts/install.ps1 plus its
 * runtime dependency scripts/consumer/common.ps1, REQ-050-011). Both are
 * producer-authored text shipped to the consumer.
 */
export function buildSourceManifest(
  inputs: readonly ManifestEntryInput[],
): ManifestSet {
  const filtered = inputs.filter(
    (i) => isRequiredRuntimePath(i.path) || isRequiredBootstrapPath(i.path),
  );
  if (filtered.length === 0) {
    throw new ManifestError("source", "zero target entries");
  }
  for (const required of BOOTSTRAP_PATHS) {
    if (!filtered.some((f) => f.path === required)) {
      throw new ManifestError("source", `missing required bootstrap script: ${required}`);
    }
  }
  for (const e of filtered) assertValidEntry(e, "source");
  const entries = dedupeAndSort("source", filtered.map(toManifestEntry));
  return { projection: "source", entries };
}

/**
 * Map a source-runtime path to its .opencode/** link path. Throws if the
 * input is not a runtime path (defensive — the caller filters upstream).
 */
export function mapRuntimeToLinkPath(runtimePath: string): string {
  const prefix = RUNTIME_PREFIXES.find((p) => runtimePath.startsWith(p));
  if (!prefix) {
    throw new ManifestError("link", `not a runtime path: ${runtimePath}`);
  }
  return ".opencode/" + runtimePath.substring("src/opencode/".length);
}

export function buildLinkManifest(
  runtimeInputs: readonly ManifestEntryInput[],
): ManifestSet {
  if (runtimeInputs.length === 0) {
    throw new ManifestError("link", "zero target entries");
  }
  const mapped: ManifestEntry[] = runtimeInputs.map((i) => {
    assertValidEntry(i, "link");
    return { path: mapRuntimeToLinkPath(i.path), sha256: i.sha256, size: i.size };
  });
  return { projection: "link", entries: dedupeAndSort("link", mapped) };
}

export function buildArchiveManifest(
  runtimeInputs: readonly ManifestEntryInput[],
  extraInputs: readonly ManifestEntryInput[],
): ManifestSet {
  const extras = extraInputs.filter((i) => isRequiredArchiveExtraPath(i.path));
  for (const required of ARCHIVE_EXTRA_REQUIRED) {
    if (!extras.some((e) => e.path === required)) {
      throw new ManifestError("archive", `missing required entry: ${required}`);
    }
  }
  const combined = [...runtimeInputs, ...extras];
  if (combined.length === 0) {
    throw new ManifestError("archive", "zero target entries");
  }
  for (const e of combined) assertValidEntry(e, "archive");
  return {
    projection: "archive",
    entries: dedupeAndSort("archive", combined.map(toManifestEntry)),
  };
}

export function buildArchiveInstalledManifest(
  runtimeInputs: readonly ManifestEntryInput[],
): ManifestSet {
  if (runtimeInputs.length === 0) {
    throw new ManifestError("archive-installed", "zero target entries");
  }
  const mapped: ManifestEntry[] = runtimeInputs.map((i) => {
    assertValidEntry(i, "archive-installed");
    return { path: mapRuntimeToLinkPath(i.path), sha256: i.sha256, size: i.size };
  });
  const entries = dedupeAndSort("archive-installed", mapped);
  const result: ManifestSet = { projection: "archive-installed", entries };
  if (result.projection !== "archive-installed") {
    throw new ManifestError("archive-installed", `projection label corrupted: ${result.projection}`);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Equality / diff — delegated to manifest-diff.ts (split for LOC ceiling)
// ---------------------------------------------------------------------------

export { manifestEntryEquals, diffManifests } from "./manifest-diff.ts";
export type { ManifestDiff } from "./manifest-diff.ts";
