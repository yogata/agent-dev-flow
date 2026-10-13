---
draft_type: req_draft
topic_slug: req-110-test-strategy-table
status: draft
created_at: 2026-10-13T12:45:00Z
source_rus: [RU-0208]
---

# draft-data

```yaml
# work_type: REQ 文書（正規成果物）のみの保守。AgentDevFlow 本体改修に該当しない
work_type: docs_chore

scale: standard

summary: REQ-110 に「受け入れ条件対応」節（TS-001〜TS-008 の定義所在と要件行対応表）を追記し、TS 番号の正規情報源不在を将来検証向けの再定義で解消する。完了済み Case 検証（TS-001〜TS-013）の実行記録からの復元は不採用とし、v51 Design 側 TS 参照（RU-0217 担当）との番号空間の区別を case_open_hints へ記録する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >
      REQ-110 へ「受け入れ条件対応」節を追記し、REQ-110 の検証義務番号（TS-001〜TS-008）の定義所在を REQ 本体が所有する。
      節は REQ-103 の「受け入れ条件対応」節と同型とし、要件ドラフトの消費後も番号、条件の定義所在、検証義務を一意に再構成できる状態を REQ 内で確立する（中央台帳・checker は新設しない）。
      対応表は 15 要件行（REQ-110-001〜015）を恒常検証手段へ対応付ける。恒常検証手段の所在は実測済み（coverage 実査で全 15 行の verification 対応欠落 0 件を確認:
      phase_domain_state.test.ts、agentdev-phase-theme-collaboration の receive/handoff/sections/received.test.ts、phase-tasks-create／phase-tasks-update／phase-artifacts-update の workflow skill・command の verification 宣言）。
      対応関係の正本は traceability/ 配下の sidecar 宣言であり、本節はその所在の解決先を提供する（重複宣言は作らない）。
  - id: AG-002
    content: >
      「実行記録からの復元」は不採用とする。根拠: (1) 完了済み TS-001〜TS-013（Epic #3653 の Case 検証）は一回限りの検証義務であり、
      内容の REQ 本体への起稿は作業履歴の REQ 混入に当たる（分類ゲート・REQ-103-020 の履歴扱いに反する）。(2) v51 Design（v51-phase-transition-and-coexistence-model.md L54-62）が参照する TS-001〜TS-014 は
      RU-0002（Case #3654 / REQ-111 工程）の番号空間であり、REQ-110 の復元表へ付け替えると別内容の TS 番号へ解決される（番号空間衝突）。
      REQ-103 先例（docs/requirements/REQ-103.md L53-55）が「REQ 本体が TS 定義所在を所有し、ドラフト消費後も一意に再構成できる」構造の正であり、再定義はこの先例に従う。

conflict_resolutions:
  - id: CR-001
    conflict: TS-001〜TS-013 の内容を実行記録（#3657 PR #3664、#3658 PR #3666 の検証差分）から復元して表へ起稿するか、将来検証向けに再定義するか
    resolution: >
      将来検証向けの再定義を採用した。根拠は AG-002 のとおり（作業履歴の REQ 混入禁止、REQ-103 先例の構造、v51 Design 参照との番号空間衝突）。
      証拠（REQ-110・v51 Design の git 履歴 7c29986a/ee2a1bd1、REQ-103 先例本文、sidecar verification 宣言の coverage 実査）で決着し、HITL 判断事項は発生していない。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0208
    target_req: REQ-110
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-110
    target_area: "## 要件（節末・## 適用範囲 の直前へ追記。anchor 見出し）"
    source_items: [AG-001]
    content: |

      ## 受け入れ条件対応

      本節が REQ-110 の検証義務番号（TS-001〜TS-008）の定義所在を所有し、要件ドラフトの消費後も番号、条件の定義所在、検証義務を一意に再構成できる（中央台帳・checker は新設しない）。完了済み Case 検証の実行記録は本節の対象外であり、本節は恒常的な検証手段との対応のみを保持する。要件行と恒常検証手段の対応関係の正本はリポジトリ top-level traceability/ 配下の sidecar 宣言であり、本節の対応表はその所在の解決先を提供する。

      | TS | 対象要件行 | 検証義務の所在（恒常検証手段と対応関係宣言先） |
      |---|---|---|
      | TS-001 | REQ-110-001、REQ-110-004、REQ-110-010、REQ-110-013、REQ-110-014 | phase 保存状態の保存・再構成の検証。恒常検証手段: repo-agentdev-integrity の phase_domain_state.test.ts。対応関係は traceability/agentdev-phase-domain-state.yaml の verification 宣言が所有する |
      | TS-002 | REQ-110-004、REQ-110-005、REQ-110-014 | テーマ正本の更新・旧新対応の検証。恒常検証手段: agentdev-phase-theme-collaboration の sections.test.ts。対応関係は traceability/agentdev-phase-theme-collaboration.yaml の verification 宣言が所有する |
      | TS-003 | REQ-110-006 | 検討入力の持出し確認の検証。恒常検証手段: agentdev-phase-theme-collaboration の handoff.test.ts。対応関係は同 sidecar の verification 宣言が所有する |
      | TS-004 | REQ-110-007、REQ-110-009、REQ-110-015 | 戻り入力の受理・部分反映・線形走査（O(n)）の検証。恒常検証手段: agentdev-phase-theme-collaboration の receive.test.ts。対応関係は同 sidecar の verification 宣言が所有する |
      | TS-005 | REQ-110-013 | 受領済み知見の再取得の検証。恒常検証手段: agentdev-phase-theme-collaboration の received.test.ts。対応関係は同 sidecar の verification 宣言が所有する |
      | TS-006 | REQ-110-002、REQ-110-011、REQ-110-012 | 初回テーマ形成・参考候補調整の検証。検証義務は phase-tasks-create の workflow skill と command の手順契約が所有し、対応関係は traceability/agentdev-workflow-phase-tasks-create.yaml の verification 宣言が所有する |
      | TS-007 | REQ-110-003 | テーマ更新操作の検証。検証義務は phase-tasks-create／phase-tasks-update の workflow skill と command の手順契約が所有し、対応関係は traceability/agentdev-workflow-phase-tasks-update.yaml の verification 宣言が所有する |
      | TS-008 | REQ-110-008 | 採用済み内容の増分反映の検証。検証義務は phase-artifacts-update の workflow skill と command の手順契約が所有し、対応関係は traceability/agentdev-workflow-phase-artifacts-update.yaml の verification 宣言が所有する |

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      REQ-110 保存適用後、追記節を実ファイルから読み、(1)「受け入れ条件対応」節が存在すること、(2) 対応表が REQ-110-001〜015 の全 15 行を少なくとも 1 つの TS に対応付けていること、(3) 表が参照する恒常検証手段ファイル（phase_domain_state.test.ts、receive/handoff/sections/received.test.ts、phase workflow skill・command パス）と sidecar が実在すること、を機械的検索（rg・ファイル存在確認）で確認する。併せて traceability check（--req 全 15 行）で verification 対応欠落 0 件・duplicate-inconsistencies pass を再確認する。
    pass_criteria: |
      (1)〜(3) がすべて成立し、検索で参照不整合（存在しないパス・不明な REQ 行参照）が 0 件であること。traceability check の summary が fail 0 件であること。
    on_failure: |
      fix-and-reverify。表の対応漏れ・参照先不備は本節 content を修正して REQ-110 へ再適用し、同検査を再実行する。
  - id: TS-002
    target_item: AG-002
    verification: |
      draft の case_open_hints に RU-0217（v51 Design の TS 参照付け替え）との連動記録が存在し、REQ-110 の TS 番号空間と v51 Design 参照（RU-0002 由来）の番号空間の区別が記録されていることを確認する。
    pass_criteria: |
      連動記録と番号空間の区別が case_open_hints に明記されていること。
    on_failure: |
      fix-and-reverify。記録欠落は draft の case_open_hints を補って再確認する。

review_dispositions:
  - id: RD-001
    source_ru: RU-0208
    source_item: REQ-110 への test strategy 表追加（TS 番号の正規情報源不在解消）
    disposition: covered
    reason_code: adopted_with_direction_decision
    reason: |
      要求の本体（TS 番号の正規情報源不在の解消）は AG-001〜002 で covered。
      元成果物（intake promoted 成果物。prune 後は RU-0208 / intake item タイトル「2026-10-13-req-110-test-strategy-table-missing」で識別可能）が提示した2方針のうち
      「REQ-110 本体への test strategy 表追加」を採用し、CR-001 のとおり再定義方向で確定した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0208.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []

assembly_evidence:
  - target_file: docs/requirements/REQ-110.md
    target_content_sha256: bbfe08d20803cf02a95d96c2165660c916cd895b81cbf39997db2827dc745177
    check_scope: { heading: "## 要件", start_line: 12, end_line: 31 }
    execution_conditions: { operation: append, edit_sha256: 5ee50a820555d3272d7a80e5db317436ea1ff8c3d5d48b95dbb9daa078a1a7d9, expected_old_count: null }
    checker: { name: assemble-draft-section, version: "0.1.0", settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: target section only }
    checks_summary: { pre: { count: 2, all_ok: true }, post: { count: 2, all_ok: true } }
    diff_compact: { changed_lines_count: 16, added: 16, removed: 0 }
    executed_at: 2026-10-13T12:41:53.693Z

case_open_hints:
  epic_needed: false
  decomposition:
  wave_hints:
    - >
      RU-0217（v51 Design の TS-001〜TS-014 検証時参照の付け替え、Batch A）との連動: v51 Design が参照する TS-001〜TS-014 は RU-0002（Case #3654 / REQ-111 工程）の番号空間であり、
      本 draft が定義する REQ-110 の TS-001〜TS-008 とは別空間である。v51 Design 参照の付け替え先は REQ-111 側の定義所在（REQ-111 文書またはその design 対応）とし、
      REQ-110 の対応表へ付け替えないこと。両 Case の Definition 適用順序に依存する参照整合は、後方の Case 側で再確認する。
    - 本 draft の適用は既存 sidecar 宣言の変更を伴わない（対応関係の正本は sidecar、本 draft は所在解決節の追加のみ）。
```

# summary

REQ-110（ADF v5.1 工程駆動コラボレーション）は Epic #3653 の完了条件が参照した TS 番号の解決先を文書内に持たなかった。req-define の判断として、REQ-103 先例（TS 定義所在の REQ 本体所有）に従い「受け入れ条件対応」節を REQ-110 へ追記する（TS-001〜TS-008、全 15 要件行を恒常検証手段へ対応付け）。実行記録からの復元は、作業履歴の REQ 混入禁止と v51 Design 参照（RU-0002 由来の別番号空間）との衝突を根拠に不採用とした。証拠で決着し HITL 判断事項はない。v51 Design 側の参照付け替え（RU-0217 / Batch A）との連動を case_open_hints へ記録済み。
