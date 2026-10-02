# STEP-6: deviation capture・完了報告（capture-and-completion）

> 本 reference は `agentdev-workflow-case-open` SKILL.md の制御平面（STEP 一覧）STEP-6 詳細である。
> SKILL.md は control plane として STEP 遷移を管理し、本 reference は STEP-6 の実行詳細を提供する。

## Purpose

自工程で実観測した deviation を Split Rule で分類して intake / learning のいずれかへ保存し、完了報告を出力する。
case-close への capture 委譲は廃止済みである。draft / RU は削除しない。

## Input Resolution

1. SSoT 再構成: Root Case Issue 番号、Definition PR 作成結果、実行中に実観測した deviation
2. identifier 保持: Issue 番号、PR 番号、capture 候補パス
3. 最小 scalar: 分類（intake / learning）
4. runtime artifact: なし

## Preconditions

- STEP-5 の冪等再実行確認が完了している

## Procedure

### STEP-6-1: deviation capture

1. 実観測した deviation の保存を `agentdev-learning-capture` skill または `agentdev-intake-pipeline`（自動capture向け item 生成操作）へ委譲する
2. 保存先は capture 境界 Design（`<workflows/capture-boundaries>`）の Split Rule に従う（`.agentdev/intake/inbox/` または `.agentdev/learning/`）
3. git 永続化は `agentdev-git-worktree` の並列実行安全ステージングプロシージャに従い、明示パス指定で commit / push する
4. 委譲範囲を超える `.agentdev/intake/`、`.agentdev/learning/` の直接変更を行わない

### STEP-6-2: 完了報告

1. `agentdev-workflow-templates` の Root Case テンプレートに従い完了報告を出力する
2. Root Case Issue 番号、Definition Package の生成・関連付け結果、Definition PR 作成結果（実変更なしの場合は不作成を記録）、Capture結果（保存した成果物のパス・分類・保存結果）を含める
3. 次のコマンドとして `case-ready` を記載する（Root Case 状態 open。ready への遷移は case-ready が実行する）

draft / RU の削除、削除残存検証、main 同期確認は行わない（draft / RU 削除は case-ready が実行する: ）。

## Result

- deviation capture 保存完了（分類済み）
- 完了報告出力

## Evidence

- capture 成果物のパスと分類、保存結果、完了報告の出力内容

## Completion Verification

- capture 項目が Split Rule に従い保存され、パスが Capture結果 小節に列挙されていること
- 完了報告に次のコマンド（case-ready）が記載されていること

## Resume-Idempotency

- capture 保存は既存項目を検出した場合は重複保存しない。完了報告の出力は冪等である

## resume point

- capture 保存状態、完了報告の出力状態

## 関連 STEP

- 前: STEP-4 / STEP-5（definition-pr-and-idempotency）
