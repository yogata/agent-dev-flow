# Runtime Package Boundary Specification

> **Scope**: This SPEC is a repo-internal design document for the agent-dev-flow repository (ADR-0103). It describes the runtime package boundary model between repo types from the repo's perspective; it does not prescribe consumer project behavior. Consumer projects follow their own conventions, and this SPEC only defines how the agent-dev-flow repo structures and distributes its runtime package.

## Purpose

AgentDevFlow の runtime package 境界を定義し、self-hosting repo と consumer project での `.opencode/` 役割・命名・導入方式・sync 範囲を明確化する（REQ-0103-061~065）。

## 4 種の Repo Type

| Type ID | 名称 | 説明 | `.opencode/` の意味 | 典型例 |
|---------|------|------|---------------------|--------|
| `self-hosting` | AgentDevFlow 本体開発 repo | source と projection が同一 repo に存在 | runtime projection（junction → `src/opencode/`） | `agent-dev-flow` |
| `consumer-with-agentdev` | AgentDevFlow 導入製品 repo | AgentDevFlow 提供 skill/command を利用 | project-local customization 入口 + AgentDevFlow runtime 位置 | 各種製品開発 repo |
| `consumer-local` | 非 AgentDevFlow OpenCode project | 独自 command/skill のみ | project-local customization 専用 | 実験的 repo |
| `plugin-future` | 将来の plugin/npm/package 配布形態 | 現在は未対応 | plugin が管理する runtime 位置 | （将来） |

### Repo Type 判定基準

| 条件 | Repo Type |
|------|-----------|
| `src/opencode/` が存在し `.opencode/` が junction | `self-hosting` |
| `.opencode/commands/agentdev/` または `.opencode/skills/agentdev-*/` が存在 | `consumer-with-agentdev` |
| `.opencode/` が存在し `agentdev` namespace を含まない | `consumer-local` |
| 上記いずれでもない | N/A（OpenCode 非使用 repo） |

## `.opencode/` Semantics by Repo Type

### Self-hosting

```
.opencode/                       → real directory (not junction)
  commands/agentdev/             → junction → src/opencode/commands/agentdev/
  skills/agentdev-*/             → junction → src/opencode/skills/agentdev-*/ (per skill)
  .gitignore                     → copy from src/opencode/.gitignore (real file)
  (opencode runtime files)       → sessions, config, etc. managed by opencode itself
src/opencode/
commands/agentdev/             → 原本
skills/agentdev-*/             → 原本
```

- Source 編集は `src/opencode/` で実施
- `.opencode/` は実ディレクトリとして動作（全体ジャンクションではない）
- `sync-opencode.ps1` が `commands/agentdev/` と `skills/agentdev-*/` を個別ジャンクションとして管理
- ジャンクション対象は `agentdev-*` グロブで動的列挙（ハードコードなし）
- `.gitignore` は `src/opencode/.gitignore` から実ファイルとしてコピー
- `.opencode/` 内の非管理ファイル（セッション、設定等）は opencode ランタイムが自由に配置可能

### Consumer-with-agentdev

```
.opencode/
  commands/agentdev/  → AgentDevFlow 提供 command (symlink or junction)
  commands/{local}/   → project-local command
  skills/agentdev-*/  → AgentDevFlow 提供 skill (symlink or junction)
  skills/{local}-*/   → project-local skill
```

- AgentDevFlow 提供 file は symlink/junction 推奨、copy は非推奨
- Project-local file は直接管理
- `.agentdev/` domain state directory が存在

### Consumer-local

```
.opencode/
  commands/{local}/   → project-local command のみ
  skills/{local}-*/   → project-local skill のみ
```

- `agentdev` namespace を使用しない（REQ-0103-056）
- 自由に `.opencode/` を管理

### Plugin-future（将来）

現在は要件定義のみ。npm/package 配布時に `.opencode/` が plugin により管理される形態を想定。

## Project-Local Naming Rules

Consumer project で独自 command/skill を追加する際の命名規約（REQ-0103-063）。

### 予約名（Reserved Names）

| 名前 | 種別 | 使用可能 Repo Type |
|------|------|-------------------|
| `agentdev` | command namespace | `self-hosting`, `consumer-with-agentdev` |
| `agentdev-*` | skill prefix | `self-hosting`, `consumer-with-agentdev` |
| `.agentdev/` | domain state directory | `self-hosting`, `consumer-with-agentdev` |

### 命名規約

| Rule | 説明 | 根拠 |
|------|------|------|
| Namespace 衝突回避 | `agentdev` / `agentdev-*` / `.agentdev/` は使用不可 | REQ-0103-056 |
| kebab-case | skill 名は小文字・数字・ハイフンのみ | REQ-0103-011 |
| 意味的命名 | project 名や domain 名を prefix に含めることを推奨 | 運用規約 |
| 独自 directory | 独自 skill は `.opencode/skills/{project}-*/` に配置 | 運用規約 |

### 衝突検出

`consumer-local` repo で `agentdev` namespace が検出された場合、docs-check（IR-016）が NG として報告する。

## Installation Method Policy

| Method | Status | 推奨度 | 備考 |
|--------|--------|--------|------|
| Symlink / Junction | 対応済み | **推奨** | 更新自動反映、source 単一管理 |
| Copy | 対応済み | 非推奨 | 手動更新必要、drift リスク |
| Git submodule | 検討可能 | 実験的 | 複雑性増加 |
| Plugin / npm / package | 未対応 | 将来対応 | REQ-0103-064 |

### Symlink / Junction の制約

| Platform | 方法 | 制約 |
|----------|------|------|
| Windows | Junction (`mklink /J`) | 管理者権限不要、ディレクトリのみ対応 |
| Windows | Symlink (`mklink /D`) | 開発者モードまたは管理者権限が必要 |
| Unix | Symlink (`ln -s`) | 権限不要 |

### Copy の drift 検出

Copy-based installation では AgentDevFlow 更新時に drift が発生する。docs-check（IR-016）が divergence を検出・報告する。

## Sync Script Scope by Repo Type

`sync-opencode.ps1` の適用範囲（REQ-0103-065）。

| Repo Type | 同期対象 | 非対象 |
|-----------|----------|--------|
| `self-hosting` | `commands/agentdev/` + `skills/agentdev-*/` の選択的ジャンクション + `.gitignore` コピー | opencode ランタイムファイル（sessions, config 等） |
| `consumer-with-agentdev` | AgentDevFlow 提供 file のみ | project-local customization |
| `consumer-local` | なし（適用対象外） | 全体 |
| `plugin-future` | （将来定義） | — |

### Self-hosting での sync モード

| Mode | 動作 |
|------|------|
| `apply` | `src/opencode/` → `.opencode/` の同期実行 |
| `check` | divergence 検出（終了コードで判定） |
| `dry-run` | 変更予測（実行なし） |

### Consumer での sync

Consumer では AgentDevFlow 本体から提供される file のみを同期対象とする。project-local customization は同期の影響を受けない。

## See Also

- [Consumer Project Setup Guide](../guides/consumer-project-setup.md) — Consumer 向け導入手順
- [Artifact Contracts](artifact-contracts.md) — Command/Skill/Template/Script の責務境界
- REQ-0103-061~065 — Repo type / `.opencode/` semantics / naming / installation / sync scope の要件定義
