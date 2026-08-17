---
title: agentdev-workflow-backlog-auto SPEC
status: draft
created: 2026-08-17
updated: 2026-08-17
spec_logical_division: behavior
canonical_owner: agentdev-workflow-backlog-auto
---

# agentdev-workflow-backlog-auto SPEC

## 目的

backlog-auto command の workflow 実装本体。工程間制御（順序、並列と直列化、fan-in、停止伝播、再開）を所有し、子ワークフロー内部の分類、評価、昇格、RU 生成ロジックを保持しない。

## 適用対象

- USE FOR: `/agentdev/backlog-auto` コマンド起動時の workflow 制御（工程間順序制御、昇格3系統の並行実行と競合処理の直列化、fan-in 判定、停止伝播、再開）
- DO NOT USE FOR: 単独起動。子ワークフロー内部の分類、評価、昇格、RU 生成ロジックの所有（各子 Workflow Skill が正規の処理主体）

## 提供する判断・操作

- orchestration stage 構成（stage 1: inspect-docs 単独直列実行、stage 2: 昇格3系統、stage 3: backlog-review）
- 直列化契約（Git 同期、commit、push、共有成果物への競合書き込み、ユーザー対話の排他）
- fan-in 判定（backlog-review 開始条件、部分停止時の独立系統継続）
- resume 契約（子ワークフローの既存再開契約の利用、トップレベル進行状態の管理）
- 停止条件の伝播（inspect-docs 失敗時の下流工程非開始、全系統完了前の backlog-review 非開始、全体完了報告の抑制）

## 参照する references

- `references/` 配下に工程別制御の詳細を配置する（orchestration stage 詳細、直列化キュー、fan-in 判定、resume 手順）

## 現在の動作

### orchestration stage 構成

- stage 1: inspect-docs（単独、直列実行）
- stage 2: 昇格3系統（learning-promote、intake-promote、inspect-promote。安全に並行可能な処理は並行実行、Git 操作、共有成果物への競合書き込み、ユーザー対話は直列化）
- stage 3: backlog-review（stage 2 全系統の正常完了または対象なし終了後に開始）

### 直列化契約

- Git 同期、commit、push は直列集約ポイントで実行する
- 共有成果物（競合しうる `.agentdev/` 配下パス）への書き込みを排他する
- ユーザー対話は系統識別付きで直列化する

### fan-in 判定

- 3系統すべてが正常完了または対象なし終了: backlog-review を開始する
- 1系統でも blocked / failed / 未完了: backlog-review を開始せず、工程別結果と停止理由を報告する
- 部分停止時に独立系統を連鎖停止しない

### resume 契約

- 各工程は子ワークフローの既存再開契約（durable state、STEP model）を利用する
- トップレベルの進行状態は既存 STEP model / durable state 契約に従い管理する
- inspect-docs は STEP model 対象外（中断時は先頭から再実行）

### 実装分類

manager-orchestrator（既存の実装分類を利用する）

## 対象外

- 子ワークフロー内部の分類基準、評価基準、昇格基準、RU 生成ロジック（各子 Workflow Skill の責務）
- 既存5コマンドの廃止、置換、単独実行契約の変更
- capture 系コマンド（learning-capture、intake-capture、intake-from-github）、inspect-skills、req-define、req-save、GitHub Issue / PR 作成の自動起動

## 検証観点

- 工程間の開始順序と開始条件ゲートが守られること（inspect-docs 正常終了前の昇格3系統非開始、全系統正常完了前の backlog-review 非開始）
- 競合処理の直列化と系統識別付きユーザー対話が機能すること
- 中断・再実行時に完了済み工程の重複実行と未完了工程の誤認がないこと
