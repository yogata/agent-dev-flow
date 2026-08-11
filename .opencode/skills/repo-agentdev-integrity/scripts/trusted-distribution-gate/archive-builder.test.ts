// Tests for the archive builder.
//
// Stage A trust-root archive builder:
//   - ZIP entries come ONLY from candidate Git blobs (never working tree).
//   - Final archive is published atomically (write-temp then rename).
//   - Pre-existing final archive is never overwritten/removed.
//   - On any failure, only this run's temp artifacts are removed.
//   - Archive entry set + digests are verified before publish.
//   - Concurrent same-OID runs do not corrupt each other.

import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import * as fs from "fs";
import * as path from "path";
import {
  computeSha256,
  buildArchiveFromBlobs,
  verifyArchive,
  publishArchiveAtomically,
  type BlobSource,
} from "./archive-builder.ts";

const TMP_ROOT = path.join(
  process.cwd(),
  ".worktrees-tmp-test-archive-builder",
);

beforeEach(() => {
  fs.rmSync(TMP_ROOT, { recursive: true, force: true });
  fs.mkdirSync(TMP_ROOT, { recursive: true });
});

afterEach(() => {
  fs.rmSync(TMP_ROOT, { recursive: true, force: true });
});

describe("archive-builder / computeSha256", () => {
  test("computes SHA-256 of bytes", () => {
    const sha = computeSha256(new TextEncoder().encode("hello"));
    // Known SHA-256 of "hello"
    expect(sha).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
  });
  test("lowercase hex 64 chars", () => {
    const sha = computeSha256(new TextEncoder().encode(""));
    expect(sha).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("archive-builder / buildArchiveFromBlobs", () => {
  test("writes entries to staging dir from blob sources", () => {
    const blobs: BlobSource[] = [
      { archivePath: "a.md", bytes: new TextEncoder().encode("# a\n") },
      { archivePath: "sub/b.md", bytes: new TextEncoder().encode("# b\n") },
    ];
    const staged = buildArchiveFromBlobs(blobs, path.join(TMP_ROOT, "stage"));
    expect(fs.existsSync(path.join(staged, "a.md"))).toBe(true);
    expect(fs.existsSync(path.join(staged, "sub", "b.md"))).toBe(true);
  });

  test("rejects path traversal in archive paths", () => {
    const blobs: BlobSource[] = [
      { archivePath: "../escape.md", bytes: new TextEncoder().encode("x") },
    ];
    expect(() => buildArchiveFromBlobs(blobs, path.join(TMP_ROOT, "stage"))).toThrow();
  });

  test("rejects absolute archive path", () => {
    const blobs: BlobSource[] = [
      { archivePath: "/etc/passwd", bytes: new TextEncoder().encode("x") },
    ];
    expect(() => buildArchiveFromBlobs(blobs, path.join(TMP_ROOT, "stage"))).toThrow();
  });

  test("rejects duplicate archive paths", () => {
    const blobs: BlobSource[] = [
      { archivePath: "a.md", bytes: new TextEncoder().encode("# a\n") },
      { archivePath: "a.md", bytes: new TextEncoder().encode("# b\n") },
    ];
    expect(() => buildArchiveFromBlobs(blobs, path.join(TMP_ROOT, "stage"))).toThrow();
  });

  test("rejects windows drive-letter path", () => {
    const blobs: BlobSource[] = [
      { archivePath: "C:/x", bytes: new TextEncoder().encode("x") },
    ];
    expect(() => buildArchiveFromBlobs(blobs, path.join(TMP_ROOT, "stage"))).toThrow();
  });
});

describe("archive-builder / verifyArchive", () => {
  test("returns true when zip entries match expected set", () => {
    const blobs: BlobSource[] = [
      { archivePath: "a.md", bytes: new TextEncoder().encode("# a\n") },
      { archivePath: "sub/b.md", bytes: new TextEncoder().encode("# b\n") },
    ];
    const staged = buildArchiveFromBlobs(blobs, path.join(TMP_ROOT, "stage"));
    const zipPath = path.join(TMP_ROOT, "test.zip");
    compressDir(staged, zipPath);

    const expected = blobs.map((b) => ({
      path: b.archivePath,
      sha256: computeSha256(b.bytes),
      size: b.bytes.length,
    }));
    const r = verifyArchive(zipPath, expected);
    expect(r.ok).toBe(true);
  });

  test("detects missing entry", () => {
    const blobs: BlobSource[] = [
      { archivePath: "a.md", bytes: new TextEncoder().encode("# a\n") },
    ];
    const staged = buildArchiveFromBlobs(blobs, path.join(TMP_ROOT, "stage"));
    const zipPath = path.join(TMP_ROOT, "test.zip");
    compressDir(staged, zipPath);

    const expected = [
      { path: "a.md", sha256: computeSha256(new TextEncoder().encode("# a\n")), size: 4 },
      { path: "missing.md", sha256: "0".repeat(64), size: 0 },
    ];
    const r = verifyArchive(zipPath, expected);
    expect(r.ok).toBe(false);
    expect(r.missing).toEqual(["missing.md"]);
  });

  test("detects digest mismatch", () => {
    const blobs: BlobSource[] = [
      { archivePath: "a.md", bytes: new TextEncoder().encode("# a\n") },
    ];
    const staged = buildArchiveFromBlobs(blobs, path.join(TMP_ROOT, "stage"));
    const zipPath = path.join(TMP_ROOT, "test.zip");
    compressDir(staged, zipPath);

    const expected = [
      { path: "a.md", sha256: "f".repeat(64), size: 4 },
    ];
    const r = verifyArchive(zipPath, expected);
    expect(r.ok).toBe(false);
    expect(r.digest_mismatches).toEqual(["a.md"]);
  });

  test("detects extra entry in archive", () => {
    const blobs: BlobSource[] = [
      { archivePath: "a.md", bytes: new TextEncoder().encode("# a\n") },
      { archivePath: "extra.md", bytes: new TextEncoder().encode("x\n") },
    ];
    const staged = buildArchiveFromBlobs(blobs, path.join(TMP_ROOT, "stage"));
    const zipPath = path.join(TMP_ROOT, "test.zip");
    compressDir(staged, zipPath);

    const expected = [
      { path: "a.md", sha256: computeSha256(new TextEncoder().encode("# a\n")), size: 4 },
    ];
    const r = verifyArchive(zipPath, expected);
    expect(r.ok).toBe(false);
    expect(r.extra).toEqual(["extra.md"]);
  });
});

describe("archive-builder / publishArchiveAtomically", () => {
  test("writes final zip via temp rename", () => {
    const blobs: BlobSource[] = [
      { archivePath: "a.md", bytes: new TextEncoder().encode("# a\n") },
    ];
    const finalPath = path.join(TMP_ROOT, "final.zip");
    publishArchiveAtomically(blobs, finalPath);
    expect(fs.existsSync(finalPath)).toBe(true);
  });

  test("does NOT overwrite pre-existing final archive", () => {
    const finalPath = path.join(TMP_ROOT, "final.zip");
    fs.writeFileSync(finalPath, "PRE-EXISTING");
    const blobs: BlobSource[] = [
      { archivePath: "a.md", bytes: new TextEncoder().encode("# a\n") },
    ];
    expect(() => publishArchiveAtomically(blobs, finalPath)).toThrow();
    expect(fs.readFileSync(finalPath, "utf-8")).toBe("PRE-EXISTING");
  });

  test("removes temp artifacts on failure", () => {
    const finalPath = path.join(TMP_ROOT, "final.zip");
    fs.writeFileSync(finalPath, "PRE-EXISTING");
    const blobs: BlobSource[] = [
      { archivePath: "a.md", bytes: new TextEncoder().encode("# a\n") },
    ];
    try {
      publishArchiveAtomically(blobs, finalPath);
    } catch {
      // expected
    }
    // No leftover temp dirs/files besides the pre-existing final.
    const entries = fs.readdirSync(TMP_ROOT).sort();
    expect(entries).toEqual(["final.zip"]);
  });
});

// Helper: zip a directory's CONTENTS (not the dir itself) using the same
// scheme as the production compressStage. Tests need a real .zip file with
// the expected entry paths.
function compressDir(src: string, dst: string): void {
  fs.rmSync(dst, { force: true });
  if (process.platform === "win32") {
    const { execSync } = require("child_process") as typeof import("child_process");
    execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${src}\\*' -DestinationPath '${dst}' -Force"`);
  } else {
    const { execSync } = require("child_process") as typeof import("child_process");
    execSync(`cd '${src}' && zip -r -q '${dst}' .`);
  }
}
