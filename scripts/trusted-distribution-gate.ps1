<#
.SYNOPSIS
    Stage A trust-root distribution gate launcher.

.DESCRIPTION
    Trusted entry point that inspects an immutable candidate Git OID WITHOUT
    executing candidate code, rejects protected-path changes, builds and
    verifies the five canonical manifest sets (source-runtime, source-bootstrap,
    link, archive, archive-installed), runs the side-effect-free boundary
    detector, and publishes a ZIP archive only from candidate Git blobs.

    The launcher runs under $ErrorActionPreference='Stop'. Failures exit with
    stable documented codes. The launcher never imports code from the
    candidate tree; it only reads blobs via `git ls-tree -r -z` and
    `git cat-file blob <oid>:<path>`.

    Stage A counterpart to PR #2094 (Stage B in-process detector). This
    launcher is the trust root: it must remain runnable even when the
    candidate tree has been tampered with, because it never executes
    candidate code.

.PARAMETER BaseOid
    Trusted baseline Git OID (40-char SHA-1 or 64-char SHA-256 hex).

.PARAMETER CandidateOid
    Candidate Git OID being inspected. Must be immutable.

.PARAMETER RepoRoot
    Absolute path to the repository root (.git lives here).

.PARAMETER OutputDir
    Absolute path to the output directory for the final archive.

.PARAMETER RepositoryIdentity
    Producer repository identity in `owner/name` form (e.g. `yogata/agent-dev-flow`).
    Used to classify producer-fixed URLs.

.PARAMETER DefaultBranch
    Default branch name used in producer URLs (default: `main`).

.OUTPUTS
    JSON result on stdout with: exit_code, base_oid, candidate_oid, manifests,
    protected_paths, boundary_results, archive_path, summary.

.EXAMPLE
    ./scripts/trusted-distribution-gate.ps1
        -BaseOid 507d376d99da4eefccbe3c6a179745aff79a7c30
        -CandidateOid 83da2056a1b2c3d4...
        -RepoRoot C:\path\to\agent-dev-flow
        -OutputDir C:\path\to\dist
        -RepositoryIdentity yogata/agent-dev-flow

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
    [Parameter(Mandatory = $true)][string]$BaseOid,
    [Parameter(Mandatory = $true)][string]$CandidateOid,
    [Parameter(Mandatory = $true)][string]$RepoRoot,
    [Parameter(Mandatory = $true)][string]$OutputDir,
    [Parameter(Mandatory = $true)][string]$RepositoryIdentity,
    [string]$DefaultBranch = 'main'
)

$ErrorActionPreference = 'Stop'

$scriptRoot = $PSScriptRoot
$trustRootTs = Join-Path $scriptRoot '..\.opencode\skills\repo-agentdev-integrity\scripts\trusted-distribution-gate\launcher.ts'
$resolvedTrustRoot = (Resolve-Path -LiteralPath $trustRootTs).Path

if (-not (Test-Path -LiteralPath $resolvedTrustRoot)) {
    Write-Error "trusted-distribution-gate: launcher.ts missing at $resolvedTrustRoot"
    exit 9
}

if (-not (Test-Path -LiteralPath $RepoRoot)) {
    Write-Error "trusted-distribution-gate: RepoRoot does not exist: $RepoRoot"
    exit 8
}

if (-not (Test-Path -LiteralPath $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$argsArray = @(
    'eval',
    "--eval",
    @"
const m = await import(`"file:///$($resolvedTrustRoot -replace '\\','/')`");
const opts = {
  repo_root: $(ConvertTo-Json $RepoRoot),
  base_oid: $(ConvertTo-Json $BaseOid),
  candidate_oid: $(ConvertTo-Json $CandidateOid),
  output_dir: $(ConvertTo-Json $OutputDir),
  repository_identity: {
    owner_slash_name: $(ConvertTo-Json $RepositoryIdentity),
    default_branch: $(ConvertTo-Json $DefaultBranch),
  },
};
const result = m.runLauncher(opts);
console.log(JSON.stringify(result, null, 2));
process.exit(result.exit_code);
"@
)

try {
    $stdout = & bun @argsArray 2>&1
    $exit = $LASTEXITCODE
    Write-Output $stdout
    exit $exit
} catch {
    Write-Error "trusted-distribution-gate: launcher invocation failed: $($_.Exception.Message)"
    exit 9
}
