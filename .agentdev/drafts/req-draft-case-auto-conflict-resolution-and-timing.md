---
draft_type: req_draft
topic_slug: case-auto-conflict-resolution-and-timing
status: saved
created_at: 2026-06-24T12:38:02+09:00
saved_at: 2026-06-24
spec_saved_at: 2026-06-24
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: |
  case-auto の実行時間が長い問題の根本原因が過剰な直列化にあることを分析で特定した。
  並列化を強化するための前提として、コンフリクト解消メカニズムが未実装（REQ-0148-024 が SPEC のみでコマンド定義に未反映）であることを解消する。
  3段階のコンフリクト解消モデル（case-close 機械的 rebase、case-auto 文脈付き再委譲、case-auto オーケストレーション級判断）を導入し、
  case-auto の停止条件を「アクセス可能な文脈を総動員しても解消不能なコンフリクト」に段階化する。
  あわせて、改善効果を検証するため工程別タイムスタンプ計測（L1: case-auto、L2: case-run）を追加する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      3段階コンフリクト解消モデルを導入する。
      Level 1（case-close）: squash merge 失敗時に rebase による機械的解消を試みる。rebase が自動解決すれば再マージする。
      rebase 自体がコンフリクトを発生する場合、case-close は実装変更を行わず case-auto へエスカレーションする。
      Level 2（case-auto）: 両PRのdiffを読み取り、コンフリクト文脈を付けて case-run へ再委譲する。
      case-run が既マージ変更を考慮した再実装を行い新PRを作成する。最大2回の再委譲（元の並列実行を含む計3回の case-run 実行）を上限とする。
      Level 3（case-auto）: マージ順序変更、blocked 単位の隔離（REQ-0148-015 の blocked 部分停止・ready 継続フローを拡張）。
      上記3段階すべてを試行しても解消できない場合のみ停止する。

  - id: AG-002
    content: |
      case-auto はコンフリクト解消に対して常に全力で解消を図る。
      コンフリクトの発生元（同一 case-auto 内、別 case-auto 跨ぎ）に関わらず、アクセス可能な文脈を総動員する。
      別 case-auto 跨ぎの場合は相手側の要件意図が不明でも、diff を読み取り再委譲を試みる。
      解消の成功率が保証されないだけで、解消努力を端折らない。

  - id: AG-003
    content: |
      case-auto の停止条件（REQ-0114-016(8)「merge 競合」）を段階化する。
      case-close が解消できる機械的競合は case-auto の停止条件に含めない（case-close が解消する）。
      停止条件は「case-auto がアクセス可能な文脈を総動員しても解消不能なコンフリクト」とする。
      操作的定義: Level 2 の再委譲を上限回数（2回）試行してもコンフリクトが解消しない場合。

  - id: AG-004
    content: |
      case-close と case-merge を分離しない。
      case-close の Step 4 に rebase（機械的コンフリクト解消）を追加する。
      分離しない理由: (1) マージ失敗時に case-close は Step 5-12（クローズ処理）を実行しないため、
      コンフリクト解消ロジックとクローズ処理の混在は構造的に起きない。(2) 手動実行でパイプラインが
      3段階になり、コンフリクトが稀な手動実行で常に1ステップ増える。(3) 約18文書の変更は現在の
      スコープに対して不釣り合い。case-close の責務境界は「完了処理 + マージ時コンフリクトの機械的解消
      （rebase のみ、解消不能時は即エスカレーション、実装変更は行わない）」と再定義する。

  - id: AG-005
    content: |
      実行時間観測（L1）を追加する。
      case-auto が各 task() の直前・直後にタイムスタンプを記録し、工程別（req-save, spec-save, case-open,
      case-run, case-close）の壁時計時間を完了報告に含める。他コマンドの変更は不要（case-auto が外側から計測）。
      現行の REQ-0114-082/083（開始・終了時刻）を工程別内訳へ拡張する。
      保存先はまず case-auto 完了報告の拡張。永続化は必要になった段階で別途検討する。

  - id: AG-006
    content: |
      実行時間観測（L2）を追加する。
      case-run が Sisyphus-Junior task() の直前・直後にタイムスタンプを記録し、
      Sisyphus-Junior 実行時間、worktree 設定/クリーンアップ時間を case-run result に含める。
      L3（ulw-loop 内部メトリクス）は oh-my-openagent への依存が強すぎるため対象外とする。

  - id: AG-007
    content: |
      REQ-0148 の適用範囲「対象外: case-close（ほぼ変更不要）」を撤回する。
      case-close に rebase によるコンフリクト解消責務を追加するため、REQ-0148 の対象外記述は
      現状と合致しない。ADR-0129 が「マージコンフリクト解決コストを受容」した決定の実装メカニズムとして、
      case-close の変更は必須である。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:case-auto-conflict-resolution-and-timing
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007]
    content: |
      id: REQ-0151
      title: "コンフリクト解消モデルと実行時間観測"
      created: "2026-06-24"
      updated: "2026-06-24"

      ## 目的

      case-auto の実行時間が長い問題の根本原因が過剰な直列化にあることを分析で特定した。
      並列化強化の前提として、コンフリクト解消メカニズム（REQ-0148-024 が SPEC のみでコマンド定義未反映）を実装し、
      case-auto の停止条件を段階化する。あわせて改善効果を検証するため工程別タイムスタンプ計測を追加する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-0151-001 | case-close は squash merge 失敗時に rebase による機械的コンフリクト解消を試みること。rebase が自動解決した場合は再マージすること |
      | REQ-0151-002 | case-close は rebase 自体がコンフリクトを発生した場合、実装変更を行わず case-auto へエスカレーションすること |
      | REQ-0151-003 | case-auto は case-close からのコンフリクトエスカレーションを受領した場合、両PRのdiffを読み取りコンフリクト箇所を特定し、コンフリクト文脈を付けて case-run へ再委譲すること |
      | REQ-0151-004 | case-auto の再委譲は最大2回（元の並列実行を含む計3回の case-run 実行）を上限とすること |
      | REQ-0151-005 | case-auto はコンフリクト解消に対して常に全力で解消を図ること。発生元（同一 case-auto 内、別 case-auto 跨ぎ）に関わらずアクセス可能な文脈を総動員すること |
      | REQ-0151-006 | case-auto の停止条件「merge 竽合」（REQ-0114-016(8)）を「アクセス可能な文脈を総動員しても解消不能なコンフリクト」に段階化すること。操作的定義: Level 2 の再委譲を上限回数試行しても解消しない場合 |
      | REQ-0151-007 | case-close と case-merge を分離しないこと。case-close Step 4 に rebase を追加し、責務境界を「完了処理 + マージ時コンフリクトの機械的解消（rebase のみ、解消不能時は即エスカレーション、実装変更は行わない）」と再定義すること |
      | REQ-0151-008 | case-auto は各 task() の直前・直後にタイムスタンプを記録し、工程別（req-save, spec-save, case-open, case-run, case-close）の壁時計時間を完了報告に含めること（REQ-0114-082/083 の工程別内訳への拡張） |
      | REQ-0151-009 | case-run は Sisyphus-Junior task() の直前・直後にタイムスタンプを記録し、Sisyphus-Junior 実行時間および worktree 設定/クリーンアップ時間を result に含めること |
      | REQ-0151-010 | ulw-loop 内部メトリクス（L3）は本要件の対象外とすること（oh-my-openagent への依存が強すぎるため） |

      ## 適用範囲

      - **対象**:
        - case-close（rebase による機械的コンフリクト解消、エスカレーション路径の追加）
        - case-auto（コンフリクト文脈付き再委譲、停止条件の段階化、工程別タイムスタンプ計測）
        - case-run（Sisyphus-Junior 壁時計タイムスタンプ計測）
        - 新規ADR（コンフリクト解消モデル、relates-to ADR-0129）
        - REQ-0114 APPEND（停止条件改訂、L1 計測）
        - REQ-0131 APPEND（case-close rebase 責務）
        - REQ-0130 APPEND（case-run L2 計測）
        - REQ-0148 APPEND（対象外「case-close ほぼ変更不要」撤回）
      - **対象外**:
        - case-merge の新規コマンド分離（将来の課題）
        - ulw-loop 内部メトリクス（L3、oh-my-openagent 依存）
        - 行/関数レベルの依存分析（並列化強化の後続フェーズ）
        - 並列化強化本体（L2 並列許容等、本要件の安定後）

      ## 関連情報

      - **関連REQ**: REQ-0148（REQ-0148-024 rebase、REQ-0148-015 blocked 部分停止）、REQ-0114（停止条件 REQ-0114-016(8)、タイミング REQ-0114-082/083）、REQ-0131（case-close）、REQ-0130（case-run）
      - **関連ADR**: ADR-0129（複数 execution_unit 並列実行モデル）→ 新規ADR が relates-to で補完

  - id: ACT-ADR-001
    artifact: adr
    operation: create
    target: new:conflict-resolution-model
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      id: ADR-0132
      title: "コンフリクト解消モデル（3レベルエスカレーションと責務割当）"
      status: accepted
      created: "2026-06-24"
      updated: "2026-06-24"

      ## 背景

      ADR-0129 は複数 execution_unit 並列実行モデルを採用し、ファイル衝突（L2）があっても並列を許容し、
      「マージコンフリクト解決コストを受容する」と決定した。しかし、コンフリクトの解決メカニズム、
      責務割当、エスカレーションパスは未定義であった。REQ-0148-024 は「rebase により解決すること」を
      要求しているが、コマンド定義（case-close）に未実装であり、case-auto はコンフリクトを無条件の
      停止条件として扱っている。結果として並列化が保守的に運用され、実質ほぼ直列になっている。

      ## 決定

      3レベルのコンフリクト解消モデルを採用する:

      - **Level 1（case-close）**: squash merge 失敗時の rebase による機械的解消。
        rebase が自動解決すれば再マージ。rebase 不可時は case-auto へエスカレーション。
        case-close の責務境界は「完了処理 + マージ時コンフリクトの機械的解消（rebase のみ、
        実装変更不可、解消不能時は即エスカレーション）」と再定義する。

      - **Level 2（case-auto）**: コンフリクト文脈付き再委譲。
        case-auto は両PRのdiffを読み取りコンフリクト箇所を特定し、コンフリクト文脈を付けて
        case-run へ再委譲する。最大2回（計3回の case-run 実行）を上限とする。

      - **Level 3（case-auto）**: オーケストレーション級判断。
        マージ順序変更、blocked 単位の隔離（REQ-0148-015 拡張）。

      - **停止条件**: 上記3段階を試行しても解消できない場合のみ停止。
        case-auto は発生元に関わらず常に全力で解消を図る。

      - **case-close と case-merge の分離は行わない**: コンフリクト解消ロジックとクローズ処理の
        混在は構造的に起きない（マージ失敗時に case-close は Step 5-12 を実行しない）ため、
        分離のコスト（約18文書変更、手動実行でのステップ増加）に見合わない。

      ## 代替案

      1. ADR-0129 APPEND: ADR-0129 は「並列実行を許すか」の決定であり、本モデルは「コンフリクトを
         どう解決するか」の直交する次元である。scope が膨張し責務境界が曖昧になるため不採用。
      2. case-merge の新規コマンド分離: エスカレーションパスはクリーンになるが、約18文書の変更と
         手動実行でのステップ増加が見合わないため不採用（将来の課題として残す）。
      3. コンフリクト解消と観測性の ADR 分離: 3レベルモデルは単一のエスカレーションフローを構成し、
         停止条件が連動するため、分割すると全体像が追えなくなる。観測性は SPEC レベルで扱う。

      ## 結果、影響

      ポジティブ:
      - REQ-0148-024 が実装され、並列化強化の前提が整う
      - コンフリクトで即停止せず、機械的解消および文脈付き再委譲で継続可能になる
      - 工程別タイムスタンプにより改善効果が検証可能になる

      ネガティブ:
      - エスカレーションループ（Level 2 再委譲サイクル）が実行時間を延ばす可能性がある。
        最大3回の case-run 実行分の時間コストを受容する
      - case-close の責務拡張（rebase 追加）。責務境界を ADR で明示的に再定義し、scope creep を防ぐ
      - 「アクセス可能な文脈を総動員しても解消不能」の判定が再委譲上限回数（2回）に依存する。
        運用データ蓄積後に上限の妥当性を再評価する

      ## 関連する決定

      - relates-to ADR-0129（複数 execution_unit 並列実行モデル）: ADR-0129 が受容したコンフリクトコストの解決メカニズムを定義する
      - relates-to ADR-0128（case-run 実行モデル）: case-run の再委譲は既存の task() 委譲モデルを使用する

  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: REQ-0114
    target_area: "要件テーブル + 停止条件 REQ-0114-016(8)"
    source_items: [AG-003, AG-005]
    content: |
      REQ-0114-016(8) の停止条件「merge 竽合 / リモート hash 不一致」を以下に改訂:
      「case-auto がアクセス可能な文脈を総動員しても解消不能なコンフリクト（REQ-0151-006 参照）」
      機械的競合（rebase で自動解決可能）は case-close が解消するため停止条件から除外する。

      追加要件:
      | REQ-0114-094 | case-auto は各工程の task() 起動前後にタイムスタンプを記録し、工程別壁時計時間を完了報告に含めること（REQ-0114-082/083 の拡張、REQ-0151-008 参照） |
      | REQ-0114-095 | case-auto は case-close からのコンフリクトエスカレーションを受領した場合、コンフリクト文脈付きで case-run へ再委譲すること（REQ-0151-003 参照、最大2回） |

  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: REQ-0131
    target_area: "要件テーブル"
    source_items: [AG-001, AG-004]
    content: |
      追加要件:
      | REQ-0131-024 | case-close は squash merge 失敗時に rebase による機械的コンフリクト解消を試みること（REQ-0151-001 参照） |
      | REQ-0131-025 | case-close は rebase がコンフリクトを発生した場合、実装変更を行わず case-auto へエスカレーションすること（REQ-0151-002 参照） |

      case-close の責務境界を「完了処理 + マージ時コンフリクトの機械的解消（rebase のみ、解消不能時は即エスカレーション、実装変更は行わない）」に再定義。

  - id: ACT-REQ-004
    artifact: req
    operation: append
    target: REQ-0130
    target_area: "要件テーブル"
    source_items: [AG-006]
    content: |
      追加要件:
      | REQ-0130-028 | case-run は Sisyphus-Junior task() 起動前後にタイムスタンプを記録し、Sisyphus-Junior 実行時間および worktree 設定/クリーンアップ時間を result に含めること（REQ-0151-009 参照） |

  - id: ACT-REQ-005
    artifact: req
    operation: append
    target: REQ-0148
    target_area: "適用範囲 > 対象外"
    source_items: [AG-007]
    content: |
      適用範囲の対象外「case-close（ほぼ変更不要）」を撤回。
      case-close に rebase によるコンフリクト解消責務を追加する（REQ-0151-001/002、REQ-0131-024/025 参照）。
      ADR-0129 が受容したコンフリクトコストの解決メカニズムとして、case-close の変更は必須である。

  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/commands/case-auto.md
    target_area: "複数 execution_unit 並列 orchestration > 並列実行の判定 + 新規セクション: コンフリクト解消モデル"
    source_items: [AG-001, AG-002, AG-003, AG-005]
    content: |
      case-auto SPEC に以下を追加・更新:

      1. コンフリクト解消モデルセクションを新設:
         - Level 1（case-close）: rebase による機械的解消、エスカレーション
         - Level 2（case-auto）: コンフリクト文脈付き再委譲（最大2回）
         - Level 3（case-auto）: マージ順序変更、blocked 隔離
         - 停止条件: 3段階試行後も解消不能な場合のみ

      2. 停止条件の記述を更新:
         - 「merge conflict」を「アクセス可能な文脈を総動員しても解消不能なコンフリクト」に改訂

      3. 工程別タイムスタンプ計測セクションを新設:
         - 各 task() 前後のタイムスタンプ記録
         - 完了報告への工程別内訳追加

  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: docs/specs/commands/case-close.md
    target_area: "PRマージ Step 4 + 責務境界"
    source_items: [AG-001, AG-004]
    content: |
      case-close SPEC の Step 4（PRマージ）を拡張:
      - squash merge 失敗時のフローに rebase パスを追加
      - rebase 成功時: 再マージ → Step 5 へ
      - rebase 失敗時（コンフリクト発生）: case-auto へエスカレーション（停止）
      - 責務境界の再定義: 完了処理 + マージ時コンフリクトの機械的解消（rebase のみ、実装変更不可）

  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target: docs/specs/workflows/epic-wave-model.md
    target_area: "execution_unit 並列 orchestration > コンフリクト解決"
    source_items: [AG-001, AG-002]
    content: |
      epic-wave-model SPEC のコンフリクト解決記述を拡張:
      - 現行: 「PR マージコンフリクト発生時、後続 PR は rebase により解決する（REQ-0148-024）」
      - 拡張後: 3レベルコンフリクト解消モデルへの参照を追加（ADR-0132、REQ-0151 参照）
      - Level 1-3 のエスカレーションフローと停止条件を記述

conflict_resolutions:
  - id: CR-001
    conflict: case-close に rebase を追加すると責務が過密になる。case-merge の新規コマンド分離すべきか。
    resolution: |
      分離しない。マージ失敗時に case-close は Step 5-12（クローズ処理）を実行しないため、
      コンフリクト解消ロジックとクローズ処理の混在は構造的に起きない。
      手動実行でのステップ増加と約18文書の変更コストが見合わない。
      将来 case-close の責務が更に膨張した場合は分離を再検討する。

  - id: CR-002
    conflict: case-auto がコンフリクトを解消できるのは同一 case-auto 内のみか。別 case-auto 跨ぎではどうか。
    resolution: |
      別 case-auto 跨ぎでも全力で解消を図る。相手側の要件意図が不明でも、diff を読み取り
      再委譲を試みる。成功率は保証されないが、努力を端折らない。
      停止条件は「アクセス可能な文脈を総動員しても解消不能」で一律。

  - id: CR-003
    conflict: エスカレーションループの上限を何回にするか。
    resolution: 最大2回の再委譲（元の並列実行を含む計3回の case-run 実行）。3回目で解消できなければユーザー判断。

  - id: CR-004
    conflict: ulw-loop 内部メトリクス（L3）を計測するか。
    resolution: 対象外。oh-my-openagent への依存が強すぎる。L1（case-auto）と L2（case-run）の壁時計計測のみとする。

operation_units:
  - ou_id: OU-001
    target_req: REQ-0151
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs:
        - docs/requirements/REQ-0151.md
      saved_adr_docs:
        - docs/adr/ADR-0132.md
      appended_req_docs:
        - docs/requirements/REQ-0114.md
        - docs/requirements/REQ-0131.md
        - docs/requirements/REQ-0130.md
        - docs/requirements/REQ-0148.md
      artifact_action_mapping:
        ACT-REQ-001: { op: create, target_resolved: "new:case-auto-conflict-resolution-and-timing -> REQ-0151", saved: docs/requirements/REQ-0151.md }
        ACT-ADR-001: { op: create, target_resolved: "new:conflict-resolution-model -> ADR-0132", saved: docs/adr/ADR-0132.md }
        ACT-REQ-002: { op: append, target: REQ-0114, added_rows: ["REQ-0114-094", "REQ-0114-095"], notes: ["REQ-0114-016(8) revision note"] }
        ACT-REQ-003: { op: append, target: REQ-0131, added_rows: ["REQ-0131-024", "REQ-0131-025"], notes: ["case-close 責務境界再定義"] }
        ACT-REQ-004: { op: append, target: REQ-0130, added_rows: ["REQ-0130-028"] }
        ACT-REQ-005: { op: append, target: REQ-0148, scope_change: "対象外「case-close（ほぼ変更不要）」撤回", notes: ["撤回ノート"] }
      spec_actions_consumed:
        ACT-SPEC-001: { op: update, target: docs/specs/commands/case-auto.md, saved: docs/specs/commands/case-auto.md, notes: ["コンフリクト解消モデルセクション追加", "停止条件改訂", "工程別タイムスタンプ計測(L1)セクション追加"] }
        ACT-SPEC-002: { op: update, target: docs/specs/commands/case-close.md, saved: docs/specs/commands/case-close.md, notes: ["Step 4-2 rebase パス追加", "責務境界再定義"] }
        ACT-SPEC-003: { op: update, target: docs/specs/workflows/epic-wave-model.md, saved: docs/specs/workflows/epic-wave-model.md, notes: ["3レベルコンフリクト解消モデル参照追加"] }
      qg1_result: pass
      case_open_input:
        primary_req: REQ-0151
        primary_adr: ADR-0132
        related_reqs: [REQ-0114, REQ-0131, REQ-0130, REQ-0148]
        related_adrs: [ADR-0129, ADR-0132]

# case_open_hints: case-open 構成生成への参考情報
case_open_hints:
  epic_needed: false
  decomposition:
  wave_hints: []
```

# summary

case-auto 実行時間分析から、過剰な直列化が根本原因と特定された。並列化強化の前提として、未実装のコンフリクト解消メカニズム（REQ-0148-024）を3段階モデルで実装する。case-close に rebase（Level 1）、case-auto に文脈付き再委譲（Level 2、最大2回）とオーケストレーション級判断（Level 3）を追加し、停止条件を段階化する。あわせて工程別タイムスタンプ計測（L1: case-auto、L2: case-run）を追加し、改善効果を検証可能にする。
