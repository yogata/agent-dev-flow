---
draft_type: req_draft
topic_slug: acceptance-centered-responsibility-revision
status: saved
created_at: "2026-07-22T08:42:10+09:00"
source_rus:
  - RU-20260722-01
---

<!-- req_draft テンプレート
  このテンプレートは req-define が生成する構造化引き継ぎ成果物の原本である。
  後続工程（req-save/ spec-save/ case-open/ case-auto/ case-run/ case-close）が参照する
  原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
  soft contract（生成元側標準）であり、LLM 推論経由で消費される。
  厳格なスキーマバージョン、JSON Schema、バリデータは導入しない。 -->

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
work_type: feature

# scale: feature のみ standard / large。それ以外は未設定でよい
scale: large

# summary: 当該 draft が何を合意したかの1段落要約。人間可読補助（処理の正ではない）
summary: |
  AgentDevFlow の command、skill、reference、script、REQ、SPEC、integrity rule を、
  受け入れ条件中心の責務分離へ一貫して是正する。
  親REQ は REQ-0103 を統括規範として UPDATE し、7テーマ（command中心化、skill是正、
  REQ-SPEC境界、SPEC操作所有者分離、文書診断所有者分離、ハーネス純化、integrity全件回帰）
  で既存REQ UPDATE を基本とする。新規 ADR 不要（REQ-0119-033 整合）、
  新規 skill 3件（agentdev-spec-file-manager、agentdev-doc-diagnostics、
  agentdev-artifact-validation）を追加する。
  RU 受け入れ条件23項目を親REQ とテーマ別REQ へ配分、脱落なし。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# execution_context: 会話履歴を持たない後続エージェント向けの自足した実行文脈
execution_context:
  objective: |
    AgentDevFlow の全 command、skill、reference、script、関連REQ、SPEC、integrity ruleを、
    公開成果物、安全境界、承認境界、停止条件、受け入れ条件を中心とする責務構造へ是正する。
    結果へ影響しない内部手順を command から適切な所有者へ移し、公開契約は変更しない。
  baseline:
    repository: yogata/agent-dev-flow
    verified_head: 612c09a726ff0abdc55efd5b37fbc1b86be9c99f
    verified_at: "2026-07-22"
    counts:
      public_commands: 17
      skills_before_change: 29
      skills_after_change: 32
      command_specs: 17
      skill_specs_before_change: 28
      skill_specs_after_change: 31
      active_req_files: 52
    detected_facts:
      - "command から他 skill の references/*.md を直接指定する記述は25件、11 commandに存在する"
      - "command SPEC と command 定義の Step 番号一致要求が REQ-0143-004 と command-file-format SPEC に存在する"
      - "document-type-responsibilities SPEC に全27ファイルという古い固定件数が存在する"
      - "200行を超えるcommandは7件、200行を超えるSKILL.mdは7件"
      - "agentdev-case-run-execution-adapter にハーネス固有の具体的待機時間が残る"
      - "REQ、ADR、SPEC、共通検証のscriptが agentdev-req-file-manager に集中している"
    high_density_targets:
      commands:
        - case-auto
        - case-close
        - case-open
        - case-run
        - req-define
        - req-save
        - spec-save
      skills:
        - agentdev-adr-file-manager
        - agentdev-case-run-execution-adapter
        - agentdev-epic-tracker
        - agentdev-learning-capture
        - agentdev-learning-pipeline
        - agentdev-req-analysis
        - agentdev-skill-authoring
  binding_decisions:
    - "分割軸はテーマ別とし、REQ-0103を統括する規範REQとしてUPDATEする"
    - "トラッキング専用REQは作らず、進捗、作業順、WaveはEpic Issueで管理する"
    - "新規REQを機械的に作らず、既存REQのUPDATEとSPECで自足できるものは既存文書へ統合する"
    - "新規ADRは原則作成せず、ADR-0107、ADR-0123、ADR-0136の適用として扱う"
    - "アーキテクチャ助言が既存ADRで表現できない新しい不可逆な決定を具体的に示した場合だけ停止してADRを再判定する"
    - "RUの受け入れ条件23項目は acceptance_traceability に従って一件も脱落させない"
    - "行数は診断指標であり、行数超過だけを不合格理由にしない"
  new_skills:
    - name: agentdev-spec-file-manager
      owns: "SPEC作成、更新、配置判断、target_area処理、SPEC固有整合性、SPEC固有script契約"
      excludes: "REQ/ADR操作、SPEC内容推論、accepted昇格判断、承認、commit、push"
    - name: agentdev-doc-diagnostics
      owns: "docs横断診断カテゴリ、共通証拠構造、finding出力契約、専門診断へのroute"
      excludes: "REQ固有構造診断、文章品質判断、探索順、対象修正、promote、保存、外部更新"
    - name: agentdev-artifact-validation
      owns: "文書種別横断の決定的検証script、共有ライブラリ、公開検証契約、JSON結果契約"
      excludes: "文書内容判断、ファイル編集、保存、承認、commit、push"
  script_ownership:
    agentdev-req-file-manager:
      - alloc-req-number.ts
      - alloc-composite-id.ts
      - REQ固有検証と対応test
    agentdev-adr-file-manager:
      - alloc-adr-number.ts
      - ADR固有検証と対応test
    agentdev-spec-file-manager:
      - search-target-area.ts
      - SPEC固有検証と対応test
    agentdev-artifact-validation:
      - check-frontmatter-consistency.ts
      - check-entry-existence.ts
      - check-change-impact.ts
      - 上記が共有するlibと対応test
    invocation_rule: |
      command と兄弟skillは所有skillの内部scriptパスを直接参照、importしない。
      所有skillの公開操作契約へ委譲し、Scriptの物理パスとI/O詳細は所有skillのSPECまたはreferenceに置く。
  diagnostic_routing:
    agentdev-doc-diagnostics: "横断カテゴリ、証拠、finding形式、route統合"
    agentdev-req-structure-diagnostics: "REQ固有のSPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT"
    agentdev-doc-writing: "文章品質、文書種別責務、表現査読"
    agentdev-doc-map: "探索順、索引と基準文書の導線"
  authoritative_inputs:
    - docs/requirements/REQ-0103.md
    - docs/requirements/REQ-0119.md
    - docs/requirements/REQ-0143.md
    - docs/requirements/REQ-0162.md
    - docs/adr/ADR-0107.md
    - docs/adr/ADR-0123.md
    - docs/adr/ADR-0136.md
    - docs/specs/responsibilities/artifact-contracts.md
    - docs/specs/responsibilities/artifact-responsibilities.md
    - docs/specs/authoring/command-file-format.md
    - src/opencode/skills/agentdev-req-file-manager/
    - src/opencode/commands/agentdev/spec-save.md
    - src/opencode/commands/agentdev/inspect-docs.md
  execution_rules:
    - "作業開始時に最新HEADと対象数を再検証し、差異があれば識別子と契約を優先して補助件数だけを更新する"
    - "artifact_actionsのcontentをそのまま要件行へ貼らず、REQは安定契約、SPECは詳細仕様として再構成する"
    - "未合意の機能、公開契約変更、ハーネス実装変更を追加しない"
    - "既存accepted ADRは直接変更しない"
    - "同じ規則、script、判断表を複数の所有者へ複製しない"
    - "変更前後の成果物、副作用、停止状態を比較し、意味が変わる場合は停止する"
  required_outputs:
    - "全対象を一度だけ列挙し、変更分類、正規所有者、移送先、根拠、対応する受け入れ条件を持つ検証表"
    - "成果条件中心へ更新した17 commandと対応する17 command SPEC"
    - "責務と段階的開示を是正した既存skill、reference、対応skill SPEC"
    - "新規3 skill、そのreferenceまたはscript、専用skill SPEC"
    - "責務別に移管され、testと共有libを含めて重複しないscript群"
    - "更新済みREQ、横断SPEC、template、integrity rule"
    - "受け入れ条件23項目の最終対応表、変更前後の公開契約比較、検査とtestの結果"
  explicit_non_actions:
    - "REQ-0162は更新せず、ADR-0136、REQ-0103-163とともに回帰基準として使用する"
    - "accepted ADRを変更せず、新規ADRを既定では作成しない"
    - "japanese-tech-writingの構造変更や専用skill SPEC追加を行わない"
    - "Issue、PR、実装進捗をREQ本文へ記録しない"
    - "公開command名、成果物、ドメイン状態、安全境界、承認境界を変更しない"
  non_action_agreements:
    - "AG-017は新規ADRを既定で作成しない判断であり、REQ/ADR/SPECのartifact actionを生成しない"
  completion_state: |
    ユーザー判断を要する未決事項はない。Epic規模であることは停止理由ではなく、
    case-openがEpicとWaveへ分解する入力である。auto_ready:trueとして後続工程へ進む。

# agreed_items: 合意された個別項目。artifact_actions.source_items から ID 参照される
agreed_items:
  - id: AG-001
    content: |
      command は公開目的、入力、成果物、許可される副作用、安全境界、承認境界、停止条件、
      後続command との接続契約、順序を変えると成果物または安全性が変わる必須順序、
      利用する skill の名前と委譲する責務を所有する。
      結果へ影響しない内部手順、探索順、詳細分類表、重複例、ツール固有の引数、
      他 skill の内部 reference パス、内部 Step、Section、Phase、見出し名、
      ハーネス固有の起動方法、待機時間、並列度、再試行条件は command から除去する。
  - id: AG-002
    content: |
      skill は同一の判断モデルと責任境界を共有する再利用可能な判断および操作契約を所有する。
      SKILL.md は使用条件、対象外、入力、出力、副作用、主要な不変条件、
      必要な reference の選択条件を中心とする。
      詳細な判定表、スキーマ、例、失敗時手順は、必要な場合に限り当該 skill 自身の reference へ配置する。
      異なる判断モデル、入力、出力、責任境界を持つ内容は skill 分割候補として扱う。
  - id: AG-003
    content: |
      script は採番、構文解析、見出し検索、整合性検査など、同じ入力に対して同じ結果を返せる
      決定的処理を所有する。script は操作責任を持つ skill の配下に配置し、
      同一 script を複数 skill へ複製せず、正規な所有者を一つに定める。
      SPEC 固有の処理は当該 SPEC 操作 skill が、REQ および ADR 固有の処理はそれぞれの操作 skill が所有する。
      複数文書種別で共有する検証処理と共有ライブラリは agentdev-artifact-validation が所有する。
  - id: AG-004
    content: |
      REQ は外部から観測できる振る舞い、公開成果物、ドメイン状態、安全境界、承認境界、
      停止条件、後続工程との安定した接続契約、ハーネス非依存などの恒久的制約へ限定する。
      Step 番号、ツール引数、待機間隔、探索順、reference 内見出し、script の詳細な入出力形式は、
      安定した外部契約でない限り SPEC、skill、reference へ移す。
  - id: AG-005
    content: |
      SPEC は現在の振る舞い、スキーマ、判定規則、状態遷移、実装上必要な順序とパラメータを所有する。
      command SPEC は command の Step 番号を複製せず、成果物、副作用、停止状態、必須順序によって
      command と対応付ける。
  - id: AG-006
    content: |
      REQ-0162、ADR-0136、REQ-0103-163 が定めるハーネス責務と配布物責務の分離を回帰基準とする。
      配布 command、skill、reference、docs にハーネス固有の待機時間、並列度、再試行、
      起動引数を残さない。実行エージェントの選定、起動方法、実行制御パラメータは
      ハーネス側文書が所有する。
  - id: AG-007
    content: |
      agentdev-spec-file-manager を新規 skill として追加する。責務は SPEC の作成、更新、
      配置先判断、target_area による更新判断、SPEC 固有の整合性確認、SPEC 固有 script の選択と
      呼出契約に限定する。SPEC 内容の新規推論、accepted 昇格判断、REQ 操作、ADR 操作、
      commit、push、ユーザー承認は対象外とする。SPEC ライフサイクル規則の適用と整合性確認に限定し、
      状態遷移権限は case-close が担う ADR-0123 / REQ-0136-024 のまま維持する。
      責務が agentdev-req-file-manager および agentdev-adr-file-manager と重複しないこと。
  - id: AG-008
    content: |
      agentdev-doc-diagnostics を新規 skill として追加する。責務は docs 横断の診断カテゴリ、
      共通証拠構造、共通 finding 出力契約、文書種別別診断へのルーティングに限定する。
      REQ 固有の SPLIT、MERGE、MOVE、DUPLICATE、RETIRE、DRIFT 診断は agentdev-req-structure-diagnostics、
      文意品質は agentdev-doc-writing、探索順は agentdev-doc-map へ残留させる。
      責務が agentdev-doc-writing、agentdev-doc-map、agentdev-req-structure-diagnostics と
      重複しないこと。名称は agentdev-doc-diagnostics を維持し、REQ-0124 に
      診断ロジック skill 名での diagnostics 許容の例外境界を明記する。
  - id: AG-009
    content: |
      共通 script は agentdev-artifact-validation への委譲方式とする。兄弟 skill は同 skill の
      内部 script を直接 import またはパス参照せず、公開検証契約へ委譲する。
      この方釈により Command→Skill→Script の依存方向を維持し、新規 ADR 不要を維持する。
  - id: AG-010
    content: |
      command SPEC と command 定義の Step 番号一致を要求する規則を廃止する。
      REQ-0143-004 を廃止宣言し、command-file-format SPEC を更新して、
      成果物、副作用、停止状態、必須順序による対応付け規則へ置き換える。
  - id: AG-011
    content: |
      文書中の固定件数（command 数、skill 数、REQ 数等）が最新構成と一致するか、
      固定値を持たない表現へ変更する。document-type-responsibilities SPEC の
      固定件数記述を是正する。
  - id: AG-012
    content: |
      200行を超える SKILL.md は責務集中、不要な手順、例、作業履歴の混入について確認する。
      200行を超えることだけを不合格理由にしない。
      SKILL.md に移動済み Step、統合済み Step、将来候補、作業履歴を示す節を残さない。
  - id: AG-013
    content: |
      変更前後で代表的な入力に対する成果物、副作用、停止状態を維持する。
      各 command の公開目的、入力、成果物、許可される副作用、安全境界、承認境界、停止条件を
      欠落させない。公開 command 名、ドメイン状態、後続 command との接続契約を失わない。
  - id: AG-014
    content: |
      関連する文書整合性検査と script test が成功する。各対象について、変更不要、本文更新、
      reference 移送、script 移送、新規所有者への移管のいずれかが判定され、
      変更不要とした対象には変更不要と判断できる根拠がある。
  - id: AG-015
    content: |
      全参照先が配布先またはリポジトリ内の正規な位置で解決できる。
      command から他 skill の内部 reference パス、内部 Step、Section、Phase、見出し名への
      直接依存をなくす。
  - id: AG-016
    content: |
      REQ-0103 を統括規範として整理する。肥大化した既存要件行（約90行、SPLITシグナル4）を
      責務別の安定契約REQ または SPEC へ切り出し、REQ-0103 自体をアーティファクト責任分界の
      統括規範として機能させる。REQ-0119 は command、skill、親エージェント、サブエージェント間の
      責務に特化した規範として整理する。
  - id: AG-017
    content: |
      新規 ADR は作成しない。今回の変更を ADR-0107（Command/Skill/Template/Script 責任分界）
      および ADR-0123（SPEC lifecycle と spec-save の導入）の適用条件の精緻化として扱う。
      REQ-0119-033 が定める原則に従う。
  - id: AG-018
    content: |
      7テーマ（command中心化、skill是正、REQ-SPEC境界、SPEC操作所有者分離、文書診断所有者分離、
      ハーネス純化、integrity全件回帰）で既存REQ UPDATE を基本とし、新規REQ を機械的に増やさない。
      実装作業の分割、順序、進捗管理は Epic Issue と Wave へ委ねる。
      個別テーマの一覧や進捗は Epic Issue で管理し、REQ 本文に Issue 一覧や進行状態を持たせない。
  - id: AG-019
    content: |
      agentdev-artifact-validation を新規 skill として追加する。責務は複数文書種別で共有する
      決定的な検証 script と共有ライブラリの所有、公開検証契約、JSON結果契約に限定する。
      check-frontmatter-consistency、check-entry-existence、check-change-impact と、その共有ライブラリを
      正規所有対象とする。REQ、ADR、SPEC固有の内容判断、ファイル編集、保存、commit、push、
      ユーザー承認は対象外とする。利用側は内部scriptパスではなく公開検証契約へ委譲する。

# acceptance_traceability: RU-20260722-01の受け入れ条件23項目を一意に割り当てる
acceptance_traceability:
  - id: AC-001
    requirement: "基準時点の17 command、29 skill、17 command SPEC、28 skill SPEC、52 REQを重複なく評価する"
    owner: [AG-014]
    verification: [TS-012]
  - id: AC-002
    requirement: "全対象を変更不要、本文更新、reference移送、script移送、新規所有者移管のいずれかへ分類する"
    owner: [AG-014]
    verification: [TS-012]
  - id: AC-003
    requirement: "変更不要対象に判断根拠を記録する"
    owner: [AG-014]
    verification: [TS-012]
  - id: AC-004
    requirement: "commandが目的、入力、成果物、副作用、安全境界、承認境界、停止条件を欠落しない"
    owner: [AG-001]
    verification: [TS-001]
  - id: AC-005
    requirement: "commandに残す順序を成果物、安全性、外部契約へ影響するものに限定する"
    owner: [AG-001]
    verification: [TS-001]
  - id: AC-006
    requirement: "commandから他skillの内部reference、Step、Section、Phase、見出しへの依存をなくす"
    owner: [AG-015]
    verification: [TS-010]
  - id: AC-007
    requirement: "command SPECとcommand定義のStep番号一致要求をなくす"
    owner: [AG-010]
    verification: [TS-006]
  - id: AC-008
    requirement: "command SPECを成果物、副作用、停止状態、必須順序でcommandへ対応付ける"
    owner: [AG-005, AG-010]
    verification: [TS-006, TS-016]
  - id: AC-009
    requirement: "REQから安定契約ではないStep番号、ツール引数、待機間隔、探索順、reference内見出しを除く"
    owner: [AG-004]
    verification: [TS-004]
  - id: AC-010
    requirement: "REQ更新で公開command名、成果物、状態、安全、承認、停止、接続契約を失わない"
    owner: [AG-013]
    verification: [TS-008]
  - id: AC-011
    requirement: "REQ-0162、ADR-0136、REQ-0103-163のハーネス境界を維持する"
    owner: [AG-006]
    verification: [TS-005]
  - id: AC-012
    requirement: "配布物からハーネス固有の待機時間、並列度、再試行、起動引数を除く"
    owner: [AG-006]
    verification: [TS-005]
  - id: AC-013
    requirement: "agentdev-spec-file-managerがREQ、ADR操作skillと重複しない"
    owner: [AG-007]
    verification: [TS-013]
  - id: AC-014
    requirement: "agentdev-doc-diagnosticsが既存文書skillと重複しない"
    owner: [AG-008]
    verification: [TS-014]
  - id: AC-015
    requirement: "SPEC、REQ、ADR、共通scriptの正規所有者を一つに定める"
    owner: [AG-003, AG-019]
    verification: [TS-003, TS-015]
  - id: AC-016
    requirement: "同じscriptまたは判断規則を複数skillへ複製しない"
    owner: [AG-003, AG-009, AG-019]
    verification: [TS-003, TS-015, TS-017]
  - id: AC-017
    requirement: "200行超SKILL.mdの責務集中、不要手順、例、作業履歴を確認する"
    owner: [AG-012]
    verification: [TS-002, TS-018]
  - id: AC-018
    requirement: "200行超過だけを不合格理由にしない"
    owner: [AG-012]
    verification: [TS-002, TS-018]
  - id: AC-019
    requirement: "SKILL.mdから移動済みStep、統合済みStep、将来候補、作業履歴を除く"
    owner: [AG-012]
    verification: [TS-002, TS-018]
  - id: AC-020
    requirement: "固定件数を最新構成へ合わせるか固定値を持たない表現へ変更する"
    owner: [AG-011]
    verification: [TS-007]
  - id: AC-021
    requirement: "全参照先を配布先またはリポジトリ内の正規位置で解決できる"
    owner: [AG-015]
    verification: [TS-010]
  - id: AC-022
    requirement: "変更前後で代表入力の成果物、副作用、停止状態を維持する"
    owner: [AG-013]
    verification: [TS-008]
  - id: AC-023
    requirement: "関連する文書整合性検査とscript testを成功させる"
    owner: [AG-014]
    verification: [TS-009]

# artifact_actions: REQ/ADR/SPEC への保存対象を成果物別ではなく1つの配列に統合
artifact_actions:
  # === REQ 操作 ===
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-0103
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-009, AG-016, AG-018, AG-019]
    content: |
      REQ-0103 をアーティファクト責任分界の統括規範として整理する。
      目的セクションに統括規範としての位置づけを明示する。
      既存の肥大化した要件行（REQ-0103-001〜163 約90行）を整理し、以下の軸で再構成する。
      (1) command の公開契約（目的、入力、成果物、副作用、安全境界、承認境界、停止条件、
      後続command接続契約、必須順序、利用skill名と委譲責務）を統括する要件行を集約。
      (2) skill の責務境界、粒度基準（同一判断モデル、同一責任境界、同一USE FOR/DO NOT USE FOR）、
      reference 配置基準を統括する要件行を集約。
      (3) script の決定的処理、所有権、複製禁止を統括する要件行を集約。
      (4) 個別実装詳細（REQ-0103-090〜099 の内部参照境界等）は SPEC（artifact-responsibilities.md、
      artifact-contracts.md）または agentdev-skill-authoring へ移送候補として整理する。
      (5) REQ-0103-159 を更新し、script 配置を責務別所有へ変更する。REQ固有scriptは
      agentdev-req-file-manager、ADR固有scriptはagentdev-adr-file-manager、SPEC固有scriptは
      agentdev-spec-file-manager、文書種別横断の共通検証scriptと共有libは
      agentdev-artifact-validationを正規所有者とする。利用側は内部scriptパスを参照せず、
      所有skillの公開操作契約へ委譲する。
      (6) REQ-0103-163 を強化し、配布command/skill/docs へのハーネス固有パラメータ
      （待機時間、並列度、再試行、起動引数）の混入を明示的に禁止する。
      切り出し先となる個別REQ または SPEC は本要件doc の他 action で定義する。

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: REQ-0119
    source_items: [AG-001, AG-002, AG-004, AG-015]
    content: |
      REQ-0119 を command、skill、親エージェント、サブエージェント間の責務に特化した規範として整理する。
      REQ-0119-033（正規定義元指定原則、ADR-0107 の適用条件の精緻化）を維持・強化し、
      今回の変更が同原則の適用であることを明示する。
      REQ-0119-034（同一契約再定義抑止）を強化し、command から他 skill の内部参照
      （reference パス、Step、Section、Phase、見出し名）への直接依存を除去する原則を明確化する。
      REQ-0119-035（公開契約維持）を強化し、変更前後で各配布物の公開契約を維持することを明示する。

  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: REQ-0143
    source_items: [AG-010]
    content: |
      REQ-0143-004 を廃止宣言する。
      廃止理由: command SPEC と command 定義の Step 番号一致要求は、受け入れ条件中心の
      責務分離方針（RU-20260722-01 合意）に合致しない。command SPEC は Step 番号を複製せず、
      成果物、副作用、停止状態、必須順序によって command と対応付ける規則へ置き換える。
      後続要件行として REQ-0143-005（新規）を追加し、command SPEC は成果物、副作用、
      停止状態、必須順序により command 定義と対応付けることを定める。

  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: REQ-0102
    source_items: [AG-004]
    content: |
      REQ-0102のreq-define、req-saveに関する要件を、入力、生成する要件成果物、
      ユーザー質問境界、未解決時の停止状態、保存結果、後続commandとの接続契約へ整理する。
      Step番号、glob/grep、探索順、詳細フィールド、ツール固有の呼出しなどはSPECまたはskillへ移す。
      REQ-0102-057の実装詳細分離原則と、利用者が観測する応答、分析契約は維持する。

  - id: ACT-REQ-007
    artifact: req
    operation: update
    target: REQ-0136
    source_items: [AG-007]
    content: |
      REQ-0136（REQ/SPEC 責務分離の徹底と新ワークフロー）を更新し、
      agentdev-spec-file-manager 新設に伴う SPEC 操作責務の分離を反映する。
      REQ-0136-029（spec-save 決定的 script 配置）を更新し、SPEC 操作 script は
      agentdev-spec-file-manager 配下へ配置する規則へ変更する。
      req-save と spec-save の操作対象境界を明確化する。

  - id: ACT-REQ-008
    artifact: req
    operation: update
    target: REQ-0109
    source_items: [AG-008]
    content: |
      REQ-0109（inspect-docs / REQ再構成運用）を更新し、agentdev-doc-diagnostics 新設に伴う
      診断責務の分離を反映する。inspect-docs command は診断の実行と finding 出力を担い、
      診断カテゴリ、証拠構造、出力契約は agentdev-doc-diagnostics skill へ委譲する。
      inspect-docs の横断診断を一次所有する専用 skill が存在することを要件行に追加する。

  - id: ACT-REQ-009
    artifact: req
    operation: update
    target: REQ-0124
    source_items: [AG-008]
    content: |
      REQ-0124（AgentDevFlow inspect-* 検出コマンド群と inspect lifecycle）を更新し、
      診断ロジック skill 名での diagnostics 許容の例外境界を明記する。
      agentdev-doc-diagnostics と agentdev-req-structure-diagnostics を diagnostics 系 skill として
      許容し、inspect-* 系 command との命名境界を明確化する。

  - id: ACT-REQ-010
    artifact: req
    operation: update
    target: REQ-0108
    source_items: [AG-014]
    content: |
      REQ-0108（docs-check / 検証・テスト）を更新し、変更前後での文書整合性検査の強化を反映する。
      関連する文書整合性検査と script test が成功することを要件行として維持・強化する。

  - id: ACT-REQ-011
    artifact: req
    operation: update
    target: REQ-0144
    source_items: [AG-014]
    content: |
      REQ-0144（docs-check/integrity 運用是正）を更新し、今回の変更での全件回帰検査の運用を反映する。

  - id: ACT-REQ-012
    artifact: req
    operation: update
    target: REQ-0145
    source_items: [AG-014]
    content: |
      REQ-0145（docs-check/integrity 検出設計改善）を更新し、今回の変更での検出設計の改善点を反映する。

  - id: ACT-REQ-013
    artifact: req
    operation: update
    target: REQ-0130
    source_items: [AG-006]
    content: |
      REQ-0130（case-run / 実装パイプライン）を更新し、ハーネス純化の適用を反映する。
      agentdev-case-run-execution-adapter のハーネス固有パラメータ（待機時間等）を除去し、
      抽象 IF と references/<harness>.md への移送を要件行に反映する。

  - id: ACT-REQ-014
    artifact: req
    operation: update
    target: REQ-0149
    source_items: [AG-004, AG-015]
    content: |
      REQ-0149 のWindows UTF-8安全条件を維持しつつ、reference内のStep番号や見出し名への依存を除去する。
      REQにはWRITE前のUTF-8安全条件と操作結果だけを残し、具体的な操作順、実行コマンド、
      reference内の位置はagentdev-gh-cliのSPECまたはreferenceへ配置する。

  - id: ACT-REQ-015
    artifact: req
    operation: update
    target: REQ-0131
    source_items: [AG-004, AG-013]
    content: |
      case-closeのマージ安全契約として、マージ可能性が確定するまで進まないこと、
      上限超過時に停止すること、安全な同期、空検査による見逃しを防ぐことを維持する。
      具体的な待機秒数、間隔、gh引数、同期コマンド、再実行方法はSPECまたは所有skillへ移す。

  # === SPEC 操作 ===
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target_spec: docs/specs/authoring/command-file-format.md
    target_area: "command SPEC と command 定義の Step 番号一致（REQ-0143-004）"
    source_items: [AG-005, AG-010]
    content: |
      command SPEC と command 定義の Step 番号一致を要求する規則を廃止する。
      代わりに、command SPEC は成果物、副作用、停止状態、必須順序によって command 定義と
      対応付ける規則を定める。Step 番号を持たない command SPEC は適用対象外とし、
      その旨を SPEC に文書化する。

  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target_spec: docs/specs/responsibilities/document-type-responsibilities.md
    target_area: "SKILL 構造（概要節/機能節役割分担）"
    source_items: [AG-011]
    content: |
      文書中の固定件数（「全27ファイル」等）を最新構成（29件）に一致させるか、
      固定値を持たない表現へ変更する。文書種別責務マトリックスの件数記述を動的生成または
      範囲表記へ変更し、構成変更時の陳腐化を防止する。

  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-update
    target_spec: docs/specs/responsibilities/artifact-contracts.md
    source_items: [AG-003, AG-009, AG-019]
    content: |
      script 所有権と委譲方式の規則を定める。各 script の正規な所有者を文書種別ごとに定義し、
      SPEC 固有 script は SPEC 操作 skill、REQ/ADR 固有 script は各操作 skill、
      文書種別横断の共通検証 script と共有libは agentdev-artifact-validation を正規所有者とする。
      兄弟 skill は所有者 skill の内部 script を直接 import またはパス参照せず、
      所有者 skill の公開操作契約へ委譲する規則を定める。

  - id: ACT-SPEC-004
    artifact: spec
    operation: spec-update
    target_spec: docs/specs/responsibilities/artifact-responsibilities.md
    target_area: "成果物責任表"
    source_items: [AG-007, AG-008, AG-019]
    content: |
      agentdev-spec-file-manager、agentdev-doc-diagnostics、agentdev-artifact-validation を
      正規所有者台帳へ追加する。
      agentdev-spec-file-manager の責務（SPEC作成、更新、配置判断、target_area処理、
      SPEC固有整合性確認、SPEC固有script呼出契約）と対象外（SPEC内容推論、accepted昇格判断、
      REQ/ADR操作、commit/push）を明記する。
      agentdev-doc-diagnostics の責務（docs横断診断カテゴリ、共通証拠構造、共通finding出力契約、
      文書種別別診断ルーティング）と対象外（診断対象の修正、promote判断、REQ/SPEC/RU保存、
      commit/push、Issue/PR操作）を明記する。
      agentdev-artifact-validation の責務（文書種別横断の決定的検証script、共有lib、
      公開検証契約、JSON結果契約）と対象外（内容判断、ファイル編集、保存、承認、
      commit/push）を明記する。
      既存 skill（agentdev-req-file-manager、agentdev-adr-file-manager、agentdev-doc-writing、
      agentdev-doc-map、agentdev-req-structure-diagnostics）との責務重複がないことを明記する。

  - id: ACT-SPEC-005
    artifact: spec
    operation: spec-create
    target_spec:
      operation: create
      domain: skills
      slug: agentdev-spec-file-manager
    source_items: [AG-007]
    content: |
      # agentdev-spec-file-manager SPEC

      ## 目的
      SPEC ファイルの作成、更新、配置先判断、target_area 処理、SPEC 固有整合性確認、
      SPEC 固有 script の選択と呼出契約を担う操作用 skill の仕様を定める。

      ## 責務
      - SPEC の作成、更新、配置先判断
      - target_area による更新判断
      - SPEC ライフサイクル規則の適用と整合性確認
      - SPEC 固有 script の選択と呼出契約

      ## 対象外
      - REQ 操作、ADR 操作
      - SPEC 内容の新規推論
      - accepted 昇格判断（case-close が担う、ADR-0123 / REQ-0136-024 準拠）
      - ユーザー承認
      - commit、push
      - 共通 script の重複実装

      ## 境界
      agentdev-req-file-manager（REQ操作）および agentdev-adr-file-manager（ADR操作）との
      責務重複がないこと。SPEC 操作は本 skill が正規の所有者となる。

  - id: ACT-SPEC-006
    artifact: spec
    operation: spec-create
    target_spec:
      operation: create
      domain: skills
      slug: agentdev-doc-diagnostics
    source_items: [AG-008]
    content: |
      # agentdev-doc-diagnostics SPEC

      ## 目的
      docs 横断の診断カテゴリ、共通証拠構造、共通 finding 出力契約、
      文書種別別診断へのルーティングを担う診断判断 skill の仕様を定める。

      ## 責務
      - inspect-docs の診断カテゴリ
      - 診断判定規則
      - 証拠の構造
      - 診断結果の出力契約
      - 診断に必要な reference または script の選択

      ## 対象外
      - 診断対象の修正
      - promote 判断
      - REQ、SPEC、RU の保存
      - commit、push
      - Issue、PR 操作
      - REQ 固有の SPLIT、MERGE、MOVE、DUPLICATE、RETIRE、DRIFT 診断（agentdev-req-structure-diagnostics）
      - 文意品質診断（agentdev-doc-writing）
      - 探索順（agentdev-doc-map）

      ## 境界
      agentdev-doc-writing、agentdev-doc-map、agentdev-req-structure-diagnostics との
      責務重複がないこと。docs 横断診断は本 skill が正規の所有者となる。

  - id: ACT-SPEC-007
    artifact: spec
    operation: spec-update
    target_spec: docs/specs/responsibilities/artifact-contracts.md
    target_area: "スキル粒度契約"
    source_items: [AG-002, AG-012]
    content: |
      Skill 粒度契約を強化する。200行を超える SKILL.md は責務集中、不要な手順、例、
      作業履歴の混入について確認されること。200行を超えることだけを不合格理由にしないこと。
      SKILL.md に移動済み Step、統合済み Step、将来候補、作業履歴を示す節を残さないこと。
      異なる判断モデル、入力、出力、責任境界を持つ内容は skill 分割候補として扱うこと。

  - id: ACT-SPEC-008
    artifact: spec
    operation: spec-create
    target_spec:
      operation: create
      domain: skills
      slug: agentdev-artifact-validation
    source_items: [AG-003, AG-009, AG-019]
    content: |
      # agentdev-artifact-validation SPEC

      ## 目的
      複数文書種別で共有する決定的検証script、共有ライブラリ、公開検証契約、
      JSON結果契約を担う検証skillの仕様を定める。

      ## 責務
      - check-frontmatter-consistency.ts の所有
      - check-entry-existence.ts の所有
      - check-change-impact.ts の所有
      - 上記scriptが利用する共有libとtestの所有
      - 利用側skillへ内部パスを公開しない検証操作契約
      - 入力、JSON結果、エラー、副作用なしの共通契約

      ## 対象外
      - REQ、ADR、SPEC固有の内容判断
      - 文書の作成、更新、削除
      - 保存、ユーザー承認、commit、push
      - REQ番号、ADR番号、要件行IDの採番
      - target_areaの検索

      ## 境界
      REQ固有scriptはagentdev-req-file-manager、ADR固有scriptはagentdev-adr-file-manager、
      SPEC固有scriptはagentdev-spec-file-managerが所有する。利用側は本skillの内部scriptを
      直接参照せず、公開検証契約へ委譲する。同一scriptまたは共有libを複製しない。

  - id: ACT-SPEC-009
    artifact: spec
    operation: spec-update
    target_spec: docs/specs/commands/_template.md
    source_items: [AG-001, AG-005, AG-010, AG-013]
    content: |
      command SPECテンプレートをStep群の複製から、公開目的、入力、成果物、許可副作用、
      安全境界、承認境界、停止状態、必須順序、利用skill責務、検証条件の記述へ変更する。
      Step番号は対応付け識別子として要求しない。

  - id: ACT-SPEC-010
    artifact: spec
    operation: spec-update
    target_spec: docs/specs/skills/_template.md
    source_items: [AG-002, AG-003, AG-012]
    content: |
      skill SPECテンプレートを提供する判断、USE FOR、DO NOT USE FOR、入力、出力、副作用、
      不変条件、reference選択条件、所有script、検証条件中心へ変更する。
      操作手順、例、作業履歴の列挙を必須にしない。

  - id: ACT-SPEC-011
    artifact: spec
    operation: spec-update
    target_spec: docs/specs/foundations/design-principles.md
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005]
    content: |
      commandを高位実行骨格だけで説明せず、公開成果物、権限境界、停止条件、必要な順序を
      所有するものとして定義する。skill、reference、script、REQ、SPECの配置原則を、
      正規所有者、手段の自由度、受け入れ条件、決定的処理の観点で同期する。

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: |
      agentdev-doc-diagnostics の名称が REQ-0124 命名政策（inspect-* 系への統一）と
      関係不明。agentdev-inspect-docs へリネームするか、例外として維持するか。
    resolution: |
      agentdev-doc-diagnostics の名称を維持し、REQ-0124 に
      「診断ロジック skill 名では diagnostics を許容する」例外境界を明記する。
      根拠: RU-20260722-01 で合意済みの名称であり、agentdev-req-structure-diagnostics の
      先例がある。REQ-0124 への例外明記により命名政策との整合を確保する。
      本内容を確定済みの命名判断として扱い、再質問しない。

  - id: CR-002
    conflict: |
      文書種別横断の共通検証scriptに適合する既存所有skillがなく、
      agentdev-req-file-managerに残すとREQ操作責務との不整合が継続する。
    resolution: |
      agentdev-artifact-validationを3件目の新規skillとして追加する。
      check-frontmatter-consistency、check-entry-existence、check-change-impactと共有lib、testを
      同skillの正規所有対象とする。兄弟skillとcommandは内部scriptを直接参照せず、
      公開検証契約へ委譲する。本内容は承認済みであり、再質問しない。

  - id: CR-003
    conflict: |
      REQ-0103 の健全性メトリクスが SPLIT 推奨（要件行数約90行、SPLITシグナル4）。
      REQ-0103 を統括規範として UPDATE する方針と、SPLIT 推奨状態が両立するか。
    resolution: |
      今回の RU の「REQとSPECの境界是正」テーマ（テーマ3）で REQ-0103 自体の整理を実施する。
      肥大化した個別要件行を責務別の安定契約REQ または SPEC へ切り出し、REQ-0103 を統括規範として
      機能するよう要件行数を適正化する。これにより SPLIT シグナルを解消しつつ、統括規範化を実現する。
      切り出し先は ACT-REQ-001 の content に記載。

  - id: CR-004
    conflict: |
      RU 受け入れ条件の項目数について24項目という記録と、RU本文の実査結果23項目が不一致。
    resolution: |
      RU-20260722-01 の受け入れ条件セクションを実査すると23項目。
      RU-20260722-01本文に存在する23項目を正とする。
      23項目すべてに割当先を明示済み（8 親REQ完了条件、3 既存REQ UPDATE、8 テーマ別REQ、4 SPEC詳細条件）。
      脱落なし、未割当なし、重複なし。

  - id: CR-005
    conflict: |
      Epic規模であることをauto_gateの停止理由として扱うか、case-openの分解入力として扱うか。
    resolution: |
      Epic規模は未解決事項ではなく、case-openがEpic IssueとWaveへ分解するための入力とする。
      未決事項は解消済みで、agentdev-artifact-validation追加も承認済みである。
      unresolved_questions、unresolved_conflicts、out_of_repo_operations、stop_reasonsを空とし、
      auto_ready:trueで後続工程へ進む。

# operation_units: 複数RU入力時の統合/分離結果。単一REQ操作の場合も1件の OU として出力
operation_units:
  - ou_id: OU-001
    source_ru: RU-20260722-01
    target_req: REQ-0103
    operation: update
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: epic
    included_actions: [ACT-REQ-001, ACT-SPEC-003, ACT-SPEC-004, ACT-SPEC-007, ACT-SPEC-009, ACT-SPEC-010, ACT-SPEC-011]
    result: {}
  - ou_id: OU-002
    source_ru: RU-20260722-01
    target_req: REQ-0119
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: epic
    included_actions: [ACT-REQ-002]
    result: {}
  - ou_id: OU-003
    source_ru: RU-20260722-01
    target_req: REQ-0143
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: epic
    included_actions: [ACT-REQ-003, ACT-SPEC-001]
    result: {}
  - ou_id: OU-005
    source_ru: RU-20260722-01
    target_req: REQ-0136
    target_spec: docs/specs/skills/agentdev-spec-file-manager.md
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: epic
    included_actions: [ACT-REQ-007, ACT-SPEC-005]
    result: {}
  - ou_id: OU-006
    source_ru: RU-20260722-01
    target_req: REQ-0109
    target_spec: docs/specs/skills/agentdev-doc-diagnostics.md
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: epic
    included_actions: [ACT-REQ-008, ACT-REQ-009, ACT-SPEC-006]
    result: {}
  - ou_id: OU-007
    source_ru: RU-20260722-01
    target_req: REQ-0108
    operation: update
    scale: standard
    depends_on: [OU-001, OU-002, OU-003, OU-005, OU-006, OU-008, OU-009]
    recommended_order: 4
    issue_policy: epic
    included_actions: [ACT-REQ-010, ACT-REQ-011, ACT-REQ-012, ACT-SPEC-002]
    result: {}
  - ou_id: OU-008
    source_ru: RU-20260722-01
    target_req: REQ-0103
    target_spec: docs/specs/skills/agentdev-artifact-validation.md
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: epic
    included_actions: [ACT-SPEC-008]
    result: {}
  - ou_id: OU-009
    source_ru: RU-20260722-01
    target_req: REQ-0102
    operation: update
    scale: large
    depends_on: [OU-001, OU-002]
    recommended_order: 3
    issue_policy: epic
    included_actions: [ACT-REQ-005, ACT-REQ-013, ACT-REQ-014, ACT-REQ-015]
    result: {}

# test_strategy: 各合意項目（AG-*）の検証方法。各項目は3要素（verification / pass_criteria / on_failure）を必須とする
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      17 command（src/opencode/commands/agentdev/*.md）を網羅確認し、各 command が公開目的、
      入力、成果物、副作用、安全境界、承認境界、停止条件、後続command接続契約、必須順序、
      利用skill名と委譲責務を所有しているか検査する。同時に、結果へ影響しない内部手順、
      探索順、詳細分類表、重複例、ツール引数、他skill内部参照、ハーネス固有パラメータが
      除去されているか検査する。
    pass_criteria: |
      全17 command が公開契約要素を欠落せず、除去対象要素を含まないこと。
    on_failure: |
      fix-and-reverify。欠落要素は該当 command へ追加し、除去対象要素は該当 skill/reference
      または SPEC へ移送して再検証する。

  - id: TS-002
    target_item: AG-002
    verification: |
      29 skill（src/opencode/skills/agentdev-*/SKILL.md）を網羅確認し、各 SKILL.md が
      使用条件、対象外、入出力、副作用、不変条件、reference選択条件を中心としているか検査する。
      200行を超える SKILL.md（7件）について責務集中、不要な手順、例、作業履歴の混入を確認する。
    pass_criteria: |
      全29 SKILL.md が中心要素を持ち、200行超のものは混入確認済みであること。
    on_failure: |
      fix-and-reverify。詳細は reference へ移送し、作業履歴等は除去して再検証する。

  - id: TS-003
    target_item: AG-003
    verification: |
      script_ownershipの割当てどおり、REQ固有scriptがagentdev-req-file-manager、ADR固有scriptが
      agentdev-adr-file-manager、SPEC固有scriptがagentdev-spec-file-manager、共通検証scriptと
      共有libがagentdev-artifact-validationに配置されているか確認する。同一scriptまたはlibが
      複製されていないこと、利用側が内部scriptパスを参照せず公開操作契約へ委譲することを検査する。
    pass_criteria: |
      各 script の正規所有者が一つに定まり、複製がないこと。
    on_failure: |
      fix-and-reverify。複製された script を正規所有者へ集約し、利用側は所有者 skill の
      公開操作契約へ委譲して再検証する。

  - id: TS-004
    target_item: AG-004
    verification: |
      52 REQ ファイル（docs/requirements/REQ-*.md）を網羅確認し、各要件行が
      外部観測可能振舞、公開成果物、ドメイン状態、安全境界、承認境界、停止条件、
      後続工程接続契約、ハーネス非依存のいずれかに該当するか検査する。
      Step番号、ツール引数、待機間隔、探索順、reference内見出し、script詳細入出力形式が
      安定契約でない限り含まれていないか検査する。
    pass_criteria: |
      全52 REQ の要件行が外部契約に限定され、実装詳細を含まないこと。
    on_failure: |
      fix-and-reverify。実装詳細は SPEC、skill、reference へ移送して再検証する。

  - id: TS-005
    target_item: AG-006
    verification: |
      配布 command、skill、reference、docs（docs/ 配下）を網羅確認し、ハーネス固有の
      待機時間、並列度、再試行、起動引数が含まれていないか検査する。
      特に agentdev-case-run-execution-adapter の具体待機時間を確認する。
    pass_criteria: |
      配布物にハーネス固有パラメータが残存しないこと。
    on_failure: |
      fix-and-reverify。ハーネス固有パラメータを references/<harness>.md へ移送して再検証する。

  - id: TS-006
    target_item: AG-010
    verification: |
      command-file-format SPEC（docs/specs/authoring/command-file-format.md）と REQ-0143 を確認し、
      Step 番号一致要求が廃止され、成果物・副作用・停止状態・必須順序による対応付け規則へ
      置き換わっているか検査する。
    pass_criteria: |
      Step 番号一致要求がなく、対応付け規則が定義されていること。
    on_failure: |
      fix-and-reverify。SPEC と REQ を更新して再検証する。

  - id: TS-007
    target_item: AG-011
    verification: |
      document-type-responsibilities SPEC を確認し、固定件数が最新構成と一致するか、
      固定値を持たない表現へ変更されているか検査する。
    pass_criteria: |
      固定件数が最新構成と一致、または固定値を持たない表現であること。
    on_failure: |
      fix-and-reverify。SPEC を更新して再検証する。

  - id: TS-008
    target_item: AG-013
    verification: |
      変更前後で代表的な入力（各 command の典型的実行パス）に対する成果物、副作用、
      停止状態を比較検査する。git diff と docs-check により回帰検証する。
    pass_criteria: |
      変更前後で公開契約（公開command名、成果物、ドメイン状態、安全境界、承認境界、停止条件、
      後続command接続契約）が維持されること。
    on_failure: |
      fix-and-reverify。公開契約の欠落を復元して再検証する。

  - id: TS-009
    target_item: AG-014
    verification: |
      関連する文書整合性検査（docs-check、integrity rule catalog）と script test
      （npm test / bun test）を実行し、成功するか検証する。
    pass_criteria: |
      全整合性検査と script test が成功すること。
    on_failure: |
      fix-and-reverify。検出された不整合を修正して再検証する。

  - id: TS-010
    target_item: AG-015
    verification: |
      全17 command を確認し、他 skill の内部 reference パス、内部 Step、Section、Phase、
      見出し名への直接依存がないか検査する。
    pass_criteria: |
      command から他 skill 内部構造への直接依存がないこと。
    on_failure: |
      fix-and-reverify。直接依存を skill 名レベルの参照へ変更して再検証する。

  - id: TS-011
    target_item: AG-016
    verification: |
      REQ-0103がアーティファクト責任分界の統括規範として明示され、個別のツール引数、
      script物理パス、内部Step、作業履歴がREQまたはSPECの正規所有先へ移されているか確認する。
      既存のSPLITシグナルを再計測し、残留するシグナルには分割しない根拠があるか確認する。
    pass_criteria: |
      統括規範としての位置づけが目的セクションに明示され、実装詳細が正規所有先へ移され、
      残留するSPLITシグナルがないか、残留理由が記録されていること。行数だけで合否判定しない。
    on_failure: |
      fix-and-reverify。責務別の安定契約REQまたはSPECへ移して再検証する。

  - id: TS-012
    target_item: AG-014
    verification: |
      基準時点の17 command、29 skill、17 command SPEC、28 skill SPEC、52 REQを一覧化し、
      各対象が一度だけ現れることを確認する。各行に変更不要、本文更新、reference移送、
      script移送、新規所有者移管のいずれかと、その判定根拠を記録する。
    pass_criteria: |
      対象の欠落、重複、未判定がなく、変更不要行にも根拠があること。
    on_failure: |
      stop-and-fix。欠落、重複、未判定を解消するまで個別変更を完了扱いにしない。

  - id: TS-013
    target_item: AG-007
    verification: |
      agentdev-spec-file-managerのUSE FOR、DO NOT USE FOR、入力、出力、副作用、所有script、
      状態遷移権限をagentdev-req-file-manager、agentdev-adr-file-managerと比較する。
    pass_criteria: |
      SPEC操作だけを所有し、REQ/ADR操作、SPEC内容推論、accepted昇格、承認、commit、pushを所有しないこと。
    on_failure: |
      stop-and-fix。責務表とskill SPECを修正し、重複が解消するまで追加を確定しない。

  - id: TS-014
    target_item: AG-008
    verification: |
      agentdev-doc-diagnosticsの診断カテゴリ、証拠、finding形式、routeを、
      agentdev-req-structure-diagnostics、agentdev-doc-writing、agentdev-doc-mapと比較する。
    pass_criteria: |
      横断編成と結果統合だけを所有し、REQ固有診断、文章品質、探索順を再定義しないこと。
    on_failure: |
      stop-and-fix。専門診断を既存skillへ戻し、横断契約だけになるまで再検証する。

  - id: TS-015
    target_item: AG-019
    verification: |
      agentdev-artifact-validationの公開検証契約、所有script、共有lib、testを確認し、
      利用側commandとskillに内部scriptパス参照がないことを検査する。
    pass_criteria: |
      共通検証scriptと共有libの所有者が一つで、内容判断、編集、保存、承認、commit、pushを行わず、
      利用側が公開検証契約だけに依存すること。
    on_failure: |
      stop-and-fix。直接参照または重複実装を除去し、公開契約経由へ統一して再検証する。

  - id: TS-016
    target_item: AG-005
    verification: |
      17 command SPECを対応commandと比較し、Step番号ではなく成果物、副作用、停止状態、
      必須順序で同じ公開契約を記述していることを確認する。
    pass_criteria: |
      全command SPECが公開契約を欠落せず、Step番号一致へ依存しないこと。
    on_failure: |
      fix-and-reverify。対応付けを成果条件へ変更し、公開契約の欠落を補う。

  - id: TS-017
    target_item: AG-009
    verification: |
      commandと兄弟skillから他skillのscripts/配下への直接パス参照とimportを検索し、
      所有skillの公開操作契約への委譲に置換されていることを確認する。
    pass_criteria: |
      所有skill自身の内部案内を除き、利用側に他skillの内部script依存がないこと。
    on_failure: |
      fix-and-reverify。直接依存を公開操作契約へ置換する。

  - id: TS-018
    target_item: AG-012
    verification: |
      200行超SKILL.mdを確認し、責務集中、不要手順、例、作業履歴を分類する。
      移動済みStep、統合済みStep、将来候補、作業履歴の残存を検索する。
    pass_criteria: |
      不要な履歴節がなく、200行超の各skillに維持または分割の責務上の根拠があること。
      行数だけで不合格にしないこと。
    on_failure: |
      fix-and-reverify。不要記述を削除またはreferenceへ移し、責務根拠を再確認する。

  - id: TS-019
    target_item: AG-017
    verification: |
      ADR-0107、ADR-0123、ADR-0136と変更後の責務境界を比較する。
      アーキテクチャ助言結果に、既存ADRで表現できない新しい不可逆な判断がないことを確認する。
    pass_criteria: |
      既存ADRの適用として説明でき、新規ADRが不要であること。反証がある場合は実装へ進まないこと。
    on_failure: |
      stop-and-escalate。変更対象となる既存決定と新しい判断を示し、ADR要否を再度ユーザー判断へ戻す。

  - id: TS-020
    target_item: AG-018
    verification: |
      REQ本文にIssue一覧、Wave進捗、作業順が混入していないことを確認し、
      7テーマの各artifact actionがいずれかのoperation unitへ一度だけ割り当てられていることを確認する。
    pass_criteria: |
      REQは安定契約に限定され、全artifact actionが欠落、重複なくOUへ割り当てられていること。
    on_failure: |
      fix-and-reverify。進捗情報をcase_open_hintsへ移し、actionとOUの対応を修正する。

# case_open_hints: case-open 構成生成への参考情報（Issue 階層は case-open が決定する）
case_open_hints:
  epic_needed: true
  decomposition: |
    7テーマを3 Wave 構成で提案する。
    Wave 1（基盤確立）: テーマ3（REQ-SPEC境界是正、REQ-0103 自体の整理）+ テーマ6（ハーネス純化）
    Wave 2（適用展開）: テーマ1（command中心化）+ テーマ2（skill是正）+ テーマ7（integrity全件回帰）
    Wave 3（新規skill追加）: テーマ4（SPEC操作所有者分離、agentdev-spec-file-manager 新設）+
      テーマ5（文書診断所有者分離、agentdev-doc-diagnostics 新設）+
      文書種別横断の共通検証所有者分離（agentdev-artifact-validation 新設）
    各 Wave 内の操作は依存関係に基づき順序付けする。
  wave_hints:
    - "Wave 1: OU-001（REQ-0103整理）、OU-002（REQ-0119）。REQ-0162は更新せず回帰基準として使用"
    - "Wave 2: OU-003（REQ-0143 APPEND）、OU-009（REQ-0102/0130/0131/0149の実装詳細分離）、関連command/skill/SPEC更新"
    - "Wave 3: OU-005（REQ-0136 + agentdev-spec-file-manager SPEC）、OU-006（REQ-0109 + agentdev-doc-diagnostics SPEC）、OU-008（REQ-0103 + agentdev-artifact-validation SPEC）、OU-007（REQ-0108 全件回帰）"
```

# summary

<!-- 人間可読サマリー。後続工程の原本としては扱われない。
  処理の原本は上記 # draft-data YAML ブロックである。
  検討経緯や採用しない方針は処理対象として残さない。 -->

受け入れ条件中心の command・skill 責務是正。REQ-0103 を統括規範として整理し、7テーマで既存REQ UPDATE を基本とする。新規 ADR は原則不要（REQ-0119-033 整合）。新規 skill 3件（agentdev-spec-file-manager、agentdev-doc-diagnostics、agentdev-artifact-validation）を追加する。RU 受け入れ条件23項目はacceptance_traceabilityで割当て済み、未決事項なし、auto_ready:true。Epic 規模はcase-openが3 Waveへ分解する。
