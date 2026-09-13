---
draft_type: req_draft
topic_slug: bun-test-execution-convention
status: design_saved
created_at: 2026-09-14T05:33:01+09:00
source_rus:
  - RU-0003
---

# draft-data

```yaml
work_type: docs_chore

summary: >
  bun test の実行起点（cwd）とパス指定形式の非統一により環境依存 fail・テスト未実行（0 件実行）が
  繰り返し発生した学び（case 2766/2768/2777/2779）を要件化した。bun test の全実行（フル suite の
  3 cwd 分割正規形に加え、単独実行・ファイル単体指定を含む）を「repo root 起 cwd + `./` 付きパス指定」
  に統一する規約を checker 実行契約 Design に新規セクションとして明文化し、逸脱時の検知条件を併記する。
  QG-4 フル suite 正規形の所有権（agentdev-quality-gates）は侵食せず、参照・補完に留める。
  実現面として docs/knowledge/ 知識文書の新規作成と agentdev-quality-gates 配布 references からの
  参照追加を realization_actions に記録する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      bun test の全ての実行（フル suite の 3 cwd 分割正規形に加え、単独実行・ファイル単体指定を含む）は、
      起動 cwd をリポジトリルート（main root または worktree root）に統一し、対象パスを `./` 付き
      相対パスで指定する。`.opencode/...` のような `./` なし表記は bun test のパスフィルタで
      no test files matched となり 0 件実行になるため標準としない。ファイル単体指定も `./` 付きとする。
      worktree 実行時は依存パッケージ前置（bun install）の要否を事前確認する。
  - id: AG-002
    content: |
      逸脱時の検知条件を実行形態契約に併記する: (1) REPO_ROOT を cwd からの相対解決で求めるテストの
      fail（repo root 以外の cwd 起動時に発生し、全件が環境依存 fail として観測され得る）、
      (2) bun test 出力の no test files matched による 0 件実行（`./` なしパス指定時）、
      (3) worktree node_modules 未伝播由来の依存解決失敗（Cannot find package 等）。
      検知条件は実効性を検証する（逸脱形態で実際に再現することを確認）。
  - id: AG-003
    content: |
      QG-4 フル suite 正規形（3 cwd 分割実行、正規ランナー構成確認、環境ラベル、fail 由来分類、
      機械受理基準）の所有権は agentdev-quality-gates（docs/designs/skills/agentdev-quality-gates.md
      と同スキル references/qg-4-final-acceptance.md）に留める。checker 実行契約側の新規セクションは
      bun test 単独実行・ファイル単体指定時の一般規約を所有し、正規形への参照・補完に留まり、
      所有権を侵食しない。
  - id: AG-004
    content: |
      bun test 実行形態由来の環境依存 fail・0 件実行の知識を docs/knowledge/ に新規知識文書として
      文書化する（REQ-056 の正規知識領域、1知識1 Markdown ファイル）。既存の bun test 関連知識3件
      （bun-test-junit-reporter-evidence、windows-bun-test-spawn-timeout-classification、
      checker-cli-stdout-loss-on-windows-bun）は別現象のため重複せず、See Also で相互参照する。
  - id: AG-005
    content: |
      agentdev-quality-gates 配布 references（src/opencode/skills/agentdev-quality-gates/references/
      qg-4-final-acceptance.md）から、bun test 単独実行・ファイル単体指定の一般規約
      （checker 実行契約 Design の新規セクション）への参照を追加する。正規形の所有権・記述内容の
      変更は行わない（参照の追加のみ）。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:bun-test-execution-convention
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005]
    content: |
      # bun test 実行形態の統一（repo root 起 cwd・`./` 付きパス指定）

      bun test の全ての実行（フル suite の 3 cwd 分割正規形に加え、単独実行・ファイル単体指定を含む）は、
      起動 cwd をリポジトリルートに統一し、対象パスを `./` 付き相対パスで指定すること。
      ファイル単体指定も `./` 付きとすること。

      bun test 実行形態契約に逸脱時の検知条件（REPO_ROOT 解決系テストの fail、no test files matched
      出力、worktree node_modules 未伝播由来の依存解決失敗）が併記されていること。

      当該契約は QG-4 フル suite 正規形（agentdev-quality-gates 所有）を侵食せず、参照・補完に留まること。

      bun test 実行形態由来の環境依存 fail・0 件実行の知識が docs/knowledge/ に文書化され、既存
      bun test 関連知識と相互参照されること。agentdev-quality-gates 配布 references から実行形態規約
      への参照が存在すること。
  - id: ACT-DESIGN-001
    artifact: design
    operation: append
    target_design:
      operation: update
      domain: integrity
      slug: checker-execution-contracts
    target_area: "## bun test 実行形態契約（単独実行・ファイル単体指定を含む）"
    placement: before_anchor
    anchor: "## See Also"
    canonical_owner: checker 実行契約（docs/designs/integrity/checker-execution-contracts.md。checker 共通実行契約・安定実行経路を正規所有する Design。bun test 単独実行・ファイル単体指定時の一般規約を本 Design が所有し、QG-4 フル suite 正規形は agentdev-quality-gates が正規所有する領域として参照に留める）
    source_items: [AG-001, AG-002, AG-003]
    content: |
      ## bun test 実行形態契約（単独実行・ファイル単体指定を含む）

      bun test の全ての実行は、フル suite の 3 cwd 分割正規形（agentdev-quality-gates が正規所有）に
      加えて、次の実行形態に統一する。本節は bun test 単独実行・ファイル単体指定時の一般規約を所有し、
      フル suite 合格判定の実行形態契約（QG-4）を侵食しない。

      - 起動 cwd はリポジトリルート（main root または worktree root）に統一する。scripts 配下等、
        repo root 以外を cwd にした実行を標準としない
      - 対象パスは `./` 付き相対パスとして指定する。`.opencode/...` のような `./` なし表記は bun test の
        パスフィルタで no test files matched となり 0 件実行になるため標準としない。
        ファイル単体指定も `./` 付きとする
      - worktree 実行時は依存パッケージ前置（bun install）の要否を事前確認する
        （node_modules 未伝播の依存解決 fail 予防。詳細は agentdev-git-worktree の worktree 構造的制約を参照）

      逸脱時の検知条件（次のシグナルが観測された場合は実行形態逸脱を疑う）:

      - REPO_ROOT を cwd からの相対解決で求めるテストの fail（repo root 以外の cwd 起動時に発生。
        全件が環境依存 fail として観測され得る）
      - bun test 出力に no test files matched が含まれ、実行件数 0 件となる（`./` なしパス指定時）
      - 依存解決失敗（Cannot find package 等）が worktree node_modules 未伝播由来で発生

      QG-4 フル suite 正規形（3 cwd 分割実行、正規ランナー構成確認、環境ラベル、fail 由来分類）は
      agentdev-quality-gates が正規所有する。本節はその所有権を変更せず、単独実行・ファイル単体指定時の
      一般規約と正規形への参照を提供する。

conflict_resolutions:
  - id: CR-001
    conflict: |
      bun test 単独実行・ファイル単体指定の一般規約を checker 実行契約 Design
      （checker-execution-contracts.md）に置くか、QG-4 正規形の所有者である agentdev-quality-gates 側
      （Design と references/qg-4-final-acceptance.md）に置くか。
    resolution: |
      checker 実行契約 Design に置く。根拠: 同 Design は checker 共通実行契約と安定実行経路を正規所有し、
      bun test 単独実行は QG-4（フル suite 合格判定）に限定されない一般の checker 実行関心である。
      QG-4 正規形はフル suite 合格判定の実行形態であり、一般規約を品質ゲート側へ混在させると
      責務境界が曖昧になる。一般規約を checker 実行契約側に置き、QG-4 正規形への参照・補完に留める
      （AG-003、REQ-057-004 と整合）。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0003
    target_req: new:bun-test-execution-convention
    target_design: docs/designs/integrity/checker-execution-contracts.md
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      status: saved
      saved_reqs: [REQ-060]
      target_req_resolved: REQ-060
      artifact_action_mapping:
        ACT-REQ-001: REQ-060
        ACT-DESIGN-001: docs/designs/integrity/checker-execution-contracts.md
      ru_mapping:
        RU-0003: REQ-060
      uncategorized_verification_rows: [REQ-060-001, REQ-060-002, REQ-060-003, REQ-060-004, REQ-060-005]
      notes: |
        ACT-DESIGN-001（artifact: design、checker-execution-contracts.md append）は design-save の
        対象として本 workflow では未処理。次経路: design-save → case-open。
        design-save により ACT-DESIGN-001 を docs/designs/integrity/checker-execution-contracts.md へ
        append 済み（frontmatter status: design_saved、See Also 直前配置）。次経路: case-open。
        uncategorized_verification_rows は検証対応要否が未分類の要件行（検証対応宣言なし かつ
        カタログ未登録）。分類完了は case-open または実装着手前までの必須条件
        （検証対応任意行としてのカタログ登録、または検証対応宣言を持つ恒久検証手段の整備）。

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs/designs/integrity/checker-execution-contracts.md の新規セクション「bun test 実行形態契約
      （単独実行・ファイル単体指定を含む）」を読み、実行形態（repo root 起 cwd、`./` 付きパス指定、
      ファイル単体指定も `./` 付き）が明記されていることを確認する。
    pass_criteria: |
      実行形態の3要素（cwd 統一、`./` 付き指定、ファイル単体指定も `./` 付き）が逸脱形態の禁止記述を
      含めて明記されていること。
    on_failure: |
      fix-and-reverify: 記載漏れ・曖昧記述を修正して再検証する。
  - id: TS-002
    target_item: AG-003
    verification: |
      checker-execution-contracts.md の新規セクションと docs/designs/skills/agentdev-quality-gates.md
      「full integrity suite 合格基準（QG-4）における bun test 実行形態契約」節および
      src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md
      「bun test フル suite 正規形（実行形態契約）」節を突合し、記述矛盾・所有権侵食がないことを確認する。
    pass_criteria: |
      3 cwd 分割正規形の記述に矛盾がなく、agentdev-quality-gates 側の所有記述（正規形の詳細は同スキル
      references が所有）が変更されていないこと。checker 側新規セクションは参照・補完に留まっていること。
    on_failure: |
      fix-and-reverify: 矛盾・侵食記述を修正して再検証する。
  - id: TS-003
    target_item: AG-004
    verification: |
      docs/knowledge/ に新規知識文書が作成されていること、docs/knowledge/README.md の索引との整合が
      取れていること、See Also による既存 bun test 関連知識3件との相互参照が解決することを確認する。
    pass_criteria: |
      知識文書が存在し、既存3件との相互参照リンクが全て解決すること（リンク切れ 0 件）。
    on_failure: |
      fix-and-reverify: リンク・索引を修正して再検証する。
  - id: TS-004
    target_item: AG-002
    verification: |
      逸脱実行の再現検証（production-equivalent verification）: (1) repo root 以外の cwd
      （例: scripts/ 配下）から bun test を実行し REPO_ROOT 解決系テストの fail が観測されること、
      (2) `./` なしパス（例: .opencode/skills/.../scripts/）を指定して実行し
      no test files matched（0 件実行）が観測されること。観測結果を検証記録に残す。
    pass_criteria: |
      逸脱形態 (1)(2) の双方で、契約に併記した検知条件が実際に観測されること。
    on_failure: |
      fix-and-reverify: 検知条件の記述が実態と乖離する場合、記述を修正して再検証する。

realization_actions:
  - id: RA-001
    concern: bun test 実行形態由来の環境依存 fail・0 件実行の知識文書新規作成
    responsibility: |
      プロジェクト知識の docs/knowledge/ への配置は REQ-056（Project Knowledge の所有と workflow 利用）
      が正規所有する。1知識1 Markdown ファイル（kebab-case slug、固定 ID 採番なし）で作成する。
    ownership_hints:
      - docs/knowledge/（新規ファイル。slug 例: bun-test-execution-form-drift-signals.md）
      - 関連既存知識: docs/knowledge/bun-test-junit-reporter-evidence.md
      - 関連既存知識: docs/knowledge/windows-bun-test-spawn-timeout-classification.md
      - 関連既存知識: docs/knowledge/checker-cli-stdout-loss-on-windows-bun.md
      - docs/knowledge/README.md（知識索引・See Also 整合）
    intent: |
      bun test 実行形態の逸脱による環境依存 fail・0 件実行の事例知識（case 2766/2768/2777/2779）を
      再利用可能な形で残し、既知の bun test 関連知識3件（junit reporter、spawn timeout、stdout loss）
      と判別可能にする。
    verification_refs: [TS-003, TS-004]
    source_items: [AG-004]
  - id: RA-002
    concern: agentdev-quality-gates 配布 references からの実行形態一般規約への参照追加
    responsibility: |
      配布 references（src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md）
      の変更は agentdev-quality-gates スキルの責務範囲であり、QG-4 正規形の所有権を変更しない
      参照の追加に限定する。
    ownership_hints:
      - src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md（参照追加のみ）
      - docs/designs/skills/agentdev-quality-gates.md（bun test 実行形態契約節。変更不要の確認対象）
    intent: |
      QG-4 正規形を参照する工程から、フル suite 以外の実行（単独実行・ファイル単体指定）の一般規約が
      checker 実行契約 Design にあることを到達可能にする。所有権・記述内容の変更は行わない。
    verification_refs: [TS-002]
    source_items: [AG-005]

review_dispositions:
  - id: RD-001
    source_ru: RU-0003
    source_item: RU-0003.direction-1
    disposition: covered
    reason_code: adopted_as_agreed
    reason: |
      「bun test 実行形態として repo root 起 cwd + `./` 付き形式（ファイル単体指定も `./` 付き）を
      実行契約に明記」は AG-001、ACT-REQ-001、ACT-DESIGN-001 として採用した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0003.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0003
    source_item: RU-0003.direction-2
    disposition: covered
    reason_code: adopted_as_agreed
    reason: |
      「逸脱時の検知条件（REPO_ROOT 解決系テストの fail、no test files matched 出力）の併記」は
      AG-002、TS-004 として採用した。worktree node_modules 欠落由来の依存解決失敗も検知条件に
      加筆した（RU Sources の併発リスク記載に基づく）。
    evidence:
      path: .agentdev/backlog/req-units/RU-0003.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0003
    source_item: RU-0003.direction-3
    disposition: covered
    reason_code: adopted_as_agreed
    reason: |
      「QG-4 フル suite 正規形の所有権（agentdev-quality-gates）を侵食しない。正規形への参照・補完に
      留める」は AG-003、CR-001、TS-002 として採用した。現行の所有構造
      （docs/designs/skills/agentdev-quality-gates.md と references/qg-4-final-acceptance.md）を
      実ファイル確認済み。
    evidence:
      path: src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md
      section: bun test フル suite 正規形（実行形態契約）
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0003
    source_item: RU-0003.direction-4
    disposition: covered
    reason_code: adopted_as_agreed
    reason: |
      「知識文書化（docs/knowledge/）と配布 references からの正規形参照を反映候補に含める」は
      AG-004、AG-005、RA-001、RA-002 として採用した。docs/knowledge/ の既存知識3件は別現象であることを
      実ファイル確認済み。knowledge 文書・配布 references は REQ/Decision/Design 以外の成果物のため、
      artifact_actions ではなく realization_actions（ドメイン中立契約）へ記録した。
    evidence:
      path: docs/knowledge
      section: ディレクトリ一覧
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0003
    source_item: RU-0003.acceptance-criteria
    disposition: covered
    reason_code: adopted_as_agreed
    reason: |
      RU の受け入れ条件（実行形態の明記、フル suite 正規形との無矛盾、逸脱検知条件の併記）は
      TS-001、TS-002、TS-004 として検証契約へ投影した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0003.md
      section: 要件化の方向
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

RU-0003（bun test 実行形態の統一）を docs_chore として要件化した。
単独実行・ファイル単体指定の実行形態規約は既存 REQ に保持されていない新規要求のため REQ CREATE とし、
規約本文は checker 実行契約 Design（checker-execution-contracts.md）への新規セクション追加
（append、See Also 直前配置）として分離した。
QG-4 正規形の所有構造（agentdev-quality-gates）は現行のまま維持し、参照・補完に留める。
knowledge 文書化と配布 references 参照追加は実現面として realization_actions へ記録した。
Decision は不要（既存契約体系内の規約明文化、ハード可逆、重複 Decision なし）。
adversarial-review は skip 条件該当（docs_chore・Decision 対象なし・意味的決定は backlog-review 済み）
により省略した。次経路は req-save（REQ 作成）→ design-save（Design append）→ case-open。
