---
draft_type: req_draft
topic_slug: declaration-marker-prose-false-positive
status: saved
design_actions_consumed: true
created_at: 2026-09-11
source_rus: [RU-0005]
---

# draft-data

```yaml
# adversarial-review (STEP-8): skipped — 対象外判定導入は RU 承認済み方向（要件化の方向 1）の契約化であり、正規位置での形式不備検出維持（検出縮退禁止）を TS-001 に確定済み。Decision 判断対象なし、req-define が新たに導入した意味的決定なし
# work_type: traceability 解析コア（実装）の対象外判定導入と docs 表記置換を伴う既存挙動の改善
work_type: maintenance

# scale: feature のみ判定対象。maintenance のため未設定
scale: null

summary: 宣言パーサの文字列一致が本文中の ADF-COVERS マーカー形状言及と正規宣言を区別できない根因に対し、① agentdev-traceability 解析コア契約内で説明文コンテキストの対象外判定を確定・導入し、② 実行記録・docs 本文で宣言形状を例示しない規則を運用手順へ明文化し、③ agentdev-doc-diagnostics.md:104 と case-close.md:243-244 の残存括弧付き表記を宣言と解釈されない形式へ置換する。3側面（検査器改善・運用規則・残存是正）を同一要件単位とする。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      宣言パーサ（agentdev-traceability の解析コア）に説明文コンテキストの対象外判定を
      導入する。宣言形状（`<!-- ADF-COVERS(...) -->` 等）が本文 prose（説明文・実行記録）に
      出現しても、HTML コメント形式の正規宣言位置以外の文字列一致では
      malformed-declaration と解釈しない。対象外判定の契約は agentdev-traceability Design の
      解析コア契約として確定する。背景: #13（PR #2750）で実行記録本文の形状説明が
      malformed-declaration と誤解釈された実績、Epic 2755 の case-run / case-close で
      docs/designs/skills/agentdev-doc-diagnostics.md:104 の prose 行が誤判定された
      baseline 既知事象。
  - id: AG-002
    content: |
      実行記録・docs 本文では宣言マーカー形状を例示しない規則を運用手順へ明文化する。
      形状の言及が必要な文脈では、解析で宣言と解釈されない表現（パターン名や一般語での記述）を
      使う。正規宣言の削除はしない。
  - id: AG-003
    content: |
      docs/designs/skills/agentdev-doc-diagnostics.md:104 と docs/designs/commands/case-close.md
      243-244 に現存する本文中の括弧付き宣言表記を、宣言と解釈されない形式へ置換する
      （base 由来 pre-existing 2 箇所）。

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-traceability.md
    target_design:
      operation: update
      domain: skills
      slug: agentdev-traceability
    target_area: 宣言解析（パーサ）の判定規則を規定するセクション（解析コア契約節）
    source_items: [AG-001]
    content: |
      宣言解析の対象外判定を次のとおり契約化する。
      - 正規宣言は許可された位置（HTML コメント形式の宣言行、frontmatter 等の許可位置）のみで
        解析対象とする
      - 本文 prose（見出し・段落・箇条書き等の本文テキスト）内の宣言マーカー形状の言及は、
        正規宣言位置の文字列一致対象から除外する（説明文コンテキスト対象外判定）
      - 除外判定は真の malformed 宣言（正規位置にあるが形式不備の宣言）の検出を縮退させない。
        正規位置での形式不備は引き続き malformed-declaration として検出する
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-traceability.md
    target_design:
      operation: update
      domain: skills
      slug: agentdev-traceability
    target_area: 運用手順・docs 記述規則に関するセクション（宣言の記述運用を扱う節）
    source_items: [AG-002]
    content: |
      実行記録・docs 本文では ADF-COVERS 宣言マーカー形状を例示しない。
      形状の言及が必要な文脈では、解析で宣言と解釈されない一般化表現
      （パターン名・契約名での記述）を使う。この規則は表現回避の運用規則であり、
      正規宣言の削除・変更を要求しない。

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0005
    target_req: null
    target_design: docs/designs/skills/agentdev-traceability.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      対象外判定導入後、traceability 検査を実行し、
      (1) 本文中に宣言形状言及を含む文書（docs/designs/skills/agentdev-doc-diagnostics.md 等）が
      malformed-declaration として検出されないこと、
      (2) 正規位置にある真の malformed 宣言は引き続き検出されること（検出縮退がないこと）を
      テストまたは突合で確認する。
    pass_criteria: |
      prose 形状言及の malformed-declaration 誤検出が 0 件。
      正規位置の形式不備宣言の検出（true positive）が維持されている。
    on_failure: |
      fix-and-reverify。対象外判定の条件（正規位置の定義）を見直し、誤検出と検出縮退の
      両方を解消して再検証する。どちらか一方だけの解消で合格としない。
  - id: TS-002
    target_item: AG-002
    verification: |
      運用規則の明文化後、agentdev-traceability.md に形状例示禁止と一般化表現の使用規則が
      記載されていることを確認する。正規宣言の削除を要求する記述が含まれていないことを突合する。
    pass_criteria: |
      禁止規則と一般化表現の規定が存在し、正規宣言削除の要求がない。
    on_failure: |
      fix-and-reverify。記述を修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      2 箇所の置換後、traceability 検査を実行し agentdev-doc-diagnostics.md と case-close.md が
      malformed-declaration として検出されないことを確認する。baseline 登録済みの該当違反
      （base 由来 pre-existing）について baseline エントリが解消とセットで除去されていることを突合する。
    pass_criteria: |
      2 文書の malformed-declaration 検出が 0 件。baseline の該当エントリが除去済み。
    on_failure: |
      fix-and-reverify。置換漏れまたは baseline 除去漏れを修正して再検証する。

realization_actions:
  - id: RA-001
    concern: 宣言パーサ（traceability 解析コア）への説明文コンテキスト対象外判定の実装
    responsibility: |
      トレーサビリティ宣言解析の正規所有責務は REQ-012（成果物トレーサビリティ）・
      REQ-021（トレーサビリティのワークフロー統合）が所有し、実装は agentdev-traceability
      スキル配下の解析コア（.opencode/skills/agentdev-traceability/ と配布ソース
      src/opencode/skills/agentdev-traceability/）が担う。契約の正は
      docs/designs/skills/agentdev-traceability.md と docs/designs/foundations/traceability-model.md。
    ownership_hints:
      - src/opencode/skills/agentdev-traceability/（配布ソース）
      - .opencode/skills/agentdev-traceability/（自己ホスト投影）
      - docs/designs/skills/agentdev-traceability.md
    intent: |
      宣言 parser の文字列一致が本文 prose と正規宣言を区別できない根因を検査器側で解消し、
      誤検出ノイズを低減して真の malformed の視認性を回復する。
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-002
    concern: docs 本文 2 箇所の括弧付き宣言表記の置換
    responsibility: |
      docs 本文の表記運用は docs-check 系検査（traceability 検査）の対象文書群として
      REQ-010（自己監査コマンド）・REQ-012 系の検査契約で管理される。
      agentdev-doc-diagnostics.md は agentdev-doc-diagnostics skill Design、case-close.md は
      case-close command Design が正規所有する。
    ownership_hints:
      - docs/designs/skills/agentdev-doc-diagnostics.md L104
      - docs/designs/commands/case-close.md L243-244
      - traceability malformed-prose-adf-covers-detection（intake promoted 成果物、baseline 既知）
    intent: |
      運用側の表現回避で残存する base 由来 pre-existing 2 箇所を是正し、
      検査ノイズの現存源を除去する。
    verification_refs: [TS-003]
    source_items: [AG-003]

review_dispositions:
  - id: RD-001
    source_ru: RU-0005
    source_item: requirements-direction-2
    disposition: covered
    reason_code: scope_confirmed
    reason: |
      運用手順への明文化（要件化の方向 2）は ACT-DESIGN-002 として確定。
      「正規宣言の削除はしない」制約を AG-002 / ACT-DESIGN-002 content に明記済み。
    evidence:
      path: null
      section: null
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints:
    - RU-0003 / RU-0004 / RU-0006 / RU-0008 の draft が case-close.md を含む同一 Design ファイル群を更新する。case-open の Wave 構成で同時実行を避けるか、同一 Wave 内での競合解消を考慮すること
```

# summary

RU-0005（宣言マーカーの prose 誤検出低減）を maintenance として要件化した。traceability 解析コアへの説明文コンテキスト対象外判定導入（検査器改善）、形状例示禁止の運用規則明文化、残存 2 箇所の表記置換（検査ノイズ現存源の除去）の 3 側面で構成する。真の malformed の検出縮退を防ぐ検証条件を TS-001 に持つ。
