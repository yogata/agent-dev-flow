---
name: agentdev-epic-tracker
description: Updates parent Epic Issue status tracking tables across case-run and case-close workflows. USE FOR: updating Epic status to in-progress or completed, tracking child Issue progress in parent Epics, detecting parent-child relationships via Parent: #N patterns. DO NOT USE FOR: creating Epics, managing non-Epic Issues, or general Issue operations.
---

# Epic Status Tracker

親Epic Issueのステータス追跡テーブル（☐ 未着手 / 🔄 進行中 / ✅ 完了 / ❌ 対処不要 / ⏭ スキップ）を更新する知識ベース。

- **参照元**: `case-run`（進行中更新）、`case-close`（完了更新）
- **特性**: 宣言的定義のみ提供。手順・手続きは各コマンド定義に委ねる

## ステータス値定義

| 値 | 意味 | 設定タイミング | 終了状態 |
|---|---|---|---|
| `☐ 未着手` | 子Issue未着手 | Epic作成時（初期値） | いいえ |
| `🔄 進行中` | 子Issue作業中 | `case-run` 実行中 | いいえ |
| `✅ 完了 ([PR#N](URL))` | 子Issue完了 | `case-close` 完了時 | はい |
| `❌ 対処不要` | 対処不要（手動設定） | ユーザー手動 | はい |
| `⏭ スキップ` | 前提条件未達・依存関係未充足等で Orchestrator がスキップした子Issue。手動操作では使用不可（Orchestratorのみ設定可能） | Epic Orchestrator（Wave完了時） | はい |

## 親Epic検出

子Issue本文から `Parent: #{N}` パターンを検出し、`{N}` を親Epic Issue番号として扱う。

- `Parent:` パターンなし → 親Epicなし。ステータス更新をスキップ（エラーにしない）
- `Parent: #N` の `#` は省略可能（`Parent: 42` も有効）

## ステータス更新プロトコル

### case-run: 進行中更新

**単一Issueモード**:
1. 子Issue本文から `Parent: #{N}` を検出
2. 親Epicが存在しない → スキップ
3. `gh issue view {N}` でEpic本文を取得（`agentdev-gh-cli` 準拠）
4. 正規表現で該当子Issue行を特定・置換（後述「正規表現パターン」の新4列/旧4列形式に対応）:
   - 新4列: `(\| \d+-\d+ \| #{child_issue} \| )☐ 未着手 (\|)` → `$1🔄 進行中 $2`
   - 旧4列: `(\| \d+ \| #{child_issue} \| [^|]* \| )☐ 未着手 (\|)` → `$1🔄 進行中 $2`
5. 既に `🔄 進行中`、`✅ 完了`、`❌ 対処不要`、または `⏭ スキップ` の場合 → スキップ（べき等性）
6. `gh issue edit {N} --body-file {temp}` でEpic本文を更新
7. 更新失敗時 → 警告表示して `case-run` 自体は継続（フォールバック）

**Epic Orchestratorモード（Wave一括更新）**:

Epic Orchestrator は各 Wave 開始時に対象子 Issue の Epic ステータスを一括更新する。サブエージェントによる同時更新の競合を回避するため、親エージェントが一括処理を担う。

Wave開始時一括更新（`☐ 未着手` → `🔄 進行中`）:
1. Wave テーブルから該当 Wave の子 Issue 番号を抽出
2. 親Epic本文を取得（`gh issue view {epic_N}`）
3. 子Issue番号の昇順で、各子Issue行を一括置換:
   - 新4列: `(\| \d+-\d+ \| #{child_issue} \| )☐ 未着手 (\|)` → `$1🔄 進行中 $2`
   - 旧4列: `(\| \d+ \| #{child_issue} \| [^|]* \| )☐ 未着手 (\|)` → `$1🔄 進行中 $2`
4. 既に `🔄 進行中`、`✅ 完了`、`❌ 対処不要`、または `⏭ スキップ` の場合 → スキップ（べき等性）
5. `gh issue edit {epic_N} --body-file {temp}` でEpic本文を一括更新

Wave完了時ステータス更新:
- 成功した子Issue: `🔄 進行中` → `✅ 完了 ([PR#{pr_number}]({pr_url}))` （`case-close` で実行）
- 失敗した子Issue: `🔄 進行中` を維持（再実行可能にするため）
- スキップされた子Issue: `🔄 進行中` → `⏭ スキップ` （Orchestratorのみ設定、手動操作では使用不可）

一括更新順序: 子Issue番号の昇順

### case-close: 完了更新

`case-close` の既存実装を変更しない:
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
- `⏭ スキップ` の行 → 更新対象外（スキップ）

## See Also

- **agentdev-gh-cli**
- **agentdev-workflow-lifecycle**: Epic振る舞いルール・進捗追跡テーブル定義

## Merge Conflict 対応パターン

### Epicステータス更新時のmerge関連考慮事項

#### 1. PR merge前後のEpic状態遷移

Epicステータス更新はPRのmerge前後で一貫性を保つ必要がある:

**merge前（case-run 実行中）**:
- 子Issueを `☐ 未着手` → `🔄 進行中` に更新
- 親Epic本文を取得し、該当子Issue行を更新

**merge後（case-close 完了時）**:
- 子Issueを `🔄 進行中` → `✅ 完了 ([PR#N](URL))` に更新
- PR番号とURLを含める

**状態遷移の一貫性チェック**:
```markdown
## Epicステータス更新チェック

**子Issue**: #{child_issue}
**更新前ステータス**: {previous_status}
**更新後ステータス**: {new_status}
**PR番号**: #{pr_number}
**更新タイミング**: {timing（前/後）}
**一貫性**: ✅ OK / ❌ NG
```

#### 2. merge失敗がEpic進捗に与える影響

PR mergeに失敗した場合、Epicステータスの整合性を保つ:

**merge失敗時の対応**:

| 失敗タイミング | Epicステータス | 対応 |
|--------------|----------------|------|
| PR作成前（conflict検出） | 変更なし | PR作成を停止 |
| PR作成後、merge前 | `🔄 進行中` | status維持（完了しない） |
| merge時（conflict発生） | `🔄 進行中` | status維持、解決後に再試行 |
| merge時（CI失敗等） | `🔄 進行中` | status維持、問題修正後に再試行 |

**重要**: merge失敗時はステータスを `✅ 完了` にしない。`🔄 進行中` を維持し、再実行可能にする。

**失敗報告フォーマット**:
```markdown
## PR Merge 失敗時の Epic ステータス対応

**PR番号**: #{pr_number}
**Epic番号**: #{epic_number}
**子Issue**: #{child_issue}
**現在ステータス**: 🔄 進行中
**失敗理由**: {failure_reason}
**対応**: ステータスを維持（🔄 進行中）、問題解決後に再実行
```

#### 3. Epic本文のconflictリスク

Epic本文は複数の子Issueから並行して更新される可能性があるため、conflictリスクが高い:

**conflictリスク**:
- 複数の子Issueが同時にEpicステータスを更新
- 同じEpic内の複数のWaveが並列実行される場合
- 手動でのEpic編集と自動更新が競合

**conflict予防**:
1. **Wave単位の一括更新**（Epic Orchestratorモード）:
   - Wave開始時にEpicステータスを一括更新
   - Wave完了時にステータスを一括更新
   - サブエージェントによる同時更新を回避

2. **更新順序の制御**:
   - 子Issue番号の昇順で更新
   - 同一Wave内の更新は親エージェントが一括処理

3. **更新失敗時のフォールバック**:
   ```markdown
   ## Epic 更新失敗フォールバック

   **Epic番号**: #{epic_number}
   **更新対象**: #{child_issue}
   **失敗理由**: {failure_reason}
   **対応**: 警告表示して継続（フォールバック）
   **注意**: Epicステータスが古い可能性があります
   ```

**conflict解決手順**:
1. `gh issue view {epic_number}` で最新のEpic本文を取得
2. 正規表現で該当子Issue行を特定
3. ステータス値を更新（べき等性を確認）
4. `gh issue edit {epic_number} --body-file {temp}` で更新
5. 更新失敗時は警告表示して継続
