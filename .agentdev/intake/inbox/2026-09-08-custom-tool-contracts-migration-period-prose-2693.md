---
id: intake-20260908-custom-tool-contracts-migration-period-prose-2693
title: docs/designs/responsibilities/custom-tool-contracts.md の移行期間記述（issue_comment 温存）の文書更新候補
created: 2026-09-08
status: inbox
---

## 概要
- PR: #2693（Issue #2689・Epic #2686 Wave 2・OU-002 呼出元移行と issue_comment 廃止）
- 発見経路: case-run 移行完了後の文書整合確認（PR 本文 Findings / Capture候補 セクション由来）

## 内容
- `docs/designs/responsibilities/custom-tool-contracts.md` に、移行期間（issue_comment 温存）を前提とした記述（対象操作の境界の Comment 操作節・廃止節）が残る。
- Wave 2 完了で呼出元移行と issue_comment 廃止が完了したため、移行期間を前提とした記述は現行状態とずれる。Design の歴史記述（廃止節）として保持するか、現行状態の記述へ更新するかの判断が必要。

## 対応候補
- custom-tool-contracts.md の Comment 操作節・廃止節を移行完了後の現行状態（16操作、廃止済み）へ整合させる（Design 更新。design-save の対象候補。後続判断）。
