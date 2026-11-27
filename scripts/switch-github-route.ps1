<#
.SYNOPSIS
    Switch the GitHub execution route (plugin / gh CLI) of a consumer repository.

.DESCRIPTION
    consumer 向け公開入口。Codex と Antigravity のそれぞれについて、GitHub 実行経路を
    GitHub プラグイン経由（plugin）と gh CLI 経由（gh）のいずれかに切り替え、
    切り替え先リポジトリの .agentdev/config/github-route.json に記録する。

    切り替えは利用者の明示判断だけで行う。-Route に既定値はなく、省略した場合は
    何も変更せず使い方を表示して終了する。

    実行対象のリポジトリはカレントディレクトリで決まる（導入系公開入口と同じ解決）。
    consumer リポジトリのルート（.git がある場所）で実行すること。

    AgentDevFlow 本体リポジトリでは実行しないこと。本体リポジトリで実行した場合は
    変更前に停止し、適切な公開入口を案内する。

    記録のないホストは plugin 扱いである。既存の設定ファイルが読めない、または
    値が不正な場合は経路を推定せず、何も変更せずに停止する（修正または削除後に
    再実行すること）。

    両ホストの経路は独立に記録される。片方のホストだけを切り替えた場合、
    もう片方のホストの記録は保持される。

    本スクリプトは provisioning、network access、gh CLI の呼び出し、
    credential の取り扱いを行わない。書き込むのは経路の設定ファイルのみである。

    -DryRun を指定すると予定している変更を表示し、何も書き込まずに終了する。

.PARAMETER AgentHosts
    One of: codex, antigravity, both
    切り替えるホスト。Codex のみ / Antigravity のみ / 両方。

.PARAMETER Route
    One of: plugin, gh
    設定する実行経路。plugin はホストの GitHub プラグイン経由、gh は gh CLI 経由。
    既定値はなく、省略した場合は実行しない（使い方を表示して終了する）。

.PARAMETER DryRun
    Switch. 予定している変更を表示し、設定ファイルは書き込まない。

.EXAMPLE
    ./scripts/switch-github-route.ps1 -AgentHosts codex -Route gh
    Codex を gh CLI 経由へ切り替える（Antigravity の記録は保持される）。

.EXAMPLE
    ./scripts/switch-github-route.ps1 -AgentHosts both -Route gh
    Codex と Antigravity の両方を gh CLI 経由へ切り替える。

.EXAMPLE
    ./scripts/switch-github-route.ps1 -AgentHosts antigravity -Route plugin
    Antigravity を GitHub プラグイン経由へ戻す。

.EXAMPLE
    ./scripts/switch-github-route.ps1 -AgentHosts codex -Route gh -DryRun
    変更内容の予測のみを表示し、書き込みは行わない。
#>

#Requires -Version 7.0

param(
    [string]$AgentHosts,

    [string]$Route,

    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

# 切り替え先リポジトリの解決（導入系公開入口と同じ。カレントディレクトリを対象とする）。
$RepoRoot = $PWD.Path
$ConfigPath = Join-Path $RepoRoot '.agentdev\config\github-route.json'
$ValidRoutes = @('plugin', 'gh')

# --- Helper Functions ---

function Show-Usage {
    Write-Host '使い方: ./scripts/switch-github-route.ps1 -AgentHosts codex|antigravity|both -Route plugin|gh [-DryRun]'
    Write-Host ''
    Write-Host '例:'
    Write-Host '  ./scripts/switch-github-route.ps1 -AgentHosts codex -Route gh'
    Write-Host '  ./scripts/switch-github-route.ps1 -AgentHosts both -Route gh'
    Write-Host '  ./scripts/switch-github-route.ps1 -AgentHosts antigravity -Route plugin'
    Write-Host ''
    Write-Host 'consumer リポジトリのルート（.git がある場所）で実行してください。'
    Write-Host '-Route に既定値はなく、利用者の明示判断でのみ切り替わります。'
}

function Get-RouteConfigFromText {
    <#
    .SYNOPSIS
        経路設定ファイルの内容を検査し、ホストごとの経路を返す。
    .DESCRIPTION
        先頭の UTF-8 BOM は許容する（ReadAllText が検出して除去する）。空・空白のみの
        内容、不正な JSON、オブジェクト以外、未知のキー、plugin / gh 以外の値は不正と
        する。キーの欠落は plugin 扱いであるため受理する。判定規則は共通 Tool 側の
        設定読み取り（src/common/tools/agentdev-gh/github-route.ts）と同じである。
    #>
    param([string]$Text)

    $invalid = @{ Ok = $false; Reason = $null }
    if ([string]::IsNullOrWhiteSpace($Text)) {
        $invalid.Reason = '内容が空です'
        return $invalid
    }
    try {
        $parsed = $Text | ConvertFrom-Json
    } catch {
        $invalid.Reason = "JSON として解釈できません（$($_.Exception.Message)）"
        return $invalid
    }
    if ($null -eq $parsed -or $parsed -isnot [pscustomobject]) {
        $invalid.Reason = 'JSON オブジェクトではありません'
        return $invalid
    }
    foreach ($name in $parsed.PSObject.Properties.Name) {
        if ($name -notin @('codex', 'antigravity')) {
            $invalid.Reason = "未知のキーがあります: $name"
            return $invalid
        }
    }
    $routes = @{}
    foreach ($hostName in @('codex', 'antigravity')) {
        $prop = $parsed.PSObject.Properties[$hostName]
        if ($null -eq $prop) {
            $routes[$hostName] = 'plugin'
            continue
        }
        if ($prop.Value -isnot [string] -or $prop.Value -notin $ValidRoutes) {
            $invalid.Reason = "${hostName} の値が不正です: $($prop.Value)"
            return $invalid
        }
        $routes[$hostName] = $prop.Value
    }
    return @{ Ok = $true; Routes = $routes }
}

# --- Main ---

# 誤実行防止: 実行ディレクトリ直下に src/opencode/ が存在する場合、AgentDevFlow
# 本体リポジトリ（self-hosting 構成）と判定し、変更前に停止して案内する。
# consumer ではチェックアウトは .agentdev-plugin/ 配下にあり、実行ディレクトリ直下に
# src/opencode/ は存在しない（判定方式は導入系公開入口と同じ）。
if (Test-Path -LiteralPath (Join-Path $RepoRoot 'src\opencode')) {
    Write-Host 'このスクリプトは AgentDevFlow を導入するリポジトリ（consumer）専用です。現在のフォルダは AgentDevFlow 本体リポジトリです。本体リポジトリの GitHub 実行経路の切替は不要です。構成の同期には scripts/self-sync.ps1 を使ってください。'
    exit 1
}

# 使い方の確認（-Route に既定値はない。ホストと経路の両方が指定されたときだけ実行する）
if (-not $AgentHosts -or -not $Route) {
    Write-Host '[ERROR] -AgentHosts と -Route は必須です。'
    Show-Usage
    exit 1
}

if ($AgentHosts -notin @('codex', 'antigravity', 'both')) {
    Write-Host "[ERROR] -AgentHosts には codex、antigravity、both のいずれかを指定してください（指定値: $AgentHosts）。"
    Show-Usage
    exit 1
}

if ($Route -notin $ValidRoutes) {
    Write-Host "[ERROR] -Route には plugin または gh を指定してください（指定値: $Route）。"
    Show-Usage
    exit 1
}

$targetHosts = switch ($AgentHosts) {
    'codex' { @('codex') }
    'antigravity' { @('antigravity') }
    'both' { @('codex', 'antigravity') }
}

# 既存の設定の読み取りと検査（検査に失敗した場合は経路を推定せず停止する）
$routes = @{ codex = 'plugin'; antigravity = 'plugin' }
if (Test-Path -LiteralPath $ConfigPath) {
    try {
        $existingRaw = [System.IO.File]::ReadAllText($ConfigPath)
    } catch {
        Write-Host "[ERROR] GitHub 実行経路の設定ファイルを読めません: $ConfigPath"
        Write-Host "原因: $($_.Exception.Message)"
        Write-Host '設定ファイルを修正するか削除してから再実行してください。何も変更していません。'
        exit 1
    }
    $parsedConfig = Get-RouteConfigFromText -Text $existingRaw
    if (-not $parsedConfig.Ok) {
        Write-Host "[ERROR] GitHub 実行経路の設定ファイルの内容が不正です: $ConfigPath"
        Write-Host "原因: $($parsedConfig.Reason)"
        Write-Host '設定ファイルを修正するか削除してから再実行してください。何も変更していません。'
        exit 1
    }
    $routes = $parsedConfig.Routes
}

# 切り替え後の経路を組み立てる（対象外ホストの記録は保持する）
$newRoutes = @{}
$changedHosts = @()
foreach ($hostName in @('codex', 'antigravity')) {
    $current = $routes[$hostName]
    if ($targetHosts -contains $hostName) {
        $newRoutes[$hostName] = $Route
        if ($current -ne $Route) { $changedHosts += $hostName }
    } else {
        $newRoutes[$hostName] = $current
    }
}

if ($changedHosts.Count -eq 0) {
    foreach ($hostName in $targetHosts) {
        Write-Host "[OK] ${hostName}: すでに $($routes[$hostName]) が記録されているため変更はありません"
    }
    Write-Host '変更はありませんでした。'
    exit 0
}

if ($DryRun) {
    foreach ($hostName in $changedHosts) {
        Write-Host "[DRY-RUN] ${hostName}: $($routes[$hostName]) -> $($newRoutes[$hostName])"
    }
    Write-Host "書き込み予定: $ConfigPath"
    Write-Host 'dry-run のため何も書き込んでいません。'
    exit 0
}

# 設定ディレクトリの作成（欠落時に作る。存在時は変化なし）
$ConfigDir = Split-Path -Parent $ConfigPath
if (-not (Test-Path -LiteralPath $ConfigDir)) {
    try {
        New-Item -ItemType Directory -Path $ConfigDir -Force | Out-Null
    } catch {
        Write-Host "[ERROR] 設定ディレクトリを作成できませんでした: $ConfigDir"
        Write-Host "原因: $($_.Exception.Message)"
        exit 1
    }
}

# 設定ファイルの書き込み（キーは固定順・2スペースインデント・LF・末尾改行・
# UTF-8 BOM なし。同一ディレクトリの一時ファイルへ書いてから置き換えるため、
# 中途半端なファイルが残らない）
$content = '{' + "`n" +
    '  "codex": "' + $newRoutes['codex'] + '",' + "`n" +
    '  "antigravity": "' + $newRoutes['antigravity'] + '"' + "`n" +
    '}' + "`n"
$tempPath = Join-Path $ConfigDir ('.github-route.json.tmp-' + [System.Guid]::NewGuid().ToString('N'))
try {
    [System.IO.File]::WriteAllText($tempPath, $content, (New-Object System.Text.UTF8Encoding($false)))
    Move-Item -LiteralPath $tempPath -Destination $ConfigPath -Force
} catch {
    if (Test-Path -LiteralPath $tempPath) {
        Remove-Item -LiteralPath $tempPath -Force -ErrorAction SilentlyContinue
    }
    Write-Host "[ERROR] 設定ファイルを書き込めませんでした: $ConfigPath"
    Write-Host "原因: $($_.Exception.Message)"
    exit 1
}

foreach ($hostName in $changedHosts) {
    Write-Host "[ACTION] ${hostName}: $($routes[$hostName]) -> $($newRoutes[$hostName]) を記録しました"
}
Write-Host "切替を完了しました: $ConfigPath"
exit 0
