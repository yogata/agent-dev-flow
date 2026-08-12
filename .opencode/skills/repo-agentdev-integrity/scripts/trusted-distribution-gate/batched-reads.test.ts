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
} from "./git-blob-reader.ts";
import { assertGitOid, type RepoPath } from "./types.ts";

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
        .filter((p) => p.startsWith("src/opencode/") || p.startsWith("scripts/install-") || p.startsWith("scripts/check-"))
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
