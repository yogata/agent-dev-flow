# Impact Reassessment（影響再評価）

case-revise workflow STEP-4 の実行詳細（SKILL.md「制御平面（STEP 一覧）」から参照される）。

## 対象の特定

- Definition 変更（REQ / Decision / Design）の影響評価対象は、Root Case の実行構造（Standard は Root Case 自身、Epic は Child Issue と Wave / 依存構造）に含まれる Issue である
- Epic の一部 Child Issue が完了済みの場合も、影響評価の対象集合から除外しない（完了済み Issue を含めて影響有無を判定する）

## 影響有無の判定

- `agentdev-traceability` の coverage / impact を利用し、Definition 変更と各 Issue の execution contract（対応 REQ / Decision / Design）の対応関係から影響候補を確認する（fail-open。候補提供であり最終判断ではない）
- 影響の判定は Issue の execution contract が参照する Definition が変更対象に含まれるか、変更内容が参照先の意味に影響するかで行う
- 候補の不在を影響なしの証明として扱わない。影響なしの判定は各 Issue の execution contract の直接確認で行う

## 判定結果の適用

- 影響があると判定した Issue のみを再評価対象としてマーキングする（Issue 本文への再評価要否マーキング。Custom Tool `agentdev_gh` の issue_update 経由）
- 影響なしと確認できた完了済み Issue は巻き戻さず、完了状態のまま維持する
- 影響再評価は実行構造の再設計を行わない（Epic / Wave 構成の再確定は case-ready が行う。case-revise は影響の有無判定とマーキングのみ）

## 影響対象ごとの処置判断（継続・停止・再実行）

影響があると判定した Issue については、Definition 変更の内容と当該 Issue の進行状態（実行結果確定 / 実行中 / 未実行）から処置を判断し、マーキングと併せて Issue 本文へ記録する。

| 進行状態 | 処置の判断 | 記録内容 |
|---|---|---|
| 実行結果確定（完了済み） | 変更内容が成果物に影響する場合は再評価（再実行判断）を、影響しない場合は維持を判断する | 判断根拠と再評価の要否 |
| 実行中（委譲済み・active） | 変更が作業途中の成果物に及ぶ場合は停止と再実行指示を、影響が以降の工程に限る場合は継続と現在地更新を判断する | 変更の及ぶ範囲、停止の要否と再開条件 |
| 未実行 | 最新条件に基づく再実行指示へ置き換える | 変更後の条件の参照先 |

- 停止・再実行を判断した対象は、停止理由と再開条件を明示して記録する（記録コメントの必須項目に従う）
- 影響しない進行中の作業は一律停止せず継続する。現在地の通常更新で対応し、目的・対象範囲・完了条件を変更しない
- 判断の記録は判断変更記録契機に含まれる（撤回対象を必須項目とする記録コメント。`agentdev-workflow-templates` の記録コメント様式に従う）
