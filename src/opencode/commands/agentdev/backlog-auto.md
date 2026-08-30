---
description: backlog整理サイクル（inspect-docs→昇格3系統→backlog-review）を1回の起動で実行する（追加入口）
---

# backlog 一括整理

backlog 整理サイクル（inspect-docs による文書診断、learning、intake、inspect の3昇格系統、backlog-review による統合と RU 生成）を1回の起動で一巡させる。
既存5コマンド（inspect-docs、learning-promote、intake-promote、inspect-promote、backlog-review）を置換せず、標準の backlog 整理フロー（個別コマンドの逐次実行）を置き換えない追加入口である。

## 入力

- なし（対象状態は各子コマンドの永続状態から解決する）

## 出力

- 各子コマンドの既存出力（`.agentdev/inspect/inbox/` の検出事項、各 promoted/、`.agentdev/backlog/req-units/RU-*.md` 等、子コマンド公開契約どおり）
- backlog-auto 全体の実行結果報告（工程別結果、停止理由、再開コマンド提示を含む共通実行契約形式）

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-backlog-auto` スキルへ委譲する（DEC-{N}、REQ-{NNNN}-{NNN}）。
工程、分岐、状態遷移、再開、停止などの高水準の実行構造、子ワークフロー（inspect-docs、learning-promote、intake-promote、inspect-promote、backlog-review）の権威情報源と読込主体の割当ても同スキルの制御平面（control plane）が所有する。
backlog-auto は子ワークフロー内部の分類、評価、昇格、RU 生成ロジックを再実装しない。

## 不変条件

工程上の選好を肯定形の不変条件として示す:

- 実行順序は inspect-docs、昇格3系統（learning-promote、intake-promote、inspect-promote）、backlog-review の順とし、工程間の開始条件ゲートを制御する。inspect-docs が正常終了する前に昇格3系統を開始せず、昇格3系統すべてが正常完了または対象なしで終了する前に backlog-review を開始しない
- 昇格3系統相互に先行依存を設けない。1系統の blocked、failed で独立して進行可能な他系統を停止しない
- 同一作業ツリーに対する競合する Git 操作、共有成果物への競合書き込み、ユーザー対話を直列化する。ユーザー対話は対象子ワークフローを識別可能に表示する
- 各子ワークフローの HITL 境界、安全境界、停止条件、自動昇格 opt-in を子ワークフロー側の所有として維持する。通常の backlog-auto 実行で inspect-promote の `--auto` を暗黙的に有効化しない
- 対象なし終了を正常終了として扱う。昇格3系統で新規 promoted が0件でも全系統正常終了後に backlog-review を実行し、実行前から存在する promoted を処理対象にできる
- 中断、再実行時は子ワークフローの既存再開契約を利用する。inspect-docs は中断時に先頭から再実行する
- backlog-auto 自身は新規の副作用を追加しない。各子コマンドの既存副作用のみを発生させる
- 既存5コマンドを従来どおり単独実行できる。backlog-auto は子ワークフローの公開契約を変更しない（子ワークフロー自身の契約変更は各コマンドの正規変更経路による）

## ガードレール

硬い境界（破壊的操作、state 破壊等の否定規則）に限定する:

- 子ワークフロー内部の分類、評価、昇格、RU 生成を代行しない（各子 Workflow Skill の責務）
- inspect-promote の `--auto` を明示 opt-in なしに有効化しない
- capture 系コマンド（learning-capture、intake-capture、intake-from-github）、inspect-skills、req-define、req-save、GitHub Issue / PR 作成を自動起動しない
- 子ワークフローの定義ファイルと公開契約を変更しない（子ワークフロー自身の契約変更は各コマンドの正規変更経路による）
