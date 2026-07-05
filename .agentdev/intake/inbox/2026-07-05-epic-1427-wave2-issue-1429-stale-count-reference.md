# close済み Issue #1429 / Epic #1427 の件数表記修正（303→317）

## 概要

Epic #1427 Wave 2 子Issue #1429 の本文（close済み）に記載の concrete_id 件数（301件）および総件数（303件）が、case-run 実施時の実測値（concrete_id 315件、総件数 317件）と乖離している。Epic #1427 status table の「303件違反」表記も同様に陳腐化している。両Issue ともに close 済みであり、機能的影響はなく情報正確性のみの問題。

## 詳細

- Issue #1429 は case-open 時点（Wave 1 マージ前）の件数スナップショット（concrete_id 301件 + concrete_path 2件 = 303件）を本文に記載
- Wave 1 PR #1431（IR-059 ルールファイル）と PR #1432（project-extensions SPEC 起動時読込契約）で、これら SPEC/IR ファイル内に concrete_id 参照が新規追加され、実測値は concrete_id 315件 + concrete_path 2件 = 317件に増加
- PR #1433 は実測値317件の全てを是正対象として実装し、check_distribution_boundary.ts = 0件で完了条件達成（機能的完了条件は満たしている）
- 件数表記のズレは PR #1433 Findings の stale-reference セクションに記録済み。case-update での本文修正は本 PR では実施せず後続委譲とした
- 両Issue は本 case-close で close 済み。履歴記録上の正確性のみ

## 候補となる対応

優先度は低（情報正確性のみ、機能的影響なし、両Issue close済み）。以下のいずれか:

1. **見送り（推奨）**: close済みIssue の履歴修正は実施しない。PR #1433 Findings および本 intake item で乖離の事実記録は十分
2. **コメント追記**: Issue #1429 / Epic #1427 に「件数表記は case-open 時点のスナップショット。実測値は317件（PR #1433 Findings 参照）」旨のコメントを追記して履歴正確性を補完

## 根拠

- 観測元: PR #1433 の case-close 実行（Epic #1427 Wave 2 FINAL、2026-07-05）
- 件数乖離: concrete_id 301件（Issue #1429 本文）vs 315件（実測値）、+14件
- 乖離原因: Wave 1 PR #1431/#1432 での SPEC/IR ファイルへの concrete_id 参照新規追加
- 機能的影響: なし（check_distribution_boundary.ts = 0件で完了条件達成）
- 関連 learning: `.agentdev/learning/inbox.md`「順次Wave構成で先行Wave の実装が後続Wave 子Issue の件数前提を陳腐化させる」
- 関連要件: REQ-0130-031（staleness check）、REQ-0130-034/035（case-update 連携）
