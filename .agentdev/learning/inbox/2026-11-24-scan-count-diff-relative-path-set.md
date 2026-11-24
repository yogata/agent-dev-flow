---
id: 2026-11-24-scan-count-diff-relative-path-set
created_at: 2026-11-24T13:45:00+09:00
source: case-close (Issue #4218 の統合後確認での観測)
status: unreviewed
---

# 走査件数の前後比較は相対パスの集合差分で行い ignore 対象の生成物を先に分類する

- **問題事象**: 統合後の main root と統合前の再現木で検査の走査件数が違った（全量整合性チェックは 751 件対 1687 件、配布依存境界の走査は 479 件対 480 件）。差の由来を特定するために書いた差分スクリプトの初版が絶対パスの文字列を比較し、全ファイルを「差」と出力した（baseline: main `c294f965d28fe56f8660123d818713fe08c43122`、2026-11-24 11:01 JST、`bun .opencode/skills/repo-agentdev-integrity/scripts/cli.ts --root <main root>` と `bun .opencode/skills/repo-agentdev-integrity/trusted-distribution-gate/check_distribution_boundary.ts --profile source --json <main root>`）
- **発生局面**: レビュー（Issue #4218 の case-close、統合後確認）
- **検知方法**: 証跡の stdout の走査件数を PR 本文の件数と突き合わせた。初版スクリプトの出力が全件差分だったため誤りに気づいた
- **根本原因**: (1) 初版は走査対象 root が異なる 2 つの出力のパス文字列をそのまま比較した（root が異なれば全件が異なる文字列になる）。(2) main root にだけ git 管理外の生成物がある（全量整合性チェックが書き出した `.agentdev/integrity/reports/` 配下のレポート 936 件と、textlint plugin の `vendor/textlint-engine.bundle.json`）
- **自律対応内容**: 差分スクリプトを相対パスの集合比較へ書き直した。全量整合性チェックの差分 936 件が `.agentdev/integrity/reports/` 配下、配布依存境界の差分 1 件が ignore 対象の vendor bundle であることを特定した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（確認手法の観測。全量整合性チェックが自らのレポートを走査する点は intake として分離）
- **横展開観点**: 2 つの環境の走査結果を比較するときは相対パスの集合差分を使い、差分の内容を ignore 対象かどうかで分類する
- **再発条件**: 異なる root の走査結果を比較するとき、または片方の環境にだけ git 管理外の生成物があるとき
- **予防策候補**: 証跡ラベルごとにコマンドと root を meta.json に残し、比較前に root の差をそろえる
- **想定反映先**: agentdev-workflow-case-close SKILL の統合後確認手順（references）
- **関連**: `.agentdev/intake/inbox/2026-11-24-integrity-scan-includes-own-reports-dir.md`、`.agentdev/learning/inbox/2026-11-23-textlint-vendor-worktree-unpropagation.md`、Issue #4218、PR #4219
- **タグ**: `#verification` `#integrity` `#evidence`
