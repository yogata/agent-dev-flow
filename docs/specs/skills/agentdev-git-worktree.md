---
title: `agentdev-git-worktree` SPEC
status: accepted
spec_logical_division: behavior
canonical_owner: agentdev-git-worktree
created: 2026-06-21
updated: 2026-08-19
---

# `agentdev-git-worktree` SPEC

## 目的

Issue 番号に基づいて安全かつ一貫性のある方法で git worktree を作成、管理、削除する。
並列実行安全ステージングプロシージャを提供する。

## 適用対象

- worktree の作成、切り替え、完了後のクリーンアップ
- case-run（Step 5 Worktree 作成、ブランチ準備、Step 5-2 precondition gate）
- case-close（Step 7 ブランチ、worktree 削除）
- case-open、req-save、spec-save、case-auto（並列実行安全ステージングプロシージャ）

## 提供する判断、操作

- 命名規則（worktree: `.worktrees/{N}-{type}`、branch: `{type}/issue-{N}`）
- origin/main 鮮度確認（並列 Wave 実行時、PR merge 後再開時に worktree 作成前に `git fetch origin` を実行）
- worktree 操作手順（作成、切り替え、削除、リトライ）
- 並列実行安全ステージングプロシージャ（明示パス `git add <path>` + `git commit -- <paths>` の --only pathspec 形式、v2:REQ-0137-002/005）
- worktree 内判定ヘルパー（`git worktree list`、`git rev-parse --show-toplevel`）

## 参照する references

- `references/worktree-operations.md`
- `references/git-common-procedures.md`

## 現在の動作

- 並列 Wave 実行時や PR merge 後再開時は worktree 作成前に `git fetch origin` を実行
- 共有作業ツリーでのスイープ操作（`git add -A` / `git add .` / `git commit -a` / `git checkout .` / `git reset --hard` / `git stash` 等）は禁止（v2:REQ-0137-001）
- 明示パス指定（`git add <path>` / `git rm <path>`）+ `git commit -- <paths>`（--only pathspec 形式）でステージ、コミット
- draft / RU の削除は同一ステップで即時ステージ、コミットし未ステージ残存を許さない（Form Zero、v2:REQ-0137-003/006）
- worktree remove で Permission denied 時は停止（リトライは定義に従う）

## 統合先基準のworktree操作（新規セクション）

本節は worktree 操作における統合先基準の適用詳細を所有する。統合先とブランチモデルの基盤契約は REQ-042 が所有する。

- **worktree 作成元の統合先解決**: worktree の作成元は当該 Case の統合先（既定 main、実証Caseは評価ブランチ）を参照する。worktree の作成元、PR の base、rebase・同期基準、鮮度確認、squash merge 先、Epic 後続 Wave の作業起点は同一の統合先を参照する（REQ-042-006）
- **評価ブランチの作成・削除に既存 Git/worktree 能力を再利用する手順**: 評価ブランチの作成・削除には既存の Git/worktree 能力を再利用する。評価ブランチ専用の公開 Git コマンド体系は追加しない（REQ-042-009）。評価ブランチは正規成果物ではなく一時的・非正規の成果物として扱う
- **評価ブランチの命名規則（実装設計で決定した形式）の適用**: 評価ブランチの命名規則は実装設計で決定した形式に従い、本スキルは特定の命名形式を固定しない

## 対象外

- 基本的な git 操作（commit/push/pull、`agentdev-conventional-commits` 担当）
- worktree を使用しないブランチ管理
- マージコンフリクト解決（ライフサイクル cleanup を除く）

## 検証観点

- 命名規則の遵守
- origin/main の鮮度
- worktree ライフサイクルの一貫性
- 並列実行安全ステージングプロシージャの遵守
- Form Zero（削除時の即時ステージ、コミット）

## See Also

- [agentdev-conventional-commits.md](agentdev-conventional-commits.md)
- [commands/case-run.md](../commands/case-run.md)
- [commands/case-close.md](../commands/case-close.md)
- v2:REQ-0110（Git worktree cleanup 信頼性）
- v2:REQ-0137（並列実行安全 git 操作規律）

