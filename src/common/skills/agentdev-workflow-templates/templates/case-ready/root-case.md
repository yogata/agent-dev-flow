---
name: Root Case (case-ready)
about: Root Case 本文（case-ready が実現方針と完了条件を確定し、ready 遷移で更新する構造）
labels: enhancement
---

## 目的
<!-- 【必須】 -->

[case-open で確立した合意済み要件の対象と達成する変更を維持する]

## 対象範囲・対象外
<!-- 【必須】 -->

### 対象要件
<!-- case-open で記載した対象要件を維持する -->

- [対象要件]

### 主な変更対象
<!-- 変更対象成果物（artifact type と対象パス）は本節の機械比較可能な宣言として保持する。
case-open が事前探索した変更影響候補（scope-affecting impact candidate）を含めて記述する。
実差分の正は Git 差分 -->

- [変更対象成果物と対象パス]

### 対象外
- [対象外の事項。該当がない場合は「該当なし」]

## 完了条件
<!-- 【必須】 -->

<!-- case-ready が canonical Definition 確定後に展開する（本テンプレートの更新主点）。
再判断してはならない合意済み事項（関連 Decision の拘束条件）がある場合のみ、case-ready が本節の直前に「実現方針」章を追加する（非常設。章を常設しない）。追加した章には該当する合意済み事項のみを記載し、検証方法に落とせるものは完了条件の検証方法へ統合する。
各要素は合意済み Definition の投影であり、新規作成しない。
必須品質統制（artifact-quality-control-routing Design の能力キーに基づく検証）を検証方法・合格条件へ統合する。
runtime-only 判断（worktree 状態、staleness、実 diff、実装結果、test 実行結果）は含めない。
不合格、証拠不足、検証不能、未処理は未達とする。達成状態の確定（[ ] → [x]）は case-close だけが行う -->
- [ ] [case-ready が確定した条件（検証方法: ...、合格条件: ...）]

## 進行状況
<!-- 【必須】 -->

<!-- 進行状況: Case Issue 工程記録モデル（workflows/issue-lifecycle-records Design）に基づく工程記録セクション。
正規状態（open、ready、running、blocked、review、closed、cancelled の7値域。値の正は workflows/v4-lifecycle-state-machine Design）と開始・終了日時のみを保持する。表示用の進行状態4値、現在工程、担当役割、次の行動、最新記録参照は保存しない。
開始日時は初めて実装または検証に実着手した時刻であり、停止・再開で上書きしない。
終了日時は完了または中止確定時のみ設定する。 -->

- 正規状態: open
- 開始日時: N/A（case-run での初回実装・検証着手時に設定）
- 終了日時: N/A
