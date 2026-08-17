---
draft_type: req_draft
topic_slug: backlog-auto-orchestration
status: saved
created_at: 2026-08-17T21:43:57+09:00
source_rus: [RU-0001]
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: |-
  backlog 整理サイクル（inspect-docs、learning / intake / inspect の3昇格系統、backlog-review による統合と RU 生成）を1回の公開コマンド起動 `/agentdev/backlog-auto` で一巡させる、既存コマンドを置換しない薄いオーケストレータを追加する。オーケストレータは工程間の順序制御、競合処理の直列化、fan-in 判定、停止条件の伝播のみを所有し、子ワークフロー内部のロジックは既存 Workflow Skill が正規の処理主体として担う。新規コマンド級 REQ（REQ-041、採番は req-save が既存最大番号+1で検証割当）として CREATE する。REQ-005 への APPEND は同 REQ が個別 command の実行契約を適用範囲対象外と宣言しているため不採用。REQ-034（case-auto）への APPEND は要件行数と関心分類の SPLIT シグナル合計が2に達するため不採用。Decision は不要（DEC-010 の責務3層パターンと REQ-034 の orchestration stage パターンの再適用であり、可逆的なコマンド追加であるため）。scale は standard と判定（要件行16行、単一REQ、既存ファイル修正は workflow-contracts.md と README 系のみで、残りは新規付属ファイル。子ロジックを再実装しないため実装は委譲定義が中心）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |-
      `/agentdev/backlog-auto` を公開コマンドとして追加し、対応する workflow 実装本体を専用の Workflow Skill として追加する。既存5コマンド（inspect-docs、learning-promote、intake-promote、inspect-promote、backlog-review）は置換せず、標準フローを置き換えない追加入口として位置づける。オーケストレータは工程間の順序制御のみを所有し、子ワークフロー内部の分類、評価、昇格、RU 生成ロジックを保持しない。各子 Workflow Skill を正規の処理主体として利用する。
  - id: AG-002
    content: |-
      実行順序は inspect-docs → 昇格3系統（learning-promote、intake-promote、inspect-promote）→ backlog-review とする。inspect-docs の正常終了後に昇格3系統を開始し、正常終了する前に開始しない。昇格3系統すべてが正常完了または「対象なし」で終了した場合のみ backlog-review を開始する。
  - id: AG-003
    content: |-
      昇格3系統は相互に先行依存関係を設けず、安全に並行可能な処理は並行実行する。Git 同期、commit、push、共有成果物への競合書き込み、ユーザー対話など排他性が必要な処理は安全に直列化する。複数系統が判断待ちとなった場合はユーザー対話のみを安全に直列化し、どの子ワークフローに対する判断か識別できるようにする。各子ワークフローの既存 HITL 境界、安全境界、停止条件、自動昇格 opt-in を維持する。
  - id: AG-004
    content: |-
      1系統でも blocked、failed、未完了が残る場合は backlog-review を開始せず、backlog-auto 全体を完了扱いにしない。一方で、1系統が blocked または failed になっても、独立して進行可能な他系統は継続する。inspect-docs が blocked または failed となった場合は昇格3系統および backlog-review を開始しない。昇格3系統の「対象なし」終了は正常終了として扱い、一括処理の失敗としない。昇格3系統で新規 promoted artifact が0件でも、全系統正常終了後は backlog-review を実行し、実行前から存在する promoted artifact を処理対象にできる。
  - id: AG-005
    content: |-
      中断・再実行時は子ワークフローの既存再開契約（durable state、STEP model）を利用し、完了済み工程を不必要に重複実行せず、未完了工程を完了済みと誤認しない。inspect-docs は既存契約どおり STEP model 対象外とし、実行途中で中断した場合は先頭から再実行する。通常の backlog-auto 実行から inspect-promote --auto を暗黙的に有効化しない。新コマンド追加後も既存5コマンドを従来どおり単独実行でき、各公開契約は変更しない。
  - id: AG-006
    content: |-
      次を対象外とする。子コマンドの業務ロジック再実装、learning / intake / inspect の分類基準、評価基準、昇格基準の変更、既存5コマンドの廃止、置換、単独実行契約の変更、intake-promote 自身からの backlog-review 自動起動、inspect-skills の一括処理への追加、learning-capture、intake-capture、intake-from-github の自動起動、req-define、req-save、GitHub Issue / PR 作成までの自動化、inspect-promote --auto の暗黙的有効化および新規公開オプション追加、並列化だけを目的とした複数 worktree 方式への既存ワークフロー全面再設計、並行実行数、スレッド数など内部実装パラメータの固定。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:backlog-auto-orchestration
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006]
    content: |
      # backlog 一括整理コマンド（backlog-auto）実行契約

      ## 目的

      backlog 整理サイクル（inspect-docs による文書診断、learning / intake / inspect の3昇格系統、backlog-review による統合と RU 生成）を1回の公開コマンド起動で一巡させ、蓄積された改善候補を RU 候補まで整理できる標準的な backlog 整理サイクルを提供する。

      `/agentdev/backlog-auto` は既存の個別コマンドを置換せず、既存 Workflow Skill に処理を委譲する薄いオーケストレータとして追加する。

      本 REQ は backlog-auto のコマンド級実行契約を所有する。ワークフロープロトコルと工程接続は REQ-005 が、子コマンド（inspect-docs、inspect-promote、learning-promote、intake-promote、backlog-review）の各実行責務は REQ-036〜REQ-039 が所有する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-041-001 | `/agentdev/backlog-auto` を公開コマンドとして追加し、標準フローを置き換えない追加入口として位置づけること |
      | REQ-041-002 | backlog-auto の workflow 実装本体を専用の Workflow Skill として追加すること |
      | REQ-041-003 | オーケストレータは工程間の順序制御のみを所有し、子ワークフロー内部の分類、評価、昇格、RU 生成ロジックを保持しないこと |
      | REQ-041-004 | 実行順序を inspect-docs、昇格3系統（learning-promote、intake-promote、inspect-promote）、backlog-review の順とし、inspect-docs が正常終了する前に昇格3系統を開始しないこと |
      | REQ-041-005 | 昇格3系統相互に先行依存を設けず、安全に並行可能な処理を独立して進行させること |
      | REQ-041-006 | 同一作業ツリーに対する競合する Git 操作、共有成果物への競合書き込み、ユーザー対話を直列化すること |
      | REQ-041-007 | 複数系統が判断待ちとなった場合、ユーザー対話のみを安全に直列化し、どの子ワークフローに対する判断か識別できるようにすること |
      | REQ-041-008 | 各子ワークフローの既存 HITL 境界、安全境界、停止条件、自動昇格 opt-in を維持すること |
      | REQ-041-009 | 1系統が blocked または failed となっても、独立して進行可能な他系統を停止しないこと |
      | REQ-041-010 | 昇格3系統すべてが正常完了または対象なしで終了した場合のみ backlog-review を開始すること |
      | REQ-041-011 | 1系統でも blocked、failed、未完了が残る場合、backlog-review を開始せず backlog-auto 全体を完了扱いにしないこと |
      | REQ-041-012 | inspect-docs が blocked または failed となった場合、昇格3系統および backlog-review を開始しないこと |
      | REQ-041-013 | 昇格3系統の対象なし終了を正常終了として扱い、一括処理の失敗としないこと |
      | REQ-041-014 | 昇格3系統で新規 promoted artifact が0件でも、全系統正常終了後に backlog-review を実行し、実行前から存在する promoted artifact を処理対象にできること |
      | REQ-041-015 | 中断・再実行時は子ワークフローの既存再開契約を利用し、完了済み工程を不必要に重複実行せず、未完了工程を完了済みと誤認しないこと。inspect-docs は既存契約どおり実行途中の中断時に先頭から再実行すること |
      | REQ-041-016 | 新コマンド追加後も既存5コマンドを従来どおり単独実行でき、各公開契約を変更しないこと。通常の backlog-auto 実行によって inspect-promote --auto を暗黙的に有効化しないこと |

      ## 適用範囲

      - **対象**:
        - backlog-auto 公開コマンドと Workflow Skill の実行契約、工程間順序制御
        - 昇格3系統の並行実行と競合処理（Git 操作、共有成果物書き込み、ユーザー対話）の直列化
        - fan-in 判定（backlog-review 開始条件）、部分停止の伝播、全体完了報告の抑制
        - 対象なし終了の正常扱い、実行前から存在する promoted artifact の処理
        - 中断・再実行時の子ワークフロー再開契約の利用
      - **対象外**:
        - 子コマンドの業務ロジックの再実装、分類基準、評価基準、昇格基準の変更（REQ-036〜REQ-039）
        - 既存5コマンドの廃止、置換、単独実行契約の変更
        - learning-capture、intake-capture、intake-from-github、inspect-skills の一括処理への追加と自動起動
        - req-define、req-save、GitHub Issue / PR 作成までの自動化
        - inspect-promote --auto の暗黙的有効化および新規公開オプションの追加
        - 並列化だけを目的とした複数 worktree 方式への既存ワークフロー全面再設計
        - 並行実行数、スレッド数など内部実装パラメータの固定
  - id: ACT-SPEC-001
    artifact: spec
    operation: create
    target_spec:
      operation: create
      domain: commands
      slug: backlog-auto
    source_items: [AG-001, AG-002, AG-005]
    content: |
      # backlog-auto command SPEC 骨子（spec-save が正式形式へ展開）

      ## 責務

      `/agentdev/backlog-auto` 公開コマンド。backlog 整理サイクル（inspect-docs → 昇格3系統 → backlog-review）を1回起動で実行する薄いオーケストレータの公開 interface を定義する。workflow 実装本体は `agentdev-workflow-backlog-auto` Workflow Skill が所有する。

      ## 入力

      - 引数なし（対象状態は各子コマンドの durable state から解決する）

      ## 出力

      - 各子コマンドの既存出力（`.agentdev/inspect/inbox/`、各 promoted/、`.agentdev/backlog/req-units/RU-*.md` 等、子コマンド公開契約どおり）
      - backlog-auto 全体の実行結果報告（工程別結果、停止理由、再開コマンド提示を含む共通実行契約形式）

      ## HITL 境界

      - 各子ワークフローの既存 HITL 境界を維持する。backlog-auto 自身は新規の判断境界を追加しない
      - 複数系統が判断待ちの場合はユーザー対話を直列化し、対象子ワークフローを識別可能に表示する

      ## 停止条件

      - inspect-docs が blocked / failed の場合、下流工程を開始せず停止する
      - 昇格3系統に blocked / failed / 未完了が残る場合、backlog-review を開始せず停止する
      - 再実行時は子ワークフローの既存再開契約に従う

      ## ガードレール

      - 既存5コマンドの定義変更を行わない
      - inspect-promote --auto を暗黙的に有効化しない
  - id: ACT-SPEC-002
    artifact: spec
    operation: create
    target_spec:
      operation: create
      domain: skills
      slug: agentdev-workflow-backlog-auto
    source_items: [AG-002, AG-003, AG-004, AG-005]
    content: |
      # agentdev-workflow-backlog-auto skill SPEC 骨子（spec-save が正式形式へ展開）

      ## 責務

      backlog-auto command の workflow 実装本体。工程間制御（順序、並列と直列化、fan-in、停止伝播、再開）を所有し、子ワークフロー内部の分類、評価、昇格、RU 生成ロジックを保持しない。

      ## orchestration stage 構成

      - stage 1: inspect-docs（単独、直列実行）
      - stage 2: 昇格3系統（learning-promote、intake-promote、inspect-promote。安全に並行可能な処理は並行実行、Git 操作、共有成果物への競合書き込み、ユーザー対話は直列化）
      - stage 3: backlog-review（stage 2 全系統の正常完了または対象なし終了後に開始）

      ## 直列化契約

      - Git 同期、commit、push は直列集約ポイントで実行する
      - 共有成果物（競合しうる `.agentdev/` 配下パス）への書き込みを排他する
      - ユーザー対話は系統識別付きで直列化する

      ## fan-in 判定

      - 3系統すべてが正常完了または対象なし終了: backlog-review を開始する
      - 1系統でも blocked / failed / 未完了: backlog-review を開始せず、工程別結果と停止理由を報告する
      - 部分停止時に独立系統を連鎖停止しない

      ## resume 契約

      - 各工程は子ワークフローの既存再開契約（durable state、STEP model）を利用する
      - トップレベルの進行状態は既存 STEP model / durable state 契約に従い管理する
      - inspect-docs は STEP model 対象外（中断時は先頭から再実行）

      ## 実装分類

      manager-orchestrator（既存の実装分類を利用する）
  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target: docs/specs/workflows/workflow-contracts.md
    target_area: ## コマンド分類
    source_items: [AG-001]
    content: |
      コマンド分類表へ backlog-auto を追記する。分類は「最大自走入口」とし、標準の backlog 整理フロー（個別コマンドの逐次実行）を置換しない追加入口として位置づける（REQ-005-011 準拠）。backlog 整理サイクル（inspect-docs → 昇格3系統 → backlog-review）を1回起動で実行する。

conflict_resolutions:
  - id: CR-001
    conflict: 昇格3系統の実行形態について、コマンド全体の無条件同時起動とすると、既存コマンドが同一作業ツリーで実行する Git 同期、commit、push、共有領域への書き込みが競合する懸念があった。
    resolution: |-
      コマンド全体の無条件同時起動ではなく、安全に独立実行できる処理のみ並行化し、競合処理（Git 同期、commit、push、共有成果物への競合書き込み）とユーザー対話は直列化する方針とした（RU-0001 Source Summary の合意）。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: REQ-041
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |-
      src/opencode/commands/agentdev/backlog-auto.md と src/opencode/skills/agentdev-workflow-backlog-auto/（SKILL.md および references）が存在すること、既存5コマンドの command 定義ファイルに差分がないことを確認する。あわせて Workflow Skill が子ワークフロー内部の分類基準、評価軸、昇格基準を再定義していないことを確認する。
    pass_criteria: |-
      新規配布物が存在し、既存5コマンドの定義ファイルが変更されておらず、子ワークフローの業務ロジックの重複定義が検出されないこと。
    on_failure: |-
      fix-and-reverify を選択。重複定義を削除して子 Workflow Skill への委譲参照へ置き換え、再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |-
      全系統に処理対象が存在する状態で /agentdev/backlog-auto を実行し、inspect-docs → 昇格3系統 → backlog-review の開始順序、inspect-docs 正常終了前の昇格3系統非開始、全系統正常完了後の backlog-review 開始を工程記録から検証する。
    pass_criteria: |-
      RU-0001 決定的受け入れ条件1、2、8と同等の順序関係がすべて満たされていること。
    on_failure: |-
      fix-and-reverify を選択。工程間の開始条件ゲートを修正し、再検証する。
  - id: TS-003
    target_item: AG-004
    verification: |-
      昇格3系統の一部または全部に処理対象が存在しない状態で /agentdev/backlog-auto を実行する。
    pass_criteria: |-
      対象なし終了が一括処理の失敗として報告されず、全系統が対象なしの場合も backlog-review が実行されること（RU-0001 決定的受け入れ条件9）。
    on_failure: |-
      fix-and-reverify を選択。no-op と failed の実行状態分類を修正し、再検証する。
  - id: TS-004
    target_item: AG-004
    verification: |-
      inspect-docs が blocked または failed となる条件を発生させ、昇格3系統と backlog-review の起動有無を確認する。
    pass_criteria: |-
      昇格3系統および backlog-review のいずれも開始されないこと（RU-0001 決定的受け入れ条件11）。
    on_failure: |-
      fix-and-reverify を選択。下流工程の開始ゲート条件を修正し、再検証する。
  - id: TS-005
    target_item: AG-004
    verification: |-
      各昇格系統について、1系統を blocked とする条件および failed とする条件をそれぞれ発生させ、独立系統の継続状況と backlog-review の起動有無、全体完了報告の有無を確認する。
    pass_criteria: |-
      独立して実行可能な系統が停止せず、いずれの場合も backlog-review が開始されず、backlog-auto が全体完了を報告しないこと（RU-0001 決定的受け入れ条件6、7、15）。
    on_failure: |-
      fix-and-reverify を選択。fan-in 判定と停止伝播の制御を修正し、再検証する。
  - id: TS-006
    target_item: AG-003
    verification: |-
      複数系統が同時に判断待ち（HITL）となる条件と、Git 操作の競合が生じうる条件を発生させて実行する。
    pass_criteria: |-
      ユーザー対話が混線せず各判断がどの子ワークフローに対するものか識別可能であり、競合する Git 操作または共有成果物への競合書き込みが同時実行されないこと（RU-0001 決定的受け入れ条件4、5）。
    on_failure: |-
      fix-and-reverify を選択。対話と排他処理の直列化キュー制御を修正し、再検証する。
  - id: TS-007
    target_item: AG-004
    verification: |-
      昇格3系統で新規 promoted artifact が生成されず、実行前から存在する promoted artifact のみが置かれた状態で /agentdev/backlog-auto を実行する。
    pass_criteria: |-
      全系統正常終了後に backlog-review が実行され、実行前から存在する promoted artifact が処理対象になること（RU-0001 決定的受け入れ条件10）。
    on_failure: |-
      fix-and-reverify を選択。backlog-review 開始条件の判定ロジックを修正し、再検証する。
  - id: TS-008
    target_item: AG-005
    verification: |-
      各工程の実行途中で backlog-auto を中断し、再実行する。あわせて inspect-docs 実行途中の中断・再実行を確認する。
    pass_criteria: |-
      完了済み工程が不必要に重複実行されず、未完了工程が完了済みと誤認されず、中断した inspect-docs が先頭から再実行されること（RU-0001 決定的受け入れ条件12）。
    on_failure: |-
      fix-and-reverify を選択。再開対象特定と進行状態再構成のロジックを修正し、再検証する。
  - id: TS-009
    target_item: AG-005
    verification: |-
      新コマンド追加後の環境で既存5コマンド（inspect-docs、learning-promote、intake-promote、inspect-promote、backlog-review）を従来どおり単独実行する。あわせて通常の backlog-auto 実行時の inspect-promote について、--auto 相当の自動 promote が行われていないことを確認する。
    pass_criteria: |-
      既存5コマンドが従来どおり動作し公開契約に差分がなく、inspect-promote --auto が暗黙的に有効化されていないこと（RU-0001 決定的受け入れ条件13、14）。
    on_failure: |-
      fix-and-reverify を選択。既存コマンドへの副作用を除去し、再検証する。

review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: RU-0001-overall
    disposition: covered
    reason_code: reflected_in_ag_and_req
    reason: |-
      RU-0001 の合意内容（対象14項目、利用者から見える要件7項目、決定的受け入れ条件15項目）は AG-001〜AG-006 および REQ-041 要件行 001〜016 に網羅反映済み。RU の作業仮定節（manager-orchestrator 実装分類、トップレベル段階構成、durable state 再利用）は公開要件ではなく SPEC 側（ACT-SPEC-001、ACT-SPEC-002）へ反映した。RU の「検証方法」節は test_strategy TS-001〜TS-009 に反映した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 決定的受け入れ条件
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

backlog 整理サイクルを1コマンドで一巡させる `/agentdev/backlog-auto`（薄いオーケストレータ + 専用 Workflow Skill）の要件。RU-0001（session由来、合意成立済み）を入力とし、新規コマンド級 REQ（REQ-041、採番は req-save が検証）として CREATE、command SPEC・skill SPEC・workflow-contracts コマンド分類表を SPEC 保存対象とする。Decision は不要（既存 DEC-010・REQ-034 パターンの再適用）。work_type は feature、scale は standard（要件行16行、単一REQ、既存修正少数・新規付属ファイル中心）。RU-0001 の `agentdev_handoff: true` は self-hosting リポジトリであるため履歴メタデータとして通常の req/case workflow 入力として扱う（REQ-005-022）。
