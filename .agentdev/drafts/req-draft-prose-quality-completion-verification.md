---
draft_type: req_draft
topic_slug: prose-quality-completion-verification
status: saved
created_at: 2026-09-03T07:50:58+09:00
source_rus:
  - RU-0001
---

<!-- req_draft テンプレート
 このテンプレートは req-define が生成する構造化引き継ぎ成果物の原本である。
 後続工程（req-save/ design-save/ case-open/ case-auto/ case-run/ case-close）が参照する
 原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
 soft contract（生成元側標準）であり、LLM 推論経由で消費される。
 厳格なスキーマバージョン、JSON Schema、バリデータは導入しない。 -->

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
# workflow_route の派生値は保存せず、work_type + scale から各コマンドが導出する
work_type: maintenance

# scale: feature のみ standard / large。それ以外は未設定でよい
# scale: （maintenance のため未設定）

# summary: 当該 draft が何を合意したかの1段落要約。人間可読補助（処理の正ではない）
summary: 配布コマンド・スキルの文章品質是正を「提出対象となる最終 HEAD の実ファイル全文を再査読し、ファイル単位の合否証拠なしには完了できない」契約（REQ-053 への行追加）として固定する。あわせて既知不備センチネル検査の Design を新規作成し、RU-0001 が列挙する初期不合格 69 ファイルの是正を pass 全件・fail 0 件・blocked 0 件で完遂する。実証 Case 判定は通常 Case（受入条件が実ファイルで直接測定可能なため評価契約は不要）。前工程引き継ぎ判定は配布物改善要求に該当するが self-hosting リポジトリのため通常 req workflow で処理（REQ-005-022）。Decision は不要（既存 REQ 内の契約行追加で責務境界変更・アーキテクチャ選択なし）。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目。artifact_actions.source_items から ID 参照される
agreed_items:
  - id: AG-001
    content: |
      全件検証対象は src/opencode/commands/agentdev/*.md（README.md はコマンド定義件数に含めない）と src/opencode/skills/agentdev-*/SKILL.md とする。
      実行開始時点と最終検証前に実ファイルから対象を列挙し、対象件数とファイルパスを確定する。追加・削除・改名されたファイルも最終検証対象へ含める。
      agentdev-command-creator は初期査読で合格でも最終全件検証から除外しない。
  - id: AG-002
    content: |
      RU-0001 が列挙する初期不合格ファイル（コマンド 19 件、スキル 50 件）を修正開始時点の初期未解決事項として固定する。
      初期不合格は、実ファイルを修正して該当不備がなくなったことの確認、既存の文章品質規範または用語政策により当該指摘が明確に許容されていることの根拠付き確認、意味の確定ができず blocked とした記録、のいずれかを満たすまで解消扱いにしない。
      実行中に新しい許容解釈を作成して既知不備を合格へ変更しない。文章品質規範または用語政策自体の変更を要する項目は本件の文章是正から分離する。
  - id: AG-003
    content: |
      合否判定は、提出対象となる最終 HEAD から対象ファイルを読み直した全文に対して行う。修正差分、作業用メモ、過去の査読結果だけを根拠とした合否判定をしない。
      一つのファイルへの一部修正は、当該ファイル全体の合格判定の根拠にならない。各ファイルは最終状態の全文がメタ指示残留、未完結文、不要な英語混在、規範関係のあいまいさ、過剰な名詞連結、条件・例外・処理の過剰連結、決定的破損の各観点に合格した場合に限り合格とする。
      最終合否判定は修正時の合格判断を継承せず、最終 HEAD の実ファイルを再入力として文章品質基準を再適用する。修正時の判断と最終確認の結果が異なる場合は最終確認の結果を優先する。
  - id: AG-004
    content: |
      最終検証結果は、対象ファイルごとにファイルパス、初期判定、修正有無、確認した文章品質観点、最終判定、残存不備、blocked の判断必要事項を個別に確認できることを要する。全件をまとめた集計値だけでは完了証拠としない。集計値はファイル単位の結果と一致する場合にだけ有効とする。
      完了判定は、開始時点と終了候補時点の不合格ファイル数、既知不備数、決定的破損数の比較を含み、減少が確認できない場合は完了としない。
      最終的な対象コマンド・スキルの結果は pass 全件、fail 0 件、blocked 0 件とする。fail または blocked が残る間は完了としない。blocked の別課題への記録だけでは完了としない。対象外化または現状維持はユーザーの明示合意がある場合に限る。
  - id: AG-005
    content: |
      完了報告の件数、ファイル単位結果、最終 HEAD の実ファイル内容は一致する。完了報告で合格とされたファイルから文章品質違反が 1 件でも再現できた場合、最終検証全体を不合格とする。
  - id: AG-006
    content: |
      既知不備として少なくとも次の項目を最終 HEAD で残存 0 件とする。「工程上の選好を肯定形の不変条件として示す:」「硬い境界（破壊的操作・state 破壊等の否定規則）に限定する:」「Decision保存の直前に妥当性を再検証する:」「status 维持」「查読」「docs/decisions<README>.md」「既知の壊れたテンプレート参照」「-066」「-151 相当」「根拠のない〜を正とする」「根拠のない〜が正」「順序の正」「操作知識の正」「非破壊性の正」。
      センチネルは全件再査読が正しく行われているかを確認する最低限の検査対象であり、修正範囲をこの項目に限定しない。センチネルのうち完全一致で機械判定できる項目と、表現出現の列挙後に規範参照を確認する項目を Design で区別する。
  - id: AG-007
    content: |
      上記 AG-002 から AG-006 の完了検証義務を REQ-053 配布物の文章品質契約へ状態要件として追加する（APPEND）。既存の文章品質観点の行と REQ-053-013（是正の意味保全、blocked 扱い、ユーザー判断）は維持し、置き換えない。センチネル項目のカタログと検出方式は Design へ分離する。
  - id: AG-008
    content: |
      既知不備センチネル検査の Design を docs/designs/ 配下へ新規作成する。センチネル項目カタログ、項目ごとの検出方式（確定一致 / 列挙後確認）、対象ファイル集合、合格条件、REQ-053-012 の決定的検査契約および決定的破損検査クラス Design との関係を定義する。

# artifact_actions: REQ/Decision/Design への保存対象を成果物別ではなく1つの配列に統合
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-053.md
    source_items: [AG-002, AG-003, AG-004, AG-005, AG-006, AG-007]
    content: |
      REQ-053 の要件テーブルへ次の行を追加する（REQ-053-014 から REQ-053-022）。

      | REQ-053-014 | 文章品質是正の完了判定は、提出対象となる最終 HEAD から読み直した実ファイル全文に対する再確認に基づいて行う。変更差分、作業用メモ、過去の査読結果だけを根拠とした合否判定を行わない |
      | REQ-053-015 | 一つのファイルに対する一部の修正は、当該ファイル全体の合格判定の根拠にならない。各ファイルは最終状態の全文が対象観点すべてに合格した場合に限り合格とする |
      | REQ-053-016 | 最終合否判定は、修正時の合格判断を継承しない。提出対象となる最終 HEAD の実ファイルを再入力として文章品質基準を再適用し、修正時の判断と最終確認の結果が異なる場合は最終確認の結果を優先する |
      | REQ-053-017 | 初期不合格と記録したファイルは、実ファイル修正による解消確認、既存規範に基づく誤検出の根拠付き証明、blocked 記録のいずれかを満たすまで合格へ変更しない。実行中に新しい許容解釈を作成して既知不備を合格へ変更しない |
      | REQ-053-018 | 初期不合格ファイルを実ファイル変更なしに合格とする場合は、初期指摘が既存規範上の誤検出であることを規範の参照付きで証明する。根拠のない合格判定を行わない |
      | REQ-053-019 | 文章品質是正の完了証拠は、対象ファイルごとにファイルパス、初期判定、修正有無、確認した品質観点、最終判定、残存不備、blocked の判断必要事項を個別に確認できること。ファイル単位の結果と一致しない集計値だけでは完了証拠としない |
      | REQ-053-020 | 文章品質是正の完了判定は、開始時点と終了候補時点の不合格ファイル数、既知不備数、決定的破損数の比較を含み、減少が確認できない場合は完了としない。対象ファイルに fail または blocked が残る間は完了としない。blocked の別課題への記録だけでは完了としない |
      | REQ-053-021 | 完了報告の件数、ファイル単位結果は提出対象となる最終 HEAD の実ファイル内容と一致する。合格とされたファイルから文章品質違反が再現できた場合、最終検証全体を不合格とする |
      | REQ-053-022 | 既知不備として固定した項目の最終 HEAD での残存は決定的に確認できる。センチネル項目のカタログと検出方式は Design が所有する |
  - id: ACT-DESIGN-001
    artifact: design
    operation: create
    target_design:
      operation: create
      domain: integrity
      slug: prose-quality-sentinel-checks
    target_area:
    source_items: [AG-006, AG-008]
    content: |
      Design 「既知不備センチネル検査」（docs/designs/integrity/prose-quality-sentinel-checks.md）を新規作成する。
      定義内容: センチネル項目カタログ（AG-006 の 14 項目）、項目ごとの検出方式（完全一致・正規一致で機械判定できる項目と、表現出現を列挙したうえで規範参照の有無を確認する項目の2段分類）、対象ファイル集合（配布 command と配布 skill の全対象）、合格条件（最終 HEAD での残存 0 件）、REQ-053-012 の決定的検査契約との関係、決定的破損検査クラス Design（content-corruption-checker）との関係。

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: README コマンド表の「req-save は feature のみ」と req-save.md 実定義（work_type による消費判定の廃止、artifact_actions 有無で判定）の表記揺らぎ
    resolution: 実ファイル定義（req-save.md）を正とする。本件は maintenance かつ REQ 対象 artifact_actions があるため req-save が適用される。README 表記の更新は本件の対象外（docs 整備候補として分離）
  - id: CR-002
    conflict: 追加する完了検証行と既存 REQ-053-013（意味を一義的に復元できない箇所の blocked 扱い）、REQ-007（完了時点の証跡契約）との役割重複の懸念
    resolution: REQ-053-013 は是正中の意味保全制約、新行は完了判定と証拠の制約として補完関係にあり矛盾しない。証拠の記録チャネルは REQ-007 が正規所有するため新行ではチャネルを規定しない。REQ-055 の検証手段の質基準は本件 test strategy で適用済み

# operation_units: 複数RU入力時の統合/分離結果。単一REQ操作の場合も1件の OU として出力
operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: REQ-053
    target_design:
      operation: create
      domain: integrity
      slug: prose-quality-sentinel-checks
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_documents:
        - docs/requirements/REQ-053.md
      action_mapping:
        - action_id: ACT-REQ-001
          operation: append
          target: docs/requirements/REQ-053.md
          saved_rows: [REQ-053-014, REQ-053-015, REQ-053-016, REQ-053-017, REQ-053-018, REQ-053-019, REQ-053-020, REQ-053-021, REQ-053-022]
      source_ru_mapping:
        - source_ru: RU-0001
          ou_id: OU-001
          operation: append
          target: docs/requirements/REQ-053.md
      unclassified_verification_rows:
        - REQ-053-014
        - REQ-053-015
        - REQ-053-016
        - REQ-053-017
        - REQ-053-018
        - REQ-053-019
        - REQ-053-020
        - REQ-053-021
        - REQ-053-022

# test_strategy: 各合意項目（AG-*）の検証方法。各項目は3要素を必須とする
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      実行開始時点と最終検証前の対象ファイル一覧を実ファイルの glob で列挙し、件数とパスを確定する。両時点の一覧を突合し、追加・削除・改名の反映を確認する。
    pass_criteria: |
      両時点の対象列挙記録が存在し、最終検証の対象集合が最終検証前の再列挙結果と一致する。README.md が件数に含まれていない。
    on_failure: |
      fix-and-reverify。対象列挙をやり直し、抜けたファイルを最終検証対象へ追加して全件検証を再実行する。
  - id: TS-002
    target_item: AG-002
    verification: |
      初期不合格 69 ファイルについて、ファイル単位検証結果を確認し、各ファイルの解消経路（実ファイル修正による解消確認、既存規範に基づく誤検出の根拠付き証明、blocked 記録）を点検する。
    pass_criteria: |
      全初期不合格ファイルが 3 経路のいずれかで記録済みであり、根拠なしの未変更合格が 0 件である。実行中に新設された許容解釈による合格変更が 0 件である。
    on_failure: |
      fix-and-reverify。根拠のない合格を差し戻し、修正または誤検出証明または blocked 記録をやり直したうえで全文再査読を再実行する。
  - id: TS-003
    target_item: AG-003
    verification: |
      提出対象となる最終 HEAD の実ファイルから対象ファイルを再読込し、修正差分によらず全文に対して合否判定が行われたことを手順記録と照合して確認する。一部修正だけで合格としたファイルの有無を点検する。
    pass_criteria: |
      変更差分のみを根拠に合格と判定されたファイルが 0 件である。全ファイルが全文の観点別再確認を経ている。
    on_failure: |
      fix-and-reverify。該当ファイルを最終 HEAD から全文再査読し、判定をやり直す。
  - id: TS-004
    target_item: AG-004
    verification: |
      全対象ファイルのファイル単位検証結果を点検し、7 項目（ファイルパス、初期判定、修正有無、確認観点、最終判定、残存不備、blocked の判断必要事項）の記録完備と集計値との一致を確認する。開始時点と終了候補時点の不合格ファイル数、既知不備数、決定的破損数を比較する。
    pass_criteria: |
      全対象ファイルで 7 項目が揃い、集計値がファイル単位結果と一致する。3 指標が開始時点から減少している。最終成果が pass 全件、fail 0 件、blocked 0 件である。blocked の別課題移送のみによる完了宣告が 0 件である。
    on_failure: |
      fix-and-reverify。証拠を再生成して再点検する。減少が確認できない場合は完了宣告を取り消し、是正を継続する。
  - id: TS-005
    target_item: AG-005
    verification: |
      完了報告の合格ファイルに対して決定的検査を全件実行し、加えて抽出査読で違反の再現可能性を確認する。報告の件数・ファイル単位結果と実ファイルを突合する。
    pass_criteria: |
      報告と実ファイルの不一致が 0 件であり、合格ファイルからの違反再現が 0 件である。
    on_failure: |
      fix-and-reverify。違反が再現できた時点で最終検証全体を不合格とし、全文再査読からやり直す。
  - id: TS-006
    target_item: AG-006
    verification: |
      既知不備センチネル検査を Design の検出方式に従って提出対象となる最終 HEAD の全対象ファイルへ実行し、14 項目の残存を確認する。機械判定できない列挙確認型の項目は出現箇所の列挙結果に対して規範参照を確認する。
    pass_criteria: |
      全センチネル項目の残存が 0 件である。
    on_failure: |
      fix-and-reverify。該当箇所を修正して同検査を再実行する。意味の確定ができない箇所は blocked として記録する。
  - id: TS-007
    target_item: AG-007
    verification: |
      req-save 適用後、docs-check の REQ 構造検証と README 要件索引の整合を確認する。REQ-053 の要件テーブルに REQ-053-014 から REQ-053-022 が反映されていることを読み戻しで確認する。
    pass_criteria: |
      REQ-053 の新行が要件テーブルへ反映し、検証対応要否の分類が済んでおり、README 索引と整合する。
    on_failure: |
      fix-and-reverify。REQ ファイルの編集を修正して docs-check を再実行する。
  - id: TS-008
    target_item: AG-008
    verification: |
      design-save 適用後、Design ファイルの配置（docs/designs/integrity/prose-quality-sentinel-checks.md）、Design インデックスへの登録、target_area 整合を docs-check で確認する。
    pass_criteria: |
      Design ファイルが作成済みでインデックス登録済みであり、docs-check の Design 整合検査に合格する。
    on_failure: |
      fix-and-reverify。Design ファイルまたはインデックス登録を修正して docs-check を再実行する。

# review_dispositions: 採否判断の記録
review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: 要件化の方向1（既存文章品質契約を置き換えず、完了検証契約を強化する）
    disposition: covered
    reason_code: reflected_in_artifact_actions
    reason: |
      REQ-053 APPEND（ACT-REQ-001）として反映。既存行の維持を AG-007 で合意済み。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0001
    source_item: 要件化の方向2（初期不合格を勝手に消さない）
    disposition: covered
    reason_code: reflected_in_artifact_actions
    reason: |
      AG-002 および REQ-053-017 として反映。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0001
    source_item: 要件化の方向3（ファイルの一部修正をファイル全体の pass とみなさない）
    disposition: covered
    reason_code: reflected_in_artifact_actions
    reason: |
      AG-003 および REQ-053-015 として反映。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0001
    source_item: 要件化の方向4（最終HEADの実ファイルを検証対象とする）
    disposition: covered
    reason_code: reflected_in_artifact_actions
    reason: |
      AG-003 および REQ-053-014、REQ-053-016 として反映。adversarial-review の finding により「提出対象となる最終 HEAD」の表現を明示。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0001
    source_item: 要件化の方向5（初期不合格ファイルの未変更passを禁止する）
    disposition: covered
    reason_code: reflected_in_artifact_actions
    reason: |
      AG-002 および REQ-053-018 として反映。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-006
    source_ru: RU-0001
    source_item: 要件化の方向6（ファイル単位の検証証拠を必須にする）
    disposition: covered
    reason_code: reflected_in_artifact_actions
    reason: |
      AG-004 および REQ-053-019 として反映。証拠の記録チャネルは REQ-007 が正規所有するため本件では規定しない。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-007
    source_ru: RU-0001
    source_item: 要件化の方向7（修正判断と最終合否判定を同じ自己評価だけに依存させない）
    disposition: covered
    reason_code: reflected_in_artifact_actions
    reason: |
      AG-003 および REQ-053-016 として反映。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-008
    source_ru: RU-0001
    source_item: 要件化の方向8（改善量を確認する）
    disposition: covered
    reason_code: reflected_in_artifact_actions
    reason: |
      AG-004 および REQ-053-020 として反映。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-009
    source_ru: RU-0001
    source_item: 要件化の方向9（blocked の別課題移送だけで完了しない）
    disposition: covered
    reason_code: reflected_in_artifact_actions
    reason: |
      AG-004 および REQ-053-020 として反映。対象外化のユーザー明示合意条件を含む。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-010
    source_ru: RU-0001
    source_item: 必ず解消を確認する既知不備
    disposition: covered
    reason_code: reflected_in_artifact_actions
    reason: |
      AG-006、REQ-053-022、ACT-DESIGN-001 として反映。カタログと検出方式は Design へ分離。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 必ず解消を確認する既知不備
      checked_at_commit: null
    related_removed_items: []
  - id: RD-011
    source_ru: RU-0001
    source_item: 受け入れ条件 AC-13（再発防止4スキルの自己適合）
    disposition: covered
    reason_code: already_satisfied
    reason: |
      独立の新行は不要。4スキルは全件検証対象（AG-001）に含まれ、REQ-053-013（既存配布物の適合）と pass 全件の完了条件（AG-004）で担保される。
    evidence:
      path: docs/requirements/REQ-053.md
      section: 要件
      checked_at_commit: null
    related_removed_items: []
  - id: RD-012
    source_ru: RU-0001
    source_item: 対象外
    disposition: covered
    reason_code: already_satisfied
    reason: |
      機能追加等の対象外は REQ-053 の適用範囲（対象外）と整合。識別子の日本語化禁止、英語全面禁止は REQ-053-004 の用語政策で担保される。
    evidence:
      path: docs/requirements/REQ-053.md
      section: 適用範囲
      checked_at_commit: null
    related_removed_items: []
  - id: RD-013
    source_ru: RU-0001
    source_item: 検証方法
    disposition: covered
    reason_code: reflected_in_artifact_actions
    reason: |
      test_strategy TS-001 から TS-008 として反映。fail 承認済み範囲内修正後の再検証、blocked のユーザー判断条件は AG-002、AG-004 に含む。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 検証方法
      checked_at_commit: null
    related_removed_items: []

# case_open_hints: case-open 構成生成への参考情報
case_open_hints:
  epic_needed: false
  decomposition:
  wave_hints:
    - REQ/Design の保存（req-save / design-save）後に是正実行へ移行する。是正は配布 command 19 件と配布 skill 50 件を対象とするが、1 Issue で完結する規模（単純な文章修正の反復）。case-run の委譲（最大5件並列）で処理可能
    - 実装時は docs/knowledge/windows-powershell-bulk-io-corruption.md を参照し、既存 UTF-8 ファイルへ PowerShell 標準 cmdlet の一括読み書きを使用しない
```

# summary

<!-- 【任意】 人間可読サマリー。
後続工程の原本としては扱われない。
 処理の原本は上記 # draft-data YAML ブロックである。
 検討経緯や採用しない方針は処理対象として残さない。 -->

配布コマンド・スキルの文章品質是正について、「一部修正や自己申告だけで完了できない」完了検証契約を REQ-053 へ追加し（9 行）、既知不備 14 項目のセンチネル検査を Design として新規作成する。是正対象は配布 command 19 件 + 配布 skill 50 件の 69 ファイル（初期不合格）で、完了条件は pass 全件・fail 0 件・blocked 0 件と改善量の減少確認。

主要な判断:
- 実証 Case ではなく通常 Case（受入条件が実ファイルで直接測定可能。評価契約不要、test strategy のみ定義）
- Decision 不要（既存 REQ 内の契約行追加。REQ-007 / REQ-055 / REQ-053-013 との衝突なしを確認済み）
- SPLIT シグナル 0（REQ-053: 13 行 → 22 行、単一関心、アーティファクト種別 2 種）により APPEND を許可
- 前工程引き継ぎ判定: 配布物改善要求に該当するが self-hosting リポジトリのため通常 req workflow で処理（REQ-005-022）
- adversarial-review 実施（default-on）: 2 系統の review stream により 3 findings を受理（最終 HEAD の特定表現の明確化、証拠フィールドの日本語表記、センチネル検出方式の 2 段分類）、7 findings を反証により不採用
