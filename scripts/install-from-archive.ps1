[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Source,
    [Parameter(Mandatory = $true)][string]$Target,
    [Parameter(Mandatory = $true)][ValidateSet("copy")][string]$Mode
)

# WP-3 (Issue #1928) §7.5.2: install the unpacked release archive's src/opencode/
# tree into the projection directory (.opencode/) as real files.
# Junctions are NOT created; release archives must be junction-free.
#
# Exit codes:
#   0  success (every file placed, content matches)
#   4  destination already has a file with different content (do not overwrite)
#   5  required directory creation failed / source missing

$ErrorActionPreference = "Stop"

function Ensure-Directory {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        try {
            New-Item -ItemType Directory -Path $Path -Force | Out-Null
        } catch {
            Write-Error "install-from-archive: failed to create directory '$Path': $($_.Exception.Message)"
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
            Write-Error "install-from-archive: content mismatch (exit 4). Destination file differs from source: $DstFile"
            exit 4
        }
        return
    }
    $dstParent = Split-Path -Parent $DstFile
    Ensure-Directory -Path $dstParent
    try {
        Copy-Item -LiteralPath $SrcFile -Destination $DstFile -Force
    } catch {
        Write-Error "install-from-archive: copy failed '$SrcFile' -> '$DstFile': $($_.Exception.Message)"
        exit 5
    }
}

if (-not (Test-Path -LiteralPath $Source)) {
    Write-Error "install-from-archive: source directory not found: $Source"
    exit 5
}

$commandsSrc = Join-Path $Source "commands\agentdev"
$skillsSrc = Join-Path $Source "skills"

if (-not (Test-Path -LiteralPath $commandsSrc)) {
    Write-Error "install-from-archive: required source directory missing: $commandsSrc"
    exit 5
}
if (-not (Test-Path -LiteralPath $skillsSrc)) {
    Write-Error "install-from-archive: required source directory missing: $skillsSrc"
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

# Skills: agentdev-* and the japanese-tech-writing dependency (REQ-002).
$skillDirs = Get-ChildItem -LiteralPath $skillsSrc -Directory | Where-Object {
    $_.Name -like "agentdev-*" -or $_.Name -eq "japanese-tech-writing"
}
foreach ($skillDir in $skillDirs) {
    $skillFiles = Get-ChildItem -LiteralPath $skillDir.FullName -Recurse -File
    foreach ($f in $skillFiles) {
        $rel = $f.FullName.Substring($skillsSrc.Length).TrimStart('\', '/')
        $dst = Join-Path $skillsDst $rel
        Place-File -SrcFile $f.FullName -DstFile $dst
    }
}

Write-Host "install-from-archive: placed commands and skills into $Target"
exit 0
