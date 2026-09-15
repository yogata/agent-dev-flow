# トレーサビリティ unknown-req-refs 既存 50 件（実在しない REQ 行への宣言参照）

## 内容

`docs/designs/skills/agentdev-adversarial-review.md` L10 等の ADF-COVERS 宣言が、実在しない REQ 行（REQ-003-030 系）を参照しており、agentdev-traceability check の unknown-req-refs が 50 件検出される。REQ-057-002/009/016（Case #2852 の対象行）には関連しない既存事項。

## 提案

phantom REQ 行参照の系統的な解消（宣言側の修正、または参照先 REQ 行の復活・移管先への更新）。REQ 参照整合の歪みが REQ-057-002（不存在参照の残存禁止）の守備範囲に段階的に取り込まれるかを backlog-review で判断する。

## 根拠

- 観測元: PR #2868 本文 Findings（Case #2852 の case-run 実行時に traceability check で検出、本変更外として記録）
- 観測時 commit: d7372002（PR #2868 head、merge 後の main HEAD は bf4a3224）
- agentdev-traceability check.ts の unknown-req-refs 50 件

## 分類

- 分類: intake（具体的修正対象あり: docs/designs 配下の ADF-COVERS 宣言 50 箇所）
- 変更種別: docs（宣言参照の現行化。REQ 行の移管・復活判断を含む）
- 優先度: 中（件数が多く REQ 参照整合の系統的な歪み。バッチ現行化の候補）
