---
title: 導入スクリプトの使いやすさ詳細
status: draft
created: 2026-08-02
updated: 2026-08-15
---
<!-- ADF-COVERS(implementation): REQ-009-001, REQ-009-003, REQ-009-004, REQ-009-005, REQ-009-040, REQ-009-041, REQ-009-042, REQ-009-043, REQ-009-044, REQ-009-046, REQ-009-047, REQ-009-048, REQ-009-049 -->
<!-- ADF-COVERS(implementation): REQ-009-040, REQ-009-041, REQ-009-042, REQ-009-043, REQ-009-044 -->

# 導入スクリプトの使いやすさ詳細

本 Design は REQ-009（配布基盤と導入モデル）の要件行 REQ-009-040〜043 を具体化する、
導入系スクリプト（install-consumer-opencode.ps1、check-consumer-opencode.ps1、
sync-self-opencode.ps1）の使いやすさ詳細を定義する。

## 対話ウィザード

### install-consumer-opencode.ps1

引数なし起動時（-Mode 未指定）に以下のウィザードを起動する。Q1 目的は dry-run/check/apply
の違いを併記する。ウィザード文言はチェックアウト済み前提の案内とし、「clone して実行」系の
表現を使用しない。

- Q1 目的:
  - 1) 新規インストール → apply
  - 2) 更新・再同期 → apply
  - 3) 状態確認（検証のみ）→ check
  - 4) 変更予測（変更しない）→ dry-run
- Q2 環境:
  - 1) GitHub 版（通常）→ $LocalMode = $false
  - 2) ローカル版（GitHub Issue/PR を使わずローカルファイルで運用）→ $LocalMode = $true

### チェックアウト未検出時のエラーメッセージ

チェックアウト配置先に src/opencode/ が存在しない場合、install スクリプトはエラー停止し、
clone コマンド例とソース ZIP 取得手順を案内表示する（REQ-009-047）。
案内には次を含める。

- clone コマンド例（git clone によるチェックアウト配置）
- ソース ZIP の取得手順（GitHub ソースアーカイブの取得と展開）
- ZIP 展開時のディレクトリ配置に関する注意: 展開で生じる agent-dev-flow-<ref>/ の一段ネストを
  避け、.agentdev-plugin/src/opencode/ となる配置を指示する
- scripts/ は .agentdev-plugin/ と同一チェックアウトからコピーする案内（スクリプトと
  チェックアウトの版不一致の防止）

### sync-self-opencode.ps1

引数なし起動時に以下のウィザードを起動する。

- Q1 目的:
  - 1) 同期実行 → apply
  - 2) 乖離確認 → check
  - 3) 変更予測 → dry-run

### check-consumer-opencode.ps1

Mode を持たないため対象外。

## dry-run/check/apply の技術的差

3モードの違いは「検証のみ（check）/ 変更予測（dry-run）/ 実行（apply）」として定義する。
いずれのモードも provisioning（clone、fetch、reset）と network access を行わず、
チェックアウト済みの .agentdev-plugin/ を前提に動作する（REQ-009-046）。

| モード | ファイル変更 |
|---|---|
| check | しない（検証のみ） |
| dry-run | しない（変更予測のみ） |
| apply | する（実行） |

REQ-009-042 が要求するヘルプの3モード説明もこの定義に従い、clone 軸の説明を含まない。

## cwd 安全化

### 停止条件

install-consumer-opencode.ps1 と check-consumer-opencode.ps1 は、実行ディレクトリが
以下のいずれかの場合、即座に停止する。

1. .git が存在しない（Git リポジトリでない）
2. .agentdev-plugin/ 配下（チェックアウト配置先）
3. src/opencode/ 配下（原本領域）
4. .opencode/ 配下（実行時領域）

sync-self-opencode.ps1 は $PSScriptRoot の親に src/opencode が存在しない場合、
本体リポジトリ外での誤実行として停止する。

### 停止メッセージ形式

install と check の停止メッセージ形式:

```
現在のフォルダ: <cwd の絶対パス>。<理由>。AgentDevFlow をインストールしたいリポジトリの一番上のフォルダ（.git がある場所）で実行してください。
```

理由の具体文:

| 条件 | 理由文 |
|---|---|
| .git 無し | このフォルダは Git リポジトリではありません |
| .agentdev-plugin/ 内 | このフォルダは agent-dev-flow のチェックアウト配置先です。1つ上のフォルダへ移動してください |
| src/opencode/ 内 | このフォルダは agent-dev-flow の原本領域です |
| .opencode/ 内 | このフォルダは OpenCode の実行時領域です |

sync-self の停止メッセージ:

```
このスクリプトは AgentDevFlow 本体リポジトリ専用です。<cwd> には src\opencode がありません。導入先リポジトリでは install-consumer-opencode.ps1 を使ってください。
```

## -LocalMode の判断基準

GitHub Issue/PR を使わずローカルファイル（.agentdev/cases/）で運用する環境
（ローカル版 OpenCode）では -LocalMode を指定する。

## 上級者向けオプション

-PluginDir はチェックアウト配置先を変更する上級者向けオプションであり、通常は指定不要。
-RepoUrl と -Branch は provisioning を行わない本モデルで廃止しており、指定した場合は
パラメータエラーで拒否される。

### install-consumer-opencode.ps1

- -PluginDir: チェックアウト配置先ディレクトリ名（既定: .agentdev-plugin）

### check-consumer-opencode.ps1

- -PluginDir: チェックアウト配置先ディレクトリ名

### sync-self-opencode.ps1

上級者向けオプションは現在なし（本スクリプトは本体専用のため）。

## #Requires と comment-based help の両立

install-consumer-opencode.ps1、check-consumer-opencode.ps1、sync-self-opencode.ps1 の
`#Requires` ディレクティブ配置と comment-based help 解析位置の両立仕様を明示する。
REQ-009-044 で要求される「#Requires ディレクティブと comment-based help 解析を両立すること」を実現する。

### 課題

運用スクリプト3本の `#Requires` ディレクティブが comment-based help 解析を阻害する問題がある。
PowerShell の comment-based help はスクリプトファイル先頭に配置する必要があり、先頭行に
`#Requires` ディレクティブを置くとヘルプ解析位置が「ファイル先頭」の条件を満たさず、
`Get-Help` が comment-based help を検出しない（Synopsis がパラメータ署名のフォールバック表示になり、
Description、Parameters、Examples が全て空になる）。

### 両立仕様

スクリプトファイルの先頭要素の配置順序を以下の通り定める。

1. comment-based help ブロック（`<# .SYNOPSIS ... #>`）をファイル先頭に配置する
2. comment-based help ブロックの直後に `#Requires` ディレクティブを配置する
3. `#Requires` の直後に `param(...)` ブロックを配置する

```
<#
.SYNOPSIS
    ...
.DESCRIPTION
    ...
#>

#Requires -Version 7.0

param(
    ...
)
```

### 根拠

PowerShell の comment-based help 仕様は、スクリプトヘルプが「スクリプトファイルの先頭」に
配置され、前方に許容されるのはコメントと空行のみと定めている。`#Requires` は directive であり
コメントではないため、comment-based help より前に置くとヘルプ解析位置の条件を満たさなくなる。
一方 `#Requires` は行頭にあればスクリプト内の任意の位置に配置可能であり、comment-based help の
後に置いても runtime の version 要求、module 要求等の効力は変わらない。両立のための最小の
配置変更は「comment-based help を先頭に移動し、`#Requires` をその直後に置く」である。

### 検証方法

各スクリプトで `Get-Help <script-path> -Detailed` を実行し、以下を確認する。

- Synopsis に `.SYNOPSIS` の内容が表示される（パラメータ署名のフォールバック表示ではない）
- Description、Parameters、Examples の各セクションが空でない

あわせて `#Requires` の runtime 効力が維持されていることを確認する。具体的には `#Requires -Version`
のバージョン番号を現行 PowerShell より高い値に一時置換したコピーを実行し、PowerShell の
「requires PowerShell version ...」エラーが発生することを確認する（本番ファイルは `7.0` を維持）。

## 適用範囲

- 対象: install-consumer-opencode.ps1、check-consumer-opencode.ps1、
  sync-self-opencode.ps1 の使いやすさ詳細（ウィザード、cwd 検査、ヘルプ、上級者向けオプション）
- 対象外: junction 作成、clone、orphan 検出、VERIFY 等の核心ロジック
  （runtime-package-boundary.md 参照）
