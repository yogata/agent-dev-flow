// Stage A trust-root shared types.
//
// These types form the immutable contract between the trust-root launcher,
// the side-effect-free boundary detector, the git blob reader, the manifest
// builder, and the archive packager. They live in a single file so that
// the protected-path set can enumerate every consumer of these types when
// computing transitive-import digest chains.
//
// Contract invariants:
//   - Input OIDs are immutable Git object IDs (40-char SHA-1 or 64-char
//     SHA-256 hexadecimal strings). Resolution is the caller's responsibility;
//     this module never resolves refs.
//   - All blob digests are SHA-256, lowercase hexadecimal, computed over the
//     exact bytes returned by `git cat-file blob <oid>:<path>`.
//   - The trust root NEVER imports code from the candidate tree. Only
//     `types.ts` is shared with the rest of the trust-root modules.

// ---------------------------------------------------------------------------
// Input contract
// ---------------------------------------------------------------------------

/** Immutable Git object ID (SHA-1 40-hex or SHA-256 64-hex). */
export type GitOid = string & { readonly __brand: "GitOid" };

/** Repository root path (absolute, native). Used only for git -C invocation. */
export type RepoPath = string & { readonly __brand: "RepoPath" };

/** Output directory path (absolute, native). Final archive lands here. */
export type OutputPath = string & { readonly __brand: "OutputPath" };

export interface LauncherInput {
  /** OID of the trusted baseline (e.g. origin/main short before candidate). */
  readonly base_oid: GitOid;
  /** OID of the candidate being inspected. Must be immutable. */
  readonly candidate_oid: GitOid;
  /** Absolute path to the repository root (.git lives here). */
  readonly repo_root: RepoPath;
  /** Absolute path to the output directory for the final archive. */
  readonly output_dir: OutputPath;
  /** Repository identity used to classify producer-fixed URLs. */
  readonly repository_identity: RepositoryIdentity;
}

export interface RepositoryIdentity {
  /** e.g. "yogata/agent-dev-flow". Empty string disables URL matching. */
  readonly owner_slash_name: string;
  /** Default branch name used in producer URLs, e.g. "main". */
  readonly default_branch: string;
}

// ---------------------------------------------------------------------------
// Git tree entries
// ---------------------------------------------------------------------------

/** Git tree entry mode as reported by `git ls-tree -z`. */
export type TreeMode =
  | "100644" // regular file (text or binary)
  | "100755"; // executable regular file

export interface GitTreeEntry {
  /** Raw mode string. Anything outside TreeMode is rejected upstream. */
  readonly mode: TreeMode;
  /** Object type from ls-tree. Must be "blob"; "tree"/"commit" rejected. */
  readonly object_kind: "blob" | "tree" | "commit";
  /** Blob OID. */
  readonly oid: GitOid;
  /** Repo-relative path with forward slashes. */
  readonly path: string;
}

// ---------------------------------------------------------------------------
// Manifest entries
// ---------------------------------------------------------------------------

/**
 * Canonical projection labels per docs/designs/integrity/distribution-boundary.md
 * §58-67. The public manifest model exposes exactly these four projections;
 * runtime/bootstrap are internal source subsets and never appear as a public
 * projection label.
 */
export type Projection =
  | "source"
  | "link"
  | "archive"
  | "archive-installed";

export const PROJECTIONS: readonly Projection[] = [
  "source",
  "link",
  "archive",
  "archive-installed",
] as const;

/**
 * Internal source-subset classification. Not a public projection. Used by
 * the manifest builder to filter the canonical `source` projection into the
 * subsets that feed `link`, `archive`, and `archive-installed`.
 */
export type SourceSubset =
  | "runtime" // src/opencode/{commands/agentdev,skills/agentdev-*,skills/japanese-tech-writing}/**
  | "bootstrap" // scripts/install-consumer-opencode.ps1, scripts/check-consumer-opencode.ps1
  | "archive-extra"; // scripts/install-from-archive.ps1, README-INSTALL.md

/** Single manifest entry: tracked path + blob digest. */
export interface ManifestEntry {
  /** Repo-relative or projection-relative path with forward slashes. */
  readonly path: string;
  /** SHA-256 lowercase hex of blob bytes. */
  readonly sha256: string;
  /** Size in bytes. */
  readonly size: number;
}

/** A manifest set keyed by projection. */
export interface ManifestSet {
  readonly projection: Projection;
  /** Sorted by path. No duplicate paths. */
  readonly entries: readonly ManifestEntry[];
}

// ---------------------------------------------------------------------------
// Boundary detector types
// ---------------------------------------------------------------------------

export type DependencyClass =
  | "consumer-resolvable"
  | "generic-or-template"
  | "producer-internal"
  | "unclassified";

export type DetectionCategory =
  | "concrete-id"
  | "concrete-path"
  | "fixed-url"
  | "unclassified-entry"
  | "adapter-failure"
  | "distributed-control"
  | "evasion-attempt";

export interface LineInput {
  readonly text: string;
  readonly lineNumber: number;
  readonly filePath: string;
  readonly projection: Projection;
}

export interface Detection {
  readonly text: string;
  readonly line: number;
  readonly file: string;
  readonly projection: Projection;
  readonly classification: DependencyClass;
  readonly matched: string;
  readonly snippet: string;
  readonly category: DetectionCategory;
}

export interface GateResult {
  readonly pass: boolean;
  readonly failures: readonly Detection[];
  readonly errors: readonly Detection[];
  readonly projection: Projection;
}

// ---------------------------------------------------------------------------
// Trust root / protected paths
// ---------------------------------------------------------------------------

export interface TrustedFileDigest {
  /** Repo-relative path with forward slashes. */
  readonly path: string;
  /** SHA-256 lowercase hex of the file's bytes at base_oid. */
  readonly sha256: string;
  /** "direct" for the file itself; "import" for a transitive import. */
  readonly kind: "direct" | "import";
}

// ---------------------------------------------------------------------------
// Result / exit codes
// ---------------------------------------------------------------------------

/** Stable exit codes. Documented in scripts/trusted-distribution-gate.ps1. */
export const ExitCode = {
  Ok: 0,
  ProtectedPathViolation: 1,
  ManifestMismatch: 2,
  DigestMismatch: 3,
  BoundaryViolation: 4,
  PathSafetyViolation: 5,
  EncodingViolation: 6,
  UnclassifiedEntry: 7,
  InputContract: 8,
  Unexpected: 9,
} as const;

export type ExitCodeValue = (typeof ExitCode)[keyof typeof ExitCode];

export interface LauncherResult {
  readonly exit_code: ExitCodeValue;
  readonly base_oid: string;
  readonly candidate_oid: string;
  readonly manifests: Readonly<Record<Projection, ManifestSet>>;
  readonly protected_paths: readonly TrustedFileDigest[];
  readonly boundary_results: readonly GateResult[];
  /** Final archive path, only present when exit_code is Ok. */
  readonly archive_path: string | null;
  /** Human-readable summary lines. */
  readonly summary: readonly string[];
}

// ---------------------------------------------------------------------------
// OID branding helpers (no runtime cost; type-only).
// ---------------------------------------------------------------------------

const OID_PATTERN = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;

export function assertGitOid(value: string): GitOid {
  if (!OID_PATTERN.test(value)) {
    throw new InvalidOidError(value);
  }
  return value as GitOid;
}

export class InvalidOidError extends Error {
  constructor(public readonly value: string) {
    super(`Invalid Git OID: ${value}`);
    this.name = "InvalidOidError";
  }
}

// ---------------------------------------------------------------------------
// Typed error taxonomy (parent defect #10)
// ---------------------------------------------------------------------------
//
// Stable, programmatically distinguishable errors. Stage A used to route
// behavior by substring-matching exception messages (e.g. `.includes("does
// not exist")`), which broke when git changed wording or when an unrelated
// error happened to contain a similar phrase. These typed classes replace
// that brittleness with `instanceof` checks. The launcher maps each class
// to a stable exit code without ever inspecting the message.

export type PathSafetyReason =
  | "symlink" // git mode 120000
  | "gitlink" // git mode 160000 (submodule)
  | "unsupported-mode" // git mode outside 100644/100755/120000/160000/040000
  | "non-blob" // tree/commit object kind where blob required
  | "path-traversal" // archive/path input contains `..` or escapes root
  | "unsafe-archive-path"; // archive path fails safety character/range check

/**
 * Raised when a candidate tree entry or archive path violates path safety.
 * The launcher maps this to ExitCode.PathSafetyViolation (5). Replaces the
 * previous routing where these conditions threw generic GitAdapterError and
 * were surfaced as ExitCode.Unexpected (9).
 */
export class PathSafetyError extends Error {
  constructor(public readonly reason: PathSafetyReason, message: string) {
    super(message);
    this.name = "PathSafetyError";
  }
}

/**
 * Raised by the git adapter when `git cat-file` reports that the requested
 * path does not exist at the given OID. The launcher treats this as a
 * structured signal (path missing → bootstrap candidate-added check) rather
 * than parsing the git error message string.
 */
export class GitBlobMissingError extends Error {
  constructor(public readonly oid: string, public readonly path: string) {
    super(`path '${path}' does not exist at oid ${oid}`);
    this.name = "GitBlobMissingError";
  }
}

/**
 * Raised by the git adapter for any OTHER git failure (subprocess crash,
 * unknown revision, network push, lock file, etc.). Distinct from
 * GitBlobMissingError so callers can branch on the typed class rather than
 * substring-matching.
 */
export class GitAdapterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitAdapterError";
  }
}
