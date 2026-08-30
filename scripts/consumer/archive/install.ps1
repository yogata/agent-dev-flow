[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Source,
    [Parameter(Mandatory = $true)][string]$Target,
    [Parameter(Mandatory = $true)][ValidateSet("copy")][string]$Mode
)

# archive 専用 installer 原本。release archive 内では scripts/install.ps1 の名で
# 配置される（package-release-archive.ps1 が投影名を付与する）。
# WP-{N} (Issue #1928) §7.5.2: install the unpacked release archive's src/opencode/
# tree into the projection directory (.opencode/) as real files.
# Junctions are NOT created; release archives must be junction-free.
#
# ADF-COVERS(implementation): REQ-052-007
#
# Exit codes:
#   0  success (every file placed, content matches)
#   4  destination already has a file with different content (do not overwrite)
#   5  required directory creation failed / source missing

$ErrorActionPreference = "Stop"
$Source = [System.IO.Path]::GetFullPath($Source)
$Target = [System.IO.Path]::GetFullPath($Target)

function Ensure-Directory {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        try {
            New-Item -ItemType Directory -Path $Path -Force | Out-Null
        } catch {
            Write-Host "install-from-archive: failed to create directory '$Path': $($_.Exception.Message)" -ForegroundColor Red
            exit 5
        }
    }
}

function Place-File {
    param([string]$SrcFile, [string]$DstFile)
    if (Test-Path -LiteralPath $DstFile) {
        $srcHash = (Get-FileHash -LiteralPath $SrcFile -Algorithm SHA256).Hash
        $dstHash = (Get-FileHash -LiteralPath $DstFile -Algorithm SHA256).Hash
        if ($srcHash -ne $dstHash) {
            Write-Host "install-from-archive: content mismatch (exit 4). Destination file differs from source: $DstFile" -ForegroundColor Red
            exit 4
        }
        return
    }
    $dstParent = Split-Path -Parent $DstFile
    Ensure-Directory -Path $dstParent
    try {
        Copy-Item -LiteralPath $SrcFile -Destination $DstFile -Force
    } catch {
        Write-Host "install-from-archive: copy failed '$SrcFile' -> '$DstFile': $($_.Exception.Message)" -ForegroundColor Red
        exit 5
    }
}

if (-not (Test-Path -LiteralPath $Source)) {
    Write-Host "install-from-archive: source directory not found: $Source" -ForegroundColor Red
    exit 5
}

$commandsSrc = Join-Path $Source "commands\agentdev"
$skillsSrc = Join-Path $Source "skills"

if (-not (Test-Path -LiteralPath $commandsSrc)) {
    Write-Host "install-from-archive: required source directory missing: $commandsSrc" -ForegroundColor Red
    exit 5
}
if (-not (Test-Path -LiteralPath $skillsSrc)) {
    Write-Host "install-from-archive: required source directory missing: $skillsSrc" -ForegroundColor Red
    exit 5
}

$commandsDst = Join-Path $Target "commands\agentdev"
$skillsDst = Join-Path $Target "skills"

Ensure-Directory -Path $commandsDst
Ensure-Directory -Path $skillsDst

# Commands: copy every file under src/opencode/commands/agentdev/
$commandFiles = Get-ChildItem -LiteralPath $commandsSrc -Recurse -File
foreach ($f in $commandFiles) {
    $rel = $f.FullName.Substring($commandsSrc.Length).TrimStart('\', '/')
    $dst = Join-Path $commandsDst $rel
    Place-File -SrcFile $f.FullName -DstFile $dst
}

# Skills: agentdev-* only.
$skillDirs = Get-ChildItem -LiteralPath $skillsSrc -Directory | Where-Object {
    $_.Name -like "agentdev-*"
}
foreach ($skillDir in $skillDirs) {
    $skillFiles = Get-ChildItem -LiteralPath $skillDir.FullName -Recurse -File
    foreach ($f in $skillFiles) {
        $rel = $f.FullName.Substring($skillsSrc.Length).TrimStart('\', '/')
        $dst = Join-Path $skillsDst $rel
        Place-File -SrcFile $f.FullName -DstFile $dst
    }
}

# Custom Tools / Plugins (agentdev-* distribution types, REQ-052). Optional
# kinds: archives without a kind directory simply skip it.
# Repo-local Plugin (agentdev-distribution-boundary-guard, REQ-052-006 /
# REQ-002-045) is excluded from consumer projection. SYNC OBLIGATION
# (runtime-package-boundary Design「repo-local Plugin の配布・投影契約」):
# keep this exclusion in sync across the 3 consumer distribution paths:
# scripts/install.ps1, scripts/self/release/package-release-archive.ps1,
# this file. self-sync.ps1 must NOT exclude it (self-host projection is kept).
$repoLocalPluginNames = @("agentdev-distribution-boundary-guard")
foreach ($kind in @("tools", "plugins")) {
    $kindSrc = Join-Path $Source $kind
    if (-not (Test-Path -LiteralPath $kindSrc)) { continue }
    $kindDst = Join-Path $Target $kind
    $kindDirs = Get-ChildItem -LiteralPath $kindSrc -Directory | Where-Object {
        $_.Name -like "agentdev-*" -and
        ($kind -ne "plugins" -or $_.Name -notin $repoLocalPluginNames)
    }
    foreach ($kindDir in $kindDirs) {
        $kindFiles = Get-ChildItem -LiteralPath $kindDir.FullName -Recurse -File
        foreach ($f in $kindFiles) {
            $rel = $f.FullName.Substring($kindSrc.Length).TrimStart('\', '/')
            $dst = Join-Path $kindDst $rel
            Place-File -SrcFile $f.FullName -DstFile $dst
        }
    }
}

# Plugin loader shims (REQ-011-001 registration wiring): OpenCode auto-loads
# plugin files only at .opencode/plugins/ depth 1, so each directory-style
# plugin package also needs a depth-1 re-export shim. Release archives must
# stay junction-free; the shim is a generated real file.
$pluginsSrcDir = Join-Path $Source "plugins"
if (Test-Path -LiteralPath $pluginsSrcDir) {
    $pluginPackages = Get-ChildItem -LiteralPath $pluginsSrcDir -Directory | Where-Object {
        $_.Name -like "agentdev-*" -and $_.Name -notin $repoLocalPluginNames
    }
    foreach ($pkg in $pluginPackages) {
        $shimDst = Join-Path (Join-Path $Target "plugins") "$($pkg.Name).ts"
        $shimContent = (
            "// Generated by scripts/install.ps1 / scripts/self-sync.ps1 - do not edit.`n" +
            "export { default } from `"./$($pkg.Name)/plugin.ts`";`n"
        )
        if (Test-Path -LiteralPath $shimDst) {
            $dstText = [System.IO.File]::ReadAllText($shimDst)
            if ($dstText -ne $shimContent) {
                Write-Host "install-from-archive: shim content mismatch (exit 4): $shimDst" -ForegroundColor Red
                exit 4
            }
        } else {
            try {
                [System.IO.File]::WriteAllText($shimDst, $shimContent, (New-Object System.Text.UTF8Encoding($false)))
            } catch {
                Write-Host "install-from-archive: failed to write plugin loader shim '$shimDst': $($_.Exception.Message)" -ForegroundColor Red
                exit 5
            }
        }
    }
}

Write-Host "install-from-archive: placed commands, skills, tools, and plugins into $Target"
exit 0
