# Consumer Project 導入モデル

AgentDevFlow を適用プロジェクトに導入する際の model を定義する（REQ-0103-061~065）。

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
  commands/agentdev/  → canonical source (18 commands)
  skills/agentdev-*/  → canonical source (21 skills)
```

- source 編集は `src/opencode/` で行う
- `.opencode/` は junction/symlink による runtime projection
- `sync-opencode.ps1` で source↔projection 同期を管理

### Consumer-with-agentdev (適用プロジェクト)

```
.opencode/
  commands/agentdev/  → AgentDevFlow 提供 command (symlink or copy)
  commands/{local}/   → project-local command
  skills/agentdev-*/  → AgentDevFlow 提供 skill (symlink or copy)
  skills/{local}-*/   → project-local skill
```

- `.opencode/` は AgentDevFlow 提供 command/skill と project-local customization の混在場所
- AgentDevFlow 提供 file は symlink 推奨、copy 非推奨
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
| `agentdev-integrity` | integrity skill | self-hosting, consumer-with-agentdev |

**禁止事項**:
- consumer-local での `agentdev` namespace 使用（REQ-0103-056）
- consumer-with-agentdev での AgentDevFlow 提供 file の直接編集（上書きされる可能性）

## Installation Method Policy

| Method | 対応 | 推奨 | 備考 |
|--------|------|------|------|
| Symlink (junction on Windows) | ✅ | **推奨** | 更新が自動反映、source が単一 |
| Copy | ⚠️ | 非推奨 | 手動更新が必要、drift リスク |
| Git submodule | ⚠️ | 検討可能 | 複雑性が増す |
| Plugin/npm/package | ❌ | 将来対応 | REQ-0103-064 で将来 option 扱い |

### Symlink-based installation (推奨)

```powershell
# Windows (junction)
cmd /c "mklink /J .opencode\commands\agentdev <agentdev-path>\src\opencode\commands\agentdev"
cmd /c "mklink /J .opencode\skills\agentdev-gh-cli <agentdev-path>\src\opencode\skills\agentdev-gh-cli"

# Unix (symlink)
ln -s <agentdev-path>/src/opencode/commands/agentdev .opencode/commands/agentdev
ln -s <agentdev-path>/src/opencode/skills/agentdev-gh-cli .opencode/skills/agentdev-gh-cli
```

### Copy-based installation (非推奨)

- 初回は手動コピーで動作するが、AgentDevFlow 更新時に再コピーが必要
- integrity-check で drift を検出可能（IR-016）

## Sync Script Scope

| Repo Type | sync-opencode.ps1 の適用範囲 |
|-----------|------------------------------|
| self-hosting | `src/opencode/` ↔ `.opencode/` の全体同期 |
| consumer-with-agentdev | AgentDevFlow 提供 file のみ同期（project-local file は対象外） |
| consumer-local | 適用対象外 |

### Self-hosting での sync

```powershell
./sync-opencode.ps1 -Mode apply   # src/opencode/ → .opencode/ 同期
./sync-opencode.ps1 -Mode check   # divergence 検出
./sync-opencode.ps1 -Mode dry-run # 変更予測
```

### Consumer-with-agentdev での sync

Consumer では `sync-opencode.ps1` は AgentDevFlow 本体から提供されるファイルのみを同期対象とする。project-local customization は同期対象外。

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

## Migration Guide

### 新規 Consumer 導入手順

1. AgentDevFlow repo を clone または download
2. `.opencode/commands/agentdev/` に junction/symlink を作成
3. 必要な skill ごとに `.opencode/skills/agentdev-*/` に junction/symlink を作成
4. `sync-opencode.ps1 -Mode check` で動作確認
5. `.agentdev/` directory が存在することを確認

### 既存プロジェクトへの導入手順

1. 既存の `.opencode/` 内容を確認
2. `agentdev` namespace との衝突がないことを確認
3. AgentDevFlow 提供 file を symlink で追加
4. integrity-check で整合性確認
