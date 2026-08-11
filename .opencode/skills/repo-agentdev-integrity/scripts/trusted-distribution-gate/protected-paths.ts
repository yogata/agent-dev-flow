// Protected-paths: trust-root file enumeration and matching.
//
// The trust root is the set of files whose integrity MUST be preserved
// between base_oid and candidate_oid. If a candidate modifies, deletes, or
// adds to any of these files, the launcher fails closed with
// ExitCode.ProtectedPathViolation.
//
// Two categories:
//   1. direct_paths  — trust-root launcher, checker, packager, and the
//                      trusted installation mapping scripts.
//   2. import_paths  — files transitively imported by the trust-root
//                      modules (types, helpers). Computed at runtime by
//                      walking static imports; recorded here as a stable
//                      baseline so the launcher can detect changes.
//
// Path-matching rules:
//   - Case-sensitive (Windows is case-insensitive at the filesystem level
//     but git is case-sensitive; trust root runs against git OIDs).
//   - Slash-style agnostic: backslash is normalized to forward slash.
//   - Path traversal (`..`) is never matched, even when normalization would
//     resolve to a protected path. The check is string-prefix based on the
//     normalized form, with explicit rejection of `..` segments.

export interface ProtectedPathSet {
  /** Repo-relative paths with forward slashes. */
  readonly direct_paths: readonly string[];
  /** Repo-relative transitive import paths with forward slashes. */
  readonly import_paths: readonly string[];
}

// ---------------------------------------------------------------------------
// Direct trust-root paths
// ---------------------------------------------------------------------------

const TRUST_ROOT_DIR =
  ".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate";

// Trust-root TypeScript modules (transitive imports are tracked here so the
// launcher can detect tampering with any module the launcher depends on).
const TRUST_ROOT_TS_MODULES: readonly string[] = [
  `${TRUST_ROOT_DIR}/types.ts`,
  `${TRUST_ROOT_DIR}/boundary-pipeline.ts`,
  `${TRUST_ROOT_DIR}/text-binary.ts`,
  `${TRUST_ROOT_DIR}/protected-paths.ts`,
  `${TRUST_ROOT_DIR}/git-blob-reader.ts`,
  `${TRUST_ROOT_DIR}/manifest.ts`,
  `${TRUST_ROOT_DIR}/archive-builder.ts`,
  `${TRUST_ROOT_DIR}/launcher.ts`,
  `${TRUST_ROOT_DIR}/index.ts`,
];

const TRUST_ROOT_TS_TESTS: readonly string[] = [
  `${TRUST_ROOT_DIR}/boundary-pipeline.test.ts`,
  `${TRUST_ROOT_DIR}/text-binary.test.ts`,
  `${TRUST_ROOT_DIR}/protected-paths.test.ts`,
  `${TRUST_ROOT_DIR}/git-blob-reader.test.ts`,
  `${TRUST_ROOT_DIR}/manifest.test.ts`,
  `${TRUST_ROOT_DIR}/archive-builder.test.ts`,
  `${TRUST_ROOT_DIR}/launcher.test.ts`,
];

const TRUST_ROOT_CONFIG: readonly string[] = [
  `${TRUST_ROOT_DIR}/tsconfig.json`,
  `${TRUST_ROOT_DIR}/package.json`,
];

const TRUSTED_INSTALLATION_SCRIPTS: readonly string[] = [
  // The trusted launcher entry script (root-level).
  "scripts/trusted-distribution-gate.ps1",
  // Trusted installation mapping scripts.
  "scripts/install-consumer-opencode.ps1",
  "scripts/check-consumer-opencode.ps1",
  "scripts/install-from-archive.ps1",
  "scripts/package-release-archive.ps1",
];

/**
 * Stable enumeration of every direct trust-root file. Any change to the
 * membership of this list is itself a trust-root change and must be reviewed.
 */
export const TRUST_ROOT_DIRECT_PATHS: readonly string[] = [
  ...TRUSTED_INSTALLATION_SCRIPTS,
  ...TRUST_ROOT_DIR_FILES(),
];

function TRUST_ROOT_DIR_FILES(): readonly string[] {
  return [
    ...TRUST_ROOT_TS_MODULES,
    ...TRUST_ROOT_TS_TESTS,
    ...TRUST_ROOT_CONFIG,
  ];
}

// ---------------------------------------------------------------------------
// Path normalization and matching
// ---------------------------------------------------------------------------

export function normalizeSlashes(p: string): string {
  return p.replace(/\\/g, "/");
}

export function hasTraversal(p: string): boolean {
  const segments = normalizeSlashes(p).split("/");
  return segments.some((s) => s === "..");
}

/**
 * Decide whether a given path is protected. Path traversal rejects the match
 * even when normalization would otherwise hit a protected entry.
 */
export function isProtectedPath(path: string, set: ProtectedPathSet): boolean {
  if (hasTraversal(path)) return false;
  const norm = normalizeSlashes(path);
  const all = listAllProtectedPaths(set);
  return all.includes(norm);
}

/**
 * Return all protected paths (direct + import), deduplicated and sorted.
 */
export function listAllProtectedPaths(set: ProtectedPathSet): readonly string[] {
  const merged = new Set<string>();
  for (const p of set.direct_paths) merged.add(normalizeSlashes(p));
  for (const p of set.import_paths) merged.add(normalizeSlashes(p));
  return Array.from(merged).sort();
}

/**
 * Default protected-path set used by the launcher when no override is given.
 */
export const DEFAULT_PROTECTED_PATH_SET: ProtectedPathSet = {
  direct_paths: TRUST_ROOT_DIRECT_PATHS,
  import_paths: [],
};
