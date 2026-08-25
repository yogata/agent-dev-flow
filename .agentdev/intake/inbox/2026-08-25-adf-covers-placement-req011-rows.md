# REQ-011 実装行の ADF-COVERS(implementation) 宣言を docs/designs 側へ配置する候補

## 観測

Epic 2427 Wave 3 最終 case-close のトレーサビリティ独立再検査で、REQ-011 の対象 8要件行のうち 2行（REQ-011-020、REQ-011-021）に missing-implementation が残存した。PR 2435 の Design確定候補 item 3 が指摘するとおり、配布物内の producer 内部 ID 禁止（配布依存境界、REQ-029、DEC-014）のため、REQ-011-001/002/003/005/013/020/021 の実装行カバレッジ宣言は src 側に置けず docs/designs 側（custom-tool-contracts / runtime-package-boundary）への配置が正である。本 Case では編集可能範囲に存在するもののみ宣言した（scripts/install.ps1 へ REQ-011-006、check_integrity.ts の REQ-011-002/008/014 verification は req-save 済み）。

## 今回扱わない理由

Design ファイルへの ADF-COVERS 宣言追加は Design 内容の変更を伴い、case-close の docs 編集範囲（status 昇格のみ）の外側。design-save 工程（または後続 Case）での対応が正規の手順。

## 影響

REQ-011-020/021 が missing-implementation として報告され続ける（検証対応要否カタログ登録済み、既知の inventoried 状態）。既存 item「2026-08-25-req052-adf-covers-design-placement.md」（REQ-052 系 8行、main baseline 45行）と同型であり、一括解消が自然。

## レビューで決めること

- 配置案の採否: custom-tool-contracts.md へ REQ-011-001/002/003/005/013/020/021 の実装行宣言をまとめるか、操作契約と登録配線で Design を分けるか
- REQ-052 系 8行（既存 item）との統合配置の可否

## 根拠

- PR 2435 本文「Design確定候補」item 3
- Issue 2431 対応記録コメント（case-close、トレーサビリティ独立再検査の節）
- agentdev-traceability check（対象 8要件行、missing-verification 0・missing-implementation 2）
