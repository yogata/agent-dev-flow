// Behavioral tests for the scripts/ public entry boundary (REQ-050).
// Runs the real entry scripts via pwsh against disposable environments:
//   - misexecution stop: install.ps1 on the self-hosting repo stops before
//     any change and guides to self-sync.ps1 (REQ-050-006)
//   - misexecution stop: self-sync.ps1 on a consumer repo stops before any
//     change and guides to install.ps1 (REQ-050-006)
//   - non-destructive modes: check and dry-run leave managed files
//     untouched on a real consumer layout (REQ-050-005)
//   - orphan detection: check reports an agentdev junction that is not in
//     the current source enumeration (REQ-050-004)
//
// The consumer layout is exercised in both checkout forms accepted by
// REQ-050 / REQ-009: git clone style (.git present) and source ZIP style
// (.git absent).

// ADF-COVERS(verification): REQ-050-004, REQ-050-005, REQ-050-006

import { describe, expect, test } from "bun:test";
import * as crypto from "crypto";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { execFileSync, spawnSync } from "child_process";

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");
const INSTALL_PS1 = path.join(REPO_ROOT, "scripts", "install.ps1");
const SELF_SYNC_PS1 = path.join(REPO_ROOT, "scripts", "self-sync.ps1");

interface RunResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

function runPwsh(args: readonly string[], cwd: string): RunResult {
  const r = spawnSync("pwsh", ["-NoProfile", "-NonInteractive", ...args], {
    cwd,
    encoding: "utf-8",
  });
  return { exitCode: r.status ?? -1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

function runInstall(cwd: string, mode: string, extra: readonly string[] = []): RunResult {
  return runPwsh(["-File", INSTALL_PS1, "-Mode", mode, ...extra], cwd);
}

function rmrf(p: string): void {
  try {
    fs.rmSync(p, { recursive: true, force: true });
  } catch {
    /* swallow */
  }
}

function digestTree(root: string): Map<string, string> {
  const out = new Map<string, string>();
  if (!fs.existsSync(root)) return out;
  const walk = (dir: string): void => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
      } else if (ent.isFile()) {
        const rel = path.relative(root, full).replace(/\\/g, "/");
        const stat = fs.statSync(full);
        out.set(`${rel}:${stat.size}:${stat.mtimeMs}`);
      }
    }
  };
  walk(root);
  return out;
}

/**
 * Minimal consumer fixture mirroring the real layout:
 *   <root>/.git                       (present unless zipCheckout)
 *   <root>/.agentdev-plugin/src/opencode/{commands/agentdev,skills/...}
 *   <root>/.agentdev-plugin/src/opencode-local/agentdev-gh-cli  (localSource only)
 *   <root>/scripts/{install.ps1,consumer/common.ps1}
 */
function makeConsumerRepo(zipCheckout: boolean, localSource = false): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), zipCheckout ? "adf-zip-" : "adf-git-"));
  fs.mkdirSync(path.join(root, ".agentdev-plugin", "src", "opencode", "commands", "agentdev"), { recursive: true });
  fs.mkdirSync(path.join(root, ".agentdev-plugin", "src", "opencode", "skills", "agentdev-gh-cli"), { recursive: true });
  fs.mkdirSync(path.join(root, ".agentdev-plugin", "src", "opencode", "skills", "japanese-tech-writing"), { recursive: true });
  fs.writeFileSync(path.join(root, ".agentdev-plugin", "src", "opencode", "commands", "agentdev", "case-run.md"), "# case-run\n");
  fs.writeFileSync(path.join(root, ".agentdev-plugin", "src", "opencode", "skills", "agentdev-gh-cli", "SKILL.md"), "# gh-cli\n");
  fs.writeFileSync(path.join(root, ".agentdev-plugin", "src", "opencode", "skills", "japanese-tech-writing", "SKILL.md"), "# jtw\n");
  if (localSource) {
    fs.mkdirSync(path.join(root, ".agentdev-plugin", "src", "opencode-local", "agentdev-gh-cli"), { recursive: true });
    fs.writeFileSync(path.join(root, ".agentdev-plugin", "src", "opencode-local", "agentdev-gh-cli", "SKILL.md"), "# gh-cli local\n");
  }

  fs.mkdirSync(path.join(root, "scripts", "consumer"), { recursive: true });
  fs.copyFileSync(INSTALL_PS1, path.join(root, "scripts", "install.ps1"));
  fs.copyFileSync(path.join(REPO_ROOT, "scripts", "consumer", "common.ps1"), path.join(root, "scripts", "consumer", "common.ps1"));

  // The consumer repo root is always a git repository (cwd safety requires
  // .git). The checkout form differs only inside .agentdev-plugin:
  //   git clone style -> .agentdev-plugin is itself a git repo (committed)
  //   source ZIP style -> no .git inside .agentdev-plugin (version unknown)
  execFileSync("git", ["init", "-q", "-b", "main"], { cwd: root });
  execFileSync("git", ["config", "user.email", "t@t"], { cwd: root });
  execFileSync("git", ["config", "user.name", "t"], { cwd: root });
  if (!zipCheckout) {
    const plugin = path.join(root, ".agentdev-plugin");
    execFileSync("git", ["init", "-q", "-b", "main"], { cwd: plugin });
    execFileSync("git", ["config", "user.email", "t@t"], { cwd: plugin });
    execFileSync("git", ["config", "user.name", "t"], { cwd: plugin });
    execFileSync("git", ["add", "-A"], { cwd: plugin });
    execFileSync("git", ["commit", "-q", "-m", "plugin"], { cwd: plugin });
  }
  return root;
}

describe("scripts behavior / misexecution stop (REQ-050-006)", () => {
  test("install.ps1 on the self-hosting repo stops before any change and guides to self-sync.ps1", () => {
    // REPO_ROOT itself is the self-hosting layout (src/opencode exists).
    const before = digestTree(path.join(REPO_ROOT, ".opencode"));
    const r = runInstall(REPO_ROOT, "apply");
    expect(r.exitCode).toBe(1);
    expect(r.stdout).toContain("scripts/self-sync.ps1 を使ってください");
    expect(r.stdout).toContain("本体リポジトリ");
    const after = digestTree(path.join(REPO_ROOT, ".opencode"));
    expect(after).toEqual(before);
  });

  test("install.ps1 misexecution stop also applies to check and dry-run", () => {
    for (const mode of ["check", "dry-run"]) {
      const r = runInstall(REPO_ROOT, mode);
      expect(r.exitCode).toBe(1);
      expect(r.stdout).toContain("scripts/self-sync.ps1 を使ってください");
    }
  });

  test("self-sync.ps1 on a consumer repo stops before any change and guides to install.ps1", () => {
    const root = makeConsumerRepo(false);
    try {
      // Copy self-sync.ps1 next to the consumer scripts (as if misexecuted
      // there). Its $PSScriptRoot parent has no src/opencode.
      const misplaced = path.join(root, "scripts", "self-sync.ps1");
      fs.copyFileSync(SELF_SYNC_PS1, misplaced);
      const before = digestTree(path.join(root, ".opencode"));
      const r = runPwsh(["-File", misplaced, "-Mode", "apply"], root);
      expect(r.exitCode).toBe(1);
      expect(r.stdout).toContain("scripts/install.ps1 を使ってください");
      const after = digestTree(path.join(root, ".opencode"));
      expect(after).toEqual(before);
    } finally {
      rmrf(root);
    }
  });
});

describe("scripts behavior / non-destructive check and dry-run (REQ-050-005)", () => {
  function nonDestructiveScenario(
    label: string,
    zipCheckout: boolean,
    localSource = false,
    extra: readonly string[] = [],
  ): void {
    test(`${label}: check and dry-run leave the projection untouched`, () => {
      const root = makeConsumerRepo(zipCheckout, localSource);
      try {
        const apply = runInstall(root, "apply", extra);
        expect(apply.exitCode).toBe(0);

        const check = runInstall(root, "check", extra);
        expect(check.exitCode).toBe(0);
        const afterCheck = digestTree(path.join(root, ".opencode"));

        const dry = runInstall(root, "dry-run", extra);
        expect(dry.exitCode).toBe(0);
        const afterDry = digestTree(path.join(root, ".opencode"));

        expect(afterDry).toEqual(afterCheck);
      } finally {
        rmrf(root);
      }
    }, 120000);
  }

  nonDestructiveScenario("git clone checkout, normal mode", false);
  nonDestructiveScenario("git clone checkout, -LocalMode", false, true, ["-LocalMode"]);
  nonDestructiveScenario("source ZIP checkout (.git absent), normal mode", true);
});

describe("scripts behavior / check capabilities (REQ-050-004)", () => {
  test("orphan junction is reported as a divergence (exit 1)", () => {
    const root = makeConsumerRepo(false);
    try {
      const apply = runInstall(root, "apply");
      expect(apply.exitCode).toBe(0);

      // Plant an orphan agentdev junction not present in the source
      // enumeration.
      const orphanTarget = path.join(root, ".agentdev-plugin", "orphan-target");
      fs.mkdirSync(orphanTarget, { recursive: true });
      const orphanLink = path.join(root, ".opencode", "skills", "agentdev-orphan");
      const mk = spawnSync("cmd", ["/c", "mklink", "/J", orphanLink, orphanTarget], { encoding: "utf-8" });
      expect(mk.status).toBe(0);

      const check = runInstall(root, "check");
      expect(check.exitCode).toBe(1);
      expect(check.stdout).toMatch(/agentdev-orphan/);
    } finally {
      rmrf(root);
    }
  }, 120000);

  test("version report: git checkout reports commit, ZIP checkout reports unknown", () => {
    const gitRoot = makeConsumerRepo(false);
    const zipRoot = makeConsumerRepo(true);
    try {
      const gitApply = runInstall(gitRoot, "apply");
      expect(gitApply.exitCode).toBe(0);
      const gitCheck = runInstall(gitRoot, "check");
      expect(gitCheck.stdout).toMatch(/Checkout: \S+ \([0-9a-f]+\)/);

      const zipApply = runInstall(zipRoot, "apply");
      expect(zipApply.exitCode).toBe(0);
      const zipCheck = runInstall(zipRoot, "check");
      expect(zipCheck.stdout).toContain("Checkout: unknown");
    } finally {
      rmrf(gitRoot);
      rmrf(zipRoot);
    }
  }, 180000);
});
