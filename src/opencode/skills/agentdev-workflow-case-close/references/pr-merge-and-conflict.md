# STEP-4: PR マージ・コンフリクト解消（pr-merge-and-conflict）

> 本 reference は `agentdev-workflow-case-close` SKILL.md の Control Plane STEP-4 詳細である。PR squash マージ、mergeable UNKNOWN ポーリング、先行 commit 検出、コンフリクト Level 1 rebase パスを提供する。

## Purpose

PR を squash マージし、mergeable UNKNOWN ポーリング、先行 commit 検出、コンフリクト Level 1 rebase パスを処理する。

## Input Resolution

1. SSoT 再構成: PR の mergeable 状態、ローカル/remote の commit 状態
2. identifier 保持: PR番号、Issue番号
3. 最小 scalar: ポーリング試行回数（上限は gh-cli 手続き側が所有）
4. runtime artifact: なし

## Preconditions

- 単一 Issue クローズ ルート
- STEP-3 で docs 検証合格

## Result

- マージ済みPR
- HEAD commit hash 記録
- コンフリクト Level 1 解消完了、または case-auto Level 2/3 エスカレーション

## Procedure

### Step 4-0: squash merge 前の mergeable UNKNOWN ポーリング

`agentdev-gh-cli` の「squash merge 前の mergeable UNKNOWN ポーリング」手続きに従い、次を実行する。

- 対象 PR の `mergeable` 状態事前確認
- `UNKNOWN` ポーリング待機
- 上限超過時の構造化エラー停止
- 待機中の `CONFLICTING` 遷移検出を自動分岐させ、コンフリクト解消パス（Step 4-2）へ即時接続する

ポーリング間隔・上限値は gh-cli 手続き側が所有する（AG-{NNN}）。

### Step 4: PR merge 実行

PR merge 手続き（squash 方式、`agentdev-gh-cli`）を実行 → HEAD commit hash 記録（`agentdev-git-worktree` skill に従い）。

**Squash merge 失敗時のリトライ**: `agentdev-gh-cli` の「squash merge リトライ手続き」に従う（待機間隔・最大試行回数は gh-cli 手続き側が所有、AG-{NNN}、各試行のログ記録、全試行失敗時のフォールバックは template `.opencode/commands/agentdev/templates/case-close/standard.md` 参照）。

**対応記録コメント**: Issue に対応記録コメントを追加（テンプレート: `.opencode/skills/agentdev-workflow-templates/templates/issue_comment_*.md` から Read して `agentdev-gh-cli` の VERIFY 操作に従って内容検証）。

**`--delete-branch` 使用禁止（REQ）**: PR マージ時に `--delete-branch` オプションを使用しない（アクティブ worktree に checkout されたブランチで local 削除が失敗し remote 削除フェーズへ到達しないため）。ブランチ削除は STEP-6 で独立実施する。

### Step 4-1: Squash merge 後のローカル先行 commit 検出・処理（REQ）

squash merge 完了後、ローカルに remote 未 push の先行 commit が存在する場合、`agentdev-git-worktree` の「Squash merge 後分岐ハンドリング手続き（REQ）」に従い、ローカル先行 commit 検出、内容重複確認、reset を実行する。本処理により `git pull --ff-only` 失敗を予防する。

### Step 4-2: コンフリクト解消 rebase パス（Level 1）

squash merge がコンフリクトで失敗した場合（Step 4 のリトライ全失敗後、エラー原因がコンフリクトの場合）に実行する機械的解消パス（コンフリクト解消モデル Level 1）。

`agentdev-git-worktree` の「コンフリクト解消 rebase パス（REQ）」に従い、rebase による機械的解消を試みる。

- **実装変更は行わず** rebase のみ
- **rebase 自動解決時**: squash merge（Step 4）へ戻り再マージ
- **rebase コンフリクト発生時**: case-auto へエスカレーションして停止する（コンフリクト解消モデル Level 2/3 は case-auto の責務）

## Evidence

- mergeable 状態とポーリング記録、merge 結果と HEAD commit hash、対応記録コメントの VERIFY 結果、先行 commit 検出・処理結果、rebase 試行結果

## Completion Verification

- PR がマージ済みであり、HEAD commit hash が記録されていること。Level 1 rebase 失敗時はエスカレーション停止していること

## Resume-Idempotency

- マージ済み PR（durable state）で再実行を判定し、再マージしない。ポーリングとリトライは gh-cli 手続きの契約に従い冪等再実行可能

## resume point

- mergeable 状態、ポーリング実行状態
- PR merge 実行結果、HEAD commit hash
- 先行 commit 検出・処理結果（Step 4-1）
- コンフリクト発生時の Level 1 rebase 試行結果、Level 2/3 エスカレーション状態

## 関連 STEP

- 前: STEP-3（docs-and-spec-promotion）
- 次: STEP-5（cleanup-and-capture）

## 関連 Capability Skill

- `agentdev-gh-cli`: PR merge 手続き、mergeable UNKNOWN ポーリング、squash merge リトライ、VERIFY、対応記録コメントテンプレート
- `agentdev-git-worktree`: HEAD commit hash 記録、squash merge 後分岐ハンドリング、コンフリクト解消 rebase パス
- `agentdev-workflow-templates`: 対応記録コメントテンプレート

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- G07（PR の CI 通過確認、CI 失敗時は case-run に差し戻す）
- G12/G14（GitHub Issue/PR 操作は `agentdev-gh-cli` の手続きへ委譲、gh コマンド直接記述禁止）
- G27/G28（squash merge 実行前に mergeable 状態を事前確認し UNKNOWN の場合はポーリング待機、ポーリング省略して UNKNOWN 状態のままマージ試行禁止）
