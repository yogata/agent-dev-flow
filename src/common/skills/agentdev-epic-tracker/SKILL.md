---
name: agentdev-epic-tracker
description: "Updates parent Epic Issue status tracking tables (case-close single-writer) and reflects coordination progress per record triggers under the per-Epic exclusive write gate. USE FOR: case-close Epic status writes (pending→completed/blocked/failed), coordination reflect writes per record trigger (start/handoff/hold/resume/decision_change/completion), per-Epic serialization between closing and coordination writes, lost-update prevention via latest-fetch/merge/update, overall completion evaluation. DO NOT USE FOR: creating Epics, non-Epic Issues, general Issue operations."
---

# Epic 状態追跡（Epic Status Tracker）

親Epic Issueのステータス追跡テーブル（`pending`/ `completed`/ `blocked`/ `failed`）を更新し、Case Issue 工程記録の取りまとめによる記録契機別の反映を per-Epic の単一書き手排他制御の下で Epic Issue 本文へ書き込む知識ベースである。
`ready`/ `running` は case-run(#epic) の内部状態であり、ステータス追跡テーブル（永続状態）には書き込まれない（Decision 単一書き手制約、v4-lifecycle-state-machine Design「二層状態モデル」参照）。ただし進行状態の表示は「取りまとめによる記録契機別 Epic 反映」の集約セクションに現れる（進行状態の写像は workflows/issue-lifecycle-records Design による）。

- **参照元**: `case-close`（completed/ blocked/ failed 更新、closing 書き込み）。`case-auto` 等の進行スキル（記録契機に応じた取りまとめ反映の書き込み）。`case-run` は Epic Issue 本文を読み取るのみで書き込まない
- **`⏭スキップ` は採用しない**。前提未達の Issue は `pending` のまま選択対象外となる。Wave status は保存せず、Wave 内 Issue 状態から導出する
- **決定的エンジン**: `scripts/lib/`（追跡テーブル解析・集約マージ・直列化 gate・全体条件評価）、`scripts/src/reflect.ts`（CLI 入口）

## 入力

- 子Issue 本文（`Parent: #{N}` パターン）、子Issue の実行結果（completed-pr/ blocked/ failed）、PR 番号/ URL

## 出力

- 更新された親Epic Issue 本文のステータス追跡テーブル行（`pending` → `completed ([PR#N](URL))`/ `blocked`/ `failed`）

## 副作用

- 親Epic Issue 本文を更新する（`agentdev_gh` の issue_update 操作経由）。子Issue 本文、PR は更新しない

## 常に守る不変条件

- **per-Epic 単一書き手**: Epic Issue 本文の書き込みは per-Epic の単一書き手として排他制御される。書き手は closing 書き込み（case-close(#epic)）と、工程記録の取りまとめによる記録契機別反映の書き込みの2系統であり、両者は同一の排他制御・局所直列化の下で直列化される。case-run(#epic)、Wave 反復制御としての case-auto は書き込まない
- **永続状態に書き込むステータス値**: ステータス追跡テーブルに書き込むステータス値は `pending`/ `completed`/ `blocked`/ `failed` のみ。`ready`/ `running` は case-run(#epic) の内部状態であり、追跡テーブルには書き込まれない。進行状態の表示は集約セクションに記録する
- **べき等性**: 既に `completed`/ `blocked`/ `failed` の追跡テーブル行は更新対象外（スキップ）。closing 書き込みも取りまとめ書き込みも確定済み終了状態を上書きしない
- **一括更新順序**: 複数子Issueの一括更新時は子Issue番号の昇順。集約エントリも子Issue番号昇順へ正規化する
- **最新取得→マージ→更新**: Epic Issue 本文への全ての書き込みは直列化区間の内部で最新本文を取得し、その本文に対して部分更新（該当子の行・エントリのみ）を適用してから書き込む。事前に読んだ古い本文を書き戻さない

## ステータス値定義

子Issue 実行状態 enum（v4-lifecycle-state-machine Design「二層状態モデル」「階層合成」参照）:

| 値 | 意味 | 設定主体 | 終了状態 |
|---|---|---|---|
| `pending` | 依存 Issue または前 Wave の完了待ち。異常ではない | case-open（初期値） | いいえ |
| `ready` | 依存が満たされ、case-run(#epic) が実行可能と判定した状態。**永続状態には書き込まれない** | case-run 内部判定（永続状態に書き込まない） | いいえ |
| `running` | case-run(#epic) が委譲起動し実行中の状態。**永続状態には書き込まれない** | case-run 内部状態（永続状態に書き込まない） | いいえ |
| `completed` | Issue の実装、検証、必要な case-close が完了した状態 | case-close | はい |
| `blocked` | 要件曖昧性、外部副作用、権限不足、矛盾等により自動継続できない状態 | case-close（実行結果から確定） | はい |
| `failed` | 実装、検証、CI、PR 作成などの実行結果として失敗した状態 | case-close（実行結果から確定） | はい |

Epic自動クローズ判定では `completed` を終了状態として扱う（`blocked`/ `failed` は終了状態だが自動クローズ完了とはみなさない）。

**永続状態遷移**: Epic Issue 本文（永続状態）に書き込まれるのは `pending` → `completed`/ `blocked`/ `failed` の遷移に加え、取りまとめによる記録契機別の集約セクション更新（下記「取りまとめによる記録契機別 Epic 反映」）である。

## 取りまとめによる記録契機別 Epic 反映

進行スキル（case-auto 等）が Case Issue 工程記録の取りまとめとして、記録契機（着手、引き渡し、停止、再開、判断変更、完了）に応じて子状態集約と全体条件評価を Epic Issue 本文へ反映する書き込み経路である。

| 記録契機 | 反映内容 |
|---|---|
| `start`（着手） | 当該子の集約エントリを進行状態 `running` で追加/更新（委譲要求と実着手を同一視しない） |
| `handoff`（引き渡し） | 残作業と受取役割（`next`、`owner`）を集約エントリへ反映 |
| `hold`（停止） | 進行状態 `waiting` と再開条件（`reason`、`next`）を反映。工程終了を待たない |
| `resume`（再開） | 進行状態 `running` へ復帰し、待機理由を解消 |
| `decision_change`（判断変更） | 撤回対象と適用方針（`reason`、`next`）を反映 |
| `completion`（完了） | 進行状態 `ended` と終了区分・判定根拠（`ended`、`basis`、`pr`）を反映。追跡テーブル行の終了状態書き込みは closing 書き込み（case-close）が行う |

反映の様式:

- 子状態集約は機械可読な HTML コメントブロック（`agentdev:epic-reflect`）として Epic 本文へ保持する（表示に影響しない、1子1エントリ）
- エントリの更新は該当子のエントリのみを対象とし、他の子のエントリを保持する（完了順序に依存しない集約。エントリは子Issue番号昇順へ正規化）
- 決定的な集約・様式の生成は `scripts/lib/epic-reflect.ts`、CLI は `scripts/src/reflect.ts` を使用する

## per-Epic 単一書き手の排他制御と直列化

closing 書き込み（case-close）と取りまとめ反映の書き込みは、Epic Issue 本文単位の同一排他制御の下で局所直列化される。

- 直列化の単位は Epic Issue 本文単位（per-Epic）。Epic が異なれば並列でよい
- 直列化区間の内部で「最新取得 → マージ → 更新」を行い、区間の外で読んだ本文を書き戻さない（lost update 防止）
- 具体の手順: ①直列化 gate の取得 ②`agentdev_gh` の issue_read で最新本文を取得 ③マージ関数（`applyReflectEntry` / `applyClosingStatus` / `upsertOverallEvaluation`）で部分更新 ④`agentdev_gh` の issue_update で更新 ⑤gate の解放
- 更新失敗時は更新前に読んだ本文へ戻すのではなく、直列化 gate を再取得して最新取得からやり直す（古い本文の書き戻しは lost update の原因）
- lock / queue の実装方式は指定しない（同一プロセス内は `createEpicWriteGate`、プロセス間は再読込ループによる競合検出と再試行で同等の排他を実現する）

## 全体条件評価（子完了と全体完了の区別）

Epic の全体完了判定は子Issueの完了とは区別して記録する。

- 全体条件評価は評価根拠（全子の終了状況、全体条件ごとの達成状況と根拠）付きで機械可読ブロック（`agentdev:epic-overall`）へ記録する
- 全ての子が終了状態でも、全体条件の評価が未実施または未達成の間は全体完了として扱わない
- 子Issueの完了（`completed` 等）は子個々の終了を示すのみであり、それだけで Epic の全体完了判定を行わない
- 評価の計算は `evaluateOverallCompletion`（`scripts/lib/epic-reflect.ts`）で決定的に行う

## 親Epic検出

子Issue本文から `Parent: #{N}` パターンを検出し、`{N}` を親Epic Issue番号として扱う。

- `Parent:` パターンなし → 親Epicなし。ステータス更新をスキップ（エラーにしない）
- `Parent: #N` の `#` は省略可能（`Parent: 42` も有効）

## 主要な判断順序（取りまとめ: 記録契機別反映）

1. 直列化 gate を取得（closing 書き込みと同一の per-Epic 排他制御）
2. `agentdev_gh` の issue_read 操作で最新の Epic 本文を取得
3. 記録契機に対応した子状態報告を集約エントリへマージ（`applyReflectEntry`、該当子のエントリのみ更新）
4. `agentdev_gh` の issue_update 操作で Epic 本文を更新（読み戻し VERIFY）
5. 直列化 gate を解放。更新失敗時は gate を再取得して最新取得からやり直す

## 主要な判断順序（case-close: completed/ blocked/ failed 更新）

1. 子Issue本文から `Parent: #{N}` を検出。親Epicが存在しない → スキップ
2. `agentdev_gh` の issue_read 操作でEpic本文を取得
3. 正規表現で該当子Issue行を特定（新4列/旧4列形式に対応）
4. べき等性確認（既に終了状態ならスキップ）
5. `pending` を置換（completed なら PR番号/ URL 付き、blocked/ failed なら当該ステータス値）
6. `agentdev_gh` の issue_update 操作でEpic本文を更新

`blocked`/ `failed` は case-close が case-run(#epic) の実行結果（`completed-pr`/ `blocked`/ `failed`）から確定して Epic Issue 本文へ反映する終了状態。

## reference選択表

通常経路で全 reference を無条件読込しない。
必要な条件に応じて読む reference を選択する。

| 条件 | 読む reference |
|---|---|
| 新4列/旧4列形式の正規表現パターン、pending → completed/ blocked/ failed の置換、完了状態のべき等性確認、べき等性確認手順が必要な場合 | [references/regex-and-merge-conflict.md](references/regex-and-merge-conflict.md) |
| PR merge 前後の Epic 状態遷移、merge 失敗時の Epic ステータス対応、Epic 本文の conflict リスクと予防、conflict 解決手順、更新失敗フォールバックが必要な場合 | [references/regex-and-merge-conflict.md](references/regex-and-merge-conflict.md) |
| 記録契機別の反映手順、集約セクション様式、per-Epic 排他制御と直列化の手順、最新取得→マージ→更新の規律、全体条件評価の記録様式、部分成功の区別と読み戻し再試行が必要な場合 | [references/epic-reflect-coordination.md](references/epic-reflect-coordination.md) |

## See Also

- Custom Tool `agentdev_gh`（Epic Issue 本文の読み取り・更新）
- **agentdev-workflow-lifecycle**: Epic振る舞いルール、進捗追跡テーブル定義
- **agentdev-workflow-case-close**: closing 書き込み（Epic Wave クローズ E5、per-Epic 単一書き手の直列化相手）
- **workflows/issue-lifecycle-records Design**: 記録契機の判定規則、進行状態の写像、記録様式の正
