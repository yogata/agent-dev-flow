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
//
// Test isolation (parent defect #11): all fixtures live under unique
// os.tmpdir() mkdtemp directories, never under process.cwd().

import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as path from "path";
import { execFileSync } from "child_process";
import {
  makeTmpDir,
  disposeRepo,
  makeFixtureRepo,
  headOid,
} from "./launcher-fixture.ts";

const REPO_ROOT = path.resolve(
  path.join(__dirname, "..", "..", "..", "..", ".."),
);

function ps1Available(): boolean {
  if (process.platform !== "win32") return false;
  try {
    execFileSync("pwsh", ["-NoProfile", "-Command", "exit 0"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
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
    const repo = makeFixtureRepo();
    try {
      const head = headOid(repo);
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
    } finally {
      disposeRepo(repo);
    }
  }, 60000);

  it_ps1("clean candidate with -BootstrapMode returns exit 0 with archive", () => {
    const repo = makeFixtureRepo();
    try {
      const head = headOid(repo);
      const outDir = makeTmpDir("trust-e2e-out-");
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
    } finally {
      disposeRepo(repo);
    }
  }, 120000);

  it_ps1("clean candidate with -SeedMode alias also returns exit 0", () => {
    const repo = makeFixtureRepo();
    try {
      const head = headOid(repo);
      const outDir = makeTmpDir("trust-e2e-seed-");
      const r = runPs1([
        "-BaseOid", head,
        "-CandidateOid", head,
        "-RepoRoot", repo,
        "-OutputDir", outDir,
        "-RepositoryIdentity", "yogata/agent-dev-flow",
        "-SeedMode",
      ]);
      expect(r.code).toBe(0);
    } finally {
      disposeRepo(repo);
    }
  }, 120000);

  it_ps1("invalid OID returns exit 8 (InputContract)", () => {
    const repo = makeFixtureRepo();
    try {
      const head = headOid(repo);
      const outDir = makeTmpDir("trust-e2e-invalid-");
      const r = runPs1([
        "-BaseOid", head,
        "-CandidateOid", "not-a-real-oid",
        "-RepoRoot", repo,
        "-OutputDir", outDir,
        "-RepositoryIdentity", "yogata/agent-dev-flow",
      ]);
      expect(r.code).toBe(8);
    } finally {
      disposeRepo(repo);
    }
  }, 60000);
});
