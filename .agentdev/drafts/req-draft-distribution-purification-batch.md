---
draft_type: req_draft
topic_slug: distribution-purification-batch
status: saved
created_at: 2026-07-15T18:00:00+09:00
saved_at: 2026-07-15
source_rus: [RU-0001, RU-0002, RU-0003, RU-0004, RU-0005, RU-0006, RU-0007, RU-0008, RU-0009, RU-0010, RU-0011, RU-0012]
---

<!-- req_draft: 12RU統合ドラフト。AgentDevFlow配布物の責務境界浄化、検査是正、文書品質改善の一括バッチ。
     原本の情報源は下記 # draft-data 内 YAML コードブロックである。soft contract（ADR-0124）。 -->

# draft-data

```yaml
work_type: maintenance

scale: standard

spec_actions_consumed: true

summary: >-
  AgentDevFlow 配布物の責務境界浄化（具体ID/パス抽象化、実行制御パラメータ集約、
  placeholder 検査除外）、case-close 是正（gh CLI 委譲、false-clean 多層防御）、
  docs 機械的修正（REQ 件数、em-dash、文書追記、broken-reference 修復）、
  REQ/SPEC 境界是正（SPEC detail 除去、Phase 計画移送）、検査スクリプト是正
  （report フィールド必須化、SPEC 記載陳腐化解消）、case-open テンプレート修正を含む
  12 RU 一括是正バッチ。全6グループを1 case-auto で実行する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |-
      配布物本文からプロジェクト固有の識別子（REQ-NNNN、ADR-NNNN、IR-NNNN 形式のトレーサビリティ注記）を除去すること。
      HTMLコメント形式（<!-- REQ-NNNN -->）および本文中のインライン参照の両方を含む。
      トレーサビリティは git 履歴と原本側 docs/ で担保し、配布物は業務ワークフロー契約のみを記述する。
      設計判断（壁打ち CR-001）：除去のみ。抽象参照への置換、project extensions による mapping は行わない。
  - id: AG-002
    content: |-
      配布物本文からプロジェクト固有の docs 内部パス（docs/specs/**、docs/guides/**、docs/adr/** 等）を除去すること。
      消費プロジェクトの文書ディレクトリ構成に依存する参照を持たないこと。
      設計判断（壁打ち CR-002）：除去。AGENTS.md 経由や残置ではなく、配布物から完全に削除する。
  - id: AG-003
    content: |-
      check_integrity.ts は references/<harness>.md の <harness> placeholder パターンを検査対象外とすること。
      ADR-0136 で正当な placeholder として定義済みであり、検査側が追従する。
      設計判断（壁打ち CR-003）：検査除外（IR ルール更新）。実ファイル配置や記法見直しは行わない。
  - id: AG-004
    content: |-
      配布 command 6 ファイルに残留する実行制御パラメータ（最大5件、120秒 timeout、retry 5回等）を
      各 skill の references/<topic>.md へ集約すること。REQ-0162-002 および ADR-0136 に基づく。
  - id: AG-005
    content: |-
      case-close.md の gh CLI 直接呼出（L120/L161 の gh pr view 等）を agentdev-gh-cli への委譲表現へ置換すること。
      IR-053、REQ-0152-001 に基づく。
  - id: AG-006
    content: |-
      case-close Step3-1 の docs guard false-clean を多層防御で予防すること。
      設計判断（壁打ち CR-004）：以下3層すべてを実装する。
      (1) --files 標準化: --base-ref から --files <PR変更ファイル> へ切替。
      (2) check_changed_docs.ts warning: files_checked 空時に warning 出力。
      (3) case-close 手順: files_checked が空でないことの確認ステップ追加。
  - id: AG-007
    content: |-
      docs/README.md および docs/requirements/README.md の REQ 件数表記を 53 件へ更新すること。
      REQ-0161/0162 追加が未反映（docs/README.md は「51件」、requirements/README.md は「53件」表記に部分的更新漏れ）。
  - id: AG-008
    content: |-
      src/opencode-local/ 3 ファイル（README、case-file、retry）に残存する和文 em-dash 16 件を是正すること。
  - id: AG-009
    content: |-
      agentdev-gh-cli standard-procedures.md に regex backreference $N の PowerShell 変数補間禁止を追記すること。
  - id: AG-010
    content: |-
      REQ-0161（L12, L22, L23, L25, L41）および REQ-0144（L50）の REQ-0157 への壊れた参照を修復すること。
      REQ-0157.md は retired 領域に存在せず、参照は歴史的記述として整理する。
      REQ-0161 の自己参照（要件行内の言及）は REQ-0161-004 の除外対象であるが、
      概要セクション（L12）および関連情報セクション（L41）は除外対象外であり修復が必要。
  - id: AG-011
    content: |-
      REQ-0130-035 から SPEC detail（Step番号、Phase番号等）を除去し、要件行を WHAT（状態要件）に純化すること。
      document-model.md SPEC 分離基準（Step番号、Phase番号は SPEC 配置対象）に基づく。
  - id: AG-012
    content: |-
      REQ-0158 L176-210 の Phase1-6 実装計画・スキーマ列挙を SPEC へ移送すること。
      REQ 要件行を WHAT に純化し、HOW（実装計画、スキーマ詳細）は SPEC に配置する。
      document-model.md SPEC 分離基準に基づく。
  - id: AG-013
    content: |-
      check_changed_docs.ts の report JSON に docInputsCheckRequired フィールドを含めること。
      当該フィールドは検査入力の必要性を示す必須情報であり、欠落時に検査結果が silent pass となることを防ぐ。
  - id: AG-014
    content: |-
      check_changed_docs.ts 関連 SPEC 記載の陳腐化を是正すること。
      extensions_check_required、declared_files_check が SPEC に未掲載のため、これらを追加する。
  - id: AG-015
    content: |-
      case-open テンプレートの repo-local skill（repo-*）パスを src/opencode/ から .opencode/skills/repo-*/ へ切替ること。

artifact_actions:

  # ===== REQ operations =====

  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-0162.md
    source_items: [AG-001, AG-002]
    content: |
      | REQ-0162-007 | 配布物本文は、プロジェクト固有の識別子（REQ-NNNN、ADR-NNNN、IR-NNNN 形式）を含まないこと。HTMLコメント、インライン参照のいずれも含まない。トレーサビリティ注記は git 履歴と原本側 docs/ で担保し、配布物には残置しないこと |
      | REQ-0162-008 | 配布物本文は、消費プロジェクトの文書ディレクトリ内部パス（docs/specs/**、docs/guides/**、docs/adr/** 等）を含まないこと。プロジェクト固有のディレクトリ構成に依存する参照を持たないこと |

  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-0144.md
    source_items: [AG-003]
    content: |
      | REQ-0144-025 | check_integrity.ts は references/<harness>.md の <harness> placeholder パターンを検査対象外とすること。ADR-0136 で正当な placeholder として定義済みであり、実ファイル存在を要求しないこと |

  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-0152.md
    source_items: [AG-005]
    content: |
      | REQ-0152-003 | case-close command の PR 状態取得処理は agentdev-gh-cli への委譲表現を使用し、gh CLI の直接呼出を含まないこと。対象箇所: case-close.md の PR view、PR merge 等の gh pr サブコマンド呼出 |

  - id: ACT-REQ-004
    artifact: req
    operation: append
    target: docs/requirements/REQ-0158.md
    target_area: "### case-close 向け false-clean 予防"
    source_items: [AG-006, AG-013]
    content: |
      ### case-close 向け false-clean 予防

      - docs guard 検査の対象ファイルが空（files_checked: 0）の場合、検査結果を warning として報告し、silent pass としないこと
      - case-close は --files <PR変更ファイル> 指定を標準とし、--base-ref のみの指定を補助的使用に限定すること。main worktree 実行時に HEAD==merge-base となる環境では --base-ref が空 diff を生じため、--files を優先すること
      - case-close 手順に files_checked が空でないことの確認ステップを含めること

      ### check_changed_docs.ts report フィールド

      - report JSON は docInputsCheckRequired フィールドを含むこと。当該フィールドは検査入力の必要性を示す必須情報であること

  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: docs/requirements/REQ-0161.md
    source_items: [AG-010]
    content: |
      REQ-0157 への壊れた参照を以下の通り修復する（REQ-0157.md は retired 領域に不存在）:

      1. L12（概要）: 「旧 doc-inputs 機構（ADR-0133/REQ-0157、superseded/retired 済み）」を
         「旧 doc-inputs 機構（ADR-0133、superseded 済み）」へ修正。
      2. L22（REQ-0161-001）: 削除対象から「docs/requirements/retired/REQ-0157.md」を除外
         （ファイルが存在しないため削除不要）。要件行を
         「.agentdev/config.yaml, docs/adr/ADR-0133.md, docs/specs/foundations/project-doc-inputs.md を削除すること」へ修正。
      3. L23（REQ-0161-002）: 参照クリーンアップ対象から「REQ-0157」を除外。
      4. L25（REQ-0161-004）: 検索パターンから「REQ-0157」を除外。
         「ADR-0133\|project-doc-inputs\|config\.yaml」へ修正。
      5. L41（関連情報）: 「Supersedes: なし（REQ-0157 は既に retired）」を
         「Supersedes: なし（旧 doc-inputs 機構は ADR-0133 へ統合済み）」へ修正。

  - id: ACT-REQ-006
    artifact: req
    operation: update
    target: docs/requirements/REQ-0144.md
    source_items: [AG-010]
    content: |
      L50 の broken-reference リストを更新する:
      「broken-reference（真）5件」→「broken-reference（真）4件」とし、
      REQ-0157 をリストから除外する（REQ-0161 で対応完了、当該参照は解消済み）。

  - id: ACT-REQ-007
    artifact: req
    operation: update
    target: docs/requirements/REQ-0130.md
    source_items: [AG-011]
    content: |
      REQ-0130-035 を WHAT 純化（SPEC detail 除去）:

      現行: | REQ-0130-035 | PR対象ファイルにdocs/**変更を含む場合、Step 6の委譲前にcheck_changed_docs.ts --workflow case-runを実行すること。検出結果はPR本文のFindings/Capture候補セクションに### docs-integrity小見出しで記録しcase-updateへ連携すること |

      修正後: | REQ-0130-035 | PR対象ファイルにdocs/**変更を含む場合、委譲前に check_changed_docs.ts を実行すること。検出結果は PR 本文に記録し case-update へ連携すること |

      除去対象 SPEC detail: Step 番号（Step 6）、ワークフロー名（--workflow case-run）、
      小見出し書式（### docs-integrity）。
      これらは document-model.md SPEC 分離基準（Step 番号、コマンド引数詳細）に該当する。

  - id: ACT-REQ-008
    artifact: req
    operation: update
    target: docs/requirements/REQ-0158.md
    target_area: "Phase1-6実装計画セクション（L176-210 相当）"
    source_items: [AG-012]
    content: |
      REQ-0158 L176-210 の Phase1-6 実装計画・スキーマ列挙を SPEC へ移送する。
      当該セクション（Phase1-6 実装計画、JSON スキーマ詳細、フィールド定義一覧）は
      document-model.md SPEC 分離基準（実装計画、スキーマ詳細、Phase 番号）に該当する。
      REQ 側は結果要件（WHAT）のみを残し、HOW（実装計画、スキーマ）は
      ACT-SPEC-002 で新設する SPEC へ移送する。

  - id: ACT-REQ-009
    artifact: req
    operation: append
    target: docs/requirements/REQ-0130.md
    source_items: [AG-015]
    content: |
      | REQ-0130-036 | case-open テンプレートが生成する repo-local skill（repo-*）のパス参照は .opencode/skills/repo-*/ を標準とし、src/opencode/ を含まないこと |

  # ===== SPEC operations =====

  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: foundations
      slug: harness-separation-model
    target_area: "## 具象参照抽象化"
    source_items: [AG-001, AG-002, AG-004]
    content: |
      ## 具象参照抽象化

      配布物からプロジェクト固有要素を除去する具体的手法を定める。ADR-0136 の適用詳細。

      ### 除去対象パターン

      | 対象 | パターン例 | 除去方針 |
      |---|---|---|
      | トレーサビリティ注記（HTMLコメント） | `<!-- REQ-0162-002 -->` | 削除。本文意に影響しない |
      | トレーサビリティ注記（インライン） | 「REQ-0162-002 に基づき」 | 文脈を保持したまま識別子を除去。「本要件に基づき」等へ |
      | docs 内部パス | `docs/specs/foundations/document-model.md` | 削除。または抽象表現「文書粒度 SPEC」等へ |
      | 実行制御パラメータ | 「最大5件」「120秒 timeout」「retry 5回」 | references/<topic>.md へ集約 |

      ### トレーサビリティ担保

      除去された識別子のトレーサビリティは以下で担保する:
      - git 履歴（コミットメッセージ、diff）
      - 原本側 docs/（REQ、ADR、IR カタログ）

      ### baseline 既知違反

      src/opencode/ 配下の既知違反（baseline 11件）は段階解消の対象とし、
      一括除去の完了条件から除外する。

  - id: ACT-SPEC-002
    artifact: spec
    operation: create
    target_spec:
      operation: create
      domain: integrity
      slug: targeted-docs-guard-implementation
    source_items: [AG-012]
    content: |
      ## Targeted Docs Guard 実装詳細

      REQ-0158（Targeted Docs Integrity Guard）から移送された実装計画・スキーマ詳細。

      ### Phase1-6 実装計画

      REQ-0158 L176-210 に記載されていた Phase1-6 の実装計画、JSON スキーマ定義、
      フィールド一覧を本 SPEC に配置する。req-save が REQ-0158 から当該セクションを
      除去し、spec-save が本 SPEC に保存する。

      ※ 当該セクションの正確な本文は REQ-0158 L176-210 から抽出する。
         req-save / spec-save 実行時に現行テキストを取得し、本 SPEC へ移送する。

  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: integrity
      slug: targeted-docs-guard-implementation
    target_area: "### report フィールド一覧"
    source_items: [AG-014]
    content: |
      ### report フィールド一覧

      check_changed_docs.ts の report JSON に含まれる全フィールドを列挙する。
      陳腐化により未掲載だった以下フィールドを追加する:

      - docInputsCheckRequired: 検査入力の必要性（boolean）
      - extensionsCheckRequired: project extensions 検査の必要性（boolean）
      - declaredFilesCheck: 宣言ファイル検査の実行結果（object）

      既存フィールド（files_checked, findings 等）とあわせて、report JSON の
      完全スキーマを本セクションに集約する。

conflict_resolutions:
  - id: CR-001
    conflict: 配布物本文の具体ID参照（REQ-NNNN等）の抽象化手法。除去のみ、抽象参照置換、project extensions mapping の3選択肢。
    resolution: 除去のみを採用。トレーサビリティは git 履歴と原本側 docs/ で担保する。抽象参照への置換は実用性が低く（具体IDなしでは追跡不能）、project extensions は37件の注記に対して過剰であるため不採用。
  - id: CR-002
    conflict: 配布物本文の具体 docs パス（docs/specs/** 等）の処理。AGENTS.md 経由、除去、残置の3選択肢。
    resolution: 除去を採用。ADR-0136 の「配布物は業務ワークフロー契約のみ」に合致。消費プロジェクト固有のパス構成に依存すべきでないため、AGENTS.md 経由も不採用。残置（baseline 扱い）は段階解消計画が必要となり対象外。
  - id: CR-003
    conflict: references/<harness>.md の placeholder が check_integrity.ts で false positive（9件）となる問題の対応。検査除外、実ファイル配置、記法見直しの3選択肢。
    resolution: 検査除外（IR ルール更新）を採用。<harness> は ADR-0136 で正当な placeholder として定義済みであり、検査側が追従すべき。実ファイル配置は配布物に harness 固有ファイルを含めることで harness 非依存性を損なうため不採用。記法見直しは ADR-0136 の決定を覆すため不採用。
  - id: CR-004
    conflict: case-close Step3-1 docs guard false-clean（main worktree 実行で HEAD==merge-base、--base-ref が空 diff となる）の予防アプローチ。--files 標準化、warning 追加、確認ステップ追加の選択肢。
    resolution: 多層防御（3層すべて実装）を採用。false-clean は検査が実行されたように見える静かな失敗であり、単一対策では不十分。--files 標準化（根本原因対策）、warning 追加（検出レイヤー）、確認ステップ（手動確認レイヤー）の多重防御で信頼性を担保する。

operation_units:
  - ou_id: OU-001
    source_rus: [RU-0001, RU-0002, RU-0008]
    target_req: REQ-0162
    target_spec:
      operation: update
      domain: foundations
      slug: harness-separation-model
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {saved_reqs: [REQ-0162-007, REQ-0162-008], saved_spec: docs/specs/foundations/harness-separation-model.md, epic_number: 1515, issue_number: 1516, wave: 1}

  - ou_id: OU-002
    source_rus: [RU-0006, RU-0007]
    target_req: REQ-0152
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result: {saved_reqs: [REQ-0152-003], epic_number: 1515, issue_number: 1517, wave: 1}

  - ou_id: OU-003
    source_rus: [RU-0003, RU-0010, RU-0011, RU-0012]
    target_req: REQ-0161
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {saved_reqs: [REQ-0161-001, REQ-0161-002, REQ-0161-004 (broken-ref purified)], coreq_updated: REQ-0144 (broken-ref count 5->4), epic_number: 1515, issue_number: 1518, wave: 1}

  - ou_id: OU-004
    source_rus: [RU-0004]
    target_req: REQ-0130
    target_spec:
      operation: create
      domain: integrity
      slug: targeted-docs-guard-implementation
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {saved_reqs: [REQ-0130-035 (WHAT purified)], saved_spec: docs/specs/integrity/targeted-docs-guard-implementation.md (new), epic_number: 1515, issue_number: 1519, wave: 1}

  - ou_id: OU-005
    source_rus: [RU-0005]
    target_req: REQ-0158
    target_spec:
      operation: update
      domain: integrity
      slug: targeted-docs-guard-implementation
    operation: append
    scale: standard
    depends_on: [OU-004]
    recommended_order: 5
    issue_policy: single
    result: {saved_reqs: [REQ-0158 Phase1-6 section migrated to SPEC, false-clean/report-field sections appended], saved_spec: docs/specs/integrity/targeted-docs-guard-implementation.md (Phase1-6 + report field sections), epic_number: 1515, issue_number: 1520, wave: 2, depends_on_issue: 1519}

  - ou_id: OU-006
    source_rus: [RU-0009]
    target_req: REQ-0130
    operation: append
    scale: standard
    depends_on: [OU-004]
    recommended_order: 6
    issue_policy: single
    result: {saved_reqs: [REQ-0130-037 (draft expected -036, deterministic alloc overrode to -037 due to existing -036)], epic_number: 1515, issue_number: 1521, wave: 2, depends_on_issue: 1519}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      rg 'REQ-[0-9]{4}|ADR-[0-9]{4}|IR-[0-9]{2,3}' src/opencode/ --type md を実行し、
      プロジェクト固有識別子の残留を検索する。除外: baseline 既知違反 11件。
    pass_criteria: |
      baseline 既知違反 11件を除き、識別子残留 0件であること。
    on_failure: |
      fix-and-reverify: 残留箇所を特定し、識別子を除去して再検証する。

  - id: TS-002
    target_item: AG-002
    verification: |
      rg 'docs/specs/|docs/guides/|docs/adr/' src/opencode/ --type md を実行し、
      docs 内部パスの残留を検索する。除外: baseline 既知違反。
    pass_criteria: |
      baseline 既知違反を除き、docs 内部パス残留 0件であること。
    on_failure: |
      fix-and-reverify: 残留箇所を特定し、パス参照を除去して再検証する。

  - id: TS-003
    target_item: AG-003
    verification: |
      check_integrity.ts を実行し、references/<harness>.md の placeholder に関する
      false positive が解消されていることを確認する。
    pass_criteria: |
      <harness> placeholder に起因する NG が 0件であること。
    on_failure: |
      fix-and-reverify: IR ルールの除外パターンを修正し、再検証する。

  - id: TS-004
    target_item: AG-004
    verification: |
      配布 command 6ファイル（case-auto, case-open, case-run, case-close, case-update,
      req-define）の本文を実行制御パラメータ（最大N件、timeout、retry回数）で検索する。
    pass_criteria: |
      配布 command 本文に実行制御パラメータの直接記述が 0件であること。
      パラメータは各 skill の references/<topic>.md に集約されていること。
    on_failure: |
      fix-and-reverify: 残留パラメータを references へ移行し、本文から除去して再検証する。

  - id: TS-005
    target_item: AG-005
    verification: |
      rg 'gh pr |gh api ' src/opencode/commands/agentdev/case-close.md を実行し、
      gh CLI 直接呼出の残留を検索する。
    pass_criteria: |
      case-close.md 本文に gh CLI 直接呼出が 0件であること。
      委譲表現（agentdev-gh-cli 参照）に置換されていること。
    on_failure: |
      fix-and-reverify: 直接呼出を委譲表現へ置換し、再検証する。

  - id: TS-006
    target_item: AG-006
    verification: |
      (1) case-close.md で --files が標準指定されていることを確認。
      (2) check_changed_docs.ts で files_checked 空時に warning が出力されることを確認。
      (3) case-close 手順に files_checked 確認ステップが含まれることを確認。
    pass_criteria: |
      3層すべてが実装されていること。各層が独立して機能すること。
    on_failure: |
      fix-and-reverify: 不足層を実装し、再検証する。

  - id: TS-007
    target_item: AG-007
    verification: |
      docs/README.md および docs/requirements/README.md の REQ 件数表記を確認する。
    pass_criteria: |
      両ファイルとも REQ 件数が 53件（REQ-0101〜0162）と表記されていること。
    on_failure: |
      fix-and-reverify: 件数表記を修正し、再検証する。

  - id: TS-008
    target_item: AG-008
    verification: |
      rg '—' src/opencode-local/ を実行し、和文 em-dash の残留を検索する。
    pass_criteria: |
      src/opencode-local/ の em-dash 残留が 0件であること。
    on_failure: |
      fix-and-reverify: em-dash を適切な句点表記へ修正し、再検証する。

  - id: TS-009
    target_item: AG-009
    verification: |
      agentdev-gh-cli standard-procedures.md に regex backreference $N の
      PowerShell 変数補間禁止が記載されていることを確認する。
    pass_criteria: |
      当該注意事項が references に記載されていること。
    on_failure: |
      fix-and-reverify: 注意事項を追記し、再検証する。

  - id: TS-010
    target_item: AG-010
    verification: |
      rg 'REQ-0157' docs/requirements/REQ-0161.md docs/requirements/REQ-0144.md を実行する。
      ただし REQ-0161-004 の除外対象（要件行内の自己参照）は除外する。
    pass_criteria: |
      REQ-0161 の要件行以外の REQ-0157 参照が 0件であること。
      REQ-0144 L50 の broken-reference リストから REQ-0157 が除外されていること。
    on_failure: |
      fix-and-reverify: 参照を修復し、再検証する。

  - id: TS-011
    target_item: AG-011
    verification: |
      REQ-0130-035 の要件行を確認し、Step番号、Phase番号等の SPEC detail が
     除去されていることを確認する。
    pass_criteria: |
      REQ-0130-035 に Step番号、--workflow 引数、小見出し書式が含まれないこと。
      WHAT（状態要件）のみが記述されていること。
    on_failure: |
      fix-and-reverify: SPEC detail を除去し、再検証する。

  - id: TS-012
    target_item: AG-012
    verification: |
      REQ-0158 L176-210 相当の Phase1-6 実装計画・スキーマ列挙が
      SPEC（targeted-docs-guard-implementation.md）へ移送されていることを確認する。
    pass_criteria: |
      REQ-0158 に Phase1-6 実装計画・スキーマ詳細が含まれず、
      SPEC に移送済みであること。
    on_failure: |
      fix-and-reverify: SPEC への移送を完了し、REQ から除去して再検証する。

  - id: TS-013
    target_item: AG-013
    verification: |
      check_changed_docs.ts の report 出力に docInputsCheckRequired フィールドが
      含まれることを確認する。テストケースで空シナリオを実行する。
    pass_criteria: |
      report JSON に docInputsCheckRequired フィールドが存在すること。
    on_failure: |
      fix-and-reverify: フィールドを追加し、再検証する。

  - id: TS-014
    target_item: AG-014
    verification: |
      targeted-docs-guard-implementation.md SPEC の report フィールド一覧に
      extensions_check_required、declared_files_check が含まれることを確認する。
    pass_criteria: |
      SPEC のフィールド一覧に両フィールドが記載されていること。
    on_failure: |
      fix-and-reverify: SPEC を更新し、再検証する。

  - id: TS-015
    target_item: AG-015
    verification: |
      case-open テンプレート出力の repo-local skill パスが
      .opencode/skills/repo-*/ であることを確認する。
    pass_criteria: |
      case-open テンプレートに src/opencode/ パスが含まれず、
      .opencode/skills/repo-*/ が標準であること。
    on_failure: |
      fix-and-reverify: パスを修正し、再検証する。

case_open_hints:
  epic_needed: false
  decomposition:
    - ou_id: OU-001
      focus: 配布物責務境界浄化（具体ID/パス除去、実行制御パラメータ集約、placeholder 検査除外）
    - ou_id: OU-002
      focus: case-close 是正（gh CLI 委譲、false-clean 多層防御）
    - ou_id: OU-003
      focus: docs 機械的修正・表記品質（REQ件数、em-dash、文書追記、broken-ref修復）
    - ou_id: OU-004
      focus: REQ/SPEC 境界是正（SPEC detail 除去、Phase 計画 SPEC 移送）
    - ou_id: OU-005
      focus: 検査スクリプト是正（report フィールド必須化、SPEC 記載陳腐化解消）
    - ou_id: OU-006
      focus: case-open テンプレート修正（repo-local skill パス切替）
  wave_hints: []
```

# summary

12 RU を6グループに分割し、1 case-auto で実行する一括是正バッチ。

## 主要合意事項

1. **配布物責務境界浄化**（Group A, RU-0001/0002/0008）: 具体ID/パスの除去（CR-001/002）、実行制御パラメータの references 集約、`<harness>` placeholder の検査除外（CR-003）。ADR-0136 の適用範囲内、新規 ADR 不要。

2. **case-close 是正**（Group B, RU-0006/0007）: gh CLI 直接呼出の委譲表現化、docs guard false-clean の多層防御（CR-004: --files 標準化 + warning + 確認ステップ）。

3. **docs 機械的修正**（Group C, RU-0003/0010/0011/0012）: REQ 件数表記更新、em-dash 是正、PS 変数補間禁止の文書追記、REQ-0157 broken-reference 修復。

4. **REQ/SPEC 境界是正**（Group D, RU-0004）: REQ-0130-035 の SPEC detail 除去、REQ-0158 Phase 計画の SPEC 移送。document-model.md SPEC 分離基準の適用。

5. **検査スクリプト是正**（Group E, RU-0005）: check_changed_docs.ts report の docInputsCheckRequired フィールド必須化、SPEC 記載陳腐化解消。

6. **case-open テンプレート修正**（Group F, RU-0009）: repo-local skill パスの .opencode/skills/repo-*/ 切替。

## artifact_actions 構成

- REQ APPEND: 5件（REQ-0162, REQ-0144, REQ-0152, REQ-0158, REQ-0130）
- REQ UPDATE: 4件（REQ-0161, REQ-0144, REQ-0130, REQ-0158）
- SPEC UPDATE: 2件（harness-separation-model.md, targeted-docs-guard-implementation.md）
- SPEC CREATE: 1件（targeted-docs-guard-implementation.md）
- 実装のみ（REQ/SPEC 変更なし）: docs/README.md 更新、em-dash 是正、references 追記

## SPLIT 予兆

各対象 REQ の SPLIT シグナル:
- REQ-0162: 6行 → +2行 = 8行（安全、シグナル +0）
- REQ-0144: 24行 → +1行 = 25行（要注意、シグナル +0）
- REQ-0152: 2行 → +1行 = 3行（安全、シグナル +0）
- REQ-0130: 33行 → +1行 = 34行（要注意、シグナル +1）
- REQ-0158: 大規模 → 追加（既にSPLIT領域、既存構造維持）

推奨アクション: 全 REQ APPEND 許可範囲内。REQ-0158 は既存の大規模構造内での追加であり、新規 SPLIT は不要。
