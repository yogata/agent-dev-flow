# intake: missing-implementation 残存 6行（REQ-103-028、REQ-109-001/002/004/005/006）の恒常対応実体なし債務

- **発見元**: Epic #4126 Wave-2 子 Issue #4132（OU-005 Phase 5）case-run。PR #4137 本文 Findings/ Capture候補（merge commit 3c4a95a29）
- **内容**: traceability check の missing-implementation が REQ-103-028、REQ-109-001/002/004/005/006 の 6行に残存する。Wave-1 削除 Design（v4-migration-and-release 等）の implementation 宣言消滅由来だが、恒常的な対応実体が存在しない（移行作業は完了済み・実体は Git 運用事実）。収束には traceability policy の implementation.optional への区分登録等の Definition 変更が必要で、本 Issue 範囲外（REQ/Decision の意味変更は不可）
- **分類**: intake 候補（policy/REQ 定義変更を要する範囲外債務の切り出し）
- **影響**: traceability check の missing-implementation が恒常的に残存する。対象行は完了阻止条件の対象要件行外（Epic 対象外リスト REQ-109-001/005/006 現行文言維持・Issue 対象外記述「新規 REQ/Design 作成禁止」を根拠に本 Case 対応対象外と判定済み）
- **再評価条件**: traceability policy の implementation.optional 区分を検討する Definition 変更 Case（req-define）の実行時
- **関連**: Issue #4126・#4132・PR #4137（Findings 記録）・agentdev-traceability skill・traceability/policy.yaml
