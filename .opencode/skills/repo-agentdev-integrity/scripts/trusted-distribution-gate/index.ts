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
  GitTreeEntry,
  TreeMode,
  Detection,
  GateResult,
  DependencyClass,
  DetectionCategory,
  TrustedFileDigest,
  ExitCodeValue,
} from "./types.ts";

export {
  TRUST_ROOT_DIRECT_PATHS,
  DEFAULT_PROTECTED_PATH_SET,
  listAllProtectedPaths,
  isProtectedPath,
} from "./protected-paths.ts";
export type { ProtectedPathSet } from "./protected-paths.ts";

export {
  classifyLine,
  decideProjection,
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
  ClassifyFileInput,
  LineClassification,
  DecideResult,
} from "./boundary-pipeline.ts";

export {
  buildSourceRuntimeManifest,
  buildSourceBootstrapManifest,
  buildLinkManifest,
  buildArchiveManifest,
  buildArchiveInstalledManifest,
  diffManifests,
  isRequiredRuntimePath,
  isRequiredBootstrapPath,
  mapRuntimeToLinkPath,
} from "./manifest.ts";
export type { ManifestEntryInput, ManifestDiff } from "./manifest.ts";

export { classifyBytes, decodeStrictUtf8, isBinaryBytes } from "./text-binary.ts";

export {
  parseGitLsTreeLine,
  parseLsTreeOutput,
  listTreeEntries,
  readBlob,
  makeProductionAdapter,
  GitAdapterError,
} from "./git-blob-reader.ts";
export type { RawGitAdapter } from "./git-blob-reader.ts";

export {
  buildArchiveFromBlobs,
  verifyArchive,
  publishArchiveAtomically,
  computeSha256,
  ArchiveBuilderError,
} from "./archive-builder.ts";
export type { BlobSource, ExpectedEntry, VerifyResult } from "./archive-builder.ts";
