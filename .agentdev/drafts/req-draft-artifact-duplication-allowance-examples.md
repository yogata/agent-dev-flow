---
draft_type: req_draft
topic_slug: artifact-duplication-allowance-examples
status: saved
created_at: 2026-07-18T16:45:00+09:00
saved_at: 2026-07-18
source_rus:
  - RU-0012
---

# draft-data

```yaml
work_type: feature

scale: standard

spec_actions_consumed: true
spec_save_partial:
  consumed: [ACT-SPEC-001]
  skipped: [ACT-SPEC-002]
  skip_reasons:
    ACT-SPEC-002: "operation=update だが対象ファイル docs/specs/authoring/command-authoring-standards.md が未存在（ENOENT）。operation=create へ切り替え推奨、もしくは既存 command-file-format.md への統合を要検討"

summary: |
  docs/specs/responsibilities/artifact-responsibilities.md SPEC の「重複許容基準（REQ-0147-001）」適用事例が
  SPEC に未蓄積のため、今後同種の判定が必要になるたびに references 横断探索と都度判断が発生している。
  本 draft は artifact-responsibilities.md SPEC に重複許容基準の適用例集セクションを新設し、
  project extensions boilerplate（15 command 同一4行）や inspect-skills references の重複許容パターン、
  PR #1534 で適用した「公開契約宣言 vs 詳細契約」分離フローを SPEC に事例として蓄積する。
  intak 3由来 + learning 1由来の N:1 統合。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      docs/specs/responsibilities/artifact-responsibilities.md SPEC に「重複許容基準（REQ-0147-001）適用例集」セクションを新設する。適用パターンごとに「フロー + 具体例」形式で記述し、今後同種の判定を SPEC 読者が参照できるようにする。REQ-0119-034（同一契約再定義抑止の原則）と REQ-0147-001（重複許容基準）の両立関係を損なわないことを前提とする。
  - id: AG-002
    content: |
      project extensions boilerplate（15 command で同一4行の extension 宣言）の重複許容パターンを適用例集に記載する。PR #1534 で適用した「公開契約宣言（command 公開契約の宣言部分）vs 詳細契約（extension の context/rules/checks 等の中身）」の分離フローを標準化し、前者を許容・後者を skill 参照とする判断基準を明示する。公開契約宣言の範囲（何行まで許容するか等）を明確化し、運用上の曖昧性を除去する。
  - id: AG-003
    content: |
      inspect-skills references の重複許容パターンを適用例集に記載する。複数 SKILL で同一の references 内容（検査手順等）が重複する場合の許容条件を明示し、references 側は SPEC 本文への参照に縮約する方針を併記する。
  - id: AG-004
    content: |
      docs/specs/authoring/command-authoring-standards.md に boilerplate 許容の指針を整理する。project extensions boilerplate が「公開契約宣言」として許容される条件を明文化し、command-authoring-standards.md と artifact-responsibilities.md の両 SPEC で矛盾しない表現とする。
  - id: AG-005
    content: |
      src/opencode/skills/agentdev-project-extensions/SKILL.md に「公開契約宣言と詳細契約の分離フロー」を明記する。boilerplate 重複時にどの部分が公開契約宣言（許容）でどの部分が詳細契約（skill 参照）かの判断フローを図示し、inspect-skills で boilerplate 重複を検出した際の判定マトリクスを整備する。本 AG は実装修復として operation_units で管理し、artifact_actions には含めない（SKILL.md は SPEC ではなく配布物のため）。

artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: responsibilities
      slug: artifact-responsibilities
    target_area: 重複許容基準（REQ-0147-001）適用例集
    source_items: [AG-001, AG-002, AG-003]
    content: |
      ## 重複許容基準（REQ-0147-001）適用例集

      本セクションは REQ-0147-001（SPEC 重複許容基準）の具体的適用事例を蓄積し、
      REQ-0119-034（同一契約再定義抑止）との両立関係を運用面で明確にする。

      ### 適用パターン1: project extensions boilerplate

      15 の agentdev command で同一4行の extension 宣言（project extensions boilerplate）が
      重複定義される場合、下記の分離フローを適用する。

      #### 公開契約宣言 vs 詳細契約 の分離フロー

      1. boilerplate 行を「公開契約宣言」（command 公開契約の宣言部分）と「詳細契約」
         （extension の context/rules/checks 等の中身）に分離する
      2. 公開契約宣言は配布 command 本文に直接記載を許容する（上限: 宣言4行まで）
      3. 詳細契約は skill 参照（agentdev-project-extensions SKILL 等）に集約し、
         command 本文には公開契約宣言のみを残す
      4. 公開契約宣言の範囲を超える重複は REQ-0119-034 違反として扱う

      ### 適用パターン2: inspect-skills references 重複

      複数 SKILL で同一の references 内容（検査手順等）が重複する場合、下記条件を全て満たす
      とき REQ-0147-001 の重複許容基準に該当する:

      1. 重複する references が複数 SKILL の共通基盤（検査方法論等）であること
      2. 各 SKILL 固有の判断基準が明確に分離されていること
      3. references の内容が SPEC 本文への参照に縮約可能であること

      条件を満たす場合、references 側は SPEC 本文への参照に縮約し、重複を許容する。
  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: authoring
      slug: command-authoring-standards
    target_area: boilerplate 許容指針
    source_items: [AG-004]
    content: |
      ## project extensions boilerplate 許容指針

      project extensions boilerplate（15 command 同一4行の extension 宣言）は、
      「公開契約宣言」として配布 command 本文に直接記載を許容する。
      詳細は docs/specs/responsibilities/artifact-responsibilities.md
      「重複許容基準（REQ-0147-001）適用例集」の project extensions boilerplate 適用パターンを参照のこと。
      本指針と artifact-responsibilities.md の適用例集は矛盾しない表現を維持する。

conflict_resolutions:
  - id: CR-001
    conflict: |
      PR #1534 で本件を「見送り」選択し後続 spec-save で対応する合意（CR-002）があった。req-define で処理することは CR-002 と整合するか。
    resolution: |
      整合する。CR-002 は「SPEC 修正は case-run 都度 spec-save」を定めるものであり、req-define で適用例集のスコープを確定すること自体は CR-002 の対象外。本 draft で要件化した上で case-run → spec-save の順で処理する。RU-0009 の CR-001 と同様の判断。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0012
    target_spec:
      operation: update
      domain: responsibilities
      slug: artifact-responsibilities
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0012
    target_spec:
      operation: update
      domain: authoring
      slug: command-authoring-standards
    operation: spec-update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0012
    target_req: REQ-0147
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-0012
    operation: update
    scale: standard
    depends_on: [OU-001, OU-002]
    recommended_order: 4
    issue_policy: single
    result: {}
    note: AG-005 実装修復。src/opencode/skills/agentdev-project-extensions/SKILL.md に公開契約宣言と詳細契約の分離フローを明記。

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      artifact-responsibilities.md SPEC に「重複許容基準（REQ-0147-001）適用例集」セクションを新設し、REQ-0119-034 と REQ-0147-001 の両立関係が SPEC で明文化されていることを確認する。SPEC の行数が req-health-metrics 基準内であることを確認する。
    pass_criteria: |
      適用例集セクションが新設され、両 REQ の両立関係が明文化されていること。SPEC 行数が基準内であること。
    on_failure: |
      fix-and-reverify。両立関係の表現が不明確な場合は REQ-0119-034/REQ-0147-001 の本文を参照し表現を再調整する。行数超過の場合は適用例を凝縮し再調整する。
  - id: TS-002
    target_item: AG-002
    verification: |
      適用例集に project extensions boilerplate の重複許容パターンが記載され、公開契約宣言の範囲（何行まで許容するか）が明文化されていることを確認する。PR #1534 で適用した判断基準と矛盾しないことを確認する。
    pass_criteria: |
      boilerplate 重複許容パターンと公開契約宣言の範囲が明文化されていること。PR #1534 判断基準と整合していること。
    on_failure: |
      fix-and-reverify。公開契約宣言の範囲が曖昧な場合は PR #1534 の適用実績を再参照し、具体例を基に範囲を再確定する。
  - id: TS-003
    target_item: AG-003
    verification: |
      適用例集に inspect-skills references 重複許容パターンが記載され、references 縮約方針が明文化されていることを確認する。
    pass_criteria: |
      inspect-skills references 重複許容パターンと references 縮約方針が明文化されていること。
    on_failure: |
      fix-and-reverify。縮約方針が不明確な場合は実際の inspect-skills references を参照し、具体例を基に再調整する。
  - id: TS-004
    target_item: AG-004
    verification: |
      command-authoring-standards.md に boilerplate 許容指針が追記され、artifact-responsibilities.md の適用例集と矛盾しないことを確認する。
    pass_criteria: |
      boilerplate 許容指針が追記され、artifact-responsibilities.md と矛盾しないこと。
    on_failure: |
      fix-and-reverify。両 SPEC で表現が不一致の場合は表現を統一し再調整する。
  - id: TS-005
    target_item: AG-005
    verification: |
      src/opencode/skills/agentdev-project-extensions/SKILL.md に公開契約宣言と詳細契約の分離フローが明記され、inspect-skills で boilerplate 重複を検出した際の判定マトリクスが整備されていることを確認する。
    pass_criteria: |
      分離フローと判定マトリクスが SKILL.md に明記されていること。
    on_failure: |
      fix-and-reverify。分離フローが不明確な場合は PR #1534 の適用実績を再参照し、フロー図を基に再整備する。

case_open_hints:
  epic_needed: false
  decomposition:
    - OU-001: artifact-responsibilities.md 適用例集セクション新設（先行）
    - OU-002: command-authoring-standards.md boilerplate 許容指針（OU-001 完了後）
    - OU-003: REQ-0147 整合確認（OU-001 完了後）
    - OU-004: agentdev-project-extensions SKILL.md 分離フロー（OU-001/002 完了後）
  wave_hints:
    - Wave 1: SPEC 適用例集新設（OU-001）
    - Wave 2: command-authoring-standards.md 指針 + REQ-0147 整合（OU-002, OU-003 並列）
    - Wave 3: SKILL.md 分離フロー（OU-004）
```

# summary

artifact-responsibilities.md SPEC の重複許容基準（REQ-0147-001）適用事例が未蓄積で、今後同種の判定が必要になるたびに references 横断探索と都度判断が発生している。本 draft は artifact-responsibilities.md へ適用例集セクション新設（AG-001）、project extensions boilerplate の公開契約宣言 vs 詳細契約 分離フロー（AG-002）、inspect-skills references 重複許容パターン（AG-003）、command-authoring-standards.md boilerplate 許容指針（AG-004）、agentdev-project-extensions SKILL.md 分離フロー明記（AG-005）を合意する feature である。intake 3由来 + learning 1由来の N:1 統合。CR-002（SPEC 修正は case-run 都度 spec-save）との整合性は CR-001 で確認済み。
