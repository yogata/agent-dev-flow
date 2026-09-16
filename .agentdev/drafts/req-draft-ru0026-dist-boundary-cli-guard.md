---
draft_type: req_draft
topic_slug: ru0026-dist-boundary-cli-guard
status: draft
created_at: "2026-09-16T12:02:52+09:00"
source_rus: [RU-0026]
---

# draft-data

```yaml
work_type: maintenance
summary: "check_distribution_boundary_cli.ts を直接起動しても無出力・exit 0 の無検証成功にならないよう runCli のエントリポイントを追加し、checker 共通実行契約へ誤起動防止の注意を追記する。"
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
agreed_items:
  - id: AG-001
    content: |
      `.opencode/skills/repo-agentdev-integrity/scripts/check_distribution_boundary_cli.ts` は runCli を export するだけで top-level 起動を持たず、直接起動時に無出力・exit 0 で終了する。runCli の top-level 起動を追加して直接起動でも検査を実行し、機械可読出力と exit code 契約（0 ok / 1 violation / 2 error）を維持する。正規の check_distribution_boundary.ts 経由の起動契約は変更しない。
  - id: AG-002
    content: |
      `docs/designs/integrity/checker-execution-contracts.md` の「checker 共通実行契約」節へ、CLI 用分割スクリプトのエントリポイント契約、export-only の直接起動が無検証成功を生む注意、check_distribution_boundary.ts 経由の正規起動経路を追記する。追記は共通契約節に限定し、工程連動索引再生成前置と既存対応計画領域を変更しない。
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-057.md
    target_area: "要件テーブル（REQ-057-035 は擬似行番号）"
    source_items: [AG-001, AG-002]
    content: |
      | REQ-057-035 | 検査 checker の CLI 用分割スクリプトは直接起動時にも無出力・exit 0 の無検証成功を生まないこと。runCli の top-level 起動により検査を実行し、exit code 契約（0 ok / 1 violation / 2 error）を維持すること。checker 共通実行契約は CLI 分割スクリプトのエントリポイント契約と正規起動経路の注意を保持すること |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/integrity/checker-execution-contracts.md
    target_design: {operation: update, domain: integrity, slug: checker-execution-contracts}
    target_area: checker 共通実行契約
    source_items: [AG-002]
    content: |
      CLI 用分割スクリプト（`*_cli.ts` 等）は直接起動時にも検査を実行する top-level エントリポイントを持つことを標準とする。export-only のスクリプトは直接起動で無出力・exit 0 の無検証成功を生むため採用しない。check_distribution_boundary_cli.ts の正規起動経路は check_distribution_boundary.ts 経由（bun run、exit 0/1/2）であることを明示する。
conflict_resolutions:
  - id: CR-001
    conflict: "REQ-057-035 の擬似行番号と他バッチの採番予約。"
    resolution: "共有採番計画により REQ-057 の追加行 030〜034 は他バッチ（030=ru0030、031/032=ru0033、033=ru0025、034=ru0029）に割当済みのため REQ-057-035 を使用し、case-open の決定的採番で確定する。"
  - id: CR-002
    conflict: "契約文書追記、cli.ts エントリポイント化、リネームの手段選択。"
    resolution: "無出力・exit 0 の構造を消失させる cli.ts エントリポイント化を主手段とし、checker 共通実行契約への注意追記を併用する。RU の受け入れ条件（経路の消失または警告）はいずれか一方で充足されるが、主手段単独では既存の export-only 構造を持つ他スクリプトへの波及予防が残るため、構造修正と共通契約上の注意によって構造面と規約面の両方で再発を防ぐ。リネームは参照連鎖を増やすため採用しない。"
  - id: CR-003
    conflict: "Design update の target_area。"
    resolution: "実ファイル照合で固有節が存在しないため、checker-execution-contracts.md の「checker 共通実行契約」節（L26）へ追記する。工程連動索引再生成前置・既存対応計画領域には触れない。"
  - id: CR-004
    conflict: "REQ-057 の checker・Tool 大規模仕様変更対象外との関係。"
    resolution: "本変更は軽微な CLI エントリポイント修復と共通契約の注意追記であり、大規模仕様変更および既存対応計画領域の本体実装には該当しない。"
operation_units:
  - ou_id: OU-001
    source_ru: RU-0026
    target_req: REQ-057
    target_design: docs/designs/integrity/checker-execution-contracts.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
result: {}
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      repo root を cwd とし REQ-060 の `./` 付きパス指定に従い、cli.ts を `--profile source --json` 付きで直接起動して stdout と exit code を記録する。check_distribution_boundary.ts 経由の正規起動結果と検査内容を突合する。
    pass_criteria: |
      直接起動で checker が実行され、機械可読な結果が出力され、exit code が 0 ok / 1 violation / 2 error の契約どおりとなる。無出力・即 exit 0 の無検証経路が消失し、正規起動経路との検査内容が一致する。
    on_failure: |
      fix-and-reverify を選択する。エントリポイントまたは引数処理を修正して直接起動を再検証する。CLI 契約の回帰は本要件内で修正すべきため、record-in-findings では完了しない。
  - id: TS-002
    target_item: AG-002
    verification: |
      checker-execution-contracts.md の checker 共通実行契約節を確認し、CLI 分割スクリプトのエントリポイント契約、export-only の注意、正規起動経路が記載されていることを確認する。docs-check と関連 integrity 検査を実行する。
    pass_criteria: |
      共通契約節に3項目が明示され、docs-check、IR-044、AUTOGEN 鮮度検出で新規違反がない。工程連動索引再生成前置と既存対応計画領域の記述は変更されない。
    on_failure: |
      fix-and-reverify を選択する。Design 追記の内容・配置または新規検出を修正し、docs-check と関連検査を再実行する。契約の明示は完了条件の一部であるため記録だけでは完了しない。
realization_actions:
  - id: RA-001
    concern: "check_distribution_boundary_cli.ts の top-level エントリポイント化"
    responsibility: "repo-local repo-agentdev-integrity の CLI adapter が直接起動時にも検査を実行し、既存の check_distribution_boundary.ts と同じ exit code・出力契約を保持する。"
    ownership_hints: [".opencode/skills/repo-agentdev-integrity/scripts/check_distribution_boundary_cli.ts L49 の runCli と top-level 起動不在", "同ディレクトリ check_distribution_boundary.ts と lib/distribution-boundary-*", "checker-execution-contracts.md の checker 共通実行契約", "ファイル先頭コメントの既存 CLI 契約と ADF-COVERS REQ-047-009"]
    intent: "誤った直接起動を無検証の成功と扱う経路を構造的に除去する。"
    verification_refs: [TS-001]
    source_items: [AG-001]
review_dispositions:
  - id: RD-001
    source_ru: RU-0026
    source_item: RU-0026:cli-export-only-pitfall
    disposition: covered
    reason_code: promoted_to_agreed_item
    reason: "cli.ts の無出力・exit 0 問題を AG-001/AG-002、RA-001、TS-001/TS-002 へ反映した。"
    evidence: {path: .agentdev/backlog/req-units/RU-0026.md, section: Sources, checked_at_commit: null}
    related_removed_items: []
case_open_hints:
  epic_needed: false
  wave_hints:
    - RU-0024 が checker-execution-contracts.md の別節（bun test 実行形態契約）を現実面で編集するため、同一 Wave への並列配置を避けて直列化する。
```

# summary

変更誘発境界リスクは、dependency（cli.ts のエントリポイント修正を Design の共通契約追記と整合させる依存を確認済み）、client-server（CLI adapter、checker 本体、checker 実行契約 Design の責務分離を確認済み）、execution（直接起動と check_distribution_boundary.ts 経由の正規起動を同じ検査結果・exit code 契約で突合する実行順序を確認済み）、build-runtime（Bun の直接スクリプト起動時にも既存の import と exit code 契約を維持する境界を確認済み）、environment-propagation（repo root cwd・`./` パス指定と repo-local `.opencode` スクリプトの実行環境を確認済み）の5観点すべてを確認した。CLI adapter の直接起動安全性は実装と checker 共通契約の単一関心であり、REQ-057-035 の1行と既存 Design の1節更新として構成する。SPLIT 要否: 不要。
