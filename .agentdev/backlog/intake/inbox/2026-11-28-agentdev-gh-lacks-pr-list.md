---
id: 2026-11-28-agentdev-gh-lacks-pr-list
created_at: 2026-11-28T08:56:00+09:00
source: case-close (yogata/reENC の Root Case #93 の残る事柄の登録。利用者の判断 2026-11-28: 質問3 案C)
status: unreviewed
---

# `agentdev_gh` に PR 一覧を読む操作が無い

- **課題**: `operation-catalog.ts` に PR 一覧を読む操作が無い。Issue 一覧の `issue_list` はある。ある Case の設計PR を番号で探す処理は、`agentdev_gh` だけでは書けない。監督は委譲の文言で、読み取りに限り生の `gh pr list` を使う例外を認めて回避した。
- **期待する処分**: `pr_list` (番号・状態・head・base の一覧) を加える。または、読み取りに限る生の `gh` を例外として認めることを、正規の文書のどこに書くか決める。
- **出典**: yogata/reENC の Root Case #93 の case-ready への委譲 (DEL-93-case-ready-2)。監督が作成した委譲の文言と、reENC の Root の記録「`agentdev_gh` に PR 一覧操作がない」。観測は 2026-11-27。
- **実証根拠**: (1) 本リポジトリ (a55ce8fa0) の `src/common/tools/agentdev-gh/operation-catalog.ts` の操作は 20 件で、`pr_list` は無い。(2) reENC の配布物 5.2.6 の同じファイルの操作は 16 件で、`pr_list` は無い。
