---
draft_type: req_draft
topic_slug: accepted-adr-semantic-invariant-contract
status: saved
created_at: 2026-07-26
source_rus:
  - RU-0026
agentdev_handoff: true
---

<!-- 本要件docは Step 3-1 により agentdev_handoff: true を付与。
     配布 skill（agentdev-adr-guidelines、agentdev-adr-file-manager）、配布 SPEC（document-model）、
     ADR-001.md の改善を含むため、現プロジェクトの通常要件docではなく引き継ぎ用RU入力として整理している。 -->

# draft-data

```yaml
work_type: feature

scale: standard

summary: |
  accepted ADR の意味的不変契約を確定する。
  accepted ADR を意味的に不変とし、明示承認済みの非意味修正（6件）と後継 ADR を必要とする意味変更（6件）を分離する。
  REQ-001（文書体系と持続可能な基準構造）へ意味不変原則、6+6 分類、明示承認記録、過去版無言書換禁止を APPEND する。
  docs/specs/skills/agentdev-adr-guidelines.md へ「accepted ADR の更新規則」サブセクションを新設し、
  詳細プロトコルを正規所有する。
  docs/specs/skills/agentdev-adr-file-manager.md へ直接編集時のチェックリストを追記する。
  docs/specs/foundations/document-model.md へ accepted ADR の意味不変原則を明記する。
  ADR-001 の WS-9 除去、案B ラベル除去は非意味修正として直接編集を許可する（10シナリオ抽象化は後継 ADR 必須）。
  シナリオ定義は SPEC、実行結果は Release Report へ配置する。
  新規 ADR は作成しない（既存 REQ-001 / ADR guidelines / file-manager SPEC の整理）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      accepted ADR を意味的に不変とする。
      明示承認済みの非意味修正と、後継 ADR を必要とする意味変更を分離する。
      accepted ADR の過去版を無言で書き換えない。
  - id: AG-002
    content: |
      明示承認後に直接更新できる非意味修正は次の6件とする。
      (1) 誤字または文字化けの修正
      (2) 壊れたリンクまたは誤ったファイルパスの修正
      (3) タイトルと本文の不一致修正
      (4) 意味を変えない表記統一
      (5) 決定内容でも制約でもない移行時ラベルの除去
      (6) 履歴注記、関連リンク、日付などの補助情報修正
  - id: AG-003
    content: |
      後継 ADR を必要とする意味変更は次の6件とする。
      (1) 決定内容の追加または削除
      (2) 適用範囲の変更
      (3) 必須条件または制約の変更
      (4) 正規所有者の変更
      (5) 採用方式の変更
      (6) 外部から観測可能な結果の変更
  - id: AG-004
    content: |
      直接更新前に明示承認記録が存在すること。
      決定内容、範囲、制約、所有者、方式、観測結果の変更には後継 ADR が存在すること。
      意味変更を表記修正として扱わない。
      Report へ規範要件または必達条件を移さない。
  - id: AG-005
    content: |
      ADR-001 の WS-9 除去と案B ラベル除去は決定内容を変更せず、非意味修正として直接編集可能。
      WS-9 は非意味ラベルとして除去できる。
      案B は決定内容を具体文で維持し、案番号だけを除去できる。
  - id: AG-006
    content: |
      10シナリオの抽象化（抽象条件への変更）は ADR-001 の直接編集で行わず、後継 ADR を作成する。
      10シナリオの定義は SPEC、実行結果は Release Report が所有する。
      Release Report に規範表現が存在しない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-001
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      accepted ADR の意味的不変契約を追加する。
      追加対象は REQ-001 の要件テーブル末尾（REQ-001-NNN 以降、採番は req-save が max+1 で確定）。

      - REQ-001-NNN: accepted ADR を意味的に不変とし、明示承認済みの非意味修正と後継 ADR を必要とする意味変更を分離すること
      - REQ-001-NNN: 直接更新可能な非意味修正は6件（誤字/文字化け修正、壊れたリンク/誤ったファイルパス修正、タイトル本文不一致修正、意味を変えない表記統一、移行時ラベル除去、補助情報修正）とすること
      - REQ-001-NNN: 後継 ADR を必要とする意味変更は6件（決定内容の追加/削除、適用範囲変更、必須条件/制約変更、正規所有者変更、採用方式変更、外部観測可能結果変更）とすること
      - REQ-001-NNN: 直接更新前に明示承認記録が存在すること。決定内容、範囲、制約、所有者、方式、観測結果の変更には後継 ADR が存在すること
      - REQ-001-NNN: accepted ADR の過去版を無言で書き換えないこと。意味変更を表記修正として扱わないこと。Report へ規範要件または必達条件を移さないこと

  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target_spec:
      operation: spec-update
      domain: skills
      slug: agentdev-adr-guidelines
    target_area: "## accepted ADR の更新規則"
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006]
    spec_logical_division: cross_cutting_contract
    canonical_owner: agentdev-adr-guidelines
    content: |
      ## accepted ADR の更新規則

      accepted ADR を意味的に不変とし、明示承認済みの非意味修正と、後継 ADR を必要とする意味変更を分離する（REQ-001）。
      ADR guidelines、ADR file manager、document-model の accepted ADR 更新規則を本契約へ統一する。

      ### 直接更新可能な非意味修正（6件）

      明示承認後に直接更新できる非意味修正は次の6件とする。各変更は非意味修正分類へ一意に割り当てる。

      1. 誤字または文字化けの修正
      2. 壊れたリンクまたは誤ったファイルパスの修正
      3. タイトルと本文の不一致修正
      4. 意味を変えない表記統一
      5. 決定内容でも制約でもない移行時ラベルの除去
      6. 履歴注記、関連リンク、日付などの補助情報修正

      ### 後継 ADR を必要とする意味変更（6件）

      後継 ADR を作成せずに直接編集できない意味変更は次の6件とする。各変更は意味変更分類へ一意に割り当てる。

      1. 決定内容の追加または削除
      2. 適用範囲の変更
      3. 必須条件または制約の変更
      4. 正規所有者の変更
      5. 採用方式の変更
      6. 外部から観測可能な結果の変更

      ### 直接更新の実行条件

      - 直接更新前に明示承認記録が存在すること
      - 非意味修正は ADR file manager のチェックリスト（後述）で確認する
      - 意味変更を表記修正として扱わない
      - Report へ規範要件または必達条件を移さない
      - accepted ADR の過去版を無言で書き換えない

      ### ADR-001 の移行時識別子の扱い

      - ADR-001 の WS-9 は非意味ラベルとして除去できる（決定内容を変更しない）
      - 案B は決定内容を具体文で維持し、案番号だけを除去できる
      - 10シナリオを抽象条件へ変更する場合は後継 ADR を作成する（直接編集しない）
      - 10シナリオの定義は SPEC、実行結果は Release Report が所有する
      - Release Report に規範表現が存在しない

  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target_spec:
      operation: spec-update
      domain: skills
      slug: agentdev-adr-file-manager
    target_area: "## accepted ADR 直接編集チェックリスト"
    source_items: [AG-002, AG-004]
    spec_logical_division: cross_cutting_contract
    canonical_owner: agentdev-adr-file-manager
    content: |
      ## accepted ADR 直接編集チェックリスト

      accepted ADR へ直接編集を実施する場合、次のチェックリストを全て満たすことを確認する（REQ-001、agentdev-adr-guidelines「accepted ADR の更新規則」準拠）。

      ### 事前確認

      - [ ] 対象 ADR の status が `accepted` である
      - [ ] 当該編集が非意味修正6件のいずれかに該当する
      - [ ] 当該編集が意味変更6件のいずれにも該当しない
      - [ ] 明示承認記録が存在する

      ### 事後確認

      - [ ] 決定内容、適用範囲、必須条件、制約、正規所有者、採用方式、観測可能結果が変更されていない
      - [ ] 意味変更を表記修正として扱っていない
      - [ ] accepted ADR の過去版を無言で書き換えていない
      - [ ] Report（Release Report 等）へ規範要件または必達条件を移していない

      ### 非意味修正6件の確認

      編集内容が次のいずれかに該当することを確認する。

      1. 誤字または文字化けの修正
      2. 壊れたリンクまたは誤ったファイルパスの修正
      3. タイトルと本文の不一致修正
      4. 意味を変えない表記統一
      5. 決定内容でも制約でもない移行時ラベルの除去
      6. 履歴注記、関連リンク、日付などの補助情報修正

  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-update
    target_spec:
      operation: spec-update
      domain: foundations
      slug: document-model
    target_area: "## accepted ADR の意味的不変"
    source_items: [AG-001, AG-002, AG-003, AG-004]
    spec_logical_division: cross_cutting_contract
    canonical_owner: document-model
    content: |
      ## accepted ADR の意味的不変

      accepted ADR は意味的に不変とする（REQ-001）。
      詳細プロトコルは agentdev-adr-guidelines「accepted ADR の更新規則」、agentdev-adr-file-manager「accepted ADR 直接編集チェックリスト」を参照。

      ### 原則

      - accepted ADR を意味的に不変とする
      - 直接更新可能な非意味修正は6件、後継 ADR を必要とする意味変更は6件
      - 直接更新前に明示承認記録が存在する
      - accepted ADR の過去版を無言で書き換えない
      - 意味変更を表記修正として扱わない
      - Report へ規範要件または必達条件を移さない

      ### 正規所有

      - 意味不変原則: REQ-001（核心契約）、agentdev-adr-guidelines SPEC（詳細プロトコル）
      - 直接編集チェックリスト: agentdev-adr-file-manager SPEC
      - accepted ADR の扱い: 本節（document-model.md）

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0026
    target_req: REQ-001
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0026
    target_spec: docs/specs/skills/agentdev-adr-guidelines.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0026
    target_spec: docs/specs/skills/agentdev-adr-file-manager.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-0026
    target_spec: docs/specs/foundations/document-model.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      REQ-001.md へ accepted ADR の意味的不変、6+6 分類、明示承認記録、過去版無言書換禁止が
      APPEND されているか確認する。
    pass_criteria: |
      REQ-001 へ意味的不変、6+6 分類、明示承認、過去版書換禁止の4点が記載されていること。
    on_failure: |
      fix-and-reverify。記載不足を補正して再確認する。
  - id: TS-002
    target_item: AG-002
    verification: |
      agentdev-adr-guidelines SPEC の「accepted ADR の更新規則」セクションへ直接更新可能な非意味修正6件が
      列挙されているか確認する。
      agentdev-adr-file-manager SPEC の「accepted ADR 直接編集チェックリスト」セクションへ事前確認・事後確認・6件確認が
      記載されているか確認する。
    pass_criteria: |
      両 SPEC に非意味修正6件とチェックリストが記載されていること。
    on_failure: |
      fix-and-reverify。記載不足を補正して再確認する。
  - id: TS-003
    target_item: AG-003
    verification: |
      agentdev-adr-guidelines SPEC の「後継 ADR を必要とする意味変更（6件）」サブセクションへ
      意味変更6件が列挙されているか確認する。
      REQ-001 へ意味変更6件が記載されているか確認する。
    pass_criteria: |
      両文書に意味変更6件が列挙されていること。
    on_failure: |
      fix-and-reverify。記載不足を補正して再確認する。
  - id: TS-004
    target_item: AG-004
    verification: |
      REQ-001 と agentdev-adr-guidelines SPEC へ直接更新前の明示承認記録、過去版無言書換禁止、
      意味変更の表記修正扱い禁止、Report への規範要件移行禁止が記載されているか確認する。
    pass_criteria: |
      4点の実行条件が両文書に記載されていること。
    on_failure: |
      fix-and-reverify。記載不足を補正して再確認する。
  - id: TS-005
    target_item: AG-005
    verification: |
      agentdev-adr-guidelines SPEC の「ADR-001 の移行時識別子の扱い」サブセクションへ
      WS-9 除去可（非意味ラベル）、案B ラベル除去可（決定内容維持）、10シナリオ抽象化は後継 ADR 必須、
      が記載されているか確認する。
    pass_criteria: |
      WS-9、案B、10シナリオの扱いが区別されて記載されていること。
    on_failure: |
      fix-and-reverify。記載不足を補正して再確認する。
  - id: TS-006
    target_item: AG-006
    verification: |
      agentdev-adr-guidelines SPEC へ 10シナリオの定義は SPEC、実行結果は Release Report、
      Release Report に規範表現なし、が記載されているか確認する。
    pass_criteria: |
      シナリオ定義と実行結果の配置先、Report 規範表現禁止が記載されていること。
    on_failure: |
      fix-and-reverify。記載不足を補正して再確認する。
  - id: TS-007
    target_item: AG-001
    verification: |
      document-model.md の「accepted ADR の意味的不変」セクションへ意味不変原則、6+6 分類の参照、
      正規所有（REQ-001、agentdev-adr-guidelines、agentdev-adr-file-manager、document-model）が記載されているか確認する。
    pass_criteria: |
      document-model へ意味不変原則の要約と正規所有参照が記載されていること。
    on_failure: |
      fix-and-reverify。記載不足を補正して再確認する。

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints:
    - ou: OU-001
      note: REQ-001 APPEND。req-save が消費。
    - ou: OU-002
      note: agentdev-adr-guidelines.md へ新セクション追記。spec-save が消費。
    - ou: OU-003
      note: agentdev-adr-file-manager.md へ新セクション追記。spec-save が消費。
    - ou: OU-004
      note: document-model.md へ新セクション追記。spec-save が消費。
    - ou: handoff
      note: |
        配布 skill と ADR-001 の改善（agentdev_handoff: true）。
        agentdev-adr-guidelines SKILL: accepted ADR 更新規則を反映。
        agentdev-adr-file-manager SKILL: 直接編集チェックリストを反映。
        ADR-001.md: WS-9 除去、案B ラベル除去（非意味修正として直接編集、後継 ADR 不要）。
        10シナリオの SPEC / Release Report 配置は別途 inspect-docs 等で扱う。
        case-open/case-run が配布 skill / ADR-001 変更 Issue を構成する。
```

# summary

accepted ADR の意味的不変契約を確定する要件doc。RU-0026 を単一ソースとし、REQ-001 APPEND、agentdev-adr-guidelines SPEC / agentdev-adr-file-manager SPEC / document-model.md の各 spec-update を出力する。配布 skill と ADR-001 の改善を含むため agentdev_handoff: true を付与。新規 ADR は作成しない。10シナリオ抽象化は後継 ADR 必須（RU-0026 / RU-0027 / RU-0028 で参照）。
