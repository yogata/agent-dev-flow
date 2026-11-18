// Public API barrel for the trust-root distribution gate.
//
// Consumers (the PowerShell entry script, future Opencode plugins, and
// release tooling) import from this module. The launcher is the only
// entry point; individual modules are exported for testing and for the
// protected-paths transitive-import enumeration.

export { runLauncher } from "./launcher.ts";
export type { LauncherOptions } from "./launcher.ts";

export {
  ExitCode,
  assertGitOid,
  InvalidOidError,
  PathSafetyError,
  GitBlobMissingError,
  GitAdapterError,
} from "./types.ts";
export type {
  GitOid,
  RepoPath,
  OutputPath,
  LauncherInput,
  RepositoryIdentity,
  LauncherResult,
  ManifestEntry,
  ManifestSet,
  Projection,
  SourceSubset,
  GitTreeEntry,
  TreeMode,
  Detection,
  GateResult,
  DependencyClass,
  DetectionCategory,
  TrustedFileDigest,
  ExitCodeValue,
  PathSafetyReason,
} from "./types.ts";

export {
  TRUST_ROOT_DIRECT_PATHS,
  TRUST_ROOT_DIR_REL,
  DEFAULT_PROTECTED_PATH_SET,
  listAllProtectedPaths,
  isProtectedPath,
} from "./protected-paths.ts";
export type { ProtectedPathSet } from "./protected-paths.ts";

export {
  classifyLine,
  detectCandidates,
  resolveCandidate,
  isConcreteDocsPath,
  normalizePathToken,
} from "./boundary-pipeline.ts";
export type {
  DetectorConfig,
  RepositoryIdentity as DetectorRepositoryIdentity,
  Candidate,
  CandidateType,
  OverflowReason,
  LineClassification,
} from "./boundary-pipeline.ts";

export {
  decideProjection,
} from "./boundary-gate.ts";
export type {
  ClassifyFileInput,
  DecideResult,
} from "./boundary-gate.ts";

export {
  buildSourceManifest,
  buildLinkManifest,
  buildArchiveManifest,
  buildArchiveInstalledManifest,
  diffManifests,
  manifestEntryEquals,
  isRequiredRuntimePath,
  isRequiredBootstrapPath,
  isRequiredArchiveExtraPath,
  classifySourceSubset,
  mapRuntimeToLinkPath,
  ManifestError,
} from "./manifest.ts";
export type { ManifestEntryInput, ManifestDiff } from "./manifest.ts";

export { classifyBytes, decodeStrictUtf8, isBinaryBytes } from "./text-binary.ts";

export {
  parseGitLsTreeLine,
  parseLsTreeOutput,
  listTreeEntries,
  readBlob,
  readBlobsBatched,
  makeProductionAdapter,
} from "./git-blob-reader.ts";
export type { RawGitAdapter, BatchedReadResult } from "./git-blob-reader.ts";

export {
  prepareStagedArchive,
  publishStagedArchive,
  assertOutputContained,
} from "./archive-publish.ts";
export type { BlobSource, ExpectedEntry, VerifyResult } from "./archive-builder.ts";

export { verifyArchiveInstalled } from "./archive-installed-verifier.ts";
export type { VerifyInstalledInput, VerifyInstalledResult } from "./archive-installed-verifier.ts";

export {
  evaluateProtectedPolicy,
  isBoundaryFailureFatal,
} from "./launcher-policy.ts";
export type { LauncherMode, PolicyDecision } from "./launcher-policy.ts";

export {
  checkProtectedPaths,
} from "./protected-check.ts";
export type {
  ProtectedCheckResult,
  ProtectedCheckAggregated,
  ProtectedPathOutcome,
  PerPathStatus,
} from "./protected-check.ts";
