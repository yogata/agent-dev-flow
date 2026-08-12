<#
.SYNOPSIS
    Stage A trust-root distribution gate launcher.

.DESCRIPTION
    Trusted entry point that inspects an immutable candidate Git OID WITHOUT
    executing candidate code. Invokes the protected TypeScript CLI
    (cli.ts) via `bun` with array-form arguments (no shell interpolation,
    no temporary script files).

    The launcher runs under $ErrorActionPreference='Stop'. Failures exit with
    stable documented codes. Guard clauses use [Console]::Error.WriteLine +
    `exit <code>` rather than `Write-Error` so that the exact exit code is
    preserved (Write-Error would be promoted to a terminating error and
    produce exit 1 regardless of the documented code).

.PARAMETER BaseOid
    Trusted baseline Git OID (40-char SHA-1 or 64-char SHA-256 hex).

.PARAMETER CandidateOid
    Candidate Git OID being inspected. Must be immutable.

.PARAMETER RepoRoot
    Absolute path to the repository root (.git lives here).

.PARAMETER OutputDir
    Absolute path to the output directory for the final archive. Must be
    trusted; the launcher refuses to write archives outside this root.

.PARAMETER RepositoryIdentity
    Producer repository identity in `owner/name` form (e.g. `yogata/agent-dev-flow`).
    Used to classify producer-fixed URLs.

.PARAMETER DefaultBranch
    Default branch name used in producer URLs (default: `main`).

.PARAMETER BootstrapMode
    Switch. Permits trust-root files that exist at candidate but not at base
    (the bootstrap-PR case). The output still records the asymmetry.

.PARAMETER BootstrapReport
    Switch. Emits a JSON digest report of trust-root files at -BaseOid and
    exits, WITHOUT running the launcher pipeline. For PR review evidence.

.OUTPUTS
    JSON result on stdout (LauncherResult or BootstrapReport).

.NOTES
    Exit codes (stable under $ErrorActionPreference='Stop'):
        0  Ok                         — archive published, all checks passed
        1  ProtectedPathViolation     — trust-root file modified/deleted/added
        2  ManifestMismatch           — required manifest entry missing
        3  DigestMismatch             — archive-installed digest mismatch or
                                        pre-existing final archive collision
        4  BoundaryViolation          — producer-internal reference detected
        5  PathSafetyViolation        — symlink/gitlink/unknown mode/traversal
        6  EncodingViolation          — invalid UTF-8 / NUL byte in text artifact
        7  UnclassifiedEntry          — unknown ID family / adapter failure
        8  InputContract              — invalid OID / missing repository identity
        9  Unexpected                 — any uncaught exception (fail-closed)
#>

#Requires -Version 7.0

[CmdletBinding()]
param(
    [string]$BaseOid,
    [string]$CandidateOid,
    [string]$RepoRoot,
    [string]$OutputDir,
    [string]$RepositoryIdentity,
    [string]$DefaultBranch = 'main',
    [switch]$BootstrapMode,
    [switch]$BootstrapReport
)

$ErrorActionPreference = 'Stop'

# Resolve the protected CLI entry next to this script. We do NOT honor any
# override path: the CLI must be the committed protected file.
$cliTs = Join-Path $PSScriptRoot '..\.opencode\skills\repo-agentdev-integrity\scripts\trusted-distribution-gate\cli.ts'
if (-not (Test-Path -LiteralPath $cliTs)) {
    [Console]::Error.WriteLine("trusted-distribution-gate: protected cli.ts missing at $cliTs")
    exit 9
}
$cliTs = (Resolve-Path -LiteralPath $cliTs).Path

# Build argument array. Array form: each path/value is passed to bun as a
# literal argv element, so metacharacters in user input cannot inject shell
# commands (parent defect #2).
$bunArgs = [System.Collections.Generic.List[string]]::new()
$bunArgs.Add($cliTs)

if ($BootstrapReport) {
    if (-not $BaseOid) {
        [Console]::Error.WriteLine('trusted-distribution-gate: -BootstrapReport requires -BaseOid')
        exit 8
    }
    if (-not $RepoRoot) {
        [Console]::Error.WriteLine('trusted-distribution-gate: -BootstrapReport requires -RepoRoot')
        exit 8
    }
    $bunArgs.Add('--bootstrap-report')
    $bunArgs.Add($BaseOid)
    $bunArgs.Add('--repo-root')
    $bunArgs.Add($RepoRoot)
} else {
    # Required-argument guard: explicit error + exact exit code (do NOT use
    # Write-Error which would be promoted to a terminating error and force
    # exit 1 regardless of the documented exit code).
    foreach ($pair in @(
        @('-BaseOid', $BaseOid),
        @('-CandidateOid', $CandidateOid),
        @('-RepoRoot', $RepoRoot),
        @('-OutputDir', $OutputDir),
        @('-RepositoryIdentity', $RepositoryIdentity)
    )) {
        if (-not $pair[1]) {
            [Console]::Error.WriteLine("trusted-distribution-gate: missing required parameter $($pair[0])")
            exit 8
        }
    }
    if (-not (Test-Path -LiteralPath $RepoRoot)) {
        [Console]::Error.WriteLine("trusted-distribution-gate: RepoRoot does not exist: $RepoRoot")
        exit 8
    }
    if (-not (Test-Path -LiteralPath $OutputDir)) {
        New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    }
    $bunArgs.Add('--base-oid');       $bunArgs.Add($BaseOid)
    $bunArgs.Add('--candidate-oid');  $bunArgs.Add($CandidateOid)
    $bunArgs.Add('--repo-root');      $bunArgs.Add($RepoRoot)
    $bunArgs.Add('--output-dir');     $bunArgs.Add($OutputDir)
    $bunArgs.Add('--repository-identity'); $bunArgs.Add($RepositoryIdentity)
    $bunArgs.Add('--default-branch'); $bunArgs.Add($DefaultBranch)
    if ($BootstrapMode) { $bunArgs.Add('--bootstrap-mode') }
}

# Invoke bun directly. The exit code from bun is the launcher's exit code.
# Stdout/stderr are passed through verbatim.
& bun @bunArgs
exit $LASTEXITCODE
