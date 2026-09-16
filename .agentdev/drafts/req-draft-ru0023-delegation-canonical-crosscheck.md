---
draft_type: req_draft
topic_slug: ru0023-delegation-canonical-crosscheck
status: draft
created_at: 2026-09-16T00:00:00+09:00
source_rus:
  - RU-0023
---

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
work_type: maintenance

# summary: 当該 draft が何を合意したかの1段落要約
summary: 委譲 context に含まれる補助サマリ（Draft operations summary 等、正典から導出可能な補助情報）が正典（draft の artifact_actions 等の正規成果物）と一致しない事例（Case #2850 Batch 4 でサマリが REQ-004 を誤掲し REQ-059 を欠落）を受け、正典から導出した補助情報の機械突合と不一致時の正典優先を REQ-017 への APPEND（公開契約）と delegation-contracts.md「structured_context の SSoT 抽出制約」節への追記（Design 詳細）で明文化する。実行側の draft 全文読取義務により実害は限定的だが、GitHub 上への一時的誤記載の実績があり、正典優先原則の契約規定が不在である。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目
agreed_items:
  - id: AG-001
    content: 委譲 prompt の生成側（case-run / case-auto）は、正典から導出可能な補助情報（対象一覧・Draft operations summary 等のサマリ）を委譲 prompt へ含める場合、当該補助情報を正典と機械突合可能な形式で記述すること。機械突合の対象には正典（Issue 本文、正規 REQ、draft の artifact_actions 等の正規成果物）から機械的に列挙できる対象集合（対象ファイル、対象 REQ、対象成果物パス等）を含める。補助情報の記述は正典を複製して正典の情報源とすることなく、突合可能性を損なう自由形式の要約に限定しない。根拠：docs/designs/workflows/delegation-contracts.md「structured_context の SSoT 抽出制約」節が保有する機械突合は委譲 prompt 生成時の Issue 番号と対象成果物パスの突合のみであり（実ファイル照合 2026-09-16）、正典から導出した補助サマリと正典の突合要求は存在しない。Case #2850（Batch 4、RU-0016）では補助サマリが更新対象として REQ-004 を挙げ REQ-059 を欠落させ、実際の ACT-REQ-001〜009 は REQ-059 を含む 8 ファイルが対象で REQ-004 は対象外であり、サマリ誤記が Root Case 本文の対象 REQ セクションへ一度混入し issue_update の埋め戻し時に修正を要した。
  - id: AG-002
    content: 委譲を受けた実行側（実行担当サブエージェント等の受領者）は、補助情報と正典の不一致を検出した場合、正典を優先すること。補助情報を根拠とした対象判断・本文更新・実行継続を行わず、不一致の検出自体を親エージェントへ報告する。正典の読取義務（draft 全文読取等の workflow 契約）が消費側の一次防御として維持されることを前提とし、正典優先は補助情報の誤記が正典の読取を経由せず外部へ伝播することを防止する第二防御として機能する。

# artifact_actions: REQ/Decision/Design への保存対象
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-017.md
    source_items: [AG-001, AG-002]
    content: |
      | REQ-017-020 | case-run / case-auto は、正典から導出可能な補助情報（対象一覧・操作サマリ等）を委譲 prompt へ含める場合、当該補助情報を正典と機械突合可能な形式で記述すること。委譲を受けた実行側は補助情報と正典の不一致を検出した場合、正典を優先し、補助情報を根拠とした対象判断・本文更新を行わないこと（REQ-017-019 の抽出制約の正典導出補助情報への拡張） |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/workflows/delegation-contracts.md
    target_design:
      operation: update
      domain: workflows
      slug: delegation-contracts
    target_area: structured_context の SSoT 抽出制約
    source_items: [AG-001, AG-002]
    content: |
      「structured_context の SSoT 抽出制約」節へ次の規定を追記する。

      - 委譲 prompt に正典から導出した補助情報（対象一覧・Draft operations summary 等のサマリ）を含める場合、当該補助情報は正典（Issue 本文、正規 REQ、draft の artifact_actions 等の正規成果物）と機械突合可能な形式で記述する。対象集合（対象ファイル、対象 REQ、対象成果物パス等）は正典から機械的に列挙できる形を維持する（REQ-017-020）。
      - 既存の突合（対象 Issue 番号と対象成果物パスの突合、不一致時は委譲を開始しない）に加え、補助情報と正典の機械突合を委譲 prompt 生成時に実行する。不一致を検出した場合は委譲 prompt から当該補助情報を除去するか正典の値へ置き換えた上で委譲する。
      - 実行側は補助情報と正典の不一致を検出した場合、正典を優先し、補助情報を根拠とした対象判断・本文更新を行わない。不一致の検出は親エージェントへ報告する。

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: REQ-017 の現行最大行は REQ-017-019 であり、本 draft の APPEND 先行番号（REQ-017-020）は複数の req-define 実行間で採番衝突し得る。
    resolution: REQ-017-020 は擬似採番であり、case-open が決定的採番により再確定する。case-open 以降の工程は本 draft の行番号を直接確定値として扱わない。
  - id: CR-002
    conflict: 補助サマリ突合の規定を REQ 行（公開契約）と Design（delegation-contracts.md の節内詳細）のどちらにのみ配置するか。
    resolution: REQ 行と Design 詳細の両方に配置し分離する。REQ-017-020 は機械突合要求と不一致時正典優先の公開契約（委譲契約の消費者全体が参照）を所有し、delegation-contracts.md「structured_context の SSoT 抽出制約」節（実ファイル照合で見出し名確定済み、現行保有突合は Issue 番号・成果物パスのみ）は委譲 prompt 生成手順としての具体的な突合実行と除去・置換処理を所有する。REQ-017-019 と同じ REQ と Design の分離構造に従う。

# operation_units: 複数RU入力時の統合/分離結果
operation_units:
  - ou_id: OU-001
    source_ru: RU-0023
    target_req: REQ-017
    target_design: docs/designs/workflows/delegation-contracts.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
result: {}

# test_strategy: 各合意項目（AG-*）の検証方法
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs/requirements/REQ-017.md を再読取し、新規行（擬似 REQ-017-020、case-open の決定的採番で確定）が要件テーブルへ APPEND されていることを確認する。
      行本文が「補助情報を正典と機械突合可能な形式で記述」および「実行側の正典優先」の2点を含み、REQ-017-019（Issue 番号×対象成果物パス突合）と矛盾しない拡張であることを確認する。
      行 ID と docs/requirements/README.md の AUTOGEN 索引の整合（行追加後の再生成）を確認する。
    pass_criteria: |
      REQ-017.md の要件テーブルに当該行が存在し、機械突合と正典優先の契約が行本文として含まれる。
      行 ID が REQ-017 の現行最大行の次の連番であり、AUTOGEN 索引が再生成済みで鮮度検査が exit 0 である。
      REQ-017 の適用範囲（対象: 委譲 prompt 生成側の structured_context 抽出制約と突合）との整合が維持されている。
    on_failure: |
      fix-and-reverify。行本文の文言修正または索引再生成の再実行で解消できる文書不備であるため、修正後に同一検証を再実行する。
  - id: TS-002
    target_item: AG-002
    verification: |
      docs/designs/workflows/delegation-contracts.md の最終 HEAD 実ファイル全文を再読取する。
      「structured_context の SSoT 抽出制約」節に、補助情報の機械突合可能形式の要求、委譲 prompt 生成時の突合実行、不一致時の除去・置換、実行側の正典優先と報告の規定が存在することを確認する。
      REQ-017-019 の既存規定（Issue 番号×対象成果物パス突合、不一致時は委譲を開始しない）が削除・改変されず維持されていることを確認する。
      委譲時最小契約の骨格（inputs、side_effect_boundary、output_contract、capture_handoff）が変更されていないことを確認する。
    pass_criteria: |
      「structured_context の SSoT 抽出制約」節に機械突合と正典優先の規定が存在し、REQ-017-020 と整合する。
      REQ-017-019 対応の既存規定と委譲時最小契約の骨格が維持されている。
      docs-check の該当検査が pass である。
    on_failure: |
      fix-and-reverify。節内規定の文言修正で解消できる文書不備であるため、修正後に全文再読取で再検証する。

# realization_actions: 実現面の変更方針
realization_actions:
  - id: RA-001
    concern: delegation-contracts.md「structured_context の SSoT 抽出制約」節への機械突合・正典優先規定の追記
    responsibility: サブエージェント委譲の共通契約（委譲時最小契約、structured_context 抽出制約）は delegation-contracts.md が正規所有する。REQ-017-019 との REQ と Design の分離構造（公開契約は REQ、生成手順詳細は Design）に従い、本 Design への追記で完結する。
    ownership_hints:
      - "変更対象: docs/designs/workflows/delegation-contracts.md"
      - "target_area: 「structured_context の SSoT 抽出制約」節（見出し名は実ファイル照合 2026-09-16 で確定済み）"
      - "現行保有突合: 対象 Issue 番号と対象成果物パスの突合（不一致時は委譲を開始しない）のみ"
      - "正規所有 REQ: REQ-017（Issue Execution Contract、REQ-017-019 が structured_context 抽出制約を所有）"
    intent: 委譲 context の補助サマリ誤記が Root Case 本文等の正規成果物へ混入する契約ギャップを、正典優先原則の明文化により閉じる。実行側の正典読取義務（第一防御）に加え、補助情報の突合と正典優先（第二防御）を契約として確立する。
    verification_refs: [TS-002]
    source_items: [AG-001, AG-002]

# review_dispositions: 採否判断の記録
review_dispositions:
  - id: RD-001
    source_ru: RU-0023
    source_item: delegation-canonical-crosscheck
    disposition: covered
    reason_code: requirements_mapped
    reason: |
      RU-0023 の論点（補助サマリと正典の機械突合・正典優先の明文化）は AG-001（REQ-017 への APPEND）と AG-002（delegation-contracts.md target_area への追記）へすべて反映した。
      1:1 の単一論点であり、分割・統合は不要である。
      受け入れ条件（機械突合要求および不一致時の正典優先が delegation-contracts Design の規定として存在すること）は ACT-DESIGN-001 と TS-002 で検証する。
    evidence:
      path: docs/designs/workflows/delegation-contracts.md
      section: structured_context の SSoT 抽出制約
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

REQ-017 への APPEND（擬似 REQ-017-020、機械突合と正典優先の公開契約）と delegation-contracts.md「structured_context の SSoT 抽出制約」節への追記（生成手順としての突合実行と正典優先）で構成する。
REQ 行（公開契約）と Design 詳細の分離は REQ-017-019 と同じ構造に従う。
擬似採番 REQ-017-020 は case-open が決定的採番により確定する。
