---
id: 2026-11-28-pr-template-capture-section-lacks-learning-fields
created_at: 2026-11-28T08:56:00+09:00
source: case-close (yogata/reENC の Root Case #93 の残る事柄の登録。利用者の判断 2026-11-28: 質問3 案C)
status: unreviewed
---

# PR テンプレートの `Findings/ Capture候補` は learning の書き方を示さず、PR 本文から集めた learning の半分ほどが「PR 本文に記載なし」になる

- **課題**: `templates/pr_desc.md` の `### intake` と `### learning` には、「該当なし」の記載しか無い。書く項目の例が無い。一方、learning の項目は 13 項目の形式で保存する決まりなので、case-close は PR 本文の 1 行から 13 項目を組み立てることになる。
- **期待する処分**: `### learning` に、必ず書く項目 (問題事象・発生局面・検知方法・根本原因・自律対応内容・再発条件) の書式を置く。または、PR 本文に無い項目は「PR 本文に記載なし」として保存する今の運用でよいと、テンプレートに明記する。
- **出典**: yogata/reENC の実装PR #95 (Issue #93) の本文と、その本文から集めた learning 4 件。reENC の commit は 8b739d7。
- **実証根拠**: (1) 本リポジトリの `src/common/skills/agentdev-workflow-templates/templates/pr_desc.md` の 101〜107 行目は、`### intake` と `### learning` の下に「該当なし」だけを置く。(2) `docs/guides/intake-learning-backlog-flow.md` の 83〜86 行目は、learning の項目を 13 項目の形式で記録すると定める。(3) reENC の PR #95 本文の learning は 4 行だった。PR 本文から集めた learning 4 件は 52 項目のうち 25 項目が「記載なし」だった (reENC の `.agentdev/backlog/learning/inbox.md`)。
