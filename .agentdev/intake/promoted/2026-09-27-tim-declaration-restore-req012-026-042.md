# intake 採用済み成果物: REQ-012-026/042 実装対応宣言の復帰（TIM コーパス 2 fail の解消）

- 観測日: 2026-09-27
- 観測元: Case #3166 case-close（PR #3168 本文 Findings / Capture候補）。Case #3171 case-run/close でも同一 fail 集合を観測
- 種別: 既存デグレードの是正（adversarial-review で因果を検証・当初の「未整備」フレームから訂正）
- 分類確定: 採用（intake-promote 2026-09-27・adversarial-review 2 stream 収束・自律確定）

## 観測内容

- tim_declarations_contract.test.ts の2テストが main 現行で恒常 fail:
  - 「REQ-012-026〜042 の各要件行へ実装対応が1件以上保存されている（完了条件）」→ REQ-012-026 の implementation 宣言が 0件
  - 「複数の成果物が同一要件行へ対応できる（REQ-012-042 の実装対応2件）」→ REQ-012-042 の implementation 宣言が 1/2件
- full integrity suite は bun test 2627 中 2625 pass・2 fail（Case #3166・#3171 で同一 fail 集合・各 Case の変更非由来を両 Case で確認済み）

## 原因（adversarial-review で git 履歴検証済み）

- PR #3163（merge commit 8e196955・Refs #3162「docs corpus 機械的整合是正」）が docs/requirements/REQ-012.md から「関連情報」セクション削除に伴い `<!-- ADF-COVERS(implementation): REQ-012-026, REQ-012-042 -->` 行を巻き込んで削除した。sidecar への移設は実施されず、宣言が喪失した
  - 補足: Supervisor 判断記録（Issue #3171 コメント 5853445650）の「PR #3165」は PR 番号の誤記。正しくは PR #3163（merge 8e196955）。PR #3165 は同一 Case #3162 の実現面適用 PR（merge ed001227）
- 現状の宣言配置: docs/designs/foundations/v4-traceability-model.md の implementation 宣言は REQ-012-027〜042 をカバーし REQ-012-026 を含まない（REQ-012-042 は同宣言の1件のみ）
- テストは stale ではない: (1) REQ-012-026/042 は現行要件行として存在、(2) テストは REQ-012 自身の OU-001 完了条件を実装、(3) REQ-012-054 により inline/sidecar 宣言は等価だが sidecar 移設も行われていない（traceability/ 配下に当該 implementation 宣言なしを grep 検証済み）

## 影響

- integrity suite（QG-4 正規ゲートの構成テスト）が main で常時 2 fail し、修正しない限り全後続 Case の TS-006/QG-4 に記録付き例外運用（main 再現実測・新規失敗 0 証明の運用コスト）または blocked 停止のいずれかを強いる（Case #3171 では実装委譲が一度 blocked 停止し、Supervisor 判断による記録付き受理で継続した実績あり）

## 課題（検討対象）

- REQ-012-026/042 の実装対応宣言の復帰。手段は2案とし、選定は実装時に整形（Supervisor 判断: Issue #3171 コメント 5853445650〔ただし上記のとおり PR 番号は #3163 が正〕）:
  - (a) docs/requirements/REQ-012.md への inline 宣言の再配置（関連情報セクション自体の復元は不要・宣言行のみ）
  - (b) repository root の traceability/ 配下 sidecar への移設
- 復帰後、tim_declarations_contract.test.ts を含む integrity suite が全件 pass することを確認

## 緊急度

- 高（QG-4 全 Case 阻害・main 恒常 fail。修正は宣言行の復帰が主で最小規模）

## 既存要件との関連

- REQ-012（成果物トレーサビリティ）、REQ-012-054（inline/sidecar 等価）、tim_declarations_contract.test.ts、docs/designs/foundations/v4-traceability-model.md、PR #3163（8e196955・削除起因）
