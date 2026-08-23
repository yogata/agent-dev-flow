# 適用プロジェクトへの導入モデル

<!-- ADF-COVERS(implementation): REQ-050-014 -->

AgentDevFlow を適用プロジェクトに導入する際のモデルを定義する（v2:ADR-011-061~065, v2:ADR-011-072~077）。

## リポジトリ種別（Repo Type）

AgentDevFlow は5種のリポジトリ種別を定義する（詳細は Design [実行時パッケージ境界](../specs/local/runtime-package-boundary.md)）。
本ガイドでは導入観点から各々を説明する。

| 種別 | 説明 | `.opencode/` の意味 | 例 |
|------|------|---------------------|-----|
| **本体リポジトリ**（self-hosting） | AgentDevFlow 本体開発リポジトリ。原本と配置先が同一リポジトリに存在 | `.opencode/` = 実行時の配置先（ジャンクション → `src/opencode/`） | agent-dev-flow |
| **consumer-with-agentdev** | AgentDevFlow を導入する製品リポジトリ。AgentDevFlow 提供 skill/command を利用 | `.opencode/` = プロジェクト独自設定の入口 + AgentDevFlow 提供 command/skill の実行時の位置 | 各種製品開発リポジトリ |
| **consumer-local** | AgentDevFlow を利用しない OpenCode プロジェクト。独自 command/skill のみ | `.opencode/` = プロジェクト独自設定専用。`agentdev` 名前空間は使用しない | 実験的リポジトリ |
| **consumer-generated** | ローカル版 OpenCode を導入する利用側リポジトリ。GitHub Issue/PR を使わない個人利用環境向け | `.opencode/` = link mode により接続された AgentDevFlow 実行時の位置。`agentdev-gh-cli` だけ `src/opencode-local/agentdev-gh-cli/` から差し替え | 個人利用環境のローカルリポジトリ |
| **plugin-future** | 将来の plugin/npm/package 配布形態（現在は未対応） | `.opencode/` = plugin が管理する実行時の位置 | （将来） |

## `.opencode/` の意味の違い

### 本体リポジトリ（AgentDevFlow 本体）

```
.opencode/           → ジャンクション → src/opencode/ (実行時の配置先)
src/opencode/
  commands/agentdev/  → 原本（公開コマンド定義13件、README除外）
  skills/agentdev-*/  → 原本（agentdev スキル20件）
scripts/
  self-sync.ps1       → AgentDevFlow 本体リポジトリ用同期スクリプト（self-hosting 向け公開入口）
```

- 原本の編集は `src/opencode/` で行う
- `.opencode/` は ジャンクション/symlink による実行時の配置先
- `scripts/self-sync.ps1` で原本↔配置先の同期を管理する

### 適用プロジェクト（consumer-with-agentdev）

```
.agentdev-plugin/                → agent-dev-flow のチェックアウト配置先（git clone またはソース ZIP 展開）
  src/opencode/                  → 原本
  scripts/install.ps1            → 適用プロジェクト用公開入口（install・check・dry-run）
  scripts/consumer/              → install.ps1 の内部処理（単体実行しない）
.opencode/
  commands/agentdev/              → ジャンクション → .agentdev-plugin/src/opencode/commands/agentdev/
  commands/{local}/               → プロジェクト独自コマンド（実ディレクトリ）
  skills/agentdev-*/              → ジャンクション → .agentdev-plugin/src/opencode/skills/agentdev-*/
  skills/{local}-*/               → プロジェクト独自スキル（実ディレクトリ）
```

- `.agentdev-plugin/` に agent-dev-flow のチェックアウトを配置する（git clone またはソース ZIP 展開、`.agentdev/` ではない）
- `.agentdev/` は AgentDevFlow のドメイン状態用（Intake, Learning, Backlog 等）として予約
- `.opencode/` は AgentDevFlow 提供 command/skill とプロジェクト独自設定の混在場所
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
通常版と同じ link mode（`.opencode/` 配下を src 配下へ接続）で導入し、`agentdev-gh-cli` だけを `src/opencode-local/agentdev-gh-cli/` から差し替える（v2:ADR-011, v2:ADR-009）。
詳細な接続フロー、link target 確認は Design [実行時パッケージ境界](../specs/local/runtime-package-boundary.md) を参照。

```
.agentdev-plugin/                → agent-dev-flow のチェックアウト配置先（git clone またはソース ZIP 展開）
  src/opencode/                  → GitHub 版 AgentDevFlow の原本（agentdev-gh-cli 以外の接続先）
  src/opencode-local/            → ローカル版 link 先原本領域（agentdev-gh-cli のみ）
    README.md                    → ローカル版 link 設定の実行手順
    agentdev-gh-cli/             → ローカル版 agentdev-gh-cli の原本（case-schema を吸収）
.opencode/
  commands/agentdev/             → link → src/opencode/commands/agentdev/
  skills/agentdev-*/             → link → src/opencode/skills/agentdev-*/（agentdev-gh-cli 以外）
  skills/agentdev-gh-cli/        → link → src/opencode-local/agentdev-gh-cli/
.agentdev/
  cases/                         → ローカル Case ファイル（Issue / PR 相当の永続情報）
```

- **link による接続**: command/skill を生成せず、`.opencode/` 配下を src 配下へ link で接続する（v2:ADR-009 decision #1, #2, #3）
- **agentdev-gh-cli の差し替え**: `agentdev-gh-cli` 以外は通常版と同じ `src/opencode/` 配下へ接続し、`agentdev-gh-cli` だけを `src/opencode-local/agentdev-gh-cli/` へ接続する（v2:ADR-009 decision #3）
- **link target 確認**: link 設定前に `.opencode/` 配下の各 path が意図した link target へ解決されることを確認し、意図しない target の場合は link 設定を停止する（v2:ADR-011-010, v2:ADR-009 decision #6）
- **リポジトリ管理対象外**: link により接続された `.opencode/commands/agentdev/`、`.opencode/skills/agentdev-*/` はリポジトリ管理対象外（v2:ADR-011-008）
- **リポジトリ管理対象**: `.agentdev/cases/` 配下のローカル Case ファイルは Issue/PR 相当の永続情報としてリポジトリ管理対象（v2:ADR-011-016）
- **更新方式**: unlink / relink により行う。`.opencode/commands/agentdev/` と `.opencode/skills/agentdev-*/` を全削除して作り直す方式は採らない（v2:ADR-011-033, v2:ADR-009 decision #4）
- **判定基準**: `.opencode/skills/agentdev-gh-cli/` が `src/opencode-local/agentdev-gh-cli/` への link として解決される場合に consumer-generated と判定される（Design runtime-package-boundary.md）

#### ローカル版セットアップ手順

1. `.agentdev-plugin/` に agent-dev-flow のチェックアウトを用意する（git clone またはソース ZIP 展開）
2. `./.agentdev-plugin/scripts/install.ps1 -Mode apply -LocalMode` を実行し、link 設定を行う（`agentdev-gh-cli` のみ `src/opencode-local/agentdev-gh-cli/` へ接続、それ以外は `src/opencode/` 配下へ接続）
3. 各 link が意図した target へ解決されることを `./.agentdev-plugin/scripts/install.ps1 -Mode check` で確認する（link mode を自動検出して報告する）
4. `.agentdev/cases/` ディレクトリが存在することを確認する（ローカル Case ファイル用）
5. `.gitignore` に link 先（`.opencode/commands/agentdev/`, `.opencode/skills/agentdev-*/`）を追加する

#### ローカル版の更新手順

```powershell
# git clone 環境: agent-dev-flow の最新を取得
cd .agentdev-plugin && git pull && cd ..

# ZIP 展開環境: ソース ZIP を再取得し、.agentdev-plugin/ を差し替える

# unlink / relink により link を張り直す（全削除して作り直す方式は採らない）
./.agentdev-plugin/scripts/install.ps1 -Mode apply -LocalMode
```

> 詳細な実行手順、制約、link target 確認は `src/opencode-local/README.md`（link 設定の実行エントリポイント）と Design [実行時パッケージ境界](../specs/local/runtime-package-boundary.md)、[ローカル Case ファイル](../specs/local/local-case-file.md) を参照。

## 予約名（Reserved Names）

| 名前 | 種別 | 使用可能なリポジトリ種別 |
|------|------|---------------------|
| `agentdev` | コマンド名前空間 | `self-hosting`, `consumer-with-agentdev`, `consumer-generated` |
| `agentdev-*` | スキルプレフィックス | `self-hosting`, `consumer-with-agentdev`, `consumer-generated` |
| `.agentdev/` | ドメイン状態ディレクトリ | `self-hosting`, `consumer-with-agentdev`, `consumer-generated` |
| `.agentdev-plugin/` | 適用プロジェクトのチェックアウト配置先 | `consumer-with-agentdev`, `consumer-generated` |

**禁止事項**:
- consumer-local での `agentdev` 名前空間の使用（v2:ADR-011-056）
- consumer-with-agentdev での AgentDevFlow 提供ファイルの直接編集（上書きされる可能性）
- `.agentdev-plugin/` を `.agentdev/` として使用すること（ドメイン状態と競合）
- consumer-generated で link target が意図した src 配下以外へ解決される環境での link 設定実行（v2:ADR-011-010, v2:ADR-009 decision #6）

`agentdev-integrity`（旧 integrity skill）は AgentDevFlow 配布対象外となった（DEC-001）。
docs-check は `repo-agentdev-integrity`（配布対象外スキル）として AgentDevFlow 本体リポジトリでのみ実行される。
適用プロジェクトには配布されない。

## インストール方式の方針

provisioning（チェックアウトの取得）と install 手段（link mode による接続）は別軸である（REQ-009）。
どちらの provisioning 形態でも install 手段は link mode に限られる。
導入方式ポリシーの正規な定義は Design [実行時パッケージ境界](../specs/local/runtime-package-boundary.md) を参照。

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
| プラグイン/npm/package | ❌ | 将来対応 | v2:ADR-011-064 で将来の選択肢扱い |

> 「source ZIP によるチェックアウト供給」と「release archive projection」（REQ-029 が別途定義する配布と検証の投影）は別の概念である（DEC-014）。
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
#   .agentdev-plugin/src/opencode/ となる配置にする）

# 2. インストール（ジャンクション作成）
./.agentdev-plugin/scripts/install.ps1 -Mode apply

# 3. 状態確認（link mode 自動検出、版報告、orphan 検出を含む）
./.agentdev-plugin/scripts/install.ps1 -Mode check

# 4. ドライラン（変更確認）
./.agentdev-plugin/scripts/install.ps1 -Mode dry-run
```

> ZIP 展開チェックアウト（`.git` なし）は正規の provisioning 形態だが、サポート対象外の環境である（不具合報告の受け付け対象外、REQ-009-048）。
>
> スクリプトを `./scripts/` として導入先リポジトリに置く場合は、`.agentdev-plugin/` と同一のチェックアウトから scripts/ ディレクトリ全体をコピーする（公開入口 `install.ps1` は内部処理 `scripts/consumer/` に依存する）。

### 更新手順

更新は provisioning 形式に従う（REQ-009-049）。
install の apply は冪等であり、再実行で junction 構成を変化させない。

```powershell
# git clone 環境: agent-dev-flow の最新を取得
cd .agentdev-plugin && git pull && cd ..

# ZIP 展開環境: ソース ZIP を再取得し、.agentdev-plugin/ を差し替える
# （install 再実行の要否は利用者の判断）

# ジャンクションを再同期（新しい skill/command が追加された場合）
./.agentdev-plugin/scripts/install.ps1 -Mode apply
```

### 直接コピーによるインストール（非推奨）

- 初回は手動コピーで動作するが、AgentDevFlow 更新時に再コピーが必要
- docs-check で乖離を検出可能（IR-016）
- ソース ZIP 展開による provisioning はこの方式に該当しない（install 手段は link mode に限定される）

## スクリプトの適用範囲

scripts/ 直下の公開入口は consumer 向け `scripts/install.ps1` と self-hosting 向け `scripts/self-sync.ps1` の2本である（REQ-050、DEC-021）。それ以外の内部処理（`scripts/consumer/`、`scripts/self/` 配下）は単体実行しない。

| スクリプト | 対象リポジトリ種別 | 役割 |
|--------|---------------|------|
| `scripts/self-sync.ps1` | `self-hosting` | `src/opencode/` ↔ `.opencode/` の同期（apply / check / dry-run） |
| `scripts/install.ps1` | `consumer-with-agentdev`, `consumer-generated` | チェックアウト済み `.agentdev-plugin/` を前提としたジャンクション作成（apply / check / dry-run）。check は状態確認（link mode 自動検出、版報告は `.git` 存在時のみ、orphan 検出を含む）を兼ねる |
| （link 設定: `-LocalMode`） | `consumer-generated` | `install.ps1 -Mode apply -LocalMode` が `agentdev-gh-cli` のみ `src/opencode-local/agentdev-gh-cli/` へ接続し、それ以外を `src/opencode/` 配下へ接続する（v2:ADR-011-032, v2:ADR-009）。決定的な変換ロジックを実装したスクリプトは使用しない |

### 本体リポジトリ（self-hosting）での同期

```powershell
./scripts/self-sync.ps1 -Mode apply   # src/opencode/ → .opencode/ 同期
./scripts/self-sync.ps1 -Mode check   # 乖離の検出
./scripts/self-sync.ps1 -Mode dry-run # 変更予測
```

### 適用プロジェクト（consumer-with-agentdev）でのインストール/確認

```powershell
./.agentdev-plugin/scripts/install.ps1 -Mode apply   # ジャンクション作成（チェックアウト前提）
./.agentdev-plugin/scripts/install.ps1 -Mode check   # 乖離の検出・状態確認（orphan 検出、版報告を含む）
./.agentdev-plugin/scripts/install.ps1 -Mode dry-run # 変更予測
```

## プロジェクト独自の命名ルール

適用プロジェクトで独自 command/skill を追加する場合:

| ルール | 説明 |
|------|------|
| 名前空間の衝突回避 | `agentdev` および `agentdev-*` は使用不可 |
| kebab-case | skill 名は小文字、数字、ハイフンのみ（v2:ADR-011-011） |
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
```

**注意**: `.agentdev/` は gitignore に**含めない**こと。
`.agentdev/` は AgentDevFlow のドメイン状態（Intake, Learning, Backlog 等）を保持し、git 管理対象である。

## 移行ガイド

### 新規適用プロジェクトの導入手順

1. `.agentdev-plugin/` に agent-dev-flow のチェックアウトを用意する（git clone またはソース ZIP 展開）
2. `./.agentdev-plugin/scripts/install.ps1 -Mode apply` を実行
3. `./.agentdev-plugin/scripts/install.ps1 -Mode check` で動作確認
4. `.agentdev/` ディレクトリが存在することを確認（Intake/Learning 用）
5. `.gitignore` に推奨エントリを追加

### 既存プロジェクトへの導入手順

1. 既存の `.opencode/` 内容を確認
2. `agentdev` 名前空間との衝突がないことを確認
3. `.agentdev-plugin/` に agent-dev-flow のチェックアウトを用意する（git clone またはソース ZIP 展開）
4. `./.agentdev-plugin/scripts/install.ps1 -Mode apply` でインストール
5. `./.agentdev-plugin/scripts/install.ps1 -Mode check` で整合性確認
6. `.gitignore` を更新
