---
draft_type: req_draft
topic_slug: verify-only-execution-evidence-ssot
status: saved
created_at: 2026-09-14T00:00:00+09:00
source_rus:
  - RU-0002
---

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
# workflow_route の派生値は保存せず、work_type + scale から各コマンドが導出する
work_type: maintenance

# scale: feature のみ standard / large。それ以外は未設定でよい
scale:

# summary: 当該 draft が何を合意したかの1段落要約。人間可読補助（処理の正ではない）
summary: >
  verify-only closure（PR も carrier commit も存在しない Issue 完了、case 2768/2769 で運用確立）における
  検証実行と証跡記録を case-run / case-close の実行契約へ標準化する。
  case-run は3検査（配布依存境界・IR-055・traceability）と integrity suite を通常 case と同水準で実行し、
  再実行可能な実行コマンド列と結果を SSoT コメント（Issue コメント）へ記録する。
  case-close は SSoT コメントを QG-4 達成判定の根拠として参照し、SSoT コメント不在の
  verify-only closure を完了扱いにしない。SSoT コメントは検証証跡チャネルであり
  capture（intake/learning）チャネルではない。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目。artifact_actions.source_items から ID 参照される
agreed_items:
  - id: AG-001
    content: >
      case-run は verify-only closure（PR も carrier commit も存在しない Issue 完了）において、
      配布依存境界・IR-055・traceability の3検査と integrity suite を通常 case と同等の水準
      （base 既知違反と新規違反の分離突合、新規違反 0 件確認、件数突合を含む）で実行し、
      再実行可能な形式（実行 cwd と実行形態を含む実行コマンド列）と結果
      （新規違反 0 件、pass/fail 件数等）を SSoT コメント（Issue コメント）として記録する。
      検証完了のために carrier commit を作成しない（case 2769 で確立した作業仮定の継承）。
      verify-only closure の判定条件の詳細（execution contract での事前確定または実行時の変更不要確定のいずれかに正規の判定点を置く）は Design が所有する。
  - id: AG-002
    content: >
      case-close は verify-only closure の QG-4 達成判定において、case-run が記録した
      SSoT コメント（Issue コメント）の実行コマンド列と検証結果を判定根拠として参照する。
      SSoT コメントが存在しない verify-only closure を完了扱いにしない。
      完了条件チェックボックスの最終評価という QG-4 本体の構造は変更せず、
      SSoT コメントはその判定根拠（evidence）として参照する。
  - id: AG-003
    content: >
      対象範囲は verify-only closure（PR も carrier commit も存在しない Issue 完了。
      検証のみで完了する maintenance case を含む）とする。
      通常 case（PR が存在する完了）の QG-4 記録は既存契約の対象外であり、
      docs_chore 特例フロー（main 直接 commit が存在する PR なし完了）も対象外とする。
  - id: AG-004
    content: >
      SSoT コメントは検証証跡チャネルであり、capture（intake/learning 候補）チャネルではない。
      capture 情報の引き継ぎ経路（REQ-031-014、REQ-032-005 の PR 本文限定原則）は変更しない。
      verify-only closure では PR 本文が存在しないため capture 回収は N/A とし、
      検証中に発見した本筋外の検出事項は既存の intake 起票経路で扱う。

# artifact_actions: REQ/Decision/Design への保存対象を1つの配列に統合
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-031.md
    source_items: [AG-001, AG-003, AG-004]
    content: |
      要件テーブルへの追記行:

      | REQ-031-028 | case-run は verify-only closure（PR も carrier commit も存在しない Issue 完了）において、配布依存境界・IR-055・traceability の3検査と integrity suite を通常 case と同等の水準（base 既知違反と新規違反の分離突合、新規違反 0 件確認、件数突合を含む）で実行し、再実行可能な形式（実行 cwd と実行形態を含む実行コマンド列）と結果を SSoT コメント（Issue コメント）として記録すること。検証完了のために carrier commit を作成しないこと（case 2769 で確立した作業仮定の継承） |

      適用範囲「対象」への追記:

      - verify-only closure（PR も carrier commit も存在しない Issue 完了。検証のみで完了する maintenance case を含む）における3検査と integrity suite の実行、SSoT コメント（Issue コメント）への実行証跡記録

      適用範囲「対象外」への追記:

      - verify-only closure の判定条件の詳細と SSoT コメントの記録形式の詳細（Design）
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-032.md
    source_items: [AG-002, AG-003]
    content: |
      要件テーブルへの追記行:

      | REQ-032-027 | case-close は verify-only closure（PR も carrier commit も存在しない Issue 完了）の QG-4 達成判定において、case-run が記録した SSoT コメント（Issue コメント）の実行コマンド列と検証結果を判定根拠として参照すること。SSoT コメントが存在しない verify-only closure を完了扱いにしないこと |

      適用範囲「対象」への追記:

      - verify-only closure の QG-4 達成判定における SSoT コメント（Issue コメント）の判定根拠参照と SSoT コメント不在時の完了抑止

      適用範囲「対象外」への追記:

      - verify-only closure の判定条件の詳細と SSoT コメント参照手順の詳細（Design）
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target: docs/designs/commands/case-run.md
    target_area: "#### 配布物変更時の commit 前3検査工程"
    source_items: [AG-001, AG-003, AG-004]
    content: |
      「配布物変更時の commit 前3検査工程」節の直後に新節として追加:

      #### verify-only closure の検証実行と SSoT コメント記録工程

      verify-only closure（PR も carrier commit も存在しない Issue 完了。検証のみで完了する
      maintenance case を含む）では、変更が存在しないため commit 前3検査の発火条件
      （配布物変更を含む case）が成立しない。この場合でも検証完了の恒久証跡を残すため、
      次のとおり実行する。本工程は case 2769 で確立した運用の明文化であり、
      「検証完了のために carrier commit を作成する」代替案は case 2769 で却下済みの作業仮定に基づき採用しない。

      1. verify-only closure の判定: execution contract で検証のみと事前確定された case、
         または実行の結果変更不要が確定した case のいずれかを正規の判定点とする。
         判定根拠を Issue コメント（SSoT コメント）に残す
      2. 3検査の実行: 配布依存境界検査（check_distribution_boundary.ts）、IR-055 検査
         （runtime-unresolved-reference）、traceability 検査（宣言整合）を通常 case と同一の手順・
         同一の水準（base 既知違反と新規違反の分離突合、新規違反 0 件確認）で実行する。
         checker コマンドの実行経路と stdout 退避形式は checker 実行契約
         （安定実行経路: モジュール import 経由、spawnSync による status/stdout 分離取得、
         fs.writeFileSync の UTF-8 明示書き出し）に従う
      3. integrity suite の実行: full integrity suite（bun test 全件）を実行し、
         「Ran N tests across M files」の N/M 件数突合と直前実績との件数急減なし確認を行う
         （case-close STEP-3 の合格基準と同水準）
      4. SSoT コメントへの記録: 実行コマンド列（実行 cwd、実行形態を含み、そのまま再実行手順として
         機能する形式）と結果（3検査の new_delta 0・新規違反 0 件、integrity suite の pass/fail 件数）
         を Issue コメントに記録する。verify-only closure では PR が存在しないため
         PR 本文を記録先に使わない
      5. チャネル分離: SSoT コメントは検証証跡チャネルであり、capture（intake/learning 候補）
         チャネルではない。REQ-031-014 の capture 引き継ぎ経路（PR 本文限定）は変更しない。
         検証中に発見した本筋外の検出事項は既存の intake 起票経路で扱う
  - id: ACT-DESIGN-002
    artifact: design
    operation: append
    target: docs/designs/commands/case-close.md
    target_area: "配布物変更を含む case の3検査結果確認"
    source_items: [AG-002, AG-003, AG-004]
    content: |
      「配布物変更を含む case の3検査結果確認」項の直後に新節として追加:

      #### verify-only closure の QG-4 達成判定（SSoT コメント参照）

      verify-only closure（PR も carrier commit も存在しない Issue 完了）の QG-4 達成判定では、
      case-run が記録した SSoT コメント（Issue コメント）を実行コマンド列・検証結果の
      判定根拠として参照する。PR が存在しないため PR 本文の検証差分セクションは存在せず、
      SSoT コメントが検証証跡の恒久記録の正となる。

      - 参照手順: SSoT コメントから (1) 3検査（配布依存境界・IR-055・traceability）の実行記録と
        新規違反 0 件確認、(2) integrity suite の N/M 件数突合と直前実績比較、(3) 実行コマンド列の
        再実行可能性（実行 cwd・実行形態の記載）を確認する
      - 完了抑止: SSoT コメントが存在しない verify-only closure、または SSoT コメントに
        検証結果の記載が欠落している場合は QG-4 不合格として完了扱いにしない
      - capture 回収の N/A: verify-only closure では PR 本文が存在しないため
        capture 回収（REQ-032-005 の PR 本文入力源）は N/A とする。SSoT コメントを
        capture 入力源として扱わない（SSoT コメントは検証証跡チャネルであり
        capture チャネルではない）

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: SSoT コメント（Issue コメント）を正規記録チャネルとすることと、capture 情報の引き継ぎ経路の PR 本文限定原則（REQ-031-014、REQ-032-005）との衝突可能性
    resolution: SSoT コメントは検証証跡チャネルであり capture（intake/learning）チャネルではない。PR 本文限定原則は capture チャネルの契約として維持し、verify-only closure では capture 回収自体が N/A。検証中の本筋外検出事項は既存 intake 起票経路で扱う（adversarial-review B-1 限定合意）
  - id: CR-002
    conflict: integrity suite（docs 全体検査に相当）の case-run 実行と、REQ-031-005 の QG-3 限定原則（品質メトリクス収集や docs 全体検査を含まない）との衝突可能性
    resolution: QG-3 は PR 作成直前の実装充足と乖離ゲートであり、実装が存在しない verify-only closure には適用場面が存在しない。verify-only closure の検証は QG-4 相当の検証を case-run が代行実行する位置づけであり、QG-3 限定原則の意味を変更しない（adversarial-review A-3 撤回の根拠）

# operation_units: 複数RU入力時の統合/分離結果。単一REQ操作の場合も1件の OU として出力
operation_units:
  - ou_id: OU-001
    source_ru: RU-0002
    target_req: REQ-031
    target_design: docs/designs/commands/case-run.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_files:
        - docs/requirements/REQ-031.md
      saved_req_ids:
        - REQ-031-028
      operation: append
      source_ru: RU-0002
      unclassified_verification_rows:
        - REQ-031-028
      case_open_input: "docs/requirements/REQ-031.md の REQ-031-028（verify-only closure の3検査+integrity suite 実行と SSoT コメント記録、適用範囲対象/対象外追記済み）"
  - ou_id: OU-002
    source_ru: RU-0002
    target_req: REQ-032
    target_design: docs/designs/commands/case-close.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result:
      saved_files:
        - docs/requirements/REQ-032.md
      saved_req_ids:
        - REQ-032-027
      operation: append
      source_ru: RU-0002
      unclassified_verification_rows:
        - REQ-032-027
      case_open_input: "docs/requirements/REQ-032.md の REQ-032-027（SSoT コメント参照の QG-4 判定根拠と不在時完了抑止、適用範囲対象/対象外追記済み）"

# test_strategy: 各合意項目（AG-*）の検証方法。3要素（verification / pass_criteria / on_failure）を必須とする
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      case-run の契約群への明文化確認。docs/requirements/REQ-031.md の要件テーブルに
      REQ-031-028（verify-only closure の3検査+integrity suite 実行と SSoT コメント記録）が追記され、
      docs/designs/commands/case-run.md に verify-only closure の検証実行と SSoT コメント記録工程
      （判定条件、3検査実行、integrity suite 実行、SSoT コメント記録形式、チャネル分離）が節として
      追記されていることを文書確認する。src/opencode/skills/agentdev-workflow-case-run/ の
      SKILL.md（SSoT 契約節）と references/single.md に verify-only closure の手順が反映され、
      既存 SSoT 契約（blocked/failed→Issue コメント、completed→PR 本文）への例外規定として
      矛盾なく追加されていることを通読確認する
    pass_criteria: |
      - REQ-031-028 が要件テーブルに存在し、3検査+integrity suite 実行・SSoT コメント記録・
        carrier commit 不作成の3点を要件として含む
      - case-run Design に verify-only closure の工程が節として存在し、実行手順が
        通常 case と同水準（分離突合・新規違反 0 件・件数突合）であることを規定している
      - case-run Workflow Skill の SSoT 契約節に verify-only closure 例外が反映されている
    on_failure: |
      fix-and-reverify。契約文書（REQ、Design、Workflow Skill）の記載不足または既存 SSoT 契約との
      矛盾は文書追記・修正して再確認する。契約文書の変更であるため実装コードの再検証は不要
  - id: TS-002
    target_item: AG-002
    verification: |
      case-close の契約群への明文化確認。docs/requirements/REQ-032.md の要件テーブルに
      REQ-032-027（SSoT コメントを QG-4 判定根拠として参照、不在時完了抑止）が追記され、
      docs/designs/commands/case-close.md に verify-only closure の QG-4 達成判定
      （SSoT コメント参照）節が追記されていることを文書確認する。
      src/opencode/skills/agentdev-workflow-case-close/ の SKILL.md と
      references/issue-resolution-and-qg4.md に SSoT コメント参照手順が反映されていることを通読確認する
    pass_criteria: |
      - REQ-032-027 が要件テーブルに存在し、SSoT コメント参照と不在時の完了抑止の2点を要件として含む
      - case-close Design に verify-only closure の QG-4 達成判定節が存在し、
        参照手順（3検査記録、件数突合、再実行可能性確認）と capture 回収 N/A を規定している
      - case-close Workflow Skill の QG-4 達成判定に SSoT コメント参照が反映されている
    on_failure: |
      fix-and-reverify。契約文書の記載不足は文書追記・修正して再確認する
  - id: TS-003
    target_item: AG-004
    verification: |
      チャネル分離と既存契約との整合確認。REQ-031-014（capture 引き継ぎは PR 本文のみ）、
      REQ-032-005（capture 入力源は PR 本文のみ）の文面が本変更により変更されていないこと、
      SSoT コメントが検証証跡チャネルとして定義され capture チャネルと分離されていることを
      REQ-031-028、REQ-032-027、両 Design 追記節の通読で確認する
    pass_criteria: |
      - REQ-031-014 と REQ-032-005 が本変更で変更されていない
      - SSoT コメントと capture チャネルの分離が Design 追記節に明記されている
      - docs_chore 特例フロー（main 直接 commit が存在）と verify-only closure の境界が
        対象範囲で区別されている
    on_failure: |
      fix-and-reverify。チャネル混同または既存契約の無断変更を検出した場合は文書を修正して再確認する
  - id: TS-004
    target_item: AG-001
    verification: |
      本 case 自身への品質検査の適用。本 case は配布物（Workflow Skill、command Design）の変更を
      含むため、case-run の配布物変更時の commit 前3検査（配布依存境界・IR-055・traceability）と
      docs 変更を含む case の full check_integrity を実行する。checker 実行契約の安定実行経路
      （モジュール import 経由、spawnSync による stdout 分離取得、UTF-8 明示書き出し）に従う
    pass_criteria: |
      - 3検査で新規違反 0 件（base 既知違反と新規違反の分離突合済み）
      - full check_integrity で新規違反 0 件
      - 既知違反の無断削除・隠蔽がない
    on_failure: |
      fix-and-reverify。新規違反は全件分類して修正し、再検証で新規違反 0 件を確認する。
      baseline 既知違反の無断削除は行わない

# realization_actions: 実現面の変更方針の構造化ハンドオフ
realization_actions:
  - id: RA-001
    concern: case-run Workflow Skill への verify-only closure 検証・記録手順の明文化
    responsibility: >
      case-run Workflow Skill（agentdev-workflow-case-run）は verify-only closure における
      3検査+integrity suite の実行と SSoT コメント（Issue コメント）への実行証跡記録手順を
      所有する。SSoT 契約節（blocked/failed→Issue コメント、completed→PR 本文）に
      verify-only closure 例外（検証証跡は Issue コメント）を追加する
    ownership_hints:
      - src/opencode/skills/agentdev-workflow-case-run/SKILL.md（SSoT 契約節、停止終了、resume protocol）
      - src/opencode/skills/agentdev-workflow-case-run/references/single.md（単一 Issue workflow の該当 STEP。verify-only closure の判定と検証実行・SSoT コメント記録の工程配置）
      - src/opencode/skills/agentdev-workflow-case-run/references/delegation-and-result.md（result 処理と checker 実行契約の参照箇所）
      - docs/designs/commands/case-run.md（command Design。ACT-DESIGN-001 と同一内容の Design 追記と整合）
    intent: >
      case 2768/2769 で運用確立した verify-only closure の実行証跡記録を個別 case の運用依存から
      workflow 契約へ引き上げ、QG-4 判定根拠の追跡可能性を恒久化する
    verification_refs: [TS-001, TS-003, TS-004]
    source_items: [AG-001, AG-004]
  - id: RA-002
    concern: case-close Workflow Skill への SSoT コメント参照 QG-4 判定手順の明文化
    responsibility: >
      case-close Workflow Skill（agentdev-workflow-case-close）は verify-only closure の
      QG-4 達成判定において SSoT コメントを実行コマンド列・検証結果の判定根拠として参照する手順と、
      SSoT コメント不在時の完了抑止を所有する。capture 回収の N/A 適用も含む
    ownership_hints:
      - src/opencode/skills/agentdev-workflow-case-close/SKILL.md（分岐定義。docs_chore 特例フローとの境界、停止終了条件）
      - src/opencode/skills/agentdev-workflow-case-close/references/issue-resolution-and-qg4.md（STEP-2 QG-4 達成判定への SSoT コメント参照の追加）
      - src/opencode/skills/agentdev-workflow-case-close/references/cleanup-and-capture.md（capture 回収の N/A 適用）
      - docs/designs/commands/case-close.md（command Design。ACT-DESIGN-002 と同一内容の Design 追記と整合）
      - src/opencode/commands/agentdev/case-close.md（command 定義の特例フローセクション。verify-only closure の経路規定の反映要否を Design 確定内容に従い判断する）
    intent: >
      PR が存在しない closure で QG-4 判定根拠が会話上のみで消える事象を防ぎ、
      case-close が SSoT コメントから判定根拠を再構成できるようにする
    verification_refs: [TS-002, TS-003]
    source_items: [AG-002, AG-004]

# review_dispositions: 採否判断の記録
review_dispositions:
  - id: RD-001
    source_ru: RU-0002
    source_item: RU-0002
    disposition: covered
    reason_code: already_satisfied
    reason: >
      RU-0002 の要件化の方向（case-run 側の検証実行と SSoT コメント記録、case-close 側の
      QG-4 判定根拠参照、前提の継承、対象範囲）の全体を AG-001〜AG-004 および
      ACT-REQ-001/002、ACT-DESIGN-001/002、RA-001/002 として網羅的に要件化した。
      adversarial-review（A-1、A-2、B-1、B-2、B-3 の各 finding）を反映し、
      verify-only closure の定義統一、判定条件の Design 配置、チャネル分離、
      再実行可能性要求、case 2769 由来の明記を確定済み
    evidence:
      path: .agentdev/backlog/req-units/RU-0002.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []

# case_open_hints: case-open 構成生成への参考情報
case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

verify-only closure（PR も carrier commit も存在しない Issue 完了）の検証実行と証跡記録を
case-run / case-close の実行契約へ標準化する要件ドラフト（RU-0002 由来、work_type: maintenance）。

- REQ-031 への APPEND: 3検査+integrity suite の同水準実行と SSoT コメント記録（REQ-031-028）
- REQ-032 への APPEND: QG-4 達成判定での SSoT コメント参照と不在時完了抑止（REQ-032-027）
- case-run / case-close の両 command Design へ工程詳細を追記
- 実現面: 両 Workflow Skill への手順明文化（RA-001、RA-002）
- Decision は不要（case 2769 運用前提の継承、DEC-020 延長、Decision 閾値未満）
- SPLIT シグナル: REQ-031（27行・単一関心・SPLIT 0）、REQ-032（26行・単一関心・SPLIT 0）とも APPEND 許可
