---
draft_type: req_draft
topic_slug: ru0028-design-promotion-record
status: draft
created_at: 2026-09-16T12:35:49+09:00
source_rus:
  - RU-0028
---

# draft-data

```yaml
work_type: maintenance
scale: null
summary: >-
  Design status 昇格時の根拠を Design 本体へ記録する「対応記録」セクションの標準形式を、
  REQ-057-036 と design-file-manager の保存契約へ反映する。昇格日、評価契約根拠、対応 Case/PR、
  REQ 整合確認結果を必須項目とし、見送り記録とは排他に扱う。既存 Design への遡及適用は行わない。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
agreed_items:
  - id: AG-001
    content: >-
      Design status を draft から accepted へ昇格した場合、Design 本体に見出し名「対応記録」の
      標準形式セクションを設け、昇格日、評価契約根拠（REQ-032-025 等）、対応 Case/PR、REQ との
      整合確認結果を記録する。accepted 昇格の根拠記録と見送り記録は同一対象で排他に管理する。
  - id: AG-002
    content: >-
      標準形式は新規の Design 昇格案件から適用する。既存 Design への遡及適用は行わず、RU-0015
      で作成された暫定「対応記録」セクションを当面の慣行として保持する。
  - id: AG-003
    content: >-
      見送り記録は REQ-032-025 が所有する既存チャネル（対応記録コメントおよび Design ファイル
      本体）に保存する。新規の一時成果物種別や新規ドメイン状態は作成しない。
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-057.md
    target_area: 要件テーブル末尾（擬似 REQ-057-036 行として追記）
    source_items: [AG-001, AG-002, AG-003]
    content: |
      | REQ-057-036 | Design status を draft から accepted へ昇格した場合、昇格根拠を Design 本体の標準形式セクション（見出し名「対応記録」）に記録すること。必須記載項目は昇格日、評価契約根拠（REQ-032-025 等）、対応 Case/PR、REQ との整合確認結果とし、見送り記録とは排他に管理すること。既存 Design への遡及適用は行わず、新規の昇格案件から標準形式に従うこと |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-design-file-manager.md
    target_design:
      operation: update
      domain: skills
      slug: agentdev-design-file-manager
    target_area: "## 提供する判断、操作"
    source_items: [AG-001, AG-002, AG-003]
    content: |
      ### accepted 昇格時の対応記録
      Design status を draft から accepted へ昇格する場合、Design 本体に `## 対応記録` セクションを置き、昇格日、評価契約根拠、対応 Case/PR、REQ との整合確認結果を記録する。昇格根拠の記録と見送り記録は排他に扱い、新規昇格案件から適用する。既存 Design への遡及適用は行わず、見送り記録は既存の対応記録コメントおよび Design ファイル本体へ保存する。
conflict_resolutions:
  - id: CR-001
    conflict: Design テンプレートとして docs/designs/commands/_template.md、docs/designs/skills/_template.md と design-file-manager Design の三つが候補になった。
    resolution: いずれのテンプレートも command/skill 別の雛形であり、対応記録形式は command・skill 横断の保存契約である。Design の作成・更新・保存契約を正規所有する agentdev-design-file-manager Design の `## 提供する判断、操作` へ反映する。
  - id: CR-002
    conflict: 既存 Design の暫定「対応記録」形式へ遡及適用する案があった。
    resolution: 既存文書の一括書換を避け、RU-0015 の暫定形式を当面保持し、新規昇格案件から標準形式を適用する。
  - id: CR-003
    conflict: REQ-057-036 は共有計画に基づく擬似採番である。
    resolution: 共有採番計画により REQ-057 の追加行 030〜035 は他バッチ（ru0030/0033/0025/0029/0026）に割当済みのため、本 draft は 036 を使用し、case-open の決定的採番で確定する。
operation_units:
  - ou_id: OU-001
    source_ru: RU-0028
    target_req: REQ-057
    target_design: docs/designs/skills/agentdev-design-file-manager.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: design-file-manager Design の保存契約を読み、対応記録の見出し名と4必須項目、見送り記録との排他を確認する。
    pass_criteria: "`## 対応記録`、昇格日、評価契約根拠、対応 Case/PR、REQ 整合確認結果、排他管理が全て記録されている。"
    on_failure: fix-and-reverify を選択する。保存契約の欠落は Design を修正して再確認する。
  - id: TS-002
    target_item: AG-002
    verification: 標準形式の適用対象が新規昇格案件であり、既存 Design の遡及適用をしないことを REQ と Design の両方で確認する。
    pass_criteria: 新規案件への適用と既存 Design の非遡及が矛盾なく記録されている。
    on_failure: fix-and-reverify を選択する。適用範囲の記述を修正して再確認する。
  - id: TS-003
    target_item: AG-003
    verification: REQ-032-025 と REQ-057-036 の記録チャネルを比較し、新規成果物種別・ドメイン状態の追加がないことを確認する。
    pass_criteria: 対応記録コメントと Design 本体だけが保存チャネルとして示されている。
    on_failure: fix-and-reverify を選択する。チャネル逸脱を除去して再確認する。
realization_actions:
  - id: RA-001
    concern: Design 保存時の対応記録形式
    responsibility: design-file-manager の SKILL.md と references が Design 保存契約を正規所有する。
    ownership_hints:
      - src/opencode/skills/agentdev-design-file-manager/SKILL.md
      - src/opencode/skills/agentdev-design-file-manager/references/
      - docs/designs/skills/agentdev-design-file-manager.md
    intent: Design 昇格時に根拠を同一形式で保存可能にする。
    verification_refs: [TS-001, TS-002]
    source_items: [AG-001, AG-002]
review_dispositions:
  - id: RD-001
    source_ru: RU-0028
    source_item: RU-0028-acceptance-criteria
    disposition: covered
    reason_code: converted_to_existing_req_append_and_design_update
    reason: RU-0028 の形式標準化と新規案件適用を REQ-057-036 と保存契約 Design update に反映した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0028.md
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items: []
case_open_hints:
  epic_needed: false
  wave_hints: []
result: {}
```

# summary

変更誘発境界リスクは、dependency（REQ-032-025、REQ-057-036、design-file-manager の保存契約）、client-server（対応記録コメントと Design 本体の既存チャネル）、execution（case-close の評価結果確定後に Design 本体へ記録する順序）、build-runtime（文書契約とテンプレート保存手順の変更のみ）、environment-propagation（保存契約の配布 skill 反映と既存文書への非遡及）を確認済みである。REQ-057 APPEND 1行と Design update 1件で、独立した複数関心の混在はない。SPLIT 要否: 不要。
