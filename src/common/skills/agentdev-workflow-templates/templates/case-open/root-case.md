---
name: Root Case (case-open)
about: Root Case 本文（case-open が起票する。case-ready が実現方針と完了条件を確定して更新する）
---

## 目的
<!-- 【必須】 -->

[合意済み要件の対象と達成する変更（何をどの状態へ持ち込むか）]

## 対象範囲・対象外
<!-- 【必須】 -->

### 対象要件
<!-- 合意済みの要件とその範囲。REQ ファイルの存在を必須としない -->

- [対象要件を記述]

### 主な変更対象
<!-- case-open が事前探索した変更影響候補（scope-affecting impact candidate）を含めて記述する -->

- [変更対象成果物と対象パスを記述]

### 対象外
- [対象外の事項。該当がない場合は「該当なし」]

## 完了条件
<!-- 【必須】 -->

<!-- case-ready が canonical Definition 確定後に展開する。
必須品質統制は検証方法・合格条件へ統合し、テスト戦略・必須品質統制の別章を設けない。
関連 Decision の拘束条件は実現方針または検証方法へ反映する。
達成状態の確定（[ ] → [x]）は case-close だけが行う -->
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
