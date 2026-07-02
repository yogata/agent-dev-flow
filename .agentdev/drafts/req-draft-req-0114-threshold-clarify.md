---
draft_type: requirement
topic_slug: req-0114-threshold-clarify
status: saved
created_at: "2026-07-03"
source_rus:
  - RU-0009
---

# draft-data

```yaml
work_type: maintenance

summary: >
  RU-0009 が指摘した REQ-0114-004「draft が2件以上存在する場合」の
  「2件」と REQ-0140-029「件数記載を SPEC/README 側で一元管理」の
  適用関係を明確化する。REQ-0140-029 の「件数記載」の定義に
  「要件行の振る舞い定義の一部として条件文中に参照される件数は
  適用対象外」を明文化し、REQ-0114-004 の「2件」が移送対象外である
  判断基準を文書上で追跡可能にする。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >
      REQ-0140-029 の「件数記載」の定義を明確化する。
      「件数記載」とは独立した件数規定（並列上限、処理閾値等で
      SPEC/README の別途定義を参照するもの）を指し、要件行の
      振る舞い定義の一部として条件文中に参照される件数
      （例: REQ-0114-004「2件以上」）は適用対象外とする。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-0140.md
    source_items:
      - AG-001
    content: >
      REQ-0140-029 を以下の内容に UPDATE する。

      変更前:
      「文書管理者は REQ-0114/0130/0148 等の現行 REQ ファイル内の
      件数記載を SPEC/README 側で一元管理し、当該 REQ ファイル内に
      残留させないこと。docs/requirements/README.md の件数記載は
      許容する」

      変更後:
      「文書管理者は REQ-0114/0130/0148 等の現行 REQ ファイル内の
      独立した件数規定（並列上限、処理閾値等で SPEC/README の別途
      定義を参照するもの）を SPEC/README 側で一元管理し、当該 REQ
      ファイル内に残留させないこと。要件行の振る舞い定義の一部と
      して条件文中に参照される件数（例: 『N件以上の場合は全件処理
      対象』等の条件閾値）は適用対象外とする。
      docs/requirements/README.md の件数記載は許容する」

conflict_resolutions:
  - id: CR-001
    conflict: >
      REQ-0114-004「draft が2件以上存在する場合、全draftを処理対象
      として検出すること」の「2件」が REQ-0140-029 の「件数記載」に
      該当するか（SPEC移送対象か）が不明確だった。
    resolution: >
      REQ-0114-004 の「2件」は、要件行の振る舞い定義における条件
      閾値（「2件以上の場合」という条件の一部）であり、独立した
      件数規定ではない。したがって REQ-0140-029 の適用対象外と
      判断し、REQ-0114-004 は現状維持とする。判断基準を
      REQ-0140-029 本文中に明文化し、将来の同種事例の判断を
      追跡可能にする。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0009
    target_req: REQ-0140
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs:
        - REQ-0140
      artifact_action_mapping:
        ACT-REQ-001: REQ-0140
      source_ru_mapping:
        RU-0009: REQ-0140
      status: saved
      case_open_input:
        - req_id: REQ-0140
          req_file: docs/requirements/REQ-0140.md
          operation: update
          updated_lines:
            - REQ-0140-029

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: >
      REQ-0140-029 の更新後要件文に「要件行の振る舞い定義の一部と
      して条件文中に参照される件数は適用対象外」の記述が含まれる
      ことを確認する。
    pass_criteria: >
      REQ-0140-029 の要件文に適用対象外の明文化が存在し、
      REQ-0114-004 の「2件」が移送対象外である判断基準が文書上で
      読み取れること。
    on_failure: fix-and-reverify

case_open_hints:
  epic_needed: false
```

# summary

RU-0009 は REQ-0114-004 の「2件」と REQ-0140-029「件数記載の一元管理」
の適用関係が不明確だったことを指摘した。

分析の結果、REQ-0114-004 の「2件」は要件行の振る舞い定義における条件
閾値であり、独立した件数規定ではない。したがって REQ-0140-029 の適用
対象外と判断し、REQ-0114-004 は現状維持とする。

REQ-0140-029 の「件数記載」の定義を明確化し、適用対象外の条件
（要件行の振る舞い定義の一部として条件文中に参照される件数）を明文化
することで、将来の同種事例の判断基準を文書上で追跡可能にする。

SPLIT メトリクス: REQ-0140 は31行、UPDATE で行数不変、関心1、成果物1。
SPLIT 合計 0、SPLIT 不要。
