// True two-process publication race test + bootstrap required tests +
// malformed batch integration test. These tests were added in Round 5
// to close remaining verified gaps.

import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { spawn, type ChildProcess } from "child_process";

import {
  buildSourceManifest,
  type ManifestEntryInput,
} from "./manifest.ts";
import { runLauncher, type LauncherOptions } from "./launcher.ts";
import {
  makeTmpDir,
  disposeRepo,
  makeFixtureRepo,
  headOid,
  deleteAndCommit,
} from "./launcher-fixture.ts";
import {
  verifyArchive,
} from "./archive-verify.ts";
import {
  computeSha256,
} from "./archive-builder.ts";
import {
  listAllProtectedPaths,
  DEFAULT_PROTECTED_PATH_SET,
} from "./protected-paths.ts";

function entry(p: string, sha: string, size: number): ManifestEntryInput {
  return { path: p, sha256: sha, size };
}
const SHA = "a".repeat(64);

// ---------------------------------------------------------------------------
// Gap 1: test-worker not enumerated as protected runtime
// ---------------------------------------------------------------------------

describe("protected-paths / test-worker exclusion", () => {
  test("concurrent-publish.test-worker.ts is NOT in the protected set", () => {
    const all = listAllProtectedPaths(DEFAULT_PROTECTED_PATH_SET);
    expect(all).not.toContain(
      ".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/concurrent-publish.test-worker.ts",
    );
    expect(all).not.toContain(
      ".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/concurrent-publish-worker.ts",
    );
  });
});

// ---------------------------------------------------------------------------
// Gap 2: TRUE two-process publication race with digest verification
// ---------------------------------------------------------------------------

describe("true two-process publication race", () => {
  test("two concurrent workers: exactly one wins, one EEXIST loser, verified archive, no residue", async () => {
    const sharedRoot = fs.mkdtempSync(path.join(os.tmpdir(), "trust-race-"));
    const finalName = "final.zip";
    const finalPath = path.join(sharedRoot, finalName);
    const ready1 = path.join(sharedRoot, "ready1");
    const ready2 = path.join(sharedRoot, "ready2");
    const goFile = path.join(sharedRoot, "go");
    const result1 = path.join(sharedRoot, "result1");
    const result2 = path.join(sharedRoot, "result2");
    const worker = path.join(__dirname, "concurrent-publish.test-worker.ts");

    const procs: ChildProcess[] = [];
    const cleanupAll = (): void => {
      for (const p of procs) {
        try { p.kill("SIGKILL"); } catch (e) { void e; }
      }
      try { fs.rmSync(sharedRoot, { recursive: true, force: true }); } catch (e) { void e; }
    };

    try {
      const p1 = spawn("bun", [worker, sharedRoot, finalName, ready1, goFile, result1]);
      const p2 = spawn("bun", [worker, sharedRoot, finalName, ready2, goFile, result2]);
      procs.push(p1, p2);

      const exitP1 = new Promise<number>((resolve, reject) => {
        p1.on("exit", (c) => resolve(c ?? -1));
        p1.on("error", (e) => reject(e));
      });
      const exitP2 = new Promise<number>((resolve, reject) => {
        p2.on("exit", (c) => resolve(c ?? -1));
        p2.on("error", (e) => reject(e));
      });

      const readyDeadline = Date.now() + 60000;
      while ((!fs.existsSync(ready1) || !fs.existsSync(ready2)) && Date.now() < readyDeadline) {
        await new Promise<void>((r) => setTimeout(r, 100));
      }
      expect(fs.existsSync(ready1)).toBe(true);
      expect(fs.existsSync(ready2)).toBe(true);

      fs.writeFileSync(goFile, "GO");

      const [exit1, exit2] = await Promise.race([
        Promise.all([exitP1, exitP2]),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 30000)),
      ]);

      const codes = [exit1, exit2].sort();
      expect(codes).toEqual([0, 3]);

      expect(fs.existsSync(finalPath)).toBe(true);

      const r1 = fs.readFileSync(result1, "utf-8");
      const r2 = fs.readFileSync(result2, "utf-8");
      const results = [r1, r2].sort();
      expect(results[0]).toMatch(/FAIL:.*pre-existing/i);
      expect(results[1]).toBe("OK");

      // Verify the published archive via verifyArchive against the
      // expected BlobSource content.
      const blobBytes = new TextEncoder().encode("# staged blob\n");
      const expectedEntries = [
        { path: "a.md", sha256: computeSha256(blobBytes), size: blobBytes.length },
      ];
      const verifyResult = verifyArchive(finalPath, expectedEntries);
      expect(verifyResult.ok).toBe(true);

      const entries = fs.readdirSync(sharedRoot).filter((e) => e.startsWith(".trust-stage-"));
      expect(entries).toEqual([]);
    } finally {
      cleanupAll();
    }
  }, 120000);
});

// ---------------------------------------------------------------------------
// Gap 3: Required bootstrap deletion tests
// ---------------------------------------------------------------------------

describe("buildSourceManifest / required bootstrap scripts", () => {
  test("throws when scripts/install.ps1 is missing", () => {
    const inputs = [
      entry("scripts/consumer/common.ps1", SHA, 10),
      entry("src/opencode/skills/agentdev-foo/SKILL.md", SHA, 10),
    ];
    expect(() => buildSourceManifest(inputs)).toThrow(/scripts\/install\.ps1/);
  });

  test("throws when scripts/consumer/common.ps1 is missing", () => {
    const inputs = [
      entry("scripts/install.ps1", SHA, 10),
      entry("src/opencode/skills/agentdev-foo/SKILL.md", SHA, 10),
    ];
    expect(() => buildSourceManifest(inputs)).toThrow(/scripts\/consumer\/common\.ps1/);
  });

  test("throws when both bootstrap scripts are missing", () => {
    const inputs = [
      entry("src/opencode/skills/agentdev-foo/SKILL.md", SHA, 10),
    ];
    expect(() => buildSourceManifest(inputs)).toThrow();
  });

  test("succeeds when both bootstrap scripts are present", () => {
    const inputs = [
      entry("scripts/install.ps1", SHA, 10),
      entry("scripts/consumer/common.ps1", SHA, 10),
      entry("src/opencode/skills/agentdev-foo/SKILL.md", SHA, 10),
    ];
    const m = buildSourceManifest(inputs);
    expect(m.entries.length).toBe(3);
  });
});

describe("launcher / bootstrap script deletion in seed mode", () => {
  test("deleting scripts/install.ps1 from candidate produces exit 1, no archive", () => {
    const repo = makeFixtureRepo();
    try {
      const base = headOid(repo);
      const candidate = deleteAndCommit(repo, "scripts/install.ps1");
      const out = makeTmpDir("trust-boot-del1-");
      const opts: LauncherOptions = {
        repo_root: repo, base_oid: base, candidate_oid: candidate, output_dir: out,
        repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
        bootstrap_mode: true,
      };
      const result = runLauncher(opts);
      expect(result.exit_code).toBe(1);
      expect(result.archive_path).toBeNull();
    } finally { disposeRepo(repo); }
  }, 60000);

  test("deleting both bootstrap scripts from candidate produces exit 1, no archive", () => {
    const repo = makeFixtureRepo();
    try {
      const base = headOid(repo);
      let candidate = deleteAndCommit(repo, "scripts/install.ps1");
      candidate = deleteAndCommit(repo, "scripts/consumer/common.ps1");
      const out = makeTmpDir("trust-boot-del2-");
      const opts: LauncherOptions = {
        repo_root: repo, base_oid: base, candidate_oid: candidate, output_dir: out,
        repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
        bootstrap_mode: true,
      };
      const result = runLauncher(opts);
      expect(result.exit_code).toBe(1);
      expect(result.archive_path).toBeNull();
    } finally { disposeRepo(repo); }
  }, 60000);
});
