# agentdev-git-worktree「git main 同期リスク事前検出プロシージャ」の main 固定文言が統合先一般化に未追随

## 観測

`src/opencode/skills/agentdev-git-worktree/references/git-common-procedures.md` 第9節「git main 同期リスク事前検出」は、手続き名・本文とも `main` 固定の文言のまま（`git pull --ff-only` による main 同期、リスク3「非 main ブランチ占有」判定、代替手順 `git fetch origin main:main`）。一方、case-close 配布スキル側は PR #2347 で「同期対象のブランチは当該 Case の統合先」と一般化して参照しており、git-worktree 側でも同一 PR 群（#2345）でコンフリクト解消 rebase 基準（第10節）は統合先参照へ一般化済み。マージ後 main（5518a3ac）でも第9節のみ main 固定が残存する。

## 今回扱わない理由

git-worktree スキル側の当該手続きの一般化は Issue #2313（case-close 適合、OU-0023）の変更対象範囲の外と判断され、PR #2347 では参照形式で接続するに留めた。Issue #2315（OU-0028、git-worktree 適合）の完了条件も worktree 作成元の統合先解決と評価ブランチ作成・削除の手順実装が範囲であり、同期リスク検出手続きの文言一般化は含まれていなかった。

## 影響

実証Caseの評価ブランチを統合先とする Case の case-close（STEP-6-3 実行前同期）で、参照元の「統合先」表現と参照先第9節の main 固定実行詳細（特にリスク3の非 main ブランチ占有判定と `git fetch origin main:main` 代替手順）の間に手続き名と実体の表現ゆらぎが生じ得る。評価ブランチ同期時にリスク3判定が誤適用される（評価ブランチ checkout を「非 main ブランチ占有」と誤検出する）恐れがある。

## レビューで決めること

- 第9節を統合先パラメータ化（手続き名・`git pull --ff-only` 対象・リスク3判定・代替手順を統合先解決へ一般化、通常Caseは既定 main で不変）するか
- 参照元（case-close ほか本手続きを参照する配布スキル）の表現を実態（main 固定）に合わせるか

## 根拠

- PR #2347 本文「Findings / Capture候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2347）
- 残存確認: マージ後 main 5518a3ac の git-common-procedures.md 第9節（main 固定）と第10節コンフリクト解消 rebase 基準（統合先化済み、PR #2345）の比較
