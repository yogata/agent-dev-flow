// Launcher tests: core happy path + input contract + protected-path
// rejection (parent defect blockers 9, 10, 12).

import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as path from "path";
import { execFileSync } from "child_process";
import {
  makeTmpDir,
  disposeRepo,
  makeFixtureRepo,
  headOid,
  commitTweak,
  deleteAndCommit,
  writeFix,
} from "./launcher-fixture.ts";
import { runLauncher, type LauncherOptions } from "./launcher.ts";
import { assertGitOid, type Projection } from "./types.ts";
import { bootstrapDigestReport } from "./bootstrap-report.ts";
import { checkProtectedPaths } from "./protected-check.ts";
import {
  TRUST_ROOT_DIRECT_PATHS,
  DEFAULT_PROTECTED_PATH_SET,
  listAllProtectedPaths,
  isProtectedPath,
  type ProtectedPathSet,
} from "./protected-paths.ts";
import { prepareStagedArchive, publishStagedArchive } from "./archive-publish.ts";

function baseOpts(repo: string, base: string, candidate: string, outName: string): LauncherOptions {
  const outputDir = makeTmpDir(`trust-test-${outName}-`);
  return {
    repo_root: repo,
    base_oid: base,
    candidate_oid: candidate,
    output_dir: outputDir,
    repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
  };
}

describe("launcher / runLauncher happy path", () => {
  test("returns Ok exit code on a clean candidate", () => {
    const repo = makeFixtureRepo();
    try {
      const head = headOid(repo);
      const opts = baseOpts(repo, head, head, "out-ok");
      const result = runLauncher(opts);
      expect(result.exit_code).toBe(0);
      expect(result.archive_path).toBeTruthy();
      expect(fs.existsSync(result.archive_path ?? "")).toBe(true);
      expect(result.manifests["source"].entries.length).toBeGreaterThan(0);
      expect(result.manifests["archive"].entries.length).toBeGreaterThan(0);
    } finally {
      disposeRepo(repo);
    }
  }, 60000);
});

describe("launcher / runLauncher input contract", () => {
  test("rejects non-hex OID with exit 8 (InputContract)", () => {
    const repo = makeFixtureRepo();
    try {
      const head = headOid(repo);
      const opts: LauncherOptions = {
        ...baseOpts(repo, head, "not-a-real-oid", "out-contract"),
      };
      expect(runLauncher(opts).exit_code).toBe(8);
    } finally {
      disposeRepo(repo);
    }
  });

  test("rejects empty repository identity with exit 8", () => {
    const repo = makeFixtureRepo();
    try {
      const head = headOid(repo);
      const outDir = makeTmpDir("trust-test-empty-id-");
      const opts: LauncherOptions = {
        repo_root: repo,
        base_oid: head,
        candidate_oid: head,
        output_dir: outDir,
        repository_identity: { owner_slash_name: "", default_branch: "main" },
      };
      expect(runLauncher(opts).exit_code).toBe(8);
    } finally {
      disposeRepo(repo);
    }
  });
});

describe("launcher / runLauncher protected-path rejection", () => {
  test("rejects modification of trust-root launcher file (exit 1)", () => {
    const repo = makeFixtureRepo();
    try {
      const base = headOid(repo);
      const candidate = commitTweak(
        repo,
        "src/common/skills/repo-agentdev-integrity/trusted-distribution-gate/launcher.ts",
        "// TAMPERED\n",
      );
      expect(runLauncher(baseOpts(repo, base, candidate, "out-prot")).exit_code).toBe(1);
    } finally {
      disposeRepo(repo);
    }
  }, 60000);

  test("rejects modification of trusted entry script (exit 1)", () => {
    const repo = makeFixtureRepo();
    try {
      const base = headOid(repo);
      const candidate = commitTweak(repo, "scripts/self/release/trusted-distribution-gate.ps1", "# TAMPERED\n");
      expect(runLauncher(baseOpts(repo, base, candidate, "out-prot-entry")).exit_code).toBe(1);
    } finally {
      disposeRepo(repo);
    }
  }, 60000);

  test("rejects modification of helper protected-check.ts (parent defect #9)", () => {
    const repo = makeFixtureRepo();
    try {
      const base = headOid(repo);
      const candidate = commitTweak(
        repo,
        "src/common/skills/repo-agentdev-integrity/trusted-distribution-gate/protected-check.ts",
        "// TAMPERED\n",
      );
      expect(runLauncher(baseOpts(repo, base, candidate, "out-prot-helper")).exit_code).toBe(1);
    } finally {
      disposeRepo(repo);
    }
  }, 60000);

  test("rejects modification of helper blob-loader.ts (parent defect #9)", () => {
    const repo = makeFixtureRepo();
    try {
      const base = headOid(repo);
      const candidate = commitTweak(
        repo,
        "src/common/skills/repo-agentdev-integrity/trusted-distribution-gate/blob-loader.ts",
        "// TAMPERED\n",
      );
      expect(runLauncher(baseOpts(repo, base, candidate, "out-prot-blob")).exit_code).toBe(1);
    } finally {
      disposeRepo(repo);
    }
  }, 60000);

  test("rejects modification of helper boundary-runner.ts (parent defect #9)", () => {
    const repo = makeFixtureRepo();
    try {
      const base = headOid(repo);
      const candidate = commitTweak(
        repo,
        "src/common/skills/repo-agentdev-integrity/trusted-distribution-gate/boundary-runner.ts",
        "// TAMPERED\n",
      );
      expect(runLauncher(baseOpts(repo, base, candidate, "out-prot-runner")).exit_code).toBe(1);
    } finally {
      disposeRepo(repo);
    }
  }, 60000);

  test("rejects deletion of trusted installation mapping script (exit 1)", () => {
    const repo = makeFixtureRepo();
    try {
      const base = headOid(repo);
      const candidate = deleteAndCommit(repo, "scripts/install.ps1");
      expect(runLauncher(baseOpts(repo, base, candidate, "out-prot-del")).exit_code).toBe(1);
    } finally {
      disposeRepo(repo);
    }
  }, 60000);

  test("bootstrap/seed mode STILL rejects modification (parent defect #4)", () => {
    const repo = makeFixtureRepo();
    try {
      const base = headOid(repo);
      const candidate = commitTweak(
        repo,
        "src/common/skills/repo-agentdev-integrity/trusted-distribution-gate/launcher.ts",
        "// TAMPERED\n",
      );
      const opts: LauncherOptions = {
        ...baseOpts(repo, base, candidate, "out-bootstrap-modified"),
        bootstrap_mode: true,
      };
      expect(runLauncher(opts).exit_code).toBe(1);
    } finally {
      disposeRepo(repo);
    }
  }, 60000);
});


// =============================================================================
// cli.ts argument contract — consolidated from cli_args.test.ts.
// =============================================================================

const GATE_CLI = path.join(import.meta.dir, "cli.ts");

function runCli(args: readonly string[]): { stdout: string; stderr: string; code: number } {
  const r = Bun.spawnSync(["bun", GATE_CLI, ...args]);
  return {
    stdout: r.stdout.toString(),
    stderr: r.stderr.toString(),
    code: r.exitCode,
  };
}

describe("cli.ts argument contract", () => {
  test("--help prints usage to stdout and exits 0", () => {
    const r = runCli(["--help"]);
    expect(r.code).toBe(0);
    expect(r.stdout).toContain("usage: bun cli.ts");
  });

  test("-h is the short form of --help", () => {
    const r = runCli(["-h"]);
    expect(r.code).toBe(0);
    expect(r.stdout).toContain("usage: bun cli.ts");
  });

  test("no args reports missing required argument(s) with exit 8", () => {
    const r = runCli([]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain("cli.ts: missing required argument(s)");
  });

  test("unknown long option is rejected with exit 8", () => {
    const r = runCli(["--bogus"]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain("cli.ts: unknown argument: --bogus");
  });

  test("unknown short option is rejected with exit 8", () => {
    const r = runCli(["-x"]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain("cli.ts: unknown argument: -x");
  });

  test("short option cluster is rejected as the original arg with exit 8", () => {
    const r = runCli(["-hx"]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain("cli.ts: unknown argument: -hx");
  });

  test("positional argument is rejected as unknown with exit 8", () => {
    const r = runCli(["foo"]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain("cli.ts: unknown argument: foo");
  });

  test("--option=value form is rejected as unknown with exit 8", () => {
    const r = runCli(["--base-oid=x"]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain("cli.ts: unknown argument: --base-oid=x");
  });

  test("mid-position -- is rejected as unknown with exit 8", () => {
    const r = runCli(["--candidate-oid", "c", "--"]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain("cli.ts: unknown argument: --");
  });

  test("--help wins when it appears before an unknown arg", () => {
    const r = runCli(["--help", "--bogus"]);
    expect(r.code).toBe(0);
  });

  test("unknown arg wins when it appears before --help", () => {
    const r = runCli(["--bogus", "--help"]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain("cli.ts: unknown argument: --bogus");
  });

  test("--base-oid without a value (trailing) is treated as missing required (exit 8)", () => {
    const r = runCli([
      "--candidate-oid", "c",
      "--repo-root", "r",
      "--output-dir", "o",
      "--repository-identity", "i",
      "--base-oid",
    ]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain("cli.ts: missing required argument(s)");
  });

  test("--base-oid consumes the next option name as its value, rejecting the orphaned value (exit 8)", () => {
    const r = runCli([
      "--base-oid",
      "--candidate-oid", "c",
      "--repo-root", "r",
    ]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain("cli.ts: unknown argument: c");
  });

  test("empty string --base-oid is treated as missing required (exit 8)", () => {
    const r = runCli([
      "--base-oid", "",
      "--candidate-oid", "c",
      "--repo-root", "r",
      "--output-dir", "o",
      "--repository-identity", "i",
    ]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain("cli.ts: missing required argument(s)");
  });

  test("-- consumed as an option value leaves the next arg rejected (exit 8)", () => {
    const r = runCli(["--repo-root", "--", "x"]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain("cli.ts: unknown argument: x");
  });

  test("--bootstrap-report with a value but no --repo-root reports the report-mode requirement (exit 8)", () => {
    const r = runCli(["--bootstrap-report", "oid"]);
    expect(r.code).toBe(8);
    expect(r.stderr).toContain(
      "cli.ts: --bootstrap-report requires --base-oid and --repo-root",
    );
  });
});

// =============================================================================
// PowerShell entry e2e — consolidated from cli-e2e.test.ts (representative
// cases; the full-pipeline runs are covered by runLauncher tests).
// =============================================================================

const LAUNCHER_REPO_ROOT = path.resolve(path.join(import.meta.dir, "..", "..", "..", "..", ".."));

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
  const ps1 = path.join(LAUNCHER_REPO_ROOT, "scripts", "self", "release", "trusted-distribution-gate.ps1");
  try {
    const stdout = execFileSync("pwsh", ["-NoProfile", "-File", ps1, ...args], {
      cwd: LAUNCHER_REPO_ROOT,
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
});

// =============================================================================
// Bootstrap digest report — consolidated from bootstrap-report.test.ts.
// =============================================================================

function brMakeRepo(): { repo: string; head: string } {
  const repo = makeTmpDir("trust-br-repo-");
  execFileSync("git", ["init", "-q", "-b", "main"], { cwd: repo });
  writeFix(repo, ".gitattributes", "* text=auto eol=lf\n");
  execFileSync("git", ["config", "user.email", "t@t"], { cwd: repo });
  execFileSync("git", ["config", "user.name", "t"], { cwd: repo });
  if (process.platform === "win32") {
    execFileSync("git", ["config", "core.longpaths", "true"], { cwd: repo });
  }
  const trustDir = "src/common/skills/repo-agentdev-integrity/trusted-distribution-gate";
  for (const f of ["types.ts", "cli.ts", "package.json", "bun.lock"]) {
    writeFix(repo, `${trustDir}/${f}`, `// ${f}\n`);
  }
  writeFix(repo, "scripts/self/release/trusted-distribution-gate.ps1", "# ps1\n");
  execFileSync("git", ["add", "-A"], { cwd: repo });
  execFileSync("git", ["commit", "-q", "-m", "init"], { cwd: repo });
  return { repo, head: headOid(repo) };
}

describe("bootstrap-report", () => {
  test("emits present entries with sha256 for files at the OID", () => {
    const { repo, head } = brMakeRepo();
    try {
      const r = bootstrapDigestReport(repo, head);
      expect(r.ok).toBe(false);
      expect(r.oid).toBe(head);
      expect(r.entries.length).toBeGreaterThan(0);
      const ps1 = r.entries.find((e) => e.path === "scripts/self/release/trusted-distribution-gate.ps1");
      expect(ps1?.status).toBe("present");
      expect(ps1?.sha256).toMatch(/^[0-9a-f]{64}$/);
    } finally {
      disposeRepo(repo);
    }
  }, 60000);

  test("rejects invalid OID with ok=false", () => {
    const { repo } = brMakeRepo();
    try {
      const r = bootstrapDigestReport(repo, "not-a-real-oid");
      expect(r.ok).toBe(false);
      expect(r.entries).toEqual([]);
    } finally {
      disposeRepo(repo);
    }
  }, 60000);
});

// =============================================================================
// Protected paths — consolidated from protected-paths.test.ts and
// protected-paths-complete.test.ts (representative cases).
// =============================================================================

describe("protected-paths / direct paths and predicates", () => {
  test("includes the trusted launcher entry script and Stage A scripts", () => {
    expect(TRUST_ROOT_DIRECT_PATHS).toContain("scripts/self/release/trusted-distribution-gate.ps1");
    expect(TRUST_ROOT_DIRECT_PATHS).toContain("scripts/install.ps1");
    expect(TRUST_ROOT_DIRECT_PATHS).toContain("scripts/consumer/common.ps1");
    expect(TRUST_ROOT_DIRECT_PATHS).not.toContain("scripts/consumer/archive/install.ps1");
    expect(TRUST_ROOT_DIRECT_PATHS).not.toContain("scripts/self/release/package-release-archive.ps1");
  });

  test("includes trust-root runtime helpers and CLI entry", () => {
    const dir = "src/common/skills/repo-agentdev-integrity/trusted-distribution-gate";
    expect(TRUST_ROOT_DIRECT_PATHS).toContain(`${dir}/blob-loader.ts`);
    expect(TRUST_ROOT_DIRECT_PATHS).toContain(`${dir}/boundary-runner.ts`);
    expect(TRUST_ROOT_DIRECT_PATHS).toContain(`${dir}/protected-check.ts`);
    expect(TRUST_ROOT_DIRECT_PATHS).toContain(`${dir}/cli.ts`);
    expect(TRUST_ROOT_DIRECT_PATHS).toContain(`${dir}/bun.lock`);
  });

  test("does not protect test files", () => {
    const testFiles = TRUST_ROOT_DIRECT_PATHS.filter((p) => p.endsWith(".test.ts"));
    expect(testFiles).toEqual([]);
  });

  test("listAllProtectedPaths merges and dedupes direct/import paths", () => {
    const set: ProtectedPathSet = {
      direct_paths: ["a.ts", "b.ts"],
      import_paths: ["b.ts", "c.ts"],
    };
    expect([...listAllProtectedPaths(set)].sort()).toEqual(["a.ts", "b.ts", "c.ts"]);
    expect(listAllProtectedPaths(DEFAULT_PROTECTED_PATH_SET)).toContain(
      "scripts/self/release/trusted-distribution-gate.ps1",
    );
  });

  test("isProtectedPath matches slash styles and rejects traversal", () => {
    const set: ProtectedPathSet = {
      direct_paths: ["scripts/foo.ps1"],
      import_paths: [],
    };
    expect(isProtectedPath("scripts\\foo.ps1", set)).toBe(true);
    expect(isProtectedPath("../scripts/foo.ps1", set)).toBe(false);
    expect(isProtectedPath("scripts/../scripts/foo.ps1", set)).toBe(false);
  });

  test("every non-test runtime module on disk is protected (fail-closed coverage)", () => {
    const REPO_ROOT = LAUNCHER_REPO_ROOT;
    const trustAbs = path.join(REPO_ROOT, "src/common/skills/repo-agentdev-integrity/trusted-distribution-gate");
    const onDisk = new Set<string>();
    for (const ent of fs.readdirSync(trustAbs, { withFileTypes: true })) {
      if (!ent.isFile() || !ent.name.endsWith(".ts")) continue;
      if (ent.name.endsWith(".test.ts") || ent.name.endsWith(".test-worker.ts") || ent.name.endsWith(".d.ts")) continue;
      onDisk.add(ent.name);
    }
    const protectedSet = new Set(
      listAllProtectedPaths(DEFAULT_PROTECTED_PATH_SET)
        .filter((p) => p.startsWith("src/common/skills/repo-agentdev-integrity/trusted-distribution-gate/"))
        .map((p) => path.basename(p)),
    );
    const missing: string[] = [];
    for (const f of onDisk) {
      if (!protectedSet.has(f)) missing.push(f);
    }
    expect(missing).toEqual([]);
  });
});

// =============================================================================
// Launcher boundary/manifest/projection/archive — consolidated from
// launcher-extra.test.ts (representative cases).
// =============================================================================

describe("launcher / boundary violation", () => {
  test("rejects producer-internal concrete ID in candidate source (exit 4)", () => {
    const repo = makeFixtureRepo();
    try {
      const base = headOid(repo);
      const candidate = commitTweak(
        repo,
        "src/common/skills/agentdev-foo/SKILL.md",
        "# foo skill references ADR-9999 which is a violation\n",
      );
      expect(runLauncher(baseOpts(repo, base, candidate, "out-boundary")).exit_code).toBe(4);
    } finally {
      disposeRepo(repo);
    }
  }, 60000);

  test("rejects unclassified ID family (fail-closed, exit 7)", () => {
    const repo = makeFixtureRepo();
    try {
      const base = headOid(repo);
      const candidate = commitTweak(
        repo,
        "src/common/skills/agentdev-foo/SKILL.md",
        "# foo skill references JIRA-123 unknown family\n",
      );
      expect(runLauncher(baseOpts(repo, base, candidate, "out-unclassified")).exit_code).toBe(7);
    } finally {
      disposeRepo(repo);
    }
  }, 60000);

  test("rejects producer-internal URL in archive extra README-INSTALL.md (exit 4)", () => {
    const repo = makeFixtureRepo();
    try {
      const base = headOid(repo);
      const candidate = commitTweak(
        repo,
        "README-INSTALL.md",
        "# Bad: see https://github.com/yogata/agent-dev-flow/blob/main/docs/secret.md\n",
      );
      expect(runLauncher(baseOpts(repo, base, candidate, "out-boundary-extra")).exit_code).toBe(4);
    } finally {
      disposeRepo(repo);
    }
  }, 60000);
});

describe("launcher / canonical projection labels and counts", () => {
  test("manifests record the four projection labels and scanned entry counts", () => {
    const repo = makeFixtureRepo();
    try {
      const head = headOid(repo);
      const result = runLauncher(baseOpts(repo, head, head, "out-projections"));
      expect(result.exit_code).toBe(0);
      const labels = (Object.keys(result.manifests) as Projection[]).sort();
      expect(labels).toEqual(["archive", "archive-installed", "link", "source"]);
      for (const label of labels) {
        expect(result.manifests[label]?.projection).toBe(label);
      }
      expect(result.manifests["source"].entries.length).toBe(7);
      expect(result.manifests["archive"].entries.length).toBe(5);
      expect(result.manifests["link"].entries.length).toBe(3);
      expect(result.manifests["archive-installed"].entries.length).toBe(3);
      expect(result.boundary_results.length).toBe(4);
      for (const r of result.boundary_results) {
        expect(["archive", "archive-installed", "link", "source"]).toContain(r.projection);
      }
    } finally {
      disposeRepo(repo);
    }
  }, 60000);
});

describe("launcher / pre-existing final archive preservation", () => {
  test("does NOT overwrite pre-existing final archive (exit 3)", () => {
    const repo = makeFixtureRepo();
    try {
      const head = headOid(repo);
      const opts = baseOpts(repo, head, head, "out-preexisting");
      const finalPath = path.join(opts.output_dir, `agentdev-release-${head.substring(0, 8)}.zip`);
      fs.writeFileSync(finalPath, "PRE-EXISTING");
      const result = runLauncher(opts);
      expect(result.exit_code).toBe(3);
      expect(fs.readFileSync(finalPath, "utf-8")).toBe("PRE-EXISTING");
    } finally {
      disposeRepo(repo);
    }
  }, 60000);
});

// =============================================================================
// Bootstrap / same-output / publish ordering — consolidated from
// launcher-regression.test.ts and launcher-blockers.test.ts (representative
// cases).
// =============================================================================

function regOpts(repo: string, base: string, candidate: string, outName: string, extra?: Partial<LauncherOptions>): LauncherOptions {
  return {
    repo_root: repo,
    base_oid: base,
    candidate_oid: candidate,
    output_dir: makeTmpDir(`trust-reg-${outName}-`),
    repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
    ...extra,
  };
}

function makePreBootstrapRepo(installerBody: readonly string[]): string {
  const repo = makeTmpDir("trust-boot-repo-");
  writeFix(repo, ".gitattributes", "* text=auto eol=lf\n");
  execFileSync("git", ["init", "-q", "-b", "main"], { cwd: repo });
  execFileSync("git", ["config", "user.email", "t@t"], { cwd: repo });
  execFileSync("git", ["config", "user.name", "t"], { cwd: repo });
  if (process.platform === "win32") {
    execFileSync("git", ["config", "core.longpaths", "true"], { cwd: repo });
  }
  writeFix(repo, "src/common/commands/agentdev/case-run.md", "# case-run\n");
  writeFix(repo, "src/common/skills/agentdev-foo/SKILL.md", "# foo\n");
  writeFix(repo, "src/common/skills/japanese-tech-writing/SKILL.md", "# jtw\n");
  writeFix(repo, "scripts/install.ps1", "# install\n");
  writeFix(repo, "scripts/consumer/common.ps1", "# check\n");
  writeFix(repo, "scripts/consumer/install-sync-common.ps1", "# shared\n");
  writeFix(repo, "scripts/consumer/distribution-exclusion.ps1", "# canon\n");
  writeFix(repo, "scripts/consumer/archive/install.ps1", [...installerBody, ""].join("\n"));
  writeFix(repo, "README-INSTALL.md", "# install readme\n");
  writeFix(repo, "scripts/self/release/package-release-archive.ps1", "# placeholder\n");
  execFileSync("git", ["add", "-A"], { cwd: repo });
  execFileSync("git", ["commit", "-q", "-m", "pre-bootstrap"], { cwd: repo });
  return repo;
}

const WORKING_INSTALLER = [
  "[CmdletBinding()]",
  "param(",
  "  [Parameter(Mandatory=$true)][string]$Source,",
  "  [Parameter(Mandatory=$true)][string]$Target,",
  "  [Parameter(Mandatory=$true)][ValidateSet('copy')][string]$Mode",
  ")",
  "$ErrorActionPreference='Stop'",
  "function Place($src,$dst){ $p=Split-Path -Parent $dst; if(-not(Test-Path $p)){New-Item -ItemType Directory -Path $p -Force|Out-Null} Copy-Item -LiteralPath $src -Destination $dst -Force }",
  "$common=Join-Path $Source 'common'",
  "$cmds=Join-Path $common 'commands\\agentdev'; $skills=Join-Path $common 'skills'",
  "$cDst=Join-Path $Target 'commands\\agentdev'; $sDst=Join-Path $Target 'skills'",
  "New-Item -ItemType Directory -Path $cDst -Force|Out-Null",
  "New-Item -ItemType Directory -Path $sDst -Force|Out-Null",
  "Get-ChildItem -LiteralPath $cmds -Recurse -File | ForEach-Object { $r=$_.FullName.Substring($cmds.Length).TrimStart('\\','/'); Place $_.FullName (Join-Path $cDst $r) }",
  "Get-ChildItem -LiteralPath $skills -Directory | Where-Object { $_.Name -like 'agentdev-*' -or $_.Name -eq 'japanese-tech-writing' } | ForEach-Object { Get-ChildItem -LiteralPath $_.FullName -Recurse -File | ForEach-Object { $r=$_.FullName.Substring($skills.Length).TrimStart('\\','/'); Place $_.FullName (Join-Path $sDst $r) } }",
  "exit 0",
];

function addTrustRoot(repo: string): string {
  const trustDir = "src/common/skills/repo-agentdev-integrity/trusted-distribution-gate";
  const trustAbs = path.join(LAUNCHER_REPO_ROOT, trustDir);
  for (const ent of fs.readdirSync(trustAbs, { withFileTypes: true })) {
    if (!ent.isFile() || !ent.name.endsWith(".ts")) continue;
    if (ent.name.endsWith(".test.ts") || ent.name.endsWith(".test-worker.ts") || ent.name.endsWith(".d.ts")) continue;
    writeFix(repo, `${trustDir}/${ent.name}`, `// ${ent.name}\n`);
  }
  for (const f of ["tsconfig.json", "package.json", "bun.lock", ".gitignore"]) {
    writeFix(repo, `${trustDir}/${f}`, `# ${f}\n`);
  }
  writeFix(repo, "scripts/self/release/trusted-distribution-gate.ps1", "# placeholder\n");
  execFileSync("git", ["add", "-A"], { cwd: repo });
  execFileSync("git", ["commit", "-q", "-m", "add trust root"], { cwd: repo });
  return headOid(repo);
}

describe("launcher / first-bootstrap", () => {
  test("seed mode succeeds when base has no trust-root files and candidate adds them", () => {
    const repo = makePreBootstrapRepo(WORKING_INSTALLER);
    try {
      const base = headOid(repo);
      const candidate = addTrustRoot(repo);
      const result = runLauncher(regOpts(repo, base, candidate, "first-bootstrap", { bootstrap_mode: true }));
      expect(result.exit_code).toBe(0);
      expect(result.archive_path).toBeTruthy();
      expect(fs.existsSync(result.archive_path ?? "")).toBe(true);
    } finally {
      disposeRepo(repo);
    }
  }, 120000);

  test("seed mode treats boundary violations as evidence (non-fatal)", () => {
    const repo = makeFixtureRepo();
    try {
      const base = headOid(repo);
      const candidate = commitTweak(
        repo,
        "src/common/skills/agentdev-foo/SKILL.md",
        "# foo references ADR-9999 producer-internal in seed mode\n",
      );
      const result = runLauncher(regOpts(repo, base, candidate, "seed-boundary", { bootstrap_mode: true }));
      expect(result.exit_code).toBe(0);
      expect(result.summary.find((s) => s.includes("seed-mode-evidence"))).toBeTruthy();
    } finally {
      disposeRepo(repo);
    }
  }, 60000);

  test("two serial runs against the SAME output: exactly one wins, one fails without corruption", () => {
    const repo = makeFixtureRepo();
    try {
      const head = headOid(repo);
      const sharedOut = makeTmpDir("trust-conc-same-out-");
      const o: LauncherOptions = {
        repo_root: repo, base_oid: head, candidate_oid: head, output_dir: sharedOut,
        repository_identity: { owner_slash_name: "yogata/agent-dev-flow", default_branch: "main" },
      };
      const r1 = runLauncher(o);
      const r2 = runLauncher(o);
      expect([r1.exit_code, r2.exit_code].sort()).toEqual([0, 3]);
      const expectedName = `agentdev-release-${head.substring(0, 8)}.zip`;
      expect(fs.existsSync(path.join(sharedOut, expectedName))).toBe(true);
      expect(fs.readdirSync(sharedOut)).toEqual([expectedName]);
    } finally {
      disposeRepo(repo);
    }
  }, 120000);
});

describe("launcher / publish-after-verify ordering", () => {
  test("when physical archive-installed verify fails, NO final archive is published", () => {
    const repo = makePreBootstrapRepo([
      "[CmdletBinding()]",
      "param([string]$Source,[string]$Target,[string]$Mode)",
      "Write-Host 'intentional installer failure'",
      "exit 5",
    ]);
    try {
      const base = headOid(repo);
      const candidate = addTrustRoot(repo);
      const o = regOpts(repo, base, candidate, "publish-after-verify", { bootstrap_mode: true });
      const finalPath = path.join(o.output_dir, `agentdev-release-${candidate.substring(0, 8)}.zip`);
      const result = runLauncher(o);
      expect(result.exit_code).not.toBe(0);
      expect(fs.existsSync(finalPath)).toBe(false);
      const leftovers = fs.readdirSync(o.output_dir).filter((n) => !n.startsWith("."));
      expect(leftovers).toEqual([]);
    } finally {
      disposeRepo(repo);
    }
  }, 120000);
});

describe("launcher / staging and publication primitives", () => {
  test("staging path is created UNDER outputRoot; publication leaves no residue", () => {
    const outputRoot = makeTmpDir("trust-stage-root-");
    const blobs = [{ archivePath: "a.md", bytes: new TextEncoder().encode("# a\n") }];
    const finalPath = path.join(outputRoot, "final.zip");
    publishStagedArchive(prepareStagedArchive(blobs, outputRoot), finalPath, outputRoot);
    expect(fs.existsSync(finalPath)).toBe(true);
    expect(fs.readdirSync(outputRoot)).toEqual(["final.zip"]);
  }, 30000);

  test("publication primitive is linkSync (atomic no-overwrite)", () => {
    const src = fs.readFileSync(path.join(import.meta.dir, "archive-publish.ts"), "utf-8");
    expect(src).not.toContain("EXDEV");
    expect(src).not.toMatch(/cross-device/i);
    expect(src).not.toMatch(/copyFileSync/);
    expect(src).toMatch(/fs\.linkSync\(/);
    const publishBody = src.split("export function publishStagedArchive")[1] ?? "";
    expect(publishBody).not.toMatch(/fs\.renameSync/);
  });

  test("checkProtectedPaths spawns a bounded number of git subprocesses", () => {
    const repo = makeFixtureRepo();
    try {
      const head = headOid(repo);
      let spawnCount = 0;
      const wrappedAdapter = {
        cwd: repo,
        spawnGit(args: readonly string[]): Buffer {
          spawnCount++;
          return execFileSync("git", [...args], { cwd: repo, maxBuffer: 256 * 1024 * 1024 }) as Buffer;
        },
        spawnGitWithInput(args: readonly string[], input: Buffer): Buffer {
          spawnCount++;
          return execFileSync("git", [...args], { cwd: repo, maxBuffer: 256 * 1024 * 1024, input }) as Buffer;
        },
      };
      const before = spawnCount;
      const r = checkProtectedPaths(wrappedAdapter, assertGitOid(head), assertGitOid(head));
      const during = spawnCount - before;
      expect(r.kind).toBe("ok");
      expect(during).toBeLessThanOrEqual(2);
    } finally {
      disposeRepo(repo);
    }
  }, 60000);
});

// mkdtemp の作業フォルダーは使い捨てのため、この試験ファイルの終わりに自分の接頭辞の物を掃く。
import { afterAll } from "bun:test";
import * as cleanupFs from "node:fs";
import * as cleanupOs from "node:os";
import * as cleanupPath from "node:path";

afterAll(() => {
  const prefixes = [
    "trust-test-",
    "trust-br-repo-",
    "trust-reg-",
    "trust-boot-repo-",
    "trust-conc-same-out-",
    "trust-stage-root-",
  ];
  const tmp = cleanupOs.tmpdir();
  for (const entry of cleanupFs.readdirSync(tmp)) {
    if (!prefixes.some((p) => entry.startsWith(p))) continue;
    cleanupFs.rmSync(cleanupPath.join(tmp, entry), { recursive: true, force: true });
  }
});
