---
draft_type: req_draft
topic_slug: adr-001-cleanup-and-required-scenarios
status: saved
created_at: 2026-07-27T00:00:00+09:00
source_rus:
  - RU-0007
agentdev_handoff: true
spec_actions_consumed: true
---

<!-- 本ドラフトは AgentDevFlow 本体の不具合・改善点を扱う前工程引き継ぎドラフトである（agentdev_handoff: true）。 -->

# draft-data

```yaml
work_type: maintenance

scale: large

summary: |
  RU-0007（ADR-001 cleanup）を処理する。L101 `WS-9` と L102 `案B` は非意味修正（移行時ラベル除去）として
  accepted ADR 直接編集で対応する。L114 `10シナリオ` は代替文「SPECが定義する10件の必須シナリオをすべて通過する」を
  適用するため、10件の必須シナリオを列挙する正規SPEC（docs/specs/quality/quality-specs.md の新規セクション）を整備する。
  10シナリオの一覧（名称、合格基準、関連 REQ）を本ドラフトで定義する。
  accepted ADR 直接編集前に明示承認記録を残す（REQ-001-059、媒体は非規定）。
  新規 ADR 不要（agentdev-adr-file-manager の accepted ADR 直接編集チェックリストに従う）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      RU-0007: docs/adr/ADR-001.md L101 の `WS-9 で対応` を削除する（非意味修正、移行時ラベル除去）。
      決定内容「Local backend を必須範囲に維持。仕様は最小契約へ縮小」は不変。
      REQ-001-057「移行時ラベル除去」に該当。accepted ADR 直接編集可。
  - id: AG-002
    content: |
      RU-0007: docs/adr/ADR-001.md L102 の `案B（承認済 change brief）` から案番号 `案B` のみを削除する
      （非意味修正、移行時ラベル除去）。決定内容「承認済 change brief へ縮小」は不変。
      REQ-001-057「移行時ラベル除去」に該当。accepted ADR 直接編集可。
  - id: AG-003
    content: |
      RU-0007: docs/specs/quality/quality-specs.md へ新規セクション「必須シナリオ（10シナリオ）」を追加する。
10シナリオの一覧（名称、合格基準、関連 REQ）を quality-specs.md の新規セクションとして定義する。
ADR-001 決定6 のリリース条件に関連するワークフローパスから10件を抽出し、各シナリオに合格基準を設定する。
  - id: AG-004
    content: |
      RU-0007: docs/adr/ADR-001.md L114 の `4. 必須シナリオ（10シナリオ）が通る` を
      `4. SPECが定義する10件の必須シナリオをすべて通過する` へ変更する（非意味修正、補助情報修正）。
      件数「10件」と必達性は維持し、シナリオ定義の参照先（docs/specs/quality/quality-specs.md）を補足する変更。
      REQ-001-057「補助情報修正」に該当。accepted ADR 直接編集可。
      ※ 10件のシナリオ一覧が docs/specs/quality/quality-specs.md に整備されていることを前提とする（AG-003）。
  - id: AG-005
    content: |
      RU-0007: accepted ADR 直接編集前に明示承認記録を残す（REQ-001-059）。
      対象変更（L101/L102 のラベル除去、L114 の参照先補足）に対する明示承認を読み取れること。
      保存媒体は REQ-001-059 で非規定（Issue、PR、その他の媒体を問わない）。

artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-append
    target_spec:
      operation: update
      domain: quality
      slug: quality-specs
    target_area: "## 必須シナリオ（10シナリオ）"
    source_items: [AG-003]
    spec_logical_division: catalog
    canonical_owner: quality-specs
    content: |
      ## 必須シナリオ（10シナリオ）

      ADR-001 決定6 のリリース条件「必須シナリオ（10シナリオ）が通る」が参照する10シナリオの正規一覧を所有する。
      シナリオ定義は本 SPEC が所有し、実行結果は Release Report が所有する（agentdev-adr-guidelines「参照先明確化」）。

      ### 10シナリオ一覧

      | ID | シナリオ名 | 合格基準 | 関連 REQ |
      |----|-----------|---------|---------|
      | S-001 | 単一REQ保存 | req-save がREQファイルへ要件行を保存し check-frontmatter-consistency.ts が ok を返す | REQ-008 |
      | S-002 | SPECセクション保存 | spec-save が target_area ベースでSPECへセクション追記・置換を行い search-target-area.ts が正しくマッチする | REQ-008 |
      | S-003 | Issue作成 | case-open が draft-data から Issue 本文を生成し QG-2 が通る | REQ-006 |
      | S-004 | 標準実行 | case-run が単一 Issue を実行し PR を作成する | REQ-006 |
      | S-005 | 標準クローズ | case-close が PR を merge し Issue を close し capture を実施する | REQ-006 |
      | S-006 | Epic Wave実行 | case-open が Epic Issue を作成し case-run が Wave 内子 Issue を並列実行し Epic が close される | REQ-006 |
      | S-007 | 全自動実行 | case-auto が draft から merge まで自走し main へ反映される | REQ-006 |
      | S-008 | GitHub課題取り込み | intake-from-github が課題を抽出し intake-promote が採用/却下を判定する | REQ-007 |
      | S-009 | 学びの捕捉と昇格 | case-close が learning を capture し learning-promote が評価・採用する | REQ-007 |
      | S-010 | 文書整合性検証 | docs-check / inspect-docs が REQ/ADR/SPEC の整合性を検証し全て ok を返す | REQ-010 |

      ### ADR-001 L114 との参照関係

      ADR-001 決定6 条件4「SPECが定義する10件の必須シナリオをすべて通過する」は本セクションを正規参照先とする。
  - id: ACT-ADR-001
    artifact: adr
    operation: update
    target: docs/adr/ADR-001.md
    source_items: [AG-001, AG-002, AG-004, AG-005]
    content: |
      docs/adr/ADR-001.md の3箇所を変更する（非意味修正、accepted ADR 直接編集）:

      ### L101 の変更

      変更前:
      | Local backend | 必須範囲に維持。仕様は最小契約へ縮小（WS-9 で対応） |

      変更後:
      | Local backend | 必須範囲に維持。仕様は最小契約へ縮小 |

      根拠: `WS-9` は移行時の作業識別子であり、決定内容を変えない（REQ-001-057 移行時ラベル除去）。

      ### L102 の変更

      変更前:
      | draft 形式 | 案B（承認済 change brief）へ縮小。詳細は別途 REQ で定義 |

      変更後:
      | draft 形式 | 承認済 change brief へ縮小。詳細は別途 REQ で定義 |

      根拠: `案B` は検討過程の識別子であり、決定内容を変えない（REQ-001-057 移行時ラベル除去、案番号のみ除去）。

      ### L114 の変更

      変更前:
      4. 必須シナリオ（10シナリオ）が通る

      変更後:
      4. SPECが定義する10件の必須シナリオをすべて通過する

      根拠: 件数「10件」と必達性は維持し、シナリオ定義の所有先（docs/specs/quality/quality-specs.md「必須シナリオ（10シナリオ）」セクション）
      を補足する変更（REQ-001-057 補助情報修正）。

      ### accepted ADR 直接編集チェックリスト（agentdev-adr-file-manager）

      本変更は agentdev-adr-file-manager skill の accepted ADR 直接編集チェックリストに従う:
      - 非意味修正6件（REQ-001-057）のいずれかに該当: L101/L102 は「移行時ラベル除去」、L114 は「補助情報修正」
      - 意味変更6件（REQ-001-058）のいずれにも該当しない
      - 直接更新前に明示承認記録が存在する（REQ-001-059）
      - 過去版を無言で書き換えない（REQ-001-060）

conflict_resolutions:
  - id: CR-001
    conflict: L114 `10シナリオ` の意味変更 vs 非意味修正判定
    resolution: |
      L114 の「必須シナリオ数（10）」を SPEC 側で変更可能な動的条件（「SPEC が定義する必須シナリオ数」）へ変更する場合は
      必須条件/制約変更（REQ-001-058）=意味変更で後継 ADR が必要。
      しかし本ドラフトでは件数「10件」と必達性を維持し、シナリオ定義の所有先を補足するのみ（REQ-001-057 補助情報修正）のため非意味修正。
      deep-review 5レーン検証（レーン1 目的・制約、レーン3 統制・ガバナンス CG-02/03）で確認済み。
  - id: CR-002
    conflict: 10シナリオ一覧の整備場所
    resolution: |
      docs/specs/quality/quality-specs.md の新規セクション「必須シナリオ（10シナリオ）」とする。
      理由: 品質基準を所有する SPEC であり、シナリオ合格基準との親和性が高いため。
      10シナリオは ADR-001 決定6 のリリース条件に関連するワークフローパスから抽出し本ドラフトで定義済み。
  - id: CR-003
    conflict: 承認記録の保存媒体（case-run Issue/PR か、その他か）
    resolution: |
      REQ-001-059 は事前の明示承認記録の存在を要求するが、保存媒体は非規定。
      「IssueまたはPRへの承認記録は許容される」という推論を避け、「媒体は非規定、対象変更に対する明示承認を読み取れること」とする。
      deep-review 5レーン検証（レーン5 証拠・検証可能性 EV-03）で確認済み。
  - id: CR-004
    conflict: ADR 要否
    resolution: |
      新規 ADR 不要。accepted ADR 直接編集で対応（agentdev-adr-file-manager のチェックリストに従う）。
      deep-review 5レーン検証（レーン3 統制・ガバナンス）で確認済み。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0007
    target_spec: docs/specs/quality/quality-specs.md
    operation: spec-append
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0007
    target_req: ADR-001
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs/adr/ADR-001.md L101 から `WS-9` が削除されていることを確認する。
      決定内容「Local backend を必須範囲に維持。仕様は最小契約へ縮小」が維持されていること。
    pass_criteria: |
      L101 に `WS-9` が存在せず、決定内容本文が維持されていること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-002
    target_item: AG-002
    verification: |
      docs/adr/ADR-001.md L102 から案番号 `案B` が削除されていることを確認する。
      決定内容「承認済 change brief へ縮小」が維持されていること。
    pass_criteria: |
      L102 に `案B` が存在せず、決定内容本文が維持されていること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-003
    target_item: AG-003
    verification: |
      docs/specs/quality/quality-specs.md に新規セクション「必須シナリオ（10シナリオ）」が追加されていることを確認する。
      セクション内に10シナリオの枠組み（シナリオ1〜10）が定義されていること。
      各シナリオの名称、合格基準、関連 REQ が定義されていること。
    pass_criteria: |
      docs/specs/quality/quality-specs.md に「必須シナリオ（10シナリオ）」セクションと10シナリオの枠組みが存在すること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-004
    target_item: AG-004
    verification: |
      docs/adr/ADR-001.md L114 が `SPECが定義する10件の必須シナリオをすべて通過する` へ変更されていることを確認する。
      件数「10件」と必達性「すべて通過する」が維持されていること。
      docs/specs/quality/quality-specs.md「必須シナリオ（10シナリオ）」セクションへの参照関係が成立していること。
    pass_criteria: |
      L114 に変更後の文面が存在し、件数と必達性が維持され、quality-specs.md の該当セクションが実在すること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-005
    target_item: AG-005
    verification: |
      accepted ADR 直接編集前に明示承認記録が残されていることを確認する。
      対象変更（L101/L102/L114）に対する明示承認を読み取れること。
      保存媒体は非規定（REQ-001-059）。
    pass_criteria: |
      L101/L102/L114 の各変更に対する明示承認記録が存在し、対象変更と承認内容が読み取れること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。明示承認記録が存在しない場合は追加して再検証。

review_dispositions:
  - id: RD-001
    source_ru: RU-0007
    source_item: RU-0007-Sources-adr-001-cleanup
    disposition: covered
    reason_code: fully_integrated
    reason: |
      RU-0007 の Source Summary が指摘する「accepted ADR-001 の移行時識別子残存と L114 の曖昧さ」は
      AG-001〜AG-005 で完全に統合された。L101/L102 のラベル除去、L114 の参照先明確化、10シナリオ一覧整備、
      承認記録要件を全て反映。
    evidence:
      path: .agentdev/backlog/req-units/RU-0007.md
      section: Source Summary
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  decomposition: |
    scale: large（10シナリオ一覧整備 + ADR-001 直接編集 + 承認記録）だが、単一 Issue で完結する。
    OU-001（quality-specs.md 新規セクション）→ OU-002（ADR-001 直接編集）の順で実施。
    10シナリオの一覧は本ドラフトで定義済み。case-run 工程で追加調査は不要。
  wave_hints:
    - wave: 1
      units: [OU-001, OU-002]
      rationale: 単一 Issue 内で順次実行。
```

# implementation_details

本セクションは case-run 工程で実施する実装詳細（Step 10-1 ガイドラインに基づく分離）。

## 明示承認記録

- accepted ADR 直接編集前に、対象変更（L101/L102/L114）に対する明示承認を記録
- 媒体は非規定（REQ-001-059）。Issue、PR、またはその他の媒体で、対象変更と承認内容が読み取れること
- agentdev-adr-file-manager skill の accepted ADR 直接編集チェックリストに従う

## 実装スコープへの注意

実装詳細は本ドラフトの要件定義本体ではなく、case-run 工程での参照情報である。
要件定義としての原本は上記 `# draft-data` YAML ブロック。

# summary

本ドラフトは RU-0007（ADR-001 cleanup + 10シナリオ一覧整備）を処理する要件定義である。AgentDevFlow 本体の改善（agentdev_handoff: true）。

deep-review 5レーン検証で確定した設計判断1を全面的に反映。L101/L102 は非意味修正（移行時ラベル除去）、L114 は非意味修正（補助情報修正）として accepted ADR 直接編集で対応。10シナリオ一覧は docs/specs/quality/quality-specs.md の新規セクションとして整備。

主要な変更対象は ADR-001 と docs/specs/quality/quality-specs.md。scale: large（ADR-001 直接編集の承認記録 + 10シナリオ定義を含むため）。

後続コマンドは spec-save（quality-specs.md 新規セクション追加）→ req-save（ADR-001 直接編集、REQ/ADR ファイルとして保存、新規 ADR なし）→ case-open → case-run（明示承認記録の整備）を想定。
