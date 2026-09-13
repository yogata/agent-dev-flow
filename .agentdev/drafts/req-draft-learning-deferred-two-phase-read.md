---
draft_type: req_draft
topic_slug: learning-deferred-two-phase-read
status: saved
created_at: 2026-09-13T12:18:48+09:00
source_rus: []
---

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
work_type: feature

# scale: feature のみ standard / large
scale: standard

# summary: 当該 draft が何を合意したかの1段落要約
summary: learning-promote の deferred.md 読込契約を全面読みから「インデックススキャン → 候補エントリ本文読込」の2フェーズへ変更する。突合スコープを deferred プールサイズ（実測 296KB/118エントリ、約6KB/日の単調増加）から切り離し、候補0件・候補に上がらないエントリ・判定曖昧時の全面読みフォールバックと adversarial-review 棄却機構の2つの安全網で recall を維持する。inbox entry schema に見出し形式規則を1行成文化し、データ移行ゼロで配布 skill 契約と design 層を更新する。REQ-038 への APPEND と design 層2件の更新を artifact_actions とし、配布 skill 本体2系統の変更を realization_actions として記録する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      learning-promote の STEP-1（入力読込・正規化）と STEP-3（判定・既存対策確認）における deferred.md 読込を「インデックススキャン → 候補エントリ本文読込」の2フェーズへ変更し、duplicate 判定・既存対策照合の突合スコープを deferred プールサイズから切り離す。
      インデックススキャンは grep により `^## ` 見出し行とタグ行を抽出し、{見出し, タグ, 位置} の候補一覧を構成する（実測約13KB、296KB の約1/23）。分離インデックスファイルは作らず、毎回現ファイルから計算する（grep on read）。
      処分区分・living pool 維持の不変条件・自動削除禁止（REQ-003-024）等の意味仕様は不変とする。
  - id: AG-002
    content: |
      候補選択は過剰包含（recall 向上フィルタ）とする: a) タグ1つでも一致、b) 見出しトークンが問題事象の固有名詞と一致、c) 常に直近20エントリ（duplicate は capture→defer 同日が最多との実測に基づく既定値）。
      候補選択は duplicate 判定そのものを行わず、判定は候補エントリ本文読込後の突合で行う。候補選択の a/b/c は拾い漏れ防止の絞り込みであり、precision は本文突合が担う（対論型レビュー F-A1 反映）。
  - id: AG-003
    content: |
      全面読みはフォールバック手順へ格下げする。フォールバック対象は「候補0件の inbox エントリ」「タグ・見出しトークンのいずれでもマッチせず候補に上がらない inbox エントリ」「候補読込後も判定が曖昧な inbox エントリ」の3類型とする（条件具体化: 対論型レビュー F-A3 反映）。
      第二の安全網として adversarial-review の「duplicate根拠不足」棄却機構（learning-promote STEP-4）は既存のまま維持する。
  - id: AG-004
    content: |
      inbox entry schema（13フィールド）に「見出しは `## YYYY-MM-DD: タイトル` 形式」という規則を1行成文化する。capture は現行慣行どおりのためデータ移行・フォーマット変更は発生しない。既存の日付なし見出しはトークン照合で候補拾いが可能であり、正規化は既存機構に委ねる。
  - id: AG-005
    content: |
      作らないもの: 分離インデックスファイル（grep on read で毎回現ファイルから計算し、SSoT ドリフト領域を作らない）、カテゴリ別ファイル分割、prune 基準緩和（削除禁止3クラスは living pool 設計上の正義）。
  - id: AG-006
    content: |
      効果検証の可能性を保持する: 次回以降の promote 実行で deferred 読込分量の実測比較を可能にする（観点4 duplicate 正否サンプル監査で前後比較）。
      候補選択の「直近20エントリ」は既定値であり、効果検証で duplicate 見逃しが検出された場合の再評価対象とする（定数の時限性への対応: 対論型レビュー F-A2 反映）。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-038
    source_items: [AG-001, AG-003, AG-005]
    content: |
      REQ-038 要件テーブルへ次の1行を追加する:
      | REQ-038-006 | learning-promote の deferred.md 読込は、プールサイズに依存しない突合スコープ（インデックススキャンと候補絞り込みによる2フェーズ読込）で行い、候補0件または判定が曖昧なエントリの全面読みフォールバックを契約とすること。処分区分・living pool 維持・自動削除禁止（REQ-003-024）の意味仕様は変更しないこと |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/commands/learning-promote.md
    target_area: 現在の動作
    source_items: [AG-001, AG-002, AG-003]
    content: |
      フェーズ1 の記述を次へ更新する（フェーズ詳細の正規情報源は Workflow Skill であるため、design 層の記述は最小にとどめる）:
      「フェーズ1 inbox スキャン: inbox.md 読込。deferred.md はインデックススキャン → 候補エントリ本文読込の2フェーズで読み込む。候補0件・候補に上がらないエントリ・判定曖昧時は deferred.md 全面読みへフォールバックする。突合スコープは deferred プールサイズに依存しない」
      併せて正規化の対象区分に「inbox は全面、deferred は候補本文のみ」を明示する。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-learning-pipeline.md
    target_area: 提供する判断、操作
    source_items: [AG-004]
    content: |
      entry schema（13フィールド）の行に見出し形式規則の言及を追加する:
      「- inbox entry schema（13フィールド。見出しは `## YYYY-MM-DD: タイトル` 形式）。schema の詳細実体は `references/inbox-and-evaluation-schema.md` の Inbox Entry Schema が所有する」
      design 層自身の「参照する references」記述の再編は本要件の対象外とする（適用範囲限定: 対論型レビュー F-B2 反映）。

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru:
    target_req: REQ-038
    target_design: [docs/designs/commands/learning-promote.md, docs/designs/skills/agentdev-learning-pipeline.md]
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs: [REQ-038]
      action_to_doc:
        ACT-REQ-001: REQ-038
      source_ru_to_ops: {}
      unclassified_rows: [REQ-038-006]
      design_pending:
        - ACT-DESIGN-001 (docs/designs/commands/learning-promote.md, design-save 対象・未消費)
        - ACT-DESIGN-002 (docs/designs/skills/agentdev-learning-pipeline.md, design-save 対象・未消費)

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      analysis-and-review.md の STEP-1 Procedure 3-4 と STEP-3 の記述を読み、2フェーズ読み（インデックススキャン → 候補本文読込）と3類型フォールバック条件（候補0件・候補に上がらないエントリ・判定曖昧）が契約として明文化されていること、全面読みが既定手順として残存していないことを確認する。
    pass_criteria: |
      STEP-1/3 の記述に2フェーズ読み手順と3類型フォールバック条件が明文化され、deferred.md 全面読みが既定経路から除外されていること。
    on_failure: |
      記述漏れを修正して再検証する（fix-and-reverify: 記述の修正は配布 skill 本文の修正で完結する）。
  - id: TS-002
    target_item: AG-005
    verification: |
      変更後の配布物・design 層に分離インデックスファイル・カテゴリ別ファイル分割・prune 基準緩和の導入が存在しないこと、deferred.md / inbox.md のエントリ13項目スキーマ・タグ構造が不変であることを確認する。
    pass_criteria: |
      分離インデックス等の新規永続ファイルが作成されず、entry schema が変更されていないこと。
    on_failure: |
      導入された実装を撤去し、grep on read 契約へ修正して再検証する（fix-and-reverify）。
  - id: TS-003
    target_item: AG-004
    verification: |
      inbox-and-evaluation-schema.md の Inbox Entry Schema に見出し形式規則が1行追加されていること、.agentdev/learning/deferred.md 等の既存エントリへの移行・フォーマット変更が実行されていないことを確認する。
    pass_criteria: |
      見出し規則が明文化され、既存エントリへの移行操作が存在しないこと。
    on_failure: |
      規則追加漏れを修正し、誤実施された移行を復元して再検証する（fix-and-reverify）。
  - id: TS-004
    target_item: AG-001
    verification: |
      design 層（learning-promote Design フェーズ1記述）、capability skill Design（agentdev-learning-pipeline Design）、配布 workflow skill（analysis-and-review.md）の3層記述が同一の2フェーズ読み契約を指しているか突合する。
    pass_criteria: |
      3層の記述間に「全面読み既定」「2フェーズ読み」「フォールバック条件」に関する矛盾がないこと。
    on_failure: |
      不整合層を修正して再検証する（fix-and-reverify）。
  - id: TS-005
    target_item: AG-006
    verification: |
      2フェーズ読み契約が読込分量の観測可能性を保っていること（インデックススキャンと候補本文読込の2段構成として記述されていること）を記述レベルで確認する。読込分量の実測前後比較は次回以降 promote 実行時の観点4 duplicate 正否サンプル監査で実施するものであり、本要件の検証対象外とする。
    pass_criteria: |
      2段構成の記述により読込分量が構造的に減少し、観測可能であること。
    on_failure: |
      観測可能性を損なう記述を修正して再検証する（fix-and-reverify）。実測比較の実施記録は次回 promote 実行時に findings へ残す（record-in-findings）。

realization_actions:
  - id: RA-001
    concern: learning-promote STEP-1/3 の deferred 読込手順の2フェーズ化
    responsibility: |
      配布 workflow skill `agentdev-workflow-learning-promote` が STEP 詳細（入力読込・正規化 / 評価 / 判定 / review）を正規所有する。STEP-1 Procedure 3-4 の読込手順と STEP-3 の既存対策照合（同じ候補集合を使用する契約）を変更する。
    ownership_hints:
      - "src/opencode/skills/agentdev-workflow-learning-promote/references/analysis-and-review.md（STEP-1 Procedure 3-4、STEP-3 Procedure 1-2）"
    intent: |
      deferred 読込をインデックススキャン → 候補本文読込の2フェーズへ変更し、全面読みを3類型フォールバックへ格下げする。
      STEP-1 Procedure 4「全エントリを読み込み、旧フォーマット正規化を行う」の対象区分（inbox は全面読込・正規化、deferred は候補本文のみ解析対象）を明示する（対論型レビュー F-B3 反映）。
      候補選択 a/b/c は recall 向上フィルタであり、判定は候補本文読込後の突合で行うことを明記する（対論型レビュー F-A1 反映）。
    verification_refs: [TS-001, TS-004]
    source_items: [AG-001, AG-002, AG-003, AG-006]
  - id: RA-002
    concern: inbox entry schema への見出し形式規則の成文化
    responsibility: |
      配布 capability skill `agentdev-learning-pipeline` が entry schema（13フィールド、正規化ルール、旧フォーマットマッピング）を正規所有する。
    ownership_hints:
      - "src/opencode/skills/agentdev-learning-pipeline/references/inbox-and-evaluation-schema.md（Inbox Entry Schema セクション）"
    intent: |
      「見出しは `## YYYY-MM-DD: タイトル` 形式」の規則を1行追加し、インデックススキャンが日付形式見出しに依存できるようにする。capture は現行慣行どおりのためデータ移行は発生しない。
    verification_refs: [TS-003]
    source_items: [AG-004]

case_open_hints:
  epic_needed: false
  decomposition:
  wave_hints: []
```

# summary

learning-promote 実行時に deferred.md を全面読みする現行契約は、プール増大（296KB/118エントリ、約6KB/日の単調増加）に伴い突合コストが線形増加し、精読不能による duplicate 判定品質劣化（見出しスキミング退化による新しい知見の潰し・取りこぼし）につながる。2フェーズ読みへ変更し、突合スコープをプールサイズから切り離す。recall は3類型の全面読みフォールバック（安全網1）と adversarial-review 棄却機構（安全網2）で維持する。意味仕様（処分区分、living pool、自動削除禁止 REQ-003-024）と entry schema（13フィールド）は不変とし、見出し形式規則の1行成文化のみ行う。分離インデックスファイル・ファイル分割・prune 基準緩和は作らない。
