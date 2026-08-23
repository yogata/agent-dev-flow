<#
.SYNOPSIS
    Sync .opencode/ projection with selective junctions from src/opencode/ (self-hosting repo).

.DESCRIPTION
    本体（agent-dev-flow 自己ホスト）リポジトリ専用の同期スクリプト（self-hosting 向け公開入口）。
    consumer リポジトリでは scripts/install.ps1 を使うこと（REQ-050-001）。consumer リポジトリで
    実行した場合は変更前に停止して案内する（REQ-050-006）。

    関連3モードの技術的差は以下の通り（REQ-050-003）:
    - check   : 乖離確認（検証のみ、ファイル変更なし）。当スクリプトは clone せず、
                src/opencode/ と .opencode/ の乖離を報告する。
    - dry-run : 変更予測（ファイル変更なし）。当スクリプトは原本ディレクトリを直接参照する
                ため clone 相当の取得は不要、変更内容の予測のみを行う。
    - apply   : 実行（ファイル変更あり）。当スクリプトは原本ディレクトリから junction
                を再作成し、.opencode/ を同期する。

    いずれのモードも provisioning（clone、fetch、reset）と network access を行わない（REQ-009-046、DEC-016）。

    Uses selective junctions instead of whole-directory junction:
    - .opencode/             = real directory (not a junction)
    - .opencode/commands/agentdev/  = junction -> src/opencode/commands/agentdev/
    - .opencode/skills/agentdev-*/  = individual junctions -> src/opencode/skills/agentdev-*/

    Repo-local artifacts are excluded from junction management:
    - .opencode/commands/repo/      = real directory (not a junction, repo-local only)
    - .opencode/skills/repo-*/      = real directories (not junctions, repo-local only)

.PARAMETER Mode
    One of: dry-run, check, apply
    省略可能。引数なし起動時（-Mode 未指定）は対話ウィザードが起動し、Mode を問う（REQ-009-040）。

.EXAMPLE
    ./scripts/self-sync.ps1
    引数なし起動時は対話ウィザードが Mode を問う（REQ-009-040）。

    ./scripts/self-sync.ps1 -Mode dry-run
    ./scripts/self-sync.ps1 -Mode check
    ./scripts/self-sync.ps1 -Mode apply
#>

# ADF-COVERS(implementation): REQ-050-001, REQ-050-003, REQ-050-005, REQ-050-006, REQ-050-007

#Requires -Version 7.0

param(
    [Parameter()]
    [ValidateSet('dry-run', 'check', 'apply')]
    [string]$Mode
)

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path $PSScriptRoot -Parent
$SourceDir = Join-Path $RepoRoot 'src\opencode'
$ProjectionDir = Join-Path $RepoRoot '.opencode'
$CommandsDir = Join-Path $ProjectionDir 'commands'
$SkillsDir = Join-Path $ProjectionDir 'skills'

# Repo-local patterns excluded from junction management (ADR-0020)
$RepoLocalCommandNames = @('repo')
$RepoLocalSkillPrefix = 'repo-'

# --- Helper Functions ---

function Assert-SelfHostRepo {
    <#
    .SYNOPSIS
        本スクリプトが agent-dev-flow 本体リポジトリ配下で実行されているか検査する。
        本体以外（consumer リポジトリ等）へコピーして実行された場合、変更前に停止して
        適切な公開入口を案内する（REQ-009-041、REQ-050-006）。
    #>
    if (-not (Test-Path -LiteralPath $SourceDir)) {
        Write-Host "このスクリプトは AgentDevFlow 本体リポジトリ専用です。$RepoRoot には src\opencode がありません。導入先リポジトリでは scripts/install.ps1 を使ってください。"
        exit 1
    }
}

function Invoke-SyncSelfWizard {
    <#
    .SYNOPSIS
        引数なし起動時（-Mode 未指定）の対話ウィザード。Mode を問う（REQ-009-040）。
    #>
    Write-Host '=== AgentDevFlow 本体同期ウィザード ==='
    Write-Host ''
    Write-Host 'Q1. 目的を選んでください（番号を入力）:'
    Write-Host '  1) 同期実行（apply: ファイル変更あり）'
    Write-Host '  2) 乖離確認（check: ファイル変更なし）'
    Write-Host '  3) 変更予測（dry-run: ファイル変更なし）'
    $modeChoice = Read-Host '番号'
    switch ($modeChoice) {
        '1' { $script:Mode = 'apply' }
        '2' { $script:Mode = 'check' }
        '3' { $script:Mode = 'dry-run' }
        default {
            Write-Host "無効な選択です: $modeChoice"
            exit 1
        }
    }
    Write-Host ''
}

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

function Get-SelectiveJunctionTargets {
    <#
    .SYNOPSIS
        Enumerate all selective junction targets dynamically from src/opencode/.
        Returns sorted array of relative paths (relative to .opencode/) that should be junctioned.
    #>
    $targets = [System.Collections.Generic.List[string]]::new()

    # commands\agentdev
    $cmdSource = Join-Path $SourceDir 'commands\agentdev'
    if (Test-Path -LiteralPath $cmdSource) {
        $targets.Add('commands\agentdev')
    }

    # skills\agentdev-* (dynamic enumeration) plus japanese-tech-writing
    # (distribution-dependent skill referenced by agentdev-doc-writing, ADR-0134/REQ-0159-001).
    $skillsSource = Join-Path $SourceDir 'skills'
    if (Test-Path -LiteralPath $skillsSource) {
        Get-ChildItem -LiteralPath $skillsSource -Directory -Filter 'agentdev-*' |
            ForEach-Object { $targets.Add("skills\$($_.Name)") }
        # japanese-tech-writing is promoted to src/ but lacks agentdev-* prefix (ADR-0134).
        if (Test-Path -LiteralPath (Join-Path $skillsSource 'japanese-tech-writing')) {
            $targets.Add('skills\japanese-tech-writing')
        }
    }

    return ($targets | Sort-Object)
}

# --- Main ---

# 本体リポジトリ外（src/opencode が存在しない）での実行を検出して停止（REQ-009-041）
Assert-SelfHostRepo

# 引数なし起動時（-Mode 未指定）の対話ウィザード（REQ-009-040）
if (-not $Mode) {
    Invoke-SyncSelfWizard
}

$targets = Get-SelectiveJunctionTargets

# ============================================================
# CHECK MODE
# ============================================================

if ($Mode -eq 'check') {
    Write-Host '=== Sync Check: selective junctions ==='
    $divergences = 0

    # 1. .opencode/ must be a real directory (not junction)
    if (Test-Junction -Path $ProjectionDir) {
        Write-Host '[DIVERGENCE] .opencode/ is a whole-directory junction (needs migration to selective)'
        $divergences++
    } elseif (-not (Test-Path -LiteralPath $ProjectionDir)) {
        Write-Host '[DIVERGENCE] .opencode/ does not exist'
        $divergences++
    } else {
        Write-Host '[OK] .opencode/ is a real directory'
    }

    # 2. Parent directories must be real directories
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

    # 3. Check each expected junction
    foreach ($relPath in $targets) {
        $targetPath = Join-Path $ProjectionDir $relPath
        if (-not (Test-Path -LiteralPath $targetPath)) {
            Write-Host "[DIVERGENCE] Missing junction: $relPath"
            $divergences++
        } elseif (Test-Junction -Path $targetPath) {
            # Verify junction target points to correct source
            $expectedSource = Join-Path $SourceDir $relPath
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

    # 4. Orphan detection in commands/ and skills/ (skip repo-local artifacts)
    foreach ($parentRel in @('commands', 'skills')) {
        $parentPath = Join-Path $ProjectionDir $parentRel
        if (-not (Test-Path -LiteralPath $parentPath)) { continue }
        Get-ChildItem -LiteralPath $parentPath -Directory -Force |
            Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint } |
            ForEach-Object {
                $junctionRel = "$parentRel\$($_.Name)"
                if ($junctionRel -notin $targets) {
                    Write-Host "[DIVERGENCE] Orphaned junction: $junctionRel"
                    $divergences++
                }
            }
    }

    # 5. Repo-local directory existence check (informational, not a divergence)
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
        Write-Host 'No divergence detected. Selective junctions are in sync.'
    } else {
        Write-Host "$divergences divergence(s) detected."
    }
    exit $(if ($divergences -gt 0) { 1 } else { 0 })
}

# ============================================================
# DRY-RUN MODE
# ============================================================

if ($Mode -eq 'dry-run') {
    Write-Host '=== Dry Run: selective junction sync ==='

    # Migration status
    $isWholeJunction = Test-Junction -Path $ProjectionDir
    if ($isWholeJunction) {
        Write-Host '[INFO] Migration required: .opencode/ is a whole-directory junction'
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
        if (Test-Junction -Path $targetPath) {
            $actualTarget = Get-JunctionTarget -Path $targetPath
            $expectedSource = Join-Path $SourceDir $relPath
            if ($actualTarget -and (Test-Path -LiteralPath $actualTarget)) {
                Write-Host "[OK] Already junctioned: $relPath"
            } else {
                Write-Host "[WOULD REMOVE] Broken junction: $relPath"
                Write-Host "[WOULD ADD] Re-create junction: $relPath"
            }
        } elseif (Test-Path -LiteralPath $targetPath) {
            Write-Host "[ERROR] Path exists and is not a junction: $relPath"
        } else {
            Write-Host "[WOULD ADD] Create junction: $relPath"
        }
    }

    # Orphan detection (skip repo-local artifacts)
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
                    Write-Host "[WOULD REMOVE] Orphaned junction: $junctionRel"
                    $orphansFound = $true
                }
            }
    }
    if (-not $orphansFound) {
        Write-Host '[OK] No orphan junctions detected'
    }

    # Repo-local directory status (informational)
    Write-Host ''
    Write-Host '--- Repo-local artifacts (not junction-managed, ADR-0020) ---'
    $repoLocalFound = $false
    foreach ($cmdName in $RepoLocalCommandNames) {
        $repoLocalPath = Join-Path $CommandsDir $cmdName
        if (Test-Path -LiteralPath $repoLocalPath) {
            Write-Host "[OK] Repo-local command: commands\$cmdName"
            $repoLocalFound = $true
        }
    }
    if (Test-Path -LiteralPath $SkillsDir) {
        Get-ChildItem -LiteralPath $SkillsDir -Directory -Force |
            Where-Object { $_.Name -like "$RepoLocalSkillPrefix*" } |
            ForEach-Object {
                Write-Host "[OK] Repo-local skill: skills\$($_.Name)"
                $repoLocalFound = $true
            }
    }
    if (-not $repoLocalFound) {
        Write-Host '[INFO] No repo-local artifacts found'
    }

    Write-Host ''
    Write-Host 'Dry run complete. No changes made.'
    exit 0
}

# ============================================================
# APPLY MODE
# ============================================================

if ($Mode -eq 'apply') {
    Write-Host '=== Apply: syncing .opencode/ selective junctions ==='

    # Step 1: Migration Detection
    $isWholeJunction = Test-Junction -Path $ProjectionDir
    if ($isWholeJunction) {
        Write-Host '[ACTION] Migrating: removing whole-directory junction .opencode/'
        $rmResult = cmd /c "rmdir `"$ProjectionDir`"" 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Error "[ERROR] Failed to remove whole-directory junction: $rmResult"
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

    # Step 2: Parent Directories
    if (Test-Junction -Path $ProjectionDir) {
        Write-Error '[ERROR] .opencode/ is a junction (must be real directory)'
        exit 1
    }

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
        $sourcePath = Join-Path $SourceDir $relPath

        if (Test-Junction -Path $targetPath) {
            $actualTarget = Get-JunctionTarget -Path $targetPath
            if ($actualTarget -and (Test-Path -LiteralPath $actualTarget)) {
                Write-Host "[OK] Already junctioned: $relPath"
                continue
            } else {
                Write-Host "[ACTION] Removing broken junction: $relPath"
                cmd /c "rmdir `"$targetPath`"" 2>&1
                if ($LASTEXITCODE -ne 0) {
                    Write-Error "[ERROR] Failed to remove broken junction: $relPath"
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

        Write-Host "[ACTION] Creating junction: $relPath"
        # Use absolute source path for mklink (robust regardless of $PWD)
        $result = cmd /c "mklink /J `"$targetPath`" `"$sourcePath`" 2>&1"
        if ($LASTEXITCODE -ne 0) {
            Write-Error "[ERROR] Failed to create junction ${relPath}: $result"
            exit 1
        }
    }

    # Step 4: Orphan Junction Cleanup (skip repo-local artifacts)
    Write-Host ''
    Write-Host '--- Orphan cleanup ---'
    foreach ($parentRel in @('commands', 'skills')) {
        $parentPath = Join-Path $ProjectionDir $parentRel
        if (-not (Test-Path -LiteralPath $parentPath)) { continue }
        Get-ChildItem -LiteralPath $parentPath -Directory -Force |
            Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint } |
            ForEach-Object {
                $junctionRel = "$parentRel\$($_.Name)"
                if ($junctionRel -notin $targets) {
                    Write-Host "[ACTION] Removing orphan junction: $junctionRel"
                    $rmResult = cmd /c "rmdir `"$($_.FullName)`"" 2>&1
                    if ($LASTEXITCODE -ne 0) {
                        Write-Error "[ERROR] Failed to remove orphan junction: $junctionRel ($rmResult)"
                        exit 1
                    }
                }
            }
    }

    # Step 5: Report repo-local artifacts (informational)
    Write-Host ''
    Write-Host '--- Repo-local artifacts (skipped, ADR-0020) ---'
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
    Write-Host 'Sync complete.'
    exit 0
}
