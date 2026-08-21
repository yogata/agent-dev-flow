---
title: backlog-auto Design
status: accepted
created: 2026-08-17
updated: 2026-08-17
---
<!-- ADF-COVERS(implementation): REQ-041-001, REQ-041-002, REQ-041-003, REQ-041-004, REQ-041-005, REQ-041-006, REQ-041-007, REQ-041-008, REQ-041-009, REQ-041-010, REQ-041-011, REQ-041-012, REQ-041-013, REQ-041-014, REQ-041-015, REQ-041-016 -->

# backlog-auto Design

## 目的

`/agentdev/backlog-auto` 公開コマンド。backlog 整理サイクル（inspect-docs → 昇格3系統 → backlog-review）を1回起動で実行する薄いオーケストレータの公開 interface を定義する。workflow 実装本体は `agentdev-workflow-backlog-auto` Workflow Skill が所有する。

既存5コマンド（inspect-docs、learning-promote、intake-promote、inspect-promote、backlog-review）は置換せず、標準の backlog 整理フロー（個別コマンドの逐次実行）を置き換えない追加入口として位置づける。

## 入力

- 引数なし（対象状態は各子コマンドの durable state から解決する）

## 出力

- 各子コマンドの既存出力（`.agentdev/inspect/inbox/`、各 promoted/、`.agentdev/backlog/req-units/RU-*.md` 等、子コマンド公開契約どおり）
- backlog-auto 全体の実行結果報告（工程別結果、停止理由、再開コマンド提示を含む共通実行契約形式）

## 副作用

- 各子コマンドの既存副作用（`.agentdev/` 配下の成果物作成・削除、git commit/push、ユーザー対話）を子コマンド公開契約どおりに発生させる。backlog-auto 自身は新規の副作用を追加しない

## HITL 境界

- 各子ワークフローの既存 HITL 境界を維持する。backlog-auto 自身は新規の判断境界を追加しない
- 複数系統が判断待ちの場合はユーザー対話を直列化し、対象子ワークフローを識別可能に表示する

## 停止条件

- inspect-docs が blocked / failed の場合、下流工程を開始せず停止する
- 昇格3系統に blocked / failed / 未完了が残る場合、backlog-review を開始せず停止する
- 再実行時は子ワークフローの既存再開契約に従う

## 現在の動作

- 実行順序は inspect-docs → 昇格3系統（learning-promote、intake-promote、inspect-promote）→ backlog-review の順とし、工程間の開始条件ゲートを制御する
- workflow 実装本体（orchestration stage 構成、直列化契約、fan-in 判定、resume 契約）は Workflow Skill（`agentdev-workflow-backlog-auto`）が所有し、本 Design はこれらを複製しない

## 参照する横断 Design

- [workflows/workflow-contracts.md](../workflows/workflow-contracts.md)（コマンド分類、共通実行契約）
- [workflows/epic-wave-model.md](../workflows/epic-wave-model.md)（orchestration stage モデル）
- [workflows/backlog-artifact-lifecycle.md](../workflows/backlog-artifact-lifecycle.md)（RU / 採用済み成果物 lifecycle）

## 対象外

- 既存5コマンドの定義変更を行わない
- inspect-promote --auto を暗黙的に有効化しない
- 子ワークフロー内部の分類、評価、昇格、RU 生成ロジックの再実装（Workflow Skill の責務範囲）

## 検証観点

- 工程別結果と停止理由が共通実行契約形式で報告されること
- 既存5コマンドの公開契約に差分がないこと
