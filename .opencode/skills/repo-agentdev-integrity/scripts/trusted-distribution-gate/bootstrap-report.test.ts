// Tests for the bootstrap-report module.
//
// The bootstrap report is the PR-review evidence artifact. It must NOT
// execute the launcher pipeline; it only reads git blobs at the requested
// OID and emits digests. This keeps it independent so the launcher cannot
// validate itself with its own (possibly tampered) logic.

import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { execFileSync } from "child_process";
import { bootstrapDigestReport } from "./bootstrap-report.ts";

const TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "trust-br-"));

beforeAll(() => {
  void TMP_ROOT;
});

afterAll(() => {
  try { fs.rmSync(TMP_ROOT, { recursive: true, force: true }); } catch (e) { void e; }
});

function makeRepo(): { repo: string; head: string } {
  const repo = path.join(TMP_ROOT, `repo-${Math.random().toString(36).slice(2, 8)}`);
  fs.mkdirSync(repo, { recursive: true });
  execFileSync("git", ["init", "-q", "-b", "main"], { cwd: repo });
  execFileSync("git", ["config", "user.email", "t@t"], { cwd: repo });
  execFileSync("git", ["config", "user.name", "t"], { cwd: repo });
  if (process.platform === "win32") {
    execFileSync("git", ["config", "core.longpaths", "true"], { cwd: repo });
  }
  const trustDir = ".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate";
  for (const f of ["types.ts", "cli.ts", "package.json", "bun.lock"]) {
    const full = path.join(repo, `${trustDir}/${f}`);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, `// ${f}\n`);
  }
  const scriptsDir = path.join(repo, "scripts");
  fs.mkdirSync(scriptsDir, { recursive: true });
  fs.writeFileSync(path.join(scriptsDir, "trusted-distribution-gate.ps1"), "# ps1\n");
  execFileSync("git", ["add", "-A"], { cwd: repo });
  execFileSync("git", ["commit", "-q", "-m", "init"], { cwd: repo });
  const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo }).toString().trim();
  return { repo, head };
}

describe("bootstrap-report", () => {
  test("emits present entries with sha256 for files at the OID", () => {
    const { repo, head } = makeRepo();
    const r = bootstrapDigestReport(repo, head);
    expect(r.ok).toBe(false); // not all protected paths committed in fixture
    expect(r.oid).toBe(head);
    expect(r.entries.length).toBeGreaterThan(0);
    const ps1 = r.entries.find((e) => e.path === "scripts/trusted-distribution-gate.ps1");
    expect(ps1?.status).toBe("present");
    expect(ps1?.sha256).toMatch(/^[0-9a-f]{64}$/);
  });

  test("marks missing files as missing (no throw)", () => {
    const { repo, head } = makeRepo();
    const r = bootstrapDigestReport(repo, head);
    const missing = r.entries.filter((e) => e.status === "missing");
    expect(missing.length).toBeGreaterThan(0);
    for (const m of missing) {
      expect(m.sha256).toBeNull();
      expect(m.size).toBe(0);
    }
  });

  test("rejects invalid OID with ok=false", () => {
    const { repo } = makeRepo();
    const r = bootstrapDigestReport(repo, "not-a-real-oid");
    expect(r.ok).toBe(false);
    expect(r.entries).toEqual([]);
  });

  test("entries cover the protected-path set", () => {
    const { repo, head } = makeRepo();
    const r = bootstrapDigestReport(repo, head);
    const paths = r.entries.map((e) => e.path);
    expect(paths).toContain("scripts/trusted-distribution-gate.ps1");
    expect(paths).toContain("scripts/install-consumer-opencode.ps1");
  });
});
