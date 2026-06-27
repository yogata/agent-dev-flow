# draft-data

```yaml
status: saved
topic: docs-chore-vocabulary-and-reference-corrections
work_type: docs_chore
scale: lightweight
summary: >
  ドキュメントの語彙ズレ・参照切れ・範囲陳腐化の3件を統合した docs_chore ドラフト。
  RU-0019（REQ-0141 昇格に伴う語彙ズレ3ファイル）は SPEC 修正対象。
  RU-0015（project-docs-and-specs.md REQ範囲陳腐化）は主問題解消済み、横展開確認が残課題。
  RU-0014（REQ-0114 歴史的叙述残存）は参照された REQ-0108-205 が現行体系に存在せず、
  blockquote は既に「破壊的 UPDATE ノート」として明示ラベル付け済みのため追加修正不要。

auto_gate:
  auto_ready: true
  unresolved_questions:
    - id: UQ-001
      item: RU-0014 が参照する REQ-0108-205（歴史的文脈配置先規定）の存在
      resolution: >
        Inferred。docs/requirements/ 全ファイルを grep 検索した結果、REQ-0108-205 は
        現行REQ体系に存在しない。REQ-0108 の要件番号は 156 から 252 へ飛んでおり、
        157-251 の番号帯に要件が不存在。RU-0014 の抵触根拠が失効している。
        REQ-0114 L114-120 の blockquote は「REQ-0114-088 破壊的 UPDATE ノート（CR-001）」
        として明示的にラベル付けされており、歴史的文脈であることが判別可能。
        追加修正は不要と判断する。
    - id: UQ-002
      item: RU-0015 project-docs-and-specs.md の docs-check NG 継続状況
      resolution: >
        Confirmed/Inferred。project-docs-and-specs.md L26 は既に「REQ-0101 から REQ-0156
        までの 48 件」に更新済み。実ファイル数（glob: 48件、最高 REQ-0156）と一致。
        RU-0015 作成時点（REQ-0152/44件）から更新されている。docs-check NG の継続有無は
        case-open で確認する。
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >
      REQ-0114 L114-120 の blockquote「REQ-0114-088 破壊的 UPDATE ノート（CR-001）」は、
      破壊的変更の記録として REQ-0114-088 の現行要件定義に不可欠な文脈を提供する。
      RU-0014 が参照する REQ-0108-205（歴史的文脈配置先規定）は現行REQ体系に存在せず、
      抵触根拠が失効している。既存の「破壊的 UPDATE ノート」ラベルにより歴史的文脈
      であることが明示されており、REQ-0114 への追加修正は行わない。
      case-open で他 REQ ファイルにラベルなし歴史的叙述が残存しないか確認する。
    source: RU-0014
    classification: Inferred
  - id: AG-002
    content: >
      project-docs-and-specs.md L26 は「REQ-0101 から REQ-0156 までの 48 件」と既に
      更新済みであり、実ファイル数（48件）と一致する。RU-0015 作成時点の陳腐化
      （REQ-0152/44件）は解消済み。横展開で他のガイド/SPEC に同様の REQ 範囲記載が
      ないか確認し、docs-check の req-range-staleness が OK になることを確認する。
    source: RU-0015
    classification: Confirmed
  - id: AG-003
    content: >
      docs/specs/local/local-generation.md L55 の「廃止候補とする」および L66-67 の
      「廃止候補」は、PR#1195 で transform/ ディレクトリが完全削除され REQ-0141-004/009/028
      が確定廃止へ昇格したため、「確定廃止」へ是正する。
    source: RU-0019
    classification: Confirmed
  - id: AG-004
    content: >
      docs/requirements/README.md L45 の REQ-0141 エントリタイトル「ローカル版 OpenCode
      生成方式とローカルCaseファイル運用」は、REQ-0141 frontmatter の SSoT タイトル
      「ローカル版 OpenCode 導入方式とローカルCaseファイル運用」に合わせて「導入方式」
      へ是正する。
    source: RU-0019
    classification: Confirmed
  - id: AG-005
    content: >
      docs/specs/integrity/rule-ownership.md L44 の行34（local-transform）が参照する
      `transform/generate.md`、`transform/review.md`、`transform/spec.md` は PR#1195 で
      削除済み。当該行は確定廃止された local-transform ルールの参照であるため、
      「確定廃止」マーカーを付与するか行自体を削除する。
    source: RU-0019
    classification: Confirmed

artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/local/local-generation.md
    target_area: "### 廃止対象"
    source_items: [AG-003]
    content: |
      ### 廃止対象

      `src/opencode-local/transform/` と `src/opencode-local/generation-flow.md` は link mode では不要のため確定廃止とする（AG-011, ADR-0131 decision #4、PR#1195 で完全削除済み、REQ-0141-004/009/028 確定廃止昇格）。
    note: L66-67 のディレクトリ一覧内「廃止候補」も「確定廃止」へ併せて是正する
  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target: docs/specs/integrity/rule-ownership.md
    target_area: "| 34 | local-transform"
    source_items: [AG-005]
    content: |
      | 34 | local-transform（ローカル版変換プロンプト） | REQ-0141 (028, 029, 032) | local-transform.md | **確定廃止**（PR#1195 で transform/ 完全削除、REQ-0141-004/009/028 確定廃止昇格）。変換用プロンプト、レビュー用プロンプト、変換仕様の要件は全て廃止済み |
    note: 変更後セクション全文（行34の内容を確定廃止マーカー付きへ更新）

conflict_resolutions:
  - id: CR-001
    item: REQ-0108-205（歴史的文脈配置先規定）の不存在
    resolution: >
      RU-0014 が参照する REQ-0108-205 は現行REQ体系に存在しない（grep検索結果: No matches）。
      REQ-0108 の要件番号は 156 から 252 へ飛んでおり、157-251 番号帯に要件不存在。
      RU-0014 の抵触根拠が失効しているため、REQ-0114 blockquote への追加修正は不要。
    classification: Inferred

operation_units:
  - ou_id: OU-001
    source_ru: RU-0019
    target_spec: docs/specs/local/local-generation.md
    operation: spec-update
    scale: lightweight
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0019
    target_spec: docs/specs/integrity/rule-ownership.md
    operation: spec-update
    scale: lightweight
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: "RU-0015, RU-0019"
    operation: case-open-only
    scale: lightweight
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-0014
    operation: case-open-only
    scale: lightweight
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-003
    verification: >
      docs/specs/local/local-generation.md の L55, L66, L67 を確認し、
      「廃止候補」の表記が「確定廃止」に是正されていることを確認する。
    pass_criteria: >
      local-generation.md 内に「廃止候補」の表記が存在しないこと。
      「確定廃止」の表記が L55, L66, L67 に反映されていること。
    on_failure: |
      action: fix-and-reverify
      description: 「廃止候補」が残存する場合、当該箇所を「確定廃止」へ修正して再確認する。
  - id: TS-002
    target_item: AG-005
    verification: >
      docs/specs/integrity/rule-ownership.md の行34（local-transform）を確認し、
      transform/generate.md 等の削除済みパス参照が「確定廃止」マーカーに置き換えられている
      ことを確認する。
    pass_criteria: >
      rule-ownership.md 行34 に transform/ 配下の削除済みファイルパスへの参照が
      存在しないこと。確定廃止であることが明記されていること。
    on_failure: |
      action: fix-and-reverify
      description: 削除済みパス参照が残存する場合、当該行を修正して再確認する。
  - id: TS-003
    target_item: AG-002
    verification: >
      project-docs-and-specs.md L26 の REQ 範囲記載が実ファイル数と一致することを確認し、
      他ガイド/SPEC に同様の REQ 範囲記載がないか grep で確認する。
      docs-check を実行し req-range-staleness が OK になることを確認する。
    pass_criteria: >
      全ガイド/SPEC の REQ 範囲記載が実ファイル数と一致すること。
      docs-check の req-range-staleness が OK になること。
    on_failure: |
      action: fix-and-reverify
      description: >
        範囲記載に陳腐化が残存する場合、当該ファイルを修正して再確認する。

case_open_hints:
  epic_needed: false
  wave_hints:
    wave_1: [OU-001, OU-002]
    wave_2: [OU-003, OU-004]
```

## 補助情報

### RU-0014 の位置付け

RU-0014 は REQ-0114 L114-120 の blockquote「REQ-0114-088 破壊的 UPDATE ノート（CR-001）」が
REQ-0108-205（歴史的文脈配置先規定）に抵触すると主張する。しかし grep 検索の結果、
REQ-0108-205 は現行REQ体系に存在しない（REQ-0108 の要件番号は 156→252 へ飛番）。
既存の「破壊的 UPDATE ノート」ラベルにより歴史的文脈であることが明示されており、
追加修正は不要。case-open で他 REQ ファイルのラベルなし歴史的叙述の有無を確認する。

### RU-0015 の位置付け

project-docs-and-specs.md L26 は既に「REQ-0101 から REQ-0156 までの 48 件」に更新済み。
実ファイル glob 結果（48件、最高 REQ-0156）と一致。RU-0015 作成時点の陳腐化は解消済み。
横展開確認と docs-check OK 確認を case-open で実施する。

### RU-0019 の位置付け

PR#1195 で REQ-0141-004/009/028 を確定廃止へ昇格し transform/ を完全削除したが、
3ファイルの語彙・参照が旧状態のまま残置。local-generation.md の「廃止候補」→「確定廃止」、
rule-ownership.md の transform/ パス参照是正を SPEC 修正として実施する。
README.md L45 のタイトル是正（「生成方式」→「導入方式」）は case-open で実施する。
