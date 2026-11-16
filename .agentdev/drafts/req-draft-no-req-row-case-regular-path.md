---
draft_type: req_draft
topic_slug: no-req-row-case-regular-path
status: draft
created_at: 2026-11-17T00:50:00+09:00
source_rus: []
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: |
  対象 REQ 行を持たない案件（Decision のみの作成・変更など）で、case-open と case-close の機械工程が
  正規の経路で成立するようにする。2026-11-16 の Case #4113（Decision のみ・REQ 行の変更なし）で、
  case-open の機械工程（prepare_definition_pr.ts）が入力検証で構成不能となり代替経路（REQ-029-014〜016）へ
  切り替わり、case-close の機械工程の初回（約8.5分の全試験を含む・exitCategory failure）が traceability の
  門での失敗となり、手で書いた wrapper —— .agentdev/tmp/case-4113-tr-gate.mjs による、全体の実行と main の baseline との
  対照による悪化0件の機械証明 —— で再実行して合格した。対象 REQ 行が0件であることを正当な案件の構成として
  機械工程が扱えるようにし、既知の欠落（main と同一の missing-implementation 15 件・missing-verification
  17 件に相当する）で不要な失敗と全試験のやり直しが起きないようにする。あわせて、検査の前提を高価な全試験の
  前に確認する順序に是正する（検査の省略ではなく、失敗を検出する順序の是正）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      対象 REQ 行が0件の案件を正当な案件の構成として扱う。case-open の機械工程
      （src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts の入力検証）に、
      REQ 行の変更を伴わない案件の正規の入力構成（対象の集合が空であることを明示したうえでの、全体を対象とする
      検査の mode）を加える。既存の代替経路（REQ-029-014〜016）は救済として維持し、正規の入力構成の
      追加をもって廃止しない。
  - id: AG-002
    content: |
      case-close の機械工程（src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts）
      の traceability の門に、対象 REQ 行が0件の案件の正規の経路を組み込む。全体の実行と main の baseline
      との対照による悪化0件の機械証明（2026-11-16 に .agentdev/tmp/case-4113-tr-gate.mjs として手で書いた
      wrapper と同等の役割）を正規の実装として提供し、手で書く wrapper を不要にする。既知の欠落は
      main の baseline と識別子の集合で完全一致するかぎり不合格の原因にしない。新規の違反の検出する力は
      維持する（正例・反例の双方で確認）。
  - id: AG-003
    content: |
      検査の前提を、高価な全試験の前に確認する。機械工程の各 phase で、案件の構成と入力の前提の検証を
      全試験の起動より先に実行し、前提が満たされない失敗が早い段階で確定する順序にする。
      実行する検査の総数は減らさない（検査の省略ではなく、失敗を検出する順序の是正）。

artifact_actions:
  - id: ACT-REQ-001
    artifact: requirement
    operation: update
    target: docs/requirements/REQ-029.md
    source_items: [AG-001]
    content: |
      対象 REQ 行が0件の案件の正規の入力構成を、case-open 機械工程の入力検証の要件として追加する
      （既存の代替経路の救済の規定は維持）。
  - id: ACT-REQ-002
    artifact: requirement
    operation: update
    target: docs/requirements/REQ-030.md
    source_items: [AG-002]
    content: |
      対象 REQ 行が0件の案件の case-close 機械工程における正規の経路（全体の実行と main baseline との対照）
      を要件として追加する。
  - id: ACT-DES-001
    artifact: design
    operation: update
    target: docs/designs/commands/case-open.md
    source_items: [AG-001, AG-003]
    content: |
      機械工程の入力構成と前提の検証の順序（全試験の前に案件の構成・入力の検証）を Design へ反映する。
  - id: ACT-DES-002
    artifact: design
    operation: update
    target: docs/designs/commands/case-close.md
    source_items: [AG-002, AG-003]
    content: |
      traceability の門の、対象 REQ 行が0件の案件の正規の経路と、前提の検証の順序を Design へ反映する。

conflict_resolutions: []

operation_units:
  - id: OU-001
    description: |
      対象 REQ 行を持たない案件の機械工程の正規経路の確立（単一 Issue）。prepare_definition_pr.ts の
      入力検証への正規入力構成の追加（AG-001）、close_mechanical_steps.ts の traceability の門への
      正規経路の組み込み（AG-002）、前提の検証の順序の是正（AG-003）、要件行と Design の反映
      （ACT-REQ-001・002・ACT-DES-001・002）を同一の変更として完結させる。
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      Decision の作成のみで REQ 行の変更を伴わない案件の構成（#4113 と同等）で case-open の機械工程を
      実行する。入力検証の受理・機械工程の完了・報告 JSON の生成を確認する。
    pass_criteria: |
      代替経路（REQ-029-014〜016）への切り替えが発生しないこと。fail-closed の拒否が発生しないこと。
      報告 JSON に対象 REQ 行が0件である案件の構成としての実行の記録が残ること。
    on_failure: |
      fix-and-reverify。入力検証と経路の分岐の誤りを修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      対象 REQ 行が0件の案件の構成で case-close の機械工程を実行する。正例（既知の欠落のみ・main の
      baseline と識別子の集合が完全一致）と反例（新規の違反を注入した構成）の双方で実行する。
    pass_criteria: |
      正例で不合格とならないこと（手で書いた wrapper を使用しないこと）。反例で注入した新規の違反が
      検出されて不合格となること。
    on_failure: |
      fix-and-reverify。対照の対象の集合と識別子の照合の誤りを修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      前提が欠けた案件の構成（入力の不備・対象の集合の構成不能）で機械工程を実行し、失敗が確定する位置を
      実測する。
    pass_criteria: |
      全試験の起動より前に失敗が確定すること（#4113 の初回のような、全試験の実行の後の失敗とならないこと）。
    on_failure: |
      fix-and-reverify。前提の検証の順序を組み直して再検証する。

realization_actions:
  - id: RA-001
    concern: 対象 REQ 行が0件の案件の機械工程の正規経路
    responsibility: |
      prepare_definition_pr.ts の入力検証と close_mechanical_steps.ts の traceability の門に、対象 REQ 行が
      0件の案件の正規の構成を組み込む。検出能力は現行と同等かそれ以上を維持する（対照による悪化0件の確認・
      新規違反の検出）。前提の検証は全試験の起動の前に実行する。
    ownership_hints:
      - "変更の対象: src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts の入力検証・traceabilityReqIds"
      - "変更の対象: src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts の traceability gate"
      - "実績の参照: Case #4113（2026-11-16）。case-open は学習記録「prepare_definition_pr の traceabilityReqIds が REQ 行変更なし Case で構成不能になる」（学習記録の題の引用）、case-close は .agentdev/tmp/case-4113-mech-premerge.stdout.log の exitCategory failure と、case-4113-tr-gate.mjs による代替 wrapper"
      - "既知の欠落の実測値（2026-11-16 時点）: missing-implementation 15 件・missing-verification 17 件（main と完全一致）"
      - "範囲が接する既存 draft: .agentdev/drafts/req-draft-caseready-cleanup-suppression.md の wrapper 入力契約と cleanup 前置確認。close_mechanical_steps.ts に両方から触れるため、実行の順の調整を case 側で判断する"
    intent: |
      どの案件の構成でも機械工程が正規の経路で完走するようにする。既知の欠落と新規の違反を区別し、
      失敗の検出を高価な検査の前へ移す。検査の総数は減らさない。
    verification_refs: [TS-001, TS-002, TS-003]
    source_items: [AG-001, AG-002, AG-003]

review_dispositions: []

assembly_evidence: []

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

対象 REQ 行を持たない案件（Decision のみなど）で case-open・case-close の機械工程が正規の経路で完走する
ようにする。#4113 で実測された構成不能による代替経路への切り替え（case-open）と、全試験を含む初回の
失敗と手で書いた wrapper による再実行（case-close・約8.5分のやり直し）を、正規の入力構成と正規の対照の経路で
解消する。既知の欠落と新規の違反の区別を維持し、前提の検証を全試験の前に置く順序の是正を含む。
