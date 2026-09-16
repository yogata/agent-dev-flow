# REQ-001-066/067/068 実装対応宣言の段階的付与（後続バッチ）

## 観測内容

traceability check の missing-implementation に REQ-001-066（プロジェクト知識文書の配置と構造）・REQ-001-067（要件行からの設計詳細分離）・REQ-001-068（安定した外部契約の要件文書記述許容）の 3 行が残存する。いずれも文書体系の運用基準行であり、Case #2823（RU-0003）では合意済み対象範囲（REQ-057-013・REQ-017-014 の特定 2 ID に限定）外として out-of-scope 記録済み。REQ-057-027（段階解消の手続基準）と REQ-057-023（implementation 宣言の段階的付与）に接続する後続バッチ対象。

2026-09-16 時点の再実査: traceability check の missing-implementation findings に REQ-001-066/067/068 が引き続き含まれる（REQ-001 系は当該 3 行のみ）。

## 影響

- traceability check の既知 missing の一部として残存（段階解消運用の継続対象）。検証対応分類は Issue #2867 のカタログ登録で完了しており、実行阻害はない

## 課題（対応候補と判断材料）

- REQ-001-066/067/068 の正規実装成果物（docs 構造・要件文書記述運用を正規所有する Design 等）を特定し、正規配置先カタログに従い実装対応宣言（ADF-COVERS(implementation)）を付与する
- REQ-057-023 の段階的付与の次回バッチへ組み込む
- 関連: verification-scope-catalog 棚卸し（Issue #2867）の実施記録が「宣言付与が適切な行は宣言付与で解消する」という後続課題を提案している（当該残務の承接元は本 item）

## 既存要件との関連

- REQ-057-023（implementation 宣言の段階的付与）: 実施基準
- REQ-057-027（段階解消の手続基準）: 対象選定基準
- REQ-001-066/067/068: 宣言付与対象行

## 根拠

- 観測元: PR #2873 本文 Findings（Case #2823 TS-003 棚卸し結果。out-of-scope 記録）
- 観測時 commit: PR #2873（merge 後 main 28106f91）
- 2026-09-16 再検証: traceability check missing-implementation に当該 3 行の含有を確認
- 処分経緯: intake-promote（2026-09-16）で採用を確定（自律確定: check 実測で確認済み。優先度低・段階解消運用の継続対象）
