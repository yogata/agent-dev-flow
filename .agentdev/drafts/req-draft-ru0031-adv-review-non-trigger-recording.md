---
draft_type: req_draft
topic_slug: ru0031-adv-review-non-trigger-recording
status: draft
created_at: 2026-09-16T12:35:49+09:00
source_rus:
  - RU-0031
---

# draft-data

```yaml
work_type: maintenance
scale: null
summary: >-
  adversarial-review の発動契約に該当しない場合の判定理由と代替自己反証を記録する契約を
  REQ-014-016 と関連 Design に反映する。対応記録テンプレート、case-run 委譲手順、外部実行
  adapter の記録経路を整備し、発動条件と審議プロトコルの正規所有は変更しない。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
agreed_items:
  - id: AG-001
    content: >-
      対応記録コメントテンプレートに adversarial-review の判定欄を追加し、発動または非発動と
      その理由を記録する。判定欄の値と理由により、レビュー未実施と条件非該当による非発動を
      区別できるようにし、新規作成の記録から適用する。
  - id: AG-002
    content: >-
      case-run の委譲 prompt 作成手順では、adversarial-review の発動条件は Issue 本文の実行
      契約を正とすることを明記する。Issue 本文の契約と委譲側の既定指示が異なる場合も、その
      非発動判断の根拠が委譲先へ伝わるようにする。
  - id: AG-003
    content: >-
      外部実行 adapter は、非発動時の判定理由を case-run 委譲では PR 本文、case-close では
      対応記録コメントへ必須記録する。非発動時は却下案、緩和策、unresolved なしの確認を代替
      自己反証として実施し、その結果も同じ記録へ保存する。
  - id: AG-004
    content: >-
      adversarial-review 自身の審議プロトコルと発動条件の正、発動契約セクションを持つ Issue
      テンプレートの構造、対応記録コメントの case-close 単一書き手は変更しない。
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-014.md
    target_area: 要件テーブル末尾（擬似 REQ-014-016 行として追記）
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      | REQ-014-016 | adversarial-review の発動契約非該当でスキップする場合、呼出元は判定理由を対応記録へ記録すること（case-run 委譲では PR 本文、case-close では対応記録コメント）。非発動時は代替としての自己反証（却下案・緩和策・unresolved なしの確認）を実施・記録し、silent skip を発生させないこと。発動条件の判定正・審議プロトコルの変更は REQ-014-013〜015 と adversarial-review Design が所有し、本行は記録様式と義務のみを扱うこと |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-workflow-templates.md
    target_design:
      operation: update
      domain: skills
      slug: agentdev-workflow-templates
    target_area: "## 実行識別情報・検証差分のテンプレートセクション形式"
    source_items: [AG-001]
    content: |
      対応記録コメントテンプレートに adversarial-review 判定欄のセクションを新設する。判定値は発動または非発動とし、非発動の場合は発動契約非該当の理由を必須記録する。既存記録への遡及適用はせず、新規作成の対応記録から適用する。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-case-run-execution-adapter.md
    target_design:
      operation: update
      domain: skills
      slug: agentdev-case-run-execution-adapter
    target_area: "### review 呼出と発動条件（REQ-015-001/002）"
    source_items: [AG-002, AG-003, AG-004]
    content: |
      adversarial-review の発動条件は Issue 本文の実行契約を正とする。発動契約非該当で非発動とする場合、case-run 委譲では PR 本文、case-close では対応記録コメントへ判定理由を必須記録し、却下案・緩和策・unresolved なしの確認による代替自己反証を実施・記録する。発動条件と審議プロトコルの正は変更しない。
conflict_resolutions:
  - id: CR-001
    conflict: REQ-014-016 は既存 REQ-014-014/015 と、発動条件の正を変更せず記録義務だけを追加する点で境界整理が必要だった。
    resolution: 発動条件と審議プロトコルを既存所有者へ残し、非発動時の記録様式・理由・代替自己反証だけを追加する。
  - id: CR-002
    conflict: 対応記録テンプレートと adapter Design の更新を REQ append だけで扱う案があった。
    resolution: 実ファイル照合で両 Design に対応節が存在し、動作変更を現行設計へ投影する必要があるため Design update を含める。
  - id: CR-003
    conflict: REQ-014-016 は現行最大 REQ-014-015 に続く擬似採番である。
    resolution: 016 を使用し、case-open の決定的採番で確定する。
operation_units:
  - ou_id: OU-001
    source_ru: RU-0031
    target_req: REQ-014
    target_design: docs/designs/skills/agentdev-workflow-templates.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: issue_comment_bug_record.md 系テンプレートと workflow-templates Design を照合し、発動/非発動+理由の判定欄を確認する。
    pass_criteria: 判定欄と非発動理由の必須性が新規記録向けに存在する。
    on_failure: fix-and-reverify を選択する。テンプレート形式を修正して再確認する。
  - id: TS-002
    target_item: AG-002
    verification: case-run の delegation-and-result 等の委譲手順を読み、Issue 本文の実行契約を正とする記述を確認する。
    pass_criteria: Issue 本文契約を優先することが委譲手順に明記されている。
    on_failure: fix-and-reverify を選択する。委譲手順の欠落を補い再確認する。
  - id: TS-003
    target_item: AG-003
    verification: adapter の adversarial-review integration reference を読み、非発動理由、代替自己反証、記録先の必須性を確認する。
    pass_criteria: PR 本文または対応記録コメントへの理由記録と、3要素の自己反証が明記されている。
    on_failure: fix-and-reverify を選択する。adapter 契約を修正して再確認する。
  - id: TS-004
    target_item: AG-004
    verification: REQ-014-016 と既存 adversarial-review Design、Issue テンプレート、case-close 単一書き手の契約を比較する。
    pass_criteria: 発動条件・審議プロトコル・Issue テンプレート構造・単一書き手が変更対象外として維持されている。
    on_failure: fix-and-reverify を選択する。境界逸脱を除去して再確認する。
realization_actions:
  - id: RA-001
    concern: 対応記録コメントの adversarial-review 判定欄
    responsibility: workflow-templates のテンプレート形式契約が正規所有する。
    ownership_hints:
      - src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_bug_record.md
      - docs/designs/skills/agentdev-workflow-templates.md
    intent: 非発動と未実施を対応記録上で区別する。
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-002
    concern: 委譲 prompt における Issue 本文契約の優先
    responsibility: case-run workflow の委譲 prompt 作成手順が正規所有する。
    ownership_hints:
      - src/opencode/skills/agentdev-workflow-case-run/references/delegation-and-result.md
      - src/opencode/skills/agentdev-workflow-case-run/references/single.md
    intent: 委譲側の既定指示による silent skip を防ぐ。
    verification_refs: [TS-002]
    source_items: [AG-002]
  - id: RA-003
    concern: 非発動時の理由と代替自己反証の記録
    responsibility: case-run external execution adapter の adversarial-review integration reference が正規所有する。
    ownership_hints:
      - src/opencode/skills/agentdev-case-run-execution-adapter/references/adversarial-review-integration.md
      - docs/designs/skills/agentdev-case-run-execution-adapter.md
    intent: 非発動判断の根拠と自己反証結果を追跡可能にする。
    verification_refs: [TS-003]
    source_items: [AG-003]
review_dispositions:
  - id: RD-001
    source_ru: RU-0031
    source_item: RU-0031-acceptance-criteria
    disposition: covered
    reason_code: converted_to_existing_req_append_and_design_updates
    reason: RU-0031 の記録義務を REQ-014-016、テンプレート Design、adapter Design、realization_actions に反映した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0031.md
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items: []
case_open_hints:
  epic_needed: false
  wave_hints: []
result: {}
```

# summary

変更誘発境界リスクは、dependency（REQ-014-013〜015 と REQ-014-016、adversarial-review Design、各 caller の記録契約）、client-server（Issue 本文、PR 本文、対応記録コメントの記録チャネル）、execution（発動条件の判定後に理由と自己反証を記録する工程）、build-runtime（テンプレート・reference・Design の文書変更と構文検査）、environment-propagation（配布テンプレートと skill reference の同期）を確認済みである。REQ-014 APPEND 1行と Design update 2件で、発動条件自体の変更を含まない。SPLIT 要否: 不要。
