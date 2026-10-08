---
name: agentdev-epic-tracker
description: "Updates the parent Epic execution table and reflects coordination triggers under a per-Epic write gate. USE FOR: case-close status writes, hold/decision_change/completion reflection, retry reset, serialized updates, lost-update prevention, overall completion evaluation. DO NOT USE FOR: creating Epics, non-Epic Issues, general Issue operations."
---

# Epic 実行構成追跡（Epic Status Tracker）

親Epic Issueの実行構成表（`| Wave | Issue | 前提 | 状態 |`、子状態4値 `pending`/ `completed`/ `blocked`/ `failed`）を更新し、Case Issue 工程記録の取りまとめによる記録契機別の状態反映を per-Epic の単一書き手排他制御の下で Epic Issue 本文へ書き込む知識ベースである。
Epic 本文への書き込みは実行構成の状態反映と全体条件評価の更新に限定される。停止理由・再開条件・判断変更・検証証拠を Epic 本文の隠しブロック等の第二の恒常的状態台帳へ複製しない（記録コメントが正）。
`ready`/ `running` は runtime 実行状態であり、実行構成表（永続状態）には書き込まれない（v4-lifecycle-state-machine Design「二層状態モデル」参照）。実行構成は Epic 本文に一つだけ存在し、Wave 状態・状態別件数を本文へ保存しない。表示用の進行状態4値は廃止されており、進行状況は正規状態と開始・終了日時で表現する（workflows/issue-lifecycle-records Design による）。

- **参照元**: `case-close`（completed/ blocked/ failed 更新、closing 書き込み）。`case-auto` 等の進行スキル（記録契機に応じた取りまとめ反映の書き込み）。`case-run` は Epic Issue 本文を読み取るのみで書き込まない
- **`⏭スキップ` は採用しない**。前提未達の Issue は `pending` のまま選択対象外となる。Wave status は保存せず、Wave 内 Issue 状態から導出する
- **決定的エンジン**: `scripts/lib/`（実行構成表解析・状態反映・直列化 gate・再試行 pending 戻し・全体条件評価）、`scripts/src/reflect.ts`（CLI 入口）

## 入力

- 子Issue 本文（`親Epic: #{N}` パターン）、子Issue の実行結果（completed-pr/ blocked/ failed）

## 出力

- 更新された親Epic Issue 本文の実行構成表の子状態列（`pending` → `completed`/ `blocked`/ `failed`）。PR 番号・URL は状態列に付記せず、子 Issue の結果・PR 自体から取得する

## 副作用

- 親Epic Issue 本文を更新する（`agentdev_gh` の issue_update 操作経由）。子Issue 本文、PR は更新しない

## 常に守る不変条件

- **per-Epic 単一書き手**: Epic Issue 本文の書き込みは per-Epic の単一書き手として排他制御される。書き手は closing 書き込み（case-close(#epic)）と、工程記録の取りまとめによる記録契機別反映の書き込みの2系統であり、両者は同一の排他制御・局所直列化の下で直列化される。子 Issue の実行（case-auto stage 3 のインライン case-run）、Wave 反復制御としての case-auto は書き込まない。独立した子 Issue の作業を全体で直列化しない
- **永続状態に書き込む子状態値**: 実行構成表に書き込む子状態値は `pending`/ `completed`/ `blocked`/ `failed` のみ。`ready`/ `running` は runtime 実行状態であり、実行構成表には書き込まれない
- **べき等性**: 既に `completed`/ `blocked`/ `failed` の実行構成表行は更新対象外（スキップ）。closing 書き込みも取りまとめ書き込みも確定済み終端子状態を上書きしない
- **一括更新順序**: 複数子Issueの一括更新時は子Issue番号の昇順
- **最新取得→マージ→更新**: Epic Issue 本文への全ての書き込みは直列化区間の内部で最新本文を取得し、その本文に対して部分更新（該当子の行のみ）を適用してから書き込む。事前に読んだ古い本文を書き戻さない

## 子状態値定義

子Issue 実行状態 enum（v4-lifecycle-state-machine Design「二層状態モデル」「階層合成」参照）:

| 値 | 意味 | 設定主体 | 終端状態 |
|---|---|---|---|
| `pending` | 依存 Issue または前 Wave の完了待ち。異常ではない | case-ready（実行構成表初期値） | いいえ |
| `completed` | Issue の実装、検証、必要な case-close が完了した状態 | case-close | はい |
| `blocked` | 要件曖昧性、外部副作用、権限不足、矛盾等により自動継続できない状態 | case-close（実行結果から確定） | はい |
| `failed` | 実装、検証、CI、PR 作成などの実行結果として失敗した状態 | case-close（実行結果から確定） | はい |

`ready` と `running` は runtime 実行状態であり、子状態4値には含まれない。Epic自動クローズ判定では `completed` を終端として扱う（`blocked`/ `failed` は終端だが自動クローズ完了とはみなさない）。

**永続状態遷移**: Epic Issue 本文（永続状態）に書き込まれるのは `pending` → `completed`/ `blocked`/ `failed` の遷移と、再試行時の継続条件成立と旧実行終了確認による `pending` 戻しである（取りまとめによる記録契機別の状態反映を含む。下記「取りまとめによる記録契機別 Epic 反映」）。

## 取りまとめによる記録契機別 Epic 反映

進行スキル（case-auto 等）が Case Issue 工程記録の取りまとめとして、記録契機（停止、判断変更、検証証拠）に応じて実行構成表への状態反映と全体条件評価を行う書き込み経路である。着手・引き渡し・再開は反映契機ではない（廃止記録契機）。

| 記録契機 | Epic 本文への状態反映 | 記録先（Epic 本文以外） |
|---|---|---|
| `hold`（停止） | 実行不能が確定した場合は `failed`、継続待機の場合は `blocked` を実行構成表の子状態へ反映。工程終了を待たない | 停止の記録コメント（再開条件・次の行動を子 Issue へ） |
| `decision_change`（判断変更） | 子状態は現状を維持（状態反映なし） | 判断変更の記録コメント（撤回対象・適用方針を子 Issue へ） |
| `completion`（検証証拠・完了確定） | 実行構成表の子状態列の終端書き込みは closing 書き込み（case-close）が行う | 検証証拠の記録コメント（判定根拠を子 Issue へ） |

反映の限定:

- Epic 本文への書き込みは実行構成表の子状態列のみである。停止理由・再開条件・撤回対象・判定根拠は子 Issue の記録コメントが正であり、Epic 本文へ複製しない
- 決定的な状態反映は `scripts/lib/epic-reflect.ts`（`applyClosingStatus` / `resetChildToPending`）、CLI は `scripts/src/reflect.ts` を使用する

## 再試行の pending 戻し

子 Issue の再試行は、継続条件の成立と旧実行の終了確認を経て実行構成表の子状態を `pending` へ戻す。

- `blocked` と `failed` は未完了状態であり、継続条件の成立と旧実行の終了確認のうえ `pending` へ戻せる（`resetChildToPending`、CLI は `reflect.ts reset`）
- `completed` は終端であり pending へ戻さない（completed 戻し禁止）
- 継続条件の成立・旧実行の終了確認の判断は意味判断であり、実行側 workflow が行う。本エンジンは決定的な状態書込みのみを担う

## per-Epic 単一書き手の排他制御と直列化

closing 書き込み（case-close）と取りまとめ反映の書き込みは、Epic Issue 本文単位の同一排他制御の下で局所直列化される。

- 直列化の単位は Epic Issue 本文単位（per-Epic）。Epic が異なれば並列でよい
- 直列化区間の内部で「最新取得 → マージ → 更新」を行い、区間の外で読んだ本文を書き戻さない（lost update 防止）
- 具体の手順: ①直列化 gate の取得 ②`agentdev_gh` の issue_read で最新本文を取得 ③マージ関数（`applyClosingStatus` / `resetChildToPending`）で部分更新 ④`agentdev_gh` の issue_update で更新 ⑤gate の解放
- 更新失敗時は更新前に読んだ本文へ戻すのではなく、直列化 gate を再取得して最新取得からやり直す（古い本文の書き戻しは lost update の原因）
- lock / queue の実装方式は指定しない（同一プロセス内は `createEpicWriteGate`、プロセス間は再読込ループによる競合検出と再試行で同等の排他を実現する）

## 全体条件評価（子完了と全体完了の区別）

Epic の全体完了判定は子Issueの完了とは区別して評価する。

- 全体条件評価は、子状態（実行構成表）と Epic 完了条件・証拠の照合から決定的に評価する（`evaluateOverallCompletion`、`scripts/lib/epic-reflect.ts`）。評価結果は正規の完了条件チェックの確定と必要な証拠の記録として扱い、導出件数・未達一覧等の中間投影を Epic 本文へ恒常保存しない
- 全ての子が終端子状態でも、全体条件の評価が未実施または未達成の間は全体完了として扱わない
- 子Issueの完了（`completed` 等）は子個々の終端を示すのみであり、それだけで Epic の全体完了判定を行わない。完了条件チェックボックスの更新は case-close 専任であり、子の申告だけで完了扱いにしない

## 親Epic検出

子Issue本文から `親Epic: #{N}` パターンを検出し、`{N}` を親Epic Issue番号として扱う。

- `親Epic:` パターンなし → 親Epicなし。状態更新をスキップ（エラーにしない）
- 旧形式（`Parent: #{N}`、`## 親Issue` セクション内配置）を後方互換で読み続けない。新形式を唯一の現行形式とする

## 主要な判断順序（取りまとめ: 記録契機別反映）

1. 直列化 gate を取得（closing 書き込みと同一の per-Epic 排他制御）
2. `agentdev_gh` の issue_read 操作で最新の Epic 本文を取得
3. 記録契機に応じた子状態の状態反映を実行構成表へ適用（`applyClosingStatus`、該当子の行のみ更新）
4. `agentdev_gh` の issue_update 操作で Epic 本文を更新（読み戻し VERIFY）
5. 直列化 gate を解放。更新失敗時は gate を再取得して最新取得からやり直す

## 主要な判断順序（case-close: completed/ blocked/ failed 更新）

1. 子Issue本文から `親Epic: #{N}` を検出。親Epicが存在しない → スキップ
2. `agentdev_gh` の issue_read 操作でEpic本文を取得
3. 実行構成表で該当子Issue行を特定（`findChildRow`。実行構成表は本文に一つだけ存在する）
4. べき等性確認（既に終端子状態ならスキップ）
5. `pending` を置換（`applyClosingStatus`。子状態4値のみ。PR 番号・URL は付記しない）
6. `agentdev_gh` の issue_update 操作でEpic本文を更新

`blocked`/ `failed` は case-close が子 Issue の実行結果（`completed-pr`/ `blocked`/ `failed`）から確定して Epic Issue 本文へ反映する終端子状態。

## reference選択表

通常経路で全 reference を無条件読込しない。
必要な条件に応じて読む reference を選択する。

| 条件 | 読む reference |
|---|---|
| 実行構成表の正規表現パターン、pending → completed/ blocked/ failed の置換、べき等性確認、再試行の pending 戻し手順が必要な場合 | [references/regex-and-merge-conflict.md](references/regex-and-merge-conflict.md) |
| PR merge 前後の Epic 状態遷移、merge 失敗時の Epic 状態対応、Epic 本文の conflict リスクと予防、conflict 解決手順、更新失敗フォールバックが必要な場合 | [references/regex-and-merge-conflict.md](references/regex-and-merge-conflict.md) |
| 記録契機別の状態反映手順、per-Epic 排他制御と直列化の手順、最新取得→マージ→更新の規律、全体条件評価、部分成功の区別と読み戻し再試行が必要な場合 | [references/epic-reflect-coordination.md](references/epic-reflect-coordination.md) |

## See Also

- Custom Tool `agentdev_gh`（Epic Issue 本文の読み取り・更新）
- **agentdev-workflow-lifecycle**: Epic振る舞いルール、実行構成定義
- **agentdev-workflow-case-close**: closing 書き込み（Epic Wave クローズ E5、per-Epic 単一書き手の直列化相手）
- **workflows/issue-lifecycle-records Design**: 記録契機の判定規則、進行状況の様式、記録様式の正
