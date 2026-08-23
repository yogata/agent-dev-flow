// Protected-paths: trust-root file enumeration and matching.
//
// The trust root is the set of files whose integrity MUST be preserved
// between base_oid and candidate_oid. If a candidate modifies or deletes
// any of these files, the launcher fails closed with
// ExitCode.ProtectedPathViolation. In bootstrap/seed mode, candidate-ADDED
// trust-root files are permitted (the bootstrap-PR case); modified or
// deleted protected files remain fatal in every mode (parent defect #4).
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
//
// Stage A/B boundary (parent defect #3):
//   Stage A protects its own runtime closure plus the trusted launcher
//   script and the consumer install entry with its runtime dependency
//   (scripts/install.ps1 + scripts/consumer/common.ps1). Stage B canonically
//   owns and modifies the archive packager
//   (scripts/self/release/package-release-archive.ps1) and the archive
//   installer original (scripts/consumer/archive/install.ps1); they are NOT
//   protected by Stage A. Stage B's modifications to those two scripts
//   must not re-trigger Stage A protected-path violation.

// ADF-COVERS(implementation): REQ-050-012

import * as fs from "fs";
import * as path from "path";

export interface ProtectedPathSet {
  /** Repo-relative paths with forward slashes. */
  readonly direct_paths: readonly string[];
  /** Repo-relative transitive import paths with forward slashes. */
  readonly import_paths: readonly string[];
}

// ---------------------------------------------------------------------------
// Direct trust-root paths
// ---------------------------------------------------------------------------

export const TRUST_ROOT_DIR_REL =
  ".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate";

// Trust-root TypeScript runtime modules. The runtime closure is enumerated
// at module load time by scanning the trust-root directory for non-test
// .ts files. This guarantees that any new runtime module added to the
// directory is automatically protected — closing the previous gap where
// adding a new helper module required manually updating this list
// (parent defect #2).
//
// Test files (*.test.ts) and declaration files (*.d.ts) are NOT runtime
// imports — they are not loaded when the launcher runs in production — so
// they are deliberately excluded. Their digests are recorded separately
// in the bootstrap digest report for review.
function enumerateRuntimeModules(repoRootForTestOnly?: string): readonly string[] {
  const repoRoot = repoRootForTestOnly ?? resolveRepoRoot();
  const abs = path.join(repoRoot, TRUST_ROOT_DIR_REL);
  if (!fs.existsSync(abs)) return [];
  const out: string[] = [];
  for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
    if (!ent.isFile()) continue;
    if (!ent.name.endsWith(".ts")) continue;
    if (ent.name.endsWith(".test.ts")) continue;
    if (ent.name.endsWith(".test-worker.ts")) continue;
    if (ent.name.endsWith(".d.ts")) continue;
    out.push(`${TRUST_ROOT_DIR_REL}/${ent.name}`);
  }
  return out.sort();
}

function resolveRepoRoot(): string {
  // Trust-root module lives at <repoRoot>/.opencode/skills/repo-agentdev-integrity/
  // scripts/trusted-distribution-gate/protected-paths.ts. Walk up five dirs.
  let dir = path.dirname(__filename);
  for (let i = 0; i < 5; i++) dir = path.dirname(dir);
  return dir;
}

const TRUST_ROOT_CONFIG: readonly string[] = [
  `${TRUST_ROOT_DIR_REL}/tsconfig.json`,
  `${TRUST_ROOT_DIR_REL}/package.json`,
  // Lockfile pins transitive dependency versions; tampering with it
  // could swap a dependency for a malicious one.
  `${TRUST_ROOT_DIR_REL}/bun.lock`,
  // Local .gitignore controls what gets tracked; tampering could
  // quietly exclude a future trust-root file from version control.
  `${TRUST_ROOT_DIR_REL}/.gitignore`,
];

const TRUSTED_INSTALLATION_SCRIPTS: readonly string[] = [
  // The trusted launcher entry script (PowerShell primary). The Bash
  // companion, if any, would also be protected.
  "scripts/self/release/trusted-distribution-gate.ps1",
  // Trusted consumer install entry (public entry, REQ-050-001) plus its
  // runtime dependency module (scripts/consumer/common.ps1). The entry's
  // execution dependency set is part of the trust root so a tampered or
  // missing internal module cannot bootstrap a consumer (REQ-050-011,
  // REQ-050-012).
  "scripts/install.ps1",
  "scripts/consumer/common.ps1",
  // NOTE: scripts/consumer/archive/install.ps1 (archive-dedicated installer
  // original) and scripts/self/release/package-release-archive.ps1 are
  // Stage B canonical scripts and are intentionally NOT protected by
  // Stage A (parent defect #3).
];

/**
 * Stable enumeration of every direct trust-root file. Any change to the
 * membership of this list is itself a trust-root change and must be reviewed.
 */
export const TRUST_ROOT_DIRECT_PATHS: readonly string[] = [
  ...TRUSTED_INSTALLATION_SCRIPTS,
  ...TRUST_ROOT_CONFIG,
  ...enumerateRuntimeModules(),
];

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
