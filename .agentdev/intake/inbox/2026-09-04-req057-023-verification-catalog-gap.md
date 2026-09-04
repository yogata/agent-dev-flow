---
id: intake-20260904-req057-023-verification-catalog-gap
title: verification-scope-catalog.md への REQ-057-023 未登録（REQ 行追加と検証対応要否分類ゲートの接続漏れの可能性）
created: 2026-09-04
status: inbox
---

## 情報源
- PR: #2578 本文 Findings セクション（case-run DEL-2558-1 が intake 候補として記録）
- Issue #2558 既出 finding 記録（traceability check missing-verification）
- 検出工程: case-run（初回計上）→ case-close 再実行の独立再検査で同一計上を再確認（既出・変更なし）

## 内容

traceability check が REQ-057-023 を missing-verification（検証対応必須扱い）として継続計上する。原因は verification-scope-catalog.md の REQ-057 セクションが REQ-057-001..REQ-057-022 のみ登録で REQ-057-023 が未登録のまま（検証対応任意行としてのカタログ登録、または検証対応宣言のいずれも未実施）。

- REQ-057-023 は REQ 行追加後の検証対応要否分類ゲート（case-open 管轄）が未実施の状態で case pipeline に進んだ可能性
- 本 Issue の test strategy（TS-016-補足）による検証は実施済み（traceability check で missing-implementation 解消・宣言 5 件実在確認）であり、実検証の欠如ではない
- case-close の検証対応要否段階ゲートでは未分類行として扱われるため、後続 Case の完了判定で同様の計上が再発し得る

## 処分候補

- verification-scope-catalog.md の REQ-057 セクションへ REQ-057-023 を検証対応任意行として登録（分類確定）
- または REQ-057-023 行へ検証対応宣言を付与
- 構造的な接続漏れ（REQ 行追加時に分類ゲートが自動起動しない）の場合は case-open workflow 側の検討

## 関連
- #2558 対応記録コメント（検証差分 既出・後続 Case 継承）
- REQ-057-023（req-save 81fb807f 追加）
- PR #2578 本文 Findings セクション
