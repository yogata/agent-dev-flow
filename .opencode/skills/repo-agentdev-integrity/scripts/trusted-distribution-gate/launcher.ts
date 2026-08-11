// Stage A trust-root launcher orchestrator.
//
// Orchestrates the trust-root pipeline against an immutable candidate Git
// OID, never executing candidate code:
//
//   1. Validate input contract (OIDs, repository identity).
//   2. Compute the protected-path set; read both base and candidate trees
//      via git-blob-reader; fail closed if any protected path differs.
//   3. Read every candidate blob, classify text/binary, build the five
//      canonical manifest sets (source-runtime, source-bootstrap, link,
//      archive, archive-installed).
//   4. Run the boundary detector on every text artifact per projection.
//   5. Build the ZIP from candidate blobs only; verify entry set and
//      digests before atomic publish.
//
// Fail-closed contract:
//   Any anomaly returns a non-zero ExitCode and writes no archive. The
//   archive directory is left untouched when an archive already exists.

import * as path from "path";

import type {
  GateResult,
  GitOid,
  LauncherResult,
  ManifestSet,
  Projection,
  RepoPath,
} from "./types.ts";
import { ExitCode, assertGitOid } from "./types.ts";
import { DEFAULT_PROTECTED_PATH_SET, listAllProtectedPaths } from "./protected-paths.ts";
import {
  makeProductionAdapter,
  listTreeEntries,
} from "./git-blob-reader.ts";
import {
  buildArchiveInstalledManifest,
  buildArchiveManifest,
  buildLinkManifest,
  buildSourceBootstrapManifest,
  buildSourceRuntimeManifest,
  diffManifests,
} from "./manifest.ts";
import type { DetectorConfig } from "./boundary-pipeline.ts";
import { publishArchiveAtomically, ArchiveBuilderError } from "./archive-builder.ts";
import { checkProtectedPaths } from "./protected-check.ts";
import { loadAndClassify } from "./blob-loader.ts";
import { runBoundaryDetector } from "./boundary-runner.ts";

export interface LauncherOptions {
  readonly repo_root: string;
  readonly base_oid: string;
  readonly candidate_oid: string;
  readonly output_dir: string;
  readonly repository_identity: {
    readonly owner_slash_name: string;
    readonly default_branch: string;
  };
}

const DEFAULT_PRODUCER_PREFIXES: readonly string[] = [
  "ADR", "REQ", "DEC", "SPEC", "IR", "RU", "TS", "AG", "OU", "EC",
];

export function runLauncher(opts: LauncherOptions): LauncherResult {
  let baseOid: GitOid;
  let candidateOid: GitOid;
  try {
    baseOid = assertGitOid(opts.base_oid);
    candidateOid = assertGitOid(opts.candidate_oid);
  } catch {
    return fail(ExitCode.InputContract, opts, emptyManifests(), [], "invalid OID format");
  }
  if (!opts.repository_identity.owner_slash_name || !opts.repository_identity.default_branch) {
    return fail(ExitCode.InputContract, opts, emptyManifests(), [], "repository identity required");
  }

  const adapter = makeProductionAdapter(opts.repo_root as RepoPath);

  const protectedViolation = checkProtectedPaths(adapter, baseOid, candidateOid);
  if (protectedViolation !== null) {
    return fail(ExitCode.ProtectedPathViolation, opts, emptyManifests(), [], protectedViolation);
  }

  let entries;
  try {
    entries = listTreeEntries(adapter, candidateOid, "candidate");
  } catch (e) {
    return fail(ExitCode.Unexpected, opts, emptyManifests(), [], `git ls-tree candidate failed: ${err(e)}`);
  }

  const loaded = loadAndClassify(adapter, candidateOid, entries);
  if (loaded.kind === "error") {
    return fail(loaded.code, opts, emptyManifests(), [], loaded.message);
  }
  const blobs = loaded.blobs;

  const runtimeInputs = collectProjection(blobs, "source-runtime");
  const bootstrapInputs = collectProjection(blobs, "source-bootstrap");
  const extrasInputs = collectProjection(blobs, "extra");
  let manifests: Record<Projection, ManifestSet>;
  try {
    manifests = {
      "source-runtime": buildSourceRuntimeManifest(runtimeInputs),
      "source-bootstrap": buildSourceBootstrapManifest(bootstrapInputs),
      "link": buildLinkManifest(runtimeInputs),
      "archive": buildArchiveManifest(runtimeInputs, extrasInputs),
      "archive-installed": buildArchiveInstalledManifest(runtimeInputs),
    };
  } catch (e) {
    const code = e instanceof Error && e.message.includes("missing required")
      ? ExitCode.ManifestMismatch
      : ExitCode.Unexpected;
    return fail(code, opts, emptyManifests(), [], `manifest build failed: ${err(e)}`);
  }

  const detectorConfig: DetectorConfig = {
    repository_identity: opts.repository_identity,
    producer_internal_id_prefixes: DEFAULT_PRODUCER_PREFIXES,
  };
  const boundaryResults = runBoundaryDetector(blobs, detectorConfig);
  const failureProjection = boundaryResults.find((r) => r.failures.length > 0);
  const errorProjection = boundaryResults.find((r) => r.errors.length > 0);
  if (failureProjection) {
    return fail(ExitCode.BoundaryViolation, opts, manifests, boundaryResults,
      `boundary violation in ${failureProjection.projection}: ${JSON.stringify(failureProjection.failures[0])}`);
  }
  if (errorProjection) {
    return fail(ExitCode.UnclassifiedEntry, opts, manifests, boundaryResults,
      `unclassified entry in ${errorProjection.projection}: ${JSON.stringify(errorProjection.errors[0])}`);
  }

  // The archive manifest entries use the candidate blob's repo-relative path
  // verbatim (src/opencode/**, scripts/install-from-archive.ps1,
  // README-INSTALL.md). No re-mapping is needed.
  const archivePath = path.join(
    opts.output_dir,
    `agentdev-trust-${candidateOid.substring(0, 8)}.zip`,
  );
  const archiveBlobSources = manifests["archive"].entries.map((e) => {
    const matchingBlob = blobs.find((b) => b.entry.path === e.path);
    if (!matchingBlob) throw new Error(`archive blob missing for ${e.path}`);
    return { archivePath: matchingBlob.entry.path, bytes: matchingBlob.bytes };
  });
  try {
    publishArchiveAtomically(archiveBlobSources, archivePath);
  } catch (e) {
    if (e instanceof ArchiveBuilderError && /pre-existing final archive/.test(e.message)) {
      return fail(ExitCode.DigestMismatch, opts, manifests, boundaryResults, e.message);
    }
    return fail(ExitCode.Unexpected, opts, manifests, boundaryResults, `archive publish failed: ${err(e)}`);
  }

  const installedDiff = diffManifests(
    manifests["link"].entries,
    manifests["archive-installed"].entries,
  );
  if (installedDiff.extra.length || installedDiff.missing.length || installedDiff.digest_mismatches.length) {
    return fail(ExitCode.DigestMismatch, opts, manifests, boundaryResults,
      `archive-installed mismatch: ${JSON.stringify(installedDiff)}`);
  }

  return ok(opts, baseOid, candidateOid, manifests, boundaryResults, archivePath);
}

function collectProjection(
  blobs: readonly { projection: string; entry: { path: string; sha256: string; size: number } }[],
  projection: string,
) {
  return blobs.filter((b) => b.projection === projection).map((b) => b.entry);
}

function err(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function emptyManifests(): Record<Projection, ManifestSet> {
  const e = (p: Projection): ManifestSet => ({ projection: p, entries: [] });
  return {
    "source-runtime": e("source-runtime"),
    "source-bootstrap": e("source-bootstrap"),
    "link": e("link"),
    "archive": e("archive"),
    "archive-installed": e("archive-installed"),
  };
}

function fail(
  code: typeof ExitCode[keyof typeof ExitCode],
  opts: LauncherOptions,
  manifests: Record<Projection, ManifestSet>,
  boundaryResults: readonly GateResult[],
  message: string,
): LauncherResult {
  return {
    exit_code: code,
    base_oid: opts.base_oid,
    candidate_oid: opts.candidate_oid,
    manifests,
    protected_paths: [],
    boundary_results: boundaryResults,
    archive_path: null,
    summary: [`trust-root FAIL code=${code}: ${message}`],
  };
}

function ok(
  _opts: LauncherOptions,
  baseOid: GitOid,
  candidateOid: GitOid,
  manifests: Record<Projection, ManifestSet>,
  boundaryResults: readonly GateResult[],
  archivePath: string,
): LauncherResult {
  return {
    exit_code: ExitCode.Ok,
    base_oid: baseOid,
    candidate_oid: candidateOid,
    manifests,
    protected_paths: listAllProtectedPaths(DEFAULT_PROTECTED_PATH_SET).map((p) => ({
      path: p,
      sha256: "(see git blob at base_oid)",
      kind: "direct" as const,
    })),
    boundary_results: boundaryResults,
    archive_path: archivePath,
    summary: [
      `trust-root OK: candidate=${candidateOid.substring(0, 12)}`,
      `archive=${archivePath}`,
      `boundary_failures=${boundaryResults.reduce((n, r) => n + r.failures.length, 0)}`,
    ],
  };
}
