// Launcher result builders. Pure helpers extracted from launcher.ts to
// keep that orchestrator under the 250 pure LOC ceiling.

import type {
  GateResult,
  GitOid,
  LauncherResult,
  ManifestSet,
  Projection,
  TrustedFileDigest,
} from "./types.ts";
import { ExitCode } from "./types.ts";
import { listAllProtectedPaths, DEFAULT_PROTECTED_PATH_SET } from "./protected-paths.ts";
import type { LauncherMode } from "./launcher-policy.ts";

export function emptyManifests(): Record<Projection, ManifestSet> {
  const e = (p: Projection): ManifestSet => ({ projection: p, entries: [] });
  return {
    "source": e("source"),
    "link": e("link"),
    "archive": e("archive"),
    "archive-installed": e("archive-installed"),
  };
}

export function failResult(
  code: typeof ExitCode[keyof typeof ExitCode],
  opts: { readonly base_oid: string; readonly candidate_oid: string },
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

export function okResult(
  baseOid: GitOid,
  candidateOid: GitOid,
  manifests: Record<Projection, ManifestSet>,
  boundaryResults: readonly GateResult[],
  archivePath: string,
  baseDigests: readonly TrustedFileDigest[],
  mode: LauncherMode,
  failureCount: number,
  errorCount: number,
  publishWarnings: readonly string[] = [],
): LauncherResult {
  const protectedPaths = listAllProtectedPaths(DEFAULT_PROTECTED_PATH_SET).map((p) => {
    const found = baseDigests.find((d) => d.path === p);
    return {
      path: p,
      sha256: found ? found.sha256 : "bootstrap-required",
      kind: "direct" as const,
    };
  });
  const summary = [
    `trust-root OK: candidate=${candidateOid.substring(0, 12)} mode=${mode}`,
    `archive=${archivePath}`,
    `boundary_failures=${failureCount} boundary_errors=${errorCount}`,
    `protected_paths_with_base_digest=${baseDigests.length}`,
  ];
  if (mode === "seed") {
    summary.push(
      `seed-mode-evidence: ${failureCount} violation(s) and ${errorCount} unclassified entr(ies) recorded as evidence (non-fatal in seed mode)`,
    );
  }
  for (const w of publishWarnings) {
    summary.push(`publish-warning: ${w}`);
  }
  return {
    exit_code: ExitCode.Ok,
    base_oid: baseOid,
    candidate_oid: candidateOid,
    manifests,
    protected_paths: protectedPaths,
    boundary_results: boundaryResults,
    archive_path: archivePath,
    summary,
  };
}
