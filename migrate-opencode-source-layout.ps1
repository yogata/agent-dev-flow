#Requires -Version 7.0
<#
.SYNOPSIS
    One-time migration: move .opencode/ contents to src/opencode/ and create projection.

.DESCRIPTION
    Idempotent migration script. Safe to run multiple times.
    Steps:
    1. Create src/opencode/ if not exists
    2. Move .opencode/commands/ to src/opencode/commands/
    3. Move .opencode/skills/ to src/opencode/skills/
    4. Move .opencode/.gitignore to src/opencode/.gitignore
    5. Remove .opencode/ directory
    6. Create junction .opencode/ -> src/opencode/

.EXAMPLE
    ./migrate-opencode-source-layout.ps1
    ./migrate-opencode-source-layout.ps1 -WhatIf
#>

param(
    [switch]$WhatIf
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

# --- Main ---

Write-Host "=== OpenCode Source/Projection Layout Migration ==="
Write-Host ""

# Check if already migrated
if (Test-Junction -Path $ProjectionDir) {
    Write-Host "[OK] .opencode/ is already a junction — migration already complete"
    exit 0
}

if ((Test-Path -LiteralPath $SourceDir) -and -not (Test-Path -LiteralPath $ProjectionDir)) {
    Write-Host "[OK] src/opencode/ exists and .opencode/ does not — migration already complete (junction missing)"
    Write-Host "[ACTION] Creating junction .opencode/ -> src/opencode/..."
    if (-not $WhatIf) {
        $srcRelative = "src\opencode"
        $result = cmd /c "mklink /J `"$ProjectionDir`" `"$srcRelative`" 2>&1"
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to create junction: $result"
            exit 1
        }
        Write-Host "[OK] Junction created"
    } else {
        Write-Host "[WHATIF] Would create junction"
    }
    exit 0
}

if (-not (Test-Path -LiteralPath $ProjectionDir)) {
    Write-Error ".opencode/ directory not found — nothing to migrate"
    exit 1
}

# Step 1: Create src/opencode/
if (-not (Test-Path -LiteralPath $SourceDir)) {
    Write-Host "[ACTION] Creating src/opencode/ directory..."
    if (-not $WhatIf) {
        New-Item -ItemType Directory -Path $SourceDir -Force | Out-Null
    } else {
        Write-Host "[WHATIF] Would create src/opencode/"
    }
}

# Step 2: Move commands
$srcCommands = Join-Path $SourceDir 'commands'
$projCommands = Join-Path $ProjectionDir 'commands'
if ((Test-Path -LiteralPath $projCommands) -and -not (Test-Path -LiteralPath $srcCommands)) {
    Write-Host "[ACTION] Moving .opencode/commands/ -> src/opencode/commands/..."
    if (-not $WhatIf) {
        git mv $projCommands $srcCommands
    } else {
        Write-Host "[WHATIF] Would git mv .opencode/commands/ src/opencode/commands/"
    }
} elseif ((Test-Path -LiteralPath $projCommands) -and (Test-Path -LiteralPath $srcCommands)) {
    Write-Host "[SKIP] Both .opencode/commands/ and src/opencode/commands/ exist — manual resolution needed"
}

# Step 3: Move skills
$srcSkills = Join-Path $SourceDir 'skills'
$projSkills = Join-Path $ProjectionDir 'skills'
if ((Test-Path -LiteralPath $projSkills) -and -not (Test-Path -LiteralPath $srcSkills)) {
    Write-Host "[ACTION] Moving .opencode/skills/ -> src/opencode/skills/..."
    if (-not $WhatIf) {
        git mv $projSkills $srcSkills
    } else {
        Write-Host "[WHATIF] Would git mv .opencode/skills/ src/opencode/skills/"
    }
} elseif ((Test-Path -LiteralPath $projSkills) -and (Test-Path -LiteralPath $srcSkills)) {
    Write-Host "[SKIP] Both .opencode/skills/ and src/opencode/skills/ exist — manual resolution needed"
}

# Step 4: Move .gitignore
$projGitignore = Join-Path $ProjectionDir '.gitignore'
$srcGitignore = Join-Path $SourceDir '.gitignore'
if ((Test-Path -LiteralPath $projGitignore) -and -not (Test-Path -LiteralPath $srcGitignore)) {
    Write-Host "[ACTION] Moving .opencode/.gitignore -> src/opencode/.gitignore..."
    if (-not $WhatIf) {
        git mv $projGitignore $srcGitignore
    } else {
        Write-Host "[WHATIF] Would git mv .opencode/.gitignore src/opencode/.gitignore"
    }
}

# Step 5: Remove .opencode/ directory
Write-Host "[ACTION] Removing .opencode/ directory..."
if (-not $WhatIf) {
    Remove-Item -LiteralPath $ProjectionDir -Recurse -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "[WHATIF] Would remove .opencode/ directory"
}

# Step 6: Create junction
Write-Host "[ACTION] Creating junction .opencode/ -> src/opencode/..."
if (-not $WhatIf) {
    $srcRelative = "src\opencode"
    $result = cmd /c "mklink /J `"$ProjectionDir`" `"$srcRelative`" 2>&1"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create junction: $result"
        exit 1
    }
    Write-Host "[OK] Junction created: $result"
} else {
    Write-Host "[WHATIF] Would create junction"
}

# Verify
Write-Host ""
Write-Host "=== Verification ==="
if (-not $WhatIf) {
    if (Test-Junction -Path $ProjectionDir) {
        Write-Host "[OK] .opencode/ is a junction"
    } else {
        Write-Error "[FAIL] .opencode/ is not a junction"
        exit 1
    }

    $commandsExist = Test-Path -LiteralPath (Join-Path $SourceDir 'commands\agentdev\README.md')
    $skillsExist = Test-Path -LiteralPath (Join-Path $SourceDir 'skills\agentdev-gh-cli\SKILL.md')

    if ($commandsExist) { Write-Host "[OK] src/opencode/commands/agentdev/ populated" }
    else { Write-Warning "[WARN] src/opencode/commands/agentdev/ may be empty" }

    if ($skillsExist) { Write-Host "[OK] src/opencode/skills/ populated" }
    else { Write-Warning "[WARN] src/opencode/skills/ may be empty" }

    # Verify runtime path works
    $runtimeCmd = Test-Path -LiteralPath (Join-Path $ProjectionDir 'commands\agentdev\README.md')
    if ($runtimeCmd) { Write-Host "[OK] Runtime path .opencode/commands/agentdev/ accessible" }
    else { Write-Error "[FAIL] Runtime path .opencode/commands/agentdev/ not accessible" }
}

Write-Host ""
Write-Host "Migration complete."
