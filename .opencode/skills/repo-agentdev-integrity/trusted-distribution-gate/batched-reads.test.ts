// Batched reads integration tests against real git fixtures.
//
// Extracted from launcher-regression.test.ts to keep that module under the
// 250 pure LOC ceiling.

import { describe, expect, test } from "bun:test";
import { execFileSync } from "child_process";
import {
  makeFixtureRepo,
  disposeRepo,
  headOid,
} from "./launcher-fixture.ts";
import {
  makeProductionAdapter,
  readBlobsBatched,
  listTreeEntries,
  type RawGitAdapter,
} from "./git-blob-reader.ts";
import {
  checkBlobPresent,
  parseBatchedResponse,
  readBlob,
} from "./git-blob-batch.ts";
import { assertGitOid, GitAdapterError, type RepoPath } from "./types.ts";

function asRepo(p: string): RepoPath { return p as RepoPath; }

describe("git-blob-reader / batched reads integration", () => {
  test("readBlobsBatched returns all present blobs in ONE subprocess", () => {
    const repo = makeFixtureRepo();
    try {
      const head = headOid(repo);
      const adapter = makeProductionAdapter(asRepo(repo));
      const entries = listTreeEntries(adapter, assertGitOid(head), "candidate");
      const interesting = entries
        .map((e) => e.path)
        .filter((p) => p.startsWith("src/common/") || p.startsWith("src/opencode/plugins/") || p.startsWith("scripts/install-") || p.startsWith("scripts/check-"))
        .slice(0, 5);
      expect(interesting.length).toBeGreaterThan(0);
      const requests = interesting.map((p) => `${head}:${p}`);
      const result = readBlobsBatched(adapter, requests);
      expect(result.found.size + result.missing.length).toBe(requests.length);
      expect(result.found.size).toBeGreaterThan(0);
      for (const bytes of result.found.values()) {
        expect(bytes.length).toBeGreaterThan(0);
      }
    } finally { disposeRepo(repo); }
  }, 60000);

  test("readBlobsBatched returns missing for paths absent at the oid", () => {
    const repo = makeFixtureRepo();
    try {
      const head = headOid(repo);
      const adapter = makeProductionAdapter(asRepo(repo));
      const requests = [`${head}:does/not/exist.md`, `${head}:also-missing.ts`];
      const result = readBlobsBatched(adapter, requests);
      expect(result.found.size).toBe(0);
      expect(result.missing.length).toBe(2);
    } finally { disposeRepo(repo); }
  }, 60000);

  test("bounded git subprocess count: exactly ONE cat-file --batch call", () => {
    const repo = makeFixtureRepo();
    try {
      const head = headOid(repo);
      let spawnCount = 0;
      const wrappedAdapter = {
        cwd: repo,
        spawnGit(args: readonly string[]): Buffer {
          spawnCount++;
          return execFileSync("git", [...args], { cwd: repo, maxBuffer: 256 * 1024 * 1024 }) as Buffer;
        },
        spawnGitWithInput(args: readonly string[], input: Buffer): Buffer {
          spawnCount++;
          return execFileSync("git", [...args], { cwd: repo, maxBuffer: 256 * 1024 * 1024, input }) as Buffer;
        },
      };
      const entries = listTreeEntries(wrappedAdapter, assertGitOid(head), "candidate");
      const requests = entries.map((e) => `${head}:${e.path}`);
      const before = spawnCount;
      const result = readBlobsBatched(wrappedAdapter, requests);
      const during = spawnCount - before;
      expect(during).toBe(1);
      expect(result.found.size).toBeGreaterThan(0);
    } finally { disposeRepo(repo); }
  }, 60000);
});

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

const VALID_OID_40 = "a".repeat(40);
const VALID_OID_64 = "b".repeat(64);

describe("checkBlobPresent / strict echo + OID + size validation", () => {
  test("canonical present response accepted", () => {
    const oid = VALID_OID_40;
    const filePath = "docs/foo.md";
    const buf = Buffer.from(`${oid} blob 5\n`);
    const r = checkBlobPresent(adapterReturning(buf), assertGitOid(oid), filePath);
    expect(r.kind).toBe("present");
  });

  test("canonical missing response with exact echo accepted", () => {
    const oid = VALID_OID_40;
    const filePath = "docs/absent.md";
    const req = `${oid}:${filePath}`;
    const buf = Buffer.from(`${req} missing\n`);
    const r = checkBlobPresent(adapterReturning(buf), assertGitOid(oid), filePath);
    expect(r.kind).toBe("missing");
  });

  test("mismatched missing echo rejected", () => {
    const oid = VALID_OID_40;
    const filePath = "docs/foo.md";
    const buf = Buffer.from(`${VALID_OID_64}:other.md missing\n`);
    const r = checkBlobPresent(adapterReturning(buf), assertGitOid(oid), filePath);
    expect(r.kind).toBe("error");
  });

  test("invalid resolved OID (not hex) rejected", () => {
    const oid = VALID_OID_40;
    const filePath = "docs/foo.md";
    const buf = Buffer.from(`not-a-valid-oid blob 5\n`);
    const r = checkBlobPresent(adapterReturning(buf), assertGitOid(oid), filePath);
    expect(r.kind).toBe("error");
  });

  test("resolved OID with wrong length (20 hex chars) rejected", () => {
    const oid = VALID_OID_40;
    const filePath = "docs/foo.md";
    const buf = Buffer.from(`${"a".repeat(20)} blob 5\n`);
    const r = checkBlobPresent(adapterReturning(buf), assertGitOid(oid), filePath);
    expect(r.kind).toBe("error");
  });

  test("non-canonical size '01' rejected", () => {
    const oid = VALID_OID_40;
    const filePath = "docs/foo.md";
    const buf = Buffer.from(`${VALID_OID_40} blob 01\n`);
    const r = checkBlobPresent(adapterReturning(buf), assertGitOid(oid), filePath);
    expect(r.kind).toBe("error");
  });

  test("non-canonical size '+1' rejected", () => {
    const oid = VALID_OID_40;
    const filePath = "docs/foo.md";
    const buf = Buffer.from(`${VALID_OID_40} blob +1\n`);
    const r = checkBlobPresent(adapterReturning(buf), assertGitOid(oid), filePath);
    expect(r.kind).toBe("error");
  });

  test("non-canonical size with leading whitespace rejected", () => {
    const oid = VALID_OID_40;
    const filePath = "docs/foo.md";
    const buf = Buffer.from(`${VALID_OID_40} blob  5\n`);
    const r = checkBlobPresent(adapterReturning(buf), assertGitOid(oid), filePath);
    expect(r.kind).toBe("error");
  });

  test("multi-line response rejected (trailing bytes after newline)", () => {
    const oid = VALID_OID_40;
    const filePath = "docs/foo.md";
    const buf = Buffer.from(`${VALID_OID_40} blob 5\nextra\n`);
    const r = checkBlobPresent(adapterReturning(buf), assertGitOid(oid), filePath);
    expect(r.kind).toBe("error");
  });
});

describe("parseBatchedResponse / resolved OID validation", () => {
  test("invalid resolved OID in present header rejected", () => {
    const req = `${VALID_OID_40}:a.md`;
    const body = Buffer.from("# hi\n");
    const header = `not-a-valid-oid blob ${body.length}\n`;
    const buf = Buffer.concat([Buffer.from(header), body, Buffer.from("\n")]);
    expect(() => parseBatchedResponse(buf, [req])).toThrow(GitAdapterError);
  });

  test("resolved OID with wrong length rejected", () => {
    const req = `${VALID_OID_40}:a.md`;
    const body = Buffer.from("# hi\n");
    const header = `${"a".repeat(20)} blob ${body.length}\n`;
    const buf = Buffer.concat([Buffer.from(header), body, Buffer.from("\n")]);
    expect(() => parseBatchedResponse(buf, [req])).toThrow(GitAdapterError);
  });

  test("valid 64-char SHA-256 resolved OID accepted", () => {
    const req = `${VALID_OID_40}:a.md`;
    const body = Buffer.from("# hi\n");
    const header = `${VALID_OID_64} blob ${body.length}\n`;
    const buf = Buffer.concat([Buffer.from(header), body, Buffer.from("\n")]);
    const r = parseBatchedResponse(buf, [req]);
    expect(r.found.size).toBe(1);
  });
});

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
    const buf = Buffer.from(`deadbeefcafe00000000000000000000000000ff blob 5`);
    expect(() => readBlobsBatched(adapterReturning(buf), [req])).toThrow(GitAdapterError);
  });

  test("truncated body (declared size > available bytes) throws GitAdapterError", () => {
    const req = "deadbeefcafe00000000000000000000000000ff:docs/foo.md";
    const header = `deadbeefcafe00000000000000000000000000ff blob 99\n`;
    const buf = Buffer.concat([Buffer.from(header), Buffer.from("short")]);
    expect(() => readBlobsBatched(adapterReturning(buf), [req])).toThrow(GitAdapterError);
  });

  test("short response count (3 requests, 1 response) throws GitAdapterError", () => {
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
    const buf = Buffer.concat([Buffer.from(header), body]);
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
    const req = "deadbeefcafe00000000000000000000000000ff:a.md";
    const buf = Buffer.from(`00000000000000000000000000000000000000aa missing\n`);
    expect(() => readBlobsBatched(adapterReturning(buf), [req])).toThrow(GitAdapterError);
  });
});

describe("RawGitAdapter / spawnGitWithInput mandatory", () => {
  test("readBlobsBatched throws when adapter lacks spawnGitWithInput", () => {
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
