<#
.SYNOPSIS
    Install AgentDevFlow runtime artifacts into a consumer repository.

.DESCRIPTION
    consumer 向け公開入口。3つのモードの技術的差は以下の通り（REQ-009-042、REQ-050-002）:
    - check   : 検証のみ（ファイル変更なし）。旧状態確認専用スクリプトの検査能力
                （orphan 検出、版報告、link mode 検出を含む）を包含する（REQ-050-004）
    - dry-run : 変更予測（ファイル変更なし）
    - apply   : 実行（ファイル変更あり）。正本から除外・削除された ADF 管理投影物
                （stale 管理投影物）の配置先からの除去を含む（REQ-058、REQ-050-015）

    いずれのモードも provisioning（clone、fetch、reset）と network access を行わず、
    チェックアウト済みの .agentdev-plugin/ を前提に動作する（REQ-009-046、REQ-050-013、DEC-016）。

    AgentDevFlow 本体リポジトリでは実行しないこと。本体リポジトリで実行した場合は
    変更前に停止し、scripts/self-sync.ps1 へ案内する（REQ-050-006）。

    Placement targets (hosts) are user-selected (REQ-099-010, DEC-049 decision (3)):
    - OpenCode only / Senpi only / both. New installs are recommended to place
      both; existing installs keep their current placement targets when -Hosts
      is omitted, and change them only on explicit selection.
    - OpenCode projection (into .opencode/):
      - .opencode/commands/agentdev/  = junction -> .agentdev-plugin/src/common/commands/agentdev/
      - .opencode/skills/agentdev-*/  = individual junctions -> .agentdev-plugin/src/common/skills/agentdev-*/
      - .opencode/tools/agentdev-*/   = individual junctions -> .agentdev-plugin/src/common/tools/agentdev-*/
        (Custom Tool distribution type)
      - .opencode/plugins/agentdev-*/ = individual junctions -> .agentdev-plugin/src/opencode/plugins/agentdev-*/
        (Plugin / Hook distribution type)
    - Senpi projection (into .senpi/): each subdirectory of the host connection
      area .agentdev-plugin/src/senpi/ is projected as an individual junction.
      The enumeration depends on the placement contract (directory structure)
      only, never on individual implementation files under src/senpi/.
    - Projections of different hosts are managed separately: updating or
      removing one host's placement never touches the other host's projection,
      repo-local assets (third-party Skill placements, .agentdev/extensions/**)
      or user settings (AGENTS.md etc.) (REQ-099-012).

    Does NOT touch repo-local commands/skills:
    - .opencode/commands/repo/      = real directory (repo-local only)
    - .opencode/skills/repo-*/      = real directories (repo-local only)

    -LocalMode redirects the agentdev-gh Custom Tool implementation to the local source:
    - tools/agentdev-gh/         = junction -> .agentdev-plugin/src/common/tools/agentdev-gh/local/
      (Local implementation of the same operation contract, REQ-011-006 / DEC-004)
    All other agentdev-* artifacts still link to the canonical sources as normal.
    Requires the OpenCode placement target (it redirects an .opencode/ projection).

    Plugin packages (plugins/agentdev-*/) also get a depth-1 loader shim
    (.opencode/plugins/<package>.ts) because OpenCode auto-loads plugin files
    only at .opencode/plugins/ depth 1. This OpenCode-specific shim mechanism
    is NOT applied to the Senpi projection.

.PARAMETER Mode
    One of: dry-run, check, apply
    省略可能。引数なし起動時（-Mode 未指定）は対話ウィザードが起動し、Mode と環境と配置対象ホストを問う。

.PARAMETER Hosts
    One of: opencode, senpi, both
    配置対象ホストの選択（REQ-099-010、REQ-009-040）。OpenCode のみ / Senpi のみ / 両方。

    判断基準:
    - 新規導入では両方（both）を推奨する
    - 既存導入の更新では、本パラメータ省略時に現在の配置対象を検出して維持する
    - 明示指定（パラメータまたはウィザード選択）した場合のみ配置対象を変更する。
      選択されていないホストの ADF 管理投影物は apply で除去対象（stale）として
      報告され、check / dry-run では予測報告される。管理物と確定できない投影物は
      削除対象にしない（非破壊境界、REQ-058-008）
    - 実行環境の CLI 導入有無（OpenCode / omo 相当）による配置対象の自動振分けは
      行わない（REQ-099-011）

.PARAMETER LocalMode
    Switch. When set, the agentdev-gh Custom Tool implementation (.opencode/tools/agentdev-gh/)
    is junctioned to src/common/tools/agentdev-gh/local/ (runner-local.ts) instead of
    the GitHub implementation. All other agentdev-* command/skill/tool junctions
    target src/common/ and plugin junctions target src/opencode/ as normal.

    判断基準: GitHub Issue/PR を使わずローカルIssue（.agentdev/issues/）で運用する環境
    （ローカル版 OpenCode）では -LocalMode を指定する。

    -Mode check で -LocalMode を省略した場合、tools/agentdev-gh のリンク先から
    link mode（通常 / local）を自動検出して報告する。

.PARAMETER PluginDir
    Directory name for the agent-dev-flow checkout (default: .agentdev-plugin).
    Expected location of the checkout, relative to the consumer repo root.
    上級者向け: チェックアウト配置先を変更する場合のみ指定。通常は既定値を使用する（REQ-009-043）。

.EXAMPLE
    ./scripts/install.ps1
    引数なし起動時は対話ウィザードが Mode と環境を問う。

    ./scripts/install.ps1 -Mode dry-run
    ./scripts/install.ps1 -Mode check
    ./scripts/install.ps1 -Mode apply
    ./scripts/install.ps1 -Mode apply -PluginDir .agentdev-plugin
    ./scripts/install.ps1 -Mode apply -LocalMode
    ./scripts/install.ps1 -Mode apply -Hosts both
    ./scripts/install.ps1 -Mode apply -Hosts senpi
#>

# ADF-COVERS(implementation): REQ-050-001, REQ-050-002, REQ-050-004, REQ-050-005, REQ-050-006, REQ-050-007, REQ-050-008, REQ-050-013
# ADF-COVERS(implementation): REQ-052-007, REQ-052-008, REQ-011-006
# ADF-COVERS(implementation): REQ-058-001, REQ-058-002, REQ-058-003, REQ-058-004, REQ-058-005, REQ-058-006, REQ-058-007, REQ-058-008, REQ-058-009, REQ-058-010, REQ-058-011, REQ-058-012
# ADF-COVERS(implementation): REQ-050-015
# ADF-COVERS(implementation): REQ-099-010, REQ-099-011, REQ-099-012
# ADF-COVERS(implementation): REQ-009-040, REQ-009-042

#Requires -Version 7.0

param(
    [Parameter()]
    [ValidateSet('dry-run', 'check', 'apply')]
    [string]$Mode,

    [Parameter()]
    [ValidateSet('opencode', 'senpi', 'both')]
    [string]$Hosts,

    [switch]$LocalMode,

    [string]$PluginDir = '.agentdev-plugin'
)

$ErrorActionPreference = 'Stop'

# 共有定義（URL・ブランチ定数、cwd 安全化、チェックアウト案内）
. (Join-Path $PSScriptRoot 'consumer\common.ps1')

$RepoRoot = $PWD.Path
$PluginPath = Join-Path $RepoRoot $PluginDir

# Canonical sources in the multi-host canonical model (DEC-049):
# - src/common/      = host-independent canonical source (commands, skills, tools engines)
# - src/opencode/    = OpenCode host connection area (plugin/hook originals, REQ-002-045)
# - src/senpi/       = Senpi host connection area (placement contract; see src/senpi/README.md)
# - src/common/tools/agentdev-gh/local/ = Local implementation of the gh Custom Tool (REQ-009-020)
$CommonSourceDir = Join-Path $PluginPath 'src\common'
$OpencodeHostSourceDir = Join-Path $PluginPath 'src\opencode'
$SenpiHostSourceDir = Join-Path $PluginPath 'src\senpi'
$LocalSourceDir = Join-Path $PluginPath 'src\common\tools\agentdev-gh\local'
# Legacy single-canonical source (pre multi-host layout). Kept only so that
# junctions placed by older ADF versions stay recognizable as ADF-managed
# artifacts during updates of existing consumers (REQ-099-012).
$LegacyUnifiedSourceDir = Join-Path $PluginPath 'src\opencode'

$ProjectionDir = Join-Path $RepoRoot '.opencode'
$SenpiProjectionDir = Join-Path $RepoRoot '.senpi'
$CommandsDir = Join-Path $ProjectionDir 'commands'
$SkillsDir = Join-Path $ProjectionDir 'skills'
$ToolsDir = Join-Path $ProjectionDir 'tools'
$PluginsDir = Join-Path $ProjectionDir 'plugins'

# Parent directories that must exist as real directories (junction parents).
# The Senpi projection root itself is the managed parent of its subdirectories.
$ProjectionParentDirs = @($CommandsDir, $SkillsDir, $ToolsDir, $PluginsDir)
$ProjectionParentRels = @('commands', 'skills', 'tools', 'plugins')

# Repo-local patterns excluded from junction management
$RepoLocalCommandNames = @('repo')
$RepoLocalSkillPrefix = 'repo-'

# Repo-local Plugin excluded from consumer distribution (REQ-052-006, REQ-002-045).
# SYNC OBLIGATION (runtime-package-boundary Design「repo-local Plugin の配布・投影契約」):
# keep this exclusion in sync across the 3 consumer distribution paths:
# scripts/install.ps1 (this file), scripts/consumer/archive/install.ps1,
# scripts/self/release/package-release-archive.ps1. self-sync.ps1 must NOT
# exclude it (self-host projection is kept).
$RepoLocalPluginNames = @('agentdev-distribution-boundary-guard')

# In LocalMode the agentdev-gh Custom Tool implementation is redirected from
# src/common/tools/agentdev-gh/local/ (REQ-009-020).
$LocalModeRedirectToolRel = 'tools\agentdev-gh'

# textlint guard plugin の導入時生成依存（vendor 成果物）。版固定情報（package.json +
# bun.lock）のみが配布され、vendor 実体は導入時に利用者が生成する（REQ-029-012）。
# 欠落（部分生成状態を含む）検知時に fail-closed で停止し導入手順を案内する。
# 導入系スクリプトは依存の生成もネットワーク取得も行わない（DEC-016）。
$TextlintGuardBundleRel = 'plugins\agentdev-textlint-guard\vendor\textlint-engine.bundle.json'
$TextlintGuardDictRel = 'plugins\agentdev-textlint-guard\vendor\kuromoji-dict'

# --- Helper Functions ---

function Invoke-InstallWizard {
    <#
    .SYNOPSIS
        引数なし起動時（-Mode 未指定）の対話ウィザード。Mode と環境を問う（REQ-{NNNN}-{NNN}）。
    #>
    Write-Host '=== AgentDevFlow 導入ウィザード ==='
    Write-Host ''
    Write-Host 'Q1. 目的を選んでください（番号を入力）:'
    Write-Host '  1) 新規インストール（apply: 実行、ファイル変更あり）'
    Write-Host '  2) 更新・再同期（apply: 実行、ファイル変更あり）'
    Write-Host '  3) 状態確認（check: 検証のみ、ファイル変更なし）'
    Write-Host '  4) 変更予測（dry-run: 変更予測のみ、ファイル変更なし）'
    $modeChoice = Read-Host '番号'
    switch ($modeChoice) {
        '1' { $script:Mode = 'apply' }
        '2' { $script:Mode = 'apply' }
        '3' { $script:Mode = 'check' }
        '4' { $script:Mode = 'dry-run' }
        default {
            Write-Host "無効な選択です: $modeChoice"
            exit 1
        }
    }

    Write-Host ''
    Write-Host 'Q2. 環境を選んでください（番号を入力）:'
    Write-Host '  1) GitHub 版（通常）'
    Write-Host '  2) ローカル版（GitHub Issue/PR を使わずローカルファイルで運用）'
    $envChoice = Read-Host '番号'
    switch ($envChoice) {
        '1' { }
        '2' { $script:LocalMode = $true }
        default {
            Write-Host "無効な選択です: $envChoice"
            exit 1
        }
    }
    Write-Host ''

    # 配置対象ホストの選択（REQ-099-010、REQ-009-040）。現在の配置対象を検出して
    # 案内し、既存導入では既定（空入力）で現在の配置対象を維持する。
    # 実行環境の CLI 導入有無を配置対象の選択に使わない（REQ-099-011）。
    $detectedHosts = Get-DetectedHosts
    Write-Host 'Q3. 配置対象ホストを選んでください（番号を入力）:'
    if ($detectedHosts -eq 'none') {
        Write-Host '  現在の配置対象の検出結果: なし（新規導入）'
        Write-Host '  推奨: 両方への配置（both）'
    } else {
        Write-Host "  現在の配置対象の検出結果: $(Get-HostsDisplay -HostsValue $detectedHosts)"
        Write-Host '  何も入力せず Enter で現在の配置対象を維持します。変更する場合のみ番号を入力してください。'
    }
    Write-Host '  1) OpenCode のみ（.opencode/ への投影）'
    Write-Host '  2) Senpi のみ（.senpi/ への投影）'
    Write-Host '  3) 両方（OpenCode + Senpi）'
    $hostsChoice = Read-Host '番号'
    switch ($hostsChoice) {
        '' {
            if ($detectedHosts -eq 'none') { $script:Hosts = 'both' }
        }
        '1' { $script:Hosts = 'opencode' }
        '2' { $script:Hosts = 'senpi' }
        '3' { $script:Hosts = 'both' }
        default {
            Write-Host "無効な選択です: $hostsChoice"
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

function Test-JunctionTargetMatchesSource {
    <#
    .SYNOPSIS
        junction の解決先が正本解決パス（Get-TargetSourcePath の現行正本解決。LocalMode
        を含む）と一致するか判定する（両公開入口・両ホスト・全モード共通の正本一致検査。
        「ジャンクション状態の判定と自己修復」Design 参照）。リンク先実体が存在しない場合
        （broken）は解決に失敗するため不一致扱いとなり、管理物確定は
        Test-ManagedProjectionJunction / Test-ManagedSenpiJunction が reparse data の
        リンク先文字列で行う。
    #>
    param([string]$JunctionFullName, [string]$SourcePath)
    $targetObj = Get-JunctionTarget -Path $JunctionFullName
    $targetList = @($targetObj) | ForEach-Object { [string]$_ } | Where-Object { $_ }
    if ($targetList.Count -eq 0) { return $false }
    $expectedFull = [System.IO.Path]::GetFullPath($SourcePath).TrimEnd('\', '/')
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

function Get-ConsumerJunctionTargets {
    <#
    .SYNOPSIS
        Enumerate all junction targets for the selected placement hosts from the
        canonical sources (src/common/, src/opencode/, src/senpi/).
        Returns sorted array of relative paths. OpenCode targets are relative to
        .opencode/; Senpi targets are single segments relative to .senpi/ and
        prefixed 'senpi:' to keep both host scopes in one managed enumeration.
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
        # Repo-local Plugin（$RepoLocalPluginNames）は consumer 配布対象外のため除外する
        # （REQ-052-006、REQ-002-045）。除外漏れは check モードの orphan 検出で報告される。
        $pluginsSource = Join-Path $OpencodeHostSourceDir 'plugins'
        if (Test-Path -LiteralPath $pluginsSource) {
            Get-ChildItem -LiteralPath $pluginsSource -Directory -Filter 'agentdev-*' |
                Where-Object { $_.Name -notin $RepoLocalPluginNames } |
                ForEach-Object { $targets.Add("plugins\$($_.Name)") }
        }
    }

    if ($ResolvedHosts -contains 'senpi') {
        # Senpi host connection area (placement-contract level enumeration).
        # Each subdirectory of src/senpi/ is projected as one junction under
        # .senpi/. The enumeration depends on the directory structure contract
        # only; it never inspects individual implementation files (REQ-099-011).
        if (Test-Path -LiteralPath $SenpiHostSourceDir) {
            Get-ChildItem -LiteralPath $SenpiHostSourceDir -Directory |
                ForEach-Object { $targets.Add("senpi:$($_.Name)") }
        }
    }

    return ($targets | Sort-Object)
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
        'none'     { return 'なし（新規導入）' }
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

function Get-DetectedHosts {
    <#
    .SYNOPSIS
        現在の配置対象を配置先の状態から検出する（REQ-099-010）。
        管理物と確定できる ADF 管理投影物が存在するホストのみ検出対象とし、
        利用者が自前で配置した無関係な junction を誤検出しない。
    #>
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
    $hasSenpi = $false
    if (Test-Path -LiteralPath $SenpiProjectionDir) {
        $senpiFound = Get-ChildItem -LiteralPath $SenpiProjectionDir -Directory -Force -ErrorAction SilentlyContinue |
            Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint } |
            Where-Object {
                Test-ManagedSenpiJunction -JunctionName $_.Name -JunctionFullName $_.FullName
            }
        if ($senpiFound) { $hasSenpi = $true }
    }
    if ($hasOpenCode -and $hasSenpi) { return 'both' }
    if ($hasOpenCode) { return 'opencode' }
    if ($hasSenpi) { return 'senpi' }
    return 'none'
}

function Resolve-TargetHosts {
    <#
    .SYNOPSIS
        配置対象ホストを確定する（REQ-099-010、DEC-049 決定(3)）。
        明示指定（-Hosts パラメータまたはウィザード選択）を最優先し、未指定時は
        現在の配置対象を検出して維持する。検出不能（新規導入）は both（推奨）。
    #>
    if ($Hosts) {
        if ($Hosts -eq 'both') { return @('opencode', 'senpi') }
        return @($Hosts)
    }
    $detected = Get-DetectedHosts
    if ($detected -eq 'none') { return @('opencode', 'senpi') }
    switch ($detected) {
        'opencode' { return @('opencode') }
        'senpi'    { return @('senpi') }
        'both'     { return @('opencode', 'senpi') }
    }
    return @('opencode', 'senpi')
}

function Get-TargetSourcePath {
    <#
    .SYNOPSIS
        Resolve the absolute source path backing a projection relative path.
        OpenCode targets back to the canonical sources (src/common/ for
        commands/skills/tools, src/opencode/ for plugins). In LocalMode,
        tools\agentdev-gh is redirected to src/common/tools/agentdev-gh/local/
        (REQ-009-020). Senpi targets back to src/senpi/<subdir>.
    #>
    param([string]$RelPath)
    $senpiRel = Resolve-SenpiTargetRel -TargetEntry $RelPath
    if ($null -ne $senpiRel) {
        return Join-Path $SenpiHostSourceDir $senpiRel
    }
    if ($LocalMode -and $RelPath -eq $LocalModeRedirectToolRel) {
        return $LocalSourceDir
    }
    if ($RelPath -like 'plugins\*') {
        return Join-Path $OpencodeHostSourceDir $RelPath
    }
    return Join-Path $CommonSourceDir $RelPath
}

function Test-ManagedProjectionJunction {
    <#
    .SYNOPSIS
        配置先の junction が ADF 管理投影物（本スクリプト系が配置した物）であることを
        確定する（REQ-058-001、REQ-058-008）。

    .DESCRIPTION
        確定基準: リンク先が、当該 junction の相対パスに対応する正本パス候補
        （現行正本: src/common/ または src/opencode/plugins/、旧単一正本:
        src/opencode/<相対パス>、または LocalMode リダイレクト先 tools\agentdev-gh のみ）
        に一致する場合のみ管理物とみなす。旧単一正本候補は、旧構成で配置された既存
        consumer の管理投影物を確定し、更新時に安全に扱うために残す（REQ-099-012）。
        正本以外を向く junction やリンク先を確定できない junction は管理物判定不能と
        して扱い、自動削除の対象にしない非破壊境界である（REQ-058-008）。
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
    }
    # 旧単一正本候補（旧構成 consumer の管理物確定用。REQ-099-012 更新互換）
    $expectedSources += (Join-Path $LegacyUnifiedSourceDir $JunctionRel)
    if ($JunctionRel -eq $LocalModeRedirectToolRel) {
        $expectedSources += ($LocalSourceDir)
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

function Test-ManagedSenpiJunction {
    <#
    .SYNOPSIS
        .senpi/ 配下の junction が ADF 管理投影物（Senpi 投影）であることを確定する
        （REQ-058-001、REQ-058-008）。

    .DESCRIPTION
        確定基準: リンク先が、当該 junction 名に対応する Senpi 正本パス
        （src/senpi/<名前>）に一致する場合のみ管理物とみなす。正本以外を向く
        junction やリンク先を確定できない junction は管理物判定不能として扱い、
        自動削除の対象にしない非破壊境界である（REQ-058-008）。
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

function Get-StaleManagedJunctions {
    <#
    .SYNOPSIS
        ADF 管理投影物のうち正本の管理対象列挙から外れたもの（stale、削除対象）を返す
        （REQ-058-001、REQ-058-002）。

    .DESCRIPTION
        返却要素は RelPath（管理列挙の相対パス表現）と FullName（絶対パス）を持つ。
        正本の管理対象列挙（追加・修復対象を含む現行対象）に含まれない junction のうち、
        管理物と確定できるものだけを返す。対象範囲は OpenCode 投影（.opencode/ の
        commands/skills/tools/plugins 配下）と Senpi 投影（.senpi/ 直下）の両方であり、
        配置対象から外れたホストの管理投影物も stale として扱う（REQ-099-012 の
        対象別除去）。管理物判定不能な junction は返さない（REQ-058-008 の非破壊境界）。
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
        plugin.ts の default を再エクスポートする固定内容を返す。
    #>
    param([string]$PackageName)
    return (
        "// Generated by scripts/install.ps1 / scripts/self-sync.ps1 - do not edit.`n" +
        "export { default } from `"./$PackageName/plugin.ts`";`n"
    )
}

function Test-TextlintGuardPluginPresent {
    <#
    .SYNOPSIS
        チェックアウトが textlint guard plugin package を含むか判定する。
        plugin を含まないチェックアウトは vendor 検査の対象外とする。
    #>
    return Test-Path -LiteralPath (Join-Path $OpencodeHostSourceDir 'plugins\agentdev-textlint-guard')
}

function Test-TextlintVendorReady {
    <#
    .SYNOPSIS
        textlint guard plugin の導入時生成依存（vendor 成果物）が完全に存在するか検査する。
        engine bundle と kuromoji 辞書の両方が必須であり、部分生成状態（bundle のみ存在し
        辞書が欠損 等）は欠落として扱う。plugin package を含まないチェックアウトは
        検査対象外（$true）とする。
    #>
    if (-not (Test-TextlintGuardPluginPresent)) { return $true }
    $bundlePath = Join-Path $OpencodeHostSourceDir $TextlintGuardBundleRel
    if (-not (Test-Path -LiteralPath $bundlePath)) { return $false }
    $dictDir = Join-Path $OpencodeHostSourceDir $TextlintGuardDictRel
    if (-not (Test-Path -LiteralPath $dictDir)) { return $false }
    $dictFiles = @(Get-ChildItem -LiteralPath $dictDir -File -Filter '*.dat.gz' -ErrorAction SilentlyContinue)
    return ($dictFiles.Count -gt 0)
}

function Show-TextlintVendorGuidance {
    <#
    .SYNOPSIS
        vendor 成果物の欠落検知時の導入手順案内を表示する（依存の生成とネットワーク取得は
        本スクリプトが行わない。利用者が plugin package 配下で実行する）。
    #>
    $pluginPackageRel = ($TextlintGuardBundleRel -split '\\')[0..1] -join '/'
    Write-Host "[ERROR] textlint guard plugin の依存成果物（vendor）が未生成または不完全です（$pluginPackageRel/vendor/）"
    Write-Host "導入手順: plugin package 配下（$PluginDir/$pluginPackageRel/）で次の順に実行してください（bun install はネットワーク取得を含みます）:"
    Write-Host '  1. bun install'
    Write-Host '  2. bun run build:engine'
    Write-Host 'その後、本スクリプトを再実行してください。導入系スクリプトは依存の生成とネットワーク取得を行いません。'
}

function Test-TextlintBundleVersionsMatchPin {
    <#
    .SYNOPSIS
        生成済み engine bundle に埋め込まれた依存版と、plugin package の版固定情報
        （bun.lock pin）の乖離（版乖離）を検査する。一致する場合は $true、乖離または
        検査不能（bundle 未生成等）を返す。検査不能の理由を第二戻り値で返す。
    #>
    $bundlePath = Join-Path $OpencodeHostSourceDir $TextlintGuardBundleRel
    $pluginPackageDir = Split-Path (Split-Path $bundlePath -Parent) -Parent
    $pkgJsonPath = Join-Path $pluginPackageDir 'package.json'
    $lockPath = Join-Path $pluginPackageDir 'bun.lock'
    if (-not (Test-Path -LiteralPath $pkgJsonPath) -or -not (Test-Path -LiteralPath $lockPath)) {
        return $false, 'version pin metadata (package.json / bun.lock) missing'
    }
    try {
        $bundleEnvelope = [System.IO.File]::ReadAllText($bundlePath) | ConvertFrom-Json
        $pkg = [System.IO.File]::ReadAllText($pkgJsonPath) | ConvertFrom-Json
        $lockText = [System.IO.File]::ReadAllText($lockPath)
    } catch {
        return $false, "failed to read plugin package metadata ($($_.Exception.Message))"
    }
    foreach ($prop in $pkg.dependencies.PSObject.Properties) {
        $name = $prop.Name
        $embedded = $bundleEnvelope.versions.$name
        if ($null -eq $embedded) {
            return $false, "bundle versions missing dependency: $name"
        }
        $pattern = '"?' + [regex]::Escape($name) + '@([0-9][^"\s,)]*)"?'
        $m = [regex]::Match($lockText, $pattern)
        if (-not $m.Success) {
            return $false, "cannot find pinned version of $name in bun.lock"
        }
        if ($embedded -ne $m.Groups[1].Value) {
            return $false, "version divergence: $name (bundle $embedded vs bun.lock pin $($m.Groups[1].Value))"
        }
    }
    return $true, ''
}

# --- Runtime diagnostics (REQ-099-011) ---

function Show-RuntimeDiagnostics {
    <#
    .SYNOPSIS
        実行環境診断（CLI 導入有無の確認）を配置検査と区別して報告する（REQ-099-011）。

    .DESCRIPTION
        配置検査（junction・投影・乖離の検査）と実行環境診断を別セクションで報告する。
        CLI 未導入でも配置と配置検査は可能であり、診断結果は乖離（divergence）に
        数えない。診断は配置対象の選択・変更に使用せず、対応済み組合せの宣言も
        行わない（OmO 版は診断・互換確認にのみ使用）。
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
# 取得機構のパーサーを正本とする。3経路同期契約: scripts/self-sync.ps1 と
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

# --- Checkout Guidance (AG-002/REQ-009-047) ---

# 案内文言・既定 URL 定数は consumer-opencode-common.ps1 の共有定義を使用する（RU-0014、AG-020）。
# clone コマンドはブランチ指定なし、ZIP 配置の補足（ネスト回避、scripts/ 同一チェックアウトコピー）は
# 当スクリプトの案内文言を維持する。
function Invoke-PluginCheckoutGuidance {
    Show-ConsumerCheckoutGuidance -PluginDir $PluginDir -SourceDir $CommonSourceDir `
        -CloneCommandLine "git clone $ConsumerRepoUrl $PluginDir" `
        -ZipNoteLines @(
            "   注意: ZIP 展開直後の agent-dev-flow-<ref>/ の一段ネストを避け、$PluginDir/src/ 配下（src/common/、src/opencode/ 等）が正本レイアウトのまま配置されるようにすること",
            "   （.git のない ZIP 展開チェックアウトも正規の配置形態）",
            "4. scripts/ は $PluginDir/ と同一チェックアウトからコピーすること（スクリプトとチェックアウトの版不一致の防止）"
        )
}

# --- Main ---

# cwd 安全化（REQ-009-041）。ウィザードの前に通過すること。
Assert-ValidConsumerCwd

# 誤実行防止（REQ-050-006）: 実行ディレクトリ直下に src/opencode/ が存在する場合、
# AgentDevFlow 本体リポジトリ（self-hosting 構成）と判定し、変更前に停止して案内する。
# consumer ではチェックアウトは .agentdev-plugin/ 配下にあり、実行ディレクトリ直下に
# src/opencode/ は存在しない（判定方式は runtime-package-boundary Design「誤実行防止の環境判定方式」）。
if (Test-Path -LiteralPath (Join-Path $RepoRoot 'src\opencode')) {
    Write-Host "このスクリプトは AgentDevFlow を導入するリポジトリ（consumer）専用です。現在のフォルダは AgentDevFlow 本体リポジトリです。本体リポジトリでは scripts/self-sync.ps1 を使ってください。"
    exit 1
}

# 引数なし起動時（-Mode 未指定）の対話ウィザード
if (-not $Mode) {
    Invoke-InstallWizard
}

# 配置対象ホストの確定（REQ-099-010、DEC-049 決定(3)）。明示指定（-Hosts パラメータ
# またはウィザード選択）を最優先し、未指定時は現在の配置対象を検出して維持する。
# 検出不能（新規導入）は both（新規導入の推奨）。
$ResolvedHosts = @(Resolve-TargetHosts)
Write-Host "[INFO] Placement targets: $(Get-HostsDisplay -HostsValue $(if ($ResolvedHosts -contains 'opencode' -and $ResolvedHosts -contains 'senpi') { 'both' } elseif ($ResolvedHosts -contains 'opencode') { 'opencode' } else { 'senpi' }))"
if ($Hosts) {
    Write-Host '[INFO] Placement targets were set by explicit selection.'
} else {
    Write-Host '[INFO] Placement targets were inherited from the current placement state (or defaulted to both for a new install). Use -Hosts to change them explicitly.'
}

# LocalMode requires the OpenCode placement target (it redirects an .opencode/ projection)
if ($LocalMode -and ($ResolvedHosts -notcontains 'opencode')) {
    Write-Host '[ERROR] -LocalMode は OpenCode 投影（.opencode/tools/agentdev-gh）のリンク先差し替えであり、OpenCode が配置対象に含まれていません。-Hosts opencode または -Hosts both を指定してください。'
    exit 1
}

# usable checkout 判定（AG-002/REQ-009-047）: .git の有無ではなく共通正本 src/common/ の存在で判定する。
# 全モード（check、dry-run、apply）共通の前提であり、provisioning は行わない（AG-001/REQ-009-046、DEC-016）。
# ZIP 展開チェックアウト（.git なし）も正規の配置形態として扱う（AG-003/REQ-009-048）。
# 旧構成の src/opencode/ が存在しない場合も、選択ホストの接続領域欠落として後続の
# 接続領域チェックで案内する（REQ-009-047「src/opencode/ が存在しない場合を含む」）。
if (-not (Test-Path -LiteralPath $CommonSourceDir)) {
    Invoke-PluginCheckoutGuidance
}

# 選択したホストの接続領域チェック（投影元の存在）。欠落はエラー停止して案内する
# （投影元なしでの配置は成立しないため。REQ-009-047 の案内契約）。
if ($ResolvedHosts -contains 'opencode' -and -not (Test-Path -LiteralPath $OpencodeHostSourceDir)) {
    Write-Host "[ERROR] OpenCode 配置対象が選択されましたが、チェックアウトに $PluginDir/src/opencode/（OpenCode 接続領域）が存在しません。完全なチェックアウトを用意するか、-Hosts を見直してください。"
    exit 1
}
if ($ResolvedHosts -contains 'senpi' -and -not (Test-Path -LiteralPath $SenpiHostSourceDir)) {
    Write-Host "[ERROR] Senpi 配置対象が選択されましたが、チェックアウトに $PluginDir/src/senpi/（Senpi 接続領域）が存在しません。完全なチェックアウトを用意するか、Senpi に配置しない場合は -Hosts opencode を指定してください。"
    exit 1
}

# textlint guard 依存成果物の前置確認（OpenCode 配置対象を含む場合のみ。plugin package は
# OpenCode 接続領域の配布物のため）。check モード以外は欠落・部分生成状態で fail-closed
# 停止し導入手順を案内する。check は乖離報告として扱う。
if ($ResolvedHosts -contains 'opencode' -and $Mode -ne 'check' -and -not (Test-TextlintVendorReady)) {
    Write-Host '=== textlint guard 依存生成の前置確認 ==='
    Show-TextlintVendorGuidance
    exit 1
}

# third-party Skill drift 検知（全モード共通。宣言済みで配置欠落は ERROR 停止し、
# 宣言ファイルが解決できない環境は検査対象外として正常扱いする）
Invoke-ThirdPartyDriftCheck -RootDir $RepoRoot -SkillsRootDir $SkillsDir -CliCommandHint 'bun .opencode/tools/agentdev-third-party/cli.ts'

# LocalMode requires the local redirect target (Local 実装 Tool) to exist
if ($LocalMode) {
    $localRedirectSource = $LocalSourceDir
    if (-not (Test-Path -LiteralPath (Join-Path $localRedirectSource 'runner-local.ts'))) {
        Write-Error "[ERROR] LocalMode redirect source not found: $localRedirectSource (runner-local.ts). Ensure $PluginDir contains agent-dev-flow checkout with src/common/tools/agentdev-gh/local/."
        exit 1
    }
}

$targets = Get-ConsumerJunctionTargets

# ============================================================
# CHECK MODE
# ============================================================

if ($Mode -eq 'check') {
    Write-Host '=== Consumer Install Check ==='

    # Link mode 判定（REQ-050-004 継承能力）: -LocalMode 指定時は指定構成を期待値とする。
    # 未指定時は tools\agentdev-gh のリンク先から link mode を自動検出して報告する
    # （local: src/common/tools/agentdev-gh/local/ へ解決される場合、consumer-generated と判定）。
    $DetectedLocalMode = $false
    $ghToolProjection = Join-Path $ProjectionDir $LocalModeRedirectToolRel
    $ghToolLocalSource = $LocalSourceDir
    if (Test-Junction -Path $ghToolProjection) {
        $ghToolTarget = Get-JunctionTarget -Path $ghToolProjection
        if ($ghToolTarget -and (Test-Path -LiteralPath $ghToolTarget) -and
            (Test-Path -LiteralPath $ghToolLocalSource) -and
            ((Resolve-Path -LiteralPath $ghToolTarget).Path -eq (Resolve-Path -LiteralPath $ghToolLocalSource).Path)) {
            $DetectedLocalMode = $true
        }
    }
    $ExpectedLocalMode = if ($LocalMode) { $true } else { $DetectedLocalMode }
    if ($ExpectedLocalMode) {
        Write-Host '[INFO] Link mode: local (consumer-generated) — tools/agentdev-gh -> src/common/tools/agentdev-gh/local/'
    } else {
        Write-Host '[INFO] Link mode: normal (consumer-with-agentdev) — tools/agentdev-gh -> src/opencode/tools/agentdev-gh/'
    }
    $divergences = 0

    # 1. Plugin checkout directory
    if (-not (Test-Path -LiteralPath $PluginPath)) {
        Write-Host "[DIVERGENCE] $PluginDir not found (git clone またはソース ZIP 展開が必要)"
        $divergences++
    } else {
        Write-Host "[OK] $PluginDir exists"
    }

    # 2. Source directory (usable checkout 判定: .git の有無ではなく共通正本 src/common/ の存在。ZIP 展開チェックアウトも正規の配置形態)
    if (-not (Test-Path -LiteralPath $CommonSourceDir)) {
        Write-Host "[DIVERGENCE] Usable checkout not found: $PluginDir/src/common/ (git clone またはソース ZIP 展開が必要)"
        $divergences++
    } else {
        Write-Host "[OK] Usable checkout exists: $PluginDir/src/common/"
    }

    # 2a. Selected host connection areas (投影元の存在)
    if ($ResolvedHosts -contains 'opencode') {
        if (-not (Test-Path -LiteralPath $OpencodeHostSourceDir)) {
            Write-Host "[DIVERGENCE] OpenCode host connection area not found: $PluginDir/src/opencode/"
            $divergences++
        } else {
            Write-Host "[OK] OpenCode host connection area exists: $PluginDir/src/opencode/"
        }
    }
    if ($ResolvedHosts -contains 'senpi') {
        if (-not (Test-Path -LiteralPath $SenpiHostSourceDir)) {
            Write-Host "[DIVERGENCE] Senpi host connection area not found: $PluginDir/src/senpi/"
            $divergences++
        } else {
            Write-Host "[OK] Senpi host connection area exists: $PluginDir/src/senpi/"
            $senpiTargetCount = @($targets | Where-Object { $null -ne (Resolve-SenpiTargetRel -TargetEntry $_) }).Count
            if ($senpiTargetCount -eq 0) {
                Write-Host "[INFO] Runtime diagnostic: no placement-contract subdirectories exist under $PluginDir/src/senpi/ yet (host connection implementations are being added by parallel execution units); placement proceeds with an empty .senpi/ projection"
            }
        }
    }

    # 2b. Checkout version report (.git 存在時のみ、不在時 unknown。REQ-050-004 継承能力)
    # git リポジトリ性は乖離ではなく情報として報告する。
    if (Test-Path -LiteralPath $PluginPath) {
        if (Test-Path -LiteralPath (Join-Path $PluginPath '.git')) {
            Write-Host "[INFO] $PluginDir is a git repository"
            Push-Location -LiteralPath $PluginPath
            try {
                $commit = git rev-parse --short HEAD 2>$null
                $branch = git rev-parse --abbrev-ref HEAD 2>$null
                Write-Host "[INFO] Checkout: $branch ($commit)"
            }
            finally {
                Pop-Location
            }
        } else {
            Write-Host "[INFO] $PluginDir is not a git repository (possibly a ZIP-expanded checkout; informational, not a divergence)"
            Write-Host '[INFO] Checkout: unknown'
        }
    }

    # 3. Local redirect source (local mode only)
    if ($ExpectedLocalMode) {
        if (-not (Test-Path -LiteralPath (Join-Path $ghToolLocalSource 'runner-local.ts'))) {
            Write-Host "[DIVERGENCE] Local redirect source not found: $PluginDir/src/common/tools/agentdev-gh/local/"
            $divergences++
        } else {
            Write-Host "[OK] Local redirect source exists: $PluginDir/src/common/tools/agentdev-gh/local/"
        }
    }

    # 2c. textlint guard plugin dependency（導入時生成依存）: vendor 完全性と版乖離。
    # plugin package を含むチェックアウトのみ対象。欠落（部分生成状態を含む）は乖離
    # として報告し、導入手順を案内する。plugin package は OpenCode 接続領域の
    # 配布物のため、OpenCode 配置対象を含む場合のみ検査する。
    if ($ResolvedHosts -contains 'opencode' -and (Test-TextlintGuardPluginPresent)) {
        if (-not (Test-TextlintVendorReady)) {
            Write-Host "[DIVERGENCE] textlint guard plugin dependency (vendor) missing or incomplete: $TextlintGuardBundleRel / $TextlintGuardDictRel"
            Show-TextlintVendorGuidance
            $divergences++
        } else {
            Write-Host "[OK] textlint guard plugin dependency (vendor) exists"
            $pinState, $pinDetail = Test-TextlintBundleVersionsMatchPin
            if (-not $pinState) {
                Write-Host "[DIVERGENCE] textlint guard plugin dependency version divergence: $pinDetail"
                Write-Host '再生成手順: plugin package 配下で bun install && bun run build:engine を実行してください。'
                $divergences++
            } else {
                Write-Host '[OK] textlint guard plugin dependency versions match the bun.lock pins'
            }
        }
    }

    # 4. Projection roots must be real directories (.opencode/ for OpenCode, .senpi/ for Senpi)
    if ($ResolvedHosts -contains 'opencode') {
        if (Test-Junction -Path $ProjectionDir) {
            Write-Host '[DIVERGENCE] .opencode/ is a junction (must be real directory)'
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

    # 5. Parent directories (OpenCode placement only; the Senpi projection root is the managed parent)
    if ($ResolvedHosts -contains 'opencode') {
        foreach ($parentDir in $ProjectionParentDirs) {
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
    }

    # 6. Check each expected junction (OpenCode scope and Senpi scope)
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
                    Write-Host "[OK] Senpi junction: .senpi/$senpiRel -> $actualTarget"
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
            $expectedSource = if ($ExpectedLocalMode -and $relPath -eq $LocalModeRedirectToolRel) {
                $LocalSourceDir
            } else {
                Get-TargetSourcePath -RelPath $relPath
            }
            $actualTarget = Get-JunctionTarget -Path $targetPath
            if ($actualTarget -and (Test-Path -LiteralPath $actualTarget) -and ((Resolve-Path -LiteralPath $actualTarget).Path -eq (Resolve-Path -LiteralPath $expectedSource).Path)) {
                Write-Host "[OK] Junction: $relPath -> $actualTarget"
            } else {
                Write-Host "[DIVERGENCE] Broken junction: $relPath (expected: $expectedSource, actual: $actualTarget)"
                $divergences++
            }
        } else {
            Write-Host "[DIVERGENCE] Exists but not a junction: $relPath"
            $divergences++
        }
    }

    # 7. Orphan detection (REQ-050-004 継承能力)。REQ-058:
    # 正本の管理対象から外れた ADF 管理投影物（stale）のみ乖離として検出・報告する
    # （検出のみでファイルシステムを変更しない。REQ-058-003）。
    # 管理物判定不能な junction（正本以外を向く等）は報告のみで非破壊とする（REQ-058-008）。
    Write-Host ''
    Write-Host '--- Orphan junctions ---'
    $staleJunctions = @(Get-StaleManagedJunctions -CurrentTargets $targets)
    foreach ($staleItem in $staleJunctions) {
        Write-Host "[ORPHAN] Stale managed junction (apply removes it): $($staleItem.RelPath)"
        $divergences++
    }
    foreach ($unmanagedRel in (Get-UnmanagedProjectionJunctionRels -CurrentTargets $targets)) {
        Write-Host "[INFO] Junction not managed by AgentDevFlow (left untouched): $unmanagedRel"
    }
    if ($staleJunctions.Count -eq 0) {
        Write-Host '[OK] No orphan junctions detected'
    }

    # 7b. Plugin loader shims (depth-1 re-export files, OpenCode auto-load requirement)
    Write-Host ''
    Write-Host '--- Plugin loader shims ---'
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
    Get-ChildItem -LiteralPath $PluginsDir -File -Filter 'agentdev-*.ts' -ErrorAction SilentlyContinue |
        ForEach-Object {
            $pkgName = $_.BaseName
            if ($pkgName -notin $expectedPluginPackages) {
                Write-Host "[ORPHAN] Plugin loader shim not from current source: plugins/$($_.Name)"
                $divergences++
            }
        }

    # 8. Repo-local directories and protected assets (informational)
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

    # 9. Protected assets report (REQ-099-012). The installer never writes to
    # repo-local assets (third-party Skill placements, .agentdev/extensions/**)
    # or user settings (AGENTS.md etc.); their presence is reported as
    # informational so that protection is visible in the placement inspection.
    $protectedAssets = @(
        @{ Rel = '.agentdev\extensions'; Label = 'project extensions directory (.agentdev/extensions/**)' },
        @{ Rel = 'AGENTS.md'; Label = 'user settings file (AGENTS.md)' }
    )
    foreach ($asset in $protectedAssets) {
        $assetPath = Join-Path $RepoRoot $asset.Rel
        if (Test-Path -LiteralPath $assetPath) {
            Write-Host "[INFO] Protected asset present (never modified by this script): $($asset.Label)"
        }
    }

    Write-Host ''
    if ($divergences -eq 0) {
        Write-Host 'No divergence detected. Consumer install is in sync.'
    } else {
        Write-Host "$divergences divergence(s) detected. Run scripts/install.ps1 -Mode apply to fix."
    }

    # 実行環境診断（REQ-099-011）。配置検査の判定（divergences）に含めない。
    Show-RuntimeDiagnostics
    exit $(if ($divergences -gt 0) { 1 } else { 0 })
}

# ============================================================
# DRY-RUN MODE
# ============================================================

if ($Mode -eq 'dry-run') {
    Write-Host '=== Consumer Install Dry Run ==='
    if ($LocalMode) {
        Write-Host '[INFO] LocalMode: tools/agentdev-gh redirects to src/common/tools/agentdev-gh/local/'
    }

    # Projection root status (.opencode/ for OpenCode, .senpi/ for Senpi)
    if ($ResolvedHosts -contains 'opencode') {
        if (Test-Junction -Path $ProjectionDir) {
            Write-Host '[INFO] Migration required: .opencode/ is a junction'
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
                if (Test-JunctionTargetMatchesSource -JunctionFullName $targetPath -SourcePath $expectedSource) {
                    Write-Host "[OK] Already junctioned: .senpi/$senpiRel"
                } elseif (Test-ManagedSenpiJunction -JunctionName $senpiRel -JunctionFullName $targetPath) {
                    # wrong target（管理物）: 旧正本・消失済み正本を含む修復対象（REQ-058-004）
                    if ($actualTarget -and (Test-Path -LiteralPath (@($actualTarget) | Select-Object -First 1))) {
                        Write-Host "[WOULD REMOVE] Wrong-target junction: .senpi/$senpiRel (actual: $actualTarget)"
                    } else {
                        Write-Host "[WOULD REMOVE] Broken junction: .senpi/$senpiRel"
                    }
                    Write-Host "[WOULD ADD] Re-create junction: .senpi/$senpiRel -> $expectedSource"
                } else {
                    # wrong target（管理物と確認できない）: 予測せず保持を報告する
                    Write-Host "[ERROR] Unmanaged junction at managed path (apply would keep it and report a conflict): .senpi/$senpiRel (actual: $actualTarget)"
                }
            } elseif (Test-Path -LiteralPath $targetPath) {
                Write-Host "[ERROR] Path exists and is not a junction: .senpi/$senpiRel"
            } else {
                Write-Host "[WOULD ADD] Create junction: .senpi/$senpiRel -> $expectedSource"
            }
            continue
        }
        $targetPath = Join-Path $ProjectionDir $relPath
        $expectedSource = Get-TargetSourcePath -RelPath $relPath
        if (Test-Junction -Path $targetPath) {
            $actualTarget = Get-JunctionTarget -Path $targetPath
            if (Test-JunctionTargetMatchesSource -JunctionFullName $targetPath -SourcePath $expectedSource) {
                Write-Host "[OK] Already junctioned: $relPath"
            } elseif (Test-ManagedProjectionJunction -JunctionRel $relPath -JunctionFullName $targetPath) {
                # wrong target（管理物）: 旧正本・消失済み正本を含む修復対象（REQ-058-004、REQ-099-012）
                if ($actualTarget -and (Test-Path -LiteralPath (@($actualTarget) | Select-Object -First 1))) {
                    Write-Host "[WOULD REMOVE] Wrong-target junction: $relPath (actual: $actualTarget)"
                } else {
                    Write-Host "[WOULD REMOVE] Broken junction: $relPath"
                }
                Write-Host "[WOULD ADD] Re-create junction: $relPath -> $expectedSource"
            } else {
                # wrong target（管理物と確認できない）: 予測せず保持を報告する
                Write-Host "[ERROR] Unmanaged junction at managed path (apply would keep it and report a conflict): $relPath (actual: $actualTarget)"
            }
        } elseif (Test-Path -LiteralPath $targetPath) {
            Write-Host "[ERROR] Path exists and is not a junction: $relPath"
        } else {
            Write-Host "[WOULD ADD] Create junction: $relPath -> $expectedSource"
        }
    }

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
    Write-Host '=== Consumer Install: applying junctions ==='
    if ($LocalMode) {
        Write-Host '[INFO] LocalMode: tools/agentdev-gh redirects to src/common/tools/agentdev-gh/local/'
    }

    # Step 1: Ensure projection roots are real directories (.opencode/ for OpenCode, .senpi/ for Senpi)
    if ($ResolvedHosts -contains 'opencode') {
        if (Test-Junction -Path $ProjectionDir) {
            Write-Host '[ACTION] Removing whole-directory junction .opencode/'
            $rmResult = cmd /c "rmdir `"$ProjectionDir`"" 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Error "[ERROR] Failed to remove junction: $rmResult"
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
                Write-Error "[ERROR] Failed to remove junction: $rmResult"
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

    # Step 2: Parent directories
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

    # Step 3: Selective Junction Creation (OpenCode scope and Senpi scope)
    Write-Host ''
    Write-Host '--- Junctions ---'
    # 管理物と確認できない junction の衝突記録（修復はせず保持し、最後に非正常終了する）
    $applyConflicts = [System.Collections.Generic.List[string]]::new()
    foreach ($relPath in $targets) {
        $senpiRel = Resolve-SenpiTargetRel -TargetEntry $relPath
        if ($null -ne $senpiRel) {
            $targetPath = Join-Path $SenpiProjectionDir $senpiRel
            $sourcePath = Join-Path $SenpiHostSourceDir $senpiRel

            if (Test-Junction -Path $targetPath) {
                if (Test-JunctionTargetMatchesSource -JunctionFullName $targetPath -SourcePath $sourcePath) {
                    Write-Host "[OK] Already junctioned: .senpi/$senpiRel"
                    continue
                } elseif (Test-ManagedSenpiJunction -JunctionName $senpiRel -JunctionFullName $targetPath) {
                    $actualTarget = Get-JunctionTarget -Path $targetPath
                    if ($actualTarget -and (Test-Path -LiteralPath (@($actualTarget) | Select-Object -First 1))) {
                        Write-Host "[ACTION] Removing junction (wrong target): .senpi/$senpiRel"
                    } else {
                        Write-Host "[ACTION] Removing broken junction: .senpi/$senpiRel"
                    }
                    cmd /c "rmdir `"$targetPath`"" 2>&1
                    if ($LASTEXITCODE -ne 0) {
                        Write-Error "[ERROR] Failed to remove junction: .senpi/$senpiRel"
                        exit 1
                    }
                } else {
                    # wrong target（管理物と確認できない）: 自動置換せず保持して衝突報告する
                    $actualTarget = Get-JunctionTarget -Path $targetPath
                    Write-Host "[ERROR] Unmanaged junction at managed path (kept, not replaced): .senpi/$senpiRel (actual: $actualTarget)"
                    $applyConflicts.Add(".senpi/$senpiRel")
                    continue
                }
            } elseif (Test-Path -LiteralPath $targetPath) {
                Write-Error "[ERROR] Path exists and is not a junction: .senpi/$senpiRel"
                exit 1
            }

            Write-Host "[ACTION] Creating junction: .senpi/$senpiRel -> $sourcePath"
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
            if (Test-JunctionTargetMatchesSource -JunctionFullName $targetPath -SourcePath $sourcePath) {
                Write-Host "[OK] Already junctioned: $relPath"
                continue
            } elseif (Test-ManagedProjectionJunction -JunctionRel $relPath -JunctionFullName $targetPath) {
                # wrong target（管理物）: 旧正本・消失済み正本を含む修復対象（REQ-099-012）。
                # check で検出された乖離をここで解消する（REQ-050-015）。
                $actualTarget = Get-JunctionTarget -Path $targetPath
                if ($actualTarget -and (Test-Path -LiteralPath (@($actualTarget) | Select-Object -First 1))) {
                    Write-Host "[ACTION] Removing junction (wrong target): $relPath"
                } else {
                    Write-Host "[ACTION] Removing broken junction: $relPath"
                }
                cmd /c "rmdir `"$targetPath`"" 2>&1
                if ($LASTEXITCODE -ne 0) {
                    Write-Error "[ERROR] Failed to remove junction: $relPath"
                    exit 1
                }
            } else {
                # wrong target（管理物と確認できない）: 自動置換せず保持して衝突報告する
                $actualTarget = Get-JunctionTarget -Path $targetPath
                Write-Host "[ERROR] Unmanaged junction at managed path (kept, not replaced): $relPath (actual: $actualTarget)"
                $applyConflicts.Add($relPath)
                continue
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

        Write-Host "[ACTION] Creating junction: $relPath -> $sourcePath"
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

    # Step 3c: Stale managed junction cleanup (REQ-058-002、REQ-050-015)。
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

    # 管理物と確認できない junction の衝突は自動置換せず保持済み。既存の非正常終了を
    # 維持する（「ジャンクション状態の判定と自己修復」Design 表、REQ-058-008）。
    if ($applyConflicts.Count -gt 0) {
        Write-Host ''
        Write-Host "[ERROR] $($applyConflicts.Count) junction(s) at managed paths are not managed by AgentDevFlow and were kept (conflict): $($applyConflicts -join ', ')"
        exit 1
    }

    # Step 4: Repo-local directories (informational)
    Write-Host ''
    Write-Host '--- Repo-local artifacts (not junction-managed) ---'
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
    Write-Host 'Consumer install complete.'
    Write-Host ''
    Write-Host 'Recommended .gitignore entries:'
    Write-Host "  $PluginDir/"
    Write-Host '  .sisyphus/'
    Write-Host '  .opencode/commands/agentdev/'
    Write-Host '  .opencode/skills/agentdev-*/'
    Write-Host '  .opencode/tools/agentdev-*/'
    Write-Host '  .opencode/plugins/agentdev-*/'
    Write-Host '  .opencode/plugins/agentdev-*.ts'
    if ($ResolvedHosts -contains 'senpi') {
        Write-Host '  .senpi/'
    }

    # 実行環境診断（REQ-099-011）。配置結果の報告と区別して報告する。
    Show-RuntimeDiagnostics
    exit 0
}
