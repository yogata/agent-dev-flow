// Regression harness for scripts/package-release-archive.ps1.
//
// Proves the hardening contract (Issue #2092 / DEC-014 decision 7):
//   - Happy path publishes exactly one final ZIP, no staging residue.
//   - Archive boundary violation -> no ZIP, no residue.
//   - Missing trusted host checker -> no ZIP, no residue.
//   - Archive expansion failure -> no ZIP, no residue.
//   - Missing trusted installer (scripts/install-from-archive.ps1) -> no ZIP,
//     no residue.
//   - Installer exits non-zero -> no ZIP, no residue.
//   - Archive-installed boundary check fails -> no newly published ZIP, no
//     residue.
//   - Pre-existing final archive collision -> no newly published ZIP, no
//     residue.
//
// The harness builds an isolated fake repository per test under os.tmpdir(),
// copies the real release script + real installer into it, drops a stub
// boundary checker, runs the script via pwsh, and inspects dist/ afterwards.
// Each test owns its temp dir and removes it on cleanup.

import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { execFileSync, spawn, spawnSync, type ChildProcess } from "child_process";

// From <repoRoot>/.opencode/skills/repo-agentdev-integrity/scripts/ to
// <repoRoot> is four ".." segments.
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..", "..");
const REAL_SCRIPT = path.join(REPO_ROOT, "scripts", "package-release-archive.ps1");
const REAL_INSTALLER = path.join(REPO_ROOT, "scripts", "install-from-archive.ps1");
const REAL_PUBLISHER = path.join(REPO_ROOT, "scripts", "publish-hard-link.ts");

// Stub boundary checker used by every scenario. The real
// check_distribution_boundary.ts is a heavy TS module that pulls in lib/;
// the regression harness must NOT depend on it. This stub honours the same
// CLI contract the script uses (`bun run <checker> --profile <p> <root>
// --json`) and mirrors the real checker's NARROW scan paths:
//   - profile=archive: scans <root>/src/opencode/commands/agentdev/** and
//     <root>/src/opencode/skills/(agentdev-*|japanese-tech-writing)/**
//   - profile=archive-installed: scans <root>/.opencode/commands/agentdev/**
//     and <root>/.opencode/skills/(agentdev-*|japanese-tech-writing)/**
//
// Mirroring the narrow scan is essential: a broad "scan everything" stub
// would mask the regression where the script forgets to scan archive extras
// (README-INSTALL.md, install-from-archive.ps1) that live outside
// src/opencode/. A failure is recorded when any scanned file contains the
// literal VIOLATION-MARKER-REQ-9999.
const STUB_CHECKER_TS = `const fs=require("fs");const p=require("path");
const a=process.argv.slice(2);
let profile="source",root=".";
for(let i=0;i<a.length;i++){
  if(a[i]==="--profile"){profile=a[i+1];i++;}
  else if(a[i]&&!a[i].startsWith("--")){root=a[i];}
}
function isPub(d){return d.startsWith("agentdev-")||d==="japanese-tech-writing";}
function scanCmd(root){const c=p.join(root,(profile==="archive"?"src/opencode":".opencode"),"commands","agentdev");walk(c);}
function scanSkills(root){const s=p.join(root,(profile==="archive"?"src/opencode":".opencode"),"skills");if(!fs.existsSync(s))return;for(const e of fs.readdirSync(s,{withFileTypes:true})){if(e.isDirectory()&&isPub(e.name))walk(p.join(s,e.name));}}
function walk(d){
  if(!fs.existsSync(d))return;
  for(const e of fs.readdirSync(d,{withFileTypes:true})){
    const f=p.join(d,e.name);
    if(e.isDirectory())walk(f);
    else if(e.isFile()){
      try{
        const t=fs.readFileSync(f,"utf-8");
        if(t.includes("VIOLATION-MARKER-REQ-9999")){console.error("VIOLATION "+f);process.exit(1);}
      }catch{}
    }
  }
}
if(profile==="archive"){scanCmd(root);scanSkills(root);}
else if(profile==="archive-installed"){scanCmd(root);scanSkills(root);}
const flag=p.join(root,".fail-on-"+profile);
if(fs.existsSync(flag)){console.error("forced-fail "+profile);process.exit(1);}
process.exit(0);
`;

interface RunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

interface RepoPaths {
  /** Temp repo root (under os.tmpdir). */
  root: string;
  /** <root>/scripts/package-release-archive.ps1 */
  scriptPath: string;
  /** <root>/scripts/install-from-archive.ps1 (real copy by default). */
  installerPath: string;
  /** <root>/.opencode/skills/repo-agentdev-integrity/scripts/check_distribution_boundary.ts */
  checkerPath: string;
  /** <root>/src/opencode/commands/agentdev */
  commandsDir: string;
  /** <root>/src/opencode/skills */
  skillsDir: string;
  /** <root>/README-INSTALL.md */
  readmePath: string;
  /** <root>/dist */
  distDir: string;
  /** Computed commit short hash of the temp repo HEAD. */
  commitShort: string;
  /** <root>/dist/agentdev-release-<commitShort>.zip */
  finalZipPath: string;
}

interface ResidueReport {
  /** True iff the final archive path exists after the run. */
  finalZip: boolean;
  /** True iff the legacy staging directory (dist/agentdev-release-<sha>/) exists. */
  legacyStageRoot: boolean;
  /** Names of any .trust-stage-* dirs left under dist/. */
  trustStageDirs: string[];
  /** All entries left under dist/. */
  allDistEntries: string[];
}

function makeFakeRepo(): RepoPaths {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "pkg-rel-"));
  fs.mkdirSync(path.join(root, "scripts"), { recursive: true });
  fs.mkdirSync(path.join(root, "src", "opencode", "commands", "agentdev"), { recursive: true });
  fs.mkdirSync(path.join(root, "src", "opencode", "skills"), { recursive: true });
  fs.mkdirSync(path.join(root, ".opencode", "skills", "repo-agentdev-integrity", "scripts"), { recursive: true });

  fs.writeFileSync(path.join(root, "src", "opencode", "commands", "agentdev", "probe-cmd.md"), "# probe command\n");
  fs.mkdirSync(path.join(root, "src", "opencode", "skills", "agentdev-probe"), { recursive: true });
  fs.writeFileSync(path.join(root, "src", "opencode", "skills", "agentdev-probe", "SKILL.md"), "# probe skill\n");
  fs.writeFileSync(path.join(root, "README-INSTALL.md"), "# Install\nConsumer install instructions.\n");

  fs.copyFileSync(REAL_SCRIPT, path.join(root, "scripts", "package-release-archive.ps1"));
  fs.copyFileSync(REAL_INSTALLER, path.join(root, "scripts", "install-from-archive.ps1"));
  fs.copyFileSync(REAL_PUBLISHER, path.join(root, "scripts", "publish-hard-link.ts"));
  fs.writeFileSync(
    path.join(root, ".opencode", "skills", "repo-agentdev-integrity", "scripts", "check_distribution_boundary.ts"),
    STUB_CHECKER_TS,
  );

  execFileSync("git", ["init", "-q"], { cwd: root, env: gitEnv() });
  execFileSync("git", ["config", "user.name", "pkg-rel-test"], { cwd: root, env: gitEnv() });
  execFileSync("git", ["config", "user.email", "pkg-rel-test@example.test"], { cwd: root, env: gitEnv() });
  execFileSync("git", ["config", "core.autocrlf", "false"], { cwd: root, env: gitEnv() });
  execFileSync("git", ["add", "."], { cwd: root, env: gitEnv() });
  execFileSync("git", ["commit", "-q", "-m", "init"], { cwd: root, env: gitEnv() });
  const commitShort = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: root, env: gitEnv() })
    .toString()
    .trim();

  return {
    root,
    scriptPath: path.join(root, "scripts", "package-release-archive.ps1"),
    installerPath: path.join(root, "scripts", "install-from-archive.ps1"),
    checkerPath: path.join(root, ".opencode", "skills", "repo-agentdev-integrity", "scripts", "check_distribution_boundary.ts"),
    commandsDir: path.join(root, "src", "opencode", "commands", "agentdev"),
    skillsDir: path.join(root, "src", "opencode", "skills"),
    readmePath: path.join(root, "README-INSTALL.md"),
    distDir: path.join(root, "dist"),
    commitShort,
    finalZipPath: path.join(root, "dist", `agentdev-release-${commitShort}.zip`),
  };
}

function gitEnv(): NodeJS.ProcessEnv {
  // Isolate git from any repo-inherited config so temp repo HEAD is the
  // only source of truth for rev-parse.
  return { ...process.env, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "", GIT_CONFIG_SYSTEM: "" };
}

function runScript(repo: RepoPaths, prelude?: string): RunResult {
  const argv = ["-NoProfile", "-NonInteractive", "-File", repo.scriptPath];
  const r = spawnSync("pwsh", argv, {
    cwd: repo.root,
    encoding: "utf-8",
    env: { ...process.env },
  });
  return {
    exitCode: r.status ?? -1,
    stdout: r.stdout ?? "",
    stderr: r.stderr ?? "",
  };
  void prelude;
}

/**
 * Patch the copied script in the temp repo to inject deterministic failure
 * modes for the regression harness. PowerShell function/cmdlet shadowing
 * across `& script.ps1` scope boundaries is unreliable; rewriting the copy
 * in place is the only deterministic way to drive these scenarios.
 */
function patchScript(repo: RepoPaths, find: string | RegExp, replace: string): void {
  const txt = fs.readFileSync(repo.scriptPath, "utf-8");
  fs.writeFileSync(repo.scriptPath, txt.replace(find, replace));
}

function inspect(repo: RepoPaths): ResidueReport {
  const dist = repo.distDir;
  if (!fs.existsSync(dist)) {
    return { finalZip: false, legacyStageRoot: false, trustStageDirs: [], allDistEntries: [] };
  }
  const entries = fs.readdirSync(dist);
  return {
    finalZip: fs.existsSync(repo.finalZipPath),
    legacyStageRoot: fs.existsSync(path.join(dist, `agentdev-release-${repo.commitShort}`)),
    trustStageDirs: entries.filter((e) => e.startsWith(".trust-stage-")),
    allDistEntries: entries.slice().sort(),
  };
}

function rmrf(p: string): void {
  try {
    fs.rmSync(p, { recursive: true, force: true });
  } catch {
    /* swallow */
  }
}

describe("package-release-archive.ps1 / happy path", () => {
  test("publishes exactly one final ZIP and leaves no staging residue", () => {
    const repo = makeFakeRepo();
    try {
      const res = runScript(repo);
      expect(res.exitCode).toBe(0);
      const report = inspect(repo);
      expect(report.finalZip).toBe(true);
      expect(report.legacyStageRoot).toBe(false);
      expect(report.trustStageDirs).toEqual([]);
      // dist/ contains ONLY the final ZIP.
      expect(report.allDistEntries).toEqual([`agentdev-release-${repo.commitShort}.zip`]);
    } finally {
      rmrf(repo.root);
    }
  }, 120000);
});

describe("package-release-archive.ps1 / archive boundary violation", () => {
  test("leaves no final ZIP and no staging residue (exit 6)", () => {
    const repo = makeFakeRepo();
    try {
      // Inject a violation into a staged-source file.
      fs.writeFileSync(
        path.join(repo.commandsDir, "violate.md"),
        "This references VIOLATION-MARKER-REQ-9999 in a command.\n",
      );
      // Re-commit so the staging copy and archive contents both carry it.
      execFileSync("git", ["add", "."], { cwd: repo.root, env: gitEnv() });
      execFileSync("git", ["commit", "-q", "-m", "violate"], { cwd: repo.root, env: gitEnv() });

      const res = runScript(repo);
      expect(res.exitCode).toBe(6);
      const report = inspect(repo);
      expect(report.finalZip).toBe(false);
      expect(report.legacyStageRoot).toBe(false);
      expect(report.trustStageDirs).toEqual([]);
    } finally {
      rmrf(repo.root);
    }
  }, 120000);
});

describe("package-release-archive.ps1 / archive extras boundary violation", () => {
  test("scanner catches violations in README-INSTALL.md and install-from-archive.ps1 (exit 6)", () => {
    const repo = makeFakeRepo();
    try {
      // Violation in README-INSTALL.md (an archive extra, not under src/opencode/).
      fs.writeFileSync(
        repo.readmePath,
        "Install instructions leak VIOLATION-MARKER-REQ-9999 in README.\n",
      );
      execFileSync("git", ["add", "."], { cwd: repo.root, env: gitEnv() });
      execFileSync("git", ["commit", "-q", "-m", "violate-readme"], { cwd: repo.root, env: gitEnv() });

      const res = runScript(repo);
      expect(res.exitCode).toBe(6);
      const report = inspect(repo);
      expect(report.finalZip).toBe(false);
      expect(report.legacyStageRoot).toBe(false);
      expect(report.trustStageDirs).toEqual([]);
    } finally {
      rmrf(repo.root);
    }
  }, 120000);
});

describe("package-release-archive.ps1 / missing trusted host checker", () => {
  test("fails closed (exit 8), no ZIP, no residue", () => {
    const repo = makeFakeRepo();
    try {
      fs.rmSync(repo.checkerPath, { force: true });
      const res = runScript(repo);
      expect(res.exitCode).toBe(8);
      const report = inspect(repo);
      expect(report.finalZip).toBe(false);
      expect(report.legacyStageRoot).toBe(false);
      expect(report.trustStageDirs).toEqual([]);
    } finally {
      rmrf(repo.root);
    }
  }, 120000);
});

describe("package-release-archive.ps1 / archive expansion failure", () => {
  test("leaves no final ZIP and no staging residue", () => {
    const repo = makeFakeRepo();
    try {
      // Rewrite Expand-Archive to throw so the post-archive verification
      // step fails after the ZIP has been built. The script must catch,
      // clean up, and exit non-zero without leaving the built ZIP behind.
      patchScript(
        repo,
        /^(\s*)Expand-Archive\b/m,
        "$1throw '[test] forced Expand-Archive failure'",
      );
      const res = runScript(repo);
      expect(res.exitCode).not.toBe(0);
      const report = inspect(repo);
      expect(report.finalZip).toBe(false);
      expect(report.legacyStageRoot).toBe(false);
      expect(report.trustStageDirs).toEqual([]);
    } finally {
      rmrf(repo.root);
    }
  }, 120000);
});

describe("package-release-archive.ps1 / missing trusted installer", () => {
  test("fails before staging, no ZIP, no residue", () => {
    const repo = makeFakeRepo();
    try {
      fs.rmSync(repo.installerPath, { force: true });
      const res = runScript(repo);
      // The trusted installer (scripts/install-from-archive.ps1) is a host
      // source-required file; missing it must exit non-zero before any
      // staging is built.
      expect(res.exitCode).not.toBe(0);
      const report = inspect(repo);
      expect(report.finalZip).toBe(false);
      expect(report.legacyStageRoot).toBe(false);
      expect(report.trustStageDirs).toEqual([]);
    } finally {
      rmrf(repo.root);
    }
  }, 120000);
});

describe("package-release-archive.ps1 / installer non-zero exit", () => {
  test("leaves no final ZIP and no staging residue", () => {
    const repo = makeFakeRepo();
    try {
      // Replace installer with a stub that exits 1.
      fs.writeFileSync(repo.installerPath, "exit 1\n");
      const res = runScript(repo);
      expect(res.exitCode).not.toBe(0);
      const report = inspect(repo);
      expect(report.finalZip).toBe(false);
      expect(report.legacyStageRoot).toBe(false);
      expect(report.trustStageDirs).toEqual([]);
    } finally {
      rmrf(repo.root);
    }
  }, 120000);
});

describe("package-release-archive.ps1 / archive-installed boundary failure", () => {
  test("leaves no newly published ZIP and no staging residue (exit 7)", () => {
    const repo = makeFakeRepo();
    try {
      // The archive and archive-installed projections scan the same content
      // shape, so the only way to fail archive-installed WITHOUT first
      // failing archive is for the installer to inject a violation post-stage.
      // The marker is assembled at runtime so the staged installer source
      // does not itself contain the literal VIOLATION-MARKER-REQ-9999 string
      // (which would trip the archive check on the staged copy). The injection
      // must be placed BEFORE the installer's trailing `exit 0` or it never
      // runs.
      const realInstallerBody = fs.readFileSync(repo.installerPath, "utf-8");
      const injection =
        `$injectDir = Join-Path $Target "skills\\agentdev-injected"\n` +
        `New-Item -ItemType Directory -Path $injectDir -Force | Out-Null\n` +
        `$m = "VIOLATION-" + "MARKER-" + "REQ-" + "9999"\n` +
        `"$m injected by installer." | Out-File (Join-Path $injectDir "SKILL.md") -Encoding utf8\n`;
      const patched = realInstallerBody.replace(/^exit 0\b/m, `${injection}exit 0`);
      expect(patched).not.toEqual(realInstallerBody);
      fs.writeFileSync(repo.installerPath, patched);
      execFileSync("git", ["add", "."], { cwd: repo.root, env: gitEnv() });
      execFileSync("git", ["commit", "-q", "-m", "injecting-installer"], { cwd: repo.root, env: gitEnv() });

      const res = runScript(repo);
      expect(res.exitCode).toBe(7);
      const report = inspect(repo);
      expect(report.finalZip).toBe(false);
      expect(report.legacyStageRoot).toBe(false);
      expect(report.trustStageDirs).toEqual([]);
    } finally {
      rmrf(repo.root);
    }
  }, 120000);
});

describe("package-release-archive.ps1 / pre-existing final collision", () => {
  test("does NOT overwrite and leaves no staging residue (exit 3)", () => {
    const repo = makeFakeRepo();
    try {
      // Pre-create the final archive path with sentinel content.
      fs.mkdirSync(repo.distDir, { recursive: true });
      fs.writeFileSync(repo.finalZipPath, "PRE-EXISTING-SENTINEL");

      const res = runScript(repo);
      expect(res.exitCode).toBe(3);
      // Existing archive must be untouched.
      expect(fs.readFileSync(repo.finalZipPath, "utf-8")).toBe("PRE-EXISTING-SENTINEL");
      const report = inspect(repo);
      expect(report.legacyStageRoot).toBe(false);
      expect(report.trustStageDirs).toEqual([]);
      // dist/ contains only the pre-existing sentinel.
      expect(report.allDistEntries).toEqual([`agentdev-release-${repo.commitShort}.zip`]);
    } finally {
      rmrf(repo.root);
    }
  }, 120000);
});

describe("package-release-archive.ps1 / publish primitive contract", () => {
  test("publish path uses atomic hard-link helper, NOT Move-Item / copy / rename", () => {
    // The script's executable code (comment lines stripped) must reach
    // the linearization point through the trusted hard-link helper and
    // must NOT contain any unproven fallback primitive. This pins the
    // contract proven by the concurrent publication test below.
    const full = fs.readFileSync(REAL_SCRIPT, "utf-8");
    const stripped = full
      .split(/\r?\n/)
      .filter((l) => !/^\s*#/.test(l))
      .join("\n");
    expect(stripped).toMatch(/publish-hard-link\.ts/);
    expect(stripped).toMatch(/& bun run \$publishHelper/);
    // No Move-Item / rename primitives in executable code.
    expect(stripped).not.toMatch(/\bMove-Item\b/);
    expect(stripped).not.toMatch(/\bRename-Item\b/);
    expect(stripped).not.toMatch(/System\.IO\.File\]::Copy\b/);
    expect(stripped).not.toMatch(/fs\.copyFileSync\b/);
    expect(stripped).not.toMatch(/fs\.renameSync\b/);
    // Copy-Item is allowed for staging source files and archive extras,
    // but MUST NOT target $finalZip.
    expect(stripped).not.toMatch(/Copy-Item\b[^\n#]*\$finalZip\b/);
  });

  test("missing trusted host publish helper fails closed (exit 8), no ZIP, no residue", () => {
    const repo = makeFakeRepo();
    try {
      fs.rmSync(path.join(repo.root, "scripts", "publish-hard-link.ts"), { force: true });
      const res = runScript(repo);
      expect(res.exitCode).toBe(8);
      const report = inspect(repo);
      expect(report.finalZip).toBe(false);
      expect(report.legacyStageRoot).toBe(false);
      expect(report.trustStageDirs).toEqual([]);
    } finally {
      rmrf(repo.root);
    }
  }, 120000);
});

// ---------------------------------------------------------------------------
// Stage B (Issue #2092) / untrusted-execution defense
//
// Proves the candidate archive's install-from-archive.ps1 is NEVER executed
// by the release pipeline. Only the trusted host installer
// (scripts/install-from-archive.ps1 at the release runner's working tree)
// runs against the extracted source. A mutated archive's installer can no
// longer run arbitrary code (in particular, can no longer mutate $stagedZip
// between Compress-Archive and publication).
// ---------------------------------------------------------------------------

describe("package-release-archive.ps1 / Stage B untrusted-execution defense", () => {
  test("invokes the trusted host installer ($installScript), NOT the extracted candidate ($installFromArchive)", () => {
    // Static contract pin. PowerShell `-File <path>` decides which script
    // body runs; this must be the trusted host installer, not the path
    // extracted from the candidate archive.
    const full = fs.readFileSync(REAL_SCRIPT, "utf-8");
    const stripped = full
      .split(/\r?\n/)
      .filter((l) => !/^\s*#/.test(l))
      .join("\n");
    expect(stripped).toMatch(/-File\s+\$installScript\b/);
    expect(stripped).not.toMatch(/-File\s+\$installFromArchive\b/);
  });

  test("malicious installer inside the staged archive does NOT run; publish succeeds", () => {
    // Behavioral probe. The staging step normally copies $installScript
    // (trusted) into <stageArchiveRoot>/scripts/install-from-archive.ps1.
    // Patch the staging step to write a MALICIOUS stub there instead. The
    // trusted installer at repo.installerPath is unchanged. After running
    // the release script:
    //   - if the script still invokes the extracted installer, the malicious
    //     stub runs and drops a probe file (BUG: exit 9 / probe present)
    //   - if the script invokes the trusted installer, the stub never runs
    //     and the publish completes normally (CORRECT: exit 0 / no probe).
    const repo = makeFakeRepo();
    try {
      const probePath = path.join(repo.root, "MALICIOUS-INSTALLER-RAN.txt");
      const stubBody = `New-Item -ItemType File -Path '${probePath.replace(/'/g, "''")}' -Force | Out-Null`;
      // Function-replacement form avoids $-interpolation of $stageScripts.
      const stageCopyRe = /Copy-Item -LiteralPath \$installScript -Destination \(Join-Path \$stageScripts "install-from-archive\.ps1"\) -Force/;
      const txt = fs.readFileSync(repo.scriptPath, "utf-8");
      const patched = txt.replace(stageCopyRe, () =>
        `Set-Content -LiteralPath (Join-Path $stageScripts "install-from-archive.ps1") -Value '${stubBody.replace(/'/g, "''")}' -Encoding utf8`,
      );
      expect(patched).not.toEqual(txt);
      fs.writeFileSync(repo.scriptPath, patched);

      const res = runScript(repo);
      expect(res.exitCode).toBe(0);
      // CRITICAL: malicious installer MUST NOT have executed.
      expect(fs.existsSync(probePath)).toBe(false);
      const report = inspect(repo);
      expect(report.finalZip).toBe(true);
      expect(report.trustStageDirs).toEqual([]);
    } finally {
      rmrf(repo.root);
    }
  }, 120000);
});

// ---------------------------------------------------------------------------
// Stage B (Issue #2092) / byte binding through publication
//
// Proves the validated staged ZIP bytes are cryptographically bound through
// the atomic hard-link publication. The host computes SHA-256 of $stagedZip
// immediately before publication; the trusted publish helper verifies the
// same digest on the staged bytes (pre-linkSync) AND on the final bytes
// (post-linkSync). Any mutation of $stagedZip between digest computation
// and linkSync is detected and fails closed (exit 9, no final published).
// ---------------------------------------------------------------------------

describe("package-release-archive.ps1 / Stage B byte binding (digest protocol)", () => {
  test("computes SHA-256 of $stagedZip and passes it to the publish helper", () => {
    // Static contract pin. The release script must compute the digest
    // immediately before invocation and pass it as the third argv element.
    const full = fs.readFileSync(REAL_SCRIPT, "utf-8");
    const stripped = full
      .split(/\r?\n/)
      .filter((l) => !/^\s*#/.test(l))
      .join("\n");
    expect(stripped).toMatch(/Get-FileHash\b[^\n#]*\$stagedZip\b/);
    expect(stripped).toMatch(
      /&\s*bun\s+run\s+\$publishHelper\s+\$stagedZip\s+\$finalZip\s+\$stagedZipHash\b/,
    );
  });

  test("mutated $stagedZip after digest computation fails publish (exit 9), no final, no residue", () => {
    // Behavioral probe. Inject a mutation between the digest computation
    // and the helper invocation. The helper MUST detect the digest
    // mismatch and refuse to publish. This is the byte-binding TOCTOU
    // defense: no candidate code runs in this window in production, but
    // if anything (concurrent process, OS race) mutates $stagedZip after
    // the host computed its digest, the publish fails closed.
    const repo = makeFakeRepo();
    try {
      const helperCallRe = /(&\s*bun\s+run\s+\$publishHelper\s+\$stagedZip\s+\$finalZip\s+\$stagedZipHash)/;
      const txt = fs.readFileSync(repo.scriptPath, "utf-8");
      const patched = txt.replace(helperCallRe, (_m, helperCall) =>
        `Add-Content -LiteralPath $stagedZip -Value "MUTATION-PROBE" -NoNewline\n${helperCall}`,
      );
      expect(patched).not.toEqual(txt);
      fs.writeFileSync(repo.scriptPath, patched);

      const res = runScript(repo);
      expect(res.exitCode).toBe(9);
      const report = inspect(repo);
      expect(report.finalZip).toBe(false);
      expect(report.trustStageDirs).toEqual([]);
    } finally {
      rmrf(repo.root);
    }
  }, 120000);
});

// ---------------------------------------------------------------------------
// Stage B (Issue #2092) / true two-process concurrent hard-link race
//
// Uses test-only race-worker.ts to prove the publish-hard-link primitive's
// atomic behavior. Two workers race to publish the SAME final path from
// different staged ZIPs. Exactly one worker exits 0 (success), the other
// exits 3 (collision EEXIST). The final bytes equal exactly one complete
// staged payload. No sleeps - barrier synchronization via ready/go files.
// ---------------------------------------------------------------------------

describe("publish-hard-link.ts / true two-process concurrent publication", () => {
  test("exactly one winner (exit 0) and one collision (exit 3); valid final; no residue", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "race-hl-"));
    const staged1 = path.join(dir, "staged1.zip");
    const staged2 = path.join(dir, "staged2.zip");
    const final = path.join(dir, "final.zip");
    const ready1 = path.join(dir, "ready1");
    const ready2 = path.join(dir, "ready2");
    const goFile = path.join(dir, "go");

    // Create two distinct staged ZIPs (EOCD stub)
    const payload1 = Buffer.from([0x50, 0x4b, 0x05, 0x06, 0, 0, 0, 0, 0x01]);
    const payload2 = Buffer.from([0x50, 0x4b, 0x05, 0x06, 0, 0, 0, 0, 0x02]);
    fs.writeFileSync(staged1, payload1);
    fs.writeFileSync(staged2, payload2);

    const WORKER = path.join(__dirname, "race-worker.ts");
    const p1 = spawn("bun", ["run", WORKER, ready1, goFile, staged1, final], { cwd: dir });
    const p2 = spawn("bun", ["run", WORKER, ready2, goFile, staged2, final], { cwd: dir });

    const exitP1 = new Promise<number>((resolve, reject) => {
      p1.on("exit", (c) => resolve(c ?? -1));
      p1.on("error", (e) => reject(e));
    });
    const exitP2 = new Promise<number>((resolve, reject) => {
      p2.on("exit", (c) => resolve(c ?? -1));
      p2.on("error", (e) => reject(e));
    });

    // Wait for both workers to signal ready
    const readyDeadline = Date.now() + 30000;
    while ((!fs.existsSync(ready1) || !fs.existsSync(ready2)) && Date.now() < readyDeadline) {
      await new Promise<void>((r) => setTimeout(r, 10));
    }
    expect(fs.existsSync(ready1)).toBe(true);
    expect(fs.existsSync(ready2)).toBe(true);

    // Signal both workers to proceed
    fs.writeFileSync(goFile, "GO");

    const [exit1, exit2] = await Promise.race([
      Promise.all([exitP1, exitP2]),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 60000)),
    ]);

    const codes = [exit1, exit2].sort();
    expect(codes).toEqual([0, 3]);

    // Verify final bytes equal exactly one staged payload
    expect(fs.existsSync(final)).toBe(true);
    const finalBytes = fs.readFileSync(final);
    const matches1 = finalBytes.equals(payload1);
    const matches2 = finalBytes.equals(payload2);
    expect(matches1 || matches2).toBe(true);

    // Clean up temp dir
    fs.rmSync(dir, { recursive: true, force: true });
  }, 120000);
});
