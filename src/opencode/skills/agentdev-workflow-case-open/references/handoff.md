# STEP-1: 引き継ぎ判定（handoff）

> 本 reference は `agentdev-workflow-case-open` SKILL.md の制御平面（STEP 一覧）STEP-1 詳細である。
> SKILL.md は control plane として STEP 遷移を管理し、本 reference は STEP-1 の実行詳細を提供する。

## Purpose

前工程からの引き継ぎ停止判定を行い、処理の継続を確認する。

## Input Resolution

1. SSoT 再構成: 要件doc（構造化 `draft-data`）
2. identifier 保持: なし
3. 最小 scalar: なし
4. runtime artifact: なし

## Preconditions

- case-open command から要件doc（構造化 `draft-data`）が渡されている

## Procedure

### 引き継ぎ停止判定

要件doc に `agentdev_handoff: true` が含まれる場合、リポジトリ種別に応じて分岐（詳細は `agentdev-workflow-lifecycle` runtime-package-boundary 参照）。

- **self-hosting リポジトリ**（ジャンクション or 実ディレクトリ）: 履歴メタデータとして処理を継続
- **consumer リポジトリ**（コピー配置等）: Root Case を作成せず停止し agent-dev-flow repository への手動取り込み対象として報告

### 工程間構造化文脈の初期文脈利用

前工程（req-define、case-auto 等）から構造化文脈が引き継がれている場合、前工程で確定した事項（保存済み REQ/Decision/Design の有無、前工程完了度等）を初期文脈として利用し、同じ情報をゼロから探索、再構築することを原則としない。
独立検証、鮮度確認、矛盾検出、正規成果物との整合確認を目的とする再確認（draft-data の `status`、`artifact_actions` と実ファイルの突合等）は維持する。
構造化文脈が引き継がれていない場合は、durable state（要件doc）から入力解決を行う（形式と制約は `agentdev-workflow-lifecycle` スキルの工程間構造化文脈引き継ぎ参照）。

### 引き継ぎ時の完了度照合（instruction 単位・Issue 節単位）

中断からの再開（引き継ぎ）で既存成果物を検出した場合、その完了度はファイル単位の存在確認で近似せず、次の単位で照合する。

- **委譲 instruction 単位**: 委譲 prompt に含まれる個々の instruction（指示）ごとに、対応する成果物への反映有無を照合する
- **Issue 節単位**: Issue 本文の節（【必須】セクション等）ごとに、必要節の生成・更新が完了しているかを照合する
- **未完了分のみの検出**: 未完了の instruction・節のみを処理対象として検出し、完了済み部分の再生成を行わない（ファイル単位の近似照合で部分完了を見逃さない）

## Result

- 引き継ぎ停止判定（self-hosting vs consumer）が完了し、継続または停止が確定

## Evidence

- 要件doc 読取結果、`agentdev_handoff` 判定根拠

## Completion Verification

- 処理の継続 / 停止が一意に確定していること

## Resume-Idempotency

- 読取と判定のみで副作用を持たない。再実行時は同一 draft から同一の判定に到達する

## resume point

- 要件doc 受領状態、`agentdev_handoff: true` 判定結果

## 関連 STEP

- 次: STEP-2（root-case-and-definition-package）

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- 不変条件（合意済み入力の反映、新規作成しない）
