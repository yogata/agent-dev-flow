# agentdev-traceability の SKILL.md description が RU-0018 層1 の個別上限 600 を超過（631文字、PR #2367 由来）

## 観測

case-close QG-4 独立再検査（PR HEAD 8395d97d、2026-08-21）で lint_skills.ts（profile source）を実行した結果、AG-005（description length 600、RU-0018 層1、検証不通過）の NG 1件を検出した。

- src/opencode/skills/agentdev-traceability/SKILL.md: description 631 chars（expected: `<= 600`）
- base（origin/main 95b3129c）の同一 description は 586 chars。PR #2367 の実装で description へ "verification-scope catalog entry validation" を追記した結果、上限を超過した
- baselines/lint-skills-baseline.json の entries は空（未登録・unmanaged delta）

## 今回扱わない理由

Issue #2366 の必須品質統制 TS-QC-01 は「agentdev-skill-authoring の基準」による査読であり、同スキルの基準に description 文字数の数値上限は存在しない（3人称・USE FOR / DO NOT USE FOR 必須・トリガー数・frontmatter 制約はすべて合格）。RU-0018 層1 の上限超過は QG-4 の停止条件（未達チェックボックス・CI 失敗・test strategy 未処理・横断是正証拠欠落・評価スコープ不能）のいずれにも該当しないため、case-close は merge を続行し PR 本文・Issue 対応記録コメント・本 item に記録した。

## 影響

main（b385883b 以降）で lint_skills.ts の unmanaged NG が既存（agentdev-git-worktree/references/worktree-operations.md の TOC NG）に加えて 1件増える。checker の delta exit が 1 となるため、/repo/docs-check や inspect-skills 系の検証でノイズになる。

## レビューで決めること

- description の短縮（600文字以下への編成）を単独修正で行うか、Issue 2362（513行カタログ登録）の移行作業に併せるか
- lint-skills-baseline.json への登録（known violation 扱い）と即時修復のどちらを取るか
- TS-QC-01 系の品質統制（agentdev-skill-authoring 基準による SKILL.md 査読）に lint_skills.ts の delta 実行を組み込むか（本件は case-run の品質統制では検出できず QG-4 の独立再検査で検出した）

## 根拠

- case-close QG-4 独立再検査の lint_skills.ts 実行（PR HEAD worktree 8395d97d、2026-08-21、exit 1 / NG 2 のうち当該 1件、AG-005 ルーティングサマリ）
- base と PR HEAD の description 文字数実測（586 → 631、`git show origin/main:...SKILL.md` との比較）
- Issue 2366 対応記録コメント（https://github.com/yogata/agent-dev-flow/issues/2366#issuecomment-5368310265）「残存リスク」節
