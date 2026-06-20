---
name: agentdev-epic-tracker
description: Updates parent Epic Issue status tracking tables across case-run and case-close workflows. USE FOR: updating Epic status to in-progress or completed, tracking child Issue progress in parent Epics, detecting parent-child relationships via Parent: #N patterns. DO NOT USE FOR: creating Epics, managing non-Epic Issues, or general Issue operations.
---

# Epic 状態追跡（Epic Status Tracker）

親Epic Issueのステータス追跡テーブル（`pending` / `ready` / `running` / `completed` / `blocked` / `failed`）を更新する知識ベース。

- **参照元**: `case-auto`（子Issue選択・running 更新）、`case-close`（completed 更新）
- **特性**: 宣言的定義のみ提供。手順・手続きは各コマンド定義に委ねる
- **`⏭スキップ` は採用しない**（REQ-0106-030）。前提未達の Issue は `pending` のまま選択対象外となる。Wave status は保存せず、Wave 内 Issue 状態から導出する

## ステータス値定義

子Issue 実行状態 enum（REQ-0106-030、workflow-contracts.md「子Issue実行状態 enum」参照）:

| 値 | 意味 | 設定主体 | 終了状態 |
|---|---|---|---|
| `pending` | 依存 Issue または前 Wave の完了待ち。異常ではない | case-open（初期値） | いいえ |
| `ready` | 依存が満たされ、case-auto が次に case-run へ渡せる状態 | case-auto | いいえ |
| `running` | case-auto が選択し、case-run が実行中の状態 | case-auto | いいえ |
| `completed` | Issue の実装・検証・必要な case-close が完了した状態 | case-close | はい |
| `blocked` | 要件曖昧性・外部副作用・権限不足・矛盾等により自動継続できない状態 | case-run / case-auto | はい |
| `failed` | 実装・検証・CI・PR 作成などの実行結果として失敗した状態 | case-run | はい |

Epic自動クローズ判定では `completed` を終了状態として扱う（`blocked` / `failed` は終了状態だが自動クローズ完了とはみなさない）。

## 親Epic検出

子Issue本文から `Parent: #{N}` パターンを検出し、`{N}` を親Epic Issue番号として扱う。

- `Parent:` パターンなし → 親Epicなし。ステータス更新をスキップ（エラーにしない）
- `Parent: #N` の `#` は省略可能（`Parent: 42` も有効）

## ステータス更新プロトコル

### case-auto: running 更新（子Issue選択時）

`case-auto` が子Issue を選択して `case-run` に渡す際、当該子Issue を `ready`/`pending` → `running` に更新する:
1. 子Issue本文から `Parent: #{N}` を検出
2. 親Epicが存在しない → スキップ
3. `gh issue view {N}` でEpic本文を取得（`agentdev-gh-cli` 準拠）
4. 正規表現で該当子Issue行を特定・置換（後述「正規表現パターン」の新4列/旧4列形式に対応）:
   - 新4列: `(\| \d+-\d+ \| #{child_issue} \| )(pending|ready) (\|)` → `$1running $2`
   - 旧4列: `(\| \d+ \| #{child_issue} \| [^|]* \| )(pending|ready) (\|)` → `$1running $2`
5. 既に `running`、`completed`、`blocked`、または `failed` の場合 → スキップ（べき等性）
6. `gh issue edit {N} --body-file {temp}` でEpic本文を更新
7. 更新失敗時 → 警告表示して継続（フォールバック）

### case-close: completed 更新

`case-close` 完了時に子Issue を `running` → `completed` に更新する:
1. 子Issue本文から `Parent: #{N}` を検出
2. 親Epicが存在しない → スキップ
3. `gh issue view {N}` でEpic本文を取得（`agentdev-gh-cli` 準拠）
4. 正規表現で該当子Issue行を特定・置換:
   - 新4列: `(\| \d+-\d+ \| #{child_issue} \| )running (\|)` → `$1completed ([PR#{pr_number}]({pr_url})) $2`
   - 旧4列: `(\| \d+ \| #{child_issue} \| [^|]* \| )running (\|)` → `$1completed ([PR#{pr_number}]({pr_url})) $2`
5. 既に `completed` の場合 → スキップ（べき等性）
6. `gh issue edit {N} --body-file {temp}` でEpic本文を更新

`blocked` / `failed` は case-run / case-auto が設定する終了状態。case-close はこれらを `completed` に上書きしない。

一括更新順序（Epic Orchestrator 等の複数子Issue一括更新時）: 子Issue番号の昇順

## 正規表現パターン

Epic本文のステータス追跡テーブルは以下の2形式をサポートする。ステータス値は子Issue 実行状態 enum（`pending` / `ready` / `running` / `completed` / `blocked` / `failed`）を使用する。

### 新4列形式（# / Issue / ステータス / 内容）

```markdown
| # | Issue | ステータス | 内容 |
|---|-------|-----------|------|
| 1-1 | #42 | pending | 子Issueの概要 |
| 1-2 | #43 | running | 子Issueの概要 |
| 1-3 | #44 | completed ([PR#100](https://...)) | 子Issueの概要 |
| 1-4 | #45 | blocked | 子Issueの概要 |
```

### 旧4列形式（# / Issue / タイトル / ステータス）

```markdown
| # | Issue | タイトル | ステータス |
|---|-------|----------|-----------|
| 1 | #42 | 子Issueの概要 | pending |
| 2 | #43 | 子Issueの概要 | running |
| 3 | #44 | 子Issueの概要 | completed ([PR#99](https://github.com/...)) |
| 4 | #45 | 子Issueの概要 | failed |
```

### 新4列形式: pending/ready → running

```
検索: (\| \d+-\d+ \| #{child_issue} \| )(pending|ready) (\|)
置換: $1running $2
```

### 新4列形式: running → completed

```
検索: (\| \d+-\d+ \| #{child_issue} \| )running (\|)
置換: $1completed ([PR#{pr_number}]({pr_url})) $2
```

### 旧4列形式: pending/ready → running

```
検索: (\| \d+ \| #{child_issue} \| [^|]* \| )(pending|ready) (\|)
置換: $1running $2
```

### 旧4列形式: running → completed

```
検索: (\| \d+ \| #{child_issue} \| [^|]* \| )running (\|)
置換: $1completed ([PR#{pr_number}]({pr_url})) $2
```

### 完了状態のべき等性確認

`completed` はPRリンク付き `completed ([PR#N](...))` の場合もあるため、
べき等性確認時は `completed` で前方一致させる:

```
旧4列形式:
検索: \| \d+ \| #{child_issue} \|[^|]*\| completed

新4列形式:
検索: \| \d+-\d+ \| #{child_issue} \| completed
```

### べき等性確認

更新前に現在のステータス値を確認:
- 対象行が既に目標ステータス → スキップ
- 対象行が不存在 → 警告表示してスキップ
- `completed` の行 → 更新対象外（スキップ）
- `blocked` / `failed` の行 → case-close による `completed` 上書きの対象外（スキップ）

## See Also

- **agentdev-gh-cli**
- **agentdev-workflow-lifecycle**: Epic振る舞いルール・進捗追跡テーブル定義

## Merge Conflict 対応パターン

### Epicステータス更新時のmerge関連考慮事項

#### 1. PR merge前後のEpic状態遷移

Epicステータス更新はPRのmerge前後で一貫性を保つ必要がある:

**merge前（case-auto が case-run に子Issue を渡す時）**:
- 子Issueを `pending`/`ready` → `running` に更新
- 親Epic本文を取得し、該当子Issue行を更新

**merge後（case-close 完了時）**:
- 子Issueを `running` → `completed ([PR#N](URL))` に更新
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
| PR作成後、merge前 | `running` | status維持（完了しない） |
| merge時（conflict発生） | `running` | status維持、解決後に再試行 |
| merge時（CI失敗等） | `running` | status維持、問題修正後に再試行 |

**重要**: merge失敗時はステータスを `completed` にしない。`running` を維持し、再実行可能にする。実行結果として失敗が確定した場合は `failed` に遷移する。

**失敗報告フォーマット**:
```markdown
## PR Merge 失敗時の Epic ステータス対応

**PR番号**: #{pr_number}
**Epic番号**: #{epic_number}
**子Issue**: #{child_issue}
**現在ステータス**: running
**失敗理由**: {failure_reason}
**対応**: ステータスを維持（running）、問題解決後に再実行
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
