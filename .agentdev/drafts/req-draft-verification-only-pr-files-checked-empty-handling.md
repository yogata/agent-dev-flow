---
draft_type: feature
topic_slug: verification-only-pr-files-checked-empty-handling
status: saved
created_at: 2026-07-18T00:00:00+09:00
source_rus:
  - RU-0015
---

# draft-data

```yaml
work_type: feature
scale: standard
summary: >-
  verification-only case-run（実装差分なし、検証のみ）で生成される空 PR の
  取り扱い（squash merge、空 commit 許容、files_checked 空確認手順）が
  command SPEC に未明文化。case-close Step 3-1 targeted docs guard で
  files_checked が空になる際の正当性確認手順（REQ Phase 3 item 1-4）が
  verification-only PR ケースに特化して明記されていない。GitHub が空 PR の
  squash merge を許可すること（commit 2b34f8b0 生成で実証）を前提とし、
  case-run.md SPEC に verification-only PR セクション、case-close.md Step 3-1
  に files_checked 空確認手順を新設。REQ-0158 false-clean 3層防御との
  相互作用を文書化する。

auto_gate:
  auto_ready: true
  open_questions: []
  conflicts: []

agreed_items:
  - id: AG-001
    statement: >-
      verification-only case-run（実装差分なし、検証のみ）で生成される空 PR
      の取り扱い（squash merge 可否、空 commit 許容）が command SPEC に
      未明文化。PR #1527（Issue #1521/OU-006, Epic #1515 Wave 2）で実証済み
      だが SPEC 化されていない。
    source_rus: [RU-0015]
  - id: AG-002
    statement: >-
      case-close Step 3-1 targeted docs guard で files_checked が空になる
      際の正当性確認手順（REQ Phase 3 item 1-4）が、verification-only PR の
      ケースに特化して明記されていない。false-clean 3層防御（REQ-0158、
      本 Epic OU-005 で実装）との相互作用が未文書化。
    source_rus: [RU-0015]
  - id: AG-003
    statement: >-
      GitHub は空 PR の squash merge を許可し、空 commit を生成することを
      前提とする（commit 2b34f8b0 で実証）。SPEC にこの前提を明記し、
      case-run.md で verification-only PR を「実装差分なし、検証のみ」と
      明確に定義し、部分実装 PR と区別する。
    source_rus: [RU-0015]
  - id: AG-004
    statement: >-
      REQ-0158 false-clean 3層防御との相互作用は、重複定義を避け REQ-0158
      SPEC 側に整理する。本 draft は verification-only PR の取り扱いの明文化
      が主で、false-clean 3層防御自体の改修は対象外。
    source_rus: [RU-0015]
  - id: AG-005
    statement: >-
      verification-only PR の発生条件は「REQ/SPEC の受け入れ基準が既存 repo
      状態で満たされている場合（req-save/spec-save 完了済みで case-run が
      検証のみ）」。横展開可能性あり。本 draft は case-run/case-close SPEC
      の明文化に限定し、他 workflow への波及は別 case で検討。
    source_rus: [RU-0015]

artifact_actions:
  - target: REQ-0158
    operation: append
    new_id: REQ-0158-YYY
    description: >-
      verification-only PR（実装差分なし、検証のみ）で files_checked が空に
      なるケースの正当性確認手順を case-close SPEC に明文化すること。
      verification-only PR の定義（実装差分0件、検証のみで PR 作成）、
      GitHub が空 PR の squash merge を許可する前提、files_checked 空の
      確認手順（REQ Phase 3 item 1-4）をSPEC 化。false-clean 3層防御との
      相互作用（files_checked 空は false-clean 警告レイヤをトリガーするが、
      verification-only の正当性確認で PASS 処理可能）を文書化。
    rationale: >-
      REQ-0158 は targeted docs guard の files_checked 空警告を要件化済み
      （REQ-0158 既存節）だが、verification-only PR の取り扱いが未規定。
      false-clean 3層防御との相互作用を整理する。
  - target: docs/specs/commands/case-run.md
    operation: 実装修復（新設セクション）
    description: >-
      verification-only PR の取り扱いセクションを新設。実装差分なし・検証
      のみで PR を作成する条件、空 commit の GitHub 許容、case-close への
      引継ぎ注意事项を記載。
  - target: docs/specs/commands/case-close.md
    operation: 実装修復
    description: >-
      Step 3-1 に verification-only PR の files_checked 空確認手順を明記。
      REQ Phase 3 item 1-4 の適用、verification-only 判定基準、false-clean
      3層防御との相互作用をSPEC 化。

conflict_resolutions:
  - id: CR-001
    description: >-
      REQ-0158 APPEND と SPEC update（case-run.md, case-close.md）の使い分け。
    resolution: >-
      REQ-0158 APPEND（REQ-0158-YYY）で verification-only PR の要件化。
      case-run.md と case-close.md SPEC は要件の具体的手順を記載。
      REQ（WHAT）と SPEC（HOW）の責務分担。
  - id: CR-002
    description: >-
      false-clean 3層防御との相互作用の整理場所。
    resolution: >-
      REQ-0158-YYY で相互作用を要件化、case-close.md SPEC で具体的手順を
      記載。重複定義を避け、REQ が入口、SPEC が詳細。

operation_units:
  - id: OU-001
    description: >-
      REQ-0158 へ REQ-0158-YYY（採番は req-save 任せ）を APPEND。
      verification-only PR の取り扱い要件。
    depends_on: []
    artifact: docs/requirements/REQ-0158.md
  - id: OU-002
    description: >-
      docs/specs/commands/case-run.md に verification-only PR セクションを
      新設。
    depends_on: [OU-001]
    artifact: docs/specs/commands/case-run.md
  - id: OU-003
    description: >-
      docs/specs/commands/case-close.md Step 3-1 に verification-only PR の
      files_checked 空確認手順を明記。
    depends_on: [OU-001]
    artifact: docs/specs/commands/case-close.md

test_strategy:
  - id: TS-001
    verification: >-
      REQ-0158-YYY が docs/requirements/REQ-0158.md に追記されていること。
    pass_criteria: REQ-0158-YYY エントリが存在し verification-only PR の取り扱いが記載。
    on_failure: OU-001 の APPEND 実施。
  - id: TS-002
    verification: >-
      docs/specs/commands/case-run.md に verification-only PR セクションが
      存在すること。
    pass_criteria: verification-only PR の定義、空 commit 許容、case-close 引継ぎが記載。
    on_failure: OU-002 のセクション新設。
  - id: TS-003
    verification: >-
      docs/specs/commands/case-close.md Step 3-1 に verification-only PR の
      files_checked 空確認手順が記載されていること。
    pass_criteria: >-
      REQ Phase 3 item 1-4 の適用、verification-only 判定基準、false-clean
      3層防御との相互作用が記載。
    on_failure: OU-003 の手順明記。
  - id: TS-004
    verification: >-
      実証確認: PR #1527（Issue #1521/OU-006）のケースが新SPEC 手順で
      PASS 判定されることを確認。
    pass_criteria: >-
      新手順に照らして PR #1527 が verification-only と判定され、files_checked
      空が正当化されること。
    on_failure: >-
      手順の適用可能性を再確認。verification-only 判定基準の調整。

case_open_hints:
  recommended_label: "type:feature, scope:case-run+case-close, area:verification-only-pr"
  scope_statement: >-
    verification-only case-run で生成される空 PR の取り扱い（squash merge、
    files_checked 空確認）を case-run/case-close SPEC に明文化し、REQ-0158
    false-clean 3層防御との相互作用を整理する。
  suggested_breakdown:
    - "Wave 1: REQ-0158 APPEND（REQ-0158-YYY）"
    - "Wave 2: case-run.md SPEC verification-only PR セクション新設"
    - "Wave 3: case-close.md SPEC Step 3-1 files_checked 空確認手順明記"
    - "Wave 4: PR #1527 ケースでの実証確認"
  dependencies:
    - "REQ-0158 既存要件（false-clean 3層防御、targeted docs guard）との整合"
    - "Epic #1515 Wave 2 PR #1527 由来"
    - "case-run/case-close SPEC（docs/specs/commands/ 配下）との整合"
```

# summary

RU-0015（verification-only PR files_checked 空の扱い）を処理。verification-only case-run（実装差分なし、検証のみ）で生成される空 PR の取り扱いが command SPEC に未明文化で、case-close Step 3-1 で files_checked 空の正当性確認が必要だった。GitHub が空 PR の squash merge を許可すること（commit 2b34f8b0 で実証）を前提とし、case-run.md SPEC に verification-only PR セクション、case-close.md Step 3-1 に files_checked 空確認手順を新設。REQ-0158 false-clean 3層防御との相互作用を REQ-0158-YYY として文書化。

work_type=feature、scale=standard。test_strategy は4件（REQ APPEND、SPEC 新設、SPEC 手順明記、PR #1527 実証確認）。Wave 4段階での分割実装を推奨。
