---
draft_type: req_draft
topic_slug: adv-review-caller-alignment
status: saved
created_at: 2026-08-09T19:00:00+09:00
saved_at: 2026-08-10T00:40:21+09:00
source_rus:
  - RU-0015
---

# draft-data

```yaml
work_type: maintenance

summary: |
  adversarial-review caller integration の対象 command 集合について、正規要件 REQ-015 と active な正規文書・配布物・runtime reference の間に存在する不整合を解消する。REQ-015 を caller 対象集合の正とし、7 command（req-define、inspect-promote、intake-promote、learning-promote、backlog-review、case-open、case-run）を caller として規定し、case-auto を caller ではなく停止・resume orchestration 経路として維持する。req-save、spec-save、case-close、case-update は caller 扱いしない。本件は意味要件の変更ではなく、REQ-015 を正とした下流文書・配布物・runtime reference の非適合是正である。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      adversarial-review caller integration の対象 command 集合の正は REQ-015 であり、active な正規 SPEC、配布 SKILL、command 定義、domain skill SPEC、workflow contract、delegation contract、runtime reference は REQ-015 と整合すること。REQ-015 は7 command（req-define、inspect-promote、intake-promote、learning-promote、backlog-review、case-open、case-run）を caller とし、case-auto は caller ではなく下位 caller 由来の停止・decision・resume を扱う orchestration 経路とする。
  - id: AG-002
    content: |
      active な正規文書・配布物・runtime reference に REQ-015 と異なる caller 対象集合（例: req-save、spec-save、case-close、case-update を含む集合、case-auto を直接 caller とする記述）が存在する場合、REQ-015 と整合させること。特定の既知ファイル1件だけの修正で完了してはならず、active な正規文書、配布物、SKILL、reference、command 定義、domain skill、workflow contract、delegation contract、および caller 集合を保持する機械検査対象を横断して不一致を確認すること。
  - id: AG-003
    content: |
      historical または retired な記録のみに旧 caller 表現が存在する場合、現行実行や正規判断に影響しないことを確認した上で修正対象外としてよいこと。historical/retired 記録を理由として現行正規成果物を不必要に変更しないこと。
  - id: AG-004
    content: |
      caller 集合是正によって REQ-015 本文の意味を変更しないこと。既存7 caller の review 挿入位置、戻り先、finding 採否・反映責務を変更しないこと。case-auto を新しい caller へ変更しないこと。caller 集合の正規所有者を複数化しないこと。

artifact_actions:
  - id: ACT-REQ-016
    artifact: req
    operation: append
    target: docs/requirements/REQ-016.md
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      | REQ-016-007 | adversarial-review caller integration の対象 command 集合の正は REQ-015 であり、active な正規 SPEC、配布 SKILL、command 定義、domain skill SPEC、workflow contract、delegation contract、runtime reference は REQ-015 と整合すること。REQ-015 は7 command（req-define、inspect-promote、intake-promote、learning-promote、backlog-review、case-open、case-run）を caller とし、case-auto は caller ではなく下位 caller 由来の停止・decision・resume を扱う orchestration 経路とする |
      | REQ-016-008 | active な正規文書・配布物・runtime reference に REQ-015 と異なる caller 対象集合が存在する場合、特定の既知ファイル1件だけの修正で完了せず、正規文書、配布物、SKILL、reference、command 定義、domain skill、workflow contract、delegation contract、機械検査対象を横断して整合させること |
      | REQ-016-009 | historical または retired な記録のみに旧 caller 表現が存在する場合、現行実行や正規判断に影響しないことを確認した上で修正対象外としてよいこと |
      | REQ-016-010 | caller 集合是正によって REQ-015 本文の caller 対象集合の意味を変更しないこと。既存7 caller の review 挿入位置、戻り先、finding 採否・反映責務を変更しないこと。case-auto を新しい caller へ変更しないこと。caller 集合の正規所有者を複数化しないこと |
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-adversarial-review
    target: docs/specs/skills/agentdev-adversarial-review.md
    target_area: caller integration 対象経路
    source_items: [AG-001, AG-002]
    content: |
      caller 対象集合を REQ-015 の7経路（req-define、inspect-promote、intake-promote、learning-promote、backlog-review、case-open、case-run）へ整合させる。case-auto は caller ではなく、下位 caller 由来の停止・decision・resume を扱う orchestration 経路として記述する。req-save、spec-save、case-close、case-update を caller として扱う記述が存在する場合、REQ-015 と整合させる。具体的な修正箇所は case-run で探索・特定し、REQ-015 の7経路と意味一致させる。
  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: case-auto
    target: docs/specs/commands/case-auto.md
    target_area: adversarial-review 呼出・停止伝播表現
    source_items: [AG-001, AG-004]
    content: |
      case-auto の caller / non-caller 表現を REQ-015 と整合させる。case-auto は adversarial-review の直接 caller ではなく、下位 caller 由来の停止・decision・resume を扱う orchestration 経路として記述する。具体的な修正箇所は case-run で特定。
  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: workflows
      slug: workflow-contracts
    target: docs/specs/workflows/workflow-contracts.md
    target_area: caller / orchestration 表現
    source_items: [AG-001, AG-002]
    content: |
      caller / orchestration 表現を REQ-015 と整合させる。具体的な修正箇所は case-run で特定。
  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: workflows
      slug: delegation-contracts
    target: docs/specs/workflows/delegation-contracts.md
    target_area: caller 表現
    source_items: [AG-001, AG-002]
    content: |
      caller 表現を REQ-015 と整合させる。具体的な修正箇所は case-run で特定。

conflict_resolutions:
  - id: CR-001
    conflict: |
      RU-0015 発見時点で agentdev-adversarial-review SKILL.md 等の一部記述に REQ-015 と異なる caller 対象集合（req-define / req-save / spec-save / case-open / case-run / case-close / case-update 等）が残っていた。
    resolution: |
      ユーザーが REQ-015 の7経路（req-define / inspect-promote / intake-promote / learning-promote / backlog-review / case-open / case-run）を正とすることを明示的に決定済み（RU-0015 agreement_confirmed_at: 2026-08-09T18:22:00+09:00、Source Summary 参照）。REQ-015 を正として下流文書・配布物を横断的に整合させる方針を採用する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0015
    target_req: REQ-016
    target_spec:
      - docs/specs/skills/agentdev-adversarial-review.md
      - docs/specs/commands/case-auto.md
      - docs/specs/workflows/workflow-contracts.md
      - docs/specs/workflows/delegation-contracts.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      REQ-015 本文（docs/requirements/REQ-015.md）から caller 対象 command を抽出し、7 command であることを確認する。
    pass_criteria: |
      REQ-015 目的または REQ-015-001 にて caller 対象が req-define / inspect-promote / intake-promote / learning-promote / backlog-review / case-open / case-run の7 command として記載されていること。
    on_failure: |
      fix-and-reverify: REQ-015 の記載が7 command と異なる場合、本 RU の前提が崩れるため blocked として停止する。
  - id: TS-002
    target_item: AG-002
    verification: |
      docs/specs/** 配下の adversarial-review 関連 SPEC（skills/agentdev-adversarial-review.md、commands/case-auto.md、各 caller command SPEC、workflow-contracts.md、delegation-contracts.md）で caller 対象集合の言及を探索し、REQ-015 と比較する。
    pass_criteria: |
      REQ-015 と矛盾する caller 対象集合の記述が0件であること。
    on_failure: |
      fix-and-reverify: 矛盾する記述を REQ-015 の7経路へ整合させる。
  - id: TS-003
    target_item: AG-002
    verification: |
      src/opencode/skills/agentdev-adversarial-review/SKILL.md および references 配下、src/opencode/commands/agentdev/** 配下の caller 表現を探索し、REQ-015 と比較する。
    pass_criteria: |
      REQ-015 と矛盾する caller 表現が0件であること。
    on_failure: |
      fix-and-reverify: 配布 SKILL・command 定義の caller 表現を REQ-015 の7経路へ整合させる。
  - id: TS-004
    target_item: AG-002
    verification: |
      active な runtime reference で req-save、spec-save、case-close、case-update を adversarial-review caller として扱う規範記述を探索する。
    pass_criteria: |
      該当規範記述が0件であること。
    on_failure: |
      fix-and-reverify: 該当記述を修正し、4 command を caller から除外する。
  - id: TS-005
    target_item: AG-004
    verification: |
      case-auto が adversarial-review を直接呼び出す caller として記述されている箇所を探索する。
    pass_criteria: |
      case-auto を直接 caller とする記述が0件であること。
    on_failure: |
      fix-and-reverify: case-auto を orchestration 経路として記述し直す。
  - id: TS-006
    target_item: AG-001
    verification: |
      REQ-015-001 が各 command SPEC に review 挿入境界を所有させることを確認し、7 caller command の各 SPEC / command 定義に review 挿入境界が存在するか確認する。
    pass_criteria: |
      7 command 全てに review 挿入境界が存在すること。
    on_failure: |
      fix-and-reverify: 挿入境界が欠ける SPEC へ追加する。
  - id: TS-007
    target_item: AG-004
    verification: |
      caller 集合是正後、既存7経路の review 挿入位置、戻り先、finding 採否・反映責務が変更されていないか確認する。
    pass_criteria: |
      変更0件であること。
    on_failure: |
      record-in-findings: 既存7経路の契約維持が前提であり、変更が検出された場合は本 RU の範囲外として Findings へ記録する。
  - id: TS-008
    target_item: AG-004
    verification: |
      caller 集合是正で case-auto の orchestration 責務が caller 責務へ変更されていないか確認する。
    pass_criteria: |
      変更0件であること。
    on_failure: |
      record-in-findings: case-auto の orchestration 責務維持が前提であり、変更が検出された場合は範囲外として Findings へ記録する。
  - id: TS-009
    target_item: AG-002
    verification: |
      caller 対象集合を保持する checker、test、index、registry 等の機械検査対象が存在する場合、その集合が REQ-015 と一致するか確認する。
    pass_criteria: |
      不一致0件であること（機械検査対象が存在しない場合は not applicable）。
    on_failure: |
      fix-and-reverify: 機械検査対象の caller 集合を REQ-015 と一致させる。
  - id: TS-010
    target_item: AG-004
    verification: |
      caller 集合是正によって REQ-015 本文（docs/requirements/REQ-015.md）に caller 対象集合の意味変更が発生していないか確認する。
    pass_criteria: |
      REQ-015 本文の意味変更が0件であること。
    on_failure: |
      record-in-findings: REQ-015 自体の変更は本 RU の範囲外であり、変更が検出された場合は blocked として Findings へ記録する。
  - id: TS-011
    target_item: AG-003
    verification: |
      historical / retired 記録のみに存在する旧 caller 表現を理由として、現行正規成果物を不必要に変更していないか確認する。
    pass_criteria: |
      不要な変更が0件であること。
    on_failure: |
      record-in-findings: historical/retired 記録は対象外であり、不要な変更が検出された場合は Findings へ記録して差し戻す。
  - id: TS-012
    target_item: AG-002
    verification: |
      docs / command / SKILL / reference / workflow / distribution boundary の横断整合検査を実行する。
    pass_criteria: |
      本変更由来の caller 集合不整合が0件であること。
    on_failure: |
      fix-and-reverify: 残存不整合を修正し再検証する。

review_dispositions:
  - id: RD-001
    source_ru: RU-0015
    source_item: AC-01
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: REQ-015 の caller 対象7 command 確認は TS-001 へ映射。
    evidence:
      path: docs/requirements/REQ-015.md
      section: 目的
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0015
    source_item: AC-02
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: active 正規 SPEC の caller 表現整合は TS-002 へ映射。
    evidence:
      path: null
      section: null
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0015
    source_item: AC-03
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: 配布 SKILL の caller 表現整合は TS-003 へ映射。
    evidence:
      path: null
      section: null
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0015
    source_item: AC-04
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: runtime reference の caller 表現整合は TS-004 へ映射。
    evidence:
      path: null
      section: null
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0015
    source_item: AC-05
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: case-auto non-caller 確認は TS-005 へ映射。
    evidence:
      path: null
      section: null
      checked_at_commit: null
    related_removed_items: []
  - id: RD-006
    source_ru: RU-0015
    source_item: AC-06
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: 7 caller の review 挿入境界存在確認は TS-006 へ映射。
    evidence:
      path: docs/requirements/REQ-015.md
      section: REQ-015-001
      checked_at_commit: null
    related_removed_items: []
  - id: RD-007
    source_ru: RU-0015
    source_item: AC-07
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: 既存7経路の review 挿入位置等の非変更確認は TS-007 へ映射。
    evidence:
      path: null
      section: null
      checked_at_commit: null
    related_removed_items: []
  - id: RD-008
    source_ru: RU-0015
    source_item: AC-08
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: case-auto orchestration 責務の非変更確認は TS-008 へ映射。
    evidence:
      path: null
      section: null
      checked_at_commit: null
    related_removed_items: []
  - id: RD-009
    source_ru: RU-0015
    source_item: AC-09
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: checker/test/index/registry の整合確認は TS-009 へ映射。
    evidence:
      path: null
      section: null
      checked_at_commit: null
    related_removed_items: []
  - id: RD-010
    source_ru: RU-0015
    source_item: AC-10
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: REQ-015 本文の意味変更非発生確認は TS-010 へ映射。
    evidence:
      path: docs/requirements/REQ-015.md
      section: 全体
      checked_at_commit: null
    related_removed_items: []
  - id: RD-011
    source_ru: RU-0015
    source_item: AC-11
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: historical/retired の取扱い確認は TS-011 へ映射。
    evidence:
      path: null
      section: null
      checked_at_commit: null
    related_removed_items: []
  - id: RD-012
    source_ru: RU-0015
    source_item: AC-12
    disposition: covered
    reason_code: mapped_to_test_strategy
    reason: 横断整合検査は TS-012 へ映射。
    evidence:
      path: null
      section: null
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints: []
```

# summary

RU-0015（adversarial-review caller 対象コマンド集合の不整合是正）の要件ドラフト。正規要件 REQ-015 を caller 対象集合の正とし、active な正規文書・配布物・runtime reference の横断的整合を行う。work_type は maintenance、scale は standard。REQ-016 へ4行の APPEND、agentdev-adversarial-review SPEC、case-auto SPEC、workflow-contracts SPEC、delegation-contracts SPEC の UPDATE を含む。ADR 不要。検証は12項目の test_strategy（TS-001〜012）で構成。
