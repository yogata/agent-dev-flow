# intake: WP-6 統合検証で顕在化したテスト陳腐化70件（WP-1..WP-5 リファクタリングの追従未完了）

## 発生日

2026-08-06

## 発生元

- Issue: #1931 (WP-6 索引再生成・統合検証・Release Report OU-007)
- PR: #1938
- Epic: #1924 (AgentDevFlow 2026-08 移行)
- 取得元: PR #1938 本文「## 残リスク / follow-up」セクション

## 問題事象

WP-1..WP-5 のリファクタリング（frontmatter 正常化、内部参照除去、Integrity Checker profile 分離、command 薄型化、SKILL.md 段階的開示）で配布物側の契約が変更されたが、それらの契約を検証対象とするテストファイル側の追従が未完了である。WP-6 の §10.3 検証順序 step 4（skill lint / structure）で70件のテスト陳腐化が検出された。

主検査系テスト（check_integrity.test.ts 82 pass、commands_structure.test.ts 49 pass、commands_error_cases.test.ts 31 pass、check_reference_paths.test.ts 22 pass、check_distribution_boundary.test.ts 11 pass）は全件 pass であり、検査本体は健全。陳腐化70件は周辺テストファイル（移行で契約変更された対象を直接参照するテスト）に集中する。

## 影響

- 配布物契約変更後のテストスイート全体の信頼性低下（主検査系は pass だが、周辺テストの陳腐化が未解決）
- 今後のリファクタリングで陳腐化テストが偽陽性/偽陰性を生む可能性
- Release Report §10.5「残存 warning と許容根拠」に記載済みだが、別 Issue での追従が推奨される

## 発生局面

実装（WP-6 case-run、§10.3 検証順序 step 4 実行時）

## 検知方法

WP-6 case-run で §10.3 検証順序 step 4（skill lint / structure）を実行した際、70件のテスト陳腐化を検出。主検査系テストは全件 pass を確認した上で、陳腐化件数を PR 本文「残リスク / follow-up」へ記録。

## 想定される対応方向

- 別 Issue を起票し、WP-1..WP-5 で契約変更された対象（frontmatter、内部参照、profile 分離、command 薄型化、SKILL.md 段階的開示）を参照するテストファイルを特定
- 各テストファイルを新契約へ追従させ、70件の陳腐化を解消
- 主検査系テスト（check_integrity/commands_structure/commands_error_cases/check_reference_paths/check_distribution_boundary）は現行 pass を維持

## 関連

- Epic: #1924
- Issue: #1931 (WP-6)
- PR: #1938 (squash merge 440ab6bd)
- Release Report: `.omo/plans/agentdev-migration-2026-08-05.release-report.md` §10.5 残存 warning
- 前工程 WP: #1926 (WP-1)、#1927 (WP-2)、#1928 (WP-3)、#1929 (WP-4)、#1930 (WP-5)

## 出典引用

PR #1938 本文「## 残リスク / follow-up」より:

> テスト陳旧化70件（WP-1..WP-5 リファクタリングで契約変更されたテストファイル側の追従未完了）: 別 Issue 推奨。主検査系テストは全 pass で検査本体は健全

## タグ

#intake #test-staleness #wp-6 #migration-2026-08 #test-suite #refactoring-followup
