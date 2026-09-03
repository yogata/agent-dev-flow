# origin/main 起点の unmanaged NG 20件（既出・前工程コミット群起因）

## 観測内容

PR #2432（Issue #2428、OU-001）の check_integrity 比較検証（stash 前後比較）により、origin/main 起点の unmanaged NG 20件が確認された。内訳は consumer-project-setup.md の broken file link 5件、design-save.md・artifact-contracts.md の workflow-status-prohibition 2件、issue-tracking・workflow-issue の TODO 未解決プレースホルダ、DEC-022 の REQ-046-004 幻参照、skill-projection-manifest 未登録 2件等。stash 前後比較で本変更起因は 0 件と確認済み。

いずれも当該 PR の変更起因ではなく前工程コミット群（main 履歴）由来の既出事項のため、OU-001 の変更範囲には含めず、起因の切り分け（stash 前後比較）のみ実施された。

2026-09-02 の後続観測（check_integrity 事前存在 NG 残存の item、2026-09-02）によれば、うち SkillProjection manifest 不一致 4件と phantom REQ-046-004（DEC-022.md L63）の 5件は Wave 2 の PR #2528 で解消済み。残存分の処置判断が本 item の主対象となる。

## 影響

unmanaged NG は main の品質ゲート基準に対する既知の残存事項として扱われ続ける。docs-check 実行時に毎回検出されるため、baseline 管理または個別修正による解消が必要なまま残る。

## 課題（レビューで決めること）

- 残存分の処置単位（baseline 登録するか、個別修正 Issue を起票するか）
- 各カテゴリ（broken link、workflow-status-prohibition、TODO プレースホルダ、manifest 未登録）の優先順位

## 既存要件・契約との関連

- check_integrity の baseline 運用（ir-055-baseline.json 等の baseline-known 管理方式、Issue #2508）。
- 関連 item: check_integrity 事前存在 NG の残存（2026-09-02、残存 3種の個別観測。本 item と処置判断を共有する）。

## 根拠

- PR #2432 本文「Findings / Capture候補」intake 3件目（発見元: check_integrity 比較検証）
- 解消済み分の裏付け: 2026-09-02 item（check_integrity 事前存在 NG 残存）の Wave 2 PR #2528 記録
