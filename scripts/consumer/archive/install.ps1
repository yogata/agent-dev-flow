[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Source,
    [Parameter(Mandatory = $true)][string]$Target,
    [Parameter(Mandatory = $true)][ValidateSet("copy")][string]$Mode,
    [ValidateSet("none", "opencode", "senpi", "both")][string]$Hosts,
    [ValidateSet("none", "codex", "antigravity", "both")][string]$AgentHosts
)

# archive-edition installer original. package-release-archive.ps1 places this
# file as scripts/install.ps1 inside the release archive.
# Installs the unpacked release archive's src/ tree (canonical layout:
# src/common/ canonical + src/opencode/, src/senpi/, src/codex/,
# src/antigravity/ host connection areas) into the consumer repository as
# real files. Junctions are NOT created; release archives must be
# junction-free.
# Selection model (same contract as the checkout edition): the placement
# targets are one non-empty selection set of the 4 agents (OpenCode, Senpi,
# Codex, Antigravity). -Hosts covers OpenCode/Senpi ('none' opts out of
# both), -AgentHosts covers Codex/Antigravity; both resolve into one
# selection set and an empty selection is rejected before any placement.
# Omitted sides inherit the current selection from the install state record
# (.agentdev/install-state.json, selectedAgents) or, when no record exists,
# from ownership-confirmed placed copies; the legacy agentHosts field is an
# auxiliary signal. Unreadable or invalid records stop with guidance instead
# of inference. Updates and removals touch only copies confirmed as owned
# (recorded path + matching content summary, or content identical to what
# this archive would place); mismatching copies are kept, reported, and the
# apply fails without updating the record.
# Placement roots (real-file copies):
#   .opencode/        commands, agentdev-* skills/tools/plugins + loader shims (opencode)
#   .senpi/skills/    agentdev-* entry projection from src/common/skills/ (senpi)
#   .agents/skills/   shared agentdev-* entry projection (codex or antigravity)
#   .agents/agentdev/ common (src/common/), senpi (src/senpi/),
#                     codex (src/codex/), antigravity (src/antigravity/)
#                     connection copies; common is also placed when senpi is
#                     selected (the senpi modules import the shared library
#                     via relative paths through the sibling common/ area)
# The correspondence declaration (ADF-COVERS) canonical placement is the
# regular artifacts under docs/; this file carries none.
# Keep every message ASCII-only: this installer also runs under Windows
# PowerShell 5.1 (spawned by package-release-archive.ps1), which decodes
# BOM-less UTF-8 as ANSI and would corrupt multi-byte text.
#
# Exit codes:
#   0  success (every file placed, content matches)
#   1  selection resolution failure (empty selection, unreadable/invalid
#      record with an omitted side, or ambiguous agent selection; guided)
#   4  destination content differs and is not confirmed as owned (kept,
#      reported, record not updated)
#   5  required directory creation failed / source missing (including the
#      distribution exclusion canon not found - a broken bundle is fail-closed)
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

function Get-FileSha256Hex {
    param([string]$Path)
    return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Get-TextSha256Hex {
    param([string]$Text)
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
        return ([System.BitConverter]::ToString($sha.ComputeHash($bytes))).Replace("-", "").ToLowerInvariant()
    } finally {
        $sha.Dispose()
    }
}

# Deterministic per-root content summary: ordinal-sorted "rel=sha256" lines
# joined with LF, hashed as UTF-8 text. The empty root hashes deterministically.
function Get-AggregateFromLines {
    param([string[]]$Lines)
    $sorted = [string[]]@($Lines)
    [System.Array]::Sort($sorted, [System.StringComparer]::Ordinal)
    return (Get-TextSha256Hex -Text ([System.String]::Join("`n", $sorted)))
}

$AgentSelectionCanonicalOrder = @("opencode", "senpi", "codex", "antigravity")

# Managed subset predicate per copy root key. Rel paths use backslashes and
# are relative to the root directory.
function Test-ManagedRootRel {
    param([string]$RootKey, [string]$Rel)
    $relNorm = $Rel.Replace("/", "\")
    # bun install output and the vendored textlint engine are consumer-generated
    # dependencies, not managed content: they must not flip an owned root into
    # conflict on re-install (removal still takes the whole plugin directory).
    $segments = $relNorm.Split("\")
    if ($segments -contains "node_modules" -or $segments -contains "vendor") { return $false }
    $firstSeg = $relNorm.Split("\")[0]
    switch ($RootKey) {
        "commands"     { return ($relNorm -like "agentdev\*") }
        "skills"       { return ($firstSeg -like "agentdev-*") }
        "tools"        { return ($firstSeg -like "agentdev-*") }
        "senpi"        { return ($firstSeg -like "agentdev-*") }
        "agent-skills" { return ($firstSeg -like "agentdev-*") }
        "plugins" {
            if ($relNorm.Split("\").Count -eq 1) { return ($firstSeg -like "agentdev-*.ts") }
            return ($firstSeg -like "agentdev-*")
        }
        default { return $true }  # agentdev-common / agentdev-senpi / agentdev-codex / agentdev-antigravity whole-tree copies
    }
}

# Source entries for a copy root: @{ Rel; Full; Text }. Text entries (plugin
# loader shims) are generated content without a source file.
function Get-RootSourceFiles {
    param($Spec)
    $entries = @()
    $srcDir = $Spec.SrcDir
    if (-not (Test-Path -LiteralPath $srcDir)) { return $entries }
    switch ($Spec.Kind) {
        "commands" {
            foreach ($f in (Get-ChildItem -LiteralPath $srcDir -Recurse -File)) {
                $entries += ,@{ Rel = ("agentdev\" + $f.FullName.Substring($srcDir.Length).TrimStart("\", "/")); Full = $f.FullName; Text = $null }
            }
        }
        "agentdevdirs" {
            foreach ($dir in (Get-ChildItem -LiteralPath $srcDir -Directory | Where-Object { $_.Name -like "agentdev-*" })) {
                foreach ($f in (Get-ChildItem -LiteralPath $dir.FullName -Recurse -File)) {
                    $entries += ,@{ Rel = $f.FullName.Substring($srcDir.Length).TrimStart("\", "/"); Full = $f.FullName; Text = $null }
                }
            }
        }
        "plugins" {
            $pluginDirs = @(Get-ChildItem -LiteralPath $srcDir -Directory | Where-Object {
                $_.Name -like "agentdev-*" -and $_.Name -notin $repoLocalPluginNames
            })
            foreach ($dir in $pluginDirs) {
                foreach ($f in (Get-ChildItem -LiteralPath $dir.FullName -Recurse -File)) {
                    $entries += ,@{ Rel = $f.FullName.Substring($srcDir.Length).TrimStart("\", "/"); Full = $f.FullName; Text = $null }
                }
            }
            foreach ($dir in $pluginDirs) {
                $entries += ,@{
                    Rel = ("$($dir.Name).ts")
                    Full = $null
                    Text = ("// Generated by scripts/install.ps1 / scripts/self-sync.ps1 - do not edit.`nexport { default } from `"./$($dir.Name)/plugin.ts`";`n")
                }
            }
        }
        "whole" {
            foreach ($f in (Get-ChildItem -LiteralPath $srcDir -Recurse -File)) {
                $entries += ,@{ Rel = $f.FullName.Substring($srcDir.Length).TrimStart("\", "/"); Full = $f.FullName; Text = $null }
            }
        }
    }
    return $entries
}

function Get-WouldBeAggregate {
    param($Spec)
    $lines = @()
    foreach ($e in (Get-RootSourceFiles -Spec $Spec)) {
        if ($null -ne $e.Text) { $h = Get-TextSha256Hex -Text $e.Text }
        else { $h = Get-FileSha256Hex -Path $e.Full }
        $lines += ($e.Rel + "=" + $h)
    }
    return (Get-AggregateFromLines -Lines $lines)
}

# Current managed state of a copy root on disk.
function Get-RootCurrentState {
    param([string]$RootKey, [string]$RootPath)
    $lines = @()
    $managedRelCount = 0
    if (Test-Path -LiteralPath $RootPath) {
        $rootPrefix = $RootPath.TrimEnd("\") + "\"
        foreach ($f in (Get-ChildItem -LiteralPath $RootPath -Recurse -File)) {
            $rel = $f.FullName.Substring($rootPrefix.Length)
            if (-not (Test-ManagedRootRel -RootKey $RootKey -Rel $rel)) { continue }
            $managedRelCount++
            $lines += ($rel + "=" + (Get-FileSha256Hex -Path $f.FullName))
        }
    }
    return [pscustomobject]@{ Aggregate = (Get-AggregateFromLines -Lines $lines); ManagedRelCount = $managedRelCount }
}

function Remove-TopLevelManagedDirs {
    param([string]$RootPath)
    foreach ($dir in (Get-ChildItem -LiteralPath $RootPath -Directory | Where-Object { $_.Name -like "agentdev-*" })) {
        Remove-Item -LiteralPath $dir.FullName -Recurse -Force
    }
}

function Remove-ManagedSubset {
    param([string]$RootKey, [string]$RootPath)
    if (-not (Test-Path -LiteralPath $RootPath)) { return }
    switch ($RootKey) {
        "commands" {
            $agentdevDir = Join-Path $RootPath "agentdev"
            if (Test-Path -LiteralPath $agentdevDir) { Remove-Item -LiteralPath $agentdevDir -Recurse -Force }
        }
        "skills"       { Remove-TopLevelManagedDirs -RootPath $RootPath }
        "tools"        { Remove-TopLevelManagedDirs -RootPath $RootPath }
        "senpi"        { Remove-TopLevelManagedDirs -RootPath $RootPath }
        "agent-skills" { Remove-TopLevelManagedDirs -RootPath $RootPath }
        "plugins" {
            Remove-TopLevelManagedDirs -RootPath $RootPath
            foreach ($f in (Get-ChildItem -LiteralPath $RootPath -File | Where-Object { $_.Name -like "agentdev-*.ts" })) {
                Remove-Item -LiteralPath $f.FullName -Force
            }
        }
        default { Remove-Item -LiteralPath $RootPath -Recurse -Force }
    }
}

function Remove-EmptyDirChain {
    param([string[]]$Paths)
    foreach ($p in $Paths) {
        if ((Test-Path -LiteralPath $p) -and (@(Get-ChildItem -LiteralPath $p -Force).Count -eq 0)) {
            Remove-Item -LiteralPath $p -Force
        }
    }
}

function Place-FileOverwrite {
    param([string]$SrcFile, [string]$DstFile)
    if (Test-Path -LiteralPath $DstFile) {
        if ((Get-FileHash -LiteralPath $SrcFile -Algorithm SHA256).Hash.ToLowerInvariant() -eq (Get-FileHash -LiteralPath $DstFile -Algorithm SHA256).Hash.ToLowerInvariant()) {
            return
        }
    } else {
        Ensure-Directory -Path (Split-Path -Parent $DstFile)
    }
    try {
        Copy-Item -LiteralPath $SrcFile -Destination $DstFile -Force
    } catch {
        Write-Host "install-from-archive: copy failed '$SrcFile' -> '$DstFile': $($_.Exception.Message)" -ForegroundColor Red
        exit 5
    }
}

function Write-TextFileUtf8NoBom {
    param([string]$DstFile, [string]$Text)
    Ensure-Directory -Path (Split-Path -Parent $DstFile)
    try {
        [System.IO.File]::WriteAllText($DstFile, $Text, (New-Object System.Text.UTF8Encoding($false)))
    } catch {
        Write-Host "install-from-archive: failed to write '$DstFile': $($_.Exception.Message)" -ForegroundColor Red
        exit 5
    }
}

if (-not (Test-Path -LiteralPath $Source)) {
    Write-Host "install-from-archive: source directory not found: $Source" -ForegroundColor Red
    exit 5
}

# Canonical archive layout: $Source is the archive's src/ directory.
# Commands/skills/tools and the agentdev-common copy come from the canonical
# tree (src/common/); Plugins/Hooks come from the OpenCode host connection
# area (src/opencode/); the Senpi entry projection copies agentdev-* skills
# from src/common/skills/ and the Senpi connection copy places src/senpi/ at
# .agents/agentdev/senpi; the Codex / Antigravity connection copies come from
# src/codex/ and src/antigravity/.
$commonSrc = Join-Path $Source "common"
$opencodeSrc = Join-Path $Source "opencode"
$senpiSrc = Join-Path $Source "senpi"
$codexSrc = Join-Path $Source "codex"
$antigravitySrc = Join-Path $Source "antigravity"
$commandsSrc = Join-Path $commonSrc "commands\agentdev"
$skillsSrc = Join-Path $commonSrc "skills"

if (-not (Test-Path -LiteralPath $commandsSrc)) {
    Write-Host "install-from-archive: required source directory missing: $commandsSrc" -ForegroundColor Red
    exit 5
}
if (-not (Test-Path -LiteralPath $skillsSrc)) {
    Write-Host "install-from-archive: required source directory missing: $skillsSrc" -ForegroundColor Red
    exit 5
}

# The distribution exclusion canon travels inside the archive next to this
# installer and is the single source of the repo-local Plugin exclusion set
# across the distribution entries. It must be loaded before selection
# resolution because the Plugins copy root needs $repoLocalPluginNames.
$distExclusionCanonPath = $null
foreach ($canonCandidate in @(
    (Join-Path $PSScriptRoot "consumer\distribution-exclusion.ps1"),
    (Join-Path $PSScriptRoot "..\distribution-exclusion.ps1")
)) {
    if (Test-Path -LiteralPath $canonCandidate) { $distExclusionCanonPath = $canonCandidate; break }
}
if ($null -eq $distExclusionCanonPath) {
    Write-Host "install-from-archive: distribution exclusion canon not found (fail-closed, exit 5): consumer\distribution-exclusion.ps1" -ForegroundColor Red
    exit 5
}
. $distExclusionCanonPath

$distributionVersion = $null
$versionFile = Join-Path $commonSrc "VERSION"
if (Test-Path -LiteralPath $versionFile) {
    $distributionVersion = [System.IO.File]::ReadAllText($versionFile).Trim()
}

$repoRootDir = Split-Path -Parent $Target
$installStatePath = Join-Path $repoRootDir ".agentdev\install-state.json"

# --- selection resolution (explicit > record > observed; fail-closed) -------

function Read-InstallStateRecordArchive {
    if (-not (Test-Path -LiteralPath $installStatePath)) {
        return [pscustomobject]@{ Status = "missing"; Agents = @(); Raw = $null }
    }
    try {
        $raw = [System.IO.File]::ReadAllText($installStatePath) | ConvertFrom-Json
    } catch {
        return [pscustomobject]@{ Status = "invalid"; Agents = @(); Raw = $null }
    }
    if ($raw -isnot [pscustomobject]) {
        return [pscustomobject]@{ Status = "invalid"; Agents = @(); Raw = $null }
    }
    if ($raw.PSObject.Properties["selectedAgents"]) {
        $requested = @($raw.selectedAgents)
        $agents = @($requested | ForEach-Object { [string]$_ } | Where-Object { $_ -in $AgentSelectionCanonicalOrder })
        if ($agents.Count -gt 0 -and $agents.Count -eq $requested.Count) {
            return [pscustomobject]@{ Status = "ok"; Agents = $agents; Raw = $raw }
        }
    }
    if ($raw.PSObject.Properties["agentHosts"] -and $raw.agentHosts -is [string]) {
        switch ($raw.agentHosts) {
            "none"        { return [pscustomobject]@{ Status = "legacy"; Agents = @(); Raw = $raw } }
            "codex"       { return [pscustomobject]@{ Status = "legacy"; Agents = @("codex"); Raw = $raw } }
            "antigravity" { return [pscustomobject]@{ Status = "legacy"; Agents = @("antigravity"); Raw = $raw } }
            "both"        { return [pscustomobject]@{ Status = "legacy"; Agents = @("codex", "antigravity"); Raw = $raw } }
        }
    }
    return [pscustomobject]@{ Status = "invalid"; Agents = @(); Raw = $null }
}

$stateRecord = Read-InstallStateRecordArchive
$stateRecordRaw = $stateRecord.Raw

$observedOpen = $false
foreach ($probeKey in @("commands", "skills", "tools", "plugins")) {
    $probe = Get-RootCurrentState -RootKey $probeKey -RootPath (Join-Path $Target $probeKey)
    if ($probe.ManagedRelCount -gt 0) { $observedOpen = $true; break }
}
$observedSenpi = ((Test-Path -LiteralPath (Join-Path $repoRootDir ".senpi\skills")) -or (Test-Path -LiteralPath (Join-Path $repoRootDir ".agents\agentdev\senpi")))
$observedAgentSet = @()
foreach ($agentName in @("codex", "antigravity")) {
    if (Test-Path -LiteralPath (Join-Path $repoRootDir (".agents\agentdev\" + $agentName))) { $observedAgentSet += $agentName }
}
$observedEntryOnly = $false
$entrySkillsPath = Join-Path $repoRootDir ".agents\skills"
if (Test-Path -LiteralPath $entrySkillsPath) {
    $entryDirCount = @(Get-ChildItem -LiteralPath $entrySkillsPath -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "agentdev-*" }).Count
    if ($entryDirCount -gt 0 -and $observedAgentSet.Count -eq 0) { $observedEntryOnly = $true }
}

$openExplicit = $null
switch ($Hosts) {
    "opencode" { $openExplicit = @("opencode") }
    "senpi"    { $openExplicit = @("senpi") }
    "both"     { $openExplicit = @("opencode", "senpi") }
    "none"     { $openExplicit = @() }
}
$agentExplicit = $null
switch ($AgentHosts) {
    "codex"       { $agentExplicit = @("codex") }
    "antigravity" { $agentExplicit = @("antigravity") }
    "both"        { $agentExplicit = @("codex", "antigravity") }
    "none"        { $agentExplicit = @() }
}

$needRecord = (($null -eq $openExplicit) -or ($null -eq $agentExplicit))
if ($needRecord -and $stateRecord.Status -eq "invalid") {
    Write-Host "install-from-archive: install state record is unreadable or invalid (exit 1): $installStatePath" -ForegroundColor Red
    Write-Host "  Fix or delete the record, or pass both -Hosts and -AgentHosts explicitly to ignore it."
    exit 1
}

$recordOpenSet = @()
$recordAgentSet = @()
if ($stateRecord.Status -eq "ok") {
    $recordOpenSet = @($stateRecord.Agents | Where-Object { $_ -in @("opencode", "senpi") })
    $recordAgentSet = @($stateRecord.Agents | Where-Object { $_ -in @("codex", "antigravity") })
} elseif ($stateRecord.Status -eq "legacy") {
    $recordAgentSet = @($stateRecord.Agents)
    Write-Host "install-from-archive: legacy install state (agentHosts) used as an auxiliary signal"
}

$freshTarget = (($stateRecord.Status -eq "missing") -and (-not $observedOpen) -and (-not $observedSenpi) -and ($observedAgentSet.Count -eq 0) -and (-not $observedEntryOnly))

$openSet = @()
if ($null -ne $openExplicit) { $openSet = $openExplicit }
elseif ($stateRecord.Status -eq "ok") { $openSet = $recordOpenSet }
elseif ($observedOpen -or $observedSenpi) {
    if ($observedOpen) { $openSet += "opencode" }
    if ($observedSenpi) { $openSet += "senpi" }
}
elseif ($freshTarget) { $openSet = @("opencode", "senpi") }

$agentSet = @()
if ($null -ne $agentExplicit) { $agentSet = $agentExplicit }
elseif ($stateRecord.Status -in @("ok", "legacy")) { $agentSet = $recordAgentSet }
elseif ($observedAgentSet.Count -gt 0) { $agentSet = $observedAgentSet }
elseif ($observedEntryOnly) {
    Write-Host "install-from-archive: ambiguous agent selection (exit 1)." -ForegroundColor Red
    Write-Host "  A shared agent entry projection (.agents/skills/agentdev-*) exists but no .agents/agentdev/<agent> copy identifies the owning agent."
    Write-Host "  Pass -AgentHosts codex, antigravity, both (or none) explicitly."
    exit 1
}

if ($freshTarget) {
    Write-Host "install-from-archive: fresh target (no placement, no record); defaulting OpenCode + Senpi (override with -Hosts / -AgentHosts)"
}

$selectedAgents = @($AgentSelectionCanonicalOrder | Where-Object { ($openSet -contains $_) -or ($agentSet -contains $_) })
if ($selectedAgents.Count -eq 0) {
    Write-Host "install-from-archive: resolved selection is empty (exit 1)." -ForegroundColor Red
    Write-Host "  Pass -Hosts and/or -AgentHosts explicitly, e.g.: install.ps1 -Hosts opencode -AgentHosts codex"
    exit 1
}

$openSelected = [bool]($selectedAgents -contains "opencode")
$senpiSelected = [bool]($selectedAgents -contains "senpi")
$codexSelected = [bool]($selectedAgents -contains "codex")
$antigravitySelected = [bool]($selectedAgents -contains "antigravity")
$agentSideSelected = ($codexSelected -or $antigravitySelected)

# Required-when-selected source checks (commands/skills are always required).
if ($openSelected -and -not (Test-Path -LiteralPath $opencodeSrc)) {
    Write-Host "install-from-archive: OpenCode selected but src/opencode/ is missing in the archive (exit 5): $opencodeSrc" -ForegroundColor Red
    exit 5
}
if ($senpiSelected -and -not (Test-Path -LiteralPath $senpiSrc)) {
    Write-Host "install-from-archive: Senpi selected but src/senpi/ is missing in the archive (exit 5): $senpiSrc" -ForegroundColor Red
    Write-Host "  To place OpenCode only, re-run with -Hosts opencode."
    exit 5
}
if ($codexSelected -and -not (Test-Path -LiteralPath $codexSrc)) {
    Write-Host "install-from-archive: Codex selected but src/codex/ is missing in the archive (exit 5): $codexSrc" -ForegroundColor Red
    exit 5
}
if ($antigravitySelected -and -not (Test-Path -LiteralPath $antigravitySrc)) {
    Write-Host "install-from-archive: Antigravity selected but src/antigravity/ is missing in the archive (exit 5): $antigravitySrc" -ForegroundColor Red
    exit 5
}

# --- copy roots and ownership -------------------------------------------------

$copyRoots = @(
    [pscustomobject]@{ Key = "commands";             RootPath = (Join-Path $Target "commands");                          SrcDir = $commandsSrc;    Kind = "commands" }
    [pscustomobject]@{ Key = "skills";               RootPath = (Join-Path $Target "skills");                            SrcDir = $skillsSrc;      Kind = "agentdevdirs" }
    [pscustomobject]@{ Key = "tools";                RootPath = (Join-Path $Target "tools");                             SrcDir = (Join-Path $commonSrc "tools"); Kind = "agentdevdirs" }
    [pscustomobject]@{ Key = "plugins";              RootPath = (Join-Path $Target "plugins");                           SrcDir = (Join-Path $opencodeSrc "plugins"); Kind = "plugins" }
    [pscustomobject]@{ Key = "senpi";                RootPath = (Join-Path $repoRootDir ".senpi\skills");                SrcDir = $skillsSrc;      Kind = "agentdevdirs" }
    [pscustomobject]@{ Key = "agent-skills";         RootPath = (Join-Path $repoRootDir ".agents\skills");               SrcDir = $skillsSrc;      Kind = "agentdevdirs" }
    [pscustomobject]@{ Key = "agentdev-common";      RootPath = (Join-Path $repoRootDir ".agents\agentdev\common");      SrcDir = $commonSrc;      Kind = "whole" }
    [pscustomobject]@{ Key = "agentdev-senpi";       RootPath = (Join-Path $repoRootDir ".agents\agentdev\senpi");       SrcDir = $senpiSrc;       Kind = "whole" }
    [pscustomobject]@{ Key = "agentdev-codex";       RootPath = (Join-Path $repoRootDir ".agents\agentdev\codex");       SrcDir = $codexSrc;       Kind = "whole" }
    [pscustomobject]@{ Key = "agentdev-antigravity"; RootPath = (Join-Path $repoRootDir ".agents\agentdev\antigravity"); SrcDir = $antigravitySrc; Kind = "whole" }
)

function Test-RootSelected {
    param([string]$RootKey)
    switch ($RootKey) {
        "commands"             { return $openSelected }
        "skills"               { return $openSelected }
        "tools"                { return $openSelected }
        "plugins"              { return $openSelected }
        "senpi"                { return $senpiSelected }
        "agent-skills"         { return $agentSideSelected }
        "agentdev-common"      { return ($senpiSelected -or $agentSideSelected) }
        "agentdev-senpi"       { return $senpiSelected }
        "agentdev-codex"       { return $codexSelected }
        "agentdev-antigravity" { return $antigravitySelected }
    }
    return $false
}

# --- phase A: ownership per root (fail-closed before any apply) ---------------
# A root is confirmed as owned when its current managed content matches the
# recorded summary, or matches what this archive would place (adopt). Absent
# managed content places freely. Anything else is a conflict: kept, reported,
# apply fails, record not updated.
$rootStates = @{}
$conflicts = @()
foreach ($spec in $copyRoots) {
    $current = Get-RootCurrentState -RootKey $spec.Key -RootPath $spec.RootPath
    $wouldBe = Get-WouldBeAggregate -Spec $spec
    $recorded = $null
    if ($null -ne $stateRecordRaw -and $stateRecordRaw.PSObject.Properties["placedCopies"]) {
        foreach ($pc in @($stateRecordRaw.placedCopies)) {
            if ([string]$pc.root -eq $spec.Key) { $recorded = [string]$pc.sha256; break }
        }
    }
    $status = "conflict"
    if ($current.ManagedRelCount -eq 0) { $status = "absent" }
    elseif ($recorded -and $current.Aggregate -eq $recorded) { $status = "owned" }
    elseif ($current.Aggregate -eq $wouldBe) { $status = "adopt" }
    $selected = Test-RootSelected -RootKey $spec.Key
    $rootStates[$spec.Key] = [pscustomobject]@{ Spec = $spec; Current = $current; WouldBe = $wouldBe; Selected = $selected; Status = $status }
    if ($status -eq "conflict") {
        if ($selected) {
            $conflicts += ("root '$($spec.Key)': managed copies under $($spec.RootPath) differ from the recorded state and from what this archive would place")
        } else {
            $conflicts += ("root '$($spec.Key)': removal skipped; managed copies under $($spec.RootPath) are not confirmed as owned")
        }
    }
}
if ($conflicts.Count -gt 0) {
    foreach ($c in $conflicts) {
        Write-Host "install-from-archive: destination content conflict (exit 4): $c" -ForegroundColor Red
    }
    Write-Host "install-from-archive: conflicting copies were kept untouched; the install state record was not updated"
    exit 4
}

# --- phase B: removals for deselected roots (owned or adoptable only) ---------
foreach ($spec in $copyRoots) {
    $st = $rootStates[$spec.Key]
    if ($st.Selected -or ($st.Status -notin @("owned", "adopt"))) { continue }
    Remove-ManagedSubset -RootKey $spec.Key -RootPath $spec.RootPath
    Write-Host "install-from-archive: removed agent-owned copies, root '$($spec.Key)': $($spec.RootPath)"
}
Remove-EmptyDirChain -Paths @(
    (Join-Path $repoRootDir ".agents\agentdev\senpi"),
    (Join-Path $repoRootDir ".agents\agentdev"),
    (Join-Path $repoRootDir ".agents"),
    (Join-Path $repoRootDir ".senpi\skills"),
    (Join-Path $repoRootDir ".senpi")
)

# --- phase C: placement for selected roots ------------------------------------
foreach ($spec in $copyRoots) {
    $st = $rootStates[$spec.Key]
    if (-not $st.Selected) { continue }
    Ensure-Directory -Path $spec.RootPath
    $entries = @(Get-RootSourceFiles -Spec $spec)
    $targetRels = @{}
    foreach ($e in $entries) {
        $dst = Join-Path $spec.RootPath $e.Rel
        $targetRels[$e.Rel] = $true
        if ($null -ne $e.Text) {
            $needsWrite = $true
            if (Test-Path -LiteralPath $dst) {
                if ([System.IO.File]::ReadAllText($dst) -eq $e.Text) { $needsWrite = $false }
            }
            if ($needsWrite) { Write-TextFileUtf8NoBom -DstFile $dst -Text $e.Text }
        } else {
            Place-FileOverwrite -SrcFile $e.Full -DstFile $dst
        }
    }
    # Reconcile: drop managed files this archive no longer places.
    if (Test-Path -LiteralPath $spec.RootPath) {
        $rootPrefix = $spec.RootPath.TrimEnd("\") + "\"
        foreach ($f in (Get-ChildItem -LiteralPath $spec.RootPath -Recurse -File)) {
            $rel = $f.FullName.Substring($rootPrefix.Length)
            if ((Test-ManagedRootRel -RootKey $spec.Key -Rel $rel) -and (-not $targetRels.ContainsKey($rel))) {
                Remove-Item -LiteralPath $f.FullName -Force
            }
        }
    }
    Write-Host ("install-from-archive: placed root '$($spec.Key)' ($($entries.Count) files): $($spec.RootPath)")
}

# Custom Tools and Plugins are handled as copy roots ("tools", "plugins")
# above; the repo-local Plugin exclusion comes from the distribution
# exclusion canon loaded before selection resolution.

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
if ($openSelected -and (Test-Path -LiteralPath $textlintGuardDir)) {
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

# Plugin loader shims (depth-1 re-export files) are generated as part of the
# "plugins" copy root above.

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
if (-not $openSelected) {
    Write-Host "install-from-archive: third-party skill drift check skipped (OpenCode not selected)"
} elseif ($null -eq $thirdPartyDeclPath) {
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

# --- phase D: record the applied selection and per-root content summaries -----
$placedCopies = @()
foreach ($spec in $copyRoots) {
    if (Test-RootSelected -RootKey $spec.Key) {
        $placedCopies += ,@{ root = $spec.Key; sha256 = $rootStates[$spec.Key].WouldBe }
    }
}
$recordObj = [ordered]@{
    distributionVersion = $distributionVersion
    recordedAt = ((Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ"))
    selectedAgents = [string[]]$selectedAgents
    placedCopies = @($placedCopies)
}
Ensure-Directory -Path (Join-Path $repoRootDir ".agentdev")
try {
    [System.IO.File]::WriteAllText($installStatePath, ((ConvertTo-Json -InputObject $recordObj -Depth 5) + "`n"), (New-Object System.Text.UTF8Encoding($false)))
} catch {
    Write-Host "install-from-archive: failed to write install state record '$installStatePath': $($_.Exception.Message)" -ForegroundColor Red
    exit 5
}
Write-Host "install-from-archive: install state recorded: $installStatePath"

$labelMap = @{ opencode = "OpenCode"; senpi = "Senpi"; codex = "Codex"; antigravity = "Antigravity" }
$selectedLabels = @($selectedAgents | ForEach-Object { $labelMap[$_] })
Write-Host ("install-from-archive: selection: " + ($selectedLabels -join " + "))
exit 0
