---
title: `agentdev-workflow-lifecycle` SPEC
status: accepted
spec_logical_division: behavior
canonical_owner: agentdev-workflow-lifecycle
created: 2026-06-21
updated: 2026-08-19
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
- スケール判定（feature のみ、3条件: 複数モジュール跨ぎ、PR 肥大化リスク、段階的リリース。実証Caseは work_type にかかわらず scale と Issue 構造を選択可能、実証の判定は REQ-043 の定義による）
- 実装スコープシグナル確認（ドラフト内実装詳細セクション検出時の scale: large 昇格判定、REQ-004-056）
- 前工程からの引き継ぎ判定、停止条件（`agentdev_handoff: true` 検出時）
- SSoT 遷移
- ラベル体系

## 参照する references

- `references/upstream-handoff.md`

## 現在の動作

- 宣言的定義のみを提供
- 手順、手続きは含まない
- エージェントが自律的に判断できることをユーザーに確認しない

## スケール判定と工程分類の実証Case例外（新規セクション）

本節はスケール判定と工程分類における実証Case例外を所有する（REQ-005-005 の更新に対応）。

- 通常Caseの scale は feature のみ standard / large とする（REQ-005-005）
- 実証Case（REQ-043 の定義による）は work_type にかかわらず scale と Issue 構造を選択できる（REQ-005-005）
- work_type・scale 判定の宣言的定義（REQ-005-012）は通常Caseの判定規則として維持し、実証Case例外は当該宣言的定義に対する例外適用として扱う。実証の判定は REQ-043 の定義による

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
- REQ-001（ADR ライフサイクル、文書体系基盤）
- REQ-005（workflow-lifecycle 宣言的純化）

