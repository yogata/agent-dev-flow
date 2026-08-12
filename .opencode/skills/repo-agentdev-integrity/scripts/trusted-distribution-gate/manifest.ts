// Canonical manifest builder for the accepted package contract.
//
// Five projections are defined per the contract:
//
//   source-runtime    — every tracked regular file under
//                       src/opencode/commands/agentdev/**,
//                       src/opencode/skills/agentdev-*/**,
//                       src/opencode/skills/japanese-tech-writing/**
//                       (including tests, fixtures, README, package.json,
//                       tsconfig, lockfiles, and metadata — none excluded).
//
//   source-bootstrap  — consumer-facing scripts/install-consumer-opencode.ps1
//                       and scripts/check-consumer-opencode.ps1.
//
//   link              — deterministic .opencode/** mapping of source-runtime
//                       with identical blob digests.
//
//   archive           — source-runtime plus scripts/install-from-archive.ps1
//                       and README-INSTALL.md.
//
//   archive-installed — deterministic .opencode/** mapping of source-runtime
//                       (no install-from-archive.ps1, no README-INSTALL.md;
//                       the installer is verified separately by trusted
//                       deterministic mapping/digest comparison, never by
//                       execution).
//
// The builder is pure: it does not read git, the filesystem, or the network.
// The launcher feeds it the candidate tree's git entries plus their
// digests.

import type { ManifestEntry, ManifestSet, Projection } from "./types.ts";

export interface ManifestEntryInput {
  readonly path: string;
  readonly sha256: string;
  readonly size: number;
}

// ---------------------------------------------------------------------------
// Source path predicates
// ---------------------------------------------------------------------------

const RUNTIME_PREFIXES: readonly string[] = [
  "src/opencode/commands/agentdev/",
  "src/opencode/skills/agentdev-",
  "src/opencode/skills/japanese-tech-writing/",
];

const BOOTSTRAP_PATHS: readonly string[] = [
  "scripts/install-consumer-opencode.ps1",
  "scripts/check-consumer-opencode.ps1",
];

const ARCHIVE_EXTRA_REQUIRED: readonly string[] = [
  "scripts/install-from-archive.ps1",
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

export function buildSourceRuntimeManifest(
  inputs: readonly ManifestEntryInput[],
): ManifestSet {
  const filtered = inputs.filter((i) => isRequiredRuntimePath(i.path));
  if (filtered.length === 0) {
    throw new ManifestError("source-runtime", "zero target entries");
  }
  for (const e of filtered) assertValidEntry(e, "source-runtime");
  const entries = dedupeAndSort("source-runtime", filtered.map(toManifestEntry));
  return { projection: "source-runtime", entries };
}

export function buildSourceBootstrapManifest(
  inputs: readonly ManifestEntryInput[],
): ManifestSet {
  const filtered = inputs.filter((i) => isRequiredBootstrapPath(i.path));
  for (const required of BOOTSTRAP_PATHS) {
    if (!filtered.some((f) => f.path === required)) {
      throw new ManifestError("source-bootstrap", `missing required entry: ${required}`);
    }
  }
  for (const e of filtered) assertValidEntry(e, "source-bootstrap");
  const entries = dedupeAndSort("source-bootstrap", filtered.map(toManifestEntry));
  return { projection: "source-bootstrap", entries };
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
  // src/opencode/commands/agentdev/foo.md -> .opencode/commands/agentdev/foo.md
  // src/opencode/skills/agentdev-foo/bar.md -> .opencode/skills/agentdev-foo/bar.md
  // src/opencode/skills/japanese-tech-writing/bar.md -> .opencode/skills/japanese-tech-writing/bar.md
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
  // Same .opencode/** path mapping as the link projection, but the
  // projection label MUST be archive-installed (parent defect #7).
  const mapped: ManifestEntry[] = runtimeInputs.map((i) => {
    assertValidEntry(i, "archive-installed");
    return { path: mapRuntimeToLinkPath(i.path), sha256: i.sha256, size: i.size };
  });
  const entries = dedupeAndSort("archive-installed", mapped);
  const result: ManifestSet = { projection: "archive-installed", entries };
  // Defensive assertion: catch any future refactor that breaks the label.
  if (result.projection !== "archive-installed") {
    throw new ManifestError("archive-installed", `projection label corrupted: ${result.projection}`);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Equality / diff
// ---------------------------------------------------------------------------

export function manifestEntryEquals(a: ManifestEntry, b: ManifestEntry): boolean {
  return a.path === b.path && a.sha256 === b.sha256 && a.size === b.size;
}

export interface ManifestDiff {
  readonly extra: readonly ManifestEntry[];
  readonly missing: readonly ManifestEntry[];
  readonly digest_mismatches: readonly ManifestEntry[];
}

export function diffManifests(
  expected: readonly ManifestEntry[],
  actual: readonly ManifestEntry[],
): ManifestDiff {
  const expectedMap = new Map(expected.map((e) => [e.path, e]));
  const actualMap = new Map(actual.map((e) => [e.path, e]));
  const extra: ManifestEntry[] = [];
  const missing: ManifestEntry[] = [];
  const digestMismatches: ManifestEntry[] = [];

  for (const [path, e] of actualMap) {
    if (!expectedMap.has(path)) extra.push(e);
  }
  for (const [path, e] of expectedMap) {
    const a = actualMap.get(path);
    if (!a) {
      missing.push(e);
    } else if (a.sha256 !== e.sha256 || a.size !== e.size) {
      digestMismatches.push(e);
    }
  }
  return {
    extra: extra.sort((x, y) => x.path.localeCompare(y.path)),
    missing: missing.sort((x, y) => x.path.localeCompare(y.path)),
    digest_mismatches: digestMismatches.sort((x, y) => x.path.localeCompare(y.path)),
  };
}
