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
# Exit codes:
#   0  success (archive written, path printed to stdout)
#   2  required source dir or file missing
#   3  archive already exists and -Force was not supplied

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

# install-from-archive.ps1 must travel inside the archive.
Copy-Item -LiteralPath $installScript -Destination (Join-Path $stageScripts "install-from-archive.ps1") -Force

# README-INSTALL.md (optional but listed in §7.5.1 layout; warn if missing).
if (Test-Path -LiteralPath $readmeInstall) {
    Copy-Item -LiteralPath $readmeInstall -Destination (Join-Path $archiveRoot "README-INSTALL.md") -Force
} else {
    Write-Warning "package-release-archive: README-INSTALL.md missing at repo root; archive will omit it."
}

if (Test-Path -LiteralPath $archiveZip) {
    Remove-Item -LiteralPath $archiveZip -Force
}
Compress-Archive -Path $archiveRoot -DestinationPath $archiveZip -Force

# Remove staging directory; only the .zip is shipped.
Remove-Item -LiteralPath $archiveRoot -Recurse -Force

Write-Output $archiveZip
exit 0
