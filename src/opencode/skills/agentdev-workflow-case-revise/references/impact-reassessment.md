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
