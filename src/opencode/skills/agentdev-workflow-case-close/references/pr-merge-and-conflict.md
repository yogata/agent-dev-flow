# STEP-4: PR マージ・コンフリクト解消（pr-merge-and-conflict）

> 本 reference は `agentdev-workflow-case-close` SKILL.md の制御平面（STEP 一覧）STEP-4 詳細である。
> squash merge 先（main）への PR squash マージ、PR base 移動判定、mergeable UNKNOWN ポーリング、先行 commit 検出、コンフリクト Level 1 rebase パスを提供する。

## Purpose

PR を squash merge 先（main）へ squash マージし、PR base 移動判定、mergeable UNKNOWN ポーリング、先行 commit 検出、コンフリクト Level 1 rebase パスを処理する。

## Input Resolution

1. SSoT 再構成: PR の mergeable 状態と mergeStateStatus、ローカル/remote の commit 状態、base 移動判定結果（ローカル git 由来）
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

### STEP-4-1: squash merge 先の確認

squash merge 先は main とする。

- **確認**: PR の base が main であることを前提とし、PR base と squash merge 先が一致しない場合は処理を進めず構造化エラーとして扱う

**base 移動判定**: 並行セッションが main へ push すると、PR 作成時点から base（main）が移動する。base 移動判定はローカル git で行う。

```bash
git fetch origin main
git rev-parse origin/main
```

`git fetch origin main` で remote-tracking を更新した後、`git rev-parse origin/main` で base（main）の先端 commit hash を取得する。
`git merge-base HEAD origin/main` の結果が origin/main の先端と一致しない場合、base は移動している。

> **baseRefOid 誤認注意**: GitHub の PR メタデータには、mergeability 再計算中は `UNKNOWN` を返す特性と、baseRefOid の表示が再計算完了後も遅延する特性がある（並行セッションの main push 直後に baseRefOid が旧 main を表示し続けた実測に基づく）。
> baseRefOid を base 移動判定の情報源として使わない。base 移動判定は上記のローカル git のみで行う。

base 移動の検出は squash merge を妨げない。squash merge 可否は STEP-4-2 の mergeStateStatus（CLEAN）基準で判断し、base 移動判定結果は Evidence に記録する。

### STEP-4-2: squash merge 前の mergeable UNKNOWN ポーリング

本書が所有する「squash merge 前の mergeable UNKNOWN ポーリング」手順（状態取得は `agentdev_gh` の pr_mergeable 操作。最大60秒、10秒間隔で再取得、待機中の CONFLICTING 遷移時は即時打ち切りコンフリクト解消パスへ、上限超過時は構造化エラーとして停止）に従い、次を実行する。

- 対象 PR の `mergeable` 状態事前確認
- `UNKNOWN` ポーリング待機
- 上限超過時の構造化エラー停止
- 待機中の `CONFLICTING` 遷移検出を自動分岐させ、コンフリクト解消パス（STEP-4-5）へ即時接続する

ポーリング間隔・上限値は gh-cli 手続き側が所有する。

squash merge 可否の判定は、`agentdev_gh` の pr_mergeable 操作が返す mergeStateStatus（CLEAN）を基準とする。
base 移動判定（STEP-4-1）の導入は、本手順の mergeable UNKNOWN ポーリング契約（10秒間隔、上限60秒）を変更しない。

### STEP-4-3: PR merge 実行

STEP-4-1 で確認した squash merge 先（main）へ `agentdev_gh` の pr_merge 操作（squash 方式）を実行 → HEAD commit hash 記録（`agentdev-git-worktree` skill に従い）。

**Squash merge 失敗時のリトライ**: 本書が所有する「squash merge リトライ手順」に従う（待機間隔5秒、最大試行回数は初期試行 + 5回リトライ、各試行のログ記録、全試行失敗時のフォールバックは template `.opencode/commands/agentdev/templates/case-close/standard.md` 参照）。

**対応記録コメント**: Issue に対応記録コメントを追加（テンプレート: `.opencode/skills/agentdev-workflow-templates/templates/issue_comment_*.md` から Read して `agentdev_gh` の issue_comment 操作で追加（成功応答は読み戻し検証済み））。

**対応記録コメントへの検証差分記録**: case-close が実施した各検証（QG-4 完了条件評価、docs 検証・配布依存境界 最終 gate、トレーサビリティ独立再検査等）について、対応記録コメントへ検証差分を記録する。形式は `agentdev-workflow-templates` の検証差分セクション規約（PR テンプレート形式と同一のテーブル）に従い、実行工程 case-close の行として検証種別、検証結果、finding 差分（新規、修正済み、既出、撤回、無効の5分類）を記録する。finding 差分は前段階（case-run）の PR 本文検証差分セクションの記録との差分で分類し、同種検証の工程間比較を可能にする。品質ゲート完了報告の既存の修正証跡記録を本記録で置換しない。

**`--delete-branch` 使用禁止**: PR マージ時に `--delete-branch` オプションを使用しない（アクティブ worktree に checkout されたブランチで local 削除が失敗し remote 削除フェーズへ到達しないため）。
ブランチ削除は STEP-6 で独立実施する。

### STEP-4-4: Squash merge 後のローカル先行 commit 検出・処理

squash merge 完了後、ローカルに remote 未 push の先行 commit が存在する場合、`agentdev-git-worktree` の「Squash merge 後分岐ハンドリング手続き」に従い、ローカル先行 commit 検出、内容重複確認、reset を実行する。
本処理により `git pull --ff-only` 失敗を予防する。

### STEP-4-5: コンフリクト解消 rebase パス（Level 1）

squash merge がコンフリクトで失敗した場合（STEP-4-3 のリトライ全失敗後、エラー原因がコンフリクトの場合）に実行する機械的解消パス（コンフリクト解消モデル Level 1）。

`agentdev-git-worktree` の「コンフリクト解消 rebase パス」に従い、rebase による機械的解消を試みる。

- **実装変更は行わず** rebase のみ
- **rebase 自動解決時**: squash merge（STEP-4-3）へ戻り再マージ
- **rebase コンフリクト発生時**: case-auto へエスカレーションして停止する（コンフリクト解消モデル Level 2/3 は case-auto の責務）

## Evidence

- squash merge 先（main）の確認結果、base 移動判定結果（fetch 後の origin/main 先端 hash と merge-base 比較）、mergeable 状態とポーリング記録、mergeStateStatus（CLEAN）判定結果、merge 結果と HEAD commit hash、対応記録コメントの VERIFY 結果、先行 commit 検出・処理結果、rebase 試行結果

## Completion Verification

- squash merge 先（main）が確認済みであること。base 移動判定がローカル git で実施済みであり、結果が Evidence に記録されていること。PR がマージ済みであり、HEAD commit hash が記録されていること。Level 1 rebase 失敗時はエスカレーション停止していること

## Resume-Idempotency

- マージ済み PR（durable state）で再実行を判定し、再マージしない。ポーリングとリトライは gh-cli 手続きの契約に従い冪等再実行可能

## resume point

- squash merge 先確認状態（main）
- base 移動判定結果（STEP-4-1）
- mergeable 状態、ポーリング実行状態
- PR merge 実行結果、HEAD commit hash
- 先行 commit 検出・処理結果（STEP-4-4）
- コンフリクト発生時の Level 1 rebase 試行結果、Level 2/3 エスカレーション状態

## 関連 STEP

- 前: STEP-3（docs-and-spec-promotion）
- 次: STEP-5（cleanup-and-capture）

## 関連 Capability Skill

- Custom Tool `agentdev_gh`（pr_merge、pr_mergeable）+ workflow 側手順（mergeable UNKNOWN ポーリング、squash merge リトライ、対応記録コメントテンプレート）
- `agentdev-git-worktree`: HEAD commit hash 記録、squash merge 後分岐ハンドリング、コンフリクト解消 rebase パス、git 同期リスク事前検出（base 移動判定の `git fetch origin main` と実行前同期の接続）
- `agentdev-workflow-templates`: 対応記録コメントテンプレート

## 関連ガードレール（command 側で宣言、本 reference は詳細実装）

- 不変条件（PR の CI 通過確認、CI 失敗時は case-run に差し戻す）
- ガードレール・不変条件（GitHub Issue/PR 操作は Custom Tool `agentdev_gh` へ委譲、gh コマンド直接記述禁止、`POL-gh-io-delegation`）
- ガードレール（squash merge 実行前に mergeable 状態を事前確認し UNKNOWN の場合はポーリング待機、ポーリング省略して UNKNOWN 状態のままマージ試行禁止）
