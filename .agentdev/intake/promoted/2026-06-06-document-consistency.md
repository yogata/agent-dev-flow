# 文書整合性・cosmetic 修正

## 観測

8つの ADR に旧テンプレート形式の `## 実装後の記録` セクションが残存。SPEC ファイルに workflow status 禁止ルールの記載なし。

## 影響

cosmetic だが、テンプレート不統一と SPEC 整合性の観点で対応推奨。機能的な問題はない。

## 課題

### 1. ADR `## 実装後の記録` セクション残存（8 ADR）

該当 ADR: ADR-0001, 0002, 0003, 0005, 0006, 0008, 0010, 0011, 0012, 0013

- ADR-0014/15/16 では核判断のみに縮小した際に削除済み
- 他の ADR は対象外だったため未処理
- 提案: 該当セクションを削除し、ADR テンプレートと統一

### 2. workflow status 禁止ルールの SPEC 記載不足

- `docs/guides/artifacts-and-state.md` には記載済み
- `docs/specs/workflow-contracts.md`, `docs/specs/document-model.md` には未記載
- REQ-0112-026 は SPEC 記載を想定している可能性

## 既存要件との関連

- REQ-0112-026: SPEC 記載想定
- ADR テンプレート: 核判断のみの形式

## 優先度

低

## 対応方針

1. 該当 8 ADR から `## 実装後の記録` セクションを機械的に削除
2. `workflow-contracts.md`, `document-model.md` に workflow status 禁止ルールを追記

## 元 item

- `adr-implementation-notes-cleanup.md`
- `spec-workflow-status-prohibition.md`
