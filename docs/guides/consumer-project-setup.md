# 適用プロジェクトへの導入モデル

AgentDevFlow を適用プロジェクトに導入する際のモデルを定義する（REQ-0103-061~065, REQ-0103-072~077）。

## 4 種のリポジトリ種別（Repo Type）

| 種別 | 説明 | `.opencode/` の意味 | 例 |
|------|------|---------------------|-----|
| **本体リポジトリ** | AgentDevFlow 本体開発リポジトリ。原本と配置先が同一リポジトリに存在 | `.opencode/` = 実行時の配置先（junction → `src/opencode/`） | agent-dev-flow |
| **consumer-with-agentdev** | AgentDevFlow を導入する製品リポジトリ。AgentDevFlow 提供 skill/command を利用 | `.opencode/` = プロジェクト独自設定の入口 + AgentDevFlow 提供 command/skill の実行時の位置 | 各種製品開発リポジトリ |
| **consumer-local** | AgentDevFlow を利用しない OpenCode プロジェクト。独自 command/skill のみ | `.opencode/` = プロジェクト独自設定専用。`agentdev` 名前空間は使用しない | 実験的リポジトリ |
| **plugin-future** | 将来の plugin/npm/package 配布形態（現在は未対応） | `.opencode/` = plugin が管理する実行時の位置 | （将来） |

## `.opencode/` の意味の違い

### 本体リポジトリ（AgentDevFlow 本体）

```
.opencode/           → junction → src/opencode/ (実行時の配置先)
src/opencode/
  commands/agentdev/  → 原本（公開コマンド定義13件、README除外）
  skills/agentdev-*/  → 原本（agentdev スキル20件）
scripts/
  sync-self-opencode.ps1  → AgentDevFlow 本体リポジトリ用同期スクリプト
```

- 原本の編集は `src/opencode/` で行う
- `.opencode/` は ジャンクション/symlink による実行時の配置先
- `scripts/sync-self-opencode.ps1` で原本↔配置先の同期を管理する

### Consumer-with-agentdev（適用プロジェクト）

```
.agentdev-plugin/                → agent-dev-flow の git clone 先（適用プロジェクト専用）
  src/opencode/                  → 原本
.opencode/
  commands/agentdev/              → junction → .agentdev-plugin/src/opencode/commands/agentdev/
  commands/{local}/               → プロジェクト独自コマンド（実ディレクトリ）
  skills/agentdev-*/              → junction → .agentdev-plugin/src/opencode/skills/agentdev-*/
  skills/{local}-*/               → プロジェクト独自スキル（実ディレクトリ）
scripts/
  install-consumer-opencode.ps1   → 適用プロジェクト用インストールスクリプト
  check-consumer-opencode.ps1     → 適用プロジェクト用状態確認スクリプト
```

- `.agentdev-plugin/` に agent-dev-flow を clone する（`.agentdev/` ではない）
- `.agentdev/` は AgentDevFlow のドメイン状態用（Intake, Learning, Backlog 等）として予約
- `.opencode/` は AgentDevFlow 提供 command/skill とプロジェクト独自設定の混在場所
- AgentDevFlow 提供ファイルは ジャンクション（更新時に clone を pull すれば自動反映）
- プロジェクト独自ファイルは直接管理する

### Consumer-local（非 AgentDevFlow プロジェクト）

```
.opencode/
  commands/{local}/   → プロジェクト独自コマンドのみ
  skills/{local}-*/   → プロジェクト独自スキルのみ
```

- AgentDevFlow の名前空間を使用しない
- 自由に `.opencode/` を管理する

## 予約名（Reserved Names）

| 名前 | 種別 | 使用可能なリポジトリ種別 |
|------|------|---------------------|
| `agentdev` | コマンド名前空間 | `self-hosting`, `consumer-with-agentdev` |
| `agentdev-*` | スキルプレフィックス | `self-hosting`, `consumer-with-agentdev` |
| `.agentdev/` | ドメイン状態ディレクトリ | `self-hosting`, `consumer-with-agentdev` |
| `.agentdev-plugin/` | 適用プロジェクトの clone 先 | consumer-with-agentdev |

**禁止事項**:
- consumer-local での `agentdev` 名前空間の使用（REQ-0103-056）
- consumer-with-agentdev での AgentDevFlow 提供ファイルの直接編集（上書きされる可能性）
- `.agentdev-plugin/` を `.agentdev/` として使用すること（ドメイン状態と競合）

> **注意**: `agentdev-integrity`（旧 integrity skill）は AgentDevFlow 配布対象外となった（ADR-0106）。docs-check は `repo-agentdev-integrity`（配布対象外スキル）として AgentDevFlow 本体リポジトリでのみ実行される。適用プロジェクトには配布されない。

## インストール方式の方針

| 方式 | 対応 | 推奨 | 備考 |
|--------|------|------|------|
| ジャンクション + clone（`.agentdev-plugin/`） | ✅ | **推奨** | 更新が自動反映、原本が単一 |
| Copy | ⚠️ | 非推奨 | 手動更新が必要、乖離のリスク |
| Git submodule | ⚠️ | 検討可能 | 複雑性が増す |
| Plugin/npm/package | ❌ | 将来対応 | REQ-0103-064 で将来の選択肢扱い |

### ジャンクション と clone によるインストール（推奨）

agent-dev-flow を `.agentdev-plugin/` に clone し、ジャンクション で実行時の配置先を作成する。

```powershell
# 1. インストール（clone + ジャンクション 作成を一括実行）
./scripts/install-consumer-opencode.ps1 -Mode apply

# 2. 状態確認
./scripts/check-consumer-opencode.ps1

# 3. ドライラン（変更確認）
./scripts/install-consumer-opencode.ps1 -Mode dry-run
```

### 更新手順

```powershell
# agent-dev-flow の最新を取得
cd .agentdev-plugin && git pull && cd ..

# ジャンクション を再同期（新しい skill/command が追加された場合）
./scripts/install-consumer-opencode.ps1 -Mode apply
```

### Copy によるインストール（非推奨）

- 初回は手動コピーで動作するが、AgentDevFlow 更新時に再コピーが必要
- docs-check で乖離を検出可能（IR-016）

## スクリプトの適用範囲

| スクリプト | 対象リポジトリ種別 | 役割 |
|--------|---------------|------|
| `scripts/sync-self-opencode.ps1` | `self-hosting` | `src/opencode/` ↔ `.opencode/` の同期 |
| `scripts/install-consumer-opencode.ps1` | `consumer-with-agentdev` | `.agentdev-plugin/` clone + ジャンクション 作成 |
| `scripts/check-consumer-opencode.ps1` | consumer-with-agentdev | インストール状態の検証 |

### Self-hosting での同期

```powershell
./scripts/sync-self-opencode.ps1 -Mode apply   # src/opencode/ → .opencode/ 同期
./scripts/sync-self-opencode.ps1 -Mode check   # 乖離の検出
./scripts/sync-self-opencode.ps1 -Mode dry-run # 変更予測
```

### Consumer-with-agentdev でのインストール/確認

```powershell
./scripts/install-consumer-opencode.ps1 -Mode apply   # clone + ジャンクション 作成
./scripts/install-consumer-opencode.ps1 -Mode check   # 乖離の検出
./scripts/install-consumer-opencode.ps1 -Mode dry-run # 変更予測
./scripts/check-consumer-opencode.ps1                  # 状態確認（check のみ）
```

## プロジェクト独自の命名ルール

適用プロジェクトで独自 command/skill を追加する場合:

| ルール | 説明 |
|------|------|
| 名前空間の衝突回避 | `agentdev` および `agentdev-*` は使用不可 |
| kebab-case | skill 名は小文字・数字・ハイフンのみ（REQ-0103-011） |
| 意味に基づく命名 | プロジェクト名やドメイン名をプレフィックスに含めることを推奨 |
| 独自ディレクトリ | 独自 skill は `.opencode/skills/{project}-*/` に配置 |

例: プロジェクト `myapp` の場合:
- command: `.opencode/commands/myapp/`
- skill: `.opencode/skills/myapp-deployment/`

## 推奨 .gitignore 設定（適用プロジェクトリポジトリ）

適用プロジェクトリポジトリで推奨される `.gitignore` 設定:

```gitignore
# AgentDevFlow の clone 先
.agentdev-plugin/

# OpenCode の実行時作業領域
.sisyphus/

# AgentDevFlow が ジャンクション 管理するディレクトリ（install script が自動作成）
.opencode/commands/agentdev/
.opencode/skills/agentdev-*/
```

**注意**: `.agentdev/` は gitignore に**含めない**こと。`.agentdev/` は AgentDevFlow のドメイン状態（Intake, Learning, Backlog 等）を保持し、git 管理対象である。

## 移行ガイド

### 新規適用プロジェクトの導入手順

1. 適用プロジェクトリポジトリに `scripts/` ディレクトリをコピー（または agent-dev-flow から取得）
2. `./scripts/install-consumer-opencode.ps1 -Mode apply` を実行
3. `./scripts/check-consumer-opencode.ps1` で動作確認
4. `.agentdev/` ディレクトリが存在することを確認（Intake/Learning 用）
5. `.gitignore` に推奨エントリを追加

### 既存プロジェクトへの導入手順

1. 既存の `.opencode/` 内容を確認
2. `agentdev` 名前空間との衝突がないことを確認
3. `./scripts/install-consumer-opencode.ps1 -Mode apply` でインストール
4. `./scripts/check-consumer-opencode.ps1` で整合性確認
5. `.gitignore` を更新
