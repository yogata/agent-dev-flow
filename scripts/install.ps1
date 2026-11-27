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

    Placement targets are one non-empty selection set of the 4 agents
    (OpenCode, Senpi, Codex, Antigravity) (REQ-099-010, DEC-049 decision (3),
    REQ-099-036〜043). -Hosts covers OpenCode/Senpi ('none' opts out of both),
    -AgentHosts covers Codex/Antigravity; both resolve into one selection set
    and an empty selection is rejected before any placement. New installs are
    recommended to place OpenCode + Senpi; existing installs keep the current
    selection when a parameter is omitted, and change it only on explicit
    selection. A new install with one side specified places that side and
    guides specifying the other. The resolved selection is recorded in
    .agentdev/install-state.json (selectedAgents); check / dry-run never
    modify the record. Unreadable or invalid records stop with guidance
    instead of inference (REQ-099-043). Legacy installs without a record are
    inferred from ownership-confirmed placements, with the legacy agentHosts
    field as an auxiliary signal (REQ-099-040).
    - OpenCode projection (into .opencode/):
      - .opencode/commands/agentdev/  = junction -> .agentdev-plugin/src/common/commands/agentdev/
      - .opencode/skills/agentdev-*/  = individual junctions -> .agentdev-plugin/src/common/skills/agentdev-*/
      - .opencode/tools/agentdev-*/   = individual junctions -> .agentdev-plugin/src/common/tools/agentdev-*/
        (Custom Tool distribution type)
      - .opencode/plugins/agentdev-*/ = individual junctions -> .agentdev-plugin/src/opencode/plugins/agentdev-*/
        (Plugin / Hook distribution type)
    - Senpi entry projection (into .senpi/skills/): each agentdev-* skill
      directory of .agentdev-plugin/src/common/skills/ is projected as an
      individual junction (the enumeration depends on the placement contract
      (directory structure) only, never on individual implementation files).
    - Senpi connection projection (into .agents/agentdev/senpi/): the whole
      host connection area .agentdev-plugin/src/senpi/ is projected as one
      junction, placed together with .agents/agentdev/common because the
      senpi modules import the shared library via relative paths that resolve
      through the sibling common/ area.
    - Codex / Antigravity entry projection (into .agents/skills/): each
      agentdev-* skill directory of .agentdev-plugin/src/common/skills/ is
      projected as an individual junction (shared entry root for both hosts,
      kept while either host is selected). Selection is explicit-only
      (-AgentHosts or the wizard); explicit none marks the placed projection
      stale.
    - Codex / Antigravity connection projection (into .agents/agentdev/):
      the runtime assets these hosts resolve at run time (command bodies,
      the shared skill-discovery library, the agentdev_gh engine + gh runner,
      the host adapters) are projected from the canonical layout with the
      same relative structure: .agents/agentdev/common -> src/common/,
      .agents/agentdev/codex -> src/codex/,
      .agents/agentdev/antigravity -> src/antigravity/ (only for the selected
      hosts; the adapters resolve canonical commands from the installed
      .agents/agentdev/common/commands/agentdev/ first and never from the
      checkout location).
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
    省略可能。引数なし起動時（-Mode 未指定）は対話ウィザードが起動し、Mode と環境と4エージェントの配置を問う。

.PARAMETER Hosts
    One of: none, opencode, senpi, both
    OpenCode / Senpi の配置選択（REQ-099-010、REQ-009-040、REQ-099-036〜038）。
    none は OpenCode と Senpi の両方を配置しない選択であり、-AgentHosts と合わせた
    結合選択集合が空のときは配置前に拒否される（REQ-099-037）。

    判断基準:
    - 新規導入では両方（both）を推奨する。新規導入で一方のみ指定した場合は指定側を
      配置し、省略側は指定を案内する（REQ-099-038）
    - 既存導入の更新では、本パラメータ省略時に記録・現行配置から側を引き継ぐ
    - 明示指定（パラメータまたはウィザード選択）した場合のみ配置対象を変更する。
      選択されていないホストの ADF 管理投影物は apply で除去対象（stale）として
      報告され、check / dry-run では予測報告される。管理物と確定できない投影物は
      削除対象にしない（非破壊境界、REQ-058-008）
    - 実行環境の CLI 導入有無（OpenCode / omo 相当）による配置対象の自動振分けは
      行わない（REQ-099-011）

.PARAMETER AgentHosts
    One of: none, codex, antigravity, both
    Codex / Antigravity の配置選択（REQ-009-040、REQ-099-036〜041）。投影先は
    .agents/skills/（両ホスト共有の入口投影。いずれかが選択されている間は共有配置を
    維持する）と .agents/agentdev/（接続投影。エージェント別に配置する）。

    判断基準:
    - 既存導入の更新では、本パラメータ省略時に install-state 記録の現在の選択を
      維持する。記録がない既存導入は所有権確認可能な配置から選択を推定し、旧
      agentHosts を補助信号として使う。.agents/skills の管理投影だけが残り選択を
      確定できない場合は曖昧として停止し明示選択を案内する（REQ-099-040）
    - 記録が読めない・不正な場合は推定せず停止して明示選択を案内する（REQ-099-043）
    - 明示指定（パラメータまたはウィザード選択）した場合のみ配置対象を変更する。
      none を明示指定した場合、.agents 配下の ADF 管理投影物は apply で除去対象
      （stale）として報告され、check / dry-run では予測報告される。管理物と確定でき
      ない投影物は削除対象にしない（非破壊境界、REQ-058-008）

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
    ./scripts/install.ps1 -Mode apply -AgentHosts codex
    ./scripts/install.ps1 -Mode apply -Hosts senpi -AgentHosts antigravity
    ./scripts/install.ps1 -Mode apply -Hosts none -AgentHosts codex
#>

#Requires -Version 7.0

param(
    [Parameter()]
    [ValidateSet('dry-run', 'check', 'apply')]
    [string]$Mode,

    [Parameter()]
    [ValidateSet('none', 'opencode', 'senpi', 'both')]
    [string]$Hosts,

    [Parameter()]
    [ValidateSet('none', 'codex', 'antigravity', 'both')]
    [string]$AgentHosts,

    [switch]$LocalMode,

    [string]$PluginDir = '.agentdev-plugin'
)

$ErrorActionPreference = 'Stop'

# 共有定義（URL・ブランチ定数、cwd 安全化、チェックアウト案内）
. (Join-Path $PSScriptRoot 'consumer\common.ps1')

# 共有判定の単一定義モジュール（両公開入口共有。ジャンクション正本判定、所有権判定、
# stale / 管理外投影の判定、正本解決、配置対象ホストの検出・確定、Codex/Antigravity
# 配置選択の確定と .agents 共有投影の管理判定、plugin loader shim 内容、実行環境診断、
# third-party Skill 宣言の解決と drift 検知）
. (Join-Path $PSScriptRoot 'consumer\install-sync-common.ps1')

# 配布除外の正本（repo-local Plugin の consumer 配布除外。3 consumer 配布経路の
# 単一導出）。本入口は当該正本を参照して除外集合を決定する。
. (Join-Path $PSScriptRoot 'consumer\distribution-exclusion.ps1')

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
# Codex / Antigravity ホスト接続領域（.agents/agentdev/ 接続投影の正本。REQ-099-039〜041）
$CodexHostSourceDir = Join-Path $PluginPath 'src\codex'
$AntigravityHostSourceDir = Join-Path $PluginPath 'src\antigravity'
$LocalSourceDir = Join-Path $PluginPath 'src\common\tools\agentdev-gh\local'
# Legacy single-canonical source (pre multi-host layout). Kept only so that
# junctions placed by older ADF versions stay recognizable as ADF-managed
# artifacts during updates of existing consumers (REQ-099-012).
$LegacyUnifiedSourceDir = Join-Path $PluginPath 'src\opencode'

$ProjectionDir = Join-Path $RepoRoot '.opencode'
$SenpiProjectionDir = Join-Path $RepoRoot '.senpi'
# Codex / Antigravity 共有入口投影の root（.agents/skills/。REQ-009-040）。
$AgentProjectionDir = Join-Path $RepoRoot '.agents'
$CommandsDir = Join-Path $ProjectionDir 'commands'
$SkillsDir = Join-Path $ProjectionDir 'skills'
$ToolsDir = Join-Path $ProjectionDir 'tools'
$PluginsDir = Join-Path $ProjectionDir 'plugins'

# Parent directories that must exist as real directories (junction parents).
# The Senpi projection root itself is the managed parent of its subdirectories.
$ProjectionParentDirs = @($CommandsDir, $SkillsDir, $ToolsDir, $PluginsDir)
$ProjectionParentRels = @('commands', 'skills', 'tools', 'plugins')

# Repo-local patterns（$RepoLocalCommandNames / $RepoLocalSkillPrefix）と配布除外正本
# （$RepoLocalPluginNames）は共有定義モジュールと配布除外正本モジュールから供給される
# （consumer\install-sync-common.ps1 / consumer\distribution-exclusion.ps1）。
# 配布除外の正本は1箇所に定義され、3 consumer 配布経路（本入口、archive installer、
# package-release-archive.ps1）が当該正本の参照・導出によって除外集合を決定する
# （runtime-package-boundary Design「repo-local Plugin の配布・投影契約」）。
# self-sync.ps1 は正本を参照しつつ適用しない例外入口である（自己ホスト投影の維持）。

# In LocalMode the agentdev-gh Custom Tool implementation is redirected from
# src/common/tools/agentdev-gh/local/ (REQ-009-020).
$LocalModeRedirectToolRel = 'tools\agentdev-gh'

# textlint guard plugin の導入時生成依存（vendor 成果物）。版固定情報（package.json +
# bun.lock）のみが配布され、vendor 実体は導入時に利用者が生成する（REQ-029-012）。
# 欠落（部分生成状態を含む）検知時に fail-closed で停止し導入手順を案内する。
# 導入系スクリプトは依存の生成もネットワーク取得も行わない（DEC-016）。
$TextlintGuardBundleRel = 'plugins\agentdev-textlint-guard\vendor\textlint-engine.bundle.json'
$TextlintGuardDictRel = 'plugins\agentdev-textlint-guard\vendor\kuromoji-dict'

# 配布版マーカーと版状態記録（REQ-126-003）。src/common/VERSION（1行・semantic version）
# が配布版の正本であり、apply 完了時に .agentdev/install-state.json へ記録する。
# check は記録版と配布版の一致・旧構造痕跡の不在を検証する。
$DistributionVersionFile = Join-Path $CommonSourceDir 'VERSION'
$InstallStatePath = Join-Path $RepoRoot '.agentdev\install-state.json'
# 旧構造痕跡検知の正本定数。廃止済み配置ディレクトリの存在検知に使う。
$LegacyStructureRels = @(
    '.agentdev\blocked',
    '.agentdev\phase',
    '.agentdev\intake',
    '.agentdev\learning',
    '.agentdev\inspect',
    '.agentdev\backlog-auto'
)
$DistributionVersion = $null
if (Test-Path -LiteralPath $DistributionVersionFile) {
    $DistributionVersion = [System.IO.File]::ReadAllText($DistributionVersionFile).Trim()
    if ([string]::IsNullOrEmpty($DistributionVersion)) { $DistributionVersion = $null }
}

# --- Helper Functions ---

function Read-InstallStateRecord {
    <#
    .SYNOPSIS
    .agentdev/install-state.json を3状態で読む（missing / invalid / ok）。
    .DESCRIPTION
    不在は Status='missing'、解析不能・schema 不一致（distributionVersion が文字列でない）
    は Status='invalid'、それ以外は Status='ok' で State に解析結果を返す。選択集合解決
    （Resolve-AgentSelectionSet）の fail-closed 判定（REQ-099-043）では不在と不正の区別が
    必要なため、選択解決の呼び出し側は本関数を使う。
    #>
    if (-not (Test-Path -LiteralPath $InstallStatePath)) {
        return [PSCustomObject]@{ Status = 'missing'; State = $null }
    }
    try {
        $raw = [System.IO.File]::ReadAllText($InstallStatePath)
        $state = $raw | ConvertFrom-Json
        if ($null -eq $state -or -not ($state.distributionVersion -is [string])) {
            return [PSCustomObject]@{ Status = 'invalid'; State = $null }
        }
        return [PSCustomObject]@{ Status = 'ok'; State = $state }
    } catch {
        return [PSCustomObject]@{ Status = 'invalid'; State = $null }
    }
}

function Read-InstallState {
    <#
    .SYNOPSIS
    .agentdev/install-state.json を読み、解析結果を返す。
    .DESCRIPTION
    不在・解析不能・schema 不一致のいずれかは $null を返す。不在と不正の区別が必要な
    呼び出し側（選択集合解決）は Read-InstallStateRecord を使う。
    #>
    return (Read-InstallStateRecord).State
}

function Get-LegacyStructureRels {
    <#
    .SYNOPSIS
    旧構造痕跡（$LegacyStructureRels のうち実在するもの）の相対パス一覧を返す。
    #>
    $found = @()
    foreach ($rel in $LegacyStructureRels) {
        if (Test-Path -LiteralPath (Join-Path $RepoRoot $rel)) { $found += $rel }
    }
    return $found
}

function Write-InstallStateRecord {
    <#
    .SYNOPSIS
    apply 完了時に .agentdev/install-state.json へ配布版と選択集合を記録する。
    .DESCRIPTION
    selectedAgents（4エージェントの配置選択集合。正本の選択記録）は解決済みの選択集合で
    常に記録する（REQ-099-036〜043）。旧 agentHosts フィールドは書かない（旧記録は
    読み取り専用の補助信号）。check / dry-run は本関数を呼ばないため記録を変更しない。
    #>
    $parentDir = Split-Path -Parent $InstallStatePath
    if (-not (Test-Path -LiteralPath $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }
    $record = [ordered]@{
        distributionVersion = $DistributionVersion
        recordedAt = (Get-Date).ToUniversalTime().ToString('o')
        selectedAgents = @($SelectedAgents)
    }
    [System.IO.File]::WriteAllText($InstallStatePath, ($record | ConvertTo-Json) + "`n")
}

function Show-MigrateGuidance {
    Write-Host '移行手順: /agentdev/migrate を実行し、版別差分仕様に沿った構成移行と決定論的検証を行ってください。'
}

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

    # 4エージェントの個別選択（REQ-099-036〜039）。各エージェントについて現在の配置
    # 状態（検出・記録）を案内し、既存導入では既定（空入力）で現在の状態を維持する。
    # 新規導入の既定は OpenCode + Senpi（推奨構成）。空選択（4エージェントすべてなし）
    # は受け付けず、再問い合わせする。Codex/Antigravity の区分が不明な既存導入
    # （.agents/skills 管理投影のみで記録がない）は曖昧として明示選択を必須にする
    # （REQ-099-040）。実行環境の CLI 導入有無を選択に使わない（REQ-099-011）。
    $wizardStateRecord = Read-InstallStateRecord
    $wizardRecord = Get-AgentSelectionRecord -InstallState $wizardStateRecord.State
    $wizardRecordAgents = @()
    $wizardRecordKnown = $false
    if ($wizardRecord -and $wizardRecord.Status -eq 'ok') {
        $wizardRecordAgents = @($wizardRecord.Agents); $wizardRecordKnown = $true
    } elseif ($wizardRecord -and $wizardRecord.Status -eq 'legacy') {
        $wizardRecordAgents = @($wizardRecord.Agents); $wizardRecordKnown = $true
    }
    $detectedHosts = Get-DetectedHosts -LocalRedirectToolRel $LocalModeRedirectToolRel -LocalRedirectSourceDir $LocalSourceDir
    $wizardDetectedAgents = @(Get-DetectedAgentDevSelection -AgentDevRoot (Join-Path $AgentProjectionDir 'agentdev'))
    $wizardHasEntryProjection = Test-HasAgentManagedProjection
    $wizardNewInstall = ($detectedHosts -eq 'none') -and (-not $wizardHasEntryProjection) -and ($wizardStateRecord.Status -eq 'missing')
    $wizardCurrent = @{
        'opencode'    = [bool]($detectedHosts -eq 'opencode' -or $detectedHosts -eq 'both')
        'senpi'       = [bool]($detectedHosts -eq 'senpi' -or $detectedHosts -eq 'both')
        'codex'       = [bool](($wizardRecordKnown -and ($wizardRecordAgents -contains 'codex')) -or ($wizardDetectedAgents -contains 'codex'))
        'antigravity' = [bool](($wizardRecordKnown -and ($wizardRecordAgents -contains 'antigravity')) -or ($wizardDetectedAgents -contains 'antigravity'))
    }
    $wizardAmbiguous = @{
        'codex'       = [bool]($wizardHasEntryProjection -and -not $wizardRecordKnown -and -not $wizardCurrent['codex'])
        'antigravity' = [bool]($wizardHasEntryProjection -and -not $wizardRecordKnown -and -not $wizardCurrent['antigravity'])
    }
    $wizardDefaults = @{
        'opencode'    = if ($wizardNewInstall) { $true } else { $wizardCurrent['opencode'] }
        'senpi'       = if ($wizardNewInstall) { $true } else { $wizardCurrent['senpi'] }
        'codex'       = $wizardCurrent['codex']
        'antigravity' = $wizardCurrent['antigravity']
    }
    $wizardLabels = @{ 'opencode' = 'OpenCode'; 'senpi' = 'Senpi'; 'codex' = 'Codex'; 'antigravity' = 'Antigravity' }
    do {
        $wizardAnswers = @{}
        $questionNumber = 3
        foreach ($wizardAgent in @('opencode', 'senpi', 'codex', 'antigravity')) {
            Write-Host ''
            $currentStateLabel = if ($wizardCurrent[$wizardAgent]) { '配置済み' } else { 'なし' }
            if ($wizardAmbiguous[$wizardAgent]) { $currentStateLabel = '配置済み（選択記録なし・Codex/Antigravity の区分が不明のため要明示選択）' }
            Write-Host "Q$questionNumber. $($wizardLabels[$wizardAgent]) を配置対象にしますか？:"
            Write-Host "  現在の状態: $currentStateLabel"
            if ($wizardAmbiguous[$wizardAgent]) {
                Write-Host '  選択記録がないため空入力では確定できません。y または n を入力してください。'
            } else {
                Write-Host '  何も入力せず Enter で現在の状態を維持します（新規導入の既定: OpenCode + Senpi を配置、Codex/Antigravity は配置しない）。'
            }
            $answer = Read-Host 'y/n'
            if ($wizardAmbiguous[$wizardAgent] -and $answer -eq '') {
                Write-Host '  明示選択が必要です（y/n）。'
                continue
            }
            if ($answer -eq 'y') { $wizardAnswers[$wizardAgent] = $true }
            elseif ($answer -eq 'n') { $wizardAnswers[$wizardAgent] = $false }
            elseif ($answer -eq '') { $wizardAnswers[$wizardAgent] = [bool]$wizardDefaults[$wizardAgent] }
            else {
                Write-Host "無効な入力です: $answer"
                exit 1
            }
            $questionNumber++
        }
        if (-not (@($wizardAnswers.Values) -contains $true)) {
            Write-Host ''
            Write-Host '配置対象の選択が空です（OpenCode、Senpi、Codex、Antigravity すべてなし）。少なくとも1つのエージェントを選択してください。'
        }
    } until ((@($wizardAnswers.Values) -contains $true) -and (@($wizardAnswers.Keys).Count -eq 4))

    $wizardOpenAgents = @()
    if ($wizardAnswers['opencode']) { $wizardOpenAgents += 'opencode' }
    if ($wizardAnswers['senpi']) { $wizardOpenAgents += 'senpi' }
    $wizardAgentSide = @()
    if ($wizardAnswers['codex']) { $wizardAgentSide += 'codex' }
    if ($wizardAnswers['antigravity']) { $wizardAgentSide += 'antigravity' }
    $script:Hosts = switch ($wizardOpenAgents.Count) {
        0 { 'none' }
        2 { 'both' }
        default { $wizardOpenAgents[0] }
    }
    $script:AgentHosts = switch ($wizardAgentSide.Count) {
        0 { 'none' }
        2 { 'both' }
        default { $wizardAgentSide[0] }
    }
    Write-Host ''
}

function Get-ConsumerJunctionTargets {
    <#
    .SYNOPSIS
        Enumerate all junction targets for the selected placement hosts from the
        canonical sources (src/common/, src/opencode/).
        Returns sorted array of relative paths. OpenCode targets are relative to
        .opencode/; Senpi targets are relative to .senpi/ and prefixed 'senpi:'
        to keep both host scopes in one managed enumeration.

    .PARAMETER SelectedHosts
        配置対象とする OpenCode/Senpi の選択。省略時は現在解決済みの選択を使う。
    #>
    param([string[]]$SelectedHosts = $ResolvedHosts)
    $targets = [System.Collections.Generic.List[string]]::new()

    if ($SelectedHosts -contains 'opencode') {
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

    if ($SelectedHosts -contains 'senpi') {
        # Senpi entry projection (placement-contract level enumeration):
        # agentdev-* skills of the canonical tree are projected under
        # .senpi/skills/ (same enumeration contract as the Codex / Antigravity
        # entry projection). The enumeration depends on the directory structure
        # contract only; it never inspects individual implementation files
        # (REQ-099-011).
        $senpiSkillsSource = Join-Path $CommonSourceDir 'skills'
        if (Test-Path -LiteralPath $senpiSkillsSource) {
            Get-ChildItem -LiteralPath $senpiSkillsSource -Directory -Filter 'agentdev-*' |
                ForEach-Object { $targets.Add("senpi:skills\$($_.Name)") }
        }
    }

    return ($targets | Sort-Object)
}

function Get-AgentEntryJunctionTargets {
    <#
    .SYNOPSIS
        Codex / Antigravity / Senpi の .agents 配下の管理列挙（.agents/skills/ 共有
        入口投影と .agents/agentdev/ 接続投影）を正本から組み立てる
        （REQ-009-040、REQ-099-039〜042）。

    .DESCRIPTION
        agents:skills\<name> と agents:agentdev\<name> エントリの配列を返す。配置が
        非アクティブ（Codex / Antigravity / Senpi のいずれも選択なし）の場合は空配列を
        返す。入口投影（agents:skills\<name>）は Codex / Antigravity が選択されている
        場合のみ列挙する（OpenCode skills 列挙と同一の agentdev-* 集合）。接続投影は
        agentdev\common（共通正本の接続領域全体。Codex / Antigravity に加え、相対パス
        で common の共有ライブラリを参照する Senpi 接続モジュールの依存先として
        Senpi 選択時にも配置する）、agentdev\senpi（Senpi 接続領域全体。Senpi 選択時）、
        agentdev\codex / agentdev\antigravity（各ホスト接続領域全体。各ホスト選択時）
        である。入口投影は Codex / Antigravity が選択されている間は共有配置として維持
        され、コマンド本文は実行時に配置済み接続投影
        （.agents/agentdev/common/commands/agentdev/）から、ない場合は正本から解決される
        （展開元を固定しない）。

    .PARAMETER SelectedHosts
        配置対象とする OpenCode/Senpi の選択。省略時は現在解決済みの選択を使う。

    .PARAMETER SelectedAgentHosts
        配置対象とする Codex/Antigravity の選択。省略時は現在解決済みの選択を使う。
    #>
    param(
        [string[]]$SelectedHosts = $ResolvedHosts,
        [string[]]$SelectedAgentHosts = $ResolvedAgentHosts
    )
    $agentPlacementActive = $SelectedAgentHosts.Count -gt 0
    if (-not $agentPlacementActive -and ($SelectedHosts -notcontains 'senpi')) { return @() }
    $targets = [System.Collections.Generic.List[string]]::new()
    if ($agentPlacementActive) {
        $skillsSource = Join-Path $CommonSourceDir 'skills'
        if (Test-Path -LiteralPath $skillsSource) {
            Get-ChildItem -LiteralPath $skillsSource -Directory -Filter 'agentdev-*' |
                ForEach-Object { $targets.Add("agents:skills\$($_.Name)") }
        }
    }
    $targets.Add('agents:agentdev\common')
    if ($SelectedHosts -contains 'senpi') { $targets.Add('agents:agentdev\senpi') }
    if ($SelectedAgentHosts -contains 'codex') { $targets.Add('agents:agentdev\codex') }
    if ($SelectedAgentHosts -contains 'antigravity') { $targets.Add('agents:agentdev\antigravity') }
    return ($targets | Sort-Object)
}

function Write-UnmanagedJunctionReport {
    <#
    .SYNOPSIS
        管理物判定不能な junction（REQ-058-008 の非破壊境界。削除も置換もしない）を報告する。

    .DESCRIPTION
        切替で外れた配置対象の管理パス（$RemovalCandidateManagedRels）上にあるものは
        衝突として扱う。外れたエージェントの管理パスを AgentDevFlow が所有を確認でき
        ない資産が占有している状態であり、保持したうえで apply を正常終了させず、選択の
        記録を更新しない。管理パス外のものは情報として報告するのみである。
        衝突とした管理列挙の相対パスを返す。
    #>
    param(
        [string[]]$UnmanagedRels = @(),
        [ValidateSet('check', 'dry-run', 'apply')][string]$ReportMode
    )
    $conflicts = [System.Collections.Generic.List[string]]::new()
    foreach ($unmanagedRel in $UnmanagedRels) {
        if ($unmanagedRel -in $RemovalCandidateManagedRels) {
            $conflicts.Add($unmanagedRel)
            if ($ReportMode -eq 'check') {
                Write-Host "[DIVERGENCE] Unmanaged junction at managed path of a deselected placement target (apply keeps it and reports a conflict): $unmanagedRel"
            } elseif ($ReportMode -eq 'dry-run') {
                Write-Host "[ERROR] Unmanaged junction at managed path (apply would keep it and report a conflict): $unmanagedRel"
            } else {
                Write-Host "[ERROR] Unmanaged junction at managed path (kept, not removed): $unmanagedRel"
            }
        } elseif ($ReportMode -eq 'dry-run') {
            Write-Host "[INFO] Junction not managed by AgentDevFlow (would be left untouched): $unmanagedRel"
        } else {
            Write-Host "[INFO] Junction not managed by AgentDevFlow (left untouched): $unmanagedRel"
        }
    }
    return $conflicts
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

# --- Mechanical-step script prerequisite check (REQ-009-053) ---

# 配布物の主要な機械工程 script（定義PR準備、定義PR受入検査、クローズ機械工程、
# 横断依存検査）の実行時前提の不一致を導入時に検出する検証。
# 本入口は各 script の検証専用経路（副作用なし入口）を呼び出すプローブであり、
# install.ps1 は入口の呼出しと前提不一致の divergence 報告のみを担う（入口の実体は
# 配布 script 実装が所有する）。検証方法（install-script-usability Design
# 「機械工程 script の実行時前提の導入時検証」節、REQ-009-053）:
#   - 依存ツールの存在確認: 機械工程 script の実行環境（bun）
#   - 検査入力: 配布先の実際の consumer 条件（REQ 行 ID、必須ゲート実行体の参照、
#     入力書式、パス条件）を表現する fixture で構成する。空 JSON の受理拒否、bun の
#     起動、script ファイルの存在、対象集合が空の入力の受理だけを実行時前提の検証
#     成立の証拠としない
#   - 定義PR準備・定義PR受入検査・クローズ機械工程: 各 script の --validate-input
#     検証専用経路（入力 JSON の契約検証・既知 gate 引数契約検査・ゲート実行体の
#     存在確認のみ。worktree 作成・ゲート実行・git/gh 操作・管理対象ファイル変更なし）
#     で正例を検証する。応答は終了コード 0 かつ報告 JSON の ok===true を要求する
#   - 横断依存検査: 通常実行（読取と純粋比較のみで gate_effect:none）で実 consumer
#     条件 fixture（非空の unclosed_cases と解決可能な shared_areas を含む構成）を
#     検証し、応答解析（ok、population_count===1、condition_a.count===0、
#     condition_b[].file_results[].read_ok 全 true、detection_unavailable 空）で判定する。
#     script が終了コード 0・ok:true を返しても応答解析が不成立なら divergence とする
#     （検証不能・読取不能を成功扱いしない）
# 検証自体の実行失敗（script の不在、入口契約の不整合）は検証不能として divergence
# 報告し、成功扱いとしない（check の終了コードに反映する）。検証は管理対象ファイルを
# 変更しない（REQ-050-005）。プローブの検査入力 JSON は対象 script 契約の置き場所指針
# （workspace 外一時領域不使用・project root 内限定・commit 対象外・検査後削除）に従い、
# consumer の .agentdev/integrity/reports/ 配下の一時領域に作成し、検証後に削除する。
$MechanicalStepProbeContract = @(
    @{ Skill = 'agentdev-workflow-case-open';  ScriptRel = 'scripts\src\prepare_definition_pr.ts';      Entry = 'validate-input'; Kind = 'prepare_definition_pr' }
    @{ Skill = 'agentdev-workflow-case-ready'; ScriptRel = 'scripts\src\accept_definition_checks.ts';   Entry = 'validate-input'; Kind = 'accept_definition_checks' }
    @{ Skill = 'agentdev-workflow-case-close'; ScriptRel = 'scripts\src\close_mechanical_steps.ts';     Entry = 'validate-input'; Kind = 'close_mechanical_steps' }
    @{ Skill = 'agentdev-workflow-case-open';  ScriptRel = 'scripts\src\inspect_cross_dependencies.ts'; Entry = 'cross-dependency'; Kind = 'cross-dependency' }
)

$MechanicalStepProbeTimeoutMs = 60000

function Assert-MechanicalProbeContainedPath {
    param([string]$Path, [string]$Root)
    $full = [System.IO.Path]::GetFullPath($Path)
    $rootFull = [System.IO.Path]::GetFullPath($Root).TrimEnd('\', '/')
    $rootPrefix = $rootFull + [System.IO.Path]::DirectorySeparatorChar
    if (-not $full.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Mechanical-step probe path is outside the workspace: $Path"
    }
    # 封じ込め検査は probe path から workspace root の直下まで。root 自体とその上位は
    # consumer 環境の正当な配置（OneDrive、symlinked home 等）であり、probe の書込み
    # 閉包の外として検査しない（恒常的な誤 divergence の防止）。
    $current = $full
    while ($current -and $current.Length -gt $rootFull.Length) {
        $item = if (Test-Path -LiteralPath $current -ErrorAction Stop) { Get-Item -LiteralPath $current -Force -ErrorAction Stop } else { $null }
        if ($null -ne $item -and ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint)) {
            throw "Mechanical-step probe ancestor is a junction/reparse point: $current"
        }
        $parent = Split-Path -Path $current -Parent
        if (-not $parent -or $parent -eq $current -or $parent.Length -le $rootFull.Length) { break }
        $current = $parent
    }
}

# 検査入力 fixture の組み立て（配布先の実際の consumer 条件を表現する）。
# ゲート実行体の参照は配置済み skill の実在 script（agentdev-traceability の checker）
# を指し、REQ 行 ID は入力書式契約（REQ- 接頭辞・ハイフン区切り・数値セグメント2つ・
# 各セグメント最小1桁。桁数上限なし。受理上限撤廃 Decision）に従う有効書式サンプルを
# 使う（Case 非依存の値で機械 probe として自己完結する）。
# 横断依存検査の shared_areas は consumer チェックアウト内の実在ファイルを指す。
function New-MechanicalStepProbeInput {
    param(
        [string]$Kind,
        [string]$RepoRoot,
        [string]$SkillsDir,
        [string]$ProbeDir
    )
    $traceChecker = Join-Path $SkillsDir 'agentdev-traceability\scripts\src\check.ts'
    $crossDepScript = Join-Path $SkillsDir 'agentdev-workflow-case-open\scripts\src\inspect_cross_dependencies.ts'
    $probeReqId = 'REQ-001-001'
    $sharedAreaRel = ($PluginDir -replace '\\', '/') + '/src/common/skills/agentdev-workflow-case-open/scripts/README.md'
    switch ($Kind) {
        'prepare_definition_pr' {
            return @{
                repoRoot = $RepoRoot
                worktreeRoot = '.worktrees/probe-definition'
                branch = 'definition/issue-0'
                baseRef = 'origin/main'
                rootCaseId = '#0'
                definitionEdits = @(@{ path = 'docs/designs/local/probe.md'; oldText = 'old'; newText = 'new' })
                requiresIndexRegeneration = $false
                stagePaths = @('docs/designs/local/probe.md')
                commitMessage = 'probe'
                traceabilityReqIds = @($probeReqId)
                generateIndexesGate = @{ name = 'generate_indexes'; command = 'bun'; args = @($traceChecker); cwd = $RepoRoot }
                checkIntegrityGate = @{ name = 'check_integrity'; command = 'bun'; args = @('run', (Join-Path $RepoRoot 'src/common/skills/repo-agentdev-integrity/scripts/cli.ts'), '--root', $RepoRoot); cwd = $RepoRoot }
                traceabilityGate = @{ name = 'traceability-check'; command = 'bun'; args = @($traceChecker, '--root', $RepoRoot, '--req', $probeReqId); cwd = $RepoRoot }
            }
        }
        'accept_definition_checks' {
            return @{
                phase = 'acceptance-checks'
                repoRoot = $RepoRoot
                branch = 'definition/issue-0'
                prNumber = 1
                integrityGates = @(@{ name = 'integrity-check'; command = 'bun'; args = @($traceChecker, '--workflow', 'design-save', '--root', $RepoRoot); cwd = $RepoRoot })
                traceabilityGate = @{ name = 'traceability-check'; command = 'bun'; args = @($traceChecker, '--root', $RepoRoot, '--req', $probeReqId); cwd = $RepoRoot }
                overlapGate = @{ name = 'overlap-cross-check'; command = 'bun'; args = @($crossDepScript, '--input', (Join-Path $ProbeDir 'cross-dependency.json'), '--root', $RepoRoot); cwd = $RepoRoot }
                generateIndexesGate = @{ name = 'generate_indexes'; command = 'bun'; args = @($traceChecker); cwd = $RepoRoot }
            }
        }
        'close_mechanical_steps' {
            return @{
                phase = 'pre-merge'
                worktreeRoot = '.worktrees/probe-fix'
                repoRoot = $RepoRoot
                branch = 'fix/issue-0'
                prNumber = 1
                issueBodyPath = (Join-Path $ProbeDir 'issue-body.md')
                generateIndexesGate = @{ name = 'generate_indexes'; command = 'bun'; args = @($traceChecker); cwd = $RepoRoot }
                traceabilityGate = @{ name = 'traceability-check'; command = 'bun'; args = @($traceChecker, '--root', $RepoRoot, '--req', $probeReqId); cwd = $RepoRoot }
                integrityGates = @(@{ name = 'full-integrity-suite'; command = 'bun'; args = @($traceChecker); cwd = $RepoRoot })
                textlintGate = @{ name = 'textlint-final-check'; command = 'bun'; args = @($traceChecker); cwd = $RepoRoot }
                contractStateCheck = @{ contractStatePaths = @('.agentdev/backlog/learning/inbox/'); approvalEntries = @() }
                issueUpdatedAt = '2025-01-01T00:00:00Z'
                issueNumber = 1
                verificationScope = @{ scopeKind = 'full-repository'; selectionBasis = 'probe fixture (full-repository representative input)' }
            }
        }
        'cross-dependency' {
            return @{
                mode = 'case-open'
                current_case = @{ case_ref = 'install-check-probe'; epic_ref = $null; artifact_paths = @('README.md'); target_rows = @($probeReqId); is_epic_intake = $false }
                unclosed_cases = @(@{ case_ref = 'install-check-probe'; epic_ref = $null; artifact_paths = @('README.md'); target_rows = @($probeReqId) })
                shared_areas = @(@{ area_id = 'probe-shared-area'; display_name = 'install check probe shared area'; kind = 'req-row-mentions'; file_paths = @($sharedAreaRel) })
            }
        }
    }
    throw "unknown mechanical-step probe input kind: $Kind"
}

function Invoke-MechanicalScriptProbe {
    <#
    .SYNOPSIS
        機械工程 script の検証専用経路（--validate-input）または横断依存検査の通常実行
        （読取・純粋比較のみ）を呼び出し、終了コードと stdout/stderr を分離取得する。
        プローブは検証のみであり、script 側の実行ステップ（worktree 作成・ファイル変更・
        ゲート実行）には到達しない（REQ-050-005 非破壊契約）。
    #>
    param(
        [string]$BunPath,
        [string]$ScriptPath,
        [string]$InputPath,
        [string]$RootArg,
        [switch]$ValidateOnly
    )
    $psi = [System.Diagnostics.ProcessStartInfo]::new()
    $psi.FileName = $BunPath
    $psi.ArgumentList.Add($ScriptPath)
    $psi.ArgumentList.Add('--input')
    $psi.ArgumentList.Add($InputPath)
    if ($ValidateOnly) {
        $psi.ArgumentList.Add('--validate-input')
    }
    if ($RootArg) {
        $psi.ArgumentList.Add('--root')
        $psi.ArgumentList.Add($RootArg)
    }
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    # 機械工程 script の報告 JSON は UTF-8 で出力されるため、リダイレクト読取の
    # エンコーディングを明示する（既定は親コンソールの OutputEncoding に依存し、
    # 日本語を含む報告 JSON が環境によって壊れる）。
    $psi.StandardOutputEncoding = [System.Text.Encoding]::UTF8
    $psi.StandardErrorEncoding = [System.Text.Encoding]::UTF8
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    $process = [System.Diagnostics.Process]::new()
    $process.StartInfo = $psi
    $null = $process.Start()
    $stdoutTask = $process.StandardOutput.ReadToEndAsync()
    $stderrTask = $process.StandardError.ReadToEndAsync()
    if (-not $process.WaitForExit($MechanicalStepProbeTimeoutMs)) {
        try { $process.Kill($true) } catch { $process.Kill() }
        return @{ TimedOut = $true; ExitCode = $null; StdOut = ''; StdErr = '' }
    }
    return @{
        TimedOut = $false
        ExitCode = $process.ExitCode
        StdOut   = $stdoutTask.GetAwaiter().GetResult()
        StdErr   = $stderrTask.GetAwaiter().GetResult()
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

# 4エージェント選択集合の確定（REQ-099-036〜043）。優先順位: 明示指定（-Hosts/
# -AgentHosts パラメータまたはウィザード選択）> selectedAgents 記録 > 旧 agentHosts
# 補助信号 > 所有権確認可能な配置からの検出。省略された側は現行の配置または記録から
# 引き継ぐ。記録が読めない・不正な場合は推定せず停止し（REQ-099-043）、.agents/skills
# の管理投影だけが残る曖昧な既存導入は明示選択を案内して停止する（REQ-099-040）。
# 空選択（結合選択集合が空）は配置前に拒否する（REQ-099-037）。check / dry-run でも
# 同じ解決を使用し、記録は変更しない。
$InstallStateRecord = Read-InstallStateRecord
$detectedOpenExpansion = Expand-InstallHostsArg -HostsValue (Get-DetectedHosts -LocalRedirectToolRel $LocalModeRedirectToolRel -LocalRedirectSourceDir $LocalSourceDir)
$DetectedHostsList = if ($null -eq $detectedOpenExpansion) { @() } else { @($detectedOpenExpansion) }
$DetectedAgentSelection = @(Get-DetectedAgentDevSelection -AgentDevRoot (Join-Path $AgentProjectionDir 'agentdev'))
$Selection = Resolve-AgentSelectionSet -ExplicitHosts $Hosts -ExplicitAgentHosts $AgentHosts `
    -InstallState $InstallStateRecord.State -StateInvalid:($InstallStateRecord.Status -eq 'invalid') `
    -DetectedHostsList $DetectedHostsList -DetectedAgentSelection $DetectedAgentSelection `
    -HasAgentEntryProjection:(Test-HasAgentManagedProjection) -NewInstallFallbackOpenHosts @('opencode', 'senpi')
if (-not $Selection.Resolved) {
    Write-Host "[ERROR] $($Selection.Stop)"
    exit 1
}
foreach ($selectionGuidance in $Selection.Guidance) {
    Write-Host "[INFO] $selectionGuidance"
}
$SelectedAgents = @($Selection.SelectedAgents)
$ResolvedHosts = @($SelectedAgents | Where-Object { $_ -in @('opencode', 'senpi') })
$ResolvedAgentHosts = @($SelectedAgents | Where-Object { $_ -in @('codex', 'antigravity') })
$AgentPlacementActive = [bool]($ResolvedAgentHosts.Count -gt 0)
# .agents 配下の投影の稼働信号: Codex / Antigravity に加え、接続投影
# （.agents/agentdev/common + senpi）を必要とする Senpi 選択も含む（REQ-099-042）。
$AgentDevProjectionActive = $AgentPlacementActive -or ($ResolvedHosts -contains 'senpi')
Write-Host "[INFO] Placement targets: $(Get-AgentSelectionDisplay -SelectedAgents $SelectedAgents)"
if ($Hosts -or $AgentHosts) {
    Write-Host '[INFO] Placement targets were set by explicit selection.'
} else {
    Write-Host '[INFO] Placement targets were inherited from the current selection, placement state, or record. Use -Hosts / -AgentHosts to change them explicitly.'
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
if ($ResolvedAgentHosts -contains 'codex' -and -not (Test-Path -LiteralPath $CodexHostSourceDir)) {
    Write-Host "[ERROR] Codex 配置対象が選択されましたが、チェックアウトに $PluginDir/src/codex/（Codex 接続領域）が存在しません。完全なチェックアウトを用意するか、-AgentHosts を見直してください。"
    exit 1
}
if ($ResolvedAgentHosts -contains 'antigravity' -and -not (Test-Path -LiteralPath $AntigravityHostSourceDir)) {
    Write-Host "[ERROR] Antigravity 配置対象が選択されましたが、チェックアウトに $PluginDir/src/antigravity/（Antigravity 接続領域）が存在しません。完全なチェックアウトを用意するか、-AgentHosts を見直してください。"
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
# 宣言ファイルが解決できない環境は検査対象外として正常扱いする）。
# OpenCode 配置対象を含む場合のみ実施する（宣言と .opencode/skills の配置突合は
# OpenCode 導入の依存であり、OpenCode を配置しない導入では要求しない。REQ-099-041）
if ($ResolvedHosts -contains 'opencode') {
    Invoke-ThirdPartyDriftCheck -RootDir $RepoRoot -SkillsRootDir $SkillsDir -CliCommandHint 'bun .opencode/tools/agentdev-third-party/cli.ts'
}

# LocalMode requires the local redirect target (Local 実装 Tool) to exist
if ($LocalMode) {
    $localRedirectSource = $LocalSourceDir
    if (-not (Test-Path -LiteralPath (Join-Path $localRedirectSource 'runner-local.ts'))) {
        Write-Error "[ERROR] LocalMode redirect source not found: $localRedirectSource (runner-local.ts). Ensure $PluginDir contains agent-dev-flow checkout with src/common/tools/agentdev-gh/local/."
        exit 1
    }
}

$targets = Get-ConsumerJunctionTargets
$agentEntryTargets = @(Get-AgentEntryJunctionTargets)
# 切替で外れる配置対象（切替前の選択にあり、今回の選択にないエージェント）の管理列挙。
# その管理パスを管理物判定不能の junction が占有している状態は衝突として扱う
# （Write-UnmanagedJunctionReport）。選択中のエージェントが使い続ける共有投影は外す。
$removedAgents = @($Selection.PreviousAgents | Where-Object { $_ -notin $SelectedAgents })
$removalCandidateRels = @()
foreach ($removedAgent in $removedAgents) {
    switch ($removedAgent) {
        'opencode' { $removalCandidateRels += @(Get-ConsumerJunctionTargets -SelectedHosts @('opencode')) }
        'senpi' {
            $removalCandidateRels += @(Get-ConsumerJunctionTargets -SelectedHosts @('senpi'))
            $removalCandidateRels += @(Get-AgentEntryJunctionTargets -SelectedHosts @('senpi') -SelectedAgentHosts @())
        }
        default { $removalCandidateRels += @(Get-AgentEntryJunctionTargets -SelectedHosts @() -SelectedAgentHosts @($removedAgent)) }
    }
}
$RemovalCandidateManagedRels = @($removalCandidateRels |
    Where-Object { $_ -and ($_ -notin @($targets)) -and ($_ -notin $agentEntryTargets) } |
    Sort-Object -Unique)

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
        }
    }
    if ($ResolvedAgentHosts -contains 'codex') {
        if (-not (Test-Path -LiteralPath $CodexHostSourceDir)) {
            Write-Host "[DIVERGENCE] Codex host connection area not found: $PluginDir/src/codex/"
            $divergences++
        } else {
            Write-Host "[OK] Codex host connection area exists: $PluginDir/src/codex/"
        }
    }
    if ($ResolvedAgentHosts -contains 'antigravity') {
        if (-not (Test-Path -LiteralPath $AntigravityHostSourceDir)) {
            Write-Host "[DIVERGENCE] Antigravity host connection area not found: $PluginDir/src/antigravity/"
            $divergences++
        } else {
            Write-Host "[OK] Antigravity host connection area exists: $PluginDir/src/antigravity/"
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

    # 2d. Distribution version state（REQ-126-003）: 配布版マーカーの存在、
    # install-state.json の記録版一致、旧構造痕跡の不在。
    # ADF 管理投影物が1つも存在しない場合は未導入とみなし、版状態の検査対象外とする。
    if ([string]::IsNullOrEmpty($DistributionVersion)) {
        Write-Host "[DIVERGENCE] Distribution version marker not found or empty: $PluginDir/src/common/VERSION (checkout が破損しています)"
        $divergences++
    } else {
        $legacyRels = @(Get-LegacyStructureRels)
        $adfManagedProjectionPresent = $false
        foreach ($relPath in $targets) {
            $senpiRel = Resolve-SenpiTargetRel -TargetEntry $relPath
            $managedPath = if ($null -ne $senpiRel) { Join-Path $SenpiProjectionDir $senpiRel } else { Join-Path $ProjectionDir $relPath }
            if (Test-Junction -Path $managedPath) { $adfManagedProjectionPresent = $true; break }
        }
        foreach ($agentEntry in $agentEntryTargets) {
            $agentRel = Resolve-AgentEntryTargetRel -TargetEntry $agentEntry
            if (Test-Junction -Path (Join-Path $AgentProjectionDir $agentRel)) { $adfManagedProjectionPresent = $true; break }
        }
        if (-not $adfManagedProjectionPresent) {
            Write-Host "[INFO] No ADF-managed projections placed yet; version state is not verified (distribution version: $DistributionVersion)"
        } else {
            $installState = Read-InstallState
            if ($null -eq $installState) {
                Write-Host '[DIVERGENCE] Install state record missing or unreadable: .agentdev/install-state.json'
                Show-MigrateGuidance
                $divergences++
            } elseif ($installState.distributionVersion -ne $DistributionVersion) {
                Write-Host "[DIVERGENCE] Install state version divergence: recorded=$($installState.distributionVersion), checkout=$DistributionVersion"
                Show-MigrateGuidance
                $divergences++
            } else {
                Write-Host "[OK] Install state version matches checkout: $DistributionVersion"
            }
            if ($legacyRels.Count -gt 0) {
                Write-Host "[DIVERGENCE] Legacy structure traces detected: $($legacyRels -join ', ')"
                Show-MigrateGuidance
                $divergences++
            } else {
                Write-Host '[OK] No legacy structure traces detected'
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

    # 4a. .agents/ projection roots (shared entry projection for Codex /
    # Antigravity, connection copies for Codex / Antigravity / Senpi)
    if ($AgentDevProjectionActive) {
        if (Test-Junction -Path $AgentProjectionDir) {
            Write-Host '[DIVERGENCE] .agents/ is a junction (must be real directory)'
            $divergences++
        } elseif (-not (Test-Path -LiteralPath $AgentProjectionDir)) {
            Write-Host '[DIVERGENCE] .agents/ does not exist'
            $divergences++
        } else {
            Write-Host '[OK] .agents/ is a real directory'
        }
        $agentDevRoot = Join-Path $AgentProjectionDir 'agentdev'
        if (Test-Junction -Path $agentDevRoot) {
            Write-Host '[DIVERGENCE] .agents/agentdev/ is a junction (must be real directory)'
            $divergences++
        } elseif (-not (Test-Path -LiteralPath $agentDevRoot)) {
            Write-Host '[DIVERGENCE] .agents/agentdev/ does not exist'
            $divergences++
        } else {
            Write-Host '[OK] .agents/agentdev/ is a real directory'
        }
    }
    if ($AgentPlacementActive) {
        $agentSkillsRoot = Join-Path $AgentProjectionDir 'skills'
        if (Test-Junction -Path $agentSkillsRoot) {
            Write-Host '[DIVERGENCE] .agents/skills/ is a junction (must be real directory)'
            $divergences++
        } elseif (-not (Test-Path -LiteralPath $agentSkillsRoot)) {
            Write-Host '[DIVERGENCE] .agents/skills/ does not exist'
            $divergences++
        } else {
            Write-Host '[OK] .agents/skills/ is a real directory'
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
                $expectedSource = Get-TargetSourcePath -RelPath $relPath -LocalRedirectToolRel $LocalModeRedirectToolRel -LocalRedirectSourceDir $LocalSourceDir
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
                Get-TargetSourcePath -RelPath $relPath -LocalRedirectToolRel $LocalModeRedirectToolRel -LocalRedirectSourceDir $LocalSourceDir
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

    # 6a. Check each expected agent-entry junction (Codex/Antigravity shared projection)
    foreach ($agentEntry in $agentEntryTargets) {
        $agentRel = Resolve-AgentEntryTargetRel -TargetEntry $agentEntry
        $targetPath = Join-Path $AgentProjectionDir $agentRel
        $expectedSource = Get-TargetSourcePath -RelPath $agentRel
        if (-not (Test-Path -LiteralPath $targetPath)) {
            Write-Host "[DIVERGENCE] Missing agent-entry junction: .agents/$agentRel"
            $divergences++
        } elseif (Test-Junction -Path $targetPath) {
            $actualTarget = Get-JunctionTarget -Path $targetPath
            if ($actualTarget -and (Test-Path -LiteralPath $actualTarget) -and ((Resolve-Path -LiteralPath $actualTarget).Path -eq (Resolve-Path -LiteralPath $expectedSource).Path)) {
                Write-Host "[OK] Agent-entry junction: .agents/$agentRel -> $actualTarget"
            } else {
                Write-Host "[DIVERGENCE] Broken agent-entry junction: .agents/$agentRel (expected: $expectedSource, actual: $actualTarget)"
                $divergences++
            }
        } else {
            Write-Host "[DIVERGENCE] Exists but not a junction: .agents/$agentRel"
            $divergences++
        }
    }

    # 7. Orphan detection (REQ-050-004 継承能力)。REQ-058:
    # 正本の管理対象から外れた ADF 管理投影物（stale）のみ乖離として検出・報告する
    # （検出のみでファイルシステムを変更しない。REQ-058-003）。
    # 管理物判定不能な junction（正本以外を向く等）は報告のみで非破壊とする（REQ-058-008）。
    Write-Host ''
    Write-Host '--- Orphan junctions ---'
    $staleJunctions = @(Get-StaleManagedJunctions -CurrentTargets $targets -LocalRedirectToolRel $LocalModeRedirectToolRel -LocalRedirectSourceDir $LocalSourceDir)
    foreach ($staleItem in $staleJunctions) {
        Write-Host "[ORPHAN] Stale managed junction (apply removes it): $($staleItem.RelPath)"
        $divergences++
    }
    $unmanagedConflicts = @(Write-UnmanagedJunctionReport -UnmanagedRels (Get-UnmanagedProjectionJunctionRels -CurrentTargets $targets -LocalRedirectToolRel $LocalModeRedirectToolRel -LocalRedirectSourceDir $LocalSourceDir) -ReportMode 'check')
    $staleAgentJunctions = @(Get-StaleManagedAgentJunctions -CurrentAgentEntryTargets $agentEntryTargets)
    foreach ($staleAgentItem in $staleAgentJunctions) {
        Write-Host "[ORPHAN] Stale managed junction (apply removes it): $($staleAgentItem.RelPath)"
        $divergences++
    }
    $unmanagedConflicts += @(Write-UnmanagedJunctionReport -UnmanagedRels (Get-UnmanagedAgentProjectionJunctionRels -CurrentAgentEntryTargets $agentEntryTargets) -ReportMode 'check')
    $divergences += $unmanagedConflicts.Count
    if ($staleJunctions.Count -eq 0 -and $staleAgentJunctions.Count -eq 0) {
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

    # 10. 機械工程 script の実行時前提検証（REQ-009-053）。静的構成検査と実行環境診断の
    # 間で、配布物の主要機械工程 script の実行時前提の不一致を導入時に検出する。
    # 検証は各 script の検証専用経路（副作用なし入口）で実 consumer 条件 fixture により
    # 行い、管理対象ファイルを変更しない（REQ-050-005）。検出した前提の不一致は既存の
    # divergence 報告形式で報告し、check の終了コードに反映する。検証自体の実行失敗は
    # 検証不能として報告し、成功扱いとしない。本節は節見出しと検証対象ごとの結果行で
    # 報告し、installer 全体の divergence 統一集約と終了コード反映は既存契約を維持する。
    Write-Host ''
    Write-Host '--- Mechanical-step script prerequisites ---'
    $mechanicalBun = Get-Command -Name 'bun' -ErrorAction SilentlyContinue
    # probe 対象 skills ルートは現在の選択で配置される管理対象配置ルートから解決する
    # （選択に対応しない空の親ディレクトリを誤って採用しない。senpi 単独の適用でも
    # .opencode/skills が親ディレクトリとして作られ得るため、存在チェックだけでは
    # 不十分）。
    $mechanicalProbeRootCandidates = @()
    if ($SelectedAgents -contains 'opencode') { $mechanicalProbeRootCandidates += $SkillsDir }
    if ($SelectedAgents -contains 'senpi') { $mechanicalProbeRootCandidates += (Join-Path $SenpiProjectionDir 'skills') }
    if ($SelectedAgents -contains 'codex' -or $SelectedAgents -contains 'antigravity') { $mechanicalProbeRootCandidates += (Join-Path $AgentProjectionDir 'skills') }
    $mechanicalProbeSkillsDir = $mechanicalProbeRootCandidates |
        Where-Object { $_ -and (Test-Path -LiteralPath $_) } |
        Select-Object -First 1
    if (-not $mechanicalBun) {
        Write-Host '[DIVERGENCE] Mechanical-step script runtime prerequisite (bun) not found in PATH; mechanical-step script prerequisite verification is unavailable (not treated as success)'
        $divergences++
    } elseif (-not $mechanicalProbeSkillsDir) {
        Write-Host '[DIVERGENCE] Mechanical-step script prerequisites unavailable: no managed skills placement root exists for the current selection (expected .opencode/skills, .senpi/skills, or .agents/skills)'
        $divergences++
    } else {
        # 検査入力の一時領域。対象 script 契約の置き場所指針（workspace 外一時領域不使用・
        # project root 内限定・commit 対象外・検査後削除）に従い、consumer の
        # .agentdev/integrity/reports/ 配下へ置く。本節で作成した祖先ディレクトリは
        # 検証後に空である限り削除し、ディレクトリ状態を検証前と同一に保つ。
        $probeReportsDir = Join-Path $RepoRoot '.agentdev\integrity\reports'
        $probeTempDir = Join-Path $probeReportsDir "adf-install-check-$([guid]::NewGuid().ToString('N')).tmp"
        $createdAncestors = [System.Collections.Generic.List[string]]::new()
        $probeCreated = $false
        try {
            Assert-MechanicalProbeContainedPath -Path $probeTempDir -Root $RepoRoot
            $missingAncestors = [System.Collections.Generic.List[string]]::new()
            $ensureDir = $probeReportsDir
            while (-not (Test-Path -LiteralPath $ensureDir)) {
                $missingAncestors.Insert(0, $ensureDir)
                $parentDir = Split-Path -Path $ensureDir -Parent
                if (-not $parentDir -or $parentDir -eq $ensureDir) { break }
                $ensureDir = $parentDir
            }
            foreach ($dirPath in $missingAncestors) {
                Assert-MechanicalProbeContainedPath -Path $dirPath -Root $RepoRoot
                New-Item -ItemType Directory -Path $dirPath -Force | Out-Null
                $createdAncestors.Add($dirPath)
            }
            New-Item -ItemType Directory -Path $probeTempDir -Force | Out-Null
            $probeCreated = $true

            # 横断依存検査 fixture は定義PR受入検査 fixture の overlapGate 参照（--input）
            # からも使われるため、最初に書き込む。クローズ機械工程 fixture の
            # issueBodyPath 参照（完了条件本文抽出対象）も同様に先に書き込む。
            $crossDepFixture = New-MechanicalStepProbeInput -Kind 'cross-dependency' -RepoRoot $RepoRoot -SkillsDir $mechanicalProbeSkillsDir -ProbeDir $probeTempDir
            Assert-MechanicalProbeContainedPath -Path $probeTempDir -Root $RepoRoot
            [System.IO.File]::WriteAllText(
                (Join-Path $probeTempDir 'cross-dependency.json'),
                ($crossDepFixture | ConvertTo-Json -Depth 10),
                (New-Object System.Text.UTF8Encoding($false)))
            [System.IO.File]::WriteAllText(
                (Join-Path $probeTempDir 'issue-body.md'),
                "## 完了条件`n`n- [ ] プローブ用本文（機械工程前提検証の fixture）`n",
                (New-Object System.Text.UTF8Encoding($false)))

            $mechanicalTargets = 0
            $mechanicalDivergences = 0
            foreach ($probeSpec in $MechanicalStepProbeContract) {
                $mechanicalTargets++
                $scriptPath = Join-Path $mechanicalProbeSkillsDir (Join-Path $probeSpec.Skill $probeSpec.ScriptRel)
                $scriptDisplay = "$($probeSpec.Skill)/$($probeSpec.ScriptRel -replace '\\', '/')"
                if (-not (Test-Path -LiteralPath $scriptPath)) {
                    Write-Host "[DIVERGENCE] Mechanical-step script missing: $scriptDisplay"
                    $divergences++
                    $mechanicalDivergences++
                    continue
                }
                $inputPath = Join-Path $probeTempDir ($probeSpec.Kind + '.json')
                $fixture = New-MechanicalStepProbeInput -Kind $probeSpec.Kind -RepoRoot $RepoRoot -SkillsDir $mechanicalProbeSkillsDir -ProbeDir $probeTempDir
                Assert-MechanicalProbeContainedPath -Path $probeTempDir -Root $RepoRoot
                [System.IO.File]::WriteAllText($inputPath, ($fixture | ConvertTo-Json -Depth 10), (New-Object System.Text.UTF8Encoding($false)))
                if ($probeSpec.Entry -eq 'validate-input') {
                    $expectedDetail = 'exit 0 with a validation report (ok: true) on stdout via --validate-input (consumer-condition fixture)'
                    $probe = Invoke-MechanicalScriptProbe -BunPath $mechanicalBun.Source -ScriptPath $scriptPath -InputPath $inputPath -ValidateOnly
                } else {
                    $expectedDetail = 'exit 0 with ok: true, population_count 1, condition_a.count 0, all shared-area file_results read_ok true, detection_unavailable empty'
                    $probe = Invoke-MechanicalScriptProbe -BunPath $mechanicalBun.Source -ScriptPath $scriptPath -InputPath $inputPath -RootArg $RepoRoot
                }
                if ($probe.TimedOut) {
                    Write-Host "[DIVERGENCE] Mechanical-step script prerequisite verification timed out: $scriptDisplay (expected: $expectedDetail)"
                    $divergences++
                    $mechanicalDivergences++
                    continue
                }
                $probeReport = $null
                if ($probe.StdOut.Length -gt 0) {
                    try { $probeReport = $probe.StdOut | ConvertFrom-Json } catch { $probeReport = $null }
                }
                $probeContractOk = $false
                if ($probeSpec.Entry -eq 'validate-input') {
                    $probeContractOk = ($probe.ExitCode -eq 0) -and ($null -ne $probeReport) -and ($probeReport.ok -is [bool]) -and ($probeReport.ok -eq $true)
                } else {
                    # 応答述語は fail-closed: condition_b と detection_unavailable は
                    # 配列として存在しなければならない（欠落を空と同等に受理しない）。
                    # file_results は shared_areas の file_paths 非空を前提とするため、
                    # 欠落・空の file_results は読取証拠不在として不成立とする。
                    $conditionBPresent = ($null -ne $probeReport) -and ($probeReport.condition_b -is [array]) -and ($probeReport.condition_b.Count -eq 1)
                    $readOkAll = $conditionBPresent
                    if ($conditionBPresent) {
                        foreach ($area in @($probeReport.condition_b)) {
                            if ($area.file_results -isnot [array]) { $readOkAll = $false; continue }
                            $areaResults = @($area.file_results)
                            if ($areaResults.Count -ne 1) { $readOkAll = $false; continue }
                            foreach ($fileResult in $areaResults) {
                                if (($fileResult.read_ok -isnot [bool]) -or ($fileResult.read_ok -ne $true)) { $readOkAll = $false }
                            }
                        }
                    }
                    $detectionUnavailableEmpty = $false
                    if ($null -ne $probeReport -and $probeReport.detection_unavailable -is [array]) {
                        $detectionUnavailableEmpty = (@($probeReport.detection_unavailable).Count -eq 0)
                    }
                    $probeContractOk = ($probe.ExitCode -eq 0) -and
                        ($null -ne $probeReport) -and
                        ($probeReport.ok -is [bool]) -and ($probeReport.ok -eq $true) -and
                        ($null -ne $probeReport.scan) -and
                        (($probeReport.scan.population_count -is [int]) -or ($probeReport.scan.population_count -is [long])) -and ($probeReport.scan.population_count -eq 1) -and
                        ($null -ne $probeReport.condition_a) -and
                        (($probeReport.condition_a.count -is [int]) -or ($probeReport.condition_a.count -is [long])) -and ($probeReport.condition_a.count -eq 0) -and
                        $conditionBPresent -and
                        $readOkAll -and
                        $detectionUnavailableEmpty
                }
                if ($probeContractOk) {
                    Write-Host "[OK] Mechanical-step script prerequisite ($($probeSpec.Entry)): $scriptDisplay"
                } else {
                    $probeResponse = if ($probe.StdErr.Length -gt 0) { $probe.StdErr.Trim() } else { $probe.StdOut.Trim() }
                    $probeResponseHead = ($probeResponse -split "`n")[0]
                    Write-Host "[DIVERGENCE] Mechanical-step script prerequisite contract mismatch: $scriptDisplay (expected: $expectedDetail, actual: exit=$($probe.ExitCode), response: $probeResponseHead)"
                    $divergences++
                    $mechanicalDivergences++
                }
            }
            Write-Host "Mechanical-step prerequisites: $mechanicalTargets target(s), $mechanicalDivergences divergence(s) (section summary; unified divergence aggregation and exit code are maintained by check mode)"
        }
        catch {
            Write-Host "[DIVERGENCE] Mechanical-step prerequisite verification failed: $($_.Exception.Message)"
            $divergences++
        }
        finally {
            # 後片付けの失敗は黙殺しない（検証前後のディレクトリ状態同一の契約）。
            # 削除失敗は divergence として検出し、installer の非ゼロ終了へ反映する。
            $cleanupDiverged = $false
            if ($probeCreated -and (Test-Path -LiteralPath $probeTempDir)) {
                try {
                    Assert-MechanicalProbeContainedPath -Path $probeTempDir -Root $RepoRoot
                    Remove-Item -LiteralPath $probeTempDir -Recurse -Force -ErrorAction Stop
                } catch {
                    Write-Host "[DIVERGENCE] Mechanical-step probe input cleanup failed; probe inputs must not remain after check: $probeTempDir"
                    $divergences++
                    $cleanupDiverged = $true
                }
            }
            for ($i = $createdAncestors.Count - 1; $i -ge 0; $i--) {
                $dirPath = $createdAncestors[$i]
                try {
                    Assert-MechanicalProbeContainedPath -Path $dirPath -Root $RepoRoot
                    if ((Test-Path -LiteralPath $dirPath) -and -not (Get-ChildItem -LiteralPath $dirPath -Force -ErrorAction Stop)) {
                        Remove-Item -LiteralPath $dirPath -Force -ErrorAction Stop
                    }
                } catch {
                    Write-Host "[DIVERGENCE] Mechanical-step probe ancestor cleanup failed; created ancestors must be removed after check: $dirPath"
                    if (-not $cleanupDiverged) { $divergences++; $cleanupDiverged = $true }
                }
            }
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
    if ($AgentDevProjectionActive) {
        if (Test-Junction -Path $AgentProjectionDir) {
            Write-Host '[INFO] Migration required: .agents/ is a junction'
        } elseif (-not (Test-Path -LiteralPath $AgentProjectionDir)) {
            Write-Host '[INFO] .agents/ does not exist, would create as real directory'
        } else {
            Write-Host '[OK] .agents/ is a real directory'
        }
        $agentDevRoot = Join-Path $AgentProjectionDir 'agentdev'
        if (Test-Junction -Path $agentDevRoot) {
            Write-Host '[ERROR] .agents/agentdev/ is a junction (unexpected state)'
        } elseif (-not (Test-Path -LiteralPath $agentDevRoot)) {
            Write-Host '[INFO] .agents/agentdev/ does not exist, would create as real directory'
        } else {
            Write-Host '[OK] .agents/agentdev/ exists as real directory'
        }
    }
    if ($AgentPlacementActive) {
        $agentSkillsRoot = Join-Path $AgentProjectionDir 'skills'
        if (Test-Junction -Path $agentSkillsRoot) {
            Write-Host '[ERROR] .agents/skills/ is a junction (unexpected state)'
        } elseif (-not (Test-Path -LiteralPath $agentSkillsRoot)) {
            Write-Host '[INFO] .agents/skills/ does not exist, would create as real directory'
        } else {
            Write-Host '[OK] .agents/skills/ exists as real directory'
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
            $expectedSource = Get-TargetSourcePath -RelPath $relPath -LocalRedirectToolRel $LocalModeRedirectToolRel -LocalRedirectSourceDir $LocalSourceDir
            if (Test-Junction -Path $targetPath) {
                $actualTarget = Get-JunctionTarget -Path $targetPath
                if (Test-JunctionTargetMatchesSource -JunctionFullName $targetPath -SourcePath $expectedSource) {
                    Write-Host "[OK] Already junctioned: .senpi/$senpiRel"
                } elseif (Test-ManagedSenpiJunction -SenpiRel $senpiRel -JunctionFullName $targetPath) {
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
        $expectedSource = Get-TargetSourcePath -RelPath $relPath -LocalRedirectToolRel $LocalModeRedirectToolRel -LocalRedirectSourceDir $LocalSourceDir
        if (Test-Junction -Path $targetPath) {
            $actualTarget = Get-JunctionTarget -Path $targetPath
            if (Test-JunctionTargetMatchesSource -JunctionFullName $targetPath -SourcePath $expectedSource) {
                Write-Host "[OK] Already junctioned: $relPath"
            } elseif (Test-ManagedProjectionJunction -JunctionRel $relPath -JunctionFullName $targetPath -LocalRedirectToolRel $LocalModeRedirectToolRel -LocalRedirectSourceDir $LocalSourceDir) {
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

    # Codex / Antigravity / Senpi の .agents 配下投影の配置予測（REQ-009-040）
    foreach ($agentEntry in $agentEntryTargets) {
        $agentRel = Resolve-AgentEntryTargetRel -TargetEntry $agentEntry
        $targetPath = Join-Path $AgentProjectionDir $agentRel
        $expectedSource = Get-TargetSourcePath -RelPath $agentRel
        if (Test-Junction -Path $targetPath) {
            $actualTarget = Get-JunctionTarget -Path $targetPath
            if (Test-JunctionTargetMatchesSource -JunctionFullName $targetPath -SourcePath $expectedSource) {
                Write-Host "[OK] Already junctioned: .agents/$agentRel"
            } elseif (Test-ManagedProjectionJunction -JunctionRel $agentRel -JunctionFullName $targetPath) {
                # wrong target（管理物）: 修復対象（REQ-058-004）
                if ($actualTarget -and (Test-Path -LiteralPath (@($actualTarget) | Select-Object -First 1))) {
                    Write-Host "[WOULD REMOVE] Wrong-target junction: .agents/$agentRel (actual: $actualTarget)"
                } else {
                    Write-Host "[WOULD REMOVE] Broken junction: .agents/$agentRel"
                }
                Write-Host "[WOULD ADD] Re-create junction: .agents/$agentRel -> $expectedSource"
            } else {
                # wrong target（管理物と確認できない）: 予測せず保持を報告する
                Write-Host "[ERROR] Unmanaged junction at managed path (apply would keep it and report a conflict): .agents/$agentRel (actual: $actualTarget)"
            }
        } elseif (Test-Path -LiteralPath $targetPath) {
            Write-Host "[ERROR] Path exists and is not a junction: .agents/$agentRel"
        } else {
            Write-Host "[WOULD ADD] Create junction: .agents/$agentRel -> $expectedSource"
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
    $dryRunStale = @(Get-StaleManagedJunctions -CurrentTargets $targets -LocalRedirectToolRel $LocalModeRedirectToolRel -LocalRedirectSourceDir $LocalSourceDir)
    foreach ($staleItem in $dryRunStale) {
        if ((Resolve-SenpiTargetRel -TargetEntry $staleItem.RelPath)) {
            Write-Host "[WOULD REMOVE] Stale managed junction: .senpi/$((Resolve-SenpiTargetRel -TargetEntry $staleItem.RelPath))"
        } else {
            Write-Host "[WOULD REMOVE] Stale managed junction: $($staleItem.RelPath)"
        }
    }
    Write-UnmanagedJunctionReport -UnmanagedRels (Get-UnmanagedProjectionJunctionRels -CurrentTargets $targets -LocalRedirectToolRel $LocalModeRedirectToolRel -LocalRedirectSourceDir $LocalSourceDir) -ReportMode 'dry-run' | Out-Null
    $dryRunStaleAgent = @(Get-StaleManagedAgentJunctions -CurrentAgentEntryTargets $agentEntryTargets)
    foreach ($staleAgentItem in $dryRunStaleAgent) {
        Write-Host "[WOULD REMOVE] Stale managed junction: $($staleAgentItem.RelPath)"
    }
    Write-UnmanagedJunctionReport -UnmanagedRels (Get-UnmanagedAgentProjectionJunctionRels -CurrentAgentEntryTargets $agentEntryTargets) -ReportMode 'dry-run' | Out-Null
    if ($dryRunStale.Count -eq 0 -and $dryRunStaleAgent.Count -eq 0) {
        Write-Host '[OK] No stale managed junctions to remove'
    }

    # 配布版状態の予測表示（変更はしない）。
    Write-Host ''
    Write-Host '--- Distribution version state ---'
    if ([string]::IsNullOrEmpty($DistributionVersion)) {
        Write-Host "[ERROR] Distribution version marker not found or empty: $PluginDir/src/common/VERSION (checkout が破損しています)"
    } else {
        Write-Host "[INFO] Distribution version: $DistributionVersion"
        $legacyRels = @(Get-LegacyStructureRels)
        if ($legacyRels.Count -gt 0) {
            Write-Host "[WOULD REPORT] Legacy structure traces detected: $($legacyRels -join ', ')"
            Show-MigrateGuidance
        } else {
            Write-Host '[OK] No legacy structure traces detected'
        }
        $installState = Read-InstallState
        if ($null -eq $installState) {
            Write-Host '[INFO] Install state record not present (apply would create .agentdev/install-state.json)'
        } else {
            Write-Host "[INFO] Install state recorded version: $($installState.distributionVersion)"
        }
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

    # Step 1b: .agents/ projection roots (shared entry projection for Codex /
    # Antigravity, connection copies for Codex / Antigravity / Senpi)。
    # 非アクティブ時は作成しない（stale 除去は Step 3c が処理する）。
    if ($AgentDevProjectionActive) {
        if (Test-Junction -Path $AgentProjectionDir) {
            Write-Host '[ACTION] Removing whole-directory junction .agents/'
            $rmResult = cmd /c "rmdir `"$AgentProjectionDir`"" 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Error "[ERROR] Failed to remove junction: $rmResult"
                exit 1
            }
            Write-Host '[ACTION] Creating .agents/ as real directory'
            New-Item -ItemType Directory -Path $AgentProjectionDir -Force | Out-Null
        } elseif (-not (Test-Path -LiteralPath $AgentProjectionDir)) {
            Write-Host '[ACTION] Creating .agents/ as real directory'
            New-Item -ItemType Directory -Path $AgentProjectionDir -Force | Out-Null
        } else {
            Write-Host '[OK] .agents/ exists as real directory'
        }
        $agentDevRoot = Join-Path $AgentProjectionDir 'agentdev'
        if (Test-Junction -Path $agentDevRoot) {
            Write-Error '[ERROR] .agents/agentdev/ is a junction (must be real directory)'
            exit 1
        }
        if (-not (Test-Path -LiteralPath $agentDevRoot)) {
            Write-Host '[ACTION] Creating .agents/agentdev/ as real directory'
            New-Item -ItemType Directory -Path $agentDevRoot -Force | Out-Null
        }
    }
    if ($AgentPlacementActive) {
        $agentSkillsRoot = Join-Path $AgentProjectionDir 'skills'
        if (Test-Junction -Path $agentSkillsRoot) {
            Write-Error '[ERROR] .agents/skills/ is a junction (must be real directory)'
            exit 1
        }
        if (-not (Test-Path -LiteralPath $agentSkillsRoot)) {
            Write-Host '[ACTION] Creating .agents/skills/ as real directory'
            New-Item -ItemType Directory -Path $agentSkillsRoot -Force | Out-Null
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
            $sourcePath = Get-TargetSourcePath -RelPath $relPath -LocalRedirectToolRel $LocalModeRedirectToolRel -LocalRedirectSourceDir $LocalSourceDir

            if (Test-Junction -Path $targetPath) {
                if (Test-JunctionTargetMatchesSource -JunctionFullName $targetPath -SourcePath $sourcePath) {
                    Write-Host "[OK] Already junctioned: .senpi/$senpiRel"
                    continue
                } elseif (Test-ManagedSenpiJunction -SenpiRel $senpiRel -JunctionFullName $targetPath) {
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

            $senpiParent = Split-Path -Parent $targetPath
            if (-not (Test-Path -LiteralPath $senpiParent)) {
                New-Item -ItemType Directory -Path $senpiParent -Force | Out-Null
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
        $sourcePath = Get-TargetSourcePath -RelPath $relPath -LocalRedirectToolRel $LocalModeRedirectToolRel -LocalRedirectSourceDir $LocalSourceDir

        if (Test-Junction -Path $targetPath) {
            if (Test-JunctionTargetMatchesSource -JunctionFullName $targetPath -SourcePath $sourcePath) {
                Write-Host "[OK] Already junctioned: $relPath"
                continue
            } elseif (Test-ManagedProjectionJunction -JunctionRel $relPath -JunctionFullName $targetPath -LocalRedirectToolRel $LocalModeRedirectToolRel -LocalRedirectSourceDir $LocalSourceDir) {
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

    # Step 3a: .agents/ junctions (.agents/skills/agentdev-* entry projection,
    # .agents/agentdev/<area> connection copies)
    foreach ($agentEntry in $agentEntryTargets) {
        $agentRel = Resolve-AgentEntryTargetRel -TargetEntry $agentEntry
        $targetPath = Join-Path $AgentProjectionDir $agentRel
        $sourcePath = Get-TargetSourcePath -RelPath $agentRel

        if (Test-Junction -Path $targetPath) {
            if (Test-JunctionTargetMatchesSource -JunctionFullName $targetPath -SourcePath $sourcePath) {
                Write-Host "[OK] Already junctioned: .agents/$agentRel"
                continue
            } elseif (Test-ManagedProjectionJunction -JunctionRel $agentRel -JunctionFullName $targetPath) {
                # wrong target（管理物）: 修復対象（REQ-058-004、REQ-099-012）
                $actualTarget = Get-JunctionTarget -Path $targetPath
                if ($actualTarget -and (Test-Path -LiteralPath (@($actualTarget) | Select-Object -First 1))) {
                    Write-Host "[ACTION] Removing junction (wrong target): .agents/$agentRel"
                } else {
                    Write-Host "[ACTION] Removing broken junction: .agents/$agentRel"
                }
                cmd /c "rmdir `"$targetPath`"" 2>&1
                if ($LASTEXITCODE -ne 0) {
                    Write-Error "[ERROR] Failed to remove junction: .agents/$agentRel"
                    exit 1
                }
            } else {
                # wrong target（管理物と確認できない）: 自動置換せず保持して衝突報告する
                $actualTarget = Get-JunctionTarget -Path $targetPath
                Write-Host "[ERROR] Unmanaged junction at managed path (kept, not replaced): .agents/$agentRel (actual: $actualTarget)"
                $applyConflicts.Add(".agents/$agentRel")
                continue
            }
        } elseif (Test-Path -LiteralPath $targetPath) {
            Write-Error "[ERROR] Path exists and is not a junction: .agents/$agentRel"
            exit 1
        }

        Write-Host "[ACTION] Creating junction: .agents/$agentRel -> $sourcePath"
        $result = cmd /c "mklink /J `"$targetPath`" `"$sourcePath`" 2>&1"
        if ($LASTEXITCODE -ne 0) {
            Write-Error "[ERROR] Failed to create junction .agents/${agentRel}: $result"
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
    $applyStale = @(Get-StaleManagedJunctions -CurrentTargets $targets -LocalRedirectToolRel $LocalModeRedirectToolRel -LocalRedirectSourceDir $LocalSourceDir)
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
    # Codex / Antigravity 共有投影の stale 除去（明示的な none・正本スキル消失。REQ-009-040）
    $applyStaleAgent = @(Get-StaleManagedAgentJunctions -CurrentAgentEntryTargets $agentEntryTargets)
    foreach ($staleAgentItem in $applyStaleAgent) {
        Write-Host "[ACTION] Removing stale managed junction: $($staleAgentItem.RelPath)"
        $rmAgentResult = cmd /c "rmdir `"$($staleAgentItem.FullName)`"" 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Failed to remove stale managed junction: $($staleAgentItem.RelPath) ($rmAgentResult)"
            $applyRemoveFailures.Add($staleAgentItem.RelPath)
        }
    }
    # 管理物判定不能な junction は削除せず報告のみ（REQ-058-008）。配置対象から外れた
    # ホストの管理パス上のものは衝突に加える（保持し、記録を更新せずに非正常終了する）。
    foreach ($unmanagedConflictRel in @(Write-UnmanagedJunctionReport -UnmanagedRels (Get-UnmanagedProjectionJunctionRels -CurrentTargets $targets -LocalRedirectToolRel $LocalModeRedirectToolRel -LocalRedirectSourceDir $LocalSourceDir) -ReportMode 'apply')) {
        $applyConflicts.Add($unmanagedConflictRel)
    }
    foreach ($unmanagedAgentConflictRel in @(Write-UnmanagedJunctionReport -UnmanagedRels (Get-UnmanagedAgentProjectionJunctionRels -CurrentAgentEntryTargets $agentEntryTargets) -ReportMode 'apply')) {
        $applyConflicts.Add($unmanagedAgentConflictRel)
    }
    if ($applyStale.Count -eq 0 -and $applyStaleAgent.Count -eq 0) {
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

    # 配布版の記録（REQ-126-003）。旧構造痕跡が残る場合は版記録を更新せず移行を案内する
    # （ジャンクション同期自体は完了しているため apply は成功で終了する）。
    Write-Host ''
    Write-Host '--- Distribution version record ---'
    if ([string]::IsNullOrEmpty($DistributionVersion)) {
        Write-Host "[ERROR] Distribution version marker not found or empty: $PluginDir/src/common/VERSION; cannot record install state"
        exit 1
    }
    $legacyRels = @(Get-LegacyStructureRels)
    if ($legacyRels.Count -gt 0) {
        Write-Host "[WARNING] Legacy structure traces detected: $($legacyRels -join ', '); install state version record was not updated"
        Show-MigrateGuidance
    } else {
        Write-InstallStateRecord
        Write-Host "[OK] Install state recorded: .agentdev/install-state.json (distribution version: $DistributionVersion)"
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
    if ($AgentDevProjectionActive) {
        Write-Host '  .agents/agentdev/'
    }
    if ($AgentPlacementActive) {
        Write-Host '  .agents/skills/agentdev-*/'
    }

    # 実行環境診断（REQ-099-011）。配置結果の報告と区別して報告する。
    Show-RuntimeDiagnostics
    exit 0
}
