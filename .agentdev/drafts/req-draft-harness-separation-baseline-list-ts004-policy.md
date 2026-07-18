---
draft_type: req_draft
topic_slug: harness-separation-baseline-list-ts004-policy
status: saved
created_at: 2026-07-18T16:30:00+09:00
saved_at: 2026-07-18
spec_actions_consumed: true
source_rus:
  - RU-0011
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: |
  SPEC docs/specs/foundations/harness-separation-model.md の「baseline 既知違反」サブセクションに
  baseline 11件の具体リストと件数定義（ファイル単位 vs マッチ単位）を追記し、TS-001/002 の機械化判定を
  可能にする。併せて TS-004（配布 command 6ファイル実行制御パラメータ直接記述 0件）spec-bug の対応方針を
  決定する。TS-004 は c（実装改修で 0件にする）を基本方針とし、16件残留は RU-0007（Phase 6, REQ-0162-002
  完遂）で処理、Epic #1515 完了条件から TS-004 を外す。Issue #1516 文脈。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      baseline 11件を check_integrity.ts または check_distribution_boundary.ts の現在の出力から抽出し、SPEC docs/specs/foundations/harness-separation-model.md の「baseline 既知違反」サブセクションに具体リストとして追記する。リストは各違反のファイルパス・行番号・違反内容を含む形式とし、将来の delta 検出で baseline 与件との照合が機械的に可能な形式とする。
  - id: AG-002
    content: |
      baseline の件数定義（ファイル単位 vs マッチ単位）を SPEC に明記する。TS-001/002 の機械化判定（grep 結果がすべて baseline 扱いか否かの厳密判定）と矛盾しない件数定義を採用する。ファイル単位・マッチ単位の両方を明記し、それぞれの用途を併記する。
  - id: AG-003
    content: |
      TS-004 spec-bug の対応方針を決定する。c（実装改修で 0件にする）を基本方針とし、16件残留は RU-0007（Phase 6, REQ-0162-002 完遂、配布物 concreteness 段階除去）で処理する。Epic #1515 の完了条件から TS-004 を外し、対象外明記とする（a の要素を採用）。これは Epic #1515 対象外「配布 command/skill/docs の実装本体改修」と整合する。TS-004 は別 Epic（REQ-0162 完遂、RU-0007）の完了条件として再定義する。
  - id: AG-004
    content: |
      Epic #1515 進行中のため、TS-004 完了条件の変更は早期に確定し、Epic #1515 の残 Wave に影響を与えないよう速やかに仕様化する。REQ-0162-007/REQ-0162-008 と整合する形で要件文書を更新する。

artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: foundations
      slug: harness-separation-model
    target_area: baseline 既知違反サブセクション
    source_items: [AG-001, AG-002]
    content: |
      ## baseline 既知違反サブセクション

      ### 件数定義

      baseline 件数は下記2軸で明記する:

      - ファイル単位: 違反を含む配布 command/skill ファイル数（重複排除）
      - マッチ単位: 違反パターンにマッチした総件数（重複含む）

      TS-001/002 の機械化判定はマッチ単位を採用し、grep 結果との1:1照合を可能にする。
      ファイル単位は進捗報告用の補助値とし、判定の主評価値とはしない。

      ### baseline リスト（11件）

      下記11件を baseline 既知違反として登録する。各行は「ファイルパス:行番号:違反内容:検出ルール」形式。

      （実装修復時点で check_integrity.ts / check_distribution_boundary.ts の出力から抽出して埋める。
       リスト形式は上記フォーマットに従う。リスト抽出は spec-save 実施時に実施する。）

      baseline リストは delta 検出で新規違反と区別するための与件であり、baseline 自体の解消は
      RU-0007（REQ-0162-002 完遂）で段階的に実施する。
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-0162.md
    source_items: [AG-003, AG-004]
    content: |
      | REQ-0162-009 | TS-004（配布 command 6ファイル実行制御パラメータ直接記述 0件）は Epic #1515 の完了条件から外し、対象外明記とする。16件残留は REQ-0162-002 完遂（RU-0007 配布物 concreteness 段階除去）で処理し、別 Epic の完了条件として再定義する。Epic #1515 と REQ-0162-002 完遂 Epic は直交し、前者の完了は後者を待たない |

conflict_resolutions:
  - id: CR-001
    conflict: |
      TS-004 方針として a（Epic 完了条件から外す）/ b（baseline 追加で pass）/ c（実装改修で 0件）の3択があり、RU 本文はいずれかの選択を求めている。
    resolution: |
      c を基本方針とし、Epic #1515 完了条件からは外す（a の要素を採用）。b（baseline 追加で pass 扱い）は問題を隠蔽するため不採用。c は根本解決だが Epic #1515 対象外「配布 command/skill/docs 実装本体改修」と整合性確認が必要であり、RU-0007（REQ-0162-002 完遂）で処理することで整合する。Epic #1515 完了を RU-0007 完遂と分離することで、Epic #1515 進行をブロックしない。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0011
    target_spec:
      operation: update
      domain: foundations
      slug: harness-separation-model
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0011
    target_req: REQ-0162
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      check_integrity.ts / check_distribution_boundary.ts を実行し baseline 11件を抽出する。抽出結果を SPEC harness-separation-model.md の baseline リストセクションに埋める。SPEC の行数が req-health-metrics 基準内であることを確認する。
    pass_criteria: |
      baseline 11件が SPEC にリスト化され、各違反のファイルパス・行番号・違反内容・検出ルールが明記されていること。SPEC 行数が基準内であること。
    on_failure: |
      fix-and-reverify。baseline 抽出件数が11件と一致しない場合は、抽出ロジックまたは baseline 定義を見直し再抽出する。SPEC 行数超過の場合はリスト形式を凝縮し再調整する。
  - id: TS-002
    target_item: AG-002
    verification: |
      SPEC に件数定義（ファイル単位 vs マッチ単位）を明記し、TS-001/002 機械化判定（grep 結果との照合）と矛盾しないことを確認する。実際に grep を実行し、マッチ単位で baseline 件数と一致することを確認する。
    pass_criteria: |
      件数定義が SPEC に明記され、TS-001/002 機械化判定と矛盾しないこと。grep 実行結果のマッチ単位件数が baseline 件数と一致すること。
    on_failure: |
      fix-and-reverify。不一致の場合は件数定義または baseline リストを再調整し、一致するまで再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      REQ-0162-009 を REQ-0162 に追記し、Epic #1515 完了条件から TS-004 を外す（対象外明記）。16件残留は RU-0007 で処理する方針が文書化されていることを確認する。
    pass_criteria: |
      REQ-0162-009 が REQ-0162 に正しく追記され、TS-004 が Epic #1515 完了条件から除外されていること。
    on_failure: |
      fix-and-reverify。追記内容が不明確な場合は表現を調整し、Epic #1515 と RU-0007 の直交関係が明確に記述されるよう再調整する。
  - id: TS-004
    target_item: AG-004
    verification: |
      Epic #1515 の完了条件ドキュメント（Issue 本文）を確認し、TS-004 が完了条件から除外されていることを確認する。REQ-0162-007/008 との整合性を確認する。
    pass_criteria: |
      Epic #1515 完了条件から TS-004 が除外され、REQ-0162-007/008 と整合していること。
    on_failure: |
      fix-and-reverify。Epic #1515 完了条件の更新が必要な場合は case-run で Issue 編集を実施し、REQ-0162-007/008 との整合を再確認する。

case_open_hints:
  epic_needed: false
  decomposition:
    - OU-001: SPEC baseline リスト・件数定義追記（先行）
    - OU-002: REQ-0162-009 追記（Epic #1515 完了条件変更、SPEC 完了後）
  wave_hints:
    - Wave 1: SPEC baseline リスト化（OU-001）
    - Wave 2: REQ-0162-009 追記・Epic #1515 完了条件変更（OU-002）
```

# summary

harness-separation-model.md SPEC の baseline 既知違反サブセクションに具体リストと件数定義が未記載で、TS-001/002 の機械化判定が不可能。本 draft は baseline 11件の SPEC リスト化（AG-001）、件数定義の明記（AG-002）、TS-004 spec-bug 方針決定（AG-003, AG-004）を合意する feature である。TS-004 方針は c（実装改修で 0件）を基本とし、16件残留は RU-0007（Phase 6, REQ-0162-002 完遂）で処理、Epic #1515 完了条件から TS-004 を外す（CR-001 で決定）。Issue #1516 文脈。RU-0016 とは補完関係（別 SPEC 操作）で独立ドラフト。
