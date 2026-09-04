---
id: intake-20260904-checkextensions-stats-mismatch-2559
title: checkExtensions 統合テスト「returns ok=true with migrated stats」の統計値不整合（base 既知 fail の継続追跡候補）
created: 2026-09-04
status: inbox
---

## 情報源

- PR #2583 本文 Findings / Capture候補 セクション（case-run DEL-2559-1 が intake 候補として記録）
- 検出工程: case-run（base 事前観測で base 既知 fail と確認）→ case-close QG-4 独立再検証で同一 fail を再確認（既出・base 同一）

## 内容

`check_extensions.test.ts` の「returns ok=true with migrated stats after the atomic cutover」が base（main b9dfbf51）でも fail する（workflow_extensions 期待値 16 対実測の不一致）。Issue #2559 の変更（checker 系・IR-055 baseline）とは無関係であることを base との fail 構成比較で確認済み。

- case-close QG-4 独立再検証（bun test scripts 全体 2525 pass / 3 fail）でも同一 fail を再現（base 同一・本件無関係）
- checker 系テストの統計値期待値が実リポジトリ状態に追従していない可能性

## 処分候補

- check_extensions.test.ts の workflow_extensions 統計値期待値を実リポジトリ状態に整合させる修正
- または統計値を機械導出する実装側の変更（テストの期待値ハードコード解消）

## 関連

- Issue #2559 対応記録コメント（検証差分: 既出 3 のうちの 1 件）
- PR #2583 本文 Findings / Capture候補・検証差分（base b9dfbf51 との比較）
