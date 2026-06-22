---
title: agentdev-workflow-orchestration SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# agentdev-workflow-orchestration SPEC

## 目的

case-run の状態機械・サブエージェントプロトコル・自律修正ループ・CI 対応ループ・1 Issue オーケストレーションの知識ベースを提供する。

## 適用対象

- case-run の再開ポイント判定・自律修正ループ判定・CI 対応・subagent 起動・障害伝播時
- case-close の達成判定プロトコル参照時

## 提供する判断・操作

- 状態機械（準備フェーズ・実装フェーズ・提出フェーズ）の再開条件判定
- Windows + ジャンクション環境の既知の制約
- 実行担当サブエージェント（Sisyphus-Junior）引き継ぎプロンプト制約（委譲 prompt 内で `/ulw-loop` command を指定）
- Capture 境界の一次参照（intake / learning 境界・Split Rule・コマンド責務境界）
- 達成判定プロトコル（5 条件・変更対象分類×検証種別分類）

## 参照する references

- `references/capture-boundaries.md`
- `references/self-healing-and-errors.md`
- `references/subagent-protocol.md`

## 現在の動作

- case-run は常に1 Issue のみを処理
- Epic 全体・Wave 一括実行は提供しない（case-auto・case-run #epic 責務）
- worktree 内 `.opencode/` は空（ジャンクション未伝播）であることを必須項目として明記
- ジャンクション依存の整合性検査を回避

## 対象外

- 単一 Issue の基本的な Step 実行手順（case-run コマンド定義参照）
- work_type 判定（`agentdev-workflow-lifecycle` 担当）
- 乖離検出 QG-3（`agentdev-quality-gates` 担当）
- 子 Issue 選択・Wave 構成生成（case-open / case-auto 責務）

## 検証観点

- 再開条件を正しく判定しているか
- ジャンクション依存の整合性検査を回避しているか
- 実行担当サブエージェント起動プロンプトに必須項目を含めているか

## See Also

- [agentdev-workflow-lifecycle.md](agentdev-workflow-lifecycle.md)
- [agentdev-workflow-routing.md](agentdev-workflow-routing.md)
- [agentdev-case-run-execution-adapter.md](agentdev-case-run-execution-adapter.md)
- [commands/case-run.md](../commands/case-run.md)
- [commands/case-close.md](../commands/case-close.md)
- [../workflows/capture-boundaries.md](../workflows/capture-boundaries.md)
- REQ-0130 — case-run / 実装パイプライン
