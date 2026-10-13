---
draft_type: req_draft
topic_slug: case-open-step4-verbatim-verification
status: draft
created_at: 2026-10-13T12:47:00Z
source_rus: [RU-0211]
agentdev_handoff: true
---

# draft-data

```yaml
# work_type: 検出ゲート不在の修正（取り込み漏れ事故の再発防止）。REQ ファイル修正（REQ-030 行追加）を伴うため bugfix から feature へ昇格。Decision 不要
work_type: feature

scale: standard

summary: case-open STEP-4 受入検査に「artifact_actions の合意済み content と適用後成果物の verbatim 包含突合」を追加する。適用済み content の逐語存在を突合し、不成立時は設計PRを作成せず停止する（fail-closed）。REQ-030 への新規行追加と case-open Design 機械工程 script 呼び出し契約節への契約追記を Definition とし、配布 skill reference（definition-pr-and-idempotency.md）への手順反映を実現面とする。代替案（prepare_definition_pr 報告 JSON への file sha256 付与）は主経路から不採用。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >
      case-open STEP-4 受入検査の新規義務（REQ-030-027 として追記）: artifact_actions の合意済み content と適用後成果物の verbatim 包含突合を実施する。
      適用済みと扱う各 content が適用後成果物へ存在することを確認し、突合不成立が判明した場合は設計PRを作成せず停止する（fail-closed）。
      PR 本文の検証記録は、適用後成果物への突合結果を根拠とする（適用予定内容の記述を適用済みの証拠としない）。既存の script 呼出フローと冪等再実行契約と非競合とする。
      背景事実: Case #3642 / PR #3643 で Design 追記が節見出し行のみ適用され合意済み本文段落 7 段落が PR 差分に不在のまま PR 本文が「verbatim 適用済み」と誤主張し、
      case-ready 忠実性機械検査で 4/7 ACT が MISSING 判定、case-ready 側で復元・修復 commit 430a1928・受入検査 4 ゲート再実行の上 merge された。
  - id: AG-002
    content: >
      突合ゲートの契約詳細は case-open Design「機械工程の script 呼び出し契約（RU-0162）」節へ分離する（Design 分離）。
      内容: 突合対象（適用済みと扱う全 action の content）、突合方法（適用後ファイルを直接読み、各段落・各行が逐語的に存在することを機械的検索で確認）、
      不成立条件（節見出しだけの適用、置換による黙示的欠落）、fail-closed の PR 抑止、欠落再適用は DefinitionEdit の旧文完全一致契約の範囲で冪等再実行と非競合、
      突合成立後の PR 本文検証記録の根拠規定、横展開規律（verbatim 適用を主張する検証記録には適用後成果物への包含突合〔または edit 単位の再現確認〕を伴う。同型の適用系操作全般へ適用）。
  - id: AG-003
    content: >
      代替案の検討結論: prepare_definition_pr 報告 JSON への適用後 file sha256 付与は主経路から不採用とする。
      根拠: (1) 本件の検出欠落（見出しのみ適用・本文段落欠落）は sha256 単独では原因特定に寄与せず、包含突合による逐語確認が欠落を直接検出する。
      (2) sha256 付与は script の報告契約変更（コード変更・テスト追随）を伴い、修正対象が広がる。
      (3) 包含突合の機械的検索結果自体が突合の証跡として機能する。script 強化（適用後 file sha256 の報告）は将来の独立性ある改善候補として検討記録に残す（本 Case の完了条件に含めない）。

conflict_resolutions:
  - id: CR-001
    conflict: 突合の主経路をモデル側の包含突合とするか、script 契約拡張（適用後 file sha256 報告）とするか
    resolution: >
      モデル側の包含突合（機械的検索による逐語確認）を主経路とし fail-closed ゲートを STEP-4 の PR 作成前に置く。AG-003 の根拠により script 契約拡張は不採用。
      case-ready 忠実性機械検査は既存のまま維持し（置換ではなく前段追加）、早期検出により PR 作成後の手戻りをなくす。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0211
    target_req: REQ-030
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    source_ru: RU-0211
    target_design: docs/designs/commands/case-open.md
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-030
    target_area: "## 要件（要件テーブル末尾・REQ-030-026 の直後に 1 行追記。anchor 見出し）"
    source_items: [AG-001]
    content: |
      | REQ-030-027 | case-open は STEP-4 受入検査で、artifact_actions の合意済み content と適用後成果物の verbatim 包含突合を実施すること。適用済みと扱う各 content が適用後成果物へ存在することを確認し、突合不成立が判明した場合は設計PRを作成せず停止すること（fail-closed）。PR 本文の検証記録は、適用後成果物への突合結果を根拠とすること。本検査は既存の script 呼出フローと冪等再実行契約と非競合とする |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: case-open
    target_area: "### 機械工程の script 呼び出し契約（RU-0162）（節末へ追記。anchor 見出し）"
    source_items: [AG-002]
    content: |

      #### artifact_actions 適用後の verbatim 包含突合（REQ-030-027）

      script 呼び出しによる Definition 適用の後、設計PR作成の前に、モデル側の受入検査として適用後成果物への突合を実行する。

      - 突合対象は、当該 Case の draft の artifact_actions のうち適用済みと扱う全 action の content とする。追記・置換の各 edit について、適用後ファイルを直接読み、合意済み content の各段落・各行が逐語的に存在することを機械的検索で確認する
      - 節見出しだけが適用され本文段落が欠落している状態、置換により既存記述が黙示的に欠落している状態は突合不成立とする
      - 突合不成立が判明した場合は設計PRを作成せず停止する（fail-closed）。欠落の再適用は DefinitionEdit の旧文完全一致契約の範囲で行い、冪等再実行の手順（適用済み工程の確認と不足分のみの再適用）と非競合とする
      - 突合成立後の PR 本文の検証記録は、適用後成果物への突合結果を根拠として記録する。適用予定内容の記述を適用済みの証拠として記録しない
      - verbatim 適用を主張する検証記録には、適用後成果物への包含突合（または edit 単位の再現確認）を伴う規律を、同型の適用系操作全般へ適用する

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      Definition 適用後の REQ-030 を読み、REQ-030-027 が要件テーブル末尾に 2 列構造で追記されていること（列数・列順が既存行と一致）を機械的突合で確認する。
      併せて、実現面適用後の definition-pr-and-idempotency.md の STEP-4 手順に突合手順が規定されていることを確認する。
    pass_criteria: |
      REQ-030-027 行が存在し、表列構造が既存行と一致する。STEP-4 手順に「適用後成果物への verbatim 包含突合」と「突合不成立時の PR 作成抑止（fail-closed）」が規定されていること。
    on_failure: |
      fix-and-reverify。行・手順の不備は content を修正して再適用し、再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      case-open Design の適用後本文を読み、「#### artifact_actions 適用後の verbatim 包含突合（REQ-030-027）」小節が機械工程の script 呼び出し契約節内に存在し、
      REQ-030-027 への参照・fail-closed 条件・冪等再実行との非競合記載が含まれることを確認する。既存の検査証拠保存契約・traceability gate 判定仕様との矛盾がないことを確認する。
    pass_criteria: |
      小節が存在し、(1) REQ-030-027 参照、(2) fail-closed 条件、(3) 冪等再実行との非競合の 3 点が記載され、既存節との矛盾が 0 件であること。
    on_failure: |
      fix-and-reverify。契約文の不備は Design content を修正して再適用し、再検証する。

realization_actions:
  - id: RA-001
    concern: case-open STEP-4 手順への適用後突合手順の追加（配布 skill reference の改修）
    responsibility: >
      case-open workflow skill の STEP-4 手順定義の正本保持（src/common/skills/agentdev-workflow-case-open/ 配下。投影先 .opencode/skills/agentdev-workflow-case-open/）。
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（STEP-4 機械工程手順への突合手順追加・主）
      - src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts（変更対象外。報告 JSON 拡張は不採用〔AG-003〕）
      - src/common/skills/agentdev-workflow-case-ready/references/definition-acceptance.md（変更対象外。忠実性機械検査は既存のまま維持）
    intent: >
      definition-pr-and-idempotency.md の STEP-4 機械工程手順へ「artifact_actions 適用後の verbatim 包含突合」手順（Design ACT-DESIGN-001 の契約に対応する実行手順）を追記する。
      PR 作成前の fail-closed 位置に置き、既存の prepare_definition_pr 呼出フロー・冪等再実行手順の構造を変更しない。
    verification_refs: [TS-001, TS-002]
    source_items: [AG-001, AG-002, AG-003]

review_dispositions:
  - id: RD-001
    source_ru: RU-0211
    source_item: case-open STEP-4 受入検査への artifact_actions 適用後突合の追加
    disposition: covered
    reason_code: adopted_with_main_target_selection
    reason: |
      元成果物が整理した反映先候補①（definition-pr-and-idempotency.md 手順追加・主）を採用し、契約の正として case-open Design へも追記（AG-002）。
      候補②（script 報告 JSON への sha256 付与）は AG-003 のとおり不採用、候補③（case-ready definition-acceptance.md）は忠実性機械検査が既存で機能した事実（4/7 ACT MISSING 検出）により変更不要と判定。
      横展開規律は ACT-DESIGN-001 の最終 bullet で契約表現済み。
      元成果物（learning promoted 成果物。prune 後は RU-0211 / learning タイトル「procedure-case-open-step4-artifact-actions-applied-verification」/ Case #3642 で識別可能）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0211.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []

assembly_evidence:
  - target_file: docs/requirements/REQ-030.md
    target_content_sha256: e0a4b5ed1cc352f7158bda740e3db61768ebbd0c0296321cb79a9831b9a9ebdc
    check_scope: { heading: "## 要件", start_line: 16, end_line: 46 }
    execution_conditions: { operation: append, edit_sha256: 264b034a1172647615bb7aadf56736cc8d83b5b20b0634029ac6022b710ee659, expected_old_count: null }
    checker: { name: assemble-draft-section, version: "0.1.0", settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: target section only }
    checks_summary: { pre: { count: 2, all_ok: true }, post: { count: 2, all_ok: true } }
    diff_compact: { changed_lines_count: 2, added: 2, removed: 0 }
    executed_at: 2026-10-13T12:42:22.702Z
  - target_file: docs/designs/commands/case-open.md
    target_content_sha256: dbe76c4797a91185b6ec2c81e37fcbe1b8219dd3991b5234d115d44ac75c339a
    check_scope: { heading: "### 機械工程の script 呼び出し契約（RU-0162）", start_line: 74, end_line: 86 }
    execution_conditions: { operation: append, edit_sha256: b49f32b283e8834920b2783a41febb5ea0af0b63baec983a367867de4e4b80e0, expected_old_count: null }
    checker: { name: assemble-draft-section, version: "0.1.0", settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: target section only }
    checks_summary: { pre: { count: 2, all_ok: true }, post: { count: 2, all_ok: true } }
    diff_compact: { changed_lines_count: 11, added: 11, removed: 0 }
    executed_at: 2026-10-13T12:42:22.791Z

case_open_hints:
  epic_needed: false
  decomposition:
  wave_hints:
    - >
      新規 REQ 行 REQ-030-027 の design 対応は ACT-DESIGN-001（case-open Design 追記）が成立させる（missing-design 0 件ゲート前置確認）。
      Definition 適用時、REQ-030-027 を traceability sidecar（agentdev-workflow-case-open.yaml の design 宣言）へ追随反映すること（REQ-030-024 の集合一致確認と対応関係更新手順に従う）。
    - 代替案不採用（AG-003）により prepare_definition_pr.ts の報告 JSON は変更しない。
```

# summary

Case #3642 で Design 追記の見出しのみ適用・本文段落欠落が case-open STEP-4 で検出されず、PR 本文が「verbatim 適用済み」と誤主張した事故の再発防止として、STEP-4 受入検査に「合意済み content と適用後成果物の verbatim 包含突合（不成立時は PR 作成抑止〔fail-closed〕）」を追加する。REQ-030-027 追加（REQ）+ case-open Design 機械工程 script 呼び出し契約節への契約追記（Design）を Definition とし、配布 skill reference（definition-pr-and-idempotency.md）への手順反映を実現面とする。sha256 付与の代替案は script 契約変更を伴うため不採用（検討記録として保持）。case-ready 忠実性機械検査は既存のまま前段追加とする。
