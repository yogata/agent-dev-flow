---
draft_type: req_draft
topic_slug: ru0021-test-suite-health
status: draft
created_at: "2026-09-16T12:02:52+09:00"
source_rus: [RU-0021]
---

# draft-data

```yaml
work_type: bugfix
summary: "検査テストスイートで継続する archive-builder staging テストの並列 flaky と check_extensions の期待値乖離を是正し、実質的な不整合だけを報告する健全な検証状態を回復する。"
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
agreed_items:
  - id: AG-001
    content: |
      trusted-distribution-gate の launcher-blockers.test.ts にある archive-builder staging path テストは、並列フルスイート実行時にも他テストと一時リソースを競合せず安定して green となること。テスト固有の一時領域分離、TMP の個別化、または同等の並列隔離によって staging path の競合を除去し、単独実行だけでなくフルスイート並列実行の反復でも green を維持する。
  - id: AG-002
    content: |
      check_extensions integration テストの workflow_extensions 期待値は、現行 extension 実態の棚卸しと cutover 以降の追加履歴との突合を前置として、checker 本体の実態値と一致させること。現行実態 16 が欠落なく正しいことを検証記録に残したうえで期待値を 17 から実態一致値へ更新し、checker 本体の workflow_extensions 16、internal_workflow_extensions 0、failures 0、ok=true という状態を維持する。棚卸しで欠落が判明した場合は、期待値を棚卸し後の実態値に合わせ、欠落は追跡Issueで管理する。
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:ru0021-test-suite-health
    source_items: [AG-001, AG-002]
    content: |
      ---
      id: REQ-083
      title: "検査テストスイートの健全性（flaky 隔離・期待値乖離の解消）"
      created: "2026-09-16"
      updated: "2026-09-16"
      ---

      ## 目的

      trusted-distribution-gate と repo-agentdev-integrity の検査テスト群で継続する並列実行時 flaky と期待値固定の陳腐化を解消し、検査テストの failure が実質的な不整合だけを報告する健全な状態を回復する。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-083-001 | trusted-distribution-gate の archive-builder staging path テストは、bun test フルスイート並列実行下でも一時ディレクトリ競合に起因する不安定 fail を生まず、テスト固有の分離された一時領域で安定して green となること。 |
      | REQ-083-002 | check_extensions integration テストの workflow_extensions 期待値は、現行実態 16 の欠落有無を棚卸しした結果に一致し、checker 本体の実態と期待値の乖離による恒常 fail を発生させないこと。棚卸し結果を検証記録に残すこと。 |

      ## 適用範囲

      - **対象**: `.opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/launcher-blockers.test.ts` の archive-builder staging path テスト、`.opencode/skills/repo-agentdev-integrity/scripts/check_extensions.test.ts` の integration 期待値
      - **対象外**: checker 本体の仕様変更、`.agentdev/extensions/**` の追加・削除、bun test 実行形態契約の変更、full-audit baseline 運用の一般契約
      - **制約**: REQ-060 の repo root 起 cwd・`./` 付きパス指定で検証し、既存 integrity suite と full-audit に新規違反を生じさせないこと
conflict_resolutions:
  - id: CR-001
    conflict: "REQ-083 は新規 CREATE か既存 REQ への APPEND か。"
    resolution: "REQ-057-011/012 は隣接するが対象資産と failure mode が異なるため、検査テストスイート健全性を REQ-083 の新規 CREATE とする。擬似採番は case-open の決定的採番で確定する。"
  - id: CR-002
    conflict: "RU は bugfix と feature 相当の判断を含み得る。"
    resolution: "テスト隔離と期待値更新は実装是正手段の選択であり硬い技術的決着ではないため、bugfix を維持し Decision は作成しない。"
  - id: CR-003
    conflict: "launcher-blockers.test.ts の指示上の src/opencode パスと実在パスが異なる。"
    resolution: "実ファイルは repo-local・配布対象外の `.opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/launcher-blockers.test.ts` のみに存在するため、実現面パスを同パスへ訂正する。"
  - id: CR-004
    conflict: "期待値を 16 に固定するか動的算出するか。"
    resolution: "実態突合の検証意味を保つため、棚卸しを前置した固定値更新を採用する。動的算出は期待値妥当性の検証にならない。"
operation_units:
  - ou_id: OU-001
    source_ru: RU-0021
    target_req: REQ-083
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
result: {}
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      repo root を cwd とし、REQ-060 の `./` 付きパス指定に従う bun test フルスイート並列実行（QG-4 の3分割正規形を含む）を3回反復する。対象 archive-builder staging path テストの各回の成否と staging 残渣検査結果を記録する。
    pass_criteria: |
      3回連続のフルスイート並列実行で対象テストが全て green（0 fail）となり、outputRoot 外および os.tmpdir() の orphan 検査も pass する。新規 fail を生じない。
    on_failure: |
      fix-and-reverify を選択する。flaky は本要件の中核であり、記録だけでは完了条件を満たさないため、テスト固有の一時領域分離または並列隔離を修正してフルスイートを再実行する。
  - id: TS-002
    target_item: AG-002
    verification: |
      `.agentdev/extensions/skills/` の workflow-extension 実体を列挙し、現行件数と cutover 以降の追加履歴を突合する。その後、repo root cwd から `bun test ./.opencode/skills/repo-agentdev-integrity/scripts/check_extensions.test.ts` とフルスイート並列実行を行い、checker 本体の実測値を突合する。
    pass_criteria: |
      棚卸し結果が検証記録に残り、期待値が棚卸し後の実態値と一致する。integration テストが green となり、checker 本体が ok=true、workflow_extensions=実態値、internal_workflow_extensions=0、failures=0 を維持する。
    on_failure: |
      fix-and-reverify を選択する。期待値または棚卸し結果との乖離を修正し、単独テストとフルスイートを再実行する。恒常 fail の解消が目的であり、record-in-findings では完了しない。
realization_actions:
  - id: RA-001
    concern: "archive-builder staging path テストの一時ディレクトリ分離"
    responsibility: "repo-local repo-agentdev-integrity の検査テスト資産を、並列実行で共有一時領域に依存しない構造へ是正する。checker 本体は変更しない。"
    ownership_hints: [".opencode/skills/repo-agentdev-integrity/scripts/trusted-distribution-gate/launcher-blockers.test.ts", "REQ-060 の bun test 実行形態", "QG-4 フル suite 正規形の正規所有は agentdev-quality-gates"]
    intent: "他テストとの一時リソース競合を除去し、フルスイート並列実行の flaky を解消する。"
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-002
    concern: "check_extensions integration テストの期待値更新"
    responsibility: "check_extensions.test.ts の期待値を棚卸し後の実態へ合わせる。checker 本体 check_extensions.ts は変更しない。"
    ownership_hints: [".opencode/skills/repo-agentdev-integrity/scripts/check_extensions.test.ts L34-36", ".agentdev/extensions/skills/ の workflow-extension 実体", "REQ-057-011 の固定期待値恒常 fail 防止原則"]
    intent: "テスト期待値と checker 実体の乖離による main の恒常 fail を解消する。"
    verification_refs: [TS-002]
    source_items: [AG-002]
review_dispositions:
  - id: RD-001
    source_ru: RU-0021
    source_item: RU-0021:archive-builder-staging-flaky
    disposition: covered
    reason_code: promoted_to_agreed_item
    reason: "archive-builder staging flaky を AG-001、RA-001、TS-001 へ反映した。"
    evidence: {path: .agentdev/backlog/req-units/RU-0021.md, section: Sources, checked_at_commit: null}
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0021
    source_item: RU-0021:check-extensions-expected-count-drift
    disposition: covered
    reason_code: promoted_to_agreed_item
    reason: "check_extensions 期待値乖離を AG-002、RA-002、TS-002 へ反映した。"
    evidence: {path: .agentdev/backlog/req-units/RU-0021.md, section: Sources, checked_at_commit: null}
    related_removed_items: []
case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

変更誘発境界リスクは、dependency（2つのテスト修正が同じフルスイート検証へ収束する依存を確認済み）、client-server（テスト資産と checker 本体を分離し、checker 本体を変更しない境界を確認済み）、execution（単独ではなく並列フルスイートを production-equivalent な検証条件とする順序を確認済み）、build-runtime（Bun の test runner と repo-local `.opencode` 実行環境で期待値・exit 状態を再確認する境界を確認済み）、environment-propagation（共有一時領域の並列競合をテスト固有領域へ隔離し、REQ-060 の repo root cwd・`./` パス契約を維持する境界を確認済み）の5観点すべてを確認した。2つの恒常 fail は検査テストスイート健全性という単一関心であり、REQ-083 の2要件として構成する。SPLIT 要否: 不要。
