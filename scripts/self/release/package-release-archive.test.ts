// Verification tests for REQ-099-020 (installer / release archive canonical
// structure adaptation, DEC-049):
//   - package-release-archive.ps1 collects the canonical layout: commands,
//     skills, and Custom Tools from src/common/; Plugins/Hooks from
//     src/opencode/plugins/. The legacy single-canonical src/opencode/
//     collection definitions must be gone.
//   - the archive-bundled install guide original lives in
//     scripts/consumer/archive/ next to the archive installer original and
//     documents the canonical bundled layout.
//   - the archive-edition installer (scripts/consumer/archive/install.ps1)
//     resolves its Source under the canonical archive layout (src/common/
//     commands/skills/tools + src/opencode/plugins) and places them into the
//     .opencode/ projection as real files (junction-free), matching the
//     boundary checker's archive-installed semantics (.opencode/**).

// ADF-COVERS(verification): REQ-099-020

import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { spawnSync } from "child_process";

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");
const ARCHIVE_INSTALLER = path.join(REPO_ROOT, "scripts", "consumer", "archive", "install.ps1");
const PACKAGE_ARCHIVE_PS1 = path.join(REPO_ROOT, "scripts", "self", "release", "package-release-archive.ps1");
const ARCHIVE_README = path.join(REPO_ROOT, "README-INSTALL.md");

interface RunResult {
  readonly exitCode: number;
  readonly stdout: string;
}

function runPwsh(args: readonly string[], cwd: string): RunResult {
  const r = spawnSync("pwsh", ["-NoProfile", "-NonInteractive", ...args], {
    cwd,
    encoding: "utf-8",
  });
  return { exitCode: r.status ?? -1, stdout: r.stdout ?? "" };
}

function rmrf(p: string): void {
  try {
    fs.rmSync(p, { recursive: true, force: true });
  } catch {
    /* swallow */
  }
}

describe("package-release-archive canonical collection (REQ-099-020)", () => {
  test("collection sources point at src/common/ and src/opencode/plugins", () => {
    const text = fs.readFileSync(PACKAGE_ARCHIVE_PS1, "utf-8");
    expect(text).toContain('Join-Path $repoRoot "src\\common\\commands\\agentdev"');
    expect(text).toContain('Join-Path $repoRoot "src\\common\\skills"');
    expect(text).toContain('Join-Path $repoRoot "src\\common\\tools"');
    expect(text).toContain('Join-Path $repoRoot "src\\opencode\\plugins"');
  });

  test("legacy single-canonical src/opencode collection definitions are gone", () => {
    const text = fs.readFileSync(PACKAGE_ARCHIVE_PS1, "utf-8");
    expect(text).not.toContain('Join-Path $repoRoot "src\\opencode\\commands\\agentdev"');
    expect(text).not.toContain('Join-Path $repoRoot "src\\opencode\\skills"');
    expect(text).not.toContain('Join-Path $repoRoot "src\\opencode\\$kind"');
  });

  test("archive-bundled install guide documents the canonical bundled layout", () => {
    const text = fs.readFileSync(PACKAGE_ARCHIVE_PS1, "utf-8");
    expect(text).toContain('Join-Path $repoRoot "README-INSTALL.md"');
    const readme = fs.readFileSync(ARCHIVE_README, "utf-8");
    expect(readme).toContain("src/common/commands/agentdev/**.md");
    expect(readme).toContain("src/common/tools/agentdev-*/**");
    expect(readme).toContain("src/opencode/plugins/agentdev-*/**");
    expect(readme).not.toContain("src/opencode/commands/agentdev");
  });
});

describe("archive-edition installer places the canonical projection (REQ-099-020)", () => {
  test("installs commands/skills/tools from src/common and plugins from src/opencode as real files", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "adf-arch-req099-"));
    try {
      const src = path.join(root, "src");
      fs.mkdirSync(path.join(src, "common", "commands", "agentdev"), { recursive: true });
      fs.mkdirSync(path.join(src, "common", "skills", "agentdev-x"), { recursive: true });
      fs.mkdirSync(path.join(src, "common", "tools", "agentdev-testtool"), { recursive: true });
      fs.mkdirSync(path.join(src, "opencode", "plugins", "agentdev-testplugin"), { recursive: true });
      fs.writeFileSync(path.join(src, "common", "commands", "agentdev", "case-run.md"), "# case-run\n", "utf-8");
      fs.writeFileSync(path.join(src, "common", "skills", "agentdev-x", "SKILL.md"), "# x\n", "utf-8");
      fs.writeFileSync(path.join(src, "common", "tools", "agentdev-testtool", "index.ts"), "// tool\n", "utf-8");
      fs.writeFileSync(path.join(src, "opencode", "plugins", "agentdev-testplugin", "plugin.ts"), "// plugin\n", "utf-8");
      const target = path.join(root, ".opencode");
      const r = runPwsh(
        ["-File", ARCHIVE_INSTALLER, "-Source", src, "-Target", target, "-Mode", "copy"],
        root,
      );
      expect(r.exitCode).toBe(0);
      expect(fs.existsSync(path.join(target, "commands", "agentdev", "case-run.md"))).toBe(true);
      expect(fs.existsSync(path.join(target, "skills", "agentdev-x", "SKILL.md"))).toBe(true);
      expect(fs.existsSync(path.join(target, "tools", "agentdev-testtool", "index.ts"))).toBe(true);
      expect(fs.existsSync(path.join(target, "plugins", "agentdev-testplugin", "plugin.ts"))).toBe(true);
      expect(fs.existsSync(path.join(target, "plugins", "agentdev-testplugin.ts"))).toBe(true);
      expect(r.stdout).toContain("third-party drift check skipped");
    } finally {
      rmrf(root);
    }
  }, 120000);

  test("missing canonical commands source stops with exit 5", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "adf-arch-req099-"));
    try {
      const src = path.join(root, "src");
      fs.mkdirSync(path.join(src, "common", "skills", "agentdev-x"), { recursive: true });
      fs.writeFileSync(path.join(src, "common", "skills", "agentdev-x", "SKILL.md"), "# x\n", "utf-8");
      const target = path.join(root, ".opencode");
      const r = runPwsh(
        ["-File", ARCHIVE_INSTALLER, "-Source", src, "-Target", target, "-Mode", "copy"],
        root,
      );
      expect(r.exitCode).toBe(5);
    } finally {
      rmrf(root);
    }
  }, 120000);
});
