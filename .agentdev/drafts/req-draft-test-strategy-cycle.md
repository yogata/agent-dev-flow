---
draft_type: req_draft
topic_slug: test-strategy-cycle
status: saved
created_at: 2026-06-24T00:00:00+09:00
source_rus: []
---

<!-- req-define 生成ドラフト。原本は下記 # draft-data YAML ブロック。 -->

# draft-data

```yaml
# work_type: 機能追加（既存ワークフローへの構造的拡張）
work_type: feature

# scale: feature。実装スコープシグナル（影響ファイル 10+、複数 command、複数 REQ）により large
scale: large

# summary: 当該 draft が合意したことの1段落要約
summary: |
  Issue 本文の「テスト戦略」セクションが検証手順のプレースホルダのみを提供し、合格基準と不合格時の処置を欠くため、case-run でテストが失敗しても無視される問題を解消する。test strategy 項目を verification（検証手順）、pass_criteria（合格基準）、on_failure（不合格時の処置）の3要素構造として定義し、on_failure を持たない項目を除外するルールを設ける。この3要素構造を req-define が draft-data の test_strategy セクションとして生成し、QG-1 が完全性を検証し、case-open が Issue 本文に埋め込み、case-run と実行担当サブエージェントが test-fix ループを実行し、case-close が全項目の処理完了を確認し、QG-4 が最終受け入れで検証する、という伝播チェーンを AgentDevFlow 主ワークフロー全体に貫通させる。

# auto_gate: case-auto 自走可否
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目（全て Confirmed 分類、ユーザー明示確認済み）
agreed_items:
  - id: AG-001
    content: |
      test strategy 項目は3要素構造（verification（検証手順）、pass_criteria（合格基準）、on_failure（不合格時の処置））として定義する。on_failure（不合格時の処置）を持たない検証項目は test strategy に含めない。このルールは test strategy という概念の構造そのものを規定するものであり、req-define、case-open、case-run、case-close の全工程が共有する安定契約（接続契約）として機能する。
  - id: AG-002
    content: |
      draft-data テンプレート（src/opencode/commands/agentdev/templates/req-define/req-draft.md）に test_strategy フィールドを追加する。各項目は id（TS-NNN 形式）、target_item（AG-* への参照）、verification、pass_criteria、on_failure の5属性を持つ。req-define は要件展開において test_strategy を生成し、draft-data に格納する。
  - id: AG-003
    content: |
      req-define コマンドに test strategy 定義ステップ（要件展開内）、test_strategy 生成（draft-data）、guardrail（test strategy 完全性要求、G19）を追加する。Step 番号、guardrail 番号、生成タイミングの詳細は command reference および req-define SPEC が扱う。
  - id: AG-004
    content: |
      QG-1（agentdev-quality-gates/references/qg-1-definition-integrity.md）に test_strategy 3要素完全性の検査観点を追加する。3要素のいずれかが欠落する test strategy 項目を検出した場合、QG-1 は fail とする。この検査は req-define / req-save が適用する。
  - id: AG-005
    content: |
      Issue 本文テンプレート（issue_desc_feature.md、issue_desc_child.md、issue_desc_bug.md）の「テスト戦略」セクションを3要素構造形式に変更する。現行の [テスト対象と期待される結果] プレースホルダを、verification / pass_criteria / on_failure の3要素を記述する形式に置き換える。
  - id: AG-006
    content: |
      case-open コマンドに Step 2-2 を追加し、draft-data の test_strategy を Issue 本文のテスト戦略セクションに埋め込む。各項目の3要素を構造化して反映する。
  - id: AG-007
    content: |
      case-run コマンドおよび Sisyphus-Junior 責務（agentdev-case-run-execution-adapter SKILL.md 経由）に test strategy 項目の実行アクションを追加する。実行担当サブエージェントは各項目について検証を実行し、不合格時は実装を修正して再検証するか Findings に記録し、全項目を処理するまで反復する。
  - id: AG-008
    content: |
      case-close コマンド Step 2 に test strategy 完了確認（全項目が合格または Findings 記録済み）を追加する。QG-4（agentdev-quality-gates/references/qg-4-final-acceptance.md）に test strategy 処理完了の検査観点を追加する。

# artifact_actions: REQ/ADR/SPEC への保存対象を単一配列に統合
# REQ 操作: APPEND（全対象 REQ が既存）
# SPEC 操作: spec-update（既存 SPEC への追記）
# ADR: なし（ADR禁止ゲート対象）
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-0102.md
    target_area: 要件テーブル
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      REQ-0102（要件定義・保存）への APPEND 要件行:
      - req-define は要件展開において test_strategy（テスト戦略）を定義すること。各 test strategy 項目は verification（検証手順）、pass_criteria（合格基準）、on_failure（不合格時の処置）の3要素で構成すること
      - on_failure（不合格時の処置）を持たない検証項目は test_strategy に含めないこと
      - req-define は生成する draft-data に test_strategy セクションを含めること。各項目は一意の識別子、対象 item、verification、pass_criteria、on_failure を保持すること
      - req-define および req-save は test_strategy 項目の3要素完全性を QG-1（Definition Integrity Gate）の検査観点として適用すること。3要素のいずれかが欠落する項目を検出した場合、保存前に fail とすること

  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-0132.md
    target_area: 要件テーブル
    source_items: [AG-006]
    content: |
      REQ-0132（case-open / Issue作成）への APPEND 要件行:
      - case-open は draft-data の test_strategy を Issue 本文のテスト戦略セクションに埋め込むこと。各項目の verification、pass_criteria、on_failure の3要素を構造化して反映すること

  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-0130.md
    target_area: 要件テーブル
    source_items: [AG-007]
    content: |
      REQ-0130（case-run / 実装パイプライン）への APPEND 要件行:
      - case-run は test strategy 項目の検証、不合格時の処置（実装修正して再検証、または Findings 記録）、全項目処理までの反復を実行担当サブエージェントの委譲契約に含めること
      - case-run から委譲された実行担当サブエージェントは、Issue 本文の test strategy 項目ごとに検証を実行すること。不合格時は実装を修正して再検証するか、当該項目を Findings に記録すること。全項目の処理が完了するまで検証と修正を反復すること

  - id: ACT-REQ-004
    artifact: req
    operation: append
    target: docs/requirements/REQ-0131.md
    target_area: 要件テーブル
    source_items: [AG-008]
    content: |
      REQ-0131（case-close / 完了処理）への APPEND 要件行:
      - case-close は全 test strategy 項目が合格済みまたは Findings 記録済みであることを完了条件として確認すること。未処理の test strategy 項目が残る場合、完了扱いとしないこと

  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/req-define.md
    target_area: 現在の動作、検証観点
    source_items: [AG-002, AG-003]
    content: |
      docs/specs/commands/req-define.md への追記事項（SC-001: test_strategy フィールドスキーマ詳細）:
      - test_strategy セクションのシリアライズ形式（TS-NNN 識別子形式、target_item 参照形式、3要素の YAML 表現）
      - on_failure アクション種別の詳細列挙（fix-and-reverify: 実装を修正して再検証 / record-in-findings: Findings に out-of-scope として記録 の2値とその選択基準）
      - req-define SPEC「現在の動作」に test strategy 定義ステップを追記
      - req-define SPEC「検証観点」に QG-1 test_strategy 3要素完全性検査を追記

  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target: docs/specs/quality-gates.md
    target_area: QG-1, QG-4 セクション
    source_items: [AG-004, AG-008]
    content: |
      docs/specs/quality-gates.md への追記事項（SC-002: QG-1/QG-4 test_strategy 検査観点要約）:
      - QG-1「Definition Integrity Gate」セクションに test_strategy 3要素完全性検査観点を要約として追記。詳細は agentdev-quality-gates スキル参照ファイル（qg-1-definition-integrity.md）を原本とする
      - QG-4「Final Acceptance Gate」セクションに test strategy 処理完了確認観点を要約として追記。詳細は qg-4-final-acceptance.md を原本とする

# conflict_resolutions: 壁打ちで解消された衝突、スコープ判断
conflict_resolutions:
  - id: CR-001
    conflict: docs-check コマンドの不認可実行問題（Sisyphus-Junior が Issue 本文指示に従い未認可コマンドを実行する問題）を本要件に含めるか否か
    resolution: |
      対象外（Out of Scope）とする。docs-check 不認可実行問題は test strategy 3要素構造とは独立した別問題であり、別要件として扱う。本要件は test strategy 3要素構造とその伝播チェーンのみに焦点を当てる。ルール: on_failure を持たない検証項目（docs-check を実行して NG が0件、等の不合格時処置なしの項目）は test strategy から除外されるため、3要素構造の導入自体が docs-check 儀式化問題の構造的予防の一部となるが、docs-check 固有の対策は含めない。

# operation_units: REQ/SPEC 操作単位（依存関係付き）
operation_units:
  - ou_id: OU-001
    source_ru: null
    target_req: REQ-0102
    target_spec: null
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_reqs:
        - REQ-0102
      requirement_line_ids:
        - REQ-0102-074
        - REQ-0102-075
        - REQ-0102-076
        - REQ-0102-077
      status: completed

  - ou_id: OU-002
    source_ru: null
    target_req: REQ-0132
    target_spec: null
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: single
    result:
      saved_reqs:
        - REQ-0132
      requirement_line_ids:
        - REQ-0132-018
      status: completed

  - ou_id: OU-003
    source_ru: null
    target_req: REQ-0130
    target_spec: null
    operation: append
    scale: standard
    depends_on: [OU-002]
    recommended_order: 4
    issue_policy: single
    result:
      saved_reqs:
        - REQ-0130
      requirement_line_ids:
        - REQ-0130-029
        - REQ-0130-030
      status: completed

  - ou_id: OU-004
    source_ru: null
    target_req: REQ-0131
    target_spec: null
    operation: append
    scale: standard
    depends_on: [OU-003]
    recommended_order: 5
    issue_policy: single
    result:
      saved_reqs:
        - REQ-0131
      requirement_line_ids:
        - REQ-0131-026
      status: completed

  - ou_id: OU-005
    source_ru: null
    target_req: null
    target_spec: docs/specs/commands/req-define.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}

  - ou_id: OU-006
    source_ru: null
    target_req: null
    target_spec: docs/specs/quality-gates.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001, OU-004]
    recommended_order: 6
    issue_policy: single
    result: {}

# case_open_hints: case-open 構成生成への参考情報
case_open_hints:
  epic_needed: true
  decomposition: |
    6 OU（4 REQ APPEND + 2 SPEC update）が test strategy 伝搬チェーンに沿って依存する。
    Wave 構成案:
      Wave 1: OU-001（REQ-0102: test_strategy 生成・構造・QG-1 検査）+ OU-005（SPEC req-define.md: スキーマ詳細）。REQ-0102 が構造を定義し、SPEC が詳細を補完するため同一 Wave。
      Wave 2: OU-002（REQ-0132: case-open 埋め込み）。REQ-0102 で定義された構造を Issue 本文へ伝搬。
      Wave 3: OU-003（REQ-0130: case-run/Sisyphus test-fix ループ）。Issue 本文の test_strategy を実行。
      Wave 4: OU-004（REQ-0131: case-close 完了確認）+ OU-006（SPEC quality-gates.md: QG 要約）。完了確認と QG 要約でチェーンを閉じる。
    実際の Epic/Issue 構成、Wave 分割は case-open が自律生成する（G13、G19、G20 準拠）。
  wave_hints:
    - wave: 1
      ous: [OU-001, OU-005]
      execution: parallel
      rationale: REQ-0102（構造定義）と SPEC req-define.md（スキーマ詳細）は L1（Specs共有）依存。並列可能。
    - wave: 2
      ous: [OU-002]
      execution: serial
      rationale: case-open は REQ-0102 の test_strategy 定義に依存（L3 明示的依存）。
    - wave: 3
      ous: [OU-003]
      execution: serial
      rationale: case-run は case-open が Issue 本文に埋め込んだ test_strategy に依存（L3）。
    - wave: 4
      ous: [OU-004, OU-006]
      execution: parallel
      rationale: case-close は case-run の実行結果に依存（L3）。SPEC quality-gates.md は REQ-0102（QG-1）と REQ-0131（QG-4）の双方に依存するが、OU-004 と同一 Wave で並列可能（L1 Specs共有）。

# test_strategy: 本要件自身の test strategy（AG-001 に従う3要素構造）
test_strategy:
  - id: TS-001
    target_item: AG-002
    verification: |
      本要件実装後、配布物整合性検査スクリプト（.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts）を実行し、draft-data の test_strategy フィールド追加および Issue テンプレート変更が配布物整合性（ID 除去後の構文健全性、文意保持、責務整合）を破壊していないことを確認する。
    pass_criteria: |
      check_integrity.ts がエラー 0 件で完了すること。test_strategy フィールド、3要素構造、テンプレート変更に起因する NG が检出されないこと。
    on_failure: |
      実装を修正して再検証する。check_integrity.ts が報告した NG 項目を原因ファイルごとに修正し、エラー 0 件になるまで再実行する。
```

# summary

## 背景

AgentDevFlow Issue 本文の「テスト戦略」セクションは、現行の Issue 本文テンプレート（`issue_desc_feature.md`、`issue_desc_child.md`、`issue_desc_bug.md`）が各テスト項目について `[テスト対象と期待される結果]` プレースホルダのみを提供する。case-open が Issue 本文を生成する際、このプレースホルダに検証手順のみの指示（例: 「docs-check を実行し NG が0件であることを確かめる」）が填充される。

case-run で Sisyphus-Junior がこのテスト戦略に従うとき、(1) テストを実行し、(2) NG 結果を検出し、(3) それを「既存の問題」と見なし、(4) 修正せず、(5) PR を作成する。test-fix ループがワークフローに存在しない。テストは実行されるが結果がアクションを駆動しない。

根本原因は、test strategy という概念が構造を持たないことである。何を検証するか（WHAT）は定義するが、合格基準（何がパスか）と不合格時の処置（テストが失敗したらどうするか）を定義しない。そのため「テスト」が無意味な儀式化する。

## 合意内容

test strategy 項目を verification（検証手順）、pass_criteria（合格基準）、on_failure（不合格時の処置）の3要素構造として定義する（AG-001）。on_failure を持たない項目は test strategy から除外する。この3要素構造を req-define が draft-data の test_strategy セクションとして生成し（AG-002、AG-003）、QG-1 が3要素完全性を検証し（AG-004）、case-open が Issue 本文に埋め込み（AG-005、AG-006）、case-run と Sisyphus-Junior が test-fix ループを実行し（AG-007）、case-close が全項目の処理完了を確認し（AG-008）、QG-4 が最終受け入れで検証する。この伝播チェーンを AgentDevFlow 主ワークフロー全体に貫通させる。

## ADR 判定

ADR 不要。本件は ADR禁止ゲートの対象（詳細は draft-meta.adr_judgment 参照）。

## 対象 REQ 操作

| REQ | 操作 | 追加要件行数 | 追加後要件行数 |
|---|---|---|---|
| REQ-0102 | APPEND | 4 | 71 |
| REQ-0132 | APPEND | 1 | 18 |
| REQ-0130 | APPEND | 2 | 24 |
| REQ-0131 | APPEND | 1 | 23 |

REQ-0140（文書品質ゲート）は対象外。REQ-0140 の目的は `agentdev-doc-writing` スキルの文書品質ゲートであり、QG-1〜QG-4 主ゲート体系ではない（REQ-0140 本文「このゲートはQG-1〜QG-4の主ゲート体系を置き換えず」）。AG-004（QG-1 検査観点）は req-define/req-save の消費契約であるため REQ-0102 に、AG-008（case-close 完了確認 + QG-4 検査観点）は case-close の責務であるため REQ-0131 に振り分けた。

## 実装詳細（反映作業・移送候補）

以下は要件行ではなく、後続工程（case-run、spec-save）が扱う反映作業である。draft-data の artifact_actions とは分離して記録する（Step 10-1 準拠）。

### command 定義ファイルへの反映

- `src/opencode/commands/agentdev/req-define.md`: Step 5-6（test strategy 定義）、Step 7-4（draft-data test_strategy 生成）、Step 10 標準フィールドへ test_strategy 追加、guardrail G19（test strategy 完全性要求）を追記
- `src/opencode/commands/agentdev/case-open.md`: Step 2-2（draft-data の test_strategy を Issue 本文テスト戦略セクションに埋め込み）を追記
- `src/opencode/commands/agentdev/case-run.md`: Step 6（委譲プロンプト）、Step 7（result 処理）に test strategy 項目の test-fix ループ実行を明記
- `src/opencode/commands/agentdev/case-close.md`: Step 2（前提確認）に test strategy 完了確認を追記

### skill 定義ファイルへの反映

- `src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md`: 実行担当サブエージェントの責務に test strategy 項目ごとの検証、不合格時処置（fix-and-reverify / record-in-findings）、全項目処理までの反復を追記
- `src/opencode/skills/agentdev-quality-gates/references/qg-1-definition-integrity.md`: 検査観点（観点10 等）に test_strategy 3要素完全性検査を追記
- `src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md`: 検査観点に test strategy 処理完了確認を追記

### template ファイルへの反映

- `src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_feature.md`: テスト戦略セクションを3要素構造形式に変更（`[テスト対象と期待される結果]` プレースホルダを置換）
- `src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_child.md`: 同上
- `src/opencode/skills/agentdev-workflow-templates/templates/issue_desc_bug.md`: 同上
- `src/opencode/commands/agentdev/templates/req-define/req-draft.md`: test_strategy フィールドを追記（# draft-data YAML ブロック内）

## draft-meta

### adr_judgment

- needed: false
- rationale: |
    本件は ADR禁止ゲート（agentdev-req-analysis）の対象であり、ADR候補から除外する:
    - (2) command動作仕様の定義: req-define、case-open、case-run、case-close の動作仕様拡張。REQ/SPEC相当。
    - (3) workflow定義/状態遷移の記述: test-fix ループ、完了確認のワークフロー定義。REQ/SPEC相当。
    - (6) template形式/入出力形式の変更: draft-data test_strategy フィールド、Issue テンプレート形式変更。REQ/SPEC相当。
    新規のアーキテクチャ判断を含まない。既存 ADR（ADR-0107 責任分界、ADR-0124 soft-contract、ADR-0128 case-run 実行モデル）の枠内で完結する。test_strategy 3要素構造は command 間の接続契約であるが、アーキテクチャ全体の構造、主要コンポーネント間の関係、技術スタック選択を変更しない。
- existing_adr_duplication: |
    既存 ADR 21件（ADR-0101〜ADR-0132）と意味的重複なし。ADR-0107（責任分界）は command/skill/template/script の責務境界の枠組みであり、test_strategy 構造の導入はこの枠内の仕様拡張。ADR-0124（soft-contract）は draft-data の形式原則であり、test_strategy フィールド追加はこの原則に従う。
- prohibition_gate_applied: true

### classification_gate

- state_requirements_to_req: |
    AG-001（3要素構造と on_failure 必須ルール）→ REQ-0102（req-define が構造を生成・定義する安定契約の所有者）
    AG-002、AG-003（draft-data test_strategy フィールド、req-define step/guardrail）→ REQ-0102（req-define の責務）。Step 番号、guardrail 番号は反映作業（command reference）へ移送。
    AG-004（QG-1 検査観点）→ REQ-0102（req-define/req-save が QG-1 を適用する責務、REQ-0102-052 と同一軸）。QG-1 参照ファイル編集は反映作業へ移送。
    AG-005（Issue テンプレート形式）→ 反映作業（template ファイル編集）。要件行としては独立しない。case-open が埋め込む対象の形式は AG-006 で REQ-0132 に状態要件として反映済み。
    AG-006（case-open 埋め込み）→ REQ-0132（case-open の責務）。
    AG-007（case-run/Sisyphus test-fix ループ）→ REQ-0130（case-run 委譲契約）。adapter skill 編集は反映作業へ移送。
    AG-008（case-close 完了確認 + QG-4 検査観点）→ REQ-0131（case-close の責務）。QG-4 参照ファイル編集は反映作業へ移送。
- spec_candidates_separated: |
    SC-001: test_strategy フィールドスキーマ詳細（TS-NNN 識別子形式、target_item 参照形式、3要素 YAML 表現、on_failure アクション種別 enum）→ docs/specs/commands/req-define.md（artifact_actions ACT-SPEC-001 に分離）
    SC-002: QG-1/QG-4 test_strategy 検査観点の要約 → docs/specs/quality-gates.md（artifact_actions ACT-SPEC-002 に分離）。詳細な検査観点記述は agentdev-quality-gates スキル参照ファイル（反映作業）が原本。
- stable_contract_exception_applied: |
    test_strategy 3要素構造（verification/pass_criteria/on_failure）は req-define、case-open、case-run、case-close が共有する接続契約（安定契約例外）であり、REQ-0102 に要約として記述する。各要素の詳細なシリアライズ形式、on_failure enum 値は SPEC（docs/specs/commands/req-define.md）に配置する。

### split-forecast

- target: REQ-0102
- metrics:
    requirement_line_count:
      current: 67
      after_append: 71
      added_lines: 4
    concern_classification_count:
      value: 1
      rationale: REQ-0102 は「要件定義・保存」の単一関心。test_strategy 定義は要件展開の一部であり、新規の独立関心を構成しない。
    artifact_type_count:
      value: 2
      rationale: req-define command、agentdev-quality-gates skill（QG-1 参照）。test_strategy 追加は既存アーティファクト種別の範囲内。
    spec_separation_violation:
      value: 0
      rationale: SC-001、SC-002 を artifact_actions（artifact: spec）に分離済み。REQ 要件行に SPEC 相当行は残留しない。
- signals:
    requirement_lines: 1   # 51-80 range → +1
    concern_classification: 0  # 0-1 → +0
    artifact_types: 0      # 1-2 → +0
    spec_separation: 0     # 0 → +0
- total: 1
- recommended_action: APPEND 許可（total 0-1 → no-action / APPEND）
- thresholds_ref: docs/specs/req-health-metrics.md
- note: |
    REQ-0102 は 67 行（51-80 range、+1）にあり肥大化傾向。本 APPEND で 71 行となり、引き続き 51-80 range（+1）に留まる。関心分類数、アーティファクト種別数、SPEC 分離基準違反はいずれも +0 のため、合計 SPLIT シグナル = 1 となり APPEND を許可する。ただし REQ-0102 は既に肥大化傾向にあるため、後続の要件追加で 81 行超（+2）に到達した場合は SPLIT を強く推奨する。

### executor_classification

委譲契約を含むため、REQ-0146-007 に従い実行主体分類表を記載する。

| 委譲 | 実行主体 | 分類 | 根拠 |
|---|---|---|---|
| case-run → Sisyphus-Junior（test strategy test-fix ループ実行） | Sisyphus-Junior | subagent | task(subagent_type="Sisyphus-Junior", load_skills=["agentdev-case-run-execution-adapter"]) による委譲（ADR-0128、REQ-0130-016/017） |

test-fix ループの実行主体は Sisyphus-Junior（subagent）。case-run は orchestration のみ。この分類は既存の case-run 実行モデル（ADR-0128）を維持し、新規の委譲構造を導入しない。

### auto_gate_verification

- auto_ready: true
- unresolved_items: なし
- 根拠: 全 AG-001〜AG-008 はユーザー明示確認済み（Confirmed）。未解決質問、未解決衝突、repo外操作、停止理由は空。CR-001（docs-check 問題のスコープ除外）は合意済み。
