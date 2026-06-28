---
draft_type: req_draft
topic_slug: integrity-catalog-completeness
status: saved
created_at: 2026-06-28T12:00:00+09:00
saved_at: 2026-06-29T00:00:00+09:00
source_rus:
  - RU-0008
  - RU-0009
---

<!-- req_draft テンプレート
  このテンプレートは req-define が生成する構造化引き継ぎ成果物の原本である。
  後続工程（req-save/ spec-save/ case-open/ case-auto/ case-run/ case-close）が参照する
  原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
  soft contract（生成元側標準）であり、LLM 推論経由で消費される。
  厳格なスキーマバージョン、JSON Schema、バリデータは導入しない。 -->

# draft-data

```yaml
work_type: docs_chore

spec_artifact_actions_consumed: true
spec_saved_specs:
  - docs/specs/integrity/integrity-rule-catalog.md
  - docs/specs/integrity/rules/IR-036-adr-work-means-detection.md

summary: |
  integrity-rule-catalog.md の完全性を向上する。document-type-responsibilities.md 訳語表に掲載される散文英語普通名詞（finding, promoted artifact 等）について候補語網羅検証を実施し、検出対象外とする語には対照表へ根拠を明記する（RU-0008）。IR-036（承認済み ADR への作業手段混入検出）の baseline_status を、既存実装（check_integrity.ts checkAcceptedAdrOnlyCitation）に合致する実装済み状態へ更新する（RU-0009）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      integrity-rule-catalog.md（またはカタログが参照する vocabulary-registry.md）の候補語定義は、document-type-responsibilities.md 訳語表に掲載される全散文英語普通名詞を網羅する。検出対象を限定する場合、訳語表の他の普通名詞（finding, promoted artifact 等）を対象外とする根拠を対照表に明記する。候補語の限定は PR #1177 の 4 種（baseline, provider, variant, fixture）の妥当性を訳語表全体で検証した結果に基づく。
  - id: AG-002
    content: |
      IR-036（承認済み ADR への作業手段混入検出）は、既存実装（check_integrity.ts の checkAcceptedAdrOnlyCitation）の実情に合致する baseline_status でカタログ登録される。baseline_status は未実装を示す値（new）を含まない。

artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/integrity/integrity-rule-catalog.md
    target_area: docs-check 項目役割範囲（REQ-0145-004）配下、候補語対照表参照セクション
    source_items: [AG-001]
    content: |
      integrity-rule-catalog.md に候補語網羅性の規定を設ける。document-type-responsibilities.md 訳語表の散文英語普通名詞（finding, promoted artifact, drift, regression, gate, severity, category, schema, observation 等）を網羅検証し、各語を検出対象（IR-044 drift 検出候補）または正規使用（対象外）のいずれかに分類する。候補語対照表は vocabulary-registry.md（repo-agentdev-integrity references）と連携して最新状態を保ち、対象外とする語には IR-044 適用除外の根拠を併記する。
  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: docs/specs/integrity/rules/IR-036-adr-work-means-detection.md
    target_area: baseline_status フィールド
    source_items: [AG-002]
    content: |
      IR-036 rule file の baseline_status を new から既存実装（checkAcceptedAdrOnlyCitation）の実情に合致する実装済み状態へ更新する。last_verified フィールドを更新日時に合わせて更新する。検出能力（frontmatter status ベースの ADR フィルタリング）は既存実装に存在するため、実装修復は不要でありカタログメタデータの整合のみを行う。

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0008
    target_spec: docs/specs/integrity/integrity-rule-catalog.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0009
    target_spec: docs/specs/integrity/rules/IR-036-adr-work-means-detection.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      document-type-responsibilities.md 訳語表から散文英語普通名詞を抽出し、integrity-rule-catalog.md（または参照先 vocabulary-registry.md）の候補語対照表と照合する。各普通名詞が検出対象または正規使用（対象外）のいずれかに分類されていることを確認する。
    pass_criteria: |
      訳語表に掲載される全散文英語普通名詞が候補語対照表で網羅されていること。対象外とする語には IR-044 適用除外の根拠が明記されていること。
    on_failure: |
      fix-and-reverify。不足候補語を対照表へ追加し、対象外根拠を明記して再照合する。網羅性は機械的照合で検証可能なため、再検証で完結する。
  - id: TS-002
    target_item: AG-002
    verification: |
      IR-036 rule file（docs/specs/integrity/rules/IR-036-adr-work-means-detection.md）の baseline_status を確認し、check_integrity.ts の checkAcceptedAdrOnlyCitation 実装状態と照合する。baseline_status が new 以外の実装済み状態であることを検証する。
    pass_criteria: |
      baseline_status が new 以外の実装済み状態であること。last_verified が本件の更新日時であること。
    on_failure: |
      fix-and-reverify。baseline_status を実装修復ではなく既存実装に合致する値へ修正し、last_verified を更新日時に合わせて再確認する。

case_open_hints:
  epic_needed: false
```

# summary

RU-0008（候補語網羅検証）と RU-0009（IR-036 カタログ登録）を「integrity-rule-catalog 完全性向上」で統合した。両 RU とも backlog-review で原因・修正方針が確定済みであり、推定事項なし。

work_type は両 RU の明示指定に従い docs_chore とする。REQ-0145（docs-check/integrity 検出設計改善）が catalog 設計を広く扱うが、本件は catalog の内容完全性（候補語網羅、IR-036 メタデータ整合）に限定され、REQ-0145 の既存要件行（設計改善）とは関心が異なる。docs_chore は REQ ファイルを作成しないため、本 draft は SPEC 操作のみを含む。

IR-036 は catalog インデックスに既に掲載済み（行 91）、rule file も存在するが baseline_status: new となっている。実装（checkAcceptedAdrOnlyCitation）は既存のため、本件は baseline_status の整合のみで完結する。
