---
draft_type: req_draft
topic_slug: classification-validation-and-spec-status
status: saved
spec_consumed: true
created_at: 2026-06-26T00:00:00Z
source_rus:
  - RU-0003
  - RU-0004
---

# draft-data

```yaml
# work_type: 両 RU とも既存 REQ の振る舞い契約を補完・拡張する新規契約の追加
work_type: feature

# scale: 影響範囲は REQ 2件（APPEND）+ SPEC 3件。実装スコープシグナル閾値未満
scale: standard

# summary: RU-0003 は REQ-0155-004（RU暫定→確定分類フロー）の未定義部分
# （tentative_classification の7値以外入力時・フィールド欠落時の挙動）を補完し、
# REQ-0155 へバリデーション契約を APPEND する。RU-0004 は REQ-0154-001
# （SPEC status 単一情報源）の対象外となっていた基盤SPEC の status 追跡を組み込み、
# REQ-0154 へ全 SPEC カバーを APPEND する。両 RU は関心が独立するため分離し、
# 別 REQ への APPEND として2つの OU を出力する。
summary: |
  RU-0003（tentative_classification enum 厳密検証）と RU-0004（基盤SPEC status 追跡）
  を要件化する。両者は関心が独立するため Step 11-2 で分離判定し、別 REQ への
  APPEND として扱う。RU-0003 は REQ-0155-004 が定める RU暫定→確定分類フローにおける
  バリデーション契約の未定義部分（7値以外の入力時挙動、フィールド欠落時挙動）を補完し、
  REQ-0155 へ要件行を APPEND する。許容値の具体値、検出時の具体的挙動は
  backlog-review.md / req-define.md の SPEC に配置する。RU-0004 は REQ-0154-001
  （SPEC status 単一情報源 = docs/specs/README.md）の対象外とされていた基盤SPEC
  （REQ-0156 の6ドメイン配下）の status 追跡を組み込み、REQ-0154 へ全 SPEC カバー
  の要件行を APPEND する。基盤SPEC 一覧表の列構造、status 列の詳細は
  docs/specs/README.md の SPEC 更新で扱う。

# auto_gate: 両 RU とも文書・SPEC レベルの契約定義。repo 外操作なし、未解決事項なし
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 各 RU の合意内容。artifact_actions.source_items から参照される
agreed_items:
  - id: AG-001
    content: |
      RU frontmatter の tentative_classification フィールドのバリデーション契約を
      確定する（RU-0003）。REQ-0155-003 が定義する文書7分類（REQ、挙動SPEC、
      カタログSPEC、guide、learning維持、作業記録、対象外）のみを許容値とし、
      7値以外の値が入力された場合、およびフィールドが欠落した場合の取り扱いを
      定義する。backlog-review が RU frontmatter に付与する暫定分類と、req-define
      Step5-2 が上書き確定する最終分類は、いずれも許容値の範囲内になければならない。
      これにより REQ-0155-004 の RU暫定→確定分類フローにおけるデータ品質が担保される。
      許容値の具体値、検出時の具体的挙動（拒否、エラーメッセージ等）は SPEC
      （backlog-review.md、req-define.md）に配置する。
  - id: AG-002
    content: |
      基盤SPEC の status 追跡を docs/specs/README.md に組み込む（RU-0004）。
      REQ-0156 が定義する6ドメイン（foundations/、responsibilities/、quality/、
      integrity/、local/、authoring/）配下の基盤SPEC の status を、docs/specs/README.md
      の基盤SPEC 一覧表で追跡対象とする。これにより REQ-0154-001 の趣旨（SPEC status
      の単一情報源化）が全 SPEC で満たされる。基盤SPEC の status 値は command/skill/
      workflow SPEC と同じく ADR-0123 定義の draft/accepted とし、draft→accepted の
      昇格は case-close 工程で行う。基盤SPEC 一覧表の列構造、status 列の詳細、
      初期 status 値の判定は docs/specs/README.md の SPEC 更新で扱う。

# artifact_actions: REQ/ADR/SPEC への保存対象を成果物別ではなく1つの配列に統合
# 1 action = 1 artifact × 1 editing concern
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-0155.md
    source_items: [AG-001]
    content: |
      | REQ-0155-008 | RU frontmatter の tentative_classification は REQ-0155-003 が定義する文書7分類のみを許容値とすること。許容値以外の値、およびフィールド欠落を取り扱うこと。backlog-review が付与する暫定分類と req-define が確定する最終分類は、いずれも許容値の範囲内にあること。許容値の具体値、検出時の具体的挙動は SPEC に配置すること |
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-0154.md
    source_items: [AG-002]
    content: |
      | REQ-0154-003 | docs/specs/README.md は基盤SPEC（REQ-0156 が定義する6ドメイン配下の SPEC）の status を含む全 SPEC の status を追跡すること。基盤SPEC の status 値、昇格工程は command/skill/workflow SPEC と同一（ADR-0123）とすること。基盤SPEC 一覧表の列構造、status 列の詳細は SPEC に配置すること |
  - id: ACT-SPEC-001
    artifact: spec
    operation: create
    target: docs/specs/commands/backlog-review.md
    source_items: [AG-001]
    content: |
      ## tentative_classification フィールド仕様

      RU frontmatter の `tentative_classification` フィールドの仕様（REQ-0155-008）。

      ### 許容値

      REQ-0155-003 が定義する文書7分類のいずれか1値。

      | 値 | 分類 |
      |---|---|
      | `REQ` | 要件定義 |
      | `挙動SPEC` | 挙動SPEC |
      | `カタログSPEC` | カタログSPEC |
      | `guide` | ガイド |
      | `learning維持` | learning 維持 |
      | `作業記録` | 作業記録 |
      | `対象外` | 要件化対象外 |

      ### 7値以外の入力時の挙動

      backlog-review が `tentative_classification` に7値以外の値を付与しようとした場合、RU 生成を停止し、訂正を求めること。7値以外の値で RU を生成しないこと。

      ### フィールド欠落時の挙動

      backlog-review は全 RU frontmatter に `tentative_classification` を付与すること。フィールド欠落の RU は生成しないこと。
  - id: ACT-SPEC-002
    artifact: spec
    operation: create
    target: docs/specs/commands/req-define.md
    source_items: [AG-001]
    content: |
      ### tentative_classification 最終確定のバリデーション（REQ-0155-008）

      Step 5-2 が backlog-review 付与の暫定分類（`tentative_classification`）を最終分類として確定（上書き）する際、以下を検証すること:

      1. 暫定分類が REQ-0155-003 の7値のいずれかであること。7値以外の場合、確定を停止し理由を提示すること
      2. フィールドが欠落している場合、暫定分類未付与として確定を停止し、backlog-review への差し戻しを提示すること
      3. 最終分類への上書き値も7値のいずれかであること

      7値の定義、検出時の具体的挙動は backlog-review.md「tentative_classification フィールド仕様」を参照すること。
  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target: docs/specs/README.md
    target_area: '## SPEC status 追跡情報源（REQ-0154-001）'
    source_items: [AG-002]
    content: |
      ## SPEC status 追跡情報源（REQ-0154-001, REQ-0154-003）

      本ファイルが SPEC の `status`（draft / accepted、ADR-0123 定義）を視認する単一の追跡情報源である（REQ-0154-001）。後述の各 SPEC 一覧表の `status` 列で全 SPEC のライフサイクル状態を集約表示する。基盤SPEC（REQ-0156 の6ドメイン配下）の status を含め、全 SPEC の status を追跡対象とする（REQ-0154-003）。

      - **情報源**: 本ファイル（`docs/specs/README.md`）のみ。`docs/DOC-MAP.md` は SPEC の status を重複管理しない（探索経路の案内のみ）
      - **status 値**: ADR-0123 で定義される `draft` / `accepted` のみ。値の追加、変更は本ファイルの対象外（REQ-0154 対象外）
      - **更新タイミング**: spec-save（draft 保存）、case-close（draft から accepted への昇格）の各工程で本ファイルの status 列を更新する。基盤SPEC も同一工程に従う（REQ-0154-003）
      - **欠落扱い**: `status` frontmatter を持たない SPEC は表中で `-` で示す。`-` の SPEC は status 付与を要する（対象 SPEC は spec-save / case-close で順次 status を付与する）

      draft status の SPEC が一定期間更新されず放置されることを検出するルール（IR-054）は [integrity-rule-catalog.md](integrity-rule-catalog.md) 参照（REQ-0154-002）。基盤SPEC も IR-054 の検出対象に含む。

      ### 基盤SPEC 一覧表の status 列追加（REQ-0154-003）

      基盤SPEC 一覧表（foundations/、responsibilities/、quality/、integrity/、local/、authoring/ の6表）は command/skill/workflow SPEC 一覧表と同じ `status` 列を持つこと。各基盤SPEC の初期 status は以下に従う:

      - 既に ADR-0123 lifecycle に沿って draft→accepted 昇格が確認済みの SPEC（例: quality/spec-health-metrics.md）は `accepted`
      - 上記以外は現状の frontmatter `status` 値（`draft` または欠落時は `-`）

      初期 status 値の確定は spec-save 工程で行い、本一覧表へ反映する。
  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target: docs/specs/README.md
    target_area: '#### foundations/（基盤モデル）'
    source_items: [AG-002]
    content: |
      #### foundations/（基盤モデル）

      | SPEC | status | タイトル | 責務 |
      |------|--------|---------|------|
      | foundations/system.md | - | システム仕様 | コマンドシステムの構成定義、運用モデル |
      | foundations/document-model.md | - | 文書モデル | REQ/ADR/SPEC/guides/DOC-MAP の責務マトリックス、ドメイン別体系化規範 |
      | foundations/patterns.md | - | 文書フォーマット規約 | frontmatter 規約、REQ/SPEC/guides の記述形式 |
      | foundations/design-principles.md | - | 設計原則 | アーキテクチャ設計原則 |
      | foundations/workflow-contracts.md | - | ワークフロー契約（旧版、縮小済み） | 個別動作は各 command/skill SPEC および workflows/ へ移管済み |
  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target: docs/specs/README.md
    target_area: '#### responsibilities/（文書種別・成果物責務）'
    source_items: [AG-002]
    content: |
      #### responsibilities/（文書種別・成果物責務）

      | SPEC | status | タイトル | 責務 |
      |------|--------|---------|------|
      | responsibilities/document-type-responsibilities.md | - | 文書種別責務、配置基準 | 文書品質ゲート原本仕様、文書種別責務 |
      | responsibilities/artifact-responsibilities.md | - | 成果物責任表 | 各成果物種別の正規所有者と責務 |
      | responsibilities/artifact-contracts.md | - | アーティファクト契約 | Command/Skill/Template/Script の入出力、依存方向 |
      | responsibilities/req-impact-map.md | - | REQ 影響マップ | 各現行 REQ が影響する整合性ルールとアーティファクト |
  - id: ACT-SPEC-006
    artifact: spec
    operation: update
    target: docs/specs/README.md
    target_area: '#### quality/（品質・メトリクス）'
    source_items: [AG-002]
    content: |
      #### quality/（品質・メトリクス）

      | SPEC | status | タイトル | 責務 |
      |------|--------|---------|------|
      | quality/quality-specs.md | - | 品質仕様 | 品質基準、検証ルール |
      | quality/quality-gates.md | - | 品質ゲート | QG-1〜QG-4 定義、機械化境界 |
      | quality/req-health-metrics.md | - | REQ 健全性メトリクス | REQ 肥大化、関心ズレ検出の定量閾値 |
      | quality/spec-health-metrics.md | accepted | SPEC 健全性メトリクス | SPEC 肥大化、放置、ドメイン分類適合の定量閾値（REQ-0156-007 新設） |
  - id: ACT-SPEC-007
    artifact: spec
    operation: update
    target: docs/specs/README.md
    target_area: '#### integrity/（整合性契約・ルール）'
    source_items: [AG-002]
    content: |
      #### integrity/（整合性契約・ルール）

      | SPEC | status | タイトル | 責務 |
      |------|--------|---------|------|
      | integrity/integrity-contracts.md | - | 整合性契約 | strict/heuristic/observation 分類と検査カテゴリ |
      | integrity/integrity-rule-catalog.md | - | 整合性ルールカタログ | スキーマ定義とルールインデックス（詳細は rules/ へ分離） |
      | integrity/rules/ | - | 整合性ルール詳細 | IR-NNN 個別ルールの15フィールド詳細（局所物理分離: REQ-0155-007） |
      | integrity/rule-ownership.md | - | ルール所有権マトリックス | ルールドメインと責任 REQ/SPEC の対応 |
      | integrity/docs-spec-rebuild-integrity.md | - | 配布物整合性検査ルール | 配布物 ID 除去後の品質保持 |
      | integrity/backticks-identifier-threshold.md | - | backticks 識別子/一般名詞 判定閾値 | backticks 必須と任意の機械判定閾値 |
  - id: ACT-SPEC-008
    artifact: spec
    operation: update
    target: docs/specs/README.md
    target_area: '#### local/（ローカル版 SPEC）'
    source_items: [AG-002]
    content: |
      #### local/（ローカル版 SPEC）

      | SPEC | status | タイトル | 責務 |
      |------|--------|---------|------|
      | local/runtime-package-boundary.md | - | 実行時パッケージ境界 | リポジトリ種別別 .opencode/ 定義、命名規約 |
      | local/local-case-file.md | - | ローカル Case ファイル | ローカル版 Case ファイルスキーマ、状態遷移 |
      | local/local-generation.md | - | ローカル版 OpenCode 生成 | link mode 接続フロー、更新運用 |
      | local/local-transform.md | - | ローカル版 OpenCode 変換プロンプト | 変換品質検証の読み替え |
  - id: ACT-SPEC-009
    artifact: spec
    operation: update
    target: docs/specs/README.md
    target_area: '#### authoring/（執筆規約）'
    source_items: [AG-002]
    content: |
      #### authoring/（執筆規約）

      | SPEC | status | タイトル | 責務 |
      |------|--------|---------|------|
      | authoring/command-file-format.md | - | コマンドファイルフォーマット規約 | command 定義ファイルの Markdown 構成標準 |

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: |
      RU-0004 は基盤SPEC の status を specs/README.md で追跡するか、それとも
      REQ-0154-001 の対象を明示的に command/skill/workflow SPEC に限定し基盤SPEC を
      別途管理するかの分岐を含んでいた。
    resolution: |
      evidence-first により解消。REQ-0154-001 の趣旨は「SPEC status の単一情報源化」
      であり、基盤SPEC を除外すると趣旨が一部 SPEC で満たされない（spec-health-metrics.md
      が quality/ 配下で draft→accepted 昇格したが追跡されないギャップが実在）。
      よって基盤SPEC の status を specs/README.md で追跡対象とする方針を採用し、
      REQ-0154-001 の対象外記述（specs/README.md 行15）は廃止する。status 値、
      昇格工程は既存の command/skill/workflow SPEC と同一（ADR-0123）とし、新規
      lifecycle を導入しない。

# operation_units: 複数RU入力時の統合/分離結果（Step 11-2）
# RU-0003 と RU-0004 は関心が独立（enum バリデーション vs 基盤SPEC status 追跡）のため分離
operation_units:
  - ou_id: OU-001
    source_ru: RU-0003
    target_req: REQ-0155
    target_spec: docs/specs/commands/backlog-review.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0004
    target_req: REQ-0154
    target_spec: docs/specs/README.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}

# test_strategy: 各合意項目（AG-*）の検証方法。3要素（verification / pass_criteria / on_failure）必須
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs/requirements/REQ-0155.md を読み、REQ-0155-008 が存在することを確認する。
      当該要件行が（a）REQ-0155-003 の7分類のみを許容値とする宣言、（b）許容値以外
      およびフィールド欠落の取り扱い、（c）backlog-review 付与と req-define 確定の
      両段階で許容値範囲内であること、の3点を含むか検証する。
    pass_criteria: |
      REQ-0155-008 が存在し、上記3点（7値許容、逸脱・欠落取り扱い、両段階の範囲内要件）
      を全て含むこと。SPEC への詳細配置委譲（許容値の具体値、検出時の挙動）が
      明記されていること。
    on_failure: |
      fix-and-reverify。要件行の記述が不完全な場合、当該行を修正して再検証する。
  - id: TS-002
    target_item: AG-001
    verification: |
      docs/specs/commands/backlog-review.md を読み、「tentative_classification
      フィールド仕様」セクションが存在することを確認する。当該セクションが
      （a）許容値7値の一覧テーブル、（b）7値以外の入力時の挙動、（c）フィールド
      欠落時の挙動、の3点を含むか検証する。
    pass_criteria: |
      許容値7値の一覧、7値以外入力時の挙動（RU 生成停止）、フィールド欠落時の挙動
      （付与必須・欠落 RU 不生成）の3点が SPEC に記載されていること。
    on_failure: |
      fix-and-reverify。SPEC 記述が不完全な場合、当該セクションを修正して再検証する。
  - id: TS-003
    target_item: AG-001
    verification: |
      docs/specs/commands/req-define.md を読み、Step 5-2 の暫定分類確定に関する
      バリデーション記述が存在することを確認する。当該記述が（a）暫定分類の7値
      チェック、（b）フィールド欠落時の停止、（c）最終分類上書き値の7値チェック、
      の3点を含むか検証する。
    pass_criteria: |
      Step 5-2 のバリデーション手順が上記3点を含み、7値の定義参照先
      （backlog-review.md）が明記されていること。
    on_failure: |
      fix-and-reverify。SPEC 記述が不完全な場合、当該箇所を修正して再検証する。
  - id: TS-004
    target_item: AG-002
    verification: |
      docs/requirements/REQ-0154.md を読み、REQ-0154-003 が存在することを確認する。
      当該要件行が（a）基盤SPEC の status 追跡対象化、（b）全 SPEC カバーの宣言、
      （c）command/skill/workflow SPEC と同一 lifecycle（ADR-0123）、の3点を含むか
      検証する。
    pass_criteria: |
      REQ-0154-003 が存在し、上記3点を全て含むこと。SPEC への詳細配置委譲
      （一覧表の列構造、status 列の詳細）が明記されていること。
    on_failure: |
      fix-and-reverify。要件行の記述が不完全な場合、当該行を修正して再検証する。
  - id: TS-005
    target_item: AG-002
    verification: |
      docs/specs/README.md を読み、「SPEC status 追跡情報源」セクションと6つの
      基盤SPEC 一覧表（foundations/、responsibilities/、quality/、integrity/、
      local/、authoring/）を検証する。（a）対象外記述（旧行15「当該 SPEC への
      status 付与は本ファイルの対象外」）が削除または更新されていること、（b）6表
      全てに status 列が追加されていること、（c）REQ-0154-003 への参照が含まれること、
      を確認する。
    pass_criteria: |
      対象外記述が削除され、6つの基盤SPEC 一覧表全てに status 列が存在すること。
      quality/spec-health-metrics.md の status が accepted と記載されていること。
      REQ-0154-003 参照がセクション見出しまたは本文に含まれること。
    on_failure: |
      fix-and-reverify。SPEC 更新が不完全な場合、該当セクション・表を修正して
      再検証する。

# adr_judgement: 両 RU とも ADR 不要（agentdev-adr-guidelines 準拠）
adr_judgement:
  - ru_id: RU-0003
    decision: not_required
    rationale: |
      tentative_classification の enum バリデーション契約は、REQ-0155-004 が定める
      RU暫定→確定分類フローの未定義部分（挙動SPEC）を補完するものであり、新規の
      アーキテクチャ判断を含まない。許容値は REQ-0155-003 が既に定義済み。検出時の
      具体的挙動は SPEC 詳細であり、アーキテクチャ上重要ではない。agentdev-adr-guidelines
      の「ADRを作成してはならない条件」（仕様変更のみ、command動作仕様）に該当する。
  - ru_id: RU-0004
    decision: not_required
    rationale: |
      基盤SPEC の status 追跡は、ADR-0123（SPEC lifecycle）が既に確立した draft/accepted
      lifecycle を、これまで対象外とされていた基盤SPEC へ適用範囲を拡張するものである。
      新規の lifecycle 定義、新規の技術判断を含まず、既存パターンの適用完了である。
      agentdev-adr-guidelines の「False Negative 防止基準」を検証したが、文書種別が
      SPEC 変更（REQ-0154-001 整合性是正）であり ADR 境界上ではない。対象外記述の
      廃止は SPEC 更新として扱う。

# case_open_hints: case-open 構成生成への参考情報
case_open_hints:
  epic_needed: false
  decomposition: |
    OU-001（RU-0003）と OU-002（RU-0004）は関心が独立し、depends_on が空であるため
    並列実行可能。ただし各 OU は単一 REQ への APPEND であり、各1 Issue で完結する
    （issue_policy: single）。Epic は不要。
  wave_hints:
    - wave: 1
      units: [OU-001, OU-002]
      reason: 両 OU は依存関係なし。並列 Wave 1 で実行可能。
```

# summary

RU-0003 と RU-0004 を入力とした req-define の結果。両 RU は関心が独立するため Step 11-2 で分離判定し、別 REQ への APPEND として2つの OU を出力した。

- **OU-001（RU-0003）**: REQ-0155（文書粒度モデル）へ REQ-0155-008 を APPEND。tentative_classification の7値許容・逸脱検出・欠落取り扱いの振る舞い契約。詳細（許容値一覧、検出時挙動）は backlog-review.md / req-define.md の SPEC へ分離。
- **OU-002（RU-0004）**: REQ-0154（SPEC status 追跡）へ REQ-0154-003 を APPEND。基盤SPEC の status 追跡対象化。詳細（一覧表の列構造）は docs/specs/README.md の SPEC 更新へ分離。

両 RU とも ADR 不要（既存契約の補完・既存 lifecycle の適用拡張）。work_type は feature、scale は standard。
