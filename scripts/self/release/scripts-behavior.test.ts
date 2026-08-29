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
//   - tools/plugins projection: apply junctions the Custom Tool and
//     Plugin / Hook distribution kinds into .opencode/ (REQ-052-007)
//
// The consumer layout is exercised in both checkout forms accepted by
// REQ-050 / REQ-009: git clone style (.git present) and source ZIP style
// (.git absent).

// ADF-COVERS(verification): REQ-050-004, REQ-050-005, REQ-050-006
// ADF-COVERS(verification): REQ-052-007

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
  fs.mkdirSync(path.join(root, ".agentdev-plugin", "src", "opencode", "skills", "agentdev-workflow-case-run"), { recursive: true });
  fs.mkdirSync(path.join(root, ".agentdev-plugin", "src", "opencode", "tools", "agentdev-gh"), { recursive: true });
  fs.mkdirSync(path.join(root, ".agentdev-plugin", "src", "opencode", "plugins", "agentdev-gh-write-guard"), { recursive: true });
  fs.mkdirSync(path.join(root, ".agentdev-plugin", "src", "opencode", "plugins", "agentdev-gh-tool"), { recursive: true });
  fs.writeFileSync(path.join(root, ".agentdev-plugin", "src", "opencode", "commands", "agentdev", "case-run.md"), "# case-run\n");
  fs.writeFileSync(path.join(root, ".agentdev-plugin", "src", "opencode", "skills", "agentdev-workflow-case-run", "SKILL.md"), "# case-run skill\n");
  fs.writeFileSync(path.join(root, ".agentdev-plugin", "src", "opencode", "tools", "agentdev-gh", "index.ts"), "// agentdev-gh tool\n");
  fs.writeFileSync(path.join(root, ".agentdev-plugin", "src", "opencode", "plugins", "agentdev-gh-write-guard", "plugin.ts"), "// agentdev-gh-write-guard plugin\n");
  fs.writeFileSync(path.join(root, ".agentdev-plugin", "src", "opencode", "plugins", "agentdev-gh-tool", "plugin.ts"), "// agentdev-gh-tool plugin\n");
  if (localSource) {
    fs.mkdirSync(path.join(root, ".agentdev-plugin", "src", "opencode-local", "agentdev-gh-cli"), { recursive: true });
    fs.writeFileSync(path.join(root, ".agentdev-plugin", "src", "opencode-local", "agentdev-gh-cli", "runner-local.ts"), "// local runner\n");
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

describe("scripts behavior / tools and plugins projection (REQ-052-007)", () => {
  test("apply junctions src/opencode/{tools,plugins}/agentdev-* into .opencode/ and check stays clean", () => {
    const root = makeConsumerRepo(false);
    try {
      const apply = runInstall(root, "apply");
      expect(apply.exitCode).toBe(0);

      const toolLink = path.join(root, ".opencode", "tools", "agentdev-gh");
      const pluginLink = path.join(root, ".opencode", "plugins", "agentdev-gh-write-guard");
      expect(fs.existsSync(toolLink)).toBe(true);
      expect(fs.existsSync(path.join(toolLink, "index.ts"))).toBe(true);
      expect(fs.existsSync(pluginLink)).toBe(true);
      expect(fs.existsSync(path.join(pluginLink, "plugin.ts"))).toBe(true);

      const check = runInstall(root, "check");
      expect(check.exitCode).toBe(0);
      expect(check.stdout).toMatch(/tools\\agentdev-gh/);
      expect(check.stdout).toMatch(/plugins\\agentdev-gh-write-guard/);
    } finally {
      rmrf(root);
    }
  }, 120000);

  test("apply writes depth-1 plugin loader shims and check verifies them (REQ-011-001 registration wiring)", () => {
    const root = makeConsumerRepo(false);
    try {
      const apply = runInstall(root, "apply");
      expect(apply.exitCode).toBe(0);

      const guardShim = path.join(root, ".opencode", "plugins", "agentdev-gh-write-guard.ts");
      const toolShim = path.join(root, ".opencode", "plugins", "agentdev-gh-tool.ts");
      expect(fs.existsSync(guardShim)).toBe(true);
      expect(fs.existsSync(toolShim)).toBe(true);
      const expected = (pkg: string): string =>
        `// Generated by scripts/install.ps1 / scripts/self-sync.ps1 - do not edit.\n` +
        `export { default } from "./${pkg}/plugin.ts";\n`;
      expect(fs.readFileSync(guardShim, "utf-8")).toBe(expected("agentdev-gh-write-guard"));
      expect(fs.readFileSync(toolShim, "utf-8")).toBe(expected("agentdev-gh-tool"));

      const check = runInstall(root, "check");
      expect(check.exitCode).toBe(0);
      expect(check.stdout).toMatch(/Plugin loader shim: plugins\/agentdev-gh-tool\.ts/);

      // A stale agentdev shim is reported as a divergence and removed by apply.
      const stale = path.join(root, ".opencode", "plugins", "agentdev-gone.ts");
      fs.writeFileSync(stale, "// stale\n", "utf-8");
      const checkStale = runInstall(root, "check");
      expect(checkStale.exitCode).toBe(1);
      expect(checkStale.stdout).toMatch(/agentdev-gone\.ts/);
      const reapply = runInstall(root, "apply");
      expect(reapply.exitCode).toBe(0);
      expect(fs.existsSync(stale)).toBe(false);
    } finally {
      rmrf(root);
    }
  }, 180000);

  test("-LocalMode redirects tools/agentdev-gh to the Local implementation (REQ-011-006)", () => {
    const root = makeConsumerRepo(false, true);
    try {
      const apply = runInstall(root, "apply", ["-LocalMode"]);
      expect(apply.exitCode).toBe(0);

      const toolProjection = path.join(root, ".opencode", "tools", "agentdev-gh");
      expect(fs.existsSync(path.join(toolProjection, "runner-local.ts"))).toBe(true);

      const check = runInstall(root, "check", ["-LocalMode"]);
      expect(check.exitCode).toBe(0);
      expect(check.stdout).toMatch(/Link mode: local/);

      // check without -LocalMode auto-detects local mode from the link target.
      const checkAuto = runInstall(root, "check");
      expect(checkAuto.exitCode).toBe(0);
      expect(checkAuto.stdout).toMatch(/Link mode: local/);
    } finally {
      rmrf(root);
    }
  }, 180000);
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
