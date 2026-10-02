# unresolved-placeholder 新規 2件（agentdev-workflow-case-ready）

- **分類**: inspect finding promote（F-09・severity low・confidence high）
- **由来**: inspect-docs finding 20261002T154006Z（backlog-auto stage 1・check_integrity.ts IR-064 機械的検出）

## 観測（evidence・機械的検出）

- `src/common/skills/agentdev-workflow-case-ready/SKILL.md:57` と `src/common/skills/agentdev-workflow-case-ready/references/definition-acceptance.md:41` で、baseline 未登録の新規 WARNING「ID placeholder 'REQ-{NNNN}' appears bare in body text (not in code span, parentheses, or template)」

## 影響課題

ID プレースホルダの本文裸出力は、配布物検査（IR-064）の warning 総数を増加させる要因であり、F-07 の cap 超過問題に寄与する可能性がある。

## 対応候補

backtick（code span）または括弧委譲表記への括り、または baseline 登録（provenance 付き）。

## 既存要件関連

REQ-010-065（IR-064）

## 統合注記（backlog-review での統合判定候補）

F-07（IR-055 cap 超過）とは別ルール（IR-064）だが、warning 対策として一括 Case 化の余地あり。backlog-review で依存整理を判定。
