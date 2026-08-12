// TDD red-phase regression tests for the two remaining fail-closed gaps
// the parent found in Round 2:
//
//   - publishStagedArchive uses existsSync+renameSync; a destination
//     created in the TOCTOU window is silently overwritten on POSIX
//     rename. Must use an atomic no-overwrite primitive (linkSync).
//   - readBlobsBatched classifies truncated/shortfall/malformed protocol
//     responses as `missing`. Anything other than an explicit valid
//     `<request> missing` response MUST throw GitAdapterError.
//   - checkBlobPresent fallback catches every cat-file -e error as
//     missing. Adapter failures must never be downgraded; the
//     spawnGitWithInput seam must be MANDATORY on RawGitAdapter.
//
// These tests fail on the current code, then pass after the refactor.

import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import {
  prepareStagedArchive,
  publishStagedArchive,
  ArchiveBuilderError,
} from "./archive-publish.ts";
import {
  readBlob,
  readBlobsBatched,
} from "./git-blob-batch.ts";
import type { RawGitAdapter } from "./git-blob-reader.ts";
import { GitAdapterError, assertGitOid } from "./types.ts";

function makeTmpDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

// ---------------------------------------------------------------------------
// TOCTOU: publishStagedArchive must use atomic no-overwrite publication
// ---------------------------------------------------------------------------

describe("publish / atomic no-overwrite publication (TOCTOU)", () => {
  test("pre-existing final bytes are NOT overwritten when publication runs", () => {
    // The TOCTOU attack: a competing process creates `finalPath` AFTER
    // publishStagedArchive's existsSync check but BEFORE its renameSync.
    // POSIX rename overwrites the destination silently. The fix is to
    // use linkSync (atomically fails EEXIST on a pre-existing dest).
    //
    // We simulate the window by creating `finalPath` BEFORE calling
    // publishStagedArchive — the result is identical to a TOCTOU race
    // because linkSync (the fix) atomically fails whenever the dest
    // exists at the moment of the call.
    const outputRoot = makeTmpDir("trust-toctou-");
    try {
      // Prepare a staged archive normally.
      const stage = prepareStagedArchive(
        [{ archivePath: "a.md", bytes: new TextEncoder().encode("# staged\n") }],
        outputRoot,
      );
      // Pre-create finalPath with sentinel bytes (simulates the TOCTOU
      // window where an attacker won the race).
      const finalPath = path.join(outputRoot, "final.zip");
      const sentinel = Buffer.from("PRE-EXISTING-FROM-TOCTOU-RACE");
      fs.writeFileSync(finalPath, sentinel);
      // publishStagedArchive MUST throw AND MUST NOT overwrite finalPath.
      expect(() => publishStagedArchive(stage, finalPath, outputRoot)).toThrow(ArchiveBuilderError);
      const after = fs.readFileSync(finalPath);
      expect(after.equals(sentinel)).toBe(true);
    } finally {
      try { fs.rmSync(outputRoot, { recursive: true, force: true }); } catch { /* */ }
    }
  });

  test("publishStagedArchive source uses linkSync (no renameSync as publish primitive)", () => {
    // Source-code contract: the publish primitive MUST be linkSync, not
    // renameSync. renameSync is non-atomic on POSIX when destination
    // exists. This is a structural check, not a behavioral substitute.
    const src = fs.readFileSync(path.join(__dirname, "archive-publish.ts"), "utf-8");
    expect(src).toMatch(/fs\.linkSync\(/);
    expect(src).not.toMatch(/fs\.renameSync\(.*stagedZip/);
  });
});

// ---------------------------------------------------------------------------
// Protocol strictness: readBlobsBatched must throw on any malformed
// response. Only an explicit valid `<request> missing` enters `missing`.
// ---------------------------------------------------------------------------

// Adapter helper: returns a pre-baked raw buffer for cat-file --batch.
function adapterReturning(rawResponse: Buffer): RawGitAdapter {
  return {
    cwd: "/fake",
    spawnGit(): Buffer {
      throw new Error("unexpected spawnGit");
    },
    spawnGitWithInput(): Buffer {
      return rawResponse;
    },
  };
}

describe("readBlobsBatched / strict protocol validation", () => {
  test("explicit valid `missing` response → recorded in missing", () => {
    const req = "deadbeefcafe00000000000000000000000000ff:docs/foo.md";
    const buf = Buffer.from(`${req} missing\n`);
    const r = readBlobsBatched(adapterReturning(buf), [req]);
    expect(r.missing).toEqual([req]);
    expect(r.found.size).toBe(0);
  });

  test("explicit valid blob response → recorded in found", () => {
    const req = "deadbeefcafe00000000000000000000000000ff:docs/foo.md";
    const body = Buffer.from("# hi\n");
    const header = `deadbeefcafe00000000000000000000000000ff blob ${body.length}\n`;
    const buf = Buffer.concat([Buffer.from(header), body, Buffer.from("\n")]);
    const r = readBlobsBatched(adapterReturning(buf), [req]);
    expect(r.found.size).toBe(1);
    expect(r.missing).toEqual([]);
    const got = r.found.get(req);
    expect(got && got.length).toBe(body.length);
  });

  test("truncated header (no newline) throws GitAdapterError", () => {
    const req = "deadbeefcafe00000000000000000000000000ff:docs/foo.md";
    const buf = Buffer.from(`deadbeefcafe00000000000000000000000000ff blob 5`); // no \n
    expect(() => readBlobsBatched(adapterReturning(buf), [req])).toThrow(GitAdapterError);
  });

  test("truncated body (declared size > available bytes) throws GitAdapterError", () => {
    const req = "deadbeefcafe00000000000000000000000000ff:docs/foo.md";
    const header = `deadbeefcafe00000000000000000000000000ff blob 99\n`;
    const buf = Buffer.concat([Buffer.from(header), Buffer.from("short")]);
    expect(() => readBlobsBatched(adapterReturning(buf), [req])).toThrow(GitAdapterError);
  });

  test("short response count (3 requests, 1 response) throws GitAdapterError", () => {
    // The previous code silently marked the un-answered requests as
    // missing. The strict contract is: every request MUST receive a
    // response. A shortfall is a protocol error.
    const req1 = "deadbeefcafe00000000000000000000000000ff:a.md";
    const req2 = "deadbeefcafe00000000000000000000000000ff:b.md";
    const req3 = "deadbeefcafe00000000000000000000000000ff:c.md";
    const body = Buffer.from("x");
    const buf = Buffer.concat([
      Buffer.from(`deadbeefcafe00000000000000000000000000ff blob 1\n`),
      body,
      Buffer.from("\n"),
    ]);
    expect(() => readBlobsBatched(adapterReturning(buf), [req1, req2, req3])).toThrow(GitAdapterError);
  });

  test("malformed missing header (`<req> missing extra`) throws GitAdapterError", () => {
    const req = "deadbeefcafe00000000000000000000000000ff:a.md";
    const buf = Buffer.from(`${req} missing extra\n`);
    expect(() => readBlobsBatched(adapterReturning(buf), [req])).toThrow(GitAdapterError);
  });

  test("wrong object kind (`commit` instead of `blob`) throws GitAdapterError", () => {
    const req = "deadbeefcafe00000000000000000000000000ff:a.md";
    const buf = Buffer.from(`deadbeefcafe00000000000000000000000000ff commit 5\nabcde\n`);
    expect(() => readBlobsBatched(adapterReturning(buf), [req])).toThrow(GitAdapterError);
  });

  test("invalid size (non-numeric) throws GitAdapterError", () => {
    const req = "deadbeefcafe00000000000000000000000000ff:a.md";
    const buf = Buffer.from(`deadbeefcafe00000000000000000000000000ff blob NaN\n`);
    expect(() => readBlobsBatched(adapterReturning(buf), [req])).toThrow(GitAdapterError);
  });

  test("missing post-body newline throws GitAdapterError", () => {
    const req = "deadbeefcafe00000000000000000000000000ff:a.md";
    const body = Buffer.from("# hi\n");
    const header = `deadbeefcafe00000000000000000000000000ff blob ${body.length}\n`;
    const buf = Buffer.concat([Buffer.from(header), body]); // no trailing \n
    expect(() => readBlobsBatched(adapterReturning(buf), [req])).toThrow(GitAdapterError);
  });

  test("trailing unparsed bytes after all responses throws GitAdapterError", () => {
    const req = "deadbeefcafe00000000000000000000000000ff:a.md";
    const body = Buffer.from("# hi\n");
    const header = `deadbeefcafe00000000000000000000000000ff blob ${body.length}\n`;
    const buf = Buffer.concat([
      Buffer.from(header),
      body,
      Buffer.from("\n"),
      Buffer.from("TRAILING-GARBAGE"),
    ]);
    expect(() => readBlobsBatched(adapterReturning(buf), [req])).toThrow(GitAdapterError);
  });

  test("missing header that does not echo the original request throws GitAdapterError", () => {
    // The strict protocol requires the missing response to echo the
    // ORIGINAL request key, not a resolved oid. If git returns
    // `<resolved> missing` we cannot associate it with the request
    // unambiguously, so we treat it as a protocol error.
    const req = "deadbeefcafe00000000000000000000000000ff:a.md";
    const buf = Buffer.from(`00000000000000000000000000000000000000aa missing\n`);
    expect(() => readBlobsBatched(adapterReturning(buf), [req])).toThrow(GitAdapterError);
  });
});

// ---------------------------------------------------------------------------
// RawGitAdapter contract: spawnGitWithInput is MANDATORY
// ---------------------------------------------------------------------------

describe("RawGitAdapter / spawnGitWithInput mandatory", () => {
  test("readBlobsBatched throws when adapter lacks spawnGitWithInput", () => {
    // Construct an adapter that omits spawnGitWithInput via Partial<Omit>.
    // The runtime check inside readBlobsBatched must surface this as
    // GitAdapterError.
    const brokenAdapter = {
      cwd: "/fake",
      spawnGit(): Buffer {
        throw new Error("should not be called");
      },
    } as unknown as RawGitAdapter;
    expect(() => readBlobsBatched(brokenAdapter, ["deadbeefcafe00000000000000000000000000ff:a.md"])).toThrow(GitAdapterError);
  });

  test("readBlob throws GitAdapterError when adapter lacks spawnGitWithInput", () => {
    const brokenAdapter = {
      cwd: "/fake",
      spawnGit(): Buffer {
        throw new Error("should not be called");
      },
    } as unknown as RawGitAdapter;
    expect(
      () => readBlob(brokenAdapter, assertGitOid("a".repeat(40)), "lbl", "a.md"),
    ).toThrow(GitAdapterError);
  });
});
