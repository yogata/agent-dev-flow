// Tests for the launcher orchestrator.
//
// The launcher is the trust-root entry point. It wires together the git
// blob reader, manifest builder, boundary pipeline, and archive builder.
// It must fail closed on every anomaly class enumerated in the ExitCode
// table, must reject protected-path changes, and must NOT execute candidate
// code under any circumstance.

import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import {
  runLauncher,
  type LauncherOptions,
} from "./launcher.ts";

const TMP_ROOT = path.join(
  process.cwd(),
  ".worktrees-tmp-test-launcher",
);

beforeAll(() => {
  fs.rmSync(TMP_ROOT, { recursive: true, force: true });
  fs.mkdirSync(TMP_ROOT, { recursive: true });
});

afterAll(() => {
  fs.rmSync(TMP_ROOT, { recursive: true, force: true });
});

function makeFixtureRepo(): string {
  const repo = path.join(TMP_ROOT, `repo-${Math.random().toString(36).slice(2, 8)}`);
  fs.mkdirSync(repo, { recursive: true });
  execSync("git init -q -b main", { cwd: repo });
  execSync('git config user.email "t@t"', { cwd: repo });
  execSync('git config user.name "t"', { cwd: repo });
  // The fixture mirrors the real repo's deep trust-root path; on Windows the
  // path length exceeds MAX_PATH unless core.longpaths is enabled.
  if (process.platform === "win32") {
    execSync("git config core.longpaths true", { cwd: repo });
  }

  // Source runtime: one command, one agentdev skill, japanese-tech-writing.
  writeFix(repo, "src/opencode/commands/agentdev/case-run.md", "# case-run\n");
  writeFix(repo, "src/opencode/skills/agentdev-foo/SKILL.md", "# foo skill\n");
  writeFix(repo, "src/opencode/skills/japanese-tech-writing/SKILL.md", "# jtw\n");

  // Bootstrap scripts.
  writeFix(repo, "scripts/install-consumer-opencode.ps1", "# install\n");
  writeFix(repo, "scripts/check-consumer-opencode.ps1", "# check\n");

  // Archive extras.
  writeFix(repo, "scripts/install-from-archive.ps1", "# install-from-archive\n");
  writeFix(repo, "README-INSTALL.md", "# install readme\n");

  // Trust-root files (so the protected-paths check finds them).
  const trustDir = ".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate";
  for (const f of [
    "types.ts",
    "boundary-pipeline.ts",
    "text-binary.ts",
    "protected-paths.ts",
    "git-blob-reader.ts",
    "manifest.ts",
    "archive-builder.ts",
    "launcher.ts",
    "index.ts",
    "tsconfig.json",
    "package.json",
  ]) {
    writeFix(repo, `${trustDir}/${f}`, "// placeholder\n");
  }
  writeFix(repo, "scripts/trusted-distribution-gate.ps1", "# placeholder\n");
  writeFix(repo, "scripts/package-release-archive.ps1", "# placeholder\n");

  execSync("git add -A", { cwd: repo });
  execSync('git commit -q -m "fixture"', { cwd: repo });
  return repo;
}

function writeFix(repo: string, rel: string, content: string): void {
  const full = path.join(repo, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

function headOid(repo: string): string {
  return execSync("git rev-parse HEAD", { cwd: repo }).toString().trim();
}

function commitTweak(repo: string, rel: string, content: string): string {
  writeFix(repo, rel, content);
  execSync("git add -A", { cwd: repo });
  execSync(`git commit -q -m "tweak ${rel}"`, { cwd: repo });
  return headOid(repo);
}

describe("launcher / runLauncher happy path", () => {
  test("returns Ok exit code on a clean candidate", () => {
    const repo = makeFixtureRepo();
    const base = headOid(repo);
    const candidate = base; // identical
    const outputDir = path.join(TMP_ROOT, "out-ok");
    fs.mkdirSync(outputDir, { recursive: true });

    const opts: LauncherOptions = {
      repo_root: repo,
      base_oid: base,
      candidate_oid: candidate,
      output_dir: outputDir,
      repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
    };

    const result = runLauncher(opts);
    expect(result.exit_code).toBe(0);
    expect(result.archive_path).toBeTruthy();
    expect(fs.existsSync(result.archive_path ?? "")).toBe(true);
    expect(result.manifests["source-runtime"].entries.length).toBeGreaterThan(0);
    expect(result.manifests["archive"].entries.length).toBeGreaterThan(0);
  }, 60000); // protected-path check spawns many git subprocesses on Windows
});

describe("launcher / runLauncher input contract", () => {
  test("rejects PR-head/OID mismatch input (non-hex oid)", () => {
    const repo = makeFixtureRepo();
    const outputDir = path.join(TMP_ROOT, "out-contract");
    fs.mkdirSync(outputDir, { recursive: true });
    const opts: LauncherOptions = {
      repo_root: repo,
      base_oid: headOid(repo),
      candidate_oid: "not-a-real-oid",
      output_dir: outputDir,
      repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
    };
    const result = runLauncher(opts);
    expect(result.exit_code).toBe(8); // InputContract
  });

  test("rejects empty repository identity", () => {
    const repo = makeFixtureRepo();
    const outputDir = path.join(TMP_ROOT, "out-empty-id");
    fs.mkdirSync(outputDir, { recursive: true });
    const opts: LauncherOptions = {
      repo_root: repo,
      base_oid: headOid(repo),
      candidate_oid: headOid(repo),
      output_dir: outputDir,
      repository_identity: { owner_slash_name: "", default_branch: "main" },
    };
    const result = runLauncher(opts);
    expect(result.exit_code).toBe(8);
  });
});

describe("launcher / runLauncher protected-path rejection", () => {
  test("rejects modification of trust-root launcher file", () => {
    const repo = makeFixtureRepo();
    const base = headOid(repo);
    const candidate = commitTweak(
      repo,
      ".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/launcher.ts",
      "// TAMPERED\n",
    );
    const outputDir = path.join(TMP_ROOT, "out-prot");
    fs.mkdirSync(outputDir, { recursive: true });
    const opts: LauncherOptions = {
      repo_root: repo,
      base_oid: base,
      candidate_oid: candidate,
      output_dir: outputDir,
      repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
    };
    const result = runLauncher(opts);
    expect(result.exit_code).toBe(1); // ProtectedPathViolation
  });

  test("rejects modification of trusted entry script", () => {
    const repo = makeFixtureRepo();
    const base = headOid(repo);
    const candidate = commitTweak(repo, "scripts/trusted-distribution-gate.ps1", "# TAMPERED\n");
    const outputDir = path.join(TMP_ROOT, "out-prot-entry");
    fs.mkdirSync(outputDir, { recursive: true });
    const opts: LauncherOptions = {
      repo_root: repo,
      base_oid: base,
      candidate_oid: candidate,
      output_dir: outputDir,
      repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
    };
    const result = runLauncher(opts);
    expect(result.exit_code).toBe(1);
  });

  test("rejects deletion of trusted installation mapping script", () => {
    const repo = makeFixtureRepo();
    const base = headOid(repo);
    fs.unlinkSync(path.join(repo, "scripts/install-consumer-opencode.ps1"));
    execSync("git add -A", { cwd: repo });
    execSync('git commit -q -m "delete install"', { cwd: repo });
    const candidate = headOid(repo);
    const outputDir = path.join(TMP_ROOT, "out-prot-del");
    fs.mkdirSync(outputDir, { recursive: true });
    const opts: LauncherOptions = {
      repo_root: repo,
      base_oid: base,
      candidate_oid: candidate,
      output_dir: outputDir,
      repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
    };
    const result = runLauncher(opts);
    expect(result.exit_code).toBe(1);
  });
});

describe("launcher / runLauncher boundary violation", () => {
  test("rejects producer-internal concrete ID in candidate source", () => {
    const repo = makeFixtureRepo();
    const base = headOid(repo);
    const candidate = commitTweak(
      repo,
      "src/opencode/skills/agentdev-foo/SKILL.md",
      "# foo skill references ADR-9999 which is a violation\n",
    );
    const outputDir = path.join(TMP_ROOT, "out-boundary");
    fs.mkdirSync(outputDir, { recursive: true });
    const opts: LauncherOptions = {
      repo_root: repo,
      base_oid: base,
      candidate_oid: candidate,
      output_dir: outputDir,
      repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
    };
    const result = runLauncher(opts);
    expect(result.exit_code).toBe(4); // BoundaryViolation
  });

  test("rejects unclassified ID family (fail-closed)", () => {
    const repo = makeFixtureRepo();
    const base = headOid(repo);
    const candidate = commitTweak(
      repo,
      "src/opencode/skills/agentdev-foo/SKILL.md",
      "# foo skill references JIRA-123 unknown family\n",
    );
    const outputDir = path.join(TMP_ROOT, "out-unclassified");
    fs.mkdirSync(outputDir, { recursive: true });
    const opts: LauncherOptions = {
      repo_root: repo,
      base_oid: base,
      candidate_oid: candidate,
      output_dir: outputDir,
      repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
    };
    const result = runLauncher(opts);
    expect(result.exit_code).toBe(7); // UnclassifiedEntry
  });
});

describe("launcher / runLauncher manifest mismatch", () => {
  test("rejects missing required bootstrap script in candidate", () => {
    const repo = makeFixtureRepo();
    const base = headOid(repo);
    fs.unlinkSync(path.join(repo, "scripts/check-consumer-opencode.ps1"));
    execSync("git add -A", { cwd: repo });
    execSync('git commit -q -m "drop check script"', { cwd: repo });
    const candidate = headOid(repo);
    const outputDir = path.join(TMP_ROOT, "out-manifest");
    fs.mkdirSync(outputDir, { recursive: true });
    const opts: LauncherOptions = {
      repo_root: repo,
      base_oid: base,
      candidate_oid: candidate,
      output_dir: outputDir,
      repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
    };
    const result = runLauncher(opts);
    // The deletion of a bootstrap script is ALSO a protected-path violation
    // (it is in TRUST_ROOT_DIRECT_PATHS). So the protected-path check fires
    // first and returns exit code 1.
    expect([1, 2]).toContain(result.exit_code);
  });
});

describe("launcher / runLauncher archive-installed verification (no execution)", () => {
  test("verifies archive-installed mapping by deterministic digest comparison", () => {
    const repo = makeFixtureRepo();
    const base = headOid(repo);
    const outputDir = path.join(TMP_ROOT, "out-archive-installed");
    fs.mkdirSync(outputDir, { recursive: true });
    const opts: LauncherOptions = {
      repo_root: repo,
      base_oid: base,
      candidate_oid: base,
      output_dir: outputDir,
      repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
    };
    const result = runLauncher(opts);
    expect(result.exit_code).toBe(0);
    // archive-installed manifest exists and has same digest as link.
    const link = result.manifests["link"];
    const installed = result.manifests["archive-installed"];
    expect(link.entries.length).toBeGreaterThan(0);
    expect(installed.entries.length).toBe(link.entries.length);
    for (let i = 0; i < link.entries.length; i++) {
      expect(installed.entries[i]?.sha256).toBe(link.entries[i]?.sha256);
    }
  }, 60000);
});

describe("launcher / runLauncher pre-existing final archive preservation", () => {
  test("does NOT overwrite pre-existing final archive; fails with DigestMismatch/Unexpected", () => {
    const repo = makeFixtureRepo();
    const base = headOid(repo);
    const outputDir = path.join(TMP_ROOT, "out-preexisting");
    fs.mkdirSync(outputDir, { recursive: true });

    // Pre-create the final archive path.
    const expectedName = `agentdev-trust-${base.substring(0, 8)}.zip`;
    const finalPath = path.join(outputDir, expectedName);
    fs.writeFileSync(finalPath, "PRE-EXISTING");

    const opts: LauncherOptions = {
      repo_root: repo,
      base_oid: base,
      candidate_oid: base,
      output_dir: outputDir,
      repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
    };
    const result = runLauncher(opts);
    expect(result.exit_code).not.toBe(0);
    expect(fs.readFileSync(finalPath, "utf-8")).toBe("PRE-EXISTING");
  });
});
