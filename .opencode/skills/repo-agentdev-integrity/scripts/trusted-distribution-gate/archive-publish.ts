// Archive publish transaction: prepare a verified staged ZIP under the
// caller-supplied outputRoot, then atomically publish via hard-link to
// the final path.
//
// Contract (parent blocker #1, #2, #8):
//   1. prepareStagedArchive creates <outputRoot>/.trust-stage-<runid>/
//      containing the staged ZIP. The staging directory is INSIDE
//      outputRoot so the final publish is a same-filesystem hard-link
//      publication. Same-filesystem is REQUIRED; a link that crosses
//      filesystems is treated as a fatal configuration error.
//   2. prepareStagedArchive internally verifies the archive entry set
//      against the expected digests. A mismatch removes only the
//      run-owned staging directory and throws ArchiveBuilderError.
//   3. The caller performs any further verification (physical
//      archive-installed install) on stage.stagedZip BEFORE calling
//      publishStagedArchive.
//   4. publishStagedArchive atomically hard-links the staged ZIP to the
//      final path via `fs.linkSync`. If a pre-existing final archive
//      exists, the call throws and the staged ZIP is left intact for
//      the caller to clean up via stage.cleanup().
//   5. Once linkSync succeeds, publication is irrevocable. All subsequent
//      cleanup (unlink staged, remove staging directory) is best-effort:
//      failures are captured as warnings in the returned PublishOutcome
//      and NEVER cause the publish call to report failure. The contract
//      is that nonzero exit means no newly-published archive.
//   6. Pre-existing final archives are NEVER overwritten or removed.

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { compressStage } from "./archive-zip.ts";
import {
  ArchiveBuilderError,
  buildArchiveFromBlobs,
  computeSha256,
} from "./archive-builder.ts";
import type { BlobSource } from "./archive-builder.ts";
import { verifyArchive } from "./archive-verify.ts";
import type { ExpectedEntry } from "./archive-verify.ts";

export { ArchiveBuilderError, computeSha256 };
export type { BlobSource };
export type { ExpectedEntry, VerifyResult } from "./archive-verify.ts";

const STAGE_DIR_PREFIX = ".trust-stage-";

export type StagingRemover = (p: string, opts: { recursive: boolean; force: boolean }) => void;

const DEFAULT_REMOVER: StagingRemover = (p, opts) => { fs.rmSync(p, opts); };

export interface StagedArchive {
  /** Absolute path to the staged ZIP under outputRoot. */
  readonly stagedZip: string;
  /** Absolute staging directory under outputRoot. */
  readonly stageDir: string;
  /** Idempotent cleanup. Removes ONLY this run's staging directory. */
  readonly cleanup: () => void;
}

/**
 * Refuse to write a final archive path that escapes the trusted output
 * root. Caller supplies the trusted root explicitly; we resolve both
 * paths absolutely and require finalPath to be at-or-under outputRoot.
 */
export function assertOutputContained(finalPath: string, outputRoot: string): void {
  const resolvedFinal = path.resolve(finalPath);
  const resolvedRoot = path.resolve(outputRoot);
  const rel = path.relative(resolvedRoot, resolvedFinal);
  if (rel === "" || rel === ".") {
    throw new ArchiveBuilderError(
      `final archive path equals output root (would replace directory): ${finalPath}`,
    );
  }
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new ArchiveBuilderError(
      `final archive path escapes output root: ${finalPath} (relative: ${rel})`,
    );
  }
}

/**
 * Prepare a staged ZIP under <outputRoot>/.trust-stage-<runid>/archive.zip.
 * Internally builds the stage directory, compresses, and verifies the
 * archive entry set against the expected digests derived from the blobs.
 *
 * On ANY failure (path safety, IO, archive verification mismatch), the
 * staging directory is removed and the error is re-thrown. The caller
 * NEVER sees a partial staging directory leak.
 *
 * The returned cleanup() is idempotent.
 */
export function prepareStagedArchive(
  blobs: readonly BlobSource[],
  outputRoot: string,
  remover?: StagingRemover,
): StagedArchive {
  const rm = remover ?? DEFAULT_REMOVER;
  const runId = crypto.randomBytes(8).toString("hex");
  const stageBase = path.join(outputRoot, `${STAGE_DIR_PREFIX}${runId}`);
  fs.mkdirSync(stageBase, { recursive: true });
  const stageDir = path.join(stageBase, "stage");
  const stagedZip = path.join(stageBase, "archive.zip");
  let cleaned = false;
  const cleanup = (): void => {
    if (cleaned) return;
    try {
      rm(stageBase, { recursive: true, force: true });
      cleaned = true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new ArchiveBuilderError(`staging cleanup failed at ${stageBase}: ${msg}`);
    }
  };

  try {
    buildArchiveFromBlobs(blobs, stageDir);
    compressStage(stageDir, stagedZip);
    const expected: ExpectedEntry[] = blobs.map((b) => ({
      path: b.archivePath,
      sha256: computeSha256(b.bytes),
      size: b.bytes.length,
    }));
    const result = verifyArchive(stagedZip, expected);
    if (!result.ok) {
      throw new ArchiveBuilderError(
        `archive verification failed: missing=${JSON.stringify(result.missing)} extra=${JSON.stringify(result.extra)} digest_mismatches=${JSON.stringify(result.digest_mismatches)}`,
      );
    }
  } catch (e) {
    if (!cleaned) {
      try {
        rm(stageBase, { recursive: true, force: true });
        cleaned = true;
      } catch (cleanupErr) {
        if (e instanceof Error) {
          const cw = cleanupErr instanceof Error ? cleanupErr.message : String(cleanupErr);
          e.message = `${e.message} [cleanup warning: ${cw}]`;
        }
      }
    }
    throw e;
  }
  return { stagedZip, stageDir, cleanup };
}

/**
 * Outcome of a successful publication. Warnings capture best-effort
 * cleanup failures that do NOT affect publication correctness.
 */
export interface PublishOutcome {
  readonly warnings: readonly string[];
}

/**
 * Atomic no-overwrite publication of the staged ZIP to the final path.
 *
 * Uses `fs.linkSync(stagedZip, finalPath)` — atomically fails with EEXIST
 * if finalPath already exists at the moment of the call. There is no
 * pre-check + rename TOCTOU window. There is no copy fallback. A link
 * failure for any other reason is fatal and throws ArchiveBuilderError
 * BEFORE the final archive becomes visible.
 *
 * Once linkSync succeeds, publication is irrevocable. The function
 * returns PublishOutcome (never throws) regardless of whether subsequent
 * cleanup (unlink staged, stage.cleanup()) succeeds. Cleanup failures
 * are captured as warnings, not errors. The contract: nonzero exit
 * means no newly-published archive (parent blocker round 4 #1).
 */
export function publishStagedArchive(
  stage: StagedArchive,
  finalPath: string,
  outputRoot: string,
): PublishOutcome {
  assertOutputContained(finalPath, outputRoot);
  try {
    fs.linkSync(stage.stagedZip, finalPath);
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    const msg = e instanceof Error ? e.message : String(e);
    if (code === "EEXIST") {
      throw new ArchiveBuilderError(
        `pre-existing final archive would be overwritten: ${finalPath}`,
      );
    }
    throw new ArchiveBuilderError(`atomic link publish failed: ${msg} (code=${code ?? "unknown"})`);
  }
  // Publication succeeded (linearization point passed). All subsequent
  // cleanup is best-effort: failures become warnings, never throws.
  const warnings: string[] = [];
  const unlinkWarning = bestEffortUnlink(stage.stagedZip);
  if (unlinkWarning !== null) warnings.push(unlinkWarning);
  const cleanupWarning = bestEffortCleanup(stage);
  if (cleanupWarning !== null) warnings.push(cleanupWarning);
  return { warnings };
}

function bestEffortUnlink(stagedZip: string): string | null {
  try {
    fs.unlinkSync(stagedZip);
    return null;
  } catch (e) {
    return `staged unlink failed (finalPath intact): ${e instanceof Error ? e.message : String(e)}`;
  }
}

function bestEffortCleanup(stage: StagedArchive): string | null {
  try {
    stage.cleanup();
    return null;
  } catch (e) {
    return `staging cleanup failed (finalPath intact): ${e instanceof Error ? e.message : String(e)}`;
  }
}
