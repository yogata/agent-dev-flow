---
draft_type: req_draft
topic_slug: workflow-skill-architecture-restructure
status: saved
created_at: 2026-08-10T16:50:00+09:00
source_rus: [RU-0006]
agentdev_handoff: true
---

<!-- req_draft: AgentDevFlow Command/Workflow Skill/Capability Skill/Extension
     アーキテクチャ再編要件。agentdev_handoff: true（AgentDevFlow 本体要件）。
     原本は # draft-data 内の YAML。soft contract。 -->

# draft-data

```yaml
work_type: feature

scale: large

summary: >-
  AgentDevFlow の全公開Command（16件）を横断分析し、Command が workflow 実装本体を抱える現行構造を、
  公開Command / Workflow Skill / STEP reference / Capability Skill / Harness runtime の5層責務へ再編する。
  Command 公開IF（名称・主要入力・主要出力・workflow意味）は原則維持し、内部実装アーキテクチャを再構成する。
  既存REQ-002/005/006/008 へのUPDATEと新規REQ-027 CREATE、3件のDecision（DEC-010/011/012）、
  3件の新規SPECと9件の既存SPEC UPDATE（artifact-contracts.md削除UPDATE含む）で構成する。Epic規模（Wave分割推奨）。

auto_gate:
  auto_ready: true
  resolved_questions:
    - id: UQ-001
      source: adversarial-review F-002
      resolution: >-
        B採用。全Command inventory（AG-001）完了後に、新しいWorkflow Skill正規所有モデルと矛盾する
        各Command SPEC を同じ定義層でUPDATE。下位5command は最低限の対象だが5件に固定しない。
        Command固有の外部動作・入出力・完了条件は各Command SPEC に残し、workflow実装詳細の正規所有
        だけをWorkflow Skill側へ移す。ACT-REQ-003 はcase-autoのみ今回の対象、残りはWave 1a inventory
        完了後の追加artifact_actionsで対応（AG-003, case_open_hints に明記）。
    - id: UQ-002
      source: adversarial-review F-005
      resolution: >-
        A採用。旧kind（command-extension/skill-extension）は完全廃止、runtime後方互換なし。
        consumer プロジェクトも新kindへの移行対象（配布物変更としてconsumer影響を取る）。
        旧kind残存時はdeterministic checkで検出しmigration-requiredとして停止（silent ignoreしない）。
        新kindへのmappingをmigration documentationとして提供（AG-008, DEC-012 Consequences,
        ACT-SPEC-004 に明記）。
    - id: UQ-003
      source: adversarial-review F-006
      resolution: >-
        B採用。content は artifact_action が変更する範囲の変更後本文を完全確定した replacement fragment。
        REQファイル全体の全文は不要。変更指示・要約のみは不可（REQ-008-031維持）。req-save による
        意味的文章生成・補完は禁止維持。REQ-008-030明確化UPDATE（ACT-REQ-005）を追加。
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |-
      全公開Command（16件）を対象に Workflow Architecture Inventory を作成し、各Command の公開契約
      （名称・主要入力・主要出力・workflow意味）、主要処理段階、分岐条件、副作用、HITL位置、並列性、
      resume可能性、durable state、Harness依存、Capability依存、内部workflow候補を確認可能にする。
      個別Workflow Skill移行の開始前に、workflow/STEP/Capability/Extension の境界について横断レビューを完了する。
      Inventory は検証証拠として使用し、恒久カタログは foundations/system.md へ統合する。

  - id: AG-002
    content: |-
      既存公開Command の名称・主要入力・主要出力・ユーザーから見た workflow の意味を原則維持する。
      変更が必要な場合は暗黙に変更せず、追加判断として停止し報告する。

  - id: AG-003
    content: |-
      対象Command から workflow 手順本体を除去し、公開interface と dispatch を中心とした構造にする。
      Workflow Skill へ移した手順が Command に重複残存しない。各Command について 1:1 または 1:N Workflow Skill
      分割の選択理由を説明可能にする。制御構造に実質差異がある場合は分割を評価し、operation 差だけの
      不必要分割を回避する。Command は Workflow Skill 名レベルで参照し、異なる Skill の STEP 内部パスへ
      直接依存しない（REQ-002-017 維持）。全Command inventory（AG-001）完了後に、新しいWorkflow Skill
      正規所有モデルと矛盾する各Command SPEC を同じ定義層でUPDATEする。下位5command（req-save /
      spec-save / case-open / case-run / case-close）は最低限の対象だが、5件に固定しない。
      Command固有の外部動作・入出力・完了条件は各Command SPEC に残し、workflow実装詳細の正規所有
      だけをWorkflow Skill 側へ移す（UQ-001回答、ACT-REQ-003 は case-auto のみ今回の対象、
      残りはWave 1a inventory 完了後の追加artifact_actions で対応）。

  - id: AG-004
    content: |-
      各Workflow の STEP が独立した開始・完了判定・resume point として成立する。旧Command 見出し番号の
      機械分割ではない。各STEP reference が過去会話なしで Input Resolution・実行・検証・再開を行える。
      STEP transition は Workflow Skill の SKILL.md（control plane）が所有し、reference 間で重複定義しない。
      STEP reference の構成要素は Purpose・Input Resolution・Preconditions・Procedure・Result・Evidence・
      Completion Verification・Resume-Idempotency とする。詳細構造は SPEC（step-reference-contract.md）が
      正規所有者として定義する。

  - id: AG-005
    content: |-
      代表workflow で前STEP 会話内容を喪失した状態を想定しても、安定したSTEP 識別子と durable state から
      current STEP と必要入力を復元できる。STEP 間で必要な durable 情報は SSoT から再取得・再検証され、
      自然言語の前STEP result のみに依存しない。再構成不能な runtime state は必要最小限に限定する。
      ToDo の使用・compaction 検出・current STEP 選択の実処理は harness 固有機能とし、AgentDevFlow 配布契約は
      STEP 識別子と永続情報から再開点を決定できる契約のみを所有する（DEC-001 context管理harness委譲、
      REQ-002-022 harness固有詳細禁止に整合）。durable state 優先順位とInput Resolution 詳細は
      SPEC（input-resolution-and-durable-state.md）が正規所有者として定義する。

  - id: AG-006
    content: |-
      並列child task を持つ代表workflow で、compaction 後も child identity / status を Harness から復元し、
      完了済みchild 状態を durable domain state と再構成して fan-in 判定を行える。

  - id: AG-007
    content: |-
      複数workflow で共通する能力が Capability Skill として横断的に評価される。workflow 固有STEP の
      過剰な共通reference 化を回避する。Capability Skill の定義・配置・参照契約は SPEC（workflow-skill-model.md）
      が正規所有者として定義する。

  - id: AG-008
    content: |-
      Workflow Extension / internal Workflow Extension / Capability Skill Extension の責務・配置・適用範囲・
      適用順序を定義する。public Workflow Extension が internal workflow / STEP 全体を拘束し、Capability Skill
      extension へ暗黙コピーしない。既存 command-extension の後方互換性のためだけの二重extension model が
      正規状態として残存しない。Extension を file-kind 中心から workflow/capability responsibility 中心へ再編する
      （DEC-012）。旧kind（command-extension / skill-extension）は完全廃止し、runtime後方互換を持たない。
      consumer プロジェクトも新kindへの移行対象とする（agentdev_handoff: true であってもconsumer影響を取る）。
      旧kind残存時は silent ignore せず、deterministic check で検出し migration-required として明示的に停止する。
      新kindへのmapping をmigration documentation として提供する。
      配置・適用順序の詳細は SPEC（project-extensions.md UPDATE）が正規所有者として定義する。

  - id: AG-009
    content: |-
      Workflow Skill の意図しない discovery / invocation リスクに対し、OpenCode 1.18.15 で実現可能な
      soft guard を導入する。soft guard の実現方法が OpenCode 機能制約により実現できない場合は、
      代替手段を Findings に記録し対象外とする。

  - id: AG-010
    content: |-
      case-run / case-auto で orchestration・resume・single/Epic Wave・parallelism・compaction モデルを検証する。
      req-define 等で interactive / HITL / loop を持つworkflow で STEP・resume・compaction モデルが成立する。
      req-save / spec-save 等で deterministic mutation / verification / commit を持つworkflow で新モデルが成立する。
      intake-promote 等で classification / review / approval / irreversible action 境界を持つworkflow で新モデルが
      成立する。case-auto は下位workflow 契約確定後に再設計し、下位workflow 詳細処理を複製しない上位orchestrator 化
      する（REQ-006-071〜073 UPDATE）。capture-only型（capture・learning 等）・read-only-diagnostic型
      （inspect-docs・inspect-skills 等）は STEP model 対象外（resume point / export / import を持たない）
      とし、代表ケースから除外する。

  - id: AG-011
    content: |-
      正常系で既存公開IF 通じて代表workflow が完了する。blocked / failed / validation failure で未完了STEP を
      completed と誤認せず、定義された停止状態を保持する。中断・再実行で completed STEP の会話コンテキストを
      前提とせず、current STEP から安全に再開する。GitHub / Git / Harness child task 等の外部依存取得失敗時に
      状態を推測して後続STEP へ進行せず、定義された blocked / failed 扱いとする。入力対象なし / artifact action なし /
      処理対象child なし等の no-op / empty state の外部挙動を維持する。

  - id: AG-012
    content: |-
      配布元リポジトリと consumer repository の責務境界・project extension 境界が新architecture で維持される
      （REQ-002/009 既存境界を維持）。

  - id: AG-013
    content: |-
      worktree 内の実装・検証が完了するまで main に部分移行状態を反映せず、main 反映時点で全対象Command /
      Workflow Skill / STEP reference / Extension が新体系へ移行済みとなる。移行完了時に旧workflow implementation /
      不要な旧extension contract / 重複規則が正規経路として残存しない。保持が必要なものは新architecture 上で
      責務と理由を明示する。      worktree 利用自体は実行計画（case-open / case-run）へ分離し、要件doc では結果条件
      （main 上で混在状態を許さない）のみを保持する。main 反映戦略として staging branch 運用
      （各Wave のPR をstaging branch へ積み上げ、最終的にstaging→main へmerge）を許容する。
      各Wave のPR を main へ順次 merge しない（main への反映は最終的な体系切替境界でのみ行う）。

  - id: AG-014
    content: |-
      関連checker / test を更新し、全受け入れ条件の検証結果を pass / fail / blocked / not applicable で記録する。
      fail が承認済みスコープ内の修正のみで解消可能なら修正・再検証し、公開IF 変更 / スコープ拡大 / 新規architecture
      判断 / 追加Harness capability / 外部依存変更が必要な場合は反復を停止して判断事項を報告する。
      blocked / fail / 未検証項目が残る状態を完了として扱わない。

artifact_actions:
  # ===== REQ UPDATE =====
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-002
    source_items: [AG-002, AG-003, AG-007, AG-012]
    content: |-
      REQ-002-001（意味変更）: command はユーザー向け入口、公開interface（入出力契約・ガードレール）、
        workflow dispatch を定義し、workflow 実装本体は Workflow Skill へ移す。高レベル手順の所有は
        Workflow Skill の control plane（SKILL.md）へ委譲する。

      REQ-002-002（意味変更）: command は共通判断基準、大きな状態機械、長い失敗時手順、workflow 手順本体を
        直接所有せず Workflow Skill または Capability Skill へ委譲する。

      REQ-002-003（意味変更）: skill は再利用可能な判断基準、共通知識、宣言的ルールに加え、workflow 実装本体
        （Workflow Skill）または複数workflow 共通能力（Capability Skill）を一次情報として所有する。
        Workflow Skill と Capability Skill は異なる責務境界・判断モデルを持ち、同一skill として混在させない
        （REQ-002-018 拡張）。

      REQ-002-004（意味変更）: skill は command 固有の局所ファイルパス、局所エラーメッセージを一次情報として
        保持しない。STEP reference が resume point 識別子として STEP ID を持つことは、command 固定の Step 番号
        保持とは区別する（STEP ID は workflow 内安定識別子、command 固定番号は workflow dispatch へ集約）。

      REQ-002-030（意味変更）: Project Extensions は workflow/capability responsibility 中心の単位で配置する。
        Workflow Extension / internal Workflow Extension / Capability Skill Extension の3種を定義する。
        標準 command / skill を上書きせずプロジェクト固有情報を追加する（追加・拡張・非上書き原則維持）。

      REQ-002-031（意味変更）: command / skill は自身に対応する extension（Workflow Extension / Capability Skill
        Extension）のみを読み、extension が不在または破損の場合も標準動作を維持する。internal Workflow Extension
        は Workflow Skill のみが読み、command は直接読まない。

      REQ-002-035（整理）: case-auto distribution-boundary 違反の project extension 分離は、本再編で
        case-auto.md の workflow 実装が Workflow Skill へ移行することで解消方向となる。残存する違反は
        req-define / req-save で個別に処理する。

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: REQ-005
    source_items: [AG-004, AG-005, AG-006, AG-010, AG-011]
    content: |-
      REQ-005 追記要件（workflow protocol 拡張）: workflow は STEP（resume point）単位で構成し、各STEP が
        独立した開始・完了判定を持つ。STEP間 handoff は会話記憶に依存せず、Input Resolution（durable state
        優先順位: SSoT再構成 > identifier保持 > 最小scalar > runtime artifact）で接続する。compaction 後も
        STEP識別子と durable state から current STEP と必要入力を復元できる。並列child task を持つworkflow は
        child identity / status の復元と fan-in 判定を support する。正常系・blocked / failed・中断再実行・
        外部依存失敗・no-op の各シナリオで定義された状態遷移に従う。代表的なworkflow（case-run / case-auto・
        req-define・req-save / spec-save・intake-promote）で新モデルの妥当性を検証する。

  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: REQ-006
    source_items: [AG-010]
    content: |-
      REQ-006-071〜073（意味変更）: case-auto は workflow 実装の権威情報源として Workflow Skill を参照する。
        Command 定義（case-auto.md）は公開interface / dispatch のみを所有し、workflow 実装本体を複製しない。
        case-auto は下位workflow（req-save / spec-save / case-open / case-run / case-close）の契約確定後に
        上位orchestrator として再設計する。

  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: REQ-008
    source_items: [AG-014]
    rationale: >-
      UQ-003 (adversarial-review F-006) 解決。REQ-008-030「content を完全に確定」の運用解釈を
      明確化する。DEC-003 soft-contract 前威で、req-save による意味的な文章生成・補完を禁止しつつ、
      巨大なreq_draft を回避する。
    content: |-
      REQ-008-030（意味変更）: artifact_actions の content は、当該action がCREATE/APPEND/UPDATE する
        本文範囲について、ID採番部分を除く変更後テキストを完全に確定すること。UPDATE で対象成果物全体
        の全文を複製することは要求しない。変更指示・要約のみの記述は不可（REQ-008-031 維持）。
        SPEC UPDATE は対象セクションの変更後全文（REQ-008-032/033 維持）。REQ UPDATE は変更後要件行
        の完全な本文。req-save はcontent の適用のみを行い、意味的な文章生成・補完を行わない。

  # ===== REQ CREATE =====
  - id: ACT-REQ-004
    artifact: req
    operation: create
    target: new:workflow-capability-and-soft-guard
    source_items: [AG-007, AG-009, AG-010]
    rationale: >-
      DEC-001 決定4（新規統制追加の7条件）個別判定。本REQ は hard control ではなく要件行
      であるため、7条件は準用として判定する。
      1. 再現可能な問題: 充足 — Capability Skill・Soft guard の必要性は複数workflow で観測。
      2. 被害がhard controlに値する: 部分的（準用）— workflow固有STEP の過剰共通reference化・
         Workflow Skill の意図しない discovery リスクは影響あり。
      3. 削除・統合・interface縮小・guidance改善では防げない: 充足 — REQ-002（配布成果物
         責務境界）・REQ-005（ワークフロープロトコル）・REQ-006（Case実行オーケストレーション）
         のいずれにも吸収できない独立関心。
      4. 機械的または運用上強制できる: 充足 — REQ 行として要件化し、test strategy で検証可能
         （TS-007/009/010）。
      5. 正規所有者が一つに定まる: 充足 — REQ-027 が Capability Skill・Soft guard・代表ケース
         検証の正規所有者。
      6. 既存の何を削除または簡略化できるか: 部分的 — 既存REQ からの要件分割。ただし「削除」
         ではなく「独立化」。REQ-002-003 の拡張として既存REQ に吸収すると肥大化するため分離。
      7. 将来の削除条件: 充足 — Capability Skill model が不要になった場合、またはREQ-002
         へ再統合する条件（再評価トリガー: Capability Skill が3件以下への縮退）。
    content: |-
      REQ-027-001: 複数workflow で共通する能力を Capability Skill として横断的に抽出し、workflow 固有STEP の
        過剰な共通reference 化を回避する。Capability Skill の定義・配置・参照契約は SPEC
        （workflow-skill-model.md）が正規所有者として定義する。

      REQ-027-002: Workflow Skill の意図しない discovery / invocation リスクに対し、OpenCode 1.18.15 で
        実現可能な soft guard を導入する。soft guard の実現方法が OpenCode 機能制約により実現できない場合は、
        代替手段を Findings に記録し対象外とする。

      REQ-027-003: 代表ケース（case-run / case-auto・req-define・req-save / spec-save・intake-promote）で
        新workflow モデルの妥当性を検証する。検証結果を pass / fail / blocked / not applicable で記録する。
        capture-only型（capture・learning 等）・read-only-diagnostic型（inspect-docs・inspect-skills 等）は
        STEP model 対象外（resume point / export / import を持たない）とし、代表ケースから除外する。

  # ===== Decision CREATE =====
  - id: ACT-DEC-001
    artifact: decision
    operation: create
    target: new:command-workflow-capability-layer-separation
    source_items: [AG-003, AG-007]
    content: |-
      # Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則

      ## Context

      現行モデル（REQ-002-001〜004）では、command が高レベル手順を所有し、skill が再利用可能な判断基準を
      所有する。このモデルは command の肥大化と workflow 実装の分散を生み、複数command 間での workflow 手順
      重複を招いている。

      ## Decision

      Command / Workflow Skill / Capability Skill の3層責務を分化する。

      - **Command**: ユーザー向け入口、公開interface（入出力契約・ガードレール）、workflow dispatch。
        workflow 実装本体は所有しない。
      - **Workflow Skill**: workflow 実装本体。SKILL.md = control plane、STEP = resume point 単位。
        1つのCommand に対して1:1 または 1:N で Workflow Skill を配置する。制御構造に実質差異がある場合は
        分割を評価し、operation 差だけの不必要分割を回避する。
      - **Capability Skill**: 複数workflow で共通する能力。workflow 固有STEP から横断抽出する。

      Command は Workflow Skill 名レベルで参照し、異なる Skill の STEP 内部パスへ直接依存しない
      （REQ-002-017 維持）。

      ## Consequences

      - REQ-002-001〜004 の正規所有者モデルを意味変更する（文脈明確化ではなく正規所有者変更）。
      - DEC-001（憲章）の command / skill / script 責務分界を拡張・精製する。relates-to: DEC-001。
      - DEC-002（ソース・プロジェクション分離）を維持する。新 Workflow Skill / Capability Skill は
        src/opencode/skills/ を原本とする。
      - DEC-005 / 006 / 009 を置換しない。

  - id: ACT-DEC-002
    artifact: decision
    operation: create
    target: new:step-resume-point-and-conversation-memory-independence
    source_items: [AG-004, AG-005]
    content: |-
      # STEP resume point と会話記憶非依存

      ## Context

      現行の command 実装では、STEP 間の引き継ぎが会話コンテキストに依存している。compaction や中断再開時に
      会話コンテキストが喪失すると、workflow の再開が困難になる。

      ## Decision

      各STEP を resume point として定義し、STEP間 handoff は会話記憶を権威情報源とせず、永続情報から再開点を
      再構成できる。

      AgentDevFlow 配布契約は「安定したSTEP 識別子と永続情報から再開点を決定できる契約」のみを所有する。
      ToDo の使用・compaction 検出・current STEP 選択の実処理は harness 固有機能とする
      （DEC-001 context管理harness委譲、REQ-002-022 harness固有詳細禁止に整合）。

      入力解決優先順位・STEP構造の詳細は SPEC（step-reference-contract.md・input-resolution-and-durable-state.md）
      へ分離する。

      ## Consequences

      - DEC-001 の永続状態・停止・再開責務を精製する。relates-to: DEC-001。
      - proposed DEC-008（case-auto 固有 resume）と relates-to 関係を持つ。
      - compaction 後の安全な再開が、会話コンテキストの保存に依存しなくなる。

  - id: ACT-DEC-003
    artifact: decision
    operation: create
    target: new:extension-responsibility-model-restructure
    source_items: [AG-008]
    content: |-
      # Extension を file-kind から workflow/capability responsibility へ再編

      ## Context

      現行の extension model（REQ-002-030/031）は file-kind（command-extension / skill-extension）中心であり、
      workflow と capability の責務差を反映していない。後方互換性のためだけの二重extension model が残存している。

      ## Decision

      Extension を file-kind 中心から workflow / capability responsibility 中心へ再編する。

      - **Workflow Extension**: 公開Workflow Skill への追加・拡張。internal workflow / STEP 全体を拘束する。
      - **internal Workflow Extension**: Workflow Skill の内部動作への追加・拡張。Workflow Skill のみが読む。
      - **Capability Skill Extension**: Capability Skill への追加・拡張。

      public Workflow Extension が Capability Skill extension へ暗黙コピーしない。
      後方互換性のためだけの二重extension model を正規状態として残存させない。

      配置・適用順序の詳細は SPEC（project-extensions.md UPDATE）が正規所有者として定義する。

      ## Consequences

      - DEC-006（inspect 3-command正規化）を reaffirms / relates-to とする。inspect 3層所有を維持する。
      - DEC-005 は歴史参照のみ（superseded 維持）。
      - REQ-002-030 / 031 の意味変更を伴う。
      - 旧kind（command-extension / skill-extension）は完全廃止。runtime後方互換なし。
      - consumer プロジェクトも新kindへの移行対象（配布物変更としてconsumer影響を取る）。
      - 旧kind残存時は deterministic check で検出し migration-required として停止。silent ignore しない。
      - 新kindへのmapping をmigration documentation（project-extensions.md UPDATE）として提供する。

  # ===== SPEC CREATE =====
  - id: ACT-SPEC-001
    artifact: spec
    operation: create
    target_spec:
      operation: create
      domain: workflows
      slug: workflow-skill-model
    source_items: [AG-003, AG-007]
    rationale: >-
      DEC-001 決定4（新規統制追加の7条件）個別判定。本SPEC は hard control ではなく参照契約
      であるため、7条件は準用として判定する。
      1. 再現可能な問題: 充足 — command肥大化・workflow重複は16件の全公開Command で観測。
      2. 被害がhard controlに値する: 部分的（準用）— 保守性・一貫性への影響はあるが、
         hard control の文脈ではなく参照契約の整備。
      3. 削除・統合・interface縮小・guidance改善では防げない: 充足 — artifact-contracts.md
         （570行）への追記では対処不可。肥大化シグナル既検出。
      4. 機械的または運用上強制できる: 部分的（準用）— SPEC は参照契約。inspect-skills で
         Workflow Skill 構造への適合を検出可能。
      5. 正規所有者が一つに定まる: 充足 — workflow-skill-model.md が Workflow Skill 固有契約
         の正規所有者。artifact-contracts.md から委譲（ACT-SPEC-012 で移動元削除）。
      6. 既存の何を削除または簡略化できるか: 充足 — artifact-contracts.md「スキル粒度契約」節
         の Workflow Skill 固有記述を削除し参照へ差し替え。
      7. 将来の削除条件: 充足 — Workflow Skill model が不要になった場合、または
         artifact-contracts.md へ再統合する条件（再評価トリガー: command 数16件以下での
         Workflow Skill 3件以下への縮退）。
    content: |-
      # Workflow Skill Model

      ## 目的

      Command / Workflow Skill / Capability Skill の責務、依存方向、1:N分割基準、配置契約を定義する。
      DEC-010（責務3層分化と1:N分割原則）の実装詳細を正規所有する。

      ## Command 責務

      公開interface（入出力契約・ガードレール）、workflow dispatch。workflow 実装本体は所有しない。

      ## Workflow Skill 責務

      workflow 実装本体。SKILL.md = control plane（STEP transition・STEP間参照）、STEP = resume point 単位。
      1:1 または 1:N で Command に対応する。1:N 分割基準: 制御構造に実質差異がある場合に分割評価。
      operation 差だけの不必要分割は回避。

      ## Capability Skill 責務

      複数workflow 共通能力。workflow 固有STEP から横断抽出。配置・参照契約は REQ-002-017 に従う。

      ## 依存方向

      Command → Workflow Skill（名レベル参照）→ STEP reference（references/ 配下）。
      Workflow Skill → Capability Skill（名レベル参照）。循環依存禁止。

      ## artifact-contracts.md からの委譲

      artifact-contracts.md の肥大化シグナル（500行超）に対応し、Workflow Skill 固有契約は本SPEC へ委譲する。

  - id: ACT-SPEC-002
    artifact: spec
    operation: create
    target_spec:
      operation: create
      domain: workflows
      slug: step-reference-contract
    source_items: [AG-004]
    rationale: >-
      DEC-001 決定4（新規統制追加の7条件）個別判定。本SPEC は hard control ではなく参照契約
      であるため、7条件は準用として判定する。
      1. 再現可能な問題: 充足 — STEP間handoff の会話記憶依存は複数workflow（case-run/case-auto・
         req-define 等）で観測。
      2. 被害がhard controlに値する: 部分的（準用）— compaction 後の再開困難は影響大だが、
         hard control の文脈ではなく参照契約の整備。
      3. 削除・統合・interface縮小・guidance改善では防げない: 充足 — workflow-contracts.md
         「STEP model」節は概要のみ。8要素の詳細構造は独立SPEC が必要。
      4. 機械的または運用上強制できる: 部分的（準用）— STEP reference は成果物構造。
         inspect-skills で8要素の存在を検出可能。
      5. 正規所有者が一つに定まる: 充足 — step-reference-contract.md が STEP reference 詳細構造
         の正規所有者。workflow-contracts.md「STEP model」節は概要を維持。
      6. 既存の何を削除または簡略化できるか: 充足 — workflow-contracts.md「STEP model」節の
         詳細構造記述を本SPEC へ委譲し、概要へ縮小。
      7. 将来の削除条件: 充足 — STEP model が不要になった場合、またはworkflow-contracts.md
         へ再統合する条件（再評価トリガー: STEP model 8要素から3要素以下への縮退）。
    content: |-
      # STEP Reference Contract

      ## 目的

      STEP reference の構造、開始条件、結果、証拠、完了確認、べき等性を定義する。
      DEC-011（STEP resume point と会話記憶非依存）の実装詳細を正規所有する。

      ## STEP reference 構成要素

      - Purpose: 当該STEP の目的
      - Input Resolution: 必要入力の解決方法（durable state優先順位に従う）
      - Preconditions: 開始条件
      - Procedure: 実行手順
      - Result: 実行結果
      - Evidence: 実行証拠
      - Completion Verification: 完了確認基準
      - Resume-Idempotency: 再開時のべき等性保証

      ## STEP transition

      Workflow Skill の SKILL.md（control plane）が所有する。reference 間で重複定義しない。

      ## STEP 識別子

      workflow 内安定識別子。command 固定番号とは区別する。

  - id: ACT-SPEC-003
    artifact: spec
    operation: create
    target_spec:
      operation: create
      domain: workflows
      slug: input-resolution-and-durable-state
    source_items: [AG-005, AG-006]
    rationale: >-
      DEC-001 決定4（新規統制追加の7条件）個別判定。本SPEC は hard control ではなく参照契約
      であるため、7条件は準用として判定する。
      1. 再現可能な問題: 充足 — compaction 後の再開困難は case-run/case-auto 等で観測。
      2. 被害がhard controlに値する: 部分的（準用）— workflow 再開失敗は影響大だが、
         hard control の文脈ではなく配布契約の整備。
      3. 削除・統合・interface縮小・guidance改善では防げない: 充足 — harness-separation-model.md
         は harness 固有。配布契約側（優先順位・STEP識別子からの再開点決定）は独立SPEC が必要。
      4. 機械的または運用上強制できる: 部分的（準用）— 優先順位のschema化。
         inspect-skills で SKILL.md の Input Resolution 参照を検出可能。
      5. 正規所有者が一つに定まる: 充足 — input-resolution-and-durable-state.md が配布契約側
         の正規所有者。harness-separation-model.md は harness 固有側を維持。
      6. 既存の何を削除または簡略化できるか: 充足 — harness-separation-model.md から配布契約側
         の記述を分離し、harness 固有に特化。
      7. 将来の削除条件: 充足 — 優先順位 model が不要になった場合、またはharness-separation-model.md
         へ再統合する条件（再評価トリガー: 配布契約とharness固有の関心分離が不要になった場合）。
    content: |-
      # Input Resolution and Durable State

      ## 目的

      入力解決優先順位、永続状態、current STEP 再構成、並列child task 復元の契約を定義する。
      DEC-011 の入力解決・永続状態側面を正規所有する。

      ## durable state 優先順位

      1. SSoT 再構成（docs/ 配下の永続文書から再取得・再検証）
      2. identifier 保持（RU-ID・REQ-ID・Issue番号等の安定識別子）
      3. 最小 scalar（数量的な状態値）
      4. runtime artifact（draft・検出事項等の一時成果物、REQ-008 に従う）

      自然言語の前STEP result のみに依存しない。

      ## current STEP 再構成

      安定したSTEP 識別子と durable state から current STEP を決定する契約を AgentDevFlow 配布契約が所有する。
      ToDo 使用・compaction 検出・current STEP 選択の実処理は harness 固有（AGENTS.md / harness reference）。

      ## 並列child task 復元

      child identity / status を Harness から復元し、完了済みchild 状態を durable domain state と再構成して
      fan-in 判定を行う。

  # ===== SPEC UPDATE =====
  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: foundations
      slug: project-extensions
    target_area: "## extension の基本構造"
    source_items: [AG-008]
    content: |-
      ## Extension 種別

      Extension を workflow / capability responsibility 中心の3種へ再編する（DEC-012）。

      ### Workflow Extension

      公開Workflow Skill への追加・拡張。internal workflow / STEP 全体を拘束する。
      配置: .agentdev/extensions/skills/{workflow-skill-name}.yaml。

      ### internal Workflow Extension

      Workflow Skill の内部動作への追加・拡張。Workflow Skill のみが読む。command は直接読まない。
      配置: .agentdev/extensions/skills/{workflow-skill-name}/internal.yaml。

      ### Capability Skill Extension

      Capability Skill への追加・拡張。
      配置: .agentdev/extensions/skills/{capability-skill-name}.yaml。

      ### 適用順序

      Workflow Extension → internal Workflow Extension → Capability Skill Extension。
      public Workflow Extension が Capability Skill extension へ暗黙コピーしない。
      後方互換性のためだけの二重extension model を正規状態として残存させない（DEC-012）。

      ### 旧kind からの移行（breaking migration）

      旧kind（command-extension / skill-extension）は完全廃止。runtime後方互換なし。
      consumer プロジェクトも新kindへの移行対象。旧kind残存時は deterministic check で検出し
      migration-required として停止（silent ignore しない）。

      #### mapping 表

      | 旧kind | 新kind | 備考 |
      |---|---|---|
      | command-extension | Workflow Extension | 公開Workflow Skill への追加・拡張 |
      | skill-extension（workflow skill対象） | Workflow Extension / internal Workflow Extension | Workflow Skill への追加・拡張 |
      | skill-extension（capability skill対象） | Capability Skill Extension | Capability Skill への追加・拡張 |

      #### migration-required 検出

      extension 読込時に旧kind を検出した場合、migration-required エラーとして停止する。
      エラーメッセージは mapping 表へ誘導し、新kind への移行手順を提示する。

  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: workflows
      slug: workflow-contracts
    target_area: "## STEP model"
    source_items: [AG-004, AG-005, AG-011]
    content: |-
      ## STEP model

      workflow は STEP（resume point）単位で構成する（DEC-011）。各STEP の構造・開始条件・完了判定は
      step-reference-contract.md が正規所有者。Input Resolution と durable state 優先順位は
      input-resolution-and-durable-state.md が正規所有者。

      ### 状態遷移

      workflow は正常系・blocked・failed・resume の状態遷移を持つ。blocked / failed で未完了STEP を
      completed と誤認しない。中断再実行時は current STEP から安全に再開する。外部依存取得失敗時は
      状態推測せず blocked / failed 扱いとする。no-op / empty state の外部挙動を維持する。

  - id: ACT-SPEC-006
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: responsibilities
      slug: artifact-responsibilities
    target_area: "## 成果物責務表"
    source_items: [AG-003, AG-004, AG-007]
    content: |-
      ## 成果物責務表（Workflow Architecture 追加）

      | 成果物種別 | 責務 | 正規所有者 |
      |---|---|---|
      | Command | 公開interface・dispatch | REQ-002・各command固有REQ |
      | Workflow Skill | workflow実装本体・STEP transition | REQ-005・workflow-skill-model.md |
      | STEP reference | STEP詳細・resume point | REQ-005・step-reference-contract.md |
      | Capability Skill | 共通能力 | REQ-027・workflow-skill-model.md |
      | Workflow Extension | 公開Workflow Skill 拡張 | REQ-002・project-extensions.md |
      | internal Workflow Extension | Workflow Skill 内部拡張 | REQ-002・project-extensions.md |
      | Capability Skill Extension | Capability Skill 拡張 | REQ-002・project-extensions.md |

  - id: ACT-SPEC-007
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: foundations
      slug: system
    target_area: "## Workflow Architecture Inventory"
    source_items: [AG-001]
    content: |-
      ## Workflow Architecture Inventory

      全公開Command（16件）の Workflow Architecture Inventory を恒久カタログとして統合する。
      各Command の公開契約・主要処理段階・分岐・副作用・HITL・並列性・resume・durable state・
      Harness依存・Capability依存・内部workflow候補を記載する。個別Workflow Skill 移行時に参照する。

  - id: ACT-SPEC-008
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: foundations
      slug: harness-separation-model
    target_area: "## ToDo と compaction 復元"
    source_items: [AG-005]
    content: |-
      ## ToDo と compaction 復元

      AgentDevFlow 配布契約は STEP 識別子と永続情報から再開点を決定できる契約を所有する（DEC-011）。
      ToDo の使用・compaction 検出・current STEP 選択の実処理は harness 固有機能とする。
      AgentDevFlow 配布command / Workflow Skill / SPEC は ToDo を必須機構として規定しない
      （DEC-001 context管理harness委譲、REQ-002-022 harness固有詳細禁止）。

  - id: ACT-SPEC-009
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: authoring
      slug: command-file-format
    target_area: "## Command 構造"
    source_items: [AG-003]
    content: |-
      ## Command 構造

      Command は公開interface（入出力契約・ガードレール）と workflow dispatch を中心とする
      （DEC-010）。workflow 手順本体は Workflow Skill へ移行し、Command に重複残存しない。
      workflow への参照は Workflow Skill 名レベルとする（REQ-002-017）。

  - id: ACT-SPEC-010
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-command-authoring
    target_area: "## 公開IF と dispatch"
    source_items: [AG-003]
    content: |-
      ## 公開IF と dispatch

      Command authoring は公開interface と workflow dispatch のみを Command に記述する
      （DEC-010）。workflow 実装本体は Workflow Skill が所有する。Command は Workflow Skill 名レベルで
      参照し、STEP 内部パスへ直接依存しない（REQ-002-017）。

  - id: ACT-SPEC-011
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-skill-authoring
    target_area: "## Workflow Skill と Capability Skill"
    source_items: [AG-003, AG-004, AG-007]
    content: |-
      ## Workflow Skill と Capability Skill

      Skill authoring は Workflow Skill と Capability Skill の責務差を区別する（DEC-010）。
      Workflow Skill の SKILL.md は control plane（STEP transition・STEP間参照）を所有する。
      STEP reference は references/ 配下に配置し、resume point として自足する（DEC-011）。
      Capability Skill は複数workflow 共通能力を所有し、workflow 固有STEP と混在させない（REQ-002-018）。

  - id: ACT-SPEC-012
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: responsibilities
      slug: artifact-contracts
    target_area: "## スキル粒度契約"
    source_items: [AG-003, AG-007]
    rationale: |-
      adversarial-review F-004 正規所有者重複回避。workflow-skill-model.md（ACT-SPEC-001）が
      Workflow Skill 固有契約を正規所有するため、artifact-contracts.md「スキル粒度契約」節から
      Workflow Skill 固有記述を削除し、workflow-skill-model.md への参照へ差し替える。
      移動元削除を伴わない場合、将来 inspect-skills/findings で重複再検出の可能性が高い。
    content: |-
      ## スキル粒度契約

      Command・skill の粒度基本契約は本SPEC が正規所有者とする。
      Workflow Skill・Capability Skill 固有の責務・配置・1:N分割基準・依存方向は
      workflow-skill-model.md が正規所有者。本節は workflow-skill-model.md へ委譲済みの
      Workflow Skill 固有契約を重複所有しない。

      skill の段階的開示、reference 分離原則、USE FOR / DO NOT USE FOR の整合性は
      REQ-002-015・017・018 に従い本SPEC が維持する。

conflict_resolutions:
  - id: CR-001
    conflict: DEC候補E（worktree内全体移行）をDecision の主題にするか
    resolution: >-
      Decision 作業手段拒否ゲート（decision-guidelines SPEC）により、移行・統合・再構築はDecision の
      主題から除外される。Eは結果条件（main 上で混在状態を許さない）のみを受け入れ条件（AG-013）として残し、
      worktree 利用は実行計画（case-open / case-run）へ分離する。Oracle 助言（確定事項）に基づく。

  - id: CR-002
    conflict: DEC候補A（責務3層分化）とDEC候補B（1:N分割原則）を統合するか分離するか
    resolution: >-
      責務3層分化と1:N分割原則は同じ判断境界（Command/Workflow Skill/Capability Skill 責務）に属するため、
      1件へ統合する（DEC-010）。Oracle 助言（推定事項・高確信度）を採用。

  - id: CR-003
    conflict: ToDo = program counter を AgentDevFlow 配布契約とするか harness 固有とするか
    resolution: >-
      RU-0006「対象」で「Harness ToDo」と明記。DEC-001（context管理harness委譲）とREQ-002-022
      （harness固有詳細禁止）に整合するよう、AgentDevFlow 配布契約はSTEP識別子と永続情報から再開点を
      決定できる契約のみ所有し、ToDo使用・compaction検出・current STEP選択はharness固有とする。
      Oracle 助言（推定事項）を採用。Step 11 でユーザーに提示し差し戻し可能。

  - id: CR-004
    conflict: 新規REQ 5件（REQ-A〜E）を作成するか既存REQ UPDATE に集約するか
    resolution: >-
      Oracle 助言（推定事項）に従い、REQ-002/005/006 へのUPDATE を中心とし、既存REQ に吸収できない
      独立関心（Capability Skill・Soft guard・代表ケース検証）のみ新規REQ-027 CREATE とする。
      REQ-A（Inventory）は検証証拠・system.md へ統合しREQ行としない。REQ-E（移行戦略）はREQ対象外。

operation_units:
  - ou_id: OU-005
    source_ru: RU-0006
    target_artifact: DEC-010/011/012
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 0
    issue_policy: single
    result: {}
    note: >-
      adversarial-review F-010 反映（計画エージェント修正後）。3件のDecision CREATEを独立OUとして実行。
      Wave1の先行タスク（recommended_order: 0）。AG-001 Inventoryの結果をDecision Contextへ反映するため、
      実務上は Inventory 作成完了後に実行する順序を case_open_hints へ明示する。
      REQ UPDATE（OU-001/002/003）との依存関係は depends_on ではなく recommended_order で表現する。
      DEC CREATE は RU-0006 で既に合意済みの architecture decision を永続化するものであり、
      DEC ファイルが先に物理作成されなければ REQ UPDATE を定義・検証できない必須依存には該当しない
      （REQ-008 depends_on は必須依存専用、先行成果物がなければ後続を検証できない依存に限定）。

  - ou_id: OU-001
    source_ru: RU-0006
    target_req: REQ-002
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-002
    source_ru: RU-0006
    target_req: REQ-005
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-003
    source_ru: RU-0006
    target_req: REQ-006
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-004
    source_ru: RU-0006
    target_req: new:workflow-capability-and-soft-guard
    operation: create
    scale: large
    depends_on: []
    recommended_order: 2
    issue_policy: epic
    result: {}
    note: >-
      adversarial-review F-013 反映。OU-004 depends_on を [OU-001, OU-002] から [] へ変更。
      F-010 と同様に、REQ-027 は RU-0006 で既に合意済みの要件を永続化するものであり、
      REQ-002/005 UPDATE なしで定義・検証できない必須依存には該当しない。
      REQ-027-001 が REQ-002-003 の Capability Skill 定義を参照するが、概念自体は
      RU-0006 で合意済み。実務上は REQ-002 UPDATE 完了後に実行する順序を recommended_order で表現する。

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |-
      全公開Command（16件）を対象に architecture inventory と Workflow Architecture Map を作成し、
      各Command の公開契約・主要処理段階・分岐・副作用・HITL・並列性・resume・durable state・
      Harness依存・Capability依存・内部workflow候補が確認できることを検証する。
      横断レビューで workflow/STEP/Capability/Extension boundary の矛盾を検出する。
    pass_criteria: |-
      全16Command が inventory に含まれる。各項目が記述されている。横断レビューで矛盾が検出されていない。
      Inventory が foundations/system.md へ統合されている。
    on_failure: |-
      fix-and-reverify。inventory の不備・矛盾は修正して再検証する。

  - id: TS-002
    target_item: AG-002
    verification: |-
      各公開Command について再編前後で名称・主要入力・主要出力・workflow 意味を比較する。
    pass_criteria: |-
      全公開Command の名称・主要入力・主要出力・workflow 意味が原則維持されている。変更がある場合は
      追加判断として停止・報告されている。
    on_failure: |-
      fix-and-reverify。公開IF の意図しない変更は修正して再検証する。

  - id: TS-003
    target_item: AG-003
    verification: |-
      各対象Command の原本を確認し、workflow 手順本体が除去され公開interface/dispatch 中心構造と
      なっていることを検証する。1:1/1:N Workflow Skill 分割の選択理由が文書化されていることを確認する。
      Workflow Skill へ移した手順が Command に重複残存しないことを確認する。
    pass_criteria: |-
      全対象Command から workflow 手順本体が除去されている。重複残存がない。分割選択理由が説明可能。
      Command が Workflow Skill 名レベルで参照している。
    on_failure: |-
      fix-and-reverify。

  - id: TS-004
    target_item: AG-004
    verification: |-
      各Workflow STEP が独立した開始/完了判定/resume point として成立することを検証する。
      各STEP reference が過去会話なしで Input Resolution/実行/検証/再開を行えることを確認する。
      STEP transition が SKILL.md（control plane）に所有され、reference 間で重複定義がないことを確認する。
    pass_criteria: |-
      全STEP が独立開始/完了判定/resume point 成立。旧Command 見出し番号機械分割でない。
      STEP reference が自足的。STEP transition 重複定義なし。
    on_failure: |-
      fix-and-reverify。

  - id: TS-005
    target_item: AG-005
    verification: |-
      durable state 優先順位が Workflow Skill SKILL.md / STEP reference / SPEC
      （input-resolution-and-durable-state.md）の schema として現れていることを検証する。
      優先順位: SSoT再構成 > identifier保持 > 最小scalar > runtime artifact。
      compaction 再現自体は harness 別実装のテストへ分離する。
    pass_criteria: |-
      durable state 優先順位が input-resolution-and-durable-state.md に明記されている。
      各 Workflow Skill SKILL.md が Input Resolution 参照を持ち、優先順位へ従っている。
      AgentDevFlow 配布契約が ToDo 必須機構として規定していない。
    on_failure: |-
      fix-and-reverify。優先順位の記述欠落・SKILL.md の参照不備は修正して再検証する。

  - id: TS-006
    target_item: AG-006
    verification: |-
      Workflow Skill SKILL.md / STEP reference に child task identity の durable state
      収録契約が schema として現れていることを検証する。fan-in 判定に必要な
      child identity / status 復元の契約が記述されている。
      compaction 再現自体は harness 別実装のテストへ分離する。
    pass_criteria: |-
      child identity / status の durable state 収録契約が SPEC / SKILL.md に現れている。
      fan-in 判定基準が workflow-contracts.md に機械参照可能な形で記述されている。
    on_failure: |-
      fix-and-reverify。契約記述の欠落は修正して再検証する。

  - id: TS-007
    target_item: AG-007
    verification: |-
      複数workflow で共通する能力を抽出し、Capability Skill として横断的に利用できることを検証する。
      workflow 固有STEP の過剰共通reference 化が回避されていることを確認する。
    pass_criteria: |-
      共通能力が Capability Skill として定義されている。過剰共通reference 化が回避されている。
    on_failure: |-
      fix-and-reverify。

  - id: TS-008
    target_item: AG-008
    verification: |-
      Workflow Extension/internal Workflow Extension/Capability Skill Extension の責務・配置・適用範囲・
      適用順序を確認する。public Workflow Extension が Capability Skill extension へ暗黙コピーしないことを
      確認する。後方互換性のためだけの二重extension model が残存しないことを確認する。
    pass_criteria: |-
      3種Extension の責務・配置・適用順序が定義されている。二重extension model が残存しない。
      暗黙コピーがない。
    on_failure: |-
      fix-and-reverify。

  - id: TS-009
    target_item: AG-009
    verification: |-
      Workflow Skill の意図しない discovery/invocation リスクに対する soft guard が導入されていることを
      検証する。OpenCode 1.18.15 で実現可能か確認する。
    pass_criteria: |-
      soft guard が導入されている。または OpenCode 機能制約により実現不可能な場合は Findings に記録されている。
    on_failure: |-
      record-in-findings。OpenCode 機能制約の場合は out-of-scope として Findings に記録する。

  - id: TS-010
    target_item: AG-010
    verification: |-
      case-run/case-auto・req-define・req-save/spec-save・intake-promote の各代表ケースで新workflow モデルの
      妥当性を検証する。case-auto が上位orchestrator として再設計されていることを確認する。
    pass_criteria: |-
      各代表ケースで orchestration/resume/HITL/loop/deterministic mutation/classification 境界が
      新モデルで成立。case-auto が上位orchestrator 化されている。
    on_failure: |-
      fix-and-reverify。

  - id: TS-011
    target_item: AG-011
    verification: |-
      正常系・blocked/failed・中断再実行・外部依存失敗・no-op/empty state の各シナリオで workflow 挙動を検証する。
    pass_criteria: |-
      正常系で既存公開IF 通じて完了。blocked/failed で未完了STEP をcompleted と誤認しない。
      中断再実行で current STEP から安全再開。外部依存失敗で状態推測せず blocked/failed 扱い。
      no-op/empty state の挙動維持。
    on_failure: |-
      fix-and-reverify。

  - id: TS-012
    target_item: AG-012
    verification: |-
      配布元リポジトリと consumer repository の責務境界・project extension 境界が新architecture で
      維持されることを検証する。
    pass_criteria: |-
      配布境界が維持されている。project extension 境界が新architecture で一貫している。
    on_failure: |-
      fix-and-reverify。

  - id: TS-013
    target_item: AG-013
    verification: |-
      worktree 内で全対象の実装・検証が完了し、main 反映時点で全体が新体系に移行済みであることを検証する。
      旧workflow implementation/不要旧extension contract/重複規則が残存しないことを確認する。
    pass_criteria: |-
      worktree 内実装・検証完了まで main に部分移行を反映していない。main 反映時点で全対象が新体系移行済み。
      旧実装・不要旧contract・重複規則が残存しない。保持が必要なものは新architecture 上で責務と理由が明示されている。
    on_failure: |-
      fix-and-reverify。

  - id: TS-014
    target_item: AG-014
    verification: |-
      関連checker/test が更新され、全受け入れ条件の検証結果が pass/fail/blocked/not applicable で
      記録されていることを検証する。
    pass_criteria: |-
      checker/test 更新済み。全AC の検証結果が記録されている。blocked/fail/未検証項目が残る状態を
      完了として扱っていない。
    on_failure: |-
      fix-and-reverify。

review_dispositions:
  - id: RD-001
    source_ru: RU-0006
    source_item: AC-1〜30
    disposition: covered
    reason_code: adopted_with_restructure
    reason: |-
      RU-0006 の30個の受け入れ条件は全て採用。14個のAG へグループ化し、REQ-002/005/006/008 UPDATE
      （REQ-008 は明確化、ACT-REQ-005）・REQ-027 CREATE・DEC-010/011/012 CREATE・SPEC 新規3件/UPDATE 9件
      （ACT-SPEC-012 は内容削除UPDATE含む） へ振り分けた。
      DEC候補E（worktree移行）はDecision 対象外とした（作業手段拒否ゲート）。結果条件はAG-013 に保持。
      covered 定義: source_item が同意済みartifact_actions の source_items へ過不足なく振り分け済み
      （adversarial-review F-011。covered定義の拡張は artifact-contracts.md の将来UPDATEで対応）。
    evidence:
      path: .agentdev/drafts/req-draft-workflow-skill-architecture-restructure.md
      section: draft-data.agreed_items
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: |-
    Wave 1a: 全公開Command（16件）の Workflow Architecture Inventory 作成
      （foundations/system.md UPDATE, ACT-SPEC-007）。Decision CREATE の Context 入力とする。
      adversarial-review F-003 反映: Inventory 作成を Decision 確定の先行タスクとする。
      Inventory 完了後に、新しいWorkflow Skill正規所有モデルと矛盾するCommand SPEC を特定し、
      追加のartifact_actions を生成する（UQ-001回答、下位5command は最低限の対象だが5件に固定しない）。
    Wave 1b: DEC-010/011/012 CREATE（OU-005）。Inventory 結果を Decision Context へ反映。
      DEC-010/012: 責務3層分化・Extension再編。
      DEC-011: STEP resume point と会話記憶非依存。
    Wave 1c: REQ-002/005/006 UPDATE（OU-001/002/003、Decision 確定後に実行）。
      REQ-002: 責務分界の意味変更（001〜004/030/031/035）。
      REQ-005: STEP reference・resume point・compaction安全性の横断要件。
      REQ-006: case-auto権威情報源変更（071〜073）。
    Wave 2: 新規SPEC 3件 CREATE（workflow-skill-model・step-reference-contract・
      input-resolution-and-durable-state）+ artifact-contracts.md 削除UPDATE（ACT-SPEC-012）。
      既存SPEC 8件 UPDATE。
    Wave 3: REQ-027 CREATE（Capability Skill・Soft guard・代表ケース検証）。
      全公開Command の Workflow Skill 移行実装。worktree 内で段階的に実装。
      staging branch 運用を許容（AG-013）。
    Wave 4: 横断検証・main 反映（体系切替境界、staging→main merge）。
  wave_hints:
    - "Wave 1a: Inventory作成（DEC CREATEの先行タスク）"
    - "Wave 1b: DEC-010/011/012 CREATE（OU-005、Inventory結果をContextへ反映）"
    - "Wave 1c: REQ-002/005/006 UPDATE（Decision確定後に実行）"
    - "Wave 2: SPEC新規作成3件 + artifact-contracts.md削除UPDATE + 既存SPEC UPDATE 8件"
    - "Wave 3: REQ-027 CREATE + Workflow Skill移行実装（staging branch運用許容）"
    - "Wave 4: 横断検証 + main反映（staging→main merge、体系切替境界）"
  req_save_note: >-
    adversarial-review F-12 反映。REQ UPDATE の content は番号付き箇条書き形式で記述している。
    req-save は本content を各REQ の要件テーブル行（`| REQ-NNNN-MMM | ... |`）へ構造化変換する責務を持つ。
    「要件行の書き方」基準（agentdev-req-analysis 品質基準）への適合は req-save が担保する。
```

# summary

AgentDevFlow 本体の Command / Workflow Skill / Capability Skill / Extension アーキテクチャ再編要件。

現行の「Command が workflow 実装本体を抱える」構造から、Command（公開IF/dispatch）・Workflow Skill（workflow実装）・STEP reference（resume point）・Capability Skill（共通能力）の5層責務へ再編する。Command 公開IF は原則維持。

主な変更:
- **REQ-002 UPDATE**: REQ-002-001〜004（責務分界の意味変更）、REQ-002-030/031（Extension対象単位）
- **REQ-005 UPDATE**: STEP reference・resume point・compaction安全性の横断要件
- **REQ-006 UPDATE**: case-auto権威情報源をWorkflow Skillへ変更
- **REQ-027 CREATE**: Capability Skill・Soft guard・代表ケース検証
- **DEC-010 CREATE**: 責務3層分化と1:N分割原則
- **DEC-011 CREATE**: STEP resume point と会話記憶非依存
- **DEC-012 CREATE**: Extension を file-kind から workflow/capability responsibility へ再編
- **SPEC新規3件**: workflow-skill-model・step-reference-contract・input-resolution-and-durable-state
- **SPEC UPDATE 8件**: project-extensions・workflow-contracts・artifact-responsibilities・system・harness-separation-model・command-file-format・agentdev-command-authoring・agentdev-skill-authoring

DEC候補E（worktree内全体移行）は作業手段拒否ゲートによりDecision対象外。結果条件（main上で混在状態を許さない）はAG-013に保持。main反映戦略としてstaging branch運用を許容する。各WaveのPRをmainへ順次mergeしない（mainへの反映は最終的な体系切替境界でのみ行う）。

ToDo配置は「AgentDevFlow配布契約はSTEP識別子と永続情報から再開点を決定できる契約のみ所有、ToDo使用・compaction検出・current STEP選択はharness固有」とした（DEC-001・REQ-002-022整合）。

Extension再編（DEC-012）は旧kind（command-extension/skill-extension）を完全廃止し、runtime後方互換を持たない。consumerプロジェクトも新kindへの移行対象。旧kind残存時はdeterministic checkで検出しmigration-requiredとして停止する。新kindへのmapping表をmigration documentationとして提供する（AG-008, ACT-SPEC-004）。

REQ-008-030「contentを完全に確定」の運用解釈を明確化（ACT-REQ-005）。artifact_actionsのcontentは変更範囲の変更後テキストを完全確定したreplacement fragmentとし、対象成果物全体の全文複製は要求しない。req-saveによる意味的な文章生成・補完は禁止維持。

## adversarial-review 結果反映

### 第1回 adversarial-review（bg_432e81f2）

REQ-015-001/002準拠で発動（2系統review stream、8分23秒）。ブロッカーなし。
- 確定事項6件: そのまま採用
- 推定事項5件（F-003/007/009/011/012）: 全てドラフトへ反映
- 親エージェント判断4件（F-001/004/008/010）: デフォルト設定して反映
- ユーザー確認事項3件（F-002→UQ-001, F-005→UQ-002, F-006→UQ-003）: ユーザー回答取得済み

### UQ-001/002/003 解決反映（計画エージェント判断）

- **UQ-001 (F-002)**: B採用。全Command inventory完了後に矛盾Command SPECを特定しUPDATE。下位5commandは最低限の対象だが5件に固定しない。ACT-REQ-003はcase-autoのみ、残りはWave 1a inventory完了後の追加artifact_actionsで対応（AG-003, case_open_hintsに明記）。
- **UQ-002 (F-005)**: A採用。旧kind完全廃止、runtime後方互換なし。consumer影響対象。旧kind残存時はmigration-requiredとして検出・停止。mapping表提供（AG-008, DEC-012 Consequences, ACT-SPEC-004に明記）。
- **UQ-003 (F-006)**: B採用。content = 変更範囲の変更後テキスト完全確定（replacement fragment）。全文複製不要求。REQ-008-030明確化UPDATE（ACT-REQ-005）を追加。

### F-010 修正（計画エージェント指摘）

OU-001/002/003のdepends_onから[OU-005]を削除。必須依存（depends_on）と推奨順序（recommended_order）を分離。DEC CREATEはRU内で既合意のarchitecture decisionを永続化するものであり、REQ UPDATEの必須依存には該当しない。

### 第2回 adversarial-review（bg_f2616512、再実行）

REQ-014-007準拠（意味内容変更あり）。UQ-001/002/003解決反映とF-010修正後のreq-draftを対象に2系統review streamで再審議（9分17秒）。

**確定事項6件**: UQ-001解決（inventory-based Command SPEC UPDATE）、UQ-002解決（breaking migration + migration-required検出）、UQ-003解決（replacement fragment解釈）、F-010修正（depends_on → recommended_order）、auto_gate構成、前回確定事項維持。

**推定事項3件（全て反映済み）**:
- F-013: OU-004 depends_on を [] へ変更、note に依存理由明記
- F-014: RD-001 reason へ ACT-REQ-005（REQ-008 UPDATE）反映
- F-015: ACT-SPEC-004 target_area を「## extension の基本構造」へ修正（現行セクション対応）

**ブロッカー**: なし。**ユーザー確認事項**: なし。

auto_ready: true で確定。全ての finding が処理済み。

Epic規模。Wave 6段階（1a/1b/1c/2/3/4）での段階的実装を推奨。
