---
draft_type: req_draft
topic_slug: maximal-parallel-execution
status: saved
created_at: 2026-06-26T00:00:00+09:00
source_rus:
  - RU-20260625-01
---

# draft-data

```yaml
work_type: maintenance

summary: >-
  AgentDevFlow 横断的並列実行方針を再整理し、depends_on を必須依存専用に限定する。
  弱依存/関連依存/推奨順/ファイル衝突を直列化要因から除外し、execution_unit/Wave 単位で最大限並列実行する。
  REQ-0138/0148 の depends_on 定義を UPDATE、REQ-0114 の case-auto 逐次処理レガシーを UPDATE、
  REQ-0131 に case-close 準並列化方針を APPEND、epic-wave-model SPEC の旧 Wave スケジューリングテーブルを UPDATE、
  case-close SPEC を UPDATE、ADR-0129 を UPDATE。
  accepted SPEC（epic-wave-model.md 連結成分セクション）は既に新モデル移行済みであり、本 RU は REQ/command/SPEC の整合化作業。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >-
      depends_on は必須依存のみを記録する。必須依存とは、インターフェース契約、データモデル、schema、公開API、
      検証不能な前提成果物への依存である。弱依存、関連依存、推奨実行順、同一ファイル変更可能性、
      同一SPECセクション変更可能性、同一機能領域、クリティカルパス優先度は depends_on に含めず、
      推奨順は recommended_order に記録する。depends_on は case-open が execution_unit 構成
      （連結成分判定）に使用する必須依存情報であり、最終 Issue 構成は case-open が決定する。
      case-open は必須依存グラフの連結成分ベースで execution_unit を生成し、
      単独根を Standard、複数 OU 連結成分を Epic 候補とする。無関係 OU 集約を禁止する。
      子 Issue 本文案作成/検査/作成は最大5並列、Epic 本文更新/Wave 配置/追跡テーブルは直列集約とする。
  - id: AG-002
    content: >-
      case-auto は必須依存のない execution_unit を全て並列実行する。
      execution_unit 並列にグローバル上限を適用しない。維持上限は case-run Wave内5件のみ。
      blocked/failed のみ停止条件とし、ファイル衝突だけで直列化しない。
      case-auto は Issue 階層決定、子 Issue 選択、Epic 化判定を持たず、
      これらは case-open/case-run/case-close へ委譲する。
      recommended_order は処理順序のヒントであり、直列化ゲートではない。
  - id: AG-003
    content: >-
      case-run は現行維持とする。単一 Issue または単一 Wave を処理し、
      Epic 全体複数 Wave の一括処理は行わない。Wave 境界処理は case-close の責務。
      case-run は execution_unit 間並列判定を行わない。
  - id: AG-004
    content: >-
      case-close は Epic Wave クローズ処理を準並列化する。並列実行可能な処理と直列集約が必要な処理を分離する。
      rebase による機械的コンフリクト解消は停止条件外とし（REQ-0151-006 Level1）、
      解消不能なコンフリクトは実装変更を行わず case-auto へエスカレーションする
      （REQ-0131-025、REQ-0151-002 Level2/3）。
  - id: AG-005
    content: >-
      command と SPEC の間で、OU 逐次処理、独立 OU 最大5件制限、子 Issue 順次作成、
      子 Issue 順次クローズに関する古い記述が残存しないこと。
      epic-wave-model.md の旧 Wave スケジューリングテーブル（L2→Wave分離、L3→順次実行）を
      新モデル（L2 並列許容、必須依存のみ直列化要因）に更新する。
      case-close SPEC の順次実行記述を準並列化に更新する。
  - id: AG-006
    content: >-
      ADR-0129（複数 execution_unit 並列実行モデル）を UPDATE し、depends_on の意味を
      「技術的依存＋機能的依存（ヒント）」から「必須依存のみ（直列化ゲート）」に再定義する旨を記録する。
      新規 ADR は作成しない（ADR-0129 スコープ内）。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-0138.md
    source_items: [AG-001]
    content: |-
      REQ-0138-019 (UPDATE):
      req-define は OU の depends_on に必須依存のみを記録すること。必須依存とは、インターフェース契約、データモデル、schema、公開API、検証不能な前提成果物への依存である。弱依存、関連依存、推奨実行順、同一ファイル変更可能性、同一SPECセクション変更可能性、同一機能領域、クリティカルパス優先度は depends_on に含めないこと。推奨実行順は recommended_order に記録すること

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-0148.md
    source_items: [AG-001]
    content: |-
      REQ-0148-002 (UPDATE):
      req-define は OU の depends_on に必須依存のみを記録すること。必須依存とは、インターフェース契約、データモデル、schema、公開API、検証不能な前提成果物への依存である。弱依存、関連依存、推奨実行順、同一ファイル変更可能性、同一SPECセクション変更可能性、同一機能領域、クリティカルパス優先度は depends_on に含めないこと。推奨実行順は recommended_order に記録すること。depends_on は case-open が execution_unit 構成（連結成分判定）に使用する必須依存情報であり、最終 Issue 構成は case-open が決定する

  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-0114.md
    source_items: [AG-002]
    content: |-
      REQ-0114-053 (UPDATE):
      case-auto は必須依存のない execution_unit を全て並列委譲すること。complete-then-next の逐次処理を行わないこと。独立OUの並列件数上限（最大5件）を適用しないこと

      REQ-0114-064 (UPDATE):
      case-auto は depends_on（必須依存のみ）に基づいて直列化要因を判定すること。recommended_order は処理順序のヒントであり、直列化ゲートではないこと

      REQ-0114-087 (UPDATE):
      case-auto の execution_unit 並列委譲に件数上限を適用しないこと。case-run の Wave内子Issue並列上限（最大5件、REQ-0130-026）は維持すること

  - id: ACT-REQ-004
    artifact: req
    operation: append
    target: docs/requirements/REQ-0131.md
    source_items: [AG-004]
    content: |-
      REQ-0131-027 (APPEND):
      case-close は Epic Wave クローズ処理を準並列化すること。並列実行可能な処理と直列集約が必要な処理を分離すること。rebase による機械的コンフリクト解消は停止条件外とすること（REQ-0151-006 Level1）。rebase で解消不能なコンフリクトは実装変更を行わず case-auto へエスカレーションすること（REQ-0131-025、REQ-0151-002 Level2/3）

  - id: ACT-ADR-001
    artifact: adr
    operation: update
    target: docs/adr/ADR-0129.md
    source_items: [AG-006]
    content: |-
      ADR-0129 UPDATE — depends_on 意味の再定義:

      Decision 追記: depends_on は必須依存（インターフェース契約、データモデル、schema、公開API、検証不能な前提成果物）のみを記録する。弱依存、関連依存、推奨実行順、同一ファイル変更可能性、同一SPECセクション変更可能性、同一機能領域、クリティカルパス優先度は depends_on から除外し、推奨順は recommended_order に記録する。

      従来の「技術的依存＋機能的依存（ヒント）」定義（REQ-0138-019、REQ-0148-002、2026-06-23/24確定）を「必須依存のみ（直列化ゲート）」に再定義する（RU-20260625-01、チャット合意 session:2026-06-25-maximal-parallel-execution）。

      理由: accepted SPEC（epic-wave-model.md 連結成分セクション L185-238）は既に新モデル移行済み。本変更は SPEC 整合を REQ/command へ波及させる作業。

  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/workflows/epic-wave-model.md
    target_area: '## Wave スケジューリング（多重Issueモード）'
    source_items: [AG-005]
    content: |-
      ## Wave スケジューリング（多重Issueモード）

      ### 依存関係レベル（参考情報）

      依存関係レベル（L0-L3）は Wave 構成の参考情報であり、直列化ゲートではない（「連結成分ベース execution_unit 構成モデル」参照）。直列化要因は必須依存のみ。

      | レベル | 名称 | 定義 | 直列化要因 |
      |---|---|---|---|
      | L0 | 完全独立 | 共通ファイルなし、specs更新なし、他Issueへの参照なし | 否 |
      | L1 | Specs共有 | 複数featureが同じspecsセクションを更新する可能性あり | 否 |
      | L2 | ファイル衝突 | 変更予定ファイルに重複あり | 否（rebase で解消、ADR-0132 Level 1） |
      | L3 | 明示的依存 | Issue本文に明示的記述あり | 必須依存のみ直列化要因 |

      ### Wave 構成ルール

      - 直列化要因は必須依存のみ。必須依存のない子Issue は同一Wave で並列実行する
      - L2（ファイル衝突）は Wave 分離の理由としない。並列実行を許容し、コンフリクトは rebase で機械的解消する（ADR-0132 Level 1、REQ-0151-006）
      - 最大5 Issues / 呼び出し（case-run Wave内並列上限、REQ-0130-026）。execution_unit 間並列にグローバル上限は適用しない
      - specs更新は親エージェントのみ（直列、Issue番号昇順）

  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/case-close.md
    target_area: '### Epic Wave クローズ（REQ-0131-021/022/023）'
    source_items: [AG-004, AG-005]
    content: |-
      ### Epic Wave クローズ（REQ-0131-021/022/023/027）

      - Step E1: Epic Issue 本文読込（ステータス追跡テーブル（新4列/旧4列形式）を解析）
      - Step E2: 現在 Wave 特定（`running` ステータスの子Issue が属する Wave）。`running` がない場合は Wave 番号昇順で最も若い未完了 Wave
      - Step E3: PR作成済み子Issue 特定（現在 Wave 内の `running` 子Issue）
      - Step E4: 各子Issue のクローズ処理を準並列化する（REQ-0131-027）
        - 並列実行: PR情報取得、PR変更ファイル取得、Issue本文読取、PR本文読取、完了条件チェック事前評価、capture候補抽出、SPEC確定候補確認、worktree/branch削除前チェック
        - 直列集約: squash merge、main pull&hash確認、Epic本文ステータス追跡テーブル更新、.agentdev永続化commit&push、branch/worktree最終削除
        - rebase による機械的コンフリクト解消は停止条件外（REQ-0151-006 Level1）。解消不能時は case-auto へエスカレーション（REQ-0131-025、REQ-0151-002 Level2/3）
      - Step E5: Epic status table 更新（単一書き手: case-close、ADR-0125）（`running` → `completed ([PR#N](URL))` に更新）
      - Step E6: 最終 Wave 判定（全子Issue completed なら Epic クローズ（Step E6a））。それ以外は残 Wave 通知（Step E6b）

spec_artifacts_consumed: true

conflict_resolutions:
  - id: CR-001
    conflict: >-
      REQ-0138-019（2026-06-23確定）と REQ-0148-002（2026-06-24確定）は
      depends_on = 技術的依存＋機能的依存（ヒント、確定DAGではない）と定義。
      RU-20260625-01 は depends_on = 必須依存のみ（直列化ゲート）を要求。
      後方互換性のない意味変更。
    resolution: >-
      両REQを UPDATE し、depends_on = 必須依存のみに統一。
      根拠: accepted SPEC（epic-wave-model.md L185-238 連結成分セクション）は既に新モデル移行済み。
      RU 明示入力ファイルがユーザーの確定意思を示す（evidence-first）。
      RU は SPEC 整合を REQ/command へ波及させる作業。

  - id: CR-002
    conflict: >-
      case-close 準並列化の個別リスト（並列対象8項目/直列集約5項目）を
      REQ 要件行化するか SPEC 配置するか。
    resolution: >-
      SPEC 分離を採用。REQ-0131 には方針レベル（準並列化する、並列対象と直列集約対象を分離）
      のみ APPEND（REQ-0131-027）。個別リストは case-close SPEC
      （docs/specs/commands/case-close.md Step E4）へ spec-update。
      根拠: agentdev-req-analysis REQ/SPEC 境界判定基準
      （個別項目リスト = 内部処理手順 = SPEC 配置）。

operation_units:
  - ou_id: OU-001
    source_ru: RU-20260625-01
    target_req: REQ-0138
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-002
    source_ru: RU-20260625-01
    target_req: REQ-0148
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}

  - ou_id: OU-003
    source_ru: RU-20260625-01
    target_req: REQ-0114
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}

  - ou_id: OU-004
    source_ru: RU-20260625-01
    target_req: REQ-0131
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |-
      REQ-0138-019 と REQ-0148-002 の要件行を確認する。depends_on が必須依存のみを記録し、
      弱依存/関連依存/推奨順/ファイル衝突/同一SPEC/同一機能領域/クリティカルパス優先度が除外されているか検証する。
      必須依存の定義（インターフェース契約/データモデル/schema/公開API/検証不能な前提成果物）と
      推奨順の recommended_order 分離が明記されているか確認する。
    pass_criteria: >-
      両REQの depends_on 定義が「必須依存のみ」に一致し、除外リストが明記され、
      推奨順の recommended_order 分離が記述されていること。
    on_failure: |-
      fix-and-reverify。要件行の記述が基準に合致するまで修正して再検証する。

  - id: TS-002
    target_item: AG-002
    verification: |-
      REQ-0114-053/064/087 の要件行を確認する。case-auto が必須依存のない execution_unit を
      全て並列実行し、グローバル上限なし、blocked/failedのみ停止、ファイル衝突だけで直列化しない、
      complete-then-next逐次処理なし、独立OU最大5件制限なし、recommended_orderはヒント而非ゲート、
      であるか検証する。
    pass_criteria: >-
      complete-then-next逐次処理の記述がなく、独立OU最大5件制限の記述がないこと。
      必須依存ないEU全並列・グローバル上限なし・blocked/failedのみ停止・
      ファイル衝突だけでの直列化禁止・recommended_order はヒント而非ゲートが明記されていること。
    on_failure: |-
      fix-and-reverify。要件行が基準に合致するまで修正して再検証する。

  - id: TS-003
    target_item: AG-003
    verification: |-
      REQ-0130 の要件行に変更がないことを確認する。case-run が単一Issue/単一Wave、
      Epic全体複数Wave不可、Wave境界はcase-close、execution_unit間並列判定しないことが維持されているか検証する。
    pass_criteria: >-
      REQ-0130 は本RUで UPDATE/APPEND されないこと。現行要件行が維持されていること。
    on_failure: |-
      record-in-findings。REQ-0130 に不要な変更が検出された場合、Findings に out-of-scope として記録する。
      本RU は case-run 維持が前提であり、REQ-0130 変更はスコープ外。

  - id: TS-004
    target_item: AG-004
    verification: |-
      REQ-0131 に case-close 準並列化の方針要件行（REQ-0131-027）が追加されていることを確認する。
      並列対象と直列集約対象の分離が方針レベルで記述され、rebase機械的解消は停止条件外、
      解消不能のみエスカレーションが明記されているか検証する。
      個別リスト（並列8項目/直列5項目）が case-close SPEC（ACT-SPEC-002）に分離されているか確認する。
    pass_criteria: >-
      REQ-0131-027 が追加され、方針レベルの準並列化・分離・rebase停止条件外・エスカレーションが
      明記されていること。個別リストは SPEC候補として分離され、REQ 要件行に混入されていないこと。
    on_failure: |-
      fix-and-reverify。方針要件行とSPEC分離が基準に合致するまで修正して再検証する。

  - id: TS-005
    target_item: AG-005
    verification: |-
      epic-wave-model.md の旧Waveスケジューリングテーブル（L119-138）が更新され、
      L2→Wave分離の記述がなく、L2並列許容・必須依存のみ直列化要因が明記されているか確認する。
      case-close SPEC の順次実行記述が準並列化に更新されているか確認する。
      内部矛盾（同ファイル内 L127 旧テーブル vs L234 新モデル）が解消されているか検証する。
    pass_criteria: >-
      epic-wave-model.md にL2→Wave分離の記述がないこと。L2並列許容が明記されていること。
      case-close SPEC に順次実行の記述がなく、準並列化が明記されていること。
    on_failure: |-
      fix-and-reverify。古い記述が残存する場合、修正して再検証する。

  - id: TS-006
    target_item: AG-006
    verification: |-
      ADR-0129 に depends_on 意味再定義の追記があることを確認する。
      新規ADRが作成されていないことを確認する（ADR-0129 UPDATE のみ）。
    pass_criteria: >-
      ADR-0129 に必須依存のみ再定義の記録があること。新規ADRファイルが作成されていないこと。
    on_failure: |-
      fix-and-reverify。ADR-0129 の記録が基準に合致するまで修正して再検証する。

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints: []
```

# summary

RU-20260625-01（maximal-parallel-execution）の要件定義ドラフト。

AgentDevFlow 5 command 横断の並列実行方針を再整理し、depends_on を必須依存専用に限定する。
核心原則は「必須依存のみを直列化要因とし、それ以外は最大限並列実行」。

accepted SPEC（epic-wave-model.md 連結成分セクション L185-238、case-auto SPEC L103-109）は
既に新モデル移行済みであり、REQ-0138-019/REQ-0148-002 と旧 command 本文が stale だった。
本 RU は SPEC 整合を REQ/command へ波及させる整合化作業。

変更対象: REQ-0138(-019 UPDATE)、REQ-0148(-002 UPDATE)、REQ-0114(-053/-064/-087 UPDATE)、
REQ-0131(-027 APPEND)、ADR-0129(UPDATE)、epic-wave-model.md(Waveスケジューリング UPDATE)、
case-close SPEC(Epic Waveクローズ UPDATE)。

4 REQ operation_units は全て depends_on 空（必須依存なし、並列可能）。
case-open が連結成分ベースで最終 Issue 構成を決定する。
