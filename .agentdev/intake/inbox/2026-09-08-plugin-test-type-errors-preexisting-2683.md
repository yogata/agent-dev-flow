---
id: intake-20260908-plugin-test-type-errors-preexisting-2683
title: plugin.test.ts の型エラー3件（labels プロパティ）は main 由来の既存欠陥として修正対象化
created: 2026-09-08
status: inbox
---

## 概要
- PR: #2684（Issue #2683・Epic #2681 Wave 1・OU-002 Local 実装系改名整合）
- 発見経路: case-close の Capture 回収（PR 本文「Findings / Capture候補」セクション由来）

## 内容

src/opencode/plugins/agentdev-gh-tool/tests/plugin.test.ts L56/58/61 に TS2339（`labels` プロパティ不存在）の型エラーが3件存在する。main 由来の既出（03f75b04 / PR #2676 系）であり、PR #2684 の当該パッケージ差分は plugin.ts コメント1行と README 1行のみのため本 PR 起因ではない。実行時テストは 7/7 成功しており動作への影響はない。labels schema 型整合は Issue #2663 由来の別課題として記録済み（record-in-findings）。

## 変更候補
- plugin.test.ts の labels プロパティ参照を現行 schema 型に整合させる修正を後続 Issue で実施する（#2663 系の labels schema 課題と一体で判断する）
- `bun run typecheck` を plugin パッケージの品質統制に組み込むかどうかの判断材料

## 関連
- Issue #2683（クローズ済み。OU-002）
- Issue #2663（labels schema 型整合の由来）
- PR #2684（squash merge commit f2bf0fbc）
- src/opencode/plugins/agentdev-gh-tool/tests/plugin.test.ts L56/58/61
