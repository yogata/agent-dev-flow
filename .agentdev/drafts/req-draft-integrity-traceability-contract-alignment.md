---
draft_type: req_draft
topic_slug: integrity-traceability-contract-alignment
status: saved
created_at: 2026-08-24T12:00:00+09:00
source_rus:
  - RU-0001
---

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
work_type: feature

# scale: feature のみ standard / large
scale: standard

# summary: 当該 draft が何を合意したかの1段落要約
summary: |
  RU-0001（Skill整合性検査の過剰制約是正と要件トレーサビリティ完了条件の強化）を要件化した。
  A系統として check_skill_rename_symmetry の恒常 path-symmetry 検査（配布Skillごとの同名Skill Design存在要求）を廃止し、
  恒常検査を frontmatter id と物理 path の整合に限定する（REQ-010-063 UPDATE、targeted-docs-guard-implementation Design 是正）。
  B系統として REQ-049-001〜004 への実装対応宣言補完と、REQ-049 全30要件行の検証対応要否分類・
  恒久検証対応付け・検証対応要否カタログ登録を反映作業として定義する（REQ-049 の要件行自体は変更しない）。
  C系統として新規要件行の検証要否分類漏れを段階制ゲートで防止する
  （分類状態はカタログ登録と検証対応宣言から導出、req-save は検出・記録のみ、case-open は分類必須ゲート、
  case-close は未分類・必須行検証欠落の完了阻止。REQ-021 append、REQ-012 append、traceability-model Design 拡張）。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目
agreed_items:
  - id: AG-001
    content: |
      Skill rename 対称性検査（check_skill_rename_symmetry）の検査契約を現行 Workflow Skill 設計に適合させる。
      配布 Skill ごとに同名の Skill Design（docs/designs/skills/{skill-name}.md）の存在を要求する恒常 path-symmetry 検査を廃止し、
      Workflow Skill が専用の同名 Skill Design を持たないことだけを理由とする違反検出をなくす。
      恒常検査として維持するのは、SKILL.md の frontmatter 識別子と Skill ディレクトリ名・物理 path の整合、
      および Design frontmatter 識別子と Design 自身の物理 path の整合である。
      skill rename に固有の旧名・新名間の対称性検査（src/opencode/skills/{name} と docs/designs/skills/{name} の物理 path 一致）は、
      rename を伴う変更に対してのみ実施する。
      checker（check_skill_rename_symmetry.ts）、規定 Design（targeted-docs-guard-implementation.md
      「skill rename 対称性検査観点」セクション）、規定要件行（REQ-010-063）、回帰テストは同一の検査契約を反映し、
      互いに異なる不変条件を持たない。
      現行 Workflow Skill を適法な構造のまま維持するためだけの専用 Skill Design を量産しない。
      checker 是正は新規 REQ の CREATE ではなく、既存 REQ-010-063 および関連 Design・checker・テストの整合是正として扱う。
  - id: AG-002
    content: |
      REQ-049-001〜004（課題管理の追跡責務、対象非限定、反映先決め打ち禁止、責務分離）は実装不足ではなく
      実装対応宣言漏れとして扱い、既に存在する正規成果物（docs/issue-list/ 体系、issue-tracking Capability Skill 等）へ
      ADF-COVERS(implementation) 宣言を補完する。
      REQ-049 の要件行自体と既存機能仕様は変更しない。
  - id: AG-003
    content: |
      REQ-049 全30要件行を検証対応必須または検証対応任意のいずれかへ分類する。
      判定基準は traceability-model Design「対応関係の完全性規則」（恒続的な成果物として検証可能な対象を持つか）に従う。
      検証対応必須行は、既存の恒久検証手段で検証可能な場合は既存手段へ ADF-COVERS(verification) として対応付け、
      既存手段では検証できない場合に限り新しい恒久検証手段を追加する。
      検証対応任意行は検証対応要否カタログ（docs/designs/foundations/references/verification-scope-catalog.md）へ登録する。
      単発の PR 内検証結果だけを恒久的な検証対応として扱わない。
      既存検証手段で十分な要件行へ同等機能の新規テストを重複追加しない。
  - id: AG-004
    content: |
      新規 REQ または要件行追加時の検証対応要否の分類漏れを、工程の段階制で防止する。
      分類状態は独立した台帳を持たず、検証対応要否カタログへの登録状態と検証対応宣言の有無から導出する
      （未分類 = 検証対応宣言なし かつ カタログ未登録）。
      req-save は未分類の新規要件行を検出・記録するが、未分類だけを理由として保存を禁止しない（REQ-021-012 と整合）。
      case-open は対象要件行に未分類行が残る場合、Issue を作成せず停止し、
      検証対応要否の分類完了を case-open または実装着手前までの必須条件として扱う。
      case-close は未分類行の存在、および検証対応必須行への恒久検証対応の欠落を完了として扱わない。
      検証対応任意行に恒久テストが存在しないことだけを理由として case-close が失敗しない。
      分類漏れの解消だけを目的として、不必要なテストや形式的な検証成果物を追加しない。
      検証対応任意とした要件行は、その分類を検証対応要否カタログへ反映する。

# artifact_actions: REQ/Decision/Design への保存対象（統合配列）
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-010.md
    source_items: [AG-001]
    content: |
      REQ-010 の要件テーブルにおける REQ-010-063 を次の文言へ差し替える:
      | REQ-010-063 | docs-check の検査は SKILL.md の frontmatter id と Skill ディレクトリ名・物理 path の不一致、および Design frontmatter id と Design ファイルの物理 path の不一致を検出し、warn または error として報告すること（恒常検査契約）。配布 skill ごとに同名の Skill Design の存在を恒常的な不変条件として要求せず、skill rename に固有の旧名・新名間の対称性検査は rename を伴う変更に対してのみ実施すること |
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-021.md
    source_items: [AG-004]
    content: |
      REQ-021 の要件テーブルへ次の3行を追加する:
      | REQ-021-023 | req-save は、保存対象の新規 REQ または追加要件行のうち検証対応要否が未分類（検証対応宣言が存在せず、検証対応要否カタログにも未登録）の行を検出し、未分類行として保存結果に明示的に記録すること。未分類行の存在だけを理由として req-save を失敗させないこと（REQ-021-012 と整合） |
      | REQ-021-024 | case-open は、対象要件行に未分類の行が残る場合、Issue を作成せずに停止し、検証対応要否の分類完了を case-open または実装着手前までの必須条件として扱うこと |
      | REQ-021-025 | case-close は、対象要件行に未分類の行が残る場合、または検証対応必須行に恒久検証対応が存在しない場合、完了として扱わないこと。検証対応任意行に恒久的な検証手段が存在しないことだけを理由として完了を阻害しないこと |
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-012.md
    source_items: [AG-004]
    content: |
      REQ-012 の要件テーブルへ次の1行を追加する:
      | REQ-012-051 | 検証対応要否の分類状態は、検証対応要否カタログへの登録状態と検証対応宣言の有無から導出すること（未分類 = 検証対応宣言なし かつ カタログ未登録）。分類状態のみを保持する独立した台帳、REQ frontmatter 項目、派生索引を新設しないこと |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/integrity/targeted-docs-guard-implementation.md
    target_area: "## skill rename 対称性検査観点"
    source_items: [AG-001]
    content: |
      「skill rename 対称性検査観点」セクションを次の検査契約へ置換する:
      - 恒常検査は frontmatter id と物理 path の整合（SKILL.md frontmatter name ↔ Skill ディレクトリ名、
        Design frontmatter 識別子 ↔ Design ファイルの物理 path）に限定する。不一致は warn または error として報告する
      - 配布 skill ごとに同名の Skill Design（docs/designs/skills/{skill-name}.md）の存在を恒常的な不変条件として要求しない。
        Workflow Skill が専用の同名 Skill Design を持たないことは違反としない
      - src/opencode/skills/{name} と docs/designs/skills/{name} の物理 path 一致検査は、
        skill rename を伴う変更に対してのみ実施する
      - status: superseded の Design に対応する skill dir 欠落の許容など既存の例外処理は維持する
      - 実装節は check_skill_rename_symmetry.ts が上記契約を反映することを明記する
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/foundations/traceability-model.md
    target_area: "## 対応関係の完全性規則"
    source_items: [AG-004]
    content: |
      「対応関係の完全性規則」セクションへ次を追記する:
      - 検証対応要否の分類状態の導出定義: 未分類 = 検証対応宣言なし かつ 検証対応要否カタログ未登録。
        分類状態のみを保持する独立した台帳を新設しない
      - 段階ゲートの判定方法: req-save は新規要件行の未分類を検出・記録する（保存は許容）。
        case-open は未分類行の残存を停止条件とする。case-close は未分類行と検証対応必須行の
        恒久検証対応欠落を完了阻止条件とする
      - 新規 REQ・要件行追加時に本規則が自動的に適用されることを明記する
        （REQ-021-023〜025、REQ-012-051 との整合）

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: |
      REQ-021-012（req-save は実装対応・検証対応が存在しないことを理由に失敗させない）と、
      新規の req-save 未分類検出・記録契約（REQ-021-023）の文言近接。
    resolution: |
      検出・記録は保存の失敗ではないため両立する。req-save は未分類を記録するが保存を阻止せず、
      阻止は case-open（分類必須ゲート）と case-close（完了阻止）が担う段階制として整理した。

# operation_units: 統合/分離結果（REQ 操作単位）
operation_units:
  - ou_id: OU-1
    source_ru: RU-0001
    target_req: REQ-010
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      status: applied
      saved_docs:
        - docs/requirements/REQ-010.md
      action_ids: [ACT-REQ-001]
  - ou_id: OU-2
    source_ru: RU-0001
    target_req: REQ-021
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result:
      status: applied
      saved_docs:
        - docs/requirements/REQ-021.md
      action_ids: [ACT-REQ-002]
  - ou_id: OU-3
    source_ru: RU-0001
    target_req: REQ-012
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result:
      status: applied
      saved_docs:
        - docs/requirements/REQ-012.md
      action_ids: [ACT-REQ-003]
  # OU-4 は REQ-049.md の要件行変更を行わない反映作業 Unit。
  # 実装対応宣言補完（REQ-049-001〜004）と検証要否分類・カタログ登録・必須行検証対応付けが作業内容（AG-002/AG-003）。
  - ou_id: OU-4
    source_ru: RU-0001
    target_req: REQ-049
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result: {}

# test_strategy: 各合意項目の検証方法（3要素構造）
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      check_skill_rename_symmetry の回帰テストにおいて、(1) 同名 Design を持たない Workflow Skill
      （agentdev-workflow-* 相当の fixture）が path-symmetry 違反として検出されないこと、
      (2) SKILL.md frontmatter name とディレクトリ名を意図的に不一致にした例を違反検出できること、
      (3) Design frontmatter 識別子と物理 path を不一致にした例を違反検出できること、
      (4) rename を伴う変更で旧名・新名の対応が不整合な例を違反検出できること、
      (5) rename を伴わない通常変更で rename 専用の対称性条件が要求されないことを確認する。
      加えて docs-check 実行で現行 Workflow Skill 群（同名 Design を持たない17件）が違反として報告されないことを確認する。
    pass_criteria: |
      (1)〜(5) の全ケースが期待どおり判定され、REQ-010-063・targeted-docs-guard-implementation.md・
      checker・回帰テストが同一の検査契約を示していること。
      是正目的だけの新規 Skill Design が追加されていないこと。
    on_failure: |
      fix-and-reverify。checker またはテストが契約と乖離する場合、REQ/Design/checker/テストを
      同一契約へ揃えて再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      REQ-049-001〜004 の ADF-COVERS(implementation) 宣言について、該当成果物（docs/issue-list/README.md 等）への
      追加後、rg による宣言存在確認と agentdev-traceability の coverage（REQ-049-001..004 指定）で
      実装対応が1件以上返ることを確認する。
    pass_criteria: |
      REQ-049-001〜004 のそれぞれに実装対応が1件以上存在し、既存実装成果物との対応として解決されていること。
    on_failure: |
      fix-and-reverify。宣言漏れ行が残る場合、対応する実装成果物を特定して宣言を追加し、再確認する。
  - id: TS-003
    target_item: AG-003
    verification: |
      REQ-049 全30要件行について、(1) 検証対応必須/任意の分類結果（verification 宣言またはカタログ登録）を確認、
      (2) agentdev-traceability の check で REQ-049 を指定し、実装対応漏れ・検証必須行の検証対応漏れ・
      未分類が0件であることを確認、(3) 既存検証手段で十分な行へ重複する新規テストが追加されていないことを確認する。
    pass_criteria: |
      未分類0件、検証対応必須行すべてに恒久検証対応が1件以上存在すること、
      検証対応任意行が検証対応要否カタログへ反映されていること、重複テストがないこと、
      単発の PR 内検証結果が恒久対応として登録されていないこと。
    on_failure: |
      fix-and-reverify。未分類・検証不足が残る場合、既存検証手段への対応付けを優先し、
      真に不足する場合のみ恒久検証を追加して再検査する。
  - id: TS-004
    target_item: AG-004
    verification: |
      fixture による段階ゲートの決定的検証。
      (1) 未分類要件行を含む要件を req-save すると保存が成功し、未分類行が記録されること、
      (2) 未分類行が残るまま case-open を実行すると停止すること、
      (3) 全行を検証対応必須または任意へ分類すると停止が解除されること、
      (4) 未分類行が残る状態で case-close を実行すると完了できないこと、
      (5) 検証対応必須行の恒久検証対応が欠落した状態で case-close を実行すると完了できないこと、
      (6) 全行分類済みかつ必須行に恒久検証対応が存在する場合、本要件起因の完了阻止が発生しないこと、
      (7) 任意行に恒久テストが存在しないことだけを理由として case-close が失敗しないことを確認する。
    pass_criteria: |
      (1)〜(7) の全状態遷移が期待どおり動作すること。
    on_failure: |
      fix-and-reverify。ゲート実装（req-save/case-open/case-close の Workflow Skill）を修正し、
      fixture で再検証する。

# review_dispositions: 採否判断の記録
review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: "RU-0001:要件化の方向A"
    disposition: covered
    reason_code: covered_by_this_draft
    reason: |
      A系統（Skill整合性検査是正）は AG-001・ACT-REQ-001・ACT-DESIGN-001・OU-1 として本 draft へ反映した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 要件化の方向 A
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0001
    source_item: "RU-0001:要件化の方向B"
    disposition: covered
    reason_code: covered_by_this_draft
    reason: |
      B系統（REQ-049 トレーサビリティ補完）は AG-002・AG-003・OU-4 として本 draft へ反映した。
      REQ-049 の要件行自体の変更は行わない。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 要件化の方向 B
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0001
    source_item: "RU-0001:要件化の方向C"
    disposition: covered
    reason_code: covered_by_this_draft
    reason: |
      C系統（検証分類漏れ再発防止）は AG-004・ACT-REQ-002・ACT-REQ-003・ACT-DESIGN-002・OU-2/OU-3 として本 draft へ反映した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: 要件化の方向 C
      checked_at_commit: null
    related_removed_items: []

# case_open_hints: case-open 構成生成への参考情報
case_open_hints:
  epic_needed: false
  decomposition: |
    OU-1（REQ-010 update: checker是正）/ OU-2（REQ-021 append: 工程ゲート契約）/
    OU-3（REQ-012 append: 分類状態導出契約）/ OU-4（REQ-049 対応関係補完: 要件行変更なしの反映作業）は
    相互に必須依存がない。技術的には全 OU 並行着手可能。
  wave_hints:
    - "OU-1・OU-4 は既存契約の範囲で完結し即時着手可能"
    - "OU-2・OU-3 は同一ゲート機構の両面（工程契約とデータ契約）のため同時着手を推奨"
```

# summary

RU-0001 を1つの要件doc にまとめた。A系統（checker 是正）は REQ-010-063 の UPDATE と integrity Design の是正、B系統（REQ-049 補完）は宣言・カタログ登録の反映作業（要件行変更なし）、C系統（再発防止）は REQ-021/REQ-012 への APPEND と traceability-model Design の拡張として構成した。実証Caseではなく通常Case（main ブランチ）。REQ-049 以外の既存トレーサビリティ欠落は対象外。
