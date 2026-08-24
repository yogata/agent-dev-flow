# origin/main 起点の unmanaged NG 20件（既出・前工程コミット群起因）

## 観測

PR #2432（Issue #2428、OU-001）の check_integrity 比較検証（stash 前後比較）により、origin/main 起点の unmanaged NG 20件が確認された。内訳は consumer-project-setup.md の broken file link 5件、design-save.md・artifact-contracts.md の workflow-status-prohibition 2件、issue-tracking・workflow-issue の TODO 未解決プレースホルダ、DEC-022 の REQ-046-004 幻参照、skill-projection-manifest 未登録 2件等。stash 前後比較で本変更起因は 0 件と確認済み。

## 今回扱わない理由

いずれも本 PR の変更が起因する検出事項ではなく、前工程コミット群（main 履歴）に由来する既出事項であるため、OU-001 の変更範囲には含めない。本 PR は検出事項の修正を行わず、起因の切り分け（stash 前後比較）のみを実施した。

## 影響

unmanaged NG は main の品質ゲート基準に対する既知の残存事項として扱われ続ける。docs-check 実行時に毎回検出されるため、baseline 管理または個別修正による解消が必要なまま残る。

## レビューで決めること

- 20件の処置単位（baseline 登録するか、個別修正 Issue を起票するか）
- 各カテゴリ（broken link、workflow-status-prohibition、TODO プレースホルダ、幻参照、manifest 未登録）の優先順位

## 根拠

- PR #2432 本文「Findings / Capture候補」intake 3件目（発見元: check_integrity 比較検証）
