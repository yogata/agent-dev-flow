---
draft_type: req_draft
topic_slug: verification-catalog-register-ru0002
status: draft
created_at: 2026-09-14T13:23:20+09:00
source_rus:
  - RU-0002
---

# draft-data

```yaml
# work_type: docs_chore（検証対応要否カタログへの定型的エントリ追加。REQ/コード/ゲート契約の変更なし）
work_type: docs_chore

# design_actions_consumed: design-save による Design artifact_actions 消費済みフラグ（2026-09-14T13:40+09:00、ACT-DESIGN-001/002/003 適用完了）
design_actions_consumed: true

# summary: 当該 draft が何を合意したかの1段落要約。人間可読補助（処理の正ではない）
summary: Epic #2805 OU-001（#2806 / PR #2812）の case-close トレーサビリティ段階ゲート（check.ts --req）停止を解消するため、REQ-005-029/030/031 と REQ-006-112/113/114 の 6 行を verification-scope-catalog の検証対応任意行として登録する。エントリは REQ-005/REQ-006 各セクションへの範囲記法追加とし、経緯記録へ追記する。REQ 行本文・段階ゲート契約・恒久検証対応（OU-006 RA-006 専属領域）は変更しない。登録により #2812 マージ → #2806 クローズへ進行してよい（いずれも RU-0002 Decided、ユーザー承認済み 2026-09-14）

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目
agreed_items:
  - id: AG-001
    content: REQ-005-029..REQ-005-031 と REQ-006-112..REQ-006-114 の 6 行を、verification-scope-catalog（docs/designs/foundations/references/verification-scope-catalog.md）の「任意行エントリ」へ検証対応任意行として登録する。エントリは ### REQ-005（ワークフロープロトコルと工程接続）セクションと ### REQ-006（Case実行オーケストレーション）セクションへ既存様式の箇条書きで追加し、登録根拠カテゴリはカタログの既存区分（エージェントの実行時振る舞い・workflow 契約・状態遷移の構造規範）に従う。併せて「任意行エントリ」節前置の経緯記録段落へ本登録の経緯（Epic #2805（公開ワークフローの状態遷移中心再構成）OU-001（#2806、PR #2812）の case-close トレーサビリティ段階ゲート停止の解消、RU-0002 の要件化、ユーザー承認 2026-09-14）を追記する
  - id: AG-002
    content: 登録はカタログ「形式」節に整合させる。1行1エントリ、REQ-NNN-MMM 単一または同 REQ ファイル内範囲の .. 記法、説明文の後置（check は説明文を解釈しない）、説明文への対応宣言マーカー文字列の混入禁止（Markdown ファイルは宣言コーパス走査対象のため誤検出する）
  - id: AG-003
    content: 任意登録は将来の恒久検証対応（Epic #2805 OU-006 RA-006 専属領域）の付与を禁止しない。本登録では検証対応宣言を一切新設せず、カタログ登録と恒久検証対応（宣言配置）は独立経路として扱う。OU-006 での恒久検証対応への昇格は自由である
  - id: AG-004
    content: 本登録により case-close #2812 のトレーサビリティ段階ゲートが通過し、#2812 マージ → #2806 クローズへ進めてよい。Epic #2805 の全 Wave（OU-002〜OU-006）が本登録に先行依存しており、登録により先行依存が解除される

# artifact_actions: Design（検証対応要否カタログ）への更新のみ。REQ/Decision 対象なし
# 同一 target ファイルへの複数 action は順序依存のため直列実行する（design-save 並列化規則）
# ACT-DESIGN-001/002 はセクション置換（既存エントリ維持 + 追加エントリを含む置換後全文）
# ACT-DESIGN-003 は target_area 未指定の後方互換追記モード（経緯記録段落末尾への追記）
artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/foundations/references/verification-scope-catalog.md
    target_area: REQ-005（ワークフロープロトコルと工程接続）
    source_items: [AG-001, AG-002]
    content: |
      ### REQ-005（ワークフロープロトコルと工程接続）

      - REQ-005-001..REQ-005-009: 3マクロフェーズ構成、SSoT 遷移、work_type/scale 分類の実行時規則
      - REQ-005-011..REQ-005-012: 追加工程と workflow-lifecycle の宣言的提供範囲
      - REQ-005-015..REQ-005-028: 成果物間引き継ぎ、agentdev_handoff、STEP モデル、状態遷移の実行時振る舞い
      - REQ-005-029..REQ-005-031: 公開ワークフローの例外経路（req-define 再合意を起点とする case-revise → case-ready）、backend 固有表現への非依存、汎用 Issue 操作の公開コマンド新設禁止の実行時規則
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/foundations/references/verification-scope-catalog.md
    target_area: REQ-006（Case実行オーケストレーション）
    source_items: [AG-001, AG-002]
    content: |
      ### REQ-006（Case実行オーケストレーション）

      - REQ-006-108: case-auto の capture 成果物再分類禁止の実行時振る舞い
      - REQ-006-112..REQ-006-114: Case 7状態モデルと終端状態（closed/cancelled）、case-run の実装開始条件（ready からのみ、blocked 起因ごとの状態値の増やし禁止）、resume_command の保持条件（blocked のみ保持・通常状態遷移時にクリア）の実行時規則
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/foundations/references/verification-scope-catalog.md
    source_items: [AG-001]
    content: |
      「任意行エントリ」節前置の経緯記録段落末尾へ追記する文:

      REQ-005-029..REQ-005-031 と REQ-006-112..REQ-006-114 のエントリは Epic #2805（公開ワークフローの状態遷移中心再構成）OU-001（#2806、PR #2812）の case-close トレーサビリティ段階ゲート停止の解消（RU-0002 の要件化、ユーザー承認 2026-09-14）に伴い追加した。

      変更範囲の境界: 本 Design 更新はカタログファイルへの上記追加のみとする。REQ 行本文（docs/requirements/REQ-005.md / REQ-006.md）、検証対応宣言の新設、段階ゲート契約・Decision、恒久検証対応の実装は変更しない。

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: 任意行カタログ登録が恒久検証対応の専属領域（Epic #2805 OU-006 RA-006。case-run 検証差分でも「恒久検証対応未付与、OU-006 RA-006 の専属領域」と記録済み）と見かけ上重複する
    resolution: 任意登録と恒久検証対応は独立経路であり、カタログ登録は宣言配置を代替・禁止しない。本登録では宣言を新設せず、OU-006 での昇格は自由とする（RU-0002 Decided、ユーザー承認済み 2026-09-14）

# operation_units: 単一 REQ 操作のため 1 件の OU
operation_units:
  - ou_id: OU-001
    source_ru: RU-0002
    target_design: docs/designs/foundations/references/verification-scope-catalog.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

# test_strategy: 各合意項目の検証方法（3要素必須）
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      agentdev-traceability の check（src/opencode/skills/agentdev-traceability/scripts/src/check.ts、bun 実行・repo root cwd・--req モード、REQ-060 実行形態）を PR #2812 の対象 12 行に実行する
    pass_criteria: |
      REQ-005-029/030/031、REQ-006-112/113/114 の 6 行が unclassified と判定されず、対象 12 行の unclassified が 0 件である
    on_failure: |
      fix-and-reverify: カタログ登録の漏れ・範囲記法の誤りを修正し、check を再実行する（登録の選択肢自体は RU-0002 Decided で確定済みのため、実施形態の修正のみを行う）
  - id: TS-002
    target_item: AG-002
    verification: |
      カタログに追加した 2 エントリ（REQ-005-029..REQ-005-031、REQ-006-112..REQ-006-114）をカタログ「形式」節と既存エントリ様式に対して突合する。確認軸: 1行1エントリ、REQ-NNN-MMM 記法、説明文後置、説明文に対応宣言マーカー文字列を含まないこと
    pass_criteria: |
      2 エントリが全確認軸に整合し、既存エントリ（区分・根拠に相当する説明文の様式）と同一形式である
    on_failure: |
      fix-and-reverify: 形式不整合箇所を修正し、再突合する
  - id: TS-003
    target_item: AG-003
    verification: |
      本件の変更差分を確認する。差分が verification-scope-catalog.md へのエントリ追加と経緯記録追記のみであり、検証対応宣言の新設（実装成果物・検証手段への対応宣言付与）、Decision の変更、段階ゲート契約の変更を含まないことを確認する
    pass_criteria: |
      変更ファイルは verification-scope-catalog.md のみで、恒久検証対応（OU-006 RA-006 専属領域）への侵入がない
    on_failure: |
      fix-and-reverify: 境界外の変更（宣言新設・契約変更）を取り消し、カタログ追加のみの差分へ修正して再確認する
  - id: TS-004
    target_item: AG-004
    verification: |
      #2812 の case-close 工程でトレーサビリティ段階ゲート（check.ts --req）を再実行し、ゲートが完了阻止条件で停止しないことを確認する（Issue / PR の状態操作は case-close 工程契約に従う）
    pass_criteria: |
      トレーサビリティ段階ゲートが停止せず通過し、#2812 マージ → #2806 クローズへ進行できる
    on_failure: |
      fix-and-reverify: 未分類行の有無を TS-001 の手順で再確認し、カタログ登録を修正して再実行する

# realization_actions: 実現面の変更方針（構造化ハンドオフ契約）
realization_actions:
  - id: RA-001
    concern: verification-scope-catalog への検証対応任意行 6 行登録と経緯記録追記
    responsibility: 検証対応要否カタログは最小トレーサビリティモデル（docs/designs/foundations/traceability-model.md「対応関係の完全性規則」）が所有する区分カタログであり、エントリ追加はカタログ「棚卸し方針と実施記録」の判定基準（恒続的な検証手段を特定できない行 = 実行時の品質ゲートやレビューで検証する構造規範）と「形式」節に従って実施する
    ownership_hints:
      - docs/designs/foundations/references/verification-scope-catalog.md（変更対象。target_area: 任意行エントリ）
      - docs/designs/foundations/traceability-model.md（対応関係の完全性規則。判定基準の正規所有。変更しない）
      - src/opencode/skills/agentdev-traceability/scripts/src/check.ts（検証手段。--req モード。本要件では変更しない）
    intent: Epic #2805 OU-001（#2806 / PR #2812）の case-close トレーサビリティ段階ゲート停止を解消し、Epic 全 Wave（OU-002〜OU-006）の先行依存を解除する。恒久検証対応（OU-006 RA-006 専属領域）への侵入は行わない
    verification_refs: [TS-001, TS-002, TS-003, TS-004]
    source_items: [AG-001, AG-002, AG-003, AG-004]

# review_dispositions: RU セクション単位の採否判断
review_dispositions:
  - id: RD-001
    source_ru: RU-0002
    source_item: Decided
    disposition: covered
    reason_code: applied_as_agreed_items
    reason: |
      RU の決定済み事項（6 行の任意行登録、恒久検証対応の昇格自由、既存区分準拠、ゲート通過後の進行許可）を AG-001〜AG-004 として全量反映した
    evidence:
      path: .agentdev/backlog/req-units/RU-0002.md
      section: Decided（決定済み事項）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0002
    source_item: Out of scope
    disposition: covered
    reason_code: recorded_as_boundary
    reason: |
      REQ 行本文・canonical REQ ファイル、段階ゲート契約（Decision 更新なし）、恒久検証対応実装の非変更境界を ACT-DESIGN-001 の content 境界記述と RA-001 の intent、TS-003 へ記録した
    evidence:
      path: .agentdev/backlog/req-units/RU-0002.md
      section: Out of scope
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0002
    source_item: Completion criteria
    disposition: covered
    reason_code: projected_to_test_strategy
    reason: |
      完了基準 3 項目（6 行のカタログ登録、check.ts --req での unclassified 0 件、既存エントリ形式整合）を TS-001、TS-002、TS-004 へ投影した
    evidence:
      path: .agentdev/backlog/req-units/RU-0002.md
      section: Completion criteria
      checked_at_commit: null
    related_removed_items: []

# case_open_hints: case-open 構成生成への参考情報
case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

単一 Design（検証対応要否カタログ）への定型的エントリ追加であり、壁打ち相当の判断はすべて RU-0002 の Decided（ユーザー承認済み 2026-09-14）として引き継いだ。STEP-8 adversarial-review は skip（Decision 判断対象なし・意味的決定なし・既存形式への定型的変更）。Decision は新規作成しない（カタログ既存判定基準の適用のみ）。
