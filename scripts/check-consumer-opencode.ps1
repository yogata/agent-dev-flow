#Requires -Version 7.0
<#
.SYNOPSIS
    Check consumer repository AgentDevFlow installation status.

.DESCRIPTION
    Verifies that the consumer repository's AgentDevFlow installation is healthy:
    - .agentdev-plugin/ exists and is a git repository
    - All expected junctions exist and point to correct targets
    - Reports divergences

    No apply mode is provided. Use install-consumer-opencode.ps1 -Mode apply to fix issues.

.PARAMETER PluginDir
    Directory name for the agent-dev-flow checkout (default: .agentdev-plugin).

.EXAMPLE
    ./scripts/check-consumer-opencode.ps1
    ./scripts/check-consumer-opencode.ps1 -PluginDir .agentdev-plugin
#>

param(
    [string]$PluginDir = '.agentdev-plugin'
)

$ErrorActionPreference = 'Stop'
$RepoRoot = $PWD.Path
$PluginPath = Join-Path $RepoRoot $PluginDir
$SourceDir = Join-Path $PluginPath 'src\opencode'
$ProjectionDir = Join-Path $RepoRoot '.opencode'
$CommandsDir = Join-Path $ProjectionDir 'commands'
$SkillsDir = Join-Path $ProjectionDir 'skills'

# --- Helper Functions ---

function Test-Junction {
    param([string]$Path)
    $item = Get-Item -LiteralPath $Path -Force -ErrorAction SilentlyContinue
    if (-not $item) { return $false }
    return $item.Attributes -band [System.IO.FileAttributes]::ReparsePoint
}

function Get-JunctionTarget {
    param([string]$Path)
    $item = Get-Item -LiteralPath $Path -Force -ErrorAction SilentlyContinue
    if (-not $item) { return $null }
    if (-not ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint)) { return $null }
    return $item.Target
}

# --- Main ---

Write-Host '=== Consumer Install Status Check ==='
$divergences = 0

# 1. Plugin checkout
if (-not (Test-Path -LiteralPath $PluginPath)) {
    Write-Host "[DIVERGENCE] $PluginDir does not exist (run install-consumer-opencode.ps1 -Mode apply)"
    $divergences++
} elseif (-not (Test-Path -LiteralPath (Join-Path $PluginPath '.git'))) {
    Write-Host "[DIVERGENCE] $PluginDir exists but is not a git repository"
    $divergences++
} else {
    Write-Host "[OK] $PluginDir is a git repository"
    # Show current commit
    Push-Location -LiteralPath $PluginPath
    try {
        $commit = git rev-parse --short HEAD 2>$null
        $branch = git rev-parse --abbrev-ref HEAD 2>$null
        Write-Host "[INFO] Checkout: $branch ($commit)"
    }
    finally {
        Pop-Location
    }
}

# 2. Source directory
if (-not (Test-Path -LiteralPath $SourceDir)) {
    Write-Host "[DIVERGENCE] Source directory not found: $PluginDir/src/opencode/"
    $divergences++
} else {
    Write-Host "[OK] Source directory exists: $PluginDir/src/opencode/"
}

# 3. .opencode/ status
if (-not (Test-Path -LiteralPath $ProjectionDir)) {
    Write-Host '[DIVERGENCE] .opencode/ does not exist'
    $divergences++
} elseif (Test-Junction -Path $ProjectionDir) {
    Write-Host '[DIVERGENCE] .opencode/ is a junction (must be real directory)'
    $divergences++
} else {
    Write-Host '[OK] .opencode/ is a real directory'
}

# 4. Parent directories
if (Test-Path -LiteralPath $ProjectionDir) {
    foreach ($parentRel in @('commands', 'skills')) {
        $parentPath = Join-Path $ProjectionDir $parentRel
        if (-not (Test-Path -LiteralPath $parentPath)) {
            Write-Host "[DIVERGENCE] .opencode/$parentRel/ does not exist"
            $divergences++
        } elseif (Test-Junction -Path $parentPath) {
            Write-Host "[DIVERGENCE] .opencode/$parentRel/ is a junction (must be real directory)"
            $divergences++
        } else {
            Write-Host "[OK] .opencode/$parentRel/ is a real directory"
        }
    }
}

# 5. Junction checks
if (Test-Path -LiteralPath $SourceDir) {
    # Enumerate expected targets from source
    $targets = [System.Collections.Generic.List[string]]::new()

    $cmdSource = Join-Path $SourceDir 'commands\agentdev'
    if (Test-Path -LiteralPath $cmdSource) {
        $targets.Add('commands\agentdev')
    }

    $skillsSource = Join-Path $SourceDir 'skills'
    if (Test-Path -LiteralPath $skillsSource) {
        Get-ChildItem -LiteralPath $skillsSource -Directory -Filter 'agentdev-*' |
            ForEach-Object { $targets.Add("skills\$($_.Name)") }
    }

    Write-Host ''
    Write-Host '--- Junction checks ---'

    foreach ($relPath in ($targets | Sort-Object)) {
        $targetPath = Join-Path $ProjectionDir $relPath
        $expectedSource = Join-Path $SourceDir $relPath

        if (-not (Test-Path -LiteralPath $targetPath)) {
            Write-Host "[DIVERGENCE] Missing junction: $relPath"
            $divergences++
        } elseif (Test-Junction -Path $targetPath) {
            $actualTarget = Get-JunctionTarget -Path $targetPath
            if ($actualTarget -and (Test-Path -LiteralPath $actualTarget) -and ((Resolve-Path -LiteralPath $actualTarget).Path -eq (Resolve-Path -LiteralPath $expectedSource).Path)) {
                Write-Host "[OK] Junction: $relPath -> $actualTarget"
            } else {
                Write-Host "[DIVERGENCE] Broken junction: $relPath (expected: $expectedSource, actual: $actualTarget)"
                $divergences++
            }
        } else {
            Write-Host "[DIVERGENCE] Exists but not a junction: $relPath"
            $divergences++
        }
    }

    # 6. Orphan detection (agentdev-* junctions that don't match source)
    Write-Host ''
    Write-Host '--- Orphan junctions ---'
    $orphansFound = $false
    foreach ($parentRel in @('commands', 'skills')) {
        $parentPath = Join-Path $ProjectionDir $parentRel
        if (-not (Test-Path -LiteralPath $parentPath)) { continue }
        Get-ChildItem -LiteralPath $parentPath -Directory -Force |
            Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint } |
            ForEach-Object {
                $junctionRel = "$parentRel\$($_.Name)"
                if ($junctionRel -notin $targets) {
                    Write-Host "[ORPHAN] Junction not from current source: $junctionRel"
                    $orphansFound = $true
                }
            }
    }
    if (-not $orphansFound) {
        Write-Host '[OK] No orphan junctions detected'
    }
}

# Summary
Write-Host ''
if ($divergences -eq 0) {
    Write-Host 'Consumer install OK. All junctions are in sync.'
    exit 0
} else {
    Write-Host "$divergences divergence(s) detected. Run install-consumer-opencode.ps1 -Mode apply to fix."
    exit 1
}
