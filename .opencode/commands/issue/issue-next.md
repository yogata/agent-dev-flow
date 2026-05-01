---
description: 次のコマンドを推論・実行する。セッションコンテキストのみ使用（gh/gitコマンド禁止）。
load_skills:
  - issue-guide
  - deviation-check
---

# issue-next

セッションコンテキストから現在のフェーズを推論し、適切な issue-* コマンドを選択・実行する。

## Input

- セッションコンテキストのみ（会話履歴、Issue/PR状態の記憶）
- ※ gh/gitコマンドは禁止（セッション内情報のみ使用）

## Output

- 推論された次のコマンドの実行、または「作業完了」の報告

## Steps

1. セッションコンテキストから現在のマクロフェーズを推論 → `issue-guide` のフェーズ体系とSSoT遷移ルールに従って判定
2. 乖離がある場合は乖離検出結果を確認 → `deviation-check` のループバック判定に従って次アクションを決定
3. 次のコマンドを提示または実行 → `issue-guide` のコマンド関連マップに従って適切なコマンドを選択:
   - ①バイブス壁打ち → `/issue/issue-req`
   - ①→②境界 → `/issue/issue-create`
   - ②構造的実行 → `/issue/issue-work`
   - ②→③境界 → レビュー待ち
   - ③レビュー完了 → `/issue/issue-close`

## Guardrails

- セッションコンテキストのみ使用（gh/gitコマンド禁止）
- フェーズ推論の根拠を明示（なぜそのフェーズと判定したか）
- フェーズ推論不可時はエラー停止し、ユーザーに確認
- Issue番号特定不能時はユーザーに確認（`.worktrees`、`git branch`等からの推測は禁止）
