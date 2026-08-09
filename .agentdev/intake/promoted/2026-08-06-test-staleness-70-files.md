# WP-1..WP-5 リファクタリングで契約変更対象のテスト追従未完了（70件陳腐化）

## 観測内容

WP-1..WP-5 のリファクタリング（frontmatter 正常化、内部参照除去、Integrity Checker profile 分離、command 薄型化、SKILL.md 段階的開示）で配布物側の契約が変更された。
これらの契約を検証対象とするテストファイル側の追従が未完了であり、WP-6 §10.3 検証順序 step 4（skill lint / structure）で70件のテスト陳腐化が検出された。
主検査系テスト（check_integrity.test.ts 82 pass、commands_structure.test.ts 49 pass、commands_error_cases.test.ts 31 pass、check_reference_paths.test.ts 22 pass、check_distribution_boundary.test.ts 11 pass）は全件 pass であり、検査本体は健全。陳腐化70件は周辺テストファイル（移行で契約変更された対象を直接参照するテスト）に集中する。

## 影響

配布物契約変更後のテストスイート全体の信頼性低下（主検査系は pass だが周辺テストの陳腐化が未解決）。
今後のリファクタリングで陳腐化テストが偽陽性/偽陰性を生む可能性。
優先度は中。Release Report §10.5「残存 warning と許容根拠」に記載済み。

## 課題

新契約へのテスト追従を実施する。
inbox 原文が「別 Issue 推奨」と明記しているため、別 Issue 起票を前提とする。
対応候補:
- WP-1..WP-5 で契約変更された対象（frontmatter、内部参照、profile 分離、command 薄型化、SKILL.md 段階的開示）を参照するテストファイルを特定する
- 各テストファイルを新契約へ追従させ、70件の陳腐化を解消する
- 主検査系テスト（check_integrity/commands_structure/commands_error_cases/check_reference_paths/check_distribution_boundary）は現行 pass を維持する

## 既存要件との関連

- Release Report: `.omo/plans/agentdev-migration-2026-08-05.release-report.md` §10.5 残存 warning
- Epic: #1924（AgentDevFlow 2026-08 移行）
- Issue: #1931（WP-6 索引再生成・統合検証・Release Report OU-007）
- 前工程 WP: #1926（WP-1）、#1927（WP-2）、#1928（WP-3）、#1929（WP-4）、#1930（WP-5）
- PR: #1938（squash merge 440ab6bd）

## 出典

- inbox 元ファイル: `intake-2026-08-06-wp6-test-staleness-70-files.md`
- 発生日: 2026-08-06
- PR: #1938（Issue #1931 / WP-6, Epic #1924）
