# REQ-052 種別契約の ADF-COVERS 実装・検証宣言の Design 正規配置

## 観測

REQ-052-001..005、008..010 の 8行について、agentdev-traceability check の missing-implementation が残存する（case-close 独立再検査で case-run 記録と同一の 8行を確認）。配布物は producer 内部 ID を含めない配布依存境界（REQ-029、DEC-014）に従うため、tool/plugin 本体（src/opencode/tools|plugins）へは宣言を置けず、正規配置先は Design 側である。PR 2434 の実装委譲は docs/designs が書込禁止範囲であったため宣言を配置できず、Design確定候補 item 1 として起票された。

## 今回扱わない理由

Design ファイルへの ADF-COVERS 宣言追加は Design 内容の変更（APPEND）を伴い、case-close の Design 確定における docs 編集範囲（status 昇格）の外側。design-save 工程（または後続 Case）での対応が正規の手順。

## 影響

REQ-052 の 8行が missing-implementation として報告され続ける（Epic 全体で既知の inventoried 状態、main baseline 45行と同型）。Epic #2427 の Wave 3（OU-004）は本 Tool の操作契約を再利用するため、そのタイミングで解消するのが自然。

## レビューで決めること

- 配置案の採否: custom-tool-contracts.md へ `ADF-COVERS(implementation): REQ-052-001..005, 009` + `ADF-COVERS(verification): REQ-052-001..005, 010`（検証体: tools/plugins の tests/）、runtime-package-boundary.md へ `ADF-COVERS(implementation): REQ-052-008`（install.ps1 / self-sync.ps1）
- REQ-052-010 の implementation 宣言の置き場所（本案では未提案。Design 自身が所有事項の実装体になる解釈で Design へ宣言するか）

## 根拠

- PR 2434 本文「Design確定候補」item 1
- PR 2434 本文「品質メトリクス」traceability check 行
- Issue 2430 対応記録コメント（case-close、検証差分・トレーサビリティ独立再検査行）
