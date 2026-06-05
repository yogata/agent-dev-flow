#Requires -Version 7.0
<#
.SYNOPSIS
    Sync .opencode/ projection with src/opencode/ source.

.DESCRIPTION
    Three modes:
    - dry-run : Show what would change without making changes
    - check   : Report divergence between source and projection
    - apply   : Sync projection to match source

.PARAMETER Mode
    One of: dry-run, check, apply

.EXAMPLE
    ./sync-opencode.ps1 -Mode dry-run
    ./sync-opencode.ps1 -Mode check
    ./sync-opencode.ps1 -Mode apply
#>

param(
    [Parameter(Mandatory)]
    [ValidateSet('dry-run', 'check', 'apply')]
    [string]$Mode
)

$ErrorActionPreference = 'Stop'
$RepoRoot = $PSScriptRoot
$SourceDir = Join-Path $RepoRoot 'src\opencode'
$ProjectionDir = Join-Path $RepoRoot '.opencode'

function Test-Junction {
    param([string]$Path)
    $item = Get-Item -LiteralPath $Path -Force -ErrorAction SilentlyContinue
    if (-not $item) { return $false }
    return $item.Attributes -band [System.IO.FileAttributes]::ReparsePoint
}

function Get-SourceFiles {
    param([string]$Base)
    Get-ChildItem -LiteralPath $Base -Recurse -File |
        ForEach-Object { $_.FullName.Substring($Base.Length).TrimStart('\','/') }
}

# --- Main ---

if (-not (Test-Path -LiteralPath $SourceDir)) {
    Write-Error "Source directory not found: $SourceDir"
    exit 1
}

# Check if .opencode is a junction
$isJunction = Test-Junction -Path $ProjectionDir

if ($Mode -eq 'check') {
    Write-Host "=== Sync Check: src/opencode/ <-> .opencode/ ==="
    $divergences = 0

    if ($isJunction) {
        Write-Host "[OK] .opencode/ is a junction (projection)"
    } else {
        Write-Host "[DIVERGENCE] .opencode/ is NOT a junction"
        $divergences++
    }

    if (-not $isJunction -and (Test-Path -LiteralPath $ProjectionDir)) {
        $sourceFiles = Get-SourceFiles -Base $SourceDir
        $projFiles = Get-SourceFiles -Base $ProjectionDir

        $onlyInSource = $sourceFiles | Where-Object { $_ -notin $projFiles }
        $onlyInProj = $projFiles | Where-Object { $_ -notin $sourceFiles }

        foreach ($f in $onlyInSource) {
            Write-Host "[DIVERGENCE] Only in source: $f"
            $divergences++
        }
        foreach ($f in $onlyInProj) {
            Write-Host "[DIVERGENCE] Only in projection: $f"
            $divergences++
        }
    }

    # Check for stale/broken symlinks
    if ($isJunction) {
        try {
            $null = Get-ChildItem -LiteralPath $ProjectionDir -ErrorAction Stop
            Write-Host "[OK] Junction target is accessible"
        } catch {
            Write-Host "[DIVERGENCE] Junction target is broken/stale"
            $divergences++
        }
    }

    Write-Host ""
    if ($divergences -eq 0) {
        Write-Host "No divergence detected. Source and projection are in sync."
    } else {
        Write-Host "$divergences divergence(s) detected."
    }
    exit $(if ($divergences -gt 0) { 1 } else { 0 })
}

if ($Mode -eq 'dry-run') {
    Write-Host "=== Dry Run: would sync src/opencode/ -> .opencode/ ==="

    if ($isJunction) {
        Write-Host "[INFO] .opencode/ is already a junction — no sync needed"
        Write-Host "[INFO] Junction transparently mirrors src/opencode/"
        exit 0
    }

    if (Test-Path -LiteralPath $ProjectionDir) {
        $sourceFiles = Get-SourceFiles -Base $SourceDir
        $projFiles = Get-SourceFiles -Base $ProjectionDir

        $onlyInSource = $sourceFiles | Where-Object { $_ -notin $projFiles }
        $onlyInProj = $projFiles | Where-Object { $_ -notin $sourceFiles }

        foreach ($f in $onlyInSource) {
            Write-Host "[WOULD ADD] $f"
        }
        foreach ($f in $onlyInProj) {
            Write-Host "[WOULD REMOVE] $f"
        }

        Write-Host ""
        Write-Host "[WOULD] Replace .opencode/ directory with junction -> src/opencode/"
    } else {
        Write-Host "[WOULD] Create junction .opencode/ -> src/opencode/"
    }
    exit 0
}

if ($Mode -eq 'apply') {
    Write-Host "=== Apply: syncing .opencode/ projection ==="

    if ($isJunction) {
        Write-Host "[OK] .opencode/ is already a junction — nothing to apply"
        exit 0
    }

    # Remove existing .opencode/ if it's a directory (not junction)
    if (Test-Path -LiteralPath $ProjectionDir) {
        Write-Host "[ACTION] Removing existing .opencode/ directory..."
        Remove-Item -LiteralPath $ProjectionDir -Recurse -Force
    }

    # Create junction
    Write-Host "[ACTION] Creating junction .opencode/ -> src/opencode/..."
    $srcRelative = "src\opencode"
    $result = cmd /c "mklink /J `"$ProjectionDir`" `"$srcRelative`" 2>&1"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create junction: $result"
        exit 1
    }
    Write-Host "[OK] Junction created: $result"

    # Verify
    if (Test-Junction -Path $ProjectionDir) {
        Write-Host "[OK] Verification: junction is functional"
    } else {
        Write-Error "Verification failed: .opencode/ is not a junction"
        exit 1
    }

    Write-Host ""
    Write-Host "Sync complete."
    exit 0
}
