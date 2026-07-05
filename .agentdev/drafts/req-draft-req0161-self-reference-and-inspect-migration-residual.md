---
draft_type: req_draft
topic_slug: req0161-self-reference-and-inspect-migration-residual
status: saved
created_at: 2026-07-05T12:00:00+09:00
saved_at: 2026-07-05T17:11:00+09:00
source_rus:
  - RU-0017
  - RU-0023
agentdev_handoff: true
---

# draft-data

```yaml
work_type: maintenance

scale: standard

summary: |
  2つの独立した移行・保守課題を扱う。REQ-0161-004/005 の構造的到達不能（要件文書自身が削除対象IDをリテラル含むことによる自己参照、README.mdタイトル過剰ヒット）を解消する方向性を確定し REQ-0161 を UPDATE する。inspect-doc-inputs → inspect-extensions 移行残作業（check_doc_inputs.ts と /repo/docs-check の関係整理、IR-056 ルール定義の extensions 対応、docs 内部6ファイルの旧 command 名参照残留）の処理方針を確定し REQ-0124 を UPDATE する。両課題はトピック・対象REQ・理由が異なるため case-open 時に別 Issue 分割を推奨する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  confirmed_user_decisions:
    - id: UQ-001
      question: REQ-0161-004（rg 0件）の自己参照解消方向
      decision: 完了条件を「自己参照を除く」に修飾
      rationale: REQ 自身が検索にヒットする構造なので、0件条件をそのまま維持しない。
    - id: UQ-002
      question: REQ-0161-005（check_integrity.ts exit 0）の到達不能解消方向
      decision: strict pass 基準を再定義（baseline-aware）
      rationale: check_integrity.ts exit 0 は既存 baseline failing により到達不能。当該変更起因の悪化なし／対象NG解消を基準にする。
    - id: UQ-003
      question: check_doc_inputs.ts と /repo/docs-check の関係整理
      decision: extensions 機構対応で整理
      rationale: check_doc_inputs.ts と /repo/docs-check は旧 .agentdev/doc-inputs/** 前提から .agentdev/extensions/** 前提へ更新する。
    - id: UQ-004
      question: docs 内部6ファイルの inspect-doc-inputs 参照残留処理
      decision: 一律機械的置換ではなく文脈別処理。通常参照は置換、IR-056-project-doc-input-integrity.md は extensions 機構への書き換え対象とする。
      rationale: 6ファイルの旧参照は処理対象。ただし IR-056-project-doc-input-integrity.md は検査ルール定義そのものなので、単純置換ではなく extensions 機構への書き換え対象にする。
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      RU-0017（REQ-0161 検証自己参照）と RU-0023（inspect 移行残作業）はトピック・対象REQ・理由が異なるため、本ドラフト内で2 OU（OU-001, OU-002）として構造分離する。case-open 時は原則として別 Issue へ分割する。ただし work_type は両者とも maintenance に該当するため単一ドラフトに収める。

  - id: AG-002
    content: |
      REQ-0161-004/005 の構造的到達不能は、要件文書が削除対象IDをリテラル含むという構造的矛盾に起因する。要件定義の必然性（何を削除するか明記）と検証の厳格性（0件到達）が両立しない。解消方向は UQ-001/UQ-002 にて確定する。

  - id: AG-003
    content: |
      RU-0023 inspect 移行残作業は、検査機構統合（check_doc_inputs.ts / IR-056）と docs 参照是正（6ファイル）の2副次課題からなる。両副次課題の処理方針は UQ-003/UQ-004 にて確定する。検査機構統合が主、docs 参照是正が従（検査機構統合方針に従って処理）。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-0161.md
    source_items: [AG-002]
    content: |
      REQ-0161-004/005 の更新内容（UQ-001/UQ-002 確定済み）:
      - REQ-0161-004: 完了条件に自己参照除外の修飾を追加する。REQ-0161.md 自身の記述を除外条件として明記し、README.md のタイトル行過剰ヒットも除外対象に含める。
      - REQ-0161-005: strict pass 基準を baseline-aware に再定義する。exit 0 ではなく「当該変更起因の NG 増加なし、かつ対象NG（broken-req-ref/broken-adr-ref/adr-req-crossref の REQ-0161 由来3件）解消」を pass 基準とする。既存 baseline 56件は変更対象外。

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-0124.md
    source_items: [AG-003]
    content: |
      REQ-0124（inspect-* 検出コマンド群統一・lifecycle）の更新内容（UQ-003/UQ-004 確定済み）:
      - check_doc_inputs.ts と /repo/docs-check を旧 .agentdev/doc-inputs/** 前定から .agentdev/extensions/** 前提へ更新する（extensions 機構対応）。IR-056 ルール定義も extensions 機構へ書き直す。
      - docs 内部6ファイル（DOC-MAP.md, system.md, project-doc-inputs.md, runtime-package-boundary.md, command-file-format.md）の inspect-doc-inputs 参照は機械的置換で処理する。
      - IR-056-project-doc-input-integrity.md は検査ルール定義そのもののため、単純置換ではなく extensions 機構への書き換え対象とする。

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0017
    target_req: REQ-0161
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: separate
    result:
      saved_req_docs:
        - docs/requirements/REQ-0161.md
      artifact_action_id: ACT-REQ-001
      operation_applied: update
      changed_rows:
        - REQ-0161-004
        - REQ-0161-005
      source_ru_to_req_mapping:
        RU-0017: REQ-0161
      case_open_input: "REQ-0161 UPDATE 完了。要件行 REQ-0161-004/005 のみ更新（自己参照除外修飾 + baseline-aware strict pass 基準）。case-open は REQ-0161 を参照して Issue を作成すること。"
    note: REQ-0161-004/005 構造的到達不能解消。UQ-001/UQ-002 確定済み（自己参照除外修飾 + baseline-aware strict pass 基準）。

  - ou_id: OU-002
    source_ru: RU-0023
    target_req: REQ-0124
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: separate
    result:
      saved_req_docs:
        - docs/requirements/REQ-0124.md
      artifact_action_id: ACT-REQ-002
      operation_applied: append
      changed_rows:
        - REQ-0124-022
        - REQ-0124-023
      source_ru_to_req_mapping:
        RU-0023: REQ-0124
      case_open_input: "REQ-0124 APPEND 完了。新規要件行 REQ-0124-022/023 追加（extensions 機構対応 + docs 参照是正文脈別処理）。case-open は REQ-0124 を参照して Issue を作成し、docs 是正作業を含めること。"
    note: inspect-doc-inputs → inspect-extensions 移行残作業。UQ-003/UQ-004 確定済み（extensions 機構対応 + 文脈別処理: 通常参照は置換、IR-056 は extensions 機構へ書き換え）。検査機構統合（check_doc_inputs.ts / IR-056）と docs 参照是正（6ファイル）を含む。

unresolved_questions:
  - id: UQ-001
    question: |
      REQ-0161-004（`rg "ADR-0133|REQ-0157|project-doc-inputs|config\.yaml" docs/` が0件）の構造的到達不能をどう解消するか。要件文書 REQ-0161.md 自身が削除対象IDをリテラル含むため、要件文書を削除しない限り0件に到達しない。
    options:
      - id: UQ-001-a
        label: "完了条件に自己参照除外修飾を追加"
        description: "REQ-0161-004 を「(要件文書 REQ-0161.md 自身の記述を除く)」と修飾。最小変更だが機械判定が困難。"
      - id: UQ-001-b
        label: "検証コマンドを要件文書から SPEC/runner へ分離"
        description: "要件文書には成果物状態のみ記述し、検証コマンドは SPEC または check_integrity.ts 側へ分離。構造的解決だが影響範囲大（他REQの検証コマンド埋め込み慣行への波及）。"
      - id: UQ-001-c
        label: "check_integrity.ts に自己参照除外ロジックを仕組み化"
        description: "検査対象ファイル自身のID参照を baseline 除外する汎用ロジックを追加。汎用性あり、他REQでも再利用可能。check_integrity.ts 側の実装となる。"
    evidence: |
      RU-0017.md 課題1。PR #1417 で顕在化。REQ-0161-004 の正規表現が REQ-0161.md 自身にマッチ。README.md の REQ-0161 エントリ行（タイトル文字列）も過剰ヒット（課題2）。
    classification: user_decision

  - id: UQ-002
    question: |
      REQ-0161-005（check_integrity.ts と check_extensions.ts が exit 0）の構造的到達不能をどう解消するか。REQ-0161.md が ADR-0133/REQ-0157 への unique ref を保持するため broken-req-ref / broken-adr-ref / adr-req-crossref の3 NG が発生し exit 1 となる。check_integrity.ts は作業前から baseline-failing（exit 1、計59 NG、うち56件は既存 baseline）。
    options:
      - id: UQ-002-a
        label: "strict pass 基準を再定義（baseline 改善評価）"
        description: "exit 0 ではなく「baseline NG 数の増加なし、または減少」を pass 基準とする。REQ-0108 docs-check 設計と整合する方向。"
      - id: UQ-002-b
        label: "自己参照由来 NG を除外ロジックとして仕組み化"
        description: "UQ-001-c と同方針。check_integrity.ts に自己参照由来 NG の除外ロジックを追加。"
    evidence: |
      RU-0017.md 課題2。check_integrity.ts baseline-failing 59 NG（56件既存 baseline + 3件 REQ-0161 由来）。strict pass 基準 REQ-0161-005 は構造的に到達不能。
    classification: user_decision

  - id: UQ-003
    question: |
      check_doc_inputs.ts（repo-local、repo-agentdev-integrity skill 配下）と /repo/docs-check の関係をどう整理するか。extensions 移行後に IR-056 の前提（.agentdev/doc-inputs/** 構造）が陈腐化する可能性がある。
    options:
      - id: UQ-003-a
        label: "check_doc_inputs.ts を extensions 機構へ対応"
        description: "check_doc_inputs.ts を .agentdev/extensions/** 構造へ対応させる。IR-056 ルール定義を extensions 機構へ書き直し。"
      - id: UQ-003-b
        label: "inspect-extensions 側へ機能統合"
        description: "check_doc_inputs.ts の機能を inspect-extensions 検査7（旧 doc-inputs 残存検出）へ統合し、check_doc_inputs.ts は廃止。IR-056 は retire。"
      - id: UQ-003-c
        label: "併存期間を設けて段階移行"
        description: "当面 check_doc_inputs.ts を repo-local 維持、inspect-extensions 検査7 を warning 運用継続。将来 Issue で全面移行。"
    evidence: |
      RU-0023.md 残作業1。PR #1409 で inspect-doc-inputs → inspect-extensions へ統合・改名済み。check_doc_inputs.ts は case-close Step 3-1、/repo/docs-check から呼出対象。IR-056 は PR #1410 で全面書き直し済みだが docs 側が未追従。
    classification: user_decision

  - id: UQ-004
    question: |
      docs 内部6ファイル（DOC-MAP.md, system.md, project-doc-inputs.md, runtime-package-boundary.md, command-file-format.md, IR-056-project-doc-input-integrity.md）の inspect-doc-inputs 参照残留をどう処理するか。
    options:
      - id: UQ-004-a
        label: "機械的置換（inspect-doc-inputs → inspect-extensions）"
        description: "6ファイル全てで inspect-doc-inputs を inspect-extensions へ機械的置換。最小作業。"
      - id: UQ-004-b
        label: "文脈に応じて書き直し"
        description: "各ファイルの文脈を確認し、適切に書き直し。IR-056-project-doc-input-integrity.md は検査ルール定義そのものが inspect-doc-inputs を前提としており、参照置換では不十分な可能性。"
    evidence: |
      RU-0023.md 残作業2。6ファイルに旧 command 名参照残留。PR #1409 Findings 記載。ADR-0133.md, REQ-0157.md は歴史参照のため更新不要と判断済み。
    classification: user_decision

test_strategy:
  - id: TS-001
    target_item: OU-001
    verification: |
      UQ-001/UQ-002 確定後に REQ-0161-004/005 の更新内容を検証する。選択された解消方向に基づき、REQ-0161.md 自身の存在が検証結果に影響しないことを確認する。
    pass_criteria: |
      REQ-0161-004/005 の完了条件が、REQ-0161.md 自身の存在に関わらず客観的に判定可能であること。
    on_failure: |
      fix-and-reverify。完了条件記述または check_integrity.ts ロジックを修正して再確認する。

  - id: TS-002
    target_item: OU-002
    verification: |
      UQ-003/UQ-004 確定後に検査機構統合と docs 参照是正を検証する。選択された方針に基づき、check_doc_inputs.ts / IR-056 / 6ファイルの参照が整合していることを確認する。
    pass_criteria: |
      検査機構（check_doc_inputs.ts / IR-056）の extensions 対応方針が確定し、6ファイルの inspect-doc-inputs 参照が方針に従って処理されていること。
    on_failure: |
      fix-and-reverify。検査機構または docs 参照を修正して再確認する。

case_open_hints:
  epic_needed: false
  decomposition: |
    OU-001（REQ-0161 自己参照解消）と OU-002（inspect 移行残作業）は独立した課題。原則として別 Issue へ分割する。両 OU とも UQ 確定後に実施可能。
  wave_hints:
    - "OU-001 と OU-002 は並列実行可能（依存関係なし）。UQ 確定後に Wave 1 として並列展開可能。"
  split_recommendation: |
    本ドラフトは2つの独立課題を含むため、case-open 時に別 Issue 分割を推奨する（issue_policy: separate）。OU-001 → Issue A（REQ-0161 UPDATE）、OU-002 → Issue B（REQ-0124 UPDATE + docs 是正）。

split_forecast:
  measured_at: draft
  metrics:
    requirement_rows: 2
    concern_categories: 2
    artifact_types: 2
    spec_separation_violations: 0
  signals:
    requirement_rows: 0
    concern_categories: 1
    artifact_types: 1
    spec_separation_violations: 0
  total_signal: 2
  recommended_action: "SPLIT 検討（要件行数少ないが関心分類・成果物種別が複数）。case-open 時の別 Issue 分割で対応。"
  thresholds_ref: req-health-metrics SPEC
```

# summary

RU-0017（REQ-0161 検証自己参照の構造的到達不能）と RU-0023（inspect-doc-inputs → inspect-extensions 移行残作業）の2つの独立した maintenance 課題を統合ドラフトとして扱う。両課題はトピック・対象REQ・理由が異なるため case-open 時の別 Issue 分割を推奨する（OU-001 → REQ-0161 UPDATE、OU-002 → REQ-0124 UPDATE + docs 是正）。

4つの User Decision 未決分岐（UQ-001〜004）は全て確定済み:
- **UQ-001**: 完了条件を自己参照除外で修飾
- **UQ-002**: strict pass 基準を baseline-aware に再定義
- **UQ-003**: extensions 機構対応で整理（旧 .agentdev/doc-inputs/** → .agentdev/extensions/**）
- **UQ-004**: 一律機械的置換ではなく文脈別処理（通常参照は置換、IR-056 は extensions 機構へ書き換え）

auto_ready: true。OU-001 と OU-002 は並列実行可能。
