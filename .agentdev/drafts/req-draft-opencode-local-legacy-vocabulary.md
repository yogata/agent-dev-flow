---
draft_type: req_draft
topic_slug: opencode-local-legacy-vocabulary
status: draft
created_at: 2026-10-13T12:55:00Z
source_rus:
  - RU-0207
---

# draft-data

```yaml
work_type: bugfix

scale: standard

summary: 旧語彙 src/opencode-local を正規形とする Design 記述（agentdev-workflow-templates.md L103）と、実在しない src/opencode-local を検査対象リストに含むリリース検査（scripts-layout.test.ts L186-192）を、現行配置の正（runtime-package-boundary.md Design・install.ps1 が示す src/common/tools/agentdev-gh/local/）へ是正する。全リポジトリ横断残存調査を実施済みであり、現行規範面（Design・guide・script）の残存は上記2件のみ、残存する言及は禁止列挙・検出語彙・履歴注記・観測記録として分類し対象外とする。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      docs/designs/skills/agentdev-workflow-templates.md「対象範囲表記の正規形」節（L101-103）の語彙指定を、旧接頭辞 src/opencode-local/ から現行配置接頭辞 src/common/tools/agentdev-gh/local/ へ置換する。あわせて現行の配置接頭辞の正が runtime-package-boundary.md Design である旨の権威参照を1文追記し、将来の配置変更時に正の所在から再検出できるようにする。「（維持）」記載の意図は正規形規則自体（配置領域の接頭辞を明示し配布物投影パスと区別する表記を正とする規則）の維持宣言であり、本修正は規則を維持したまま規則の値を現行へ是正するものである。
  - id: AG-002
    content: |
      scripts/self/release/scripts-layout.test.ts L186-192 の検査対象リストから実在しない src/opencode-local を除去し、src/common/tools/agentdev-gh/local へ置換する（test 名内の言及更新を含む）。置換先配下の user-facing markdown（README.md、case-schema/ 配下）は実在を実測済みであり、退廃エントリ名（install-consumer-opencode、check-consumer-opencode、sync-self-opencode）の残存は 0 件を実測済みのため、置換後も検査は pass する。
  - id: AG-003
    content: |
      旧語彙の全リポジトリ横断残存調査の結果を受理する。検索範囲: docs/designs、docs/guides、docs/knowledge、docs/decisions、docs/requirements、src、scripts、ルート *.md（.opencode/ は junction 投影であり実体走査で網羅。docs/reports/ は履歴記録領域として検出対象外）。現行規範面の是正対象は AG-001・AG-002 の2件のみである。残存する言及の分類: (1) docs/designs/local/runtime-package-boundary.md L367（旧構造の作成禁止列挙。禁止対象の名指しであり意図的）、(2) docs/designs/integrity/rules/IR-057（旧語彙を検出語彙として列挙する検査ルール。意図的）、(3) docs/decisions/DEC-004 L23/L29（本文全体が当時の名称である旨の注記付き決定記録。意味的に不変）、(4) docs/knowledge/worktree-environment-fail-classification.md L53（過去の fail 分類の観測記録。履歴）。

conflict_resolutions:
  - id: CR-001
    conflict: Design 語彙修正の形態（現行パス接頭辞への置換か、パス非依存の記述への変更か）
    resolution: |
      現行接頭辞 src/common/tools/agentdev-gh/local/ への置換＋権威参照の追記を採用する。根拠: runtime-package-boundary.md Design が現行配置の正規所有であり（同 Design L367 は旧構造を「作成しない」と明記）、具体値の正を参照できる。Design はリポジトリ内部設計文書（実行時配布対象外）のため具体パス記載が許容される。パス非依存化は正の所在を曖昧にし、再陳腐化時の機械的検出（旧語彙検索）を難しくする。
  - id: CR-002
    conflict: scripts-layout.test.ts 検査対象の処置（実在しない root の除去のみか、現行 local パスへの置換か）
    resolution: |
      src/common/tools/agentdev-gh/local への置換を採用する。根拠: local 配下に user-facing markdown が実在し（README.md、case-schema/ 配下）、退廃エントリ名の残存 0 件を実測済み。置換により REQ-050-014 の検査意図（現行文書は新エントリのみを参照）が local 領域を含めて復活する。除去のみでは local 領域の検査欠落が残る。

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/skills/agentdev-workflow-templates.md
    target_design:
      operation: update
      domain: skills
      slug: agentdev-workflow-templates
    target_area: ### 対象範囲表記の正規形
    canonical_owner: agentdev-workflow-templates
    source_items: [AG-001]
    content: |
      ### 対象範囲表記の正規形

      Issue 本文の対象範囲にローカル版（src/common/tools/agentdev-gh/local/ 配下等）の references パスを記載する際は、配置領域の接頭辞（src/common/tools/agentdev-gh/local/）を明示し、配布物（.opencode/）の同名パスと区別できる表記を正規形とする（維持）。現行の配置接頭辞の正は runtime-package-boundary.md Design が所有する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0207
    target_req: null
    target_design: docs/designs/skills/agentdev-workflow-templates.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single

test_strategy:
  - id: TS-001
    target_item: AG-002
    verification: |
      repo root を cwd として bun test ./scripts/self/release/scripts-layout.test.ts を実行する。
    pass_criteria: |
      全テスト pass であること。置換後の src/common/tools/agentdev-gh/local root を含む退廃エントリ名検査が pass すること。
    on_failure: |
      fix-and-reverify。検査対象リストの置換を修正して再検証する。
  - id: TS-002
    target_item: AG-001
    verification: |
      検索系検証。rg で opencode-local を docs/designs/skills/agentdev-workflow-templates.md から検索し、rg で src/common/tools/agentdev-gh/local/ が同ファイルの対象節に存在することを確認する。網羅範囲と修正対象列挙の一致: 修正対象は同ファイル 1 節のみであり、検索範囲（同ファイル全体）は対象節を含む。
    pass_criteria: |
      同ファイルから opencode-local が 0 件であること。対象節に現行接頭辞と権威参照の1文が存在すること。
    on_failure: |
      fix-and-reverify。節の内容を修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      検索系検証。rg で opencode-local を検索範囲（docs/designs、docs/guides、docs/knowledge、docs/decisions、docs/requirements、src、scripts、ルート *.md。.opencode/ は junction 投影のため実体走査で網羅、docs/reports/ は履歴記録領域として除外）から再実行し、各残存が AG-003 の分類と一致することを照合する。
    pass_criteria: |
      未分類の現行規範面残存が 0 件であること（残存はすべて禁止列挙・検出語彙・履歴注記・観測記録の分類と一致する）。
    on_failure: |
      fix-and-reverify。同一関心の語彙是正として本 Case の対象へ追加し再検証する。

realization_actions:
  - id: RA-001
    concern: リリース検査スクリプトの検査対象リスト是正
    responsibility: scripts/self/release/scripts-layout.test.ts（REQ-050-014 の検証資産）の検査対象リスト。旧語彙 root の除去と現行 local パス root への置換。
    ownership_hints:
      - scripts/self/release/scripts-layout.test.ts L186-192（修正対象）
      - src/common/tools/agentdev-gh/local/（置換後の検査対象。退廃エントリ名残存 0 件を実測済み）
    intent: 実在しないディレクトリを検査する無意味な検査対象を解消し、local 領域の退廃エントリ名検査の被覆を復活させる。
    verification_refs: [TS-001]
    source_items: [AG-002]

decision_judgments:
  - target: new:opencode-local-legacy-vocabulary
    result: 不要
    applicable_criteria: Decision を作成してはならない条件（既存の設計に基づく不具合修正・既存文書種別への適合）、作業手段 Decision 拒否ゲート
    grounds: |
      語彙・検査対象の陳腐化是正であり、現行配置の正は runtime-package-boundary.md Design として既に確立済み。新しい配置方針の決定を含まない。「（維持）」規則の値の是正は仕様記述の陳腐化修正である。既存 Decision との重複確認: Decision 候補なしのため確認対象なし。

review_dispositions:
  - id: RD-001
    source_ru: RU-0207
    source_item: Sources-Case #3670（PR #3669、merge 5958fe7e）で実施済みのガイド 2 ファイル旧パス是正
    disposition: not_applicable
    reason_code: already_satisfied
    reason: |
      当該 Case でガイド 2 ファイルの旧パス是正は実施済みであり、本件はその対象外として残存した2件（Design 記述・リリース検査）を対象とする。
    evidence:
      path: null
      section: null
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0207
    source_item: 残存調査で分類した意図的言及 4 箇所（runtime-package-boundary L367、IR-057、DEC-004、knowledge L53）
    disposition: rejected
    reason_code: out_of_scope
    reason: |
      禁止列挙・検出語彙・意味不変の決定記録・履歴観測記録であり、旧語彙を正規形と提示していないため是正対象外（AG-003 の分類）。検索系検証 TS-003 で分類との一致を継続確認する。
    evidence:
      path: docs/designs/local/runtime-package-boundary.md
      section: L367（作成禁止列挙）
      checked_at_commit: null
    related_removed_items: []

assembly_evidence:
  - target_file: docs/designs/skills/agentdev-workflow-templates.md
    target_content_sha256: d9172652464029c2660e9e771c9ae07e3dcb4e90563f2de004be97ac9af6fc89
    check_scope:
      heading: "### 対象範囲表記の正規形"
      start_line: 101
      end_line: 104
    execution_conditions:
      operation: replace
      edit_sha256: 78c3b3cbfa19d914ec8d523c44c3f9e1c7a06d6755d1f0a8892f68459d94d1fe
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.1.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: search-target-area.ts compatible: normalizeTargetArea + exact match only
      scan_scope: target section only
    checks_summary:
      pre: { count: 3, all_ok: true }
      post: { count: 3, all_ok: true }
    diff_compact:
      changed_lines_count: 1
      added: 1
      removed: 1
    executed_at: 2026-10-13T12:50:07.225Z

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

bugfix・standard。Design 保存操作 1 件（agentdev-workflow-templates.md「対象範囲表記の正規形」節の update、case-ready が適用）と実現面修正 1 件（scripts-layout.test.ts、case-run が実施）。横断残存調査は req-define 実行時に完了しており、残存の分類を AG-003・RD-002 に記録。STEP-8 adversarial-review の所見: Design 修正を artifact_actions 経由（Definition 保存）とする機構適合を反証の上維持、TS-003 へ junction 投影分の網羅注記を追加して受理。未解決のユーザー判断事項なし。
