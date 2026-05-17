---
name: epic-status-tracker
description: Updates parent Epic Issue status tracking tables across issue-work and issue-close workflows. USE FOR: updating Epic status to in-progress or completed, tracking child Issue progress in parent Epics, detecting parent-child relationships via Parent: #N patterns. DO NOT USE FOR: creating Epics, managing non-Epic Issues, or general Issue operations.
---

# Epic Status Tracker

親Epic Issueのステータス追跡テーブル（☐ 未着手 / 🔄 進行中 / ✅ 完了 / ❌ 対処不要）を更新する知識ベース。

- **参照元**: `issue-work`（Phase A: 進行中更新）、`issue-close`（Step 8: 完了更新）
- **特性**: 宣言的定義のみ提供。手順・手続きは各コマンド定義に委ねる

## ステータス値定義

| 値 | 意味 | 設定タイミング | 終了状態 |
|---|---|---|---|
| `☐ 未着手` | 子Issue未着手 | Epic作成時（初期値） | いいえ |
| `🔄 進行中` | 子Issue作業中 | `issue-work` Phase A | いいえ |
| `✅ 完了 ([PR#N](URL))` | 子Issue完了 | `issue-close` Step 8 | はい |
| `❌ 対処不要` | 対処不要（手動設定） | ユーザー手動 | はい |

## 親Epic検出

子Issue本文から `Parent: #{N}` パターンを検出し、`{N}` を親Epic Issue番号として扱う。

- `Parent:` パターンなし → 親Epicなし。ステータス更新をスキップ（エラーにしない）
- `Parent: #N` の `#` は省略可能（`Parent: 42` も有効）

## ステータス更新プロトコル

### issue-work: 進行中更新（Phase A）

**単一Issueモード**:
1. 子Issue本文から `Parent: #{N}` を検出
2. 親Epicが存在しない → スキップ
3. `gh issue view {N}` でEpic本文を取得（`gh-cli-best-practices` 準拠）
4. 正規表現で該当子Issue行を特定・置換（後述「正規表現パターン」の新4列/旧4列形式に対応）:
   - 新4列: `(\| \d+-\d+ \| #{child_issue} \| )☐ 未着手 (\|)` → `$1🔄 進行中 $2`
   - 旧4列: `(\| \d+ \| #{child_issue} \| [^|]* \| )☐ 未着手 (\|)` → `$1🔄 進行中 $2`
5. 既に `🔄 進行中`、`✅ 完了`、または `❌ 対処不要` の場合 → スキップ（べき等性）
6. `gh issue edit {N} --body-file {temp}` でEpic本文を更新
7. 更新失敗時 → 警告表示して `issue-work` 自体は継続（フォールバック）

**多重Issueモード**:
- 親エージェントが各Wave開始前に、該当Wave内の全子IssueのEpicステータスを一括更新
- サブエージェントによる同時更新の競合を回避
- 一括更新順序: 子Issue番号の昇順

### issue-close: 完了更新（Step 8）

`issue-close` Step 8 の既存実装を変更しない:
- `✅ 完了` への更新・Epic自動クローズ判定は既存手順のまま
- 本スキルは知識ベースとして参照されるのみ

## 正規表現パターン

Epic本文のステータス追跡テーブルは以下の2形式をサポートする:

### 新4列形式（# / Issue / ステータス / 内容）

```markdown
| # | Issue | ステータス | 内容 |
|---|-------|-----------|------|
| 1-1 | #42 | ☐ 未着手 | 子Issueの概要 |
| 1-2 | #43 | 🔄 進行中 | 子Issueの概要 |
| 1-3 | #44 | ✅ 完了 ([PR#100](https://...)) | 子Issueの概要 |
| 1-4 | #45 | ❌ 対処不要 | 子Issueの概要 |
```

### 旧4列形式（# / Issue / タイトル / ステータス）

```markdown
| # | Issue | タイトル | ステータス |
|---|-------|----------|-----------|
| 1 | #42 | 子Issueの概要 | ☐ 未着手 |
| 2 | #43 | 子Issueの概要 | 🔄 進行中 |
| 3 | #44 | 子Issueの概要 | ✅ 完了 ([PR#99](https://github.com/...)) |
| 4 | #45 | 子Issueの概要 | ❌ 対処不要 |
```

### 新4列形式: 未着手 → 進行中

```
検索: (\| \d+-\d+ \| #{child_issue} \| )☐ 未着手 (\|)
置換: $1🔄 進行中 $2
```

### 新4列形式: 進行中/未着手 → 完了

```
検索: (\| \d+-\d+ \| #{child_issue} \| )(☐ 未着手|🔄 進行中) (\|)
置換: $1✅ 完了 ([PR#{pr_number}]({pr_url})) $3
```

### 旧4列形式: 未着手 → 進行中

```
検索: (\| \d+ \| #{child_issue} \| [^|]* \| )☐ 未着手 (\|)
置換: $1🔄 進行中 $2
```

### 旧4列形式: 進行中/未着手 → 完了

```
検索: (\| \d+ \| #{child_issue} \| [^|]* \| )(☐ 未着手|🔄 進行中) (\|)
置換: $1✅ 完了 ([PR#{pr_number}]({pr_url})) $3
```

### 完了状態のべき等性確認

`✅ 完了` はPRリンク付き `✅ 完了 ([PR#N](...))` の場合もあるため、
べき等性確認時は `✅ 完了` で前方一致させる:

```
旧4列形式:
検索: \| \d+ \| #{child_issue} \|[^|]*\| ✅ 完了

新4列形式:
検索: \| \d+-\d+ \| #{child_issue} \| ✅ 完了
```

### べき等性確認

更新前に現在のステータス値を確認:
- 対象行が既に目標ステータス → スキップ
- 対象行が不存在 → 警告表示してスキップ
- `❌ 対処不要` の行 → 更新対象外（スキップ）

## See Also

- **gh-cli-best-practices**: `--body-file` 使用、安全な読み取り手順
- **issue-lifecycle**: Epic振る舞いルール、進捗追跡テーブル定義
