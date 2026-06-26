---
draft_type: req_draft
topic_slug: doc-granularity-model
status: saved
created_at: 2026-06-26T00:00:00Z
source_rus:
  - RU-0001
---

# draft-data

```yaml
work_type: feature

scale: standard

spec_consumed: true

summary: |
  AgentDevFlow 共通の文書粒度モデルを新規REQとして要件化する。SPEC内部5区分（論理区分）、粒度ゲート2点必須化、文書7分類モデル、分類候補→確定RU運用、learning自動REQ化禁止、レポジトリ種別非区別、局所物理分離許容の7項目を要件行として展開する。規範の詳細（5区分の定義表、7分類の記述対象、粒度ゲート判定基準等）は document-model.md へ分離する。
  RU-0001 第2層（agent-dev-flow リポジトリへの初回是正: 既存REQ/SPEC棚卸し、integrity-rule-catalog肥大化解消、IR-044詳細移送、代表command SPEC詳細分離、既存SPEC段階移送）は恒久REQ化せず、別途 inspect-docs/case-open/case-run で扱う一時是正タスクとして本 draft の要件対象外とする（RU-0001 line 66-74 の注意に準拠）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      SPEC は文書種別として維持し、内部を挙動SPEC、カタログSPEC、横断contract SPEC、索引SPEC、詳細SPECの5論理区分で整理する。5区分の規範は各レポジトリの document-model.md が定義し、共通コマンドは各レポジトリの document-model.md を参照する。5区分は物理的なディレクトリ分離を意味せず、既存3層構造（commands/skills/workflows/直下）内での内容整理のための論理区分である。
  - id: AG-002
    content: |
      req-define と req-save/spec-save が REQ/SPEC 粒度ゲートを2点（要件展開時の分類ゲート、保存前検証）で強制する。req-define は要件展開時に変更後仕様/反映作業の分類と REQ/SPEC 境界判定を強制し、req-save/spec-save は保存前に粒度を検証する。intake/learning/backlog は軽量ガイドライン参照のみとし、強制ゲートは持たない。
  - id: AG-003
    content: |
      文書を REQ、挙動SPEC、カタログSPEC、guide、learning維持、作業記録、対象外の7分類で整理する。7分類は文書の振る舞いを規定するものではなく、文書整理と粒度判定の参照分類である。REQ と SPEC の文書種別境界（REQ-0101-067）に加え、文書の関心と役割に基づく分類を提供する。
  - id: AG-004
    content: |
      intake/learning 由来の RU は backlog-review 時点で分類候補とし、req-define で分類を確定する。backlog-review は暫定分類を付与し、req-define が最終分類を確定することで、分類未確定のまま要件化が進むことを防ぐ。
  - id: AG-005
    content: |
      learning 知見は恒久契約（REQ/ADR/SPEC）に昇華できる場合のみREQ化し、無条件の自動REQ化を禁止する。learning-promote は知見の恒久契約への昇華可能性を評価し、昇華不能な知見は learning archive の living pool で維持し、REQ化しない。
  - id: AG-006
    content: |
      agentdev-* コマンド・スキル（src/*）は AgentDevFlow レポジトリと適用レポジトリ（consumer）を区別せず、5区分は各レポジトリの document-model.md が定義する規範を参照する。共通コマンドは5区分をハードコードせず、document-model.md の SPEC分離基準を参照する。唯一の例外は intake/learning のキャプチャ内容が AgentDevFlow 本体（アップストリーム還元）か適用レポジトリかの区別とする。AgentDevFlow 本体の思想（docs/）は agent-dev-flow 固有・配布対象外（ADR-0103）。
  - id: AG-007
    content: |
      *-rules.md 併設、integrity-rules/ サブディレクトリによる局所物理分離を許容する。docs/specs/behavior|catalog/ への全面再配置は禁止し、既存3層構造（commands/skills/workflows/直下）を維持する。具体配置は各レポジトリの document-model.md に従う。局所物理分離は文書の物理的分離を許容するが、全面再配置を強制しない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:doc-granularity-model
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007]
    content: |
      ---
      id: REQ-{NNNN}
      title: "文書粒度モデル"
      created: "2026-06-26"
      updated: "2026-06-26"
      ---

      ## 目的

      AgentDevFlow の文書粒度を規範化し、パイプライン（req-define、req-save、spec-save）で強制する仕組みを定義する。SPEC 内部の論理区分、文書分類モデル、粒度ゲート、RU 運用、learning 制約、レポジトリ種別非区別、局所物理分離の7項目を統合的に管理し、REQ/SPEC への詳細混入と SPEC 内部の挙動/カタログ双方向混入を防止する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-{NNNN}-001 | SPEC は文書種別として維持し、内部を挙動SPEC、カタログSPEC、横断contract SPEC、索引SPEC、詳細SPECの5論理区分で整理すること。5区分の規範は各レポジトリの document-model.md が定義すること |
      | REQ-{NNNN}-002 | req-define と req-save/spec-save が REQ/SPEC 粒度ゲートを2点（要件展開時の分類ゲート、保存前検証）で強制すること。intake/learning/backlog は軽量ガイドライン参照のみとすること |
      | REQ-{NNNN}-003 | 文書を REQ、挙動SPEC、カタログSPEC、guide、learning維持、作業記録、対象外の7分類で整理すること |
      | REQ-{NNNN}-004 | intake/learning 由来の RU は backlog-review 時点で分類候補とし、req-define で分類を確定すること |
      | REQ-{NNNN}-005 | learning 知見は恒久契約に昇華できる場合のみREQ化し、無条件の自動REQ化を禁止すること |
      | REQ-{NNNN}-006 | agentdev-* コマンド・スキルは AgentDevFlow レポジトリと適用レポジトリを区別せず、5区分は各レポジトリの document-model.md が定義する規範を参照すること。共通コマンドは5区分をハードコードしないこと。唯一の例外は intake/learning のキャプチャ内容が AgentDevFlow 本体か適用レポジトリかの区別とすること |
      | REQ-{NNNN}-007 | *-rules.md 併設、integrity-rules/ サブディレクトリによる局所物理分離を許容し、docs/specs/behavior|catalog/ への全面再配置を禁止すること。既存3層構造（commands/skills/workflows/直下）を維持すること。具体配置は各レポジトリの document-model.md に従うこと |

      ## 適用範囲

      - **対象**: req-define、req-save、spec-save、backlog-review、learning-promote、document-model.md（各レポジトリ）、agentdev-* コマンド・スキルの設計原則、文書配置規範、SPEC 内部論理区分、文書7分類モデル
      - **対象外**: 各レポジトリの document-model.md への個別規範記述（各レポジトリの作業対象）、既存REQ/SPEC の初回棚卸し（RU-0001 第2層、別途 inspect-docs/case-open/case-run で扱う一時是正タスク）、技術スタック選択、データモデル、認証スキーム等のアーキテクチャ判断（ADR対象）

      ## 関連情報

      - **関連 REQ**: REQ-0101（文書・REQ管理基準、文書分類定義の一次所有先）、REQ-0102（要件定義・保存、分類ゲート）、REQ-0103（Artifact責任分界）、REQ-0128（learning-promote）、REQ-0129（backlog-review）、REQ-0136（REQ/SPEC責務分離、spec-save 保存前検証）
      - **関連 ADR**: ADR-0103（文書種別責務境界）、ADR-0123（SPEC lifecycle）、ADR-0104（実行時独立性）
      - **関連 SPEC**: document-model.md（5区分・7分類・局所物理分離の規範）、req-health-metrics.md（粒度ゲート閾値）

  - id: ACT-SPEC-001
    artifact: spec
    operation: create
    target: docs/specs/document-model.md
    source_items: [AG-001, AG-003, AG-007]
    content: |
      ## SPEC 内部論理区分（5区分）

      SPEC は文書種別として維持し、内部を以下の5論理区分で整理する。従来の3層ディレクトリ構造（commands/skills/workflows/直下）を維持しつつ、各 SPEC ファイルの内容がいずれの論理区分に属するかを明確にする。

      | 論理区分 | 記述対象 | 代表例 |
      |---|---|---|
      | 挙動SPEC | コマンド、スキル、ワークフローの振る舞い、入出力、副作用、停止条件 | commands/req-define.md、skills/agentdev-req-analysis.md |
      | カタログSPEC | スキーマ、enum、判定表、ルールカタログ、テンプレート種別 | integrity-rule-catalog.md、req-impact-map.md |
      | 横断contract SPEC | 複数コマンド、スキルにまたがる共通契約 | workflows/workflow-contracts.md、workflows/delegation-contracts.md |
      | 索引SPEC | 文書探索、参照経路の入口 | DOC-MAP.md、specs/README.md |
      | 詳細SPEC | 内部アルゴリズム、パラメータ、実装詳細 | req-health-metrics.md、quality-gates.md |

      1つの SPEC ファイルが複数の論理区分にまたがる場合、主たる区分をファイルの冒頭に明示する。論理区分は物理的なディレクトリ分離を意味せず、既存3層構造内での内容整理のための区分である。従来の workflows/ 層が横断contract SPEC に対応する。

      ## 文書7分類モデル

      文書全体を以下の7分類で整理する。REQ と SPEC の文書種別境界（REQ-0101-067）に加え、文書の関心と役割に基づく分類を提供する。

      | 分類 | 記述対象 |
      |---|---|
      | REQ | 満たすべき振る舞い、制約、状態 |
      | 挙動SPEC | コマンド、スキルの振る舞い、入出力、契約 |
      | カタログSPEC | スキーマ、enum、判定表、ルールカタログ |
      | guide | 人間向けナビゲーション（規範的権限なし） |
      | learning維持 | learning 知見の恒久契約への昇華候補 |
      | 作業記録 | Case/RU/Issue/PR/OU 由来の一時作業記録 |
      | 対象外 | 当該要件化の対象外 |

      7分類は文書の振る舞いを規定するものではなく、文書整理と粒度判定の参照分類である。分類確定は backlog-review（暫定分類）→ req-define（最終分類確定）の流れで行う。

      ## 局所物理分離の許容

      *-rules.md 併設、integrity-rules/ サブディレクトリによる局所物理分離を許容する。docs/specs/behavior|catalog/ への全面再配置は禁止し、既存3層構造（commands/skills/workflows/直下）を維持する。具体配置は各レポジトリの document-model.md に従う。局所物理分離は文書の物理的分離を許容するが、全面再配置を強制しない。

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: new:doc-granularity-model
    target_spec: docs/specs/document-model.md
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      req_allocated: REQ-0155
      req_path: docs/requirements/REQ-0155.md
      spec_path: docs/specs/document-model.md
      spec_operation: append
      spec_sections_added:
        - "SPEC 内部論理区分（5区分）"
        - "文書7分類モデル"
        - "局所物理分離の許容"
      adr_created: false
      saved_at: "2026-06-26"

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      各レポジトリの document-model.md に SPEC 内部5論理区分（挙動SPEC、カタログSPEC、横断contract SPEC、索引SPEC、詳細SPEC）の規範が定義されていることを確認する。確認対象は agent-dev-flow リポジトリの docs/specs/document-model.md とする。各区分の記述対象と代表例が記載されているか、論理区分が物理的ディレクトリ分離を意味しない旨が明記されているかを検証する。
    pass_criteria: |
      5区分すべてが定義済みであり、各区分の記述対象と代表例が記載されていること。論理区分が物理的ディレクトリ分離ではなく既存3層構造内の内容整理である旨が明記されていること。
    on_failure: |
      document-model.md を修正して5区分の規範を追記・補完し、再検証する（fix-and-reverify）。

  - id: TS-002
    target_item: AG-002
    verification: |
      req-define に要件展開時の分類ゲート（変更後仕様/反映作業の分類と REQ/SPEC 境界判定）が実装されていること、req-save と spec-save に保存前の粒度検証が実装されていることを確認する。確認対象は req-define SPEC（docs/specs/commands/req-define.md）、req-save SPEC、spec-save SPEC、および各コマンドの Step 定義とする。
    pass_criteria: |
      2点の粒度ゲート（要件展開時の分類ゲート、保存前の粒度検証）が req-define と req-save/spec-save の両方に実装されていること。intake/learning/backlog に強制ゲートがなく軽量ガイドライン参照のみであること。
    on_failure: |
      該当コマンドの SPEC と実装を修正して粒度ゲートを追加・補完し、再検証する（fix-and-reverify）。

  - id: TS-003
    target_item: AG-003
    verification: |
      document-model.md に文書7分類モデル（REQ、挙動SPEC、カタログSPEC、guide、learning維持、作業記録、対象外）が定義されていることを確認する。各分類の記述対象が記載されているか、7分類が文書整理と粒度判定の参照分類である旨が明記されているかを検証する。
    pass_criteria: |
      7分類すべてが定義済みであり、各分類の記述対象が記載されていること。7分類が文書の振る舞いを規定せず整理のための参照分類である旨が明記されていること。
    on_failure: |
      document-model.md を修正して7分類モデルの規範を追記・補完し、再検証する（fix-and-reverify）。

  - id: TS-004
    target_item: AG-004
    verification: |
      backlog-review が RU に暫定分類（分類候補）を付与すること、req-define が最終分類を確定することが各コマンドの SPEC と実装で規定されていることを確認する。確認対象は backlog-review SPEC（docs/specs/commands/backlog-review.md）、req-define SPEC、および各コマンドの RU 処理ステップとする。
    pass_criteria: |
      backlog-review に暫定分類付与ステップがあり、req-define に分類確定ステップがあること。分類未確定のまま要件化が進むことを防ぐ仕組みが実装されていること。
    on_failure: |
      backlog-review または req-define の SPEC と実装を修正して分類候補→確定の流れを追加し、再検証する（fix-and-reverify）。

  - id: TS-005
    target_item: AG-005
    verification: |
      learning-promote が知見の恒久契約（REQ/ADR/SPEC）への昇華可能性を評価すること、昇華不能な知見を learning archive の living pool で維持し REQ化しないことが SPEC と実装で規定されていることを確認する。確認対象は learning-promote SPEC（docs/specs/commands/learning-promote.md）、8-axis 評価基準、および learning-promote の処理ステップとする。
    pass_criteria: |
      learning-promote に昇華可能性評価ステップがあり、無条件の自動REQ化を禁止する仕組みが実装されていること。昇華不能な知見が living pool で維持されること。
    on_failure: |
      learning-promote の SPEC と実装を修正して昇華可能性評価と自動REQ化禁止を実装し、再検証する（fix-and-reverify）。

  - id: TS-006
    target_item: AG-006
    verification: |
      agentdev-* コマンド・スキル（src/opencode/ 配下）が5区分をハードコードせず、各レポジトリの document-model.md の SPEC分離基準を参照していることを確認する。確認対象は req-define、req-save、spec-save 等のコマンド定義とスキル定義とし、5区分の名称がハードコードされていないか、document-model.md 参照が記載されているかを検証する。
    pass_criteria: |
      agentdev-* コマンド・スキルに5区分のハードコードがなく、各レポジトリの document-model.md 参照が記載されていること。唯一の例外（intake/learning のキャプチャ内容の AgentDevFlow 本体 vs 適用レポジトリ区別）が明記されていること。
    on_failure: |
      該当コマンド・スキルの定義を修正して5区分のハードコードを除去し、document-model.md 参照へ置換し、再検証する（fix-and-reverify）。

  - id: TS-007
    target_item: AG-007
    verification: |
      document-model.md に局所物理分離の許容（*-rules.md 併設、integrity-rules/ サブディレクトリ）と docs/specs/behavior|catalog/ への全面再配置禁止が規定されていることを確認する。既存3層構造（commands/skills/workflows/直下）の維持と、具体配置が各レポジトリの document-model.md に従う旨が明記されているかを検証する。
    pass_criteria: |
      局所物理分離の許容と全面再配置禁止が document-model.md に規定されていること。既存3層構造の維持と各レポジトリの document-model.md への委任が明記されていること。
    on_failure: |
      document-model.md を修正して局所物理分離の許容規範を追記・補完し、再検証する（fix-and-reverify）。

case_open_hints:
  epic_needed: false
  decomposition:
    second_layer_treatment: |
      RU-0001 第2層（agent-dev-flow リポジトリへの初回是正: 既存REQ/SPEC棚卸し、integrity-rule-catalog肥大化解消、IR-044詳細移送、代表command SPEC詳細分離、既存SPEC段階移送）は恒久REQ化せず、別途 inspect-docs/case-open/case-run で扱う一時是正タスクとする。本 draft は第1層（AgentDevFlow共通の仕組み）のみを要件化する。第2層の各項目は RU-0001 line 66-74 の注意に従い、case-open/case-run で実行する一時作業として扱い、新規REQ（文書粒度モデル）の要件行に混入しない。第2層は operation_units の対象外とし、必要に応じて独立した case-open（work_type: maintenance）または inspect-docs 経由で扱う。
  wave_hints: []

adr_judgement:
  needed: false
  reason: |
    agentdev-adr-guidelines「ADRを作成してはならない条件」の1（仕様変更のみ: 文書分類の仕様変更、追加、整理）と5（artifact contract変更: REQ/ADR/SPEC等の文書形式、分類規約の変更）に該当するため、ADR不要と判断する。第1層7項目は文書粒度の仕様・規範の整理であり、アーキテクチャ上の技術判断（技術スタック選択、データモデル、認証スキーム等）を含まない。既存ADR-0103（文書種別責務境界）、ADR-0123（SPEC lifecycle）、ADR-0104（実行時独立性）との整合性を確認済みである（5区分はSPEC内部の論理区分で文書種別の責務境界を変更せず、粒度ゲート2点必須化はSPEC lifecycle と矛盾せず保存前検証を強化し、レポジトリ種別非区別は実行時独立性の原則と整合して共通コマンドの設計原則を明文化する）。
  existing_adr_relations:
    - adr: ADR-0103
      relation: relates-to
      note: 5区分はSPEC内部の論理区分であり、ADR-0103の文書種別責務境界（REQ/ADR/SPEC/guides/DOC-MAP）を変更しない
    - adr: ADR-0123
      relation: relates-to
      note: 粒度ゲート2点必須化はSPEC lifecycle（draft/accepted）と矛盾せず、req-save/spec-save の保存前検証を強化する
    - adr: ADR-0104
      relation: relates-to
      note: レポジトリ種別非区別は実行時独立性の原則と整合し、共通コマンドの設計原則を明文化する
  oracle_consulted: false
  oracle_skip_reason: |
    agentdev-architecture-advisory の実行条件（docs責務境界変更、複数コマンド横断）に該当するため、厳密には oracle 連携が推奨される。ただし agentdev-adr-guidelines の「ADRを作成してはならない条件」に明確に該当し ADR 不要の判断確信度が高いため、oracle 連携をスキップした。加えて Sisyphus-Junior の call_omo_agent では oracle を直接呼出不可（explore/librarianのみ）である。親エージェント（Atlas/Sisyphus）が oracle 連携が必要と判断した場合、task(subagent_type="oracle") で追加確認可能である。oracle 入力標準テンプレート（要件候補: AG-001〜AG-007、衝突候補: REQ-0101/0102/0103/0128/0129/0136、ADR候補: なし、既存ADRとの関連: ADR-0103/0123/0104、判断質問: 第1層は新規ADRが必要か）を用意済み。

split_forecast:
  target: draft
  metrics:
    requirement_rows: 7
    concern_categories: 1
    artifact_types: 2
    spec_separation_violations: 0
  signals:
    row_count_signal: 0
    concern_signal: 0
    artifact_signal: 0
    spec_separation_signal: 0
  total_signal: 0
  recommended_action: CREATE許可（SPLIT不要）
  thresholds_ref: docs/specs/req-health-metrics.md
```

# summary

本 draft は RU-0001（doc-granularity-model、二層構造・合意形成済み）を入力とした req-define プロセスの成果物である。

## 要件化の対象（第1層: AgentDevFlow共通の仕組み）

RU-0001 の第1層7項目を新規REQ「文書粒度モデル」として要件化した。各項目は変更後に満たすべき振る舞い、制約、状態として要件行（REQ-{NNNN}-001〜007）に展開した。規範の詳細（5区分の定義表、7分類の記述対象、局所物理分離の許容）は document-model.md への SPEC 追記（ACT-SPEC-001）として分離した。

## 要件化の対象外（第2層: agent-dev-flow リポジトリへの初回是正）

RU-0001 の第2層5項目（既存REQ/SPEC棚卸し、integrity-rule-catalog肥大化解消、IR-044詳細移送、代表command SPEC詳細分離、既存SPEC段階移送）は、RU-0001 line 66-74 の注意と TASK MUST DO の方針に従い、恒久REQ化せず別途 inspect-docs/case-open/case-run で扱う一時是正タスクとして本 draft の要件対象外とした。operation_units からも除外し、case_open_hints.decomposition.second_layer_treatment で扱いを明記した。

## ADR判断

agentdev-adr-guidelines「ADRを作成してはならない条件」の1（仕様変更のみ）・5（artifact contract変更）に該当するため、ADR不要と判断した。既存ADR-0103（文書種別責務境界）、ADR-0123（SPEC lifecycle）、ADR-0104（実行時独立性）との整合性を確認済みである。oracle 連携は agentdev-architecture-advisory の実行条件に該当するが、ADR不要の判断確信度が高いためスキップし、判断根拠と oracle 再連携可能性を adr_judgement フィールドに記録した。

## work_type と scale

work_type は feature（第1層の共通仕組み追加）とし、scale は standard（新規REQ 1件 + SPEC追記 1件、実装スコープシグナルなし）とした。
