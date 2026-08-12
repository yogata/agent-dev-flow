// End-to-end tests for the PowerShell entry script.
//
// These tests invoke scripts/trusted-distribution-gate.ps1 via `pwsh` on
// Windows (the only platform where the entry script is the documented
// primary) and assert both the JSON stdout structure AND the exact
// $LASTEXITCODE for clean and representative failure exit codes
// (parent defect #13).
//
// On non-Windows platforms the PowerShell entry is not the primary; these
// tests skip rather than fail.

import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import * as fs from "fs";
import * as path from "path";
import { execFileSync } from "child_process";

const TMP_ROOT = path.join(process.cwd(), ".worktrees-tmp-test-cli-e2e");
const REPO_ROOT = path.resolve(
  path.join(__dirname, "..", "..", "..", "..", ".."),
);

beforeAll(() => {
  fs.rmSync(TMP_ROOT, { recursive: true, force: true });
  fs.mkdirSync(TMP_ROOT, { recursive: true });
});

afterAll(() => {
  fs.rmSync(TMP_ROOT, { recursive: true, force: true });
});

function ps1Available(): boolean {
  if (process.platform !== "win32") return false;
  try {
    execFileSync("pwsh", ["-NoProfile", "-Command", "exit 0"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function makeFixtureRepo(): { repo: string; head: string } {
  const repo = path.join(TMP_ROOT, `repo-${Math.random().toString(36).slice(2, 8)}`);
  fs.mkdirSync(repo, { recursive: true });
  execFileSync("git", ["init", "-q", "-b", "main"], { cwd: repo });
  execFileSync("git", ["config", "user.email", "t@t"], { cwd: repo });
  execFileSync("git", ["config", "user.name", "t"], { cwd: repo });
  if (process.platform === "win32") {
    execFileSync("git", ["config", "core.longpaths", "true"], { cwd: repo });
  }

  function writeFix(rel: string, content: string): void {
    const full = path.join(repo, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }

  writeFix("src/opencode/commands/agentdev/case-run.md", "# case-run\n");
  writeFix("src/opencode/skills/agentdev-foo/SKILL.md", "# foo\n");
  writeFix("src/opencode/skills/japanese-tech-writing/SKILL.md", "# jtw\n");
  writeFix("scripts/install-consumer-opencode.ps1", "# install\n");
  writeFix("scripts/check-consumer-opencode.ps1", "# check\n");
  writeFix("scripts/install-from-archive.ps1", "# install-from-archive\n");
  writeFix("README-INSTALL.md", "# readme\n");

  // Trust-root files at fixture (so protected-paths check finds them).
  const trustDir = ".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate";
  for (const f of [
    "types.ts", "boundary-pipeline.ts", "text-binary.ts", "protected-paths.ts",
    "git-blob-reader.ts", "manifest.ts", "archive-builder.ts", "launcher.ts",
    "index.ts", "protected-check.ts", "blob-loader.ts", "boundary-runner.ts",
    "cli.ts", "bootstrap-report.ts", "tsconfig.json", "package.json", "bun.lock", ".gitignore",
  ]) {
    writeFix(`${trustDir}/${f}`, "// placeholder\n");
  }
  writeFix("scripts/trusted-distribution-gate.ps1", "# placeholder\n");
  writeFix("scripts/package-release-archive.ps1", "# placeholder\n");

  execFileSync("git", ["add", "-A"], { cwd: repo });
  execFileSync("git", ["commit", "-q", "-m", "fixture"], { cwd: repo });
  const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo }).toString().trim();
  return { repo, head };
}

function runPs1(args: string[]): { stdout: string; stderr: string; code: number } {
  const ps1 = path.join(REPO_ROOT, "scripts", "trusted-distribution-gate.ps1");
  try {
    const stdout = execFileSync("pwsh", ["-NoProfile", "-File", ps1, ...args], {
      cwd: REPO_ROOT,
      encoding: "utf-8",
      maxBuffer: 32 * 1024 * 1024,
    });
    return { stdout, stderr: "", code: 0 };
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: err.stdout ?? "",
      stderr: err.stderr ?? "",
      code: err.status ?? -1,
    };
  }
}

const it_ps1 = ps1Available() ? test : test.skip;

describe("cli-e2e / PowerShell entry", () => {
  it_ps1("missing required arg returns exit 8 (InputContract)", () => {
    const r = runPs1([]);
    expect(r.code).toBe(8);
  }, 30000);

  it_ps1("bootstrap-report mode emits JSON report and exit 0", () => {
    const { repo, head } = makeFixtureRepo();
    const r = runPs1(["-BootstrapReport", "-BaseOid", head, "-RepoRoot", repo]);
    expect(r.code).toBe(0);
    const lines = r.stdout.trim().split(/\r?\n/);
    const jsonStart = lines.findIndex((l) => l.startsWith("{"));
    expect(jsonStart).toBeGreaterThanOrEqual(0);
    const json = JSON.parse(lines.slice(jsonStart).join("\n"));
    expect(json.ok).toBe(true);
    expect(json.oid).toBe(head);
    expect(Array.isArray(json.entries)).toBe(true);
    expect(json.entries.length).toBeGreaterThan(0);
  }, 60000);

  it_ps1("clean candidate returns exit 0 with archive", () => {
    const { repo, head } = makeFixtureRepo();
    const outDir = path.join(TMP_ROOT, `e2e-out-${Math.random().toString(36).slice(2, 6)}`);
    fs.mkdirSync(outDir, { recursive: true });
    const r = runPs1([
      "-BaseOid", head,
      "-CandidateOid", head,
      "-RepoRoot", repo,
      "-OutputDir", outDir,
      "-RepositoryIdentity", "yogata/agent-dev-flow",
      "-BootstrapMode",
    ]);
    expect(r.code).toBe(0);
    const lines = r.stdout.trim().split(/\r?\n/);
    const jsonStart = lines.findIndex((l) => l.startsWith("{"));
    const json = JSON.parse(lines.slice(jsonStart).join("\n"));
    expect(json.exit_code).toBe(0);
    expect(json.archive_path).toBeTruthy();
    expect(fs.existsSync(json.archive_path)).toBe(true);
  }, 120000);

  it_ps1("invalid OID returns exit 8 (InputContract)", () => {
    const { repo, head } = makeFixtureRepo();
    const outDir = path.join(TMP_ROOT, `e2e-invalid-${Math.random().toString(36).slice(2, 6)}`);
    fs.mkdirSync(outDir, { recursive: true });
    const r = runPs1([
      "-BaseOid", head,
      "-CandidateOid", "not-a-real-oid",
      "-RepoRoot", repo,
      "-OutputDir", outDir,
      "-RepositoryIdentity", "yogata/agent-dev-flow",
    ]);
    expect(r.code).toBe(8);
  }, 60000);
});
