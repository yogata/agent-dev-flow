# STEP-1: 引き継ぎ・OU 選択（handoff-and-ou-gate）

> 本 reference は `agentdev-workflow-case-open` SKILL.md の制御平面（STEP 一覧）STEP-1 詳細である。
> SKILL.md は control plane として STEP 遷移を管理し、本 reference は STEP-1 の実行詳細を提供する。

## Purpose

処理対象（全要件doc / 指定 OU / 自律選択 OU）を確定し、前工程からの引き継ぎ停止判定を行う。

## Input Resolution

1. SSoT 再構成: 要件doc（構造化 `draft-data`、`operation_units` セクション）
2. identifier 保持: OU ID（指定時）、RU-ID
3. 最小 scalar: なし
4. runtime artifact: なし

## Preconditions

- case-open command から要件doc（構造化 `draft-data`）が渡されている

## Procedure

### 引き継ぎ停止判定

要件doc または RU に `agentdev_handoff: true` が含まれる場合、リポジトリ種別に応じて分岐（詳細は `agentdev-workflow-lifecycle` runtime-package-boundary 参照）。

- **self-hosting リポジトリ**（ジャンクション or 実ディレクトリ）: 履歴メタデータとして処理を継続
- **consumer リポジトリ**（コピー配置等）: Issue を作成せず停止し agent-dev-flow repository への手動取り込み対象として報告

### 工程間構造化文脈の初期文脈利用

前工程（req-define、req-save、design-save、case-auto 等）から構造化文脈が引き継がれている場合、前工程で確定した事項（保存済み REQ/Decision の有無、Design 消費済みフラグ、前工程完了度等）を初期文脈として利用し、同じ情報をゼロから探索、再構築することを原則としない。
独立検証、鮮度確認、矛盾検出、正規成果物との整合確認を目的とする再確認（draft-data の `status`、`artifact_actions` と実ファイルの突合等）は維持する。
構造化文脈が引き継がれていない場合は、durable state（要件doc、RU）から入力解決を行う（形式と制約は `agentdev-workflow-lifecycle` スキルの工程間構造化文脈引き継ぎ参照）。

### OU 選択ゲート（`operation_units` セクションがある場合）

- **OU ID 指定あり**: 当該 OU のみを処理対象とする例外経路
- **OU ID 指定なし**:
  - OU 1件なら自動選択
  - 2件以上なら execution_unit 構成を生成し、STEP-3（execution-unit-and-preflight）へ分岐
- **`operation_units` セクションがない場合**: 従来どおり全要件docを処理（後方互換）

## Result

- 処理対象が確定（全要件doc、または指定 OU、または自律選択 OU）
- 引き継ぎ停止判定（self-hosting vs consumer）が完了

## Evidence

- 要件doc 読取結果、`agentdev_handoff` 判定根拠、OU 選択結果

## Completion Verification

- 処理対象が一意に確定していること（OU 複数時は execution_unit 構成生成へ分岐していること）

## Resume-Idempotency

- 読取と判定のみで副作用を持たない。再実行時は同一 draft から同一の処理対象確定に到達する

## resume point

- 要件doc 受領状態、`agentdev_handoff: true` 判定結果、OU 選択状態（指定 OU / 自律選択 OU / 全要件doc）

## 関連 STEP

- 次: STEP-2（issue-body-and-execution-contract）

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- 不変条件（ADR、specs の内容は Issue 本文の生成に反映）
