// Tests for the archive builder.
//
// Stage A trust-root archive builder:
//   - ZIP entries come ONLY from candidate Git blobs (never working tree).
//   - Final archive is published via atomic hard-link publication.
//   - Pre-existing final archive is never overwritten/removed.
//   - On any failure, only this run's temp artifacts are removed.
//   - Archive entry set + digests are verified before publish.
//   - Concurrent same-OID runs do not corrupt each other.

import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  computeSha256,
  buildArchiveFromBlobs,
  type BlobSource,
} from "./archive-builder.ts";
import { verifyArchive } from "./archive-verify.ts";
import {
  prepareStagedArchive,
  publishStagedArchive,
} from "./archive-publish.ts";

let TMP_ROOT: string;

beforeEach(() => {
  TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "trust-ab-"));
});

afterEach(() => {
  try { fs.rmSync(TMP_ROOT, { recursive: true, force: true }); } catch { /* */ }
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

describe("archive-builder / prepareStagedArchive + publishStagedArchive", () => {
  test("writes final zip via hard-link publication", () => {
    const blobs: BlobSource[] = [
      { archivePath: "a.md", bytes: new TextEncoder().encode("# a\n") },
    ];
    const finalPath = path.join(TMP_ROOT, "final.zip");
    publishStagedArchive(prepareStagedArchive(blobs, TMP_ROOT), finalPath, TMP_ROOT);
    expect(fs.existsSync(finalPath)).toBe(true);
  });

  test("does NOT overwrite pre-existing final archive", () => {
    const finalPath = path.join(TMP_ROOT, "final.zip");
    fs.writeFileSync(finalPath, "PRE-EXISTING");
    const blobs: BlobSource[] = [
      { archivePath: "a.md", bytes: new TextEncoder().encode("# a\n") },
    ];
    expect(() => publishStagedArchive(prepareStagedArchive(blobs, TMP_ROOT), finalPath, TMP_ROOT)).toThrow();
    expect(fs.readFileSync(finalPath, "utf-8")).toBe("PRE-EXISTING");
  });

  test("removes temp artifacts on failure", () => {
    const finalPath = path.join(TMP_ROOT, "final.zip");
    fs.writeFileSync(finalPath, "PRE-EXISTING");
    const blobs: BlobSource[] = [
      { archivePath: "a.md", bytes: new TextEncoder().encode("# a\n") },
    ];
    const stage = prepareStagedArchive(blobs, TMP_ROOT);
    try {
      publishStagedArchive(stage, finalPath, TMP_ROOT);
    } catch {
      stage.cleanup();
    }
    const entries = fs.readdirSync(TMP_ROOT).sort();
    expect(entries).toEqual(["final.zip"]);
  });
});

describe("archive-builder / output containment (parent defect #11)", () => {
  test("rejects final path outside output root", () => {
    const blobs: BlobSource[] = [
      { archivePath: "a.md", bytes: new TextEncoder().encode("# a\n") },
    ];
    const outside = path.join(os.tmpdir(), `outside-${Math.random().toString(36).slice(2, 6)}.zip`);
    expect(() => publishStagedArchive(prepareStagedArchive(blobs, TMP_ROOT), outside, TMP_ROOT)).toThrow();
    expect(fs.existsSync(outside)).toBe(false);
  });

  test("rejects final path equal to output root", () => {
    const blobs: BlobSource[] = [
      { archivePath: "a.md", bytes: new TextEncoder().encode("# a\n") },
    ];
    expect(() => publishStagedArchive(prepareStagedArchive(blobs, TMP_ROOT), TMP_ROOT, TMP_ROOT)).toThrow();
  });

  test("rejects traversal in final path that escapes root", () => {
    const blobs: BlobSource[] = [
      { archivePath: "a.md", bytes: new TextEncoder().encode("# a\n") },
    ];
    const escape = path.join(TMP_ROOT, "..", "escape.zip");
    expect(() => publishStagedArchive(prepareStagedArchive(blobs, TMP_ROOT), escape, TMP_ROOT)).toThrow();
  });
});

describe("archive-builder / shell-injection resistance (parent defect #2)", () => {
  test("metacharacters in archive path are rejected before any subprocess", () => {
    // An attacker-controlled archive path with shell metacharacters must
    // not reach compress/extract. buildArchiveFromBlobs throws before
    // any zip subprocess is spawned.
    const malicious: BlobSource[] = [
      { archivePath: "a'; $(rm -rf ~); '.md", bytes: new TextEncoder().encode("x") },
    ];
    expect(() => buildArchiveFromBlobs(malicious, path.join(TMP_ROOT, "inj-stage"))).toThrow();
  });

  test("backtick / $() in archive path rejected", () => {
    const malicious: BlobSource[] = [
      { archivePath: "$(whoami).md", bytes: new TextEncoder().encode("x") },
    ];
    expect(() => buildArchiveFromBlobs(malicious, path.join(TMP_ROOT, "inj-stage-2"))).toThrow();
  });
});

// Helper: zip a directory's CONTENTS (not the dir itself) for the
// verifyArchive tests. Uses execFileSync with array args (matches the
// production compressStage style; no shell injection surface).
import { execFileSync } from "child_process";
function compressDir(src: string, dst: string): void {
  fs.rmSync(dst, { force: true });
  if (process.platform === "win32") {
    const script =
      `Compress-Archive -Path (Join-Path $env:TRUST_SRC '*') -DestinationPath $env:TRUST_DST -Force`;
    execFileSync("powershell", ["-NoProfile", "-Command", script], {
      env: { ...process.env, TRUST_SRC: src, TRUST_DST: dst },
    });
  } else {
    execFileSync("zip", ["-r", "-q", dst, "."], { cwd: src });
  }
}
