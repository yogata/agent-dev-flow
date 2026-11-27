---
id: 2026-11-28-commit-split-guideline-conflicts-with-atomic-impl-test-commit
created_at: 2026-11-28T08:59:00+09:00
source: case-close (yogata/reENC の Root Case #93 の学びの記録の引継ぎ。利用者の判断 2026-11-28: 質問3 案C)
status: unreviewed
---

# 第三者のスキルの commit 分割の目安が、実装と試験をまとめた commit の単位と食い違った

- **問題事象**: 導入先 reENC の Root Case #93 の実装PR #95 (分岐 fix/issue-93) で、実行する側は commit を 2 つに分けた。1 つは実装・試験・モックの 6 ファイル、もう 1 つはトレーサビリティの sidecar である。PR #95 本文の 161 行目は、「3 ファイル以上は 2 commit 以上」という目安が「実装とその試験を同じ commit に入れる規則」と併せると分割できないことがある、と報告している。
- **発生局面**: case-run の実装
- **検知方法**: PR #95 本文の 28 行目と 161 行目。監督が 2026-11-28 に出所を検索した。
- **根本原因**: PR #95 本文は目安を git-master のものとして記載した。しかし git-master の `SKILL.md` にファイル数による目安は見つからなかった。「3+ files changed → 2+ commits minimum」は oh-my-openagent の work-with-pr の `SKILL.md` の 106 行目にあった。「7 ファイルなら 3 commit 以上」という数値は、oh-my-openagent 全体の検索では見つからなかった。「実装とその試験を同じ commit に入れる規則」は、本リポジトリの src と docs には無かった。
- **自律対応内容**: 実行する側は、実装・試験・モックの 6 ファイル (どの部分集合だけを取り出しても試験が成立しない単位) を 1 commit にし、sidecar を別の 1 commit にして、理由を返却に記載した (PR #95 本文 28 行目)。
- **ユーザー確認有無**: なし (実行する側の判断。PR 本文に利用者への確認の記載は無い)
- **Decision/REQ/spec影響**: なし
- **横展開観点**: commit 分割の目安は、実行環境の第三者のスキルと ADF の契約のそれぞれに存在し得る。実績では、試験が成立する単位を優先した。
- **再発条件**: 第三者のスキルの分割の目安を、実装と試験を含む変更に適用する場合
- **予防策候補**: 委譲の文言で、commit の分割は ADF の契約に従うことと、第三者のスキルの目安を引用しないことを明示する (監督の提案。採否は learning-promote で判断する)。
- **想定反映先**: agentdev-case-run-execution-adapter の委譲契約 (候補)
- **関連**: yogata/reENC の Issue #93、PR #95、reENC の学びの箱にある同じ内容の記録
- **タグ**: `#case-run` `#commit` `#git`
