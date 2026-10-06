---
draft_type: req_draft
topic_slug: definition-worktree-cleanup-workflow
status: draft
created_at: 2026-10-06T09:20:00+09:00
source_rus: []
---

# draft-data

```yaml
work_type: maintenance

scale: standard

summary: |-
  設計PR 用 worktree（.worktrees/{N}-definition）とローカルブランチ（definition/issue-{N}）を削除する工程がワークフロー全体に存在せず、完了済み Case で 34 件が残存した実測（2026-10-06）に基づく是正。設計側 worktree・ブランチの作成を agentdev-git-worktree 標準手順の正式 type（type=definition / definition-amend）へ格上げし、削除を case-ready STEP-7（設計PR merge 完結後）へ追加、case-auto クリーンアップ検証ゲートの検証対象へ設計側 worktree・ブランチ残存 0 件を追加する。遠隔ブランチは既存どおり GitHub deleteBranchOnMerge 自動削除に委譲し変更しない。用語は「設計PR」「実装PR」表記に従う（並行ケース「terminology-design-pr-and-implementation-pr」で定義。本ケースの保存文書は確定済み名称で記述する）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |-
      実測事実: 2026-10-06 時点で、完了済み Case（Issue クローズ済み・設計PR マージ済み・遠隔ブランチ削除済み）の設計側ローカルブランチ 34 本・worktree 34 個が .worktrees/{N}-definition と definition/issue-{N} として残存していた。ローカル実装側ブランチ（case-close STEP-6-1 が削除を所有）は 0 本であり、残存は設計側のみ・全数であった。原因は実行漏れではなく、設計側 worktree・ブランチを削除する工程のワークフロー全体への欠落である。
  - id: AG-002
    content: |-
      設計側 worktree・ブランチの作成を、case-open Design「並行 case-open 作業隔離規律」節と case-open references「並行 case-open の作業隔離」が独自に定義している現状を解消し、agentdev-git-worktree の標準形式（.worktrees/{N}-{type}、{type}/issue-{N}）の type 定義域へ definition と definition-amend を正式に追加する。case-open 側の規定は作成手順の正規所有を agentdev-git-worktree へ移管し、隔離要件（作成元 origin/main HEAD・スタック構造禁止・1-writer 侵害検知・merge-base 起点差分検査）の所有は case-open Design に残す。ブランチ命名（definition/issue-{N} 等）は REQ-083-002 のとおり変更しない。
  - id: AG-003
    content: |-
      設計側 worktree・ローカルブランチの削除を case-ready STEP-7（draft / RU 削除と同期確認）へ追加する。削除タイミングは設計PR merge 完結後（canonical Definition 再取得後）で、draft / RU 削除と同じ lifecycle 位置とする。削除手順は agentdev-git-worktree の worktree 削除手順とローカルブランチ削除手順（squash merge 後の条件付き -D 判定を含む）をそのまま参照し、新規の手順を定義しない。実変更なしで設計PR が存在しない Case は対象外（作成されていないものは削除もしない）。case-revise の definition-amend 側も同様に case-ready で削除する。
  - id: AG-004
    content: |-
      case-auto のクリーンアップ検証ゲート（stage 2 対象群収束後・stage 3 開始前）の検証対象へ「対象 Case の設計側 worktree・ローカルブランチの残存 0 件」を追加する。検出時は fail-closed で停止し、残存対象と削除再実行の案内を報告する。評価対象は既存どおり stage 2 を正常完了した対象に限定する。実行（case-ready STEP-7）と検証（クリーンアップ検証ゲート）の分離は draft・RU 残存検証と同形とし、新しい機構は作らない。
  - id: AG-005
    content: |-
      遠隔ブランチ（origin/definition/issue-{N} 等）の削除は現行どおり GitHub の deleteBranchOnMerge 自動削除に委譲し、本変更で扱わない（DEC-045 維持）。マージされずクローズした PR の遠隔ブランチ残存（実測: run/issue-3461 の 1 件）は本工程の対象外とし、例外対応は既存の手動確認による。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-030.md
    source_items: [AG-002, AG-003]
    content: |
      | REQ-030-018 | case-open が設計側 worktree（.worktrees/{N}-definition）と設計系ブランチ（definition/issue-{N}）を作成する場合、作成手順は agentdev-git-worktree 標準手順（type=definition）に従うこと。作業隔離要件（作成元 origin/main HEAD・スタック構造禁止・1-writer 侵害検知・merge-base 起点差分検査）の所有は case-open Design が維持すること |
      | REQ-030-019 | 設計側 worktree・ローカル設計系ブランチは、case-ready が設計PR の merge を完結した後（draft / RU 削除と同一の lifecycle 位置）に agentdev-git-worktree の削除手順に従って削除すること。実変更なしで設計PR が存在しない Case では作成も削除も行わないこと |
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-061.md
    source_items: [AG-003]
    content: |
      | REQ-061-0XX | case-ready は STEP-7 で draft / RU 削除に加え、設計PR merge 完結後の設計側 worktree・ローカル設計系ブランチの削除（agentdev-git-worktree の worktree 削除手順・squash merge 後の条件付き -D 判定を含むローカルブランチ削除手順に従う）を実行し、削除失敗時は警告表示して停止すること |
  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-034.md
    source_items: [AG-004]
    content: |
      | REQ-034-0XX | case-auto のクリーンアップ検証ゲートは draft・RU 残存に加え、stage 2 を正常完了した対象の設計側 worktree・ローカル設計系ブランチの残存が 0 件であることを検証し、残存検出時は fail-closed で停止して残存対象と対応を報告すること |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/commands/case-open.md
    target_area: 並行 case-open 作業隔離規律
    source_items: [AG-002]
    content: |
      「Case 専用 worktree の前置」の作成手続記述を agentdev-git-worktree 標準手順（type=definition）の参照へ置換する。branch 作成元（origin/main HEAD・スタック構造禁止）、merge-base 起点差分検査、明示パス指定ステージ、1-writer 侵害検知の各要件は本 Design の所有のまま維持する。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/commands/case-ready.md
    target_area: STEP-7
    source_items: [AG-003]
    content: |
      STEP-7 を「draft / RU・設計側 worktree 削除と同期確認」へ拡張する。設計PR merge 完結後、agentdev-git-worktree の手順に従い設計側 worktree を削除し、ローカル設計系ブランチを squash merge 後の条件付き -D 判定を経て削除する。実変更なし（設計PR 不在）の Case では本削除をスキップする。削除失敗時は警告表示して停止する。
  - id: ACT-DESIGN-003
    artifact: design
    operation: update
    target: docs/designs/commands/case-auto.md
    target_area: クリーンアップ検証ゲート
    source_items: [AG-004]
    content: |
      クリーンアップ検証ゲートの検証対象へ「対象 Case の設計側 worktree・ローカル設計系ブランチの残存 0 件」を追加する。評価対象は stage 2 正常完了対象に限定し、検出時は fail-closed で停止する。
  - id: ACT-DESIGN-004
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-git-worktree.md
    source_items: [AG-002]
    content: |
      worktree・ブランチ標準形式の type 定義域へ definition・definition-amend を追加する。作成元は origin/main（既存と同一）。設計系ブランチのリモート削除は行わず GitHub deleteBranchOnMerge に委譲する既存規定を維持する。

conflict_resolutions:
  - id: CR-001
    conflict: 削除タイミングを case-close（STEP-6-1）へ集約する案と case-ready（STEP-7）へ追加する案が並立した。
    resolution: case-ready STEP-7 採用。設計PR は case-ready で merge 完結するため用済ち時点が最短であり、draft・RU 削除と同じ lifecycle 位置に置くことで既存パターンと同形にできる。case-close に集約すると stage 2〜3 間で worktree が残存し続ける現状が維持されるため不採用。

operation_units:
  - ou_id: OU-001
    target_req:
      - docs/requirements/REQ-030.md
      - docs/requirements/REQ-061.md
      - docs/requirements/REQ-034.md
    target_design:
      - docs/designs/commands/case-open.md
      - docs/designs/commands/case-ready.md
      - docs/designs/commands/case-auto.md
      - docs/designs/skills/agentdev-git-worktree.md
      - src/common/skills/agentdev-git-worktree/references/worktree-operations.md を含む workflow skill・references 群
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single

result: {}

test_strategy:
  - id: TS-001
    target_item: AG-003
    verification: |
      設計PR を merge 完結した Case 1 件で case-ready STEP-7 を実行（または再実行）し、.worktrees/{N}-definition と definition/issue-{N} が削除されていることを git worktree list と git branch で確認する。
    pass_criteria: |
      対象 Case の設計側 worktree・ローカルブランチが存在せず、削除失敗の警告が出力されていないこと。
    on_failure: |
      fix-and-reverify。削除手順の参照解決・権限エラーを確認し、修正して再実行する。
  - id: TS-002
    target_item: AG-004
    verification: |
      設計側 worktree を意図的に残した状態で case-auto のクリーンアップ検証ゲートを通し、残存検出で fail-closed 停止することを確認する。
    pass_criteria: |
      残存対象の特定と削除再実行の案内が報告され、stage 3 へ進行していないこと。
    on_failure: |
      fix-and-reverify。ゲート評価対象の抽出条件を修正して再検証する。

realization_actions:
  - id: RA-001
    concern: workflow skill references の削除手順参照の整合
    responsibility: case-ready・case-auto・case-open の各 workflow skill SKILL.md・references の該当 STEP 記述を Design 変更に追随させる
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-ready/references/readiness-and-cleanup.md
      - src/common/skills/agentdev-workflow-case-auto/references/input-resolution-and-orchestration.md
      - src/common/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md
      - src/common/skills/agentdev-git-worktree/SKILL.md
      - src/common/skills/agentdev-git-worktree/references/worktree-operations.md
    intent: Design・REQ のみ更新し references を更新しないと、実行時の手順正が更新前のままになる
    verification_refs: [TS-001, TS-002]
    source_items: [AG-002, AG-003, AG-004]

review_dispositions: []

case_open_hints:
  epic_needed: false
  decomposition:
  wave_hints: []
```

# summary

設計側 worktree・ローカルブランチの削除工程欠落（実測 34 件残存）の是正。作成の標準形式格上げ（type=definition）、case-ready STEP-7 への削除追加、クリーンアップ検証ゲートへの残存検証追加の 3 点セット。遠隔は既存委譲のまま。
