---
title: Input Resolution and Durable State
status: draft
created: 2026-08-10
updated: 2026-08-15
---

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

## ローカル一時実行状態と再開

中断・再開に必要なローカル一時実行状態の性質と、再開時の正規状態優先の契約を定義する（REQ-002-036、REQ-005-027、DEC-015）。

- ローカル一時実行状態の性質: 中断・再開に必要なローカル一時実行状態はローカルに永続化し、Git 管理を要求せず、他端末との共有を要求せず、実行履歴としての恒久保存を要求せず、会話コンテキストだけを唯一の情報源にせず、保存場所の具体的なパスを要件として固定しない。正規成果物から再構成できる情報を別の正規状態として重複管理せず、正規成果物へまだ反映されていない中断・再開に必要な最小情報のみを保持し、正規成果物上で処理単位が終端状態になった後にその処理単位のローカル状態保持を要求しない。`.agentdev/` の Git 管理対象ドメイン状態と Git 管理しないローカル一時実行状態を区別できること（REQ-002-036）。
- 再開時の5順序: (1) ローカル一時状態から再開対象を特定し、(2) Issue / PR / Case ファイル等の正規状態を再取得し、(3) 現在位置を再構成し、(4) 既に完了している処理を再実行せず、(5) 未完了部分のみを続行する（REQ-005-027）。
- 矛盾時の取扱い: ローカル一時状態と正規状態が矛盾する場合は正規状態を優先し、安全に自動解消できない場合は停止する（REQ-005-027）。
