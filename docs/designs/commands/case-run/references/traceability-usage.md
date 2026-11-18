---
title: トレーサビリティ能力の利用・cleanup 判定・参照する横断 Design と検査ツール
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/case-run.md から参照される詳細仕様（遅延読み込み）。 -->

# トレーサビリティ能力の利用・cleanup 判定・参照する横断 Design と検査ツール

## トレーサビリティ能力の利用

case-run の実行担当（委譲内サブエージェント）は、対象要件について `agentdev-traceability` の coverage で既存の対応関係を確認しながら、実際に要件を実現する成果物へ implementation 対応を、実際に要件を検証する恒常的な検証手段へ verification 対応を作成・更新する（REQ-021-015）。
対応宣言の作成先は成果物の配布境界で決定する。consumer distribution closure に含まれる配布対象成果物（command、skill、template、runtime script 等）の対応関係は、repository top-level の `traceability/` 配下の component / package 単位 sidecar へ作成・更新する。producer 側の開発管理成果物（docs/designs/** 等の正規成果物）の対応関係は、inline `ADF-COVERS` 宣言または sidecar へ作成・更新でき、sidecar と inline declaration は同じ論理的な対応関係へ正規化される。
対応宣言の表記仕様、sidecar の作成・更新方法は `agentdev-traceability` Design が正規所有する。

- 単に変更されたファイルであることを理由に、そのファイルを要件へ自動的に対応付けない
- 実行担当は PR 作成前に対象要件について check を実行し、Design 対応欠落、implementation 対応欠落、policy が required と判定する要件行の verification 対応欠落、verification policy の不正、sidecar / inline declaration の構文不正、同一論理関係の不整合な重複を検出対象として検査する（REQ-021-016）
- check の不合格が承認済み対象範囲内で修正可能な場合は、修正して再検証する
- 要件変更、対象範囲拡大、追加設計判断、外部依存解消が必要な場合は反復を停止し、blocked として必要な判断事項を報告する（REQ-021-017）。証拠源にかかわらず既存 scope を超える変更を自律拡大しない
- verification 対応は「何が要件を検証するか」という検証手段との恒常的な対応関係であり、「今回その検証を実行して合格したか」という実行結果は Issue, PR, QG 側で扱う。特定時点の検証結果を対応宣言として保存しない（REQ-021-019）
- 中断後の再実行では、sidecar と正規成果物に保存済みの対応関係を再利用し、同じ対応宣言を重複生成しない（REQ-021-020）
- agentdev-traceability の不在、実行失敗、空結果、候補過多だけを理由として workflow を停止しない（fail-open）。README 索引、正規成果物の直接読取、`rg` 等の独立探索手段で継続し、正規成果物そのものの異常とトレーサビリティ機能側の異常を区別する

## 配布物本体 ADF-COVERS 宣言の除去可否判定（cleanup 判定）

<!-- ADF-COVERS(implementation): REQ-021-030 -->
<!-- ADF-COVERS(design): REQ-021-030 -->
本節の coverage 突合の運用詳細（役割フィルタ、producer 側パス認定、sidecar と inline の同一扱い、除去後の後置検査）が REQ-021-030 を実装する。

case-run の実行担当（委譲内サブエージェント）が、実装作業で配布物本体に残存する ADF-COVERS 宣言の除去を扱う場合、配布物本体の ADF-COVERS 宣言は producer 側のトレーサビリティ metadata であり、対応関係の移行先（docs 配下の正規成果物の inline 宣言、または repository top-level の `traceability/` 配下の sidecar）が成立していることを条件に除去する。single workflow（STEP-S4 の委譲）に同じ条件を適用する。

- 除去可否判定の coverage 突合では、coverage 出力から implementation 役割かつ producer 側パス（docs/ 配下の正規成果物の inline 宣言、または repository top-level の `traceability/` 配下 sidecar の登録分）の対応関係を集約済み実装対応として認定する。coverage は sidecar と inline declaration を同じ論理的な対応関係として返すため、突合は対応関係の表現形式を区別せずに行う。役割フィルタの適用は必須であり、design 役割・verification 役割の対応関係は集約済み実装対応として扱わない
- 対象要件について implementation 役割かつ producer 側パスの対応が確認できない配布物本体の宣言は除去可と判定せず、対応関係の移行先（sidecar または producer 側正規成果物）を成立させた上で除去する
- 除去を実行した場合は、除去後に traceability check を実行し、implementation 対応の対応関係が維持されていること（新規 missing-implementation 0 件）を後置検査として確認する
- coverage は役割付き対応関係を全件返却するため、役割とパスの解釈は呼出側の責務で行う（agentdev-traceability の運用規約参照）

判定基準の中核は要件行が所有し、本節は coverage 突合の運用詳細のみを定めて重複定義しない。

## 参照する横断 Design

- [workflows/lifecycle-state-machine.md](../workflows/lifecycle-state-machine.md)（Pattern Taxonomy（manager-orchestrator）の後継）
- [workflows/delegation-contracts.md](../workflows/delegation-contracts.md)（controlled_case_execution 委譲）
- [workflows/capture-boundaries.md](../workflows/capture-boundaries.md)（intake / learning capture（PR 本文記録のみ））
- [workflows/lifecycle-state-machine.md](../workflows/lifecycle-state-machine.md)（子Issue 状態 enum〔durable state enum・階層合成〕。Epic Wave 実行モデルの運用契約は本 Design「v3 epic-wave-model Design からの吸収」節）
- [quality-gate-model.md](../quality/quality-gate-model.md)（QG-3（実行担当サブエージェント責務））

### case-run が使用する検査ツール

case-run が使用する検査ツール（[integrity-contracts.md](../integrity/integrity-contracts.md)「Workflow × 使用ツールマトリックス」参照）:

- cli.ts --workflow case-run（targeted docs guard）: PR 対象ファイルに docs/** 変更を含む場合、委譲前に実行（[docs/** 変更時の targeted docs guard（REQ-031-011）](#docs-変更時の-targeted-docs-guardREQ-031-011) 参照）
- 検証エンジン cli.ts（全量実行）: PR 対象ファイルに docs/** 変更を含む case では commit 前に full 実行し、検出違反の前段階差分（既出/新規）を分離して新規 0 件を確認する（baseline による既知違反の免除は REQ-010-074/079 で撤廃済み。差分分類は検証差分セクションの5分類に従う）「docs 変更を含む case での commit 前 full check_integrity 工程」参照）
- check_extensions.ts（IR-056）: `src/common/commands/agentdev/**/*.md`, `src/common/skills/agentdev-*/SKILL.md`, `src/common/skills/agentdev-*/references/**/*.md`, `.agentdev/extensions/**` のいずれかを変更した場合に実行
- test_strategy: Issue 完了条件検証（REQ-031-008/030）
- textlint 品質基盤（用途選択入口）: 文章品質検査の起動は、工程スクリプトが正規契約から用途（書込み前検査、通常最終検査、必須独立検査、結果表示）を決定的に選択して入口を起動し、完結した結果（用途、対象範囲、対象状態、完了状態、合否、実規則実行数と再利用数を含む）を受理して進行を判定する。LLM が毎回の検査範囲・目的・再利用可否を選択しない。同じ判定を各呼出元で再実装しない

case-run は 検証エンジン cli.ts（全量実行）を、docs 変更を含む case での commit 前検査として条件付きで使用する（base 既知違反と新規違反の分離、新規違反 0 件確認）。targeted docs guard（PR 単位の targeted 検査）は維持する。docs 変更を含まない case での全体監査は /repo/docs-check の責務である。

※上記は全て肯定表現である（REQ-010-002, REQ-010-003 準拠）。
