---
draft_type: req_draft
topic_slug: case-auto-delegation-design-status
status: draft
created_at: 2026-10-13T12:48:00Z
source_rus: [RU-0213]
agentdev_handoff: true
---

# draft-data

```yaml
# work_type: 工程漏れ不具合（委譲指示から Design 状態評価が脱落し Design が draft 残置）の根本原因修正。変更面は Design 文書のみ、REQ ファイル修正なし
work_type: bugfix

scale: standard

summary: case-auto Design「委譲指示の構築規律（case-ready・case-close の並列委譲起動）」節へ、stage 4（case-close 委譲起動）の委譲指示 MUST DO に Design 状態評価（棚卸し制）と Design README status 列更新を必須項目として含める規律と、委譲先 workflow skill の STEP 表・MUST DO 義務を網羅確認してから委譲指示を構築する規律を追加する。case-close 側の棚卸し評価手順（REQ-032-024〜026）は変更しない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >
      case-auto Design（docs/designs/commands/case-auto.md）「委譲指示の構築規律（case-ready・case-close の並列委譲起動）」節（L223-230）へ 1 項目を追記する。
      内容: stage 4（case-close 委譲起動）の委譲指示の MUST DO には、Design 状態評価（対象 REQ に関係する draft Design の棚卸し制）と Design README（docs/designs/README.md）status 列更新を
      必須項目として含める。委譲指示は、委譲先 workflow skill が契約する STEP 表と MUST DO 義務を網羅確認してから構築し、指示から落ちた工程が委譲先で実行されないことを前提に項目漏れを作らない。
      本項目は case-close の Design 状態評価契約（REQ-032-024〜026）の実行を委譲指示構築側で確実にする規律であり、case-close 側の棚卸し評価手順は変更しない。
      背景事実: Epic #3653/#3654 の最終 case-close 委譲指示に Design 状態評価が含まれず、両 v51 Design が status draft のまま両 Epic がクローズされた。
      親側最終検証で draft 残存を検出し、親が case-close STEP-3-2 相当の棚卸し評価を実施して回復（両 Design accepted 昇格・README 一覧登録・commit ee2a1bd1）。
      根本原因は本節の必須項目列挙の不在。
  - id: AG-002
    content: >
      対象外と横展開の確定: case-close STEP-3-2 の棚卸し評価手順自体、Epic Wave クローズ契約、capture 回収契約は変更しない。
      case-run への横展開は対象外とする（case-run は case-auto 自身が読込主体のインライン実行であり委譲起動対象ではない〔REQ-034-007〕。STEP 表網羅確認の一般規律は本節の委譲指示構築〔stage 2・stage 4〕に適用する）。
      REQ 行の追加は行わない（case-close の棚卸し行為は REQ-032-024/026 が既に要求しており、不足は case-auto Design の委譲指示構築規律の項目列挙であり Design 詳細に帰属）。

conflict_resolutions:
  - id: CR-001
    conflict: Design 状態評価の必須項目化を REQ 行（REQ-034 系）として新設するか、Design 構築規律の追加に留めるか
    resolution: >
      Design 詳細とした。REQ-032-024/026 が既に case-close の棚卸し行為を要求しており、本件は「委譲指示構築時にその義務が指示へ漏れやすい」という構築規律の問題であり、
      委譲指示の構築方法は workflow Design が所有する内部規則（document-model の Design 帰属）。新規 REQ 行は既存行為要件の重複になる。
      対論型レビューの反証（case-ready 委譲〔stage 2〕への適用可否）に対しては、case-ready は Design 昇格を実行しないため MUST DO 必須項目は stage 4 限定とし、
      STEP 表網羅確認の一般規律のみ stage 2 も含めて適用すると明記して解消した。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0213
    target_design: docs/designs/commands/case-auto.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: case-auto
    target_area: "### 委譲指示の構築規律（case-ready・case-close の並列委譲起動）（節末・既存 4 bullets の直後に追記。anchor 見出し）"
    source_items: [AG-001]
    content: |
      - stage 4（case-close 委譲起動）の委譲指示の MUST DO には、Design 状態評価（対象 REQ に関係する draft Design の棚卸し制）と Design README（docs/designs/README.md）status 列更新を必須項目として含める。委譲指示は、委譲先 workflow skill が契約する STEP 表と MUST DO 義務を網羅確認してから構築し、指示から落ちた工程が委譲先で実行されないことを前提に項目漏れを作らない。本項目は case-close の Design 状態評価契約（REQ-032-024〜026）の実行を委譲指示構築側で確実にする規律であり、case-close 側の棚卸し評価手順は変更しない

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      適用後の docs/designs/commands/case-auto.md を読み、「委譲指示の構築規律（case-ready・case-close の並列委譲起動）」節内に追記 bullet が存在し、
      (1) Design 状態評価（棚卸し制）、(2) Design README status 列更新、(3) STEP 表・MUST DO 義務の網羅確認規律、(4) REQ-032-024〜026 参照と case-close 手順不変の明記、
      の 4 点を機械的検索（rg による見出し・文言確認）で確認する。併せて追記が節末に位置し既存 4 bullets と矛盾しないことを確認する。
    pass_criteria: |
      4 点が節内に存在し、既存 bullets（並列起動・局所直列化・並列起動不能停止・検査の区別）との矛盾が 0 件であること。
    on_failure: |
      fix-and-reverify。追記位置・文言の不備は content を修正して再適用し、再検証する。

review_dispositions:
  - id: RD-001
    source_ru: RU-0213
    source_item: case-auto Design 委譲指示構築規律への Design 状態評価必須項目化
    disposition: covered
    reason_code: adopted_as_design_discipline_addition
    reason: |
      要求の本体（委譲指示 MUST DO への Design 状態評価・README status 列更新の必須項目化）は ACT-DESIGN-001 で covered。
      元成果物の受け入れ条件 3 点（必須項目列挙、README status 列更新含有、既存契約との非競合）は content と TS-001 の合格基準で表現済み。
      横展開（STEP 表網羅確認規律）は AG-002 のとおり case-run を対象外としつつ本節の委譲指示構築へ表現。
      元成果物（learning promoted 成果物。prune 後は RU-0213 / learning タイトル「procedure-case-auto-stage4-case-close-delegation-design-status-review」/ Case #3653・#3654 で識別可能）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0213.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []

assembly_evidence:
  - target_file: docs/designs/commands/case-auto.md
    target_content_sha256: 7aa60fe7cd17216f2f3b95a58b1e8c07451f2bdb23528adde4dcc7486232d822
    check_scope: { heading: "### 委譲指示の構築規律（case-ready・case-close の並列委譲起動）", start_line: 223, end_line: 231 }
    execution_conditions: { operation: append, edit_sha256: 6e54043709854497fa0fa38eb34795a6bfc80c77412be95bf6fd082b98f3fccd, expected_old_count: null }
    checker: { name: assemble-draft-section, version: "0.1.0", settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only", scan_scope: target section only }
    checks_summary: { pre: { count: 2, all_ok: true }, post: { count: 2, all_ok: true } }
    diff_compact: { changed_lines_count: 2, added: 2, removed: 0 }
    executed_at: 2026-10-13T12:42:22.791Z

case_open_hints:
  epic_needed: false
  decomposition:
  wave_hints:
    - >
      finding 由来 design 操作の target_design 実パス実在確認済み（3点一致: docs/designs/commands/case-auto.md 実在、節見出し文言「委譲指示の構築規律（case-ready・case-close の並列委譲起動）」の本文一意一致〔assemble-draft-section 検査で match_count 1〕、該当行 L223）。
    - 本 draft の Design 変更は既存 REQ 行の Design 対応の充実であり、sidecar 宣言の追加・変更は不要（case-auto Design の対応関係集合は不変）。
```

# summary

case-auto stage 4（case-close 委譲起動）の委譲指示 MUST DO に Design 状態評価が含まれず、両 v51 Design が status draft のまま Epic がクローズされた事故の根本原因（委譲指示の構築規律節の必須項目列挙不在）を修正する。対象節へ、Design 状態評価（棚卸し制）と Design README status 列更新の必須項目化、および委譲先 workflow skill の STEP 表・MUST DO 義務の網羅確認規律を追加する。case-close 側の棚卸し手順（REQ-032-024〜026）と Epic Wave クローズ契約・capture 回収契約は変更しない。case-run はインライン実行のため横展開対象外。
