[CmdletBinding()]
param(
    [switch]$Force
)

# WP-3 (Issue #1928) §7.5.1: build a junction-free release archive from the
# repo's src/opencode/ source tree. The archive contains:
#   agentdev-release-<sha>/
#     src/opencode/commands/agentdev/**.md
#     src/opencode/skills/agentdev-*/**, japanese-tech-writing/**
#     scripts/install-from-archive.ps1
#     README-INSTALL.md
# Junctions are resolved to real file content so the archive is self-contained.
#
# DEC-014 decision 7 / TS-008 / TS-010 (Issue #2092): before publishing the
# final archive, two projection boundary inspections are run against the
# canonical distribution-boundary adapter:
#   1. archive projection on the staged content (before Compress-Archive)
#   2. archive-installed projection on the extracted+installed content
# Either failure removes the final archive and exits non-zero so no success
# path is left behind on violation.
#
# Exit codes:
#   0  success (archive written, path printed to stdout)
#   2  required source dir or file missing
#   3  archive already exists and -Force was not supplied
#   6  archive projection boundary check failed (no final archive produced)
#   7  archive-installed projection boundary check failed (final archive removed)
#   8  boundary checker missing (fail-closed, Oracle finding 6)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

$srcCommands = Join-Path $repoRoot "src\opencode\commands\agentdev"
$srcSkills = Join-Path $repoRoot "src\opencode\skills"
$installScript = Join-Path $PSScriptRoot "install-from-archive.ps1"
$readmeInstall = Join-Path $repoRoot "README-INSTALL.md"

if (-not (Test-Path -LiteralPath $srcCommands)) {
    Write-Error "package-release-archive: required source directory missing: $srcCommands"
    exit 2
}
if (-not (Test-Path -LiteralPath $srcSkills)) {
    Write-Error "package-release-archive: required source directory missing: $srcSkills"
    exit 2
}
if (-not (Test-Path -LiteralPath $installScript)) {
    Write-Error "package-release-archive: install-from-archive.ps1 missing: $installScript"
    exit 2
}

$commitShort = (& git -C $repoRoot rev-parse --short HEAD 2>$null)
if (-not $commitShort) {
    Write-Error "package-release-archive: could not resolve git commit short hash"
    exit 2
}
$commitShort = $commitShort.Trim()

$archiveName = "agentdev-release-$commitShort"
$distDir = Join-Path $repoRoot "dist"
$archiveRoot = Join-Path $distDir $archiveName
$archiveZip = "$archiveRoot.zip"

if ((Test-Path -LiteralPath $archiveZip) -and -not $Force) {
    Write-Error "package-release-archive: archive already exists (use -Force to overwrite): $archiveZip"
    exit 3
}

if (-not (Test-Path -LiteralPath $distDir)) {
    New-Item -ItemType Directory -Path $distDir -Force | Out-Null
}

if (Test-Path -LiteralPath $archiveRoot) {
    Remove-Item -LiteralPath $archiveRoot -Recurse -Force
}

# Stage directory layout
$stageSrcOpencode = Join-Path $archiveRoot "src\opencode"
$stageCommands = Join-Path $stageSrcOpencode "commands\agentdev"
$stageSkills = Join-Path $stageSrcOpencode "skills"
$stageScripts = Join-Path $archiveRoot "scripts"

New-Item -ItemType Directory -Path $stageCommands -Force | Out-Null
New-Item -ItemType Directory -Path $stageSkills -Force | Out-Null
New-Item -ItemType Directory -Path $stageScripts -Force | Out-Null

# Commands: real-file recursive copy (junctions resolved by Copy-Item).
Copy-Item -Path (Join-Path $srcCommands "*") -Destination $stageCommands -Recurse -Force

# Skills: agentdev-* and japanese-tech-writing only.
$skillDirs = Get-ChildItem -LiteralPath $srcSkills -Directory | Where-Object {
    $_.Name -like "agentdev-*" -or $_.Name -eq "japanese-tech-writing"
}
foreach ($d in $skillDirs) {
    $stageSkillDir = Join-Path $stageSkills $d.Name
    New-Item -ItemType Directory -Path $stageSkillDir -Force | Out-Null
    Copy-Item -Path (Join-Path $d.FullName "*") -Destination $stageSkillDir -Recurse -Force
}

# node_modules は配布アーカイブに含めない (サイズ増大・consumer側のnpm installで解決)
Get-ChildItem -LiteralPath $stageSkills -Recurse -Directory -Filter "node_modules" -ErrorAction SilentlyContinue |
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

# install-from-archive.ps1 must travel inside the archive.
Copy-Item -LiteralPath $installScript -Destination (Join-Path $stageScripts "install-from-archive.ps1") -Force

# README-INSTALL.md (optional but listed in §7.5.1 layout; warn if missing).
if (Test-Path -LiteralPath $readmeInstall) {
    Copy-Item -LiteralPath $readmeInstall -Destination (Join-Path $archiveRoot "README-INSTALL.md") -Force
} else {
    Write-Warning "package-release-archive: README-INSTALL.md missing at repo root; archive will omit it."
}

# DEC-014 decision 7 / REQ-009-045: pre-publication boundary inspection.
# The staged content mirrors src/opencode/ (archive projection = source
# projection for boundary purposes). If the boundary check finds any
# producer-internal reference in the staged text artifacts, we MUST NOT
# produce a final archive. Cleanup is unconditional on failure.
$boundaryChecker = Join-Path $repoRoot ".opencode\skills\repo-agentdev-integrity\scripts\check_distribution_boundary.ts"
if (-not (Test-Path -LiteralPath $boundaryChecker)) {
    Write-Warning "package-release-archive: boundary checker not found at $boundaryChecker. Fail-closed per Oracle finding 6."
    Remove-Item -LiteralPath $archiveRoot -Recurse -Force -ErrorAction SilentlyContinue
    exit 8
}
Write-Host "package-release-archive: running archive projection boundary check on staged content"
& bun run $boundaryChecker --profile archive $archiveRoot --json 2>&1 | Tee-Object -Variable archiveCheckOut | Out-Host
$archiveCheckExit = $LASTEXITCODE
if ($archiveCheckExit -ne 0) {
    Write-Warning "package-release-archive: archive projection boundary check failed (exit $archiveCheckExit). Removing staging; no final archive will be produced."
    Remove-Item -LiteralPath $archiveRoot -Recurse -Force -ErrorAction SilentlyContinue
    exit 6
}

if (Test-Path -LiteralPath $archiveZip) {
    Remove-Item -LiteralPath $archiveZip -Force
}
Compress-Archive -Path $archiveRoot -DestinationPath $archiveZip -Force

# DEC-014 decision 7 / TS-008 / TS-010: archive-installed projection check.
# Extract the just-built archive to a temporary consumer location, run
# install-from-archive.ps1 to materialise the .opencode/ tree, and run the
# boundary check against that installed projection. If this fails, the final
# archive is removed and no success path is left behind.
$archiveStagingExtract = Join-Path $env:TEMP "agentdev-release-archive-staging-$commitShort"
$archiveInstalledRoot = Join-Path $env:TEMP "agentdev-release-archive-installed-$commitShort"
if (Test-Path -LiteralPath $archiveStagingExtract) {
    Remove-Item -LiteralPath $archiveStagingExtract -Recurse -Force
}
if (Test-Path -LiteralPath $archiveInstalledRoot) {
    Remove-Item -LiteralPath $archiveInstalledRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $archiveStagingExtract -Force | Out-Null
New-Item -ItemType Directory -Path $archiveInstalledRoot -Force | Out-Null

try {
    Expand-Archive -LiteralPath $archiveZip -DestinationPath $archiveStagingExtract -Force
    # The archive contains agentdev-release-<sha>/ as its root directory.
    $extractedRoot = Get-ChildItem -LiteralPath $archiveStagingExtract -Directory | Select-Object -First 1
    if (-not $extractedRoot) {
        throw "archive extraction produced no root directory"
    }
    $extractedRootPath = $extractedRoot.FullName
    $installedSrc = Join-Path $extractedRootPath "src\opencode"
    $installedTarget = Join-Path $archiveInstalledRoot ".opencode"
    $installFromArchive = Join-Path $extractedRootPath "scripts\install-from-archive.ps1"
    & powershell -NoProfile -ExecutionPolicy Bypass -File $installFromArchive -Source $installedSrc -Target $installedTarget -Mode copy
    if ($LASTEXITCODE -ne 0) {
        throw "install-from-archive.ps1 exited with $LASTEXITCODE"
    }
    Write-Host "package-release-archive: running archive-installed projection boundary check"
    & bun run $boundaryChecker --profile archive-installed $archiveInstalledRoot --json 2>&1 | Tee-Object -Variable archiveInstalledOut | Out-Host
    $installedCheckExit = $LASTEXITCODE
    if ($installedCheckExit -ne 0) {
        Write-Warning "package-release-archive: archive-installed projection boundary check failed (exit $installedCheckExit). Removing final archive; no success path will be left."
        Remove-Item -LiteralPath $archiveZip -Force -ErrorAction SilentlyContinue
        Remove-Item -LiteralPath $archiveRoot -Recurse -Force -ErrorAction SilentlyContinue
        exit 7
    }
} finally {
    Remove-Item -LiteralPath $archiveStagingExtract -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $archiveInstalledRoot -Recurse -Force -ErrorAction SilentlyContinue
}

# Remove staging directory; only the .zip is shipped.
Remove-Item -LiteralPath $archiveRoot -Recurse -Force

Write-Output $archiveZip
exit 0
