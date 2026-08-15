# inspect-docs finding 20260815T082159Z（defer 残置分）

> 本ファイルは inspect-promote（2026-08-15 実施）の分類確定後、defer となった検出事項のみを残置する。promote 採用分（F-01, F-02, F-04〜F-14）は `.agentdev/inspect/promoted/inspect-docs-promoted-20260815T082159Z.md` へ保存済み。reject 分（F-03, F-18, F-19）は即時削除済み（却下理由は commit message 参照）。

## F-15〜F-17: 実装済み横断 SPEC の draft status（進行中 Epic の昇格待ち）

- **category**: SPEC status 整合
- **target**:
  - F-15: docs/specs/workflows/workflow-skill-model.md（status: draft、DEC-010 実装詳細の正規所有者と自称）
  - F-16: docs/specs/workflows/step-reference-contract.md（status: draft、DEC-011 実装詳細の正規所有者と自称）
  - F-17: docs/specs/workflows/input-resolution-and-durable-state.md（status: draft、DEC-011 側面の正規所有者と自称）
- **evidence**: 各 SPEC frontmatter status: draft（created 2026-08-10、updated 2026-08-15）。docs/specs/README.md の status 列も draft
- **severity**: medium
- **confidence**: medium
- **source_of_truth**: docs/specs/README.md（SPEC status 追跡情報源）
- **defer 根拠（adversarial-review 審議結果）**: 「draft 放置」ではなく進行中 Epic（ACT-SPEC-001..003 由来、Epic #2099 系）の case-close 昇格を待つ正当な pipeline 状態。IR-054（draft 放置検出、30日閾値・updated 基準）では age 0 でクリア。正規所有 SPEC と draft status の権限づけの揺れは実在するが、不整合確定は早計
- **再確認条件**: Epic #2099（Command/Workflow/Capability architecture remediation）の case-close 後も draft のままの場合、次回 inspect-docs で再検出し promote 判定を再協議する
- **ng_classification**: n/a

## 審議記録（参照）

- 暫定分類 → adversarial-review 経路B（2系統独立 stream + counter-challenge + convergence audit）→ HITL 確定: promote 13 / defer 3（本ファイル）/ reject 3
- 元 finding ファイルの引用誤り（F-09〜F-12 の対象 REQ 誤帰属、F-04/F-05 の行番号）は promoted 成果物で訂正済み
- F-03 の「intake inbox 43件・learning inbox 410行の重複確認推奨」は promoted 成果物・完了報告に継承済み
