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

/** Projection the manifest entry belongs to. */
export type Projection =
  | "source-runtime"
  | "source-bootstrap"
  | "link"
  | "archive"
  | "archive-installed";

export const PROJECTIONS: readonly Projection[] = [
  "source-runtime",
  "source-bootstrap",
  "link",
  "archive",
  "archive-installed",
] as const;

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
  | "adapter-failure";

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
