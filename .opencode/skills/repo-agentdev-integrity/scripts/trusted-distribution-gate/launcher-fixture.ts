// Shared fixture builders for launcher-level tests.
//
// Extracted from launcher.test.ts to keep that file under the 250 pure LOC
// ceiling (parent defect #12). Each launcher test file imports from here.

import * as fs from "fs";
import * as path from "path";
import { execFileSync } from "child_process";

export const TMP_ROOT = path.join(process.cwd(), ".worktrees-tmp-test-launcher");

export function ensureTmpRoot(): void {
  fs.rmSync(TMP_ROOT, { recursive: true, force: true });
  fs.mkdirSync(TMP_ROOT, { recursive: true });
}

export function cleanupTmpRoot(): void {
  fs.rmSync(TMP_ROOT, { recursive: true, force: true });
}

export function writeFix(repo: string, rel: string, content: string): void {
  const full = path.join(repo, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

export function headOid(repo: string): string {
  return execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo }).toString().trim();
}

export function commitTweak(repo: string, rel: string, content: string): string {
  writeFix(repo, rel, content);
  execFileSync("git", ["add", "-A"], { cwd: repo });
  execFileSync("git", ["commit", "-q", "-m", `tweak ${rel}`], { cwd: repo });
  return headOid(repo);
}

export function deleteAndCommit(repo: string, rel: string): string {
  fs.unlinkSync(path.join(repo, rel));
  execFileSync("git", ["add", "-A"], { cwd: repo });
  execFileSync("git", ["commit", "-q", "-m", `drop ${rel}`], { cwd: repo });
  return headOid(repo);
}

/**
 * Build a fixture repo mirroring the real repo's trust-root layout. Each
 * trust-root path mentioned in TRUST_ROOT_DIRECT_PATHS must be present at
 * the base commit so the launcher's protected-paths check finds them.
 */
export function makeFixtureRepo(): string {
  const repo = path.join(TMP_ROOT, `repo-${Math.random().toString(36).slice(2, 8)}`);
  fs.mkdirSync(repo, { recursive: true });
  execFileSync("git", ["init", "-q", "-b", "main"], { cwd: repo });
  execFileSync("git", ["config", "user.email", "t@t"], { cwd: repo });
  execFileSync("git", ["config", "user.name", "t"], { cwd: repo });
  // The fixture mirrors the real repo's deep trust-root path; on Windows
  // the path length exceeds MAX_PATH unless core.longpaths is enabled.
  if (process.platform === "win32") {
    execFileSync("git", ["config", "core.longpaths", "true"], { cwd: repo });
  }

  writeFix(repo, "src/opencode/commands/agentdev/case-run.md", "# case-run\n");
  writeFix(repo, "src/opencode/skills/agentdev-foo/SKILL.md", "# foo skill\n");
  writeFix(repo, "src/opencode/skills/japanese-tech-writing/SKILL.md", "# jtw\n");
  writeFix(repo, "scripts/install-consumer-opencode.ps1", "# install\n");
  writeFix(repo, "scripts/check-consumer-opencode.ps1", "# check\n");
  writeFix(repo, "scripts/install-from-archive.ps1", "# install-from-archive\n");
  writeFix(repo, "README-INSTALL.md", "# install readme\n");

  // Trust-root files: keep in sync with protected-paths.ts TRUST_ROOT_DIRECT_PATHS.
  const trustDir = ".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate";
  const trustFiles = [
    "types.ts", "boundary-pipeline.ts", "text-binary.ts", "protected-paths.ts",
    "git-blob-reader.ts", "manifest.ts", "archive-builder.ts", "launcher.ts",
    "index.ts", "protected-check.ts", "blob-loader.ts", "boundary-runner.ts",
    "cli.ts", "bootstrap-report.ts", "tsconfig.json", "package.json", "bun.lock", ".gitignore",
  ];
  for (const f of trustFiles) {
    writeFix(repo, `${trustDir}/${f}`, `// ${f}\n`);
  }
  writeFix(repo, "scripts/trusted-distribution-gate.ps1", "# placeholder\n");
  writeFix(repo, "scripts/package-release-archive.ps1", "# placeholder\n");

  execFileSync("git", ["add", "-A"], { cwd: repo });
  execFileSync("git", ["commit", "-q", "-m", "fixture"], { cwd: repo });
  return repo;
}
