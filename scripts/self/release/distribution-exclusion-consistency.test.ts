// Consistency tests for the distribution exclusion canon (single-source
// exclusion across the consumer distribution entries) and the shared
// judgment module (unified judgments of the two public entries).
//
// Structural layer:
//   - the same-name judgment functions exist ONLY in the shared module
//     (scripts/consumer/install-sync-common.ps1) and in neither public
//     entry (duplicate-function elimination);
//   - both public entries dot-source the shared module and the canon; the
//     release packager and the archive installer reference the canon.
// Behavioral layer (pwsh probes, no junctions, disposable dirs only):
//   - the canon resolves through each entry's own resolution path and
//     yields the identical exclusion set everywhere (single derivation);
//   - the shared judgment functions return identical results for the same
//     rule under both entry configurations, and entry-specific
//     configuration (LocalMode redirect, new-install fallback) threads
//     through the module parameters.

import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { spawnSync } from "child_process";

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");
const INSTALL_PS1 = path.join(REPO_ROOT, "scripts", "install.ps1");
const SELF_SYNC_PS1 = path.join(REPO_ROOT, "scripts", "self-sync.ps1");
const RELEASE_PS1 = path.join(REPO_ROOT, "scripts", "self", "release", "package-release-archive.ps1");
const ARCHIVE_INSTALL_PS1 = path.join(REPO_ROOT, "scripts", "consumer", "archive", "install.ps1");
const SHARED_MODULE_PS1 = path.join(REPO_ROOT, "scripts", "consumer", "install-sync-common.ps1");
const CANON_PS1 = path.join(REPO_ROOT, "scripts", "consumer", "distribution-exclusion.ps1");
const CANON_REL = "scripts/consumer/distribution-exclusion.ps1";

function read(rel: string): string {
  return fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");
}

function countFunctionDefs(text: string, name: string): number {
  return (text.match(new RegExp(`^function\\s+${name}\\b`, "gm")) ?? []).length;
}

// The 15 same-name judgment functions previously duplicated by the two
// public entries, plus the entry-specific detection helpers that moved into
// the shared module.
const UNIFIED_FUNCTIONS = [
  "Test-Junction",
  "Get-JunctionTarget",
  "Test-JunctionTargetMatchesSource",
  "Resolve-SenpiTargetRel",
  "Get-HostsDisplay",
  "Get-DetectedHosts",
  "Test-HasSenpiManagedProjection",
  "Resolve-TargetHosts",
  "Get-TargetSourcePath",
  "Test-ManagedProjectionJunction",
  "Test-ManagedSenpiJunction",
  "Get-StaleManagedJunctions",
  "Get-UnmanagedProjectionJunctionRels",
  "New-PluginLoaderShimContent",
  "Show-RuntimeDiagnostics",
  "Get-ThirdPartyDeclaredNames",
  "Invoke-ThirdPartyDriftCheck",
] as const;

interface RunResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

function runPwshScript(script: string): RunResult {
  const r = spawnSync("pwsh", ["-NoProfile", "-NonInteractive", "-Command", script], {
    encoding: "utf-8",
  });
  return { exitCode: r.status ?? -1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

function makeTmpDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

describe("distribution exclusion canon / single-derivation structure", () => {
  test("consumer distribution entries reference the canon and define no inline exclusion list", () => {
    for (const rel of ["scripts/install.ps1", "scripts/self/release/package-release-archive.ps1", "scripts/consumer/archive/install.ps1"]) {
      const text = read(rel);
      expect(text).toContain("distribution-exclusion.ps1");
      expect(text).not.toMatch(/\$repoLocalPluginNames?\s*=\s*@\(/i);
    }
  });

  test("self-sync references the canon as the documented exception entry and filters nothing", () => {
    const sync = read("scripts/self-sync.ps1");
    expect(sync).toContain("distribution-exclusion.ps1");
    expect(sync).not.toMatch(/\$RepoLocalPluginNames\b.*-notin/);
    expect(sync).not.toContain("agentdev-textlint-guard");
  });

  test("the canon is the only definition of the exclusion set", () => {
    const canon = read("scripts/consumer/distribution-exclusion.ps1");
    const matches = canon.match(/\$RepoLocalPluginNames\s*=\s*@\(([^)]*)\)/);
    expect(matches).not.toBeNull();
    if (matches !== null) {
      const names = matches[1].split(",").map((s) => s.trim().replace(/^['"]|['"]$/g, "")).filter((s) => s.length > 0);
      expect(names).toEqual(["agentdev-distribution-boundary-guard"]);
    }
  });
});

describe("shared judgment module / duplicate elimination structure", () => {
  test("each unified judgment function is defined once in the module and in no public entry", () => {
    const moduleText = fs.readFileSync(SHARED_MODULE_PS1, "utf-8");
    const installText = fs.readFileSync(INSTALL_PS1, "utf-8");
    const syncText = fs.readFileSync(SELF_SYNC_PS1, "utf-8");
    for (const fn of UNIFIED_FUNCTIONS) {
      expect(countFunctionDefs(moduleText, fn)).toBe(1);
      expect(countFunctionDefs(installText, fn)).toBe(0);
      expect(countFunctionDefs(syncText, fn)).toBe(0);
    }
  });

  test("both public entries dot-source the shared module and the canon", () => {
    for (const rel of ["scripts/install.ps1", "scripts/self-sync.ps1"]) {
      const text = read(rel);
      expect(text).toContain("consumer\\install-sync-common.ps1");
      expect(text).toContain("consumer\\distribution-exclusion.ps1");
    }
  });
});

describe("distribution exclusion canon / resolution equality across entry contexts", () => {
  test("canon load yields the identical single-name set", () => {
    const r = runPwshScript(
      `$ErrorActionPreference='Stop'; . '${CANON_PS1.replace(/\\/g, "/")}'; (@($RepoLocalPluginNames) -join ',')`,
    );
    expect(r.exitCode).toBe(0);
    expect(r.stdout.trim()).toBe("agentdev-distribution-boundary-guard");
  });

  test("archive installer canon resolution hits the archive layout and the repository layout", () => {
    const archiveLayout = makeTmpDir("adf-canon-archive-");
    const repoLayout = makeTmpDir("adf-canon-repo-");
    try {
      // archive layout: canon staged next to the projected scripts/install.ps1
      fs.mkdirSync(path.join(archiveLayout, "scripts", "consumer"), { recursive: true });
      fs.copyFileSync(CANON_PS1, path.join(archiveLayout, "scripts", "consumer", "distribution-exclusion.ps1"));
      // repository layout: canon at scripts/consumer/ (installer original at scripts/consumer/archive/)
      fs.mkdirSync(path.join(repoLayout, "scripts", "consumer"), { recursive: true });
      fs.copyFileSync(CANON_PS1, path.join(repoLayout, "scripts", "consumer", "distribution-exclusion.ps1"));
      const snippet = (psRoot: string) => [
        `$ErrorActionPreference='Stop'`,
        `$found=$null`,
        `foreach ($c in @((Join-Path '${psRoot.replace(/\\/g, "/")}' 'consumer/distribution-exclusion.ps1'), (Join-Path '${psRoot.replace(/\\/g, "/")}' '../distribution-exclusion.ps1'))) { if (Test-Path -LiteralPath $c) { $found=$c; break } }`,
        `if ($null -eq $found) { exit 5 }`,
        `. $found`,
        `(@($RepoLocalPluginNames) -join ',')`,
      ].join("; ");
      const fromArchive = runPwshScript(snippet(path.join(archiveLayout, "scripts")));
      expect(fromArchive.exitCode).toBe(0);
      expect(fromArchive.stdout.trim()).toBe("agentdev-distribution-boundary-guard");
      const fromRepo = runPwshScript(snippet(path.join(repoLayout, "scripts", "consumer", "archive")));
      expect(fromRepo.exitCode).toBe(0);
      expect(fromRepo.stdout.trim()).toBe("agentdev-distribution-boundary-guard");
    } finally {
      fs.rmSync(archiveLayout, { recursive: true, force: true });
      fs.rmSync(repoLayout, { recursive: true, force: true });
    }
  });
});

describe("shared judgment module / judgment equality across entry configurations", () => {
  test("same rule returns the same result under consumer and self-host configurations", () => {
    const pluginRoot = "Z:/adf-nonexistent-plugin-checkout";
    const script = [
      `$ErrorActionPreference='Stop'`,
      `. '${SHARED_MODULE_PS1.replace(/\\/g, "/")}'`,
      `# consumer configuration (script scope mirrors the dot-source contract)`,
      `$CommonSourceDir = Join-Path '${pluginRoot}' 'src/common'`,
      `$OpencodeHostSourceDir = Join-Path '${pluginRoot}' 'src/opencode'`,
      `$SenpiHostSourceDir = Join-Path '${pluginRoot}' 'src/senpi'`,
      `$LegacyUnifiedSourceDir = Join-Path '${pluginRoot}' 'src/opencode'`,
      `$ProjectionDir = 'Z:/adf-nonexistent-oc'`,
      `$SenpiProjectionDir = 'Z:/adf-nonexistent-senpi'`,
      `$ProjectionParentRels = @('commands','skills','tools','plugins')`,
      `$LocalMode = $true`,
      `$LocalRedirectToolRel = 'tools\\agentdev-gh'`,
      `$LocalRedirectSourceDir = Join-Path '${pluginRoot}' 'src/common/tools/agentdev-gh/local'`,
      `$c1 = Get-TargetSourcePath -RelPath 'plugins\\agentdev-x' -LocalRedirectToolRel $LocalRedirectToolRel -LocalRedirectSourceDir $LocalRedirectSourceDir`,
      `$c2 = Get-TargetSourcePath -RelPath 'commands\\agentdev' -LocalRedirectToolRel $LocalRedirectToolRel -LocalRedirectSourceDir $LocalRedirectSourceDir`,
      `$c3 = Get-TargetSourcePath -RelPath 'tools\\agentdev-gh' -LocalRedirectToolRel $LocalRedirectToolRel -LocalRedirectSourceDir $LocalRedirectSourceDir`,
      `$c4 = Resolve-TargetHosts -ExplicitHosts 'senpi'`,
      `$c5 = Resolve-TargetHosts -ExplicitHosts $null -FallbackHosts @('opencode','senpi') -LocalRedirectToolRel $LocalRedirectToolRel -LocalRedirectSourceDir $LocalRedirectSourceDir`,
      `$c6 = Test-ManagedProjectionJunction -JunctionRel 'commands\\agentdev' -JunctionFullName 'Z:/adf-nope' -LocalRedirectToolRel $LocalRedirectToolRel -LocalRedirectSourceDir $LocalRedirectSourceDir`,
      `# self-host configuration (no LocalMode redirect, no legacy variable)`,
      `$LocalMode = $false`,
      `$LocalRedirectToolRel = ''`,
      `$LocalRedirectSourceDir = ''`,
      `$LegacyUnifiedSourceDir = $null`,
      `$s1 = Get-TargetSourcePath -RelPath 'plugins\\agentdev-x'`,
      `$s2 = Get-TargetSourcePath -RelPath 'commands\\agentdev'`,
      `$s4 = Resolve-TargetHosts -ExplicitHosts 'senpi'`,
      `$s6 = Test-ManagedProjectionJunction -JunctionRel 'commands\\agentdev' -JunctionFullName 'Z:/adf-nope'`,
      `[pscustomobject]@{`,
      `  pluginsConsumer = ($c1 -like '*src\\opencode\\plugins\\agentdev-x')`,
      `  pluginsSelf = ($s1 -like '*src\\opencode\\plugins\\agentdev-x')`,
      `  commandsConsumer = ($c2 -like '*src\\common\\commands\\agentdev')`,
      `  commandsSelf = ($s2 -like '*src\\common\\commands\\agentdev')`,
      `  localRedirect = ($c3 -like '*agentdev-gh\\local')`,
      `  explicitSenpiEqual = ((@($c4) -join ',') -eq (@($s4) -join ',') -and (@($c4) -join ',') -eq 'senpi')`,
      `  fallbackConsumer = ((@($c5) -join ',') -eq 'opencode,senpi')`,
      `  unmanagedBogusEqual = (($c6 -eq $false) -and ($s6 -eq $false))`,
      `} | ConvertTo-Json -Compress`,
    ].join("\n");
    const r = runPwshScript(script);
    expect(r.exitCode).toBe(0);
    const report = JSON.parse(r.stdout.trim());
    expect(report.pluginsConsumer).toBe(true);
    expect(report.pluginsSelf).toBe(true);
    expect(report.commandsConsumer).toBe(true);
    expect(report.commandsSelf).toBe(true);
    expect(report.localRedirect).toBe(true);
    expect(report.explicitSenpiEqual).toBe(true);
    expect(report.fallbackConsumer).toBe(true);
    expect(report.unmanagedBogusEqual).toBe(true);
  });
});
