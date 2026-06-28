---
title: `agentdev-workflow-lifecycle` SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# `agentdev-workflow-lifecycle` SPEC

## 目的

AgentDevFlow のフェーズ定義、SSoT 遷移、work_type 判定基準、スケール判定、コマンド関連を提供する宣言的知識ベース。

## 適用対象

- ライフサイクル判定、ワークフローフェーズ判定
- work_type 分類（bugfix / feature / maintenance / docs_chore）
- スケール判定（feature のみ standard / large）
- 前工程からの引き継ぎ判定、停止条件
- SSoT 遷移に関する共通判断

## 提供する判断、操作

- フェーズ定義（マクロ: 壁打ち、構造的実行、レビュー完了 / マイクロ: requirement、analyzed、created、in_progress、review、done）
- work_type 分類（4値）
- スケール判定（feature のみ、3条件: 複数モジュール跨ぎ、PR 肥大化リスク、段階的リリース）
- 実装スコープシグナル確認（ドラフト内実装詳細セクション検出時の scale: large 昇格判定、REQ-0102-056）
- 前工程からの引き継ぎ判定、停止条件（`agentdev_handoff: true` 検出時）
- SSoT 遷移
- ラベル体系

## 参照する references

- `references/upstream-handoff.md`

## 現在の動作

- 宣言的定義のみを提供
- 手順、手続きは含まない
- エージェントが自律的に判断できることをユーザーに確認しない

## 対象外

- Issue 本文生成、Issue 作成、Epic/child Issue 生成（`agentdev-issue-management`、case-open 責務）
- Intake パイプライン（`agentdev-intake-pipeline` 担当）
- inspect-docs 診断（`agentdev-req-structure-diagnostics` 担当）
- backlog-review 統合手順（`agentdev-backlog-integration` 担当）
- command 固有 Step 番号、command 固有実行順序

## 検証観点

- work_type 分類が正しいか（4値のいずれか）
- スケール判定が正しいか（feature のみ、3条件のいずれか）
- 前工程からの引き継ぎ判定が正しいか
- フェーズ定義に従っているか

## See Also

- [agentdev-workflow-routing.md](agentdev-workflow-routing.md)
- [agentdev-workflow-orchestration.md](agentdev-workflow-orchestration.md)
- [../workflows/workflow-contracts.md](../workflows/workflow-contracts.md)
- REQ-0112（ADR ライフサイクル、文書体系基盤）
- REQ-0123（workflow-lifecycle 宣言的純化）
