---
id: intake-20260904-req048-template-dist-id-violation-2559
title: REQ-048 template 2 件（issue_desc_epic.md / issue_desc_child.md）の配布物内部 ID 契約違反（base 既知 fail の整合候補）
created: 2026-09-04
status: inbox
---

## 情報源

- PR #2583 本文 Findings / Capture候補 セクション（case-run DEL-2559-1 が intake 候補として記録）
- 検出工程: case-run（base 事前観測で base 既知 fail と確認）→ case-close QG-4 独立再検証で同一 fail を再確認（既出・base 同一）

## 内容

`issue_desc_epic.md` / `issue_desc_child.md` の「配布物内部 ID（REQ-XXXX 数字つき）を含まない」契約テスト（REQ-048-001/002/006、REQ-017-017 記載）が fail する。base（main b9dfbf51）同一 fail であり、Issue #2559 の IR-055 処置とは別契約系統のため本件スコープ外として処置していない。

- case-close QG-4 独立再検証（bun test scripts 全体）でも同一 2 fail を再現
- OU-003 で個別修正した配布物 ID 除去（req-define.md DEC-026 等 3 件）と同系統のテストであり、整合を取る候補

## 処分候補

- issue_desc_epic.md / issue_desc_child.md から配布物内部 ID（REQ-XXXX 数字つき）を除去し、プレースホルダー表現に置換
- 契約テスト期待値または REQ-017-017 の適用範囲に判断が必要な場合は Design 側で確認

## 関連

- Issue #2559 対応記録コメント（検証差分: 既出 3 のうちの 2 件）
- PR #2583 本文 Findings / Capture候補
- REQ-017-017（配布物内部 ID 記載制約）
