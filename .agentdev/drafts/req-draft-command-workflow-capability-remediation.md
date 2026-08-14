---
draft_type: req_draft
topic_slug: command-workflow-capability-remediation
status: saved
created_at: 2026-08-11T00:00:00+09:00
source_rus: []
---

<!-- req-define 生成成果物。後続工程（req-save/spec-save/case-open/case-run）が参照する
     原本は下記 # draft-data YAML ブロック。soft contract（LLM 推論経由で消費）。 -->

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  閉鎖済み Epic #2060 で完了判定された Command / Workflow Skill / Capability Skill / Extension
  アーキテクチャ再編について、実リポジトリとの差分から判明した未完了部分を是正する。
  本作業は新規機能追加ではなく、REQ-002 / 005 / 006 / 008 / 027 および DEC-010 / 011 / 012 で
  既に承認済みのアーキテクチャを実装状態へ一致させる remediation である。
  主たる作業は以下の8点である。
  (1) REQ-006-072 / 073 の権威情報源矛盾の解消、
  (2) project-extensions.md へ新3種 Extension kind literal
      （workflow-extension / internal-workflow-extension / capability-skill-extension）
      の公式 enum 定義、
  (3) system.md の旧 SSoT 表現除去、
  (4) command-file-format.md の thin Command モデル完全化補強、
  (5) dispatch なし9 Command の Workflow Skill 化と case-run 1:N 再構成を含む全16 Command 移行、
  (6) docs/specs/commands/*.md 16件 の権威情報源・Step 複製の横断解消、
  (7) Extension runtime resolver / deterministic checker / self-hosting extensions 30件 の原子的切替、
  (8) cleanup / preventive checker 導入と全受け入れ条件の実ファイル再検証による
      false-positive completion 解消。
  Public IF は現状維持を前提とし、実装中に変更が必要と判明した場合は blocked として判断を返す。
  新規 DEC は作成せず、既存 DEC-010 / 011 / 012 を正規基準とする。
  完了は専用 staging branch 上での全体検証 pass 後、staging から main への一括切替をもって
  のみ成立する。main への部分反映は禁止する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

spec_save:
  consumed_at: "2026-08-14"
  spec_actions_consumed: true
  action_mapping:
    ACT-SPEC-001a: "docs/specs/foundations/project-extensions.md「旧kind からの移行（breaking migration）」セクション置換（kind enum / id binding / mapping 表 / 状態分類）"
    ACT-SPEC-001b: "docs/specs/foundations/project-extensions.md「実行時読み込み契約」セクション置換（新3種 kind 読込契約）"
    ACT-SPEC-002: "docs/specs/foundations/system.md「Workflow Architecture Inventory」導入部置換（architecture view 化、旧 SSoT 表現除去）"
    ACT-SPEC-003a: "docs/specs/authoring/command-file-format.md「extensions 手順」セクション置換（新 kind extension 記述）"
    ACT-SPEC-003b: "docs/specs/authoring/command-file-format.md「機械検査対象」セクション置換（thin Command モデル検査追加）"
    ACT-SPEC-004: "docs/specs/commands/ 16 SPEC 横断適用（Step 番号複製除去、権威表現の Workflow Skill 参照化、旧 extension path 除去）。inspect-skills.md は検出事項なしのため no-op"
  notes:
    - "全 target_area は search-target-area.ts で単一マッチを確認後に置換"
    - "spec_logical_division / canonical_owner 宣言は draft 側で未出力のため soft-contract 警告付きで継続（既存 SPEC は status: accepted、宣言欠落のみで保存拒否しない）"

agreed_items:
  - id: AG-001
    content: |
      REQ-006-072 / 073 が主張する「Command 定義を権威情報源」を「Workflow Skill を権威情報源」
      へ書き換え、REQ-006-071 および DEC-010 と整合させる。併せて docs/specs/foundations/system.md
      に残る「Command 定義が SSoT」という旧表現を除去し、Workflow Architecture Inventory を
      architecture view に変更する。所有関係は public contract → Command / Command SPEC、
      workflow implementation → Workflow Skill、durable state contract → Workflow / STEP SPEC
      とする。docs/specs/authoring/command-file-format.md は thin Command モデルを完全化し、
      公開 /agentdev/* Command について ## 手順 / ### Step N 形式を workflow 実装の標準形式として
      要求しない。検査対象を public interface / guardrails / Workflow Skill dispatch 存在 /
      workflow手順本体の重複不存在 / 他 Skill 内部 reference 直接依存不存在 へ変更する。
      /repo/* Command は既存責務を維持し、checker 上で公開 AgentDev Command と区別する。

  - id: AG-002
    content: |
      docs/specs/foundations/project-extensions.md に新3種 Extension の machine-readable
      kind literal を公式 enum として定義する。正規値は workflow-extension /
      internal-workflow-extension / capability-skill-extension の3値のみとし、配置規則は
      .agentdev/extensions/skills/{workflow-skill-name}.yaml /
      .agentdev/extensions/skills/{workflow-skill-name}/internal.yaml /
      .agentdev/extensions/skills/{capability-skill-name}.yaml とする。
      id binding として workflow-extension は対象 Workflow Skill 名と一致、
      internal-workflow-extension は親ディレクトリの Workflow Skill を対象とし単独 id 体系を作らない、
      capability-skill-extension は対象 Capability Skill 名と一致、を規定する。
      旧 kind（command-extension / skill-extension）は無効値であり検出時に migration-required として
      停止する（silent ignore しない）。上記3値以外の未知の kind は schema violation として停止し、
      fail-open しない。本事項は runtime resolver / deterministic checker 実装の正規入力となる。

  - id: AG-003
    content: |
      Workflow dispatch を持たない9 Command（spec-save / intake-capture / intake-from-github /
      intake-promote / learning-promote / backlog-review / inspect-docs / inspect-skills /
      inspect-promote）を Workflow Skill へ移管する。各 Workflow Skill は SKILL.md に purpose /
      input / output / global invariants / STEP list / transition / resume protocol / termination
      を持ち、各 STEP は独立 resume point として成立させる。Command から Capability Skill 内部
      reference への直接依存を許さず、Workflow Skill 名レベル参照とする。
      case-run は single Issue 実行と Epic Wave 実行で target cardinality / parallelism /
      fan-out fan-in / child task recovery / partial result / Wave-level completion が異なるため、
      DEC-010 の 1:N 基準で再評価し agentdev-workflow-case-run 配下に single workflow と
      epic-wave workflow を分離、または同等の parent-dispatch 構成とする。conversation memory のみを
      resume source にしてはならず、durable state と対話ターン依存状態を明確に分離する。
      ただし REQ-027-003 が定める capture-only型（intake-capture / intake-from-github）および
      read-only-diagnostic型（inspect-docs / inspect-skills）は STEP model 対象外（resume point /
      export / import を持たない）であり、これらの Workflow Skill 移行では STEP resume point を
      要求しない。代表ケース検証からもこれらを除外する（REQ-027-003 準拠）。

  - id: AG-004
    content: |
      Workflow dispatch を既に持つ7 Command（req-define / req-save / case-open / case-run /
      case-update / case-close / case-auto）について、Command 本文に残存する workflow 実装を
      Workflow Skill 側へ完全移管し、Command には public interface / dispatch のみを残す。
      全16 Command に OpenCode 1.18.15 向け soft guard を付与する（REQ-027-002）。
      case-auto は下位 workflow（req-save / spec-save / case-open / case-run / case-close）の
      契約確定後に上位 orchestrator として再設計する。Public IF（name / primary input /
      primary output / user-visible workflow meaning）は現状維持を前提とし、実装中に変更が必要と
      判明した場合は blocked として設計判断を返す（実装エージェントが独自に IF 変更しない）。

  - id: AG-005
    content: |
      docs/specs/commands/*.md 全16件の Command SPEC を横断更新する。各 SPEC は Step 番号および
      Workflow Skill 内部手順の複製を行わず、public purpose / input / output / side effects /
      safety boundary / approval/HITL boundary / stop states / externally significant ordering /
      delegated Workflow / Capability responsibility のみを保持する。
      「Command definition is authority」「Step N ...」「Command 側の workflow procedure」
      「Workflow Skill 内部 reference path」「旧 extension path / kind」の記述を検出した場合は
      修正する。既存3移行済み Command（case-open / case-close / case-auto）も再検証する。

  - id: AG-006
    content: |
      Extension runtime resolver（src/opencode/skills/agentdev-project-extensions/**）を
      新3種 kind へ変更する。新 kind のみ受け付け、旧 kind は migration-required stop、
      未知 kind は schema violation stop とし、旧 kind fallback / silent ignore を実装しない。
      extension missing と legacy extension exists を別状態として扱い、前者は標準動作継続、
      後者は migration-required stop とする。
      deterministic checker（.opencode/skills/repo-agentdev-integrity/scripts/check_extensions.ts）
      を新 schema へ変更し、expectedKind = command-extension | skill-extension の旧前提を除去する。
      検査項目として new kind validation / kind-path consistency / id-target consistency /
      internal extension parent Workflow consistency / Capability/Workflow classification consistency /
       old kind residual / .agentdev/extensions/commands/** residual / migration-required classification /
       context path existence / delegated project-local skill existence を追加する。
       runtime resolver と deterministic checker の fail-open 契約を区別する: runtime resolver は
       YAML 構文エラー / 必須 field 欠落 / kind 判定以前の破損についてエラー表示 + 当該 extension
       無視 + 標準動作継続（fail-open, REQ-002-031 準拠）とし、旧 kind は migration-required stop、
       構文上有効な未知 kind は schema violation stop とする。deterministic checker は malformed を
       NG として報告してよいが、runtime resolver の fail-open 契約を変更しない（UC-001 案1）。

  - id: AG-007
    content: |
      .agentdev/extensions/commands/*.yaml（16件）をすべて新 kind の Workflow Extension へ移行する。
      各旧 command-extension を対応 Command の Workflow Extension（kind: workflow-extension）へ
      配置規則に従い移す。.agentdev/extensions/skills/*.yaml（14件）は各対象 Skill を
      Workflow Skill または Capability Skill へ分類して新 kind（workflow-extension または
      capability-skill-extension）へ変換する。単純な文字列置換を禁止し、各 extension の
      context / rules / checks / acceptance_gates / must_not を新 kind 期待値へ照合して分類する。
      internal Workflow Extension が必要な場合は親 Workflow Skill 配下の internal.yaml へ配置する。

  - id: AG-008
    content: |
      全リポジトリを検索し、旧責務残存を分類・除去する。検出対象は Command が workflow Step を
      所有する記述 / Command definition を workflow authority とする記述 / 旧 extension runtime path /
      old kind / Workflow Skill 内部 reference への Command 直接依存 / 同一 workflow implementation の
      Command と Skill 重複とする。false positive と実違反を区別し、実違反を0にする。
      Preventive checker として以下を導入する: (1) 全公開 Command に Workflow Skill dispatch が存在、
      (2) dispatch 先 Skill が存在、(3) Workflow Skill に soft guard が存在、
      (4) 旧 extension kind/path 残存を禁止、(5) Command から Skill 内部 reference 直接依存を禁止、
      (6) Workflow Skill / Capability Skill 分類と Extension kind が整合、
      (7) command-format checker が thin Command モデルと矛盾しない。
      Command 本文に workflow 手順が残っているかの意味判定を過剰な正規表現で強制せず、
      機械判定可能な構造だけを checker 化し、semantic 重複は inspect-skills へ残す。

  - id: AG-009
    content: |
      Phase 6 Acceptance 再検証として、閉鎖済み #2060 のチェック状態を信用せず実成果物から
      全 AC を再評価する。各 AC を pass / fail / blocked / not applicable のいずれかで記録し、
      1件でも fail あれば「全 Command 移行完了」を pass にしない。
      代表シナリオとして case-run（single / Epic Wave / child partial blocked / child failed /
      fan-out 後 compaction / fan-in state reconstruction）、req-define（対話開始 / HITL / blocked /
      resume / draft 生成）、req-save / spec-save（normal / no-op / validation failure /
      partial failure / rerun / commit 前中断 / external Git failure）、intake-promote
      （accept / defer / reject / review あり・なし / HITL 前中断 / HITL 後再開）、
      Extension（absent / valid 3種 / legacy 2種 / malformed / Capability 暗黙伝播なし）を検証する。
      Public IF 比較は16 Command すべてについて name / primary input / primary output /
      user-visible workflow meaning を migration 前 baseline と照合する。
      最終的に staging branch 上で全体を検証し、staging から main への一括切替をもって完了とする。
      main への部分反映は禁止し、Epic 完了条件として staging 全体検証 pass 前の main 反映がないこと
      を強制する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-006
    target_area: REQ-006-072, REQ-006-073
    source_items: [AG-001]
    content: |
      REQ-006-072（更新後）:
      case-auto は case-run をインライン実行する。インライン実行の読込主体は case-auto 自身であり、
      case-run の Workflow Skill（agentdev-workflow-case-run）を権威情報源として読み込む（起動手段は
      harness 責務）。Command 定義（case-run.md）は公開 interface / dispatch のみを所有し、workflow
      実装本体を複製しないこと。case-auto は下位 workflow（req-save / spec-save / case-open /
      case-run / case-close）の契約確定後に上位 orchestrator として再設計すること。

      REQ-006-073（更新後）:
      case-auto は req-save / spec-save / case-open / case-close の各工程を委譲先 subagent へ委譲する。
      委譲先 subagent は各工程の Workflow Skill を権威情報源として読み込み、工程固有手続きの再実装を
      回避する。Command 定義は公開 interface / dispatch のみを所有し、workflow 実装の権威情報源とは
      ならない。case-auto は下位 workflow 詳細処理を複製しない上位 orchestrator 化すること。

      REQ-006-072/073 共通事項: public contract（入出力契約、副作用、安全性、承認境界、stop state、
      ordering contract）の正規文書は Command SPEC（docs/specs/commands/*.md）であり、Command 定義
      （src/opencode/commands/agentdev/*.md）はその実行時投影である。両者不一致時は Command SPEC を
      正とする（ACT-SPEC-002 system.md 更新と整合）。

  - id: ACT-SPEC-001a
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: foundations
      slug: project-extensions
    target_area: "### 旧kind からの移行（breaking migration）"
    source_items: [AG-002, AG-006]
    content: |
      旧kind（command-extension / skill-extension）は完全廃止。runtime後方互換なし。
      consumer プロジェクトも新kindへの移行対象。旧kind残存時は deterministic check で検出し
      migration-required として停止（silent ignore しない）。

      #### Extension kind enum（公式）

      Extension 種別は以下の3値のみを machine-readable `kind` literal として許可する。
      本 enum は runtime resolver / deterministic checker / 全 consumer が正規入力として扱う。

      | kind literal                  | 概念名                      | 配置                                                               |
      |-------------------------------|-----------------------------|--------------------------------------------------------------------|
      | `workflow-extension`          | Workflow Extension          | `.agentdev/extensions/skills/{workflow-skill-name}.yaml`           |
      | `internal-workflow-extension` | internal Workflow Extension | `.agentdev/extensions/skills/{workflow-skill-name}/internal.yaml`  |
      | `capability-skill-extension`  | Capability Skill Extension  | `.agentdev/extensions/skills/{capability-skill-name}.yaml`         |

      上記3値以外の `kind` はすべて無効値である。

      #### id binding

      - `workflow-extension` の `id` は対象 Workflow Skill 名と一致すること（必須）。
      - `internal-workflow-extension` の `id` は親ディレクトリの Workflow Skill 名と一致すること（必須）。単独の別 `id` 体系を作らないこと。
      - `capability-skill-extension` の `id` は対象 Capability Skill 名と一致すること（必須）。

      #### mapping 表

      | 旧kind | 新kind literal | 備考 |
      |---|---|---|
      | command-extension | workflow-extension | 公開Workflow Skill への追加・拡張 |
      | skill-extension（workflow skill対象） | workflow-extension / internal-workflow-extension | Workflow Skill への追加・拡張 |
      | skill-extension（capability skill対象） | capability-skill-extension | Capability Skill への追加・拡張 |

      #### 状態分類と停止条件（UC-001 案1）

      extension 読込時の状態分類と runtime resolver の動作を以下に定める。
      deterministic checker は malformed を NG として報告してよいが、runtime resolver の契約は以下の通りである（REQ-002-031 準拠、fail-open）。

      | 状態 | runtime resolver 動作 | 備考 |
      |---|---|---|
      | extension 不在 | 標準動作継続 | 正常状態 |
      | YAML 構文エラー / 必須field欠落 / kind判定以前の破損 | エラー表示 + 当該extension無視 + 標準動作継続 | fail-open（REQ-002-031 準拠） |
      | `kind: command-extension` / `kind: skill-extension`（旧kind） | migration-required + stop | silent ignore しない |
      | 構文上有効だが `kind` が公式3値以外（未知kind） | schema violation + stop | fail-open しない |
      | 有効な新kind | 通常処理 | — |

      extension missing と legacy extension exists は別状態であり、前者は標準動作継続、後者は migration-required として停止する。

  - id: ACT-SPEC-001b
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: foundations
      slug: project-extensions
    target_area: "## 実行時読み込み契約"
    source_items: [AG-002, AG-006]
    content: |
      command/skill は実行時に自分に対応する extension だけを読む。

      - Workflow Skill は .agentdev/extensions/skills/{workflow-skill-name}.yaml（kind: workflow-extension）を対象とする。
      - Workflow Skill は必要に応じて .agentdev/extensions/skills/{workflow-skill-name}/internal.yaml（kind: internal-workflow-extension）を追加で読む。command は internal Workflow Extension を直接読まない。
      - Capability Skill は .agentdev/extensions/skills/{capability-skill-name}.yaml（kind: capability-skill-extension）を対象とする。
      - 対応 extension が存在しない場合は標準動作で続行する。
      - 対応 extension が破損している場合（YAML 構文エラー、必須field 欠落等）はエラーを表示し、当該 extension を無視して標準動作で続行する（REQ-002-031 準拠、fail-open）。
      - 旧kind（command-extension / skill-extension）を検出した場合は migration-required として停止する。
      - 構文上有効な未知kind を検出した場合は schema violation として停止する。
      - extension は標準 command/skill の上書きではなく、追加・拡張としてのみ扱う。

      対応 extension が存在しない command/skill は正常動作であり、異常状態ではない。command が project 非依存で単体動作する正当な状態である。例として `/agentdev/inspect-skills` は SPEC 直接参照を持たず project 非依存で動作するため extension 不要である。

  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: foundations
      slug: system
    target_area: "## Workflow Architecture Inventory"
    source_items: [AG-001]
    content: |
      全公開Command（16件）の Workflow Architecture Inventory を恒久カタログとして統合する。
      各Command の11分析軸（公開契約・主要処理段階・分岐・副作用・HITL・並列性・resume・durable state・Harness依存・Capability依存・内部workflow候補）を記載する。
      個別Workflow Skill 移行（Wave 2）および Capability Skill 抽出の参照証拠とする。

      本カタログは architecture view である。各項目の権威情報源は以下の所有関係に従う。

      - public contract（入出力契約、副作用、安全性、承認境界、stop state、ordering contract）
        → Command SPEC が正規文書、Command 定義はその実行時投影。両者不一致時は Command SPEC を正とする。
      - workflow implementation → Workflow Skill
      - durable state contract → Workflow / STEP SPEC

      「Command 定義が SSoT である」という旧表現は workflow 実装の権威情報源が Command にあることを
      含意するため使用しない。

  - id: ACT-SPEC-003a
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: authoring
      slug: command-file-format
    target_area: "## extensions 手順"
    source_items: [AG-001]
    content: |
      command 本文は extensions 手順（SPEC `../foundations/project-extensions.md`）のみを持ち、具体的な project docs 内部パスを固定しない。

      各 command は以下の共通記述を本文に持つ。extension は5セクション（`context`/`rules`/`checks`/`acceptance_gates`/`must_not`）を持ち、標準動作に追加・拡張される（上書きではない）。

      - 実行時に対応する project extension を読み込む。Workflow Skill は .agentdev/extensions/skills/{workflow-skill-name}.yaml（kind: workflow-extension）、Capability Skill は .agentdev/extensions/skills/{capability-skill-name}.yaml（kind: capability-skill-extension）を対象とする（詳細は SPEC `../foundations/project-extensions.md` 参照）
      - extension が存在しない場合は標準動作で続行する
      - extension が破損している場合はエラーを表示して無視し、標準動作で続行する（REQ-002-031 準拠、fail-open）

      実行時に読むべき docs 文書への参照は Workflow Skill extension の `context` へ移す。command 本文に直接の docs パスを記述しない。

      extension はフロントマタ（`version: 1`, `kind:`（公式3値: workflow-extension / internal-workflow-extension / capability-skill-extension）, `id:`）と、5セクションを持つ。schema 詳細は SPEC `../foundations/project-extensions.md` 参照。旧 kind（command-extension / skill-extension）は廃止済みであり、検出時は migration-required として停止する。

  - id: ACT-SPEC-003b
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: authoring
      slug: command-file-format
    target_area: "## 機械検査対象"
    source_items: [AG-001, AG-008]
    content: |
      `/repo/docs-check` が検出する機械判定可能な違反。

      | 検出項目 | 対象 |
      |----------|------|
      | `Step 0` の使用 | `### Step 0` 見出し、または本文中の `Step 0` 参照 |
      | 非連番 Step 番号 | `## 手順` 配下の Step 番号が連続していない（飛び番） |
      | ゼロ起点サブステップ | `Step N-0` 形式のサブステップ |
      | numbered list 主手順 | `## 手順` 直下の numbered list による手順記述 |
      | `G01` 形式以外のガードレール番号 | `G` + ゼロ埋め2桁に一致しないガードレール識別子 |

      ### thin Command モデル検査（公開 /agentdev/* Command 対象）

      公開 `/agentdev/*` Command について以下を検査対象に追加する。`/repo/*` Command は従来検査を維持し、公開 AgentDev Command と checker 上で区別する。

      | 検出項目 | 対象 |
      |----------|------|
      | Workflow Skill dispatch 不存在 | 公開 Command が Workflow Skill への dispatch を持たない |
      | workflow 手順本体の重複残存 | Command 本文に Workflow Skill が所有すべき workflow 手順が機械判定可能な形で残存する |
      | Capability Skill 内部 reference 直接依存 | Command 本文から Skill の references/* 等の内部パスへの直接参照 |

      意味的重複（soft contract 判断）は `/agentdev/inspect-skills` が所有する。機械検査は構造的に判定可能な項目のみを対象とする。

      > **非検出対象（許容形式）**: `**EN.**` lettered prefix（代替フロー内サブステップ表現）は主手順の Step 番号連番とは独立した番号空間を持つため、上記検出項目のいずれにも該当しない。

  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
    source_items: [AG-005]
    multi_target_spec:
      applies_to_all_in_domain: true
      target_files:
        - docs/specs/commands/req-define.md
        - docs/specs/commands/req-save.md
        - docs/specs/commands/spec-save.md
        - docs/specs/commands/case-open.md
        - docs/specs/commands/case-run.md
        - docs/specs/commands/case-update.md
        - docs/specs/commands/case-close.md
        - docs/specs/commands/case-auto.md
        - docs/specs/commands/intake-capture.md
        - docs/specs/commands/intake-from-github.md
        - docs/specs/commands/intake-promote.md
        - docs/specs/commands/learning-promote.md
        - docs/specs/commands/backlog-review.md
        - docs/specs/commands/inspect-docs.md
        - docs/specs/commands/inspect-skills.md
        - docs/specs/commands/inspect-promote.md
      note: 各 SPEC ファイルの対象セクションは個別に解決する。共通パターンを以下 content に定義する。spec-save は各ファイルへ順次適用する。
    content: |
      全16 Command SPEC に共通する更新パターン。各 SPEC は以下のみを保持し、Step 番号および Workflow Skill 内部手順の複製を行わない。

      - public purpose
      - input
      - output
      - side effects
      - safety boundary
      - approval / HITL boundary
      - stop states
      - externally significant ordering
      - delegated Workflow / Capability responsibility

      各 SPEC から以下の記述を検出して修正する（ファイルごとに存在するもののみ対象）。

      - `Command definition is authority` 系記述
      - `Step N ...`（Command SPEC 内の workflow 手順記述）
      - `Command 側の workflow procedure` 系記述
      - `Workflow Skill 内部 reference path` 直接参照
      - 旧 extension path / kind（`command-extension` / `skill-extension` / `.agentdev/extensions/commands/`）

      public contract の正規文書は Command SPEC であり、Command 定義はその実行時投影である（ACT-SPEC-002 system.md 更新と整合）。既存3移行済み Command（case-open / case-close / case-auto）も再検証する。

conflict_resolutions:
  - id: CR-001
    conflict: |
      REQ-006-071 は「Workflow Skill を権威情報源」とし DEC-010 と整合するが、
      REQ-006-072 / 073 は「Command 定義を権威情報源」とし DEC-010 と矛盾する。
  - id: CR-002
    conflict: |
      DEC-012 および project-extensions.md は3種 Extension 概念を定義したが、
      machine-readable `kind` literal の正規値が SPEC 上で未定義のため、runtime resolver /
      checker は旧 kind（command-extension / skill-extension）を維持していた。
  - id: CR-003
    conflict: |
      AG-003 の「各 Workflow Skill は各 STEP を独立 resume point として成立させる」は全対象へ
     適用されるが、REQ-027-003 は capture-only型・read-only-diagnostic型を STEP model 対象外
      （resume point / export / import を持たない）と定義する。両者の適用範囲が衝突する。
    resolution: |
      REQ-027-003 の例外を優先する。capture-only型（intake-capture / intake-from-github）および
      read-only-diagnostic型（inspect-docs / inspect-skills）は STEP resume point を持たず、
      AG-003 / TS-001 / TS-002 の STEP resume 検証対象から除外する。
  - id: CR-004
    conflict: |
      本 draft の ACT-REQ-002（削除済み）は REQ-002-035 を更新し、case-auto.md の
      distribution-boundary 違反18件の解消を意図していた。現行の正規 REQ-002 は REQ-029 新設後に
      REQ-002-035 を retire しており、両者は矛盾する。
    resolution: |
      REQ-002-035 は復元しない。distribution-boundary remediation は REQ-029、Epic 完了条件、
      IR-059 が管轄する。本 draft の実装作業は同枠組みの下で配布境界違反を解消してよく、
      廃止済みの REQ-002-035 行を再構築しない。

operation_units:
  - ou_id: OU-000
    operation: verify-only
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-001
    target_req: REQ-006
    target_spec:
      - docs/specs/foundations/project-extensions.md
      - docs/specs/foundations/system.md
      - docs/specs/authoring/command-file-format.md
    operation: update
    scale: standard
    depends_on: [OU-000]
    recommended_order: 2
    issue_policy: single
    result:
      status: in_progress
      req_save:
        completed_at: "2026-08-14"
        saved_req_docs: [REQ-006]
        action_mapping:
          ACT-REQ-001: "REQ-006 要件行 REQ-006-072 / REQ-006-073 を更新（Workflow Skill 権威化 + public contract の Command SPEC 正規化）"
        source_ru_mapping: {}
        source_note: "frontmatter source_rus が空のため RU 起点マッピングなし"
        commit: "0cfa74bf2083d6d1af8d7787fa383b7e490714a9"
      spec_save:
        status: completed
        completed_at: "2026-08-14"
        updated_specs:
          - docs/specs/foundations/project-extensions.md
          - docs/specs/foundations/system.md
          - docs/specs/authoring/command-file-format.md
        applied_actions: [ACT-SPEC-001a, ACT-SPEC-001b, ACT-SPEC-002, ACT-SPEC-003a, ACT-SPEC-003b]
        source_ru_mapping: {}
        source_note: "frontmatter source_rus が空のため RU 起点マッピングなし"
        outcome: "OU-001 の宣言対象 SPEC 3件すべてに Stage 0 の規範契約更新を適用済み。実装側反映（OU-002〜006）は未実施"

  - ou_id: OU-002
    operation: implementation
    scale: large
    depends_on: [OU-000, OU-001]
    recommended_order: 3
    issue_policy: epic
    target_commands:
      - req-define（Workflow Skill 新設・既存強化）
      - req-save（Workflow Skill 新設）
      - spec-save（Workflow Skill 新設）
      - case-run（single workflow + epic-wave workflow の1:N 分離）
      - case-update（Workflow Skill 新設）
      - case-open（既存 Workflow Skill の完全化: Command 本文残存 workflow 実装の移管）
      - case-close（同上）
      - case-auto（下位 workflow 契約確定後の上位 orchestrator 再設計）
    target_artifacts:
      - src/opencode/skills/agentdev-workflow-{req-define,req-save,spec-save,case-run,case-update,case-open,case-close,case-auto}/**
    non_overlap_boundary: req/case core 8 Command の Workflow Skill のみ。intake/learning/backlog/inspect 系は OU-003/004。
    result: {}

  - ou_id: OU-003
    operation: implementation
    scale: standard
    depends_on: [OU-000, OU-001]
    recommended_order: 3
    issue_policy: epic
    target_commands:
      - intake-capture（Workflow Skill 新設, capture-only型: STEP model対象外 REQ-027-003）
      - intake-from-github（Workflow Skill 新設, capture-only型: STEP model対象外）
      - intake-promote（Workflow Skill 新設, STEP resume必要: classification→review→HITL→persistence→destructive handling）
      - learning-promote（Workflow Skill 新設）
      - backlog-review（Workflow Skill 新設）
    target_artifacts:
      - src/opencode/skills/agentdev-workflow-{intake-capture,intake-from-github,intake-promote,learning-promote,backlog-review}/**
    non_overlap_boundary: intake/learning/backlog 5 Command の Workflow Skill のみ。req/case/inspect 系は OU-002/004。
    result: {}

  - ou_id: OU-004
    operation: implementation
    scale: standard
    depends_on: [OU-000, OU-001]
    recommended_order: 3
    issue_policy: epic
    target_commands:
      - inspect-docs（Workflow Skill 新設, read-only-diagnostic型: STEP model対象外 REQ-027-003）
      - inspect-skills（Workflow Skill 新設, read-only-diagnostic型: STEP model対象外）
      - inspect-promote（Workflow Skill 新設, finding disposition は STEP resume あり）
    target_artifacts:
      - src/opencode/skills/agentdev-workflow-{inspect-docs,inspect-skills,inspect-promote}/**
    non_overlap_boundary: inspect 3 Command の Workflow Skill のみ。3層責務（deterministic check / semantic diagnosis / finding disposition）を維持。
    result: {}

  - ou_id: OU-005
    target_spec: docs/specs/commands/*.md
    operation: spec-update
    scale: standard
    depends_on: [OU-002, OU-003, OU-004]
    recommended_order: 4
    issue_policy: epic
    result: {}

  - ou_id: OU-006
    operation: implementation
    scale: large
    depends_on: [OU-001, OU-002, OU-003, OU-004]
    recommended_order: 4
    issue_policy: single
    result: {}

  - ou_id: OU-007
    operation: implementation
    scale: standard
    depends_on: [OU-005, OU-006]
    recommended_order: 5
    issue_policy: single
    result: {}

  - ou_id: OU-008a
    operation: verify-only
    scale: large
    depends_on: [OU-007]
    recommended_order: 6
    issue_policy: single
    target: staging branch 上で TS-001〜TS-007 を含む全 Acceptance（20 AC）を再検証
    result: {}

  - ou_id: OU-008b
    operation: cutover
    scale: standard
    depends_on: [OU-008a]
    recommended_order: 7
    issue_policy: single
    target: staging → main 一括切替（単一操作）。OU-008a 全 AC pass が前提。
    result: {}

test_strategy:
  - id: TS-001
    target_item: [AG-003, AG-004]
    verification: |
      全16 Command について、public IF before/after・thin Command・Workflow Skill・STEP references・
      Input Resolution・resume・soft guard・Extension・Capability boundary を個別検証する。
      dispatch なし9 Command は Workflow Skill が存在し独立実行可能であることを確認する。
      dispatch あり7 Command は Command 本文に workflow 実装が残っていないことを確認する。
      ただし REQ-027-003 が定める capture-only型（intake-capture / intake-from-github）および
      read-only-diagnostic型（inspect-docs / inspect-skills）は STEP model 対象外であり、
      STEP resume point / Input Resolution の検証から除外する。
    pass_criteria: |
      全16件が以下を満たす: Command は public interface / dispatch のみを所有、
      対応する Workflow Skill が存在し独立実行可能、STEP reference / Input Resolution / resume が
      durable state で成立、soft guard が付与されている、Extension が新 kind で読み込まれる、
      Capability 境界が名レベル参照。
    on_failure: |
      fix-and-reverify。個別 Command の移行不備は実装を修正して再検証する。
      Public IF 変更が必要と判明した場合は blocked として判断を返す。
    subchecks:
      - "req-define / req-save / spec-save / case-open / case-run / case-update / case-close / case-auto thin Command + Workflow Skill"
      - "intake-capture / intake-from-github / intake-promote Workflow Skill 独立実行"
      - "learning-promote / backlog-review Workflow Skill 独立実行"
      - "inspect-docs / inspect-skills / inspect-promote Workflow Skill 独立実行"
      - "case-run single workflow + epic-wave workflow 分離"
      - "全16 Command soft guard 付与"

  - id: TS-002
    target_item: AG-003
    verification: |
      全 Workflow Skill について STEP reference / resume model / durable state / Input Resolution
      契約が成立することを確認する。conversation memory のみを resume source としている Workflow Skill
      がないか検出する。各 STEP が独立 resume point として成立することを確認する。
    pass_criteria: |
      全 Workflow Skill が durable state（GitHub Issue/PR または .agentdev/）で resume 可能であり、
      conversation memory 非依存である。各 STEP は Purpose / Input Resolution / Preconditions /
      Procedure / Result / Evidence / Completion Verification / Resume or Idempotency を持つ。
    on_failure: |
      fix-and-reverify。resume 不備の Workflow Skill は STEP 分離・durable state 追加を実施して
      再検証する。

  - id: TS-003
    target_item: [AG-001, AG-005]
    verification: |
      REQ-006-071〜073 の権威情報源矛盾が解消されていることを REQ-006.md 実ファイルで確認する。
      docs/specs/foundations/system.md に「Command 定義が SSoT」旧表現がないことを確認する。
      docs/specs/authoring/command-file-format.md が thin Command モデルへ整合していることを確認する。
      docs/specs/commands/*.md 全16件が Step 番号・Workflow Skill 内部手順の複製を持たないことを確認する。
    pass_criteria: |
      REQ-006-072/073 が Workflow Skill 権威へ書き換えられている。system.md 旧表現が architecture
      view 表現へ置換されている。command-file-format.md が thin Command 検査基準へ更新されている。
      全16 Command SPEC が public contract のみを保持している。
    on_failure: |
      fix-and-reverify。残留記述は個別に修正して再検証する。

  - id: TS-004
    target_item: [AG-002, AG-006, AG-007]
    verification: |
      project-extensions.md に新3種 kind enum が公式定義されていることを確認する。
      runtime resolver が新3種 kind を受け付け、旧 kind で migration-required stop、未知 kind で
      schema violation stop することを確認する。deterministic checker が新 kind validation および
      検査項目を備えていることを確認する。self-hosting extensions 30件が新 kind へ移行されている
      ことを確認する。
    pass_criteria: |
      全 subcheck が pass すること。
    on_failure: |
      fix-and-reverify。Extension 移行不備は実装を修正して再検証する。
    subchecks:
      - "workflow-extension schema 一致"
      - "internal-workflow-extension schema 一致"
      - "capability-skill-extension schema 一致"
      - "old command-extension residual = 0"
      - "old skill-extension residual = 0"
      - "legacy kind 検出時 → migration-required stop"
      - "未知 kind 検出時 → schema violation stop"
      - "YAML 構文エラー/必須field欠落 → fail-open（UC-001 案1, REQ-002-031 準拠）"
      - "silent ignore 実装なし（legacy kind/unknown kind について）"
      - "runtime resolver が extension missing と legacy exists を区別"
      - "deterministic checker: new kind validation 実装"
      - "deterministic checker: kind-path consistency 検査"
      - "deterministic checker: id-target consistency 検査"
      - "deterministic checker: internal extension parent Workflow consistency 検査"
      - "deterministic checker: Capability/Workflow classification consistency 検査"
      - "deterministic checker: old kind residual 検査"
      - "deterministic checker: .agentdev/extensions/commands/** residual 検査"
      - "deterministic checker: migration-required classification 検査"
      - "deterministic checker: context path existence 検査"
      - "deterministic checker: delegated project-local skill existence 検査"
      - "self-hosting extensions 30件（commands 16 + skills 14）全件新 kind 移行"

  - id: TS-005
    target_item: AG-008
    verification: |
      全リポジトリを検索し、旧責務残存（Command workflow Step 所有記述 / Command definition 権威
      記述 / 旧 extension runtime path / old kind / Workflow Skill 内部 reference 直接依存 /
      同一 workflow implementation 重複）を実違反0へ是正する。Preventive checker 7項目を pass する。
    pass_criteria: |
      旧責務残存の実違反が0件。Preventive checker 7項目すべて pass。
      false positive と実違反が正当に区別されている。
    on_failure: |
      fix-and-reverify。実違反は個別に修正し、false positive は exemption として記録して再検証する。
    subchecks:
      - "Command workflow Step 所有記述 = 0"
      - "Command definition 権威記述 = 0"
      - "旧 extension runtime path 参照 = 0"
      - "old kind 残存 = 0"
      - "Workflow Skill 内部 reference 直接依存 = 0"
      - "同一 workflow implementation 重複 = 0"
      - "Preventive checker 7項目 pass"

  - id: TS-006
    target_item: [AG-003, AG-004]
    verification: |
      代表シナリオごとに実行検証する。
      case-run: single Issue 正常系 / Epic Wave 正常系 / child partial blocked / child failed /
      fan-out 後 compaction recovery / fan-in state reconstruction。
      req-define: 対話開始 / HITL / blocked / resume / draft 生成。
      req-save / spec-save: normal create/update / no-op / validation failure / partial failure /
      rerun idempotency / commit 前中断 / external Git failure。
      intake-promote: accept / defer / reject / review あり・なし / HITL 前中断 / HITL 後再開。
      Extension: absent / valid Workflow Extension / valid internal Workflow Extension /
      valid Capability Skill Extension / legacy command-extension → migration-required /
      legacy skill-extension → migration-required / malformed new extension /
      Workflow Extension が Capability へ暗黙伝播しないこと。
    pass_criteria: |
      全シナリオが期待挙動を示す。HITL 前後で中断しても承認済み・未承認状態を誤認しない。
      Extension 暗黙伝播が発生しない。
    on_failure: |
      fix-and-reverify。シナリオ不備は実装を修正して再検証する。

  - id: TS-007
    target_item: AG-004
    verification: |
      全16 Command について name / primary input / primary output / user-visible workflow meaning を
      migration 前 baseline と比較する。baseline は remediation 開始前の main branch HEAD commit
      （OU-000 実施時に記録した commit SHA）に固定する。各 Command の公開契約は docs/specs/commands/*.md
      および src/opencode/commands/agentdev/*.md の両方から抽出し、差分がないことを確認する。
    pass_criteria: |
      意図しない Public IF 変更がないこと。baseline commit SHA が OU-000 で記録され、
      全16 Command の比較が同一 baseline に対して実施されていること。
    on_failure: |
      fix-and-reverify。意図しない変更が発覚した場合は blocked として設計判断を返し、
      ユーザー承認なく IF を変更しない。

  - id: TS-008
    target_item: AG-009
    verification: |
      staging branch 上で Wave 0〜6 の全成果物を統合し、TS-001〜TS-007 を含む全 Acceptance を
      再検証する。staging 全体検証 pass 後、staging → main 一括切替を実施する。
    pass_criteria: |
      staging 全体検証が pass し、main への部分反映が1件もなく、staging → main 一括切替が
      完了していること。fail / blocked / 未検証 AC が0件であること。
    on_failure: |
      fix-and-reverify。staging 検証 fail 時は main 切替を延期し、失敗した Wave へ差し戻して
      修正後に再検証する。

review_dispositions: []

case_open_hints:
  epic_needed: true
  epic_scale: large
  decomposition: |
    scale large のため Wave 構成で Epic 配下に複数 Issue を展開する。
    staging branch 戦略として、main には完成した新体系のみ反映し、staging → main の一括切替を
    行う。main への部分反映は禁止し、Epic 完了条件として staging 全体検証 pass 前の main 反映が
    ないことを強制する。子 worktree が共有正規文書（system.md / command-file-format.md /
    project-extensions.md / workflow-skill-model.md / shared REQ / shared Decision /
    README / index / 共有 checker / Extension 全面切替ファイル群）を独自更新して競合させない。
  staging_branch_strategy:
    main_partial_reflection: prohibited
    cutover: single_staging_to_main
    staging_internal_new_old_mixed: allowed
    main_new_old_mixed: prohibited
  execution_contract:
    staging_branch_name: remediation/staging
    worktree_base_branch: remediation/staging
    pr_base_branch: remediation/staging
    case_close_merge_target: remediation/staging
    final_cutover:
      from: remediation/staging
      to: main
      requires: OU-008a 全 AC pass
      single_operation: true
      enforced_by: Epic completion condition + case-open が生成する Issue execution contract
    propagation: |
      case-open は生成する Issue の execution contract へ worktree base / PR base / case-close merge target
      を remediation/staging へ固定する記述を含める。子 worktree の PR は staging へ向ける。
      case-close は merge target を staging へ固定する。main への直接 PR/merge を防止する。
      最終 cutover（OU-008b）は単一実行者のみが実施し、staging 全体検証 pass を前提とする。
  wave_hints:
    - wave: Wave 0
      corresponds_to: OU-000
      description: current-state inventory（verify-only 実行ゲート）
      gate: OU-000 pass 前に移行 OU を ready にしない
      worktree_policy: shared_inventory_on_staging
    - wave: Wave 1
      corresponds_to: OU-001
      description: normative contract consistency（REQ-006-072/073 / system.md / command-file-format.md / project-extensions.md kind literal enum）
      worktree_policy: single_worktree_shared_docs
    - wave: Wave 2
      corresponds_to: [OU-002, OU-003, OU-004]
      description: workflow skill migration（9 Command + case-run 1:N 再構成 + dispatch あり7 Command 完全移管 + 全16 soft guard）
      parallelizable: true
      worktree_policy: parallel_worktrees_no_shared_file_edits
    - wave: Wave 3
      corresponds_to: OU-005
      description: Command SPEC synchronization（16 SPEC 横断 UPDATE）
      worktree_policy: single_worktree_shared_docs
    - wave: Wave 4
      corresponds_to: OU-006
      description: Extension atomic cutover（runtime resolver / deterministic checker / self-hosting extensions 30件）
      worktree_policy: single_worktree_integration_aggregation
    - wave: Wave 5
      corresponds_to: OU-007
      description: cleanup / preventive checker 導入
      worktree_policy: single_worktree
    - wave: Wave 6
      corresponds_to: [OU-008a, OU-008b]
      description: Acceptance 再検証（OU-008a verify-only）+ staging → main 一括切替（OU-008b cutover）
      worktree_policy: integration_side_serial
  split_forecast:
    signal_total: 3
    classification: split_recommended
    handling: |
      SPLIT 推奨シグナル（要件行数 9 / 関心分類 5 / 成果物種別 6+ / SPEC 分離違反 1）を記録。
      本 remediation は D+ 方式（既存 REQ UPDATE のみ、新規 REQ 作成なし）で進めるため、
      SPLIT は新規 REQ 分割ではなく case-open での Epic / Wave 構成で管理する。
      REQ-006 UPDATE 内容は OU-001 に集約し、実装 remediation は OU-002〜008 で Phase 別管理する。
  acceptance_overrides:
    f_010_remediation: |
      F-010 是正として、DEC CREATE → REQ UPDATE の必須依存を今 remediation では採用しない。
      DEC-010 / 011 / 012 が既存のため、新規 DEC 作成を前提依存とせず、依存は実際の実装依存のみ
      を depends_on に設定する。推奨順序は recommended_order で表現する。
  completion_gating:
    final_acceptance_report: required
    staging_validation_pass: required_before_main
    main_cutover: single_operation
  ac_crosswalk:
    authoritative_ac_set: "再実装計画セクション13の20件（#2060の14件は旧false-positive判定履歴参照のみ）"
    note: "各 AC は pass / fail / blocked / not applicable で個別判定する。TS グループ化は AC を一括合格させる意味ではない。"
    mapping:
      AC-01: { description: "全16 Commandのmigration matrixがpass", ts: TS-001 }
      AC-02: { description: "全16 Commandがpublic IF / dispatch中心", ts: TS-001 }
      AC-03: { description: "workflow implementationがWorkflow Skillへ一意に移管", ts: TS-001 }
      AC-04: { description: "STEP reference / resume / Input Resolution契約が成立", ts: TS-002 }
      AC-05: { description: "Command SPECの権威情報源が新モデルへ統一", ts: TS-003 }
      AC-06: { description: "REQ-006-071〜073の権威情報源矛盾がない", ts: TS-003 }
      AC-07: { description: "system.mdに「Command workflow SSoT」の旧記述がない", ts: TS-003 }
      AC-08: { description: "command-file-format / checkerがthin Commandモデルと整合", ts: TS-003 }
      AC-09: { description: "Extension SPEC / runtime resolver / checkerが同じ3種modelを実装", ts: TS-004 }
      AC-10: { description: "self-hosting extensionが全件新modelへ移行", ts: TS-004 }
      AC-11: { description: "old command-extension runtime契約が0件", ts: TS-004 }
      AC-12: { description: "old skill-extension runtime契約が0件", ts: TS-004 }
      AC-13: { description: "old .agentdev/extensions/commands/** runtime dependencyが0件", ts: [TS-004, TS-005] }
      AC-14: { description: "legacy kindでmigration-required停止を確認", ts: TS-004 }
      AC-15: { description: "public IF regressionなし", ts: TS-007 }
      AC-16: { description: "representative workflow検証pass", ts: TS-006 }
      AC-17: { description: "full integrity / targeted checker pass", ts: TS-005 }
      AC-18: { description: "fail / blocked / 未検証ACが0件", ts: TS-008 }
      AC-19: { description: "staging上で全体を検証", ts: TS-008 }
      AC-20: { description: "検証完了後のみmainへ一括切替", ts: TS-008 }
```

# summary

本 draft は閉鎖済み Epic #2060 の false-positive completion を是正する remediation の要件定義である。
新規機能追加ではなく、既承認の DEC-010 / 011 / 012 および REQ-002 / 005 / 006 / 008 / 027 を
実装状態へ一致させる。REQ 構造は D+ 方式（既存 REQ UPDATE のみ、新規 REQ 作成なし）とし、
Phase 0〜6 の全体 remediation 追跡性は case-open が生成する新規 Remediation Epic 側で管理する。

主たる artifact_actions は REQ-006-072/073 権威情報源矛盾解消（ACT-REQ-001）、
project-extensions.md 新3種 kind enum 定義（ACT-SPEC-001）、system.md 旧 SSoT 表現除去
（ACT-SPEC-002）、command-file-format.md thin Command 完全化（ACT-SPEC-003）、
16 Command SPEC 横断 UPDATE（ACT-SPEC-004）の5点である。9 件の operation_units は
Phase 0 verify-only inventory を実行ゲートとし、Phase 1 契約整合 → Phase 2 Workflow 移行
（3 Wave 並列）→ Phase 3 Command SPEC 同期 → Phase 4 Extension 原子切替 →
Phase 5 cleanup → Phase 6 Acceptance 再検証の順で構成する。

Public IF は現状維持を前提とし、実装中に変更が必要と判明した場合は blocked として判断を返す。
新規 DEC は作成しない。完了は staging branch 上での全体検証 pass 後の main 一括切替でのみ成立する。
