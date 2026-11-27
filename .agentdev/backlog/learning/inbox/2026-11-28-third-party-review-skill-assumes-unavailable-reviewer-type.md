---
id: 2026-11-28-third-party-review-skill-assumes-unavailable-reviewer-type
created_at: 2026-11-28T08:59:00+09:00
source: case-close (yogata/reENC の Root Case #93 の学びの記録の引継ぎ。利用者の判断 2026-11-28: 質問3 案C)
status: unreviewed
---

# 第三者のスキル review-work が想定する reviewer の型が無い実行環境で gate review を行った

- **問題事象**: 導入先 reENC の Root Case #93 の実装PR #95 で、実行する側は第三者のスキル review-work を参照した。review-work は review 用の worktree と reviewer のエージェント型 (`lazycodex-gate-reviewer`) を想定する。PR #95 本文の learning によれば、使えた subagent は explore と librarian の 2 種だけだった。
- **発生局面**: case-run の実装の review
- **検知方法**: 監督が 2026-11-28 に出所を検索した。review-work と git-master は、本リポジトリの追跡対象と reENC には無かった。実体は opencode の plugin oh-my-openagent の `packages/shared-skills/skills/` にあった (review-work の `SKILL.md` の 14 行目と 90 行目)。
- **根本原因**: 実行環境には、ADF の配布物に無い第三者のスキルが入っていた。実行する側はそれを review の手順として参照した。
- **自律対応内容**: 実行する側は、読み取り専用の explore 1 体に自己完結の英語の依頼文 (目的、制約、差分、文脈、QA の証拠の一覧) を渡して gate review を行った (PR #95 本文 111 行目)。
- **ユーザー確認有無**: なし (実行する側の判断。PR 本文に利用者への確認の記載は無い)
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 導入先ごとに、実行環境に入っている第三者のスキルを確かめる。第三者のスキルが想定する reviewer の型や worktree の使い方は、環境ごとに異なる。
- **再発条件**: oh-my-openagent などの第三者のスキルが入った実行環境で、case-run の review を行う場合
- **予防策候補**: 委譲の文言で、review に使える subagent の型を明示する (監督の提案。採否は learning-promote で判断する)。
- **想定反映先**: agentdev-case-run-execution-adapter の委譲契約 (候補)
- **関連**: yogata/reENC の Issue #93、PR #95、reENC の学びの箱にある同じ内容の記録
- **タグ**: `#case-run` `#subagent` `#review`
