---
id: 2026-11-28-pr-template-findings-heading-spelling-mismatch
created_at: 2026-11-28T08:56:00+09:00
source: case-close (yogata/reENC の Root Case #93 の残る事柄の登録。利用者の判断 2026-11-28: 質問3 案C)
status: unreviewed
---

# PR テンプレートの `Findings/ Capture候補` の見出しの綴りが、読む側の規約と揃っていない

- **課題**: 配布物の PR テンプレート (`templates/pr_desc.md`) の見出しは `## Findings/ Capture候補` で、スラッシュの前に空白が無い。capture-boundaries や case-close など、読む側の規約と Design は `## Findings / Capture候補` と書く。`harness-delegation.md` は両方の綴りを含む。見出しを文字列で探す処理があるため、書き手はどちらに合わせればよいか分からない。
- **期待する処分**: 綴りを 1 つに揃える。ローカルの runner (`src/common/tools/agentdev-gh/local/runner-local.ts`、`case-schema/rules/headings.yaml`) が使う綴りに合わせることを候補とする。
- **出典**: yogata/reENC の実装PR #95 の本文 (Issue #93) の 155 行目と 162 行目。reENC の受付の箱にある同じ内容の項目 `2026-11-28-pr-template-findings-heading-spelling-mismatch`。
- **実証根拠**: (1) 本リポジトリ (a55ce8fa0) で `git grep -F "Findings/ Capture候補"` を実行した。`.agentdev/backlog/` を除くと 7 ファイル 10 行ある (`templates/pr_desc.md` 3 行、`harness-delegation.md` 1 行、`agentdev-workflow-templates/SKILL.md` 1 行、`verification-diff-section.md` 1 行、`docs/guides/troubleshooting.md` 1 行、試験 2 行)。(2) `git grep -F "Findings / Capture候補"` は 43 ファイル 80 行ある (`harness-delegation.md` 7 行、`capture-boundaries.md` 2 行、`runner-local.ts` 2 行、`headings.yaml` 3 行を含む)。(3) reENC の実行する側は、読む側の綴りに合わせて PR 本文を書いた (PR #95 本文 155 行目)。
