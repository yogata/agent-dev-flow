---
draft_type: req_draft
topic_slug: distribution-baseline-legacy-entry-cleanup
status: draft
created_at: 2026-10-11T15:30:00+09:00
source_rus:
  - RU-0008
---

# draft-data

```yaml
work_type: maintenance

scale: standard

summary: >
  配布依存境界の concrete-id ベースライン（ir-059-baseline.json）から旧 req-draft パス
  （src/opencode/commands/agentdev/templates/req-define/req-draft.md）の DEC-003 エントリを削除する
  baseline cleanup を実施する。旧パスは現行リポジトリに存在せず（該当 0 件）、後継参照
  （docs/designs/commands/req-define.md、docs/designs/responsibilities/artifact-contracts.md、現行
  テンプレート src/common/commands/agentdev/templates/req-define/req-draft.md）が存在するため、
  distribution-boundary Design「concrete-id ベースライン再取得手順」（解消済み違反の baseline 残存と
  現行違反 0 件との差異を解消する）に従う正式な処置として削除し、delta 実行で当該エントリ起因の
  resolved 恒常計上が消えることを確認する。REQ 行の変更は行わない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      baseline cleanup の実施（RU-0008）。ir-059-baseline.json の entries から旧パス
      src/opencode/commands/agentdev/templates/req-define/req-draft.md の DEC-003 エントリ
      （category: concrete-id、count: 1）を削除する。削除の根拠は (1) 旧パスが現行リポジトリで該当 0 件
      であること、(2) 旧パスの後継参照（docs/designs/commands/req-define.md、
      docs/designs/responsibilities/artifact-contracts.md）が docs 側に存在し現行テンプレート
      （src/common/commands/agentdev/templates/req-define/req-draft.md）へ移設済みであること、である。
      本削除は Case #3549（PR #3559 本文）で baseline 自体の更新を契約外として棚卸しへ引き継ぐことが
      合意済みの処置の実行であり、正式な処置判断として本 draft に記録する。baseline 機構自体・他 baseline
      （ng-baseline.json、ir-055-baseline.json 等）は対象外とする。
  - id: AG-002
    content: |
      削除後の確認（RU-0008 受け入れ条件 (2)）。エントリ削除後、配布依存境界 checker
      （check_distribution_boundary。source / link 両 profile）を実行し、当該旧パス起因の resolved 計上が
      報告から消えること、および新規違反の増加（delta）がないことを確認する。再取得の根拠（対象 commit、
      実行コマンド、件数の増減）は distribution-boundary Design の再取得手順に従い PR 本文へ記載する。

conflict_resolutions: []

artifact_actions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0008
    target_req: REQ-029
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    note: >-
      REQ ファイル操作は持たない（実現系 OU）。配布依存境界（REQ-029）の検証運用機構（baseline）の
      データ是正であり、REQ 行・Design の変更を伴わない。
result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      修正後の ir-059-baseline.json を読み取り、entries から旧 req-draft パスの DEC-003 エントリが
      削除されていること（当該 file / matched キーの組が存在しないこと）、JSON 構造（version / rule_id /
      entries）が有効であることを確認する。あわせて他 baseline ファイル（ng-baseline.json、
      ir-055-baseline.json、lint-skills-baseline.json、exemptions.json）が変更されていないことを確認する。
    pass_criteria: |
      旧パス DEC-003 エントリが baseline から存在せず、他 baseline・baseline 机制のコード（checker 本体）に
      変更がないこと。
    on_failure: |
      fix-and-reverify。削除漏れ・JSON 構造破損・対象外ファイルの意図しない変更を検出した場合は修正して
      再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      baseline 削除後、配布依存境界 checker を source / link 両 profile で実行し、報告を確認する
      （checker 実行契約の安定実行経路に従う。repo-local の checker 配置起点での実行）。当該旧パス起因の
      resolved 計上有無と concrete-id 検出の delta（新規違反 0）を確認する。
    pass_criteria: |
      旧パス起因の resolved 計上が報告から消えていること。本変更により新規の concrete-id / concrete-path
      違反が発生していないこと（delta 0）。
    on_failure: |
      fix-and-reverify。resolved 計上が残る・新規違反が発生する場合は baseline エントリの対象範囲と
      checker 報告を突合して修正し、再実行して確認する。

realization_actions:
  - id: RA-001
    concern: ir-059-baseline.json から旧 req-draft パス DEC-003 エントリの削除
    responsibility: >
      IR-059 distribution reference boundary known-violations baseline（repo-local、配布対象外）。
      entries 配列から旧パスエントリを削除する（entries は空配列となる）。
    ownership_hints:
      - ".opencode/skills/repo-agentdev-integrity/baselines/ir-059-baseline.json（L8-12 の旧パス DEC-003 エントリを実測確認）"
      - "手続きの正: docs/designs/integrity/distribution-boundary.md「concrete-id ベースライン再取得手順」節"
      - "checker: .opencode/skills/repo-agentdev-integrity/scripts/check_distribution_boundary.ts（変更対象外）"
    intent: >
      配布境界 delta 実行ごとに resolved: 1 が恒常計上され続け、新規是正数と resolved 数の区別が曖昧に
      なる計数伝播リスク（Case #3549 最終 delta で実測）を解消する。
    verification_refs: [TS-001, TS-002]
    source_items: [AG-001, AG-002]

review_dispositions:
  - id: RD-001
    source_ru: RU-0008
    source_item: RU-0008
    disposition: covered
    reason_code: covered
    reason: |
      baseline cleanup（旧パス DEC-003 エントリ削除）を AG-001 / AG-002 + RA-001 で採用。受け入れ条件
      (1)(2)(3) を TS-001 / TS-002 で検証、処置判断と根拠の記録を本 draft（AG-001）と PR 本文（AG-002）
      で担保。対象外（docs/knowledge/distribution-boundary-diff-normalized-matching.md、baseline 機構自体
      の変更）を AG-001 に反映。RU の実現先候補記載は check_distribution_boundary.ts の baseline 期待値
      集合だが、実体は repo-local の ir-059-baseline.json であることを実測で特定した。
    evidence:
      path: .opencode/skills/repo-agentdev-integrity/baselines/ir-059-baseline.json
      section: entries（L8-12。旧パス src/opencode/commands/agentdev/templates/req-define/req-draft.md の DEC-003 concrete-id エントリを実測確認）
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
```

# summary

RU-0008 を単独 Case として処理する。配布依存境界の concrete-id ベースライン（ir-059-baseline.json）から
旧 req-draft パスの DEC-003 エントリを削除する。旧パスの該当 0 件と後継参照の存在を実測確認済みであり、
distribution-boundary Design の再取得手順（解消済み違反の baseline 残存解消）に従う正式な処置として
実施する。削除後は checker 両 profile 実行で resolved 恒常計上の解消と delta 0 を確認する。
