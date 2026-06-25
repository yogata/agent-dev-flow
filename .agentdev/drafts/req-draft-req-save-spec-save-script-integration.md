---
draft_type: req_draft
topic_slug: req-save-spec-save-script-integration
status: saved
created_at: 2026-06-25T11:00:00+09:00
---

# draft-data

```yaml
work_type: maintenance

summary: |
  req-define/req-save/spec-save の責務範囲・役割分担について議論で合意した設計思想を、docs/REQ/SPEC/コマンド/スキルに反映する。4点の合意内容: (1) req,spec本文はreq-defineで完全に作り切る（ID参照除く）原則の明記、(2) req-save/spec-saveの決定的処理（採番、整合性確認等）をagentdev-req-file-manager/scripts/の決定的スクリプトへ委譲、(3) req-save/spec-saveの品質ゲートを「適用結果の整合性検証」として明記（内容の品質はreq-defineのQG-1の責務）、(4) case-autoでreq-save/spec-saveを1 taskで起動する統合。design-principles.md第5節「Scriptは決定的処理を担う」の忠実な実装であり、設計思想の否定ではなく実装追従。ADR不要。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      req-define は artifact_actions の content について、REQ/SPEC の本文（ID参照を除く全テキスト）を完全に作り切る。req-save/spec-save は本文を推論で生成・修正しない。ID参照部分（`new:{slug}` 形式）のみ req-save/spec-save が採番結果で置換する。REQ-0102-064（artifact_actions を正とする）の延長であり、content の品質責任を req-define が担うことを明記する。
  - id: AG-002
    content: |
      req-save/spec-save の決定的処理を agentdev-req-file-manager/scripts/ 配下の決定的スクリプトで実行する。対象: REQ番号採番（max+1）、ADR番号採番、要件行ID採番、frontmatter id↔ファイル名整合性確認、README/DOC-MAP/mapping-table エントリ存在確認、変更範囲検証（許可パス照合）、target_area 見出し検索。design-principles.md 第5節「Script は決定的でテスト可能な処理を担う。validation、transformation、generation、formatting 等の純粋関数、決定的処理に限定する」の忠実な実装。現在これらが LLM 推論で実行されていることが、agentdev-req-file-manager に scripts/ が存在しない事実（状況確認 m0163 で判明）と合致する。
  - id: AG-003
    content: |
      req-save の品質ゲート（QG-1）は「適用結果の整合性検証」として位置づける。検証対象: 採番結果の整合性（`new:{slug}` → 確定番号の置換漏れなし）、マージ結果の整合性（要件テーブル構造、番号重複なし）、インデックスの整合性（README/DOC-MAP/mapping-table エントリと採番結果の一致）、変更範囲の妥当性。内容の品質（検証可能性、REQ/SPEC 分類適合性等）は req-define の QG-1 の責務であり、req-save は再検証しない。req-save の QG-1 は「req-define の QG-1 を通過した draft が、ファイル化された後も整合性を保っているか」を担保する。
  - id: AG-004
    content: |
      spec-save の品質ゲートも同様に「適用結果の整合性検証」として位置づける。検証対象: target_area 置換結果の整合性、SPEC status の整合性（新規作成時 status: draft 付与）、インデックスの整合性（docs/specs/README.md エントリと新規 SPEC の一致）、変更範囲の妥当性。内容の品質は req-define の QG-1 の責務。
  - id: AG-005
    content: |
      case-auto の工程別委譲契約を更新し、req-save と spec-save を1つの task で起動する。task 内では両コマンドの定義を順次読み込み、draft を1回読み込み、req-save の手順を実行後、引き続き spec-save の手順を実行する。commit/push は1回に統合（REQ + SPEC の変更を1コミット）。各コマンドの権限（ファイル操作範囲）は task に両方のガードレールを適用する。req-save と spec-save のコマンド定義・責務・ガードレールは変更しない。統合は case-auto の実行制御レイヤーのみ。
  - id: AG-006
    content: |
      新規決定的スクリプトは src/opencode/skills/agentdev-req-file-manager/scripts/ 配下に配置する。TypeScript、決定的（純粋関数）、テスト可能（tests/*.test.ts）。I/O は argv/stdin で入力、stdout で JSON 結果を返す。LLM は bash 経由で呼び出し、JSON を parse して意味判断（NG時の対応等）を行う。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-0102
    source_items: [AG-001, AG-003]
    content: |
      REQ-0102 の要件表を更新する:
      (1) AG-001: req-define は artifact_actions の content について REQ/SPEC の本文（ID参照除く）を完全に作り切ることを要件行に追加。req-save/spec-save は本文を推論で生成・修正しない。ID参照部分のみ採番結果で置換する。
      (2) AG-003: req-save の品質ゲート（QG-1）は「適用結果の整合性検証」であることを要件行に明記。採番結果の整合性、マージ結果の整合性、インデックスの整合性、変更範囲の妥当性を検証する。内容の品質は req-define の QG-1 の責務。
      REQ-0102-051（req-define と req-save の責務区画化）の延長。
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: REQ-0136
    source_items: [AG-002, AG-004]
    content: |
      REQ-0136 の要件表を更新する:
      (1) AG-002: req-save/spec-save の決定的処理（採番、整合性確認等）を agentdev-req-file-manager/scripts/ の決定的スクリプトで実行することを要件行に追加。design-principles.md 第5節の忠実な実装。
      (2) AG-004: spec-save の品質ゲートは「適用結果の整合性検証」であることを要件行に明記。
      REQ-0136-020/027/028 の延長。
  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: REQ-0103
    source_items: [AG-002, AG-006]
    content: |
      REQ-0103 の要件表を更新する: agentdev-req-file-manager/scripts/ 配下の決定的スクリプトが req-save/spec-save の決定的処理を担うことを明記。Script の配置（src/opencode/skills/agentdev-req-file-manager/scripts/）、形式（TypeScript、決定的、テスト可能）、I/O（argv/stdin入力、stdout JSON出力）を要件行に追加。REQ-0103-006「Script は決定的: テスト可能、再現可能」の具体化。
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/design-principles.md
    target_area: "## 5. Command / Skill / Template / Script の責任分界"
    source_items: [AG-002]
    content: |
      design-principles.md 第5節「Script」の記述を補強する。現在「Script は決定的でテスト可能な処理を担う。validation、transformation、generation、formatting 等の純粋関数、決定的処理に限定し、非決定的な処理は含めない」とある。これに、req-save/spec-save の決定的処理（REQ番号採番、整合性確認、エントリ存在確認、変更範囲検証、target_area 見出し検索）が Script の責務であることを明記する。Command がこれらを LLM 推論で実行せず、Script へ委譲することを原則として追記する。
  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: docs/specs/commands/req-save.md
    target_area: "## 現在の動作"
    source_items: [AG-002, AG-003]
    content: |
      docs/specs/commands/req-save.md の「現在の動作」セクションを更新する:
      (1) Step 4（REQファイル操作）、Step 5（インデックス更新）、Step 7（整合性検証）、Step 8（DOC-MAP影響確認）、Step 9（変更範囲検証）の決定的処理を agentdev-req-file-manager/scripts/ のスクリプト呼び出しに変更する記述に更新。
      (2) Step 4-0（QG-1）の位置づけを「保存対象の構造的完全性を最終検証」から「適用結果の整合性検証（採番結果の整合性、マージ結果の整合性、インデックスの整合性、変更範囲の妥当性）」に更新。内容の品質は req-define の QG-1 の責務である旨を追記。
  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target: docs/specs/commands/spec-save.md
    target_area: "## 現在の動作"
    source_items: [AG-002, AG-004]
    content: |
      docs/specs/commands/spec-save.md の「現在の動作」セクションを更新する:
      (1) Step 3（配置先解決）、Step 5（SPECファイル操作内のtarget_area検索）、Step 6（インデックス整合）、Step 9（変更範囲検証）の決定的処理をスクリプト呼び出しに変更する記述に更新。
      (2) 品質ゲートの位置づけを「適用結果の整合性検証（target_area置換結果、SPEC status、インデックス整合性、変更範囲）」に更新。
  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target: docs/specs/commands/case-auto.md
    target_area: "## 手順"
    source_items: [AG-005]
    content: |
      docs/specs/commands/case-auto.md の工程別委譲契約（Step 4）を更新する。req-save と spec-save を別 task で順次起動する現行規定を、1つの task で両コマンドを順次実行する規定に変更する。task 内では両コマンドの定義を順次読み込み、draft を1回読み込み、req-save の手順を実行後、引き続き spec-save の手順を実行する。commit/push は1回に統合。各コマンドの権限（ファイル操作範囲）は task に両方のガードレールを適用。req-save/spec-save のコマンド定義・責務・ガードレールは変更しない。
  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target: src/opencode/skills/agentdev-req-file-manager/SKILL.md
    source_items: [AG-002, AG-006]
    content: |
      agentdev-req-file-manager SKILL.md に scripts 責務セクションを新設し、req-save/spec-save 向け決定的スクリプトの I/O 仕様を追記する。スクリプト群: REQ番号採番、ADR番号採番、要件行ID採番、frontmatter整合性確認、README/DOC-MAP/mapping-table エントリ存在確認、変更範囲検証、target_area 見出し検索。各スクリプトの入力（argv/stdin）、出力（JSON）、エラー時の挙動を定義する。

conflict_resolutions:
  - id: CR-001
    conflict: 本要件はADR化すべきか（責務境界変更に該当するか）。
    resolution: |
      ADR不要。本要件は既存設計思想（design-principles.md 第5節「Scriptは決定的処理を担う」、REQ-0102-051「req-defineとreq-saveの責務区画化」）の実装追従であり、新規技術判断を含まない。req-save/spec-saveの品質ゲート位置づけの明確化は、既存REQ-0102-051の延長（req-defineが内容品質、req-saveが適用結果整合性）であり、新規責務境界の設定ではない。REQ-0112-038「ADR化禁止: 仕様変更のみ、運用ルール」に合致。
  - id: CR-002
    conflict: case-autoでのreq-save/spec-save統合は、各コマンドの責務・ガードレールを変更するか。
    resolution: |
      変更しない。統合はcase-autoの実行制御レイヤーのみ。req-save.md/spec-save.mdのコマンド定義・責務・ガードレール（ファイル操作範囲、G01〜G12）は維持する。task内で両コマンドを順次実行するだけで、各コマンドの独立性は保たれる。REQ-0102-067「req-saveはSPECを編集せず、SPEC保存はspec-saveの責務」も維持。

operation_units:
  - ou_id: OU-001
    target_req: REQ-0102
    operation: update
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs: [REQ-0102]
      artifact_action_mapping:
        ACT-REQ-001: REQ-0102
      source_ru_mapping: {}
      applied_requirement_lines:
        - REQ-0102-080  # AG-001: 本文完全確定原則（req-define責務、req-save/spec-saveは推論生成しない）
        - REQ-0102-081  # AG-003: req-save QG-1 を「適用結果の整合性検証」として位置づけ
        - REQ-0102-082  # AG-003: req-save QG-1 は内容品質を再検証しない（req-define QG-1 責務）
      case_open_input:
        req_id: REQ-0102
        operation: update
        new_line_ids: [REQ-0102-080, REQ-0102-081, REQ-0102-082]
  - ou_id: OU-002
    target_req: REQ-0136
    operation: update
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs: [REQ-0136]
      artifact_action_mapping:
        ACT-REQ-002: REQ-0136
      source_ru_mapping: {}
      applied_requirement_lines:
        - REQ-0136-029  # AG-002: 決定的処理を agentdev-req-file-manager/scripts/ へ委譲
        - REQ-0136-030  # AG-004: spec-save QG-1 を「適用結果の整合性検証」として位置づけ
      case_open_input:
        req_id: REQ-0136
        operation: update
        new_line_ids: [REQ-0136-029, REQ-0136-030]
  - ou_id: OU-003
    target_req: REQ-0103
    operation: update
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs: [REQ-0103]
      artifact_action_mapping:
        ACT-REQ-003: REQ-0103
      source_ru_mapping: {}
      applied_requirement_lines:
        - REQ-0103-159  # AG-002/006: scripts/ 配下に決定的スクリプト群を配置
        - REQ-0103-160  # AG-006: TypeScript・決定的・テスト可能・argv/stdin→stdout JSON
      case_open_input:
        req_id: REQ-0103
        operation: update
        new_line_ids: [REQ-0103-159, REQ-0103-160]
  - ou_id: OU-004
    target_spec: docs/specs/design-principles.md
    operation: spec-update
    depends_on: [OU-001, OU-002, OU-003]
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-005
    target_spec: docs/specs/commands/req-save.md
    operation: spec-update
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-006
    target_spec: docs/specs/commands/spec-save.md
    operation: spec-update
    depends_on: [OU-002]
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-007
    target_spec: docs/specs/commands/case-auto.md
    operation: spec-update
    depends_on: [OU-001, OU-002]
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-008
    target_spec: src/opencode/skills/agentdev-req-file-manager/SKILL.md
    operation: spec-update
    depends_on: [OU-003]
    recommended_order: 2
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      req-define を実行し、生成された draft の artifact_actions.content が REQ/SPEC の本文（ID参照除く）を完全に含むことを確認する。req-save/spec-save を実行し、本文が推論で生成・修正されず、draft の content がそのまま適用されることを確認する。
    pass_criteria: |
      draft の content が req-define で完全に作り切られている。req-save/spec-save は本文を変更しない。
    on_failure: |
      fix-and-reverify。req-define の content 生成または req-save/spec-save の適用ロジックの不具合を修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      新規決定的スクリプト（REQ番号採番、frontmatter整合性確認、エントリ存在確認、変更範囲検証、target_area見出し検索）を npm test で実行し、全件 pass すること。正常系・異常系のテストケースを含む。
    pass_criteria: |
      新規スクリプトのテストが全件 green。
    on_failure: |
      fix-and-reverify。スクリプトのロジック不具合を修正して再検証する。
  - id: TS-003
    target_item: AG-002
    verification: |
      req-save/spec-save を実行し、決定的処理がスクリプト経由で処理されることを確認する。LLM の Read 回数が従来比で減少することを確認する。
    pass_criteria: |
      決定的処理がスクリプト呼び出しで処理される。LLM の Read 回数が削減される。
    on_failure: |
      fix-and-reverify。req-save.md/spec-save.md の手順がスクリプト呼び出しに更新されていない場合、修正して再検証する。
  - id: TS-004
    target_item: AG-003
    verification: |
      req-save を実行し、QG-1 が「適用結果の整合性検証」として機能することを確認する。採番結果の整合性、マージ結果の整合性、インデックスの整合性、変更範囲の妥当性が検証される。
    pass_criteria: |
      req-save の QG-1 が適用結果の整合性を検証する。内容の品質検証は含まれない（req-define の QG-1 の責務）。
    on_failure: |
      fix-and-reverify。QG-1 の検証項目が「適用結果の整合性」に特化していない場合、修正して再検証する。
  - id: TS-005
    target_item: AG-005
    verification: |
      case-auto を実行し、req-save と spec-save が1つの task で順次実行されることを確認する。commit/push が1回に統合されることを確認する。
    pass_criteria: |
      req-save と spec-save が単一 task で実行される。commit/push が1回である。各コマンドの権限（ファイル操作範囲）が維持される。
    on_failure: |
      fix-and-reverify。case-auto の工程別委譲契約が更新されていない場合、修正して再検証する。
  - id: TS-006
    target_item: AG-all
    verification: |
      draft 保存後、QG-1 を適用する。
    pass_criteria: |
      QG-1 が pass。
    on_failure: |
      fix-and-reverify。QG-1 の指摘事項を解消して再検証する。

case_open_hints:
  epic_needed: true
  decomposition: |
    Wave 1（REQ改訂、並行可能）:
    - Issue A: REQ-0102 UPDATE（OU-001、AG-001/003）
    - Issue B: REQ-0136 UPDATE（OU-002、AG-002/004）
    - Issue C: REQ-0103 UPDATE（OU-003、AG-002/006）

    Wave 2（SPEC更新、Wave 1完了後、並行可能）:
    - Issue D: design-principles.md UPDATE（OU-004、AG-002 第5節補強）
    - Issue E: docs/specs/commands/req-save.md UPDATE（OU-005、AG-002/003）
    - Issue F: docs/specs/commands/spec-save.md UPDATE（OU-006、AG-002/004）
    - Issue G: docs/specs/commands/case-auto.md UPDATE（OU-007、AG-005）
    - Issue H: agentdev-req-file-manager/SKILL.md UPDATE（OU-008、AG-002/006）

    Wave 3（実装、Wave 2完了後、case-run責務）:
    - Issue I: src/opencode/commands/agentdev/req-save.md, spec-save.md の手順更新（AG-002 スクリプト呼び出し化）
    - Issue J: src/opencode/commands/repo/case-auto.md の工程別委譲契約更新（AG-005 統合）
    - Issue K: 新規決定的スクリプト作成（src/opencode/skills/agentdev-req-file-manager/scripts/ 配下、AG-006）
  wave_hints:
    - wave: 1
      issues: [A, B, C]
      rationale: REQ改訂は並列可能
    - wave: 2
      issues: [D, E, F, G, H]
      rationale: SPEC更新はREQ改訂内容に依存
      depends_on: [wave 1]
    - wave: 3
      issues: [I, J, K]
      rationale: 実装（コマンド定義更新 + 新規Script作成）はSPEC完了後
      depends_on: [wave 2]
```

# summary

req-define/req-save/spec-save の責務範囲・役割分担について議論で合意した設計思想を docs/REQ/SPEC/コマンド/スキルに反映する。4点の合意内容: (1) 本文完全確定原則、(2) 決定的処理のScript委譲、(3) 品質ゲート位置づけの明確化（適用結果の整合性検証）、(4) case-autoでのreq-save/spec-save統合。design-principles.md 第5節の忠実な実装であり、設計思想の否定ではなく実装追従。ADR不要。

maintenance、operation_units 8件、case_open_hints に3 Wave 11 Issue 構成を記載。Wave 1（REQ改訂3件）、Wave 2（SPEC更新5件）、Wave 3（実装3件: コマンド定義更新 + 新規Script作成）。実装（Wave 3）は case-run 責務。
