---
draft_type: req_draft
topic_slug: gh-cli-windows-procedures-and-pass-criteria-guide
status: saved
created_at: 2026-07-27T00:00:00+09:00
source_rus:
  - RU-0005
  - RU-0006
agentdev_handoff: true
spec_actions_consumed: true
---

<!-- 本ドラフトは AgentDevFlow 本体の不具合・改善点を扱う前工程引き継ぎドラフトである（agentdev_handoff: true）。 -->
<!-- 2 RU（RU-0005: gh-cli Windows 環境問題3件、RU-0006: pass_criteria 記述ガイド）を含む。
     両 RU は独立関心だが「配布スキル運用ガイドの整備」という共通性でグループBとして1ドラフトにまとめた。 -->

# draft-data

```yaml
work_type: maintenance

scale: standard

summary: |
  RU-0005（agentdev-gh-cli skill の Windows 環境固有問題3件）と RU-0006（agentdev-workflow-templates と
  agentdev-req-analysis の pass_criteria 記述ガイド）を処理する。
  RU-0005 は cp932 --title 化け、一時ファイル配置・cleanup 非一体化、PowerShell MatchEvaluator 内 -replace の罠の3件を
  standard-procedures.md へ手続き追記で対応する。ユーザー確定事項「.agentdev/tmp/ 配置、cleanup 必須」を反映。
  RU-0006 は test strategy の pass_criteria 記述品質ガイドを agentdev-workflow-templates と agentdev-req-analysis へ追記する。
  新規 ADR 不要、新規 REQ 変更なし。3 SPEC（agentdev-gh-cli.md, agentdev-workflow-templates.md, agentdev-req-analysis.md）への
  参考追記と case-run 工程での skill reference ファイル更新を組み合わせる。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      RU-0005: src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md で
      Windows 環境の --title / inline --input 引数の使用を禁止し、--body-file または gh api --input（file bytes を UTF-8 として扱う）を
      推奨する旨を明記する。Section 2 Step 0 のコンソールエンコーディング初期化（3行）は本文 I/O で有効だが
      --title 引数 decode には影響しない別問題として明示する。
  - id: AG-002
    content: |
      RU-0005: title 修正が必要な場合の REST API PATCH 標準手続きを明記する。
      gh api -X PATCH /repos/{owner}/{repo}/issues/{N} + UTF-8 JSON --input file の形式。
      Draft 6 Epic #1845 タイトル化けの実績に基づく回避策。
  - id: AG-003
    content: |
      RU-0005: 一時ファイル配置を $env:TEMP/agentdev/（Windows で C:\WINDOWS\TEMP へ解決し並列タスクが cp932 で同名ファイル上書き問題）
      から .agentdev/tmp/（workspace-local）へ変更する。cleanup を create → gh実行 → VERIFY → cleanup の1手順ユニットに組み込み、
      省略不可ステップ化する。case-auto run 8 draft 並列処理で23件残存した実績の再発防止。
      ユーザー確定事項「.agentdev/tmp/ 配置、cleanup 必須」を反映。
  - id: AG-004
    content: |
      RU-0005: 本文置換手続きへ PowerShell regex MatchEvaluator 内 -replace 使用注意と回避策を追記する。
      [regex]::Replace + ScriptBlock 内で -replace 演算子を使用すると全件置換が期待通り動作しない。
      回避策は Node.js（String.split/join）または PowerShell String.Replace（.NET メソッド、regex 非使用）。
      既存の backreference $N 対策（L31-37）と区別して記載する。case-close(#epic) QG-4 で完了条件チェックボックス7個中1個しか
      置換されなかった実績に基づく。
  - id: AG-005
    content: |
      RU-0005: docs/specs/skills/agentdev-gh-cli.md へ Windows 環境固有手続きの参照追記を行う。
      standard-procedures.md が Windows 環境固有手続き（cp932 化け対策、.agentdev/tmp/ 配置、cleanup 一体化、
      MatchEvaluator 内 -replace 罠）を所有することを明記する。
  - id: AG-006
    content: |
      RU-0006: src/opencode/skills/agentdev-workflow-templates/ の issue_desc_*.md テンプレートに
      test strategy 記述ガイドを追記する:
      - 複数 REQ 共通 pass_criteria のリスク（各 REQ の pipeline stage 違いを吸収せず文字列一致を要求すると QG-4 評価時に食い違う）
      - REQ 個別期待値記述の推奨
      - 変更対象外 REQ 検証の正しい表現（diff がないこと）
      - 存在確認の使用条件（新規作成禁止の場合のみ）
      Issue #1760 QG-4 で REQ-0129-012 content と文字列不一致、F-001「意味的等価・承認」で処理した実績に基づく。
  - id: AG-007
    content: |
      RU-0006: src/opencode/skills/agentdev-req-analysis/ へ pass_criteria 記述基準を追記する:
      - pipeline stage 別の content 表現差異を吸収する「意味的等価許容」ガイドライン
      - 「存在しないこと」と「変更されていないこと」の使い分け基準
      Issue #1760 TS-003 で REQ-0147-010 を「存在しないこと」と誤表現した実績に基づく。
      存在確認は新規作成禁止（REQ-0164 が存在しないこと等）の場合のみ使用すべき。

artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-gh-cli
    target_area: "## Windows 環境固有手続き"
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005]
    spec_logical_division: cross_cutting_contract
    canonical_owner: agentdev-gh-cli
    content: |
      ## Windows 環境固有手続き

      Windows 環境固有の手続きは `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` が正規所有する。
      本 SPEC は Windows 環境固有手続きの存在と参照関係のみを定め、詳細手続きは reference ファイルへ委譲する。

      ### 対象手続き

      - cp932 化け対策（--title / inline --input 引数の使用禁止、--body-file / gh api --input 推奨）
      - title 修正が必要な場合の REST API PATCH 標準手続き
      - 一時ファイル配置（.agentdev/tmp/ workspace-local）と cleanup 一体化（create → gh実行 → VERIFY → cleanup の省略不可ステップ化）
      - PowerShell regex MatchEvaluator 内 -replace 使用注意と回避策（Node.js / String.Replace）
      - 上記と既存の backreference $N 対策との区別

      詳細は standard-procedures.md の該当セクションを参照。
  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-workflow-templates
    target_area: "## test strategy 記述ガイドライン"
    source_items: [AG-006]
    spec_logical_division: cross_cutting_contract
    canonical_owner: agentdev-workflow-templates
    content: |
      ## test strategy 記述ガイドライン

      issue_desc_*.md テンプレートで test strategy を起票する際の pass_criteria 記述ガイドライン:

      ### 共通 pass_criteria のリスク

      複数 REQ への共通 pass_criteria を起票する場合、各 REQ の pipeline stage（promote 系、review 系等）の違いを
      吸収せず文字列一致を要求すると、QG-4 評価時に REQ content と pass_criteria 期待値が食い違う可能性がある。
      REQ 個別期待値の記述を推奨する。

      ### 変更対象外 REQ 検証の正しい表現

      「変更対象外 REQ の変更がないこと」は diff がないこととして表現する。
      「存在しないこと」と誤表現すると、検証意図（diff がないこと）と検証表現（存在確認）がずれる。

      ### 存在確認の使用条件

      「存在しないこと」は新規作成禁止（例: REQ-0164 が存在しないこと）の場合のみ使用する。
      既存 REQ の変更がないことを検証する場合は「変更されていないこと」（diff がないこと）を使用する。
  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-req-analysis
    target_area: "## pass_criteria 記述基準"
    source_items: [AG-007]
    spec_logical_division: cross_cutting_contract
    canonical_owner: agentdev-req-analysis
    content: |
      ## pass_criteria 記述基準

      pass_criteria 記述時の品質基準:

      ### 意味的等価許容

      pipeline stage 別の content 表現差異を吸収する「意味的等価許容」ガイドライン。
      REQ content が pipeline stage によって表現を変える場合、pass_criteria は意味的等価性で判定する。
      文字列一致を機械的に要求しない。

      ### 「存在しないこと」と「変更されていないこと」の使い分け

      - 「存在しないこと」: 新規作成禁止（例: REQ-0164 が存在しないこと）の場合のみ使用
      - 「変更されていないこと」: 既存 REQ の変更がないこと（diff がないこと）を検証する場合に使用

      これらを誤って混用すると、検証意図と検証表現がずれ、QG-4 評価時に不正確な判定を生じる。

conflict_resolutions:
  - id: CR-001
    conflict: 一時ファイル配置（$env:TEMP/agentdev/ vs .agentdev/tmp/）
    resolution: |
      .agentdev/tmp/（workspace-local）を採用。ユーザー確定事項。
      $env:TEMP は Windows で C:\WINDOWS\TEMP へ解決し並列タスクが cp932 で同名ファイル上書き問題のため不採用。
  - id: CR-002
    conflict: cleanup の省略可否
    resolution: |
      cleanup を create → gh実行 → VERIFY → cleanup の1手順ユニットに組み込み、省略不可ステップ化する。
      case-auto run 8 draft 並列処理で23件残存した実績の再発防止。ユーザー確定事項。
  - id: CR-003
    conflict: ADR 要否
    resolution: |
      新規 ADR 不要。スキル運用手続きの追記であり、アーキテクチャ判断を含まないため。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0005
    target_spec: docs/specs/skills/agentdev-gh-cli.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0006
    target_spec: docs/specs/skills/agentdev-workflow-templates.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0006
    target_spec: docs/specs/skills/agentdev-req-analysis.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md で
      Windows 環境の --title / inline --input 使用禁止、--body-file / gh api --input 推奨が明記されていることを確認する。
      Section 2 Step 0 のコンソールエンコーディング初期化と --title 引数 decode の別問題性が明示されていること。
    pass_criteria: |
      standard-procedures.md に Windows 環境 --title / inline --input 使用禁止と --body-file / gh api --input 推奨が明記されていること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-002
    target_item: AG-002
    verification: |
      standard-procedures.md に title 修正が必要な場合の REST API PATCH 標準手続き
      （gh api -X PATCH /repos/{owner}/{repo}/issues/{N} + UTF-8 JSON --input file）が明記されていることを確認する。
    pass_criteria: |
      標準手続きが実行可能な形式で記載されていること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-003
    target_item: AG-003
    verification: |
      standard-procedures.md で一時ファイル配置が .agentdev/tmp/（workspace-local）へ変更されていることを確認する。
      cleanup が create → gh実行 → VERIFY → cleanup の1手順ユニットで省略不可ステップ化されていることを確認する。
    pass_criteria: |
      .agentdev/tmp/ 配置と cleanup 省略不可ステップ化が記載されていること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-004
    target_item: AG-004
    verification: |
      standard-procedures.md に PowerShell regex MatchEvaluator 内 -replace 使用注意と回避策
      （Node.js String.split/join または PowerShell String.Replace）が追記されていることを確認する。
      既存の backreference $N 対策（L31-37）と区別して記載されていること。
    pass_criteria: |
      MatchEvaluator 内 -replace 注意と回避策が backreference $N 対策と区別されて記載されていること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-005
    target_item: AG-005
    verification: |
      docs/specs/skills/agentdev-gh-cli.md に Windows 環境固有手続きの参照追記があることを確認する。
      standard-procedures.md への参照関係が明示されていること。
    pass_criteria: |
      agentdev-gh-cli.md SPEC に Windows 環境固有手続きの存在と standard-procedures.md への参照が記載されていること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-006
    target_item: AG-006
    verification: |
      src/opencode/skills/agentdev-workflow-templates/ の issue_desc_*.md テンプレートに
      test strategy 記述ガイド（共通 pass_criteria リスク、REQ 個別期待値推奨、変更対象外 REQ 検証、存在確認使用条件）が
      追記されていることを確認する。
      docs/specs/skills/agentdev-workflow-templates.md に「test strategy 記述ガイドライン」セクションが追加されていること。
    pass_criteria: |
      issue_desc_*.md テンプレートと workflow-templates.md SPEC の両方にガイドラインが記載されていること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-007
    target_item: AG-007
    verification: |
      src/opencode/skills/agentdev-req-analysis/ に pass_criteria 記述基準
      （意味的等価許容、存在確認と diff 確認の使い分け）が追記されていることを確認する。
      docs/specs/skills/agentdev-req-analysis.md に「pass_criteria 記述基準」セクションが追加されていること。
    pass_criteria: |
      req-analysis skill と SPEC の両方に記述基準が記載されていること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。

review_dispositions:
  - id: RD-001
    source_ru: RU-0005
    source_item: RU-0005-Sources-gh-cli-windows
    disposition: covered
    reason_code: fully_integrated
    reason: |
      RU-0005 の Source Summary が指摘する「agentdev-gh-cli skill の Windows 環境固有問題3件」は
      AG-001〜AG-005 で完全に統合された。cp932 化け、一時ファイル配置・cleanup、MatchEvaluator 罠を全て反映。
    evidence:
      path: .agentdev/backlog/req-units/RU-0005.md
      section: Source Summary
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0006
    source_item: RU-0006-Sources-pass-criteria-guide
    disposition: covered
    reason_code: fully_integrated
    reason: |
      RU-0006 の Source Summary が指摘する「pass_criteria 記述ガイド未整備」は AG-006/AG-007 で完全に統合された。
      workflow-templates と req-analysis の両 skill へのガイド追記を反映。
    evidence:
      path: .agentdev/backlog/req-units/RU-0006.md
      section: Source Summary
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  decomposition: |
    scale: standard、3 SPEC への参考追記 + 3 skill reference ファイル更新のため単一 Issue で完結する。
    OU-001（agentdev-gh-cli.md）→ OU-002（agentdev-workflow-templates.md）→ OU-003（agentdev-req-analysis.md）の順で実施。
    case-run 工程で各 skill の reference ファイル（standard-procedures.md, issue_desc_*.md 等）を更新。
  wave_hints:
    - wave: 1
      units: [OU-001, OU-002, OU-003]
      rationale: 3 SPEC は独立しており並列実行可能。
```

# implementation_details

本セクションは case-run 工程で実施する実装詳細（Step 10-1 ガイドラインに基づく分離）。

## RU-0005 実装: standard-procedures.md

- ファイル: `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md`
- 追記内容:
  - Windows 環境の --title / inline --input 使用禁止、--body-file / gh api --input 推奨
  - title 修正用 REST API PATCH 標準手続き
  - 一時ファイル配置を .agentdev/tmp/（workspace-local）へ変更
  - cleanup を create → gh実行 → VERIFY → cleanup の1手順ユニットで省略不可ステップ化
  - PowerShell regex MatchEvaluator 内 -replace 使用注意と回避策（Node.js / String.Replace）
  - 既存 backreference $N 対策（L31-37）との区別記載

## RU-0006 実装: workflow-templates と req-analysis

- ファイル1: `src/opencode/skills/agentdev-workflow-templates/` の issue_desc_*.md テンプレート
- ファイル2: `src/opencode/skills/agentdev-req-analysis/` の skill reference
- 追記内容:
  - test strategy 記述ガイドライン（共通 pass_criteria リスク、REQ 個別期待値推奨）
  - 変更対象外 REQ 検証の正しい表現（diff がないこと）
  - 存在確認の使用条件（新規作成禁止）
  - pipeline stage 別 content 表現差異の意味的等価許容

## 実装スコープへの注意

実装詳細は本ドラフトの要件定義本体ではなく、case-run 工程での参照情報である。
要件定義としての原本は上記 `# draft-data` YAML ブロック。

# summary

本ドラフトは RU-0005（gh-cli Windows 環境問題3件）と RU-0006（pass_criteria 記述ガイド）を処理する要件定義である。AgentDevFlow 本体の改善（agentdev_handoff: true）。

主要な変更対象は3つの SPEC（agentdev-gh-cli.md, agentdev-workflow-templates.md, agentdev-req-analysis.md）への参考追記と、各 skill の reference ファイル更新（case-run 工程）。scale: standard。

後続コマンドは req-save（REQ/ADR 変更なし、スキップ可）→ spec-save（3 SPEC 参考追記）→ case-open → case-run（各 skill reference ファイル更新）を想定。
