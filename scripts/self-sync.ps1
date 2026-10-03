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

    Uses selective junctions instead of whole-directory junction. Projection
    sources follow the multi-host canonical model (src/common/ canonical +
    src/opencode/ OpenCode host connection area):
    - .opencode/                    = real directory (not a junction)
    - .opencode/commands/agentdev/  = junction -> src/common/commands/agentdev/
    - .opencode/skills/agentdev-*/  = individual junctions -> src/common/skills/agentdev-*/
    - .opencode/tools/agentdev-*/   = individual junctions -> src/common/tools/agentdev-*/
      (Custom Tool distribution type)
    - .opencode/plugins/agentdev-*/ = individual junctions -> src/opencode/plugins/agentdev-*/
      (Plugin / Hook distribution type)

    Placement targets (hosts) follow REQ-099-010: the default (omitted) keeps
    the currently placed hosts detected from the projection state (a fresh
    repo defaults to OpenCode only, the first-class reference harness).
    -Hosts senpi / both additionally project the Senpi host connection area
    (src/senpi/) into .senpi/ as individual junctions, using the placement
    contract (directory structure) only. The self-host Senpi placement is an
    explicitly selected configuration; this script never reports it as a
    verified compatibility claim (REQ-099-011).

    Plugin packages also get a depth-1 loader shim (.opencode/plugins/<package>.ts)
    because OpenCode auto-loads plugin files only at .opencode/plugins/ depth 1.

    Repo-local artifacts are excluded from junction management:
    - .opencode/commands/repo/      = real directory (not a junction, repo-local only)
    - .opencode/skills/repo-*/      = real directories (not junctions, repo-local only)

.PARAMETER Mode
    One of: dry-run, check, apply
    省略可能。引数なし起動時（-Mode 未指定）は対話ウィザードが起動し、Mode を問う（REQ-009-040）。

.PARAMETER Hosts
    One of: opencode, senpi, both
    配置対象ホストの選択（REQ-099-010）。省略時は現在の配置対象を検出して維持し、
    検出不能（新規）は opencode（first-class reference harness）のみとする。
    senpi / both を明示指定した場合のみ src/senpi/ → .senpi/ 投影を作成する。

.EXAMPLE
    ./scripts/self-sync.ps1
    引数なし起動時は対話ウィザードが Mode を問う（REQ-009-040）。

    ./scripts/self-sync.ps1 -Mode dry-run
    ./scripts/self-sync.ps1 -Mode check
    ./scripts/self-sync.ps1 -Mode apply
    ./scripts/self-sync.ps1 -Mode apply -Hosts both
#>

# ADF-COVERS(implementation): REQ-050-001, REQ-050-003, REQ-050-005, REQ-050-006, REQ-050-007
# ADF-COVERS(implementation): REQ-052-007, REQ-052-008
# ADF-COVERS(implementation): REQ-058-001, REQ-058-002, REQ-058-003, REQ-058-004, REQ-058-005, REQ-058-006, REQ-058-007, REQ-058-008, REQ-058-009, REQ-058-010, REQ-058-011, REQ-058-012
# ADF-COVERS(implementation): REQ-050-015
# ADF-COVERS(implementation): REQ-099-010, REQ-099-011, REQ-099-012

#Requires -Version 7.0

param(
    [Parameter()]
    [ValidateSet('dry-run', 'check', 'apply')]
    [string]$Mode,

    [Parameter()]
    [ValidateSet('opencode', 'senpi', 'both')]
    [string]$Hosts
)

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path $PSScriptRoot -Parent
# Canonical sources in the multi-host canonical model (DEC-049)
$CommonSourceDir = Join-Path $RepoRoot 'src\common'
$OpencodeHostSourceDir = Join-Path $RepoRoot 'src\opencode'
$SenpiHostSourceDir = Join-Path $RepoRoot 'src\senpi'
$ProjectionDir = Join-Path $RepoRoot '.opencode'
$SenpiProjectionDir = Join-Path $RepoRoot '.senpi'
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
    if (-not (Test-Path -LiteralPath $OpencodeHostSourceDir)) {
        Write-Host "このスクリプトは AgentDevFlow 本体リポジトリ専用です。$RepoRoot には src\opencode がありません。導入先リポジトリでは scripts/install.ps1 を使ってください。"
        exit 1
    }
    # 共通正本（src/common/）の欠落は旧構成チェックアウトの目印である。投影元が
    # 存在しない状態での同期を防ぐため停止して案内する（REQ-099-010 の新構成整合）。
    if (-not (Test-Path -LiteralPath $CommonSourceDir)) {
        Write-Host "このスクリプトは AgentDevFlow 本体リポジトリ専用です。$RepoRoot には src\common（共通正本）がありません。チェックアウトが旧構成でないか確認してください。"
        exit 1
    }
}

function Get-HostsDisplay {
    <#
    .SYNOPSIS
        Human-readable placement-target label for messages.
    #>
    param([string]$HostsValue)
    switch ($HostsValue) {
        'opencode' { return 'OpenCode のみ' }
        'senpi'    { return 'Senpi のみ' }
        'both'     { return '両方（OpenCode + Senpi）' }
        'none'     { return 'なし（新規）' }
        default    { return $HostsValue }
    }
}

function Resolve-SenpiTargetRel {
    <#
    .SYNOPSIS
        Convert a managed enumeration entry ('senpi:<subdir>') to its Senpi
        projection relative path ('<subdir>'). Non-senpi entries return $null.
    #>
    param([string]$TargetEntry)
    if ($TargetEntry -like 'senpi:*') { return $TargetEntry.Substring('senpi:'.Length) }
    return $null
}

function Test-ManagedSenpiJunction {
    <#
    .SYNOPSIS
        .senpi/ 配下の junction が ADF 管理投影物（Senpi 投影）であることを確定する
        （REQ-058-001、REQ-058-008）。
    #>
    param([string]$JunctionName, [string]$JunctionFullName)
    $targetObj = Get-JunctionTarget -Path $JunctionFullName
    $targetList = @($targetObj) | ForEach-Object { [string]$_ } | Where-Object { $_ }
    if ($targetList.Count -eq 0) { return $false }
    $expectedFull = [System.IO.Path]::GetFullPath((Join-Path $SenpiHostSourceDir $JunctionName)).TrimEnd('\', '/')
    foreach ($target in $targetList) {
        $resolved = $null
        try {
            $resolved = (Resolve-Path -LiteralPath $target -ErrorAction Stop).Path
        } catch {
            $resolved = $target
        }
        if ($resolved.TrimEnd('\', '/') -ieq $expectedFull) { return $true }
    }
    return $false
}

function Test-HasSenpiManagedProjection {
    <#
    .SYNOPSIS
        .senpi/ に管理物と確定できる Senpi 投影が存在するか判定する（配置対象検出用）。
    #>
    if (-not (Test-Path -LiteralPath $SenpiProjectionDir)) { return $false }
    $found = Get-ChildItem -LiteralPath $SenpiProjectionDir -Directory -Force -ErrorAction SilentlyContinue |
        Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint } |
        Where-Object { Test-ManagedSenpiJunction -JunctionName $_.Name -JunctionFullName $_.FullName }
    return [bool]$found
}

function Resolve-TargetHosts {
    <#
    .SYNOPSIS
        配置対象ホストを確定する（REQ-099-010）。明示指定を最優先し、未指定時は
        現在の配置対象を検出して維持する。検出不能（新規）は opencode のみ
        （first-class reference harness、DEC-049 決定(2)）。
    #>
    if ($Hosts) {
        if ($Hosts -eq 'both') { return @('opencode', 'senpi') }
        return @($Hosts)
    }
    $hasSenpi = Test-HasSenpiManagedProjection
    $hasOpenCode = $false
    foreach ($parentRel in $ProjectionParentRels) {
        $parentPath = Join-Path $ProjectionDir $parentRel
        if (-not (Test-Path -LiteralPath $parentPath)) { continue }
        $found = Get-ChildItem -LiteralPath $parentPath -Directory -Force -ErrorAction SilentlyContinue |
            Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint } |
            Where-Object {
                Test-ManagedProjectionJunction -JunctionRel "$parentRel\$($_.Name)" -JunctionFullName $_.FullName
            }
        if ($found) { $hasOpenCode = $true; break }
    }
    if ($hasOpenCode -and $hasSenpi) { return @('opencode', 'senpi') }
    if ($hasSenpi) { return @('senpi') }
    return @('opencode')
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

function Get-TargetSourcePath {
    <#
    .SYNOPSIS
        Resolve the absolute source path backing a projection relative path.
        OpenCode targets back to the canonical sources (src/common/ for
        commands/skills/tools, src/opencode/ for plugins). Senpi targets back
        to src/senpi/<subdir>.
    #>
    param([string]$RelPath)
    $senpiRel = Resolve-SenpiTargetRel -TargetEntry $RelPath
    if ($null -ne $senpiRel) {
        return Join-Path $SenpiHostSourceDir $senpiRel
    }
    if ($RelPath -like 'plugins\*') {
        return Join-Path $OpencodeHostSourceDir $RelPath
    }
    return Join-Path $CommonSourceDir $RelPath
}

function Get-SelectiveJunctionTargets {
    <#
    .SYNOPSIS
        Enumerate all selective junction targets dynamically from the canonical
        sources (src/common/ + src/opencode/ host connection area, plus
        src/senpi/ when Senpi placement is selected).
        Returns sorted array of relative paths. OpenCode targets are relative
        to .opencode/; Senpi targets are single segments relative to .senpi/
        and prefixed 'senpi:' to keep both host scopes in one enumeration.
    #>
    $targets = [System.Collections.Generic.List[string]]::new()

    if ($ResolvedHosts -contains 'opencode') {
        # commands\agentdev (canonical source: src/common/)
        $cmdSource = Join-Path $CommonSourceDir 'commands\agentdev'
        if (Test-Path -LiteralPath $cmdSource) {
            $targets.Add('commands\agentdev')
        }

        # skills\agentdev-* (dynamic enumeration, canonical source: src/common/)
        $skillsSource = Join-Path $CommonSourceDir 'skills'
        if (Test-Path -LiteralPath $skillsSource) {
            Get-ChildItem -LiteralPath $skillsSource -Directory -Filter 'agentdev-*' |
                ForEach-Object { $targets.Add("skills\$($_.Name)") }
        }

        # tools\agentdev-* (Custom Tool 配布種別、動的列挙、canonical source: src/common/)
        $toolsSource = Join-Path $CommonSourceDir 'tools'
        if (Test-Path -LiteralPath $toolsSource) {
            Get-ChildItem -LiteralPath $toolsSource -Directory -Filter 'agentdev-*' |
                ForEach-Object { $targets.Add("tools\$($_.Name)") }
        }

        # plugins\agentdev-* (Plugin / Hook 配布種別、動的列挙、canonical source: src/opencode/)
        $pluginsSource = Join-Path $OpencodeHostSourceDir 'plugins'
        if (Test-Path -LiteralPath $pluginsSource) {
            Get-ChildItem -LiteralPath $pluginsSource -Directory -Filter 'agentdev-*' |
                ForEach-Object { $targets.Add("plugins\$($_.Name)") }
        }
    }

    if ($ResolvedHosts -contains 'senpi') {
        # Senpi host connection area (placement-contract level enumeration).
        if (Test-Path -LiteralPath $SenpiHostSourceDir) {
            Get-ChildItem -LiteralPath $SenpiHostSourceDir -Directory |
                ForEach-Object { $targets.Add("senpi:$($_.Name)") }
        }
    }

    return ($targets | Sort-Object)
}

function Test-ManagedProjectionJunction {
    <#
    .SYNOPSIS
        配置先の junction が ADF 管理投影物（本スクリプトが配置した物）であることを確定する
        （REQ-058-001、REQ-058-008）。

    .DESCRIPTION
        確定基準: リンク先が、当該 junction の相対パスに対応する正本パス候補
        （現行正本: src/common/<相対パス> または src/opencode/<相対パス>（plugins と
        旧構成））に一致する場合のみ管理物とみなす。src/opencode/<相対パス> は旧単一
        正本としての候補も兼ね、旧構成で配置された管理投影物の更新互換を維持する
        （REQ-099-012）。正本以外を向く junction やリンク先を確定できない junction は
        管理物判定不能として扱い、自動削除の対象にしない非破壊境界である（REQ-058-008）。
    #>
    param([string]$JunctionRel, [string]$JunctionFullName)
    $targetObj = Get-JunctionTarget -Path $JunctionFullName
    $targetList = @($targetObj) | ForEach-Object { [string]$_ } | Where-Object { $_ }
    if ($targetList.Count -eq 0) { return $false }
    $expectedSources = @()
    if ($JunctionRel -like 'plugins\*') {
        $expectedSources += (Join-Path $OpencodeHostSourceDir $JunctionRel)
    } else {
        $expectedSources += (Join-Path $CommonSourceDir $JunctionRel)
        # 旧単一正本候補（旧構成の管理物確定用。REQ-099-012 更新互換）
        $expectedSources += (Join-Path $OpencodeHostSourceDir $JunctionRel)
    }
    foreach ($target in $targetList) {
        $resolved = $null
        try {
            $resolved = (Resolve-Path -LiteralPath $target -ErrorAction Stop).Path
        } catch {
            # 正本から削除された管理対象 junction はリンク先解決に失敗する（broken）。
            # リンク先の文字列自体は reparse data に残るため判定に使える。
            $resolved = $target
        }
        foreach ($expected in $expectedSources) {
            $expectedFull = [System.IO.Path]::GetFullPath($expected).TrimEnd('\', '/')
            if ($resolved.TrimEnd('\', '/') -ieq $expectedFull) { return $true }
        }
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
    if (Test-Path -LiteralPath $SenpiProjectionDir) {
        Get-ChildItem -LiteralPath $SenpiProjectionDir -Directory -Force |
            Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint } |
            ForEach-Object {
                $targetEntry = "senpi:$($_.Name)"
                if ($targetEntry -notin $CurrentTargets) {
                    if (Test-ManagedSenpiJunction -JunctionName $_.Name -JunctionFullName $_.FullName) {
                        $stale.Add([PSCustomObject]@{ RelPath = $targetEntry; FullName = $_.FullName })
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
    if (Test-Path -LiteralPath $SenpiProjectionDir) {
        Get-ChildItem -LiteralPath $SenpiProjectionDir -Directory -Force |
            Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint } |
            ForEach-Object {
                $targetEntry = "senpi:$($_.Name)"
                if ($targetEntry -notin $CurrentTargets -and $targetEntry -notin $staleRels) {
                    $unmanaged.Add($targetEntry)
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

function Get-PluginPackagesWithUnresolvedVendor {
    <#
    .SYNOPSIS
        依存を導入時生成する plugin package（package.json に dependencies を持つ）のうち、
        依存実体（vendor 成果物。engine bundle と kuromoji 辞書）が未生成または不完全な
        もの（部分生成状態を含む）を列挙して返す。版固定情報（package.json + bun.lock）
        のみが配布され、vendor 実体は導入時に利用者が生成する。依存の生成とネットワーク
        取得は本スクリプトが行わない（DEC-016）。plugin package は汎用列挙し、特定の
        package 名を本スクリプトへ直書きしない。
    #>
    $incomplete = [System.Collections.Generic.List[string]]::new()
    $pluginsSource = Join-Path $OpencodeHostSourceDir 'plugins'
    if (-not (Test-Path -LiteralPath $pluginsSource)) { return $incomplete }
    Get-ChildItem -LiteralPath $pluginsSource -Directory -Filter 'agentdev-*' | ForEach-Object {
        $pkgJsonPath = Join-Path $_.FullName 'package.json'
        if (-not (Test-Path -LiteralPath $pkgJsonPath)) { return }
        $pkgJson = [System.IO.File]::ReadAllText($pkgJsonPath) | ConvertFrom-Json
        if (-not $pkgJson.dependencies) { return }
        $vendorDir = Join-Path $_.FullName 'vendor'
        $bundlePath = Join-Path $vendorDir 'textlint-engine.bundle.json'
        $dictDir = Join-Path $vendorDir 'kuromoji-dict'
        $vendorReady = (Test-Path -LiteralPath $bundlePath) -and
            (Test-Path -LiteralPath $dictDir) -and
            (@(Get-ChildItem -LiteralPath $dictDir -File -Filter '*.dat.gz' -ErrorAction SilentlyContinue).Count -gt 0)
        if (-not $vendorReady) { $incomplete.Add($_.Name) }
    }
    return $incomplete
}

function Show-PluginVendorGuidance {
    <#
    .SYNOPSIS
        依存実体（vendor 成果物）の欠落検知時の導入手順案内を表示する（依存の生成と
        ネットワーク取得は本スクリプトが行わない。利用者が plugin package 配下で実行する）。
    #>
    param([string[]]$IncompletePackages)
    Write-Host "[ERROR] 依存実体（vendor）が未生成または不完全な plugin package があります: $($IncompletePackages -join ', ')"
    Write-Host '導入手順: 各 plugin package 配下で次の順に実行してください（bun install はネットワーク取得を含みます）:'
    Write-Host '  1. bun install'
    Write-Host '  2. bun run build:engine'
    Write-Host 'その後、本スクリプトを再実行してください。導入系スクリプトは依存の生成とネットワーク取得を行いません。'
}

# --- Runtime diagnostics (REQ-099-011) ---

function Show-RuntimeDiagnostics {
    <#
    .SYNOPSIS
        実行環境診断（CLI 導入有無の確認）を配置検査と区別して報告する（REQ-099-011）。
        診断は配置対象の選択・変更に使用せず、対応済み組合せの宣言も行わない。
    #>
    Write-Host ''
    Write-Host '--- Runtime diagnostics (placement inspection is reported separately above) ---'
    foreach ($cliSpec in @(
        @{ Name = 'opencode'; Label = 'OpenCode CLI (opencode)' },
        @{ Name = 'omo'; Label = 'OmO native CLI (omo)' }
    )) {
        $cmd = Get-Command -Name $cliSpec.Name -ErrorAction SilentlyContinue
        if ($cmd) {
            Write-Host "[INFO] Runtime diagnostic: $($cliSpec.Label): installed ($($cmd.Source))"
        } else {
            Write-Host "[INFO] Runtime diagnostic: $($cliSpec.Label): not found in PATH (placement and placement checks do not require the CLI; runtime behavior cannot be verified here)"
        }
    }
    Write-Host '[INFO] Runtime diagnostics never select or change placement targets (host placement is user-selected or inherited from the current placement).'
    Write-Host '[INFO] This script does not report verified host/CLI compatibility claims; verified combinations are maintained in the guides (REQ-099-018).'
}

# --- Third-party Skill drift detection ---

# 宣言ファイル（src/third-party/skills.yaml、不在時は .agentdev/third-party/skills.yaml
# の2候補解決）と .opencode/skills/<name>/ の配置（SKILL.md と provenance マーカー）の
# 突合。宣言ファイルが解決できない環境は検査対象外として正常扱いし、宣言済みで配置が
# 欠落する場合は ERROR 停止（終了コード 7）して取得機構 CLI を案内する。取得と
# network access は本スクリプトが行わない。name 列挙の抽出に限定し、宣言の構文検証は
# 取得機構のパーサーを正本とする。3経路同期契約: scripts/install.ps1 と
# scripts/consumer/archive/install.ps1 の同名検知と同期して維持すること。
$ThirdPartyDeclRelCandidates = @('src\third-party\skills.yaml', '.agentdev\third-party\skills.yaml')
$ThirdPartyProvenanceMarker = '.agentdev-third-party.json'
$ThirdPartyDriftExitCode = 7

function Get-ThirdPartyDeclaredNames {
    <#
    .SYNOPSIS
        宣言ファイルから name 列挙を抽出する（最小 yaml 解析。name 列挙の抽出に限定）。
    #>
    param([string]$DeclarationPath)
    $names = @()
    $inSkills = $false
    foreach ($line in [System.IO.File]::ReadAllLines($DeclarationPath)) {
        $t = $line.Trim()
        if ($t.Length -eq 0 -or $t.StartsWith('#')) { continue }
        if (-not $inSkills) {
            if ($t -match '^skills:\s*(.*)$') {
                $rest = $Matches[1].Trim()
                if ($rest -eq '') { $inSkills = $true }
                elseif ($rest -eq '[]') { return @() }
                else { throw "unsupported skills value in declaration: $rest" }
            } elseif (-not $t.StartsWith('schema_version:')) {
                throw "unsupported declaration line: $t"
            }
            continue
        }
        if ($t.StartsWith('- name:')) {
            $name = $t.Substring('- name:'.Length).Trim().Trim('"', "'")
            if ($name) { $names += $name }
        } elseif (-not ($t.StartsWith('source:') -or $t.StartsWith('-'))) {
            throw "unsupported declaration line: $t"
        }
    }
    return $names
}

function Invoke-ThirdPartyDriftCheck {
    <#
    .SYNOPSIS
        third-party Skill の drift 検知（宣言済みで配置欠落の ERROR 停止と案内）。
    #>
    param([string]$RootDir, [string]$SkillsRootDir, [string]$CliCommandHint)
    $declarationPath = $null
    foreach ($rel in $ThirdPartyDeclRelCandidates) {
        $candidate = Join-Path $RootDir $rel
        if (Test-Path -LiteralPath $candidate) { $declarationPath = $candidate; break }
    }
    if (-not $declarationPath) {
        Write-Host '[INFO] third-party Skill declaration not found (src/third-party/skills.yaml or .agentdev/third-party/skills.yaml); third-party drift check skipped'
        return
    }
    Write-Host "=== third-party Skill drift check ($declarationPath) ==="
    $declaredNames = @(Get-ThirdPartyDeclaredNames -DeclarationPath $declarationPath)
    $missing = @()
    foreach ($name in $declaredNames) {
        $skillDir = Join-Path $SkillsRootDir $name
        $hasSkillMd = Test-Path -LiteralPath (Join-Path $skillDir 'SKILL.md')
        $hasProvenance = Test-Path -LiteralPath (Join-Path $skillDir $ThirdPartyProvenanceMarker)
        if ($hasSkillMd -and $hasProvenance) {
            Write-Host "[OK] third-party Skill placed: $name"
        } else {
            Write-Host "[ERROR] third-party Skill declared but not placed: $name ($skillDir)"
            $missing += $name
        }
    }
    if ($missing.Count -gt 0) {
        Write-Host "導入手順: 取得機構の CLI で third-party Skill を取得してください: $CliCommandHint"
        exit $ThirdPartyDriftExitCode
    }
}

# --- Main ---

# 本体リポジトリ外（src/opencode が存在しない）での実行を検出して停止（REQ-009-041）
Assert-SelfHostRepo

# 引数なし起動時（-Mode 未指定）の対話ウィザード（REQ-009-040）
if (-not $Mode) {
    Invoke-SyncSelfWizard
}

# 配置対象ホストの確定（REQ-099-010）。明示指定（-Hosts パラメータ）を最優先し、
# 未指定時は現在の配置対象を検出して維持する。検出不能（新規）は opencode のみ
# （first-class reference harness、DEC-049 決定(2)）。
$ResolvedHosts = @(Resolve-TargetHosts)
Write-Host "[INFO] Placement targets: $(Get-HostsDisplay -HostsValue $(if ($ResolvedHosts -contains 'opencode' -and $ResolvedHosts -contains 'senpi') { 'both' } elseif ($ResolvedHosts -contains 'opencode') { 'opencode' } else { 'senpi' }))"
if ($Hosts) {
    Write-Host '[INFO] Placement targets were set by explicit selection.'
} else {
    Write-Host '[INFO] Placement targets were inherited from the current placement state (or defaulted to OpenCode only for a fresh repo). Use -Hosts to change them explicitly.'
}
if ($ResolvedHosts -contains 'senpi' -and -not (Test-Path -LiteralPath $SenpiHostSourceDir)) {
    Write-Host "[ERROR] Senpi 配置対象が選択されましたが、$RepoRoot/src/senpi/（Senpi 接続領域）が存在しません。-Hosts を見直してください。"
    exit 1
}

$targets = Get-SelectiveJunctionTargets

# 依存を導入時生成する plugin package の vendor 完全性の前置確認（check モード以外は
# 欠落・部分生成状態で fail-closed 停止し導入手順を案内する。check は乖離報告として扱う）
$incompleteVendorPackages = @(Get-PluginPackagesWithUnresolvedVendor)
if ($Mode -ne 'check' -and $incompleteVendorPackages.Count -gt 0) {
    Write-Host '=== plugin 依存生成の前置確認 ==='
    Show-PluginVendorGuidance -IncompletePackages $incompleteVendorPackages
    exit 1
}

# third-party Skill drift 検知（全モード共通。宣言済みで配置欠落は ERROR 停止し、
# 宣言ファイルが解決できない環境は検査対象外として正常扱いする）
Invoke-ThirdPartyDriftCheck -RootDir $RepoRoot -SkillsRootDir $SkillsDir -CliCommandHint 'bun src/common/tools/agentdev-third-party/cli.ts'

# ============================================================
# CHECK MODE
# ============================================================

if ($Mode -eq 'check') {
    Write-Host '=== Sync Check: selective junctions ==='
    $divergences = 0

    # 1. Projection roots must be real directories (.opencode/ for OpenCode, .senpi/ for Senpi)
    if ($ResolvedHosts -contains 'opencode') {
        if (Test-Junction -Path $ProjectionDir) {
            Write-Host '[DIVERGENCE] .opencode/ is a whole-directory junction (needs migration to selective)'
            $divergences++
        } elseif (-not (Test-Path -LiteralPath $ProjectionDir)) {
            Write-Host '[DIVERGENCE] .opencode/ does not exist'
            $divergences++
        } else {
            Write-Host '[OK] .opencode/ is a real directory'
        }
    }
    if ($ResolvedHosts -contains 'senpi') {
        if (Test-Junction -Path $SenpiProjectionDir) {
            Write-Host '[DIVERGENCE] .senpi/ is a junction (must be real directory)'
            $divergences++
        } elseif (-not (Test-Path -LiteralPath $SenpiProjectionDir)) {
            Write-Host '[DIVERGENCE] .senpi/ does not exist'
            $divergences++
        } else {
            Write-Host '[OK] .senpi/ is a real directory'
        }
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

    # 2b. plugin 依存実体（導入時生成依存）: vendor 完全性。
    # 欠落（部分生成状態を含む）は乖離として報告し、導入手順を案内する。
    $checkIncompleteVendor = @(Get-PluginPackagesWithUnresolvedVendor)
    if ($checkIncompleteVendor.Count -gt 0) {
        Write-Host "[DIVERGENCE] plugin package dependency (vendor) missing or incomplete: $($checkIncompleteVendor -join ', ')"
        Show-PluginVendorGuidance -IncompletePackages $checkIncompleteVendor
        $divergences++
    } else {
        Write-Host '[OK] plugin package dependencies (vendor) exist'
    }

    # 3. Check each expected junction (OpenCode scope and Senpi scope)
    foreach ($relPath in $targets) {
        $senpiRel = Resolve-SenpiTargetRel -TargetEntry $relPath
        if ($null -ne $senpiRel) {
            $targetPath = Join-Path $SenpiProjectionDir $senpiRel
            if (-not (Test-Path -LiteralPath $targetPath)) {
                Write-Host "[DIVERGENCE] Missing Senpi projection junction: .senpi/$senpiRel"
                $divergences++
            } elseif (Test-Junction -Path $targetPath) {
                $expectedSource = Join-Path $SenpiHostSourceDir $senpiRel
                $actualTarget = Get-JunctionTarget -Path $targetPath
                if ($actualTarget -and (Test-Path -LiteralPath $actualTarget) -and ((Resolve-Path -LiteralPath $actualTarget).Path -eq (Resolve-Path -LiteralPath $expectedSource).Path)) {
                    Write-Host "[OK] Senpi junction: .senpi/$senpiRel"
                } else {
                    Write-Host "[DIVERGENCE] Broken Senpi junction: .senpi/$senpiRel (expected: $expectedSource, actual: $actualTarget)"
                    $divergences++
                }
            } else {
                Write-Host "[DIVERGENCE] Exists but not a junction: .senpi/$senpiRel"
                $divergences++
            }
            continue
        }
        $targetPath = Join-Path $ProjectionDir $relPath
        if (-not (Test-Path -LiteralPath $targetPath)) {
            Write-Host "[DIVERGENCE] Missing junction: $relPath"
            $divergences++
        } elseif (Test-Junction -Path $targetPath) {
            # Verify junction target points to correct source
            $expectedSource = Get-TargetSourcePath -RelPath $relPath
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

    # 実行環境診断（REQ-099-011）。配置検査の判定（divergences）に含めない。
    Show-RuntimeDiagnostics
    exit $(if ($divergences -gt 0) { 1 } else { 0 })
}

# ============================================================
# DRY-RUN MODE
# ============================================================

if ($Mode -eq 'dry-run') {
    Write-Host '=== Dry Run: selective junction sync ==='

    # Migration status (.opencode/ for OpenCode, .senpi/ for Senpi)
    if ($ResolvedHosts -contains 'opencode') {
        $isWholeJunction = Test-Junction -Path $ProjectionDir
        if ($isWholeJunction) {
            Write-Host '[INFO] Migration required: .opencode/ is a whole-directory junction'
        } elseif (-not (Test-Path -LiteralPath $ProjectionDir)) {
            Write-Host '[INFO] .opencode/ does not exist, would create as real directory'
        } else {
            Write-Host '[OK] .opencode/ is a real directory'
        }
    }
    if ($ResolvedHosts -contains 'senpi') {
        if (Test-Junction -Path $SenpiProjectionDir) {
            Write-Host '[INFO] Migration required: .senpi/ is a junction'
        } elseif (-not (Test-Path -LiteralPath $SenpiProjectionDir)) {
            Write-Host '[INFO] .senpi/ does not exist, would create as real directory'
        } else {
            Write-Host '[OK] .senpi/ is a real directory'
        }
    }

    # Parent directory status (OpenCode placement only)
    if ($ResolvedHosts -contains 'opencode') {
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
    }

    Write-Host ''
    Write-Host '--- Planned junctions ---'

    foreach ($relPath in $targets) {
        $senpiRel = Resolve-SenpiTargetRel -TargetEntry $relPath
        if ($null -ne $senpiRel) {
            $targetPath = Join-Path $SenpiProjectionDir $senpiRel
            $expectedSource = Join-Path $SenpiHostSourceDir $senpiRel
            if (Test-Junction -Path $targetPath) {
                $actualTarget = Get-JunctionTarget -Path $targetPath
                if ($actualTarget -and (Test-Path -LiteralPath $actualTarget)) {
                    Write-Host "[OK] Already junctioned: .senpi/$senpiRel"
                } else {
                    Write-Host "[WOULD REMOVE] Broken junction: .senpi/$senpiRel"
                    Write-Host "[WOULD ADD] Re-create junction: .senpi/$senpiRel"
                }
            } elseif (Test-Path -LiteralPath $targetPath) {
                Write-Host "[ERROR] Path exists and is not a junction: .senpi/$senpiRel"
            } else {
                Write-Host "[WOULD ADD] Create junction: .senpi/$senpiRel -> $expectedSource"
            }
            continue
        }
        $targetPath = Join-Path $ProjectionDir $relPath
        if (Test-Junction -Path $targetPath) {
            $actualTarget = Get-JunctionTarget -Path $targetPath
            $expectedSource = Get-TargetSourcePath -RelPath $relPath
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

    # REQ-058-004: stale 管理投影物（正本から除外・削除された管理対象 junction、および
    # 配置対象から明示変更により外れたホストの管理投影物）の削除予測を報告する（変更はしない）。
    Write-Host ''
    Write-Host '--- Planned stale junction cleanup ---'
    $dryRunStale = @(Get-StaleManagedJunctions -CurrentTargets $targets)
    foreach ($staleItem in $dryRunStale) {
        if ((Resolve-SenpiTargetRel -TargetEntry $staleItem.RelPath)) {
            Write-Host "[WOULD REMOVE] Stale managed junction: .senpi/$((Resolve-SenpiTargetRel -TargetEntry $staleItem.RelPath))"
        } else {
            Write-Host "[WOULD REMOVE] Stale managed junction: $($staleItem.RelPath)"
        }
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

    # 実行環境診断（REQ-099-011）。予測表示と区別して報告する。
    Show-RuntimeDiagnostics

    Write-Host ''
    Write-Host 'Dry run complete. No changes made.'
    exit 0
}

# ============================================================
# APPLY MODE
# ============================================================

if ($Mode -eq 'apply') {
    Write-Host '=== Apply: syncing .opencode/ selective junctions ==='

    # Step 1: Migration Detection (.opencode/ for OpenCode, .senpi/ for Senpi)
    if ($ResolvedHosts -contains 'opencode') {
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
    }
    if ($ResolvedHosts -contains 'senpi') {
        if (Test-Junction -Path $SenpiProjectionDir) {
            Write-Host '[ACTION] Removing whole-directory junction .senpi/'
            $rmResult = cmd /c "rmdir `"$SenpiProjectionDir`"" 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Error "[ERROR] Failed to remove whole-directory junction: $rmResult"
                exit 1
            }
            Write-Host '[ACTION] Creating .senpi/ as real directory'
            New-Item -ItemType Directory -Path $SenpiProjectionDir -Force | Out-Null
        } elseif (-not (Test-Path -LiteralPath $SenpiProjectionDir)) {
            Write-Host '[ACTION] Creating .senpi/ as real directory'
            New-Item -ItemType Directory -Path $SenpiProjectionDir -Force | Out-Null
        } else {
            Write-Host '[OK] .senpi/ exists as real directory'
        }
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

    # Step 3: Selective Junction Creation (OpenCode scope and Senpi scope)
    Write-Host ''
    Write-Host '--- Junctions ---'
    foreach ($relPath in $targets) {
        $senpiRel = Resolve-SenpiTargetRel -TargetEntry $relPath
        if ($null -ne $senpiRel) {
            $targetPath = Join-Path $SenpiProjectionDir $senpiRel
            $sourcePath = Join-Path $SenpiHostSourceDir $senpiRel

            if (Test-Junction -Path $targetPath) {
                $actualTarget = Get-JunctionTarget -Path $targetPath
                if ($actualTarget -and (Test-Path -LiteralPath $actualTarget) -and ((Resolve-Path -LiteralPath $actualTarget).Path -eq (Resolve-Path -LiteralPath $sourcePath).Path)) {
                    Write-Host "[OK] Already junctioned: .senpi/$senpiRel"
                    continue
                } else {
                    Write-Host "[ACTION] Removing broken junction: .senpi/$senpiRel"
                    cmd /c "rmdir `"$targetPath`"" 2>&1
                    if ($LASTEXITCODE -ne 0) {
                        Write-Error "[ERROR] Failed to remove broken junction: .senpi/$senpiRel"
                        exit 1
                    }
                }
            } elseif (Test-Path -LiteralPath $targetPath) {
                Write-Error "[ERROR] Path exists and is not a junction: .senpi/$senpiRel"
                exit 1
            }

            Write-Host "[ACTION] Creating junction: .senpi/$senpiRel"
            # Use absolute source path for mklink (robust regardless of $PWD)
            $result = cmd /c "mklink /J `"$targetPath`" `"$sourcePath`" 2>&1"
            if ($LASTEXITCODE -ne 0) {
                Write-Error "[ERROR] Failed to create junction .senpi/${senpiRel}: $result"
                exit 1
            }
            continue
        }
        $targetPath = Join-Path $ProjectionDir $relPath
        $sourcePath = Get-TargetSourcePath -RelPath $relPath

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

    # Step 4: Stale managed junction cleanup (REQ-058-002、REQ-050-015)。
    # 配置対象から明示変更により外れたホストの管理投影物（対象別除去）もここで
    # 処理する（REQ-099-012）。管理物判定不能な物は削除しない（REQ-058-008）。
    Write-Host ''
    Write-Host '--- Stale managed junction cleanup ---'
    $applyStale = @(Get-StaleManagedJunctions -CurrentTargets $targets)
    foreach ($staleItem in $applyStale) {
        $senpiStaleRel = (Resolve-SenpiTargetRel -TargetEntry $staleItem.RelPath)
        if ($senpiStaleRel) {
            Write-Host "[ACTION] Removing stale managed junction: .senpi/$senpiStaleRel"
        } else {
            Write-Host "[ACTION] Removing stale managed junction: $($staleItem.RelPath)"
        }
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

    # 実行環境診断（REQ-099-011）。配置結果の報告と区別して報告する。
    Show-RuntimeDiagnostics
    exit 0
}
