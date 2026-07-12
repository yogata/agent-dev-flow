---
title: `agentdev-case-run-execution-adapter` SPEC
status: draft
created: 2026-06-21
updated: 2026-07-12
---

# `agentdev-case-run-execution-adapter` SPEC

## 目的

case-run が Issue 実装を実行担当サブエージェントへ委譲する際のアダプタープロトコルを定義し、実行結果（completed-pr / blocked / failed / delegation-unavailable）を処理する。
実行 command は委譲 prompt 内で指定され、`load_skills` には adapter skill を指定する。command の具体名、起動手段は AGENTS.md および references/<harness>.md 参照（REQ-0162-002）。

## 適用対象

- Issue 単位の実装作業を実行担当サブエージェントに接続し、実行結果を case-run へ返却する時
- ADR-0114 / ADR-0128 に基づく外部実行委譲
- 委譲起動失敗、異常終了時の事後処理

## 提供する判断、操作

- 委譲プロトコル（adapter skill 経由での委譲起動 + 委譲 prompt 内で実行 command を指定）。起動手段の詳細は AGENTS.md および references/<harness>.md 参照（REQ-0162-002）
- result 契約（4状態: completed-pr / blocked / failed / delegation-unavailable）
- worktree 隔離遵守、自己検証
- 委譲起動失敗時の事後処理（worktree `git status` で未コミット変更確認、残留箇所 grep と手動修正）

## 参照する references

- `references/<harness>.md`（harness 固有の委譲起動仕様）

## 現在の動作

- 実行担当サブエージェントの起動手段、実行制御パラメータは AGENTS.md および references/<harness>.md に配置する（REQ-0162-002）
- worktree root 外での作業を禁止
- PR URL を SSoT として返却（REQ-0130-021 廃止に伴い PR URL フォールバック検索不使用）
- 各ツール呼び出しは120秒 timeout で保護
- runtime workspace（実行監査トレイル等）の構造、配置は harness の責務であり、配布 SPEC は関与しない（REQ-0162-002）

## 対象外

- req-define のアーキテクチャ確認（`agentdev-architecture-advisory` 担当）
- ワークフロー状態管理（`agentdev-workflow-lifecycle` 担当）
- Issue 完了条件チェックボックスの評価、更新（case-close QG-4 責務）

## 検証観点

- worktree 隔離の自己検証
- PR URL の正確性
- result 契約（4状態）の適合性
- 委譲起動失敗時の適切な事後処理

## See Also

- [agentdev-workflow-orchestration.md](agentdev-workflow-orchestration.md)
- [agentdev-git-worktree.md](agentdev-git-worktree.md)
- [commands/case-run.md](../commands/case-run.md)
- REQ-0130（case-run / 実装パイプライン）
- REQ-0139（外部エージェント統合契約）
- ADR-0114（case-auto 最大自走モード）
- ADR-0128（case-run 外部実行委譲）
