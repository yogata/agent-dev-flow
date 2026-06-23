---
draft_type: req_draft
topic_slug: batch-multi-epic
status: saved
created_at: 2026-06-22T00:00:00+09:00
source_rus: []
---

<!-- req_draft: RU群バッチ処理と複数 execution_unit 並列実行
  本ドラフトは req-define Step 1 セッションコンテキスト検知ベースで生成。
  Oracle 助言（bg_11f2d958, High 確信度）に基づき新規ADR 1件を含む。 -->

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  複数RU（intake/learning 由来含む）を一括処理するため、1回の req-define で1ドラフトに複数OUを統合し、
  case-open が依存グラフの連結成分と3軸判断（依存強度・Epic サイズ・機能的一貫性）で複数 Standard Issue / Epic Issue / 混在を自律生成し、
  case-auto が依存関係のない execution_unit を並列実行し blocked 単位で停止するモデルを提供する。
  関連しないRU群が不適切に1つの Epic に集約されることを防ぐ。
  execution_unit = standard issue | epic issue（Wave は Epic 内部構造で execution_unit には含めない）。
  並列制御は case-run 単位の5件上限（REQ-0130-026 踏襲）のみで、case-auto レベルでのグローバル上限は設定しない。
  優先順位制御・クリティカルパス解析は対象外。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      RU群（intake/learning 由来含む）を1回の req-define で1ドラフトに統合し、複数OUとして表現する。
      req-define は OU の depends_on に技術的依存と機能的依存を含めて case-open 向けヒントとして記録する。
      req-define は Standard Issue / Epic Issue / Wave / Issue 間依存の最終構成を確定しない（case-open の責務）。
      req-define の depends_on は case-open 向けヒントであり、case-auto への必須出力ではない。case-auto は Issue 状態を読んで実行可否を判定する。
  - id: AG-002
    content: |
      execution_unit = standard issue | epic issue と定義する。
      Wave は execution_unit に含めず、Epic Issue 本文から読み取る内部構造とする。
  - id: AG-003
    content: |
      case-open は OU 群から複数 Standard Issue / 複数 Epic Issue / 両者の混在を作成する。
      依存グラフの連結成分（必須依存のみをエッジとする）を Epic 候補の出発点とし、
      依存強度（必須/弱/関連）・Epic サイズ（推奨3-10子Issue・上限10ハード制約）・機能的一貫性の3軸で最終 Epic 構成を自律生成する。
      単独根（1 OU だけの連結成分）は Epic 化せず Standard flow とする。
      case-open は無関係な OU 群を単一 Epic へ機械的に集約しない。
      case-open は Epic 構成推論の根拠を記録する。
      3軸判断の個別エッジケース（同機能独立・共通基盤等）は LLM 推論に委ねる。REQ/SPEC で固定するのは不変の方針（依存強度3レベル定義・Epic サイズ上限・単独根Standard flow 等）のみ。個別ケースの適用は skill reference で扱う。
  - id: AG-004
    content: |
      case-auto は case-open が作成した Standard/Epic Issue 群を処理対象とする。
      同一 Epic 内の Wave 間は直列（並列不可）。
      必須依存（連結成分のエッジ）がない複数 execution_unit 間（Epic 間・Standard 間・混在）は並列実行する。
      技術的依存レベル（L0-L3）は並列可否の判定軸から外し、ファイル衝突（L2）があっても並列を許容し、PR マージコンフリクトは rebase で解決する。
      blocked になった execution_unit だけを停止し、他の ready 対象は継続する。
      全対象が closed/blocked/failed になったら終了し、一部 blocked 残存時は partial blocked として報告する。
      case-auto は case-open の判定結果に従い case-run(#epic) / case-run(standard) を task() 起動する（薄いオーケストレーター原則・G13/G15/G21 維持）。Issue階層決定・子Issue選択・Epic化判定の判断ロジックは持たない。複数 execution_unit の並列起動は、現行の単一 Epic Wave 反復制御を N 件に一般化したもの。
  - id: AG-005
    content: |
      case-auto はクリティカルパス解析・優先順位制御を行わない（実行可否は依存関係のみで判定）。
      case-auto レベルでのグローバル並列上限は設定せず、case-run 単位の5件上限（REQ-0130-026 踏襲）のみを制御対象とする。
      グローバル並列上限なしは N×5 件の task() 同時起動リスクを伴う（運用監視必要・ユーザー許容済み・Oracle 助言 bg_11f2d958 で設計リスク指摘）。
  - id: AG-006
    content: |
      case-run は単一 standard issue または単一 epic issue の現在 Wave を実行する（複数 execution_unit のスケジューラではない）。
      case-close は単一 standard issue または単一 epic issue の現在 Wave を完了処理する。
      case-run は各子issue を独立 worktree + branch で処理する（現行実装・REQ-0130-026/REQ-0130-023 踏襲）。worktree 分離により git 競合リスクは構造的に低く、これが積極的並列実行の設計根拠。
      case-run 側の新規機能追加は不要（入力としての Epic Issue が増えるのみ・case-run SPEC L134 で既に明記）。本要件の新規は case-auto 側（複数 case-run 並列起動）のみ。
  - id: AG-007
    content: |
      複数 execution_unit 並列実行時、Epic Issue 本文の単一書き手は per-Epic-Issue-body で維持される
      （複数 case-close が異なる Epic 本文にそれぞれ書く。ADR-0125 の安全性境界を per-Epic に拡張）。
  - id: AG-008
    content: |
      新規ADR「複数 execution_unit 並列実行モデル — 複数 SSoT 並立と Epic 間並列 orchestration」を作成する。
      ADR-0109（Epic Issue SSoT）・ADR-0125（Wave 内並列）に relates-to で補完する。
      case-open の「Issue 構成計画」責務化自体は ADR 対象外（command 動作仕様）。
  - id: AG-009
    content: |
      必須依存があっても、以下のいずれかを満たす場合は別 Epic へ分割を許容する（例外・割り切りルール）:
      (1) 事前契約（SPEC確定・インターフェース合意等）で並列実施可能な場合
      (2) 依存先 Epic が完了済みまたは完了確定の場合
      (3) 分割することで Epic サイズが推奨範囲（3-10）に収まる場合
  - id: AG-010
    content: |
      REQ-0114-088「case-open は複数の独立 OU を検出した場合、自動的に Epic Issue 化し Wave 1 に全 OU を配置」は
      破壊的 UPDATE し、「連結成分ベースで複数 Standard/Epic に分散」へ書き換える。
      REQ-0138 には OU の depends_on の意義拡張（技術的+機能的依存）を APPEND する。
      REQ-0132 には複数 Standard/Epic 構成生成ロジックを APPEND する。
      epic-wave-model.md・case-open.md・case-auto.md SPEC を新モデルへ UPDATE する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: REQ-0148
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-009]
    content: |
      ## 目的

      複数のRU（intake/learning 由来含む）を一括処理するため、1回の req-define で1ドラフトに複数OUを統合し、
      case-open が依存グラフの連結成分と3軸判断（依存強度・Epic サイズ・機能的一貫性）で複数 Standard Issue / Epic Issue / 混在を自律生成し、
      case-auto が依存関係のない execution_unit を並列実行し blocked 単位で停止するモデルを提供する。
      関連しないRU群が不適切に1つの Epic に集約されることを防ぐ。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-0148-001 | req-define は複数RU入力時に1ドラフト内に複数OUを作成できること |
      | REQ-0148-002 | req-define は OU の depends_on に技術的依存と機能的依存を含めて case-open 向けヒントとして記録すること |
      | REQ-0148-003 | req-define は Standard Issue / Epic Issue / Wave / Issue 間依存の最終構成を確定しないこと（case-open の責務） |
      | REQ-0148-004 | execution_unit は standard issue または epic issue とし、Wave は execution_unit に含めないこと（Wave は Epic Issue 本文から読み取る内部構造） |
      | REQ-0148-005 | case-open は OU 群から複数 Standard Issue / 複数 Epic Issue / 両者の混在を作成できること |
      | REQ-0148-006 | case-open は依存グラフの連結成分（必須依存のみをエッジとする）を Epic 候補の出発点とすること |
      | REQ-0148-007 | case-open は依存強度（必須/弱/関連）・Epic サイズ（推奨3-10子Issue・上限10）・機能的一貫性の3軸で最終 Epic 構成を自律生成すること |
      | REQ-0148-008 | case-open は単独根（1 OU だけの連結成分）を Epic 化せず Standard flow として扱うこと |
      | REQ-0148-009 | case-open は Epic サイズ上限10子Issueをハード制約として守ること |
      | REQ-0148-010 | case-open は無関係な OU 群を単一 Epic へ機械的に集約しないこと |
      | REQ-0148-011 | case-open は Epic 構成推論の根拠を Epic Issue 本文または case_open_hints に記録すること |
      | REQ-0148-012 | case-auto は case-open が作成した Standard/Epic Issue 群を処理対象とすること |
      | REQ-0148-013 | case-auto は同一 Epic 内の Wave 間を並列実行しないこと（Wave 間は直列） |
      | REQ-0148-014 | case-auto は必須依存（連結成分のエッジ）がない複数 execution_unit 間（Epic 間・Standard 間・混在）を並列実行できること。技術的依存レベル（L0-L3）は並列可否の判定軸から外し、ファイル衝突（L2）があっても並列を許容すること |
      | REQ-0148-015 | case-auto は blocked になった execution_unit だけを停止し、他の ready 対象を継続すること |
      | REQ-0148-016 | case-auto は全対象が closed/blocked/failed になったら終了し、一部 blocked 残存時は partial blocked として報告すること |
      | REQ-0148-017 | case-auto はクリティカルパス解析・優先順位制御を行わないこと（実行可否は依存関係のみで判定） |
      | REQ-0148-018 | case-auto レベルでのグローバル並列上限は設定せず、case-run 単位の5件上限（REQ-0130-026 踏襲）のみを制御対象とすること |
      | REQ-0148-019 | case-run は単一 standard issue または単一 epic issue の現在 Wave を実行すること（複数 execution_unit のスケジューラではない） |
      | REQ-0148-020 | case-close は単一 standard issue または単一 epic issue の現在 Wave を完了処理すること |
      | REQ-0148-021 | 複数 execution_unit 並列実行時、Epic Issue 本文の単一書き手は per-Epic-Issue-body で維持されること |
      | REQ-0148-022 | 新規ADR「複数 execution_unit 並列実行モデル」を作成し、ADR-0109・ADR-0125 に relates-to で補完すること |
      | REQ-0148-023 | 必須依存があっても事前契約・依存先Epic完了・Epicサイズ推奨範囲調整のいずれかを満たす場合は別 Epic 分割を許容すること |
      | REQ-0148-024 | 並列実行時に PR マージコンフリクトが発生した場合、後続 PR は rebase により解決すること |

      ## 適用範囲

      - **対象**:
        - req-define（複数RU入力・depends_on ヒント付与）
        - case-open（複数Standard/Epic構成生成・3軸判断・連結成分ベース分散）
        - case-auto（複数execution_unit並列orchestration・blocked部分停止・partial blocked報告）
        - execution_unit 定義（standard | epic、Wave 含まず）
        - REQ-0114-088 破壊的 UPDATE
        - REQ-0138 APPEND（depends_on 意義拡張）
        - REQ-0132 APPEND（複数Standard/Epic構成生成）
        - epic-wave-model.md / case-open.md / case-auto.md SPEC UPDATE
        - 新規ADR（複数 execution_unit 並列実行モデル）
      - **対象外**:
        - case-close（ほぼ変更不要）
        - case-run（変更最小・現行踏襲）
        - 優先順位制御
        - クリティカルパス最適化
        - Wave の Issue化
        - グローバル並列上限（設定しない）

      ## 関連情報

      - **関連REQ**: REQ-0114, REQ-0132, REQ-0138, REQ-0130
      - **関連ADR**: ADR-0129（複数 execution_unit 並列実行モデル）
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: REQ-0138
    source_items: [AG-001, AG-010]
    content: |
      REQ-0138 への追加要件行:

      | REQ-0138-019 | req-define は OU の depends_on に技術的依存と機能的依存を含めて case-open 向けヒントとして記録すること（確定DAGではなくヒント） |
      | REQ-0138-020 | case_open_hints には Epic 構成推論の参考情報（3軸判断のヒント・連結成分候補・Wave 構成候補）を記録できること |
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: REQ-0132
    source_items: [AG-003]
    content: |
      REQ-0132 への追加要件行:

      | REQ-0132-015 | case-open は OU 群から複数 Standard Issue / 複数 Epic Issue / 両者の混在を作成できること（単一 Epic 集約に限定しない） |
      | REQ-0132-016 | case-open は依存グラフの連結成分（必須依存のみをエッジとする）を Epic 候補の出発点とし、依存強度・Epic サイズ・機能的一貫性の3軸で最終構成を自律生成すること |
      | REQ-0132-017 | case-open は単独根（1 OU だけの連結成分）を Epic 化せず Standard flow として扱うこと |
  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: REQ-0114
    source_items: [AG-010]
    content: |
      REQ-0114-088 の破壊的 UPDATE:

      変更前: 「case-open は複数の独立 OU（depends_on 空・L0 相当）を検出した場合、自動的に Epic Issue 化し Wave 1 に全 OU を配置すること」

      変更後: 「case-open は OU 群の依存グラフの連結成分（必須依存のみをエッジとする）を Epic 候補の出発点とし、依存強度・Epic サイズ・機能的一貫性の3軸判断で複数 Standard Issue / 複数 Epic Issue / 混在を自律生成すること。単独根（1 OU だけの連結成分）は Standard flow とする」

      後方互換性: 従来の depends_on 空（技術的独立のみ）運用では、全 OU が別 Standard Issue として分散される。REQ-0114-087〜093 のうち、独立 OU 自動 Epic 化（REQ-0114-088）のみ本 UPDATE の対象。他は維持。
  - id: ACT-ADR-001
    artifact: adr
    operation: create
    target: ADR-0129
    source_items: [AG-007, AG-008]
    content: |
      ## ステータス

      accepted

      ## コンテキスト

      複数RU群をバッチ処理する要件において、関連しないRU群が不適切に1つの Epic に集約される問題（REQ-0114-088 の「独立 OU → 1 Epic」）を解消するため、case-open が連結成分ベースで複数 Standard/Epic を生成し、case-auto が複数 execution_unit を並列実行するモデルを採用する。

      この変更は ADR-0109（Epic Issue 本文 = 実行順序 SSoT）の単一 SSoT 前提を「複数 SSoT 並立」へ拡張し、ADR-0125（Wave 内並列子Issue実行）の並列モデルを「Epic 間並列」へ拡張する構造的変更である。

      Oracle 助言（bg_11f2d958, High 確信度）に基づき、ADR-0125 UPDATE ではなく新規 ADR とした（scope が直交する別次元のため）。

      ## 決定

      - 複数 execution_unit（standard issue | epic issue）が並立可能。各 Epic は独立した SSoT（ADR-0109 原則の per-Epic 適用）
      - case-auto は依存関係のない execution_unit を並列 orchestration する（blocked 単位停止・ready 継続）
      - 安全性境界の拡張: Epic Issue 本文の単一書き手は per-Epic-Issue-body で維持（複数 case-close が異なる Epic 本文にそれぞれ書く）
      - case-auto レベルでのグローバル並列上限は設定しない（case-run 単位5件上限のみ・REQ-0130-026 踏襲）
      - case-run スコープは単一 standard/epic のまま（ADR-0128 変更なし）

      ## 結果影響

      ポジティブ:
      - 関連しないRU群が不適切な Epic に集約される問題が解消
      - 並列実行によりバッチ処理のスループット向上
      - blocked 部分停止により、一部失敗が全体停止を引き起こさない

      ネガティブ:
      - 複数 case-close 並列書き込みによる状態管理の複雑化（per-body 単一書き手は維持されるが、横断追跡負荷増）
      - グローバル並列上限なしによる N×5 件の task() 同時起動リスク（運用監視必要）
      - クロス Epic 実行時依存の発生リスク（連結成分解析は case-open 時点ベース）

      ## 関連する決定

      - relates-to ADR-0109（SSoT 原則の per-Epic 拡張）
      - relates-to ADR-0125（Wave 内並列の維持・Epic 間並列の追加）
      - relates-to ADR-0127（case-auto orchestration 拡張）
      - relates-to ADR-0128（case-run スコープ維持）
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/workflows/epic-wave-model.md
    source_items: [AG-002, AG-003, AG-007]
    content: |
      epic-wave-model.md の更新内容:
      - execution_unit 定義（standard issue | epic issue、Wave 含まず）の追加
      - 3軸判断モデル（依存強度3レベル: 必須/弱/関連、Epic サイズ推奨3-10子Issue・上限10ハード、機能的一貫性）の追加
      - 連結成分アルゴリズム（必須依存のみエッジとする）の追加
      - 「case-auto 並列委譲モデル拡張（REQ-0114-087〜093）」セクションを新モデルへ書き換え
      - 「Epic 統率者契約」セクションの per-Epic 単一書き手拡張（複数 case-close が異なる Epic 本文に並列書き込み）
  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/case-open.md
    source_items: [AG-003]
    content: |
      case-open.md SPEC の更新内容:
      - 「独立 OU の自動 Epic 化」セクションを「連結成分ベース複数 Standard/Epic 構成生成」へ書き換え
      - 3軸判断（依存強度・Epic サイズ・機能的一貫性）の判定基準詳細を追加
      - 単独根の Standard flow 扱いを明記
  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/case-auto.md
    source_items: [AG-004, AG-005]
    content: |
      case-auto.md SPEC の更新内容:
      - 複数 execution_unit 並列 orchestration ロジックを追加
      - blocked 部分停止・ready 継続の判定フローを追加
      - Wave 反復制御（単一 Epic）から execution_unit 群反復制御（複数 Standard/Epic）への一般化
      - グローバル並列上限なし（case-run 5件上限のみ）の明記

conflict_resolutions:
  - id: CR-001
    conflict: REQ-0114-088「独立 OU 群 → 自動 Epic 化 Wave1 配置」が新方式（連結成分ベース分散）と真逆の振る舞いになる破壊的変更
    resolution: |
      Oracle 助言（bg_11f2d958, High 確信度）に基づき、REQ-0114-088 を破壊的 UPDATE する。
      ADR-0109（Epic SSoT）・ADR-0125（Wave 内並列）の原則は維持され、新規 ADR（new:multi-execution-unit-parallel）で relates-to 補完する。
      後方互換性: 従来の depends_on 空（技術的独立のみ）運用では、全 OU が別 Standard Issue として分散される。
      既存の単一 Epic 運用（REQ-0114-088 前提のガイド・テンプレート）は新モデルに追随して更新する。
  - id: CR-002
    conflict: 並列実行時に複数 execution_unit が同じファイルを変更し、PR マージ時にコンフリクトが発生する可能性
    resolution: |
      選択肢A（L2 並列許容）を採用。技術的依存レベル（L0-L3）は並列可否の判定軸から外し、必須依存（連結成分のエッジ）の有無でのみ並列実行を判定する。
      ファイル衝突（L2）があっても並列を許容し、PR マージ時にコンフリクトが発生した場合は後続 PR を rebase により解決する。
      worktree 分離により作業自体は並列可能であり、マージコンフリクト解決コストを受容する。

operation_units:
  - ou_id: OU-001
    target_req: REQ-0148
    operation: create
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: epic
    result:
      saved_docs:
        - path: docs/requirements/REQ-0148.md
          req_id: REQ-0148
          operation: create
          requirement_rows: 24
        - path: docs/adr/ADR-0129.md
          adr_id: ADR-0129
          operation: create
          status: accepted
      artifact_action_mapping:
        ACT-REQ-001: REQ-0148 (create)
        ACT-ADR-001: ADR-0129 (create)
      source_ru_mapping: {}
      case_open_input:
        req_ids: [REQ-0148]
        adr_ids: [ADR-0129]
        target_req_resolved: REQ-0148
  - ou_id: OU-002
    target_req: REQ-0138
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: epic
    result:
      saved_docs:
        - path: docs/requirements/REQ-0138.md
          req_id: REQ-0138
          operation: append
          appended_rows: [REQ-0138-019, REQ-0138-020]
      artifact_action_mapping:
        ACT-REQ-002: REQ-0138 (append)
      case_open_input:
        req_ids: [REQ-0138]
        target_req_resolved: REQ-0138
  - ou_id: OU-003
    target_req: REQ-0132
    operation: append
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: epic
    result:
      saved_docs:
        - path: docs/requirements/REQ-0132.md
          req_id: REQ-0132
          operation: append
          appended_rows: [REQ-0132-015, REQ-0132-016, REQ-0132-017]
      artifact_action_mapping:
        ACT-REQ-003: REQ-0132 (append)
      case_open_input:
        req_ids: [REQ-0132]
        target_req_resolved: REQ-0132
  - ou_id: OU-004
    target_req: REQ-0114
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: epic
    result:
      saved_docs:
        - path: docs/requirements/REQ-0114.md
          req_id: REQ-0114
          operation: update
          updated_rows: [REQ-0114-088]
          breaking_change: true
          backward_compatibility_note: CR-001
      artifact_action_mapping:
        ACT-REQ-004: REQ-0114 (update, breaking)
      case_open_input:
        req_ids: [REQ-0114]
        target_req_resolved: REQ-0114
  - ou_id: OU-005
    target_spec: docs/specs/workflows/epic-wave-model.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001, OU-002, OU-003, OU-004]
    recommended_order: 3
    issue_policy: epic
    result: {}
  - ou_id: OU-006
    target_spec: docs/specs/commands/case-open.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001, OU-003]
    recommended_order: 3
    issue_policy: epic
    result: {}
  - ou_id: OU-007
    target_spec: docs/specs/commands/case-auto.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: epic
    result: {}

case_open_hints:
  epic_needed: true
  decomposition: |
    OU-001（新規REQ CREATE + 新規ADR CREATE）→ OU-002/003/004（既存REQ APPEND/UPDATE、並列可能）→ OU-005/006/007（SPEC UPDATE、並列可能）
    3軸判断のヒント: OU-001〜004 は「RU群バッチ処理と複数Epic並列実行」という単一機能的主題で機能的一貫性が高い。
    REQ操作（OU-001〜004）と SPEC操作（OU-005〜007）は成果物種別が異なるため、case-open が Epic サイズ・機能的一貫性のバランスで構成を判断する。
  wave_hints:
    - wave: 1
      ous: [OU-001]
      execution: serial
      rationale: 新規REQ/ADR CREATE は後続の前提
    - wave: 2
      ous: [OU-002, OU-003, OU-004]
      execution: parallel
      rationale: L0（独立）・REQ-0138/0132/0114 は異なるファイル更新
    - wave: 3
      ous: [OU-005, OU-006, OU-007]
      execution: parallel
      rationale: L0（独立）・異なる SPEC ファイル更新。ただし OU-001〜004 の確定後
```

# summary

本ドラフトは AgentDevFlow の「RU群バッチ処理と複数 execution_unit 並列実行」要件を定義する。新規REQ（REQ-0148）24要件行、REQ-0138/0132 APPEND、REQ-0114-088 破壊的 UPDATE、新規ADR（ADR-0129）、3 SPEC UPDATE を含む。Oracle 助言（High 確信度）に基づき、case-open の Issue 構成計画責務化は ADR 対象外（command 動作仕様）、複数 execution_unit 並列実行 + 複数 SSoT 並立を新規 ADR として記録する。
