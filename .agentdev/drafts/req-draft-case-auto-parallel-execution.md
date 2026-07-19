---
draft_type: req_draft
topic_slug: case-auto-parallel-execution
status: saved
created_at: "2026-07-19T12:12:03+09:00"
spec_consumed: true
---

# draft-data

```yaml
work_type: feature
scale: large
summary: >-
  /agentdev/case-auto の複数対象処理を、case-open を順次実行する Phase 1、最大5件の case-run を並列実行する Phase 2、case-close を順次実行する Phase 3 に分離する。
  AgentDevFlow は Phase モデル、固定並列数、bg task の状態管理と回復を規定し、harness は bg task API と実行担当サブエージェント内部の制御を保持する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      case-auto の Phase 2 における case-run の同時起動数は固定値5とする。
      この値は REQ-0130-026 と同一の実行安全境界であり、AgentDevFlow 側で規定する。
  - id: AG-002
    content: >-
      case-auto は Phase 分離モデルを採用する。
      Phase 1 では case-open を順次実行し、Phase 2 では case-run を並列実行し、Phase 3 では case-close を順次実行する。
      Phase 1 と Phase 3 は main push と capture の競合を避ける直列集約ポイントとする。
  - id: AG-003
    content: >-
      bg task 管理は AgentDevFlow 側の case-auto オーケストレーション責務とする。
      AgentDevFlow は起動対象の管理、状態収集、破棄検知、回復判断を規定する。
      bg task API、実行エージェント選定、実行担当サブエージェント内部の推論、context 管理、retry は harness 側の責務として維持する。
  - id: AG-004
    content: >-
      bg task がシステムにより破棄されたことを検知した場合、commit 済みで PR 未作成の状態と、未コミット変更が残る状態を区別する。
      case-auto は状態ごとに定義した回復パターンを適用する。
  - id: AG-005
    content: >-
      並列実行は case-auto のデフォルト挙動とする。
      順次実行は bg task を利用できない場合などのフォールバックに限定し、フォールバック理由を完了報告へ記録する。
  - id: AG-006
    content: >-
      ADR-0136 の決定2には new:case-auto-orchestration-control を参照する限定注記を追加する。
      注記は case-auto の Phase 分離、固定並列数、bg task 管理だけを AgentDevFlow 側へ位置付け、決定1と決定3を変更しない。
  - id: AG-007
    content: >-
      「case-auto オーケストレーション制御の AgentDevFlow 側集約」を accepted の新規 ADR として記録する。
      新規 ADR は ADR-0136、ADR-0137、ADR-0129、ADR-0132 と relates-to 関係を持ち、supersedes は持たない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-0114.md
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005]
    content: |
      | REQ-0114-102 | case-auto は、Phase 1 で case-open を順次実行し、Phase 2 で case-run を並列実行し、Phase 3 で case-close を順次実行する Phase 分離モデルを採用すること。各 Phase は前 Phase の対象処理の完了後に開始すること。 |
      | REQ-0114-103 | case-auto は Phase 2 で case-run を bg task として起動し、各 bg task の結果または破棄を収集すること。bg task の起動 API と引数仕様は `references/<harness>.md` に配置し、case-auto は規定しないこと。 |
      | REQ-0114-104 | case-auto は Phase 1 と Phase 3 を直列集約ポイントとし、main push、capture、commit を並列実行区間の外で処理すること。 |
      | REQ-0114-105 | case-auto は bg task がシステムにより破棄されたことを検知した場合、commit 済みで PR 未作成の状態と、未コミット変更が残る状態を区別し、それぞれに対応する回復パターンを適用すること。 |
      | REQ-0114-106 | case-auto の Phase 2 における case-run の同時起動数は固定値5とすること。固定値は AgentDevFlow 側で規定し、REQ-0130-026 と同一の実行安全境界として扱うこと。 |
      | REQ-0114-107 | case-auto の並列実行はデフォルト挙動とすること。順次実行はフォールバック時にのみ許可し、フォールバック理由を完了報告に含めること。 |
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-0148.md
    source_items: [AG-001, AG-002]
    content: |
      | REQ-0148-018 | case-auto レベルでのグローバル並列上限は設定せず、case-run 単位の並列上限（REQ-0130-026、SPEC `epic-wave-model.md` 参照）のみを制御対象とすること（REQ-0101-069 安定契約例外: 安全境界。並列実行数上限は実行安全境界）。Phase 分離モデル（REQ-0114-102）では、Phase 2 の同時起動数に固定値5を適用すること。 |
  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-0162.md
    source_items: [AG-001, AG-003, AG-004]
    content: |
      | REQ-0162-002 | 配布 command/skill/docs は業務ワークフロー契約（工程目的、入力、前提、進行停止条件、永続成果物、許可/禁止副作用、QG、完了再開条件、結果契約、ADF可観測壁時計タイムスタンプ）のみを記述する。実行エージェント選定、サブエージェント階層、委譲 API、timeout、retry、context 管理、queue、heartbeat、エラー解析、plan task 監査ログは harness 責務として AGENTS.md/references/<harness>.md に配置し、ADF配布物は規定しない。ただし case-auto の Phase 分離、Phase 2 の同時起動数（固定値5）、bg task の状態管理（破棄検知と状態別回復を含む）は AgentDevFlow 側の業務ワークフロー契約として規定する。実行担当サブエージェント内部の制御と bg task API の具体は harness 側に維持する。配布物の大多数は業務ワークフロー契約のみで完結し、実行制御の具体は各 skill の references/<topic>.md へ集約する（case-run-execution-adapter 参照実装）。REQ-0162 を原則の SSoT とし、各 command/skill 固有 REQ は当該原則の適用として参照関係を明示する。 |
  - id: ACT-ADR-001
    artifact: adr
    operation: create
    target: "new:case-auto-orchestration-control"
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-007]
    content: |
      title: "case-auto オーケストレーション制御の AgentDevFlow 側集約"
      status: accepted
      relates-to: ADR-0136, ADR-0137, ADR-0129, ADR-0132
      supersedes: none

      ## 背景

      ADR-0136 は配布物から harness 固有の実行制御を除去した。
      しかし case-auto が複数対象を処理する場合、Phase の順序、並列数、bg task 破棄時の回復は、後続工程が依存するオーケストレーション契約として一貫していなければならない。

      ## 決定

      case-auto の Phase 分離、Phase 2 の同時起動数を固定値5とする安全境界、bg task の状態管理、破棄検知時の状態別回復、Phase 1 と Phase 3 の直列集約を AgentDevFlow 側で規定する。
      bg task API、実行エージェント選定、実行担当サブエージェント内部の推論、context 管理、retry、heartbeat、エラー解析は harness 側に維持する。

      ## 代替案

      すべての並列制御を harness 側へ残す方式は、case-auto の安全境界と回復契約を配布物で共有できないため採用しない。
      bg task API と実行担当サブエージェント内部の制御まで AgentDevFlow 側へ移す方式は、ADR-0136 の harness 非依存原則を損なうため採用しない。

      ## 結果、影響

      REQ-0114 に Phase 分離、bg task 管理、回復、固定並列数、デフォルト挙動を追加する。
      REQ-0148 と REQ-0162 の適用範囲を更新する。
      case-auto command と関連 SPEC の所有/非所有リストを更新する。

      ## 関連する決定

      ADR-0136 の決定2には、この決定が限定する範囲を注記する。
      ADR-0137 の case-run インライン実行、ADR-0129 の複数 execution_unit 並列実行、ADR-0132 の回復とコンフリクト解消の責務分界を維持する。
  - id: ACT-ADR-002
    artifact: adr
    operation: update
    target: docs/adr/ADR-0136.md
    target_area: "## 決定"
    source_items: [AG-003, AG-006, AG-007]
    content: |
      配布 command/skill/docs は業務ワークフロー契約（進行条件、停止条件、永続成果物、Quality Gate、実行結果契約）のみを記述し、実行エージェント選定、起動方法、実行制御パラメータは harness の責務としてプロジェクトルート（`AGENTS.md`、`references/<harness>.md`）に配置する。実行結果契約に委譲起動不能（`delegation-unavailable`）を4番目の状態として追加し、領域レベル失敗（`failed`）と区別する。

      > **new:case-auto-orchestration-control による決定2の限定注記**: case-auto の Phase 分離、Phase 2 の固定並列数、bg task の状態管理、破棄検知時の状態別回復、Phase 1 と Phase 3 の直列集約は AgentDevFlow 側で規定する。bg task API と実行担当サブエージェント内部の制御は harness 側に維持する。この注記は決定2だけに適用し、決定1と決定3を変更しない。
  - id: ACT-ADR-003
    artifact: adr
    operation: update
    target: docs/adr/README.md
    target_area: "# アーキテクチャ決定記録（ADR）"
    source_items: [AG-006, AG-007]
    content: |
      accepted の現行基盤ビュー、承認済み一覧、ワークフローのトピック別ビュー、Decision Map、関連 REQ 表へ、新規 ADR「case-auto オーケストレーション制御の AgentDevFlow 側集約」を追加する。
      Decision Map には ADR-0136、ADR-0137、ADR-0129、ADR-0132 との relates-to 関係を記録し、関連 REQ 表には REQ-0114、REQ-0148、REQ-0162 を記録する。
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: src/opencode/commands/agentdev/case-auto.md
    target_area: "### Step 4: 各工程の実行"
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      Step 4 に Phase 分離モデルを追加する。
      Phase 1 は全対象の case-open を順次実行する。
      Phase 2 は case-run を bg task として最大5件ずつ並列実行し、結果と破棄を収集する。
      Phase 3 は case-close を順次実行する。
      Phase 1 と Phase 3 を main push と capture の直列集約ポイントとする。
      bg task 破棄時は、commit 済みで PR 未作成の状態と未コミット変更が残る状態を区別して回復する。
      bg task API と引数仕様は `references/<harness>.md` を参照する。
  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: src/opencode/commands/agentdev/case-auto.md
    target_area: "### Step 8: 完了報告"
    source_items: [AG-004, AG-005]
    content: |
      完了報告へ Phase 1、Phase 2、Phase 3 の実行結果を含める。
      順次フォールバックを使用した場合は理由を記録する。
      bg task の破棄を検知して回復した場合は、検知した状態区分と回復結果を記録する。
  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target: src/opencode/commands/agentdev/case-auto.md
    target_area: "## ガードレール"
    source_items: [AG-001, AG-002, AG-003, AG-005]
    content: |
      - G29: case-auto の所有対象には、Phase 分離、Phase 2 の固定並列数、bg task の状態管理、破棄検知、状態別回復、Phase 1 と Phase 3 の直列集約を含める。bg task API、実行エージェント選定、実行担当サブエージェント内部の推論、context 管理、retry、heartbeat、エラー解析は harness の責務とする。
      - G32: case-auto は Phase 2 だけで case-run を並列起動する。Phase 1 と Phase 3 で case-run を並列起動せず、並列実行を利用できない場合だけ順次フォールバックへ切り替える。
  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target: docs/specs/workflows/epic-wave-model.md
    target_area: "### execution_unit 並列 orchestration"
    source_items: [AG-001, AG-002, AG-004, AG-005]
    content: |
      ## ドラフト間並列実行モデル

      case-auto が複数の対象を処理する場合、case-open を順次実行する Phase 1、最大5件の case-run を並列実行する Phase 2、case-close を順次実行する Phase 3 を適用する。
      Phase 2 の bg task 破棄は、commit 済みで PR 未作成の状態と未コミット変更が残る状態に分けて回復する。
      並列実行が利用できない場合だけ順次フォールバックを使用し、理由を完了報告に残す。
  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target: docs/specs/foundations/harness-separation-model.md
    target_area: "## 分離原則"
    source_items: [AG-001, AG-003, AG-004]
    content: |
      case-auto の Phase 分離、固定並列数、bg task の状態管理、破棄検知、状態別回復を AgentDevFlow 側の所有リストへ追加する。
      bg task API、実行エージェント選定、実行担当サブエージェント内部の推論、context 管理、retry、heartbeat、エラー解析を harness 側の所有リストに残す。
  - id: ACT-SPEC-006
    artifact: spec
    operation: update
    target: docs/specs/responsibilities/responsibility-boundary-purification.md
    target_area: "### case-auto所有/非所有リスト"
    source_items: [AG-002, AG-003, AG-006, AG-007]
    content: |
      case-auto の所有リストに Phase 分離、Phase 2 の固定並列数、bg task の状態管理、破棄検知、状態別回復、Phase 1 と Phase 3 の直列集約を追加する。
      非所有リストには bg task API と実行担当サブエージェント内部の実行制御を残し、new:case-auto-orchestration-control による ADR-0136 決定2の限定範囲を明記する。

conflict_resolutions:
  - id: CR-001
    conflict: ADR-0136 は実行制御を harness 側に配置する一方、case-auto の並列オーケストレーションには共有された安全境界と回復契約が必要である。
    resolution: Phase 分離、固定並列数、bg task の状態管理と回復だけを AgentDevFlow 側へ置く。bg task API と実行担当サブエージェント内部の制御は harness 側に残す。
  - id: CR-002
    conflict: accepted の ADR-0136 に直接の意味変更を加えることは ADR の不変性に抵触する。
    resolution: 新規 ADR を現行の意思決定として作成し、ADR-0136 には決定2の限定範囲を示す注記だけを追加する。決定1と決定3は変更しない。
  - id: CR-003
    conflict: REQ-0148-018 の case-auto レベルにグローバル並列上限を置かない方針と、Phase 2 の固定値5が衝突するように見える。
    resolution: グローバル上限は新設せず、Phase 2 の case-run 同時起動数だけに REQ-0130-026 と同一の固定値5を適用する。
  - id: CR-004
    conflict: Step 4 の結果では REQ-0114 の追記後98行を SPLIT シグナル+1としているが、現行の req-health-metrics SPEC は81行以上を+2と定義する。
    resolution: 現行閾値による SPLIT 検討を draft-meta に記録する。ユーザーが直ちに SPLIT しないことと別 case で検討することを確認済みのため、今回の APPEND は継続する。
  - id: CR-005
    conflict: Step 4 は新規 ADR の想定番号を示しているが、req-define は新規 ADR 番号を直接指定しない。
    resolution: draft では new:case-auto-orchestration-control を使用し、req-save が max+1 規約で番号を確定する。
  - id: CR-006
    conflict: 既存の harness 境界は、並列化の方針、実行 API、実行担当サブエージェント内部の制御を同じ「実行制御」として読める。
    resolution: 新規 ADR は、Phase の順序、固定値5の安全境界、bg task の状態別回復を AgentDevFlow のオーケストレーション契約として明示する。API と内部制御は harness 側に残す。

operation_units:
  - ou_id: OU-001
    target_req: REQ-0114
    operation: append
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    target_req: REQ-0148
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    target_req: REQ-0162
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-004
    target_spec: src/opencode/commands/agentdev/case-auto.md
    operation: spec-update
    scale: large
    depends_on: [OU-001]
    recommended_order: 4
    issue_policy: single
    result: {}
  - ou_id: OU-005
    target_spec: docs/specs/workflows/epic-wave-model.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 5
    issue_policy: single
    result: {}
  - ou_id: OU-006
    target_spec: docs/specs/foundations/harness-separation-model.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 6
    issue_policy: single
    result: {}
  - ou_id: OU-007
    target_spec: docs/specs/responsibilities/responsibility-boundary-purification.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 7
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: >-
      REQ-0114-106、REQ-0148-018、新規 ADR、case-auto の Phase 2 記述を照合し、同時起動数の値と所有主体を確認する。
    pass_criteria: >-
      すべての対象が固定値5を記述し、値の設定主体を AgentDevFlow 側としている。
    on_failure: >-
      fix-and-reverify: 値、参照先、所有主体の不一致を修正し、同じ4箇所を再照合する。
  - id: TS-002
    target_item: AG-002
    verification: >-
      REQ-0114-102、REQ-0114-104、case-auto Step 4、epic-wave-model の記述を照合する。
    pass_criteria: >-
      Phase 1 は case-open の順次実行、Phase 2 は case-run の並列実行、Phase 3 は case-close の順次実行として一貫し、Phase 1 と Phase 3 が直列集約ポイントになっている。
    on_failure: >-
      fix-and-reverify: Phase の順序、対象工程、集約ポイントの不一致を修正し、対象文書を再照合する。
  - id: TS-003
    target_item: AG-003
    verification: >-
      REQ-0114-103、REQ-0162-002、ADR-0136 の限定注記、harness 分離モデル、責務境界リストを照合する。
    pass_criteria: >-
      AgentDevFlow 側の bg task 状態管理と、harness 側の bg task APIおよび実行担当サブエージェント内部制御が重複なく記述されている。
    on_failure: >-
      fix-and-reverify: 所有/非所有の重複または欠落を修正し、5つの対象を再照合する。
  - id: TS-004
    target_item: AG-004
    verification: >-
      REQ-0114-105、case-auto Step 4、case-auto Step 8、epic-wave-model を照合し、破棄検知時の状態区分を確認する。
    pass_criteria: >-
      commit 済みで PR 未作成の状態と未コミット変更が残る状態が区別され、各状態に回復パターンが結び付いている。
    on_failure: >-
      fix-and-reverify: 状態区分または回復パターンの欠落を修正し、4つの対象を再照合する。
  - id: TS-005
    target_item: AG-005
    verification: >-
      REQ-0114-107 と case-auto の Step 8 および G32 を照合する。
    pass_criteria: >-
      並列実行が既定であり、順次実行がフォールバックに限定され、フォールバック理由が報告対象になっている。
    on_failure: >-
      fix-and-reverify: 既定挙動、フォールバック条件、報告項目の不一致を修正し、対象記述を再照合する。
  - id: TS-006
    target_item: AG-006
    verification: >-
      ADR-0136 の決定セクションと新規 ADR の関連する決定を照合する。
    pass_criteria: >-
      ADR-0136 の注記は決定2だけを限定し、決定1と決定3を変更せず、新規 ADR が将来の意思決定と根拠を保持している。
    on_failure: >-
      fix-and-reverify: 注記の対象範囲または新規 ADR の判断根拠を修正し、両 ADR を再照合する。
  - id: TS-007
    target_item: AG-007
    verification: >-
      新規 ADR の title、status、relates-to、supersedes と ADR インデックスの登録内容を照合する。
    pass_criteria: >-
      新規 ADR は accepted として登録され、ADR-0136、ADR-0137、ADR-0129、ADR-0132 との relates-to 関係を持ち、supersedes を持たない。
    on_failure: >-
      fix-and-reverify: ADR のメタデータ、関連、インデックス登録を修正し、保存対象を再照合する。

case_open_hints:
  epic_needed: false
  decomposition: >-
    この値は Epic を必須とする要件がないことを示すだけである。
    最終的な Issue 構成は case-open が artifact_actions と OU の必須依存を評価して決定する。
  wave_hints:
    - OU-001 の REQ/ADR 保存結果を、後続の command/SPEC 更新に必要な前提として扱う。

draft-meta:
  split-forecast:
    - target: REQ-0114
      metrics:
        requirement_rows_after_append: 98
        concern_classifications: 1
        artifact_types: 1
      signals:
        requirement_rows: 2
        concern_classifications: 0
        artifact_types: 0
        high_specificity: 0
      total: 2
      recommended_action: SPLIT検討
      user_resolution: 直ちに SPLIT せず、別 case で検討する。今回の APPEND は継続する。
      reported_step_4_signal_total: 1
      thresholds_ref: docs/specs/quality/req-health-metrics.md
    - target: REQ-0148
      metrics:
        requirement_rows: 24
        concern_classifications: 1
        artifact_types: 1
      signals:
        requirement_rows: 0
        concern_classifications: 0
        artifact_types: 0
        high_specificity: 0
      total: 0
      recommended_action: UPDATE許可
      thresholds_ref: docs/specs/quality/req-health-metrics.md
    - target: REQ-0162
      metrics:
        requirement_rows: 10
        concern_classifications: 1
        artifact_types: 1
      signals:
        requirement_rows: 0
        concern_classifications: 0
        artifact_types: 0
        high_specificity: 0
      total: 0
      recommended_action: UPDATE許可
      thresholds_ref: docs/specs/quality/req-health-metrics.md
```

# summary

case-auto の並列実行を Phase 分離モデルで規定する。

Phase 1 と Phase 3 を直列集約ポイントにし、Phase 2 だけで最大5件の case-run を並列実行する。

AgentDevFlow は bg task の状態管理と回復を保持し、harness は起動 API と実行担当サブエージェント内部の制御を保持する。
