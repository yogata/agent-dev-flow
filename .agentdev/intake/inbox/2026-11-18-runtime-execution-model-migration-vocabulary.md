# intake: runtime-execution-model の lifecycle role 別サブ表の v3/v4 移行期語彙残存

- **発見元**: Epic #4126 Wave-1 子 Issue #4130（OU-003 Phase 3）case-run 削ぎ落とし編集時のスコープ判断。PR #4134 本文 Findings/ Capture候補（merge commit 64fb6b6e8）
- **内容**: docs/designs/foundations/runtime-execution-model.md の lifecycle role 別サブ表に「baseline anchor tag（v3-baseline 等）」「統合 branch（main、v4-dev）」等の v3/v4 移行期語彙が残存している。旧13名称参照ではないため #4130 の機械検証対象外であり、歴史的移行境界の記述として残置された
- **分類**: intake 候補（移行期語彙の処遇確認。OU-004 #4131 が baseline 機構を撤廃したことに伴い、同表行の処遇確認が必要）
- **影響**: baseline 機構は Epic #4126 Phase 4 で撤廃済み（baselines 5ファイル削除・IR-055/059 は検出器存続）。baseline anchor tag を前提とする表行は現行実態と不整合の可能性
- **再評価条件**: Wave-2 #4132（OU-005 traceability 最新化・収束検証）の実行時、または runtime-execution-model.md への次回内容変更時
- **関連**: Issue #4126・#4130・#4131・PR #4134（Findings 記録）
