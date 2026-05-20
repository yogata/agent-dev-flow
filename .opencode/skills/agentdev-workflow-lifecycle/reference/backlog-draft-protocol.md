# バックログdraftプロトコル

`issue-backlog` と `issue-backlog-create` 間のバックログdraftのライフサイクルとスキーマを定義する。

## draftライフサイクル

```
draft → approved → issued + 削除
```

| 状態 | 遷移トリガー | 説明 |
|------|-------------|------|
| `draft` | `issue-backlog` Step 8（ドラフト保存） | 抽出・分類・解消チェック結果を保存した初期状態 |
| `approved` | `issue-backlog` Step 9（ユーザー承認） | ユーザーが内容を確認・承認した状態 |
| `issued` | `issue-backlog-create` Step 9（状態更新） | Epic + 子Issueが作成済み。draftファイルは保持（削除しない） |

## draftスキーマ

### frontmatter

```yaml
---
period: "{since} 〜 {until}"
period-slug: "{period-slug}"
status: draft | approved | issued
created: "{YYYY-MM-DD}"
sources:
  - type: issue | pr
    number: {N}
    closed_at: "{YYYY-MM-DD}"
---
```

### frontmatter以降の本文構造

```markdown
## 除外（解消済み）

| # | 残課題 | 元issue/PR | 解消根拠 |
|---|--------|------------|----------|

## {カテゴリ名}（優先度: {高/中/低}）

### {タイトル}

- **説明**: {説明}
- **カテゴリ**: {カテゴリ}
- **優先度**: {高/中/低}
- **元テキスト**: {元テキストの引用}
- **元issue/PR**: #{N}（comment / body）
- **解消チェック結果**: 未解消 / 未確認
```

## コマンド間の責務分離

| 責務 | コマンド | 説明 |
|------|----------|------|
| 抽出・分類・解消チェック | `issue-backlog` | クローズ済みissue/PRから残課題を構造的検出 + LLM全文解析 |
| ユーザー確認・承認 | `issue-backlog` | レポート提示、ユーザーによる削除・カテゴリ変更指示 |
| ドラフト保存 | `issue-backlog` | `status: draft` → `approved` で保存 |
| Epic + 子Issue作成 | `issue-backlog-create` | テンプレート適用、`gh issue create` で作成 |
| backlog-extractedコメント投稿 | `issue-backlog-create` | 抽出元issue/PRにマーカーコメント投稿 |
| draft状態更新 | `issue-backlog-create` | `approved` → `issued` |

## 既抽出スキップ

`issue-backlog` は `issue-backlog-create` が投稿した `backlog-extracted` マーカーコメントを検知し、既に抽出済みのissue/PRをスキップする。これにより同一期間への再実行時の重複抽出を防止する。

## 参照

- **コマンド定義**: `issue-backlog.md`, `issue-backlog-create.md`
- **テンプレート**: `issue_desc_backlog_epic.md`, `issue_desc_backlog_child.md`
