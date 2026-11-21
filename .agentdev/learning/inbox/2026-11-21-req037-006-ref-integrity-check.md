---
id: learn-20261121-req037-006-ref-integrity-check
created_at: 2026-11-21
source: case-run capture (PR #4175・Wave-3 #4171・Root Case #4167)
status: inbox
---

# REQ-037-006 参照の整合確認候補（旧「REQ 品質維持基準」の移管に伴う診断観点列挙との関連付け）

- 発生事象: 旧 document-model.md「REQ 品質維持基準」の REQ-037-006 参照と診断観点列挙の関連付けに整合確認の余地がある。Wave-3 の移管時に dtr（document-type-responsibilities）へ引き継いだ（意味判断は本フェーズ対象外）
- 確認状況: REQ-037-006 の診断観点列挙との関連付けの整合は未検証
- 確認方法: inspect-docs 意味診断での確認を推奨
- 根本原因: 参照の関連付け整合を移管（構造移動）の工程に含めなかった
- 後続対応案: inspect-docs（backlog-auto stage 1）または intake での意味診断による確認
- ユーザー確認要否: なし（診断での自動確認候補）
- 影響範囲想定: docs/designs/responsibilities/document-type-responsibilities.md「REQ 品質維持基準」節の REQ-037-006 参照
- 関連: REQ-123-003・PR #4175（Findings/Capture候補 2）
