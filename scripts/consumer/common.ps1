<#
.SYNOPSIS
    scripts/install.ps1（consumer 向け公開入口）共有定義モジュール。

.DESCRIPTION
    consumer 向け導入系スクリプトの共通定義（既定リポジトリ URL・ブランチ定数、cwd 安全化、
    チェックアウト未検出時の案内文言）を単一定義として所有する。
    公開入口（scripts/install.ps1）から dot-source され、二重管理を解消する。本モジュール単体では
    実行しない。単体実行を前提としない内部処理であるため scripts/ 直下には配置しない（REQ-050-009）。
    利用者可視挙動の変更を伴わない内部再構成である（DEC-016）。

    スクリプトを `./scripts/` として導入先リポジトリに置く場合は本ファイルも
    同一チェックアウトからコピーすること（スクリプト群の版不一致防止）。
#>

# ADF-COVERS(implementation): REQ-050-009

#Requires -Version 7.0

# 既定の provisioning 先（案内表示用。当モジュールを読むスクリプトは provisioning を行わない）
$ConsumerRepoUrl = 'https://github.com/yogata/agent-dev-flow.git'
$ConsumerDefaultBranch = 'main'

function Assert-ValidConsumerCwd {
    <#
    .SYNOPSIS
        実行ディレクトリが AgentDevFlow 導入先として適切か検査する。
        想定外ディレクトリの場合、即座に停止する（REQ-{NNNN}-{NNN}）。
    #>
    $cwd = $PWD.Path

    # 1. .agentdev-plugin/ 配下（チェックアウト配置先、REQ-009-041）
    if ($cwd -match '[\\/]\.agentdev-plugin([\\/]|$)') {
        Write-Host "現在のフォルダ: $cwd。このフォルダは agent-dev-flow のチェックアウト配置先です。1つ上のフォルダへ移動してください。AgentDevFlow をインストールしたいリポジトリの一番上のフォルダ（.git がある場所）で実行してください。"
        exit 1
    }

    # 2. src/opencode/ 配下（原本領域）
    if ($cwd -match '[\\/]src[\\/]opencode([\\/]|$)') {
        Write-Host "現在のフォルダ: $cwd。このフォルダは agent-dev-flow の原本領域です。AgentDevFlow をインストールしたいリポジトリの一番上のフォルダ（.git がある場所）で実行してください。"
        exit 1
    }

    # 3. .opencode/ 配下（実行時領域）
    if ($cwd -match '[\\/]\.opencode([\\/]|$)') {
        Write-Host "現在のフォルダ: $cwd。このフォルダは OpenCode の実行時領域です。AgentDevFlow をインストールしたいリポジトリの一番上のフォルダ（.git がある場所）で実行してください。"
        exit 1
    }

    # 4. .git 無し（Git リポジトリでない）
    if (-not (Test-Path -LiteralPath (Join-Path $cwd '.git'))) {
        Write-Host "現在のフォルダ: $cwd。このフォルダは Git リポジトリではありません。AgentDevFlow をインストールしたいリポジトリの一番上のフォルダ（.git がある場所）で実行してください。"
        exit 1
    }
}

function Show-ConsumerCheckoutGuidance {
    <#
    .SYNOPSIS
        チェックアウト未検出時の案内。provisioning（clone、fetch、reset）も network access も
        代行実行しない（AG-001/REQ-009-046、DEC-016）。チェックアウトの取得は利用者の責務。

    .PARAMETER PluginDir
        チェックアウト配置先ディレクトリ名。

    .PARAMETER SourceDir
        期待される src/opencode/ の絶対パス（期待される状態行の表示用）。

    .PARAMETER CloneCommandLine
        方法1 に表示する git clone コマンド行（呼び出し元スクリプトで組み立てる）。

    .PARAMETER ZipNoteLines
        方法2 の ZIP 配置手順に続く補足行群（先頭インデント込み、呼び出し元スクリプト固有の行）。
    #>
    param(
        [string]$PluginDir,
        [string]$SourceDir,
        [string]$CloneCommandLine,
        [string[]]$ZipNoteLines = @()
    )
    $repoWebUrl = $ConsumerRepoUrl -replace '\.git$', ''
    Write-Host "[ERROR] 利用可能なチェックアウトが見つかりません。usable checkout 判定（$PluginDir/src/opencode/ の存在）に失敗しました。"
    Write-Host ''
    Write-Host 'このスクリプトは provisioning（clone、fetch、reset）と network access を行いません（REQ-009-046、DEC-016）。'
    Write-Host '以下のいずれかで agent-dev-flow のチェックアウトを用意してから再実行してください。'
    Write-Host ''
    Write-Host '方法1: git clone でチェックアウトを用意する'
    Write-Host "  $CloneCommandLine"
    Write-Host ''
    Write-Host '方法2: ソース ZIP を取得して展開する'
    Write-Host "  1. $repoWebUrl を開く"
    Write-Host '  2. [Code] ボタン → [Download ZIP] でソース ZIP をダウンロード'
    Write-Host "  3. ZIP を展開し、中身（src/、scripts/ 等）を $PluginDir/ 直下に配置"
    foreach ($noteLine in $ZipNoteLines) {
        Write-Host "  $noteLine"
    }
    Write-Host ''
    Write-Host "期待される状態: $SourceDir が存在すること"
    exit 1
}
