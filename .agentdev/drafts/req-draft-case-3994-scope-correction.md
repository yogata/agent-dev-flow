---
draft_type: req_draft
topic_slug: case-3994-scope-correction
status: draft
created_at: "2026-11-11T10:23:03.7568074+09:00"
source_rus: [RU-0271]
---

# draft-data

```yaml
work_type: maintenance
scale: standard
summary: >-
  Root Case #3994 の実行契約と TS-004 に投影された、利用者の採用記録がない
  3ファイル限定を監督者訂正として撤去する。元 RU-0271 の対象外と機能範囲、
  REQ-009-054 の成果条件を維持し、その実装・検証対応を表す必要最小限の
  sidecar 宣言だけを付随変更として許容する。既存 PR #3998 を再利用する。
root_case: 3994
existing_implementation_pr: 3998
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
adoption_basis:
  kind: supervisor-correction
  scope: 実行契約と TS-004 の未採用制限の撤去および必要最小限の対応宣言の付随許容
  basis: >-
    本タスクの監督者による明示訂正指示と、元 RU-0271 の対象・対象外・受入条件の直接照合。
    作業継続指示を新しい仕様採用の根拠に置換しない。旧3ファイル制限について利用者の採用記録はなく、
    初期 draft の存在や Issue への投影を利用者承認とは扱わない。
  historical_sources:
    - revision: f6ba72ebf
      path: .agentdev/backlog/req-units/RU-0271.md
      sections: 対象 26〜31行、対象外 33〜38行、決定的受け入れ条件 57〜64行
    - revision: a51371f72
      path: .agentdev/drafts/req-draft-install-check-probe-close-mechanical-steps-gates-lag.md
      sections: TS-004 182〜194行。3ファイル限定は187〜189行で追加された
  source_retention: 元RUと初期draftは履歴参照のみ。復元・変更・再消費・再削除しない
important_change_notification:
  delivered_before_save: true
  parent_notification: 親が保存前に重要変更通知を提示済みとの明示引継ぎを受領した
  local_notification_reference: >-
    本セッションの保存前出力「元RUと初期ドラフトを照合しました」で、理由、
    実行契約・TS-004の訂正内容、対象外維持、sidecar付随許容、既存PR再利用、正本不変更を通知した。
    この記録を含む apply_patch の実行より前に提示した。通知は旧制限の利用者承認を意味しない。
agreed_items:
  - id: AG-001
    content: >-
      #3994 の実行契約の「変更差分は scripts/install.ps1、docs/requirements/REQ-009.md、
      docs/designs/local/install-script-usability.md の3ファイルに限定」の拘束を撤去する。
      本 Case の機能修正は install.ps1 の close_mechanical_steps 用検査入力への必須入力追加に保ち、
      close_mechanical_steps.ts は変更しない。ファイル数を合格条件としない。
  - id: AG-002
    content: >-
      TS-004 を、変更差分に close_mechanical_steps.ts を含まないことと、元の対象外・
      機能範囲が維持されることを検査する内容へ訂正する。check モードの判定・集計ロジック本体、
      scripts/consumer/archive/install.ps1、実consumerリポジトリ側の再導入・再検査を対象外とする。
      REQ-009 の構造再編も本訂正に含めない。既存フィールドと他 Kind の fixture の不変条件を維持する。
  - id: AG-003
    content: >-
      REQ-009-054 の対応完全性に必要な付随変更として、既存の
      traceability/installer-host-projection.yaml の implementation の scripts/install.ps1 と
      verification の scripts/self/release/install-check-mechanical-prerequisites.Tests.ps1 に対する
      REQ-009-054 の宣言のみを許容する。実体・役割・所属を確認し既存登録へ統合する。
      無関係な要件、成果物、policy、checker、テスト実装の変更は許容しない。
      既存 PR #3998 を再利用し、重複した Issue・実装PRを作らない。
  - id: AG-004
    content: >-
      REQ-009-054 と docs/designs/local/install-script-usability.md の必須入力追随契約は
      設計PR #3995 として merge 済みの正本を維持する。TS-001〜003・TS-005 の検証義務を変更・免除しない。
      fixture への追加は issueUpdatedAt（非空の ISO 8601 形式の Case 非依存の固定サンプル値）と
      issueNumber（1以上の整数の固定値）だけとし、既存11フィールドと他3 Kindのfixtureは不変とする。
      本 req-define は訂正draftの保存までとし、Issue・PR・正本・実装の変更や case-revise の実行を含めない。
artifact_actions: []
artifact_action_judgment:
  req: REQ操作なし。正本にファイル数制限はなく、REQ-009-054の命題は変更しない
  design: 操作なし。既存の必須入力追随契約とdesign対応を維持する
  decision: 不要。既存Caseの未採用拘束の訂正であり新しい技術判断・責務境界変更を含まない
  classification: 一時的な実行契約の訂正。新規REQ行・Design行候補は0件で分離評価は非発動
  split: REQの追加・更新なし。draftの新規要件行0件、関心1件で構造再編を含めない
conflict_resolutions:
  - id: CR-001
    conflict: 元RUの対象外と、初期draft由来の3ファイル限定が同一の利用者合意として扱われた
    resolution: >-
      元RUにはファイル数制限がない。3ファイル限定は監督者・workflow側が初期draftへ追加した
      未採用拘束として撤去する。元の対象外は残す。本訂正を利用者による旧制限の承認と記録しない。
operation_units:
  - ou_id: OU-001
    source_ru: RU-0271
    operation: update
    target_issue: 3994
    target_area: 実現方針のファイル数制限および完了条件のTS-004
    description: 既存Root Caseの実行契約訂正。REQ・Decision・Designの保存操作ではない
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
result: {}
test_strategy:
  - id: TS-001
    target_item: AG-004
    verification: >-
      修正着手前のconsumer導入形態で、close_mechanical_stepsのdivergence 1件と
      issue-updated-at、target-issue-number の omission を記録する。再実行困難時は元RUの
      2026-11-10の観測記録を再現記録として引用できる。機密名・版は引用しない。
    pass_criteria: 修正着手前の上記divergenceが記録済み、または元RUの同一事象の観測記録が引用されている
    on_failure: fix-and-reverify。fixture欠落とdivergenceの対応を特定し直し、修正を先行させない
  - id: TS-002
    target_item: AG-004
    verification: >-
      修正後、同一条件のconsumer導入形態を再現した検証環境で install.ps1 -Mode check を実行する。
      GitHub版隔離環境または再現checkoutの選択は実行担当が行い、実consumer側の操作を含めない。
    pass_criteria: prepare_definition_pr、accept_definition_checks、close_mechanical_steps、cross-dependency の4対象すべてでdivergence 0件
    on_failure: fix-and-reverify。残存divergenceとfixtureの必須入力の過不足を是正して再検証する
  - id: TS-003
    target_item: AG-004
    verification: 上流自身のdocs-check、textlint最終検査、上流条件のcheck等、Case実行経路の上流検査を実行して修正前後を比較する
    pass_criteria: 上流自身の検査で新たなdivergence・新規失敗が0件。既存失敗と新規失敗を根拠付きで区別する
    on_failure: fix-and-reverify。新規失敗の原因を特定し対象範囲内で修正・再検証する
  - id: TS-004
    target_item: AG-002
    verification: >-
      本Caseの設計PR #3995 と既存実装PR #3998 の files changed と実差分を機械的に確認する。
      src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts が含まれないこと、
      install.ps1 の機能差分が close_mechanical_steps 用fixtureの issueUpdatedAt・issueNumber 追加だけであることを確認する。
      既存フィールド（phase、worktreeRoot、repoRoot、branch、prNumber、issueBodyPath、generateIndexesGate、
      traceabilityGate、integrityGates、textlintGate、contractStateCheck）と、prepare_definition_pr、
      accept_definition_checks、cross-dependency のfixtureが不変であることを確認する。
      check判定・集計ロジックとarchive installerの不変、実consumer操作の不存在を確認する。
      sidecar差分はAG-003の2つの対応宣言だけか実差分で照合し、ファイル数では判定しない。
    pass_criteria: >-
      close_mechanical_steps.tsへの変更0件、元の対象外への変更・操作0件、fixtureの既存フィールドと
      他Kindの変更0件。機能差分は上記2フィールド追加のみ。付随差分はREQ-009-054の必要な対応宣言のみ。
      3ファイル限定を検証手順・合格条件・失敗時処置の拘束として残さない。
    on_failure: >-
      fix-and-reverify。対象外や無関係な変更を許容せず、正規実行工程で当該変更を分離・是正して再検証する。
      本draft作成中に既存PRの差分を変更しない。
  - id: TS-005
    target_item: AG-004
    verification: >-
      既存Designの機械工程scriptの実行時前提の導入時検証節、REQ-009-054、現行validateInputの
      pre-merge必須入力（issueUpdatedAt、issueNumberと既存品質ゲート群）を三方照合する。
    pass_criteria: Designと必須入力が過不足なく対応しREQ行との契約のずれ0件。docs-checkとtextlintが合格する
    on_failure: >-
      fix-and-reverify。元のTS-005の是正義務を維持する。ただし本訂正で正本差分を予定せず、
      不整合発見時は正規所有工程で必要性と許可範囲を確認し、本req-defineで正本を直接変更しない。
  - id: TS-006
    target_item: AG-003
    verification: >-
      訂正反映後の実行契約とTS-004を元RU・本draftと照合する。監督者訂正と旧制限の利用者採用を区別する。
      PR #3998のsidecar実差分、対象実装・恒常検証手段の実体を確認し、実装対象rootを明示して
      traceability check --req REQ-009-054 と当該恒常検証を実行する。
      PR本文の既存合格報告だけで再受入済みとせず、現在有効な条件に対する証拠の適用可否を確認する。
    pass_criteria: >-
      訂正の帰属が正しく未採用のファイル数拘束0件。PR #3998再利用、無関係な対応宣言差分0件、
      対応構造検査fail 0件、恒常検証合格。構造検査の合格をTS-001〜005の実証の代わりにしない。
    on_failure: fix-and-reverify。帰属・宣言・証拠を正規工程で是正する。機能範囲拡大や対象外の変更で解消しない
realization_actions:
  - id: RA-001
    concern: 既存Caseの実行契約とTS-004の訂正
    responsibility: case-reviseからcase-readyへの正規経路が既存Caseの実行契約を再確定する
    ownership_hints: ["Root Case #3994", "実現方針", "完了条件 TS-004"]
    intent: AG-001・AG-002の訂正文を反映しAG-004の既存義務を維持する。正本実変更がなければ空の設計修正PRを作らない
    verification_refs: [TS-004, TS-006]
    source_items: [AG-001, AG-002, AG-004]
  - id: RA-002
    concern: 必要最小限の対応宣言を含む既存PRの再利用
    responsibility: 実行担当が既存PRの機能差分と対応宣言の適合を確認し、最終受入はcase-closeが行う
    ownership_hints: ["PR #3998", scripts/install.ps1, traceability/installer-host-projection.yaml]
    intent: AG-003の範囲だけを付随許容とし、元機能修正と検証義務を再評価する。既存実装の作り直しや重複PRを要求しない
    verification_refs: [TS-001, TS-002, TS-003, TS-004, TS-005, TS-006]
    source_items: [AG-003, AG-004]
review_dispositions:
  - id: RD-001
    source_ru: RU-0271
    source_item: original-scope-and-exclusions
    disposition: covered
    reason_code: preserved_by_correction
    reason: 元RUの対象・対象外と受入条件を維持する。3ファイル限定は元RU由来ではない
    evidence:
      path: .agentdev/backlog/req-units/RU-0271.md
      section: f6ba72ebfの26〜38行・57〜64行。削除済みRUは履歴参照する
      checked_at_commit: null
    related_removed_items: []
traceability_evidence:
  root: C:/Users/ogatay/work/agent-dev-flow
  requirement: REQ-009-054
  coverage_result: design 1件、implementation 0件、verification 0件。現mainの直接走査結果
  design_source: docs/designs/local/install-script-usability.md の9行目
  sidecar_owner: 既存installer-host-projection component。install.ps1と当該恒常検証の既存登録先を直接読取済み
  pr_files: [scripts/install.ps1, traceability/installer-host-projection.yaml]
  interpretation: PR #3998未mergeのためmainの対応欠落を認識する。PR側の現在の完全性や機能合格を本draft保存の実績としない
semantic_evaluation:
  observation_id: 20261111T012238Z-9bcc
  final_operation: REQ操作なし
  difference_reason: >-
    JevのUPDATE提案に対し、直接読取した正本には3ファイル制限がなく命題変更もないため
    REQ操作なしと最終判断した。差異はsemantic_disagreementとして新規観測へ記録済み。
  classification_evaluation: 新規REQ行・Design行候補0件のため後続分類質問を生成しない
boundary_risks:
  dependency: sidecar許容の拡大による無関係宣言混入をTS-004・006で照合する
  client_server: 新しい通信境界なし。実consumer操作の混入をTS-002・004で除外する
  execution: fixture以外のゲート実行・判定ロジック変更をTS-004で検出する
  build_runtime: 配布物inline宣言への混入を避け既存sidecarへ限定し、恒常検証の実体をTS-006で確認する
  environment_propagation: mainとPR側の対応状態・証拠の混同をTS-002・003・006で防ぐ
assembly_evidence: []
assembly_applicability: artifact_actionsが空で正本の局所組立対象なし。Issueへの適用は本workflowの副作用外
review_result:
  mode: 単一セッション内の3論理役割による対論。物理サブエージェントは使用しない
  strategy: 採用根拠の復元と最小付随変更の境界を別の論理streamで初期検討し、その後反証を統合する
  stream_a:
    challenge: ファイル制限の撤去が新しいスコープ採用に当たるのではないか
    counter_challenge: 元RU受入条件4に数制限はなく、旧制限の採用記録もない。元対象外を維持した監督者訂正である
    disposition: 限定合意。旧制限撤去だけを認め、元の対象外と機能範囲は緩和しない
  stream_b:
    challenge: sidecarを許容すると無関係な変更や検証義務の見かけ上の充足が混入し得る
    counter_challenge: AG-003の2対応だけに限定し、TS-006で実体と恒常検証を確認する。構造合格は機能実証と区別する
    disposition: 採用。最小宣言境界と証拠再評価を引継ぎに含めた
  strategy_meta_challenge: 実装再検証をreq-defineの保存前義務へ拡大しない。ここでは検証契約の完全性を確認する
  convergence_audit: 元RU除外4項目、既存fixture不変、TS-001〜005、監督者帰属、正本不変更、既存PR再利用を再照合し新規争点なし
  unresolved: []
  residual_risk: PR #3998の実差分・現行検証証拠の最終受入と、別件の未追跡ファイル停止は後続工程で独立評価する
qg1:
  result: pass
  basis: >-
    保存操作なしの分類根拠、Decision不要、測定可能な合格条件、構造化必須項目、
    全TSの3要素、未解決事項0件、5境界リスクの検証投影を保存前に確認した。
    本判定はdraftの定義完全性だけを対象とし、Case完了やPR合格の認定ではない。
case_open_hints:
  epic_needed: false
  wave_hints: []
  existing_root_case: 3994
  reuse_pr: 3998
  prohibition: 新規Case・重複実装PRを作らず既存Caseへの訂正入力とする。本実行では後続工程を起動しない
```
