---
draft_type: req-define
topic_slug: docs-check-baseline-noise
status: saved
created_at: "2026-07-03"
saved_at: "2026-07-03"
source_rus:
  - RU-0008
---

# draft-data

work_type: maintenance

summary: >-
  docs-check/integrity 検証における baseline/delta ノイズの是正。
  reference-path-existence 偽陽性の解消、RuntimeReference baseline 管理手順の明文化、
  delta 除外設定方針の明確化により、docs-check ノイズを低減し検証基盤の信頼性を向上する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      reference-path-existence 検出における backtick 囲みパスの扱いを明確化すること。
      backtick 囲みパスをパス参照として解釈しファイル存在確認を行うか、
      インラインコード表現として検出対象外とするかを文書化し、検出ロジックと整合させること。
      現状の backtick 囲みパス解決不能に起因する偽陽性 NG を解消すること。
  - id: AG-002
    content: >-
      RuntimeReference baseline の更新手順（更新タイミング、更新対象範囲、実行者）は明文化されること。
      baseline と実情の齟齬が delta ノイズとして報告される場合、
      当該齟齬の根因（baseline 陳腐化か実装変更か）を特定し、適切に更新すること。
  - id: AG-003
    content: >-
      docs-check delta 検出は正当な除外（安定契約例外、歴史経緯免除）と NG 隠蔽を区別し、
      除外設定の方針を明文化すること。
      REQ-0144-015（除外、恒久マスク仕組みでの隠退禁止）と整合し、
      正当な除外のみを許容すること。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-0144.md
    source_items:
      - AG-001
      - AG-002
      - AG-003
    content: |
      | REQ-0144-020 | reference-path-existence 検出における backtick 囲みパスの扱いを明確化すること（パス参照として解釈するかインラインコード表現として除外するかを文書化し、検出ロジックと整合）。backtick 囲みパス解決不能に起因する偽陽性 NG を解消すること |
      | REQ-0144-021 | RuntimeReference baseline の更新手順（更新タイミング、更新対象範囲、実行者）は明文化されること。baseline と実情の齟齬が delta ノイズとして報告される場合、根因を特定し適切に更新すること |
      | REQ-0144-022 | docs-check delta 検出は正当な除外（安定契約例外、歴史経緯免除）と NG 隠蔽を区別し、除外設定の方針を明文化すること（REQ-0144-015 準拠） |

conflict_resolutions:
  - id: CR-001
    conflict: >-
      REQ-0144-015「除外、恒久マスク仕組みで隠退させない」と
      AG-003「除外設定の方針を明文化」の見かけ上の矛盾
    resolution: >-
      AG-003 は正当な除外と NG 隠蔽の区別を求めるものであり、
      REQ-0144-015 の方針（NG 隠蔽禁止）を補強する。
      正当な除外（安定契約例外、歴史経緯免除）のみを許容し、
      NG 隠蔽は引き続き禁止。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0008
    target_req: REQ-0144
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_docs:
        - docs/requirements/REQ-0144.md
      artifact_action_map:
        ACT-REQ-001: docs/requirements/REQ-0144.md
      source_ru_map:
        RU-0008: REQ-0144 (REQ-0144-020, REQ-0144-021, REQ-0144-022 appended)
      saved_requirement_ids:
        - REQ-0144-020
        - REQ-0144-021
        - REQ-0144-022
      case_open_input:
        target_req: REQ-0144
        target_requirement_ids:
          - REQ-0144-020
          - REQ-0144-021
          - REQ-0144-022
        operation: append

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: >-
      docs-check 実行で backtick 囲みパスを含む文書を検査し、
      reference-path-existence 偽陽性が 0 件であることを確認する。
    pass_criteria: >-
      backtick 囲みパスの reference-path-existence 偽陽性 0 件。
      backtick 囲みパスの扱いが SPEC またはガイドに明文化されている。
    on_failure: fix-and-reverify
  - id: TS-002
    target_item: AG-002
    verification: >-
      RuntimeReference baseline 更新手順が SPEC またはガイドに明文化されていることを確認する。
      docs-check 実行で baseline 齟齬に起因する delta ノイズが 0 件であることを確認する。
    pass_criteria: >-
      baseline 更新手順明文化済み。baseline 齟齬 delta ノイズ 0 件。
    on_failure: fix-and-reverify
  - id: TS-003
    target_item: AG-003
    verification: >-
      delta 除外設定の方針が明文化されていることを確認する。
      docs-check 実行で正当な除外以外の NG が報告されることを確認する（NG 隠蔽されていない）。
    pass_criteria: >-
      除外設定方針明文化済み。正当でない除外（NG 隠蔽）0 件。
    on_failure: fix-and-reverify

case_open_hints:
  epic_needed: false

# summary

## 対象 RU

- RU-0008: docs-check baseline/delta ノイズ是正

## 主な変更内容

- REQ-0144（docs-check/integrity 運用是正）への APPEND 3 件（REQ-0144-020〜022）
- reference-path-existence の backtick 囲みパス扱い明確化
- RuntimeReference baseline 更新手順の明文化
- delta 除外設定方針の明文化（REQ-0144-015 と整合）

## ADR 判断

ADR 不要（既存 REQ への APPEND、新規アーキテクチャ判断なし）。

## 留意事項

- REQ-0144-015「除外、恒久マスク仕組みで隠退させない」と AG-003「除外設定方針明文化」は矛盾しない（CR-001 参照）
- AG-001 の backtick 囲みパスの扱い（パス参照 vs インラインコード除外）は実装修復作業で最終決定。req-define では方向性示示のみ
