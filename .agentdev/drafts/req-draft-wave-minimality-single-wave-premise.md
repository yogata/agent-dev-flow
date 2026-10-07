---
draft_type: req_draft
topic_slug: wave-minimality-single-wave-premise
status: draft
created_at: "2026-10-07T10:40:00+09:00"
source_rus: [RU-0180]
---

# draft-data

```yaml
work_type: bugfix

scale: standard

summary: |
  Epic の Wave 構成について、子 Issue 間の意味的依存 DAG に必須依存エッジが存在しない場合は
  すべての子 Issue を同一 Wave に割り当てる単一 Wave 前提と、Wave 割当がトポロジカルレベル割当
  （各子 Issue の Wave 番号 = 前提列 DAG における最長経路深さ）と一致する決定的導出を、
  case-ready Design「Wave 構成ルール」節と execution_unit 構成アルゴリズム参照へ明文化する。
  あわせて構成検証（決定的検証）へ「Wave 割当とトポロジカルレベル割当（最小性）の一致」検査を
  追加し、不一致を fail-closed で停止する機械的強制を、配布 skill 実行手順と repo-local
  決定的回帰検査の両面へ確立する。主題的近さ・ファイル重複・マージ順序の望ましさを Wave 分割
  理由として採用した構成はこの検査で拒否される。契機は Epic #3507（0 辺 DAG から主題別 3 Wave
  生成、2026-10-07 実測）である。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      Epic の Wave 構成は、子 Issue 間の意味的依存 DAG に必須依存エッジが存在しない場合、
      すべての子 Issue を同一 Wave に割り当てる（単一 Wave 前提）。依存 0 件なら Wave 数 1 が
      機械的に導出される。
  - id: AG-002
    content: |
      Wave 割当の決定的導出の定義: 各子 Issue の Wave 番号は、前提列 DAG における最長経路深さ
      （自身を始点とし前提辺を遡る経路の最大辺数）と一致するトポロジカルレベル割当として導出する。
      依存エッジが存在する場合も、辺を保存しながらレベルを超えて分割する過剰な Wave 分割を
      行わない。依存サイクルを検出した場合は構成不備として停止し、Wave 割当を行わない。
  - id: AG-003
    content: |
      構成検証（決定的検証）に「Wave 割当とトポロジカルレベル割当（最小性）の一致」検査を追加し、
      不一致を検出した場合は fail-closed で停止して Child Issue を作成しない。主題的近さ、
      ファイル重複、マージ順序の望ましさを Wave 分割の理由として採用した構成はこの検査で拒否される。
      依存エッジ 0 件の子 Issue 集合から複数 Wave が生成される構成（Epic #3507 型: 主題別 3 Wave・
      0 辺 DAG）が機械検査で fail となる回帰条件を検証に含める。
  - id: AG-004
    content: |
      Wave 構成判断（boolean 並列可否）の質問文・判断基準から主題的グルーピングを読み取れる文言を
      排除し、判断基準に単一 Wave 前提とトポロジカルレベル割当の確認を明記する。判断単位・
      質問形式の意味を変えない範囲での基準更新とし、Jev 観測識別子（workflow、evaluationKind、
      questionId）の互換性を維持する。
  - id: AG-005
    content: |
      既存の構成検証項目（Epic サイズ上限、必須依存 DAG 整合、全 operation_unit の Wave 割当完了）を
      維持する。横断補充（REQ-034-040）等の runtime 契約（依存充足ゲート単独条件のスロット型キュー、
      wave-gate.ts、slot_queue.ts）は変更しない。Epic サイズ上限・3軸判断（Standard/Epic 確定）・
      子 Issue への主題別集約自体、同一ファイル重複のマージ順序制約の扱い（競合リスク情報・
      マージ順序の事前記録として case-close 側で解消）も現行どおり維持する。Epic #3507 自体の
      遡及的 Wave 再構成・再実行は行わない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-061.md
    target_area: "## 要件"
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      | REQ-061-047 | case-ready は Epic の Wave 構成において、子 Issue 間の意味的依存 DAG に必須依存エッジが存在しない場合はすべての子 Issue を同一 Wave に割り当てること（単一 Wave 前提）。Wave 割当は各子 Issue の Wave 番号が前提列 DAG における最長経路深さと一致するトポロジカルレベル割当として決定的に導出すること。依存エッジが存在する場合も、辺を保存しながらレベルを超えて分割する過剰な Wave 分割を行わないこと |
      | REQ-061-048 | case-ready は構成検証（決定的検証）に「Wave 割当とトポロジカルレベル割当（最小性）の一致」検査を含め、不一致を検出した場合は fail-closed で停止して Child Issue を作成しないこと。主題的近さ、ファイル重複、マージ順序の望ましさを Wave 分割の理由として採用した構成はこの検査で拒否されること。依存エッジ 0 件の子 Issue 集合から複数 Wave が生成される構成が機械検査で fail となる回帰条件を検証に含めること。Wave 構成判断の質問文・判断基準から主題的グルーピングを読み取れる文言を排除し、判断単位・質問形式の意味を変えない範囲で観測識別子（workflow、evaluationKind、questionId）の互換性を維持すること |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/commands/case-ready.md
    target_design:
      operation: update
      domain: commands
      slug: case-ready
    target_area: "## v3 epic-wave-model Design からの吸収"
    source_items: [AG-001, AG-002, AG-003]
    content: |
      - Wave 構成ルール: 必須依存（意味的依存）で結合した連結成分を Epic 候補とし、技術的依存（L0-L3）は Wave 構成のための情報として連結成分計算から外す。Wave は Epic 内の子 Issue 間の意味的依存 DAG からのみ構成される Epic Issue の実行構成から読み取る内部構造であり、Epic サイズ上限のみを上限とし子 Issue 数の Wave 上限を持たない（REQ-035-006、REQ-061-010、REQ-061-038、REQ-061-047）。Wave 構成は同一の意味的依存関係入力から決定的に導出され、実行上限の数値に依存しない（DEC-041）。Wave 割当は子 Issue 間意味的依存 DAG のトポロジカルレベル割当（各子 Issue の Wave 番号 = 前提列 DAG における最長経路深さ）と一致することを前提とし、依存エッジが存在しない子 Issue 集合はすべて同一 Wave に割り当てる（単一 Wave 前提。依存 0 件なら Wave 数 1 が機械的に導出される）。主題的近さ、ファイル重複、マージ順序の望ましさを Wave 分割の理由として採用せず、これらを理由とする構成は構成検証の最小性検査（REQ-061-048）で拒否する。機械的判定手順は workflows/references/execution-unit-construction.md
  - id: ACT-DESIGN-002
    artifact: design
    operation: append
    target: docs/designs/workflows/references/execution-unit-construction.md
    target_design:
      operation: update
      domain: workflows
      slug: references/execution-unit-construction
    target_area: "## 連結成分アルゴリズム"
    source_items: [AG-001, AG-002, AG-003]
    content: |
      ## Wave 構成のトポロジカルレベル割当

      Epic 内の Wave 割当は、子 Issue 間の意味的依存 DAG（必須依存のみを辺とする）からの決定的導出とする（DEC-041、REQ-061-047）。手順は次のとおり。

      1. 各子 Issue の Wave 番号を、前提列 DAG における最長経路深さ（自身を始点とし前提辺を遡る経路の最大辺数）として計算する。必須依存エッジを持たない子 Issue の深さは 0 である
      2. 同一深さの子 Issue を同一 Wave に割り当てる。依存エッジが存在しない子 Issue 集合はすべて Wave 1 に割り当てられる（単一 Wave 前提。依存 0 件なら Wave 数 1）
      3. 依存サイクルを検出した場合は構成不備として停止する（Wave 割当を行わない）

      過剰な Wave 分割の禁止: 辺を保存しながらレベルを超えて分割する構成（同一最長経路深さの子 Issue を別 Wave へ割り当てる構成、主題的近さ・ファイル重複・マージ順序の望ましさを理由とした分割）は最小性違反として構成検証（case-ready Workflow Skill の構成検証。REQ-061-048）で fail-closed 拒否する。Wave 構成判断（並列可否の意味判断）はこの導出結果の確認であり、導入する判断基準に主題的グルーピングを含めない。

conflict_resolutions:
  - id: CR-001
    conflict: |
      Epic #3507 の実挙動（depends_on 全件空の 0 辺 DAG から子 Issue 9 件が機能的主題別 3 Wave に分割され、
      初期アドミッションで Wave-1 3 件 + Wave-2 2 件が混成投入）と、case-ready Design「Wave 構成ルール」の
      「Wave 構成は同一の意味的依存関係入力から決定的に導出され」契約の衝突。Epic 本文は「Wave 構成は
      意味的依存のみから構成され」と記述しつつ、実際の Wave は主題グルーピングであり Wave 境界が実行
      順序の意味を持たなかった。
    resolution: |
      契約（決定的導出）を正とし、導出規則をトポロジカルレベル割当（最長経路深さ）として明文化した上で
      構成検証の最小性検査により機械強制する。主題別集約は子 Issue 構成（3軸判断の機能的一貫性軸）として
      維持し、Wave 分割理由からは除外する。Epic #3507 自体の遡及的再構成・再実行は行わない。
      根拠: ユーザー指示（2026-10-07、session:20261007_022725_af6b57）を正とする RU-0180 の方針。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0180
    target_req: REQ-061
    target_design: docs/designs/commands/case-ready.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      bun test ./scripts/self/release/wave-composition-purity.test.ts を実行する。
      追加された最小性検査ケース（依存エッジ 0 件の子 Issue 集合から導出される Wave 数が 1、
      依存あり入力で Wave 割当が最長経路深さと完全一致）を確認する。
    pass_criteria: |
      依存エッジ 0 件の入力で Wave 構成が常に 1 Wave となること、依存エッジが存在する入力で
      Wave 割当がトポロジカルレベル割当（最長経路深さ）と完全一致することが検査で確認できること。
    on_failure: |
      fix-and-reverify とする。導出規則または検査実装を修正して再検証する。REQ・Design の文言
      不備に起因する場合は本 draft へ差し戻す。
  - id: TS-002
    target_item: AG-003
    verification: |
      #3507 型回帰ケース（子 Issue 9 件・依存 0 件・主題別 3 Wave 構成の入力）と過剰分割ケース
      （辺を保存しつつレベルを超えて分割する構成）を最小性検査へ投入する回帰検査を
      bun test ./scripts/self/release/wave-composition-purity.test.ts で実行する。
    pass_criteria: |
      両構成とも最小性違反として fail（検出）となること。#3507 型の再発防止回帰条件が成立すること。
    on_failure: |
      fix-and-reverify とする。検査関数または検証ケースを修正して再検証する。
  - id: TS-003
    target_item: AG-005
    verification: |
      更新後の src/common/skills/agentdev-workflow-case-ready/references/execution-structure.md の
      構成検証節を確認し、既存検証項目（Epic サイズ上限、必須依存〔意味的依存 DAG 整合〕の維持、
      全 operation_unit の Wave 割当完了）が残存し、かつ最小性検査が追加されていることを確認する。
      See Also 等の参照行は確認対象から除外する。
    pass_criteria: |
      既存3項目の維持と新規最小性検査の追加が両立していること。
    on_failure: |
      fix-and-reverify とする。実行手順の更新を修正して再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |
      更新後の execution-structure.md の Wave 構成判断（boolean 並列可否）について、
      (a) 判断基準に単一 Wave 前提とトポロジカルレベル割当の確認が明記されていること、
      (b) 主題的近さ・ファイル重複・マージ順序を Wave 分割理由としない旨が明記されていること、
      (c) 判断単位・質問形式の意味が不変であること（Jev 観測識別子 workflow/evaluationKind/questionId
      の維持）を確認する。あわせて bun test ./scripts/self/release/wave-composition-purity.test.ts を
      実行し、既存テストが pin する文言（「実行時の並列数・同時実行上限を Wave サイズや Wave 構成判断に
      適用しない」「ファイル重複のみを理由とした Wave 分離を処置に含めない」等）が削除されていない
      ことを確認する。
    pass_criteria: |
      (a)(b)(c) すべて成立し、pin 文言の消失による既存テスト失敗が存在しないこと。
    on_failure: |
      fix-and-reverify とする。文言更新を修正して再検証する。観測識別子の意味を変える変更が
      必要になった場合は本 draft へ差し戻す。
  - id: TS-005
    target_item: AG-005
    verification: |
      本 Case の変更ファイル集合に case-auto runtime 契約（src/common/skills/agentdev-workflow-case-auto/
      配下の scripts/src/wave-gate.ts、scripts/src/slot_queue.ts、runtime 制御契約記述）が含まれて
      いないことを確認する。あわせて bun test ./scripts/self/release/wave-composition-purity.test.ts の
      既存ケース（TS-001〜007 系: 構成不変性、共有上限、空き枠補充、収束・充足判定、再開計上、
      重複検出用途）がすべて成功することを確認する。
    pass_criteria: |
      runtime 側の契約・スクリプトが変更対象に含まれず、既存の runtime 系回帰検査がすべて
      維持成功すること。
    on_failure: |
      record-in-findings とする。runtime 側への影響が検出された場合は RU-0180 の対象外宣言の
      見直しを要するため、out-of-scope として findings に記録し本 draft へ差し戻す。

realization_actions:
  - id: RA-001
    concern: case-ready Workflow Skill の構成検証・Wave 構成判断の実行手順更新
    responsibility: |
      構成検証の検証項目へ「Wave 割当とトポロジカルレベル割当（最小性）の一致」検査を追加し、
      不一致時の fail-closed 停止（Child Issue 作成停止）を手順化する。Wave 構成判断の判断基準へ
      単一 Wave 前提とトポロジカルレベル割当の確認を明記し、主題的近さ・ファイル重複・マージ順序を
      Wave 分割理由としない旨を明記する。Epic 実行構成表の前提列は意味的依存のみを記載する旨を
      明確化する。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-ready/references/execution-structure.md（原本。ホスト別投影は同期対象）"
      - "Wave 構成判断の判断単位・質問形式の意味は不変とし、Jev 観測識別子（workflow/evaluationKind/questionId）の互換性を維持する"
      - "既存テスト wave-composition-purity.test.ts が pin する文言（実行時の並列数・同時実行上限を Wave サイズや Wave 構成判断に適用しない、等）は削除しない"
    intent: |
      RU-0180 の機械的強制を実行手順面へ接続し、主題的グルーピング由来の Wave 分割を判断・検証の
      両面で排除する。
    verification_refs: [TS-002, TS-003, TS-004]
    source_items: [AG-003, AG-004]
  - id: RA-002
    concern: 最小性検査の決定的回帰検査の実装
    responsibility: |
      scripts/self/release/wave-composition-purity.test.ts へ、Wave 割当とトポロジカルレベル割当
      （最長経路深さ）一致の検査関数と回帰ケース（0 辺 DAG から複数 Wave が生成される構成の fail、
      #3507 型の主題別 3 Wave・9 子 Issue・0 辺 DAG の fail、辺保存・レベル超過分割の fail）を追加する。
      既存の決定的参照モデル computeWaves（トポロジカルレベル割当を実装済み）を利用する。
    ownership_hints:
      - "scripts/self/release/wave-composition-purity.test.ts（repo-local 決定的回帰検査）"
      - "case-auto runtime 側 scripts/src/wave-gate.ts は対象外（runtime 制御の依存充足・収束判定であり構成検証ではない）"
    intent: |
      REQ-061-048 の機械検査と #3507 型回帰条件を決定的検証として成立させる。
    verification_refs: [TS-001, TS-002]
    source_items: [AG-001, AG-002, AG-003]

review_dispositions:
  - id: RD-001
    source_ru: RU-0180
    source_item: RU-0180
    disposition: covered
    reason_code: adopted_in_draft
    reason: |
      RU-0180 の必須8セクションの内容（目的、対象、対象外、正規所有者とアンカー、要件化の方向、
      決定的受け入れ条件 1〜5）を AG-001〜AG-005、artifact_actions（REQ-061 APPEND、case-ready Design
      update、execution-unit-construction Design append）、realization_actions（RA-001、RA-002）へ
      全面的に採用した。対象外宣言は AG-005 へ反映した。決定的受け入れ条件 1〜5 は TS-001〜TS-005
      へ対応付けた。
    evidence:
      path: .agentdev/backlog/req-units/RU-0180.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

## 対象と背景

Epic #3507（2026-10-07 実行、16 RU 一括統合）で、operation_units 21 件の depends_on が全件空（必須依存エッジ 0 本）であるにもかかわらず、子 Issue 9 件が機能的主題ごとの 3 Wave に分割された。Epic 本文は「Wave 構成は意味的依存のみから構成され」と記述しつつ実際の Wave は主題グルーピングであり、「決定的導出」契約（case-ready Design、REQ-061-038、DEC-041）と矛盾した。本 draft は将来の Wave 構成挙動を是正する。

## 構成

- **REQ-061 APPEND**（REQ-061-047/048）: 単一 Wave 前提、トポロジカルレベル割当による決定的導出、構成検証への最小性検査追加（fail-closed）、判断文言の整合と観測識別子互換性。SPLIT シグナル算定: 要件行数 46→48（+0、閾値 51 未満）、関心分類数 1（+0）、アーティファクト種別数 2（+0）、合計 0 → APPEND 許可。
- **Design 2件**: case-ready Design「Wave 構成ルール」節の update（単一 Wave 前提・トポロジカルレベル割当の明文化）、execution-unit-construction.md へ「Wave 構成のトポロジカルレベル割当」節の append（最長経路深さの手順、過剰分割の禁止）。
- **実現面（realization_actions）**: 配布 skill execution-structure.md の構成検証項目追加・判断基準文言更新（RA-001）、repo-local 決定的回帰検査への最小性検査・#3507 型回帰ケース追加（RA-002）。構成検証の最小性検査の配置先は既存の決定的回帰検査（wave-composition-purity.test.ts、参照モデル computeWaves を既に実装）への追加として確定した。新規配布 script は作成しない（scripts 公開入口 2 本固定〔DEC-021〕を維持）。

## Decision 判断（STEP-5 記録）

Decision 不要。重複確認: DEC-041（Wave 構成純度と実行並列上限の単一所有、決定1〜4 現行維持）が Wave 構成の正であり、本件はその導出規則の具体化（トポロジカルレベル割当）と機械強制の追加である。新規の責務境界・技術選定・不可逆判断を導入しないため Decision 禁止ゲート（仕様変更のみ）に該当する。work_type は bugfix を維持する（feature 昇格なし）。

## Jev 先行評価の実施記録

STEP-3（既存REQ照合判断: APPEND、追加確認不要）と STEP-4（最終分類・Design 分離: REQ行とDesign行の両方、分離する）の2判断単位で基本判断経路（Jev 先行評価 → LLM 推論 → LLM 最終判断 → 観測反映）を実施した。観測: 20261007T012622Z-5ea2、20261007T012657Z-b4b0。最終判断はいずれも evaluator 結果と一致した（差異理由の記録なし）。

## adversarial-review の実施記録

2系統の独立 stream（契約整合、導出規則・機械検査）で challenge → counter-challenge → convergence → convergence audit を実施した。採用 finding: (1) 既存テスト pin 文言の維持制約を TS-004・RA-001 へ明記、 execution-structure.md の前提列文言（意味的依存のみを記載する旨）の明確化を RA-001 へ含める、 AG-004 の文言更新に判断基準への明示的禁止の追加を含める。未解決のユーザー判断事項なし。
