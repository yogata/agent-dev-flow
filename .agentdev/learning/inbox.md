# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 2026-09-07: 配布対象 SKILL.md の記載例に具体的な REQ/TS 行 ID を使うと distribution-boundary gate の concrete-id / unclassified-entry 違反になる

- **問題事象**: agentdev-issue-management/SKILL.md への記載粒度ガイドライン記載例で具体的な行 ID（REQ-057-003、TS-012）を使用した結果、case-close E4-1 配布依存境界 最終 gate（check_distribution_boundary.ts --profile source）で新規違反 2件（concrete-id、unclassified-entry）を検出し、PR マージが中止・blocked 再作業となった。
- **発生局面**: レビュー（case-close E4-1 最終 gate）。Epic 2652 / Issue 2662 / PR 2675。
- **検知方法**: case-close E4-1 gate の delta 実行（main baseline との差分）で新規違反 2件として機械検出。
- **根本原因**: 配布ソース面の本文に digits を持つ具体 ID 例を記載すると GENERIC_ID_PATTERN 非合致として concrete-id / unclassified-entry に分類される。記載例執筆時に検出器の ID 分類規則（プレースホルダ形式は digits を持たず許容）を考慮していなかった。
- **自律対応内容**: 記載例をプレースホルダ形式（REQ-{NNNN}-{NNN}、TS-{NNN}）へ汎用化し、gate 再実行で新規違反 0件を確認してマージ（commit f42bf6f6）。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（distribution-boundary Design の既定規則への準拠欠缺に起因。Design 変更不要）
- **横展開観点**: 配布対象 command/skill ソース（src/opencode/**）へ記載例・サンプルを追加する全ケース（case-run 委譲、docs_chore 系 Issue）に共通。
- **再発条件**: 配布ソース面の本文への digits 付き具体 ID（REQ-XXXX-XXX、TS-XXX、NG-XXX 等）の記載例追加。
- **予防策候補**: 配布対象ファイルへの記載例は最初からプレースホルダ形式（{NNNN} 系トークン）で書く。具体 ID の実例が必要な場合は PR 作成前に check_distribution_boundary.ts --profile source を前置実行する。
- **想定反映先**: learning-promote での分類後、agentdev-skill-authoring の記載例ガイドライン注記、case-run 検証手順への前置 gate 実行注記。
- **関連**: PR 2675 本文 Findings / Capture候補 セクション、Issue 2662、Epic 2652
- **タグ**: #distribution-boundary #skill #example #placeholder #case-close #verification

---

## 2026-09-07: ng-baseline エントリ削除は live suppression を巻き込まない。削除後に check_integrity で delta 0 を検証する

- **問題事象**: ng-baseline.json の解消済みエントリ削除作業で、provenance が同一（issue-2372-ir065-initial-baseline）の live suppression（.agentdev/extensions 3件、rewrite-patterns.md の obsolete-vocabulary 計4件）まで一括削除され、demote 解除が破綻する状態で PR 化された。case-close 側の検証で delta が 0 にならないため blocked 再作業となり、live 4件の復元（commit c74d9c30）が必要だった。
- **発生局面**: 実装（case-run 委譲）。Epic 2652 / Issue 2659 / PR 2672。
- **検知方法**: case-close 側での check_integrity 再実行・main 差分比較（TS-009 の demote 解除検証）。
- **根本原因**: 「解消済みエントリ」の判定を provenance 系の一括処理で行い、「当該エントリの violation が現在も発生しているか（live か）」の個別確認を経ていなかった。
- **自律対応内容**: live suppressions 4件を復元し、最終状態でエントリ差分（573 → 555、削除 18 / 追加 0）と check_integrity 新規 NG 0件（delta 0）を確認してマージ。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（integrity-contracts.md L359 の baseline 再計算手順・ratchet 運用の適用欠缺。Design 変更不要）
- **横展開観点**: ng-baseline / baseline 系ファイルのエントリ削除・再生成を伴う全作業（ACT-DESIGN-003 運用、baseline 再計算 PR）に共通。
- **再発条件**: baseline エントリ削除時に violation 発生有無を確認せず provenance・check 種別単位で一括削除する運用。
- **予防策候補**: baseline エントリ削除の前に、当該エントリの violation が現行ツリーで still-live かを確認（live は残す）。削除後は PR 化前に check_integrity を再実行して新規 NG 0件（delta 0）を確認する。
- **想定反映先**: learning-promote での分類後、repo-agentdev-integrity SKILL.md の baseline 運用手順注記、integrity-contracts.md baseline 再計算手順の運用注記。
- **関連**: PR 2672 本文、Issue 2659、Epic 2652、docs/designs/integrity/integrity-contracts.md
- **タグ**: #baseline #ng-baseline #integrity #demote #case-run #verification

---
