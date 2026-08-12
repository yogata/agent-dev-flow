// Stage A trust-root archive builder primitives.
//
// Path safety, hashing, and the stage-directory build. The atomic publish
// transaction lives in archive-publish.ts; archive entry verification
// lives in archive-verify.ts. Both were extracted to keep this module
// under the 250 pure LOC ceiling.
//
// Trust contract:
//   - Blob sources must originate from `git cat-file blob <oid>:<path>`,
//     never from working-tree reads. The launcher enforces this.
//   - Path traversal, absolute paths, drive letters, and duplicate paths
//     in archive paths are rejected before any file is written.
//   - Path safety violations throw PathSafetyError (exit 5), not the
//     generic ArchiveBuilderError (parent defect #10).

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { PathSafetyError } from "./types.ts";

export interface BlobSource {
  /** Archive-relative path with forward slashes (under the wrapped root). */
  readonly archivePath: string;
  /** Blob bytes (already read via git cat-file). */
  readonly bytes: Uint8Array;
}

export function computeSha256(bytes: Uint8Array): string {
  const h = crypto.createHash("sha256");
  h.update(bytes);
  return h.digest("hex");
}

export class ArchiveBuilderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ArchiveBuilderError";
  }
}

/**
 * Pre-write path safety check. Throws PathSafetyError (caller maps to exit
 * 5) for traversal, absolute, drive-letter, or unsafe-character archive
 * paths.
 *
 * Segment matching is EXACT: `..` as a complete path segment is a
 * traversal; `foo..bar.md` (double-dot inside a filename) is a legitimate
 * leaf and is NOT rejected (parent blocker #6).
 */
export function assertSafeArchivePath(archivePath: string): void {
  if (path.isAbsolute(archivePath)) {
    throw new PathSafetyError("path-traversal", `absolute archive path rejected: ${archivePath}`);
  }
  if (/^[A-Za-z]:[\\/]/.test(archivePath)) {
    throw new PathSafetyError("path-traversal", `drive-letter archive path rejected: ${archivePath}`);
  }
  const normalized = archivePath.replace(/\\/g, "/");
  const segments = normalized.split("/");
  for (const seg of segments) {
    if (seg === "..") {
      throw new PathSafetyError("path-traversal", `path traversal segment rejected: ${archivePath}`);
    }
  }
  if (!/^[A-Za-z0-9._\-\\/]+$/.test(archivePath)) {
    throw new PathSafetyError(
      "unsafe-archive-path",
      `archive path contains forbidden characters: ${archivePath}`,
    );
  }
}

/**
 * Build a staging directory containing the blob bytes laid out at their
 * archive paths. Returns the staging directory path. Caller is responsible
 * for compressing and cleanup.
 */
export function buildArchiveFromBlobs(
  blobs: readonly BlobSource[],
  stageRoot: string,
): string {
  const seen = new Set<string>();
  for (const b of blobs) {
    assertSafeArchivePath(b.archivePath);
    if (seen.has(b.archivePath)) {
      throw new ArchiveBuilderError(`duplicate archive path: ${b.archivePath}`);
    }
    seen.add(b.archivePath);
  }

  fs.rmSync(stageRoot, { recursive: true, force: true });
  fs.mkdirSync(stageRoot, { recursive: true });

  for (const b of blobs) {
    const target = path.join(stageRoot, b.archivePath);
    const parent = path.dirname(target);
    fs.mkdirSync(parent, { recursive: true });
    fs.writeFileSync(target, b.bytes);
  }
  return stageRoot;
}

export {
  prepareStagedArchive,
  publishStagedArchive,
  assertOutputContained,
} from "./archive-publish.ts";
export type { StagedArchive, PublishOutcome } from "./archive-publish.ts";
export { verifyArchive } from "./archive-verify.ts";
export type { ExpectedEntry, VerifyResult } from "./archive-verify.ts";
