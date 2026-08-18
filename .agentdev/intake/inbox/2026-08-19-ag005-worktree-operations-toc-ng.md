# agentdev-git-worktree/references/worktree-operations.md が AG-005 目次規則で NG（336行・TOC なし、PR #2257 由来）

## 観測

post-merge main（1e3d9729）で lint_skills.ts を実行した結果、AG-005（references TOC、RU-0018 層2）の NG 1件を検出した。

- agentdev-git-worktree/references/worktree-operations.md: 336 lines、目次なし（expected: `<= 300 lines or a TOC`）

PR #2257（bcb72c07、git stash 運用手順の標準化、2026-08-18 マージ）の取り込み由来。EU-D2（Epic 2218）両 PR（#2259/#2260）の変更対象外。baselines/lint-skills-baseline.json の entries は空のまま（未登録）。

## 今回扱わない理由

case-close（Epic 2218 Wave 1 クローズ）の対象範囲外の pre-existing 違反。Epic 完了条件3 の評価スコープ（workflow-soft-guard 矛盾の解消・AG-004 検出語統一）には影響しないため、Findings 記録にとどめた。

## 影響

main で lint_skills.ts が exit 1（NG 1）となる。checker 通過を前提とする配布物検証・QG 判定でノイズになる。

## レビューで決めること

- 目次付与または300行以下への分割・切り出しのどちらで解消するか
- lint-skills-baseline.json への登録（known violation 扱い）と即時修復のどちらを取るか

## 根拠

- case-close post-merge lint_skills.ts 実行（main 1e3d9729、2026-08-19、exit 1 / NG 1、AG-005 ルーティングサマリ）
- PR #2257 の worktree-operations.md 変更（bcb72c07、現行 336行）
