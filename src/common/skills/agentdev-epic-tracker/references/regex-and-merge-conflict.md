# Epic 実行構成表の正規表現と merge conflict 対応

本ファイルは `agentdev-epic-tracker` SKILL.md の補助資料であり、Epic Issue 本文実行構成表（`| Wave | Issue | 前提 | 状態 |`）の正規表現パターン（pending → completed/blocked/failed 置換、べき等性確認、再試行の pending 戻し）と、PR merge 前後の Epic 状態遷移、merge 失敗時の対応、conflict リスクと解決手順を扱う。
SKILL.md 本文では子状態値定義、単一書き手、更新プロトコルの概要のみを提示し、正規表現と回復手順は本ファイルを参照する。
旧4列形式（`#` / `Issue` / `ステータス` / `内容`、`#` / `Issue` / `タイトル` / `ステータス`）の後方互換検出は行わない（新形式を唯一の現行形式とする）。

## 目次

- [正規表現パターン](#正規表現パターン)
- [テンプレート群との正規形一元化](#テンプレート群との正規形一元化)
- [pending → completed](#pending--completed)
- [pending → blocked/ failed](#pending--blocked-failed)
- [再試行の pending 戻し](#再試行の-pending-戻し)
- [終端子状態のべき等性確認](#終端子状態のべき等性確認)
- [PR merge 前後のEpic状態遷移](#pr-merge-前後のepic状態遷移)
- [merge失敗がEpic進捗に与える影響](#merge失敗がepic進捗に与える影響)
- [Epic本文のconflictリスク](#epic本文のconflictリスク)

## 正規表現パターン

Epic本文の実行構成表は1形式のみである。
実行構成表（永続状態）に書き込まれる子状態値は `pending`/ `completed`/ `blocked`/ `failed` のみ。PR 番号・URL は状態列に付記せず、子 Issue の結果・PR 自体から取得する。

```markdown
| Wave | Issue | 前提 | 状態 |
|------|-------|------|------|
| 1 | #42 | - | pending |
| 1 | #43 | - | completed |
| 2 | #44 | #42 | blocked |
| 2 | #45 | #42 | failed |
```

## テンプレート群との正規形一元化

`agentdev-workflow-templates` のテンプレート群（`issue_desc_epic.md`、`issue_desc_child.md`）と本スキルの形式は次の正規形へ一元化する。

| 対象 | 正規形（テンプレートが生成） |
|---|---|
| Parent 配置 | 子Issue 本文の先頭行に `親Epic: #N`。旧形式（`Parent: #N`、`## 親Issue` セクション配置）を後方互換で読み続けない |
| 実行構成 | `| Wave | Issue | 前提 | 状態 |` の一表。本文に一つだけ存在する。Wave = 所属 Wave 番号（整数）、Issue 列 = `#N` のみ（OU ID 等の付記は前提列または子 Issue 本文へ）、子状態初期値 `pending` |

子Issue のタイトル書式は `<workflows/issue-title-policy>` Design（Issue タイトル記述規則）に従う。本スキルの実行構成表更新は Issue 列の `#N` 参照を正とし、タイトル文字列の解析から実行順序を決定しない。

行特定には、Wave 列の整数と Issue 列の `#N` のみを許容するパターンを使用する:

```
検索: (\| \d+ \| #{child_issue} \| )pending (\|)
置換: $1completed $2
```

`pending` → `blocked`/ `failed` は同じ検索パターンで `{terminal_status}` に置換する。

## pending → completed

```
検索: (\| \d+ \| #{child_issue} \| )pending (\|)
置換: $1completed $2
```

## pending → blocked/ failed

```
検索: (\| \d+ \| #{child_issue} \| )pending (\|)
置換: $1{terminal_status} $2
```

`{terminal_status}` は `blocked` または `failed`。

## 再試行の pending 戻し

子 Issue の再試行は、継続条件の成立と旧実行の終了確認を経て子状態を `pending` へ戻す。

```
検索: (\| \d+ \| #{child_issue} \| [^|]*\| )blocked (\|)
置換: $1pending $2
```

- `failed` も同じパターンで `pending` へ戻す
- `completed` は終端であり pending へ戻さない（completed 戻し禁止）。戻し要求は終端状態確認で拒否する
- 継続条件の成立・旧実行の終了確認の判断は意味判断であり、実行側 workflow が行う。決定的な置換は `resetChildToPending`、CLI は `reflect.ts reset` を使用する
- 戻し後の再実行は新規の実行として扱い、旧実行の記録（記録コメント、集約エントリ）を消さない

## 終端子状態のべき等性確認

更新前に現在の子状態値を確認:
- 対象行が既に目標子状態 → スキップ
- 対象行が不存在 → 警告表示してスキップ
- `completed` の行 → 更新対象外（スキップ）
- `blocked`/ `failed` の行 → case-close による `completed` 上書きの対象外（スキップ）

べき等性確認のパターン:

```
検索: \| \d+ \| #{child_issue} \| [^|]*\| (completed|blocked|failed)
```

## PR merge 前後のEpic状態遷移

Epic Issue 本文（永続状態）の書き込みは case-close(#epic) が行う（単一書き手）。
`ready`/ `running` は runtime 実行状態であり、Epic Issue 本文には書き込まれない。

**子 Issue 実行中（case-auto stage 3 のインライン case-run。merge前、Epic Issue 本文不変）**:
- 子Issue の実行の生存状況は case-auto stage 3 の runtime 状態として追跡（Epic Issue 本文には書き込まない）
- Epic Issue 本文実行構成表は `pending` のまま

**case-close(#epic) 完了時（merge後、Epic Issue 本文更新）**:
- 子Issue を `pending` → `completed`/ `blocked`/ `failed` に更新
- 子状態4値のみを書き込み、PR 番号・URL は付記しない

**状態遷移の一貫性チェック**:
```markdown
## Epic状態更新チェック

**子Issue**: #{child_issue}
**更新前子状態**: pending
**更新後子状態**: {new_status（completed/blocked/failed）}
**更新タイミング**: case-close(#epic) 完了時
**一貫性**: OK / NG
```

## merge失敗がEpic進捗に与える影響

PR mergeに失敗した場合、Epic状態の整合性を保つ。Epic Issue 本文は case-close が完了するまで更新されないため、merge失敗時は `pending` が維持される:

**merge失敗時の対応**:

| 失敗タイミング | Epic Issue 本文子状態 | stage 3 runtime 状態 | 対応 |
|---|---|---|---|
| PR作成前（conflict検出） | `pending` | 実行中 | PR作成を停止 |
| PR作成後、merge前 | `pending` | 実行中 | runtime 状態維持（Epic 本文不変） |
| merge時（conflict発生） | `pending` | 実行中 | runtime 状態維持、解決後に再試行 |
| merge時（CI失敗等） | `pending` | 実行中 | runtime 状態維持、問題修正後に再試行 |

**重要**: merge失敗時は Epic Issue 本文を更新しない（`pending` を維持）。
case-close(#epic) が実行結果として失敗を確定した場合のみ `failed`/ `blocked` を書き込む。

**失敗報告フォーマット**:
```markdown
## PR Merge 失敗時の Epic 状態対応

**PR番号**: #{pr_number}
**Epic番号**: #{epic_number}
**子Issue**: #{child_issue}
**Epic Issue 本文子状態**: pending（維持）
**失敗理由**: {failure_reason}
**対応**: case-close(#epic) が失敗を確定するまで Epic Issue 本文は保留
```

## Epic本文のconflictリスク

Epic Issue 本文の書き込みは case-close(#epic) と取りまとめ反映の2系統であり、per-Epic 排他制御の下で局所直列化される。残るConflictリスクは手動編集との競合のみ:

**conflictリスク**:
- 書き込み系統の Epic 本文更新と手動編集の競合
- 更新実行中にユーザーが手動で子状態を変更

**conflict予防**:
1. **per-Epic 単一書き手の維持**:
   - Wave 完了時に case-close(#epic) が一括更新（子Issue番号昇順）
   - 子 Issue の実行（case-auto stage 3 のインライン case-run）、Wave 反復制御としての case-auto は Epic Issue 本文に書き込まない

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
   **注意**: Epic状態が古い可能性があります
   ```

**conflict解決手順**:
1. `agentdev_gh` の issue_read 操作で最新のEpic本文を取得
2. 正規表現で該当子Issue行を特定
3. 子状態値を更新（べき等性を確認）
4. `agentdev_gh` の issue_update 操作で更新
5. 更新失敗時は警告表示して継続
