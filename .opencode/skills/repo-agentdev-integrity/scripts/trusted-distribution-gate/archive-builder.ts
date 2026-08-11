// Stage A trust-root archive builder.
//
// Builds a ZIP archive ONLY from candidate Git blobs (never working-tree
// files). The archive is published atomically: stage to a unique temp dir,
// compress to a temp zip, verify entry set + digests, then rename to the
// final path. On any failure, only this run's temp artifacts are removed;
// pre-existing final archives are NEVER overwritten or removed.
//
// Trust contract:
//   - Blob sources must originate from `git cat-file blob <oid>:<path>`,
//     never from working-tree reads. The launcher enforces this.
//   - Path traversal, absolute paths, drive letters, and duplicate paths
//     in archive paths are rejected before any file is written.
//   - The archive is verified against the expected manifest BEFORE the
//     atomic rename. A mismatch removes only this run's temp artifacts.

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// ---------------------------------------------------------------------------
// Blob source
// ---------------------------------------------------------------------------

export interface BlobSource {
  /** Archive-relative path with forward slashes. */
  readonly archivePath: string;
  /** Blob bytes (already read via git cat-file). */
  readonly bytes: Uint8Array;
}

export interface ExpectedEntry {
  readonly path: string;
  readonly sha256: string;
  readonly size: number;
}

// ---------------------------------------------------------------------------
// Hashing
// ---------------------------------------------------------------------------

export function computeSha256(bytes: Uint8Array): string {
  const h = crypto.createHash("sha256");
  h.update(bytes);
  return h.digest("hex");
}

// ---------------------------------------------------------------------------
// Path safety
// ---------------------------------------------------------------------------

export class ArchiveBuilderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ArchiveBuilderError";
  }
}

function assertSafeArchivePath(archivePath: string): void {
  if (path.isAbsolute(archivePath)) {
    throw new ArchiveBuilderError(`absolute archive path rejected: ${archivePath}`);
  }
  // Reject Windows drive letters like C:/ or C:\ at the start.
  if (/^[A-Za-z]:[\\/]/.test(archivePath)) {
    throw new ArchiveBuilderError(`drive-letter archive path rejected: ${archivePath}`);
  }
  const normalized = path.normalize(archivePath).replace(/\\/g, "/");
  if (normalized.startsWith("../") || normalized === "..") {
    throw new ArchiveBuilderError(`path traversal rejected: ${archivePath}`);
  }
  if (normalized.includes("/../") || normalized.startsWith("../")) {
    throw new ArchiveBuilderError(`path traversal rejected: ${archivePath}`);
  }
}

// ---------------------------------------------------------------------------
// Stage directory build
// ---------------------------------------------------------------------------

/**
 * Build a staging directory containing the blob bytes laid out at their
 * archive paths. Returns the staging directory path. Caller is responsible
 * for compressing and cleanup.
 */
export function buildArchiveFromBlobs(
  blobs: readonly BlobSource[],
  stageRoot: string,
): string {
  // Reject duplicates and unsafe paths BEFORE writing anything.
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

// ---------------------------------------------------------------------------
// ZIP verification
// ---------------------------------------------------------------------------

export interface VerifyResult {
  readonly ok: boolean;
  readonly missing: readonly string[];
  readonly extra: readonly string[];
  readonly digest_mismatches: readonly string[];
}

/**
 * Verify a zip file's entries against an expected set. The unzip step uses
 * Expand-Archive (Windows) or unzip (POSIX) into a temp dir, then computes
 * SHA-256 of every extracted file.
 */
export function verifyArchive(
  zipPath: string,
  expected: readonly ExpectedEntry[],
): VerifyResult {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "trust-archive-verify-"));
  try {
    extractZip(zipPath, tmpDir);
    const actualEntries = collectActualEntries(tmpDir);
    const expectedMap = new Map(expected.map((e) => [e.path, e]));
    const actualMap = new Map(actualEntries.map((e) => [e.path, e]));

    const missing: string[] = [];
    const extra: string[] = [];
    const digestMismatches: string[] = [];

    for (const [p] of expectedMap) {
      if (!actualMap.has(p)) missing.push(p);
    }
    for (const [p] of actualMap) {
      if (!expectedMap.has(p)) extra.push(p);
    }
    for (const [path, expectedEntry] of expectedMap) {
      const a = actualMap.get(path);
      if (a && (a.sha256 !== expectedEntry.sha256 || a.size !== expectedEntry.size)) {
        digestMismatches.push(path);
      }
    }
    return {
      ok: missing.length === 0 && extra.length === 0 && digestMismatches.length === 0,
      missing: missing.sort(),
      extra: extra.sort(),
      digest_mismatches: digestMismatches.sort(),
    };
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

interface ActualEntry {
  readonly path: string;
  readonly sha256: string;
  readonly size: number;
}

function collectActualEntries(root: string): ActualEntry[] {
  const out: ActualEntry[] = [];
  const walk = (dir: string): void => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
      } else if (ent.isFile()) {
        const rel = path.relative(root, full).replace(/\\/g, "/");
        const bytes = fs.readFileSync(full);
        out.push({
          path: rel,
          sha256: computeSha256(new Uint8Array(bytes)),
          size: bytes.length,
        });
      }
    }
  };
  walk(root);
  return out;
}

function extractZip(zipPath: string, dst: string): void {
  fs.mkdirSync(dst, { recursive: true });
  if (process.platform === "win32") {
    const { execSync } = require("child_process") as typeof import("child_process");
    execSync(
      `powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${dst}' -Force"`,
    );
  } else {
    const { execSync } = require("child_process") as typeof import("child_process");
    execSync(`unzip -o -q '${zipPath}' -d '${dst}'`);
  }
}

// ---------------------------------------------------------------------------
// Atomic publish
// ---------------------------------------------------------------------------

/**
 * Build, compress, verify, and atomically publish a zip archive. Refuses
 * to overwrite a pre-existing final archive. On any failure (including
 * verification mismatch), removes only this run's temp artifacts.
 */
export function publishArchiveAtomically(
  blobs: readonly BlobSource[],
  finalPath: string,
): void {
  if (fs.existsSync(finalPath)) {
    throw new ArchiveBuilderError(
      `pre-existing final archive would be overwritten: ${finalPath}`,
    );
  }

  const runId = crypto.randomBytes(8).toString("hex");
  const tmpBase = path.join(os.tmpdir(), `trust-archive-${runId}`);
  fs.mkdirSync(tmpBase, { recursive: true });
  const stageDir = path.join(tmpBase, "stage");
  const tmpZip = path.join(tmpBase, "archive.zip");

  try {
    buildArchiveFromBlobs(blobs, stageDir);

    // Compress stage dir into tmpZip.
    compressStage(stageDir, tmpZip);

    // Verify.
    const expected: ExpectedEntry[] = blobs.map((b) => ({
      path: b.archivePath,
      sha256: computeSha256(b.bytes),
      size: b.bytes.length,
    }));
    const result = verifyArchive(tmpZip, expected);
    if (!result.ok) {
      throw new ArchiveBuilderError(
        `archive verification failed: missing=${JSON.stringify(result.missing)} extra=${JSON.stringify(result.extra)} digest_mismatches=${JSON.stringify(result.digest_mismatches)}`,
      );
    }

    // Atomic rename into place.
    fs.renameSync(tmpZip, finalPath);
  } finally {
    fs.rmSync(tmpBase, { recursive: true, force: true });
  }
}

function compressStage(stageDir: string, zipPath: string): void {
  fs.rmSync(zipPath, { force: true });
  if (process.platform === "win32") {
    const { execSync } = require("child_process") as typeof import("child_process");
    // Compress contents only (`stageDir\*`), so entries do not carry the
    // stage directory name as a prefix.
    execSync(
      `powershell -NoProfile -Command "Compress-Archive -Path '${stageDir}\\*' -DestinationPath '${zipPath}' -Force"`,
    );
  } else {
    const { execSync } = require("child_process") as typeof import("child_process");
    execSync(`cd '${stageDir}' && zip -r -q '${zipPath}' .`);
  }
}
