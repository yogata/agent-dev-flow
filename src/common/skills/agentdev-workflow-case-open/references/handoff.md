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

- **self-hosting リポジトリ**（ジャンクション または 実ディレクトリ）: 履歴メタデータとして処理を継続
- **consumer リポジトリ**（コピー配置等）: Root Case を作成せず停止し agent-dev-flow repository への手動取り込み対象として報告

### 入口の untracked domain state 検出と先行明示パス commit

case-open 入口（STEP-1）で、当該 Case が消費する untracked domain state を検出し、Root Case 作成・削除操作に先立って明示パス commit で永続化する。req-define は git コマンド実行禁止制約（req-define 実行契約）により draft・Jev 観測を保存時点で commit できないため、git 実行権限を持つ後続工程の入口が永続化の対を担う。draft/RU 削除は case-ready が git rm と明示パス commit を同一ステップで完結する Form Zero 契約で実行する。入口の先行 commit によりこの削除契約との対を担保する。

1. **検出**: `git status --short` で `.agentdev/drafts/`（要件doc）、`.agentdev/backlog/req-units/`（RU）、`.agentdev/jev-observations/`（Jev 観測）の untracked 分を検出する。検出は当該 Case が消費する分（要件doc・引渡し対象 RU・関連 Jev 観測）に限定し、無関係な untracked ファイルを commit 対象に含めない
2. **gitignore 状態の事前確認**: 検出したパスが git 管理対象であることを事前確認する（`.agentdev/integrity/reports/` 等の git 管理対象外パスは commit 対象としない）
3. **先行明示パス commit**: 検出した untracked domain state を、Root Case 作成・削除操作（draft・RU の削除を含む後続の破壊的操作）に先立って、明示パス commit（`git add <path>` + `git commit -- <paths>`。スイープ操作〔`git add -A` 等〕禁止）で永続化する。commit は main 作業ディレクトリで実行する（domain state は main リポジトリ側 `.agentdev/` に帰着するため）
4. **対の担保**: untracked のまま後続工程へ引き継ぐと、成功時の削除契約（保存と削除の対）が崩れ、Form Zero 削除（git rm + 明示パス commit）を適用できなくなる。入口 commit により削除操作の前提を確定させる

### 工程間構造化文脈の初期文脈利用

前工程（req-define、case-auto 等）から構造化文脈が引き継がれている場合、前工程で確定した事項（保存済み REQ/Decision/Design の有無、確定済み成果物の状態等）を初期文脈として利用し、同じ情報をゼロから探索、再構築することを原則としない。
独立検証、鮮度確認、矛盾検出、正規成果物との整合確認を目的とする再確認（draft-data の `status`、`artifact_actions` と実ファイルの突合等）は維持する。
構造化文脈が引き継がれていない場合は、durable state（要件doc）から入力解決を行う（形式と制約は `agentdev-workflow-lifecycle` スキルの工程間構造化文脈引き継ぎ参照）。

### 引き継ぎ時の完了度照合（instruction 単位・Issue 節単位）

中断からの再開（引き継ぎ）で既存成果物を検出した場合、その完了度はファイル単位の存在確認で近似せず、次の単位で照合する。

- **委譲 instruction 単位**: 委譲 prompt に含まれる個々の instruction（指示）ごとに、対応する成果物への反映有無を照合する
- **Issue 節単位**: Issue 本文の節（【必須】セクション等）ごとに、必要節の生成・更新が完了しているかを照合する
- **未完了分のみの検出**: 未完了の instruction・節のみを処理対象として検出し、完了済み部分の再生成を行わない（ファイル単位の近似照合で部分完了を見逃さない）

Definition の適用開始後も既存対象をファイル単位で再生成せず、適用直前に対象セクションを現行原文と照合する。対象の一意性、旧文の期待件数、適用可能な変更であることを決定的に確認し、合意済み入力との差異があれば適用を中止して差し戻す。既存の Definition 保存内部責務（case-ready / case-revise）を通じて実施し、新しい適用経路は設けない。
- **Definition 適用の再開**: 既存成果物の適用状態も instruction 単位で照合する。適用が中断・再開された場合、case-ready / case-revise の Definition 保存内部責務が書込み直前に対象セクション・anchor・旧文と適用先の現状を再照合し、一致しない状態へ古い本文を適用しない。適用直前照合の正規契約は case-ready Design「Definition 適用直前の対象セクション照合」節に従う

## Result

- 引き継ぎ停止判定（self-hosting vs consumer）が完了し、継続または停止が確定
- 入口の untracked domain state 検出結果と先行明示パス commit の実施結果（検出なしを含む）

## Evidence

- 要件doc 読取結果、`agentdev_handoff` 判定根拠
- `git status --short` による untracked domain state の検出結果、gitignore 状態の事前確認結果、先行明示パス commit の実行証跡（commit 対象パス・commit hash。検出なし時はその記録）

## Completion Verification

- 処理の継続 / 停止が確定済み契約からの導出として確定していること
- 入口で untracked domain state（draft・RU・jev-observations の消費対象分）の検出と gitignore 状態の事前確認が実施され、検出ありの場合は Root Case 作成・削除操作に先立つ先行明示パス commit が実施されていること（検出なし時はその記録があること）

## Resume-Idempotency

- 読取と判定のみで副作用を持たない。再実行時は同一 draft から同一の判定に到達する

## resume point

- 要件doc 受領状態、`agentdev_handoff: true` 判定結果

## 関連 STEP

- 次: STEP-2（root-case-and-definition-package）

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- 不変条件（合意済み入力の反映、新規作成しない）
