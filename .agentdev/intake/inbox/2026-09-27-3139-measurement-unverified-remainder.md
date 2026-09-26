# intake: Case #3139 全件対称再測定由来の保留分（file:line 再導出不能・次サイクル再評価対象）

- 観測日: 2026-09-25（item 分割日: 2026-09-27、backlog-auto stage 2 intake-promote。ユーザー承認 Q2 (a) item 分割）
- 観測元: case-close #3139 Capture 回収（PR #3141 本文）
- 種別: 保留（情報不足）。採用分は promoted/2026-09-27-3139-docs-quality-measurement-findings.md に分割済み

## 保留 1: REQ 構造指摘の残り約10件（代表例以外）

- REQ-038-002/003（HITL 確定重複）と REQ-036-007/009（診断観点二重定義）は採用分（代表例）へ確定済み
- 残り約10件（REQ-036-031/032 の F-15 defer カバー分を除く）の file:line は PR #3141 本文に存在せず、実行セッション記録のみで再導出不能
- 再導出手段: 次回 inspect-docs 意味診断（REQ 体系担当）での再検出、または req-define 再壁打ち時の REQ 全文精査

## 保留 2: document-model.md の REQ 行引用の文意不一致 3 箇所

- 全件対称再測定で検出された document-model.md 内の REQ 行引用と引用元 REQ 行の文意不一致 3 箇所
- file:line は PR #3141 本文に存在せず再導出不能
- 再導出手段: document-model.md の REQ 行引用箇所の全文突合（次回 inspect-docs Design 担当、または req-define 変更影響分析）
