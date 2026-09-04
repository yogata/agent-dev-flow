---
id: intake-20260904-ir055-baseline-schema-documentation-2559
title: ir-055-baseline.json entry schema（classification/reason）の integrity-contracts.md への明文化（Design 更新候補）
created: 2026-09-04
status: inbox
---

## 情報源

- PR #2583 本文 Design確定候補 セクション（case-run DEL-2559-1 が Design 更新候補として記録）
- 検出工程: case-run（OU-003 実装時に baseline entry schema を拡張）→ case-close QG-4 独立再検証で schema 実在を確認（heuristic entry 26 件全件に classification/reason 付き）

## 内容

Issue #2559 で ir-055-baseline.json の entry に `classification: baseline`（統一選択基準の処置分類）と `reason`（根拠）を追加し、`--update-ir055-baseline` 再生成で機械的に付与・保持する実装とした。NG baseline の schema 記述（integrity-contracts.md「baseline 運用手順」の entry 形式）と同水準の注記を IR-055 baseline も持つ状態になったが、REQ/Design 本文は本件では変更していない。

- integrity-contracts.md 側への IR-055 baseline entry schema 明文化が未実施
- strict entry 21 件は classification/reason の機械付与対象外であり、schema 記述時に対象範囲の明記が有用

## 処分候補

- integrity-contracts.md（baseline 運用手順節）へ IR-055 baseline entry schema（classification/reason、機械付与契約、strict 非対象）を追記する Design 更新
- Design 更新に合わせて REQ 側（v2:REQ-0161-005 系）の記述確認

## 関連

- Issue #2559 対応記録コメント（case-close・観察セクション）
- PR #2583 本文 Design確定候補
- ACT-DESIGN-003（integrity-contracts baseline 運用契約の統一選択基準確定）
