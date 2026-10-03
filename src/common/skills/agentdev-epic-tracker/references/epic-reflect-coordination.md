# 記録契機別 Epic 反映と per-Epic 排他制御（epic-reflect-coordination）

本ファイルは `agentdev-epic-tracker` SKILL.md の補助資料であり、Case Issue 工程記録の取りまとめによる記録契機別の Epic 反映（子状態集約・全体条件評価）の詳細手順、closing 書き込み（case-close）との per-Epic 排他制御・局所直列化、最新取得→マージ→更新による lost update 防止、部分成功の区別と読み戻し再試行を扱う。
SKILL.md 本文では反映経路と排他制御の概要のみを提示し、本ファイルが詳細手順を所有する。
記録様式の正は `workflows/issue-lifecycle-records` Design（Case Issue 工程記録モデル）であり、本ファイルは同 Design の規則に従う Epic 反映の実体手順を所有する。

## 目次

- [書き込み経路の全体像](#書き込み経路の全体像)
- [記録契機別の反映内容](#記録契機別の反映内容)
- [集約セクション様式](#集約セクション様式)
- [直列化手順](#直列化手順)
- [最新取得→マージ→更新の規律](#最新取得マージ更新の規律)
- [部分成功の区別と読み戻し再試行](#部分成功の区別と読み戻し再試行)
- [再試行の pending 戻し](#再試行の-pending-戻し)
- [全体条件評価の記録](#全体条件評価の記録)
- [決定的エンジンの使用](#決定的エンジンの使用)

## 書き込み経路の全体像

Epic Issue 本文への書き込みは2系統であり、同一の per-Epic 排他制御の下で直列化される。

| 経路 | 書き手 | 対象 | タイミング |
|---|---|---|---|
| closing 書き込み | case-close(#epic) | 実行構成表の子状態列（`pending` → `completed`/ `blocked`/ `failed`）、完了条件チェックボックス | PR マージ後の Epic Wave クローズ |
| 取りまとめ反映 | case-auto 等の進行スキル | 子状態集約セクション、全体条件評価セクション | 記録契機（停止、判断変更、検証証拠）ごと |

着手・引き渡し・再開は反映契機ではない（廃止記録契機）。取りまとめ反映は記録契機ごとに工程終了を待たずに行う。短い複数の変化は1回の反映へまとめてよいが、停止の通知を遅らせない。内部の全手順・全ツール実行・思考・定期投稿を反映契機に追加しない。

## 記録契機別の反映内容

| 記録契機 | 子状態 | 必須項目 | 集約エントリへの反映 |
|---|---|---|---|
| `hold`（停止） | `blocked` | 再開条件、次の行動 | `trigger=hold status=blocked`、`reason=<停止理由>`、`next=<再開条件・次の行動>`。観測不能な場合は停止と断定せず観測不能である旨を明示 |
| `decision_change`（判断変更） | 変化なし（現状の子状態を維持） | 撤回対象、適用方針 | `trigger=decision_change status=<現状>`、`reason=<撤回対象>`、`next=<適用方針>` |
| `completion`（検証証拠・完了確定） | `completed` | 判定根拠 | `trigger=completion status=completed`、`basis=<判定根拠>`。実行構成表の子状態列の終了状態は closing 書き込み（case-close）が書き込む |

失敗（`failed`）は停止（`hold`）で実行不能が確定した場合の子状態であり、取りまとめ反映は `trigger=hold status=failed` で反映する。PR 番号・URL は集約エントリにも実行構成表の状態列にも付記せず、子 Issue の結果・PR 自体から取得する。

## 集約セクション様式

子状態集約と全体条件評価は機械可読な HTML コメントブロックとして Epic 本文へ保持する（レンダリングに影響せず、本文の既存セクションを壊さない。ブロックは本文末尾へ付加する）。

```markdown
<!-- agentdev:epic-reflect begin -->
<!-- reflect child=42 trigger=hold status=blocked reason="CI 失敗" next="修正後に再実行" -->
<!-- reflect child=43 trigger=completion status=completed basis="QG-4 合格" -->
<!-- agentdev:epic-reflect end -->

<!-- agentdev:epic-overall begin -->
<!-- overall completed=false children=5/6 criteria=1/2 unmetChildren="#46" unmetCriteria="全Wave完了" basis="..." -->
<!-- agentdev:epic-overall end -->
```

- 1子1エントリ。同一子の再反映は該当エントリの置換（履歴は記録コメントが担う）
- エントリは子Issue番号昇順へ正規化する（完了順序に依存しない集約）
- `status` は子状態4値（`pending` / `completed` / `blocked` / `failed`）のみ。表示用の進行状態4値（not-started / running / waiting / ended）は廃止した
- 値に空白を含む場合は二重引用符で囲む。値内の二重引用符は単一引用符へ置換する

## 直列化手順

closing 書き込みと取りまとめ反映は、Epic Issue 本文単位（per-Epic）の同一排他制御で局所直列化する。Epic が異なる書き込みは並列でよい。独立した子 Issue の作業を全体で直列化しない。

1. 直列化 gate を取得する（同一 Epic への他の書き込み〔closing または取りまとめ〕が実行中の場合は完了を待つ）
2. `agentdev_gh` の issue_read 操作で最新の Epic 本文を取得する
3. マージ関数で部分更新を適用する
4. `agentdev_gh` の issue_update 操作で Epic 本文を更新する
5. 更新後の再読込 VERIFY（読み戻し確認）を行う
6. 直列化 gate を解放する

- lock / queue の実装方式は指定しない。同一プロセス内は `createEpicWriteGate`（scripts/lib/epic-reflect.ts）を共有し、プロセス間は gate 取得の協調と再読込ループで同等の排他を実現する
- case-run(#epic) と Wave 反復制御としての case-auto は Epic Issue 本文へ書き込まない

## 最新取得→マージ→更新の規律

lost update（後続更新による先行更新の上書き消去）を防ぐ規律である。

- 直列化区間の**内部**で最新本文を取得する。区間の外で取得済みの本文を直接書き戻さない
- マージは部分更新であること: 取りまとめ反映は該当子の集約エントリのみ、closing 書き込みは該当子の実行構成表行のみを変更し、他の子の行・エントリ・既存セクションを保持する
- 更新が失敗した（または読み戻し VERIFY が不整合を検出した）場合は gate を再取得し、最新取得からやり直す。失敗前に読んだ本文へ戻す復旧は行わない
- 集約の優先規律: 終端子状態（`completed` / `blocked` / `failed`）は非終端（`pending`）を置換し、既存の終端子状態が後続の非終端で置換されることはない。これにより完了順序に依存しない集約が保証される

## 部分成功の区別と読み戻し再試行

- コメントのみ成功、本文のみ成功、集約のみ成功の部分成功を区別して扱う。更新失敗・結果不明を成功扱いにしない
- 本文更新の後は再読込 VERIFY で反映内容を確認する。不足が検出された場合は gate を再取得して最新取得から不足分を再適用する
- 更新回復用のローカル記録は未反映内容と識別情報に限定し、恒久状態源として扱わない
- Epic 反映が完了するまでの間、子 Issue 本文の進行状況（開始・終了日時）と記録コメントが最新の情報として読み取れる状態を維持する（この読み取り規律は Epic 反映責務の代替ではない）

## 再試行の pending 戻し

子 Issue の再試行は、継続条件の成立と旧実行の終了確認を経て実行構成表の子状態を `pending` へ戻す。

- `blocked` と `failed` は未完了状態であり、継続条件の成立と旧実行の終了確認のうえ `pending` へ戻せる（`resetChildToPending`、CLI は `reflect.ts reset`）
- `completed` は終端であり pending へ戻さない（completed 戻し禁止）。戻し要求は端末状態確認で拒否する
- 戻し後の再実行は新規の実行として扱い、旧実行の記録（記録コメント、集約エントリ）を消さない。集約エントリは次の反映で置換される
- 継続条件の成立・旧実行の終了確認の判断は意味判断であり、実行側 workflow が行う。本エンジンは決定的な状態書込みのみを担う

## 全体条件評価の記録

Epic の全体完了判定は子Issueの完了と区別して記録する。

1. 全子の終端子状態を実行構成表から読み取る（`countChildStatuses`）
2. 全体条件の列挙を Epic 本文（完了条件・実行構成）から取得し、各条件の達成状況と根拠を評価する
3. `evaluateOverallCompletion` で決定的に評価する。`overallCompleted` は全子終端かつ全条件達成のときのみ `true`
4. 評価レコードを `agentdev:epic-overall` ブロックへ記録する（`upsertOverallEvaluation`）
5. 子が全て終端しても全体条件の評価が未実施・未達成の間は、Epic を全体完了として扱わない

## 決定的エンジンの使用

集約・様式生成・評価の決定的部分は `scripts/lib/`、CLI は `scripts/src/reflect.ts` を使用する。GitHub I/O は Custom Tool `agentdev_gh` が正規経路であり、本エンジンは本文の変換のみを担う。

```bash
# 取りまとめ反映（記録契機 1件のマージ）
bun run src/common/skills/agentdev-epic-tracker/scripts/src/reflect.ts reflect \
  --epic-body <latest-body.md> --report '{"childIssue":42,"trigger":"hold","status":"blocked","reason":"CI 失敗","nextAction":"修正後に再実行"}'

# closing 書き込み（子状態のべき等置換）
bun run src/common/skills/agentdev-epic-tracker/scripts/src/reflect.ts closing \
  --epic-body <latest-body.md> --child 43 --status completed

# 再試行の pending 戻し（blocked / failed から。completed は拒否される）
bun run src/common/skills/agentdev-epic-tracker/scripts/src/reflect.ts reset \
  --epic-body <latest-body.md> --child 42

# 全体条件評価の記録
bun run src/common/skills/agentdev-epic-tracker/scripts/src/reflect.ts overall \
  --epic-body <latest-body.md> --child-issues '42,43,44' \
  --evaluation '{"evaluatedCriteria":[{"criterion":"全Wave完了","met":false,"basis":"Wave 2 未完了"}]}'
```

出力は単一の JSON オブジェクト（`ok`、`body`、`applied`、`skipped`、全体評価モードでは `evaluation`）。`--epic-body` には直列化区間内で取得した最新本文を渡す。
