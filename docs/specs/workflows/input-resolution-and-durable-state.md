---
title: Input Resolution and Durable State
status: draft
created: 2026-08-10
updated: 2026-08-10
spec_logical_division: cross_cutting_contract
canonical_owner: input-resolution-and-durable-state
---

<!-- canonical_owner: input-resolution-and-durable-state / spec_logical_division: cross_cutting_contract（ACT-SPEC-003 rationale より） -->

# Input Resolution and Durable State

## 目的

入力解決優先順位、永続状態、current STEP 再構成、並列child task 復元の契約を定義する。
DEC-011 の入力解決・永続状態側面を正規所有する。

## durable state 優先順位

1. SSoT 再構成（docs/ 配下の永続文書から再取得・再検証）
2. identifier 保持（RU-ID・REQ-ID・Issue番号等の安定識別子）
3. 最小 scalar（数量的な状態値）
4. runtime artifact（draft・検出事項等の一時成果物、REQ-008 に従う）

自然言語の前STEP result のみに依存しない。

## current STEP 再構成

安定したSTEP 識別子と durable state から current STEP を決定する契約を AgentDevFlow 配布契約が所有する。
ToDo 使用・compaction 検出・current STEP 選択の実処理は harness 固有（AGENTS.md / harness reference）。

## 並列child task 復元

child identity / status を Harness から復元し、完了済みchild 状態を durable domain state と再構成して
fan-in 判定を行う。
