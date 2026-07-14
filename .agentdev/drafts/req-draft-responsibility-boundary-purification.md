---
draft_type: req_draft
topic_slug: responsibility-boundary-purification
status: saved
created_at: 2026-07-14T00:00:00+09:00
source_rus:
  - RU-20260714-01
---

# draft-data

```yaml
work_type: maintenance
scale: large
spec_actions_consumed: true
summary: >
  ADF配布物（command/skill/docs）から過剰な責務と重複記述を除外し、
  業務ワークフロー契約とharness実行制御の責務境界を是正する。
  8件の既存REQを精緻化（UPDATE）し、ADR-0136の結果影響を補強、
  所有/非所有リストの詳細をSPECに展開する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >
      ADF配布物（command/skill/docs）は、業務ワークフロー契約（工程目的、入力、前提、
      進行停止条件、永続成果物、許可/禁止副作用、QG、完了再開条件、結果契約、
      ADF可観測壁時計タイムスタンプ）のみを記述する。
      実行エージェント選定、サブエージェント階層、委譲API、固定並列数、timeout、retry、
      context管理、queue、heartbeat、エラー解析、plan task監査ログは、
      harness責務としてAGENTS.md/references/<harness>.mdに配置し、ADF配布物は規定しない。
      配布物の大多数は業務ワークフロー契約のみで完結し、実行制御の具体は
      各skillのreferences/<topic>.mdへ集約する（case-run-execution-adapter参照実装）。
      REQ-0162を原則のSSoTとし、各command/skill固有REQは当該原則の適用として参照関係を明示する。

  - id: AG-002
    content: >
      case-autoは、入力解決、auto_gate確認、artifact_actions基準工程決定、
      入力引き渡し、永続状態再読込、継続停止再開判定、完了進行未実行報告、
      壁時計時間計測を所有する。工程内部手順再実装、エージェント選定、
      スケジューリング、並列数、エラー解析、context圧縮、retry、QG再評価、
      capture再実装を所有せず、harness責務とする。

  - id: AG-003
    content: >
      case-runは、Issue/実行単位解決、worktree branch準備、
      Issue+worktree root+branch引き渡し、結果受領状態処理、
      PR停止情報確認、Findings PR本文引き継ぎ、再開可能状態維持、
      壁時計時間計測を所有する。ADF repo固有検査、repo-local script直接実行、
      特定ファイル前提grep、固定timeout並列数、実装検証反復アルゴリズム、
      異常終了解析を所有せず、harness責務または適用プロジェクト責務とする。

  - id: AG-004
    content: >
      case-run実行担当サブエージェントへの委譲契約は、入力（Issue識別子、
      worktree root、branch、副作用境界）、結果4状態（completed-pr、blocked、
      failed、delegation-unavailable）、永続化先（成功=PR、blocker失敗詳細=Issueコメント）、
      禁止事項（worktree外変更、Issue完了判定、capture直接書込、
      harness中間成果物のADF永続状態化）のみを規定する。
      エージェント構成、実行command、timeout、retry、並列数、planは含めない。

  - id: AG-005
    content: >
      Project Extensionsは、context、rules、checks、acceptance_gates、must_not の
      宣言データ層であり、標準commandの上書き、実行skillのエージェント指定、
      委譲方法の標準契約としての要求を行わない。
      ADF repo固有検査は適用プロジェクト責務として分離する。

  - id: AG-006
    content: >
      ADF配布物は、ADF可観測壁時計タイムスタンプ（case-auto全体開始終了停止、
      構成工程開始終了所要、case-run worktree準備実行依頼結果受領後処理、
      結果状態確定時刻、停止時点工程別経過）を維持する。
      harness内部timeout、サブエージェント内部フェーズ、推論時間、queue待機、
      retry単位、context圧縮時間、監視間隔は、ADF標準の管理対象外とする。
      タイムスタンプ観測要件はREQに保持し、形式・集計・表示はSPECに集約する。

  - id: AG-007
    content: >
      インラインフォールバック、task()、harness制御の矛盾は、
      「ADF標準が実行方法を規定しない」方向へ統一する。
      REQ=恒久要求、ADR=判断理由、SPEC=詳細契約、command=手順ガードレール、
      skill=共有知識最小プロトコルの責務分界を維持し、
      同一契約のREQ/SPEC/command/skill間重複を削減する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-0162
    source_items: [AG-001, AG-006, AG-007]
    content: |-
      REQ-0162-002 を以下の通り精緻化:
      | REQ-0162-002 | 配布 command/skill/docs は業務ワークフロー契約（工程目的、入力、前提、進行停止条件、永続成果物、許可/禁止副作用、QG、完了再開条件、結果契約、ADF可観測壁時計タイムスタンプ）のみを記述する。実行エージェント選定、サブエージェント階層、委譲 API、固定並列数、timeout、retry、context 管理、queue、heartbeat、エラー解析、plan task 監査ログは harness 責務として AGENTS.md/references/<harness>.md に配置し、ADF配布物は規定しない。配布物の大多数は業務ワークフロー契約のみで完結し、実行制御の具体は各 skill の references/<topic>.md へ集約する（case-run-execution-adapter 参照実装）。REQ-0162 を原則の SSoT とし、各 command/skill 固有 REQ は当該原則の適用として参照関係を明示する。 |

      新規要件行を追加:
      | REQ-0162-006 | ADF可観測壁時計タイムスタンプ（case-auto全体開始終了停止、構成工程開始終了所要、case-run worktree準備実行依頼結果受領後処理、結果状態確定時刻、停止時点工程別経過）はADF配布物の所有対象に含む。harness内部timeout、サブエージェント内部フェーズ、推論時間、queue待機、retry単位、context圧縮時間、監視間隔はADF標準の管理対象外とする（REQ-0151 連携）。 |

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: REQ-0119
    source_items: [AG-001, AG-007]
    content: |-
      新規要件行を追加:
      | REQ-0119-NEW | 配布 command/skill は ADR-0136 に基づき、業務ワークフロー契約のみを記述し、実行エージェント選定、起動方法、実行制御パラメータ（timeout、並列度、retry、context管理、ハーネス起動失敗解析救済含む）は harness 責務として AGENTS.md/references/<harness>.md に配置する（REQ-0162-002 適用）。 |

  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: REQ-0103
    source_items: [AG-001, AG-007]
    content: |-
      新規要件行を追加:
      | REQ-0103-NEW | アーティファクト責任分界は harness 非依存性を維持し、配布 command/skill/docs に harness 固有エージェント名、task() 引数、timeout、並列度、retry を記述しない。実行制御パラメータの排除は ADR-0136 決定に基づき、REQ-0162-002 の原則を適用する。 |

  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: REQ-0114
    source_items: [AG-002, AG-007]
    content: |-
      新規要件行を追加:
      | REQ-0114-NEW | case-auto の所有対象は入力解決、auto_gate確認、artifact_actions基準工程決定、入力引き渡し、永続状態再読込、継続停止再開判定、完了進行未実行報告、壁時計時間計測に限定する。工程内部手順再実装、エージェント選定、スケジューリング、並列数、エラー解析、context圧縮、retry、QG再評価、capture再実装は harness 責務とし、case-auto は規定しない（REQ-0162-002 の case-auto 適用）。 |

  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: REQ-0130
    source_items: [AG-003, AG-007]
    content: |-
      新規要件行を追加:
      | REQ-0130-NEW | case-run の所有対象は Issue/実行単位解決、worktree branch準備、Issue+worktree root+branch引き渡し、結果受領状態処理、PR停止情報確認、Findings PR本文引き継ぎ、再開可能状態維持、壁時計時間計測に限定する。ADF repo固有検査、repo-local script直接実行、特定ファイル前提grep、固定timeout並列数、実装検証反復アルゴリズム、異常終了解析は harness 責務または適用プロジェクト責務とし、case-run 標準は規定しない（REQ-0162-002 の case-run 適用）。 |

  - id: ACT-REQ-006
    artifact: req
    operation: update
    target: REQ-0139
    source_items: [AG-004, AG-007]
    content: |-
      新規要件行を追加:
      | REQ-0139-NEW | case-run実行担当サブエージェントへの委譲契約は入力（Issue識別子、worktree root、branch、副作用境界）、結果4状態（completed-pr、blocked、failed、delegation-unavailable）、永続化先（成功=PR、blocker失敗詳細=Issueコメント）、禁止事項（worktree外変更、Issue完了判定、capture直接書込、harness中間成果物のADF永続状態化）のみを規定し、エージェント構成、実行command、timeout、retry、並列数、planは含めない（REQ-0139-007/008/013 具体化）。 |

  - id: ACT-REQ-007
    artifact: req
    operation: update
    target: REQ-0160
    source_items: [AG-005]
    content: |-
      新規要件行を追加:
      | REQ-0160-NEW | Project Extensions は context、rules、checks、acceptance_gates、must_not の宣言データ層であり、標準commandの上書き、実行skillのエージェント指定、委譲方法の標準契約としての要求を行わない。ADF repo固有検査は適用プロジェクト責務として分離する。 |

  - id: ACT-REQ-008
    artifact: req
    operation: update
    target: REQ-0151
    source_items: [AG-006]
    content: |-
      新規要件行を追加:
      | REQ-0151-NEW | ADF可観測壁時計タイムスタンプ（case-auto全体開始終了停止、構成工程開始終了所要、case-run worktree準備実行依頼結果受領後処理、結果状態確定時刻、停止時点工程別経過）をADF配布物の所有対象として維持する。harness内部timeout、サブエージェント内部フェーズ、推論時間、queue待機、retry単位、context圧縮時間、監視間隔はADF標準の管理対象外とする。タイムスタンプ観測要件はREQに保持し、形式・集計・表示はSPECに集約する（REQ-0162-006 連携）。 |

  - id: ACT-ADR-001
    artifact: adr
    operation: update
    target: ADR-0136
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007]
    content: |-
      結果影響セクションを補強:
      本ADR-0136の決定に基づき、以下のREQ精緻化を実施した。
      REQ-0162（原則のSSoT化、ADF可観測タイムスタンプ所有対象明示）、
      REQ-0119（ADR-0136原則適用の明示）、
      REQ-0103（harness非依存性の原則適用）、
      REQ-0114（case-auto所有/非所有リスト要約、REQ-0162-002適用）、
      REQ-0130（case-run所有/分離対象リスト要約、REQ-0162-002適用）、
      REQ-0139（adapter最小契約の入力/禁止事項要約）、
      REQ-0160（Project Extensions宣言データ層明示）、
      REQ-0151（ADF可観測/非管理タイムスタンプ明示）。
      各REQの詳細リストはSPEC（responsibility-boundary-purification）に集約する。

  - id: ACT-SPEC-001
    artifact: spec
    operation: create
    target_spec:
      operation: create
      domain: responsibilities
      slug: responsibility-boundary-purification
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006]
    content: |-
      ## 責務境界浄化: 所有/非所有リスト詳細

      ### ADF標準の所有対象（業務ワークフロー契約）
      - 工程目的、入力、前提
      - 進行停止条件
      - 永続成果物
      - 許可/禁止副作用
      - QG（品質ゲート）
      - 完了再開条件
      - 結果契約（completed-pr/blocked/failed/delegation-unavailable）
      - ADF可観測壁時計タイムスタンプ

      ### ADF標準の非所有対象（harness責務）
      - 実行エージェント選定
      - サブエージェント階層
      - 委譲API
      - 固定並列数、timeout、retry
      - context管理
      - queue、heartbeat
      - エラー解析
      - plan task監査ログ

      ### case-auto所有/非所有リスト
      **所有**: 入力解決、auto_gate確認、artifact_actions基準工程決定、入力引き渡し、永続状態再読込、継続停止再開判定、完了進行未実行報告、壁時計時間計測
      **非所有**: 工程内部手順再実装、エージェント選定、スケジューリング、並列数、エラー解析、context圧縮、retry、QG再評価、capture再実装

      ### case-run所有/分離対象リスト
      **所有**: Issue/実行単位解決、worktree branch準備、Issue+worktree root+branch引き渡し、結果受領状態処理、PR停止情報確認、Findings PR本文引き継ぎ、再開可能状態維持、壁時計時間計測
      **分離対象**: ADF repo固有検査、repo-local script直接実行、特定ファイル前提grep、固定timeout並列数、実装検証反復アルゴリズム、異常終了解析

      ### execution adapter最小契約
      **入力**: Issue識別子、worktree root、branch、副作用境界
      **結果4状態**: completed-pr、blocked、failed、delegation-unavailable
      **永続化先**: 成功=PR、blocker失敗詳細=Issueコメント
      **禁止事項**: worktree外変更、Issue完了判定、capture直接書込、harness中間成果物のADF永続状態化
      **含めない**: エージェント構成、実行command、timeout、retry、並列数、plan

      ### Project Extensions境界
      **宣言データ層**: context、rules、checks、acceptance_gates、must_not
      **行わない**: 標準command上書き、実行skillエージェント指定、委譲方法標準契約要求
      **分離**: ADF repo固有検査は適用プロジェクト責務

      ### タイムスタンプ境界
      **ADF可観測（所有）**: case-auto全体開始終了停止、構成工程開始終了所要、case-run worktree準備実行依頼結果受領後処理、結果状態確定時刻、停止時点工程別経過
      **ADF非管理**: harness内部timeout、サブエージェント内部フェーズ、推論時間、queue待機、retry単位、context圧縮時間、監視間隔

conflict_resolutions:
  - id: CR-001
    conflict: インラインフォールバック/task()/harness制御の矛盾（配布物が実行方法を規定するか否か）
    resolution: 「ADF標準が実行方法を規定しない」方向へ統一（ADR-0136の原則に基づく）
  - id: CR-002
    conflict: REQ-0114のSPLIT要否（既に約100要件行で肥大化）
    resolution: 今回はUPDATEのみで進め、SPLITは別RU扱いとする
  - id: CR-003
    conflict: 永続化方針（既存REQ精緻化か新規REQ作成か）
    resolution: 選択肢1（既存REQ精緻化UPDATE/APPEND + SPEC展開）で進める

operation_units:
  - ou_id: OU-001
    source_ru: RU-20260714-01
    target_req: REQ-0162
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-20260714-01
    target_req: REQ-0119
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-20260714-01
    target_req: REQ-0103
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-20260714-01
    target_req: REQ-0114
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result: {}
  - ou_id: OU-005
    source_ru: RU-20260714-01
    target_req: REQ-0130
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
    result: {}
  - ou_id: OU-006
    source_ru: RU-20260714-01
    target_req: REQ-0139
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 6
    issue_policy: single
    result: {}
  - ou_id: OU-007
    source_ru: RU-20260714-01
    target_req: REQ-0160
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 7
    issue_policy: single
    result: {}
  - ou_id: OU-008
    source_ru: RU-20260714-01
    target_req: REQ-0151
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 8
    issue_policy: single
    result: {}
  - ou_id: OU-009
    source_ru: RU-20260714-01
    target_req: ADR-0136
    operation: update
    scale: standard
    depends_on: [OU-001, OU-002, OU-003, OU-004, OU-005, OU-006, OU-007, OU-008]
    recommended_order: 9
    issue_policy: single
    result: {}
  - ou_id: OU-010
    source_ru: RU-20260714-01
    target_spec:
      operation: create
      domain: responsibilities
      slug: responsibility-boundary-purification
    operation: spec-create
    scale: standard
    depends_on: [OU-001]
    recommended_order: 10
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: >
      配布 command/skill/docs（req-define.md, case-auto.md, case-run.md, case-close.md等）の本文を確認し、
      実行制御パラメータ（timeout/並列数/retry/context管理等）が記述されていないことをgrepで検証する。
    pass_criteria: 配布 command/skill/docs の本文に実行制御パラメータの記述が存在しない。
    on_failure: fix-and-reverify
  - id: TS-002
    target_item: AG-002
    verification: >
      case-auto command 定義と SPEC を確認し、所有対象（入力解決/auto_gate/工程決定等）が記述され、
      非所有対象（エージェント選定/並列数/エラー解析等）が記述されていないことを検証する。
    pass_criteria: case-auto の所有対象のみ記述され、非所有対象は記述されない。
    on_failure: fix-and-reverify
  - id: TS-003
    target_item: AG-003
    verification: >
      case-run command 定義と SPEC を確認し、所有対象（Issue解決/worktree/結果処理等）が記述され、
      分離対象（repo固有検査/repo-local script等）が直接実行として記述されていないことを検証する。
    pass_criteria: case-run の所有対象のみ記述され、分離対象は直接実行として記述されない。
    on_failure: fix-and-reverify
  - id: TS-004
    target_item: AG-004
    verification: >
      delegation-contracts SPEC と adapter skill を確認し、入力/結果4状態/永続化先/禁止事項のみが規定され、
      エージェント構成/command/timeout/並列数が規定されていないことを検証する。
    pass_criteria: adapter 契約に入力/結果/永続化先/禁止事項のみが規定される。
    on_failure: fix-and-reverify
  - id: TS-005
    target_item: AG-005
    verification: >
      Project Extensions 関連 SPEC/skill を確認し、context/rules/checks/acceptance_gates/must_not の
      宣言データ層のみが定義され、標準command上書き/実行skillエージェント指定が存在しないことを検証する。
    pass_criteria: Extensions が宣言データ層のみ定義し、command上書き/エージェント指定が存在しない。
    on_failure: fix-and-reverify
  - id: TS-006
    target_item: AG-006
    verification: >
      タイムスタンプ関連 REQ/SPEC を確認し、ADF可観測タイムスタンプ（全体開始終了停止/工程別時間）が
      REQに保持され、harness内部時間がADF必須成果物でないことを検証する。
    pass_criteria: ADF可観測タイムスタンプがREQに保持され、harness内部時間はREQの必須成果物に含まれない。
    on_failure: fix-and-reverify
  - id: TS-007
    target_item: AG-007
    verification: >
      REQ/SPEC/command/skill間で同一契約の重複記述をgrepで確認し、
      インラインフォールバック/task()/harness制御の矛盾が解消されていることを検証する。
    pass_criteria: 同一契約の重複記述が削減され、矛盾が解消されている。
    on_failure: fix-and-reverify

case_open_hints:
  epic_needed: true
  decomposition:
    - OU-001〜008は各REQのUPDATEであり、REQ-0162の原則への参照依存のみ（必須依存なし、並列実行可能）
    - OU-009（ADR-0136 UPDATE）はOU-001〜008の完了後に実施
    - OU-010（SPEC spec-create）はOU-001の完了後に実施可能
  wave_hints:
    - Wave 1: OU-001（REQ-0162 UPDATE、原則定義）
    - Wave 2: OU-002〜008（各REQ UPDATE、並列実行可能）
    - Wave 3: OU-009（ADR-0136 UPDATE）, OU-010（SPEC spec-create）

split_forecast:
  measured_on: draft
  metrics:
    requirement_rows: 9
    concern_categories: 7
    artifact_types: 3
  signals:
    requirement_rows: 0
    concern_categories: 1
    artifact_types: 1
    spec_separation_violations: 0
  total_signal: 2
  recommended_action: "SPLIT検討（ユーザーへ提案）"
  thresholds_ref: "req-health-metrics SPEC"
  note: >
    ドラフト全体の要件行数（artifact_actionsに含まれる新規要件行）は9行であり、
    合計シグナル2はSPLIT検討閾値。ただし、各REQへのUPDATEは既存REQの精緻化であり、
    新規REQ作成ではない。ユーザー合意済み（アプローチA: 単一ドラフト + 複数OU）のため、
    SPLITは不要と判断。REQ-0114のSPLITは別RU扱い（CR-002）。
```

# summary

## 概要

ADF配布物の責務境界浄化と標準ワークフローの簡素化。

## 背景

RU-20260714-01 に基づき、ADF配布物（command/skill/docs）から過剰な責務と重複記述を除外し、業務ワークフロー契約とharness実行制御の責務境界を是正する。

## 合意内容

7つの関心領域（ADF標準の責務境界、case-auto責務縮小、case-run責務縮小、execution adapter最小契約化、Project Extensions境界、タイムスタンプ境界、重複矛盾解消）について、所有/非所有リストを明示化。

## 精緻化対象

8件の既存REQ（REQ-0162, REQ-0119, REQ-0103, REQ-0114, REQ-0130, REQ-0139, REQ-0160, REQ-0151）をUPDATE、ADR-0136の結果影響を補強、所有/非所有リストの詳細を新規SPECに展開。

## ADR判断

ADR-0136 は accepted であり、本要件の原則は ADR-0136 の決定範囲内。新規ADR不要、ADR-0136 UPDATEで対応。

## Scale

large（8件REQまたがる）
