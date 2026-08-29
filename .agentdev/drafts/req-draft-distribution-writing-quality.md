---
draft_type: req_draft
topic_slug: distribution-writing-quality
status: saved
created_at: 2026-08-30T00:00:00+09:00
source_rus: [RU-0001]
---

<!-- req_draft: RU-0001「コマンド・スキルの文章品質横断是正と再発防止」の要件定義ドラフト。
後続工程の原本は # draft-data 内の YAML コードブロック。 -->

# draft-data

```yaml
# work_type: 配布物の記述品質契約（REQ）＋挙動 Design 改訂を伴うため feature（docs_chore は REQ/Design を生成しない前提と不整合）
work_type: feature

# scale: 影響ファイル 68（>10 シグナル）、変更件数 >30 シグナル、6 本の要件化方向 → large
scale: large

# 配布 command 18 + skill 50 の文章品質を契約化し、68 ファイルを意味保持のまま是正し、作成時・査読時・診断時の 3 経路へ観点を統合したうえで、決定的破損検査を導入する。Decision は不要と判断（仕様・品質方針であり作成不可条件 1/6/10 該当）。壁打ち質問 Q1〜Q4 は CR-009 のとおり自律解消済み。
summary: RU-0001 の 6 方向を OU-001〜006 と operation_units 化。新規 REQ（文章品質契約）1 件 create、REQ-010 append 1 行、Design append 4 件（command-authoring / skill-authoring / doc-writing / inspect-skills の観点統合、anchor + placement: tail）を artifact_actions として確定。機械検査は「存在と実行可能性」を要件とし実装方式は Design 分離（追加入口は REQ-010-009/068 準拠）。

# case-auto 自走可否の判定材料。壁打ち質問 Q1〜Q4 は CR-009 のとおり自律解消済み。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# 合意された個別項目
agreed_items:
  - id: AG-001
    content: |
      文章品質契約を新規 REQ として定める。規範原本は japanese-tech-writing スキルとし、検査可能な品質行として
      (1) メタ指示残留なし (2) 文の完結性 (3) 自然な日本語（英字は用語政策の許容リストに基づく用語に限る）
      (4) 規範宣言は規範原本への参照を伴い関係が一義的に判断できる場合に限り「〜を正とする」「〜が正」を使用
      (5) 過長な名詞連結の是正 (6) 1 文 3 以上の条件節連結の禁止
      (7) Markdown 構造健全性（見出し階層・未閉鎖コードブロック・壊れたリンク・壊れたコードスパン・強調記法の破損）
      (8) 制御文字・不正な Unicode 文字・意図しない異言語文字の混入なし
      (9) 既知形式の参照残骸なし、を契約する。正本の一意性は REQ-002-039 を準用する。
  - id: AG-002
    content: |
      既存配布物（command 18 + skill 50、計 68）を文章品質契約へ適合させる。是正は意味保持を条件とし、
      責務・振る舞い・処理順序・状態遷移・入出力契約・API/CLI 契約・ファイル形式・識別子・状態値・停止条件・
      安全制約・外部依存を変更してはならない。意味を一義的に復元できない箇所は推測で修正して合格扱いにせず、
      blocked として記録しユーザーの判断を得る。
  - id: AG-003
    content: 作成時の再発防止として command-authoring および skill-authoring の記述基準へ文章品質観点を統合する。
  - id: AG-004
    content: 査読時の再発防止として doc-writing の検証観点へ文章品質観点を統合する。
  - id: AG-005
    content: 診断観点の追加として inspect-skills の検証観点へ文章品質観点と決定的破損検出観点を追加する。
  - id: AG-006
    content: |
      決定的破損検査（Markdown 構造破損、制御文字混入等、機械判定可能な項目）が存在し、配布物全体へ実行できることを要件とする。
      実装方式・配置先は Design に分離する。docs-check 検査体系への追加入口は REQ-010-009（checker 個別ルールは
      Design/skill/script/tests 所有）と REQ-010-068（新規検査クラスは正常例・違反例・境界例・許容例・再現例の
      回帰テスト必須）とする。REQ-010-070 は過去監査（v1〜v4）の再走査由来を契機条件とする先例であり、
      本件（session 由来）の入口規定には使わない。
  - id: AG-007
    content: 是正完了後、配布物全件（68）へ決定的破損検査を再実行し、検出 0 件（許容例を除く）を確認する横断再検査を行う。

# 保存対象（1 action = 1 artifact × 1 editing concern）
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:distribution-writing-quality
    source_items: [AG-001, AG-006, AG-002]
    content: |
      ---
      id: {REQ-ID}
      title: 配布物の文章品質契約
      created: 2026-08-30
      updated: 2026-08-30
      ---

      ## 目的

      配布 command・skill の文章品質を契約として固定し、作成時・査読時・診断時の 3 経路で同一の品質基準を適用できるようにする。文章品質の規範原本は japanese-tech-writing スキルとし、本 REQ は検査可能な品質行を契約する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | {REQ-ID}-001 | 配布物は文章品質規範（japanese-tech-writing スキル）を規範原本として参照し、各成果物の規範関係を明示する |
      | {REQ-ID}-002 | 配布物はメタ指示（実行時に意味を持たない LLM 宛指示文）を含まない |
      | {REQ-ID}-003 | 配布物の各文は主述が完結し、未完結文を含まない |
      | {REQ-ID}-004 | 配布物の日本語文は無根拠な英単語混在を行わない。英字は用語政策（英字許容リスト・訳語表）に基づく用語に限る |
      | {REQ-ID}-005 | 「〜を正とする」「〜が正」形式の規範宣言は、規範原本への参照を伴い、定義元・参照元・所有関係のいずれの関係か一義的に判断できる場合に限り使用でき、同一文書内で濫用しない |
      | {REQ-ID}-006 | 配布物の文は過長な名詞連結列を含まない。読み手の切れ目は読点・助詞で示す |
      | {REQ-ID}-007 | 1 文は 3 以上の条件節を連結しない。条件が多い場合は列挙・箇条書きへ分離する |
      | {REQ-ID}-008 | 配布物は Markdown 構造破損（見出し階層不整合、未閉鎖コードブロック、壊れたリンク、壊れたコードスパン、強調記法の破損）を含まない |
      | {REQ-ID}-009 | 配布物は制御文字、不正な Unicode 文字、意図しない異言語文字を含まない |
      | {REQ-ID}-010 | 配布物は既知形式の参照残骸（確認済みの不要参照、実在しない参照先を指す既知形式の記述）を含まない |
      | {REQ-ID}-011 | 文章品質基準は作成時（command-authoring / skill-authoring）、査読時（doc-writing）、診断時（inspect-skills）の 3 経路で適用される |
      | {REQ-ID}-012 | 文章品質違反の決定的検査（Markdown 構造破損、制御文字混入、不正な Unicode 文字、意図しない異言語文字、壊れたコードスパン、強調記法の破損、既知形式の参照残骸等、機械判定可能な項目）が存在し、配布物全体へ実行できる。個別 checker の実装方式は Design が所有する |
      | {REQ-ID}-013 | 既存配布物は本契約へ適合させる。是正は責務・振る舞い・処理順序・状態遷移・入出力契約・API/CLI 契約・ファイル形式・識別子・状態値・停止条件・安全制約・外部依存を変更してはならない。意味を一義的に復元できない箇所は推測で修正して合格扱いにせず、blocked として記録しユーザーの判断を得る |

      ## 適用範囲

      - **対象**:
        - 配布 command（`src/opencode/commands/agentdev/**`）と配布 skill（`src/opencode/skills/**`）の本文記述
        - 文章品質観点を適用する作成時・査読時・診断時の 3 経路
      - **対象外**:
        - 機能追加、処理フロー再設計、責務分界変更、API/CLI 仕様変更、状態遷移変更、入出力形式変更
        - frontmatter description の言語統一、英語の全面禁止
        - 機械検査の実装方式の指定（Design に分離）
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: REQ-010
    source_items: [AG-006]
    content: |
      | REQ-010-071 | 配布物の決定的破損検査（Markdown 構造破損〔見出し階層不整合、未閉鎖コードブロック、壊れたリンク、壊れたコードスパン、強調記法の破損〕、制御文字混入、不正な Unicode 文字、意図しない異言語文字、既知形式の参照残骸）を検査クラスとして追加する。検査は docs-check 実行時に配布 command・skill 全体へ適用する。checker 個別ルールは REQ-010-009 に従い Design、skill、script、tests のいずれかが所有する。本検査クラスは REQ-010-068 に従い正常例・違反例・境界例・許容例・再現例の回帰テストを伴う |
  - id: ACT-DESIGN-001
    artifact: design
    operation: append           # REQ-008-033 変更後セクション全文を要する update から、観点追加の関心に一致する append へ変更（CR-005）
    target_design:
      operation: update
      domain: skills
      slug: agentdev-command-authoring
    target_area:                # append: anchor 見出し + placement
      anchor: ## command authoring 基準（層1〜3適用）
      placement: tail
    source_items: [AG-003]
    content: |
      ### 文章品質観点（作成時）

      command 作成時に次の文章品質観点を検査し、違反を残さない。規範原本は japanese-tech-writing スキル、契約は配布物の文章品質契約 REQ（new:distribution-writing-quality）である。

      - メタ指示残留: 実行時に意味を持たない LLM 宛指示文を残さない
      - 文の完結性: 主述が完結しない文を残さない
      - 自然な日本語: 無根拠な英単語混在を行わない。英字は用語政策の許容リストに基づく用語に限る
      - 規範関係明示: 「〜を正とする」「〜が正」は規範原本への参照を伴い、定義元・参照元・所有関係のいずれかを一義的に判断できる場合に限り使用する
      - 名詞連結: 過長な名詞連結列を残さず、読み手の切れ目を示す
      - 条件連結: 1 文に 3 以上の条件節を連結しない
  - id: ACT-DESIGN-002
    artifact: design
    operation: append           # REQ-008-033 変更後セクション全文を要する update から、観点追加の関心に一致する append へ変更（CR-005）
    target_design:
      operation: update
      domain: skills
      slug: agentdev-skill-authoring
    target_area:                # append: anchor 見出し + placement
      anchor: ## skill 記述基準（層1〜3）
      placement: tail
    source_items: [AG-003]
    content: |
      ### 文章品質観点（作成時）

      skill 作成時に次の文章品質観点を検査し、違反を残さない。規範原本は japanese-tech-writing スキル、契約は配布物の文章品質契約 REQ（new:distribution-writing-quality）である。

      - メタ指示残留: 実行時に意味を持たない LLM 宛指示文を残さない
      - 文の完結性: 主述が完結しない文を残さない
      - 自然な日本語: 無根拠な英単語混在を行わない。英字は用語政策の許容リストに基づく用語に限る
      - 規範関係明示: 「〜を正とする」「〜が正」は規範原本への参照を伴い、定義元・参照元・所有関係のいずれかを一義的に判断できる場合に限り使用する
      - 名詞連結: 過長な名詞連結列を残さず、読み手の切れ目を示す
      - 条件連結: 1 文に 3 以上の条件節を連結しない
  - id: ACT-DESIGN-003
    artifact: design
    operation: append           # REQ-008-033 変更後セクション全文を要する update から、観点追加の関心に一致する append へ変更（CR-005）
    target_design:
      operation: update
      domain: skills
      slug: agentdev-doc-writing
    target_area:                # append: anchor 見出し + placement
      anchor: ## 検証観点
      placement: tail
    source_items: [AG-004]
    content: |
      ### 文章品質観点（査読時）

      配布物の査読時に次の文章品質観点を適用する。規範原本は japanese-tech-writing スキル、契約は配布物の文章品質契約 REQ（new:distribution-writing-quality）である。

      - メタ指示残留の検出
      - 未完結文の検出（主述のねじれ、文の途中終了を含む）
      - 不自然な英語混在の検出（英字許容リストに基づかない英単語）
      - 「〜を正とする」「〜が正」濫用の検出（規範原本への参照を伴わない、または関係が一義的に判断できない規範宣言）
      - 明らかな誤字の検出（機械判定不能な人間判断項目は査読で扱う）
      - 名詞連結の検出（読点・助詞で切れ目が示されない過長な名詞列）
      - 一文への条件過剰連結の検出（1 文 3 以上の条件節）
      - Markdown 構造破損の検出（見出し階層不整合、未閉鎖コードブロック、壊れたリンク、壊れたコードスパン、強調記法の破損）
      - 制御文字混入の検出
      - 文単位の修正候補の提示（検出した違反に対し、文単位の修正候補を提示する）
  - id: ACT-DESIGN-004
    artifact: design
    operation: append           # REQ-008-033 変更後セクション全文を要する update から、観点追加の関心に一致する append へ変更（CR-005）
    target_design:
      operation: update
      domain: skills
      slug: agentdev-inspect-skills
    target_area:                # append: anchor 見出し + placement
      anchor: ## 検証観点
      placement: tail
    source_items: [AG-005]
    content: |
      ### 文章品質観点（診断時）

      Command/Skill 診断時に次の観点を検出対象へ追加する。決定的破損は機械検査可能な項目、文章品質は doc-writing 査読観点と同一基準（配布物の文章品質契約 REQ、new:distribution-writing-quality）を用いる。

      - 決定的破損: Markdown 構造破損（見出し階層不整合、未閉鎖コードブロック、壊れたリンク、壊れたコードスパン、強調記法の破損）、制御文字混入、不正な Unicode 文字、意図しない異言語文字、既知形式の参照残骸
      - 文章品質: メタ指示残留、未完結文、不自然な英語混在、規範宣言の濫用、名詞連結、一文への条件過剰連結

# 壁打ちで解消された衝突の記録。記録済み衝突を後続コマンドが再確認しない（REQ-008-035）
conflict_resolutions:
  - id: CR-001
    conflict: RU-0001 frontmatter が session由来RU 必須フィールド（generation_actor、agreement_confirmed_at、generation_stage、logical_key、tentative_classification、agentdev_handoff）を欠落している。
    resolution: soft-contract 原則により欠落で入力を拒否しない。欠落分類は req-define 側で最終確定する（主分類は REQ、Design 観点は各挙動 Design を canonical_owner とする）。agentdev_handoff: true 該当（配布物改善）だが本リポジトリは self-hosting につき停止条件外（履歴メタデータとして処理、upstream-handoff.md）。
  - id: CR-002
    conflict: 機械検査（方向 6）の実装方式が RU で規定されておらず、artifact_actions content の完全確定契約（REQ-008-030）と緊張する。
    resolution: 「決定的破損検査が存在し配布物全体へ実行可能」を REQ 契約行とし、実装方式は Design 分離（REQ-010-009/068/070 準拠）。content は TBD を含まない確定テキストとした。
  - id: CR-003
    conflict: RU-0001（source_type: chat、generated_by: session）が監査成果物のように解釈され得ることと REQ-045（一回限り網羅監査）・REQ-010-070（v1〜v4 監査再走査由来の追加入口）の関係。
    resolution: RU-0001 は session 由来であり、REQ-045 自体は変更不要（参照のみ）。docs-check 検査体系への追加入口は REQ-010-009 と REQ-010-068 とし、REQ-010-070 は契機条件（v1〜v4 再走査）が異なる先例として位置づける。
  - id: CR-004
    conflict: 文書品質横断是正を docs_chore とするか feature とするか。
    resolution: 品質契約の REQ 新規作成と Design 4 件改訂を伴うため feature。docs_chore の「REQ/ADR/Design を生成しないことが多い」前提と不整合。
  - id: CR-005
    conflict: Design 4 件の update content が REQ-008-033（Design update は変更後セクション全文）を満たさず、design-save の置換で既存本文（層1〜3 基準・既存検証観点）が消失するリスク（adversarial-review 重大 finding）。
    resolution: operation を update から append（anchor 見出し + placement: tail）へ変更。観点追加という編集関心（1 action = 1 editing concern）に一致し、既存本文の保全を担保する。
  - id: CR-006
    conflict: 新規 REQ 本文の見出しレベル（H1）と適用範囲サブ構造（見出し形式）が既存 46 REQ の実形式（H2、リスト形式）と不一致。
    resolution: content を既存形式（## 目的 / ## 要件 / ## 適用範囲、- **対象**: / - **対象外**: のリスト形式）へ修正。
  - id: CR-007
    conflict: AC-07 および RU 方向 6 の機械検査対象列挙（不正な Unicode、異言語文字、コードスパン破損、強調記法破損、参照残骸）が決定的検査の契約行から欠落。
    resolution: 契約行・REQ-010-071・TS-001/TS-003/TS-007・診断観点の列挙へ追加。「明らかな誤字」は機械判定不能のため査読観点（doc-writing）へ配置し分離。
  - id: CR-008
    conflict: AC-08 の「復元不能箇所を推測で修正して合格扱いにしない」、AC-10 の「文単位の修正候補提示」、「〜が正」形式が契約・観点から欠落。
    resolution: AG-001・AG-002、{REQ-ID}-005/{REQ-ID}-013、doc-writing 査読観点、TS-002 pass_criteria へ反映。
  - id: CR-009
    conflict: 壁打ち質問 Q1〜Q4 がユーザー未回答のまま workflow を継続するかどうか。
    resolution: |
      各論点は「未解決のユーザー判断事項」（自律解決不能な優先判断・価値判断・両立不能要求）に該当しないと判定し自律解消した。Q2（通常Case）は実証Case判定の決定的導出基準（実行・測定・観察による重要な採否判断なし）による。Q3（機械検査粒度）は RU-0001 自身の「実装方式は規定しない」規定による（CR-002 と同根、REQ-008-035 の記録済み衝突再確認禁止に従う）。Q4（照合候補）は STEP-3 操作分類の確定済み結果の情報共有であり判断依頼でない。Q1（work_type=feature/scale=large）は lifecycle 基準による決定的分類であり、昇格理由の提示と分解計画の case_open_hints.decomposition 記録（large 時の協議要件）を履行済み。ユーザーは STEP-10 の提示で差し戻し可能（差し戻し時は STEP-2 壁打ち継続、次コマンド実行を確定の意思表示として扱う）。

# 要件整理結果の構成単位
operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: REQ-{新規番号: distribution-writing-quality}
    operation: create
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs: [REQ-053]
      operation_to_req_doc:
        create: REQ-053
      unclassified_rows: [REQ-053-001, REQ-053-002, REQ-053-003, REQ-053-004, REQ-053-005, REQ-053-006, REQ-053-007, REQ-053-008, REQ-053-009, REQ-053-010, REQ-053-011, REQ-053-012, REQ-053-013]
  - ou_id: OU-002
    source_ru: RU-0001
    target_req: REQ-{新規番号: distribution-writing-quality}
    operation: update
    scale: large
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result:
      saved_req_docs: []
      note: 既存配布物の契約適合作業（REQ-053-013）は case-open/case-run の構成対象
  - ou_id: OU-003
    source_ru: RU-0001
    target_design: [docs/designs/skills/agentdev-command-authoring.md, docs/designs/skills/agentdev-skill-authoring.md]
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: single
    result:
      saved_req_docs: []
      note: design-save 対象（ACT-DESIGN-001/002）
  - ou_id: OU-004
    source_ru: RU-0001
    target_design: docs/designs/skills/agentdev-doc-writing.md
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 4
    issue_policy: single
    result:
      saved_req_docs: []
      note: design-save 対象（ACT-DESIGN-003）
  - ou_id: OU-005
    source_ru: RU-0001
    target_design: docs/designs/skills/agentdev-inspect-skills.md
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 5
    issue_policy: single
    result:
      saved_req_docs: []
      note: design-save 対象（ACT-DESIGN-004）
  - ou_id: OU-006
    source_ru: RU-0001
    target_req: REQ-010
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 6
    issue_policy: single
    result:
      saved_req_docs: [REQ-010]
      operation_to_req_doc:
        append: REQ-010-071
      unclassified_rows: [REQ-010-071]

# test_strategy: 3 要素（verification / pass_criteria / on_failure）必須
test_strategy:
  - id: TS-001
    target_item: AG-002
    verification: |
      決定的破損検査（Markdown 構造破損〔見出し階層不整合、未閉鎖コードブロック、壊れたリンク、壊れたコードスパン、強調記法の破損〕、制御文字混入、不正な Unicode 文字、意図しない異言語文字、既知形式の参照残骸）を配布物全件（68）へ実行し、レポートを取得する。
    pass_criteria: |
      検出 0 件（許容例を除く）。既知の許容例は検査クラスの Design が列挙する。
    on_failure: |
      fix-and-reverify。検出ファイルを是正対象へ戻し、是正後に再検査する。選択理由: 違反の検出と消去が決定的検査で機械的に確認できるため、手動査読を介在させない。
  - id: TS-002
    target_item: AG-002
    verification: |
      doc-writing の査読観点（文章品質観点を含む）で是正 diff を査読し、変更禁止領域（責務・振る舞い・処理順序・状態遷移・入出力契約・API/CLI 契約・ファイル形式・識別子・状態値・停止条件・安全制約・外部依存）の変更がないことを確認する。
    pass_criteria: |
      変更禁止領域の変更が 1 件も検出されない。かつ是正済み全ファイルで査読が完了している。意味を一義的に復元できない箇所は合格扱いにせず blocked 記録済みであること。
    on_failure: |
      fix-and-reverify。変更を検出したファイルを是正差し戻しし、意味保持を満たす是正をやり直したうえで再査読する。選択理由: 意味保持の判断は人間判断であり、record-in-findings では是正品質を担保できないため。
  - id: TS-003
    target_item: AG-006
    verification: |
      決定的破損検査クラスの回帰テスト（正常例・違反例・境界例・許容例・再現例）を実行する（REQ-010-068 準拠）。
    pass_criteria: |
      全回帰テストが合格する。違反例が検出され、正常例・許容例が誤検出されない。
    on_failure: |
      fix-and-reverify。checker 実装またはテスト fixture を修正し、再実行する。選択理由: 回帰テストの失敗は checker と fixture のいずれかの修正で消去可能なため。
  - id: TS-004
    target_item: AG-003
    verification: |
      command-authoring および skill-authoring の代表ケース検証（REQ-027 準拠）で、文章品質観点を含む記述基準が作成時判定に発火することを確認する。代表ケースには文章品質の違反例を含める。
    pass_criteria: |
      代表ケースで文章品質観点が適用され、違反例が作成時検査で検出される。
    on_failure: |
      fix-and-reverify。Design または skill 本体の記述を修正し、代表ケースを再実行する。選択理由: 観点の非発火は記述修正で消去可能なため。検証手順の詳細は REQ-027 の代表ケース検証契約に従う。
  - id: TS-005
    target_item: AG-004
    verification: |
      doc-writing の代表ケース検証（REQ-027 準拠）で、文章品質観点を含む査読が発火することを確認する。代表ケースには文章品質の違反例を含める。
    pass_criteria: |
      代表ケースで文章品質観点の査読が実行され、違反が検出される。
    on_failure: |
      fix-and-reverify。Design または skill 本体の記述を修正し、代表ケースを再実行する。選択理由: 観点の非発火は記述修正で消去可能なため。検証手順の詳細は REQ-027 の代表ケース検証契約に従う。
  - id: TS-006
    target_item: AG-005
    verification: |
      inspect-skills の代表ケース検証（REQ-027 準拠）で、文章品質観点・決定的破損観点が診断対象に含まれることを確認する。代表ケースには両観点の検出対象を含める。
    pass_criteria: |
      代表ケースで両観点が検出対象として適用される。
    on_failure: |
      fix-and-reverify。Design または skill 本体の記述を修正し、代表ケースを再実行する。選択理由: 観点の非適用は記述修正で消去可能なため。検証手順の詳細は REQ-027 の代表ケース検証契約に従う。
  - id: TS-007
    target_item: AG-007
    verification: |
      OU-002〜006 完了後、配布物全件（68）へ決定的破損検査を再実行する（横断再検査）。
    pass_criteria: |
      全件合格。検出 0 件（許容例を除く）。
    on_failure: |
      fix-and-reverify。検出ファイルを是正対象へ戻し、再是正後、全件再検査する。選択理由: TS-001 と同様、違反の検出と消去が決定的検査で機械的に確認できるため。

# 採否判断（req-define 生成時の checked_at_commit は null）
review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: 要件化の方向1（文章品質契約の明確化）
    disposition: covered
    reason_code: covered_by_ou
    reason: |
      OU-001（ACT-REQ-001、新規 REQ create）として品質契約 12 行へ展開した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0001
    source_item: 要件化の方向2（既存68ファイルの意味保持是正）
    disposition: covered
    reason_code: covered_by_ou
    reason: |
      OU-002 として既存配布物の契約適合作業へ展開。意味保持条件は REQ 新規 {REQ-ID}-013 行と AG-002 に記録。個別ファイルの是正作業は case-open/case-run の構成対象。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0001
    source_item: 要件化の方向3（作成時再発防止）
    disposition: covered
    reason_code: covered_by_ou
    reason: |
      OU-003（ACT-DESIGN-001/002、command-authoring・skill-authoring Design update）として観点統合した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0001
    source_item: 要件化の方向4（査読時再発防止）
    disposition: covered
    reason_code: covered_by_ou
    reason: |
      OU-004（ACT-DESIGN-003、doc-writing Design update）として検証観点へ統合した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0001
    source_item: 要件化の方向5（配布物診断へ観点追加）
    disposition: covered
    reason_code: covered_by_ou
    reason: |
      OU-005（ACT-DESIGN-004、inspect-skills Design update）として検証観点へ追加した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-006
    source_ru: RU-0001
    source_item: 要件化の方向6（決定的破損の機械検査）
    disposition: covered
    reason_code: covered_by_ou
    reason: |
      OU-006（ACT-REQ-002、REQ-010 append）として検査クラス追加要件を確定。実装方式は RU の規定どおり対象外とし Design 分離（CR-002）。RU の範囲（存在と実行可能性）で covered。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-007
    source_ru: RU-0001
    source_item: 受け入れ条件（横断再検査、AC 相当）
    disposition: covered
    reason_code: covered_by_test_strategy
    reason: |
      TS-007（横断再検査）として test_strategy へ展開。受入検証の pass/fail/blocked/not applicable 記録運用は case-run/case-close の完了報告契約へ従う。AC 対応: AC-01〜AC-08→AG-002（TS-001/TS-002、うち AC-02〜AC-05 は AG-001 契約行）、AC-09→AG-003（TS-004）、AC-10→AG-004（TS-005）、AC-11→AG-005（TS-006）、AC-12→AG-006（TS-003）、AC-13→AG-007（TS-007）。個別 AC の採否は本対応マップを正とし、機能的に全 AC が agreed_items/test_strategy 経由で covered。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items: []

# case-open 構成生成への参考情報（Issue 階層は case-open が決定する）
case_open_hints:
  epic_needed: true
  decomposition: |
    large（影響 68 ファイル・6 OU）のため Epic 検討。推奨 Wave: Wave1 = OU-001（REQ create / Design update の永続化）、Wave2 = OU-002（是正）と OU-003〜006（観点統合・機械検査導入）を並行、最終 = 横断再検査（TS-007）を完了条件とする。
  wave_hints:
    - OU-002〜006 は相互に技術的依存を持たない（共通前提は OU-001 の契約確定のみ）。OU-006 の OU-001 依存は、AG-006 が ACT-REQ-001（{REQ-ID}-012）と ACT-REQ-002（REQ-010-071）の共通 source_item である契約的一体性に基づく
    - TS-007 の横断再検査は OU-002 完了が前提。TS-001 の決定的破損検査実行は OU-006 完了（検査クラス追加）が前提
# 前工程からの引き継ぎメタデータ（self-hosting リポジトリにつき停止条件外、履歴メタデータ）
agentdev_handoff: true
```

# summary

人間可読補助（処理の正は上記 YAML ブロック）。

- 入力: `.agentdev/backlog/req-units/RU-0001.md`（session由来RU、frontmatter 欠落分類は req-define 側で最終確定: 主分類 REQ、agentdev_handoff: true は self-hosting につき停止条件外）
- 保存対象: 新規 REQ 1 件（文章品質契約 13 行）、REQ-010 append 1 行（決定的破損検査クラス）、Design append 4 件（command-authoring / skill-authoring / doc-writing / inspect-skills の観点統合、anchor + placement: tail）
- Decision: 不要（作成不可条件 1/6/10 該当、アーキテクチャ上の重要性なし）
- 参照のみ: REQ-002（正本一意性・標準継承を準用）、REQ-045、REQ-051
- 自動判定: work_type=feature、scale=large、通常Case（評価契約なし、test_strategy のみ）
- adversarial-review: 2 独立 stream の対論により 11 finding を処分（重大 1 件を含む）。重大 finding（Design update content が REQ-008-033 の変更後セクション全文を満たさず既存本文消失リスク）は operation を append へ変更して解消。詳細は conflict_resolutions CR-005〜CR-008
- 壁打ち質問 Q1〜Q4 は CR-009 のとおり自律解消済み（auto_gate.auto_ready=true）。ユーザーは本提示で差し戻し可能（差し戻し時は STEP-2 壁打ち継続。次コマンド実行を確定の意思表示として扱う）
