# case-close docs-and-design-promotion.md の bun test 実行形態契約節の正規形更新漏れ

## 観測

agentdev-workflow-case-close/references/docs-and-design-promotion.md の「full integrity suite 実行（bun test 実行形態契約）」節が integrity suite 単体形（bun test ./.opencode/skills/<integrity-detector-skill>/scripts/ のみ）の記述のままである。

PR #2391（Issue #2381、OU-003）が確定したフル suite 正規形（3 cwd 分割実行・依存パッケージ前置・環境ラベル・fail 由来分類）と不整合がある。case-close は QG-4 の実行側である。

## 今回扱わない理由

Issue #2381（OU-003）の変更対象は 3 skill（agentdev-git-worktree / agentdev-quality-gates / agentdev-workflow-case-run references）への明記であり、agentdev-workflow-case-close skill は対象外。配布物 skill の修正は別途 Issue 化が必要で、case-close の capture 責務は回収・保存のみである。

## 影響

case-close 実行時の full integrity suite 実行形態が正規形（3 cwd 分割・環境ラベル）と乖離し、検証範囲が integrity suite に限定されたままになる恐れがある。

## レビューで決めること

- docs-and-design-promotion.md 同節の正規形（3 cwd 分割実行・依存パッケージ前置・環境ラベル）への更新を Wave 2 の OU-008（Issue #2386、フル suite 機械受理）と併せて扱うか、独立 Issue とするか

## 根拠

- PR #2391 本文「Findings / Capture候補」intake（回収元: https://github.com/yogata/agent-dev-flow/pull/2391 ）
- src/opencode/skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md「full integrity suite 実行（bun test 実行形態契約）」節
