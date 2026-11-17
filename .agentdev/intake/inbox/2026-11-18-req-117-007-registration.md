# intake: REQ-117-007（case-run scripts の型検査基盤）の implementation / verification 対応 registration

- **発見元**: Epic #4126 Wave-1 子 Issue #4131（OU-004 Phase 4）case-run traceability check。PR #4136 本文 Findings/ Capture候補（merge commit 52a69ce41）
- **内容**: REQ-117-007 の implementation / verification 対応が main 時点で未登録（missing-implementation / missing-verification）。merge 後 main HEAD での case-close 独立再検査でも同一計上を確認（base 既出・main 由来・本 Epic 変更起因の新規違反なし）
- **分類**: intake 候補（トレーサビリティ対応 registration。REQ-115（case-run scripts 配下の型検査基盤）系の sidecar 登録対応）
- **影響**: REQ-117-007 を対象要件行とする Case の QG-4 完全性検査で missing が計上され続ける。本 Epic（#4126）の対象範囲外であり現状維持
- **再評価条件**: 別途 registration 対応 Case の実行時。REQ-117 系 sidecar（traceability/repo-agentdev-integrity.yaml 等）への implementation/verification 宣言登録が必要
- **関連**: Issue #4126・#4131・PR #4136（Findings 記録）・REQ-115・REQ-117
