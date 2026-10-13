---
draft_type: req_draft
topic_slug: case-ready-cleanup-status-parse
status: draft
created_at: 2026-10-13T12:40:00Z
source_rus:
  - RU-0212
---

# draft-data

```yaml
# case-ready cleanup script の git status 列解析是正。bugfix（REQ ファイルは作成しない）
work_type: bugfix

scale: standard

summary: accept_definition_checks.ts（case-ready cleanup script）の git status --short 列解析を trim 前の列位置参照へ修正し、未ステージ modified 混在時の回帰テストと git rm 再実行の冪等化対策を含める。REQ-061-040 の被害側防御契約（Form Zero）との非競合を受け入れ条件とする。REQ/Decision/Design の保存対象は発生しない（bugfix・実現面修正のみ）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      列解析是正: stagedEntries の staged 判定を trim 前の raw line の列位置
      （[0] = X、[1] = Y）で判定する一行相当の是正に修正する。
      実測根拠: accept_definition_checks.ts:583 の .map((line) => line.trim()) の後に
      :586 で entry[0] を参照する現行実装は、trim 後の先頭列（Y 列）を読むため、
      worktree-only の未ステージ modified（先頭列が空白で2列目が M）を staged と誤判定し、
      staged-entries-check の fail-closed で commit が停止した
      （Root Case #3653、2026-10-13 実測、commit 90733116 で手動回収済み）。
      REQ-061-040 の被害側防御（ステージ全体確認）の意図は維持し、誤検出を解消する。
  - id: AG-002
    content: |
      回帰テスト: 未ステージ modified が混在する状態で staged と誤判定しないことを
      検証する回帰テストを追加する（元成果物の受け入れ条件どおり）。
      テストは既存 accept_definition_checks.test.ts と同一テストスイートに追加し、
      git status --short の XY 2 列形式を trim 前列位置で解析することを固定する。
  - id: AG-003
    content: |
      git rm 冪等化（附随修正、本 RU 内で扱う検討事項の判断結果）:
      実装に含める。前回実行の git rm 済みで working tree から消えた removals への
      再 git rm が pathspec 不一致で停止する 2 段障害（同 Root Case 実測）は、
      同一 script・同一 cleanup 再実行経路の障害であり、列解析是正だけでは cleanup 再実行時に
      障害が残る。対策として git rm の前にインデックスの削除状態確認（既にインデックスから
      削除済みのパスを rm 対象から除外する等）の前置きを実装に含める。
      対応は REQ-061-040 の被害側防御契約（明示パス指定 commit〔Form Zero〕）と非競合とする。
  - id: AG-004
    content: |
      非競合・対象外（元成果物の受け入れ条件・対象外どおり）:
      既存 cleanup フロー（明示パス指定 commit）と非競合であること。
      case-ready STEP-7 手順自体の変更、porcelain v2 移行等の大幅リファクタは対象外。

artifact_actions: []

conflict_resolutions:
  - id: CR-001
    conflict: "agentdev_handoff: true の RU に対する前工程からの引き継ぎ判定"
    resolution: "本リポジトリ（自己ホスティング）では通常入力として扱い、前工程引き継ぎ停止を発動しない（Batch D 共通方針、ユーザー指示 (a)）"
  - id: CR-002
    conflict: "git rm 冪等化対策を要件化時に実装へ含めるか（RU 本文は判断対象として検討事項に記録）"
    resolution: "実装に含める。同一 script・同一 cleanup 再実行経路の 2 段障害であり、列解析是正だけでは再実行障害が残る（adversarial-review で実装包含を合意。含めない場合は同一 script の再開操作が二重になる）"

operation_units:
  - ou_id: OU-001
    source_ru: RU-0212
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      bun test ./src/common/skills/agentdev-workflow-case-ready/scripts/tests/
      （repo root 起 cwd・`./` 付きパス指定の REQ-060 実行形態）で回帰テストを実行する。
      テストフィクスチャ: git status --short に「 XY path」（未ステージ modified）と
      staged エントリ（「M  path」等）が混在する出力を模擬し、
      未ステージ modified が foreignStaged に計上されないことを検証する。
    pass_criteria: |
      未ステージ modified 混在時に誤判定せず、trim 前の列位置 [0]（X）[1]（Y）で判定する
      回帰テストが合格し、既存テスト全件が合格すること。
    on_failure: |
      fix-and-reverify: 列解析実装を修正してテストを再実行する。
  - id: TS-002
    target_item: AG-003
    verification: |
      removals が working tree から消えた状態（前回実行の git rm 済み）を模擬した
      テストフィクスチャで cleanup 再実行を実行し、インデックスの削除状態確認の前置きが
      pathspec 不一致停止を防止することを検証する。
    pass_criteria: |
      再実行時に pathspec 不一致で fail 停止せず、既に削除済みのパスが rm 対象から除外され
      commit が完結すること（または該当パスの skip が記録されること）。
    on_failure: |
      fix-and-reverify: 冪等化対策を修正して再実行する。
  - id: TS-003
    target_item: AG-004
    verification: |
      既存 cleanup フロー（明示パス指定 commit、Form Zero）の既存テストケースを実行し、
      修正後も既存フローと非競合であることを確認する。
    pass_criteria: |
      既存テスト全件が合格し、明示パス指定 commit の契約（REQ-061-040）に抵触する変更が
      含まれないこと。
    on_failure: |
      fix-and-reverify: REQ-061-040 契約と競合する変更を除去してテストを再実行する。

realization_actions:
  - id: RA-001
    concern: git status --short 列解析の trim 前列位置参照への是正
    responsibility: "case-ready cleanup script（accept_definition_checks.ts canonical-and-cleanup phase）の stagedEntries 判定。REQ-061-040 の被害側防御の正しい実装"
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts:581-589（trim 後 entry[0] 参照の是正対象）"
    intent: trim 前の raw line の列位置 [0]（X）[1]（Y）で staged 判定し、未ステージ modified の誤判定を解消する
    verification_refs: [TS-001, TS-003]
    source_items: [AG-001, AG-002, AG-004]
  - id: RA-002
    concern: git rm 再実行の冪等化
    responsibility: 同一 script の cleanup 再実行経路。git rm 前のインデックス削除状態確認の前置き
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts:570（git rm 実行箇所の前置確認）"
    intent: working tree から消えた removals への再 git rm が pathspec 不一致で停止しないようにする
    verification_refs: [TS-002]
    source_items: [AG-003]

review_dispositions:
  - id: RD-001
    source_ru: RU-0212
    source_item: RU-0212.対象外（case-ready STEP-7 手順自体の変更）
    disposition: rejected
    reason_code: out_of_scope
    reason: "元成果物の対象外どおり。cleanup script の実装修正のみを対象とする。"
    evidence:
      path: .agentdev/backlog/req-units/RU-0212.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0212
    source_item: RU-0212.対象外（porcelain v2 移行等の大幅リファクタ）
    disposition: rejected
    reason_code: out_of_scope
    reason: "元成果物の対象外どおり。一行相当の是正と限定した対策に絞る。"
    evidence:
      path: .agentdev/backlog/req-units/RU-0212.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []

assembly_evidence: []

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

case-ready cleanup script（accept_definition_checks.ts）の git status --short 列解析を trim 前の列位置参照へ是正し、未ステージ modified 混在時の回帰テストを追加する。git rm 再実行の冪等化対策（インデックス削除状態確認の前置き）を実装に含めることを合意した（同一障害系統の 2 段障害解消）。
REQ-061-040（Form Zero 明示パス指定 commit）との非競合を受け入れ条件とし、bugfix として REQ ファイルを作成せず Issue 本文のみで要件管理する。
