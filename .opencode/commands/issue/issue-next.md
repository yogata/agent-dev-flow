---
description: 次のコマンドを推論・実行する。セッションコンテキストのみ使用（gh/gitコマンド禁止）。
agent: sisyphus
load_skills:
  - issue-lifecycle
  - issue-post-review-routing
  - spec-compliance
  - req-analysis
---

# issue-next

セッションコンテキストから現在のフェーズを推論し、適切な issue-* コマンドを選択・実行する。

## Input

- セッションコンテキストのみ（会話履歴、Issue/PR状態の記憶）
- ※ gh/gitコマンドは禁止（セッション内情報のみ使用）

## Output

- 推論された次のコマンドの実行、または「作業完了」の報告

## Steps

1. セッションコンテキストから現在のマクロフェーズを推論 → `issue-lifecycle` のフェーズ体系とSSoT遷移ルールに従って判定
2. 乖離がある場合は乖離検出結果を確認 → `spec-compliance` のループバック判定に従って次アクションを決定
3. 次のコマンドを提示または実行 → `issue-lifecycle` のコマンド関連マップに従って適切なコマンドを選択:
    - 壁打ち → `/issue/issue-req`
    - 壁打ち→構造的実行の準備（パターンB） → `/issue/issue-save-req`
    - 壁打ち→構造的実行の境界（パターンB） → `/issue/issue-save-req`
    - 壁打ち→構造的実行の境界（パターンA/C/D） → `/issue/issue-create`
    - 構造的実行 → `/issue/issue-work`
    - 構造的実行→レビュー完了の境界 → レビュー待ち
    - レビュー完了 → `/issue/issue-close`

## Guardrails

### 実行制約
- G01: セッションコンテキストのみ使用（gh/gitコマンド禁止）
- G02: Issue番号特定不能時はユーザーに確認（`.worktrees`、`git branch`等からの推測は禁止）

### 品質ゲート
- G03: フェーズ推論不可時はエラー停止し、ユーザーに確認

### 判断・承認制約
- G04: フェーズ推論の根拠を明示（なぜそのフェーズと判定したか）

### 出力制約
- G05: サブエージェントの最終出力はverbatimで出力する（再フォーマット禁止）
