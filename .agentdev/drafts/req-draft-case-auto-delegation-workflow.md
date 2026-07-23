---
draft_type: req_draft
topic_slug: case-auto-delegation-workflow
status: draft
created_at: 2026-07-23T12:00:00+09:00
source_rus:
  - RU-0019
agentdev_handoff: true
---

<!-- req_draft テンプレート
  このテンプレートは req-define が生成する構造化引き継ぎ成果物の原本である。
  後続工程（req-save/ spec-save/ case-open/ case-auto/ case-run/ case-close）が参照する
  原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
  soft contract（生成元側標準）であり、LLM 推論経由で消費される。
  厳格なスキーマバージョン、JSON Schema、バリデータは導入しない。 -->

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
work_type: feature

# scale: feature のみ standard / large。
scale: standard

# summary: 当該 draft が何を合意したかの1段落要約。
summary: |
  case-auto 最大自走モードから起動した case-run 子 task（実行担当サブエージェント）がハーネスの bg task 機能で破棄された際、commit 済み・PR 未作成と未コミット変更ありの2パターンについて、case-auto 親ループが worktree git status を確認し commit/rebase/push/PR 作成を代行する標準回復パスを case-auto SPEC および case-auto command 本文の両方へ追加する。子 task ライフサイクルと成果物（commit、working tree）ライフサイクルの分離原則に基づき、回復プロトコルを agentdev-workflow-orchestration skill の references/ に詳細化する。SPEC と command 本文は別物であり、いずれか片方だけの更新では完了扱いしない。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目。
agreed_items:
  - id: AG-001
    content: |
      case-auto は Wave 内子 task（case-run インライン実行の実行担当サブエージェント、ADR-0137/0138）がハーネスの bg task 機能で破棄されたことを検知した場合、当該子 task の worktree で git status を確認し、成果物（commit、working tree 変更）の残留状態を分類する。分類結果は (a) commit 済み・PR 未作成、(b) 未コミット変更あり、(c) クリーン（残留なし）の3状態のいずれかとする。(c) の場合は回復処理をスキップし、当該子 task を pending へ戻す（REQ-0162-004 準拠）。この検知と3状態分類のステップを case-auto SPEC の標準動作として定義する。
  - id: AG-002
    content: |
      分類結果が (a) commit 済み・PR 未作成 の場合、case-auto 親ループは当該 worktree で rebase（必要時）→ push → PR 作成を代行する。PR の base branch、タイトル、本文は子 task の Issue に紐づく情報から生成する。作成した PR 番号を子 task の result に completed-pr として記録し、通常の case-close フローへ合流させる。
  - id: AG-003
    content: |
      分類結果が (b) 未コミット変更あり の場合、case-auto 親ループは変更内容が子 task の case-run 作業意図（Issue の受け入れ条件、実装計画）と整合するかを確認するステップを必須とする。整合確認ができた場合のみ commit → push → PR 作成を代行する。整合確認できない場合（別 Issue 由来の変更混入、意図不明の変更等）は当該子 task を blocked とし、停止理由「未コミット変更の帰属不明」（REQ-0114-108 既存分類）として報告する。安全のため、未確認の変更を強制 commit しない。
  - id: AG-004
    content: |
      子 task のライフサイクル（サブエージェント起動から終了まで）と成果物（commit、working tree 変更）のライフサイクルを分離して扱う。サブエージェントが破棄されても成果物は worktree に残留する前提で回復パスを設計する。この分離原則と中断時回復プロトコルを agentdev-workflow-orchestration skill の references/ に詳細化し、Epic Wave 並列委譲（REQ-0114-087〜093）での同種子 task 破棄回復への拡張可能性を否定しない。

# artifact_actions: REQ/ADR/SPEC への保存対象を1つの配列に統合
artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/case-auto.md
    target_area: "## 子 task 中断回復パス"
    source_items: [AG-001, AG-002, AG-003]
    content: |
      ## 子 task 中断回復パス

      case-auto は Wave 内子 task（case-run インライン実行の実行担当サブエージェント、ADR-0137/0138）がハーネスの bg task 機能で破棄されたことを検知した場合、以下の標準回復パスを実行する。子 task ライフサイクルと成果物（commit、working tree 変更）ライフサイクルは分離して扱い、サブエージェント破棄後も worktree に残留する成果物を親ループが引き継ぐ。

      ### 中断検知と状態分類

      中断検知後、当該子 task の worktree で git status を確認し、以下3状態のいずれかに分類する。

      | 分類 | 状態 |
      |---|---|
      | (a) | commit 済み・PR 未作成 |
      | (b) | 未コミット変更あり |
      | (c) | クリーン（残留なし） |

      (c) の場合は回復処理をスキップし、当該子 task を pending へ戻す（REQ-0162-004 準拠）。

      ### パターン (a) commit 済み・PR 未作成

      case-auto 親ループが当該 worktree で rebase（必要時）→ push → PR 作成を代行する。PR の base branch、タイトル、本文は子 task の Issue に紐づく情報から生成する。作成した PR 番号を子 task の result に completed-pr として記録し、通常の case-close フローへ合流させる。

      ### パターン (b) 未コミット変更あり

      変更内容が子 task の case-run 作業意図（Issue の受け入れ条件、実装計画）と整合するかを確認するステップを必須とする。整合確認ができた場合のみ commit → push → PR 作成を代行する。整合確認できない場合（別 Issue 由来の変更混入、意図不明の変更等）は当該子 task を blocked とし、停止理由「未コミット変更の帰属不明」（REQ-0114-108）として報告する。未確認の変更を強制 commit しない。

      ### ADR-0137/0138 との関係

      本回復パスは ADR-0138（case-auto オーケストレーション制御の AgentDevFlow 側集約）で合意された bg task 状態管理と回復の SPEC 実装である。ADR-0138 relates-to ADR-0132（bg task 破棄時の状態別回復とコンフリクト解消モデルの協調）にも整合する。ADR-0137（case-run インライン実行、多重委譲回避）の委譲起点折りたたみモデルを維持し、回復時の PR 作成代行は case-auto 親ループの責務とする。
  - id: ACT-CMD-001
    artifact: command
    operation: command-update
    target: src/opencode/commands/agentdev/case-auto.md
    target_area: "Step 4 委譲起動判定 / Step 7 停止条件の検出 周辺: 子 task 中断検知と回復パス"
    source_items: [AG-001, AG-002, AG-003, AG-004]
    depends_on: [ACT-SPEC-001]
    content: |
      ## 子 task 中断回復パス（command 本文への実装）

      docs/specs/commands/case-auto.md「子 task 中断回復パス」（ACT-SPEC-001 で契約の正となる内容）を src/opencode/commands/agentdev/case-auto.md の command 本文へ実装する。SPEC と command 本文は別物であり、SPEC は契約の正だが command 本文の振る舞い規定と独立している。SPEC だけ、または command 本文だけの更新では完了扱いしない。

      ### 実装対象セクション

      command 本文の Step 体系へ以下を反映する。

      - Step 4「各工程の実行」の委譲起動判定（REQ-0162-003/004、AG-004）または Wave 反復制御（REQ-0114-097）周辺: 子 task の bg task 破棄検知ステップを追加する。
      - Step 7「停止条件の検出」周辺: 検知後の worktree git status 確認と (a) commit 済み・PR 未作成 / (b) 未コミット変更あり / (c) クリーン の3状態分類、各パターンの回復手順（rebase → push → PR 作成代行、作業意図整合確認 → commit → push → PR 作成代行、または blocked 報告）を追加する。
      - ガードレール「実行時パス制約」: 未コミット変更の強制 commit 禁止、整合確認不能時の blocked 報告（REQ-0114-108「未コミット変更の帰属不明」）への参照を明示する。

      ### 完了条件

      本 ACT は ACT-SPEC-001（case-auto SPEC update）と ACT-SPEC-002（workflow-orchestration references update）と揃って完了とする。command 本文単独の更新で本件を完了扱いしない。
  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-create
    target: src/opencode/skills/agentdev-workflow-orchestration/references/case-auto-recovery.md
    source_items: [AG-004]
    depends_on: [ACT-SPEC-001, ACT-CMD-001]
    content: |
      # case-auto 子 task 中断回復プロトコル

      ## 目的

      case-auto 最大自走モードから起動した case-run 子 task（実行担当サブエージェント）がハーネスの bg task 機能で破棄された際の子 task ライフサイクルと成果物ライフサイクルの分離原則、中断時回復プロトコルを定義する。agentdev-workflow-orchestration skill が case-auto の回復パス判断材料として参照する。

      ## ライフサイクル分離原則

      子 task のライフサイクル（サブエージェント起動から終了まで）と成果物（commit、working tree 変更）のライフサイクルは分離して扱う。サブエージェントが破棄されても成果物は worktree に残留する前提で回復パスを設計する。この分離により、サブエージェントの寿命に依存せず成果物を回復できる。

      ## 中断時回復プロトコル

      中断検知後の状態分類（commit 済み・PR 未作成、未コミット変更あり、クリーン）と各パターンの回復手順の詳細は docs/specs/commands/case-auto.md「子 task 中断回復パス」を正とする。本 references は分離原則と拡張可能性の解説を担う。

      ## Epic Wave 並列委譲への拡張可能性

      Epic Wave 並列委譲（REQ-0114-087〜093、ADR-0125）で同種の子 task 破棄が発生した場合、本回復プロトコルを per-Wave で適用できる。並列委譲の集約原則（REQ-0114-092）に従い、各子 task の回復結果を case-auto 親ループが集約する。

      ## 完了条件

      本 references 更新は ACT-SPEC-001（case-auto SPEC update）と ACT-CMD-001（case-auto command 本文 update）と揃って完了とする。references 単独の作成・更新で本件を完了扱いしない。references は SPEC の分離原則・拡張可能性を補完する位置づけであり、SPEC と command 本文が未更新の状態で references だけ作成しても回復パスの標準化は成立しない。

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: |
      ADR-0138 は case-auto の bg task 破棄時の状態別回復を AgentDevFlow 側制御点として合意済み（決定2の限定注記、REQ-0114-106）。一方、case-auto SPEC には回復の具体手順が未標準化で、回復の確実性が親ループの判断に依存していた（RU-0019 sources: PR #1578, #1579）。
    resolution: |
      本要件は ADR-0138 の決定を case-auto SPEC へ投影し、回復パスを2パターン（commit 済み・PR 未作成、未コミット変更あり）で標準化する。ADR-0138 の決定内容を変更せず、その SPEC 実装として位置づける。ADR-0137（case-run インライン実行、多重委譲回避）の委譲起点折りたたみモデルを維持し、回復時の PR 作成代行は case-auto 親ループの責務として扱う。ADR-0138 relates-to ADR-0132（bg task 破棄時の状態別回復とコンフリクト解消モデルの協調）にも整合する。
  - id: CR-002
    conflict: |
      レビューにて「case-run / case-close / executor との責任分界更新」および「case-auto が commit / push / PR 作成を直接担うことを見据えた git 操作境界の REQ/ADR 更新」が必要との指摘があった。
    resolution: |
      いずれも本ドラフトの範囲（RU-0019 子 task 中断回復パス標準化）を超えるスコープ拡大のため、別途要件として扱い今回の対象外とする。今回の対象は case-auto SPEC update（ACT-SPEC-001）、case-auto command 本文 update（ACT-CMD-001）、workflow-orchestration references update（ACT-SPEC-002）の3点に限定する。責任分界の更新は case-run / case-close / executor とまたぐ横断変更であり、git 操作境界の REQ/ADR 更新は commit / push / PR 作成の境界を問い直す大規模変更である。両者とも本ドラフトの合意範囲を超えるため、RU-0019 の原本意図（子 task 中断回復パスの標準化）を維持して別要件へ切り出す。

# operation_units: 複数RU入力時の統合/分離結果。単一REQ操作の場合も1件の OU として出力
operation_units:
  - ou_id: OU-001
    source_ru: RU-0019
    target_spec: docs/specs/commands/case-auto.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0019
    target_spec: src/opencode/commands/agentdev/case-auto.md
    operation: command-update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0019
    target_spec: src/opencode/skills/agentdev-workflow-orchestration/references/case-auto-recovery.md
    operation: spec-create
    scale: standard
    depends_on: [OU-001, OU-002]
    recommended_order: 3
    issue_policy: single
    result: {}

# test_strategy: 各合意項目（AG-*）の検証方法。3要素（verification / pass_criteria / on_failure）必須
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      case-auto SPEC に子 task 中断検知と git status 確認の標準ステップが記述されていることを確認する。中断検知後に worktree ごとに (a) commit 済み・PR 未作成、(b) 未コミット変更あり、(c) クリーンの3状態分類が定義されていることを docs/specs/commands/case-auto.md の該当セクションで検証する。
    pass_criteria: |
      中断検知 → git status 確認 → 3状態分類が SPEC に明記され、(c) の場合は当該子 task を pending へ戻すことが規定されていること。
    on_failure: |
      SPEC 記述に3状態分類または (c) の pending 戻しが欠落している場合、fix-and-reverify で SPEC へ追記して再検証する。分類の欠落は回復パスの網羅性に直結するため、record-in-findings は許容しない。
  - id: TS-002
    target_item: AG-002
    verification: |
      パターン (a) commit 済み・PR 未作成 の回復手順（rebase → push → PR 作成代行 → completed-pr 記録 → case-close 合流）が docs/specs/commands/case-auto.md に記述されていることを確認する。PR の base branch、タイトル、本文の生成元情報が子 task の Issue 紐づけであることを検証する。
    pass_criteria: |
      rebase / push / PR 作成の順序、PR 情報の Issue 紐づけ生成、result への completed-pr 記録、case-close フローへの合流が SPEC に規定されていること。
    on_failure: |
      手順のいずれか（rebase、push、PR 作成、result 記録、case-close 合流）が欠けている場合、fix-and-reverify で SPEC へ補完して再検証する。PR 作成代行は回復パスの中核であり、欠落を record-in-findings とはしない。
  - id: TS-003
    target_item: AG-003
    verification: |
      パターン (b) 未コミット変更あり の回復手順が docs/specs/commands/case-auto.md に記述されていることを確認する。変更内容の作業意図整合確認ステップの有無、整合確認不能時の blocked 報告（REQ-0114-108「未コミット変更の帰属不明」）への連携、強制 commit 禁止の記述を検証する。
    pass_criteria: |
      変更内容の作業意図整合確認ステップが必須化されており、整合確認不能時は blocked 報告することが SPEC に規定されていること。未確認の変更を強制 commit しない記述があること。
    on_failure: |
      整合確認ステップ、blocked 報告連携、強制 commit 禁止のいずれかが欠落している場合、fix-and-reverify で SPEC へ追記して再検証する。安全性に関わるため record-in-findings は許容しない。
  - id: TS-004
    target_item: AG-004
    verification: |
      src/opencode/skills/agentdev-workflow-orchestration/references/ 配下に子 task ライフサイクルと成果物ライフサイクルの分離原則、中断時回復プロトコルを記述したファイルが存在することを確認する。Epic Wave 並列委譲（REQ-0114-087〜093）への拡張可能性への言及を検証する。
    pass_criteria: |
      references/ 配下に分離原則と回復プロトコルを記述したファイルが存在し、Epic Wave 並列委譲への拡張可能性に言及していること。
    on_failure: |
      ファイルが未作成、または分離原則・拡張可能性の記述が不十分な場合、fix-and-reverify でファイルを作成・補完して再検証する。

# case_open_hints: case-open 構成生成への参考情報
case_open_hints:
  epic_needed: true
  epic_slug: backlog26-rus-integrated
  wave_hints: []

# spec_save_result: spec-save 処理結果（spec-save Step 8, SPEC artifact_actions 消費済みフラグ）
spec_save_result:
  consumed: true
  processed_at: 2026-07-23T13:00:00+09:00
  read_time_hash: 153198164381f6110b4bb7e649cef2aa08af649f
  saved_specs: []
  skipped:
    - action_id: ACT-SPEC-001
      artifact: spec
      operation: spec-update
      target: docs/specs/commands/case-auto.md
      reason: target_area "## 子 task 中断回復パス" not found (search-target-area.ts: matches=[])
      recommendation: operation を spec-create へ切り替え、または対象 SPEC へ target_area 見出しを追加後に再実行
    - action_id: ACT-SPEC-002
      artifact: spec
      operation: spec-create
      target: src/opencode/skills/agentdev-workflow-orchestration/references/case-auto-recovery.md
      reason: target が docs/specs/** 配下ではない (spec-save G02 違反)
      recommendation: case-run で references ファイルを作成、または別途要件として切り出し
    - action_id: ACT-CMD-001
      artifact: command
      operation: command-update
      target: src/opencode/commands/agentdev/case-auto.md
      reason: artifact=command は spec-save 対象外 (spec-save は artifact=spec のみ処理)
      recommendation: case-run で command 本文を実装
```

# summary

本ドラフトは RU-0019（case-auto 子 task 中断回復パス標準化）の要件化結果である。PR #1578（commit 済み・PR 未作成）と PR #1579（未コミット変更あり）の2事例から抽出した回復パスを case-auto SPEC および case-auto command 本文の両方へ標準化し、子 task ライフサイクルと成果物ライフサイクルの分離原則を agentdev-workflow-orchestration skill の references に詳細化する。SPEC と command 本文は別物であり、いずれか片方だけの更新では完了扱いしない。26件 RU 統合 Epic（backlog26-rus-integrated）の C6 クラスタ（case-auto・委譲ワークフロー）に属する。
