# Workflow Contracts Specification

> **Scope**: This SPEC applies to the agent-dev-flow repository only.

## Purpose

Workflow 契約の雛形を定義し、コマンドパイプライン間の入出力関係と前提条件を明確にする（REQ-0104）。

## Pipeline Overview

AgentDevFlow は3つのパイプラインで構成される:

| パイプライン | コマンド | 目的 |
|---|---|---|
| req/case | req-define → req-save → case-open → case-run → case-close → case-update | 要件定義から実装完了まで |
| learning | learning-capture → learning-refine → learning-promote | 学びの蓄積・分析・昇華 |
| intake | intake-capture / intake-from-github → intake-review → intake-promote | 改善候補の収集・審査・昇華 |

## Command I/O Contracts

### req/case Pipeline

| コマンド | 入力 | 出力 | 前提 |
|---|---|---|---|
| `/agentdev/req-define` | ユーザー対話、既存要件情報 | 要件 doc（draft） | — |
| `/agentdev/req-save` | 要件 doc（draft） | REQ/ADR ファイル | req-define 完了 |
| `/agentdev/case-open` | REQ ファイルまたは要件 doc | GitHub Issue | req-save または req-define 完了 |
| `/agentdev/case-run` | GitHub Issue | 実装済みブランチ + PR | case-open 完了 |
| `/agentdev/case-close` | PR | マージ済み + クローズ済み | case-run 完了 |
| `/agentdev/case-update` | Issue 番号 | 更新済み Issue | Issue 存在 |

### learning Pipeline

| コマンド/スキル | 入力 | 出力 | 前提 |
|---|---|---|---|
| `learning-capture`（スキル） | エージェント実行中の観測 | `inbox.md` エントリ | — |
| `/agentdev/learning-refine` | `inbox.md` | `evaluation-report.md` + `archive/active.md` 更新 | inbox.md にエントリ |
| `/agentdev/learning-promote` | `evaluation-report.md` | promoted artifact | refine 完了 |

### intake Pipeline

| コマンド | 入力 | 出力 | 前提 |
|---|---|---|---|
| `/agentdev/intake-capture` | 手動入力 | inbox item | — |
| `/agentdev/intake-from-github` | クローズ済み Issue/PR | inbox item | — |
| `/agentdev/intake-review` | inbox items | accepted / archive | inbox に item |
| `/agentdev/intake-promote` | accepted items | promoted artifact | review 完了 |

### 共通後段

| コマンド | 入力 | 出力 | 前提 |
|---|---|---|---|
| `/agentdev/backlog-review` | promoted artifact | review draft | promoted 存在 |
| `/agentdev/backlog-save` | review draft | RU（Requirement Unit） | review 完了 |

## Workflow Routing

work_type と scale により workflow_route を決定する:

| work_type | scale | workflow_route |
|---|---|---|
| bug | any | req-define → case-open → case-run → case-close |
| feature | standard | req-define → req-save → case-open → case-run → case-close |
| feature | large | req-define → req-save → case-open（Epic + 子Issue）→ case-run（Wave）→ case-close |
| maintenance | any | req-define → req-save → case-open → case-run → case-close |

## Epic Orchestrator Contract

scale: large の場合、Epic Orchestrator モードで実行する:

- Epic Issue 本文の `## 実行順序` セクションを SSoT とする
- Wave 単位で子 Issue を直列または並列実行
- 親エージェントは orchestration のみ担当し、実装詳細を抱え込まない
- 失敗時は依存する後続 Wave をスキップ

## Self-Healing Contract

`case-run` の検証失敗時に自律修正を試みる:

- 最大3回の修正ループ（11a / 11c それぞれ独立カウント）
- 修正範囲は既存要件範囲内に限定
- 7項目の停止条件に該当した場合は即座停止・ユーザー報告

## Scope Declaration

`docs/specs/` は agent-dev-flow レポジトリ専用である。他プロジェクトへの適用を意図しない。
