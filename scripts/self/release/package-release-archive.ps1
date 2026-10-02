[CmdletBinding()]
param()

# ADF-COVERS(implementation): REQ-050-009, REQ-050-010
# ADF-COVERS(verification): REQ-050-010, REQ-050-011
# ADF-COVERS(implementation): REQ-052-007
#
# WP-3 (Issue #1928) §7.5.1: build a junction-free release archive from the
# repo's multi-host canonical source tree (DEC-049: src/common/ canonical +
# host connection areas, REQ-099-020). The archive contains:
#   agentdev-release-<sha>/
#     src/common/commands/agentdev/**.md
#     src/common/skills/agentdev-*/**
#     src/common/tools/agentdev-*/**          (Custom Tool distribution type)
#     src/opencode/plugins/agentdev-*/**      (Plugin / Hook distribution type,
#                                              EXCLUDING vendor/ — the textlint
#                                              guard dependency artifacts are
#                                              resolved at install time from the
#                                              shipped version pin metadata)
#     scripts/install.ps1            (projected from scripts/consumer/archive/install.ps1)
#     README-INSTALL.md
#     THIRD-PARTY-NOTICES.md         (third-party dependency and license notices)
# Junctions are resolved to real file content so the archive is self-contained.
#
# REQ-050-010: the archive-dedicated installer original is kept at
# scripts/consumer/archive/install.ps1, SEPARATE from the checkout consumer
# entry (scripts/install.ps1). Inside the release archive it is placed under
# the projection name scripts/install.ps1. The checkout edition and the
# archive edition are different installation projections and are NOT forced
# into one implementation.
#
# DEC-014 decision 7 / TS-008 / TS-010 (Issue #2092): before publishing the
# final archive, two projection boundary inspections are run against the
# canonical distribution-boundary adapter (the trusted host checker at
# .opencode/skills/repo-agentdev-integrity/, NOT the candidate copy that
# travels inside the archive):
#   1. archive projection on the staged src/common/ + src/opencode/plugins
#      content
#   2. archive projection on the archive EXTRAS (README-INSTALL.md,
#      scripts/install.ps1 archive edition) — these live outside src/common/
#      so the host checker's archive profile would otherwise skip them
#   3. archive-installed projection on the extracted+installed content
# The final archive is published by an atomic no-clobber HARD LINK after
# all validations pass. The link primitive lives in
# scripts/self/release/publish-hard-link.ts (trusted host Bun helper that calls
# `fs.linkSync` and fails with EEXIST on collision). PowerShell 10 / .NET
# 10 does not surface [System.IO.File]::CreateHardLink, so the publish
# primitive is delegated to the helper (same primitive Stage A uses).
# There is NO copy fallback, NO rename fallback, NO Move-Item fallback:
# a pre-existing final ZIP at the publish moment is fatal. Cleanup-on-
# every-exception guarantees no staging residue is left behind on any
# failure path; cleanup AFTER successful publication is best-effort and
# cannot remove the durable final link (the staged and final names share
# the same inode until the staged name is removed).
#
# Exit codes (every failure path cleans up staging before exiting):
#   0  success (final archive published via atomic no-clobber hard link,
#               path printed to stdout)
#   2  required source dir or file missing (host-side pre-condition; includes
#      THIRD-PARTY-NOTICES.md missing at repo root — the archive must carry the
#      third-party notices, fail-closed)
#   3  pre-existing final archive collision (never overwritten)
#   6  archive projection boundary check failed (src/common/ + host
#      connection area, or extras)
#   7  archive-installed projection boundary check failed
#   8  trusted host boundary checker or publish helper missing (fail-closed,
#      Oracle finding 6)
#   9  archive expansion, installer invocation, install-into-target
#      verification, version pin metadata missing in the staged plugin, or
#      atomic publish failed after staging

$ErrorActionPreference = "Stop"

# Write-Error under Stop mode throws and skips any subsequent `exit <N>`,
# which would mask the documented exit code. Use [Console]::Error.WriteLine
# + explicit exit (matches scripts/self/release/trusted-distribution-gate.ps1 pattern).
function Fail-Exit {
    param([int]$Code, [string]$Message)
    [Console]::Error.WriteLine($Message)
    exit $Code
}

# scripts/self/release/ -> repo root is three levels up.
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path

# Canonical sources (DEC-049, REQ-099-020): commands/skills and Custom Tools
# live under the host-independent canonical tree src/common/; Plugins/Hooks
# stay in the OpenCode host connection area (src/opencode/plugins).
$srcCommands = Join-Path $repoRoot "src\common\commands\agentdev"
$srcSkills = Join-Path $repoRoot "src\common\skills"
# Archive-dedicated installer ORIGINAL (REQ-050-010). Travels inside the
# archive under the projection name scripts/install.ps1.
$installScript = Join-Path $repoRoot "scripts\consumer\archive\install.ps1"
# Archive-bundled install guide. The archive-bundled install guide travels
# inside the archive as README-INSTALL.md (the trust-root manifest of the
# trusted distribution gate requires it at the repository root, REQ-050-011).
$readmeInstall = Join-Path $repoRoot "README-INSTALL.md"
# THIRD-PARTY-NOTICES.md は release archive の必須同梱物（依存実体を含まない配布の
# third-party 通知。欠落時は fail-closed）。
$thirdPartyNotices = Join-Path $repoRoot "THIRD-PARTY-NOTICES.md"

if (-not (Test-Path -LiteralPath $srcCommands)) {
    Fail-Exit 2 "package-release-archive: required source directory missing: $srcCommands"
}
if (-not (Test-Path -LiteralPath $srcSkills)) {
    Fail-Exit 2 "package-release-archive: required source directory missing: $srcSkills"
}
if (-not (Test-Path -LiteralPath $installScript)) {
    Fail-Exit 2 "package-release-archive: trusted archive installer original missing: $installScript (scripts/consumer/archive/install.ps1, REQ-050-010)"
}
if (-not (Test-Path -LiteralPath $thirdPartyNotices)) {
    Fail-Exit 2 "package-release-archive: THIRD-PARTY-NOTICES.md missing at repo root: $thirdPartyNotices (the archive must carry the third-party dependency notices; fail-closed)"
}

# Trusted host checker (NOT the candidate copy inside the archive). Per
# v2:REQ-0145-014 / integrity-contracts.md "release profile", the host checker
# is the authority; the archive copy ships for consumer install but is not
# trusted to validate itself.
$boundaryChecker = Join-Path $repoRoot ".opencode\skills\repo-agentdev-integrity\scripts\check_distribution_boundary.ts"
if (-not (Test-Path -LiteralPath $boundaryChecker)) {
    Fail-Exit 8 "package-release-archive: trusted host boundary checker missing: $boundaryChecker (fail-closed per Oracle finding 6)"
}

# Trusted host publish primitive (NOT the candidate copy inside the archive).
# Delegation target for the atomic no-clobber hard-link linearization
# (Issue #2092 Stage B). PowerShell 10 / .NET 10 does not surface
# [System.IO.File]::CreateHardLink, so the link primitive is the same
# `fs.linkSync` call Stage A uses (archive-publish.ts). Array-form bun
# invocation: no shell interpolation of the path arguments.
$publishHelper = Join-Path $PSScriptRoot "publish-hard-link.ts"
if (-not (Test-Path -LiteralPath $publishHelper)) {
    Fail-Exit 8 "package-release-archive: trusted host publish helper missing: $publishHelper (fail-closed per Oracle finding 6)"
}

$commitShort = (& git -C $repoRoot rev-parse --short HEAD 2>$null)
if (-not $commitShort) {
    Fail-Exit 2 "package-release-archive: could not resolve git commit short hash"
}
$commitShort = $commitShort.Trim()

$archiveName = "agentdev-release-$commitShort"
$distDir = Join-Path $repoRoot "dist"
$finalZip = Join-Path $distDir "$archiveName.zip"

# Pre-existing final collision: refuse to overwrite, never delete+rewrite.
# The atomic publish step at the end re-checks so a race that introduces a
# final ZIP between this check and publish still fails safely.
if (Test-Path -LiteralPath $finalZip) {
    Fail-Exit 3 "package-release-archive: final archive already exists (delete it before rebuilding): $finalZip"
}

if (-not (Test-Path -LiteralPath $distDir)) {
    New-Item -ItemType Directory -Path $distDir -Force | Out-Null
}

# Unique staging root per run: random suffix avoids TEMP collisions between
# concurrent invocations and makes orphans self-evident. Stage INSIDE dist/
# so the final publish is a same-filesystem atomic rename.
$runId = ([System.IO.Path]::GetRandomFileName()) -replace '\.', ''
$stageBase = Join-Path $distDir ".trust-stage-$runId"
$stageArchiveRoot = Join-Path $stageBase $archiveName
$stagedZip = Join-Path $stageBase "archive.zip"
$extrasScanRoot = Join-Path $stageBase "extras-scan"

# Idempotent cleanup of THIS run's staging only. Best-effort: failures are
# swallowed so the original failure path remains the reported one.
$stageCleaned = $false
function Cleanup-Stage {
    if ($script:stageCleaned) { return }
    $script:stageCleaned = $true
    if (Test-Path -LiteralPath $stageBase) {
        Remove-Item -LiteralPath $stageBase -Recurse -Force -ErrorAction SilentlyContinue
    }
}

try {
    # Stage directory layout under <stageBase>/<archiveName>/ (DEC-049
    # canonical layout: src/common/ canonical + host connection areas).
    $stageSrc = Join-Path $stageArchiveRoot "src"
    $stageSrcCommon = Join-Path $stageArchiveRoot "src\common"
    $stageSrcOpencode = Join-Path $stageArchiveRoot "src\opencode"
    $stageCommands = Join-Path $stageSrcCommon "commands\agentdev"
    $stageSkills = Join-Path $stageSrcCommon "skills"
    $stageScripts = Join-Path $stageArchiveRoot "scripts"

    New-Item -ItemType Directory -Path $stageCommands -Force | Out-Null
    New-Item -ItemType Directory -Path $stageSkills -Force | Out-Null
    New-Item -ItemType Directory -Path $stageScripts -Force | Out-Null

    # Commands: real-file recursive copy (junctions resolved by Copy-Item).
    Copy-Item -Path (Join-Path $srcCommands "*") -Destination $stageCommands -Recurse -Force

    # Skills: agentdev-* only.
    $skillDirs = Get-ChildItem -LiteralPath $srcSkills -Directory | Where-Object {
        $_.Name -like "agentdev-*"
    }
    foreach ($d in $skillDirs) {
        $stageSkillDir = Join-Path $stageSkills $d.Name
        New-Item -ItemType Directory -Path $stageSkillDir -Force | Out-Null
        Copy-Item -Path (Join-Path $d.FullName "*") -Destination $stageSkillDir -Recurse -Force
    }

    # Custom Tools / Plugins (agentdev-* distribution types, REQ-052):
    # Custom Tools are canonical (src/common/tools/); Plugins/Hooks stay in
    # the OpenCode host connection area (src/opencode/plugins/). Optional at
    # this stage — repos without these kinds simply skip them.
    # Repo-local Plugin (agentdev-distribution-boundary-guard, REQ-052-006 /
    # REQ-002-045) is excluded from consumer distribution. SYNC OBLIGATION
    # (runtime-package-boundary Design「repo-local Plugin の配布・投影契約」):
    # keep this exclusion in sync across the 3 consumer distribution paths:
    # scripts/install.ps1, scripts/consumer/archive/install.ps1, this file.
    # self-sync.ps1 must NOT exclude it (self-host projection is kept).
    $repoLocalPluginNames = @("agentdev-distribution-boundary-guard")
    foreach ($kindSpec in @(
        @{ Kind = "tools";   Source = (Join-Path $repoRoot "src\common\tools");      Stage = (Join-Path $stageSrcCommon "tools") },
        @{ Kind = "plugins"; Source = (Join-Path $repoRoot "src\opencode\plugins"); Stage = (Join-Path $stageSrcOpencode "plugins") }
    )) {
        $kind = $kindSpec.Kind
        $kindSource = $kindSpec.Source
        if (-not (Test-Path -LiteralPath $kindSource)) { continue }
        $stageKindDir = $kindSpec.Stage
        New-Item -ItemType Directory -Path $stageKindDir -Force | Out-Null
        $kindDirs = Get-ChildItem -LiteralPath $kindSource -Directory | Where-Object {
            $_.Name -like "agentdev-*" -and
            ($kind -ne "plugins" -or $_.Name -notin $repoLocalPluginNames)
        }
        foreach ($d in $kindDirs) {
            $stageEntryDir = Join-Path $stageKindDir $d.Name
            New-Item -ItemType Directory -Path $stageEntryDir -Force | Out-Null
            Copy-Item -Path (Join-Path $d.FullName "*") -Destination $stageEntryDir -Recurse -Force
        }
    }

    # node_modules は配布アーカイブに含めない (サイズ増大・consumer側のnpm installで解決)
    Get-ChildItem -LiteralPath $stageSrc -Recurse -Directory -Filter "node_modules" -ErrorAction SilentlyContinue |
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

    # vendor/ も配布アーカイブに含めない（textlint guard の導入時生成依存。版固定情報
    # （package.json + bun.lock）のみを配布し、導入先で bun install && bun run build:engine
    # により再生成する）。
    Get-ChildItem -LiteralPath $stageSrc -Recurse -Directory -Filter "vendor" -ErrorAction SilentlyContinue |
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

    # 版固定情報の staging 存在検証（fail-closed）: textlint guard plugin package が
    # staged される場合、依存を導入時生成できる版固定情報（package.json + bun.lock）が
    # 欠けていると archive から依存解決が不能になるため、staging 後に必須検査する。
    $stagedTextlintGuard = Join-Path $stageSrcOpencode "plugins\agentdev-textlint-guard"
    if (Test-Path -LiteralPath $stagedTextlintGuard) {
        foreach ($pinFile in @("package.json", "bun.lock")) {
            if (-not (Test-Path -LiteralPath (Join-Path $stagedTextlintGuard $pinFile))) {
                Cleanup-Stage
                Fail-Exit 9 "package-release-archive: version pin metadata missing in the staged textlint guard plugin: $stagedTextlintGuard\$pinFile (the archive must carry package.json and bun.lock; fail-closed)"
            }
        }
    }

    # The archive-dedicated installer travels inside the archive under the
    # projection name scripts/install.ps1 (REQ-050-010). The checkout
    # consumer entry (repository scripts/install.ps1) is a DIFFERENT
    # installation projection and must NOT be forced into this archive.
    Copy-Item -LiteralPath $installScript -Destination (Join-Path $stageScripts "install.ps1") -Force

    $readmePresent = $false
    if (Test-Path -LiteralPath $readmeInstall) {
        Copy-Item -LiteralPath $readmeInstall -Destination (Join-Path $stageArchiveRoot "README-INSTALL.md") -Force
        $readmePresent = $true
    } else {
        Write-Warning "package-release-archive: README-INSTALL.md missing at repo root; archive will omit it."
    }

    # THIRD-PARTY-NOTICES.md は必須同梱（前提検査で存在済み。欠落時は fail-closed 済み）。
    Copy-Item -LiteralPath $thirdPartyNotices -Destination (Join-Path $stageArchiveRoot "THIRD-PARTY-NOTICES.md") -Force

    # Pre-publication boundary inspection #1: staged canonical tree
    # (src/common/ + src/opencode/plugins/, DEC-049 layout).
    Write-Host "package-release-archive: running archive projection boundary check on staged src/common/ + src/opencode/plugins"
    & bun run $boundaryChecker --profile archive $stageArchiveRoot --json 2>&1 | Out-Host
    if ($LASTEXITCODE -ne 0) {
        Cleanup-Stage
        Fail-Exit 6 "package-release-archive: archive projection boundary check failed (exit $LASTEXITCODE); no final archive produced."
    }

    # Pre-publication boundary inspection #2: archive EXTRAS. The host
    # checker's archive profile walks src/common/{commands/agentdev,
    # skills/agentdev-*, tools/agentdev-*}/** and src/opencode/plugins/**, so
    # it would silently skip README-INSTALL.md, THIRD-PARTY-NOTICES.md and
    # the archive edition of scripts/install.ps1. Build an auxiliary scan
    # root with those files placed under src/common/commands/agentdev/ and
    # re-invoke the same checker there.
    $extrasScanCommands = Join-Path $extrasScanRoot "src\common\commands\agentdev"
    New-Item -ItemType Directory -Path $extrasScanCommands -Force | Out-Null
    Copy-Item -LiteralPath (Join-Path $stageScripts "install.ps1") -Destination (Join-Path $extrasScanCommands "install.ps1.archive-extra.ps1") -Force
    if ($readmePresent) {
        Copy-Item -LiteralPath (Join-Path $stageArchiveRoot "README-INSTALL.md") -Destination (Join-Path $extrasScanCommands "README-INSTALL.md") -Force
    }
    Copy-Item -LiteralPath (Join-Path $stageArchiveRoot "THIRD-PARTY-NOTICES.md") -Destination (Join-Path $extrasScanCommands "THIRD-PARTY-NOTICES.md") -Force
    Write-Host "package-release-archive: running archive projection boundary check on archive extras (README-INSTALL.md, THIRD-PARTY-NOTICES.md, scripts/install.ps1 archive edition)"
    & bun run $boundaryChecker --profile archive $extrasScanRoot --json 2>&1 | Out-Host
    if ($LASTEXITCODE -ne 0) {
        Cleanup-Stage
        Fail-Exit 6 "package-release-archive: archive-extras projection boundary check failed (exit $LASTEXITCODE); no final archive produced."
    }

    # Build the ZIP into the staging directory. The final path is touched
    # ONLY by the atomic publish step after every validation passes.
    Compress-Archive -Path $stageArchiveRoot -DestinationPath $stagedZip -Force

    # Post-archive validation: extract to a unique TEMP root, install, and
    # run the archive-installed projection. Unique roots avoid collisions
    # with concurrent or prior runs (no deterministic commitShort-suffix).
    $extractRoot = Join-Path $stageBase "extract-$runId"
    $installedRoot = Join-Path $stageBase "installed-$runId"
    New-Item -ItemType Directory -Path $extractRoot -Force | Out-Null
    New-Item -ItemType Directory -Path $installedRoot -Force | Out-Null

    Expand-Archive -LiteralPath $stagedZip -DestinationPath $extractRoot -Force
    $extractedRoot = Get-ChildItem -LiteralPath $extractRoot -Directory | Select-Object -First 1
    if (-not $extractedRoot) {
        Cleanup-Stage
        Fail-Exit 9 "package-release-archive: archive extraction produced no root directory"
    }
    $extractedRootPath = $extractedRoot.FullName
    # The archive-edition installer resolves the canonical layout under src/
    # (src/common/ + src/opencode/plugins/, DEC-049) itself.
    $installedSrc = Join-Path $extractedRootPath "src"
    $installedTarget = Join-Path $installedRoot ".opencode"
    # Verify the candidate archive CONTAINS the archive edition installer
    # (scripts/install.ps1) as an artifact. Presence is required; the file
    # is NOT executed (Stage B byte-binding / untrusted-execution defense,
    # Issue #2092).
    $installFromArchive = Join-Path $extractedRootPath "scripts\install.ps1"
    if (-not (Test-Path -LiteralPath $installFromArchive)) {
        Cleanup-Stage
        Fail-Exit 9 "package-release-archive: scripts/install.ps1 (archive edition) missing from extracted archive: $installFromArchive"
    }
    # Stage B vendor pre-provisioning (verification environment only): the
    # staged plugin ships version pin metadata only (vendor/ excluded from
    # the archive) and the trusted installer enforces vendor completeness at
    # the installed projection. Provision the release runner's locally
    # generated vendor artifacts (when present) into the extracted plugin so
    # the Stage B install simulates a consumer that already completed the
    # README resolution steps (bun install && bun run build:engine). This is
    # a local copy of already-generated artifacts; no dependency generation
    # and no network fetching is performed. Environments without the local
    # vendor still stop fail-closed with the installer's guidance.
    $extractedTextlintGuard = Join-Path $installedSrc "opencode\plugins\agentdev-textlint-guard"
    $hostVendor = Join-Path $repoRoot "src\opencode\plugins\agentdev-textlint-guard\vendor"
    if ((Test-Path -LiteralPath $extractedTextlintGuard) -and (Test-Path -LiteralPath $hostVendor)) {
        $dstVendor = Join-Path $extractedTextlintGuard "vendor"
        New-Item -ItemType Directory -Path $dstVendor -Force | Out-Null
        Copy-Item -Path (Join-Path $hostVendor "*") -Destination $dstVendor -Recurse -Force
    }
    # Run the TRUSTED host installer original ($installScript at the release
    # runner's working tree, scripts/consumer/archive/install.ps1) against
    # the extracted SOURCE, NOT the candidate copy extracted from the
    # archive. The candidate archive's installer artifact is verified
    # present above but never executed, so a mutated archive cannot run
    # arbitrary code through its installer (in particular it cannot mutate
    # $stagedZip between Compress-Archive and publication).
    & powershell -NoProfile -ExecutionPolicy Bypass -File $installScript -Source $installedSrc -Target $installedTarget -Mode copy
    if ($LASTEXITCODE -ne 0) {
        Cleanup-Stage
        Fail-Exit 9 "package-release-archive: trusted archive installer exited with $LASTEXITCODE"
    }
    Write-Host "package-release-archive: running archive-installed projection boundary check"
    & bun run $boundaryChecker --profile archive-installed $installedRoot --json 2>&1 | Out-Host
    if ($LASTEXITCODE -ne 0) {
        Cleanup-Stage
        Fail-Exit 7 "package-release-archive: archive-installed projection boundary check failed (exit $LASTEXITCODE); no final archive produced."
    }

    # Atomic no-clobber hard-link publish (linearization point). The
    # final path is touched ONLY by the trusted host publish helper
    # (scripts/self/release/publish-hard-link.ts) which calls `fs.linkSync(staged, final)`
    # and fails with EEXIST if final already exists at the moment of the
    # call. There is no pre-check + rename TOCTOU window. There is NO
    # copy fallback. There is NO rename fallback. There is NO Move-Item
    # fallback. The published bytes are the staged ZIP's bytes (hard link
    # shares the inode). On collision the existing final archive is left
    # untouched.
    #
    # Byte binding (Issue #2092 Stage B): the host computes SHA-256 of
    # $stagedZip immediately before publication. The publish helper
    # verifies this digest on the staged bytes (pre-linkSync) AND on the
    # final bytes (post-linkSync) within its own linearized operation.
    # Between this Get-FileHash call and the helper's pre-publish
    # verification, no candidate-controlled code executes (the trusted
    # installer already ran above; nothing extracted from the candidate
    # archive runs in this window). Any external mutation of $stagedZip
    # after this point is detected by the helper's staged-digest check
    # and fails closed (exit 9, no final published).
    $stagedZipHash = (Get-FileHash -LiteralPath $stagedZip -Algorithm SHA256).Hash
    & bun run $publishHelper $stagedZip $finalZip $stagedZipHash 2>&1 | Out-Host
    $publishExit = $LASTEXITCODE
    if ($publishExit -eq 0) {
        # Publication succeeded. Staged ZIP still references the same inode;
        # Cleanup-Stage removes the staged name but cannot affect the
        # durable final link. Cleanup failure here is best-effort.
        Cleanup-Stage
    } elseif ($publishExit -eq 3) {
        Cleanup-Stage
        Fail-Exit 3 "package-release-archive: final archive collision at publish moment (existing archive untouched): $finalZip"
    } else {
        Cleanup-Stage
        Fail-Exit 9 "package-release-archive: atomic hard-link publish failed (helper exit $publishExit); no final archive produced."
    }
} catch {
    # Catch-all for any unexpected throw (Compress-Archive failure,
    # Copy-Item failure, etc.). Guarantees no staging residue is left.
    $unexpected = $_
    Cleanup-Stage
    [Console]::Error.WriteLine("package-release-archive: unexpected failure: $($unexpected.Exception.Message)")
    exit 9
}

# Publication succeeded. Staging cleanup is best-effort; do not fail the
# run if it cannot be removed (the final archive is already durable).
Cleanup-Stage

Write-Output $finalZip
exit 0
