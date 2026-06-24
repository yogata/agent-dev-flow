---
draft_type: req_draft
topic_slug: spec-update-target-area-content
status: saved
created_at: 2026-06-25T03:30:00+09:00
---

# draft-data

```yaml
work_type: maintenance

summary: |
  artifact_actions の artifact: spec, operation: update/spec-update において、req-define が target_area（対象セクション見出し）を必須出力し、content を「変更後セクション全文」とすることで、spec-save 側の「書き換え内容を推論する」負荷を排除し、target_area で指定されたセクションを content で置換する機械作業に変える。target_area 未指定の旧形式 draft は従来の「追記」動作で後方互換を維持する。spec-save の実行時間短縮（前回計測で ACT-SPEC-001 に4分17秒消費）と、req-define と spec-save の責務正常化（SPEC 成果物本文の確定は req-define、保存は spec-save）を図る。ADR 不要（REQ-0112-038 ADR化禁止: 仕様変更のみ、運用ルールに合致）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      req-define は artifact_actions のうち、artifact: spec かつ operation が update または spec-update の場合、target_area（対象セクション見出し、Markdown 見出し行形式。例: `### IR-044`）を必須とする。operation が create または spec-create（新規 SPEC セクション追加）の場合は target_area は任意とする（新規追加位置は spec-save が既存のセクション構造から判断）。
  - id: AG-002
    content: |
      req-define は artifact: spec の content について、operation が update または spec-update の場合は「変更後のセクション全文（対象セクションの見出し行から次の同レベル見出しの直前までの全内容）」を出力する。operation が create または spec-create の場合は従来通り「新規セクション本文」を出力する。content は req-draft.md テンプレートで「保存対象の full text」と既に定義済みであり、本要件は operation 別の content の意味論を明確化するものである（フィールド定義の新設ではなく運用の格上げ）。
  - id: AG-003
    content: |
      spec-save は target_area が指定された update または spec-update 操作の場合、対象 SPEC ファイル内で target_area に一致する見出し行を検索し、当該見出し行から次の同レベル（または上位レベル）見出し行の直前までを「セクション」として特定し、content で置換する。見出し階層の解釈規則: `### X` で検索した場合、次の `###` または `##` または `#` 見出しの直前までを範囲とする。target_area に一致する見出しが複数存在する場合は最初のマッチを採用し、warn を出力する。target_area に一致する見出しが存在しない場合は当該 action をスキップし、follow-up として「target_area 未検出、operation を spec-create へ切り替えを推奨」を報告する。
  - id: AG-004
    content: |
      target_area 未指定の draft（旧形式、または operation が create/spec-create の場合）は後方互換を維持し、spec-save は従来の「追記」動作を維持する。本要件は target_area が指定された場合のみ「置換」動作を適用する。これにより既存 draft の破壊を防ぎ、新規 draft のみ段階的に置換動作へ移行する。
  - id: AG-005
    content: |
      req-draft.md テンプレート（src/opencode/commands/agentdev/templates/req-define/req-draft.md）の target_area フィールドのコメントを更新し、「artifact: spec, operation: update/spec-update の場合は必須（対象セクション見出し）。operation: create/spec-create の場合は任意」と明記する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-0102
    source_items: [AG-001, AG-002]
    content: |
      REQ-0102 の要件表に以下を追加する（REQ-0102-064 の周辺、artifact_actions 形式関連として）。

      新規要件行（仮 ID REQ-0102-079）: req-define は artifact_actions のうち artifact: spec かつ operation が update または spec-update の場合、target_area（対象セクション見出し）を必須出力すること。operation が create または spec-create の場合は任意とする。

      新規要件行（仮 ID REQ-0102-080）: req-define は artifact: spec の content について、operation が update または spec-update の場合は「変更後のセクション全文（見出し行から次の同レベル見出し直前まで）」を出力すること。operation が create または spec-create の場合は「新規セクション本文」を出力すること。

      これらは REQ-0102-064「draft-data の artifact_actions のうち artifact: spec を正とする」の形式拡張であり、req-define の出力形式の明確化である。実装コード（check_integrity.ts 等）には影響しない。
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: REQ-0136
    source_items: [AG-003, AG-004]
    content: |
      REQ-0136 の要件表に以下を追加する（REQ-0136-020「spec-save は draft 全体を読み、artifact_actions のうち artifact: spec の action を処理すること」の周辺、spec-save 挙動関連として）。

      新規要件行（仮 ID REQ-0136-027）: spec-save は target_area が指定された update または spec-update 操作の場合、対象 SPEC ファイル内で target_area に一致する見出し行を検索し、当該見出しから次の同レベル（または上位レベル）見出しの直前までを「セクション」として特定し、content で置換すること。見出し階層の解釈規則、複数マッチ時の挙動（最初のマッチ採用 + warn）、未検出時の挙動（スキップ + follow-up 報告）を SPEC に配置すること。

      新規要件行（仮 ID REQ-0136-028）: spec-save は target_area 未指定の draft、または operation が create/spec-create の場合は従来の「追記」動作を維持し、後方互換を保つこと。target_area が指定された場合のみ「置換」動作を適用すること。

      これらは REQ-0136-020/023 の拡張であり、spec-save の SPEC 保存挙動の明確化である。
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/commands/req-define.md
    target_area: "## artifact_actions"
    source_items: [AG-001, AG-002]
    content: |
      docs/specs/commands/req-define.md の artifact_actions 形式説明セクションに、target_area と content の operation 別の扱いを追記する。具体的には:

      - artifact: spec, operation: update/spec-update の場合: target_area は必須（対象セクション見出し）。content は「変更後セクション全文」。
      - artifact: spec, operation: create/spec-create の場合: target_area は任意。content は「新規セクション本文」。

      target_area の形式（Markdown 見出し行）、見出し階層の解釈規則、複数マッチ・未検出時の挙動は docs/specs/commands/spec-save.md 側に配置し、req-define 側は出力形式のみを規定する。
  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: docs/specs/commands/spec-save.md
    target_area: "## SPEC ファイル操作"
    source_items: [AG-003, AG-004]
    content: |
      docs/specs/commands/spec-save.md の SPEC ファイル操作セクションに、target_area ベースのセクション置換ロジックを追記する。具体的には:

      - target_area が指定された update/spec-update 操作: 対象 SPEC ファイル内で target_area に一致する見出し行を検索（前方一致または完全一致、いずれか SPEC で定義）。当該見出しから次の同レベル（`###` 検索時は次の `###` または `##` または `#`）見出し行の直前までを「セクション」として特定し、content で置換する。
      - 複数マッチ時: 最初のマッチを採用し、warn を出力。
      - 未検出時: 当該 action をスキップし、follow-up として「target_area 未検出、operation を spec-create へ切り替えを推奨」を報告。
      - target_area 未指定、または operation が create/spec-create: 従来の「追記」動作を維持（後方互換）。

      併せて spec-save.md の Step 5（SPEC ファイル操作）の update 記述を「追記」から「target_area 指定時は置換、未指定時は追記」に更新する。

conflict_resolutions:
  - id: CR-001
    conflict: 今回の仕様拡張（target_area 必須化 + content 格上げ + 置換化）を ADR 化すべきか。
    resolution: |
      ADR 不要。本件は artifact_actions 形式の運用改善であり、技術判断（アーキテクチャ決定）を含まない。REQ-0112-038「ADR化禁止: 仕様変更のみ、command仕様、artifact contract変更はADR化禁止」に合致する。また REQ-0102-064 で既に artifact_actions 形式が規定されており、本件はその形式の明確化・拡張である。
  - id: CR-002
    conflict: 「追記」から「置換」への変更は破壊的変更か。既存 SPEC の情報が消えるリスクはあるか。
    resolution: |
      target_area 指定時のみ「置換」が適用され、未指定時は「追記」が維持されるため、既存 draft の破壊はない。新規 draft で target_area を指定して置換する場合、content に「変更後セクション全文」を req-define が出力するため、情報欠落は req-define の責務で防ぐ。spec-save 側は content の完全性を前提とし、部分的な欠落検知は行わない（soft contract）。

operation_units:
  - ou_id: OU-001
    target_req: REQ-0102
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      status: saved
      operation_mode: UPDATE
      saved_req_docs:
        - REQ-0102
      artifact_action_mapping:
        ACT-REQ-001: REQ-0102
      added_requirement_rows:
        - REQ-0102-078
        - REQ-0102-079
      source_items_mapping:
        AG-001: REQ-0102-078
        AG-002: REQ-0102-079
      numbering_rule_applied: "max+1 (REQ-0102-077 → 078, 079). draft 仮 ID 079/080 は req-save 採番ルールにより 078/079 に確定"
      integrity_checks:
        readme: ok_no_title_change
        doc_map: ok_no_title_change
        mapping_table: ok_no_title_change
        catalog_entry: not_required_not_IR_rule
      qg_1_result: warn
      qg_1_warn_detail: "SPLIT 予兆観点: REQ-0102 は既存 77行 (51+ 超過済) への UPDATE。新規 SPLIT 予兆ではなく既存関心 (artifact_actions 形式、REQ-0102-064 拡張) の追記。req-define が auto_ready:true で SPLIT 不要判定。split-forecast 未記録だが進行可能"
      case_open_consumable: true
  - ou_id: OU-002
    target_req: REQ-0136
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      status: saved
      operation_mode: UPDATE
      saved_req_docs:
        - REQ-0136
      artifact_action_mapping:
        ACT-REQ-002: REQ-0136
      added_requirement_rows:
        - REQ-0136-027
        - REQ-0136-028
      source_items_mapping:
        AG-003: REQ-0136-027
        AG-004: REQ-0136-028
      numbering_rule_applied: "max+1 (REQ-0136-026 → 027, 028). draft 仮 ID と一致"
      integrity_checks:
        readme: ok_no_title_change
        doc_map: ok_no_title_change
        mapping_table: ok_no_title_change
        catalog_entry: not_required_not_IR_rule
      qg_1_result: pass
      case_open_consumable: true
  - ou_id: OU-003
    target_spec: docs/specs/commands/req-define.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result:
      status: pending
      note: "spec-save 責務 (REQ-0102-067)。ACT-SPEC-001 は req-save 処理対象外"
  - ou_id: OU-004
    target_spec: docs/specs/commands/spec-save.md
    operation: spec-update
    scale: standard
    depends_on: [OU-002]
    recommended_order: 2
    issue_policy: single
    result:
      status: pending
      note: "spec-save 責務 (REQ-0102-067)。ACT-SPEC-002 は req-save 処理対象外"

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      req-define を実行し、生成された draft の artifact_actions のうち artifact: spec, operation: update/spec-update の entry に target_area が必須で含まれることを確認する。operation: create/spec-create の entry では target_area が省略可能であることも確認する。
    pass_criteria: |
      全ての update/spec-update operation の entry に target_area が設定されている。create/spec-create operation では target_area 省略が許容される。
    on_failure: |
      fix-and-reverify。req-define の手順（Step 7-3）または agentdev-req-analysis skill の参照箇所に target_area 出力ルールが未反映の場合、修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      req-define を実行し、生成された draft の artifact: spec, operation: update/spec-update の content が「変更後セクション全文（見出し行を含む）」であることを確認する。変更前セクションの内容が漏れなく含まれることを目視確認する。
    pass_criteria: |
      content が見出し行で始まり、変更後のセクション内容が全文含まれている。
    on_failure: |
      fix-and-reverify。req-define の content 生成ロジックが「変更後セクション全文」を出力していない場合、修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      spec-save を実行し、target_area が指定された update/spec-update 操作が「置換」動作で処理されることを確認する。具体的には、対象 SPEC ファイルの target_area で指定されたセクションが content で置き換えられ、他のセクションは維持されることを git diff で確認する。target_area に一致する見出しが存在しない場合にスキップ + follow-up 報告されることも確認する。
    pass_criteria: |
      target_area 指定時はセクション置換が行われ、他セクションは維持される。未検出時はスキップ + follow-up 報告される。
    on_failure: |
      fix-and-reverify。spec-save の Step 5 の置換ロジックが未実装または誤動作の場合、修正して再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |
      target_area 未指定の旧形式 draft（テスト用に作成）を spec-save で処理し、従来の「追記」動作が維持されることを確認する。
    pass_criteria: |
      target_area 未指定の場合、content が既存セクションに追記され、既存内容は維持される。
    on_failure: |
      fix-and-reverify。後方互換ロジックが破綻している場合、修正して再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |
      req-draft.md テンプレートの target_area フィールドのコメントに「artifact: spec, operation: update/spec-update の場合は必須。operation: create/spec-create の場合は任意」が明記されていることを確認する。
    pass_criteria: |
      テンプレートコメントに operation 別の target_area 必須・任意が明記されている。
    on_failure: |
      fix-and-reverify。テンプレートコメントの更新漏れの場合、修正して再検証する。
  - id: TS-006
    target_item: AG-all
    verification: |
      draft 保存後、agentdev-quality-gates の QG-1（Definition Integrity Gate）を適用し、REQ/SPEC 分類、ADR ゲート、チェックボックス測可能性、必須フィールド完全性、artifact_actions 構成の妥当性、test_strategy 3要素完全性を検証する。
    pass_criteria: |
      QG-1 が pass。
    on_failure: |
      fix-and-reverify。QG-1 の指摘事項を解消して再検証する。

case_open_hints:
  epic_needed: false
```

# summary

本要件は、artifact_actions の artifact: spec, operation: update/spec-update において req-define が target_area（対象セクション見出し）を必須出力し、content を「変更後セクション全文」とすることで、spec-save が「書き換え内容を推論する」負荷を排除し「target_area でセクションを特定して content で置換する」機械作業に変える。target_area 未指定の旧形式 draft は従来の「追記」動作で後方互換を維持する。

これは req-define と spec-save の責務正常化（SPEC 成果物本文の確定は req-define、保存は spec-save）であり、REQ-0102-051「req-define と req-save のREQ責務が明確に区画化」の精神を spec-save にも拡張する。ADR 不要（REQ-0112-038 ADR化禁止: 仕様変更のみ、運用ルールに合致）。

scale: standard。対象は REQ-0102/REQ-0136 への UPDATE（各1〜2要件行追加）と docs/specs/commands/req-define.md/spec-save.md への spec-update。req-draft.md テンプレートのコメント更新（AG-005）は REQ-0102 の要件化に含まれ、実ファイル変更は case-run 責務。
