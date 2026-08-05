# Epic 状態追跡テーブルの正規表現と merge conflict 対応

本ファイルは `agentdev-epic-tracker` SKILL.md の補助資料であり、Epic Issue 本文ステータス追跡テーブルの正規表現パターン（新4列/旧4列形式、pending → completed/blocked/failed 置換、べき等性確認）と、PR merge 前後の Epic 状態遷移、merge 失敗時の対応、conflict リスクと解決手順を扱う。SKILL.md 本文ではステータス値定義、単一書き手、更新プロトコルの概要のみを提示し、正規表現と回復手順は本ファイルを参照する。

## 目次

- [正規表現パターン](#正規表現パターン)
- [新4列形式: pending → completed](#新4列形式-pending--completed)
- [新4列形式: pending → blocked/ failed](#新4列形式-pending--blocked-failed)
- [旧4列形式: pending → completed](#旧4列形式-pending--completed)
- [旧4列形式: pending → blocked/ failed](#旧4列形式-pending--blocked-failed)
- [完了状態のべき等性確認](#完了状態のべき等性確認)
- [べき等性確認](#べき等性確認)
- [PR merge 前後のEpic状態遷移](#pr-merge-前後のepic状態遷移)
- [merge失敗がEpic進捗に与える影響](#merge失敗がepic進捗に与える影響)
- [Epic本文のconflictリスク](#epic本文のconflictリスク)

## 正規表現パターン

Epic本文のステータス追跡テーブルは以下の2形式をサポートする。
Epic Issue 本文（永続状態）に書き込まれるステータス値は `pending`/ `completed`/ `blocked`/ `failed` のみ（`ready`/ `running` は case-run(#epic) の内部状態のため永続状態に書き込まれない）。

### 新4列形式（#/ Issue/ ステータス/ 内容）

```markdown
| # | Issue | ステータス | 内容 |
|---|-------|-----------|------|
| 1-1 | #42 | pending | 子Issueの概要 |
| 1-2 | #43 | completed ([PR#100](https://...)) | 子Issueの概要 |
| 1-3 | #44 | blocked | 子Issueの概要 |
| 1-4 | #45 | failed | 子Issueの概要 |
```

### 旧4列形式（#/ Issue/ タイトル/ ステータス）

```markdown
| # | Issue | タイトル | ステータス |
|---|-------|----------|-----------|
| 1 | #42 | 子Issueの概要 | pending |
| 2 | #43 | 子Issueの概要 | completed ([PR#99](https://github.com/...)) |
| 3 | #44 | 子Issueの概要 | blocked |
| 4 | #45 | 子Issueの概要 | failed |
```

## 新4列形式: pending → completed

```
検索: (\| \d+-\d+ \| #{child_issue} \| )pending (\|)
置換: $1completed ([PR#{pr_number}]({pr_url})) $2
```

## 新4列形式: pending → blocked/ failed

```
検索: (\| \d+-\d+ \| #{child_issue} \| )pending (\|)
置換: $1{terminal_status} $2
```

`{terminal_status}` は `blocked` または `failed`。

## 旧4列形式: pending → completed

```
検索: (\| \d+ \| #{child_issue} \| [^|]* \| )pending (\|)
置換: $1completed ([PR#{pr_number}]({pr_url})) $2
```

## 旧4列形式: pending → blocked/ failed

```
検索: (\| \d+ \| #{child_issue} \| [^|]* \| )pending (\|)
置換: $1{terminal_status} $2
```

## 完了状態のべき等性確認

`completed` はPRリンク付き `completed ([PR#N](...))` の場合もあるため、べき等性確認時は `completed` で前方一致させる:

```
旧4列形式:
検索: \| \d+ \| #{child_issue} \|[^|]*\| completed

新4列形式:
検索: \| \d+-\d+ \| #{child_issue} \| completed
```

## べき等性確認

更新前に現在のステータス値を確認:
- 対象行が既に目標ステータス → スキップ
- 対象行が不存在 → 警告表示してスキップ
- `completed` の行 → 更新対象外（スキップ）
- `blocked`/ `failed` の行 → case-close による `completed` 上書きの対象外（スキップ）

## PR merge 前後のEpic状態遷移

Epic Issue 本文（永続状態）の書き込みは case-close(#epic) のみが行う（単一書き手、ADR）。
`ready`/ `running` は case-run(#epic) の内部状態であり、Epic Issue 本文には書き込まれない。

**case-run(#epic) 実行中（merge前、Epic Issue 本文不変）**:
- 子Issue の `ready`/ `running` は case-run(#epic) の内部状態として追跡（Epic Issue 本文には書き込まない）
- Epic Issue 本文ステータス追跡テーブルは `pending` のまま

**case-close(#epic) 完了時（merge後、Epic Issue 本文更新）**:
- 子Issue を `pending` → `completed ([PR#N](URL))`/ `blocked`/ `failed` に更新
- PR番号とURLを含める（`completed` の場合）

**状態遷移の一貫性チェック**:
```markdown
## Epicステータス更新チェック

**子Issue**: #{child_issue}
**更新前ステータス**: pending
**更新後ステータス**: {new_status（completed/blocked/failed）}
**PR番号**: #{pr_number}
**更新タイミング**: case-close(#epic) 完了時
**一貫性**: OK / NG
```

## merge失敗がEpic進捗に与える影響

PR mergeに失敗した場合、Epicステータスの整合性を保つ。Epic Issue 本文は case-close が完了するまで更新されないため、merge失敗時は `pending` が維持される:

**merge失敗時の対応**:

| 失敗タイミング | Epic Issue 本文ステータス | case-run(#epic) 内部状態 | 対応 |
|---|---|---|---|
| PR作成前（conflict検出） | `pending` | `ready`/ `running` | PR作成を停止 |
| PR作成後、merge前 | `pending` | `running` | 内部状態維持（Epic 本文不変） |
| merge時（conflict発生） | `pending` | `running` | 内部状態維持、解決後に再試行 |
| merge時（CI失敗等） | `pending` | `running` | 内部状態維持、問題修正後に再試行 |

**重要**: merge失敗時は Epic Issue 本文を更新しない（`pending` を維持）。case-close(#epic) が実行結果として失敗を確定した場合のみ `failed`/ `blocked` を書き込む。`running` は case-run(#epic) の内部状態であり、Epic Issue 本文には現れない。

**失敗報告フォーマット**:
```markdown
## PR Merge 失敗時の Epic ステータス対応

**PR番号**: #{pr_number}
**Epic番号**: #{epic_number}
**子Issue**: #{child_issue}
**Epic Issue 本文ステータス**: pending（維持）
**case-run(#epic) 内部状態**: running
**失敗理由**: {failure_reason}
**対応**: case-close(#epic) が失敗を確定するまで Epic Issue 本文は保留
```

## Epic本文のconflictリスク

Epic Issue 本文の書き込みは case-close(#epic) が単一書き手（ADR）であるため、サブエージェント間の同時書き込みConflictは発生しない。残るConflictリスクは case-close(#epic) 書き込みと手動編集の競合のみ:

**conflictリスク**:
- case-close(#epic) の Epic 本文更新と手動編集の競合
- case-close(#epic) 実行中にユーザーが手動でステータスを変更

**conflict予防**:
1. **case-close(#epic) 単一書き手の維持**:
   - Wave 完了時に case-close(#epic) が一括更新（子Issue番号昇順）
   - case-run(#epic)、case-auto は Epic Issue 本文に書き込まない

2. **更新順序の制御**:
   - 子Issue番号の昇順で更新
   - 同一Wave内の完了子Issue 更新は case-close(#epic) が一括処理

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
1. Issue 本文読込手続き（`agentdev-gh-cli`）で最新のEpic本文を取得
2. 正規表現で該当子Issue行を特定
3. ステータス値を更新（べき等性を確認）
4. Issue 本文更新手続き（`agentdev-gh-cli`）で更新
5. 更新失敗時は警告表示して継続
