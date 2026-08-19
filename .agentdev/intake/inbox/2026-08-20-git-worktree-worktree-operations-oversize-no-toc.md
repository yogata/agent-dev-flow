# agentdev-git-worktree worktree-operations.md が300行超過・目次なし（lint_skills 既存 NG）

## 観測

`src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md` が 340 行で目次がない。RU-0018 層2 AG-005（300行超過ファイルは目次必須）違反。lint_skills で検出される既存 NG であり、当該ファイルは直近のどの PR でも未変更の pre-existing。

## 今回扱わない理由

Issue #2295（inspect-promote 自律確定実装）の変更対象範囲の外のファイルであり、PR #2334 では未変更のまま残置された。本 capture は case-close の回収・保存責務の範囲で別途是正候補として記録する。

## 影響

lint_skills の NG が解消されないまま残存する。参照者は 340 行の長文 reference から必要節を探す負荷が続く。

## レビューで決めること

- 目次追加のみで是正するか、ファイル分割（squash merge 後分岐ハンドリング・コンフリクト解消等の主題別）を行うか

## 根拠

- PR #2334 本文「Findings / Capture候補」1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2334）
- 検出: lint_skills（RU-0018 層2 AG-005）
