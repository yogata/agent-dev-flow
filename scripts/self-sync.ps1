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
                を再作成し、.opencode/ を同期する。正本から除外・削除された ADF 管理投影物
                （stale 管理投影物）の配置先からの除去を含む（REQ-058、REQ-050-015）。

    いずれのモードも provisioning（clone、fetch、reset）と network access を行わない（REQ-009-046、DEC-016）。

    Uses selective junctions instead of whole-directory junction:
    - .opencode/             = real directory (not a junction)
    - .opencode/commands/agentdev/  = junction -> src/opencode/commands/agentdev/
    - .opencode/skills/agentdev-*/  = individual junctions -> src/opencode/skills/agentdev-*/
    - .opencode/tools/agentdev-*/   = individual junctions -> src/opencode/tools/agentdev-*/
      (Custom Tool distribution type)
    - .opencode/plugins/agentdev-*/ = individual junctions -> src/opencode/plugins/agentdev-*/
      (Plugin / Hook distribution type)

    Plugin packages also get a depth-1 loader shim (.opencode/plugins/<package>.ts)
    because OpenCode auto-loads plugin files only at .opencode/plugins/ depth 1.

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
# ADF-COVERS(implementation): REQ-052-007, REQ-052-008
# ADF-COVERS(implementation): REQ-058-001, REQ-058-002, REQ-058-003, REQ-058-004, REQ-058-005, REQ-058-006, REQ-058-007, REQ-058-008, REQ-058-009, REQ-058-010, REQ-058-011, REQ-058-012
# ADF-COVERS(implementation): REQ-050-015

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
$ToolsDir = Join-Path $ProjectionDir 'tools'
$PluginsDir = Join-Path $ProjectionDir 'plugins'

# Parent directories that must exist as real directories (junction parents).
$ProjectionParentDirs = @($CommandsDir, $SkillsDir, $ToolsDir, $PluginsDir)
$ProjectionParentRels = @('commands', 'skills', 'tools', 'plugins')

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

    # skills\agentdev-* (dynamic enumeration)
    $skillsSource = Join-Path $SourceDir 'skills'
    if (Test-Path -LiteralPath $skillsSource) {
        Get-ChildItem -LiteralPath $skillsSource -Directory -Filter 'agentdev-*' |
            ForEach-Object { $targets.Add("skills\$($_.Name)") }
    }

    # tools\agentdev-* (Custom Tool 配布種別、動的列挙)
    $toolsSource = Join-Path $SourceDir 'tools'
    if (Test-Path -LiteralPath $toolsSource) {
        Get-ChildItem -LiteralPath $toolsSource -Directory -Filter 'agentdev-*' |
            ForEach-Object { $targets.Add("tools\$($_.Name)") }
    }

    # plugins\agentdev-* (Plugin / Hook 配布種別、動的列挙)
    $pluginsSource = Join-Path $SourceDir 'plugins'
    if (Test-Path -LiteralPath $pluginsSource) {
        Get-ChildItem -LiteralPath $pluginsSource -Directory -Filter 'agentdev-*' |
            ForEach-Object { $targets.Add("plugins\$($_.Name)") }
    }

    return ($targets | Sort-Object)
}

function Test-ManagedProjectionJunction {
    <#
    .SYNOPSIS
        配置先の junction が ADF 管理投影物（本スクリプトが配置した物）であることを確定する
        （REQ-058-001、REQ-058-008）。

    .DESCRIPTION
        確定基準: リンク先が、当該 junction の相対パスに対応する正本パス
        （src/opencode/<相対パス>）に一致する場合のみ管理物とみなす。
        正本以外を向く junction やリンク先を確定できない junction は管理物判定不能として
        扱い、自動削除の対象にしない非破壊境界である（REQ-058-008）。
    #>
    param([string]$JunctionRel, [string]$JunctionFullName)
    $targetObj = Get-JunctionTarget -Path $JunctionFullName
    $targetList = @($targetObj) | ForEach-Object { [string]$_ } | Where-Object { $_ }
    if ($targetList.Count -eq 0) { return $false }
    $expectedSource = Join-Path $SourceDir $JunctionRel
    $expectedFull = [System.IO.Path]::GetFullPath($expectedSource).TrimEnd('\', '/')
    foreach ($target in $targetList) {
        $resolved = $null
        try {
            $resolved = (Resolve-Path -LiteralPath $target -ErrorAction Stop).Path
        } catch {
            # 正本から削除された管理対象 junction はリンク先解決に失敗する（broken）。
            # リンク先の文字列自体は reparse data に残るため判定に使える。
            $resolved = $target
        }
        if ($resolved.TrimEnd('\', '/') -ieq $expectedFull) { return $true }
    }
    return $false
}

function Get-StaleManagedJunctions {
    <#
    .SYNOPSIS
        ADF 管理投影物のうち正本の管理対象列挙から外れたもの（stale、削除対象）を返す
        （REQ-058-001、REQ-058-002）。

    .DESCRIPTION
        返却要素は RelPath（.opencode/ 相対パス）と FullName（絶対パス）を持つ。
        正本の管理対象列挙（追加・修復対象を含む現行対象）に含まれない junction のうち、
        管理物と確定できるものだけを返す。管理物判定不能な junction は返さない
        （REQ-058-008 の非破壊境界）。
    #>
    param([string[]]$CurrentTargets)
    $stale = [System.Collections.Generic.List[object]]::new()
    foreach ($parentRel in $ProjectionParentRels) {
        $parentPath = Join-Path $ProjectionDir $parentRel
        if (-not (Test-Path -LiteralPath $parentPath)) { continue }
        Get-ChildItem -LiteralPath $parentPath -Directory -Force |
            Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint } |
            ForEach-Object {
                $junctionRel = "$parentRel\$($_.Name)"
                if ($junctionRel -notin $CurrentTargets) {
                    if (Test-ManagedProjectionJunction -JunctionRel $junctionRel -JunctionFullName $_.FullName) {
                        $stale.Add([PSCustomObject]@{ RelPath = $junctionRel; FullName = $_.FullName })
                    }
                }
            }
    }
    return $stale
}

function Get-UnmanagedProjectionJunctionRels {
    <#
    .SYNOPSIS
        配置先の junction のうち、正本の管理対象列挙にも stale 管理投影物にも該当しない
        （管理物判定不能な）ものの相対パス一覧を返す（REQ-058-008）。
    #>
    param([string[]]$CurrentTargets)
    $staleRels = @(Get-StaleManagedJunctions -CurrentTargets $CurrentTargets) | ForEach-Object { $_.RelPath }
    $unmanaged = [System.Collections.Generic.List[string]]::new()
    foreach ($parentRel in $ProjectionParentRels) {
        $parentPath = Join-Path $ProjectionDir $parentRel
        if (-not (Test-Path -LiteralPath $parentPath)) { continue }
        Get-ChildItem -LiteralPath $parentPath -Directory -Force |
            Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint } |
            ForEach-Object {
                $junctionRel = "$parentRel\$($_.Name)"
                if ($junctionRel -notin $CurrentTargets -and $junctionRel -notin $staleRels) {
                    $unmanaged.Add($junctionRel)
                }
            }
    }
    return $unmanaged
}

function New-PluginLoaderShimContent {
    <#
    .SYNOPSIS
        OpenCode は .opencode/plugins/ 直下（depth-1）のファイルのみ自動読み込みする。
        ディレクトリ型プラグインパッケージ（plugins/agentdev-*/）のローダーシムとして
        plugin.ts の default を再エクスポートする固定内容を返す
        （scripts/install.ps1 の同名関数と同一内容を保つこと）。
    #>
    param([string]$PackageName)
    return (
        "// Generated by scripts/install.ps1 / scripts/self-sync.ps1 - do not edit.`n" +
        "export { default } from `"./$PackageName/plugin.ts`";`n"
    )
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

    # 4. Orphan detection (REQ-050-004 継承能力)。REQ-058:
    # 正本の管理対象から外れた ADF 管理投影物（stale）のみ乖離として検出・報告する
    # （検出のみでファイルシステムを変更しない。REQ-058-003）。
    # 管理物判定不能な junction（正本以外を向く等）は報告のみで非破壊とする（REQ-058-008）。
    Write-Host ''
    Write-Host '--- Orphan junctions ---'
    $staleJunctions = @(Get-StaleManagedJunctions -CurrentTargets $targets)
    foreach ($staleItem in $staleJunctions) {
        Write-Host "[DIVERGENCE] Orphaned junction (apply removes it): $($staleItem.RelPath)"
        $divergences++
    }
    foreach ($unmanagedRel in (Get-UnmanagedProjectionJunctionRels -CurrentTargets $targets)) {
        Write-Host "[INFO] Junction not managed by AgentDevFlow (left untouched): $unmanagedRel"
    }
    if ($staleJunctions.Count -eq 0) {
        Write-Host '[OK] No orphan junctions detected'
    }

    # 4b. Plugin loader shims (depth-1 re-export files)
    $expectedPluginPackages = $targets | Where-Object { $_ -like 'plugins\*' } | ForEach-Object { ($_ -split '\\')[-1] }
    foreach ($pkg in $expectedPluginPackages) {
        $shimPath = Join-Path $PluginsDir "$pkg.ts"
        if (-not (Test-Path -LiteralPath $shimPath)) {
            Write-Host "[DIVERGENCE] Missing plugin loader shim: plugins/$pkg.ts"
            $divergences++
        } elseif ((Get-Content -LiteralPath $shimPath -Raw) -ne (New-PluginLoaderShimContent -PackageName $pkg)) {
            Write-Host "[DIVERGENCE] Plugin loader shim content mismatch: plugins/$pkg.ts"
            $divergences++
        } else {
            Write-Host "[OK] Plugin loader shim: plugins/$pkg.ts"
        }
    }
    if (Test-Path -LiteralPath $PluginsDir) {
        Get-ChildItem -LiteralPath $PluginsDir -File -Filter 'agentdev-*.ts' -ErrorAction SilentlyContinue |
            ForEach-Object {
                if ($_.BaseName -notin $expectedPluginPackages) {
                    Write-Host "[DIVERGENCE] Stale plugin loader shim: plugins/$($_.Name)"
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
    foreach ($parentRel in $ProjectionParentRels) {
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

    # REQ-058-004: stale 管理投影物（正本から除外・削除された管理対象 junction）の
    # 削除予測を報告する（変更はしない）。
    Write-Host ''
    Write-Host '--- Planned stale junction cleanup ---'
    $dryRunStale = @(Get-StaleManagedJunctions -CurrentTargets $targets)
    foreach ($staleItem in $dryRunStale) {
        Write-Host "[WOULD REMOVE] Stale managed junction: $($staleItem.RelPath)"
    }
    foreach ($unmanagedRel in (Get-UnmanagedProjectionJunctionRels -CurrentTargets $targets)) {
        Write-Host "[INFO] Junction not managed by AgentDevFlow (would be left untouched): $unmanagedRel"
    }
    if ($dryRunStale.Count -eq 0) {
        Write-Host '[OK] No stale managed junctions to remove'
    }

    # Planned plugin loader shims
    Write-Host ''
    Write-Host '--- Planned plugin loader shims ---'
    $dryRunPluginPackages = $targets | Where-Object { $_ -like 'plugins\*' } | ForEach-Object { ($_ -split '\\')[-1] }
    foreach ($pkg in $dryRunPluginPackages) {
        $shimPath = Join-Path $PluginsDir "$pkg.ts"
        if (Test-Path -LiteralPath $shimPath) {
            Write-Host "[OK] Already present: plugins/$pkg.ts"
        } else {
            Write-Host "[WOULD ADD] Plugin loader shim: plugins/$pkg.ts"
        }
    }
    # REQ-058-004: stale plugin loader shim（正本側の対象消滅により不要となる ADF 生成物）の
    # 削除予測を報告する（変更はしない）。
    if (Test-Path -LiteralPath $PluginsDir) {
        Get-ChildItem -LiteralPath $PluginsDir -File -Filter 'agentdev-*.ts' -ErrorAction SilentlyContinue |
            Where-Object { $_.BaseName -notin $dryRunPluginPackages } |
            ForEach-Object {
                Write-Host "[WOULD REMOVE] Stale plugin loader shim: plugins/$($_.Name)"
            }
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

    foreach ($parentRel in $ProjectionParentRels) {
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

    # Step 3b: Plugin loader shims (depth-1 re-export files)
    Write-Host ''
    Write-Host '--- Plugin loader shims ---'
    # REQ-058-009/011: stale 管理投影物の削除は全件を試み、失敗は記録して処理を続行し、
    # 最後に判別可能な終了結果を返す（一部残存で正常終了しない）。
    $applyRemoveFailures = [System.Collections.Generic.List[string]]::new()
    $applyPluginPackages = $targets | Where-Object { $_ -like 'plugins\*' } | ForEach-Object { ($_ -split '\\')[-1] }
    foreach ($pkg in $applyPluginPackages) {
        $shimPath = Join-Path $PluginsDir "$pkg.ts"
        $shimContent = New-PluginLoaderShimContent -PackageName $pkg
        if (Test-Path -LiteralPath $shimPath) {
            if ((Get-Content -LiteralPath $shimPath -Raw) -eq $shimContent) {
                Write-Host "[OK] Plugin loader shim already present: plugins/$pkg.ts"
            } else {
                Write-Host "[ACTION] Updating plugin loader shim: plugins/$pkg.ts"
                [System.IO.File]::WriteAllText($shimPath, $shimContent, (New-Object System.Text.UTF8Encoding($false)))
            }
        } else {
            Write-Host "[ACTION] Creating plugin loader shim: plugins/$pkg.ts"
            [System.IO.File]::WriteAllText($shimPath, $shimContent, (New-Object System.Text.UTF8Encoding($false)))
        }
    }
    if (Test-Path -LiteralPath $PluginsDir) {
        Get-ChildItem -LiteralPath $PluginsDir -File -Filter 'agentdev-*.ts' -ErrorAction SilentlyContinue |
            ForEach-Object {
                if ($_.BaseName -notin $applyPluginPackages) {
                    Write-Host "[ACTION] Removing stale plugin loader shim: plugins/$($_.Name)"
                    try {
                        Remove-Item -LiteralPath $_.FullName -Force -ErrorAction Stop
                    } catch {
                        Write-Host "[ERROR] Failed to remove stale plugin loader shim: plugins/$($_.Name) ($($_.Exception.Message))"
                        $applyRemoveFailures.Add("plugins/$($_.Name)")
                    }
                }
            }
    }

    # Step 4: Stale managed junction cleanup (REQ-058-002、REQ-050-015)
    Write-Host ''
    Write-Host '--- Stale managed junction cleanup ---'
    $applyStale = @(Get-StaleManagedJunctions -CurrentTargets $targets)
    foreach ($staleItem in $applyStale) {
        Write-Host "[ACTION] Removing stale managed junction: $($staleItem.RelPath)"
        $rmResult = cmd /c "rmdir `"$($staleItem.FullName)`"" 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Failed to remove stale managed junction: $($staleItem.RelPath) ($rmResult)"
            $applyRemoveFailures.Add($staleItem.RelPath)
        }
    }
    # 管理物判定不能な junction は削除せず報告のみ（REQ-058-008）
    foreach ($unmanagedRel in (Get-UnmanagedProjectionJunctionRels -CurrentTargets $targets)) {
        Write-Host "[INFO] Junction not managed by AgentDevFlow (left untouched): $unmanagedRel"
    }
    if ($applyStale.Count -eq 0) {
        Write-Host '[OK] No stale managed junctions to remove'
    }
    # REQ-058-011: 削除失敗が残る場合は成功として扱わず、判別可能な終了コードで報告する
    if ($applyRemoveFailures.Count -gt 0) {
        Write-Host ''
        Write-Host "[ERROR] $($applyRemoveFailures.Count) stale artifact(s) could not be removed: $($applyRemoveFailures -join ', ')"
        exit 1
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
