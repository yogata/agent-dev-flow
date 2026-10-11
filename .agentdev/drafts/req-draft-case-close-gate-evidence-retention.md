---
draft_type: req_draft
topic_slug: case-close-gate-evidence-retention
status: draft
created_at: 2026-10-11T15:30:00+09:00
source_rus:
  - RU-0003
---

# draft-data

```yaml
work_type: maintenance

scale: standard

summary: >
  case-close 機械工程の gate 証跡保持要件（stderr 出力ランナーを含む検証の stdout・stderr 分離退避の
  常時付与、件数突合の根拠を stderr 退避ファイルに置く記録規律）を case-close Design 機械工程節と
  配布 reference（full integrity suite 実行節）へ規定する。既存の agentdev-workflow-templates 検証差分
  記録規約（stdout/stderr 分離保存・保存先等の記録）に接続し、報告 JSON 単体では機械受理の証跡が成立
  しない状態（Case #3532/#3536/#3603 で script 外再実行 + 手動退避が恒常化）を解消する。
  close_mechanical_steps.ts の integrityResults への stderr 保持・報告 JSON の gate stdout 保持のサイズ
  上限・要約保持契約は本 Case の対象外とし後続是正候補として記録する。REQ 行の変更は行わない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      gate 証跡保持要件の規定（RU-0003）。case-close 機械工程について次を規定する。(1) bun test 等、
      テスト結果・件数サマリー（Ran N tests across M files 形式）を stderr へ出力するランナーを含む検証は、
      stdout と stderr の分離退避（stdout.log / stderr.log の分離ファイル退避）を常時付与する。
      分離退避の接続点は stderr 出力ランナーの検証実行（script 外の直接実行）である。機械工程 script
      （close_mechanical_steps.ts）呼び出し自体のリダイレクトラップは、現行 runner（spawnSync 既定の
      stdio pipe）が bun test の stderr を内部捕捉し integrityResults は stdout と終了コードのみ保持する
      ため証跡成立手段にならない。script 内での stderr 保持（integrityResults 拡張）は AG-002(a) の後続
      是正で解消するまで、件数突合の根拠確保のために検証実行の二重実行（機械工程 script による gate 実行
      と、分離退避付きの検証実行）の暫定コストを伴う。(2) 件数突合（N tests across M files と期待値との
      突合）の根拠は stderr 退避ファイルに置く記録規律とする。(3) 検証差分への記録は既存の
      agentdev-workflow-templates 検証差分記録規約（各実行の stdout と stderr を分けて保存し、保存先・
      終了コード・checker の版・検査範囲・実行環境を記録する。SKILL.md 検証差分セクション）に従い、
      保存先と根拠ファイルを明記する。
  - id: AG-002
    content: |
      後続是正候補の記録（RU-0003 受け入れ条件 (3)）。次を本 Case の対象外（後続是正候補）として記録する。
      (a) close_mechanical_steps.ts の integrityResults への stderr 保持（報告 JSON 構造の拡張）、
      (b) 報告 JSON の gate stdout 保持の証跡サイズ上限・要約保持契約の定義。これらは script 本体修正を
      伴う REQ/Design 変更判断を要するため、本 Case は手順・契約側の規定を主とし、実装拡張は後続の
      正規経路（req-define 再合意）で評価する。横展開観点（accept_definition_checks、
      prepare_definition_pr 等の他機械工程 script の同型課題）も記録のみとする。

conflict_resolutions: []

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target_design:
      operation: update
      domain: commands
      slug: case-close
    target_area: 機械工程の script 呼び出し契約（RU-0162）
    source_items: [AG-001]
    content: |
      機械工程の script 呼び出し契約節へ、gate 証跡保持要件として次を追記する: 機械工程の品質ゲート
      （full integrity suite 等）のうち stderr 出力ランナー（bun test 等）を含む検証は、当該ランナーの
      検証実行（script 外の直接実行）に stdout と stderr の分離退避を常時付与する。機械工程 script 呼び出し
      自体のリダイレクトラップは現行 runner が stderr を内部捕捉するため証跡成立手段にならない。件数突合系
      gate の受理根拠は stderr 退避ファイル（件数サマリーの出力先）に置き、検証差分には既存の検証差分記録
      規約（agentdev-workflow-templates）に従い保存先・終了コード・checker の版・検査範囲・実行環境を
      記録する。報告 JSON の保持構造への依存（stdout のみ保持等）を証跡の成立根拠にしない。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0003
    target_design: docs/designs/commands/case-close.md
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
      (1) case-close Design（docs/designs/commands/case-close.md）機械工程の script 呼び出し契約節に
      証跡保持要件（分離退避常時付与・stderr 退避ファイル根拠・templates 規約への接続）の追記があることを
      機械的検索（rg）と全文読取で確認する。(2) case-close 配布 reference の full integrity suite 実行節
      （docs-and-design-promotion.md）に分離退避手順の追記があることを確認する。(3) 既存の検証差分記録規約
      （agentdev-workflow-templates SKILL.md 検証差分セクションの stdout/stderr 分離保存規定）が変更され
      ていないことを確認する。
    pass_criteria: |
      (1)(2) の追記が存在し、(3) templates 側規約が現行のまま（本 Case が templates を変更しない）である
      こと。Design 節の追記が script 呼び出し契約（工程別 script 1 回の呼び出し、品質ゲートの script 内
      実行、意味判断のモデル担当）の既定と矛盾しないこと。
    on_failure: |
      fix-and-reverify。規定の欠落・既存契約との矛盾を検出した場合は修正して再検証する（証跡欠落時の
      script 外再実行の恒常化が残るため、記録留保では完了しない）。

realization_actions:
  - id: RA-001
    concern: case-close 配布 reference（full integrity suite 実行節）への証跡退避手順の補足
    responsibility: >
      case-close 機械工程のうち full integrity suite 実行の手順を所有する配布 reference。
      full integrity suite 実行（bun test 実行形態契約）節へ、stdout・stderr 分離退避の常時付与と
      件数突合の stderr 退避ファイル根拠の手順を追記する。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md（full integrity suite 実行（bun test 実行形態契約）節）"
      - "契約の正: docs/designs/commands/case-close.md「機械工程の script 呼び出し契約（RU-0162）」節"
      - "検証差分記録規約: src/common/skills/agentdev-workflow-templates/SKILL.md 検証差分セクション（変更対象外）"
      - "現行実装の実測: close_mechanical_steps.ts の integrityResults は { exitCode, stdout } のみ保持（L520-524）、stderr 保持は textlint の stderrTail のみ（L538）"
    intent: >
      機械受理基準（件数突合の記録が必須受理由件）の証跡を報告 JSON に依存せず分離退避ファイルで常時成立
      させ、実行ごとの script 外再実行 + 手動退避（Case #3603 で 3 cwd 分割の再実行、前 Case 群 #3532/#3536
      でも同構造）を解消する。
    verification_refs: [TS-001]
    source_items: [AG-001]

review_dispositions:
  - id: RD-001
    source_ru: RU-0003
    source_item: RU-0003
    disposition: covered
    reason_code: covered
    reason: |
      gate 証跡保持要件（stderr 分離退避常時付与・件数サマリー根拠の stderr 退避ファイル限定）の規定を
      AG-001 + ACT-DESIGN-001（case-close Design 機械工程節）+ RA-001（配布 reference の full integrity
      suite 実行節）で採用。受け入れ条件 (1)(2) を TS-001 で検証、(3) 後続是正候補（stderr 保持・報告
      サイズ上限・要約保持契約）を AG-002 に記録。対象外（accept_definition_checks・prepare_definition_pr
      等の横展開、機械受理基準自体の変更、bun test の出力先変更）を AG-002 に反映。templates 検証差分
      記録規約は既存規定で要件を充足するため変更しない（TS-001 (3) で確認）。
    evidence:
      path: src/common/skills/agentdev-workflow-case-close/scripts/src/close_mechanical_steps.ts
      section: integrityResults 組み立て（L520-524。{ exitCode, stdout } のみ保持、stderr 保持は textlint stderrTail L538 のみであることを実測確認）
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
```

# summary

RU-0003 を単独 Case として処理する。case-close 機械工程の gate 証跡保持要件（stdout・stderr 分離退避の
常時付与、件数突合の stderr 退避ファイル根拠）を Design 機械工程節と配布 reference へ規定する。
agentdev-workflow-templates の検証差分記録規約が既に stdout/stderr 分離保存を定めているため、本 Case は
templates を変更せず case-close 側からの接続（参照と手順化）に限る。script 本体の拡張
（integrityResults への stderr 保持、報告サイズ上限・要約保持契約）は後続是正候補として AG-002 に記録し、
本 Case の対象外とする。
