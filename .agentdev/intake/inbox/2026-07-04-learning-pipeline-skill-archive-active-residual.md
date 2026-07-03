# learning-pipeline/SKILL.md に archive/active.md 参照が残留（5箇所）

## 観測

PR #1402（Epic #1395 Wave 3, Issue #1398）のリネーム完了後、`src/opencode/skills/agentdev-learning-pipeline/SKILL.md` に `archive/active.md` への参照が5箇所残存:

- L27: アーティファクト lifecycle 表の `archive/active.md` 行
- L205: living pool 維持の記述
- L219: 廃棄カテゴリ10 deferred の記述
- L351: prune 対象特定の記述
- L373: prune 非対象の記述

## 今回扱わなかった理由

Issue #1398 の OU リスト（OU-015）は `docs/specs/skills/agentdev-learning-pipeline.md`（SPEC）の L28 を指しており、`src/opencode/skills/agentdev-learning-pipeline/SKILL.md`（実装本文）は明示対象外。CONTEXT も `references/promote-judgment-logic.md` のみを明示。スコープディシプリンにより本 PR では修正対象外とした。

## 影響

学習ヘルパー skill 利用者が古いパス（`.agentdev/learning/archive/active.md`）を参照し、存在しないファイルへアクセスするリスクがある。SPEC 側（`docs/specs/skills/agentdev-learning-pipeline.md` L28）は `deferred.md` に更新済みのため SPEC↔実装本文の不整合が発生している。

## レビューで決めること

- 実装本文 SKILL.md の `archive/active.md` 参照を `deferred.md` に更新するか
- 更新する場合、参照先パス（`.agentdev/learning/deferred.md`）および AG-005 多状態 living pool 記述を SPEC L28 と整合させるか
- 同一 PR で learning-capture/SKILL.md（F-002）、learning-capture/references/example.md（F-003）も合わせて更新するか

## 根拠

PR #1402 Findings F-001 より。`git grep -n "archive/active" src/opencode/skills/agentdev-learning-pipeline/SKILL.md` で5箇所の残存を確認済み。
