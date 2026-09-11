---
draft_type: req_draft
topic_slug: traceability-declaration-placement
status: saved
design_actions_consumed: true
created_at: 2026-09-11
source_rus: [RU-0004]
---

# draft-data

```yaml
# adversarial-review (STEP-8): skipped — 宣言配置先規則の明文化と 4 REQ 行への宣言付与のみ（付与先対応は REQ 行内容から一意に確定）。Decision 判断対象なし、req-define が新たに導入した意味的決定なし
# work_type: 運用手順明文化（Design）と正規文書への宣言行付与。docs 編集のみ
work_type: docs_chore

# scale: feature のみ判定対象。docs_chore のため未設定
scale: null

summary: ADF-COVERS 対応宣言の正規配置規則を確定した。① 配布 template 本文への宣言付与禁止と親 SKILL.md への集約規則を workflow-templates 運用手順へ明文化する（過剰付与側）。② REQ-031-025 / REQ-031-026 / REQ-032-023 / REQ-010-076 に対応する正規 Design へ ADF-COVERS(implementation) 宣言を付与し missing-implementation を解消する（欠落側）。③ 配布物のみの変更で実現された実装の宣言配置方針（docs 側正規配置先）を整理する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      配布 template 本文への ADF-COVERS 宣言付与を禁止し、対応宣言は親 SKILL.md 側へ集約する規則を
      agentdev-workflow-templates Design の運用手順へ明記する。背景: #16（PR #2760）で配布テンプレート
      本文への宣言付与が配布物内部 ID 契約テストに違反した実績があり、宣言配置先が事前に明示されて
      いなかったことが根因（guardrail insufficiency）。
  - id: AG-002
    content: |
      REQ-031-025、REQ-031-026、REQ-032-023、REQ-010-076 に対応する docs 配下の正規成果物へ
      ADF-COVERS(implementation) 宣言を付与し、missing-implementation を解消する。
      付与先の対応:
      - REQ-031-025（docs 整合性検査の worktree 起点指定）と REQ-031-026（コミット後 push 前限定の
        差分検出・コミット前の明示ファイル列挙）→ docs/designs/commands/case-run.md
      - REQ-032-023（files_checked 不一致の検査見逃し扱い）→ docs/designs/commands/case-close.md
      - REQ-010-076（files_checked 空の検査見逃し扱い）→ docs/designs/integrity/targeted-docs-guard-implementation.md
      2026-09-11 時点で docs 配下に当該4行をカバーする ADF-COVERS(implementation) 宣言は 0 件。
  - id: AG-003
    content: |
      配布物のみの変更で実現された実装（配布側ソースに実装が存在し docs 側に宣言がない実装）の
      宣言配置方針として、ADF-COVERS 宣言の正規配置先は docs 配下の正規成果物
      （該当実装を規定する command Design / skill Design / integrity Design）であることを整理・明記する。
      配布物本体への宣言付与は行わない（AG-001 の規則と整合）。

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-workflow-templates.md
    target_design:
      operation: update
      domain: skills
      slug: agentdev-workflow-templates
    target_area: 配布 template の運用手順を規定するセクション（テンプレート作成・更新時の注意事項）
    source_items: [AG-001]
    content: |
      配布 template（テンプレートファイル）本文に ADF-COVERS 宣言を付与しない。
      テンプレートを消費する実装の対応宣言は、親 SKILL.md（または該当実装を規定する docs 配下の
      正規成果物）へ集約する。テンプレート本文の宣言は配布物内部 ID 契約テスト違反
      （配布物本文の concrete ID 記載）を生むため禁止する。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/commands/case-run.md
    target_design:
      operation: update
      domain: commands
      slug: case-run
    target_area: docs 整合性検査の実行を規定するセクション（worktree 起点指定・変更ファイル検出の契約節）
    source_items: [AG-002]
    content: |
      <!-- ADF-COVERS(implementation): REQ-031-025 -->
      <!-- ADF-COVERS(implementation): REQ-031-026 -->
      本 Design の docs 整合性検査手順（worktree に対する検査 skill 起点指定、コミット後 push 前限定の
      差分検出、コミット前の明示ファイル列挙）が REQ-031-025、REQ-031-026 を実装する。
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/commands/case-close.md
    target_design:
      operation: update
      domain: commands
      slug: case-close
    target_area: 検査実行結果の突合を規定するセクション（files_checked 突合・検査見逃し扱いの契約節）
    source_items: [AG-002]
    content: |
      <!-- ADF-COVERS(implementation): REQ-032-023 -->
      本 Design の検査実行結果突合（files_checked が空または検査対象変更ファイルと不一致の場合を
      検査見逃しとして扱い、確認なく合格扱いとしない）が REQ-032-023 を実装する。
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target: docs/designs/integrity/targeted-docs-guard-implementation.md
    target_design:
      operation: update
      domain: integrity
      slug: targeted-docs-guard-implementation
    target_area: check_changed_docs（変更ファイル限定検査）の実装詳細を規定するセクション
    source_items: [AG-002, AG-003]
    content: |
      <!-- ADF-COVERS(implementation): REQ-010-076 -->
      本 Design の check_changed_docs 実装詳細（files_checked が空の場合を検査見逃しとして扱い、
      確認なく合格扱いとしない。検証モード問わず）が REQ-010-076 を実装する。
      配布物のみの変更で実現された実装の ADF-COVERS 宣言は、docs 配下の正規成果物
      （該当実装を規定する Design）へ付与する。配布物本体への宣言付与は行わない。

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0004
    target_req: null
    target_design: docs/designs/skills/agentdev-workflow-templates.md ほか4件（AG-002 の対応表のとおり）
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
      agentdev-workflow-templates.md の更新後、template 本文への宣言付与禁止と親 SKILL.md 集約の
      規則が運用手順節に記載されていることを確認する。配布物内部 ID 契約検査
      （distribution-reference-boundary 系）を実行し、配布 template に宣言が残っていないことを確認する。
    pass_criteria: |
      禁止・集約規則が Design 記載として存在する。配布 template 本文に ADF-COVERS 宣言が 0 件。
    on_failure: |
      fix-and-reverify。記載漏れまたは template 残存宣言を修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      4 Design への宣言付与後、traceability 検査（agentdev-traceability coverage / declaration integrity）
      を実行し、REQ-031-025 / REQ-031-026 / REQ-032-023 / REQ-010-076 の missing-implementation が
      解消されていることを確認する。付与した宣言行の REQ ID 参照が実在する REQ 行と一致することを突合する。
    pass_criteria: |
      4 REQ 行すべてに docs 配下の ADF-COVERS(implementation) 宣言が存在し、
      missing-implementation が 0 件。宣言の REQ ID 参照不整合（malformed）が 0 件。
    on_failure: |
      fix-and-reverify。宣言の付与漏れ・ID 誤記・配置先誤りを修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      配置方針（docs 配下正規配置先）が targeted-docs-guard-implementation.md（または
      agentdev-workflow-templates.md）の記述として存在することを確認する。
      配布物本体に宣言が付与されていないことを配布物内部 ID 契約検査で確認する。
    pass_criteria: |
      配置方針が正規文書に記載され、配布物本体の宣言 0 件を検査が確認している。
    on_failure: |
      fix-and-reverify。記載漏れを修正して再検証する。

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints:
    - RU-0003 / RU-0006 / RU-0008 の draft が同一 Design ファイル（case-run.md、case-close.md）を更新する。case-open の Wave 構成で同時実行を避けるか、同一 Wave 内での競合解消を考慮すること
```

# summary

RU-0004（トレーサビリティ対応宣言の正規配置規則）を docs_chore として要件化した。過剰付与側（テンプレート本文禁止・親 SKILL.md 集約）の規則明文化と、欠落側（REQ-031-025/026、REQ-032-023、REQ-010-076 の 4 行への docs 配下正規 Design 宣言付与）の解消、配布物のみの実装の配置方針整理を 1 case で確定。
