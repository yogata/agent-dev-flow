## AgentDevFlow Canonical Namespace

- Plugin 表示名: `AgentDevFlow`
- Canonical namespace: `agentdev`
- Public command prefix: `/agentdev/*`
- Domain state directory: `.agentdev/`
- 詳細: ADR-0005, REQ-0017

## ディレクトリ責任分離（REQ-0017-008）

### .sisyphus/ — Sisyphus Runtime Workspace

Sisyphus が管理する実行時の一時作業領域。plan、evidence、tasks、execution state、drafts、reports、archives を格納する。

- plans, drafts, evidence, execution, notepads, tasks, reports, archives
- **例外**: `.sisyphus/drafts/req-draft-*.md` は Prometheus runtime working draft であり、AgentDevFlow の canonical domain state ではない（REQ-0017-046）

### .agentdev/ — AgentDevFlow Domain State

AgentDevFlow の canonical domain artifact を格納する永続領域。intake items、learning pipeline data、integrity reports 等の domain state を保持する。

- intake items, learning data, integrity reports
- サブディレクトリ構成は各子issueで定義（REQ-0017-009）
- `.sisyphus/drafts/req-draft-*.md` を `.agentdev/` に移行する要件はない（REQ-0017-046）

## 開発環境

- OS: Windows
- shell: powershell

## Sisyphus 命名規則

`.sisyphus/` 配下のファイル・ディレクトリの命名は plan 名を基準とする。これにより `archive-completed-plan` で確実にアーカイブされる。

### 基本ルール

| カテゴリ | パス | 命名規則 | マッチング方式 |
|----------|------|----------|----------------|
| plans | `.sisyphus/plans/` | `<plan_name>.md` | 完全一致 |
| drafts | `.sisyphus/drafts/` | `<plan_name>.md` または `<plan_name>-*.md` | プレフィクス |
| evidence | `.sisyphus/evidence/` | `<plan_name>.*` または `<plan_name>-*` | プレフィクス |
| execution | `.sisyphus/execution/` | `<plan_name>.*` または `<plan_name>-*` | プレフィクス |
| notepads | `.sisyphus/notepads/` | `<plan_name>/` （ディレクトリ名 = plan 名） | **完全一致** |
| tasks | `.sisyphus/tasks/` | `<plan_name>.*` または `<plan_name>-*` | プレフィクス |
| reports | `.sisyphus/reports/` | `<plan_name>.*` または `<plan_name>-*` | プレフィクス |

### 例

**plan 名**: `install-v2-windows`

| カテゴリ | ✅ 正しい | ❌ 間違い |
|----------|-----------|-----------|
| notepads | `.sisyphus/notepads/install-v2-windows/` | `.sisyphus/notepads/install-v2/` |
| evidence | `.sisyphus/evidence/install-v2-windows-result.txt` | `.sisyphus/evidence/result.txt` |
| drafts | `.sisyphus/drafts/install-v2-windows-draft.md` | `.sisyphus/drafts/draft.md` |

### 注意事項

- notepads は**完全一致**のみ対応（プレフィクスマッチングではない）
- plan 名にサフィックス（`-windows`, `-wsl` 等）がある場合、notepad ディレクトリ名にも同一サフィックスが必要
- 空の notepad ディレクトリは作成しない
- notepad ディレクトリ内に隠しファイル（`.` で始まるファイル）を配置しない（アーカイブ時にスキップされる）
