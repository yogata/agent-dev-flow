# 適用プロジェクトへの導入モデル

<!-- ADF-COVERS(implementation): REQ-050-014, REQ-009-051, REQ-009-052, REQ-093-002, REQ-094-001, REQ-094-002, REQ-094-004, REQ-094-005, REQ-094-010, REQ-099-010, REQ-099-011, REQ-099-012 -->

AgentDevFlow を適用プロジェクトに導入する際のモデルを定義する（REQ-009）。

## リポジトリ種別（Repo Type）

AgentDevFlow は5種のリポジトリ種別を定義する（詳細は Design [実行時パッケージ境界](../designs/local/runtime-package-boundary.md)）。
本ガイドでは導入観点から各々を説明する。

| 種別 | 説明 | `.opencode/` の意味 | 例 |
|------|------|---------------------|-----|
| **本体リポジトリ**（self-hosting） | AgentDevFlow 本体開発リポジトリ。原本と配置先が同一リポジトリに存在 | `.opencode/` = 実行時の配置先（共通正本 `src/common/` と OpenCode 接続領域 `src/opencode/` へのジャンクション投影）。明示指定時は Senpi 接続領域 `src/senpi/` を `.senpi/` へ投影可能 | agent-dev-flow |
| **consumer-with-agentdev** | AgentDevFlow を導入する製品リポジトリ。AgentDevFlow 提供 skill/command を利用 | `.opencode/` = プロジェクト独自設定の入口 + AgentDevFlow 提供 command/skill の実行時の位置。配置対象ホスト（OpenCode / Senpi / 両方）を選択でき、Senpi 選択時は `.senpi/` にも投影される | 各種製品開発リポジトリ |
| **consumer-local** | AgentDevFlow を利用しない OpenCode プロジェクト。独自 command/skill のみ | `.opencode/` = プロジェクト独自設定専用。`agentdev` 名前空間は使用しない | 実験的リポジトリ |
| **consumer-generated** | ローカル版 OpenCode を導入する利用側リポジトリ。GitHub Issue/PR を使わない個人利用環境向け | `.opencode/` = link mode により接続された AgentDevFlow 実行時の位置。Custom Tool `agentdev_gh` の実行ディレクトリ（`.opencode/tools/agentdev-gh/`）だけ `src/opencode-local/agentdev-gh/` から差し替え | 個人利用環境のローカルリポジトリ |
| **plugin-future** | 将来の plugin/npm/package 配布形態（現在は未対応） | `.opencode/` = plugin が管理する実行時の位置 | （将来） |

## `.opencode/` の意味の違い

### 本体リポジトリ（AgentDevFlow 本体）

```
.opencode/           → 実行時の配置先（選択的ジャンクション。全体 junction ではない）
  commands/agentdev/  → ジャンクション → src/common/commands/agentdev/
  skills/agentdev-*/  → ジャンクション → src/common/skills/agentdev-*/
  tools/agentdev-*/   → ジャンクション → src/common/tools/agentdev-*/
  plugins/agentdev-*/ → ジャンクション → src/opencode/plugins/agentdev-*/
src/common/          → 共通正本（host 非依存の業務契約・本文、template、Tool engine、guard 共通判定）
src/opencode/        → OpenCode 接続領域の原本（plugin/hook 正本）
src/senpi/           → Senpi 接続領域の原本（配置契約。明示指定時に .senpi/ へ投影）
scripts/
  self-sync.ps1      → AgentDevFlow 本体リポジトリ用同期スクリプト（self-hosting 向け公開入口）
```

- 共通正本・原本の編集は `src/common/` と `src/opencode/` で行う
- `.opencode/` は ジャンクション/symlink による実行時の配置先
- `scripts/self-sync.ps1` で正本↔配置先の同期を管理する（`-Hosts` 未指定時は現在の配置対象を維持。明示指定時のみ Senpi 投影を含められる）

### 適用プロジェクト（consumer-with-agentdev）

```
.agentdev-plugin/                → agent-dev-flow のチェックアウト配置先（git clone またはソース ZIP 展開）
  src/common/                    → 共通正本（commands・skills・tools の投影元）
  src/opencode/                  → OpenCode 接続領域（plugins の投影元）
  src/senpi/                     → Senpi 接続領域（Senpi 配置対象選択時の投影元。配置契約は同 README）
  scripts/install.ps1            → 適用プロジェクト用公開入口（install・check・dry-run。配置対象ホスト選択を含む）
  scripts/consumer/              → install.ps1 の内部処理（単体実行しない）
.opencode/
  commands/agentdev/              → ジャンクション → .agentdev-plugin/src/common/commands/agentdev/
  commands/{local}/               → プロジェクト独自コマンド（実ディレクトリ）
  skills/agentdev-*/              → ジャンクション → .agentdev-plugin/src/common/skills/agentdev-*/
  skills/{local}-*/               → プロジェクト独自スキル（実ディレクトリ）
.senpi/                           → Senpi 配置対象選択時のみ作成。.agentdev-plugin/src/senpi/ 配下の
                                     各サブディレクトリへの個別ジャンクション投影
```

- `.agentdev-plugin/` に agent-dev-flow のチェックアウトを配置する（git clone またはソース ZIP 展開、`.agentdev/` ではない）
- `.agentdev/` は AgentDevFlow のドメイン状態用（Intake, Learning, Backlog 等）として予約
- `.opencode/` は AgentDevFlow 提供 command/skill とプロジェクト独自設定の混在場所
- 配置対象ホスト（OpenCode のみ / Senpi のみ / 両方）は `install.ps1 -Hosts` または対話ウィザードで選択する。`-Hosts` 未指定の更新では現在の配置対象が維持され、明示指定時のみ変更される（REQ-099-010）。ホスト別の投影（`.opencode/` と `.senpi/`）は管理範囲が分離され、片方の更新・除去は他方を壊さない（REQ-099-012）
- AgentDevFlow 提供ファイルは ジャンクション（更新時にチェックアウトを更新すれば自動反映）
- プロジェクト独自ファイルは直接管理する

### 非 AgentDevFlow プロジェクト（consumer-local）

```
.opencode/
  commands/{local}/   → プロジェクト独自コマンドのみ
  skills/{local}-*/   → プロジェクト独自スキルのみ
```

- AgentDevFlow の名前空間を使用しない
- 自由に `.opencode/` を管理する

### ローカル版 OpenCode 導入（consumer-generated）

GitHub Issue/PR を使わない個人利用環境向けのリポジトリ種別。
通常版と同じ link mode（`.opencode/` 配下を src 配下へ接続）で導入する。
Custom Tool `agentdev_gh` の実行ディレクトリ（`.opencode/tools/agentdev-gh/`）だけを `src/opencode-local/agentdev-gh/`（Local 実装）から差し替える（REQ-009、REQ-011-006）。
詳細な接続フロー、link target 確認は Design [実行時パッケージ境界](../designs/local/runtime-package-boundary.md) を参照。

```
.agentdev-plugin/                → agent-dev-flow のチェックアウト配置先（git clone またはソース ZIP 展開）
  src/common/                    → 共通正本（commands・skills・tools の投影元）
  src/opencode/                  → OpenCode 接続領域（plugins の投影元）
  src/opencode-local/            → ローカル版 link 先原本領域（agentdev-gh のみ）
    README.md                    → ローカル版 link 設定の実行手順
    agentdev-gh/                 → Custom Tool agentdev_gh の Local 実装（ローカルIssueの読み書き）
.opencode/
  commands/agentdev/             → link → src/common/commands/agentdev/
  skills/agentdev-*/             → link → src/common/skills/agentdev-*/
  tools/agentdev-gh/             → link → src/opencode-local/agentdev-gh/（Local 実装）
.agentdev/
  issues/                        → ローカルIssue（Issue / PR 相当の永続情報）
```

- **link による接続**: command/skill を生成せず、`.opencode/` 配下を正本配下へ link で接続する
- **agentdev_gh 実装の差し替え**: agentdev-gh 以外は `src/common/` 配下（commands/skills/tools）と `src/opencode/` 配下（plugins）へ接続する。Custom Tool `agentdev_gh` の実行ディレクトリ（`.opencode/tools/agentdev-gh/`）だけを `src/opencode-local/agentdev-gh/` へ接続する（REQ-011-006）
- **link target 確認**: link 設定前に `.opencode/` 配下の各パスが意図した link target へ解決されることを確認し、意図しない link target の場合は link 設定を停止する
- **リポジトリ管理対象外**: link により接続された `.opencode/commands/agentdev/`、`.opencode/skills/agentdev-*/` はリポジトリ管理対象外
- **リポジトリ管理対象**: `.agentdev/issues/` 配下のローカルIssueは Issue/PR 相当の永続情報としてリポジトリ管理対象（REQ-009-026）
- **更新方式**: unlink / relink により行う。`.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/` を全削除して作り直す方式は採らない
- **判定基準**: `.opencode/tools/agentdev-gh/` が `src/opencode-local/agentdev-gh/` への link として解決される場合に consumer-generated と判定される（Design runtime-package-boundary.md）

#### ローカル版セットアップ手順

1. `.agentdev-plugin/` に agent-dev-flow のチェックアウトを用意する（git clone またはソース ZIP 展開）
2. `./.agentdev-plugin/scripts/install.ps1 -Mode apply -LocalMode` を実行し、link 設定を行う（Custom Tool `agentdev_gh` の実行ディレクトリのみ `src/opencode-local/agentdev-gh/` へ接続、それ以外は `src/opencode/` 配下へ接続）
3. 各 link が意図した target へ解決されることを `./.agentdev-plugin/scripts/install.ps1 -Mode check` で確認する（link mode を自動検出して報告する）
4. `.agentdev/issues/` ディレクトリが存在することを確認する（ローカルIssue用）
5. `.gitignore` に link 先（`.opencode/commands/agentdev/`, `.opencode/skills/agentdev-*/`）を追加する

#### ローカル版の更新手順

```powershell
# git clone 環境: agent-dev-flow の最新を取得
cd .agentdev-plugin && git pull && cd ..

# ZIP 展開環境: ソース ZIP を再取得し、.agentdev-plugin/ を差し替える

# unlink / relink により link を張り直す（全削除して作り直す方式は採らない）
./.agentdev-plugin/scripts/install.ps1 -Mode apply -LocalMode
```

> 詳細な実行手順、制約、link target 確認は `src/opencode-local/README.md`（link 設定の実行エントリポイント）と Design [実行時パッケージ境界](../designs/local/runtime-package-boundary.md)、[ローカルIssue共通スキーマ](../designs/local/local-case-file.md) を参照。

## 予約名（Reserved Names）

| 名前 | 種別 | 使用可能なリポジトリ種別 |
|------|------|---------------------|
| `agentdev` | コマンド名前空間 | `self-hosting`, `consumer-with-agentdev`, `consumer-generated` |
| `agentdev-*` | スキルプレフィックス | `self-hosting`, `consumer-with-agentdev`, `consumer-generated` |
| `.agentdev/` | ドメイン状態ディレクトリ | `self-hosting`, `consumer-with-agentdev`, `consumer-generated` |
| `.agentdev-plugin/` | 適用プロジェクトのチェックアウト配置先 | `consumer-with-agentdev`, `consumer-generated` |

**禁止事項**:
- consumer-local での `agentdev` 名前空間の使用
- consumer-with-agentdev での AgentDevFlow 提供ファイルの直接編集（上書きされる可能性）
- `.agentdev-plugin/` を `.agentdev/` として使用すること（ドメイン状態と競合）
- consumer-generated で link target が意図した src 配下以外へ解決される環境での link 設定実行

docs-check は `repo-agentdev-integrity`（配布対象外スキル）として AgentDevFlow 本体リポジトリでのみ実行される。
適用プロジェクトには配布されない。

## インストール方式の方針

provisioning（チェックアウトの取得）と install 手段（link mode による接続）は別軸である（REQ-009）。
どちらの provisioning 形態でも install 手段は link mode に限られる。
導入方式ポリシーの正規な定義は Design [実行時パッケージ境界](../designs/local/runtime-package-boundary.md) を参照。

### provisioning 形式（チェックアウトの取得）

provisioning は利用者の責務である。
install スクリプトは provisioning（clone、fetch、reset）も network access も行わない。

| 形式 | 対応 | 推奨 | 備考 |
|--------|------|------|------|
| git clone（`.agentdev-plugin/`） | ✅ | **推奨** | git pull で更新できる。check スクリプトの版報告も機能する |
| ソース ZIP 展開（`.agentdev-plugin/`） | ✅ | git clone を優先 | 正規の provisioning 形態だがサポート対象外環境（REQ-009-048）。版は unknown として報告される |

### install 手段

| 方式 | 対応 | 推奨 | 備考 |
|--------|------|------|------|
| ジャンクション + チェックアウト（`.agentdev-plugin/`） | ✅ | **推奨** | 更新が自動反映、原本が単一 |
| 直接コピー | ⚠️ | 非推奨 | 手動更新が必要、乖離のリスク |
| Git サブモジュール | ⚠️ | 検討可能 | 複雑性が増す |
| プラグイン/npm/package | ❌ | 将来対応 | 将来の選択肢 |

> 「ソース ZIP によるチェックアウト供給」と「release archive projection」（REQ-029 が別途定義する配布と検証の投影）は別の概念である（DEC-014）。
> ZIP 展開による provisioning は手動 copy インストールに該当せず、install 手段は link mode に限定される。

### ジャンクションによるインストール（推奨）

`.agentdev-plugin/` にチェックアウトを配置し、ジャンクションで実行時の配置先を作成する。
スクリプトはチェックアウト配下のものを導入先リポジトリのルートから実行する。

```powershell
# 1. provisioning: .agentdev-plugin/ にチェックアウトを用意する（どちらか）
git clone https://github.com/yogata/agent-dev-flow.git .agentdev-plugin
# または: GitHub リポジトリの [Code] → [Download ZIP] でソース ZIP を取得し、
# 展開した中身（src/、scripts/ 等）を .agentdev-plugin/ 直下に配置
# （ZIP 展開で生じる agent-dev-flow-<ref>/ の一段ネストを避け、
#   .agentdev-plugin/src/ 配下が正本レイアウトのまま配置されるようにする）

# 2. インストール（ジャンクション作成。配置対象ホストは対話ウィザードで問われる。
#    新規導入では両ホスト（OpenCode + Senpi）が推奨）
./.agentdev-plugin/scripts/install.ps1 -Mode apply

# 3. 状態確認（link mode 自動検出、版報告、orphan 検出、実行環境診断を含む）
./.agentdev-plugin/scripts/install.ps1 -Mode check

# 4. ドライラン（変更確認）
./.agentdev-plugin/scripts/install.ps1 -Mode dry-run

# 配置対象ホストの明示指定（OpenCode のみ / Senpi のみ / 両方）
./.agentdev-plugin/scripts/install.ps1 -Mode apply -Hosts both
./.agentdev-plugin/scripts/install.ps1 -Mode apply -Hosts opencode
./.agentdev-plugin/scripts/install.ps1 -Mode apply -Hosts senpi
```

### 配置対象ホストの選択（REQ-099-010）

| 選択 | 投影先 | 使い分け |
|------|--------|----------|
| `opencode` | `.opencode/` | OpenCode のみを利用する環境 |
| `senpi` | `.senpi/` | Senpi（OmO Native v5）のみを利用する環境 |
| `both` | `.opencode/` + `.senpi/` | 過渡期に両ホストへ配置する環境。新規導入の推奨 |

- `-Hosts` を省略した場合、現在の配置対象を配置先の状態から検出して維持する。検出不能（新規導入）は `both` となる
- 明示指定（パラメータまたはウィザード選択）した場合のみ配置対象が変更される。選択から外れたホストの ADF 管理投影物は apply で除去対象として報告され、check / dry-run で予測報告される
- 実行環境の CLI（OpenCode / omo 相当）の導入有無による配置対象の自動振分けは行わない。CLI 未導入でも配置は可能で、配置検査（check）と実行環境診断は区別して報告される（REQ-099-011）

> ZIP 展開チェックアウト（`.git` なし）は正規の provisioning 形態だが、サポート対象外の環境である（不具合報告の受け付け対象外、REQ-009-048）。
>
> スクリプトを `./scripts/` として導入先リポジトリに置く場合は、`.agentdev-plugin/` と同一のチェックアウトから scripts/ ディレクトリ全体をコピーする（公開入口 `install.ps1` は内部処理 `scripts/consumer/` に依存する）。

### GitHub repo 設定 deleteBranchOnMerge（必須導入条件）

GitHub Issue/PR を使用するリポジトリ種別では、GitHub repo 設定 `deleteBranchOnMerge=true` を必須の導入条件とする。対象は本体リポジトリ（self-hosting）と適用プロジェクト（consumer-with-agentdev）に限られる。
PR マージ後のリモートブランチ削除は GitHub の自動削除に委譲され、workflow 側のクリーンアップ（case-close）はローカルブランチ・worktree に限定される。

設定手順を次に示す（いずれかの方法で設定する）。

```powershell
# gh CLI による設定
gh repo edit --delete-branch-on-merge
```

- Web UI による設定: リポジトリの Settings → General → Pull Requests で「Automatically delete head branches」を有効化する

確認コマンドを次に示す。

```powershell
# true が出力されることを確認する
gh repo view --json deleteBranchOnMerge
```

- GitHub Issue/PR を使用しないローカル版（consumer-generated）は対象外である
- 導入系スクリプト（`scripts/install.ps1`、`scripts/self-sync.ps1`、`scripts/consumer/`）は network access を行わない契約を維持する。本設定の検証をスクリプトに実装せず、case-open の preflight（Root Case 確立前の読取専用照会）が担う

### AGENTDEV_GH_REPO の起動環境設定

Custom Tool `agentdev_gh` は、GitHub 操作の対象リポジトリ（`owner/name` 形式）を、環境変数 `AGENTDEV_GH_REPO`、未設定時は `gh repo view` の順で解決する。Plugin 側の設定詳細は [agentdev-gh-tool Plugin](../../src/opencode/plugins/agentdev-gh-tool/README.md) の「設定」節を参照。

`gh repo view` による解決は gh CLI の認証とカレントディレクトリのリモートリポジトリに依存するため、gh CLI 未認証やリモート不在のチェックアウトでは解決に失敗する。解決に失敗した場合、`agentdev_gh` の全操作は `config-uninterpretable` として fail-closed で失敗し、failure detail に試行した解決手段、`gh repo view` の終了コードと stderr の要因が診断情報として含まれる。

`gh repo view` で解決できない環境では、gh CLI の認証状態を確認した上で、launcher または `.env` 相当の起動環境に `AGENTDEV_GH_REPO` を設定する。

1. `gh auth status` で gh CLI の認証状態を確認する。未認証の場合は `gh auth login` で認証する
2. launcher（ターミナルや OpenCode の起動スクリプト）または `.env` 相当の起動環境ファイルに `AGENTDEV_GH_REPO` を設定する

```powershell
# 起動環境（launcher / .env 相当）に設定する
$env:AGENTDEV_GH_REPO = "owner/name"   # 例: yogata/agent-dev-flow
```

設定後、OpenCode を再起動し、`agentdev_gh` の操作（例: `issue_list`）が成功することを確認する。

### 投入前の疎通確認

case-auto 等の本格実行に入る前に、軽量な読み取り操作（`issue_read` など）を1回実行し、構造化応答（`ok: true`）が返ることを確認する。疎通確認は投入の前置であり、`agentdev_gh` に依存する workflow の失敗を投入の前に検出するために行う。

疎通確認や本格実行で `config-uninterpretable`、`operation-failed`（stderr 空の非ゼロ終了を含む）、`enforcement-crashed` が繰り返される場合は、起動環境障害の既知事象（known-issues）として [Issue 操作安全性手順](../../src/common/skills/agentdev-issue-management/references/issue-operation-safety.md) の「起動環境障害の known-issues」節で診断・回復・blocked 時の resume 手順を確認する。リポジトリ解決の設定手順は本節と Plugin の設定節が所有し、known-issues 節は障害発生後の診断・回復を所有する（重複しない）。

### 更新手順

更新は provisioning 形式に従う（REQ-009-049）。
install の apply は冪等であり、再実行でジャンクション構成を変化させない。

```powershell
# git clone 環境: agent-dev-flow の最新を取得
cd .agentdev-plugin && git pull && cd ..

# ZIP 展開環境: ソース ZIP を再取得し、.agentdev-plugin/ を差し替える
# （install 再実行の要否は利用者の判断）

# ジャンクションを再同期（新しい skill/command が追加された場合）
./.agentdev-plugin/scripts/install.ps1 -Mode apply
```

apply は冪等であり、再実行で不要な登録を増やさない。`-Hosts` を省略した更新では現在の配置対象が維持されるため、既存環境の通常更新で配置対象が勝手に変わることはない。片方のホスト投影の更新・除去は、他ホスト投影・repo-local 資産（third-party Skill 配置、`.agentdev/extensions/**`）・ユーザー設定（AGENTS.md 等）に影響しない（REQ-099-012）。

### 直接コピーによるインストール（非推奨）

- 初回は手動コピーで動作するが、AgentDevFlow 更新時に再コピーが必要
- docs-check で乖離を検出可能（IR-016）
- ソース ZIP 展開による provisioning はこの方式に該当しない（install 手段は link mode に限定される）

## スクリプトの適用範囲

scripts/ 直下の公開入口は consumer 向け `scripts/install.ps1` と self-hosting 向け `scripts/self-sync.ps1` の2本である（REQ-050）。それ以外の内部処理（`scripts/consumer/`、`scripts/self/` 配下）は単体実行しない。

| スクリプト | 対象リポジトリ種別 | 役割 |
|--------|---------------|------|
| `scripts/self-sync.ps1` | `self-hosting` | `src/common/` + `src/opencode/` → `.opencode/` の同期（apply / check / dry-run）。`-Hosts` 明示指定時は `src/senpi/` → `.senpi/` 投影を含められる（REQ-099-010）。省略時は現在の配置対象を維持 |
| `scripts/install.ps1` | `consumer-with-agentdev`, `consumer-generated` | チェックアウト済み `.agentdev-plugin/` を前提としたジャンクション作成（apply / check / dry-run）。配置対象ホスト（OpenCode のみ / Senpi のみ / 両方）の選択を含む。check は状態確認（link mode 自動検出、版報告は `.git` 存在時のみ、orphan 検出、実行環境診断を含む）を兼ねる |
| （link 設定: `-LocalMode`） | `consumer-generated` | `install.ps1 -Mode apply -LocalMode` が Custom Tool `agentdev_gh` の実行ディレクトリ（`.opencode/tools/agentdev-gh/`）のみ `src/opencode-local/agentdev-gh/` へ接続し、それ以外を正本（`src/common/` 配下 + `src/opencode/plugins/`）へ接続する（REQ-011-006）。決定的な変換ロジックを実装したスクリプトは使用しない |

### 本体リポジトリ（self-hosting）での同期

```powershell
./scripts/self-sync.ps1 -Mode apply   # src/common/ + src/opencode/ → .opencode/ 同期（現在の配置対象を維持）
./scripts/self-sync.ps1 -Mode check   # 乖離の検出（実行環境診断を含む）
./scripts/self-sync.ps1 -Mode dry-run # 変更予測
./scripts/self-sync.ps1 -Mode apply -Hosts both   # Senpi 接続領域（src/senpi/ → .senpi/）を含めて同期
```

本体リポジトリでの Senpi 投影は明示指定時のみ作成される自己ホスト構成であり、対応済みの検証済み組合せ宣言を伴わない（REQ-099-011）。

### 適用プロジェクト（consumer-with-agentdev）でのインストール/確認

```powershell
./.agentdev-plugin/scripts/install.ps1 -Mode apply   # ジャンクション作成（チェックアウト前提。配置対象ホストは省略時は検出維持・新規時は両方）
./.agentdev-plugin/scripts/install.ps1 -Mode check   # 乖離の検出・状態確認（orphan 検出、版報告、実行環境診断を含む）
./.agentdev-plugin/scripts/install.ps1 -Mode dry-run # 変更予測
```

## プロジェクト独自の命名ルール

適用プロジェクトで独自 command/skill を追加する場合:

| ルール | 説明 |
|------|------|
| 名前空間の衝突回避 | `agentdev` および `agentdev-*` は使用不可 |
| kebab-case | skill 名は小文字、数字、ハイフンのみ |
| 意味に基づく命名 | プロジェクト名やドメイン名をプレフィックスに含めることを推奨 |
| 独自ディレクトリ | 独自 skill は `.opencode/skills/{project}-*/` に配置 |

例: プロジェクト `myapp` の場合:
- command: `.opencode/commands/myapp/`
- skill: `.opencode/skills/myapp-deployment/`

## 推奨 .gitignore 設定（適用プロジェクトリポジトリ）

適用プロジェクトリポジトリで推奨される `.gitignore` 設定:

```gitignore
# AgentDevFlow のチェックアウト配置先
.agentdev-plugin/

# AgentDevFlow がジャンクション管理するディレクトリ（インストールスクリプトが自動作成）
.opencode/commands/agentdev/
.opencode/skills/agentdev-*/
.opencode/tools/agentdev-*/
.opencode/plugins/agentdev-*/
.opencode/plugins/agentdev-*.ts
# Senpi 配置対象選択時（-Hosts senpi / both）の投影先
.senpi/
```

`.agentdev/` は AgentDevFlow のドメイン状態（Intake, Learning, Backlog 等）を保持し、git 管理対象であるため gitignore に**含めない**こと。
各コマンドは `.agentdev/` 配下の変更を scoped commit で git に永続化する。
third-party Skill は宣言（`skills.yaml`）に基づく取得機構経由で利用者環境へ配置され、ADF リポジトリ上では Git 管理対象外である（REQ-002）。
Custom Tool（`.opencode/tools/agentdev-*/`）と Plugin / Hook（`.opencode/plugins/agentdev-*/`）も配布種別として gitignore に含める（REQ-052）。
インストーラが生成する Plugin のローダーシム（`.opencode/plugins/agentdev-*.ts`）も投影成果物のため含める。

## 移行ガイド

### 新規適用プロジェクトの導入手順

1. `.agentdev-plugin/` に agent-dev-flow のチェックアウトを用意する（git clone またはソース ZIP 展開）
2. `./.agentdev-plugin/scripts/install.ps1 -Mode apply` を実行（対話ウィザードで配置対象ホストを問われる。新規導入では両ホストが推奨。省略時も `both` が適用される）
3. GitHub repo 設定 `deleteBranchOnMerge=true` を設定し、確認コマンドで `true` を確認する（上記「GitHub repo 設定 deleteBranchOnMerge（必須導入条件）」参照）
4. `./.agentdev-plugin/scripts/install.ps1 -Mode check` で動作確認（配置検査と実行環境診断が区別されて報告される）
5. `.agentdev/` ディレクトリが存在することを確認（Intake/Learning 用）
6. `.gitignore` に推奨エントリを追加（Senpi 選択時は `.senpi/` を含める）

### 既存プロジェクトへの導入手順

1. 既存の `.opencode/` 内容を確認
2. `agentdev` 名前空間との衝突がないことを確認
3. `.agentdev-plugin/` に agent-dev-flow のチェックアウトを用意する（git clone またはソース ZIP 展開）
4. `./.agentdev-plugin/scripts/install.ps1 -Mode apply` でインストール（`-Hosts` 省略時は検出結果に従い、既存配置がなければ両ホスト）
5. `./.agentdev-plugin/scripts/install.ps1 -Mode check` で整合性確認
6. `.gitignore` を更新

### 配置対象ホストの切替手順

配置対象ホストの変更は明示指定でのみ行われる。切替前の実行停止と永続状態確認はユーザーの運用責任である（REQ-099-017）。

```powershell
# 現在の配置対象を確認する（[INFO] Placement targets 行を参照）
./.agentdev-plugin/scripts/install.ps1 -Mode check

# 変更の影響を予測する（選択から外れたホストの管理投影は WOULD REMOVE として報告される）
./.agentdev-plugin/scripts/install.ps1 -Mode dry-run -Hosts opencode

# OpenCode のみへ切替（Senpi の ADF 管理投影物を除去。他ホスト投影・repo-local 資産・ユーザー設定は保護される）
./.agentdev-plugin/scripts/install.ps1 -Mode apply -Hosts opencode

# 両ホストへ（再）導入
./.agentdev-plugin/scripts/install.ps1 -Mode apply -Hosts both
```

除去対象は ADF 管理投影物（正本へのリンク先で確定できる物）に限定され、管理物と確定できない物は除去されず報告のみ行われる。

### 対応を確認した組合せの記録（REQ-099-018）

対応を確認した ADF／adapter／ホスト／OmO 版の組合せ、バックエンド、Command 対応表、導入・切替手順は本ガイドと関連 Design に記録する。導入系スクリプト自身は対応済み宣言を出力せず、対応済みの組合せは検証済みの記録に限定される。試験結果の記録状況（REQ-099-007）は Epic の統合検証成果物を参照すること。
