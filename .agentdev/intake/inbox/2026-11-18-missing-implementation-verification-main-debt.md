# intake: missing-implementation/missing-verification の main 既出債務（REQ-117 系 15行等）

- **発見元**: Epic #4126 Wave-2 子 Issue #4132（OU-005 Phase 5）case-run。PR #4137 本文 Findings/ Capture候補（merge commit 3c4a95a29）
- **内容**: traceability check の既知 missing のうち main HEAD 由来の既出債務が残存する。missing-implementation 21行・missing-verification 18行（merge 後 main HEAD 3c4a95a29 実測）のうち、Wave-2 PR 起因でない main 既出分: REQ-117 系 15行（REQ-117-001/002/003/004/005/007/008/009/010/012/013/014/015 等）・REQ-010-085・REQ-032-045（implementation と verification 双方）・REQ-001-009・REQ-113-001/002（verification）。Wave-1 4PR の traceability diff に対応宣言追加なし（REQ-117-003 で機械確認済み）
- **分類**: intake 候補（対応宣言追加の債務切り出し）
- **影響**: traceability check の missing が継続残存する。対象行は本 Epic の完了条件外であり、機械工程では main baseline 実測値との突合で既知欠落として受理済み
- **再評価条件**: 対応宣言（implementation/verification）を追加する REQ/Design 変更 Case の実行時（REQ-117 系は実装対応の整理から着手するのが妥当）
- **関連**: Issue #4126・#4132・PR #4137（Findings 記録）・agentdev-traceability skill・traceability/policy.yaml・REQ-117
