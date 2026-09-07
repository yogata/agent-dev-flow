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

## 2026-09-07: Bun.YAML 依存 checker は node 安定実行経路で実行不能。bun spawnSync の stdout 分離取得で証跡を確保する

- **問題事象**: checker 実行契約の安定実行経路（node --experimental-strip-types）で check_distribution_boundary.ts を実行したところ、`Bun.YAML.parse` 依存により "fail-closed: distribution targets file is not valid YAML"（exit 2）で失敗した。check_extensions.ts 等の同系 checker も同じ Bun 依存を持つ。また traceability check（scripts/src/check.ts）は `bun run <相対パス>` で Module not found（exit 1）になり、スクリプト絶対パス指定で解決した。
- **発生局面**: 検証（case-close STEP-3 配布依存境界 最終 gate、targeted docs guard、トレーサビリティ独立再検査）。Epic 2653 / Issue 2664 / PR 2677。
- **検知方法**: node での checker 実行が空 stdout + exit 2 で失敗し、stderr の fail-closed メッセージと checker ソース（distribution-boundary-rules.ts の Bun.YAML.parse）を突合して原因特定。
- **根本原因**: checker 実行契約の安定実行経路は Windows + bun の process.exit stdout 消失対策として node 経路を標準とするが、Bun.YAML 等 Bun ランタイム API に依存する checker は node では実行そのものが不可能。契約上の標準経路と checker 実装のランタイム依存の間に前提のずれがある。
- **自律対応内容**: bun を spawnSync で起動し status/stdout を分離取得、stdout を UTF-8 明示 writeFileSync で退避する wrapper を用いて全 checker を実行。JSON レポート取得と非ゼロ exit の証跡保持を両立した。
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（checker 実行契約の運用注記レベル。契約文書の変更必要性は learning-promote で判断）
- **横展開観点**: repo-agentdev-integrity 配下 checker、agentdev-traceability scripts を case-close/case-run で実行する全ケースに共通。
- **再発条件**: Bun ランタイム API（Bun.YAML 等）に依存する checker を node 経路で実行する場合、または scripts 配下に独自 package.json を持つスクリプトを相対パスの `bun run` で起動する場合。
- **予防策候補**: checker 実行時、Bun 依存の有無（Bun.YAML 等 import）を確認し、Bun 依存 checker は bun spawnSync wrapper 経由で stdout 証跡を取得する。scripts 配下のスクリプトは絶対パス指定で起動する。
- **想定反映先**: learning-promote での分類後、checker 実行契約（checker 実行契約と検出基盤規則 Design）の安定実行経路節への Bun 依存 checker 注記。
- **関連**: PR 2677、Issue 2664、Epic 2653、.opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary-rules.ts
- **タグ**: #checker #bun #stdout #windows #case-close #verification

---
