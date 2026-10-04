# 採用済み成果物: docs/knowledge 2 文書の REQ-056-003 必須セクション欠落の補完

## 観測内容

check_knowledge_docs.ts（REQ-056-003 必須セクション検査）で、次の 2つの知識文書が必須セクション（適用対象・根拠・関連知識）を欠落している（合計 6 findings）。

- docs/knowledge/structure-migration-followup-checklist.md
- docs/knowledge/windows-rename-eperm-diagnosis-and-bounded-retry.md

## 影響

REQ-056-003 が定める知識文書の必須構成への不適合が機械検査で継続的に検出される。知識文書としての適用対象・根拠・関連知識が読み取りにくく、知識の再利用性が下がる。

## 課題

REQ-056-003 に従い、両文書へ欠落セクション（適用対象・根拠・関連知識）を補完する対応候補。検証は `check_knowledge_docs.ts --root <root> --json` で再実行して 6 findings の解消を確認する。

## 既存要件との関連

- REQ-056-003（知識文書の必須セクション構成）
- REQ-056-010（知識領域の機械検査）の検査対象

## 出処・根拠

- 元 inbox item: `.agentdev/intake/inbox/2026-10-03-knowledge-required-sections-missing.md`（分類採用により削除済み）
- 観測元: PR #3378（Case #3338・OU-008）本文 Findings / Capture候補 セクション
- case-close 再実測（2026-10-03・PR HEAD worktree 37ccd5c5 と origin/main 041647b3 の両方で 6 findings 同発生を確認）
- captured_at_commit: 07339129f54e2ba177123efbd8b33f4c26b5c205
- 現行源検証（intake-promote・ad6e8341・読取のみ）: 両文書の現行セクション構成は「知識内容・適用条件・手順・留意点・出典」であり、checker が要求する「適用対象・根拠・関連知識」は現行も欠落していることを確認
