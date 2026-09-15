# REQ-001-066/067/068 実装対応宣言の段階的付与（後続バッチ）

## 内容

traceability check の missing-implementation に REQ-001-066（プロジェクト知識文書の配置と構造）・REQ-001-067（要件行からの設計詳細分離）・REQ-001-068（安定した外部契約の要件文書記述許容）の 3 行が残存する。いずれも文書体系の運用基準行であり、Case #2823（RU-0003）では合意済み対象範囲（REQ-057-013・REQ-017-014 の特定 2 ID に限定）外として out-of-scope 記録済み。REQ-057-027（段階解消の手続基準）と REQ-057-023（implementation 宣言の段階的付与）に接続する後続バッチ対象。

## 提案

REQ-001-066/067/068 の正規実装成果物（docs 構造・要件文書記述運用を正規所有する Design 等）を特定し、正規配置先カタログに従い実装対応宣言を付与する。REQ-057-023 の段階的付与の次回バッチへ組み込む。

## 根拠

- 観測元: PR #2873 本文 Findings（Case #2823 TS-003 棚卸し結果。out-of-scope 記録）
- 観測時 commit: PR #2873（merge 後 main 28106f91）
- check 実測: 付与前の全体実行で missing-implementation 141 件中、REQ-001 系は本 3 行のみ（missing-verification 0 件）

## 分類

- 分類: intake（具体的作業対象あり: 実装対応宣言の付与先特定と ADF-COVERS 宣言追加）
- 変更種別: docs（ADF-COVERS 宣言の段階的付与）
- 優先度: 低（段階解消運用の継続対象。traceability check の既知 missing の一部）
