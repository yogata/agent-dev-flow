---
id: learn-20261121-req001-054-055-ref-intent-mismatch
created_at: 2026-11-21
source: case-run capture (PR #4175・Wave-3 #4171・Root Case #4167)
status: inbox
---

# REQ-001-054 / REQ-001-055 の参照文意不一致候補（document-model から dtr への移管時に参照ごと引き継ぎ）

- 発生事象: 旧 document-model.md「コマンド級 REQ 定義（REQ-001-054）」「Design 分離基準（REQ-001-055）」の参照が REQ 本文と文意一致しない誤参照の可能性がある。Wave-3 の document-model スリム化で両節を document-type-responsibilities へ移管した際、参照もそのまま引き継いだ（意味判断は本フェーズ対象外）
- 確認状況: REQ-001-054 / REQ-001-055 の REQ 本文と移管先 dtr の参照文言の文意一致性は未検証
- 確認方法: inspect-docs 意味診断での確認を推奨
- 根本原因: 参照の文意検証を移管（構造移動）の工程に含めず、参照を機械的に引き継いだ
- 後続対応案: inspect-docs（backlog-auto stage 1）または intake での意味診断による確認
- ユーザー確認要否: なし（診断での自動確認候補）
- 影響範囲想定: docs/designs/responsibilities/document-type-responsibilities.md 内の REQ-001-054/055 参照箇所
- 関連: REQ-123-003・PR #4175（Findings/Capture候補 1）
