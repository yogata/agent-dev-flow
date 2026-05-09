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
