# intake: WP-6 で顕在化した regression.md（§7.7.1）未作成

## 発生日

2026-08-06

## 発生元

- Issue: #1931 (WP-6 索引再生成・統合検証・Release Report OU-007)
- PR: #1938
- Epic: #1924 (AgentDevFlow 2026-08 移行)
- 取得元: PR #1938 本文「## 残リスク / follow-up」セクション

## 問題事象

移行計画 `.omo/plans/agentdev-migration-2026-08-05.md` §7.7.1 が回帰マトリクス文書（`regression.md`）の作成を要件するが、当該 artifact が未作成である。WP-3（OU-004、Issue #1928）で生成されるべきであった regression.md が存在せず、WP-6 の統合検証時点でも補完されなかった。

機能面の回帰担保は unit test 82 pass（check_integrity.test.ts）と WP-6 での3 profile 実測（source/installed/release 全 exit 0）で代替確保されている。欠損は文書化 artifact のみ。

## 影響

- 移行計画 §7.7.1 の形式要件を満たさない（回帰マトリクスの文書化欠落）
- 今後の類似移行で回帰検証の参照文書が存在しない
- Release Report §10.5「残存 warning と許容根拠」に記載済み（機能は unit test で担保、文書化 artifact のみ欠損）

## 発生局面

実装（WP-6 case-run、Release Report 作成時）

## 検知方法

WP-6 case-run で Release Report の §10.5 記載項目を整理中、移行計画 §7.7.1 が要件する regression.md が存在しないことを確認。機能面の回帰は unit test + 3 profile 実測で担保されているため blocker とはせず、follow-up として PR 本文「残リスク / follow-up」へ記録。

## 想定される対応方向

- 別 Issue を起票し、移行計画 §7.7.1 に基づく regression.md を作成（backfill）
- 内容: WP-3（Integrity Checker profile 分離）前後の検出力比較マトリクス、各 profile の strict/warning/info 件数推移
- 配置先候補: `.omo/plans/agentdev-migration-2026-08-05.regression.md`

## 関連

- Epic: #1924
- Issue: #1931 (WP-6)、#1928 (WP-3、本来の作成元)
- PR: #1938 (squash merge 440ab6bd)、#1935 (WP-3)
- 移行計画: `.omo/plans/agentdev-migration-2026-08-05.md` §7.7.1
- Release Report: `.omo/plans/agentdev-migration-2026-08-05.release-report.md` §10.5 残存 warning

## 出典引用

PR #1938 本文「## 残リスク / follow-up」より:

> `regression.md`（§7.7.1）未作成: 機能は unit test 82 pass + 本 WP での3 profile 実測で担保。文書化 artifact のみ欠損、backfill を follow-up として発行予定

## タグ

#intake #regression-md #wp-6 #wp-3 #migration-2026-08 #documentation-gap
