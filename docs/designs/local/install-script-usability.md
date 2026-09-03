---
title: 導入スクリプトの使いやすさ詳細
status: accepted
created: 2026-08-02
updated: 2026-09-03
---
<!-- ADF-COVERS(implementation): REQ-009-001, REQ-009-003, REQ-009-004, REQ-009-005, REQ-009-040, REQ-009-041, REQ-009-042, REQ-009-043, REQ-009-044, REQ-009-046, REQ-009-047, REQ-009-048, REQ-009-049 -->
<!-- ADF-COVERS(implementation): REQ-009-040, REQ-009-041, REQ-009-042, REQ-009-043, REQ-009-044 -->

# 導入スクリプトの使いやすさ詳細

本 Design は REQ-009（配布基盤と導入モデル）の要件行 REQ-009-040〜043 を具体化する、
導入系公開入口（scripts/install.ps1、scripts/self-sync.ps1）の使いやすさ詳細を定義する。
install.ps1 -Mode check は旧状態確認専用スクリプト（check-consumer-opencode.ps1）の検査能力を包含する（REQ-050-004）。

## 対話ウィザード

### scripts/install.ps1

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

状態確認（Q1 の 3）は旧状態確認専用スクリプト（check-consumer-opencode.ps1）から
`-Mode check` へ統合された導線である（REQ-009-040、REQ-050-004）。統合後も検査能力の
欠落はない（「install.ps1 -Mode check の検査カタログ」参照）。

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

### scripts/self-sync.ps1

引数なし起動時に以下のウィザードを起動する。

- Q1 目的:
  - 1) 同期実行 → apply
  - 2) 乖離確認 → check
  - 3) 変更予測 → dry-run

## dry-run/check/apply の技術的差

3モードの違いは「検証のみ（check）/ 変更予測（dry-run）/ 実行（apply）」として定義する。
`scripts/install.ps1` と `scripts/self-sync.ps1` の両公開入口が同一のモード構成を提供する（REQ-050-002、REQ-050-003）。
いずれのモードも provisioning（clone、fetch、reset）と network access を行わず、
チェックアウト済みの .agentdev-plugin/ を前提に動作する（REQ-009-046、REQ-050-013）。

| モード | ファイル変更 |
|---|---|
| check | しない（検証のみ） |
| dry-run | しない（変更予測のみ） |
| apply | する（実行） |

- scripts/install.ps1: check と dry-run は consumer の管理対象ファイルを変更しない。apply は冪等な導入・再同期を行う（REQ-050-005）
- scripts/self-sync.ps1: check と dry-run は同期対象を変更しない。apply は本体原本と `.opencode/` 配置先の同期を行う（REQ-050-005）

### stale 管理投影物の廃止時クリーンアップと同期完了条件

両公開入口の同期は、正本と配置先の ADF 管理対象投影物の対応を次の状態へ分類する（REQ-058）。

1. 正本に存在し配置先に存在しないものは追加対象とする
2. 正本と配置先の対応が不正なものは修復対象とする
3. 配置先に存在するが正本の管理対象から外れたものは削除対象とする。これには、正本から削除された管理対象 junction、配布・投影対象から明示的に除外されたことにより管理対象から外れた管理対象物、正本側の対象消滅により不要となる Plugin loader shim 等の ADF 生成物を含む
4. ADF 管理対象外の成果物は削除対象にしない。ADF 管理物であることを確定できない成果物は自動削除せず、非破壊的に扱う

各モードはこの分類に対して次の役割だけを担う。

- `check` は上記の乖離を検出・報告するだけで変更しない
- `dry-run` は `apply` が実施する追加・修復・削除を予測表示するだけで変更しない
- `apply` のみが実際の追加・修復・削除を実行する（REQ-050-015）

`apply` は削除対象をすべて処理し、一部だけを残した状態で正常終了しない。削除処理に失敗した場合は成功したものとして扱わず、処理失敗が利用者に判別できる終了結果とする。stale 管理物が存在しない状態での `apply` 再実行は不要な変更を発生させない。

`apply` 完了後、同一条件で `check` を再実行した際に処理対象となった乖離が残存しないことを同期完了条件とする。最終 `check` が正常状態へ収束しない場合は再同期完了とは判定しない。

archive installer（junction 方式ではない）は本契約の直接対象外とし、同等の収束契約が必要かどうかの評価を本契約の実装対象に含めない。

REQ-009-042 が要求するヘルプの3モード説明もこの定義に従い、clone 軸の説明を含まない。

## install.ps1 -Mode check の検査カタログ

`scripts/install.ps1 -Mode check` は、旧状態確認専用スクリプト（scripts/check-consumer-opencode.ps1）が提供していた検査能力を包含する（REQ-050-004）。
能力の欠落がないことを確認可能な形式の継承一覧を次に示す。

| 検査能力 | 旧 check-consumer-opencode.ps1 | 旧 install.ps1 -Mode check | 統合後 install.ps1 -Mode check |
|---|---|---|---|
| 失効シンボリックリンク・リンク切れ検出（REQ-009-005） | 提供していた | 提供していた | 継承する |
| 配置先リンク先不整合検出（REQ-009-005） | 提供していた | 提供していた | 継承する |
| junction 解決先一致（wrong target）検出 | 提供していた | 提供していた | 継承する |
| リポジトリ種別判定と報告（runtime-package-boundary のリポジトリ種別判定基準） | 提供していた | 提供していた | 継承する |
| チェックアウト検証（usable checkout 判定、REQ-009-047/048） | 提供していた | 提供していた | 継承する |
| local mode リンク状態検出（consumer-generated 判定） | 提供していた | 提供していた | 継承する |
| 版（commit/branch）報告（.git 存在時のみ、不在時 unknown。REQ-009-048） | 提供していた | 提供していなかった | 継承する |
| orphan 検出（管理対象から外れた agentdev 配置物の検出） | 提供していた | 提供していなかった | 統合により新たに含める |

install.ps1 -Mode check は旧来の install における check が含めなかった orphan 検出を、統合により新たに含める。
check は管理対象ファイルを変更しない（REQ-050-005）。

## cwd 安全化

### 停止条件

`scripts/install.ps1` は、実行ディレクトリが
以下のいずれかの場合、即座に停止する。

1. .git が存在しない（Git リポジトリでない）
2. .agentdev-plugin/ 配下（チェックアウト配置先）
3. src/opencode/ 配下（原本領域）
4. .opencode/ 配下（実行時領域）

`scripts/self-sync.ps1` は $PSScriptRoot の親に src/opencode が存在しない場合、
本体リポジトリ外での誤実行として停止する。

### 停止メッセージ形式

install.ps1 の停止メッセージ形式:

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
このスクリプトは AgentDevFlow 本体リポジトリ専用です。<cwd> には src\opencode がありません。導入先リポジトリでは scripts/install.ps1 を使ってください。
```

### 誤実行防止（リポジトリ種別判定）の案内メッセージ

cwd 安全化（REQ-009-041）とは別軸の誤実行防止として、両公開入口は実行対象環境のリポジトリ種別を機械判定し、誤った環境では変更前に停止して適切な入口を案内する（REQ-050-006）。判定材料と手順は runtime-package-boundary Design「誤実行防止の環境判定方式」が所有し、本節は案内メッセージ形式を定める。

scripts/install.ps1 を AgentDevFlow 本体リポジトリで実行した場合の停止メッセージ:

```
このスクリプトは AgentDevFlow を導入するリポジトリ（consumer）専用です。現在のフォルダは AgentDevFlow 本体リポジトリです。本体リポジトリでは scripts/self-sync.ps1 を使ってください。
```

scripts/self-sync.ps1 を consumer リポジトリで実行した場合の停止メッセージは上記 sync-self の停止メッセージ形式に従う。

いずれの停止も管理対象ファイルを変更しない（REQ-050-006）。

## -LocalMode の判断基準

GitHub Issue/PR を使わずローカルIssue（.agentdev/issues/）で運用する環境
（ローカル版 OpenCode）では -LocalMode を指定する。

## 上級者向けオプション

-PluginDir はチェックアウト配置先を変更する上級者向けオプションであり、通常は指定不要。
-RepoUrl と -Branch は provisioning を行わない本モデルで廃止しており、指定した場合は
パラメータエラーで拒否される。

### scripts/install.ps1

- -PluginDir: チェックアウト配置先ディレクトリ名（既定: .agentdev-plugin）
- -LocalMode: ローカル版 link 構成（「-LocalMode の判断基準」参照）

### scripts/self-sync.ps1

上級者向けオプションは現在なし（本スクリプトは本体専用のため）。

## #Requires と comment-based help の両立

`scripts/install.ps1` と `scripts/self-sync.ps1` の
`#Requires` ディレクティブ配置と comment-based help 解析位置の両立仕様を明示する。
REQ-009-044 で要求される「#Requires ディレクティブと comment-based help 解析を両立すること」を実現する。
旧状態確認専用スクリプトは scripts/install.ps1 -Mode check へ統合済みであるため、両立仕様の対象は2本の公開入口である。

### 課題

公開入口2本の `#Requires` ディレクティブが comment-based help 解析を阻害する問題がある。
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

- 対象: scripts/install.ps1、scripts/self-sync.ps1 の
  使いやすさ詳細（ウィザード、cwd 検査、ヘルプ、上級者向けオプション、検査カタログ、誤実行防止案内）
- 対象外: junction 作成、clone、orphan 検出、VERIFY 等の核心ロジック
  （runtime-package-boundary.md 参照）
