---
title: `agentdev-epic-tracker` SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# `agentdev-epic-tracker` SPEC

## 目的

親 Epic Issue のステータス追跡テーブル（`pending` / `ready` / `running` / `completed` / `blocked` / `failed`）を更新する知識ベース。

## 適用対象

- case-auto（子 Issue 選択時の `running` 更新、Wave 反復制御時の進行状況読取）
- case-close（`completed` 更新、Epic 自動クローズ判定）
- case-open（Epic Issue 本文ステータス追跡テーブル初期生成）

## 提供する判断、操作

- ステータス更新プロトコル（`pending` → `ready` → `running` → `completed` / `blocked` / `failed`）
- 親 Epic 検出（`Parent: #{N}` パターン）
- 正規表現パターン（新4列形式: `#` / `Issue` / `ステータス` / `内容`、旧4列形式）
- べき等性確認
- Epic 自動クローズ判定（全子 Issue CLOSED → 自動クローズ）

## 参照する references

- なし（SKILL.md 本文に集約、`agentdev-workflow-lifecycle`、`docs/specs/workflows/epic-wave-model.md` 参照）

## 現在の動作

- 新4列形式と旧4列形式の両方をサポート
- `⏭スキップ` は採用しない（前提未達は `pending` のまま選択対象外、REQ-0106-030）
- `ready` / `running` は case-run(#epic) の内部状態であり永続状態には書き込まれない
- 永続状態に書き込まれるのは `pending` → `completed` / `blocked` / `failed` の遷移のみ（case-close が単一書き手、ADR-0125）

## 対象外

- Epic の作成（case-open 責務）
- 非 Epic Issue の管理
- 一般的な Issue 操作（`agentdev-issue-management` 担当）

## 検証観点

- ステータス値の正確性
- 正規表現による行特定の精度
- マージコンフリクト対応パターンの遵守
- 単一書き手制約（ADR-0125）の遵守

## See Also

- [agentdev-issue-management.md](agentdev-issue-management.md)
- [agentdev-workflow-lifecycle.md](agentdev-workflow-lifecycle.md)
- [../workflows/epic-wave-model.md](../workflows/epic-wave-model.md)
- [commands/case-close.md](../commands/case-close.md)
- REQ-0106（Case実行オーケストレーション / Epic、Wave）
- ADR-0125（Epic Issue 本文単一書き手）
