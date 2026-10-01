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
# 対応宣言（ADF-COVERS）の正規配置先は docs 配下の正規成果物である。
#
# Exit codes:
#   0  success (every file placed, content matches)
#   4  destination already has a file with different content (do not overwrite)
#   5  required directory creation failed / source missing
#   6  textlint guard plugin dependency (vendor) missing or incomplete at the
#      target (run the resolution steps: bun install && bun run build:engine
#      under the installed plugin package, then re-run this installer)
#   7  third-party skill declared but not placed under <Target>\skills\<name>\
#      (run the acquisition CLI, then re-run this installer)

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

# Custom Tools / Plugins (agentdev-* distribution types, REQ-{NNNN}). Optional
# kinds: archives without a kind directory simply skip it.
# Repo-local Plugin (agentdev-distribution-boundary-guard, REQ-{NNNN}-{NNN} /
# REQ-{NNNN}-{NNN}) is excluded from consumer projection. SYNC OBLIGATION
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

# textlint guard plugin dependency (vendor) completeness check. The archive
# ships only the version pin metadata (package.json + bun.lock); vendor
# artifacts are generated at install time by the user. When the placed plugin
# is incomplete (including a partially generated state), this installer stops
# fail-closed and guides the resolution steps. The installer itself performs
# no generation and no network fetching. Keep the messages ASCII-only: this
# installer also runs under Windows PowerShell 5.1 (spawned by
# package-release-archive.ps1), which decodes BOM-less UTF-8 as ANSI and
# would corrupt multi-byte guidance text.
$textlintGuardDir = Join-Path $Target "plugins\agentdev-textlint-guard"
if (Test-Path -LiteralPath $textlintGuardDir) {
    $vendorBundle = Join-Path $textlintGuardDir "vendor\textlint-engine.bundle.json"
    $vendorDict = Join-Path $textlintGuardDir "vendor\kuromoji-dict"
    $hasBundle = Test-Path -LiteralPath $vendorBundle
    $hasDict = Test-Path -LiteralPath $vendorDict
    $dictCount = 0
    if ($hasDict) {
        $dictCount = @(Get-ChildItem -LiteralPath $vendorDict -File -Filter '*.dat.gz' -ErrorAction SilentlyContinue).Count
    }
    if (-not ($hasBundle -and $hasDict -and ($dictCount -gt 0))) {
        Write-Host "install-from-archive: textlint guard plugin dependency (vendor) missing or incomplete (exit 6): $vendorBundle / $vendorDict" -ForegroundColor Red
        Write-Host "How to resolve: run the following in the installed plugin package directory ($textlintGuardDir) in this order (bun install performs network fetching):"
        Write-Host '  1. bun install'
        Write-Host '  2. bun run build:engine'
        Write-Host 'Then re-run this installer. The installer performs no dependency generation and no network fetching.'
        exit 6
    }
}

# Plugin loader shims (REQ-{NNNN}-{NNN} registration wiring): OpenCode auto-loads
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

# Third-party Skill drift check: declared skills must be placed under
# <Target>\skills\<name>\ (SKILL.md + provenance marker). The declaration file
# resolves in 2 candidates under the target root: src\third-party\skills.yaml
# first, then .agentdev\third-party\skills.yaml. Environments where neither
# candidate exists skip the check (no third-party presupposition). Declared
# skills without a placement stop the installer with exit 7 and guide the
# acquisition CLI. No acquisition and no network access is performed here.
# Keep the messages ASCII-only: this installer also runs under Windows
# PowerShell 5.1. Three-path sync obligation: keep this check in sync with
# scripts/install.ps1 and scripts/self-sync.ps1.
$thirdPartyDeclCandidates = @("src\third-party\skills.yaml", ".agentdev\third-party\skills.yaml")
$thirdPartyRoot = Split-Path -Parent $Target
$thirdPartyDeclPath = $null
foreach ($rel in $thirdPartyDeclCandidates) {
    $candidate = Join-Path $thirdPartyRoot $rel
    if (Test-Path -LiteralPath $candidate) { $thirdPartyDeclPath = $candidate; break }
}
if ($null -eq $thirdPartyDeclPath) {
    Write-Host "install-from-archive: third-party skill declaration not found (src/third-party/skills.yaml or .agentdev/third-party/skills.yaml); third-party drift check skipped"
} else {
    Write-Host "install-from-archive: third-party skill drift check ($thirdPartyDeclPath)"
    $thirdPartyMissing = @()
    $inSkills = $false
    foreach ($line in [System.IO.File]::ReadAllLines($thirdPartyDeclPath)) {
        $t = $line.Trim()
        if ($t.Length -eq 0 -or $t.StartsWith("#")) { continue }
        if (-not $inSkills) {
            if ($t -match "^skills:\s*(.*)$") {
                $rest = $Matches[1].Trim()
                if ($rest -eq "") { $inSkills = $true }
                elseif ($rest -eq "[]") { break }
                else {
                    Write-Host "install-from-archive: unsupported skills value in declaration (exit 7): $rest" -ForegroundColor Red
                    exit 7
                }
            } elseif (-not $t.StartsWith("schema_version:")) {
                Write-Host "install-from-archive: unsupported declaration line (exit 7): $t" -ForegroundColor Red
                exit 7
            }
            continue
        }
        if ($t.StartsWith("- name:")) {
            $name = $t.Substring("- name:".Length).Trim().Trim('"', "'")
            if ($name) {
                $skillDir = Join-Path (Join-Path $Target "skills") $name
                $hasSkillMd = Test-Path -LiteralPath (Join-Path $skillDir "SKILL.md")
                $hasProvenance = Test-Path -LiteralPath (Join-Path $skillDir ".agentdev-third-party.json")
                if ($hasSkillMd -and $hasProvenance) {
                    Write-Host "install-from-archive: third-party skill placed: $name"
                } else {
                    Write-Host "install-from-archive: third-party skill declared but not placed (exit 7): $name ($skillDir)" -ForegroundColor Red
                    $thirdPartyMissing += $name
                }
            }
        } elseif (-not ($t.StartsWith("source:") -or $t.StartsWith("-"))) {
            Write-Host "install-from-archive: unsupported declaration line (exit 7): $t" -ForegroundColor Red
            exit 7
        }
    }
    if ($thirdPartyMissing.Count -gt 0) {
        Write-Host "How to resolve: run the acquisition CLI to place the declared third-party skills, then re-run this installer:"
        Write-Host "  bun .opencode/tools/agentdev-third-party/cli.ts   (run in the directory containing .opencode/)"
        exit 7
    }
}

Write-Host "install-from-archive: placed commands, skills, tools, and plugins into $Target"
exit 0
