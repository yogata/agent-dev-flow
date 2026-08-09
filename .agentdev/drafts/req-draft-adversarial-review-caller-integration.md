---
draft_type: req_draft
topic_slug: adversarial-review-caller-integration
status: saved
created_at: 2026-08-09T10:36:46+09:00
source_rus:
  - RU-0014
---

<!-- req_draft テンプレート
  このテンプレートは req-define が生成する構造化引き継ぎ成果物の原本である。
  後続工程（req-save/ spec-save/ case-open/ case-auto/ case-run/ case-close）が参照する
  原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
  soft contract（生成元側標準）であり、LLM 推論経由で消費される。
  厳格なスキーマバージョン、JSON Schema、バリデータは導入しない。 -->

# draft-data

```yaml
# work_type: feature（adversarial-review caller integration は新規振る舞い追加）
work_type: feature

# scale: large（3 REQ、15 SPEC 変更、Epic 構成が必要）
scale: large

# summary: 当該 draft が何を合意したかの1段落要約
summary: |
  adversarial-review（対論型レビュー）を任意助言手段として7コマンド横断
  （req-define, case-open, case-run, inspect-promote, intake-promote, learning-promote, backlog-review）
  および case-auto（停止伝播のみ）へ接続する要件を定義した。
  REQ-014（共通契約）、REQ-015（7経路+case-auto）、REQ-016（横断整合）の3 REQ へ分割。
  adversarial-review は新規必須工程/QG/HITL/承認ゲート/統制ゲートとして導入せず、
  各意味判断確定点から呼出する。3層正典構造（adversarial-review SPEC / 各 command SPEC /
  domain skill SPEC）で責務を分割。ADR 不要（既存 SPEC 体系内の責務分割で完結、ADR-001 上位原則）。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目
agreed_items:
  # ===== REQ-014 共通契約（Wave 1）=====
  - id: AG-001
    content: |
      adversarial-review は任意助言手段であり、新規必須工程、QG、承認ゲート、統制ゲートとして
      導入しない。QG-1〜QG-4 および既存 HITL を代替しない。adversarial-review 自身は
      ファイル、Issue、PR、git 操作を行わず、レビュー結果用の新規正規 artifact を生成しない。
  - id: AG-002
    content: |
      共通 caller integration 契約（入力コンテキスト、返却契約）の正規所有者は
      adversarial-review SPEC である。caller integration 用の新規永続 schema は作成しない。
  - id: AG-003
    content: |
      accepted finding は呼出元責務で候補へ反映する。finding 反映で review 対象の意味内容が
      変更された場合は必要な既存検証を再実行し、その変更から新たな本質的争点が生じ得る場合のみ
      adversarial-review を再発動できる。同一 finding を新証拠・新前提・異なる failure condition・
      未評価範囲なしに再起票しない。再 review の停止条件は4点:
      (1) 新しい本質的 finding がない、
      (2) 新 finding は全て撤回・解決・限定合意済み、
      (3) 残った争点がユーザー判断を必要とするため既存 HITL/blocker へ移行、
      (4) 変更後も候補の意味内容が変化しておらず再 review 対象がない。
  - id: AG-004
    content: |
      unresolved な本質的争点またはユーザー判断事項が残る場合、保存・削除・Issue 作成・
      実装開始等の後続不可逆処理へ進まない。ただし adversarial-review 自体を新しい
      恒久的な統制ゲートとしない。
  - id: AG-005
    content: |
      呼出失敗時は silent skip を禁止し、利用不能を報告した上で従来フローと
      既存 QG/HITL を維持する。既存 QG を「代替」と表現しない。
  - id: AG-006
    content: |
      正規所有者マトリックス（adversarial-review SPEC / delegation-contracts /
      各 command SPEC / domain skill SPEC / workflow-contracts + case-auto SPEC）を採用し、
      一つの意味を一つの SPEC だけが規範定義し、重複規範・矛盾を生じない。
  - id: AG-007
    content: |
      user-decision-required は case-run result enum の第5状態ではなく、既存結果に付随する
      case-auto の停止理由分類である。case-run 起源では blocked、その他の委譲では既存 status と
      parent_decision_required を使用する。REQ-003-011/012 の4状態契約
      （completed-pr/blocked/failed/delegation-unavailable）は維持する。
  # ===== REQ-015 7経路+case-auto（Wave 2）=====
  - id: AG-008
    content: |
      7コマンドすべてに、各 command SPEC で review 挿入位置が現行 Step 構造へ一意に特定可能であり、
      発動条件判定 Step と review 呼出 Step が分離されている review 挿入境界がある。
  - id: AG-009
    content: |
      ユーザー明示指定時は対象7コマンドでレビューが発動する。条件非該当時は従来フローが維持される。
  - id: AG-010
    content: |
      req-define 経路A: 要件候補が意味的に完成した後（Scale 判断後）、ADR判断前、要件doc生成前に
      review を挿入する。ADR finding は ADR判断（Step 6）へ戻す。
  - id: AG-011
    content: |
      inspect-promote 経路B: 暫定分類後、HITL 前に review を挿入する。
      --auto 経路は review 挿入を迂回する（fast path）。
  - id: AG-012
    content: |
      intake-promote 経路C: 暫定分類生成後、ユーザ提示前に review を挿入する。
  - id: AG-013
    content: |
      learning-promote 経路D: 既存対策確認後、判定結果提示前に review を挿入する。
      review 反映時は evaluation-report 更新へ戻し、関連 Step を再実行する。
  - id: AG-014
    content: |
      backlog-review 経路E: 構成、review、承認の順で進む。矛盾は既存矛盾検出へ渡し、
      review 内で自動解決しない。
  - id: AG-015
    content: |
      case-open 経路F: execution structure、Issue 本文候補、完了条件を構成し、
      最初の GitHub Issue 作成前に review を挿入する。変更影響別に QG-2、preflight、両方、不要を再実行する。
  - id: AG-016
    content: |
      case-run 経路G: case-run 本体は実装方針を生成・審査せず、実装方針の形成、adversarial-review、
      結果反映は agentdev-case-run-execution-adapter の委譲契約内で最初の実装変更前に実施する。
      実装方針は既確定 Issue/REQ/ADR/SPEC を実現する内部選択に限定し、それらの変更が必要な場合は
      blocked へ遷移する。
  - id: AG-017
    content: |
      case-run blocked 経路: case-run で要件/仕様問題が見つかった場合、勝手に仕様変更せず
      blocked 経路へ入る。
  - id: AG-018
    content: |
      case-auto 経路H: case-auto は下位 command から user-decision-required + decision_context を
      受領して自走を停止し、ユーザへ提示し、resume point から再開する。
      review 直接起動、finding 解釈、採否、再評価を行わない。
  # ===== REQ-016 横断整合（Wave 3）=====
  - id: AG-019
    content: |
      7経路 + case-auto 統合後の横断整合: QG との重複がない、HITL 重複がない、
      新規永続成果物の混入がない、case-auto 伝播の regression がない、
      command/SPEC/SKILL 責務重複がない、command 定義本体と SPEC の Step 表現が整合する。

# artifact_actions: REQ/ADR/SPEC への保存対象
artifact_actions:
  # ===== REQ create ×3 =====
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:adversarial-review-caller-integration-common
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007]
    content: |
      ## 目的

      adversarial-review caller integration の共通契約（入力コンテキスト、返却契約、呼出失敗時取扱い、
      再review停止条件、正規所有者マトリックス）を所有する。本 REQ は共通契約層を定義し、
      各 command の呼出統合は REQ-015、横断整合は REQ-016 が所有する。
      adversarial-review 自身の振る舞い契約（入力スキーマ、Reviewer/Reviewee protocol、収束判定）は
      REQ-003-035〜040 および adversarial-review SPEC が既に所有する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-014-001 | 対論型レビュー（adversarial-review）は任意助言手段であり、新規必須工程、QG、承認ゲート、統制ゲートとして導入しないこと |
      | REQ-014-002 | adversarial-review は QG-1〜QG-4 および既存 HITL を代替しないこと |
      | REQ-014-003 | 共通 caller integration 契約（入力コンテキスト、返却契約）の正規所有者は adversarial-review SPEC であること。caller integration 用の新規永続 schema を作成しないこと |
      | REQ-014-004 | adversarial-review 自身はファイル、Issue、PR、git 操作を行わないこと |
      | REQ-014-005 | レビュー結果用の新規正規 artifact を生成しないこと |
      | REQ-014-006 | accepted finding は呼出元責務で候補へ反映すること |
      | REQ-014-007 | finding 反映で review 対象の意味内容が変更された場合は必要な既存検証を再実行し、その変更から新たな本質的争点が生じ得る場合のみ adversarial-review を再発動できること。同一 finding を新証拠・新前提・異なる failure condition・未評価範囲なしに再起票しないこと |
      | REQ-014-008 | 再 review の停止条件は次の4点であること: (1) 新しい本質的 finding がない、(2) 新 finding は全て撤回・解決・限定合意済み、(3) 残った争点がユーザー判断を必要とするため既存 HITL/blocker へ移行、(4) 変更後も候補の意味内容が変化しておらず再 review 対象がない |
      | REQ-014-009 | unresolved な本質的争点またはユーザー判断事項が残る場合、保存・削除・Issue 作成・実装開始等の後続不可逆処理へ進まないこと。ただし adversarial-review 自体を新しい恒久的な統制ゲートとしないこと |
      | REQ-014-010 | 呼出失敗時は silent skip を禁止し、利用不能を報告した上で従来フローと既存 QG/HITL を維持すること |
      | REQ-014-011 | 正規所有者マトリックス（adversarial-review SPEC / delegation-contracts / 各 command SPEC / domain skill SPEC / workflow-contracts + case-auto SPEC）を採用し、一つの意味を一つの SPEC だけが規範定義し、重複規範・矛盾を生じないこと |
      | REQ-014-012 | user-decision-required は case-run result enum の第5状態ではなく、既存結果に付随する case-auto の停止理由分類であること。case-run 起源では blocked、その他の委譲では既存 status と parent_decision_required を使用すること |

      ## 適用範囲

      - **対象**:
        - 共通 caller integration 契約（任意助言手段の位置づけ、QG/HITL 非代替、副作用禁止、新規 artifact 非生成）
        - accepted finding の反映責務、再 review 条件と停止条件4点、同一 finding 再起票禁止
        - unresolved 時の不可逆処理回避（恒久統制ゲート化禁止）
        - 呼出失敗時の silent skip 禁止と従来フロー維持
        - 正規所有者マトリックスと重複防止制約
        - user-decision-required の停止理由分類としての位置づけ（第5状態ではない）
      - **対象外**:
        - 各 command の呼出統合（発動条件、挿入境界、戻り先）（REQ-015）
        - 横断整合確認（REQ-016）
        - adversarial-review 自身の振る舞い契約（入力スキーマ、Reviewer/Reviewee protocol、収束判定）（REQ-003-035〜040、adversarial-review SPEC）
        - 共通契約の詳細パラメータ、入力フィールド構成、enum 値（adversarial-review SPEC、workflow-contracts SPEC、delegation-contracts SPEC）
  - id: ACT-REQ-002
    artifact: req
    operation: create
    target: new:adversarial-review-caller-integration-routes
    source_items: [AG-008, AG-009, AG-010, AG-011, AG-012, AG-013, AG-014, AG-015, AG-016, AG-017, AG-018]
    content: |
      ## 目的

      7コマンド（req-define, case-open, case-run, inspect-promote, intake-promote, learning-promote,
      backlog-review）および case-auto（停止伝播のみ）へ adversarial-review caller integration を
      実装する。各 command SPEC が review 挿入境界（発動条件、review 対象確定位置、採用後戻り先、
      最初の副作用との順序）を正典として所有する。共通契約は REQ-014、横断整合は REQ-016 が所有する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-015-001 | 7コマンドすべてに、各 command SPEC で review 挿入位置が現行 Step 構造へ一意に特定可能であり、発動条件判定 Step と review 呼出 Step が分離されている review 挿入境界があること |
      | REQ-015-002 | ユーザー明示指定時は対象7コマンドでレビューが発動すること |
      | REQ-015-003 | 条件非該当時は従来フローが維持されること |
      | REQ-015-004 | req-define は要件候補が意味的に完成した後（Scale 判断後）、ADR判断前、要件doc生成前に review を挿入し、ADR finding は ADR判断へ戻すこと |
      | REQ-015-005 | inspect-promote は暫定分類後、HITL 前に review を挿入し、--auto 経路は review 挿入を迂回すること |
      | REQ-015-006 | intake-promote は暫定分類生成後、ユーザ提示前に review を挿入すること |
      | REQ-015-007 | learning-promote は既存対策確認後、判定結果提示前に review を挿入し、review 反映時は evaluation-report 更新へ戻し、関連 Step を再実行すること |
      | REQ-015-008 | backlog-review は構成、review、承認の順で進み、矛盾は既存矛盾検出へ渡し、review 内で自動解決しないこと |
      | REQ-015-009 | case-open は execution structure、Issue 本文候補、完了条件を構成し、最初の GitHub Issue 作成前に review を挿入すること。変更影響別に QG-2、preflight、両方、不要を再実行すること |
      | REQ-015-010 | case-run 本体は実装方針を生成・審査せず、実装方針の形成、adversarial-review、結果反映は agentdev-case-run-execution-adapter の委譲契約内で最初の実装変更前に実施すること。実装方針は既確定 Issue/REQ/ADR/SPEC を実現する内部選択に限定し、それらの変更が必要な場合は blocked へ遷移すること |
      | REQ-015-011 | case-run で要件/仕様問題が見つかった場合、勝手に仕様変更せず blocked 経路へ入ること |
      | REQ-015-012 | case-auto は下位 command から user-decision-required + decision_context を受領して自走を停止し、ユーザへ提示し、resume point から再開すること。review 直接起動、finding 解釈、採否、再評価を行わないこと |

      ## 適用範囲

      - **対象**:
        - 7コマンド（req-define, case-open, case-run, inspect-promote, intake-promote, learning-promote, backlog-review）の review 挿入境界、発動条件、採用後戻り先
        - case-auto の停止伝播（user-decision-required + decision_context 受領、resume point）
        - case-run から agentdev-case-run-execution-adapter への委譲内 review 統合
        - 各経路の最初の副作用（Issue 作成、要件doc保存、実装変更等）との順序
      - **対象外**:
        - 共通 caller integration 契約（REQ-014）
        - 横断整合確認（REQ-016）
        - 各 command の既存手続き詳細（各 command SPEC）
        - 各経路の具体Step番号、入力フィールド構成（各 command SPEC、各 domain skill SPEC）
  - id: ACT-REQ-003
    artifact: req
    operation: create
    target: new:adversarial-review-caller-integration-integrity
    source_items: [AG-019]
    content: |
      ## 目的

      7経路 + case-auto 統合後の横断整合を確認する。QG/HITL 重複、新規永続成果物混入、
      case-auto 伝播 regression、責務重複、command 定義本体と SPEC の Step 表現整合を検証する。
      共通契約は REQ-014、各 command 呼出統合は REQ-015 が所有する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-016-001 | 7経路 + case-auto 統合後、QG との重複がないこと |
      | REQ-016-002 | 7経路 + case-auto 統合後、HITL 重複がないこと |
      | REQ-016-003 | 7経路 + case-auto 統合後、新規永続成果物の混入がないこと |
      | REQ-016-004 | 7経路 + case-auto 統合後、case-auto 伝播の regression がないこと |
      | REQ-016-005 | 7経路 + case-auto 統合後、command/SPEC/SKILL 責務重複がないこと |
      | REQ-016-006 | 7経路 + case-auto 統合後、command 定義本体と SPEC の Step 表現が整合すること |

      ## 適用範囲

      - **対象**:
        - 7経路 + case-auto 統合後の横断整合確認（QG/HITL 重複、新規永続成果物混入、case-auto 伝播 regression、責務重複、Step 表現整合）
      - **対象外**:
        - 共通契約（REQ-014）
        - 各 command 呼出統合（REQ-015）
        - 横断整合の個別検証手順（Wave 3 の case-run 実装）
  # ===== SPEC spec-append ×15 =====
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-append
    target: docs/specs/skills/agentdev-adversarial-review.md
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-adversarial-review
    target_area: "## adversarial-review caller integration 共通契約"
    placement: tail
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006]
    content: |
      caller integration（7コマンド + case-auto からの呼出）の共通契約層を正典として所有する。
      入力コンテキスト、返却契約、呼出失敗時取扱い、再 review 条件と停止条件4点、任意性、
      副作用禁止、QG/HITL 非代替、正規所有者マトリックスを規定する。
      詳細パラメータ・入力フィールド構成は本 SPEC の参照節へ配置する。
  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-append
    target: docs/specs/workflows/workflow-contracts.md
    target_spec:
      operation: update
      domain: workflows
      slug: workflow-contracts
    target_area: "## adversarial-review 由来の停止信号"
    placement: tail
    source_items: [AG-007, AG-018]
    content: |
      user-decision-required 停止理由分類の正規化、case-auto への伝播、resume point を規定する。
      user-decision-required は case-run result enum の第5状態ではなく、停止理由分類である。
  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-append
    target: docs/specs/workflows/delegation-contracts.md
    target_spec:
      operation: update
      domain: workflows
      slug: delegation-contracts
    target_area: "## adversarial-review との委譲契約接続"
    placement: tail
    source_items: [AG-007, AG-016]
    content: |
      review 経路での parent_decision_required / decision_context の適用、副作用境界を規定する。
      REQ-003-011/012 の4状態契約（completed-pr/blocked/failed/delegation-unavailable）は維持する。
  - id: ACT-SPEC-004
    artifact: spec
    operation: spec-append
    target: docs/specs/commands/req-define.md
    target_spec:
      operation: update
      domain: commands
      slug: req-define
    target_area: "## adversarial-review 挿入境界（経路A）"
    placement: tail
    source_items: [AG-010]
    content: |
      経路A の review 挿入境界: 発動条件（Scale 判断後・ADR判断前・要件doc生成前）、
      review 対象確定位置、採用後戻り先（ADR finding は Step 6 へ）、
      最初の副作用（要件doc保存）との順序を規定する。
  - id: ACT-SPEC-005
    artifact: spec
    operation: spec-append
    target: docs/specs/commands/case-open.md
    target_spec:
      operation: update
      domain: commands
      slug: case-open
    target_area: "## adversarial-review 挿入境界（経路F）"
    placement: tail
    source_items: [AG-015]
    content: |
      経路F の review 挿入境界: 発動条件（execution structure / Issue 本文候補 / 完了条件構成後・
      最初の Issue 作成前）、変更影響別の QG-2 / preflight / 両方 / 不要 再実行ルールを規定する。
  - id: ACT-SPEC-006
    artifact: spec
    operation: spec-append
    target: docs/specs/commands/case-run.md
    target_spec:
      operation: update
      domain: commands
      slug: case-run
    target_area: "## adversarial-review 挿入境界（経路G: adapter 委譲内）"
    placement: tail
    source_items: [AG-016, AG-017]
    content: |
      経路G の review 挿入境界: adapter 委譲内の実装方針形成 → review → 結果反映、
      実装方針限定（既確定 Issue/REQ/ADR/SPEC を実現する内部選択）、blocked 遷移を規定する。
      case-run 本体は実装方針を生成・審査せず、agentdev-case-run-execution-adapter へ委譲する。
  - id: ACT-SPEC-007
    artifact: spec
    operation: spec-append
    target: docs/specs/commands/inspect-promote.md
    target_spec:
      operation: update
      domain: commands
      slug: inspect-promote
    target_area: "## adversarial-review 挿入境界（経路B）"
    placement: tail
    source_items: [AG-011]
    content: |
      経路B の review 挿入境界: 発動条件（暫定分類後・HITL 前）、--auto 経路の review 挿入迂回
      （fast path）を規定する。
  - id: ACT-SPEC-008
    artifact: spec
    operation: spec-append
    target: docs/specs/commands/intake-promote.md
    target_spec:
      operation: update
      domain: commands
      slug: intake-promote
    target_area: "## adversarial-review 挿入境界（経路C）"
    placement: tail
    source_items: [AG-012]
    content: |
      経路C の review 挿入境界: 発動条件（暫定分類生成後・ユーザ提示前）を規定する。
  - id: ACT-SPEC-009
    artifact: spec
    operation: spec-append
    target: docs/specs/commands/learning-promote.md
    target_spec:
      operation: update
      domain: commands
      slug: learning-promote
    target_area: "## adversarial-review 挿入境界（経路D）"
    placement: tail
    source_items: [AG-013]
    content: |
      経路D の review 挿入境界: 発動条件（既存対策確認後・判定結果提示前）、
      review 反映時の evaluation-report 更新へ戻し、関連 Step 再実行ループを規定する。
  - id: ACT-SPEC-010
    artifact: spec
    operation: spec-append
    target: docs/specs/commands/backlog-review.md
    target_spec:
      operation: update
      domain: commands
      slug: backlog-review
    target_area: "## adversarial-review 挿入境界（経路E）"
    placement: tail
    source_items: [AG-014]
    content: |
      経路E の review 挿入境界: 構成 → review → 承認の順序、矛盾は既存矛盾検出へ渡す、
      review 内で自動解決しないことを規定する。
  - id: ACT-SPEC-011
    artifact: spec
    operation: spec-append
    target: docs/specs/commands/case-auto.md
    target_spec:
      operation: update
      domain: commands
      slug: case-auto
    target_area: "## adversarial-review 由来の停止伝播（経路H）"
    placement: tail
    source_items: [AG-018]
    content: |
      経路H の停止伝播: user-decision-required + decision_context 受領、自走停止、
      resume point、review 直接起動・finding 解釈・採否・再評価を行わないことを規定する。
  - id: ACT-SPEC-012
    artifact: spec
    operation: spec-append
    target: docs/specs/skills/agentdev-intake-pipeline.md
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-intake-pipeline
    target_area: "## adversarial-review 候補判断と内部挿入"
    placement: tail
    source_items: [AG-012]
    content: |
      intake-promote 経路C における review 候補判断基準と内部手続き（候補確定位置、
      呼出タイミング、結果反映先）を規定する。
  - id: ACT-SPEC-013
    artifact: spec
    operation: spec-append
    target: docs/specs/skills/agentdev-learning-pipeline.md
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-learning-pipeline
    target_area: "## adversarial-review 候補判断と内部挿入"
    placement: tail
    source_items: [AG-013]
    content: |
      learning-promote 経路D における review 候補判断基準と内部手続き（候補確定位置、
      呼出タイミング、evaluation-report 反映、Step 6 戻しループ）を規定する。
  - id: ACT-SPEC-014
    artifact: spec
    operation: spec-append
    target: docs/specs/skills/agentdev-backlog-integration.md
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-backlog-integration
    target_area: "## adversarial-review 候補判断と内部挿入"
    placement: tail
    source_items: [AG-014]
    content: |
      backlog-review 経路E における review 候補判断基準と内部手続き（候補確定位置、
      呼出タイミング、矛盾検出への引き渡し）を規定する。
  - id: ACT-SPEC-015
    artifact: spec
    operation: spec-append
    target: docs/specs/skills/agentdev-case-run-execution-adapter.md
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-case-run-execution-adapter
    target_area: "## adversarial-review 統合（実装方針→review→結果反映）"
    placement: tail
    source_items: [AG-016, AG-017]
    content: |
      case-run 経路G の adapter 委譲内における実装方針形成、adversarial-review 呼出、
      結果反映、blocked 遷移の内部手続きを規定する。

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: |
      RU-0014 の「review result の第5状態相当」表現と REQ-003-011/012 の
      case-run result 4状態契約（completed-pr/blocked/failed/delegation-unavailable）の衝突。
    resolution: |
      user-decision-required を case-run result enum の第5状態ではなく、
      case-auto の直交した停止理由分類へ一意化した。case-run 起源では blocked を維持し、
      判断内容を既存 parent_decision_required / decision_context へ載せる。
      REQ-003-011/012 の4状態契約は維持する。
      根拠: agentdev-architecture-advisory（bg_7240f995）。
  - id: CR-002
    conflict: |
      ADR-008 候補（adversarial-review caller integration のアーキテクチャ決定記録）の要否。
    resolution: |
      ADR 不要。中心は既存の任意レビューを既存 command へ接続する動作仕様・境界・ルーティングであり、
      新規必須工程/永続状態/schema/gate/外部基盤を導入しない。既存 SPEC 体系内の責務分割で完結し、
      ADR-001（新規統制を既定で追加しない原則）を上位原則とする。ADR-001〜007 に置換すべき決定なし。
      根拠: agentdev-architecture-advisory（bg_7240f995）、agentdev-adr-guidelines Step 6。

# operation_units: 複数RU入力時の統合/分離結果
operation_units:
  - ou_id: OU-001
    source_ru: RU-0014
    target_req: REQ-014
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0014
    target_req: REQ-015
    operation: create
    scale: large
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: epic
    result: {}
  - ou_id: OU-003
    source_ru: RU-0014
    target_req: REQ-016
    operation: create
    scale: standard
    depends_on: [OU-002]
    recommended_order: 3
    issue_policy: single
    result: {}

# test_strategy: 各合意項目の検証方法
test_strategy:
  - id: TS-001
    target_item: AG-008
    verification: |
      7コマンド（req-define, case-open, case-run, inspect-promote, intake-promote, learning-promote,
      backlog-review）の各 command SPEC に、発動条件判定 Step と review 呼出 Step が分離された
      review 挿入境界が存在することを確認する。
    pass_criteria: |
      7コマンドすべての SPEC に review 挿入境界節があり、発動条件 Step と呼出 Step が分離されている。
    on_failure: |
      fix-and-reverify: 当該 command SPEC へ review 挿入境界節を追加し、再確認する。
  - id: TS-002
    target_item: AG-009
    verification: |
      各 command の review 発動条件に「ユーザー明示指定時は発動」が含まれること、
      および「条件非該当時は従来フロー」が含まれることを確認する。
    pass_criteria: |
      7コマンドすべての SPEC でユーザー明示指定時発動と条件非該当時従来フロー維持が明記される。
    on_failure: |
      fix-and-reverify: 発動条件節へ追記し、再確認する。
  - id: TS-003
    target_item: AG-001
    verification: |
      REQ-014-001/002/004/005 により、adversarial-review が任意助言手段であり、
      必須工程/QG/HITL/承認ゲート/統制ゲート/副作用/新規artifact の何れにも該当しないことを確認する。
    pass_criteria: |
      REQ-014-001〜005 が REQ 本文へ記載され、adversarial-review SPEC にも任意性・副作用禁止・
      新規artifact非生成が明記される。
    on_failure: |
      fix-and-reverify: REQ 本文または SPEC へ追記し、再確認する。
  - id: TS-004
    target_item: AG-001
    verification: |
      REQ-014-002 により adversarial-review が QG-1〜QG-4 を代替しないことを確認する。
    pass_criteria: |
      REQ-014-002 が REQ 本文へ記載され、既存 QG が維持されることが SPEC へ明記される。
    on_failure: |
      fix-and-reverify: REQ 本文または SPEC へ追記し、再確認する。
  - id: TS-005
    target_item: AG-002
    verification: |
      REQ-014-003 により共通 caller integration 契約の正規所有者が adversarial-review SPEC であり、
      新規永続 schema を作成しないことを確認する。
    pass_criteria: |
      REQ-014-003 が REQ 本文へ記載され、adversarial-review SPEC に共通契約節がある。
    on_failure: |
      fix-and-reverify: REQ 本文または SPEC へ追記し、再確認する。
  - id: TS-006
    target_item: AG-003
    verification: |
      REQ-014-006/007/008 により accepted finding の反映責務、再 review 条件、停止条件4点、
      同一 finding 再起票禁止が確認する。
    pass_criteria: |
      REQ-014-006〜008 が REQ 本文へ記載され、adversarial-review SPEC に再review契約節がある。
    on_failure: |
      fix-and-reverify: REQ 本文または SPEC へ追記し、再確認する。
  - id: TS-007
    target_item: AG-003
    verification: |
      同一 finding を新証拠・新前提・異なる failure condition・未評価範囲なしに再起票しないことを確認する。
    pass_criteria: |
      REQ-014-007 に同一 finding 再起票禁止が明記され、adversarial-review SPEC にも同旨が記載される。
    on_failure: |
      fix-and-reverify: REQ 本文または SPEC へ追記し、再確認する。
  - id: TS-008
    target_item: AG-004
    verification: |
      REQ-014-009 により unresolved 時の不可逆処理回避と恒久統制ゲート化禁止を確認する。
    pass_criteria: |
      REQ-014-009 が REQ 本文へ記載され、恒久統制ゲート化しない旨が明記される。
    on_failure: |
      fix-and-reverify: REQ 本文へ追記し、再確認する。
  - id: TS-009
    target_item: AG-001
    verification: |
      REQ-014-002 により既存 HITL を代替しないことを確認する。
    pass_criteria: |
      REQ-014-002 が REQ 本文へ記載され、既存 HITL が維持されることが SPEC へ明記される。
    on_failure: |
      fix-and-reverify: REQ 本文または SPEC へ追記し、再確認する。
  - id: TS-010
    target_item: AG-005
    verification: |
      REQ-014-010 により呼出失敗時の silent skip 禁止と従来フロー維持を確認する。
    pass_criteria: |
      REQ-014-010 が REQ 本文へ記載され、adversarial-review SPEC に呼出失敗時取扱い節がある。
    on_failure: |
      fix-and-reverify: REQ 本文または SPEC へ追記し、再確認する。
  - id: TS-011
    target_item: AG-011
    verification: |
      inspect-promote SPEC の経路B に、--auto 経路が review 挿入を迂回することが明記されていることを確認する。
    pass_criteria: |
      inspect-promote SPEC 経路B 節に --auto fast path が明記される。
    on_failure: |
      fix-and-reverify: inspect-promote SPEC へ追記し、再確認する。
  - id: TS-012
    target_item: AG-013
    verification: |
      learning-promote SPEC の経路D に、review 反映時の evaluation-report 更新戻しと関連 Step 再実行が明記されていることを確認する。
    pass_criteria: |
      learning-promote SPEC 経路D 節に evaluation-report 反映ループが明記される。
    on_failure: |
      fix-and-reverify: learning-promote SPEC へ追記し、再確認する。
  - id: TS-013
    target_item: AG-015
    verification: |
      case-open SPEC の経路F に、変更影響別の QG-2 / preflight / 両方 / 不要 再実行ルールが明記されていることを確認する。
    pass_criteria: |
      case-open SPEC 経路F 節に4パターンの再実行ルールが明記される。
    on_failure: |
      fix-and-reverify: case-open SPEC へ追記し、再確認する。
  - id: TS-014
    target_item: AG-016
    verification: |
      case-run SPEC の経路G に、adapter 委譲内で実装方針形成→review→結果反映が行われること、
      実装方針限定と blocked 遷移が明記されていることを確認する。
    pass_criteria: |
      case-run SPEC 経路G 節と agentdev-case-run-execution-adapter SPEC 統合節に契約が明記される。
    on_failure: |
      fix-and-reverify: case-run SPEC または adapter SPEC へ追記し、再確認する。
  - id: TS-015
    target_item: AG-017
    verification: |
      case-run SPEC の blocked 経路に、要件/仕様問題時に勝手に仕様変更せず blocked へ入ることが明記されていることを確認する。
    pass_criteria: |
      case-run SPEC 経路G 節に blocked 遷移条件が明記される。
    on_failure: |
      fix-and-reverify: case-run SPEC へ追記し、再確認する。
  - id: TS-016
    target_item: AG-014
    verification: |
      backlog-review SPEC の経路E に、HITL 前に review を挿入すること、矛盾は既存検出へ渡し
      review 内で自動解決しないことが明記されていることを確認する。
    pass_criteria: |
      backlog-review SPEC 経路E 節に順序と矛盾取扱いが明記される。
    on_failure: |
      fix-and-reverify: backlog-review SPEC へ追記し、再確認する。
  - id: TS-017
    target_item: AG-019
    verification: |
      REQ-016-001〜006 により、7経路+case-auto 統合後の QG/HITL 重複、新規永続成果物混入、
      case-auto 伝播 regression、責務重複、Step 表現整合を横断確認する。
    pass_criteria: |
      REQ-016-001〜006 が REQ 本文へ記載され、Wave 3 横断整合で重複/regression が検出されない。
    on_failure: |
      fix-and-reverify: 横断整合で検出された重複/regression を該当 SPEC へ修正し、再確認する。
  - id: TS-018
    target_item: AG-018
    verification: |
      case-auto SPEC の経路H に、user-decision-required + decision_context 受領、自走停止、
      resume point が明記されていることを確認する。
    pass_criteria: |
      case-auto SPEC 経路H 節に停止伝播契約が明記される。
    on_failure: |
      fix-and-reverify: case-auto SPEC へ追記し、再確認する。
  - id: TS-019
    target_item: AG-018
    verification: |
      case-auto SPEC の経路H に、review 直接起動・finding 解釈・採否・再評価を行わないことが明記されていることを確認する。
    pass_criteria: |
      case-auto SPEC 経路H 節に review 直接関与禁止が明記される。
    on_failure: |
      fix-and-reverify: case-auto SPEC へ追記し、再確認する。

# review_dispositions: 採否判断の記録
review_dispositions:
  - id: RD-001
    source_ru: RU-0014
    source_item: U5
    disposition: covered
    reason_code: resolved_via_conflict_resolution
    reason: |
      RU-0014 の U5（user-decision-required の位置づけ）は本 draft の CR-001 へ移管し一意化した。
      case-run result enum 第5状態ではなく case-auto の停止理由分類とする。
    evidence:
      path: docs/requirements/REQ-003.md
      section: REQ-003-011/012（4状態契約）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0014
    source_item: F11
    disposition: rejected
    reason_code: withdrawn_by_origin
    reason: |
      RU-0014 審議で撤回済みの F11 を本 draft でも撤回維持する。
    evidence:
      path: null
      section: null
      checked_at_commit: null
    related_removed_items: []

# case_open_hints: case-open 構成生成への参考情報
case_open_hints:
  epic_needed: true
  decomposition: |
    Wave1: REQ-014 共通契約（直列前提、全経路が依存）
    Wave2: REQ-015 7経路A-G（並列可能）+ case-auto H（F/G完了後）
    Wave3: REQ-016 横断整合（Wave2完了後）
  wave_hints:
    - "Wave1: REQ-014 共通契約（adversarial-review SPEC、workflow-contracts SPEC、delegation-contracts SPEC）。全経路が依存するため直列前提。"
    - "Wave2: REQ-015 7経路A-G（req-define/inspect-promote/intake-promote/learning-promote/backlog-review/case-open/case-run）は並列可能。case-auto H（停止伝播）は case-open F と case-run G 完了後。"
    - "Wave3: REQ-016 横断整合（Wave2 全経路完了後、QG/HITL重複・新規永続成果物・regression・責務重複・Step表現整合を検証）。"
```

# summary

adversarial-review（対論型レビュー）を任意助言手段として7コマンド横断（req-define, case-open, case-run, inspect-promote, intake-promote, learning-promote, backlog-review）および case-auto（停止伝播のみ）へ接続する要件を定義した。

3 REQ へ分割: REQ-014（共通契約、12要件行、Wave 1）、REQ-015（7経路+case-auto、12要件行、Wave 2）、REQ-016（横断整合、6要件行、Wave 3）。15 SPEC へ spec-append（adversarial-review SPEC / workflow-contracts / delegation-contracts / 7 command SPEC / case-auto / 4 domain skill SPEC）。

adversarial-review は新規必須工程/QG/HITL/承認ゲート/統制ゲートとして導入せず、各意味判断確定点から呼出する。3層正典構造（adversarial-review SPEC / 各 command SPEC / domain skill SPEC）で責務を分割し、一つの意味を一つの SPEC だけが規範定義する。

ADR 不要（既存 SPEC 体系内の責務分割で完結、ADR-001 上位原則）。user-decision-required は case-run result enum 第5状態ではなく case-auto の停止理由分類へ一意化（CR-001、REQ-003-011/012 の4状態契約は維持）。

RU-0014 は session由来RU（`agentdev_handoff: true`）だが、REQ-005-018/022 により agent-dev-flow 本体リポジトリでは通常要件として処理し、handoff フラグは履歴メタデータとして維持する。
