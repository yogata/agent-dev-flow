# docs-check source-projection-sync の worktree 偽陽性（checker 改良候補）

## 観測

PR #1010 (Issue #1000 / Epic #990 Wave 5 OU-010) の Stream C 横断検査を worktree (`.worktrees/1000-feature`) 内で実行した際、`source-projection-sync` ルールが 27 件の NG を報告した。原因は Windows + junction 環境の worktree で `.opencode/skills/agentdev-*` の junction link が未伝播（既知問題・`agentdev-workflow-orchestration/SKILL.md` に記載済み）。main repo では 0 件になる偽陽性。

## 影響

- worktree で `/repo/docs-check` を実行する case-run / case-close のローカル検証で、常に 27 件の NG が報告され、本当の NG（Stream B 変更由来等）を埋もれさせるノイズになる。
- QG-3/QG-4 判定時に「偽陽性の分離」をエージェントが手動で行う手間が毎回発生する。
- `agentdev-workflow-orchestration` に既知問題として記載済みだが、checker 側で自動的に対処（worktree 検知 skip・junction link 状態確認）する改良がなければ永続的なノイズ源になる。

## レビューで決めること

- `scripts/check_integrity.ts` の `source-projection-sync` ルールが worktree 実行を検知して skip する（あるいは junction link 未伝播を検知して警告レベルに下げる）改良 Issue を起票するか。
- 改良コスト（worktree 検出ロジック・junction 状態確認）と、手動回避（main repo で再実行）の運用コストのトレードオフを評価するか。
- 類似の「環境由来の偽陽性」パターンが他ルールでも潜在していないか横展開確認するか。

## 根拠

- PR #1010: https://github.com/yogata/agent-dev-flow/pull/1010 (Issue #1000 / Epic #990 Wave 5 OU-010 Stream C)
- 既知問題記載: `src/opencode/skills/agentdev-workflow-orchestration/SKILL.md` 「Windows + ジャンクション環境の worktree では `.opencode/skills/agentdev-*` が空になる（ジャンクション未伝播）」
- 既知問題記載（case-run 側）: `src/opencode/skills/agentdev-workflow-orchestration/references/subagent-protocol.md` driver 起動プロンプトテンプレート
- Issue #1000: https://github.com/yogata/agent-dev-flow/issues/1000
- Epic #990: https://github.com/yogata/agent-dev-flow/issues/990
