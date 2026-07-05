---
draft_type: req_draft
topic_slug: distribution-boundary-ir059-strict
status: saved
created_at: 2026-07-05T12:00:00+09:00
saved_at: 2026-07-05T14:35:00+09:00
source_rus:
  - RU-0019
  - RU-0021
agentdev_handoff: true
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  配布物参照境界の検知パターン（具体ID/具体パス/固定URL）とexemption条件をSPEC docs/specs/foundations/project-extensions.md へ新規セクションとして定義し、配布物参照境界検出をIR-059としてintegrity-rule-catalogへ登録する。配布物本文の具体ID参照厳格禁止方針（ADR-0135/REQ-0160）を維持し、既存303件違反をgeneric表記へ一括是正する。traceabilityはextension経由で担保する。inspect-extensions commandがextension未所持でも正常動作する旨をSPECへ明記する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      配布物参照境界の検知パターンをSPEC docs/specs/foundations/project-extensions.md に定義する。検知対象は以下3種とする。
      具体ID: ADR-NNNN, REQ-NNNN の4桁数字パターン、および REQ-NNNN-NNN のサブ要件番号パターン。文書種別名としての ADR/REQ/SPEC は対象外。
      具体パス: docs/(adr|requirements|specs)/<file>.md。README.md は索引として許容、テンプレート表記 {} <> * は許容。
      固定URL: github.com/<owner>/<repo>/(blob|raw)/, raw.githubusercontent.com/<owner>/<repo>/。
      exemption条件: テンプレートプレースホルダー（{NNNN}, <NNNN>, <existing-spec>, <domain>, <command>, <spec>, <rule>）を行内に含む場合は具体ID/具体パス検査をスキップする。

  - id: AG-002
    content: |
      配布物参照境界検出を新規IR-059（distribution-reference-boundary）として docs/specs/integrity/integrity-rule-catalog.md のルールインデックスへ登録する。IR-059はIR-056（project-extensions-integrity）とは独立した検出対象とし、severity: strict, gate_level: full-audit とする。IR-059の15フィールド詳細は docs/specs/integrity/rules/IR-059-distribution-reference-boundary.md に配置する。

  - id: AG-003
    content: |
      配布物本文の具体ID参照厳格禁止方針（ADR-0135, REQ-0160既存要件）を維持する。既存303件違反（concrete_id 301件、concrete_path 2件、56ファイル）をgeneric表記へ一括是正する。サブ要件番号 REQ-NNNN-NNN 形式も禁止対象に含む。是正後のtraceabilityは各プロジェクトのextension経由で担保する。extension がプロジェクト固有のREQ/ADR/SPEC参照を許可する仕組みにより、配布物本文はプロジェクト非依存を保つ。

  - id: AG-004
    content: |
      /agentdev/inspect-extensions command は対応extension未所持でも標準動作で正常動作することを SPEC docs/specs/foundations/project-extensions.md の実行時読み込み契約セクションに明記する。extension未所持は異常ではなく、command が project 非依存で動作する正当な状態である。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-0160.md
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      REQ-0160の更新内容（既存セクションへ追記・補強）:

      ### 検査・診断（AgentDevFlow 標準）セクションへ追記:
      - 配布物参照境界の検知パターン（具体ID、具体パス、固定URL）とexemption条件を SPEC docs/specs/foundations/project-extensions.md に定義する。検知対象、exemption条件の詳細は当該SPECを正とする。
      - 配布物参照境界検出を IR-059（distribution-reference-boundary）として integrity-rule-catalog に登録する。IR-059はIR-056（project-extensions-integrity）とは独立した検出対象とする。
      - 配布物本文に具体参照を検出した場合、generic表記への是正を原則とする。traceabilityはextension経由で担保する。

      ### 実行時読み込み契約セクションへ追記:
      - 対応extensionが存在しないcommand/skillは正常動作であり、異常状態ではない。command が project 非依存で単体動作する正当な状態である。

      ### command/skill 本文の参照禁止セクションの既存要件行を補強:
      - 禁止対象の具体IDには ADR-NNNN, REQ-NNNN の4桁root ID に加え、REQ-NNNN-NNN のサブ要件番号形式も含む。

  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: foundations
      slug: project-extensions
    target_area: "配布物参照境界の検知パターン（新規セクション）"
    source_items: [AG-001]
    content: |
      docs/specs/foundations/project-extensions.md に「配布物参照境界の検知パターン」新規セクションを追加する。

      ## 配布物参照境界の検知パターン

      ### 検知対象

      具体ID: ADR-NNNN, REQ-NNNN (4桁数字), REQ-NNNN-NNN (サブ要件番号)。文書種別名としての ADR/REQ/SPEC は対象外。
      具体パス: docs/(adr|requirements|specs)/<file>.md。README.md は索引として許容。テンプレート表記 {}, <>, * は許容。
      固定URL: github.com/<owner>/<repo>/(blob|raw)/, raw.githubusercontent.com/<owner>/<repo>/。

      ### exemption条件

      テンプレートプレースホルダー（{NNNN}, <NNNN>, <existing-spec>, <domain>, <command>, <spec>, <rule>）を行内に含む場合は具体ID/具体パス検査をスキップする。

      ### 是正方針

      配布物本文に具体参照を検出した場合、generic表記（文書種別名や抽象的参照）への是正を原則とする。是正後のtraceabilityはextension経由で担保する。

  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: foundations
      slug: project-extensions
    target_area: "実行時読み込み契約（既存セクション拡充）"
    source_items: [AG-004]
    content: |
      docs/specs/foundations/project-extensions.md の「実行時読み込み契約」セクションに以下を追記する。

      対応extensionが存在しないcommand/skillは正常動作であり、異常状態ではない。command が project 非依存で単体動作する正当な状態である。例として /agentdev/inspect-extensions は SPEC 直接参照を持たず project 非依存で動作するため extension 不要である。

  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: integrity-rule-catalog
    target_area: "ルールインデックス（IR-059追加）"
    source_items: [AG-002]
    content: |
      docs/specs/integrity/integrity-rule-catalog.md のルールインデックスに IR-059 を追加する。

      - IR-059: distribution-reference-boundary（配布物参照境界検出）

      IR-059 個別ルールファイル docs/specs/integrity/rules/IR-059-distribution-reference-boundary.md の主要フィールド:
      rule_id: IR-059
      description: 配布command/skill本文の具体ID/具体パス/固定URL検出
      severity: strict
      category: canonical-conflict
      detection_method: 正規表現パターンマッチ（具体ID/具体パス/固定URL + exemption条件判定）
      affected_artifacts: src/opencode/commands/**, src/opencode/skills/**
      related_req: REQ-0160
      related_spec: docs/specs/foundations/project-extensions.md
      gate_level: full-audit
      false_positive_risk: テンプレートプレースホルダー誤検知。exemption条件で抑制。
      regression_test: (未実装)
      baseline_status: new
      finding_route: intake
      triage_action: generic表記への是正を推奨。traceabilityはextension経由で再設定。
      last_verified: (新規作成日)

conflict_resolutions:
  - id: CR-001
    conflict: SPEC project-extensions.md は具体ID記述を厳格に禁止するが、実運用では REQ-NNNN-NNN サブ要件番号引用が303件（56ファイル）定着。SPEC厳格解釈と実態が乖離している。
    resolution: ADR-0135/REQ-0160 の厳格禁止方針を維持する。303件をgeneric表記へ一括是正し、traceabilityはextension経由で担保する。SPEC緩和（サブ要件番号許容）や許容リスト方式は採用しない。根拠は配布物本文のプロジェクト非依存性がADR-0135の中核であり、サブ要件番号許容は consumer プロジェクトで解決不能な参照を残すため。

  - id: CR-002
    conflict: 配布物参照境界検出を新規IR-059とするか、既存IR-056を拡張するか。
    resolution: 新規IR-059として独立定義する。IR-056はextensions構造検査が対象であり、配布物本文の具体参照検出とは対象領域が異なるため。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0019
    target_req: REQ-0160
    target_spec: docs/specs/foundations/project-extensions.md, docs/specs/integrity/integrity-rule-catalog.md
    operation: update
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs:
        - REQ-0160
      saved_spec_docs:
        - docs/specs/foundations/project-extensions.md
        - docs/specs/integrity/integrity-rule-catalog.md
        - docs/specs/integrity/rules/IR-059-distribution-reference-boundary.md
      artifact_action_mapping:
        ACT-REQ-001: REQ-0160 (UPDATE: 検査・診断セクションへ3行追記、実行時読込契約へ1行追記、参照禁止セクション補強)
        ACT-SPEC-001: project-extensions.md (新規セクション「配布物参照境界の検知パターン」追加)
        ACT-SPEC-002: project-extensions.md (実行時読込契約セクション拡充)
        ACT-SPEC-003: integrity-rule-catalog.md (IR-059エントリ追加) + IR-059 rule file 新規作成

  - id: OU-002
    source_ru: RU-0021
    target_req: REQ-0160
    target_spec: docs/specs/foundations/project-extensions.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result:
      saved_req_docs:
        - REQ-0160
      saved_spec_docs:
        - docs/specs/foundations/project-extensions.md
      note: OU-001 に統合済み（ACT-SPEC-002 実行時読込契約拡充が該当）。REQ-0160 の実行時読込契約セクションへ extension 未所持正常動作の要件行を追記

  - ou_id: OU-003
    source_ru: RU-0019
    target_req: REQ-0160
    operation: update
    scale: large
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: single
    result: {}
    note: 303件違反一括是正作業（反映作業）。検知パターンSPEC定義（OU-001）完了後に実施。generic表記への機械的置換を前提とする。check_distribution_boundary.ts で0件となることを完了条件とする。req-save/spec-save 対象外（case-open/case-run 工程）。

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs/specs/foundations/project-extensions.md に「配布物参照境界の検知パターン」セクションが存在し、具体ID/具体パス/固定URLの3検知対象とexemption条件が記述されていることを確認する。
    pass_criteria: |
      検知パターンセクションが3検知対象（具体ID、具体パス、固定URL）のパターン定義とexemption条件（テンプレートプレースホルダー）を含むこと。
    on_failure: |
      fix-and-reverify。SPECセクションの記述を修正して再確認する。

  - id: TS-002
    target_item: AG-002
    verification: |
      docs/specs/integrity/integrity-rule-catalog.md のルールインデックスに IR-059 エントリが存在し、docs/specs/integrity/rules/IR-059-distribution-reference-boundary.md が15フィールド以上を含むことを確認する。
    pass_criteria: |
      IR-059 がカタログインデックスに登録済み、個別ルールファイルが15フィールド以上を含む、severity: strict, gate_level: full-audit であること。
    on_failure: |
      fix-and-reverify。IR-059エントリ・フィールドを修正して再確認する。

  - id: TS-003
    target_item: AG-003
    verification: |
      check_distribution_boundary.ts を worktree root で実行し、配布物本文（src/opencode/commands/**, src/opencode/skills/**）の具体参照検出結果が0件であることを確認する。
    pass_criteria: |
      concrete_id, concrete_path, fixed_url のいずれも0件であること。
    on_failure: |
      fix-and-reverify。残存違反をgeneric表記へ修正して再実行する。

  - id: TS-004
    target_item: AG-004
    verification: |
      docs/specs/foundations/project-extensions.md の「実行時読み込み契約」セクションに、extension未所持commandの正常動作記述が存在することを確認する。
    pass_criteria: |
      extension未所持が正常状態である旨の記述が存在すること。
    on_failure: |
      fix-and-reverify。SPEC記述を修正して再確認する。

case_open_hints:
  epic_needed: true
  decomposition: |
    OU-001（SPEC定義+IR-059登録）とOU-003（303件是正作業）は順序依存があるためWave分割を推奨する。
    Wave 1: OU-001 + OU-002（SPEC定義、IR-059登録、extension未所持明記）
    Wave 2: OU-003（303件違反一括是正、機械的置換スクリプト使用）
  wave_hints:
    - "Wave 1: SPEC/IR定義（OU-001, OU-002）。依存関係なし、並列可能。"
    - "Wave 2: 303件是正（OU-003）。Wave 1完了後、generic表記への機械置換。"
```

# summary

配布物参照境界の検知パターン・exemptionをSPECに新規定義し、IR-059として独立登録する。既存303件違反は厳格方針（ADR-0135維持）に従いgeneric表記へ一括是正し、traceabilityはextension経由で担保する。inspect-extensionsのextension未所持正常性もSPECへ明記する。

ドラフトは大規模（scale: large）。OU-001（SPEC/IR定義）→OU-003（303件是正）の順序依存があるため、case-open時にEpic/Wave構成を推奨する。
