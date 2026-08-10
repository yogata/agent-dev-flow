# STEP-1: 引き継ぎ・OU 選択（handoff-and-ou-gate）

> 本 reference は `agentdev-workflow-case-open` SKILL.md の Control Plane STEP-1 詳細である。SKILL.md は control plane として STEP 遷移を管理し、本 reference は STEP-1 の実行詳細を提供する。

## 開始条件

- case-open command から要件doc（構造化 `draft-data`）が渡されている

## 結果

- 処理対象が確定（全要件doc、または指定 OU、または自律選択 OU）
- 引き継ぎ停止判定（self-hosting vs consumer）が完了

## 手順

### 引き継ぎ停止判定

要件doc または RU に `agentdev_handoff: true` が含まれる場合、リポジトリ種別に応じて分岐（詳細は `agentdev-workflow-lifecycle` runtime-package-boundary 参照）。

- **self-hosting リポジトリ**（ジャンクション or 実ディレクトリ）: 履歴メタデータとして処理を継続
- **consumer リポジトリ**（コピー配置等）: Issue を作成せず停止し agent-dev-flow repository への手動取り込み対象として報告

### OU 選択ゲート（`operation_units` セクションがある場合）

- **OU ID 指定あり**: 当該 OU のみを処理対象とする例外経路
- **OU ID 指定なし**:
  - OU 1件なら自動選択
  - 2件以上なら execution_unit 構成を生成し、STEP-3（execution-unit-and-preflight）へ分岐
- **`operation_units` セクションがない場合**: 従来どおり全要件docを処理（後方互換）

## resume point

- 要件doc 受領状態、`agentdev_handoff: true` 判定結果、OU 選択状態（指定 OU / 自律選択 OU / 全要件doc）

## 関連 STEP

- 次: STEP-2（issue-body-and-execution-contract）

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- フェーズ制約 G01（ADR、specs の内容は Issue 本文の生成に反映）
