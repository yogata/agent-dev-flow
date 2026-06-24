#Requires -Version 7.0
<#
.SYNOPSIS
    Install AgentDevFlow runtime artifacts into a consumer repository.

.DESCRIPTION
    Three modes:
    - dry-run : Show what would change without making changes
    - check   : Report divergence between expected and actual state
    - apply   : Clone/update agent-dev-flow and create selective junctions

    Creates junctions for public runtime artifacts ONLY:
    - .opencode/commands/agentdev/  = junction -> .agentdev-plugin/src/opencode/commands/agentdev/
    - .opencode/skills/agentdev-*/  = individual junctions -> .agentdev-plugin/src/opencode/skills/agentdev-*/

    Does NOT touch repo-local commands/skills:
    - .opencode/commands/repo/      = real directory (repo-local only)
    - .opencode/skills/repo-*/      = real directories (repo-local only)

    -LocalMode redirects agentdev-gh-cli to the local OpenCode source:
    - skills/agentdev-gh-cli/       = junction -> .agentdev-plugin/src/opencode-local/agentdev-gh-cli/
    All other agentdev-* artifacts still link to src/opencode/ as normal.

.PARAMETER Mode
    One of: dry-run, check, apply

.PARAMETER LocalMode
    Switch. When set, agentdev-gh-cli is junctioned to src/opencode-local/agentdev-gh-cli/
    instead of src/opencode/skills/agentdev-gh-cli/. All other agentdev-* command/skill
    junctions target src/opencode/ as normal (REQ-0103-158, ADR-0131 decision #3).

.PARAMETER PluginDir
    Directory name for the agent-dev-flow checkout (default: .agentdev-plugin).
    This directory is created relative to the consumer repo root.

.PARAMETER RepoUrl
    Git remote URL for agent-dev-flow (default: https://github.com/yogata/agent-dev-flow.git)

.PARAMETER Branch
    Branch to checkout from agent-dev-flow (default: main)

.EXAMPLE
    ./scripts/install-consumer-opencode.ps1 -Mode dry-run
    ./scripts/install-consumer-opencode.ps1 -Mode check
    ./scripts/install-consumer-opencode.ps1 -Mode apply
    ./scripts/install-consumer-opencode.ps1 -Mode apply -PluginDir .agentdev-plugin
    ./scripts/install-consumer-opencode.ps1 -Mode apply -LocalMode
#>

param(
    [Parameter(Mandatory)]
    [ValidateSet('dry-run', 'check', 'apply')]
    [string]$Mode,

    [switch]$LocalMode,

    [string]$PluginDir = '.agentdev-plugin',

    [string]$RepoUrl = 'https://github.com/yogata/agent-dev-flow.git',

    [string]$Branch = 'main'
)

$ErrorActionPreference = 'Stop'
$RepoRoot = $PWD.Path
$PluginPath = Join-Path $RepoRoot $PluginDir
$SourceDir = Join-Path $PluginPath 'src\opencode'
$LocalSourceDir = Join-Path $PluginPath 'src\opencode-local'
$ProjectionDir = Join-Path $RepoRoot '.opencode'
$CommandsDir = Join-Path $ProjectionDir 'commands'
$SkillsDir = Join-Path $ProjectionDir 'skills'

# Repo-local patterns excluded from junction management
$RepoLocalCommandNames = @('repo')
$RepoLocalSkillPrefix = 'repo-'

# In LocalMode this skill is redirected from src/opencode-local/ (REQ-0103-158, ADR-0131 decision #3)
$LocalModeRedirectSkill = 'agentdev-gh-cli'

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

function Get-ConsumerJunctionTargets {
    <#
    .SYNOPSIS
        Enumerate all junction targets from .agentdev-plugin/src/opencode/.
        Returns sorted array of relative paths (relative to .opencode/) that should be junctioned.
    #>
    $targets = [System.Collections.Generic.List[string]]::new()

    # commands\agentdev
    $cmdSource = Join-Path $SourceDir 'commands\agentdev'
    if (Test-Path -LiteralPath $cmdSource) {
        $targets.Add('commands\agentdev')
    }

    # skills\agentdev-* (dynamic enumeration)
    $skillsSource = Join-Path $SourceDir 'skills'
    if (Test-Path -LiteralPath $skillsSource) {
        Get-ChildItem -LiteralPath $skillsSource -Directory -Filter 'agentdev-*' |
            ForEach-Object { $targets.Add("skills\$($_.Name)") }
    }

    return ($targets | Sort-Object)
}

function Get-TargetSourcePath {
    <#
    .SYNOPSIS
        Resolve the absolute source path backing a projection relative path.
        In LocalMode, skills\<LocalModeRedirectSkill> is redirected to
        src/opencode-local/<LocalModeRedirectSkill>/ (REQ-0103-158, ADR-0131 decision #3).
        All other targets back to src/opencode/ as normal.
    #>
    param([string]$RelPath)
    if ($LocalMode -and $RelPath -eq "skills\$LocalModeRedirectSkill") {
        return Join-Path $LocalSourceDir $LocalModeRedirectSkill
    }
    return Join-Path $SourceDir $RelPath
}

# --- Clone / Update ---

function Initialize-PluginCheckout {
    <#
    .SYNOPSIS
        Clone or update the agent-dev-flow repo into $PluginPath.
    #>
    if (Test-Path -LiteralPath (Join-Path $PluginPath '.git')) {
        Write-Host "[ACTION] Updating existing checkout: $PluginDir"
        Push-Location -LiteralPath $PluginPath
        try {
            git fetch origin
            git checkout $Branch
            git reset --hard "origin/$Branch"
        }
        finally {
            Pop-Location
        }
    } else {
        if (Test-Path -LiteralPath $PluginPath) {
            Write-Error "[ERROR] $PluginDir exists but is not a git repository. Remove it manually and retry."
            exit 1
        }
        Write-Host "[ACTION] Cloning agent-dev-flow into $PluginDir"
        git clone --branch $Branch --depth 1 $RepoUrl $PluginPath
        if ($LASTEXITCODE -ne 0) {
            Write-Error "[ERROR] Failed to clone agent-dev-flow"
            exit 1
        }
    }
}

# --- Main ---

# Clone/update first for all modes (need source to enumerate targets)
if ($Mode -ne 'check') {
    Initialize-PluginCheckout
}

if (-not (Test-Path -LiteralPath $SourceDir)) {
    Write-Error "[ERROR] Source directory not found: $SourceDir. Ensure $PluginDir contains agent-dev-flow checkout."
    exit 1
}

# LocalMode requires the local source redirect target to exist
if ($LocalMode) {
    $localRedirectSource = Join-Path $LocalSourceDir $LocalModeRedirectSkill
    if (-not (Test-Path -LiteralPath $localRedirectSource)) {
        Write-Error "[ERROR] LocalMode redirect source not found: $localRedirectSource. Ensure $PluginDir contains agent-dev-flow checkout with src/opencode-local/."
        exit 1
    }
}

$targets = Get-ConsumerJunctionTargets

# ============================================================
# CHECK MODE
# ============================================================

if ($Mode -eq 'check') {
    Write-Host '=== Consumer Install Check ==='
    if ($LocalMode) {
        Write-Host '[INFO] LocalMode: agentdev-gh-cli redirects to src/opencode-local/agentdev-gh-cli/'
    }
    $divergences = 0

    # 1. Plugin checkout
    if (-not (Test-Path -LiteralPath (Join-Path $PluginPath '.git'))) {
        Write-Host "[DIVERGENCE] $PluginDir is not a git repository (clone required)"
        $divergences++
    } else {
        Write-Host "[OK] $PluginDir is a git repository"
    }

    # 2. Source directory
    if (-not (Test-Path -LiteralPath $SourceDir)) {
        Write-Host "[DIVERGENCE] Source directory not found: $SourceDir"
        $divergences++
    } else {
        Write-Host "[OK] Source directory exists: $PluginDir/src/opencode/"
    }

    # 2b. Local redirect source (LocalMode only)
    if ($LocalMode) {
        if (-not (Test-Path -LiteralPath $localRedirectSource)) {
            Write-Host "[DIVERGENCE] LocalMode redirect source not found: $PluginDir/src/opencode-local/$LocalModeRedirectSkill/"
            $divergences++
        } else {
            Write-Host "[OK] LocalMode redirect source exists: $PluginDir/src/opencode-local/$LocalModeRedirectSkill/"
        }
    }

    # 3. .opencode/ must be a real directory
    if (Test-Junction -Path $ProjectionDir) {
        Write-Host '[DIVERGENCE] .opencode/ is a junction (must be real directory)'
        $divergences++
    } elseif (-not (Test-Path -LiteralPath $ProjectionDir)) {
        Write-Host '[DIVERGENCE] .opencode/ does not exist'
        $divergences++
    } else {
        Write-Host '[OK] .opencode/ is a real directory'
    }

    # 4. Parent directories
    foreach ($parentDir in @($CommandsDir, $SkillsDir)) {
        $parentRel = $parentDir.Substring($ProjectionDir.Length).TrimStart('\', '/')
        if (Test-Junction -Path $parentDir) {
            Write-Host "[DIVERGENCE] .opencode/$parentRel is a junction (must be real directory)"
            $divergences++
        } elseif (-not (Test-Path -LiteralPath $parentDir)) {
            Write-Host "[DIVERGENCE] .opencode/$parentRel does not exist"
            $divergences++
        } else {
            Write-Host "[OK] .opencode/$parentRel is a real directory"
        }
    }

    # 5. Check each expected junction
    foreach ($relPath in $targets) {
        $targetPath = Join-Path $ProjectionDir $relPath
        if (-not (Test-Path -LiteralPath $targetPath)) {
            Write-Host "[DIVERGENCE] Missing junction: $relPath"
            $divergences++
        } elseif (Test-Junction -Path $targetPath) {
            $expectedSource = Get-TargetSourcePath -RelPath $relPath
            $actualTarget = Get-JunctionTarget -Path $targetPath
            if ($actualTarget -and (Test-Path -LiteralPath $actualTarget) -and ((Resolve-Path -LiteralPath $actualTarget).Path -eq (Resolve-Path -LiteralPath $expectedSource).Path)) {
                Write-Host "[OK] Junction: $relPath"
            } else {
                Write-Host "[DIVERGENCE] Broken junction: $relPath (expected: $expectedSource, actual: $actualTarget)"
                $divergences++
            }
        } else {
            Write-Host "[DIVERGENCE] Exists but not a junction: $relPath"
            $divergences++
        }
    }

    # 6. Repo-local directories (informational)
    foreach ($cmdName in $RepoLocalCommandNames) {
        $repoLocalPath = Join-Path $CommandsDir $cmdName
        if (Test-Path -LiteralPath $repoLocalPath) {
            Write-Host "[INFO] Repo-local command directory exists: commands\$cmdName (not junction-managed)"
        }
    }
    if (Test-Path -LiteralPath $SkillsDir) {
        Get-ChildItem -LiteralPath $SkillsDir -Directory -Force |
            Where-Object { $_.Name -like "$RepoLocalSkillPrefix*" -and -not ($_.Attributes -band [System.IO.FileAttributes]::ReparsePoint) } |
            ForEach-Object {
                Write-Host "[INFO] Repo-local skill directory exists: skills\$($_.Name) (not junction-managed)"
            }
    }

    Write-Host ''
    if ($divergences -eq 0) {
        Write-Host 'No divergence detected. Consumer install is in sync.'
    } else {
        Write-Host "$divergences divergence(s) detected."
    }
    exit $(if ($divergences -gt 0) { 1 } else { 0 })
}

# ============================================================
# DRY-RUN MODE
# ============================================================

if ($Mode -eq 'dry-run') {
    Write-Host '=== Consumer Install Dry Run ==='
    if ($LocalMode) {
        Write-Host '[INFO] LocalMode: agentdev-gh-cli redirects to src/opencode-local/agentdev-gh-cli/'
    }

    # .opencode/ status
    if (Test-Junction -Path $ProjectionDir) {
        Write-Host '[INFO] Migration required: .opencode/ is a junction'
    } elseif (-not (Test-Path -LiteralPath $ProjectionDir)) {
        Write-Host '[INFO] .opencode/ does not exist, would create as real directory'
    } else {
        Write-Host '[OK] .opencode/ is a real directory'
    }

    # Parent directory status
    foreach ($parentRel in @('commands', 'skills')) {
        $parentPath = Join-Path $ProjectionDir $parentRel
        if (-not (Test-Path -LiteralPath $parentPath)) {
            Write-Host "[WOULD ADD] .opencode/$parentRel/ (real directory)"
        } elseif (Test-Junction -Path $parentPath) {
            Write-Host "[ERROR] .opencode/$parentRel/ is a junction (unexpected state)"
        } else {
            Write-Host "[OK] .opencode/$parentRel/ exists as real directory"
        }
    }

    Write-Host ''
    Write-Host '--- Planned junctions ---'

    foreach ($relPath in $targets) {
        $targetPath = Join-Path $ProjectionDir $relPath
        $expectedSource = Get-TargetSourcePath -RelPath $relPath
        if (Test-Junction -Path $targetPath) {
            $actualTarget = Get-JunctionTarget -Path $targetPath
            if ($actualTarget -and (Test-Path -LiteralPath $actualTarget)) {
                Write-Host "[OK] Already junctioned: $relPath"
            } else {
                Write-Host "[WOULD REMOVE] Broken junction: $relPath"
                Write-Host "[WOULD ADD] Re-create junction: $relPath"
            }
        } elseif (Test-Path -LiteralPath $targetPath) {
            Write-Host "[ERROR] Path exists and is not a junction: $relPath"
        } else {
            Write-Host "[WOULD ADD] Create junction: $relPath -> $expectedSource"
        }
    }

    Write-Host ''
    Write-Host 'Dry run complete. No changes made.'
    exit 0
}

# ============================================================
# APPLY MODE
# ============================================================

if ($Mode -eq 'apply') {
    Write-Host '=== Consumer Install: applying junctions ==='
    if ($LocalMode) {
        Write-Host '[INFO] LocalMode: agentdev-gh-cli redirects to src/opencode-local/agentdev-gh-cli/'
    }

    # Step 1: Ensure .opencode/ is a real directory
    if (Test-Junction -Path $ProjectionDir) {
        Write-Host '[ACTION] Removing whole-directory junction .opencode/'
        $rmResult = cmd /c "rmdir `"$ProjectionDir`"" 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Error "[ERROR] Failed to remove junction: $rmResult"
            exit 1
        }
        Write-Host '[ACTION] Creating .opencode/ as real directory'
        New-Item -ItemType Directory -Path $ProjectionDir -Force | Out-Null
    } elseif (-not (Test-Path -LiteralPath $ProjectionDir)) {
        Write-Host '[ACTION] Creating .opencode/ as real directory'
        New-Item -ItemType Directory -Path $ProjectionDir -Force | Out-Null
    } else {
        Write-Host '[OK] .opencode/ exists as real directory'
    }

    # Step 2: Parent directories
    foreach ($parentRel in @('commands', 'skills')) {
        $parentPath = Join-Path $ProjectionDir $parentRel
        if (Test-Junction -Path $parentPath) {
            Write-Error "[ERROR] .opencode/$parentRel is a junction (must be real directory)"
            exit 1
        }
        if (-not (Test-Path -LiteralPath $parentPath)) {
            Write-Host "[ACTION] Creating .opencode/$parentRel/ as real directory"
            New-Item -ItemType Directory -Path $parentPath -Force | Out-Null
        }
    }

    # Step 3: Selective Junction Creation
    Write-Host ''
    Write-Host '--- Junctions ---'
    foreach ($relPath in $targets) {
        $targetPath = Join-Path $ProjectionDir $relPath
        $sourcePath = Get-TargetSourcePath -RelPath $relPath

        if (Test-Junction -Path $targetPath) {
            $actualTarget = Get-JunctionTarget -Path $targetPath
            $expectedSource = $sourcePath
            if ($actualTarget -and (Test-Path -LiteralPath $actualTarget) -and ((Resolve-Path -LiteralPath $actualTarget).Path -eq (Resolve-Path -LiteralPath $expectedSource).Path)) {
                Write-Host "[OK] Already junctioned: $relPath"
                continue
            } else {
                Write-Host "[ACTION] Removing junction (wrong target): $relPath"
                cmd /c "rmdir `"$targetPath`"" 2>&1
                if ($LASTEXITCODE -ne 0) {
                    Write-Error "[ERROR] Failed to remove junction: $relPath"
                    exit 1
                }
            }
        } elseif (Test-Path -LiteralPath $targetPath) {
            Write-Error "[ERROR] Path exists and is not a junction: $relPath"
            exit 1
        }

        # Ensure parent directory exists
        $parentPath = Split-Path $targetPath -Parent
        if (-not (Test-Path -LiteralPath $parentPath)) {
            New-Item -ItemType Directory -Path $parentPath -Force | Out-Null
        }

        Write-Host "[ACTION] Creating junction: $relPath -> $sourcePath"
        $result = cmd /c "mklink /J `"$targetPath`" `"$sourcePath`" 2>&1"
        if ($LASTEXITCODE -ne 0) {
            Write-Error "[ERROR] Failed to create junction ${relPath}: $result"
            exit 1
        }
    }

    # Step 4: Repo-local directories (informational)
    Write-Host ''
    Write-Host '--- Repo-local artifacts (not junction-managed) ---'
    foreach ($cmdName in $RepoLocalCommandNames) {
        $repoLocalPath = Join-Path $CommandsDir $cmdName
        if (Test-Path -LiteralPath $repoLocalPath) {
            Write-Host "[INFO] Skipping repo-local command: commands\$cmdName"
        }
    }
    if (Test-Path -LiteralPath $SkillsDir) {
        Get-ChildItem -LiteralPath $SkillsDir -Directory -Force |
            Where-Object { $_.Name -like "$RepoLocalSkillPrefix*" } |
            ForEach-Object {
                Write-Host "[INFO] Skipping repo-local skill: skills\$($_.Name)"
            }
    }

    Write-Host ''
    Write-Host 'Consumer install complete.'
    Write-Host ''
    Write-Host 'Recommended .gitignore entries:'
    Write-Host "  $PluginDir/"
    Write-Host '  .sisyphus/'
    Write-Host '  .opencode/commands/agentdev/'
    Write-Host '  .opencode/skills/agentdev-*/'
    exit 0
}
