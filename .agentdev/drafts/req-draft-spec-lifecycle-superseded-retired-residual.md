---
draft_type: req_draft
topic_slug: spec-lifecycle-superseded-retired-residual
status: saved
created_at: 2026-07-05T12:30:00+09:00
saved_at: 2026-07-05T19:45:00+09:00
source_rus:
  - RU-0020
  - RU-0024
agentdev_handoff: true
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: |
  SPEC ライフサイクルに superseded 状態遷移を標準化し、superseded_by frontmatter 運用を formal に定義する（RU-0020）。あわせて inspect-skills/inspect-docs に「廃止 REQ/SPEC 由来の記述残置」検出カテゴリを追加し、retired REQ/SPEC ID をソースとした横断検索設計を定義する。req-save/spec-save の廃止手順に下流 SKILL/command/guide 横断クリーンアップステップの追加候補を整備する（RU-0024）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  confirmed_user_decisions:
    - id: UQ-001
      question: superseded SPEC の標準扱い（(a) 元位置残置+superseded_by frontmatter / (b) docs/specs/retired/ 新設移動 / (c) 完全削除）
      decision: (a) 元位置残置 + superseded_by frontmatter
      rationale: 履歴追跡価値を残す判断がRUに明記されており、完全削除・retired移動より整合する。
    - id: UQ-002
      question: docs/specs/retired/ ディレクトリ新設有無
      decision: 新設しない
      rationale: superseded SPEC は retired と同一視しない。RU-0024 も supersede 元への言及は文脈により有効と区別している。
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      SPEC ライフサイクルに superseded 状態遷移を標準化する。現在の document-model.md SPEC ライフサイクル定義（ADR-0123 status: draft/accepted のみ）を拡張し、superseded 状態を追加する。superseded SPEC は後継 SPEC への移行表示を frontmatter superseded_by で保持する。

  - id: AG-002
    content: |
      superseded SPEC を docs-check/inspect-docs の検査対象外とする判定基準を定義する。判定は frontmatter superseded_by フィールドの存在で機械判定する。検査対象外の範囲、詳細条件は SPEC document-model.md に配置する。

  - id: AG-003
    content: |
      inspect-skills/inspect-docs の検出観点に「廃止 REQ/SPEC 由来の記述残置」カテゴリを追加する。retired/ 化された REQ/SPEC ID をソースとして、SKILL/command/guide/docs 本文の横断検索により検出する。活性 REQ/SPEC への言及は検出対象外とする。supersede（後継移行）元への言及は文脈により有効な場合があるため、finding（要確認）扱いとする。

  - id: AG-004
    content: |
      「廃止 REQ/SPEC 由来記述残置」検出ルールを新規 IR として integrity-rule-catalog.md の候補エントリに登録する。新規 IR の ID 採番、15フィールド詳細は REQ-0145-005 の新規IR追加フロー（6ステップ）に従う。実装（check_integrity.ts 等の検出ロジック）は本ドラフトの対象外とし、設計とカタログ候補エントリ整備を対象とする。

  - id: AG-005
    content: |
      req-save/spec-save の廃止手順に、下流 SKILL/command/guide 記述の横断クリーンアップステップの追加候補を記録する。既存フローを破壊しない追加ステップとする。追加候補の詳細手順は各 command reference に配置する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-0101.md
    source_items: [AG-001, AG-002]
    content: |
      REQ-0101 へ SPEC lifecycle superseded 状態標準化の要件行を追加する。

      ### 追加要件行（要件テーブルへ）:
      - SPEC ライフサイクルは active に加え superseded 状態を持ち、後継 SPEC への移行表示を frontmatter superseded_by で保持すること
      - superseded 宣言された SPEC は docs-check/inspect-docs の検査対象外とし、判定は frontmatter superseded_by フィールドの存在で機械判定すること

      ### 適用範囲へ追記:
      - SPEC ライフサイクル superseded 状態、superseded_by frontmatter 運用、検査対象外判定基準

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-0124.md
    source_items: [AG-003]
    content: |
      REQ-0124 の inspect-* 検出コマンド群要件へ、「廃止 REQ/SPEC 由来の記述残置」検出カテゴリ追加の要件行を追加する。

      ### 追加要件行:
      - inspect-docs/inspect-skills の検出観点に「廃止 REQ/SPEC 由来の記述残置」カテゴリを含めること。retired REQ/SPEC ID をソースとした横断検索により検出し、活性 REQ/SPEC への言及は対象外とすること

      ### 適用範囲へ追記:
      - 廃止 REQ/SPEC 由来記述残置検出カテゴリ

  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-0125.md
    source_items: [AG-003]
    content: |
      REQ-0125 の inspect-skills 診断観点へ、「廃止 REQ/SPEC 由来の SKILL/command 記述残置」検出を追加する。

      ### REQ-0125-003（診断観点）への追記:
      診断観点に「廃止 REQ/SPEC 由来の SKILL/command 記述残置」を含めること。retired REQ/SPEC ID をソースとした横断検索により検出し、活性 REQ/SPEC への言及は対象外とする。判定基準の詳細は agentdev-inspect-skills skill に集約する（REQ-0125-004 準拠）。

  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: foundations
      slug: document-model
    target_area: "SPEC ライフサイクル（既存セクション拡張）"
    source_items: [AG-001, AG-002]
    content: |
      docs/specs/foundations/document-model.md の SPEC ライフサイクルセクション（line 169-182）を拡張し、superseded 状態を追加する。

      ### SPEC ライフサイクル拡張（ADR-0123 既存定義への追記）:

      | status | 意味 | 検査対象 | 遷移契機 |
      |---|---|---|---|
      | draft | spec-save で保存された直後の未確定状態 | IR-044 等の対象外 | spec-save が新規作成時に付与 |
      | accepted | case-close で SPEC 確定チェック通過済み | すべての整合性ルールの検査対象 | case-close Step 3 |
      | superseded | 後継 SPEC へ移行済み。frontmatter superseded_by で後継を明示 | docs-check/inspect-docs 検査対象外（superseded_by 存在で機械判定） | req-save/spec-save で後継SPEC作成時に付与 |

      ### ライフサイクル規則テーブル（line 289-294）の SPEC 行を更新:
      SPEC: active → superseded（後継SPECへの移行表示）。superseded_by frontmatter で後継を明示。

      標準扱い（UQ-001/UQ-002 確定済み）: superseded SPEC は元位置に残置し superseded_by frontmatter で後継を明示。docs/specs/retired/ は新設しない。

  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: integrity-rule-catalog
    target_area: "ルールインデックス（新規IR候補エントリ追加）"
    source_items: [AG-004]
    content: |
      docs/specs/integrity/integrity-rule-catalog.md に「廃止 REQ/SPEC 由来記述残置」検出の新規IR候補エントリを追加する。

      ### 新規IR候補（ID採番は REQ-0145-005 フローで確定）:
      - description: 廃止REQ/SPEC由来のSKILL/command/guide/docs本文記述残置検出
      - severity: warning（finding扱い、即時是正不要）
      - category: retired-reference-residual
      - detection_method: retired REQ/SPEC ID リストをソースとした本文横断検索。活性 REQ/SPEC への言及は対象外。supersede元への言及は文脈判定で finding 扱い
      - affected_artifacts: src/opencode/commands/**, src/opencode/skills/**, docs/guides/**
      - related_req: REQ-0124, REQ-0125
      - gate_level: full-audit
      - false_positive_risk: supersede 元への妥当な文脈参照。finding 扱いで人間確認を挟む
      - baseline_status: candidate

  - id: ACT-CMD-001
    artifact: command
    operation: update
    target: src/opencode/commands/agentdev/req-save.md
    source_items: [AG-005]
    content: |
      src/opencode/commands/agentdev/req-save.md の廃止関連ステップに、下流 SKILL/command/guide 記述の横断クリーンアップステップの追加候補を記録する。追加候補の詳細手順は別途 case-run で確定する。

  - id: ACT-CMD-002
    artifact: command
    operation: update
    target: src/opencode/commands/agentdev/spec-save.md
    source_items: [AG-005]
    content: |
      src/opencode/commands/agentdev/spec-save.md の廃止関連ステップに、下流 SKILL/command/guide 記述の横断クリーンアップステップの追加候補を記録する。追加候補の詳細手順は別途 case-run で確定する。

conflict_resolutions:
  - id: CR-001
    conflict: document-model.md line 291 は「SPEC は廃止状態を持たない」と宣言するが、実運用で superseded SPEC（project-doc-inputs.md）が発生済み。SPEC 性質と superseded 状態の両立。
    resolution: |
      document-model.md line 291 の「廃止状態を持たない」は SPEC が現在仕様の記録である性質を述べる。superseded_by frontmatter は「廃止」ではなく「後継SPECへの移行表示」として位置づけ、SPEC の性質（現在仕様の記録）を維持したまま superseded 状態を標準化する。根拠は PR #1410 で完全削除ではなく履歴保持を選択した判断経緯。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0020
    target_req: REQ-0101
    target_spec: docs/specs/foundations/document-model.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs:
        - docs/requirements/REQ-0101.md
      saved_spec_docs:
        - docs/specs/foundations/document-model.md
      artifact_action_mapping:
        ACT-REQ-001: REQ-0101 (APPEND REQ-0101-076, REQ-0101-077)
        ACT-SPEC-001: docs/specs/foundations/document-model.md (UPDATE SPEC lifecycle table + lifecycle rules table)
      source_ru_mapping:
        RU-0020: ACT-REQ-001, ACT-SPEC-001
      composite_ids:
        - REQ-0101-076
        - REQ-0101-077
    note: SPEC lifecycle superseded 標準化。標準扱いは元位置残置 + superseded_by frontmatter（UQ-001/UQ-002 確定済み）。docs/specs/retired/ は新設しない。

  - ou_id: OU-002
    source_ru: RU-0024
    target_req: REQ-0124, REQ-0125
    target_spec: docs/specs/integrity/integrity-rule-catalog.md
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result:
      saved_req_docs:
        - docs/requirements/REQ-0124.md
        - docs/requirements/REQ-0125.md
      saved_spec_docs:
        - docs/specs/integrity/integrity-rule-catalog.md
      artifact_action_mapping:
        ACT-REQ-002: REQ-0124 (APPEND REQ-0124-024)
        ACT-REQ-003: REQ-0125 (UPDATE REQ-0125-003)
        ACT-SPEC-002: docs/specs/integrity/integrity-rule-catalog.md (APPEND new IR candidate entry)
      source_ru_mapping:
        RU-0024: ACT-REQ-002, ACT-REQ-003, ACT-SPEC-002
      composite_ids:
        - REQ-0124-024
    note: 廃止REQ/SPEC由来記述残置検出カテゴリ追加 + 新規IR候補登録。OU-001 の superseded 標準化が前提知識。

  - ou_id: OU-003
    source_ru: RU-0024
    target_command: req-save.md, spec-save.md
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: single
    result:
      saved_command_docs: []
      skipped_actions:
        - ACT-CMD-001
        - ACT-CMD-002
      skip_reason: command artifact_actions (src/opencode/commands/**) は req-save/spec-save の G02 スコープ外。case-run で処理する対象。
    note: req-save/spec-save 廃止手順への横断クリーンアップステップ追加候補。OU-001 の lifecycle 定義が前提。

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs/specs/foundations/document-model.md の SPEC ライフサイクルセクションに superseded 状態遷移が定義されていることを確認する。
    pass_criteria: |
      SPEC ライフサイクルに draft/accepted に加え superseded が定義され、frontmatter superseded_by フィールドの要件が記載されていること。
    on_failure: |
      fix-and-reverify。SPEC セクション記述を修正して再確認する。

  - id: TS-002
    target_item: AG-002
    verification: |
      docs/specs/foundations/document-model.md に superseded SPEC の検査対象外判定基準（frontmatter superseded_by 存在で機械判定）が記述されていることを確認する。
    pass_criteria: |
      検査対象外判定基準が明記され、機械判定可能な条件が記載されていること。
    on_failure: |
      fix-and-reverify。

  - id: TS-003
    target_item: AG-003
    verification: |
      REQ-0124/REQ-0125 の要件行、要件テーブルに「廃止 REQ/SPEC 由来の記述残置」検出カテゴリが記載されていることを確認する。
    pass_criteria: |
      REQ-0124/0125 の検出観点に当該カテゴリが追加されていること。
    on_failure: |
      fix-and-reverify。

  - id: TS-004
    target_item: AG-004
    verification: |
      docs/specs/integrity/integrity-rule-catalog.md に「廃止 REQ/SPEC 由来記述残置」検出の新規IR候補エントリが記載されていることを確認する。
    pass_criteria: |
      新規IR候補エントリが severity, category, detection_method 等の必須フィールドを含むこと。
    on_failure: |
      fix-and-reverify。

  - id: TS-005
    target_item: AG-005
    verification: |
      req-save.md/spec-save.md の廃止関連ステップに横断クリーンアップステップの追加候補が記録されていることを確認する。
    pass_criteria: |
      追加候補が記録され、既存フローを破壊しない追加ステップである旨が明記されていること。
    on_failure: |
      fix-and-reverify。

case_open_hints:
  epic_needed: false
  decomposition: |
    OU-001（SPEC lifecycle 標準化）→ OU-002（検出カテゴリ+IR候補）→ OU-003（command手順拡張）の順序依存。
    UQ-001/UQ-002 確定済み。OU-001 から実行可能。
  wave_hints:
    - "Wave 1: OU-001（SPEC lifecycle 標準化）"
    - "Wave 2: OU-002 + OU-003（並列可能、OU-001完了後）"

draft_meta:
  split_forecast:
    measured_on: draft
    metrics:
      requirement_lines: 104
      concern_categories: 3
      artifact_types: 8
      spec_separation_violations: 0
    signals:
      requirement_lines: +2
      concern_categories: +1
      artifact_types: +1
      spec_separation_violations: +0
    total: 4
    recommended_action: SPLIT推奨
    thresholds_ref: req-health-metrics SPEC
    note: |
      D2 は SPLIT 予兆が高い（total 4）。ただしユーザー承認済み grouping を尊重し、ドラフト内で OU-001/002/003 の3OUに分割して順序依存を明示。case-open 時に必要に応じて別Issueに分割することを推奨。
```

# summary

SPEC ライフサイクルに superseded 状態を標準化し、廃止 REQ/SPEC 由来の記述残置検出カテゴリを inspect 系に追加する。req-save/spec-save の廃止手順に横断クリーンアップステップの追加候補を整備する。

**未決分岐 2件 確定済み**:
1. **UQ-001**: superseded SPEC の標準扱い → **(a) 元位置残置 + superseded_by frontmatter**（履歴追跡価値を残す）
2. **UQ-002**: docs/specs/retired/ 新設有無 → **新設しない**（superseded SPEC は retired と同一視しない）

OU-001（SPEC lifecycle 標準化）→ OU-002（検出カテゴリ+IR候補）→ OU-003（command手順拡張）の順序で実行する。SPLIT 予兆が高いため、case-open 時の別Issue分割を推奨。
