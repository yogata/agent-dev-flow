---
title: `agentdev-git-worktree` Design
status: accepted
created: 2026-06-21
updated: 2026-10-06
---
<!-- ADF-COVERS(implementation): REQ-018-002 -->
<!-- ADF-COVERS(design): REQ-102-001, REQ-102-002, REQ-102-003, REQ-102-004, REQ-018-002 -->
<!-- ADF-COVERS(design): REQ-018-009（worktree クリーンアップの削除部分失敗時代替掃除手順の設計記録面。運用文書への手順追記は references/worktree-operations.md が実装として保持） -->

# `agentdev-git-worktree` Design

## 目的

Issue 番号に基づいて安全かつ一貫性のある方法で git worktree を作成、管理、削除する。
並列実行安全ステージングプロシージャを提供する。

## 適用対象

- worktree の作成、切り替え、完了後のクリーンアップ
- case-run（STEP-S3 Worktree 作成、ブランチ準備、前置 gate 群）
- case-close（STEP-6 ブランチ、worktree 削除）
- case-open、case-ready、case-revise、case-auto（並列実行安全ステージングプロシージャ）

## 提供する判断、操作

- 命名規則（worktree: `.worktrees/{N}-{type}`、branch: `{type}/issue-{N}`）。type 定義域は実装側 SKILL.md「`{type}` の定義」テーブルを正とし、設計側 worktree・ブランチの type として `definition`（case-open の設計PR 用）と `definition-amend`（case-revise の Amendment PR 用）を含める。作成元は origin/main（既存と同一）。設計系ブランチのリモート削除は行わず、GitHub の deleteBranchOnMerge 自動削除に委譲する既存規定を維持する
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

## Git 操作の認証失敗検出と実行環境側認証規律との接続

Git 操作（ドメイン状態永続化の push を含む）の認証規律の正規所有者は実行環境側の設定・起動規律（AGENTS.md「ハーネス選定」および docs/knowledge/ の実行環境知識文書）であり、配布 skill と本 Design は具体的な認証コマンドを直書きしない。

- references/git-common-procedures.md「2. ドメイン状態永続化」の push 失敗時の構造化エラーには、認証起因（認証失敗、対話要求、タイムアウト）の分類を含める。認証起因と判定した場合は必要な処置と再開条件を報告し、認証条件を変更しない同一条件での長時間待機を無条件に再試行しない
- 認証方式は環境側で非対話実行可能な正規の経路から選定する。当環境での採用実績は知識文書に記録し、唯一の方式として固定しない
- 資格情報の値を解析証拠やログへ出力しない（REQ-091-005 と同じ規律）

## worktree 作成元の main 基準

worktree の作成元は main を参照する。PR の base、rebase・同期基準、squash merge 先も main を基準とし、各工程要件（REQ-031-024、REQ-035-009）が各自明示する。

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


## v4 責務分類

ADF v4 の責務分類（正典: DEC-048、foundations/v4-responsibility-boundaries Design「v4 責務分類語彙の後継」節）における本 Design の 3 区分（意味判断担当〔閉じた意味評価・開いた推論を所有〕/ 決定的処理委譲先 / 知識提供）。語彙の原本は foundations/v4-responsibility-boundaries Design「v4 責務分類語彙の後継」節であり、本節はその確定値を記録する。

- **意味判断担当**: 0 件
- **決定的処理委譲先**: path safety → git CLI 標準操作（script なし）
- **知識提供**: worktree 作成・切替・クリーンアップ手順
