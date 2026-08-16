---
draft_type: req_draft
topic_slug: command-skill-conciseness-modernization
status: draft
created_at: 2026-08-16T17:19:27+09:00
source_rus:
  - RU-0018
---

# draft-data

```yaml
work_type: maintenance

summary: >-
  RU-0018 に基づき、AgentDevFlow 配布物（コマンド・スキル）の記述を3層基準へ刷新する。
  層1（コスト）: description 単体 600 文字 hard limit、集約予算 平均 350×N（warn）、OpenCode 仕様 1024 文字は検証不通過線。
  層2（形式）: USE FOR 二重保持廃止、ルーティング表禁止、制約の単一所属。
  層3（スタイル）: 前提・出力・検証による工程記述、不変条件集約、否定命令は硬境界のみ。
  品質基準 SPEC 改定（4 ファイル、5 action）が機械的編集（description 圧縮、二重保持廃止、スタイル転換、references 統廃合）に先行し、機械検査を既存枠組み（repo-agentdev-integrity / docs-check）へ追加する。
  soft guard は簡潔トリガー項方式とし、workflow-skill-model.md の二層様式を機構不変で維持する。
  baseline 実測（2026-08-16、49スキル）: 平均 556 / 最大 1179 / 合計 27250 文字、1024 超過 2 件、USE FOR 二重保持 27 スキル、desc 内 soft guard 19 スキル。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

spec_save:
  consumed_at: "2026-08-16"
  spec_actions_consumed: true
  action_mapping:
    ACT-SPEC-001: "docs/specs/skills/agentdev-skill-authoring.md「skill authoring 段階的開示基準」セクション置換（層1〜3 skill 記述基準へ改題）"
    ACT-SPEC-002: "docs/specs/skills/agentdev-skill-authoring.md「Workflow Skill Soft Guard（REQ-027-002）」セクション置換（簡潔トリガー項方式へ）"
    ACT-SPEC-003: "docs/specs/skills/agentdev-command-authoring.md「command authoring 基準」セクション置換（層1〜3適用へ改題）"
    ACT-SPEC-004: "docs/specs/authoring/command-file-format.md「手順セクション形式」セクション置換（前出出力検証表・ガードレール番号・機械検査対象の3節を含む）。follow-up で旧節（ガードレール番号・機械検査対象）を正規見出しへマージし改定サフィックス解消（merged-canonical、旧検出テーブル削除、thin Command モデル検査サブセクションは保持）"
    ACT-SPEC-005: "applied via follow-up（case-auto orchestrator による bounded parent decision resolution、実在見出し宛てに再指定）: workflow-skill-model.md「### thin Command の workflow 節標準構造」所有権文更新 + 「## soft guard の二層様式」Skill 層行の簡潔トリガー項化と禁止文追加 + frontmatter updated: 2026-08-16"
  notes:
    - "全 target_area は search-target-area.ts で単一マッチを確認後に置換。ACT-SPEC-005 は当初 matches 空で skip、follow-up で orchestrator 指定の実在見出し（### thin Command の workflow 節標準構造、## soft guard の二層様式）宛てに適用（見出し存在は search-target-area.ts で確認済み）"
    - "frontmatter へ spec_logical_division / canonical_owner 宣言を補完（4ファイルとも cross_cutting_contract。workflow-skill-model.md は既存宣言を維持）"
    - "command-file-format.md の旧「## ガードレール番号」「## 機械検査対象」節は follow-up で正規見出しへ統合済み（旧 Step 0 / 非連番 / ゼロ起点 / numbered list / G01 形式検出テーブルは draft の移行 bullet により superseded として削除、thin Command モデル検査サブセクションと非検出対象注記は保持）"

agreed_items:
  - id: AG-001
    content: >-
      層1（コスト）基準: スキル description は機能概要とトリガーを伝える最小限の長さとする。
      単体 hard limit 600 文字、OpenCode 仕様上限 1024 文字は検証不通過の安全線、
      集約予算は平均 350 文字 × N（N = SKILL.md 実ファイル数）を目標値とし超過時は warn で傾向管理する。
      description には運用規則・内部 ID・soft guard マーカー語（`soft guard`、`直接起動`）を含めない。
  - id: AG-002
    content: >-
      層2（形式）基準: description 構造は「機能 1 文 + Use when（トリガー列挙）+ Do NOT use（直近の誤トリガー対策、少数項目）」とし、
      他スキル責務の列挙（ルーティング表）を置かない。経路案内は README 入口表など単一情報源へ集約する。
      本文へ `## USE FOR` / `## DO NOT USE FOR` セクションを description と二重に保持しない。
      制約・ガードレールは command か skill のいずれか一方だけが所有する（相互再要約の禁止）。
      「詳細は〜参照」の定型はファイル内 1 回まで。
      references/ の分割は相互排他または稀にしか併用しない文脈に限る。頻用併用の内容は分割しない。300 行超の参照ファイルは目次を付ける。
  - id: AG-003
    content: >-
      層3（スタイル）基準: 工程は手順の逐次記述（STEP スクリプト）ではなく前提条件・出力契約・検証基準で記述する。
      決定論性は検証（QG・validator）で保証する。
      同一コマンド・スキル内のルールは少数の不変条件へ集約する（目安: 主要不変条件 10 件以内/スキル、超過時は対照表へ例外理由を記録）。
      否定命令は硬い境界（課金・認証・破壊的操作の禁止等）に限って使う。工程上の選好は肯定形の不変条件で表現する。
      harness や実行基盤の責務・既定動作の再説明を配布物に書かない。
      Markdown 見出し・表などの構造は維持し、削るのは分量と手続き性とする。
  - id: AG-004
    content: >-
      soft guard 実効方式（簡潔トリガー項方式、ユーザー合意 2026-08-16）:
      Workflow Skill の description の DO NOT USE FOR に簡潔なトリガー項「単独起動（対応する /agentdev/* コマンド経由で利用すること）」を置き、
      workflow-skill-model.md の二層様式（Skill 層 = 実効の主層、Command 層 = 本文宣言節）を機構不変で維持する。
      description から除去するのは soft guard マーカー語、内部 ID 参照、運用規則の散文に限る。
      機械検査は 16 Workflow Skill 全ての description に簡潔トリガー項が存在することを肯定検証する。
  - id: AG-005
    content: >-
      機械検査の追加: 受け入れ条件のうち機械検査可能な項目を既存検査枠組み（repo-agentdev-integrity / docs-check）へ規則追加する。checker は新設しない。
      検証不通過（hard）: 1024 超過、単体 600 超過、USE FOR 二重保持、description 内マーカー語・内部 ID、簡潔トリガー項欠落、300 行超 references の目次欠落。
      warn: 集約予算（平均 350×N）超過。
      これらの規則の正規所有は各 authoring SPEC の検証観点・機械検査対象節とし、実装は既存検査スクリプトへ追加する。
  - id: AG-006
    content: >-
      品質基準 SPEC 改定の先行: 層1〜3基準を正規所有 SPEC へ規範のみ（根拠注記なし）で反映する改定が機械的編集に先行する。
      対象 4 ファイル: docs/specs/skills/agentdev-skill-authoring.md（層1〜3 skill 記述基準、guard 句簡潔文言化、適用済み skill リスト 16 件是正を含む）、
      docs/specs/skills/agentdev-command-authoring.md（command 側基準）、
      docs/specs/authoring/command-file-format.md（手順セクション形式、ガードレール番号 2 分類、機械検査対象の更新。workflow 節様式の正規所有者）、
      docs/specs/workflows/workflow-skill-model.md（thin Command workflow 節の 3 要素構成と soft guard 二層様式の文言更新。様式詳細は command-file-format.md へ参照）。
  - id: AG-007
    content: >-
      変換対照表: スタイル転換（STEP 列挙から前提出出力検証表への置換、G ルールから硬境界否定規則と肯定形不変条件への分類集約）の変換前後対照表を成果物とする。
      G 番号削減は件ごとの意味判断を伴い、command↔skill↔SPEC の相互参照整合を対照表で保全する。
      対照表の格納先は実装 PR の成果物として case-run が決定する。
  - id: AG-008
    content: >-
      暗黙性の維持: モデル前提・削減根拠の注記（外部調査の出典、ベンダー名、削減率、実証研究の引用等）を配布物のどこにも記述しない。
      要件化・実装時にも根拠注記を配布物へ追記しない。根拠情報は RU-0018 と docs/ 側にのみ保持する。
  - id: AG-009
    content: >-
      委譲 prompt 生成規則の現行維持: 実行時にオーケストレータが生成して subagent へ渡す委譲 prompt の生成規則
      （MUST DO / MUST NOT DO を含む明示構造）は現行の明示構造を維持する。
      生成規則自体の記述は不変条件 1 行形式へ圧縮してよい。

artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/skills/agentdev-skill-authoring.md
    target_area: "## skill authoring 段階的開示基準"
    spec_logical_division: cross_cutting_contract
    canonical_owner: agentdev-skill-authoring
    source_items: [AG-001, AG-002, AG-003, AG-005]
    content: |
      ## skill 記述基準（層1〜3）

      ### 層1: description のコスト抑制

      - description は機能概要とトリガーを伝える最小限の長さとする。単体上限 600 文字（検証不通過）、集約予算は平均 350 文字 × N（N = SKILL.md 実ファイル数、超過時 warn）、OpenCode 仕様上限 1024 文字は検証不通過の安全線とする
      - description に運用規則、内部 ID、soft guard マーカー語（`soft guard`、`直接起動`）を含めない。それらは本文または権威文書へ置く

      ### 層2: 記述の単一所属

      - description は「機能 1 文 + Use when（トリガー列挙）+ Do NOT use（直近の誤トリガー対策、少数項目）」の構造とする。他スキルの責務一覧を DO NOT USE FOR として列挙しない。経路案内は README 入口表へ集約する
      - 本文に `## USE FOR` / `## DO NOT USE FOR` セクションを description と二重に保持しない
      - 制約・ガードレールは command か skill のいずれか一方だけが所有する。「詳細は〜参照」の定型はファイル内 1 回まで
      - references/ の分割は相互排他または稀にしか併用しない文脈に限る。頻用併用の内容は分割しない。300 行超の参照ファイルは目次を付ける

      ### 層3: 指示のスタイル

      - 工程は前提条件・出力契約・検証基準で記述する。決定論性は検証（QG・validator）で保証する
      - 同一スキル内のルールは少数の不変条件へ集約する（目安: 主要不変条件 10 件以内/スキル、超過時は変換対照表へ例外理由を記録）
      - 否定命令は硬い境界（課金・認証・破壊的操作の禁止等）に限って使う。工程上の選好は肯定形の不変条件で表現する
      - harness や実行基盤の責務・既定動作の再説明を配布物に書かない
      - Markdown 見出し・表などの構造は維持し、削るのは分量と手続き性とする

      ### 機械検査（本 SPEC 検証観点への追加）

      検証不通過: 1024 超過、単体 600 超過、USE FOR 二重保持、description 内マーカー語・内部 ID、簡潔トリガー項欠落（AG-004)、300 行超 references の目次欠落。warn: 集約予算（平均 350×N）超過。実装は既存検査枠組み（repo-agentdev-integrity / docs-check）へ規則追加する
  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: docs/specs/skills/agentdev-skill-authoring.md
    target_area: "## Workflow Skill Soft Guard（REQ-027-002）"
    spec_logical_division: cross_cutting_contract
    canonical_owner: agentdev-skill-authoring
    source_items: [AG-004]
    content: |
      ## Workflow Skill Soft Guard（REQ-027-002）

      ### 採用する soft guard

      Workflow Skill の description の DO NOT USE FOR に置く簡潔なトリガー項:

      - 単独起動（対応する /agentdev/* コマンド経由で利用すること）

      description からは soft guard マーカー語、内部 ID 参照、運用規則の散文を除去する。
      Skill 層（description の DO NOT USE FOR トリガー）と Command 層（本文宣言節）の二層様式は workflow-skill-model.md「soft guard の二層様式」が正規所有する。

      ### 適用対象

      全 16 Workflow Skill（agentdev-workflow-*）の description。機械検査は全 Workflow Skill への簡潔トリガー項存在を肯定検証する。
  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target: docs/specs/skills/agentdev-command-authoring.md
    target_area: "## command authoring 基準"
    spec_logical_division: cross_cutting_contract
    canonical_owner: agentdev-command-authoring
    source_items: [AG-002, AG-003, AG-006]
    content: |
      ## command authoring 基準（層1〜3適用）

      - command 定義は公開 interface（入出力契約、ガードレール、dispatch 宣言）に限定し、Workflow Skill が所有する工程詳細を再要約しない
      - 工程の要約は前提条件・出力契約・検証基準の表形式（前提出出力検証表）で記述する。様式の詳細は authoring/command-file-format.md が正規所有する
      - 権威情報源宣言はコマンド本文に 1 回までとする
      - ガードレールは硬い境界（否定規則）と肯定形の不変条件へ分類集約し、工程上の選好を G 番号で列挙しない
      - 本文の soft guard 宣言節（core 8 + inspect 3）は grep 可能な `soft guard` マーカーを維持する
  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target: docs/specs/authoring/command-file-format.md
    target_area: "## 手順セクション形式"
    spec_logical_division: cross_cutting_contract
    canonical_owner: command-file-format
    source_items: [AG-002, AG-003, AG-005, AG-007]
    content: |
      ## 手順セクション形式（改定）

      手順セクションは `### Step N` 見出しの逐次列挙に代え、各工程を前提条件・出力契約・検証基準の表形式（前提出出力検証表）で記述する。
      推奨順は表または順序ラベルで保持する。Workflow Skill 側の STEP resume point（references/）はこの限りではない。

      ## ガードレール番号（改定）

      G 番号は硬い境界（課金・認証・破壊的操作、state 破壊等の否定規則）に限定して付番する。
      工程上の選好は肯定形の不変条件として本文へ集約し、G 番号を付さない。
      変換時は変換対照表（変換前 G 番号から変換後所在）を成果物として保持する。

      ## 機械検査対象（更新）

      - description 文字数: 単体 600 超過と OpenCode 仕様 1024 超過は検証不通過、合計 平均 350×N 超過は warn（N は実ファイル数から算出）
      - description 内マーカー語（`soft guard`、`直接起動`）と内部 ID の検出（検証不通過）
      - description と本文の USE FOR 二重保持の検出（検証不通過）
      - 全 Workflow Skill description への簡潔トリガー項（単独起動 + /agentdev/* コマンド経由）存在の肯定検証（欠落時検証不通過）
      - 300 行超 references ファイルの目次存在検出（欠落時検証不通過）
      - 従来の Step 0 検出・非連番検出・numbered list 主手順検出は前出出力検証表様式への移行に合わせて更新または廃止する
  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target: docs/specs/workflows/workflow-skill-model.md
    target_area: "## thin Command workflow 節"
    spec_logical_division: cross_cutting_contract
    canonical_owner: workflow-skill-model
    source_items: [AG-004, AG-006]
    content: |
      ## thin Command workflow 節（改定）

      workflow 節の標準構成は「dispatch 宣言 / 公開順序の要約 / soft guard 宣言」の 3 要素とする。
      公開順序の要約の記述様式（前提出出力検証表等）は authoring/command-file-format.md が正規所有する。詳細工程は Workflow Skill 側 STEP reference が所有する。

      ## soft guard の二層様式（文言更新）

      Skill 層の実効手段は description の DO NOT USE FOR に置く簡潔なトリガー項（「単独起動（対応する /agentdev/* コマンド経由で利用すること）」）である。
      マーカー語、内部 ID、運用規則の散文は description に置かない。
      Command 層（core 8 + inspect 3 の本文宣言節）は grep 可能な `soft guard` マーカーを維持する。

conflict_resolutions:
  - id: CR-001
    conflict: >-
      RU-0018 受け入れ条件4（description 内 soft guard 宣言 0 件）と workflow-skill-model.md「soft guard の二層様式」
      （Skill 層 = description の DO NOT USE FOR トリガーが実効の主層、全 16 Workflow Skill が依存）の解釈が RU 本文から一意に定まらない。
    resolution: >-
      簡潔トリガー項方式（解釈(i)）を採用（ユーザー合意 2026-08-16）。
      DO NOT USE FOR の簡潔項「単独起動（対応する /agentdev/* コマンド経由で利用すること）」は直近の誤トリガー対策として残存し、
      マーカー語・内部 ID・運用規則の散文のみ除去する。二層様式は機構不変。16 スキルへの肯定検証を機械検査へ追加する。
  - id: CR-002
    conflict: >-
      アーキテクチャ助言は単体 600 文字を warn とする階層化を推奨したが、壁打ち合意（A1）は単体 600 を hard limit としていた。
    resolution: >-
      壁打ち合意を優先し 600 は hard（検証不通過）とする。1024 も外部仕様違反として hard。
      集約予算（平均 350×N）は warn とする。文字数上限は既存の行数上限機械検査と同種の構造形式検査であり DEC-001 決定3（文章品質は finding 原則）に照らしても構造形式検査に分類される。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0018
    target_req: null
    target_spec:
      - docs/specs/skills/agentdev-skill-authoring.md
      - docs/specs/skills/agentdev-command-authoring.md
      - docs/specs/authoring/command-file-format.md
      - docs/specs/workflows/workflow-skill-model.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    description: >-
      品質基準 SPEC 改定（ACT-SPEC-001〜005、spec-save 経由）と機械検査の規則追加実装（repo-agentdev-integrity / docs-check の既存スクリプトへ追加）。
      SPEC 保存と検査実装は別々の作業単位として進行でき、case-open は両者を分離した execution_unit を構成してよい。
    result:
      spec_save:
        status: completed
        completed_at: "2026-08-16"
        updated_specs:
          - docs/specs/skills/agentdev-skill-authoring.md
          - docs/specs/skills/agentdev-command-authoring.md
          - docs/specs/authoring/command-file-format.md
          - docs/specs/workflows/workflow-skill-model.md
        applied_actions: [ACT-SPEC-001, ACT-SPEC-002, ACT-SPEC-003, ACT-SPEC-004, ACT-SPEC-005]
        skipped_actions: []
        outcome: "ACT-SPEC-001〜004 を適用後、follow-up（orchestrator 作業仮定）で ACT-SPEC-005 を実在見出し宛てに適用し ACT-SPEC-004 旧節を正規見出しへマージ。target_spec 4ファイルすべて更新済み、status 不変。機械検査規則追加実装は未実施"
  - ou_id: OU-002
    source_ru: RU-0018
    target_req: null
    target_spec: null
    operation: update
    scale: large
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    description: >-
      description 一括圧縮（層1・層2、全 49 スキル）。1024 超過 2 件（agentdev-workflow-case-auto、agentdev-inspect-skills）の修正を含む。
      soft guard は簡潔トリガー項方式（AG-004）で変換する。対象: src/opencode/skills/*/SKILL.md の frontmatter description。
    result: {}
  - ou_id: OU-003
    source_ru: RU-0018
    target_req: null
    target_spec: null
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    description: >-
      本文二重保持の廃止（27 スキルの `## USE FOR` / `## DO NOT USE FOR` 本文セクション削除）と、
      コマンド側 STEP 要約・権威情報源宣言重複の削減（16 コマンド、層2）。対象: src/opencode/skills/*/SKILL.md 本文、src/opencode/commands/agentdev/*.md。
    result: {}
  - ou_id: OU-004
    source_ru: RU-0018
    target_req: null
    target_spec: null
    operation: update
    scale: large
    depends_on: [OU-002, OU-003]
    recommended_order: 3
    issue_policy: single
    description: >-
      スタイル転換（層3）。STEP 列挙から前提出出力検証表への置換、G ルール（実測 341 件）の硬境界否定規則と肯定形不変条件への分類集約、
      harness 責務再説明の削除。変換前後の対照表を成果物とする（AG-007）。対象: 16 コマンド定義、49 SKILL.md、必要に応じ references。
    result: {}
  - ou_id: OU-005
    source_ru: RU-0018
    target_req: null
    target_spec: null
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    description: >-
      references 統廃合（相互排他基準、頻用併用の未分割、300 行超 5 ファイルへの目次付与）と
      プレースホルダ ID（REQ-{NNNN}-{NNN} 等）表記の整理。対象: src/opencode/skills/*/references/（113 ファイル）。
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      全 SKILL.md の frontmatter description 文字数を機械集計する。N は src/opencode/skills/*/SKILL.md の実ファイル数から算出する。
    pass_criteria: |
      全 description が 600 文字以下、1024 文字超過 0 件、合計が平均 350×N 以下（超過時は warn として記録され処理続行）。
    on_failure: |
      fix-and-reverify。超過スキルを特定して圧縮し、再計測する。
  - id: TS-002
    target_item: AG-002
    verification: |
      機械検査（description 内 USE FOR 出現かつ本文 USE FOR 見出し出現の二重保持検出、DO NOT USE FOR の他スキル責務列挙パターン検出）と、DO NOT USE FOR 項目の review 確認（直近誤トリガー対策への限定）を実施する。
    pass_criteria: |
      二重保持 0 件、ルーティング表 0 件、DO NOT USE FOR が直近の誤トリガー対策（少数項目）に限定されている。
    on_failure: |
      fix-and-reverify。二重保持は本文セクションを削除し、ルーティング表は README 入口表参照へ置換して再検証する。
  - id: TS-003
    target_item: AG-004
    verification: |
      機械検査（description 内マーカー語 `soft guard`/`直接起動`、内部 ID パターンの検出）と、全 16 Workflow Skill description への簡潔トリガー項（単独起動 + /agentdev/* コマンド経由）存在の肯定検証を実施する。
    pass_criteria: |
      description 内マーカー語 0 件、内部 ID 0 件、簡潔トリガー項が 16/16 件存在する。
    on_failure: |
      fix-and-reverify。違反 description を簡潔トリガー項方式へ変換し、欠落スキルへ同項を追記して再検証する。
  - id: TS-004
    target_item: AG-007
    verification: |
      変換対照表（変換前: STEP 列挙・G 列挙・権威宣言、変換後: 前提出出力検証表・不変条件・参照）の存在確認と、コマンド・スキル本文の抽査を実施する。
    pass_criteria: |
      対照表が全 16 コマンドと層3転換対象スキル分をカバーし、変換後形式で前提条件・出力契約・検証基準が確認できる。
    on_failure: |
      fix-and-reverify。未変換箇所を対照表へ追加し、変換して再検証する。
  - id: TS-005
    target_item: AG-003
    verification: |
      禁止系言及（禁止、してはならない、MUST NOT 等）の機械集計と、硬い境界（課金・認証・破壊的操作、state 破壊等）以外への否定命令の抽査を実施する。
    pass_criteria: |
      否定命令が硬い境界に限定されている。主要不変条件が目安（10 件以内/スキル）を超える場合、対照表に例外理由が記録されている。
    on_failure: |
      fix-and-reverify。工程上の選好を肯定形の不変条件へ書き換え、例外理由を対照表へ記録して再検証する。
  - id: TS-006
    target_item: AG-003
    verification: |
      配布物（src/opencode/**）から harness・実行基盤の責務・既定動作の再説明記述を検索と review で抽出する。
    pass_criteria: |
      再説明 0 件（権威文書への参照は可）。
    on_failure: |
      fix-and-reverify。該当記述を除去または参照へ縮約して再検証する。
  - id: TS-007
    target_item: AG-002
    verification: |
      references ファイルの行数集計（300 行超の目次存在）と、分割ファイル群の併用頻度 review（相互排他性）を実施する。
    pass_criteria: |
      300 行超ファイル（現状 5 件）に目次がある。頻用併用コンテンツの分割が 0 件。
    on_failure: |
      fix-and-reverify。目次を追加し、頻用併用ファイルを統合して再検証する。
  - id: TS-008
    target_item: AG-008
    verification: |
      配布物全文からモデル前提・削減根拠の注記（外部調査出典、ベンダー名、実証研究引用、削減率等のパターン）を検索する。
    pass_criteria: |
      該当注記 0 件。
    on_failure: |
      fix-and-reverify。注記を除去し、根拠情報は RU-0018 と docs/ 側へ保持して再検証する。
  - id: TS-009
    target_item: AG-005
    verification: |
      追加した機械検査規則を含む repo-agentdev-integrity 全体実行と /repo/docs-check 実行を、OU-001 完了時点と全 OU 完了時点の少なくとも 2 回実施する。
    pass_criteria: |
      両時点で両検査が pass する。
    on_failure: |
      fix-and-reverify。検出事項を修正して再実行する。
  - id: TS-010
    target_item: AG-009
    verification: |
      委譲 prompt 生成規則（MUST DO / MUST NOT DO を含む明示構造）を保持する記述の変換前後差分を確認する。
    pass_criteria: |
      生成規則の明示構造が維持されている（不変条件 1 行形式への圧縮は可）。
    on_failure: |
      fix-and-reverify。意図しない構造変更を原形へ復帰して再検証する。

review_dispositions:
  - id: RD-001
    source_ru: RU-0018
    source_item: section:対象外
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      RU 自身が対象外宣言した項目（scripts 機能本体の動作変更、docs/requirements・decisions の要求・決定内容そのものの変更、委譲 prompt の生成規則変更、コマンド入出力契約の変更）は本 draft も対象外として維持する。
    evidence:
      path: .agentdev/backlog/req-units/RU-0018.md
      section: 対象外
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0018
    source_item: section:現状コードベースのスナップショット
    disposition: superseded
    reason_code: superseded_by
    reason: |
      2026-08-15 実測値は 2026-08-16 の再計測と調定値（単体 600 hard、平均 350×N warn、1024 仕様線）へ置換した。baseline としての再計測値は draft summary に記録した。
    evidence:
      path: .agentdev/drafts/req-draft-command-skill-conciseness-modernization.md
      section: summary
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0018
    source_item: section:検討の前提
    disposition: covered
    reason_code: adopted
    reason: |
      モデル前提の暗黙性維持と委譲 prompt 生成規則の現行維持は AG-008・AG-009 として要件化した。
    evidence:
      path: .agentdev/drafts/req-draft-command-skill-conciseness-modernization.md
      section: draft-data/agreed_items
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0018
    source_item: frontmatter:tentative_classification
    disposition: superseded
    reason_code: reclassified
    reason: |
      暫定分類 REQ から最終分類 SPEC 中心構成（REQ 操作なし、SPEC 5 action、work_type=maintenance）へ確定した。REQ-002-014/018 が要求レベルを既に保持し、層1〜3基準はその SPEC 具体化である。
    evidence:
      path: docs/requirements/REQ-002.md
      section: 要件テーブル
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: >-
    OU-002（49 スキル）と OU-004（16 コマンド + スキル群の意味判断を伴う転換）はファイル数・判断量が多いため Issue 分割候補。
    分割候補軸: Workflow Skill 群（20）/ Capability Skill 群（29）、コマンド群（16）。OU-001 は spec-save による SPEC 保存（ACT-SPEC-001〜005）と機械検査実装 Issue へ分離してよい。
    OU-001 の SPEC 保存は後続 OU の前提となるため、spec-save の先行実行を推奨する。
  wave_hints:
    - "Wave 1: OU-001（SPEC 改定 + 検査規則実装）"
    - "Wave 2: OU-002, OU-003, OU-005（並行実行可）"
    - "Wave 3: OU-004（OU-002・OU-003 完了後）"
```

# summary

RU-0018（コマンド・スキルの過剰記述削減と記述スタイル刷新）を要件化した。合意した3層基準（層1: description コスト、層2: 単一所属、層3: 前提・出力・検証のスタイル）を 4 SPEC へ反映する改定が機械的編集に先行し、description 圧縮、二重保持廃止、スタイル転換、references 統廃合の 5 operation_unit で実行する。soft guard は簡潔トリガー項方式で二層様式を維持する。実行の確認手段は機械検査（既存枠組みへの規則追加）と全体検証（repo-agentdev-integrity、/repo/docs-check）である。
