---
id: learn-20261121-worktree-pre-commit-projection-gate
created_at: 2026-11-21
source: case-run capture (PR #4173・Wave-1 #4169・Root Case #4167)
status: inbox
---

# worktree は plugin 依存生成物（agentdev-textlint-guard vendor）を持たず初回コミットが fail-closed で停止する

- 問題事象: worktree（.worktrees/4169-maintenance）内での初回コミットが pre-commit ゲートの依存生成物確認（agentdev-textlint-guard の vendor 未生成）で fail-closed となり、そのままではコミットが完結しない
- 発生局面: case-run（PR #4173・Wave-1 #4169）の初回 commit（commit 627593f8d 作成時）
- 検知方法: pre-commit ゲートの fail-closed 停止報告（vendor 未生成の案内メッセージ）
- 根本原因: worktree は git worktree であり、plugin package 配下の依存生成物（node_modules・vendor/ 等）は git 管理対象外のため main 側から引き継がれない。依存生成は plugin package 配下で個別に実行する必要がある
- 自律対応内容: plugin package 配下（src/opencode/plugins/agentdev-textlint-guard/）で bun install && bun run build:engine を実行（ネットワーク取得なし）して vendor を生成し、pre-commit ゲート通過後にコミットした。--no-verify 等の迂回は不使用
- ユーザー確認有無: なし（依存生成手順の実施のみ・README 記載の標準手順）
- 横展開観点: worktree 作成時の事前準備に plugin 依存生成（bun install && bun run build:engine）を含めるべき。生成物が git 管理対象外の plugin・package を含むリポジトリでは、worktree 側のゲート・検証・試験が依存生成物の不在で fail-closed になる
- 再発条件: worktree 内で、依存生成物（git 管理対象外の vendor・node_modules 等）を前提とするゲート・試験・検証を初回実行する場合
 - 予防策候補: (a) worktree 作成手順（agentdev-git-worktree 系）に依存生成の事前実行ステップを含める、(b) ゲート側の fail-closed 案内に「worktree では plugin package 配下で依存生成を実行」の明示を含める
 - 想定反映先: agentdev-git-worktree（worktree 作成手順）、README-INSTALL.md（依存生成手順の worktree 節）
 - 関連: Case #4167、PR #4173（検証差分セクション pre-commit ゲート行）、README.md「開発者セットアップ（textlint 依存の生成）」
 - タグ: worktree、pre-commit、依存生成、vendor、fail-closed
