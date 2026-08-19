# STEP-1 / STEP-2 / STEP-3: 実行前同期・inbox スキャン・検出事項分類（inbox-scan-and-classification）

> 本 reference は `agentdev-workflow-inspect-promote` SKILL.md の Control Plane STEP-1〜STEP-3 詳細である。
> 各 STEP は resume point を持つ（`<workflows/step-reference-contract>` SPEC）。

## STEP-1: 実行前同期

- **Purpose**: リモートの最新状態を取り込み、検出事項の分類処理を最新の inbox 状態に対して実行する
- **Input Resolution**: durable state 優先順位に従い `.agentdev/inspect/inbox/` の現状を読み込む前にリポジトリ状態を同期する
- **Preconditions**: inspect-promote command の実行開始
- **Procedure**: `git pull --ff-only` を実行する。失敗時は共通 template（`.opencode/commands/agentdev/templates/common/git-error-messages.md`）の該当形式で表示して停止する（自動解消しない）
- **Result**: fast-forward 済みの最新リポジトリ状態
- **Evidence**: pull 実行結果（hash、または構造化エラー出力）
- **Completion Verification**: pull が成功していること（エラー出力なし）
- **Resume-Idempotency**: 同期は読み取り側の前処理であり冪等。再実行時は再度 `git pull --ff-only` を実行してよい

## STEP-2: inbox スキャン

- **Purpose**: 処理対象となる検出事項の一覧を確定する
- **Input Resolution**: `.agentdev/inspect/inbox/*.md`（durable state）を読み込む。自然言語の前 STEP result に依存しない
- **Preconditions**: STEP-1 完了
- **Procedure**: `.agentdev/inspect/inbox/*.md` を読み込む。空の場合は「対象なし」と報告して終了する
- **Result**: 検出事項一覧（ファイルパス、内容）
- **Evidence**: 読み込んだ検出事項ファイルの一覧
- **Completion Verification**: inbox 配下の全 `.md` ファイルを読み込んだこと
- **Resume-Idempotency**: inbox のファイル構成は durable state そのもの。再開時は常に再スキャンして最新構成を採用する

## STEP-3: 検出事項分類（暫定分類）

- **Purpose**: 各検出事項について promote/defer/reject の暫定分類と根拠を確定する（finding disposition の入口 resume point）
- **Input Resolution**: STEP-2 の検出事項一覧。各検出事項の観点、対象、根拠、source-of-truth 判定、推奨 route は検出事項ファイル本文（durable state）から読み取る
- **Preconditions**: STEP-2 完了、検出事項が1件以上存在
- **Procedure**: 各検出事項について以下を評価し、promote/defer/reject を判定する
  - 明確な不整合 → promote（RU 化対象）
  - 不整合かどうか、採否、範囲、優先度、正とする情報源が未確定 → defer（intake 送付候補）
  - 誤検知、対応不要 → reject
  - 具体的修正対象を持たない再発防止知見 → defer（learning 送付候補）
- **Result**: 暫定分類結果（検出事項ごとの promote/defer/reject 判定と根拠）
- **Evidence**: 検出事項ごとの判定と根拠の記録
- **Completion Verification**: 全検出事項に暫定分類ラベルと根拠が付与されていること
- **Resume-Idempotency**: 暫定分類は会話状態にのみ存在する中間状態である。再開時は STEP-2 の再スキャン結果に対して暫定分類を再構成する。inbox に残存する検出事項は未確定として扱う

## 関連 STEP

- 前: なし（workflow 先頭）
- 次: STEP-4（auto-promote-and-review）、`--auto` 未指定時は STEP-5

## 関連 Capability Skill

- `agentdev-git-worktree`: 実行前同期、並列実行安全ステージングプロシージャ

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- G02（promote された検出事項のみを `.agentdev/inspect/promoted/` へ保存する）
- 不変条件（`--auto` は自動 promote 対象カテゴリ（workflow-contracts SPEC 参照、extension 経由）に合致する高確信度検出事項のみを投入し、意味判断、曖昧な分類、ADR 要否判断を含む検出事項は手動分類へ回す）
