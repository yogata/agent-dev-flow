---
draft_type: req_draft
topic_slug: ru0027-definition-pr-lifecycle
status: draft
created_at: 2026-09-16T12:35:49+09:00
source_rus:
  - RU-0027
---

# draft-data

```yaml
work_type: feature
scale: standard
summary: >-
  Draft Definition PR のブランチ命名、draft フラグ、merge 完結経路を REQ-085 と
  definition-readiness Design の Definition PR lifecycle 節へ確立する。case-open は
  draft: false で統一作成し、case-ready は draft 状態を検出して正規経路または停止条件つき
  報告へ分岐する。pr_merge の fail-closed、write-guard、partial merge 禁止は維持する。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
agreed_items:
  - id: AG-001
    content: >-
      case-open が作成する Draft Definition PR は draft フラグを false（非 draft）として
      統一作成し、実行間の不統一を許容しない。これにより case-ready の merge 前提を作成時点で
      満たし、draft 状態のまま受入工程へ進む経路を防止する。
  - id: AG-002
    content: >-
      Draft Definition PR のブランチ名は definition/issue-{N}、Definition Amendment PR の
      ブランチ名は definition-amend/issue-{N} とし、両方を definition-readiness Design の
      Definition PR lifecycle 節に正規所有させる。実装系 feature/issue-{N} とは名前空間を
      区別する。
  - id: AG-003
    content: >-
      case-ready の Definition PR 受入経路は draft 状態の PR を検出した場合の検出、報告、
      対処を明記する。正規対処は agentdev_gh の契約に従い、対処不能時は停止条件つきで報告する。
      gh CLI の直接書込みは正規経路に含めない。
  - id: AG-004
    content: >-
      Draft Definition PR の作成から case-ready の merge 完結までを agentdev_gh の正規操作
      のみで閉じる。draft: false の統一作成により draft 解除操作を追加せず、pr_create、状態確認、
      pr_merge の既存契約を使用する。
  - id: AG-005
    content: >-
      pr_merge の fail-closed 挙動と write-guard による raw gh WRITE ブロックを維持する。
      Definition Package の一部だけを merge する partial merge は行わず、merge 完結または
      停止報告のいずれかで扱う。
  - id: AG-006
    content: >-
      Draft Definition PR と Definition Amendment PR の lifecycle モデル自体（作成単位、
      実変更条件、merge 後挙動）は変更対象外とし、本要件はブランチ命名、draft フラグ、merge
      完結経路の物理的・操作的契約に限定する。
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:ru0027-definition-pr-lifecycle
    target_area: 要件テーブル
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006]
    content: |
      ---
      id: REQ-085
      title: "Draft Definition PR の作成〜merge 完結契約（ブランチ命名・draft フラグ・merge 経路）"
      created: "2026-09-16"
      updated: "2026-09-16"
      ---

      ## 目的

      Draft Definition PR の物理的・操作的契約を正規所有し、case-open による作成から case-ready による merge 完結までを agentdev_gh の正規操作のみで閉じることを所有する。lifecycle モデル自体は definition-readiness Design が正規所有する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-085-001 | case-open が作成する Draft Definition PR は draft フラグを false（非 draft）として作成し、作成実行間で draft フラグが不統一にならないこと |
      | REQ-085-002 | Draft Definition PR のブランチ名は definition/issue-{N}、Definition Amendment PR のブランチ名は definition-amend/issue-{N} とし、両命名は definition-readiness Design に正規所有されること。実装系ブランチ（feature/issue-{N}）との区別を維持すること |
      | REQ-085-003 | case-ready は Definition PR 受入時に draft 状態の PR を検出した場合、gh CLI 直操作を使わず、検出・報告・対処または停止条件つき報告の正規経路に従うこと |
      | REQ-085-004 | Draft Definition PR の作成から merge 完結までが agentdev_gh の正規操作のみで閉じること。draft 解除操作を操作カタログへ追加しない構成であること |
      | REQ-085-005 | pr_merge の fail-closed 挙動と write-guard による raw gh WRITE ブロックを維持し、運用時の partial merge を行わないこと |
      | REQ-085-006 | Draft Definition PR / Definition Amendment PR の lifecycle モデル自体（作成単位・実変更条件・merge 後挙動）は変更対象外とし、本 REQ はブランチ命名・draft フラグ・merge 完結経路のみを扱うこと |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/workflows/definition-readiness.md
    target_design:
      operation: update
      domain: workflows
      slug: definition-readiness
    target_area: "## Definition PR lifecycle"
    source_items: [AG-002, AG-003, AG-004, AG-005]
    content: |
      ### ブランチ命名と draft フラグ
      Draft Definition PR は definition/issue-{N}、Definition Amendment PR は definition-amend/issue-{N} を使用し、実装系 feature/issue-{N} と区別する。case-open は Draft Definition PR を draft: false で作成する。case-ready の merge は agentdev_gh の fail-closed な pr_merge を正規経路とし、draft 状態を検出した場合は定義済みの対処または停止条件つき報告を行う。raw gh WRITE、partial merge、lifecycle モデル自体の変更は行わない。
conflict_resolutions:
  - id: CR-001
    conflict: "draft 解除操作を agentdev_gh 操作カタログへ追加する案と、作成時に draft: false を統一する案が競合した。"
    resolution: "draft: false の統一作成と case-ready の draft 検出経路を採用し、既存の write-guard と pr_merge の fail-closed 防衛動作を変更しないため、draft 解除操作は追加しない。"
  - id: CR-002
    conflict: REQ-085 の番号は CREATE 用予約枠による擬似採番である。
    resolution: 共有予約枠（REQ-083〜096）から本バッチの CREATE 3件（ru0021=REQ-083、ru0027=REQ-085、ru0034=REQ-087）を割当てている。REQ-084 と REQ-086 は本バッチで不使用の空き枠として返却する（case-open の決定的採番が実際の採番を行うため再利用可）。REQ-085 を使用し、case-open の決定的採番により最終的な REQ ID を確定する。
  - id: CR-003
    conflict: definition-readiness Design の物理契約の配置先として lifecycle 節と冪等キー節が候補になった。
    resolution: 実ファイル照合で branch/ブランチ記述がなく、Definition PR の作成・確定・merge を所有する `## Definition PR lifecycle` を target_area とする。
operation_units:
  - ou_id: OU-001
    source_ru: RU-0027
    target_req: REQ-085
    target_design: docs/designs/workflows/definition-readiness.md
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: >-
      case-open の Definition PR 作成 reference を読み、draft: false の統一指定と実行間不統一の禁止を確認する。
    pass_criteria: "作成仕様に draft: false が明記され、実行間の不統一を許容しない。"
    on_failure: >-
      fix-and-reverify を選択する。作成仕様の欠落は実現面の契約修正で解消し、修正後に同じ照合を再実行する。
  - id: TS-002
    target_item: AG-002
    verification: definition-readiness Design の Definition PR lifecycle 節を読み、両 PR のブランチ命名と実装系ブランチとの差異を確認する。
    pass_criteria: definition/issue-{N}、definition-amend/issue-{N}、feature/issue-{N} の区別が記録されている。
    on_failure: fix-and-reverify を選択する。Design の記述欠落は追記して再確認する。
  - id: TS-003
    target_item: AG-003
    verification: case-ready の definition-acceptance reference を読み、draft PR の検出・報告・対処または停止経路を確認する。
    pass_criteria: gh CLI 直操作を含まない正規経路と停止条件つき報告が明記されている。
    on_failure: fix-and-reverify を選択する。受入経路の欠落は reference を修正して再確認する。
  - id: TS-004
    target_item: AG-004
    verification: pr_create、PR 状態確認、pr_merge の正規操作だけで作成から merge までを説明できることを照合する。
    pass_criteria: draft 解除操作や raw gh WRITE を追加せず、agentdev_gh の操作だけで経路が閉じている。
    on_failure: fix-and-reverify を選択する。正規操作外の経路は契約から除去して再検証する。
  - id: TS-005
    target_item: AG-005
    verification: pr_merge と write-guard の既存契約、および Definition Package の merge 単位を照合する。
    pass_criteria: fail-closed、raw gh WRITE ブロック、partial merge 禁止が維持されている。
    on_failure: fix-and-reverify を選択する。防衛境界の逸脱は契約を修正して再確認する。
  - id: TS-006
    target_item: AG-006
    verification: REQ-085 の対象外記述を definition-readiness の lifecycle 現行記述と比較する。
    pass_criteria: 作成単位・実変更条件・merge 後挙動を変更せず、物理的・操作的契約だけを扱う。
    on_failure: fix-and-reverify を選択する。スコープ逸脱を除去して再確認する。
realization_actions:
  - id: RA-001
    concern: case-open の Definition PR draft フラグ統一
    responsibility: case-open workflow の Definition PR 作成 reference が正規所有する。
    ownership_hints:
      - src/opencode/skills/agentdev-workflow-case-open/SKILL.md
      - src/opencode/skills/agentdev-workflow-case-open/references/
      - REQ-030
    intent: 作成時の draft フラグ不統一を防止する。
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-002
    concern: case-ready の draft PR 検出経路
    responsibility: case-ready workflow の definition-acceptance reference が正規所有する。
    ownership_hints:
      - src/opencode/skills/agentdev-workflow-case-ready/SKILL.md
      - src/opencode/skills/agentdev-workflow-case-ready/references/
      - REQ-061
    intent: draft PR の受入可否を正規操作で判定可能にする。
    verification_refs: [TS-003]
    source_items: [AG-003]
  - id: RA-003
    concern: Definition 系ブランチの派生運用
    responsibility: agentdev-git-worktree のブランチ派生手順へ Definition PR と Amendment PR の命名を反映する。
    ownership_hints:
      - src/opencode/skills/agentdev-git-worktree/
      - docs/designs/skills/agentdev-git-worktree.md
    intent: Definition 系と実装系のブランチ名前空間を一貫させる。
    verification_refs: [TS-002]
    source_items: [AG-002]
review_dispositions:
  - id: RD-001
    source_ru: RU-0027
    source_item: RU-0027-acceptance-criteria
    disposition: covered
    reason_code: converted_to_new_req_and_design_update
    reason: RU-0027 の受け入れ条件を REQ-085 の6行と definition-readiness Design update、realization_actions に反映した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0027.md
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items: []
case_open_hints:
  epic_needed: false
  wave_hints: []
result: {}
```

# summary

変更誘発境界リスクは、dependency（REQ-085、definition-readiness、case-open、case-ready、git-worktree の契約接続）、client-server（agentdev_gh と GitHub PR の draft/merge 境界）、execution（case-open の作成から case-ready の受入・merge までの順序）、build-runtime（文書・reference 変更のみで実装コードと実行基盤を変更しないこと）、environment-propagation（workflow skill と Design の配布・同期境界）を確認済みである。REQ-085 CREATE 6行と Design update 1件に収まり、独立した複数関心の混在はない。SPLIT 要否: 不要。
