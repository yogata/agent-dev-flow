---
draft_type: req-define
topic_slug: docs-migration-residue
status: saved
spec_actions_consumed: true
created_at: "2026-07-03"
source_rus:
  - RU-0013
---

# draft-data

work_type: maintenance

summary: >-
  docs 移行（read-contracts → doc-inputs）の完全実施を確認し、
  ADR-0110/REQ-0103 の旧表記残存、docs/guides/project-docs-and-specs.md の
  REQ 範囲陳腐化を横断的に解消することで、移行完全性を担保する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      docs 移行（read-contracts → doc-inputs）の完全実施を確認し、
      ADR、REQ、ガイド等の全文書で旧表記の残存を横断的に検出して解消すること。
      併せて docs/guides/*.md の REQ 範囲表記を実 REQ 最大番号に追従させること
     （REQ-0144-007 準拠）。
      移行漏れを docs-check で継続的に検出する仕組みを維持すること。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-0144.md
    source_items:
      - AG-001
    content: |
      | REQ-0144-024 | docs 移行（read-contracts→doc-inputs 等）の完全実施を確認し、ADR、REQ、ガイド等の全文書で旧表記の残存を横断的に検出して解消すること。docs/guides/*.md の REQ 範囲表記は実 REQ 最大番号に追従すること（REQ-0144-007 準拠）。移行漏れを docs-check で継続的に検出する仕組みを維持すること |
  - id: ACT-ADR-001
    artifact: adr
    operation: update
    target: docs/adr/ADR-0110.md
    source_items:
      - AG-001
    content: >-
      ADR-0110 line68 の旧表記 `.agentdev/read-contracts/**` を
      `.agentdev/doc-inputs/**` に置換する。
      ADR の決定内容（doc-inputs 移行）は ADR-0133 で実施済みであり、
      本修正は移行時の見落ろし（表記残存）の是正である。
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-0103.md
    source_items:
      - AG-001
    content: |
      REQ-0103-162 の旧表記 `.agentdev/read-contracts/**` を `.agentdev/doc-inputs/**` に置換する。
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/guides/project-docs-and-specs.md
    target_spec:
      operation: update
      domain: guides
      slug: project-docs-and-specs
    target_area: "（REQ 範囲表記セクション。正確な見出し行は spec-save で確定）"
    source_items:
      - AG-001
    content: >-
      docs/guides/project-docs-and-specs.md の REQ 範囲表記
      「48件/REQ-0156」を実情（50件/REQ-0158）に更新する。
      以降、新規 REQ 確定時に自動追従する仕組みと整合させる。

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0013
    target_req: REQ-0144
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_docs:
        - docs/requirements/REQ-0144.md
      operation_detail: APPEND REQ-0144-023 (docs 移行残滓横断確認要件)
      source_ru_mapping: RU-0013 -> OU-001 -> REQ-0144-023
  - ou_id: OU-002
    source_ru: RU-0013
    target_req: REQ-0103
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result:
      saved_docs:
        - docs/requirements/REQ-0103.md
      operation_detail: UPDATE REQ-0103-162 (.agentdev/read-contracts/** -> .agentdev/doc-inputs/**)
      source_ru_mapping: RU-0013 -> OU-002 -> REQ-0103-162
  - ou_id: OU-003
    source_ru: RU-0013
    target_spec:
      operation: update
      domain: guides
      slug: project-docs-and-specs
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result:
      saved_docs:
        - docs/guides/project-docs-and-specs.md
      operation_detail: UPDATE REQ range (48件/REQ-0156 -> 50件/REQ-0158)
      source_ru_mapping: RU-0013 -> OU-003 -> project-docs-and-specs.md
      g02_note: guide file outside spec-save G02 (docs/specs/**); authorized by unified task delegation

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: >-
      ADR-0110 line68 の旧表記が修正されていることを確認する。
      REQ-0103-162 の旧表記が修正されていることを確認する。
      docs/guides/project-docs-and-specs.md の REQ 範囲が実情
      （50件/REQ-0158）に更新されていることを確認する。
      docs-check 実行で read-contracts 旧表記に起因する NG が 0 件であることを確認する。
    pass_criteria: >-
      ADR-0110 旧表記修正済み。REQ-0103-162 旧表記修正済み。
      ガイド REQ 範囲更新済み（50件/REQ-0158）。
      read-contracts 旧表記残留 0 件。
    on_failure: fix-and-reverify

case_open_hints:
  epic_needed: false

# summary

## 対象 RU

- RU-0013: docs 移行残滓（旧表記残存、REQ 範囲陳腐化）

## 主な変更内容

- REQ-0144 APPEND（REQ-0144-024: docs 移行残滓横断確認）
- ADR-0110 UPDATE（line68 旧表記修正）
- REQ-0103 UPDATE（REQ-0103-162 旧表記修正）
- docs/guides/project-docs-and-specs.md SPEC update（REQ 範囲更新）

## ADR 判断

ADR 不要（既存文書の表記是正、新規アーキテクチャ判断なし）。

## 留意事項

- ADR-0110 の修正は ADR-0133（doc-inputs 移行）の実施漏れの是正であり、ADR の決定変更ではない
- 横断確認で他の旧表記残存が発見された場合、実装修復作業で追加修正する
