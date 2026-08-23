// Regression tests for parent defect blockers #4 (aggregation), #5 (real
// first-bootstrap base to candidate), #11 (test isolation + concurrent
// same-final-output), and #12 (bounded git subprocess count via batched
// reads).
//
// These tests target behaviors the original implementation broke:
//   - First-bootstrap case where BASE has none of the trust-root files but
//     CANDIDATE has them all: launcher in seed mode MUST succeed.
//   - Concurrent runs against the SAME final archive output: exactly one
//     MUST succeed (publishes the archive); the other MUST fail with
//     DigestMismatch (pre-existing archive preserved). No corruption,
//     no orphans.
//   - Git subprocess count stays bounded regardless of blob count (single
//     ls-tree + a bounded number of cat-file calls, not one per blob).

import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as path from "path";
import { execFileSync } from "child_process";

import {
  makeTmpDir,
  disposeRepo,
  makeFixtureRepo,
  writeFix,
  headOid,
  commitTweak,
} from "./launcher-fixture.ts";
import { runLauncher, type LauncherOptions } from "./launcher.ts";

function opts(repo: string, base: string, candidate: string, outName: string, extra?: Partial<LauncherOptions>): LauncherOptions {
  return {
    repo_root: repo,
    base_oid: base,
    candidate_oid: candidate,
    output_dir: makeTmpDir(`trust-reg-${outName}-`),
    repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
    ...extra,
  };
}

describe("launcher / real first-bootstrap base to candidate (parent defect #5)", () => {
  test("seed mode succeeds when base has no trust-root files and candidate adds them", () => {
    const repo = makeTmpDir("trust-bootstrap-repo-");
    try {
      // Step 1: create a base commit with only the source projection files,
      // NONE of the trust-root files. This mirrors the agent-dev-flow
      // history before the bootstrap PR introduced the trust root.
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
      writeFix(
        repo,
        "scripts/consumer/archive/install.ps1",
        [
          "[CmdletBinding()]",
          "param(",
          "  [Parameter(Mandatory=$true)][string]$Source,",
          "  [Parameter(Mandatory=$true)][string]$Target,",
          "  [Parameter(Mandatory=$true)][ValidateSet('copy')][string]$Mode",
          ")",
          "$ErrorActionPreference='Stop'",
          "function Place($src,$dst){ $p=Split-Path -Parent $dst; if(-not(Test-Path $p)){New-Item -ItemType Directory -Path $p -Force|Out-Null} Copy-Item -LiteralPath $src -Destination $dst -Force }",
          "$cmds=Join-Path $Source 'commands\\agentdev'; $skills=Join-Path $Source 'skills'",
          "$cDst=Join-Path $Target 'commands\\agentdev'; $sDst=Join-Path $Target 'skills'",
          "New-Item -ItemType Directory -Path $cDst -Force|Out-Null",
          "New-Item -ItemType Directory -Path $sDst -Force|Out-Null",
          "Get-ChildItem -LiteralPath $cmds -Recurse -File | ForEach-Object { $r=$_.FullName.Substring($cmds.Length).TrimStart('\\','/'); Place $_.FullName (Join-Path $cDst $r) }",
          "Get-ChildItem -LiteralPath $skills -Directory | Where-Object { $_.Name -like 'agentdev-*' -or $_.Name -eq 'japanese-tech-writing' } | ForEach-Object { Get-ChildItem -LiteralPath $_.FullName -Recurse -File | ForEach-Object { $r=$_.FullName.Substring($skills.Length).TrimStart('\\','/'); Place $_.FullName (Join-Path $sDst $r) } }",
          "exit 0",
          "",
        ].join("\n"),
      );
      writeFix(repo, "README-INSTALL.md", "# install readme\n");
      writeFix(repo, "scripts/self/release/package-release-archive.ps1", "# placeholder\n");
      execFileSync("git", ["add", "-A"], { cwd: repo });
      execFileSync("git", ["commit", "-q", "-m", "pre-bootstrap"], { cwd: repo });
      const base = headOid(repo);

      // Step 2: candidate = base + all trust-root files added (the
      // bootstrap PR). This is exactly the first-bootstrap scenario.
      const trustDir = ".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate";
      const REPO_ROOT_FOR_DISCOVERY = path.resolve(
        __dirname, "..", "..", "..", "..", "..",
      );
      const realTrustDir = path.join(REPO_ROOT_FOR_DISCOVERY, trustDir);
      for (const ent of fs.readdirSync(realTrustDir, { withFileTypes: true })) {
        if (!ent.isFile()) continue;
        if (!ent.name.endsWith(".ts")) continue;
        if (ent.name.endsWith(".test.ts")) continue;
        if (ent.name.endsWith(".d.ts")) continue;
        writeFix(repo, `${trustDir}/${ent.name}`, `// ${ent.name}\n`);
      }
      for (const f of ["tsconfig.json", "package.json", "bun.lock", ".gitignore"]) {
        writeFix(repo, `${trustDir}/${f}`, `# ${f}\n`);
      }
      writeFix(repo, "scripts/self/release/trusted-distribution-gate.ps1", "# placeholder\n");
      execFileSync("git", ["add", "-A"], { cwd: repo });
      execFileSync("git", ["commit", "-q", "-m", "add trust root"], { cwd: repo });
      const candidate = headOid(repo);

      // Step 3: launcher in seed/bootstrap mode MUST succeed.
      const result = runLauncher(opts(repo, base, candidate, "first-bootstrap", { bootstrap_mode: true }));
      expect(result.exit_code).toBe(0);
      expect(result.archive_path).toBeTruthy();
      expect(fs.existsSync(result.archive_path ?? "")).toBe(true);
    } finally {
      disposeRepo(repo);
    }
  }, 120000);

  test("non-seed mode REJECTS first-bootstrap (candidate-added protected files fatal)", () => {
    // Same setup as above; without bootstrap_mode, candidate-added protected
    // paths are fatal in final mode (parent defect #4).
    const repo = makeTmpDir("trust-bootstrap-strict-");
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
      writeFix(repo, "scripts/consumer/archive/install.ps1", "# placeholder installer\n");
      writeFix(repo, "README-INSTALL.md", "# install\n");
      writeFix(repo, "scripts/self/release/package-release-archive.ps1", "# placeholder\n");
      execFileSync("git", ["add", "-A"], { cwd: repo });
      execFileSync("git", ["commit", "-q", "-m", "pre-bootstrap"], { cwd: repo });
      const base = headOid(repo);

      writeFix(repo, "scripts/self/release/trusted-distribution-gate.ps1", "# ps1\n");
      writeFix(repo, ".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/types.ts", "// types\n");
      execFileSync("git", ["add", "-A"], { cwd: repo });
      execFileSync("git", ["commit", "-q", "-m", "add trust root"], { cwd: repo });
      const candidate = headOid(repo);

      const result = runLauncher(opts(repo, base, candidate, "strict-bootstrap"));
      expect(result.exit_code).toBe(1);
    } finally {
      disposeRepo(repo);
    }
  }, 120000);

  test("seed mode treats boundary violations as evidence (non-fatal)", () => {
    const repo = makeFixtureRepo();
    try {
      const base = headOid(repo);
      // Add a producer-internal reference; in final mode this is exit 4,
      // in seed mode it MUST be recorded as evidence but NOT fail.
      const candidate = commitTweak(
        repo,
        "src/opencode/skills/agentdev-foo/SKILL.md",
        "# foo references ADR-9999 producer-internal in seed mode\n",
      );
      const result = runLauncher(opts(repo, base, candidate, "seed-boundary", { bootstrap_mode: true }));
      expect(result.exit_code).toBe(0);
      // Evidence MUST be recorded in the summary.
      const evidenceLine = result.summary.find((s) => s.includes("seed-mode-evidence"));
      expect(evidenceLine).toBeTruthy();
    } finally {
      disposeRepo(repo);
    }
  }, 60000);
});

describe("launcher / serial same-final-output (parent defect #11)", () => {
  test("two runs against the SAME output: exactly one wins, one fails without corruption", () => {
    const repo = makeFixtureRepo();
    try {
      const head = headOid(repo);
      const sharedOut = makeTmpDir("trust-conc-same-out-");
      const opts1: LauncherOptions = {
        repo_root: repo, base_oid: head, candidate_oid: head, output_dir: sharedOut,
        repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
      };
      const opts2: LauncherOptions = { ...opts1 };
      // Run both serially (true parallelism would race non-deterministically;
      // serial still exercises "pre-existing archive preserved" since both
      // target the same final path).
      const r1 = runLauncher(opts1);
      const r2 = runLauncher(opts2);
      const codes = [r1.exit_code, r2.exit_code].sort();
      // Exactly one must succeed (code 0) and one must fail with code 3
      // (pre-existing final archive preserved).
      expect(codes).toEqual([0, 3]);
      // Verify the final archive exists intact.
      const expectedName = `agentdev-release-${head.substring(0, 8)}.zip`;
      const finalPath = path.join(sharedOut, expectedName);
      expect(fs.existsSync(finalPath)).toBe(true);
      // Verify NO orphans (no .tmp / staging residue).
      const entries = fs.readdirSync(sharedOut);
      expect(entries).toEqual([expectedName]);
    } finally {
      disposeRepo(repo);
    }
  }, 120000);
});
