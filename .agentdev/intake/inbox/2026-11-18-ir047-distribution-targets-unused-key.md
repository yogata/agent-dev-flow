# intake: distribution-boundary lib の IR-047 が data/distribution-targets.yaml の未消費キーを残置

- **発見元**: Epic #4126 Wave-1 子 Issue #4131（OU-004 Phase 4）case-run。PR #4136 本文 Findings/ Capture候補（merge commit 52a69ce41）
- **内容**: distribution-boundary lib の IR-047 ルールが data/distribution-targets.yaml に `repo_kind_rules.self_hosting_only_markers` キーを残置したまま消費しなくなった（IR-046 削除の残余）。IR-046 は Epic #4126 Phase 4 で削除済み
- **分類**: intake 候補（宣言的データ YAML の未消費キー掃除。checker-execution-contracts の schema 原則と整合確認）
- **影響**: 未消費キーは検出違反ではないが、schema 原則（実消費キーのみ保持）との不整合として残存
- **再評価条件**: 次回 integrity 検査体系へ触知する Case の実行時（yaml 側キーの掃除を検討）
- **関連**: Issue #4126・#4131・PR #4136（Findings 記録）・distribution-boundary Design
