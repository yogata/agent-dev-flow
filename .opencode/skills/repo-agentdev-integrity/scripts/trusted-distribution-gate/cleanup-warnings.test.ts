// Cleanup warning preservation + both-missing default protected path tests.
// Uses per-call dependency injection (no global mutable state).

import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as path from "path";
import { execFileSync } from "child_process";

import { runLauncherWithDeps, safeStageCleanup, applyCleanupWarnings, type LauncherDependencies } from "./launcher.ts";
import { makeTmpDir, makeFixtureRepo, disposeRepo, headOid, writeFix } from "./launcher-fixture.ts";
import { prepareStagedArchive, type StagingRemover, type StagedArchive } from "./archive-publish.ts";
import { PathSafetyError } from "./types.ts";

const THROWING_REMOVER: StagingRemover = () => { throw new Error("INJECTED CLEANUP FAIL"); };

describe("cleanup warning preservation / per-call injected remover", () => {
  test("prepare primary PathSafetyError + per-call remover throw: same class, warning appended", () => {
    const out = makeTmpDir("trust-cw-inj-prepare-");
    try {
      let caught: unknown;
      try {
        prepareStagedArchive(
          [{ archivePath: "../escape.md", bytes: new TextEncoder().encode("x") }],
          out, THROWING_REMOVER,
        );
      } catch (e) { caught = e; }
      expect(caught).toBeInstanceOf(PathSafetyError);
      const msg = caught instanceof Error ? caught.message : String(caught);
      expect(msg).toMatch(/path traversal|traversal segment/);
      expect(msg).toContain("INJECTED CLEANUP FAIL");
    } finally { try { fs.rmSync(out, { recursive: true, force: true }); } catch (e) { void e; } }
  });

  test("safeStageCleanup returns warning string when cleanup throws", () => {
    const throwingStage: StagedArchive = {
      stagedZip: "/nonexistent/staged.zip",
      stageDir: "/nonexistent/stage",
      cleanup: (): never => { throw new Error("INJECTED CLEANUP FAIL"); },
    };
    const warnings = safeStageCleanup(throwingStage);
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toContain("INJECTED CLEANUP FAIL");
  });

  test("applyCleanupWarnings appends when non-empty, returns primary when empty", () => {
    expect(applyCleanupWarnings("primary", [])).toBe("primary");
    const r = applyCleanupWarnings("primary", ["w1", "w2"]);
    expect(r).toContain("primary");
    expect(r).toContain("w1");
    expect(r).toContain("w2");
  });

  test("physical mismatch + per-call remover throw: exit_code===3, summary has INJECTED, no archive", () => {
    const repo = makeTmpDir("trust-cw-mm-repo-");
    try {
      execFileSync("git", ["init", "-q", "-b", "main"], { cwd: repo });
      execFileSync("git", ["config", "user.email", "t@t"], { cwd: repo });
      execFileSync("git", ["config", "user.name", "t"], { cwd: repo });
      if (process.platform === "win32") execFileSync("git", ["config", "core.longpaths", "true"], { cwd: repo });
      // Include ALL auto-enumerated trust-root modules from real working tree.
      const REPO_ROOT = path.resolve(__dirname, "..", "..", "..", "..", "..");
      const trustRel = ".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate";
      const trustAbs = path.join(REPO_ROOT, trustRel);
      writeFix(repo, "src/opencode/commands/agentdev/case-run.md", "# case-run\n");
      writeFix(repo, "src/opencode/skills/agentdev-foo/SKILL.md", "# foo\n");
      writeFix(repo, "src/opencode/skills/japanese-tech-writing/SKILL.md", "# jtw\n");
      writeFix(repo, "scripts/install.ps1", "# install\n");
      writeFix(repo, "scripts/consumer/common.ps1", "# check\n");
      writeFix(repo, "README-INSTALL.md", "# readme\n");
      writeFix(repo, "scripts/self/release/package-release-archive.ps1", "# placeholder\n");
      writeFix(repo, "scripts/self/release/trusted-distribution-gate.ps1", "# placeholder\n");
      // BROKEN installer at base: exit 5.
      writeFix(repo, "scripts/consumer/archive/install.ps1", "[CmdletBinding()] param([string]$S,[string]$T,[string]$M)\nexit 5\n");
      for (const ent of fs.readdirSync(trustAbs, { withFileTypes: true })) {
        if (!ent.isFile() || !ent.name.endsWith(".ts") || ent.name.endsWith(".test.ts") || ent.name.endsWith(".test-worker.ts") || ent.name.endsWith(".d.ts")) continue;
        writeFix(repo, `${trustRel}/${ent.name}`, `// ${ent.name}\n`);
      }
      for (const f of ["tsconfig.json", "package.json", "bun.lock", ".gitignore"]) {
        writeFix(repo, `${trustRel}/${f}`, `# ${f}\n`);
      }
      execFileSync("git", ["add", "-A"], { cwd: repo });
      execFileSync("git", ["commit", "-q", "-m", "complete base"], { cwd: repo });
      const base = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo }).toString().trim();
      // Candidate = base (same OID — no additional commit needed).
      const out = makeTmpDir("trust-cw-mm-out-");
      const deps: LauncherDependencies = { stagingRemover: THROWING_REMOVER };
      const result = runLauncherWithDeps({
        repo_root: repo, base_oid: base, candidate_oid: base, output_dir: out,
        repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
        bootstrap_mode: true,
      }, deps);
      expect(result.exit_code).toBe(3);
      expect(result.archive_path).toBeNull();
      expect(result.summary.join(" ")).toContain("INJECTED CLEANUP FAIL");
      try { fs.rmSync(out, { recursive: true, force: true }); } catch (e) { void e; }
    } finally { try { fs.rmSync(repo, { recursive: true, force: true }); } catch (e) { void e; } }
  }, 120000);

  test("EEXIST + per-call remover throw: exit_code===3, summary has INJECTED, pre-existing unchanged", () => {
    // Use makeFixtureRepo for a complete fixture with working installer.
    const repo = makeFixtureRepo();
    try {
      const head = headOid(repo);
      const out = makeTmpDir("trust-cw-eexist-out-");
      const finalPath = path.join(out, `agentdev-release-${head.substring(0, 8)}.zip`);
      const sentinel = Buffer.from("PRE-EXISTING-SENTINEL");
      fs.writeFileSync(finalPath, sentinel);
      const deps: LauncherDependencies = { stagingRemover: THROWING_REMOVER };
      const result = runLauncherWithDeps({
        repo_root: repo, base_oid: head, candidate_oid: head, output_dir: out,
        repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
        bootstrap_mode: true,
      }, deps);
      expect(result.exit_code).toBe(3);
      expect(result.summary.join(" ")).toContain("INJECTED CLEANUP FAIL");
      expect(fs.readFileSync(finalPath).equals(sentinel)).toBe(true);
      try { fs.rmSync(out, { recursive: true, force: true }); } catch (e) { void e; }
    } finally { disposeRepo(repo); }
  }, 120000);
});

describe("launcher / both-missing protected bootstrap scripts in seed mode", () => {
  function buildFixtureWithoutBootstrap(missing: string[]): { repo: string; base: string; candidate: string } {
    const repo = makeTmpDir("trust-bm-");
    execFileSync("git", ["init", "-q", "-b", "main"], { cwd: repo });
    execFileSync("git", ["config", "user.email", "t@t"], { cwd: repo });
    execFileSync("git", ["config", "user.name", "t"], { cwd: repo });
    if (process.platform === "win32") execFileSync("git", ["config", "core.longpaths", "true"], { cwd: repo });
    writeFix(repo, "src/opencode/commands/agentdev/case-run.md", "# case-run\n");
    writeFix(repo, "src/opencode/skills/agentdev-foo/SKILL.md", "# foo\n");
    writeFix(repo, "src/opencode/skills/japanese-tech-writing/SKILL.md", "# jtw\n");
    writeFix(repo, "README-INSTALL.md", "# readme\n");
    writeFix(repo, "scripts/self/release/package-release-archive.ps1", "# placeholder\n");
    writeFix(repo, "scripts/consumer/archive/install.ps1", [
      "[CmdletBinding()] param([string]$S,[string]$T,[string]$M)", "$ErrorActionPreference='Stop'",
      "$cmds=Join-Path $S 'commands\\agentdev'; $skills=Join-Path $S 'skills'",
      "$cDst=Join-Path $T 'commands\\agentdev'; $sDst=Join-Path $T 'skills'",
      "New-Item -ItemType Directory -Path $cDst -Force|Out-Null; New-Item -ItemType Directory -Path $sDst -Force|Out-Null",
      "Get-ChildItem -LiteralPath $cmds -Recurse -File | ForEach-Object { $r=$_.FullName.Substring($cmds.Length).TrimStart('\\','/'); $d=Join-Path $cDst $r; $p=Split-Path -Parent $d; if(-not(Test-Path $p)){New-Item -ItemType Directory -Path $p -Force|Out-Null}; Copy-Item -LiteralPath $_.FullName -Destination $d -Force }",
      "Get-ChildItem -LiteralPath $skills -Directory | Where-Object { $_.Name -like 'agentdev-*' -or $_.Name -eq 'japanese-tech-writing' } | ForEach-Object { Get-ChildItem -LiteralPath $_.FullName -Recurse -File | ForEach-Object { $r=$_.FullName.Substring($skills.Length).TrimStart('\\','/'); $d=Join-Path $sDst $r; $p=Split-Path -Parent $d; if(-not(Test-Path $p)){New-Item -ItemType Directory -Path $p -Force|Out-Null}; Copy-Item -LiteralPath $_.FullName -Destination $d -Force } }",
      "exit 0", "",
    ].join("\n"));
    if (!missing.includes("install-entry")) writeFix(repo, "scripts/install.ps1", "# install\n");
    if (!missing.includes("common-module")) writeFix(repo, "scripts/consumer/common.ps1", "# check\n");
    execFileSync("git", ["add", "-A"], { cwd: repo });
    execFileSync("git", ["commit", "-q", "-m", "base"], { cwd: repo });
    const base = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo }).toString().trim();
    writeFix(repo, "scripts/self/release/trusted-distribution-gate.ps1", "# ps1\n");
    const td = ".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate";
    writeFix(repo, `${td}/types.ts`, "// types\n");
    writeFix(repo, `${td}/protected-paths.ts`, "// pp\n");
    execFileSync("git", ["add", "-A"], { cwd: repo });
    execFileSync("git", ["commit", "-q", "-m", "trust"], { cwd: repo });
    const candidate = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo }).toString().trim();
    return { repo, base, candidate };
  }

  test("both-missing scripts/install.ps1: exit 1, no archive", () => {
    const { repo, base, candidate } = buildFixtureWithoutBootstrap(["install-entry"]);
    try {
      const out = makeTmpDir("trust-bm-one-");
      const r = runLauncherWithDeps({
        repo_root: repo, base_oid: base, candidate_oid: candidate, output_dir: out,
        repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
        bootstrap_mode: true,
      }, {});
      expect(r.exit_code).toBe(1);
      expect(r.archive_path).toBeNull();
      expect(r.summary.join(" ")).toContain("missing at both base and candidate");
      try { fs.rmSync(out, { recursive: true, force: true }); } catch (e) { void e; }
    } finally { try { fs.rmSync(repo, { recursive: true, force: true }); } catch (e) { void e; } }
  }, 120000);

  test("both-missing scripts/consumer/common.ps1: exit 1, no archive", () => {
    const { repo, base, candidate } = buildFixtureWithoutBootstrap(["common-module"]);
    try {
      const out = makeTmpDir("trust-bm-check-");
      const r = runLauncherWithDeps({
        repo_root: repo, base_oid: base, candidate_oid: candidate, output_dir: out,
        repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
        bootstrap_mode: true,
      }, {});
      expect(r.exit_code).toBe(1);
      expect(r.archive_path).toBeNull();
      try { fs.rmSync(out, { recursive: true, force: true }); } catch (e) { void e; }
    } finally { try { fs.rmSync(repo, { recursive: true, force: true }); } catch (e) { void e; } }
  }, 120000);

  test("both-missing both bootstrap scripts: exit 1, no archive", () => {
    const { repo, base, candidate } = buildFixtureWithoutBootstrap(["install-entry", "common-module"]);
    try {
      const out = makeTmpDir("trust-bm-both-");
      const r = runLauncherWithDeps({
        repo_root: repo, base_oid: base, candidate_oid: candidate, output_dir: out,
        repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
        bootstrap_mode: true,
      }, {});
      expect(r.exit_code).toBe(1);
      expect(r.archive_path).toBeNull();
      try { fs.rmSync(out, { recursive: true, force: true }); } catch (e) { void e; }
    } finally { try { fs.rmSync(repo, { recursive: true, force: true }); } catch (e) { void e; } }
  }, 120000);
});
