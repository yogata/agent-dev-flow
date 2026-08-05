# intake: dist/ ディレクトリが .gitignore 対象外 — release archive 生成物の誤 commit リスク

## 発生日

2026-08-06

## 発生元

- Issue: #1928 (WP-3 Integrity Checker 実行プロファイル分離 OU-004)
- PR: #1935
- Epic: #1924 (AgentDevFlow 2026-08 移行)
- 取得元: PR #1935 本文「## 残リスク / follow-up」セクション

## 問題事象

WP-3 で新規追加した `scripts/package-release-archive.ps1` は `dist/agentdev-release-<commit-short>.zip` を生成する。`dist/` は `.gitignore` の対象外のため、生成物が untracked として working tree へ残る。WP-3 case-run では commit していないが、将来のメンテナンスで `git add -A` 等のスイープ操作を実行した際に誤って commit されるリスクがある。

## 影響

- `dist/` 配下の ZIP アーカイブ（バイナリ、数MB級）が誤 commit され、リポジトリサイズが増大する
- WP-4〜WP-6 の case-run で `package-release-archive.ps1` を実行した際、毎回 untracked ファイルが発生し worktree 削除時の `git worktree remove` が拒否される（本 Wave 4 case-close Step 7 で `git clean -fd` による事前削除が必要だった）
- 移行計画 §10.6 最終完了条件「baseline 新規追加 0件」と間接的に関連（誤 commit を防ぐ予防線）

## 発生局面

実装（WP-3 case-run、release archive 生成コマンド追加時）

## 検知方法

WP-3 case-run で `package-release-archive.ps1` の動作確認時に `dist/` へ ZIP が生成されることを確認。`.gitignore` に `dist/` エントリが存在しないことを確認し、PR 本文「残リスク / follow-up」へ記録。Wave 4 case-close Step 7 で worktree 削除時に `dist/` が untracked として `git worktree remove` を拒否し `git clean -fd` による前置削除が必要になったことで、運用摩擦が実証された。

## 想定される対応方向

- `.gitignore` へ `/dist/` エントリを追加する（WP-4 以降の case-run でも `package-release-archive.ps1` を実行する可能性があるため、早めの対処が望ましい）
- 対象スコープ: `.gitignore`（ルート）
- 移行計画 §10.6 の最終完了条件「baseline 新規追加 0件」と矛盾しない（.gitignore への追跡除外エントリ追加は baseline 追加ではない）

## 関連

- Epic: #1924
- Issue: #1928 (WP-3)
- PR: #1935 (squash merge eb262f11)
- 対象ファイル: `.gitignore`、`scripts/package-release-archive.ps1`
- 移行計画: `.omo/plans/agentdev-migration-2026-08-05.md` §7.5.1

## 出典引用

PR #1935 本文「## 残リスク / follow-up」より:

> - `dist/` が gitignore 対象外。本 PR では commit していないが、将来のメンテで誤 commit を避けるため `.gitignore` への追加を別 PR で検討（scope 外）

## タグ

#intake #gitignore #dist #release-archive #package-release-archive #wp-3 #migration-2026-08
