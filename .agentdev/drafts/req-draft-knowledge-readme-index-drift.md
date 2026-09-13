---
draft_type: req_draft
topic_slug: knowledge-readme-index-drift
status: saved
created_at: 2026-09-14T00:25:23+09:00
source_rus: []
---

<!-- req_draft テンプレートに従う構造化 draft-data。
正規の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。 -->

# draft-data

```yaml
work_type: docs_chore

summary: docs/knowledge/README.md の「現在の知識文書」一覧（3件）を実態の知識文書8ファイルへ現行化する。REQ-057（docs corpus 整合・現行化バッチ）へ README 一覧の実態整合基準行を追加する。恒久対策候補（docs-check 機械検査範囲拡張、knowledge README 一覧の AUTOGEN 化）と再発構造（learning 昇華保存承認時の README 更新欠落ギャップ）は採用判断を行わず、記録として Case Issue 本文へ保持する。既存 intake item（2026-09-11-knowledge-readme-missing-bun-offline-entry）は本件乖離5件に完全包含される。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      docs/knowledge/README.md「## 現在の知識文書」節の一覧を docs/knowledge/ 配下の知識文書実態（8ファイル）へ現行化する。件数表記「3件。」を「8件。」へ更新し、列挙漏れ5ファイル（baseline-substitution-vocabulary-crosscheck.md、bun-offline-bundle-placement-independent-build.md、bun-test-junit-reporter-evidence.md、distribution-concrete-id-placement.md、windows-bun-test-spawn-timeout-classification.md）を追加する。あわせて REQ-057 の要件テーブルへ「docs/knowledge/README.md の知識文書一覧（列挙と件数表記）は docs/knowledge/ 配下の知識文書実態と整合すること」の基準行を1行追加する。docs/README.md の「知識（Knowledge）」セクションは列挙を持たず REQ-057-016 に整合するため対象外とする。
  - id: AG-002
    content: |
      恒久対策候補を記録する。本 Case では採用判断を行わず、記録として Case Issue 本文へ保持する:
      - REQ-056-010 の機械検査範囲（frontmatter + 本体5項目）への「README 列挙整合」拡張（docs-check route 候補）
      - knowledge README 一覧の AUTOGEN 化（index-auto-generation Design 準拠）
  - id: AG-003
    content: |
      再発構造を記録する（AG-002 の採用判断材料として Case Issue 本文へ保持する）: learning 昇華（REQ-056-004、backlog-review の docs/knowledge/ 直接保存）の保存承認時に README 一覧更新が組み込まれていない運用ギャップが本乖離の再発構造である。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-057
    source_items: [AG-001]
    content: |
      REQ-057 の要件テーブルへ次の基準行を1行追加する（行ID の採番は req-save が確定する）:
      docs/knowledge/README.md の知識文書一覧（列挙と件数表記）は docs/knowledge/ 配下の知識文書実態と整合すること

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru: null
    target_req: REQ-057
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      status: saved
      saved_docs:
        - req_id: REQ-057
          path: docs/requirements/REQ-057.md
          operation: append
          added_rows: [REQ-057-025]
      ou_to_saved_doc:
        OU-001: docs/requirements/REQ-057.md
      unclassified_rows:
        - REQ-057-025

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs/knowledge/ 配下の実ファイル一覧（README.md を除く）を取得し、docs/knowledge/README.md「## 現在の知識文書」節の列挙・件数表記と機械的に突合する。
    pass_criteria: |
      実態の知識文書8ファイルと README 列挙が完全一致し、件数表記が「8件。」であること。
    on_failure: |
      README の列挙・件数表記を修正して再検証する（fix-and-reverify を選択する。案内層の乖離は本文修正で解消可能なため）。
  - id: TS-002
    target_item: AG-001
    verification: |
      REQ-057 の要件テーブルに README 一覧の実態整合基準行が追加保存されていることを確認する。
    pass_criteria: |
      docs/requirements/REQ-057.md の要件テーブルに該当基準行が存在すること。
    on_failure: |
      REQ 行追加（req-save）を再実施して再検証する（fix-and-reverify を選択する。保存操作の再実行で解消可能なため）。
  - id: TS-003
    target_item: AG-002
    verification: |
      Case Issue 本文に恒久対策候補2項目（REQ-056-010 機械検査範囲への README 列挙整合拡張、knowledge README 一覧の AUTOGEN 化）と再発構造（AG-003）の記録が存在することを確認する。
    pass_criteria: |
      恒久対策候補2項目と再発構造の記録が Case Issue 本文に存在すること。
    on_failure: |
      Issue 本文へ記録を追記して再検証する（fix-and-reverify を選択する。記録の追記で解消可能なため）。

realization_actions:
  - id: RA-001
    concern: docs/knowledge/README.md の知識文書一覧の現行化
    responsibility: |
      docs/knowledge/README.md は知識領域の案内であり、実態に追随すべき導線情報である（REQ-056-001 の配置契約に従う知識領域の README）。一覧更新義務は REQ 上明文化されていないが、列挙する以上は実態整合が要請される。本件で追加する REQ-057 基準行が README 一覧の正規の整合基準を所有する。
    ownership_hints:
      - docs/knowledge/README.md「## 現在の知識文書」節
      - REQ-056-001（docs/knowledge/ の配置契約）
      - REQ-057 新規基準行（req-save が採番）
    intent: |
      README 一覧の件数表記と列挙を実態の知識文書8ファイルと一致させ、案内層と実態の乖離を解消する。
    verification_refs: [TS-001]
    source_items: [AG-001]

review_dispositions:
  - id: RD-001
    source_item: 2026-09-13-knowledge-readme-index-drift
    disposition: covered
    reason_code: integrated
    reason: |
      inspect/promoted 成果物「docs/knowledge/README.md の知識文書一覧が実態から乖離」の受け入れ条件1（一覧の実態整合・件数表記更新）を AG-001・ACT-REQ-001 として covered。受け入れ条件2（恒久対策候補の記録）は AG-002、受け入れ条件3（再発構造の記録）は AG-003 として記録し、採用判断は本 Case では行わない（promoted 成果物の指示どおり本成果物から独立 route を作らない）。元 intake item（2026-09-11-knowledge-readme-missing-bun-offline-entry、bun-offline 1件のみ指摘）は本件乖離5件に完全包含されるため related_removed_items へ記録する。同 item は inbox に残置され、intake-promote 実行時に本成果物との重複として処分される。backlog-review 実行時は intake/promoted/ に同 item の派生成果物が存在しないことを確認すること。
    evidence:
      path: .agentdev/inspect/promoted/2026-09-13-knowledge-readme-index-drift.md
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items:
      - 2026-09-11-knowledge-readme-missing-bun-offline-entry

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

<!-- 人間可読サマリー。後続工程の原本としては扱われない。処理の原本は上記 # draft-data YAML ブロックである。 -->

- 入力: `.agentdev/inspect/promoted/2026-09-13-knowledge-readme-index-drift.md`（inspect-promote 採用済み成果物。backlog-review による RU 化を経由せず、ユーザーの明示指定により req-define へ直接入力。参照専用）
- 実態確認（2026-09-14 実行時）: docs/knowledge/ 配下は README を除き知識文書8ファイル。README「## 現在の知識文書」節は「3件。」+3ファイル列挙で、乖離5件は機械的突合により確定（promoted 成果物の evidence と一致）
- 既存REQ照合: REQ-057（docs corpus 整合・現行化バッチ）への APPEND。REQ-057 の目的（inspect 昇格由来の docs corpus カタログ不整合の現行状態への復元）に合致。REQ-056 への APPEND は不採用（知識文書契約・登録経路の所有であり、README 案内の一覧現行化は REQ-057 の関心）
- SPLIT 予兆計測: REQ-057 現行24行（req-health-metrics Design 計測例 2026-09-12、行数シグナル +0）。append 後25行で 0〜50 帯、関心分類・アーティファクト種別とも単一系統 → SPLIT シグナル合計 0、SPLIT 提案なし
- work_type: docs_chore（docs/** の案内層一覧修正+REQ 1行 append。機能追加なし）
- handoff 判定: 本リポジトリは agent-dev-flow repository（self-hosting）であり、AgentDevFlow 本体 docs は通常の req/case workflow の改修対象。`agentdev_handoff: true` は不要（upstream-handoff.md 基準）
- Decision 判断: Decision 候補なし。恒久対策候補の採用判断（docs-check 拡張、AUTOGEN 化）は promoted 成果物の指示により本 Case では行わない。本件は既存 REQ への append で hard-to-reverse な判断を含まない
- adversarial-review: skip（docs_chore lightweight 規模、Decision 判断対象なし、意味的決定なし — promoted 成果物で採用済み内容の機械的現行化のみ。default-on の skip 条件該当）
- 後続: req-save（REQ-057 append 行の保存）→ case-open → case-run（README 実修正）→ case-close
