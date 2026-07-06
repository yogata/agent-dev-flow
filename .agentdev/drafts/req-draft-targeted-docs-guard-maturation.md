---
draft_type: req_draft
topic_slug: targeted-docs-guard-maturation
status: saved
spec_consumed: true
created_at: 2026-07-06T12:00:00+09:00
saved_at: 2026-07-07T00:00:00+09:00
source_rus: [RU-20260706-01]
---

<!-- req_draft テンプレート
  このテンプレートは req-define が生成する構造化引き継ぎ成果物の原本である。
  後続工程（req-save/ spec-save/ case-open/ case-auto/ case-run/ case-close）が参照する
  原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
  soft contract（生成元側標準）であり、LLM 推論経由で消費される。
  厳格なスキーマバージョン、JSON Schema、バリデータは導入しない。 -->

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
work_type: feature

# scale: feature のみ standard / large。
scale: large

# summary: 当該 draft が何を合意したかの1段落要約。
summary: >
  check_changed_docs.ts 中心の変更文書限定検査契約を Phase 1-6 で成熟させる。
  Phase 1: 挙動SPEC/カタログSPEC/実装詳細SPEC への配置。Phase 2: TargetedDocsReport 型固定（doc_inputs_check_required は削除、extensions_check_required が後継）。
  Phase 3: 対象確定をコマンド側へ移行。Phase 4: コマンド別最小監査範囲。Phase 5: 回帰テスト。Phase 6: validator 分割基準文書化。
  コマンドと check_changed_docs.ts の責務分担、評価対象はフォーマット検査に限定。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目。
agreed_items:
  - id: AG-001
    content: >
      Phase 1（SPEC 配置）: check_changed_docs.ts の変更文書限定検査契約は、挙動SPEC（entry/対象解決/profile/validator呼出/report契約/exit code）、カタログSPEC（TargetedDocsReport 型定義、workflow profile 定義）、実装詳細SPEC（validator内部アルゴリズム、分割基準）に配置される。
      個別判定条件は IR-*.md に配置される。
      REQ-0158 本文から SPEC への抽出は、評価対象がフォーマット検査に限定（意味評価しない）する範囲で行う。
  - id: AG-002
    content: >
      Phase 2（report 契約固定）: TargetedDocsReport 型が固定され、型/戻り値/JSON/text出力/テストが一致する。
      必須フィールド: workflow, files_checked, coupled_files_checked, failures, warnings, doc_map_update_required, spec_readme_update_required, requirements_readme_update_required, full_docs_check_recommended, extensions_check_required, declared_files_check。
      doc_inputs_check_required は必須フィールドに含めない（削除）。extensions_check_required が後継。
      ユーザー承認済み（REQ-0161-003 が同フィールドを残置扱い、ADR-0135 が旧 doc-inputs 機構廃止を決定、実装上 interface 不在）。
  - id: AG-003
    content: >
      Phase 3（対象確定の命令側移行）: 対象確定はコマンド側が行う。check_changed_docs.ts は対象選定の十分性を判定しない。
      対象があれば --files を渡し、対象なければ原則呼出さない。
      --files 指定で files_checked:[] は失敗（FAILURE）扱い。--base-ref 指定で files_checked:[] は警告（WARNING）扱い。
  - id: AG-004
    content: >
      Phase 4（コマンド別最小監査範囲）: req-save/spec-save/case-run/case-close の各コマンドが、対象ファイル種別に応じた最小監査範囲を定義する。
      各コマンド SPEC と integrity-contracts.md の Workflow×ツールマトリックス表が SSoT。
      case-run/case-close は永続文書更新を契機に検査する。
  - id: AG-005
    content: >
      Phase 5（回帰テスト）: 変更文書限定検査の回帰テストが存在する。
      TargetedDocsReport の型/戻り値/JSON/text出力の一致を検証するテストを含む。
  - id: AG-006
    content: >
      Phase 6（validator 分割基準）: validator の分割基準が実装詳細SPEC に文書化される。
      分割基準は validator の責務境界、ファイルサイズ上限、関心分離ルールを含む。
  - id: AG-007
    content: >
      合意済基本方針（コマンドと check_changed_docs.ts の責務分担）: コマンドが対象確定を担い、check_changed_docs.ts が検査実行を担う。
      req-save/spec-save/ADR/README類/DOC-MAP の各検査範囲は各コマンド SPEC が定義する。
  - id: AG-008
    content: >
      合意済基本方針（評価対象の限定）: check_changed_docs.ts の評価対象はフォーマット検査に限定し、意味評価を行わない。
      意味判断の重い文書診断は取り込まない。

# artifact_actions: REQ/ADR/SPEC への保存対象を成果物別ではなく1つの配列に統合
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-0158.md
    target_area: "### workflow別検査責務の明確化 セクション 149行（doc_inputs_check_required 追加指示の取り下げ）+ ## 要件 セクション末尾（Phase 1-6 セクション追加）"
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008]
    content: |
      === 149行の更新後（### workflow別検査責務の明確化 セクション内） ===
      旧149行「- JSON 出力に doc_inputs_check_required と declared_files_check を追加する（既存フィールドは維持）。」を以下へ更新:
      - JSON 出力に declared_files_check を追加する（既存フィールドは維持）。TargetedDocsReport の必須フィールドに doc_inputs_check_required は含めない（extensions_check_required が後継）。

      === ## 要件 セクション末尾（case-run プロファイルの追加と --base-ref / --files 使い分け明記 の後）に追加する新セクション ===

      ### 変更文書限定検査契約の成熟（Phase 1-6）

      check_changed_docs.ts 中心の変更文書限定検査契約を Phase 1-6 で成熟させる。コマンドと check_changed_docs.ts の責務分担（コマンドが対象確定、check_changed_docs.ts が検査実行）、評価対象はフォーマット検査に限定（意味評価しない）を基本方針とする。

      #### Phase 1: SPEC 配置

      - check_changed_docs.ts の変更文書限定検査契約は、挙動SPEC（entry/対象解決/profile/validator呼出/report契約/exit code）、カタログSPEC（TargetedDocsReport 型定義、workflow profile 定義）、実装詳細SPEC（validator内部アルゴリズム、分割基準）に配置されること。
      - 個別判定条件は IR-*.md に配置されること。

      #### Phase 2: report 契約固定

      - TargetedDocsReport 型が固定され、型/戻り値/JSON/text出力/テストが一致すること。
      - 必須フィールド: workflow, files_checked, coupled_files_checked, failures, warnings, doc_map_update_required, spec_readme_update_required, requirements_readme_update_required, full_docs_check_recommended, extensions_check_required, declared_files_check。
      - doc_inputs_check_required は必須フィールドに含めないこと（extensions_check_required が後継）。

      #### Phase 3: 対象確定の命令側移行

      - 対象確定はコマンド側が行うこと。check_changed_docs.ts は対象選定の十分性を判定しないこと。
      - 対象があれば --files を渡し、対象なければ原則呼出さないこと。
      - --files 指定で files_checked が空の場合は失敗（FAILURE）扱い、--base-ref 指定で files_checked が空の場合は警告（WARNING）扱いとすること。

      #### Phase 4: コマンド別最小監査範囲

      - req-save/spec-save/case-run/case-close の各コマンドが、対象ファイル種別に応じた最小監査範囲を定義すること。
      - 各コマンド SPEC と integrity-contracts.md の Workflow×ツールマトリックス表が SSoT であること。
      - case-run/case-close は永続文書更新を契機に検査すること。

      #### Phase 5: 回帰テスト

      - 変更文書限定検査の回帰テストが存在すること。
      - TargetedDocsReport の型/戻り値/JSON/text出力の一致を検証するテストを含むこと。

      #### Phase 6: validator 分割基準

      - validator の分割基準が実装詳細SPEC に文書化されること。
      - 分割基準は validator の責務境界、ファイルサイズ上限、関心分離ルールを含むこと。

  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/integrity/integrity-contracts.md
    target_area: "## レポート形式（Report Format）、## スクリプト契約（Script Contract）、## Workflow × 使用ツールマトリックス"
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-007]
    content: |
      === ## レポート形式（Report Format）の更新 ===
      TargetedDocsReport 型定義を固定する。必須フィールド: workflow, files_checked, coupled_files_checked, failures, warnings, doc_map_update_required, spec_readme_update_required, requirements_readme_update_required, full_docs_check_recommended, extensions_check_required, declared_files_check。
      型/戻り値/JSON/text出力/テストが一致する契約を明記する。
      doc_inputs_check_required は含めない（extensions_check_required が後継）。

      === ## スクリプト契約（Script Contract）の更新 ===
      check_changed_docs.ts の挙動SPEC 契約（entry/対象解決/profile/validator呼出/report契約/exit code）を明記する。
      対象確定はコマンド側が行い、check_changed_docs.ts は対象選定の十分性を判定しない。
      --files 指定で files_checked:[] は FAILURE、--base-ref 指定で files_checked:[] は WARNING。
      評価対象はフォーマット検査に限定（意味評価しない）。

      === ## Workflow × 使用ツールマトリックスの更新 ===
      req-save/spec-save/case-run/case-close の各コマンドが対象ファイル種別に応じた最小監査範囲を定義する。
      case-run/case-close は永続文書更新を契機に検査する。
      各コマンド SPEC から同マトリックス表への参照リンクを張る（SSoT）。

  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: docs/specs/integrity/integrity-rule-catalog.md
    target_area: "check_changed_docs.ts 関連ルールの catalog エントリ"
    source_items: [AG-001]
    content: |
      check_changed_docs.ts が扱う個別判定条件を IR-*.md へ配置する際の catalog エントリを整理する。
      既存 IR-001〜059 のうち、check_changed_docs.ts が扱うルールと check_integrity.ts のみが扱うルールを明示的に区分する。
      詳細な IR-*.md の追加・更新内容は spec-save が確定する。

  - id: ACT-SPEC-003
    artifact: spec
    operation: create
    target_spec:
      operation: create
      domain: integrity
      slug: validator-split-criteria
    source_items: [AG-006]
    content: |
      新規 SPEC: docs/specs/integrity/validator-split-criteria.md

      validator の分割基準を実装詳細SPEC として文書化する。
      分割基準は以下を含む:
      - validator の責務境界（どの検査をどの validator が担うか）
      - ファイルサイズ上限（validator の 250 LOC 目安、超過時の分割ルール）
      - 関心分離ルール（1 validator = 1 検査関心）
      - check_changed_docs.ts の validator 構成（changed file resolver, workflow profile resolver, coupled file resolver, targeted check runner, JSON/text reporter）

# conflict_resolutions: 壁打ちで解消された衝突の記録
conflict_resolutions:
  - id: CR-001
    conflict: >
      REQ-0158:149 が doc_inputs_check_required の追加を指示するが、実装上 TargetedDocsReport interface に同フィールドは不在（check_changed_docs.ts 801行で存在しないプロパティを参照するコンパイルエラー級バグ）。extensions_check_required が後継として実装済み。
  - id: CR-001-resolution
    conflict: ""
    resolution: >
      doc_inputs_check_required は削除（remove）として確定（ユーザー承認）。
      根拠: REQ-0161-003 が同フィールドを「スコープ外（残置）」として REQ-0158 側での処理を想定、ADR-0135 が旧 doc-inputs 機構の廃止を決定、実装上 extensions_check_required が後継。
      Oracle 相談（bg_e99a99f4）の「削除推奨（formalizeではなくremove）」助言を採用。
      REQ-0158:149 を「declared_files_check を追加する」へ更新し、Phase 2 で doc_inputs_check_required 不在を明記する。
  - id: CR-002
    conflict: >
      ADR 要否。check_changed_docs.ts の契約成熟が ADR 対象か。
    resolution: >
      ADR 不要（Oracle 相談 bg_e99a99f4 で確定）。
      check_changed_docs.ts は repo-local（ADR-0104、配布物除外、ADR-0106 /repo/* namespace）。
      ADR ガイドライン #2（command動作仕様）/ #8（入出力形式）に該当し ADR 作成不可条件。
      ADR-0124（soft-contract）は適用外（TargetedDocsReport は機械的JSON契約であり req_draft soft contract ではない）。
      REQ-0158 APPEND/UPDATE + integrity-contracts.md UPDATE + IR-*.md 追加で処理。

# operation_units: 複数RU入力時の統合/分離結果。
operation_units:
  - ou_id: OU-001
    source_ru: RU-20260706-01
    target_req: REQ-0158
    target_spec: docs/specs/integrity/integrity-contracts.md
    operation: update
    scale: large
    depends_on: []
    recommended_order: 2
    issue_policy: epic
    result:
      saved_req:
        - req_id: REQ-0158
          path: docs/requirements/REQ-0158.md
          operation: update
          changes:
            - "frontmatter updated: 2026-07-07"
            - "line 149: doc_inputs_check_required 追加指示取り下げ"
            - "Phase 1-6 セクション追加（### 変更文書限定検査契約の成熟）"
      saved_spec:
        - spec_id: integrity-contracts
          path: docs/specs/integrity/integrity-contracts.md
          operation: update
          target_areas:
            - "## レポート形式（TargetedDocsReport 型契約サブセクション追加）"
            - "## スクリプト契約（check_changed_docs.ts 挙動SPEC 契約サブセクション追加）"
            - "## Workflow × 使用ツールマトリックス（最小監査範囲の前言追加）"
        - spec_id: integrity-rule-catalog
          path: docs/specs/integrity/integrity-rule-catalog.md
          operation: update
          target_areas:
            - "### check_changed_docs.ts 関連ルールの整理（REQ-0158 Phase 1）新規追加"
        - spec_id: validator-split-criteria
          path: docs/specs/integrity/validator-split-criteria.md
          operation: create
          status: draft
      artifact_action_mapping:
        ACT-REQ-001: REQ-0158
        ACT-SPEC-001: integrity-contracts
        ACT-SPEC-002: integrity-rule-catalog
        ACT-SPEC-003: validator-split-criteria (new)
      source_ru_mapping:
        RU-20260706-01: OU-001
      adr_created: false
      case_open_consumable: true

# test_strategy: 各合意項目（AG-*）の検証方法。
test_strategy:
  - id: TS-001
    target_item: AG-002
    verification: |
      TargetedDocsReport interface と実装とテストの一致を確認:
      - interface 宣言（TargetedDocsReport 型）と実装（runWorkflowChecks 戻り値）と JSON 出力と text 出力とテスト期望値が全て一致すること。
      - 必須フィールドが全て存在すること: workflow, files_checked, coupled_files_checked, failures, warnings, doc_map_update_required, spec_readme_update_required, requirements_readme_update_required, full_docs_check_recommended, extensions_check_required, declared_files_check。
    pass_criteria: |
      型/戻り値/JSON/text出力/テストが完全に一致し、必須フィールドが全て存在すること。
    on_failure: |
      fix-and-reverify。不一致箇所を修正して再検証。
  - id: TS-002
    target_item: AG-002
    verification: |
      doc_inputs_check_required の残存を検出:
      rg "doc_inputs_check_required" docs src .agentdev
      ※ REQ-0161.md の履歴参照（REQ-0161-003 の「スコープ外（残置）」記述）は履歴参照として許容。
    pass_criteria: |
      REQ-0158 と check_changed_docs.ts と integrity-contracts.md から doc_inputs_check_required が残存しないこと（REQ-0161.md の履歴参照は除く）。
    on_failure: |
      fix-and-reverify。残存箇所を削除して再検証。
  - id: TS-003
    target_item: AG-003
    verification: |
      check_changed_docs.ts の対象確定挙動を確認:
      - --files 指定で files_checked が空の場合、exit code が FAILURE（非ゼロ）であること。
      - --base-ref 指定で files_checked が空の場合、warnings 配列に警告が含まれ、exit code が WARNING 扱いであること。
      - check_changed_docs.ts が対象選定の十分性を判定しないこと（対象が空の場合のメッセージが「対象選定の十分性」ではなく「対象ファイルが検出されなかった」旨であること）。
    pass_criteria: |
      --files 指定時は FAILURE、--base-ref 指定時は WARNING で分岐すること。対象選定の十分性判定を行わないこと。
    on_failure: |
      fix-and-reverify。分岐ロジックとメッセージを修正して再検証。
  - id: TS-004
    target_item: AG-005
    verification: |
      変更文書限定検査の回帰テストの存在を確認:
      - check_changed_docs.test.ts（または同等のテストファイル）が存在すること。
      - TargetedDocsReport の型/戻り値/JSON/text出力の一致を検証するテストケースが含まれること。
    pass_criteria: |
      テストファイルが存在し、TargetedDocsReport の一致検証テストが含まれること。
    on_failure: |
      fix-and-reverify。テストを追加して再検証。

# case_open_hints: case-open 構成生成への参考情報
case_open_hints:
  epic_needed: true
  decomposition:
    - wave: "Wave 1: Phase 1-2（SPEC配置、report契約固定）"
      description: "REQ-0158 APPEND/UPDATE、integrity-contracts.md UPDATE（レポート形式、スクリプト契約）、TargetedDocsReport 型固定とテスト"
    - wave: "Wave 2: Phase 3-4（対象確定、コマンド別監査範囲）"
      description: "check_changed_docs.ts の対象確定ロジック修正（--files/--base-ref 分岐）、Workflow×ツールマトリックス UPDATE、各コマンド SPEC の最小監査範囲定義"
    - wave: "Wave 3: Phase 5-6（回帰テスト、validator分割基準）"
      description: "回帰テスト追加、validator-split-criteria.md 新規作成、IR-*.md 追加"
  wave_hints: []
```

# summary

check_changed_docs.ts 中心の変更文書限定検査契約を Phase 1-6 で成熟させる合意を得た。

**主な変更対象**（case-open が Epic Issue を構成する際の参考）:
- docs/requirements/REQ-0158.md（149行取り下げ + Phase 1-6 セクション追加）
- docs/specs/integrity/integrity-contracts.md（レポート形式、スクリプト契約、Workflow×ツールマトリックス）
- docs/specs/integrity/integrity-rule-catalog.md（catalog エントリ整理）
- docs/specs/integrity/validator-split-criteria.md（新規: validator 分割基準）
- docs/specs/integrity/rules/IR-*.md（個別判定条件の追加・更新）
- src/opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts（実装修正: doc_inputs_check_required 参照削除、--files/--base-ref 分岐）
- 各コマンド SPEC（req-save.md, spec-save.md, case-run.md, case-close.md）の最小監査範囲定義

**doc_inputs_check_required の取り扱い**（ユーザー承認済み）:
- 削除（remove）。REQ-0158:149 の追加指示を取り下げ、実装バグ（801行）と合わせて削除。
- 根拠: REQ-0161-003（残置扱い）、ADR-0135（旧 doc-inputs 機構廃止）、extensions_check_required が後継。

**実装詳細の分離**（ユーザー承認済み）:
- validator 分割候補13件、回帰テスト項目の詳細、report 契約フィールド一覧の詳細は agreed_items（状態要件）から分離し、Wave 3 の完了条件・Issue 本文へ移送する対象とする。

**ADR 不要の根拠**（Oracle bg_e99a99f4）: check_changed_docs.ts は repo-local（ADR-0104）。ADR ガイドライン #2（command動作仕様）/ #8（入出力形式）に該当。ADR-0124（soft-contract）は TargetedDocsReport（機械的JSON契約）には適用外。

**対象外**（RU-20260706-01 本文で明示）:
- 通常コマンドで全体監査を毎回実行すること
- check_integrity.ts へ --files を追加すること
- 意味判断の重い文書診断を取り込むこと
- 検査設定とコマンドSPEC の 1:1 対応を強制すること

**非目標の補足**: doc_inputs_check_required の正式実装（formalize）は行わない（削除で確定）。
