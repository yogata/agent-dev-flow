---
draft_type: req_draft
topic_slug: docs-specs-restructure
status: draft
created_at: 2026-06-27T23:45:00+09:00
source_rus:
  - session:2026-06-27-docs-specs-restructure
---

<!-- req-define が生成した構造化引き継ぎ成果物。
  後続工程（spec-save / case-open / case-auto / case-run / case-close）が参照する
  原本は # draft-data 内の YAML コードブロック。soft contract（ADR-0124）。 -->

# draft-data

```yaml
# work_type: docs/specs/ の文書構造正規化でありコード・挙動変更なし
work_type: docs_chore

# scale は feature のみ設定。docs_chore では未設定

# summary: 当該 draft が合意した内容の1段落要約（人間可読補助）
summary: >
  docs/specs/ の6ドメイン体系化（REQ-0156）後の残存課題を正規化する。
  残存旧導線の修正、workflow-contracts.md の旧版互換索引化、
  local-transform.md の削除と local-generation.md への重複一元化、
  document-model.md と document-type-responsibilities.md の本文重複削減、
  design-principles.md の SPEC/ADR 境界整理（判断理由は既存ADR参照化）、
  patterns.md と authoring/ の責務境界明確化、
  req-impact-map.md の配置保留と rule-ownership.md との関係整理を行う。
  成果物は SPEC 更新中心（REQ/ADR 新規作成なし、REQ-0156 への APPEND なし）。

# auto_gate: case-auto 自走可否
auto_gate:
  # 全分岐（Q1/Q2/Q3/#2/#5）はユーザー合意済み。停止理由なし
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目
agreed_items:
  - id: AG-001
    content: >
      docs/specs/README.md の残存旧導線を現行6ドメイン構造へ修正する。
      3層構造表の「(直下) specs/*.md」行、基盤SPEC一覧見出し「specs/ 直下」、
      文書間関係図の「SPEC (specs/*.md)」表現を、基盤SPECが
      foundations/responsibilities/quality/integrity/local/authoring の6ドメイン配下にある
      現行構造へ合わせる。command / skill / workflow の3層構造と基盤6ドメイン構造を
      混同させない。DOC-MAP.md は status の重複管理を行わず探索導線に留める。
      実行根拠: REQ-0156-003。

  - id: AG-002
    content: >
      foundations/workflow-contracts.md を旧版互換索引として位置づける。
      本ファイルは通常の横断ワークフロー契約本体ではなく、旧セクションから
      docs/specs/workflows/ 配下への互換参照表とする。accepted status は維持し、
      削除・retired 化は行わない。正規の横断ワークフロー契約は workflows/ 配下を
      参照する旨を、workflow-contracts.md 自身の表題・注記、および
      docs/specs/README.md、docs/README.md、DOC-MAP.md の説明へ整合させる。
      実行根拠: REQ-0156-002。

  - id: AG-003
    content: >
      local-transform.md と local-generation.md の重複を解消し、local-transform.md は
      削除する（Q2=A 確定）。残存 GitHub 固有参照の違反判定基準と変換プロンプト
      廃止経緯（REQ-0141-028 で確定廃止）を local-generation.md へ一元化する。
      local-generation.md の統合完了後に local-transform.md を削除し、
      docs/specs/README.md、docs/README.md、DOC-MAP.md、関連参照を同時更新する。
      retired status は作成せず、削除と参照更新で処理する。
      実行根拠: REQ-0141-028、REQ-0141-029、ADR-0131。

  - id: AG-004
    content: >
      document-model.md と document-type-responsibilities.md の本文重複を削減する。
      文書種別の基準境界、REQ/ADR/SPEC/guides/DOC-MAP の役割定義、文書ライフサイクル、
      優先順位、参照規則、投影方向、SPEC 内部5論理区分、文書7分類、局所物理分離、
      docs/specs/ 直下の6ドメイン体系化規範は document-model.md 側に寄せる。
      執筆時の配置判定、実行主体分類、要件行の書き方、SKILL 構造、用語政策は
      document-type-responsibilities.md 側に寄せる。同一関心について両ファイルが別々の
      定義を持たないようにし、相互参照を更新する。新規ファイル分割は行わず、
      既存2ファイル間の重複削除を優先する（#2 確定）。
      実行根拠: REQ-0101-058。

  - id: AG-005
    content: >
      design-principles.md の SPEC/ADR 境界を整理する（Q3=A 確定、新規ADR不要）。
      現行仕様として機能する分類表、導出表（work_type / scale / workflow_route 等）、
      適用基準は SPEC に残す。判断理由、歴史的経緯、設計意図、トレードオフ説明は
      既存ADR（ADR-0103 文書種別責務境界 等）参照へ置換する。
      artifact-contracts.md との責任分界重複を削減し、artifact-contracts.md を詳細契約、
      design-principles.md を上位原則に限定する。特定エージェント名や過去体制の説明で
      現行仕様として不要なものは削除またはADR参照化する。既存ADRで覆えない内容は
      原則として新規ADR化せず、今回の範囲外として報告する。
      実行根拠: REQ-0101-043、REQ-0101-044、REQ-0101-050。

  - id: AG-006
    content: >
      patterns.md と authoring/ の責務境界を明確にする。patterns.md は共通文書モデル
      規約（frontmatter、ID体系、命名規則、URL参照形式、共通フォーマット規約）を扱う。
      authoring/ はファイル本文構造、見出し構成、Step表現、記述形式を扱い、維持を基本と
      する。command-file-format.md は command 定義ファイルの本文構造標準として
      authoring/ に残し、配置理由と authoring ドメインの将来拡張余地
      （REQ/SPEC/SKILL/guide 執筆規約の集約先）を明記する。patterns.md の本文構造・
      執筆規約寄り内容は authoring/ への移管候補として明示する（実移管は case-run で
      判断）。authoring/ の削除、command-file-format.md の即時統合は行わない。
      実行根拠: REQ-0156-002。

  - id: AG-007
    content: >
      req-impact-map.md の配置は保留し、rule-ownership.md との関係整理のみを行う
      （#5 確定）。req-impact-map.md の移動は本件では行わず responsibilities/ 残置を
      維持する。rule-ownership.md（ルールドメイン → canonical REQ/SPEC）と
      req-impact-map.md（REQ → 影響するルール/アーティファクト）の対応方向の違いを
      明確にし、両者の同期更新が必要なケースを説明する。移動判断は参照方向、利用頻度、
      更新責務を確認した後に別途行う旨を未確定事項として扱う。responsibilities/ の
      リネームは行わない。実行根拠: REQ-0101 系列（関係整理）。

  - id: AG-008
    content: >
      対象外事項が混入しないことを保証する。以下は行わない。
      responsibilities/ から boundaries/ 等へのリネーム、SPEC status 値への retired 等
      の追加、workflow-contracts.md の即時削除、design-principles.md 全体のADR移管、
      document-model.md の分割必須化、document-classification-policy.md 等の新規SPEC
      作成の必須化、req-impact-map.md の即時移動、authoring/ の削除、実装コード変更、
      src/opencode-local/ の構造変更、Issue 作成、PR 作成、既存 Issue/PR へのコメント、
      commit、push。

# artifact_actions: SPEC 更新中心（artifact: spec のみ、REQ/ADR 操作なし）
# content は合意された変更方向（要件レベル）。対象セクションの変更後全文編集は
# case-run / spec-save が実施する。target_area は代表見出しを記載。
artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/README.md
    target_area: "## 基盤 SPEC 一覧"
    source_items: [AG-001, AG-002, AG-003, AG-006, AG-007]
    content: |
      docs/specs/README.md を現行6ドメイン構造へ整合させる。
      (1) 3層構造表の「(直下) specs/*.md」行を、基盤SPECが6ドメイン配下にある
      ことを示す表現へ修正する（AG-001）。
      (2) 基盤SPEC一覧見出し「specs/ 直下」を6ドメイン配下構造へ修正する（AG-001）。
      (3) 文書間関係図の「SPEC (specs/*.md)」を command / skill / workflow と
      基盤6ドメインを混同しない現行構造へ修正する（AG-001）。
      (4) workflow-contracts.md を旧版互換索引として位置づける注記を追加する（AG-002）。
      (5) local 変換ファイルの位置づけを local-generation.md 中心へ更新し、
      local-transform.md の参照を削除する（AG-003）。
      (6) patterns.md と authoring/ の責務境界、authoring 将来拡張余地を一覧へ反映
      する（AG-006）。
      (7) req-impact-map.md と rule-ownership.md の対応方向を一覧/関係図へ反映する
      （AG-007）。
      DOC-MAP.md と重複する status 管理は行わず、探索導線に留める。

  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target: docs/README.md
    target_area: "## SPEC"
    source_items: [AG-002, AG-003]
    content: |
      docs/README.md の SPEC 説明を現行構造へ整合させる。
      (1) foundations/workflow-contracts.md を旧版互換索引（縮小済み参照ファイル）と
      して表現し、正規の横断ワークフロー契約は workflows/ 配下を参照する旨を明示
      する（AG-002）。
      (2) local-transform.md への参照を削除し、local-generation.md を local ドメインの
      正規参照へ位置づける（AG-003）。

  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-update
    target: docs/DOC-MAP.md
    target_area: "## SPEC"
    source_items: [AG-002, AG-003]
    content: |
      DOC-MAP.md の SPEC 導線説明を現行構造へ整合させる。
      (1) workflow-contracts.md を旧版互換索引として注記する（AG-002）。
      (2) local-transform.md への参照を削除し、local-generation.md へ読み替える（AG-003）。
      DOC-MAP.md は status の重複管理を行わず探索導線に留める。

  - id: ACT-SPEC-004
    artifact: spec
    operation: spec-update
    target: docs/specs/foundations/workflow-contracts.md
    target_area: "# workflow-contracts"
    source_items: [AG-002]
    content: |
      workflow-contracts.md 自身を旧版互換索引として位置づける。
      冒頭に、本ファイルが通常の横断ワークフロー契約本体ではなく、旧セクションから
      docs/specs/workflows/ 配下への互換参照表である旨を明記する。accepted status は
      維持する。正規の横断ワークフロー契約は docs/specs/workflows/ 配下を参照する旨を
      記載する。実質内容の workflows/ 配下への移管状態は維持し、本ファイルへ新規契約
      を追加しない。

  - id: ACT-SPEC-005
    artifact: spec
    operation: spec-update
    target: docs/specs/local/local-generation.md
    target_area: "# local-generation"
    source_items: [AG-003]
    content: |
      local-generation.md へ重複内容を一元化する。
      (1) 残存 GitHub 固有参照の違反判定基準を本ファイルに一元化する
      （REQ-0141-029、local-transform.md からの統合）。
      (2) 変換プロンプト廃止経緯（REQ-0141-028、ADR-0131）の参照を本ファイルに集約
      する。
      本統合の完了が local-transform.md 削除の前提である。削除自体は case-run の
      ファイル操作として扱い、docs/specs/README.md、docs/README.md、DOC-MAP.md の
      参照更新と同時に行う。

  - id: ACT-SPEC-006
    artifact: spec
    operation: spec-update
    target: docs/specs/foundations/document-model.md
    target_area: "# document-model"
    source_items: [AG-004, AG-006]
    content: |
      document-model.md を文書モデルの正規化先として整理する。
      文書種別の基準境界、REQ/ADR/SPEC/guides/DOC-MAP の役割定義、文書ライフサイクル、
      優先順位、参照規則、投影方向、SPEC 内部5論理区分、文書7分類、局所物理分離、
      6ドメイン体系化規範を本ファイルに寄せる（AG-004）。執筆時の配置判定、実行主体
      分類、要件行の書き方、SKILL 構造、用語政策は document-type-responsibilities.md
      側へ移動または参照化し、本文重複を削減する。新規ファイル分割は行わない。
      併せて patterns.md が扱う共通文書モデル規約との境界を明確にする（AG-006）。

  - id: ACT-SPEC-007
    artifact: spec
    operation: spec-update
    target: docs/specs/responsibilities/document-type-responsibilities.md
    target_area: "# document-type-responsibilities"
    source_items: [AG-004]
    content: |
      document-type-responsibilities.md を執筆時判定の正規化先として整理する。
      文書種別配置の執筆時判定基準、実行主体分類、要件行の書き方、SKILL 構造、
      用語政策を本ファイルに寄せる（AG-004）。文書種別の基準境界、文書ライフサイクル、
      優先順位、参照規則等は document-model.md 側の正本を参照する形へ整理し、本文
      重複を削減する。相互参照を更新する。

  - id: ACT-SPEC-008
    artifact: spec
    operation: spec-update
    target: docs/specs/foundations/design-principles.md
    target_area: "# design-principles"
    source_items: [AG-005]
    content: |
      design-principles.md の SPEC/ADR 境界を整理する。
      (1) 現行仕様として機能する分類表、導出表（work_type / scale / workflow_route
      等）、適用基準は SPEC に残す。
      (2) 判断理由、歴史的経緯、設計意図、トレードオフ説明は既存ADR
      （ADR-0103 等）参照へ置換する。新規ADRは作成しない。
      (3) artifact-contracts.md との責任分界重複を削減し、artifact-contracts.md を
      詳細契約、本ファイルを上位原則に限定する。
      (4) 特定エージェント名や過去体制の説明で現行仕様として不要なものは削除または
      ADR参照化する。
      (5) 既存ADRで覆えない判断内容は新規ADR化せず、範囲外として報告する。

  - id: ACT-SPEC-009
    artifact: spec
    operation: spec-update
    target: docs/specs/foundations/patterns.md
    target_area: "# patterns"
    source_items: [AG-006]
    content: |
      patterns.md を共通文書モデル規約の正規化先として整理する。
      frontmatter、ID体系、命名規則、URL参照形式、共通フォーマット規約を本ファイル
      で扱う（AG-006）。本文構造、見出し構成、Step表現、記述形式等の執筆規約寄り
      内容は authoring/ への移管候補として明示する（実移管は case-run で判断）。

  - id: ACT-SPEC-010
    artifact: spec
    operation: spec-update
    target: docs/specs/authoring/command-file-format.md
    target_area: "# command-file-format"
    source_items: [AG-006]
    content: |
      command-file-format.md を command 定義ファイル本文構造標準として整理する。
      本ファイルが authoring/ ドメインに配置される理由と、authoring/ ドメインの将来
      拡張余地（REQ/SPEC/SKILL/guide 執筆規約の集約先）を明記する（AG-006）。
      即時統合・authoring/ の削除は行わない。

  - id: ACT-SPEC-011
    artifact: spec
    operation: spec-update
    target: docs/specs/responsibilities/req-impact-map.md
    target_area: "# req-impact-map"
    source_items: [AG-007]
    content: |
      req-impact-map.md の配置は保留したまま関係整理を行う。
      本ファイルが REQ → 影響するルール/アーティファクト の対応表であることを明示
      し、rule-ownership.md（ルールドメイン → canonical REQ/SPEC）との対応方向の違い
      を記載する（AG-007）。両者の同期更新が必要なケースを説明する。移動は別途判断と
      する旨を記載する。responsibilities/ 残置を維持する。

  - id: ACT-SPEC-012
    artifact: spec
    operation: spec-update
    target: docs/specs/integrity/rule-ownership.md
    target_area: "# rule-ownership"
    source_items: [AG-007]
    content: |
      rule-ownership.md と req-impact-map.md の関係を明記する。
      本ファイルがルールドメイン → canonical REQ/SPEC の対応表であることを明示し、
      req-impact-map.md（REQ → 影響するルール/アーティファクト）との対応方向の違い
      および同期更新ケースを記載する（AG-007）。

# conflict_resolutions: 壁打ちで解消された分岐
conflict_resolutions:
  - id: CR-001
    conflict: >
      成果物構成の分岐。REQ-0156 への APPEND、新規REQ作成、SPEC 更新中心の3候補。
    resolution: >
      Q1=A（SPEC 更新中心・REQ最小）を採用。本次は既存REQ（REQ-0156-002/003、
      REQ-0101-043/044/050/058、REQ-0141-028/029）の実行に収まる。REQ-0156 への
      APPEND は分類体系REQへ清掃作業が混入し肥大化を招くため行わない。新規REQ作成は
      新規利用者価値ではないため行わない。artifact_actions は artifact: spec のみ。

  - id: CR-002
    conflict: >
      local-transform.md（draft）のの扱い。削除統合か縮小残留か。
    resolution: >
      Q2=A（削除して統合）を採用。残存 GitHub 固有参照の違反判定基準と変換プロンプト
      廃止経緯を local-generation.md へ一元化した上で local-transform.md を削除する。
      retired status は作成せず、削除と参照更新で処理する。ADR-0131 を判断根拠参照と
      して使う。draft stub の履歴残留は一覧・導線・status管理のノイズになるため避ける。

  - id: CR-003
    conflict: >
      design-principles.md の SPEC/ADR 境界。判断理由の扱いと新規ADR要否。
    resolution: >
      Q3=A（新規ADR不要）を採用。判断理由・歴史的経緯・設計意図は既存ADR
      （ADR-0103 等）参照へ置換する。現行仕様として使う分類表・導出表・適用基準は
      SPEC に残す。既存ADRで覆えない内容は新規ADR化せず範囲外として報告する。
      oracle 相談は行わない。

  - id: CR-004
    conflict: >
      document-model.md の再正規化手段。本文編集か新規ファイル分割か。
    resolution: >
      #2 確定。新規ファイル分割を前提とせず、既存2ファイル（document-model.md と
      document-type-responsibilities.md）間の重複削除を優先する。

  - id: CR-005
    conflict: >
      req-impact-map.md の最終配置。現状維持か移動か。
    resolution: >
      #5 確定。移動は保留し、rule-ownership.md との関係整理のみを行う。移動判断は
      参照方向・利用頻度・更新責務確認後に別途行う。

# operation_units: 1 OU = 1 SPEC ファイル操作。target_spec は対象 SPEC パス。
# depends_on は必須依存（界面契約・データモデル・公開API・検証不能な前提）のみ。
# 文書相互参照は弱依存のため depends_on には含めず、recommended_order で順序を示す。
# Issue 構成（single/epic）の最終決定は case-open の責務（G13）。
operation_units:
  - ou_id: OU-001
    source_ru: session:2026-06-27-docs-specs-restructure
    target_spec: docs/specs/foundations/workflow-contracts.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-002
    source_ru: session:2026-06-27-docs-specs-restructure
    target_spec: docs/specs/local/local-generation.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}

  - ou_id: OU-003
    source_ru: session:2026-06-27-docs-specs-restructure
    target_spec: docs/specs/README.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}

  - ou_id: OU-004
    source_ru: session:2026-06-27-docs-specs-restructure
    target_spec: docs/README.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result: {}

  - ou_id: OU-005
    source_ru: session:2026-06-27-docs-specs-restructure
    target_spec: docs/DOC-MAP.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
    result: {}

  - ou_id: OU-006
    source_ru: session:2026-06-27-docs-specs-restructure
    target_spec: docs/specs/foundations/document-model.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 6
    issue_policy: single
    result: {}

  - ou_id: OU-007
    source_ru: session:2026-06-27-docs-specs-restructure
    target_spec: docs/specs/responsibilities/document-type-responsibilities.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 7
    issue_policy: single
    result: {}

  - ou_id: OU-008
    source_ru: session:2026-06-27-docs-specs-restructure
    target_spec: docs/specs/foundations/design-principles.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 8
    issue_policy: single
    result: {}

  - ou_id: OU-009
    source_ru: session:2026-06-27-docs-specs-restructure
    target_spec: docs/specs/foundations/patterns.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 9
    issue_policy: single
    result: {}

  - ou_id: OU-010
    source_ru: session:2026-06-27-docs-specs-restructure
    target_spec: docs/specs/authoring/command-file-format.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 10
    issue_policy: single
    result: {}

  - ou_id: OU-011
    source_ru: session:2026-06-27-docs-specs-restructure
    target_spec: docs/specs/responsibilities/req-impact-map.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 11
    issue_policy: single
    result: {}

  - ou_id: OU-012
    source_ru: session:2026-06-27-docs-specs-restructure
    target_spec: docs/specs/integrity/rule-ownership.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 12
    issue_policy: single
    result: {}

# test_strategy: 各合意項目の検証方法。3要素（verification / pass_criteria / on_failure）必須。
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs/specs/README.md を読み、「specs/*.md」「specs/ 直下」が基盤SPEC直下配置を
      意味する旧説明として残留していないか確認する。3層構造表、基盤SPEC一覧見出し、
      文書間関係図の3箇所を検査する。基盤SPECが6ドメイン配下であることが明示されて
      いるか確認する。
    pass_criteria: |
      旧「specs/*.md」「specs/ 直下」表現が基盤SPEC直下を意味する形で残留しておらず、
      6ドメイン（foundations/responsibilities/quality/integrity/local/authoring）配下
      構造が明示されている。command/skill/workflow の3層と基盤6ドメインが混同されて
      いない。
    on_failure: |
      fix-and-reverify。修正可能な文書不整合のため実装を修正して再検証する。

  - id: TS-002
    target_item: AG-002
    verification: |
      docs/specs/foundations/workflow-contracts.md、docs/specs/README.md、docs/README.md、
      DOC-MAP.md の4ファイルを読み、workflow-contracts.md が旧版互換索引として位置
      づけられているか確認する。正規の横断ワークフロー契約が docs/specs/workflows/
      配下であることが明示されているか確認する。
    pass_criteria: |
      workflow-contracts.md が旧版互換索引（縮小済み参照ファイル）として表現されて
      おり、正規契約が workflows/ 配下であることが4ファイル全てで矛盾なく明示されて
      いる。accepted status は維持されている。
    on_failure: |
      fix-and-reverify。位置づけ表記の不整合のため実装を修正して再検証する。

  - id: TS-003
    target_item: AG-003
    verification: |
      docs/specs/local/local-generation.md を読み、残存 GitHub 固有参照の違反判定基準
      と変換プロンプト廃止経緯が一元化されているか確認する。local-transform.md が
      削除されているか確認する。docs/specs/README.md、docs/README.md、DOC-MAP.md に
      local-transform.md への参照が残っていないか確認する。
    pass_criteria: |
      違反判定基準と廃止経緯が local-generation.md に一元化されている。
      local-transform.md は削除されている。3ファイルに local-transform.md への参照が
      残っていない。retired status は追加されていない。
    on_failure: |
      fix-and-reverify。重複残留・参照漏れのため実装を修正して再検証する。

  - id: TS-004
    target_item: AG-004
    verification: |
      document-model.md と document-type-responsibilities.md を読み、文書種別の基準
      境界・ライフサイクル・優先順位・参照規則・投影方向・SPEC内部5論理区分・文書7分類・
      6ドメイン体系化規範が document-model.md 側に寄せられているか確認する。
      執筆時配置判定・実行主体分類・要件行の書き方・SKILL構造・用語政策が
      document-type-responsibilities.md 側に寄せられているか確認する。同一関心について
      両ファイルが別々の定義を持っていないか確認する。
    pass_criteria: |
      基準境界系が document-model.md に、執筆判定系が document-type-responsibilities.md
      に寄せられている。同一関心の重複定義が解消されている。相互参照が更新されている。
      新規ファイルは作成されていない。
    on_failure: |
      fix-and-reverify。重複削減不十分のため実装を修正して再検証する。

  - id: TS-005
    target_item: AG-005
    verification: |
      design-principles.md を読み、現行仕様として使う分類表・導出表・適用基準が SPEC に
      残っているか確認する。判断理由・歴史的経緯・設計意図が既存ADR参照へ置換されて
      いるか確認する。artifact-contracts.md との責任分界重複が削減されているか確認
      する。特定エージェント名や過去体制の不要な説明が削除またはADR参照化されているか
      確認する。
    pass_criteria: |
      現行仕様表が SPEC に残っている。判断理由系が既存ADR参照化されている。
      artifact-contracts.md との重複が削減されている。新規ADRは作成されていない。
    on_failure: |
      fix-and-reverify。境界整理不十分のため実装を修正して再検証する。

  - id: TS-006
    target_item: AG-006
    verification: |
      patterns.md と authoring/command-file-format.md を読み、patterns.md が共通文書
      モデル規約を扱い、authoring/ が本文構造・見出し構成・Step表現・記述形式を扱って
      いるか確認する。command-file-format.md の配置理由と authoring 将来拡張余地が明記
      されているか確認する。
    pass_criteria: |
      patterns.md が共通規約、authoring/ が本文構造を扱う境界が明確である。
      command-file-format.md の配置理由と将来拡張余地が明記されている。
      authoring/ の削除・即時統合は行われていない。
    on_failure: |
      fix-and-reverify。境界明確化不十分のため実装を修正して再検証する。

  - id: TS-007
    target_item: AG-007
    verification: |
      req-impact-map.md と rule-ownership.md を読み、両者の対応方向の違いが明確に
      されているか確認する。同期更新が必要なケースが説明されているか確認する。
      req-impact-map.md の配置移動が未確定事項として扱われているか確認する。
    pass_criteria: |
      対応方向の違いが明確である。同期更新ケースが説明されている。req-impact-map.md
      の移動は未確定事項として扱われ、勝手に確定されていない。responsibilities/ 残置が
      維持されている。
    on_failure: |
      fix-and-reverify。関係整理不十分のため実装を修正して再検証する。

  - id: TS-008
    target_item: AG-008
    verification: |
      変更差分全体を確認し、対象外事項が混入していないか検査する。
      responsibilities/ リネーム、SPEC status 値追加（retired 等）、workflow-contracts.md
      削除、design-principles.md 全体ADR移管、document-model.md 分割必須化、新規SPEC
      作成、req-impact-map.md 移動、authoring/ 削除、実装コード変更、
      src/opencode-local/ 構造変更、Issue/PR 作成、commit/push が行われていないか
      確認する。
    pass_criteria: |
      対象外事項のいずれも実施されていない。変更は docs/specs/ 配下の文書正規化と
      参照更新のみに留まる。
    on_failure: |
      record-in-findings。対象外事項の混入はスコープ違反であり、Findings に
      out-of-scope として記録した上で、該当変更を戻すかスコープ再協議を行う。

# case_open_hints: case-open 構成生成への参考情報
case_open_hints:
  epic_needed: false
  decomposition: >
    12 SPEC 操作を推奨順序で4フェーズへ整理できる。
    Phase A（旧導線・stub整理）: OU-001 workflow-contracts、OU-002 local-generation、
    OU-003 specs/README、OU-004 docs/README、OU-005 DOC-MAP。
    Phase B（文書モデル責務）: OU-006 document-model、OU-007 document-type-responsibilities。
    Phase C（設計原則）: OU-008 design-principles。
    Phase D（authoring境界・影響マップ）: OU-009 patterns、OU-010 command-file-format、
    OU-011 req-impact-map、OU-012 rule-ownership。
  wave_hints:
    - >
      local-transform.md 削除は OU-002（local-generation.md 統合）の完了後に行う。
      参照更新（OU-003/004/005）は構造決定（Phase A 前半）後に整合させる。
    - >
      specs/README.md（OU-003）は全フェーズの構造決定を反映する導線ファイルのため、
      推奨順序では Phase A 末尾に配置したが、Phase D 完了後の最終整合で再確認すると
      安全である。
```

# summary

本 draft は `docs/specs/` の6ドメイン体系化（REQ-0156）後に残存する構造課題の正規化を合意したものである。成果物は SPEC 更新中心（`artifact: spec` のみ、REQ/ADR 新規作成なし、REQ-0156 への APPEND なし）。

主な合意内容:

- **残存旧導線修正**（AG-001）: `docs/specs/README.md` の `specs/*.md` / `specs/ 直下` 表現を6ドメイン配下構造へ修正。
- **workflow-contracts.md の旧版互換索引化**（AG-002）: 本ファイルを互換参照表として位置づけ、正規契約は `workflows/` 配下と明示。
- **local-transform.md 削除と重複一元化**（AG-003、Q2=A 確定）: 違反判定基準・廃止経緯を `local-generation.md` へ統合し、`local-transform.md` を削除。
- **document-model.md / document-type-responsibilities.md 本文重複削減**（AG-004）: 基準境界系と執筆判定系を分離。新規ファイル分割なし。
- **design-principles.md の SPEC/ADR 境界整理**（AG-005、Q3=A 確定）: 判断理由を既存ADR参照化、現行仕様表は SPEC に残置。新規ADR不要。
- **patterns.md / authoring/ 境界明確化**（AG-006）: 共通規約と本文構造の責務分離、authoring 将来拡張余地の明記。
- **req-impact-map.md 配置保留と関係整理**（AG-007）: `rule-ownership.md` との対応方向・同期ケースの明記。移動は別途判断。
- **対象外事項の不混入**（AG-008）: リネーム、retired 追加、コード変更、Issue/PR 作成等を行わない。

実行根拠となる既存REQ: REQ-0156-002/003、REQ-0101-043/044/050/058、REQ-0141-028/029。判断根拠 ADR: ADR-0103、ADR-0131。work_type は `docs_chore`（文書構造正規化、コード・挙動変更なし）。12 の SPEC 操作（OU-001〜OU-012）を4フェーズで推奨順序付けした。全分岐（Q1/Q2/Q3/#2/#5）はユーザー合意済みで `auto_ready: true`。
