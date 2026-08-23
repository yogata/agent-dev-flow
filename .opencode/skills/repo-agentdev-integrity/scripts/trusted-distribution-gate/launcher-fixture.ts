// Shared fixture builders for launcher-level tests.
//
// Extracted from launcher.test.ts to keep that file under the 250 pure LOC
// ceiling (parent defect #12). Each launcher test file imports from here.
//
// Test isolation (parent defect #11): all fixtures live under unique
// os.tmpdir() mkdtemp directories, NEVER under process.cwd(). Each test
// creates its own mkdtemp and cleans it up in finally. Tests must NEVER
// create commits, gitlinks, or files in the parent worktree.

import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { execFileSync } from "child_process";

export interface FixtureRepo {
  readonly repo: string;
  /** Function to clean up the repo. Idempotent. */
  readonly cleanup: () => void;
}

function rm(p: string): void {
  try {
    fs.rmSync(p, { recursive: true, force: true });
  } catch {
    /* already gone */
  }
}

export function makeTmpDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
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

// Trust-root modules committed in the fixture. Kept in sync with the
// auto-enumeration in protected-paths.ts by ALSO auto-discovering at test
// setup time, so a newly added module automatically appears here.
const TRUST_DIR_REL =
  ".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate";
const REPO_ROOT_FOR_DISCOVERY = path.resolve(
  __dirname, "..", "..", "..", "..", "..",
);

function listTrustRootModules(): string[] {
  const abs = path.join(REPO_ROOT_FOR_DISCOVERY, TRUST_DIR_REL);
  const out: string[] = [];
  for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
    if (!ent.isFile()) continue;
    if (!ent.name.endsWith(".ts")) continue;
    if (ent.name.endsWith(".test.ts")) continue;
    if (ent.name.endsWith(".d.ts")) continue;
    out.push(ent.name);
  }
  return out.sort();
}

/**
 * Build a fixture repo mirroring the real repo's trust-root layout. Each
 * trust-root path mentioned in TRUST_ROOT_DIRECT_PATHS must be present at
 * the base commit so the launcher's protected-paths check finds them.
 */
export function makeFixtureRepo(): string {
  const repo = makeTmpDir("trust-test-repo-");
  execFileSync("git", ["init", "-q", "-b", "main"], { cwd: repo });
  execFileSync("git", ["config", "user.email", "t@t"], { cwd: repo });
  execFileSync("git", ["config", "user.name", "t"], { cwd: repo });
  if (process.platform === "win32") {
    execFileSync("git", ["config", "core.longpaths", "true"], { cwd: repo });
  }

  writeFix(repo, "src/opencode/commands/agentdev/case-run.md", "# case-run\n");
  writeFix(repo, "src/opencode/skills/agentdev-foo/SKILL.md", "# foo skill\n");
  writeFix(repo, "src/opencode/skills/japanese-tech-writing/SKILL.md", "# jtw\n");
  writeFix(repo, "scripts/install.ps1", "# install\n");
  writeFix(repo, "scripts/consumer/common.ps1", "# common\n");
  // scripts/consumer/archive/install.ps1 (archive-dedicated installer
  // original) is needed by the archive-installed physical verifier (read
  // from BASE oid) but is NOT a protected Stage A path (Stage B owns it).
  // A minimal real installer works for the verifier.
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

  // Trust-root modules: auto-discover to match production exactly.
  for (const f of listTrustRootModules()) {
    writeFix(repo, `${TRUST_DIR_REL}/${f}`, `// ${f}\n`);
  }
  // Trust-root config files.
  for (const f of ["tsconfig.json", "package.json", "bun.lock", ".gitignore"]) {
    writeFix(repo, `${TRUST_DIR_REL}/${f}`, `# ${f}\n`);
  }
  writeFix(repo, "scripts/self/release/trusted-distribution-gate.ps1", "# placeholder\n");
  writeFix(repo, "scripts/self/release/package-release-archive.ps1", "# placeholder\n");

  execFileSync("git", ["add", "-A"], { cwd: repo });
  execFileSync("git", ["commit", "-q", "-m", "fixture"], { cwd: repo });
  return repo;
}

export function disposeRepo(repo: string): void {
  rm(repo);
}
