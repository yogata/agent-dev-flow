---
draft_type: req_draft
topic_slug: qg2-completion-consistency-gate
status: draft
created_at: 2026-11-17T00:50:00+09:00
source_rus: []
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: |
  QG-2（Acceptance Criteria Coverage）がどの工程でも実行されていない現状を解消し、完了条件の事前整合性検査
  （その案件が作る・変更する成果物との整合性を含む）として接続する。2026-11-16 の実測では、QG-2 への接続は
  agentdev-quality-gates skill と要件定義の側の2つの手引きのみで、case-open・case-ready・
  agentdev-workflow-lifecycle の各 SKILL に QG-2 への言及が0件。Case #4113 の全ての委譲の記録に
  QG-2・観点6・数値閾値の手引きの実行の痕跡は0件だった。配置の指定は3文書で食い違っており
  （qg-2 reference の配置の表は case-open、v4 モデルと case-open Design は case-ready へ移管、
  case-ready Design は義務なし）、TS-002 の到達できない完了条件（追跡対象全体で cron を含むファイルが
  0件であることを要求しながら、同一の案件の必須の成果物 DEC-063 に cron という語を記載する）は、規則が
  一度も動かなかったために通過した。配置を case-ready に確定し（2026-11-17 の利用者判断）、実行と記録を
  接続し、観点6 の検証手順に成果物との整合性の確認を加える。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      QG-2 の配置を case-ready に確定する（2026-11-17 の利用者判断。v4 モデルと case-open Design の移管の
      記述と一致）。qg-2-acceptance-criteria-coverage.md の配置の表と case-open Design の記述をこの確定に
      一致させる。case-ready の手順と機械工程へ QG-2 の判定を接続し、判定の結果を工程の記録コメント
      （または報告 JSON）に残す義務を付ける。
  - id: AG-002
    content: |
      観点6（数値閾値到達可能性検証）の検証手順に、その案件が作る・変更する成果物との整合性の確認を加える。
      機械で実行できる検査（完了条件の検証手順に書かれた grep 系のコマンドを、確定済みの成果物に対して
      事前に実行する）を含める。判定の区別を明示する: 追跡対象全体で語が0件であることを要求しながら
      必須の成果物に同じ語を記載する場合は不合格。対象の範囲（.github 配下など）が明示された0件という
      要求で、成果物に経緯として語を記載する場合は合格。
  - id: AG-003
    content: |
      3文書の配置の記述の食い違いを解消し、QG-2 の所有（判定の基準）・実行（case-ready）・記録（工程の記録
      コメントまたは報告 JSON）を1点に集約する。観点1〜5・7〜9 の機械化は対象外とし、観点6 の事前整合性検査
      のみをこの案件の対象とする。

artifact_actions:
  - id: ACT-SKL-001
    artifact: skill
    operation: update
    target: src/common/skills/agentdev-quality-gates/references/qg-2-acceptance-criteria-coverage.md
    source_items: [AG-001, AG-002]
    content: |
      配置の表を case-ready に確定した記述へ更新する。観点6 の検証手順に、その案件が作る・変更する成果物
      との整合性の確認（機械で実行できる grep 系の事前に実行する検査を含む）と、合格・不合格の判定の区別を追加する。
   - id: ACT-SKL-002
    artifact: skill
    operation: update
    target: src/common/skills/agentdev-workflow-case-ready/SKILL.md
    source_items: [AG-001]
    content: |
      case-ready の手順へ QG-2 の判定の実行と、判定の結果を工程の記録コメント（または報告 JSON）へ残す
      義務を接続する。
  - id: ACT-DES-001
    artifact: design
    operation: update
    target: docs/designs/commands/case-open.md
    source_items: [AG-001, AG-003]
    content: |
      「完了条件（QG-2 検証）は case-ready へ移管済み」の記述を、配置の確定（case-ready）として整理する。
   - id: ACT-DES-002
    artifact: design
    operation: update
    target: docs/designs/commands/case-ready.md
    source_items: [AG-001, AG-003]
    content: |
      case-ready Design へ QG-2 の実行と記録の義務を反映する。
  - id: ACT-REQ-001
    artifact: requirement
    operation: update
    target: docs/requirements/REQ-061.md
    source_items: [AG-001, AG-002]
    content: |
      case-ready の受入検査に QG-2 の判定（観点6 の成果物との整合性を含む）と記録を要件として追加する。

conflict_resolutions: []

operation_units:
  - id: OU-001
    description: |
      QG-2 の完了条件の事前整合性検査の接続（単一 Issue）。配置の確定と3文書の整合（AG-001・AG-003）、
      観点6 の検証手順の拡張（AG-002）、case-ready への実行と記録の接続、要件行の反映を同一の変更として
      完結させる。
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-002
    verification: |
      正例として、Case #4113 の TS-002 の元の形（追跡対象全体で cron を含むファイルが0件であることを要求し、
      必須の成果物の判断記録 DEC-063 に cron という語を記載する構成）を検査へ通す。
    pass_criteria: |
      不合格として検出されること。検出の理由が「必須の成果物が要求する語を含むこと」として表示されること。
    on_failure: |
      fix-and-reverify。判定の区別の実装を修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      反例として、Case #4113 の訂正後の形（.github 配下など対象の範囲を明示した0件という要求で、成果物に
      経緯として語を記載する構成）を検査へ通す。
    pass_criteria: |
      合格となること。
    on_failure: |
      fix-and-reverify。範囲の解釈の実装を修正して再検証する。
  - id: TS-003
    target_item: AG-001
    verification: |
      case-ready の実行で QG-2 の判定が実行され、判定の結果が工程の記録コメント（または報告 JSON）に
      残ることを確認する。
    pass_criteria: |
      判定の結果の記録が存在すること。判定が実行されなかった場合に case-ready が完了として扱われないこと。
    on_failure: |
      fix-and-reverify。接続と記録の義務の実装を修正して再検証する。

realization_actions:
  - id: RA-001
    concern: QG-2 の完了条件の事前整合性検査の実行と記録の接続
    responsibility: |
      配置を case-ready に確定し、判定の実行と記録を case-ready の手順と機械工程へ接続する。観点6 の
      検証手順に、その案件が作る・変更する成果物との整合性の確認（grep 系の事前に実行する検査）を加える。
      観点1〜5・7〜9 の機械化は行わない。
    ownership_hints:
      - "変更の対象: src/common/skills/agentdev-quality-gates/references/qg-2-acceptance-criteria-coverage.md の配置の表と観点6"
      - "変更の対象: src/common/skills/agentdev-workflow-case-ready/SKILL.md の手順への接続"
      - "変更の対象: docs/designs/commands/case-open.md と docs/designs/commands/case-ready.md と docs/requirements/REQ-061.md への配置と記録の義務の反映"
      - "実績の参照（2026-11-16 実測）: case-open・case-ready・agentdev-workflow-lifecycle の各 SKILL で QG-2 への言及0件。Case #4113 の全ての委譲の記録で QG-2・観点6・数値閾値の手引きの実行の痕跡0件"
      - "配置の食い違いの実測: qg-2-acceptance-criteria-coverage.md の配置の表は case-open STEP-2/5、docs/designs/quality/v4-quality-gate-model.md と docs/designs/commands/case-open.md は case-ready への移管、docs/designs/commands/case-ready.md は QG-2 の義務の記述なし"
    intent: |
      完了条件がその案件の成果物と矛盾する場合を、実行の前に検出する。QG-2 を配置・実行・記録の
      すべてが1点に定まった状態にする。
    verification_refs: [TS-001, TS-002, TS-003]
    source_items: [AG-001, AG-002, AG-003]

review_dispositions: []

assembly_evidence: []

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

QG-2 がどの工程でも実行されていない現状（2026-11-16 実測・接続0件・実行の痕跡0件・配置の指定が3文書で
食い違い）を解消する。配置を case-ready に確定し（2026-11-17 の利用者判断）、判定の実行と記録を
case-ready へ接続し、観点6 にその案件が作る・変更する成果物との整合性の確認を加える。TS-002 型の矛盾
（追跡対象全体の0件という要求と、必須の成果物の語の記載）を不合格として検出し、範囲を明示した要求を合格とする
判定の区別を明示する。観点1〜5・7〜9 の機械化は対象外。
