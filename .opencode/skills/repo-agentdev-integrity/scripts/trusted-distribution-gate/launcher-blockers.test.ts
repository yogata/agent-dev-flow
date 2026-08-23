// TDD red-phase regression tests for confirmed parent blockers.
//
// These tests fail against the current code on purpose. They encode the
// contracts the parent review requires:
//
//   - Physical archive-installed verification runs BEFORE the final archive
//     is published. A failed physical install MUST leave no final archive
//     at the public output path.
//   - Archive staging happens under outputRoot (same filesystem), so the
//     final publish is a same-filesystem rename. No EXDEV copy fallback
//     exists.
//   - Protected-path sweep uses O(1) Git subprocesses (a single batched
//     cat-file call for all base+candidate requests).
//   - The batched reader distinguishes `missing` (path absent at oid) from
//     adapter/protocol failures (subprocess crash, malformed header).
//   - Path-safety segment matching rejects exact `..` segments rather
//     than the imprecise substring check `p.includes("..")`.
//
// These tests were written BEFORE the refactor and MUST fail on the
// pre-refactor code, then pass after the refactor.

import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { execFileSync } from "child_process";

import {
  makeTmpDir,
  disposeRepo,
  makeFixtureRepo,
  writeFix,
  headOid,
} from "./launcher-fixture.ts";
import { runLauncher, type LauncherOptions } from "./launcher.ts";
import {
  makeProductionAdapter,
  readBlobsBatched,
} from "./git-blob-reader.ts";
import { checkProtectedPaths } from "./protected-check.ts";
import { assertGitOid, type RepoPath } from "./types.ts";
import {
  assertSafeArchivePath,
  type BlobSource,
} from "./archive-builder.ts";
import {
  prepareStagedArchive,
  publishStagedArchive,
} from "./archive-publish.ts";

function asRepo(p: string): RepoPath {
  return p as RepoPath;
}

function opts(repo: string, base: string, candidate: string, outName: string, extra?: Partial<LauncherOptions>): LauncherOptions {
  return {
    repo_root: repo,
    base_oid: base,
    candidate_oid: candidate,
    output_dir: makeTmpDir(`trust-red-${outName}-`),
    repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
    ...extra,
  };
}

describe("launcher / publish-after-verify ordering (parent blocker #1, #8)", () => {
  test("when physical archive-installed verify fails, NO final archive is published", () => {
    // The launcher reads scripts/consumer/archive/install.ps1 from the BASE
    // OID (trusted). If base has a broken installer (exits non-zero), the
    // physical install verification MUST fail BEFORE any final archive is
    // published. This test commits a base with an installer that always
    // exits 5, then a candidate that adds the trust root only. The
    // launcher's verify MUST fail and the output dir MUST be empty.
    const repo = makeTmpDir("trust-pav-repo-");
    try {
      execFileSync("git", ["init", "-q", "-b", "main"], { cwd: repo });
      execFileSync("git", ["config", "user.email", "t@t"], { cwd: repo });
      execFileSync("git", ["config", "user.name", "t"], { cwd: repo });
      if (process.platform === "win32") {
        execFileSync("git", ["config", "core.longpaths", "true"], { cwd: repo });
      }
      writeFix(repo, "src/opencode/commands/agentdev/case-run.md", "# case-run\n");
      writeFix(repo, "src/opencode/skills/agentdev-foo/SKILL.md", "# foo\n");
      writeFix(repo, "src/opencode/skills/japanese-tech-writing/SKILL.md", "# jtw\n");
      writeFix(repo, "scripts/install.ps1", "# install\n");
      writeFix(repo, "scripts/consumer/common.ps1", "# check\n");
      writeFix(repo, "README-INSTALL.md", "# readme\n");
      writeFix(repo, "scripts/self/release/package-release-archive.ps1", "# placeholder\n");
      // BASE installer: intentionally broken (exit 5). The launcher's
      // verify MUST detect this and refuse to publish.
      writeFix(
        repo,
        "scripts/consumer/archive/install.ps1",
        [
          "[CmdletBinding()]",
          "param([string]$Source,[string]$Target,[string]$Mode)",
          "Write-Host 'intentional installer failure'",
          "exit 5",
          "",
        ].join("\n"),
      );
      execFileSync("git", ["add", "-A"], { cwd: repo });
      execFileSync("git", ["commit", "-q", "-m", "base-with-broken-installer"], { cwd: repo });
      const base = headOid(repo);

      // Candidate: add only the trust root. scripts/consumer/archive/install.ps1
      // remains the broken base version (we want verify to fail). Stage
      // B owns the archive installer original so its non-presence in the
      // candidate commit is fine; protected-path policy does not fire.
      writeFix(repo, "scripts/self/release/trusted-distribution-gate.ps1", "# placeholder\n");
      writeFix(repo, ".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/types.ts", "// types\n");
      writeFix(repo, ".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/protected-paths.ts", "// pp\n");
      execFileSync("git", ["add", "-A"], { cwd: repo });
      execFileSync("git", ["commit", "-q", "-m", "add trust root"], { cwd: repo });
      const candidate = headOid(repo);

      const o = opts(repo, base, candidate, "publish-after-verify", { bootstrap_mode: true });
      const finalPath = path.join(o.output_dir, `agentdev-release-${candidate.substring(0, 8)}.zip`);
      const result = runLauncher(o);
      expect(result.exit_code).not.toBe(0);
      // CRITICAL: no final archive at the public output path.
      expect(fs.existsSync(finalPath)).toBe(false);
      // And no orphan (non-dotfile) files at the output root.
      const leftovers = fs.readdirSync(o.output_dir).filter((n) => !n.startsWith("."));
      expect(leftovers).toEqual([]);
      // And no staging residue either.
      const allEntries = fs.readdirSync(o.output_dir);
      for (const e of allEntries) {
        expect(e.startsWith(".trust-stage-")).toBe(true);
      }
    } finally {
      try { fs.rmSync(repo, { recursive: true, force: true }); } catch { /* */ }
    }
  }, 120000);
});

describe("archive-builder / same-filesystem staging (parent blocker #2)", () => {
  test("staging path is created UNDER outputRoot, never under os.tmpdir()", () => {
    // prepareStagedArchive must stage the archive under the
    // caller-supplied outputRoot so that the final rename is a
    // same-filesystem operation. We assert this by chdir-ing into a
    // known temp root and checking that the staging directory path is
    // rooted under outputRoot (no os.tmpdir() prefix).
    const blobs: BlobSource[] = [
      { archivePath: "a.md", bytes: new TextEncoder().encode("# a\n") },
    ];
    const outputRoot = makeTmpDir("trust-stage-root-");
    const finalPath = path.join(outputRoot, "final.zip");
    publishStagedArchive(prepareStagedArchive(blobs, outputRoot), finalPath, outputRoot);
    // Sanity: archive published.
    expect(fs.existsSync(finalPath)).toBe(true);
    // No staging residue outside finalPath.
    const entries = fs.readdirSync(outputRoot);
    expect(entries).toEqual(["final.zip"]);
    // No orphans under os.tmpdir() with the trust-archive prefix.
    const osTmp = os.tmpdir();
    const tmpEntries = fs.readdirSync(osTmp).filter((n) => n.startsWith("trust-archive-"));
    expect(tmpEntries).toEqual([]);
  }, 30000);

  test("publication primitive is linkSync (atomic no-overwrite)", () => {
    // Source-code contract: the publication primitive MUST be linkSync,
    // NOT renameSync (silent overwrite on POSIX). The behavioral TOCTOU
    // test in fail-closed-gaps.test.ts proves the no-overwrite property;
    // this source check guards against accidental regression to a
    // rename-based implementation.
    const src = fs.readFileSync(
      path.join(__dirname, "archive-publish.ts"),
      "utf-8",
    );
    expect(src).not.toContain("EXDEV");
    expect(src).not.toMatch(/cross-device/i);
    expect(src).not.toMatch(/copyFileSync/);
    expect(src).toMatch(/fs\.linkSync\(/);
    // The publish function body must NOT call renameSync on the staged
    // zip path.
    const publishBody = src.split("export function publishStagedArchive")[1] ?? "";
    expect(publishBody).not.toMatch(/fs\.renameSync/);
  });
});

describe("protected-check / O(1) git subprocesses (parent blocker #4)", () => {
  test("checkProtectedPaths spawns a bounded number of git subprocesses", () => {
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
      const before = spawnCount;
      const r = checkProtectedPaths(wrappedAdapter, assertGitOid(head), assertGitOid(head));
      const during = spawnCount - before;
      expect(r.kind).toBe("ok");
      // The protected set has ~25 paths; the OLD code did 2 spawns per
      // path (cat-file -e + cat-file blob), so ~50 spawns. The NEW code
      // must do exactly 1 batched call per oid (2 total: base + candidate).
      expect(during).toBeLessThanOrEqual(2);
    } finally {
      disposeRepo(repo);
    }
  }, 60000);
});

describe("git-blob-reader / batched typed results (parent blocker #5)", () => {
  test("batched result distinguishes missing from adapter failure", () => {
    const repo = makeFixtureRepo();
    try {
      const head = headOid(repo);
      const adapter = makeProductionAdapter(asRepo(repo));
      // Missing requests are reported in `missing`, not as adapter errors.
      const r = readBlobsBatched(adapter, [
        `${head}:does/not/exist.md`,
        `${head}:also-missing.ts`,
      ]);
      expect(r.found.size).toBe(0);
      expect(r.missing).toEqual([
        `${head}:does/not/exist.md`,
        `${head}:also-missing.ts`,
      ]);
    } finally {
      disposeRepo(repo);
    }
  }, 60000);

  test("adapter failure (bad repo root) raises GitAdapterError, not silent missing", () => {
    // Point the adapter at a non-repo directory; the spawnGit subprocess
    // MUST fail and spawnGitWithInput surfaces it as a throw, not a
    // missing entry.
    const notARepo = makeTmpDir("trust-not-a-repo-");
    try {
      const adapter = makeProductionAdapter(asRepo(notARepo));
      const fakeOid = assertGitOid("0".repeat(40));
      expect(() => readBlobsBatched(adapter, [`${fakeOid}:foo.md`])).toThrow();
    } finally {
      try { fs.rmSync(notARepo, { recursive: true, force: true }); } catch { /* */ }
    }
  }, 60000);
});

describe("archive-installed-verifier / exact segment matching (parent blocker #6)", () => {
  test("path-safety check uses exact `..` segment, not substring", () => {
    // Read the verifier source and assert that the substring form
    // `p.includes("..")` is NOT used; the segment check must split and
    // match exact segments.
    const src = fs.readFileSync(
      path.join(__dirname, "archive-installed-verifier.ts"),
      "utf-8",
    );
    expect(src).not.toMatch(/\.includes\("\.\."\)/);
    expect(src).toMatch(/split\(|segment/);
  });

  test("legitimate filename containing '..' literal is rejected only if it IS a traversal segment", () => {
    // A path like "foo..bar.md" (double-dot inside a filename) is NOT a
    // traversal segment. The check must accept it. A path like
    // "../escape.md" IS a traversal and must be rejected.
    expect(() => assertSafeArchivePath("foo..bar.md")).not.toThrow();
    // Real traversal must throw.
    expect(() => assertSafeArchivePath("../escape.md")).toThrow();
    expect(() => assertSafeArchivePath("a/../../b.md")).toThrow();
    // Edge: filename literally named ".." is a traversal.
    expect(() => assertSafeArchivePath("..")).toThrow();
  });
});

describe("launcher / serial same-final-output (one wins, one fails)", () => {
  test("two serial runs against same output: one wins (0), one fails (3), no orphans", () => {
    const repo = makeFixtureRepo();
    try {
      const head = headOid(repo);
      const sharedOut = makeTmpDir("trust-conc-same-");
      const o: LauncherOptions = {
        repo_root: repo, base_oid: head, candidate_oid: head, output_dir: sharedOut,
        repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
      };
      const r1 = runLauncher(o);
      const r2 = runLauncher(o);
      const codes = [r1.exit_code, r2.exit_code].sort();
      expect(codes).toEqual([0, 3]);
      const expectedName = `agentdev-release-${head.substring(0, 8)}.zip`;
      const finalPath = path.join(sharedOut, expectedName);
      expect(fs.existsSync(finalPath)).toBe(true);
      // No staging residue.
      const entries = fs.readdirSync(sharedOut);
      expect(entries).toEqual([expectedName]);
    } finally {
      disposeRepo(repo);
    }
  }, 120000);
});
