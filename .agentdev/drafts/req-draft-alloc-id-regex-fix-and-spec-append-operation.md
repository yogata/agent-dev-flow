---
draft_type: req_draft
topic_slug: alloc-id-regex-fix-and-spec-append-operation
status: saved
created_at: 2026-07-27T00:00:00+09:00
source_rus:
  - RU-0008
  - RU-0011
agentdev_handoff: true
spec_actions_consumed: true
---

<!-- 本ドラフトは AgentDevFlow 本体の不具合・改善点を扱う前工程引き継ぎドラフトである（agentdev_handoff: true）。 -->
<!-- 2 RU（RU-0008: alloc-composite-id.ts 正規表現バグ、RU-0011: spec-append operation + search-target-area.ts 契約修正）を含む。
     両 RU は独立関心だが「実装契約不整合の解消」という共通性でグループDとして1ドラフトにまとめた。 -->

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  RU-0008（alloc-composite-id.ts の正規表現バグ）と RU-0011（spec-append 第一級 operation 化 +
  search-target-area.ts 正規契約不整合修正）を処理する。
  RU-0008 は agentdev-req-file-manager の採番スクリプトが3桁 REQ 形式を認識しないバグの修正。
  RU-0011 は未検出時 APPEND fallback の非公式運用を廃止し、明示的な spec-append operation を第一級化する。
  併せて search-target-area.ts が正規契約（見出し行全体完全一致）と不一致（見出し本文抽出+前方一致）
  の問題を修正する。deep-review 5レーン検証で確定した設計判断3を全面的に反映。
  新規 ADR 不要（command 動作仕様/契約拡張は ADR 作成不可対象）、agentdev-architecture-advisory 助言実施済み。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      RU-0008: src/opencode/skills/agentdev-req-file-manager/scripts/src/alloc-composite-id.ts の
      extractAllCompositeIds 関数の正規表現を /REQ-(\d{4})-(\d{3})/ から /REQ-(\d{3,4})-(\d{3})/ へ変更する。
      これにより3桁 REQ 形式（REQ-001-NNN 等）と4桁 REQ 形式（REQ-0011-NNN 等）の両方を一貫して認識する。
      現状 extractCompositeIdNumbers は \d{3,4} を許容している一方で extractAllCompositeIds は \d{4} 固定であり、
      関数間で形式契約が不一致している根本原因を解消する。
  - id: AG-002
    content: |
      RU-0008: 3桁/4桁両形式での採番検証テストを追加する。
      extractAllCompositeIds と extractCompositeIdNumbers の両関数について、3桁 REQ 群（REQ-001, REQ-003, REQ-006, REQ-008, REQ-010 等）
      と4桁 REQ 群（REQ-0011 等）が混在する入力で正しく max を返すことを検証する。
  - id: AG-003
    content: |
      RU-0008: docs/specs/skills/agentdev-req-file-manager.md の実装詳細セクションへ、
      「REQ-ID 形式契約の一律性（3桁/4桁両形式を一貫して認識すること）」を明記する。
      関数間で正規表現形式契約が不一致しないことを SPEC 上の制約とする。
  - id: AG-004
    content: |
      RU-0011: SPEC operation を spec-create / spec-append / spec-update の3値へ拡張する。
      - spec-create: 新規 SPEC ファイルを作成
      - spec-append: 既存 SPEC へ新規セクションを追加
      - spec-update: 既存セクションを置換
      未検出時 APPEND fallback（選択肢B）は不採用（誤更新リスクのため）。
      公式 operation enum は create/update のみ。spec-create/spec-update/spec-append は各 SPEC の非正規 alias。
      producer（req-define）/ schema（artifact-contracts.md）/ consumer（spec-save）を同期更新し、
      既存 create/update は consumer が後方互換として受理する。
  - id: AG-005
    content: |
      RU-0011: spec-append の契約を以下の通り定義する。
      - content は新規見出し行から始まる（例: `### IR-044`）
      - 同名見出しが既に存在する場合は追加をスキップし、follow-up 報告を行う
      - 挿入位置制御: placement（tail / after_anchor / before_anchor、既定 tail）+ anchor（tail 以外は必須、見出し行全体で指定）
      - anchor 未検出時: action をスキップし、follow-up 報告を行う（spec-update と同一挙動）
      - 合格基準: 追加後の SPEC ファイルに target_area と完全一致する見出しが1つだけ存在すること
      - 「適切な位置を推論する」という曖昧な処理は不採用。明示的な placement/anchor 指定のみ受け付ける
  - id: AG-006
    content: |
      RU-0011: search-target-area.ts を見出し行全体との完全一致へ修正する。
      現状の実装は見出し行から `### ` 等のプレフィックスを除いた見出し本文のみを抽出し、
      さらに完全一致だけでなく前方一致も許容している。これにより正規入力 `### IR-044` が `IR-044` と一致せず、
      存在する見出しを未検出としてスキップする可能性がある。
      修正後は req-define/spec-save の正規契約（見出し行全体との完全一致）へ一致させる。
      前方一致を廃止し、正規入力（例: `### IR-044`）での回帰テストを追加する。
  - id: AG-007
    content: |
      RU-0011: REQ 正規所有関係を以下の通り整理する。
      - 構造化ハンドオフ要件（artifact_actions 構造、target_area、セクション全文）は REQ-008
      - 実行プロセス（要件形成、spec-save プロセス）は REQ-004
      - operation enum 詳細（spec-create/spec-append/spec-update の各意味、入力フィールド）は SPEC
      req-define で REQ-008/REQ-004 への要件行追加要否を判定する。
      spec-append 追加が「フィールド詳細の追加」に留まる場合は artifact-contracts.md、req-define、spec-save、
      agentdev-spec-file-manager の SPEC 契約のみ更新し、REQ-008/REQ-004 の要件行追加は不要とする。
      要件レベルで APPEND と UPDATE の区別を外部契約として保証する場合は REQ-008-032 の更新または REQ-008 への要件行追加を行う。
  - id: AG-008
    content: |
      RU-0011: 新規 ADR は不要。command 動作仕様/契約拡張は ADR 作成不可対象（agentdev-adr-guidelines）。
      ただし agentdev-architecture-advisory 助言は実施済み（deep-review 5レーン検証で設計判断3として確定）。
      想定結果は ADR unnecessary。

artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-req-file-manager
    target_area: "## 実装詳細"
    source_items: [AG-001, AG-002, AG-003]
    spec_logical_division: implementation_detail
    canonical_owner: agentdev-req-file-manager
    content: |
      ## 実装詳細

      （現行セクションへ以下を追記）

      ### REQ-ID 形式契約の一律性

      alloc-composite-id.ts が提供する全関数（extractAllCompositeIds, extractCompositeIdNumbers 等）は、
      REQ-ID 形式として3桁（REQ-001-NNN）と4桁（REQ-0011-NNN）の両方を一貫して認識すること。
      関数間で正規表現形式契約が不一致しないこと。

      採番検証テストは3桁 REQ 群（REQ-001, REQ-003, REQ-006, REQ-008, REQ-010）と
      4桁 REQ 群（REQ-0011）が混在する入力で正しく max を返すことを検証すること。
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-008.md
    source_items: [AG-004, AG-005, AG-007]
    content: |
      REQ-008 の構造化ハンドオフ要件（artifact_actions 構造）へ spec-append operation を追加するかどうかを
      req-save 実行時に判定する。要件レベルで APPEND と UPDATE の区別を外部契約として保証する場合は
      REQ-008-032（SPEC update 時の対象見出し）の更新または新規要件行の追加を行う。
      フィールド詳細の追加に留まる場合は REQ-008 の要件行追加は行わず、SPEC のみ更新する。
      詳細要件行は req-save 実行時に REQ-008 の既存要件群との整合を確認して配置する。
  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: responsibilities
      slug: artifact-contracts
    target_area: "## artifact_actions operation"
    source_items: [AG-004, AG-005]
    spec_logical_division: cross_cutting_contract
    canonical_owner: artifact-contracts
    content: |
      ## artifact_actions operation

      （現行の operation enum 定義へ以下を追記）

      SPEC operation は create/update の2値を公式 enum とする。
      各 SPEC（req-define/spec-save）は非正規 alias として spec-create/spec-update/spec-append を受け付けることができる。
      consumer（spec-save）は create/update/spec-create/spec-update/spec-append の全てを受理する（後方互換）。

      ### spec-append operation

      - 意味: 既存 SPEC ファイルへ新規セクションを追加する
      - 入力フィールド:
        - target: 既存 SPEC パス（必須）
        - target_area: 新規セクション見出し行（必須、見出し行全体形式、例: `### IR-044`）
        - content: 新規セクション全文（必須、見出し行から始まる）
        - placement: tail（既定）/ after_anchor / before_anchor
        - anchor: placement が tail 以外の場合は必須。見出し行全体で指定
      - 挙動:
        - 同名見出し（target_area と完全一致）が既存の場合は追加スキップ + follow-up 報告
        - placement が tail 以外で anchor が未検出の場合は action スキップ + follow-up 報告
        - 合格基準: 追加後の SPEC ファイルに target_area と完全一致する見出しが1つだけ存在すること
  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: commands
      slug: req-define
    target_area: "## artifact_actions 生成"
    source_items: [AG-004, AG-005]
    spec_logical_division: behavior
    canonical_owner: req-define
    content: |
      ## artifact_actions 生成

      （現行セクションへ以下を追記）

      req-define は新規セクション追加を operation: spec-append として出力する。
      - target: 既存 SPEC パス
      - target_area: 新規セクション見出し
      - content: 新規セクション全文（見出し行から始まる）
      - placement: tail（既定）/ after_anchor / before_anchor（必要時）
      - anchor: placement が tail 以外の場合は必須（必要時）

      これにより意図的な新規セクション追加と target_area の誤字・古い見出し名・参照先間違いを機械的に区別できる。
  - id: ACT-SPEC-004
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: commands
      slug: spec-save
    target_area: "## target_area ベースのセクション置換ロジック"
    source_items: [AG-004, AG-005, AG-006]
    spec_logical_division: behavior
    canonical_owner: spec-save
    content: |
      ## target_area ベースのセクション置換ロジック

      （現行セクションへ以下を追記）

      ### spec-append operation の処理

      operation: spec-append の場合:
      - target_area と完全一致する見出し行が既存する場合は追加スキップ + follow-up 報告（全体中止しない）
      - placement: tail（既定）の場合は SPEC ファイル末尾へ新規セクションを追加
      - placement: after_anchor / before_anchor の場合は anchor で指定された見出し行の前後へ追加。
        anchor が未検出の場合は action スキップ + follow-up 報告
      - 合格基準: 追加後の SPEC ファイルに target_area と完全一致する見出しが1つだけ存在すること

      ### search-target-area.ts 契約

      search-target-area.ts は見出し行全体との完全一致のみを受け付ける。
      前方一致や見出し本文のみの抽出は行わない。
      正規入力（例: `### IR-044`）での回帰テストを維持する。
  - id: ACT-SPEC-005
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-spec-file-manager
    target_area: "## 提供操作"
    source_items: [AG-004, AG-005, AG-006]
    spec_logical_division: behavior
    canonical_owner: agentdev-spec-file-manager
    content: |
      ## 提供操作

      （現行の CREATE/APPEND/UPDATE に加えて、APPEND 操作の契約を以下の通り明確化）

      ### APPEND 操作（spec-append）

      - content は新規見出し行から始まる
      - 同名見出し（target_area と完全一致）が既存の場合は追加スキップ + follow-up 報告
      - placement: tail（既定）/ after_anchor / before_anchor
      - anchor: placement が tail 以外の場合は必須、見出し行全体で指定
      - anchor 未検出時: action スキップ + follow-up 報告
      - 合格基準: 追加後の SPEC ファイルに target_area と完全一致する見出しが1つだけ存在すること

      ### search-target-area.ts 契約

      search-target-area.ts は見出し行全体との完全一致のみを受け付ける（前方一致廃止）。
      正規入力（例: `### IR-044`）で回帰テストを維持する。

conflict_resolutions:
  - id: CR-001
    conflict: RU-0011 選択肢B（spec-save 側で未検出時 APPEND fallback 公式化） vs 選択肢A（req-define 新規 operation）
    resolution: |
      選択肢A（spec-append 第一級 operation）を採用。選択肢Bは誤更新リスク（target_area 誤字・古い見出し名・参照先間違いが
      APPEND されてしまう）のため不採用。deep-review 5レーン検証（レーン4 履歴・追跡性 HTR-005/08）で確認済み。
  - id: CR-002
    conflict: spec-append の挿入基準（末尾追加のみ vs 任意位置指定）
    resolution: |
      任意位置指定を許容するが、placement（tail/after_anchor/before_anchor）+ anchor の明示的指定のみ受け付ける。
      「適切な位置を推論する」という曖昧な処理は不採用。deep-review 5レーン検証（レーン5 証拠・検証可能性 EV-09）で確認済み。
  - id: CR-003
    conflict: search-target-area.ts 修正を RU-0011 スコープに含めるか
    resolution: |
      RU-0011 スコープに含めて同時修正。spec-append の前提として決定的検索契約が必要なため。
      ユーザー合意済み。
  - id: CR-004
    conflict: RU-0011 REQ 正規所有先（review agent は「不明」、deep-review は「REQ-008/REQ-004/SPEC」）
    resolution: |
      構造化ハンドオフ要件は REQ-008、実行プロセスは REQ-004、operation enum 詳細は SPEC。
      req-define で REQ-008/REQ-004 への要件行追加要否を判定する。deep-review 5レーン検証（レーン3 統制・ガバナンス CG-09、
      レーン5 証拠・検証可能性 EV-07）で確認済み。
  - id: CR-005
    conflict: ADR 要否
    resolution: |
      新規 ADR 不要。command 動作仕様/契約拡張は ADR 作成不可対象。
      agentdev-architecture-advisory 助言は実施済み（想定結果: ADR unnecessary）。
      deep-review 5レーン検証（レーン3 統制・ガバナンス）で確認済み。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0008
    target_spec: docs/specs/skills/agentdev-req-file-manager.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0011
    target_req: REQ-008
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0011
    target_spec: docs/specs/responsibilities/artifact-contracts.md
    operation: spec-update
    scale: standard
    depends_on: [OU-002]
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-0011
    target_spec: docs/specs/commands/req-define.md
    operation: spec-update
    scale: standard
    depends_on: [OU-002, OU-003]
    recommended_order: 4
    issue_policy: single
    result: {}
  - ou_id: OU-005
    source_ru: RU-0011
    target_spec: docs/specs/commands/spec-save.md
    operation: spec-update
    scale: standard
    depends_on: [OU-002, OU-003]
    recommended_order: 5
    issue_policy: single
    result: {}
  - ou_id: OU-006
    source_ru: RU-0011
    target_spec: docs/specs/skills/agentdev-spec-file-manager.md
    operation: spec-update
    scale: standard
    depends_on: [OU-002, OU-003]
    recommended_order: 6
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      src/opencode/skills/agentdev-req-file-manager/scripts/src/alloc-composite-id.ts の
      extractAllCompositeIds 関数の正規表現が /REQ-(\d{3,4})-(\d{3})/ に変更されていることを確認する。
    pass_criteria: |
      正規表現が 3桁/4桁両方を許容し、3桁 REQ（REQ-001-NNN 等）を正しく認識すること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-002
    target_item: AG-002
    verification: |
      採番検証テストを実行する。
      3桁 REQ 群（REQ-001, REQ-003, REQ-006, REQ-008, REQ-010）と4桁 REQ 群（REQ-0011）が混在する入力で、
      extractAllCompositeIds と extractCompositeIdNumbers の両関数が正しく max を返すことを検証する。
    pass_criteria: |
      全テストケースが PASS すること。3桁/4桁混在でも正しい max と ID リストが返されること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-003
    target_item: AG-003
    verification: |
      docs/specs/skills/agentdev-req-file-manager.md の実装詳細セクションに
      「REQ-ID 形式契約の一律性」が明記されていることを確認する。
    pass_criteria: |
      同セクションに 3桁/4桁両形式の一貫認識と関数間形式契約不一致禁止が記載されていること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-004
    target_item: AG-004
    verification: |
      artifact-contracts.md で SPEC operation が create/update の公式 enum と明記され、
      各 SPEC が非正規 alias（spec-create/spec-update/spec-append）を受け付けることが記載されていることを確認する。
      req-define.md, spec-save.md, agentdev-spec-file-manager.md で spec-append が処理対象として記載されていることを確認する。
      既存 create/update が consumer で後方互換として受理されることが記載されていることを確認する。
    pass_criteria: |
      全4 SPEC（artifact-contracts/req-define/spec-save/agentdev-spec-file-manager）で spec-append が記載され、
      create/update の後方互換が明記されていること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-005
    target_item: AG-005
    verification: |
      spec-append の契約（placement/anchor/同名見出し/anchor 未検出時/合格基準）が
      artifact-contracts.md, spec-save.md, agentdev-spec-file-manager.md で一貫して記載されていることを確認する。
      decision test: 刻意的な spec-append action を流し込み、意図通りの位置に見出しが1つだけ追加されることを検証する。
    pass_criteria: |
      3 SPEC で契約が完全一致し、decision test で target_area と完全一致する見出しが1つだけ存在すること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-006
    target_item: AG-006
    verification: |
      src/opencode/skills/agentdev-spec-file-manager/scripts/src/search-target-area.ts が
      見出し行全体との完全一致のみを受け付ける実装になっていることを確認する。
      正規入力 `### IR-044` で回帰テストを実行する。
    pass_criteria: |
      前方一致や見出し本文のみの抽出が廃止され、見出し行全体との完全一致のみが受け付けられること。
      回帰テストが全て PASS すること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-007
    target_item: AG-007
    verification: |
      REQ-008/REQ-004 の要件行が正しく更新されているか（または更新不要と判定されたか）を確認する。
      req-save 実行時に要件行追加要否が判定され、結果が記録されていることを確認する。
    pass_criteria: |
      REQ-008/REQ-004 の更新要否判定が記録され、必要な場合は要件行が追加されていること。
      不要の場合は SPEC のみ更新されていること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-008
    target_item: AG-008
    verification: |
      新規 ADR が作成されていないことを確認する。
      docs/adr/ への新規 ADR-NNN ファイルが存在しないこと。
      agentdev-architecture-advisory 助言記録が本ドラフトの conflict_resolutions（CR-005）に残っていること。
    pass_criteria: |
      新規 ADR ファイルが存在せず、advisory 助言実施記録が draft に残っていること。
    on_failure: |
      record-in-findings（万が一 ADR が作成された場合は設計判断変更のため、Findings へ out-of-scope として記録）。

review_dispositions:
  - id: RD-001
    source_ru: RU-0008
    source_item: RU-0008-Sources-regex-bug
    disposition: covered
    reason_code: fully_integrated
    reason: |
      RU-0008 の Source Summary が指摘する「extractAllCompositeIds の正規表現バグ」は AG-001〜AG-003 で完全に統合された。
      正規表現修正、テスト追加、SPEC 明記を全て反映。
    evidence:
      path: .agentdev/backlog/req-units/RU-0008.md
      section: Source Summary
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0011
    source_item: RU-0011-Sources-append-fallback
    disposition: covered
    reason_code: fully_integrated
    reason: |
      RU-0011 の Source Summary が指摘する「未検出時 APPEND fallback の非公式運用」は AG-004〜AG-008 で完全に統合された。
      spec-append 第一級 operation 化、後方互換、契約完全性、search-target-area.ts 修正、REQ 所有関係整理を全て反映。
    evidence:
      path: .agentdev/backlog/req-units/RU-0011.md
      section: Source Summary
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: |
    scale: large（REQ-008 update + 5 SPEC 同期更新 + 2 スクリプト修正）のため Epic 構成を推奨。
    RU-0008（OU-001）は RU-0011 と独立並列実行可能。
    Wave 構成案:
    - Wave 1: OU-001（RU-0008 SPEC）, OU-002（REQ-008 update）並列
    - Wave 2: OU-003（artifact-contracts.md）, OU-006（agentdev-spec-file-manager.md）
    - Wave 3: OU-004（req-define.md）, OU-005（spec-save.md）
    ※ case-run 工程で alloc-composite-id.ts, search-target-area.ts の実装修正を実施。
  wave_hints:
    - wave: 1
      units: [OU-001, OU-002]
      rationale: RU-0008 と RU-0011 は独立。REQ-008 update が後続の前提。
    - wave: 2
      units: [OU-003, OU-006]
      rationale: artifact-contracts.md と agentdev-spec-file-manager.md は契約の SSoT。
    - wave: 3
      units: [OU-004, OU-005]
      rationale: req-define.md と spec-save.md は Wave 2 の契約に従う consumer/producer。
```

# implementation_details

本セクションは case-run 工程で実施する実装詳細（Step 10-1 ガイドラインに基づく分離）。

## RU-0008 実装

- ファイル: `src/opencode/skills/agentdev-req-file-manager/scripts/src/alloc-composite-id.ts`
- 修正: `extractAllCompositeIds` 関数の正規表現を `/REQ-(\d{4})-(\d{3})/` から `/REQ-(\d{3,4})-(\d{3})/` へ変更
- テスト追加: 3桁 REQ（REQ-001-NNN 等）と4桁 REQ（REQ-0011-NNN）混在入力での max 計算検証
- 影響: REQ-001, REQ-003, REQ-006, REQ-008, REQ-010 の採番が自動化される（case-auto Draft 1〜8 で手動採番が必要だった問題の解消）

## RU-0011 実装

- ファイル: `src/opencode/skills/agentdev-spec-file-manager/scripts/src/search-target-area.ts`
- 修正: 見出し行から `### ` 等のプレフィックスを除く処理を廃止。入力された `target_area`（見出し行全体）との完全一致のみを受け付ける
- 廃止: 前方一致許容
- 回帰テスト追加: 正規入力 `### IR-044`, `## 工程別 capture 責務` 等での検証

## 実装スコープへの注意

実装詳細は本ドラフトの要件定義本体ではなく、case-run 工程での参照情報である。
要件定義としての原本は上記 `# draft-data` YAML ブロック。

# summary

本ドラフトは RU-0008（alloc-composite-id.ts 正規表現バグ）と RU-0011（spec-append 第一級 operation 化 + search-target-area.ts 正規契約修正）を処理する要件定義である。AgentDevFlow 本体の改善（agentdev_handoff: true）。

deep-review 5レーン検証で確定した設計判断3を全面的に反映。選択肢B（spec-save 側で APPEND fallback 公式化）は不採用、明示的 spec-append 第一級 operation を採用。

主要な変更対象は REQ-008 と5つの SPEC（agentdev-req-file-manager.md, artifact-contracts.md, req-define.md, spec-save.md, agentdev-spec-file-manager.md）。scale: large、Epic 構成を推奨。

後続コマンドは req-save（REQ-008 update + ADR null）→ spec-save（5 SPEC 同期更新）→ case-open（Epic 構成）→ case-run（実装詳細セクション参照）を想定。
