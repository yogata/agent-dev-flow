# Consumer Project 導入モデル

AgentDevFlow を適用プロジェクトに導入する際の model を定義する（REQ-0103-061~065, REQ-0103-072~077）。

## 4 種の Repo Type

| Type | 説明 | `.opencode/` の意味 | 例 |
|------|------|---------------------|-----|
| **self-hosting** | AgentDevFlow 本体開発 repo。source と projection が同一 repo に存在 | `.opencode/` = runtime projection（junction → `src/opencode/`） | agent-dev-flow |
| **consumer-with-agentdev** | AgentDevFlow を導入する製品 repo。AgentDevFlow 提供 skill/command を利用 | `.opencode/` = project-local customization 入口 + AgentDevFlow 提供 command/skill の runtime 位置 | 各種製品開発 repo |
| **consumer-local** | AgentDevFlow を利用しない OpenCode プロジェクト。独自 command/skill のみ | `.opencode/` = project-local customization 専用。`agentdev` namespace は使用しない | 実験的 repo |
| **plugin-future** | 将来の plugin/npm/package 配布形態（現在は未対応） | `.opencode/` = plugin が管理する runtime 位置 | （将来） |

## `.opencode/` の意味の違い

### Self-hosting (AgentDevFlow 本体)

```
.opencode/           → junction → src/opencode/ (runtime projection)
src/opencode/
  commands/agentdev/  → canonical source（public command definitions 13件、README除外）
  skills/agentdev-*/  → canonical source（agentdev skill 20件）
scripts/
  sync-self-opencode.ps1  → self-hosting 用同期スクリプト
```

- source 編集は `src/opencode/` で行う
- `.opencode/` は junction/symlink による runtime projection
- `scripts/sync-self-opencode.ps1` で source↔projection 同期を管理

### Consumer-with-agentdev (適用プロジェクト)

```
.agentdev-plugin/                → agent-dev-flow の git clone 先（consumer 専用）
  src/opencode/                  → canonical source
.opencode/
  commands/agentdev/              → junction → .agentdev-plugin/src/opencode/commands/agentdev/
  commands/{local}/               → project-local command（real directory）
  skills/agentdev-*/              → junction → .agentdev-plugin/src/opencode/skills/agentdev-*/
  skills/{local}-*/               → project-local skill（real directory）
scripts/
  install-consumer-opencode.ps1   → consumer 用インストールスクリプト
  check-consumer-opencode.ps1     → consumer 用状態確認スクリプト
```

- `.agentdev-plugin/` に agent-dev-flow を clone する（NOT `.agentdev/`）
- `.agentdev/` は AgentDevFlow の domain state 用（intake, learning, backlog 等）として予約
- `.opencode/` は AgentDevFlow 提供 command/skill と project-local customization の混在場所
- AgentDevFlow 提供 file は junction（更新時に clone を pull すれば自動反映）
- project-local file は直接管理

### Consumer-local (非AgentDevFlow プロジェクト)

```
.opencode/
  commands/{local}/   → project-local command のみ
  skills/{local}-*/   → project-local skill のみ
```

- AgentDevFlow namespace を使用しない
- 自由に `.opencode/` を管理

## Reserved Names

| 名前 | 種別 | 使用可能な Repo Type |
|------|------|---------------------|
| `agentdev` | command namespace | self-hosting, consumer-with-agentdev |
| `agentdev-*` | skill prefix | self-hosting, consumer-with-agentdev |
| `.agentdev/` | domain state directory | self-hosting, consumer-with-agentdev |
| `.agentdev-plugin/` | consumer clone target | consumer-with-agentdev |

**禁止事項**:
- consumer-local での `agentdev` namespace 使用（REQ-0103-056）
- consumer-with-agentdev での AgentDevFlow 提供 file の直接編集（上書きされる可能性）
- `.agentdev-plugin/` を `.agentdev/` として使用すること（domain state と競合）

> **Note**: `agentdev-integrity`（旧 integrity skill）は AgentDevFlow 配布対象外となった（ADR-0020）。integrity-check は `repo-agentdev-integrity`（repo-local skill）として self-hosting repo のみで実行される。Consumer project には配布されない。

## Installation Method Policy

| Method | 対応 | 推奨 | 備考 |
|--------|------|------|------|
| Junction + clone (`.agentdev-plugin/`) | ✅ | **推奨** | 更新が自動反映、source が単一 |
| Copy | ⚠️ | 非推奨 | 手動更新が必要、drift リスク |
| Git submodule | ⚠️ | 検討可能 | 複雑性が増す |
| Plugin/npm/package | ❌ | 将来対応 | REQ-0103-064 で将来 option 扱い |

### Junction-based installation with clone（推奨）

agent-dev-flow を `.agentdev-plugin/` に clone し、junction で runtime projection を作成する。

```powershell
# 1. インストール（clone + junction 作成を一括実行）
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

# junction を再同期（新しい skill/command が追加された場合）
./scripts/install-consumer-opencode.ps1 -Mode apply
```

### Copy-based installation (非推奨)

- 初回は手動コピーで動作するが、AgentDevFlow 更新時に再コピーが必要
- integrity-check で drift を検出可能（IR-016）

## Script Scope

| Script | 対象 Repo Type | 役割 |
|--------|---------------|------|
| `scripts/sync-self-opencode.ps1` | self-hosting | `src/opencode/` ↔ `.opencode/` の同期 |
| `scripts/install-consumer-opencode.ps1` | consumer-with-agentdev | `.agentdev-plugin/` clone + junction 作成 |
| `scripts/check-consumer-opencode.ps1` | consumer-with-agentdev | インストール状態の検証 |

### Self-hosting での sync

```powershell
./scripts/sync-self-opencode.ps1 -Mode apply   # src/opencode/ → .opencode/ 同期
./scripts/sync-self-opencode.ps1 -Mode check   # divergence 検出
./scripts/sync-self-opencode.ps1 -Mode dry-run # 変更予測
```

### Consumer-with-agentdev での install/check

```powershell
./scripts/install-consumer-opencode.ps1 -Mode apply   # clone + junction 作成
./scripts/install-consumer-opencode.ps1 -Mode check   # divergence 検出
./scripts/install-consumer-opencode.ps1 -Mode dry-run # 変更予測
./scripts/check-consumer-opencode.ps1                  # 状態確認（check のみ）
```

## Project-Local Naming Rules

Consumer project で独自 command/skill を追加する場合:

| Rule | 説明 |
|------|------|
| Namespace 衝突回避 | `agentdev` および `agentdev-*` は使用不可 |
| kebab-case | skill 名は小文字・数字・ハイフンのみ（REQ-0103-011） |
| 意味的命名 | project 名や domain 名を prefix に含めることを推奨 |
| 独自 directory | 独自 skill は `.opencode/skills/{project}-*/` に配置 |

例: プロジェクト `myapp` の場合:
- command: `.opencode/commands/myapp/`
- skill: `.opencode/skills/myapp-deployment/`

## Recommended .gitignore (Consumer Repository)

Consumer リポジトリで推奨される `.gitignore` 設定:

```gitignore
# AgentDevFlow checkout (clone target)
.agentdev-plugin/

# OpenCode runtime workspace
.sisyphus/

# AgentDevFlow junction-managed directories (auto-created by install script)
.opencode/commands/agentdev/
.opencode/skills/agentdev-*/
```

**注意**: `.agentdev/` は gitignore に**含めない**こと。`.agentdev/` は AgentDevFlow の domain state（intake, learning, backlog 等）を保持し、git 管理対象である。

## Migration Guide

### 新規 Consumer 導入手順

1. Consumer リポジトリに `scripts/` ディレクトリをコピー（または agent-dev-flow から取得）
2. `./scripts/install-consumer-opencode.ps1 -Mode apply` を実行
3. `./scripts/check-consumer-opencode.ps1` で動作確認
4. `.agentdev/` directory が存在することを確認（Intake/Learning 用）
5. `.gitignore` に推奨エントリを追加

### 既存プロジェクトへの導入手順

1. 既存の `.opencode/` 内容を確認
2. `agentdev` namespace との衝突がないことを確認
3. `./scripts/install-consumer-opencode.ps1 -Mode apply` でインストール
4. `./scripts/check-consumer-opencode.ps1` で整合性確認
5. `.gitignore` を更新
