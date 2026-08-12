// Stage A trust-root launcher orchestrator.
//
// Orchestrates the trust-root pipeline against an immutable candidate Git
// OID, never executing candidate code:
//
//   1. Validate input contract (OIDs, repository identity, output dir).
//   2. Aggregate protected-path outcomes via protected-check; apply
//      mode-aware policy (final / seed). Bootstrap/seed mode permits
//      candidate-added trust-root paths; modified/deleted protected paths
//      remain fatal in every mode.
//   3. Read every candidate blob, classify text/binary + source subset.
//   4. Build the four canonical manifest projections.
//   5. Run the boundary detector on every text artifact across all four
//      projections. In seed mode, violations and unclassified entries are
//      recorded as evidence but do NOT make the gate fail; in final mode
//      they are fatal.
//   6. Build the canonical wrapped archive under
//      `agentdev-release-<candidate-short>/` from candidate blobs only;
//      stage a verified ZIP under <outputRoot>/.trust-stage-<runid>/.
//   7. Physically verify the archive-installed projection by extracting
//      the STAGED ZIP (before publish), executing the BASE-OID
//      install-from-archive.ps1 (never candidate or working tree), and
//      comparing the installed files to the archive-installed manifest.
//   8. Atomically publish the staged ZIP to the final path via
//      `fs.linkSync` (atomic no-overwrite). Pre-existing final archives
//      are never overwritten or removed.
//
// Fail-closed contract:
//   Any anomaly returns a non-zero ExitCode and writes no archive. The
//   archive directory is left untouched when an archive already exists.

import * as path from "path";

import type {
  GitOid,
  LauncherResult,
  ManifestSet,
  Projection,
  RepoPath,
  TrustedFileDigest,
} from "./types.ts";
import { ExitCode, PathSafetyError, assertGitOid } from "./types.ts";
import { makeProductionAdapter, listTreeEntries, GitAdapterError } from "./git-blob-reader.ts";
import {
  buildArchiveInstalledManifest,
  buildArchiveManifest,
  buildLinkManifest,
  buildSourceManifest,
  ManifestError,
} from "./manifest.ts";
import type { DetectorConfig } from "./boundary-pipeline.ts";
import {
  ArchiveBuilderError,
  prepareStagedArchive,
  publishStagedArchive,
  type StagedArchive,
} from "./archive-publish.ts";
import { checkProtectedPaths } from "./protected-check.ts";
import type { LoadedBlob } from "./blob-loader.ts";
import { loadAndClassify } from "./blob-loader.ts";
import { runBoundaryDetector } from "./boundary-runner.ts";
import {
  evaluateProtectedPolicy,
  isBoundaryFailureFatal,
  type LauncherMode,
} from "./launcher-policy.ts";
import {
  verifyArchiveInstalled,
  type VerifyInstalledInput,
} from "./archive-installed-verifier.ts";
import { emptyManifests, failResult, okResult } from "./launcher-result.ts";
import type { StagingRemover } from "./archive-publish.ts";

export interface LauncherOptions {
  readonly repo_root: string;
  readonly base_oid: string;
  readonly candidate_oid: string;
  readonly output_dir: string;
  readonly repository_identity: {
    readonly owner_slash_name: string;
    readonly default_branch: string;
  };
  /**
   * Bootstrap / seed mode. Permits candidate-added trust-root paths (the
   * bootstrap-PR case where the trust root itself is being introduced) and
   * records boundary findings / unclassified entries as non-fatal evidence.
   * Default false (final mode = strict).
   */
  readonly bootstrap_mode?: boolean;
}

const DEFAULT_PRODUCER_PREFIXES: readonly string[] = [
  "ADR", "REQ", "DEC", "SPEC", "IR", "RU", "TS", "AG", "OU", "EC",
];

const ARCHIVE_ROOT_PREFIX = "agentdev-release-";

export function runLauncher(opts: LauncherOptions): LauncherResult {
  return runLauncherWithDeps(opts, {});
}

export interface LauncherDependencies {
  readonly stagingRemover?: StagingRemover;
}

export function runLauncherWithDeps(opts: LauncherOptions, deps: LauncherDependencies): LauncherResult {
  try {
    return runLauncherInner(opts, deps);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return failResult(ExitCode.Unexpected, opts, emptyManifests(), [], `unhandled exception: ${msg}`);
  }
}

export function safeStageCleanup(stage: StagedArchive): string[] {
  try {
    stage.cleanup();
    return [];
  } catch (e) {
    return [`cleanup warning: ${e instanceof Error ? e.message : String(e)}`];
  }
}

export function applyCleanupWarnings(primaryMessage: string, cleanupWarnings: readonly string[]): string {
  return cleanupWarnings.length > 0 ? `${primaryMessage} [cleanup warnings: ${cleanupWarnings.join("; ")}]` : primaryMessage;
}

function runLauncherInner(opts: LauncherOptions, deps: LauncherDependencies): LauncherResult {
  let baseOid: GitOid;
  let candidateOid: GitOid;
  try {
    baseOid = assertGitOid(opts.base_oid);
    candidateOid = assertGitOid(opts.candidate_oid);
  } catch {
    return failResult(ExitCode.InputContract, opts, emptyManifests(), [], "invalid OID format");
  }
  if (!opts.repository_identity.owner_slash_name || !opts.repository_identity.default_branch) {
    return failResult(ExitCode.InputContract, opts, emptyManifests(), [], "repository identity required");
  }

  const mode: LauncherMode = opts.bootstrap_mode ? "seed" : "final";
  const adapter = makeProductionAdapter(opts.repo_root as RepoPath);

  const protectedCheck = checkProtectedPaths(adapter, baseOid, candidateOid);
  if (protectedCheck.kind === "error") {
    return failResult(protectedCheck.code, opts, emptyManifests(), [], protectedCheck.message);
  }
  const aggregated = protectedCheck.aggregated;
  const decision = evaluateProtectedPolicy(aggregated, mode);
  if (decision.kind === "error" || decision.kind === "fail") {
    return failResult(decision.code, opts, emptyManifests(), [], decision.message);
  }
  const baseDigests: readonly TrustedFileDigest[] = aggregated.base_digests;

  let entries;
  try {
    entries = listTreeEntries(adapter, candidateOid, "candidate");
  } catch (e) {
    if (e instanceof PathSafetyError) {
      return failResult(ExitCode.PathSafetyViolation, opts, emptyManifests(), [], e.message);
    }
    return failResult(ExitCode.Unexpected, opts, emptyManifests(), [], `git ls-tree candidate failed: ${err(e)}`);
  }
  const loaded = loadAndClassify(adapter, candidateOid, entries);
  if (loaded.kind === "error") {
    return failResult(loaded.code, opts, emptyManifests(), [], loaded.message);
  }
  const blobs = loaded.blobs;

  const runtimeInputs = collectSubset(blobs, "runtime");
  const bootstrapInputs = collectSubset(blobs, "bootstrap");
  const extraInputs = collectSubset(blobs, "archive-extra");
  const sourceInputs = [...runtimeInputs, ...bootstrapInputs];

  let manifests: Record<Projection, ManifestSet>;
  try {
    manifests = {
      "source": buildSourceManifest(sourceInputs),
      "link": buildLinkManifest(runtimeInputs),
      "archive": buildArchiveManifest(runtimeInputs, extraInputs),
      "archive-installed": buildArchiveInstalledManifest(runtimeInputs),
    };
  } catch (e) {
    const code = e instanceof ManifestError ? ExitCode.ManifestMismatch : ExitCode.Unexpected;
    return failResult(code, opts, emptyManifests(), [], `manifest build failed: ${err(e)}`);
  }

  const detectorConfig: DetectorConfig = {
    repository_identity: opts.repository_identity,
    producer_internal_id_prefixes: DEFAULT_PRODUCER_PREFIXES,
  };
  const boundaryResults = runBoundaryDetector({ blobs }, detectorConfig);
  const failureCount = boundaryResults.reduce((n, r) => n + r.failures.length, 0);
  const errorCount = boundaryResults.reduce((n, r) => n + r.errors.length, 0);
  if (isBoundaryFailureFatal(mode)) {
    const failureProjection = boundaryResults.find((r) => r.failures.length > 0);
    const errorProjection = boundaryResults.find((r) => r.errors.length > 0);
    if (failureProjection) {
      return failResult(ExitCode.BoundaryViolation, opts, manifests, boundaryResults,
        `boundary violation in ${failureProjection.projection}: ${JSON.stringify(failureProjection.failures[0])}`);
    }
    if (errorProjection) {
      return failResult(ExitCode.UnclassifiedEntry, opts, manifests, boundaryResults,
        `unclassified entry in ${errorProjection.projection}: ${JSON.stringify(errorProjection.errors[0])}`);
    }
  }

  const candidateShort = candidateOid.substring(0, 8);
  const archiveRootName = `${ARCHIVE_ROOT_PREFIX}${candidateShort}`;
  const archivePath = path.join(opts.output_dir, `${archiveRootName}.zip`);
  const archiveBlobSources = manifests["archive"].entries.map((e) => {
    const matchingBlob = blobs.find((b) => b.entry.path === e.path);
    if (!matchingBlob) throw new Error(`archive blob missing for ${e.path}`);
    return { archivePath: `${archiveRootName}/${e.path}`, bytes: matchingBlob.bytes };
  });

  let stage: StagedArchive;
  try {
    stage = prepareStagedArchive(archiveBlobSources, opts.output_dir, deps.stagingRemover);
  } catch (e) {
    if (e instanceof PathSafetyError) {
      return failResult(ExitCode.PathSafetyViolation, opts, manifests, boundaryResults, e.message);
    }
    if (e instanceof ArchiveBuilderError && /pre-existing final archive/.test(e.message)) {
      return failResult(ExitCode.DigestMismatch, opts, manifests, boundaryResults, e.message);
    }
    return failResult(ExitCode.Unexpected, opts, manifests, boundaryResults, `archive stage failed: ${err(e)}`);
  }

  const verifyInput: VerifyInstalledInput = {
    adapter,
    baseOid,
    archivePath: stage.stagedZip,
    expected: manifests["archive-installed"],
    archiveRootName,
  };
  try {
    const r = verifyArchiveInstalled(verifyInput);
    if (r.kind === "mismatch") {
      const cw = safeStageCleanup(stage);
      const msg = cw.length > 0 ? `${r.reason} [cleanup warnings: ${cw.join("; ")}]` : r.reason;
      return failResult(ExitCode.DigestMismatch, opts, manifests, boundaryResults, msg);
    }
  } catch (e) {
    const cw = safeStageCleanup(stage);
    const suffix = cw.length > 0 ? ` [cleanup warnings: ${cw.join("; ")}]` : "";
    if (e instanceof PathSafetyError) {
      return failResult(ExitCode.PathSafetyViolation, opts, manifests, boundaryResults, `${e.message}${suffix}`);
    }
    return failResult(ExitCode.Unexpected, opts, manifests, boundaryResults, `archive-installed verify failed: ${err(e)}${suffix}`);
  }

  let publishWarnings: readonly string[];
  try {
    const publishResult = publishStagedArchive(stage, archivePath, opts.output_dir);
    publishWarnings = publishResult.warnings;
  } catch (e) {
    const cw = safeStageCleanup(stage);
    const suffix = cw.length > 0 ? ` [cleanup warnings: ${cw.join("; ")}]` : "";
    if (e instanceof PathSafetyError) {
      return failResult(ExitCode.PathSafetyViolation, opts, manifests, boundaryResults, `${e.message}${suffix}`);
    }
    if (e instanceof ArchiveBuilderError && /pre-existing final archive/.test(e.message)) {
      return failResult(ExitCode.DigestMismatch, opts, manifests, boundaryResults, `${e.message}${suffix}`);
    }
    return failResult(ExitCode.Unexpected, opts, manifests, boundaryResults, `archive publish failed: ${err(e)}${suffix}`);
  }

  return okResult(baseOid, candidateOid, manifests, boundaryResults, archivePath, baseDigests, mode, failureCount, errorCount, publishWarnings);
}

function collectSubset(
  blobs: readonly LoadedBlob[],
  subset: LoadedBlob["subset"],
) {
  return blobs.filter((b) => b.subset === subset).map((b) => b.entry);
}

function err(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export { GitAdapterError };
