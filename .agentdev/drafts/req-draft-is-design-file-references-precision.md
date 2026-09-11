---
draft_type: req_draft
topic_slug: is-design-file-references-precision
status: saved
created_at: 2026-09-11
source_rus: [RU-0011]
design_actions_consumed: true
---

# draft-data

```yaml
# adversarial-review (STEP-8): skipped — references 配下除外採用は RU 承認済み方向（規約側を正とする）の適用であり、現行保守的挙動の仕様化との選択も RU 側 Source Summary で既に提示済み。Decision 判断対象なし、req-define が新たに導入した意味的決定なし
# work_type: check_changed_docs.ts 実装変更（isDesignFile 判定）と契約 Design 更新を伴う
work_type: maintenance

# scale: feature のみ判定対象。maintenance のため未設定
scale: null

summary: check_changed_docs.ts の isDesignFile が docs/designs/**.md を一律 Design 判定し references 配下を区別しない過剰検出（references 配下新規ファイルで design_readme_update_required フラグが立つ）を解消する。規約側（references は独立行登録しない・親 Design 行の備考欄で言及）を正として、isDesignFile へ references 配下除外を追加する。正規 Design 変更のみを判定対象とし、誤 pass（正規 Design 変更の見逃し）を生まないことを検証条件とする。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      規約側（docs/designs/README.md の references 登録規約: references 配下は独立行登録しない、
      親 Design 行の備考欄で言及する）を正として、check_changed_docs.ts の isDesignFile 判定へ
      references 配下除外を追加する。docs/designs/**/references/** 配下の新規・変更ファイルは
      Design 判定の対象外とし、design_readme_update_required: true を立てない。
      targeted-docs-guard-implementation 系契約（isDesignFile の判定契約を規定する Design）を
      更新する。
  - id: AG-002
    content: |
      過剰検出解消の前提として誤 pass（正規 Design 変更の見逃し）を生まないことを
      検証条件とする。references 配下除外は docs/designs/{domain}/{slug}.md 直下の
      正規 Design ファイルの判定を変えない。親 Design 行の備考欄更新が必要な
      references 追加（references は親 Design 行の備考欄で言及する規約）で、
      親 Design ファイル自体も変更されている場合は引き続き Design 判定される。

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/integrity/targeted-docs-guard-implementation.md
    target_design:
      operation: update
      domain: integrity
      slug: targeted-docs-guard-implementation
    target_area: check_changed_docs の Design 判定（isDesignFile）を規定するセクション
    source_items: [AG-001, AG-002]
    content: |
      isDesignFile の判定契約を次のとおり更新する。
      - docs/designs/{domain}/{slug}.md 直下の正規 Design ファイルは Design 判定対象とする
      - docs/designs/**/references/** 配下のファイルは references 登録規約
        （独立行登録しない・親 Design 行の備考欄で言及）に従うため Design 判定対象外とする
        （design_readme_update_required の発火対象外）
      - 除外の影響は references 配下のみに限定し、正規 Design ファイルの見逃し（誤 pass）を
        生まない。親 Design ファイル自体の変更は引き続き Design 判定対象とする

conflict_resolutions:
  - id: CR-001
    conflict: 規約側を正として checker 判定へ references 配下除外を追加するか、現行の保守的挙動（過剰検出）を仕様化するか
    resolution: |
      規約側を正として references 配下除外を追加する。根拠:
      ① references 登録規約（独立行登録しない・親行備考欄言及）は docs/designs/README.md で
      既に確立した運用であり、checker 判定が規約と乖離している状態は過剰検出（誤 pass ではなく
      誤アラート）として継続コストを生む、
      ② 現行保守的挙動の仕様化は誤アラートの常態化であり、正規 Design 変更の検出精度を下げる。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0011
    target_req: null
    target_design: docs/designs/integrity/targeted-docs-guard-implementation.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      修正後、references 配下の新規ファイル（perspective-registry.md 相当）のみを変更した状態で
      check_changed_docs を実行し、design_readme_update_required: true が立たないことを確認する。
      正規 Design ファイル（docs/designs/{domain}/{slug}.md）を変更した状態では
      引き続き Design 判定されることを比較確認する。
    pass_criteria: |
      references 配下のみの変更で過剰検出が 0 件。正規 Design 変更の検出が維持されている
      （誤 pass が 0 件）。
    on_failure: |
      fix-and-reverify。除外パターンの過剰適用（正規 Design の見逃し）を修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      親 Design ファイルと references 配下を同時に変更した状態（references 追加 + 親行備考欄更新）で
      check_changed_docs を実行し、親 Design 変更が Design 判定されることを確認する。
      targeted-docs-guard-implementation.md の判定契約記述が実装挙動と一致していることを突合する。
    pass_criteria: |
      親 Design 変更が Design 判定される。契約記述と実装の乖離が 0 件。
    on_failure: |
      fix-and-reverify。実装または契約記述の乖離を修正して再検証する。

realization_actions:
  - id: RA-001
    concern: check_changed_docs.ts の isDesignFile への references 配下除外追加
    responsibility: |
      check_changed_docs（変更ファイル限定検査）の実行契約は REQ-010（自己監査コマンド）と
      targeted-docs-guard-implementation Design（実装詳細）が正規所有する。
      検査スクリプト実体は repo-agentdev-integrity skill 配下
      （.opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts と
      その配布ソース）が担う。references 登録規約の正は docs/designs/README.md。
    ownership_hints:
      - .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts（isDesignFile）
      - docs/designs/integrity/targeted-docs-guard-implementation.md
      - docs/designs/README.md（references 登録規約）
    intent: |
      規約と checker 判定の乖離（references 配下の過剰検出）を解消し、
      Design README 規約に沿った変更で不要な design_readme_update_required を発生させない。
    verification_refs: [TS-001, TS-002]
    source_items: [AG-001]

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints: []
```

# summary

RU-0011（check_changed_docs の Design 判定 references 配下区別精度改善）を maintenance として要件化した。references 登録規約を正として isDesignFile へ references 配下除外を追加し、正規 Design 変更の検出（誤 pass なし）を検証条件に保持する。
