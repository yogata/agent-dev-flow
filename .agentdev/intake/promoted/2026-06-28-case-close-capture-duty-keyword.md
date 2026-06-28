## 観測内容
docs-check で `command-capture-duty` NG が検出されている。`case-close.md` に「回収・保存」duty キーワードが不在であることが原因。pre-existing NG として複数 PR（#1134, #1137, #1125）で記録されているが、いずれの PR でも対象外とされた。

PR #1137（case-close test strategy 完了確認 Step 2）での報告:
> check_integrity.ts の pre-existing NG 2 件（`req-range-staleness`: docs/guides/project-docs-and-specs.md の REQ 範囲表記が REQ-0147 で古い、`command-capture-duty`: case-close.md に '回収・保存' duty キーワード不在）は本 PR 前後で不変。本 PR 由来ではないため後続 intake 候補として記録する。

PR #1134（test strategy 3要素構造定義）での推奨事項:
> **推奨事項**: 別 Issue で case-close.md の capture 責務記述を補完すること。intake 候補。

## 影響
docs-check NG が継続しており、文書整合性ルール違反状態。`command-capture-duty` 検査で失敗しているため、ドキュメント整合性チェックが通らない状態。

## 課題
`case-close.md` に「回収・保存」duty キーワードを追加し、docs-check NG を解消すること。

## 既存要件との関連
- PR #1134（test strategy 3要素構造定義）
- PR #1137（case-close test strategy 完了確認 Step 2）
- PR #1125
