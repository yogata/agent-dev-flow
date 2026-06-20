---
draft_type: req_draft
topic_slug: case-auto-parallel-wave-execution
status: saved
created_at: "2026-06-20T00:00:00+09:00"
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: >
  case-auto の子Issue実行モデルを順次専用からWave内並列対応に変更する。
  case-auto は Wave table の「実行方法」列に基づき、「並列」指定の ready 子Issue
  を最大5件まで同時に case-run に並行委譲する。「直列」指定は1件ずつ委譲する。
  case-run の1 Issue/call 制約（REQ-0130-010）は維持し、薄いオーケストレーター
  原則を保つ。安全性は case-run worktree 隔離（REQ-0137 対象外）と Epic Issue
  body 単一書き手制約で担保する。SC-007 を並列選択ロジック対応に改訂し、旧
  Epic Orchestrator Contract セクションは歴史化する。新規ADRが実行モデル
  変更の決定根拠を記録する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >
      case-auto は Wave table の「実行方法」列に基づき子Issue を選択し case-run
      に委譲する。「並列」指定の ready 子Issue は最大5件まで同時に running に
      遷移させ case-run に並行委譲する。「直列」指定の子Issue および依存前提が
      未達の子Issue は1件ずつ実行する。Wave全体の一括実行を case-run に委譲
      しない（case-run は1 Issue/call維持・REQ-0130-010）。G15 をこの内容に
      改訂する。
  - id: AG-002
    content: >
      並列実行の場合、case-auto は全 case-run の完了を待ってから結果を確認し、
      完了した子Issue に対して case-close 相当処理を順次実行する。部分失敗時
      （1件以上が blocked/failed）も他の並列実行中Issueは継続し、全件完了後に
      成功・失敗それぞれの子Issue一覧を報告する。正常完了した子Issue のみ
      case-close 対象とする。
  - id: AG-003
    content: >
      同一Wave内の全 case-run の完了（成功・blocked・failed のいずれか）を待って
      から次Waveの ready 判定に進む。前提Issue が blocked/failed となった場合、
      当該Issue に依存する後続Waveの子Issue は pending のまま選択対象外とする
      （skipped 状態は採用しない・REQ-0106-030 準拠）。
  - id: AG-004
    content: >
      Epic Issue 本文（ステータス追跡テーブル）の更新は case-auto 単一プロセス
      のみが行う。並列 case-run は Epic Issue 本文を更新しない。GitHub Issue
      body は last-write-wins のため、この制約によりステータステーブルの
      競合破損を防ぐ。
  - id: AG-005
    content: >
      case-open は技術的依存関係分析に基づき Wave テーブルの「実行方法」列
      （並列/直列）を生成する。依存レベル L0（完全独立）・L1（Specs共有）は
      「並列」、L2（ファイル衝突）・L3（明示的依存）は「直列」とする判定は
      workflow-contracts.md Wave Scheduling セクションに既存の依存レベル定義
      に基づく。
  - id: AG-006
    content: >
      SC-007（workflow-contracts.md「case-auto 子Issue選択・永続状態」）を並列
      選択ロジック対応に改訂し、唯一の権威実行モデルとする。旧 Epic Orchestrator
      Contract セクション（L431-477）は、その実行メカニズム（親エージェント
      subagent 起動）が新モデル（case-run 委譲）と矛盾するため superseded/
      historical 扱いに格下げする。Wave Scheduling セクション（L479-505、依存
      レベル L0-L3）は維持する。歴史注記 L540 を改訂する。
  - id: AG-007
    content: >
      新規ADR「case-auto Wave 内並列子Issue実行モデル」を作成する。順次専用
      ポリシー（SC-007 L540）の reversal、並行性の導入、REQ-0137 を安全性
      enabler として引用し、3モデル遷移（旧Epic Orchestrator → 順次SC-007 →
      並列委譲）の決定根拠を記録する。relates-to ADR-0109（SSoT維持）、
      ADR-0114（委譲モデル維持・§5 orchestration agentdev残存）。

artifact_actions:
  - id: ACT-ADR-001
    artifact: adr
    operation: create
    target: new:case-auto-parallel-wave-execution
    source_items: [AG-007]
    content: |
      # ADR-0115: case-auto Wave 内並列子Issue実行モデル

      ## 背景

      AgentDevFlow の case-auto は、子Issue単位オーケストレーションモデル（SC-007）において子Issue を1件ずつ順次選択し case-run に委譲する設計だった（REQ-0114-045, G15）。この順次モデルは、かつて存在した Epic Orchestrator Contract（親エージェントによる Wave 一括実行）を置き換えるものとして導入された。

      しかし、以下の状況変化により順次専用ポリシーを見直す必要が生じた:

      1. case-run worktree 隔離の確立: case-run は専用 worktree + branch で index が独立しており、並行実行の構造的安全性が保証されている（REQ-0137 対象外明記）。
      2. 並列実行安全 git 操作規律の整備: REQ-0137 により、共有作業ツリーでの明示パスステージ・コミット規律が確立され、case-close の逐次実行が並行セッションと同等の安全性を持つ。
      3. Wave table「実行方法」列の存在: case-open は既に技術的依存関係に基づき Wave table に各子Issue の実行方法（並列/直列）を記録している。
      4. REQ-0106-003 との整合: 「複数Caseの並列実行は依存関係を分析し、安全なWave単位で実行すること」が既に要件化されており、順次専用ポリシーはこの要件に対して過度に制限的だった。

      ## 決定

      case-auto は Wave table の「実行方法」列に基づき、同一Wave 内の「並列」指定の ready 子Issue を最大5件まで同時に case-run に並行委譲する。「直列」指定の子Issue は1件ずつ委譲する。case-run の1 Issue/call 制約（REQ-0130-010）は維持する。

      ### 安全性境界

      - Epic Issue 本文の単一書き手: Epic Issue のステータス追跡テーブルは case-auto 単一プロセスのみが更新する。並列 case-run は Epic Issue 本文を更新しない。
      - case-close の逐次実行: 並列 case-run 完了後、case-close は子Issue ごとに逐次実行する（REQ-0114-050）。REQ-0137-002/003 の明示パス commit 規律に従う。
      - Wave 進行の直列化: 同一Wave 内の全 case-run の完了を待ってから次Waveに進む。Wave 間は直列実行する。

      ### 部分失敗の扱い

      並列実行中の1件以上が blocked/failed の場合でも、他の並列実行中Issueは継続する。全件完了後に成功・失敗それぞれの子Issue一覧を報告する。前提Issue が blocked/failed となった場合、依存する後続Waveの子Issue は pending のまま選択対象外とする（skipped 状態は採用しない・REQ-0106-030 準拠）。

      ## 代替案

      1. 順次実行の維持: スループット向上機会を放棄することになるため不採用。
      2. case-run の複数Issue処理化: REQ-0130-010 の全面改修が必要で、case-run / case-close / worktree 管理の大規模変更を伴う。薄いオーケストレーター原則と ADR-0114 委譲モデルを維持する本案に対し影響範囲が过大のため不採用。
      3. 親エージェント subagent 一括起動（旧 Epic Orchestrator Contract 回帰）: case-run 委譲モデル（ADR-0114）と矛盾するため不採用。

      ## 結果・影響

      - case-auto の子Issue実行スループットが向上する（同一Wave内の独立Issueが並列実行される）。
      - SC-007（workflow-contracts.md）が並列選択ロジック対応に改訂される。
      - 旧 Epic Orchestrator Contract セクションは歴史化される。
      - G15（case-auto.md）が「実行方法列に基づく選択（並列最大5/直列1）」に改訂される。
      - REQ-0137 が本変更の安全性 enabler として機能する。

      ## 関連する決定

      - ADR-0109（Epic Issue 本文を実行順序 SSoT）: 本判断は SSoT 原則を維持する。case-auto は引き続き Epic Issue 本文から Wave 構成を読み取る。
      - ADR-0114（case-run 実行責務の外部実行バックエンド委譲）: 本判断は委譲モデルを維持する。case-run は1 Issue/call のまま。§5「orchestration は agentdev 側に残る」に基づく。
      - REQ-0137（並列実行安全 git 操作規律）: 本変更の安全性 enabler。対象外条項が case-run worktree 隔離の構造的安全性を明示する。

  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-0114.md
    target_area: 要件テーブル
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      ## REQ-0114 要件改訂（UPDATE）

      ### 改訂対象行（既存行の置き換え）

      REQ-0114-045（改訂）:
      `case-auto` は Epic Issue から子Issue一覧・状態・Wave table を読み取り、Wave table の「実行方法」列に基づき実行可能な子Issue を選択して `case-run` に渡すこと。「並列」指定の子Issue は最大5件まで同時に渡すこと。「直列」指定の子Issue は1件ずつ渡すこと。Wave全体の一括実行を `case-run` に委ねないこと

      REQ-0114-046（改訂）:
      `case-auto` は並列実行の場合、全 `case-run` の完了を待ってから永続状態から子Issue の完了・失敗・停止結果を確認し、完了した子Issue に対して `case-close` 相当処理を順次実行すること。順次実行の場合、`case-run` の完了後に結果を確認すること

      REQ-0114-047（改訂）:
      `case-auto` は並列実行中に1件以上が blocked/failed を報告した場合でも、他の並列実行中Issueの実行を継続すること。全件完了後に成功・失敗それぞれの子Issue一覧を報告すること。正常完了した子Issue のみ `case-close` 対象とし、blocked/failed された子Issue の `case-close` は回避すること

      ### 新規行

      REQ-0114-079（新規）:
      `case-auto` は同一Wave内の全 `case-run` の完了（成功・blocked・failed のいずれか）を待ってから、次Waveの ready 判定に進むこと

      REQ-0114-080（新規）:
      `case-auto` は前提Issue が blocked/failed となった場合、当該Issue に依存する後続Waveの子Issue を `pending` のまま選択対象外とすること（`skipped` 状態は採用しない・REQ-0106-030 準拠）

      REQ-0114-081（新規）:
      Epic Issue 本文（ステータス追跡テーブル）の更新は `case-auto` のみが行うこと。並列 `case-run` は Epic Issue 本文を更新しないこと

      ### 適用範囲改訂

      「対象」に以下を追加:
      - Wave table「実行方法」列に基づく子Issue 並列選択・委譲
      - 並列 case-run 完了待機・部分失敗時の他Issue継続
      - Wave 間直列進行・前提失敗時の依存Issue pending維持
      - Epic Issue 本文の単一書き手制約

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-0132.md
    target_area: 要件テーブル
    source_items: [AG-005]
    content: |
      ## REQ-0132 要件改訂（UPDATE）

      ### 新規行

      REQ-0132-014（新規）:
      `case-open` は Epic Issue の Wave テーブルに各子Issue の実行方法（並列/直列）を技術的依存関係に基づいて明記すること

      ### 適用範囲改訂

      「対象」に以下を追加:
      - Wave テーブル「実行方法」列の技術的依存関係に基づく生成

  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/workflow-contracts.md
    target_area: 子Issue単位オーケストレーションモデル + Epic Orchestrator Contract
    source_items: [AG-006]
    content: |
      ## workflow-contracts.md SPEC改訂（UPDATE）

      ### SC-007 改訂（L604-636「case-auto 子Issue選択・永続状態」）

      子Issue選択ロジックを以下に改訂:

      **子Issue選択ロジック（並列対応）**:
      1. Wave table の「実行方法」列を確認する
      2. status が `ready` の子 Issue のうち「並列」指定のものを最大5件まで選択する
      3. 「並列」指定の ready Issue が5件未満の場合、「直列」指定の ready Issue があれば1件追加選択する（「直列」は1件ずつ実行）
      4. `ready` がない場合、依存（前 Wave 含む）が満たされた `pending` Issue を `ready` に遷移させて選択対象に加える。ただし前提Issue が blocked/failed の場合は `pending` のまま選択対象外とする
      5. 選択した全 Issue を `running` に遷移させる（Epic Issue ステータス追跡テーブルを case-auto が更新）
      6. 各 Issue を case-run に委譲する（「並列」指定は同時に、「直列」指定は1件ずつ）
      7. 全 case-run 完了後、永続状態を再読込し各 Issue の結果を確認する

      **case-run への最小入力**: Issue 番号・要件docパス（該当 OU の target_req 情報を含む）

      **Epic Issue 本文の単一書き手制約**: Epic Issue 本文（ステータス追跡テーブル）の更新は case-auto のみが行う。並列 case-run は Epic Issue 本文を更新しない（last-write-wins 競合防止）。

      ### Epic Orchestrator Contract セクション格下げ（L431-477）

      L431 ヘッダ直後に以下の注記を追加:
      > **注記**: 本セクションの実行メカニズム（親エージェント subagent 起動・specs 直列更新・Wave 間 rebase）は、case-run 委譲モデル（ADR-0114）および子Issue単位オーケストレーションモデル（SC-007）に置き換えられた。Wave 内並列実行は SC-007（改訂版）および ADR-0115 に基づき case-auto が case-run を並行委譲する形で維持される。本セクションは Wave 失敗時後続制御の概念参照として残置する。

      ### 歴史注記 L540 改訂

      旧: 「従来の Epic Orchestrator Contract（Wave一括実行）は本モデルに置き換えられる。」
      新: 「従来の Epic Orchestrator Contract（親エージェント subagent 一括起動）は case-run 委譲モデルに置き換えられた。Wave 内並列実行は case-auto が case-run を並行委譲する形で維持される（ADR-0115）。」

      ### Wave Scheduling セクション（L479-505）: 維持

      依存レベル L0-L3 定義および Wave 構成ルールは現行維持。これらは case-open の Wave table 生成および case-auto の並列判定の基準として引き続き参照される。

conflict_resolutions:
  - id: CR-001
    conflict: >
      G15「子Issue を1件ずつ選択し case-run に委譲する」および REQ-0114-045
      「実行可能な1子Issue を選択して case-run に渡す」が並列実行と直接競合する。
    resolution: >
      G15・REQ-0114-045 を「実行方法列に基づく選択（並列最大5/直列1）」に改訂。
      並列実行は case-run 1 Issue/call 制約を維持したまま case-auto が複数
      case-run を並行起動する形で実現する。case-run への Wave全体一括実行委譲は
      引き続き禁止。
  - id: CR-002
    conflict: >
      SC-007（順次選択モデル）と Epic Orchestrator Contract（Wave並列実行）
      の2つの実行モデルセクションが共存し、L540 で「置き換えられる」と注記
     されている状態で並列実行を再導入するとどちらが権威か不明確になる。
    resolution: >
      SC-007 を並列選択ロジック対応に改訂し唯一の権威実行モデルとする。
      Epic Orchestrator Contract セクションは superseded/historical 扱いに
      格下げし、Wave 失敗時後続制御の概念参照として残置する。L540 歴史注記を
      並列委譲モデル維持の旨に改訂する。
  - id: CR-003
    conflict: >
      並列 case-run が同時に Epic Issue 本文を更新すると GitHub Issue body の
      last-write-wins でステータステーブルが破損する可能性がある。
    resolution: >
      Epic Issue 本文の更新を case-auto 単一プロセスに限定する（REQ-0114-081
      新規）。並列 case-run は Epic Issue 本文を更新せず、自身の子Issue / PR
      のみを更新する。case-auto は並列実行前にバッチで running 遷移を記録し、
      全完了後にバッチで結果を記録する。

operation_units:
  - ou_id: OU-001
    target_req: REQ-0114
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    target_req: REQ-0132
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-003
    target_spec: docs/specs/workflow-contracts.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}

case_open_hints:
  epic_needed: false
  decomposition:
    - OU-001 と OU-002 は異種REQ変更（case-auto 並列実行 / case-open Wave table 明示化）で独立実装可能。Wave 1 で並列実行候補。
    - OU-003（SPEC）は OU-001 の要件確定後に SC-007 改訂内容が確定するため Wave 2。
  wave_hints:
    - wave: 1
      ous: [OU-001, OU-002]
      execution: 並列（異種REQ変更・ファイル衝突なし）
    - wave: 2
      ous: [OU-003]
      execution: 直列（OU-001 の要件改訂に依存）
```

## 実装詳細（artifact_actions 外・case-run 実装対象）

> 以下は req-save/spec-save の保存対象外であり、case-run での実装作業として扱う。
> 完了条件チェックボックスの要約として case-open Issue 本文に含めることを想定。

### case-auto.md 改訂

**G15 改訂**:
- 旧: `case-auto は子Issue を1件ずつ選択し case-run に委譲する。Wave全体の一括実行を case-run に委譲しない（REQ-0114-045, REQ-0130-010）`
- 新: `case-auto は Wave table の「実行方法」列に基づき子Issue を選択し case-run に委譲する。「並列」指定の ready 子Issue は最大5件まで同時に委譲する。「直列」指定は1件ずつ委譲する。Wave全体の一括実行を case-run に委譲しない（REQ-0114-045, REQ-0130-010）`

**Step 4-1 改訂**（子Issue単位オーケストレーション）:
1. **子Issue選択**: Wave table の「実行方法」列を確認し、status が `ready` の子Issue を選択する。「並列」指定は最大5件まで同時選択。「直列」指定は1件。`ready` がない場合、依存が満たされた `pending` Issue を `ready` に遷移させて選択する。ただし前提Issue が blocked/failed の場合は `pending` のまま選択対象外。
2. **running 遷移**: 選択した全子Issue を `running` に遷移させる（Epic Issue ステータス追跡テーブルを case-auto が更新）。
3. **case-run 並行委譲**: 選択した各子Issue 番号 + 要件docパスを case-run 相当処理に渡す。「並列」指定は同時に起動。「直列」指定は1件完了後に次を起動。case-run は1 Issue のみを処理する（REQ-0130-010）。
4. **全完了待機**: 全 case-run の完了を待つ。
5. **結果確認**: 永続状態を再読込し各子Issue の結果（completed(pr) / blocked / failed）を確認する。
6. **case-close（子Issue単位・逐次）**: 完了した子Issue を Issue番号昇順で case-close 相当処理に渡す。blocked/failed の子Issue は case-close 対象外。
7. **次Wave判定**: 同一Waveの全子Issue の結果が出揃ったら、次Waveの ready 判定に進む。Step 1 に戻る。

### ADR README / Decision Map 更理

- 新規ADR（ADR-0115）を accepted ADR 一覧に追加
- Decision Map に ADR-0115 → relates-to ADR-0109, ADR-0114 を追加
- Related REQ 表に ADR-0115 → REQ-0106, REQ-0114 を追加
- REQ-0137 の関連 ADR に ADR-0115 を追加

### Oracle 推定事項（実装確認項目）

- **worktree 鮮度**: Wave-2 の case-run が Wave-1 merge 後の origin/main から worktree を新規作成すること。case-run の worktree 作成時 fetch/rebase を実装で確認すること。
- **外部実行バックエンド並行負荷**: 5並列 driver subagent（OMO 等）の同時実行可能性は運用依存。最大並列数 5 は運用で調整可能と注記すること。

# summary

case-auto の子Issue実行モデルを順次専用からWave内並列対応に変更する。Wave table「実行方法」列に基づき「並列」指定の子Issueを最大5件まで同時にcase-runに並行委譲する。case-run 1 Issue/call 制約・薄いオーケストレーター原則は維持。安全性は worktree隔離（REQ-0137）とEpic Issue body単一書き手制約で担保。SC-007改訂・Epic Orchestrator Contract歴史化・新規ADR作成を含む。
