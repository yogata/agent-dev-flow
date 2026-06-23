---
title: inspect-promote SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# inspect-promote SPEC

## 目的

`.agentdev/inspect/inbox/` の検出事項を分類、採用し、採用済み成果物として `.agentdev/inspect/promoted/` へ出力する。`--auto` オプションで高確信度検出事項の自動 promote を有効化する。

## 入力

- `.agentdev/inspect/inbox/*.md`（検出事項ファイル群）
- `--auto`（省略可能）（高確信度検出事項の自動 promote を有効化）

## 出力

- `.agentdev/inspect/promoted/*.md`（手動 promote 採用済み、RU 化対象）
- `.agentdev/inspect/archive/rejected/*.md`（却下済み）
- `.agentdev/intake/promoted/inspect-auto-*.md`（`--auto` 時の自動 promote 成果物）
- `.agentdev/inspect/promoted/auto-promote-log.md`（`--auto` 実行ログ、append-only）
- セッション内完了報告

## 副作用

- ファイル移動、作成、削除: `.agentdev/inspect/` および `.agentdev/intake/` 配下
- git commit/push: `.agentdev/inspect/` および `.agentdev/intake/` 配下
- 実行前同期: `git pull --ff-only`

## 現在の動作

- 実行前同期（`git pull --ff-only`）
- inbox スキャン
- 検出事項分類（promote / defer / reject）
- 自動 promote（`--auto` opt-in 時のみ）:
  - 自動 promote 対象: SPEC分離基準違反（high-specificity）、構造的即時是正
  - 自動 promote 対象外: 命名、分類の意味判断、ADR 要否判断（手動分類へ回す）
  - 投入先: `.agentdev/intake/promoted/inspect-auto-{timestamp}-{slug}.md`
  - 実行ログ: `.agentdev/inspect/promoted/auto-promote-log.md` に投入対象記録
- HITL 確定（手動分類対象）
- promote 処理: `.agentdev/inspect/promoted/` へ保存
- reject 処理: `.agentdev/inspect/archive/rejected/` へ移動
- defer 処理: `.agentdev/inspect/inbox/` に残す
- 完了報告
- `.agentdev/` 変更の commit と push

## 参照する横断 SPEC

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（コマンド分類）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（検出事項プロトコル、inspect-promote 自動 promote 対象カテゴリ、投入先、実行ログ、誤検知 revoke 手順）

## 対象外

- ユーザーの明示的な承認なしの採用済み成果物生成（G01、`--auto` による自動 promote 対象を除く）
- promote 検出事項以外の `.agentdev/inspect/promoted/` 保存（G02）
- reject 検出事項の `.agentdev/inspect/archive/rejected/` 以外への移動（G03）
- defer 検出事項の `.agentdev/inspect/inbox/` からの移動（G04）
- docs-check ルール、検査データ追加候補の独立 route 化（G05、要件化方向または受け入れ条件に含める）
- `--auto` の明示 opt-in なしの有効化（G06）
- `--auto` による意味判断、曖昧分類、ADR 要否判断の自動投入（G07、手動分類へ回す）
- `--auto` 実行ログの省略（G08、`auto-promote-log.md` に投入対象、根拠を記録）

## 検証観点

- ユーザー明示承認の確保（G01、`--auto` 対象除く）
- 分類の正確性: promote / defer / reject
- 投入先、形式の正確性: `.agentdev/intake/promoted/inspect-auto-{timestamp}-{slug}.md`（`--auto` 時）
- 自動 promote 対象カテゴリの遵守: SPEC分離基準違反（high-specificity）、構造的即時是正のみ
- 自動 promote 対象外の手動分類回し: 命名、分類の意味判断、ADR 要否判断
- 実行ログ記録の完備（G08）

## See Also

- [inspect-docs.md](inspect-docs.md), [inspect-skills.md](inspect-skills.md)（前段コマンド（検出事項生成））
- [backlog-review.md](backlog-review.md)（後続コマンド（RU 生成））
- REQ-0126（inspect-promote / 検出事項分類、昇格）
- REQ-0136（inspect-promote 自動 promote（REQ-0136-016））
