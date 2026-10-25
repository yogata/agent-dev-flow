---
draft_type: req_draft
topic_slug: install-prerequisite-acceptance-f1b
status: draft
created_at: "2026-10-25"
source_rus: []
---

# draft-data

```yaml
status: draft
work_type: bugfix
scale: standard
summary: |
  明示訂正入力に基づき、合意済みF1(b)の導入時前提検証の受入不足だけを扱う検証済み完成ドラフト。
  REQ操作なし・Design行帰属で確定。機械工程検査節の検査入力を実際のconsumer条件fixtureへ
  置換するDesign節追記計画と、install.ps1改修・検証専用経路の切断点確定を含む実現面変更方針、
  正負対照と副作用なし契約・既存契約保持の検証戦略（TS-001〜006）を保持する。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

input_resolution:
  authoritative_input: C:/Users/ogatay/work/hermes-vault/project-list/req-input-adf-install-prerequisite-acceptance-20261025.md
  source_kind: explicit_read_only_correction
  read_complete: true
  approval_basis: "明示入力5〜7、37〜48行。既存F1(b)訂正の合意範囲のみを受理する。"
  scope: "REQ-009-053が保持する、主要機械工程scriptの実行時前提不一致の導入時検出。"
  preserved:
    - "完了済みCase #3850は再開・再解釈しない。CLOSEDおよび統合状況は入力からの報告であり今回のGitHub照会による確認ではない。"
    - "F1(a)(c)、F2〜F4の有効な成果・証拠を保持する。"
    - "producer正本の移動・削除、staff-schedule-cfの稼働中環境変更、release公開は行わない。"
  self_hosting:
    applicable: true
    basis: "src/common/skills/agentdev-workflow-lifecycle/references/upstream-handoff.md:7〜9、19〜21。ADF本体が現在プロジェクトの成果物である。"
    result: "consumerからの引継ぎ停止を適用しない。agentdev_handoff:trueを生成しない。"
  classification_hint:
    work_type: bugfix
    scale: standard
    status: confirmed_step_7
    reason: "STEP-7で確定済み。既存契約の受入不足訂正（bugfix）。Decision不要のためfeature昇格なし。large昇格シグナルなし。"

agreed_items:
  - id: AG-001
    content: |
      合意済みF1(b)の未達だけを訂正する。配布先の実際の機械工程入力と実行時前提の
      不一致を、副作用なしに導入時検出できる状態を成立させる。空JSONの拒否、
      bunの起動、scriptの存在のみを当該状態の受入証拠としない。
  - id: AG-002
    content: |
      既存の機械工程・Project Extensions・installerの契約に従って実際のconsumerの
      REQ行ID、必須ゲート実行体、入力書式、パス条件を検証する。入力検証専用入口の
      分離が必要な場合も今回の不足として扱う。worktree作成・ゲート実行・管理対象
      ファイル変更を検証の副作用として生じさせない。
  - id: AG-003
    content: |
      元repoの公開installer入口を隔離consumer相当環境から使い、前提が揃う正例と
      必須ゲート不在等の負例を確認する。不足条件は隔離複写またはfixtureで構成し、
      producer正本を移動・削除しない。機械工程節の検出とinstaller全体の結果を区別する。

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target: docs/designs/local/install-script-usability.md
    target_area: "### 機械工程 script の実行時前提の導入時検証（REQ-009-053）"
    placement: tail
    source_items: [AG-001, AG-002, AG-003]
    content: |
      - 検査入力は配布先の実際の consumer 条件（REQ 行 ID、必須ゲート実行体の参照、入力書式、パス条件）を表現する fixture で構成する。空 JSON の受理拒否、bun の起動、script ファイルの存在、対象集合が空の入力の受理を、実行時前提の検証成立の証拠としない。入力書式の契約は script 契約の既定に従う
      - 検証は前提が揃う正例と前提を欠く負例の対照で成立を確認する。不足条件は隔離複写または fixture で構成し、producer 正本を移動・削除せず、管理対象ファイルを変更しない（REQ-050-005）
      - 機械工程検査節の検出結果は節見出しと検証対象ごとの結果行で判読可能に報告する。終了コードへの反映と divergence の統一集約（本節の既存規定）を維持しつつ、機械工程検査節は installer 全体の他の divergence の有無に依存せず節単独で検出結果を判読できる
      - 検査入力 JSON の一時配置は対象 script 契約の置き場所指針に従う。横断依存検査の検査入力は workspace 外一時領域へ置かず、project root 内の契約に従う位置へ置く
conflict_resolutions: []
operation_units:
  - ou_id: OU-001
    target_req: null
    target_design: docs/designs/local/install-script-usability.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    classification_basis: |
      既存REQ照合は REQ操作なし で確定（観測 20261025T123828Z-08d7。references ハッシュ実測照合済み）。
      最終分類は Design行・分離true（観測 20261025T151351Z-3a9f）。20261025T123914Z-4b50 は
      step3-observation reference の digest 転記不一致のため判断根拠から除外し、同一意味判断を
      正確な references で新規評価により再確定した。REQ-009-053 が成果・制約を既に規定しており、
      Design 機械工程節への検証方法の箇条書き追記（append）のみを操作とする。
result: {}
realization_actions:
  - id: RA-001
    concern: install.ps1 機械工程検査節の検査入力を実 consumer 条件 fixture へ置換し、応答を意味解析する
    responsibility: |
      installer は機械工程検証の検出契機・呼出し・divergence 集約を所有する。検査入力の品質条件は
      Design 機械工程節が所有し、各 script の入力書式契約は配布 skill の script 契約が所有する。
    ownership_hints:
      - "scripts/install.ps1 807〜840（検証方法コメントと probe 契約。コメント改修を含む）"
      - "scripts/install.ps1 1271〜1338（実行と [OK]/[DIVERGENCE] 判定、終了コードの統一集約）"
      - "docs/designs/local/install-script-usability.md 機械工程節（検出契機と報告形式の正）"
    intent: |
      空 JSON {} と対象集合空の入力を前提成立証明にせず、REQ 行 ID・必須ゲート実行体・入力書式・
      パス条件を表現する fixture で正負対照を検出する。正例応答の最小述語: 終了 0、ok===true、
      population_count===1、condition_a.count===0、condition_b[].file_results[].read_ok 全 true、
      detection_unavailable 空。横断依存の解決不能パスは script の終了 0・ok:true でも
      install.ps1 が応答解析（述語不成立）で divergence 導出と非ゼロ終了を行う。
      検査入力の配置は対象 script 契約の置き場所指針に従い、現行の OS 一時領域使用は
      修正対象とする（配置免除の新設は行わない）。
    verification_refs: [TS-001, TS-002, TS-005, TS-006]
    source_items: [AG-001, AG-002, AG-003]
  - id: RA-002
    concern: 副作用なし検証専用経路の切断点確定と script 契約への反映
    responsibility: |
      各機械工程 script 所有者は検証ロジックを所有し、dry-run 入口の仕様は配布 skill の
      script 契約が所有する（Design 機械工程節既存規定の適用）。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts 283〜331（validateInput）、605〜625（ゲート可用性）、627〜646（dryRun でも到達する worktree 作成）、707〜722（dryRun でも実行される generateIndexesGate）"
      - "src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts 411〜456、556〜585"
      - "src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts 382〜463、993〜1025"
      - "src/common/skills/agentdev-workflow-case-open/scripts/src/inspect_cross_dependencies.ts"
      - "各配布 skill の scripts/README.md（script 契約。新入口または同等手段の仕様の定義先）"
    intent: |
      検証専用経路は入力検証（validateInput 相当）+ ゲート引数契約検査（preValidateGateSpec 相当）+
      ゲート実行体の存在確認（exists() のみ）で停止し、worktree 作成・ゲート実行・git/gh 操作・
      管理対象ファイル変更を行わない。新入口または同等手段の仕様は script 契約に定義してから
      検証対象へ組み込む。既存入口の dryRun:true でも worktree 作成・generateIndexesGate 実行へ
      到達し得る既存欠陥は本訂正では修正せず、観測時は Findings へ記録する。
    verification_refs: [TS-001, TS-003, TS-004]
    source_items: [AG-002]
review_dispositions:
  - id: RD-001
    source_item: input-lines-37-44
    disposition: covered
    reason_code: adopted_into_agreed_items_and_realization
    reason: |
      明示入力の対応範囲5項目は AG-001〜003 と RA-001〜002、TS-001〜006 へ採用済み。
      入力検証専用入口の分離は既存 Design 機械工程節の既定（専用入口または同等手段、
      script 契約定義経路）の適用として受理し、将来送りにしない。
    evidence:
      path: C:/Users/ogatay/work/hermes-vault/project-list/req-input-adf-install-prerequisite-acceptance-20261025.md
      section: 対応範囲
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_item: input-lines-17-35
    disposition: covered
    reason_code: verified_and_projected
    reason: |
      一次証拠（install.ps1 引用）は locally_verified_source_facts で機械的に裏付け済み。
      隔離再現報告は本次の実行対象とせず、検証義務（TS-001〜003）へ投影した。
      入力記載の main SHA は現行 HEAD（420aa1c4...）との一致を確認済み。
    evidence:
      path: C:/Users/ogatay/work/hermes-vault/project-list/req-input-adf-install-prerequisite-acceptance-20261025.md
      section: 一次証拠、監督側の隔離再現
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_item: input-lines-44
    disposition: not_applicable
    reason_code: out_of_scope_preserved
    reason: |
      F1(a)(c)、F2〜F4 の既存成果保持と Case #3850 非再開は preserved 記録であり、
      本 draft の採否判断対象ではない。staff-schedule-cf・release 公開は本訂正の操作対象外。
    evidence:
      path: C:/Users/ogatay/work/hermes-vault/project-list/req-input-adf-install-prerequisite-acceptance-20261025.md
      section: 完了済みCaseと残る未達
      checked_at_commit: null
    related_removed_items: []
assembly_evidence:
  - target_file: docs/designs/local/install-script-usability.md
    target_content_sha256: c318b1290f8c556f1ce82c6f30804b88c1f5a456f5e0aedfc7f873401ee5d591
    check_scope: { heading: "### 機械工程 script の実行時前提の導入時検証（REQ-009-053）", start_line: 124, end_line: 131 }
    execution_conditions: { operation: append, edit_sha256: 074d9ff4793386152393504a020caf8cce2532f75717fe0f31843f15602a735b, expected_old_count: null }
    checker: { name: assemble-draft-section, version: 0.2.0, settings: { heading_match: exact-after-normalization, old_text_count_check: true } }
    result_affecting_references: { heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan", scan_scope: target section only }
    checks_summary: { pre: { count: 2, all_ok: true }, post: { count: 2, all_ok: true } }
    diff_compact: { changed_lines_count: 5, added: 5, removed: 0 }
    executed_at: "2026-10-25T15:50:56.126Z"
    write_mode: no-write
    note: |
      prescribed 決定的組立スクリプト（src/common/skills/agentdev-workflow-req-define/scripts/src/assemble-draft-section.ts、ASSEMBLY_CHECKER 0.2.0）を append 操作・no-write で Design 原文へ実行した実行記録。
      最初の replace 実行は ok:false 拒否（old_text remained after assembly。replace は旧文完全除去を検査し追記形を表現できないため、操作を append へ正規化した。拒否は assembler 検査の正当動作）。
      組立結果の機械突合済み: assembled 節（13行）は決定的変換期待値（変更前節の末尾空行除去→空行+追加content+空行挿入）と完全一致、追加 content 全行の包含、既存箇条書きの逐語保持、Design 正本ハッシュ不変（c318b129...）。
      生の組立入力・出力・一時実行物は drafts 配下へ置かず temp（寿命: 当該定義実行とその再開まで）。実対象 Design への適用は case-ready / case-revise の Definition 保存内部責務。
test_strategy:
  - id: TS-001
    target_item: AG-002
    verification: |
      4機械工程（定義PR準備、定義PR受入検査、クローズ機械工程、横断依存検査）の実 consumer
      条件 fixture 入力で正負対照検証を実行する。正例: ゲート実行体が存在する参照、有効な
      REQ 行 ID、解決可能なパス、非空の shared_areas。負例: 必須ゲート実行体不在（ゲート3種）。
      不正 REQ 行 ID（定義PR準備の入力検証経路と受入検査・クローズのゲート引数契約検査経由）。
      存在しない shared_area ファイル（横断依存検査）。検証専用経路（RA-002 の切断点）で実行し
      実行系副作用を起動しない。
    pass_criteria: |
      正例で各 script の検証経路が合格する。負例のうちゲート不在・不正 REQ 行 ID は該当する
      divergence 報告と非ゼロ終了を得る。横断依存検査の解決不能パスは script が終了 0・ok:true
      を返しても、install.ps1 が応答解析（detection_unavailable 空・file_results read_ok 全 true
      でない）で divergence 報告と非ゼロ終了を導出する。空 JSON の受理拒否、bun の起動、
      script ファイルの存在、対象集合空の ok:true を前提成立証明にしない。
    on_failure: |
      fix-and-reverify。検査節の検査入力構成・応答解析・検証専用経路を修正して再検証する。
      本訂正の対象に関する不合格を Findings へ移すだけで完了扱いにしない。
  - id: TS-002
    target_item: AG-003
    verification: |
      元 repo の公開入口 scripts/install.ps1 -Mode check を、git 初期化済みの隔離 consumer
      相当環境で実行する。正例環境は完全に provisions された consumer 相当とする: bun が
      PATH に存在、3 skill 配下の4 script が配置済み、存在するゲート実行体を指す fixture、
      検査対象 seed ファイル、producer 正本を参照しない構成。負例環境は正例から前提のみを
      欠く（例: 必須ゲート実行体の不在）。producer 正本の移動・削除は行わない。
    pass_criteria: |
      正例（完全 provisions 環境）で機械工程検査節が前提成立を報告し、公開 installer 全体が
      exit 0 で受入する。負例（前提のみ欠落）で機械工程検査節が該当 divergence を報告し、
      installer 全体が非ゼロ終了する。検証前後で producer 正本・管理対象内容・ディレクトリ
      状態が同一。節別報告（TS-005）は負例の divergence が他の divergence に埋没しないための
      補助であり、正例の installer 全体受入（exit 0）の代替にしない。
    on_failure: |
      fix-and-reverify。隔離環境構成・検査節の検出・報告を修正して再検証する。
  - id: TS-003
    target_item: AG-002
    verification: |
      検証専用経路が worktree 作成・ゲート実行・git/gh 操作を起動しないことを、PATH 分離した
      git/gh shim（呼出しを記録し、呼出し検出時に失敗する）による実行時確認で必須に検証する。
      前後の管理対象内容とディレクトリ状態の同一性も併せて確認する。入口の構造的確認は補助的な
      根拠であり、実行時証明の代替にしない。
    pass_criteria: |
      shim 記録で git/gh/worktree/ゲート実行の起動が実行時にゼロ。前後で管理対象内容と
      ディレクトリ状態が同一。
    on_failure: |
      fix-and-reverify。検証経路の切断点・経路構成を修正して再検証する。
  - id: TS-004
    target_item: AG-002
    verification: |
      Windows 形式と Git Bash 形式のパス受理、および 3 桁・4 桁 REQ 部の REQ 行 ID 契約の
      非退行を正例で確認する。Git Bash 形式は install.ps1 経由ではなく対象 script への直接
      呼出しで検査する（install.ps1 は自らの Windows 形式ルートを渡すため形式差異を検査できない）。
    pass_criteria: |
      既存の受理形式が全て受理され続ける。producer 3 桁固定への退行が発生しない。
    on_failure: |
      fix-and-reverify。パス解決・REQ 行 ID 契約の扱いを修正して再検証する。
  - id: TS-005
    target_item: AG-003
    verification: |
      機械工程検査節の節別報告（節見出しと検証対象ごとの結果行）と installer 全体の終了コード・
      divergence 統一集約を区別し、節単独で検出結果を判読できることを確認する。
    pass_criteria: |
      機械工程検査節の検出結果が installer 全体の他の divergence の有無に依存せず判読できる。
      統一集約と終了コード反映の既存契約は維持される。
    on_failure: |
      fix-and-reverify。節別報告形式を修正して再検証する。
  - id: TS-006
    target_item: AG-002
    verification: |
      機械工程検査の検査入力 JSON と fixture の配置が、対象 script 契約の置き場所指針に
      従うことを確認する。横断依存検査の現行 script 契約は workspace 外一時領域禁止・
      project root 内限定である。install.ps1 の現行 OS 一時領域使用は同指針に反するため、
      該当箇所は本訂正の修正対象である（配置免除の新設は行わない）。
    pass_criteria: |
      検査入力配置が script 契約の置き場所指針に従う（workspace 外一時領域を使わず、
      project root 内の契約に従う位置へ置く）。install.ps1 の検査入力配置箇所が同指針に
      適合済みである。
    on_failure: |
      fix-and-reverify。検査入力の配置を契約指針へ修正して再検証する。
case_open_hints:
  future_obligations_nonblocking: "実装と検証義務（TS-001〜006、RA-001〜002）は本ドラフトが後続 Case へ定義する未来の義務である。Definition 完全性（auto_gate）は確定済みであり、義務の未実施を理由に case-auto の実装開始を妨げない（REQ-004-047 の抑止対象は未決・欠落・プレースホルダーのみ）。"
  known_preexisting_defects:
    - "prepare_definition_pr.ts は dryRun:true でも worktree 作成（627〜646）と generateIndexesGate 実行（707〜722）へ到達し得る既存欠陥。本訂正では修正しない。本訂正の検証実行中に観測した場合は Findings へ記録する。"
  input_placement_reconciliation: "機械工程検査の検査入力配置と横断依存検査 script 契約の置き場所指針の整合判断は TS-006 が担う。"
  producer_reports_consulted_not_relied_on: "入力の隔離再現報告（installer-output.txt）は本次未読。機械的再確認は後続 Case の検証義務（TS-002）として実施する。"

canonical_matching_evidence:
  status: determined_req_operation_none
  candidates:
    - path: docs/requirements/REQ-009.md
      row: REQ-009-053
      lines: "74"
      fact: "checkで実行時前提不一致を副作用なしに導入時検出し、対象範囲と検証方法をDesignへ委譲する既存要件が存在する。"
    - path: docs/designs/local/install-script-usability.md
      lines: "124〜130"
      fact: "4工程が対象。必須ゲート不在・入力書式不整合・解決不能パスをdivergenceと終了コードへ反映し、検証不能を成功扱いしない。"
  existing_design_correspondence: "同Design9行にADF-COVERS(design): REQ-009-053を直接確認済み。Design節更新は既存covers宣言の範囲内でありsidecar変更は不要。既存REQ行の意味変更なし（REQ操作なし）のため coverage 実査不要。"
  determined_judgment: "REQ操作なし（CREATE/APPEND/UPDATE不要）で確定。観測 20261025T123828Z-08d7（referencesハッシュ実測一致: REQ-009.md 8d6cdc23...、install-script-usability.md c318b129...、blocked-draft 7a83564...、HEAD 420aa1c4 一致）をprovenance検証の上で採用。"
  no_new_requirement_assumed: "入力は既存F1(b)訂正であり、新しい要求の採用根拠にはしない。既存REQを実装充足済みとは扱わない。"

locally_verified_source_facts:
  - path: scripts/install.ps1
    lines: "828〜839、1288〜1317"
    fact: "3本はinput-errorと{}、横断依存は空集合。前者はexit 1・stderr error:・stdout空、後者はexit 0・ok:trueだけで[OK]となる。"
  - path: src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts
    lines: "283〜330、341〜375、605〜637、682〜709、839〜898"
    fact: "CLIは入力検証後に工程実行へ接続する。reqRowIdPattern・traceabilityReqIds・ゲート検証が存在する。dryRun:trueでもworktree作成とgenerateIndexesGate実行に到達し得る。"
  - path: src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts
    lines: "411〜456、556〜585、632〜644、701〜760、816〜869"
    fact: "CLIの入力検証後はphase別工程を実行する。受入phaseはゲートを起動し、canonical-and-cleanupはfetch等へ進む。入力検証専用CLI分岐はない。"
  - path: src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts
    lines: "382〜463、993〜1025、1249〜1267、1292〜1349"
    fact: "CLIの入力検証後はpre-mergeでゲート確認とgh照会、post-mergeでworktree削除等へ接続する。入力検証専用CLI分岐はない。"
  - path: src/common/skills/agentdev-workflow-case-open/scripts/lib/cross_dependency_engine.ts
    lines: "39〜67、132〜190"
    fact: "shared_areasが空の場合、共有領域ファイル読取を行わずok:trueを返す。読取不能もok:trueとdetection_unavailableで報告されるためok:trueだけでは前提成立を示さない。"
  - path: src/common/skills/agentdev-workflow-case-open/scripts/lib/cross_dependency_types.ts
    lines: "136〜169"
    fact: "Windows形式・Git Bash形式・POSIX形式・相対形式を扱う既存パス解決契約がある。"
  - path: src/common/skills/agentdev-workflow-case-open/scripts/lib/definition-traceability-gate.ts
    lines: "66〜73"
    fact: "REQ行IDの共有判定は3桁または4桁のREQ部と3桁の行番号を受理する。consumer条件の検証をproducer3桁固定へ戻さない。"
  - path: src/common/skills/agentdev-workflow-case-open/scripts/README.md
    lines: "19〜41、43〜56"
    fact: "横断依存のI/Oと共有領域定義は呼出側が解決する契約。検査入力はproject root内一時領域へ置く規律があり、installerのOS一時領域使用との整合確認が必要。今回この規律は変更しない。"

reported_not_locally_reproduced:
  source: "明示入力19〜35行の引用と隔離再現報告のみ。intake inbox/promotedは読まない。"
  facts:
    - "入力はproducer固有ゲートとpackage.json不在でも機械工程4本が[OK]となったと報告する。"
    - "installer全体は別の75件のdivergenceでexit 1。全体成功の報告ではない。"
    - "入力記載のmain SHA 420aa1c4e2499f89d19f1462620187340ae44f10は現行HEADとの一致をgitで確認済み。"
  evidence_path_as_reported: C:/Users/ogatay/AppData/Local/hermes/cache/scratch/adf-f1b-acceptance-20261025-210350/installer-output.txt
  execution_in_this_run: "installer・機械工程・隔離再現・テストは本次も実行していない。引用先の再現出力も本次未読。機械的再確認は後続Caseの検証義務（TS-002）である。"

resume_candidates:
  status: decided_and_reflected_into_realization_actions_and_test_strategy
  finite_source_surfaces:
    - scripts/install.ps1
    - src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts
    - src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts
    - src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts
    - src/common/skills/agentdev-workflow-case-open/scripts/src/inspect_cross_dependencies.ts
  ownership_constraints:
    - "installerは検出契機・呼出し・divergence集約を所有し、入力検証ロジックは各機械工程所有者へ残す。"
    - "Project Extensionsはconsumer固有値の既存解決点。producer固有ゲートをconsumerへ無条件必須化しない。実際の宣言からの解決は既存解決点を使用し本訂正での変更対象外。"
    - "横断依存の共有単一実装とgate_effect:noneを維持し、一般の重複警告を新たな停止条件に変えない。"
    - "Design変更の操作本文はACT-DESIGN-001（機械工程節への箇条書き追記・append）として確定。所有者分類も確定済み。"
  verification_obligations:
    - "検証義務はtest_strategy TS-001〜006として確定済み。4工程の実consumer入力を扱い、必須ゲートの欠落・不正REQ行ID・解決不能パスを識別する正負対照。"
    - "前提が揃う隔離consumerで公開installerが全体受入（exit 0）となり、前提だけを欠落させた対照で該当divergenceと非ゼロ終了になる。"
    - "空JSON拒否・空集合ok:trueを前提成立証明にせず、検証不能を成功に変換しない。"
    - "検証専用経路でworktree・ゲート・git/gh操作を起動せず（実行時shim証明が必須）、前後の管理対象内容とディレクトリ状態が同一。"
    - "WindowsとGit Bashの既存パス受理、および3桁・4桁REQ部の既存契約を保持する。"
  on_failure_candidate: "本訂正の対象に関する不合格はfix-and-reverify。既存未達をFindingsへ移すだけで完了扱いにしない。"

gate_results:
  step_1: "completed: 明示入力全文の読取と範囲受理を実施。"
  step_2: "completed: 既存合意と制約を保持。self-hosting例外を確認。新たな人間留保仕様判断は検出なし。"
  step_3: "completed: 既存REQ照合は REQ操作なし で確定。観測 20261025T123828Z-08d7 を provenance 検証（references ハッシュ実測一致、HEAD 一致）の上で採用。SPLIT予兆計測: REQ新設・APPEND/UPDATE 対象REQなし。"
  step_4: "completed: 最終分類は Design行・分離true（観測 20261025T151351Z-3a9f、confidence 0.98）。5観点境界リスク分析を実施し case-specific risk を test_strategy へ投影（dependency: fixture と正本依存、execution: dryRun 副作用到達、build/runtime: bun・ゲート実行体、environment propagation: 隔離環境差と検査入力配置、client/server: git/gh 起動禁止）。design対応事前確認: 既存REQ行の意味変更なしのため coverage 実査不要。文書分類妥当性検証: REQ残留行なし。検索系検証なし、REQ廃止なし、REQ新設なし。"
  step_5: "completed: Decision不要を確定。重複確認（DEC-016 は本訂正の前提判断であり衝突なし）、Decision禁止ゲート（反映作業・実現訂正へのDecision化なし）、architecture-advisory 委譲条件非該当（Decision候補なし・責務境界変更なし・既存Designとの衝突候補なしのため委譲不実施。根拠記録済み）。"
  step_6_qg1: "completed: 必須fields到達、execution_groups 不含、artifact_actions 統合済み（Design append 1件、content 完全確定・決定的マーカーなし）、test_strategy 3要素完全（TS-001〜006）、5観点→test_strategy 投影完全。組立は決定的組立スクリプト（assemble-draft-section.ts、append no-write）で実行し検査済み。QG-1 合格。"
  step_7: "completed: work_type=bugfix（既存契約の受入不足訂正。Decision不要のためfeature昇格なし）。scale=standard（単一Design節update と installer 検査節改修。実装スコープシグナルでlarge昇格要件なし）。"
  step_8: "completed: adversarial-review 発動（default-on）。2系統独立 challenge stream（契約整合系・検証実効系）による対称的相互反証、Reviewee counter-challenge、戦略メタ反証（両系統とも正負対照戦略の根幹に異議なし・実現可能性の具体化を要求）、convergence、反映後 convergence audit を実施。essential 4件・disagreement 5件・nonessential 3件を検出し全て反映または記録。反映内容: 検証専用経路の切断点明示、TS-001〜004 修正とTS-006 追加、検査入力配置規律の Design 追加、節別報告文言の統一集約整合修正、script契約反映の RA-002 明記、正例環境の最低構成明示、残存 dryRun 欠陥の Findings 記録義務、最小応答述語の明記、冒頭段落保持の明示、対象外既存不整合の未採用記録。unresolved なユーザー判断事項なし。追加 delta review（親指示欠陥修正に対する独立レビュー。bg_3b536d02 / ses_e8c3bd2c7ffeZluaGqCP6SYLbz、12m49s）は REQUEST-CHANGES で essential 1件（resume_candidates の update 語残存）のみを指摘し反映済み。他は clean または nonessential（未変更 historical 記録内の generic 用語用法 2件は reviewer 判断で遡及修正せず現状保持）。reviewer 側の独立機械検証: Design sha256 一致、節 8行→組立 13行の導出整合、diff added 5/removed 0、append 空行挿入の実装整合、replace 拒否の正当性、prepare_definition_pr.ts dryRun 無視の worktree/gate 到達（627〜646・707〜722）、置き場所指針と TS-006 の整合。"
  step_9: "completed: 重要変更通知を保存前に出力済み。第一回保存は明示パス指定 commit ff835755d、第二回保存は delta review 指摘反映と親指示欠陥修正（機械組立・TS修正・append正規化・旧矛盾除去・auto_ready:false）後に明示パス指定 commit 3cff31280 で永続化（ともに1ファイル、amend 不使用、スイープstageなし）。第3修正（親指示ゲート意味訂正: 合成ブロッカー除去と auto_ready:true 復元）の後、読み戻し完結性確認（fenced YAML 閉包・全fields到達・決定的マーカーなし・文字化けなし）と YAML 構造機械検証（pyyaml 6.0.3）を実施し、明示パス指定の NEW commit（amend 不使用、スイープstageなし、ステージ済み他者変更を含まない）で永続化する。観測 JSON 3件は commit 対象外（明示パス許可はドラフトのみ）として残置。"
  step_10_11: "completed: 要件doc提示と完了報告（bugfix → lightweight 種別）を出力。"
  jev:
    invoked: true
    observations:
      - id: "20261025T123828Z-08d7"
        kind: existing-req-matching
        disposition: "採用。references ハッシュを実測照合（REQ-009.md・install-script-usability.md・blocked-draft が記録値と一致、HEAD 420aa1c4 と一致）し provenance 完全を確認。REQ操作なし/確認不要を採用。"
      - id: "20261025T123914Z-4b50"
        kind: expansion-final-classification
        disposition: "判断根拠から除外。step3-observation reference の digest が観測1 JSON 実ハッシュ（a88ad726faa24c6319b641042bf5cc10d197b4bf9f6cc79b927733ccfe1fbab1）と一致せず blocked-draft の digest 値の転記。同一意味判断を次の新規評価で再確定した（観測は手編集せず現状保持）。"
      - id: "20261025T151351Z-3a9f"
        kind: expansion-final-classification
        disposition: "採用。stable semantic IDs（同一 evaluationKind/questionId）と正確な references で新規評価。Design行/分離true、confidence 0.98。observation_write による最終判断反映済み。"
    api_failure: null
    reason: "公開Tool（agentdev_jev）の evaluate と observation_write を所定経路で実行。観測はTool所定の保存先 .agentdev/jev-observations/ へ永続化済み。LLM推論は評価結果・確率分布・confidence を含む従来の判断材料で実施し、最終判断はevaluator結果と一致。"
    evidence: ".agentdev/jev-observations/20261025T151351Z-3a9f.json、同 20261025T123828Z-08d7.json、同 20261025T123914Z-4b50.json（除外根拠付き保持）。"
    failure_policy: "評価器障害時は判定未確定停止と依存後続抑止（DEC-052）。API失敗なしのため適用機会なし。"
  bounded_advisory:
    purpose: "Jevの書込み境界に関する読取専用助言。STEP-8ではない。"
    session_id: ses_e8d09b7daffeLDHZVoQrAX4wTT
    result: "呼出しはsession metadataのみを返した。結果取得の継続要求はprompt skipped by gate: activeで拒否され、助言本文を取得できていない。助言済み扱いにしない。"
    follow_up: "本次の観測書込みは正当Tool経路で成功したため、記録されていた書込み境界問題は解消済み。本記録は履歴として保持。"

important_change_notice:
  emitted_before_this_write: true
  reference: "本実行のドラフト全面更新直前の利用者向け実行出力通知。REQ操作なし・accepted Design機械工程節へのappend計画（既存記述は一切変更せず箇条書き4点を節末尾へ追記）・実現面変更方針・確定事項と未決なしを説明。追加通知（親指示欠陥修正）: TS-002正例を完全provisions環境でのinstaller全体exit0受入へ復元、TS-003を実行時shim証明必須化、TS-006と配置文言から免除検討を除去してscript契約の既存合法配置へ一本化、updateからappend操作への正規化と機械組立実施、旧事実矛盾3件の除去。第3修正（親指示ゲート意味訂正）: 前版の stop_reasons に含めていた「実現と検証（TS-001〜006）の完了まで自走接続を抑止」の文言は、Definition完全性を判定する auto_gate の契約外の合成ブロッカーであったため除去し auto_ready:true へ復元。実装検証義務は test_strategy が未来の義務として正確に定義しており、義務の未実施は自らの開始を妨げない（case_open_hints.future_obligations_nonblocking）。"
  canonical_changes_applied: false
  actual_difference_from_intent: "正規成果物（REQ/Decision/Design）への変更は本次では実施しない。Design節追記はartifact_actionsの計画であり、適用はcase-ready/case-reviseのDefinition保存内部責務。"

restart_conditions:
  entry: "本ドラフトは検証済み完成ドラフト。case-auto / case-open が主入力として消費し、新しい訂正Caseを確立する。"
  prerequisites: []
  human_reserved_specification_decisions: []
  operational_authority_issue: "なし。以前の停止原因（必須Jev評価の観測書込み境界）は正当Tool経路の実行により解消済み。"
  next_after_success: "利用者承認済み経路（req-define → case-auto）で親が新規訂正Caseを駆動する。本ユニットはcase-autoを起動しない。"
  review_out_of_scope_records:
    - "docs/designs/local/install-script-usability.md 7〜8行の ADF-COVERS(implementation) 重複行は既存不整合。本訂正の Design 追記（append）は既存セクション内への箇条書き追加のみで sidecar を変更しないためスコープ外（review stream 1 指摘、未採用記録。初回記録時の update 表現は delta review で append 正規化済み）。"
```

# summary

本ファイルはF1(b)訂正の検証済み完成ドラフトである。REQ操作なし・Design行帰属で確定し、
Design機械工程節の更新計画と実現面変更方針・検証戦略（TS-001〜006）を保持する。
ソース読取で確認した事実と、入力に引用された再現報告を区別したまま維持し、
再現報告の機械的再確認は後続Caseの検証義務（TS-002）とする。
