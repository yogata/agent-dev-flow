---
description: backlog整理サイクル（inspect-docs→昇格3系統→backlog-review）を1回の起動で実行する（追加入口）
---

# backlog 一括整理

backlog 整理サイクル（inspect-docs による文書診断、learning、intake、inspect の3昇格系統、backlog-review による統合と RU 生成）を1回の起動で一巡させる。
既存5コマンド（inspect-docs、learning-promote、intake-promote、inspect-promote、backlog-review）を置換せず、標準の backlog 整理フロー（個別コマンドの逐次実行）を置き換えない追加入口である。

## workflow 実装の権威情報源

本コマンドの workflow 実装本体（orchestration stage 構成、昇格3系統の並行実行と競合処理の直列化契約、fan-in 判定、停止伝播、resume 契約）は `agentdev-workflow-backlog-auto` Workflow Skill を権威情報源とする（責務3層分化、workflow-skill-model SPEC 準拠）。
本コマンド定義は公開 interface / dispatch のみを所有し、workflow 実装本体を複製しない。

**子ワークフローの権威情報源**: 各工程は対応する Workflow Skill（`agentdev-workflow-inspect-docs`、`agentdev-workflow-learning-promote`、`agentdev-workflow-intake-promote`、`agentdev-workflow-inspect-promote`、`agentdev-workflow-backlog-review`）を権威情報源として実行する。
backlog-auto は子ワークフロー内部の分類、評価、昇格、RU 生成ロジックを再実装しない。

## project extensions

本コマンドの workflow 実装本体を所有する Workflow Skill（`agentdev-workflow-backlog-auto`）が、対応する project extension（`.agentdev/extensions/skills/agentdev-workflow-backlog-auto.yaml`、kind: workflow-extension）を読み込む（ADR）。

- extension は `context` / `rules` / `checks` / `acceptance_gates` / `must_not` の5セクションを持ち、本コマンドの標準動作に追加・拡張される（上書きではない）
- extension が存在しない場合は標準動作で続行する
- extension が破損している場合はエラーを表示して当該 extension を無視し、標準動作で続行する
- 詳細な読み込み契約は `agentdev-project-extensions` skill 参照

## 入力

- なし（対象状態は各子コマンドの durable state から解決する）

## 出力

- 各子コマンドの既存出力（`.agentdev/inspect/inbox/` の検出事項、各 promoted/、`.agentdev/backlog/req-units/RU-*.md` 等、子コマンド公開契約どおり）
- backlog-auto 全体の実行結果報告（工程別結果、停止理由、再開コマンド提示を含む共通実行契約形式）

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-backlog-auto` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
同スキルが6 STEP の control plane として制御構造を所有する。
各工程を前出出力検証表で示す（工程ラベルが推奨順）。

| 工程 | 前提条件 | 出力契約 | 検証基準 |
|---|---|---|---|
| STEP-1 開始時刻記録・進行状態初期化 | コマンド起動 | 開始時刻記録、durable state からの進行状態再構成 | 対象状態が各子コマンドの durable state から解決されていること |
| STEP-2 stage 1: inspect-docs 実行 | 開始時刻記録済み | 検出事項（`.agentdev/inspect/inbox/`）または検出事項なし完了 | inspect-docs の公開契約どおりに実行されていること |
| STEP-3 stage 2: 昇格3系統実行 | inspect-docs 正常終了 | 系統別実行結果（正常完了、対象なし終了、blocked、failed の別） | 系統相互の先行依存がなく、競合する Git 操作、共有成果物書き込み、ユーザー対話が直列化されていること |
| STEP-4 fan-in 判定 | 3系統の結果受領 | backlog-review 開始可否の判定 | 全系統が正常完了または対象なし終了の時のみ開始可と判定していること |
| STEP-5 stage 3: backlog-review 実行 | fan-in 判定が開始可 | `RU-*.md` 生成、成功成果物削除（backlog-review 公開契約どおり） | backlog-review の公開契約どおりに実行されていること |
| STEP-6 完了報告 | 全工程完了または停止 | 工程別結果、停止理由、再開コマンド提示を含む実行結果報告 | 停止時に再開点と再開可能な次コマンドが明示され、全体完了が報告されていないこと |

同スキルは本コマンドの工程経由でのみ利用し、単独の skill 起動は soft guard（REQ-{NNNN}-{NNN}）で抑制する。

## 不変条件

工程上の選好を肯定形の不変条件として示す:

- 実行順序は inspect-docs、昇格3系統（learning-promote、intake-promote、inspect-promote）、backlog-review の順とし、工程間の開始条件ゲートを制御する。inspect-docs が正常終了する前に昇格3系統を開始せず、昇格3系統すべてが正常完了または対象なしで終了する前に backlog-review を開始しない
- 昇格3系統相互に先行依存を設けない。1系統の blocked、failed で独立して進行可能な他系統を停止しない
- 同一作業ツリーに対する競合する Git 操作、共有成果物への競合書き込み、ユーザー対話を直列化する。ユーザー対話は対象子ワークフローを識別可能に表示する
- 各子ワークフローの既存 HITL 境界、安全境界、停止条件、自動昇格 opt-in を維持する。通常の backlog-auto 実行で inspect-promote の `--auto` を暗黙的に有効化しない
- 対象なし終了を正常終了として扱う。昇格3系統で新規 promoted が0件でも全系統正常終了後に backlog-review を実行し、実行前から存在する promoted を処理対象にできる
- 中断、再実行時は子ワークフローの既存再開契約を利用する。inspect-docs は中断時に先頭から再実行する
- backlog-auto 自身は新規の副作用を追加しない。各子コマンドの既存副作用のみを発生させる
- 既存5コマンドの定義と公開契約を変更しない。各コマンドは従来どおり単独実行できる

## ガードレール

硬い境界（破壊的操作、state 破壊等の否定規則）に限定する:

- G01: 子ワークフロー内部の分類、評価、昇格、RU 生成を代行しない（各子 Workflow Skill の責務）
- G02: inspect-promote の `--auto` を明示 opt-in なしに有効化しない
- G03: capture 系コマンド（learning-capture、intake-capture、intake-from-github）、inspect-skills、req-define、req-save、GitHub Issue / PR 作成を自動起動しない
- G04: 既存5コマンドの定義ファイルと公開契約を変更しない
