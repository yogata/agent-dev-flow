# proxy-case-open: Definition PR 本文候補（gh exit 66 blocked 時の resume payload）

> 本ファイルは case-open STEP-4 の Definition PR 作成が agentdev_gh 起動環境障害（gh exit 66）で blocked となった際の resume payload である。
> resume 時は `#{N}` を作成済み Root Case 番号へ置換し、本本文を Custom Tool `agentdev_gh` pr_create の body 引数としてそのまま渡す（verbatim）。
> head branch は definition/issue-{N}（definition/issue-pending から rename 済みのローカル branch、push 前提）。

## 概要
<!-- 【必須】 -->

Root Case #{N}（REQ-097 third-party 成果物の運用前提と導入検知）の Definition PR。req-define で合意済みの draft-data（`.agentdev/drafts/req-draft-third-party-presupposition.md`）の artifact_actions（ACT-REQ-001、ACT-DESIGN-001）を canonical Definition へ適用する。

## 実行識別情報
<!-- 【必須】 -->

- adf_case: #{N}
- adf_execution_unit: N/A（実行構成未確定。case-ready が execution contract 確定後に確定する）
- adf_delegation: N/A（case-open STEP-4 直実行）
- adf_harness_ref: N/A

## Definition 変更内容
<!-- 【必須】 -->

- 変更対象: REQ-097 新規作成（REQ-097-001〜004。`docs/requirements/REQ-097.md`。採番は alloc-req-number.ts による決定的採番 REQ-097 を確認済み）、`docs/designs/local/third-party-skill-management.md` へ新規4節追加（target_area「## third-party 成果物の包括定義」、placement before_anchor、anchor「## Design で確定する実装判断」。既存節は全て不変）+ REQ 行変更に伴う ADF-COVERS(design) 宣言追随
- 再合意内容の要約: third-party 成果物（Skill 形式・package 形式）の包括定義と導入済み前提契約（導入系3経路 drift 検知、cli.ts 一括実行面、宣言解決2候補化）。Decision 追加なし（DEC-023/047/021 枠内）
- 実変更判定: 実変更あり（canonical Definition に REQ-097 は存在しない新規 REQ。対象 Design に当該4節は存在しない）

## トレーサビリティポリシー追随
<!-- 【必須】 -->

- 判断: 追随不要。新規要件行 REQ-097-001〜004 は verification スコープ既定（required）に従い、optional 明示登録（`traceability/policy.yaml`）を要しない（draft-data test_strategy TS-001〜TS-010 が全 agreed 項目を検証投影済み）

## 検証結果（branch HEAD 実測）
<!-- 【必須】 -->

- 索引再生成: `generate_indexes.ts` 実行済み（--root .）。派生物 `docs/README.md`、`docs/requirements/README.md`、`docs/designs/quality/req-health-metrics.md` を同一 PR に含める（`docs/decisions/README.md` は Decision 変更なしのため変化なし）
- check_integrity: NG 3件はすべて本変更未接触ファイルの既存指摘（phantom REQ-003-055: `docs/designs/foundations/v4-responsibility-boundaries.md`:44/:67、`docs/requirements/REQ-003.md`:56。route intake・本 PR 対象外）。本変更誘発分（req-range-staleness）は docs/README.md 散言行 58→59 件更新で解消済み
- check_autogen_freshness: 鮮度違反 0 件
- traceability check --req REQ-097-001,REQ-097-002,REQ-097-003,REQ-097-004: missing-design 0 件（PASS）を確認。missing-implementation / missing-verification は新規行の case-run 前の期待状態（実装・検証対応は case-run が作成。最終完全性は case-close QG-4）
- coverage --req REQ-097-001,REQ-097-002,REQ-097-003,REQ-097-004: design 4件を実測（`docs/designs/local/third-party-skill-management.md` ADF-COVERS(design) 宣言行）

## Findings / Capture候補
<!-- 【必須】 -->

### intake

該当なし

### learning

該当なし（agentdev_gh gh exit 66 blocked の学びは case-open STEP-6 learning capture で記録済み）
