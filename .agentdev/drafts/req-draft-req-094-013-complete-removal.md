---
draft_type: req_draft
topic_slug: req-094-013-complete-removal
status: draft
created_at: "2026-10-22T10:46:39+09:00"
source_rus:
  - RU-0245
---

# draft-data

```yaml
work_type: docs_chore
scale: standard

summary: |
  一回限りの適用（Case #3839、作業一覧 959 行処理）が完了した REQ-094-013（歴史文書の文章品質是正を読みを誤らせる確定誤記に限定する規定）を、2026-10-22 の利用者判断（Issue #3844 依頼、Issue #3838 検討）により docs/ と traceability/ から完全に削除する。削除後の歴史文書の是正境目は REQ-094-010 と REQ-053-039 の組み合わせ（REQ-094-013 追加前と同一状態）へ戻す。履歴上の事実は GitHub の Issue・PR・commit 記録が保持し、ドキュメント上には残さない。新規 REQ・Decision は作成しない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      docs/requirements/REQ-094.md から REQ-094-013 を完全に削除する。（1）「## 要件」表の REQ-094-013 行（32 行目）を削除する。（2）REQ-094-013 のみを対象とする ADF-COVERS(implementation) 宣言行（8 行目「<!-- ADF-COVERS(implementation): REQ-094-013 -->」）を削除する。（3）frontmatter の updated を 2026-10-21 から 2026-10-22 へ更新する。REQ-094 の他の要件行（REQ-094-001〜012）と REQ-001-017〜019 は現行維持する。
  - id: AG-002
    content: |
      traceability/policy.yaml の verification.optional から REQ-094-013 の登録（797 行目「- REQ-094-013」）と付随コメント 3 行（794〜796 行目）を削除する。あわせて traceability/req-094-013-verification.yaml（一回限り検証の記録ファイル、全文 7 行）を削除する。verification.optional の他エントリは無傷とする。
  - id: AG-003
    content: |
      docs/reports/req-094-013-one-time-verification.md（一回限り検証の判定記録）を削除する。docs/reports/ 配下の他ファイルは無傷とする。
  - id: AG-004
    content: |
      docs/designs/responsibilities/document-type-responsibilities.md の ADF-COVERS(design) 宣言行（11 行目）から REQ-094-013 を除去する（「REQ-094-011, REQ-094-013 -->」を「REQ-094-011 -->」へ変更）。同 Design の本文記述は変更しない。
  - id: AG-005
    content: |
      索引を generate_indexes で再生成する（AUTOGEN ブロックが現物と一致）。検査基盤の整合として、check_integrity が NG 0（baseline・unmanaged に REQ-094-013 起因の残留なし）、textlint 最終検査（agentdev-textlint-guard gate.ts、用途=最終検査）が ok=true であることを確認する。
  - id: AG-006
    content: |
      Issue #3844（依頼記録）をクローズし、完了報告に削除前の参照状況（docs/requirements/REQ-094.md、traceability/policy.yaml、traceability/req-094-013-verification.yaml、docs/reports/req-094-013-one-time-verification.md、docs/designs/responsibilities/document-type-responsibilities.md の 5 ファイルと各参照箇所）を記録する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-094.md
    source_items: [AG-001]
    content: |
      REQ-094.md から REQ-094-013 を完全削除する（3 編集）。編集 2・3 は最初の見出しより前に位置するためセクション見出しでaddressできない領域であり、req-file-manager の手順で直接適用する。
      編集 1:「## 要件」表から REQ-094-013 行を削除する。組立検査済み（assembly_evidence 参照。「## 要件」セクション内に 1 回のみ出現、削除差分 1 行）。削除対象の行全体（old_text は前行末の改行を含む行全体とし、空文字列へ置換する）:
      | REQ-094-013 | 文章品質の是正（本要件および REQ-001-017〜019 の適用）において、歴史文書（docs/requirements/retired/ 配下の廃止済み要件、docs/reports/ 配下の監査・実行記録、置換・廃止済みの決定文書〔status: superseded 等〕）に対して修正を行う対象は、読みを誤らせる確定誤記（誤字・別字形・表記の乱れ）に限ること。確定誤記の判定は、正しい表現が一意に定まり文脈によって意味が変わらない誤りを基準とし（REQ-094-009 が定める固定置換の安全基準に準拠する）、複数の自然な表現候補からの選択や文章構造の修正を要するものは言い回しとして修正対象から除外すること。確定誤記の修正も REQ-094-006/007/011 の維持規定に従うこと。置換・廃止済みの決定文書に対する本行の適用は REQ-094-010 の確認対象に基づく是正の運用として行い、REQ-053-039 が定める歴史記録（対象: docs/requirements/retired/ 配下と docs/reports/ 配下）の機械検査対象外の定義を変更しないこと |
      編集 2: 8 行目の ADF-COVERS(implementation) 宣言行全体を削除する。削除対象の行: 「<!-- ADF-COVERS(implementation): REQ-094-013 -->」（当該宣言は REQ-094-013 のみを列挙しており、行ごと削除する。削除後 REQ-094.md は ADF-COVERS 宣言を持たない状態＝REQ-094-013 追加前と同一状態へ戻る）
      編集 3: frontmatter の「updated: 2026-10-21」を「updated: 2026-10-22」へ更新する。

conflict_resolutions:
  - id: CR-001
    conflict: REQ-094-013 の処置として維持・移動・廃止（完全削除）の 3 案が存在した。
    resolution: |
      2026-10-22 の利用者判断により完全削除を確定した（判断経緯は Issue #3838 の境界節に記録済み、Issue #3844 が依頼記録）。ドキュメント上には残さず、履歴上の事実は GitHub の Issue・PR・commit 記録が保持する。後続コマンドは本判断を再確認しない。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0245
    target_req: REQ-094
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
      削除反映後、追跡対象 3 パス（docs/、traceability/、src/）を rg または git grep で文字列「REQ-094-013」により検索する。対象外は git 履歴、GitHub の Issue/PR 本文、.agentdev/ 配下（RU・draft・工程記録）とする。
    pass_criteria: |
      3 パスの検索結果が 0 件であること。修正対象列挙（REQ-094.md、traceability/policy.yaml、traceability/req-094-013-verification.yaml、docs/reports/req-094-013-one-time-verification.md、document-type-responsibilities.md の 5 ファイル、全て 3 パス配下）と検索網羅範囲が一致していること。
    on_failure: |
      fix-and-reverify。残存参照を特定して削除反映を完了させ、再検索して 0 件を確認する。残存先が履歴記録領域（docs/reports/ の他ファイル等）で削除対象外と判断される場合は、その判断根拠を Findings へ記録する（record-in-findings）。
  - id: TS-002
    target_item: AG-002
    verification: |
      traceability/req-094-013-verification.yaml のファイル不在確認と、traceability/policy.yaml から REQ-094-013 エントリおよび付随コメント 3 行（794〜796 行目）の消滅を確認する。
    pass_criteria: |
      当該ファイルが存在しないこと。policy.yaml の verification.optional に REQ-094-013 の登録と付随コメントが存在せず、他エントリ（REQ-090-013、REQ-095-003 等）が無傷であること。
    on_failure: |
      fix-and-reverify。削除を完了させ再確認する。
  - id: TS-003
    target_item: AG-003
    verification: |
      docs/reports/req-094-013-one-time-verification.md のファイル不在を確認する。
    pass_criteria: |
      当該ファイルが存在しないこと。docs/reports/ 配下の他ファイルが無傷であること。
    on_failure: |
      fix-and-reverify。削除を完了させ再確認する。
  - id: TS-004
    target_item: AG-004
    verification: |
      docs/designs/responsibilities/document-type-responsibilities.md の ADF-COVERS(design) 宣言行（REQ-094-001〜011, 013 を列挙する 11 行目）を確認する。
    pass_criteria: |
      宣言行が「REQ-094-011 -->」で終端し REQ-094-013 を含まないこと。他の ADF-COVERS 宣言（7〜10 行目、12 行目）と本文が無傷であること。
    on_failure: |
      fix-and-reverify。宣言行の修正を完了させ再確認する。
  - id: TS-005
    target_item: AG-005
    verification: |
      check_integrity を実行する（repo-local 検査経路 /repo/docs-check 相当の check_integrity 実行）。
    pass_criteria: |
      NG 0 であること。baseline・unmanaged に REQ-094-013 起因の残留がないこと。
    on_failure: |
      fix-and-reverify。REQ-094-013 起因の残留（baseline 不整合等）を解消し再実行する。
  - id: TS-006
    target_item: AG-005
    verification: |
      textlint 最終検査を実行する（agentdev-textlint-guard gate.ts、用途=最終検査）。
    pass_criteria: |
      ok=true であること。
    on_failure: |
      fix-and-reverify。検査指摘を解消し再実行する。
  - id: TS-007
    target_item: AG-005
    verification: |
      generate_indexes を実行して索引を再生成する。
    pass_criteria: |
      再生成後に AUTOGEN ブロックが現物と一致していること（再生成で差分が生じない状態、AUTOGEN 鮮度検査合格）。
    on_failure: |
      fix-and-reverify。索引の再生成と差分解消を完了させ再確認する。
  - id: TS-008
    target_item: AG-006
    verification: |
      Issue #3844 の状態と完了報告内容を確認する。
    pass_criteria: |
      Issue #3844 がクローズ済みであること。完了報告に削除前の参照状況（5 ファイルと各参照箇所: REQ-094.md 8 行目・32 行目、policy.yaml 794〜797 行、req-094-013-verification.yaml 全文、req-094-013-one-time-verification.md 全文、document-type-responsibilities.md 11 行目）が記録されていること。
    on_failure: |
      fix-and-reverify。完了報告への記録とクローズを完了させ再確認する。

realization_actions:
  - id: RA-001
    concern: REQ-094-013 に紐づくトレーサビリティ登録・検証記録・参照の機械的削除
    responsibility: |
      traceability/policy.yaml の verification.optional（検証義務登録の正）から当該エントリと付随コメント 3 行を削除し、traceability/req-094-013-verification.yaml（一回限り検証の正）と docs/reports/req-094-013-one-time-verification.md をファイル削除し、docs/designs/responsibilities/document-type-responsibilities.md の ADF-COVERS(design) 宣言から REQ-094-013 を除去する。REQ-094.md の ADF-COVERS(implementation) 宣言行の削除は ACT-REQ-001 に含む。
    ownership_hints:
      - "traceability/policy.yaml（verification.optional、794〜797 行目）"
      - "traceability/req-094-013-verification.yaml（削除対象ファイル）"
      - "docs/reports/req-094-013-one-time-verification.md（削除対象ファイル）"
      - "docs/designs/responsibilities/document-type-responsibilities.md（11 行目 ADF-COVERS(design) 宣言）"
    intent: |
      要件行の完全削除に伴い、当該行への登録・参照・記録を残さない。削除後の歴史文書の是正境目は REQ-094-010 と REQ-053-039 の組み合わせ（REQ-094-013 追加前と同一状態）に戻る。将来の歴史文書修正で境目が必要になった場合は、その時点で新たな判断とする（2026-10-22 利用者判断）。
    verification_refs: [TS-001, TS-002, TS-003, TS-004]
    source_items: [AG-002, AG-003, AG-004]
  - id: RA-002
    concern: 索引再生成と検査基盤での整合確認
    responsibility: |
      generate_indexes で索引を再生成し（AUTOGEN ブロックが現物と一致）、check_integrity・textlint 最終検査で削除反映後の整合を確認する。検査スクリプト本体の変更は不要（汎用基盤の実行のみ）。
    ownership_hints:
      - "docs/designs/integrity/index-auto-generation.md（索引類自動生成 Design）と generate_indexes 実行経路"
      - "check_integrity（repo-local /repo/docs-check 相当の検査経路）"
      - "agentdev-textlint-guard gate.ts（用途=最終検査）"
    intent: |
      REQ-094-013 起因の残留（AUTOGEN 不一致・baseline 残留・検査 NG）を 0 件にする。
    verification_refs: [TS-005, TS-006, TS-007]
    source_items: [AG-005]

review_dispositions:
  - id: RD-001
    source_ru: RU-0245
    source_item: req-094-013-complete-removal
    disposition: covered
    reason_code: fully_reflected_in_draft
    reason: |
      RU-0245 の必須 8 セクション（目的・対象・対象外・正規所有者とアンカー・依存関係・要件化の方向・決定的受け入れ条件・Source Summary）の内容を AG-001〜AG-006、ACT-REQ-001、RA-001/RA-002、TS-001〜TS-008、CR-001 へ過不足なく反映した。2026-10-22 の本 draft 生成時の参照実在確認でも、追跡対象（docs/・traceability/・src/・.agentdev/extensions/skills/）における REQ-094-013 の参照は RU 記載の 5 ファイルのみであることを再確認済み。RU は case-ready 成功後に削除されるため、代替識別子として RU-0245、Issue #3844（依頼）、#3835（追加の経緯）、#3839（適用完了）、#3838（再定義検討）を本理由に併記する。
    evidence:
      path: .agentdev/backlog/req-units/RU-0245.md
      section: 本文全体（必須 8 セクション）
      checked_at_commit: null
    related_removed_items: []

assembly_evidence:
  - target_file: docs/requirements/REQ-094.md
    target_content_sha256: 725f449ec6a7dc1f6f2eacdf68eb03edffcec78a6d1a38e6cfff9780bccc27a2
    check_scope:
      heading: "## 要件"
      start_line: 16
      end_line: 33
    execution_conditions:
      operation: replace
      edit_sha256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
      expected_old_count: 1
    checker:
      name: assemble-draft-section
      version: 0.2.0
      settings:
        heading_match: exact-after-normalization
        old_text_count_check: true
    result_affecting_references:
      heading_match_rule: "search-target-area.ts compatible: normalizeTargetArea + exact match only + code-fence-aware scan"
      scan_scope: target section only
    checks_summary:
      pre:
        count: 3
        all_ok: true
      post:
        count: 3
        all_ok: true
    diff_compact:
      changed_lines_count: 1
      added: 0
      removed: 1
    executed_at: "2026-10-22T01:46:39.334Z"

case_open_hints:
  epic_needed: false
```

# summary

- 合意内容: REQ-094-013（歴史文書の文章品質是正を読みを誤らせる確定誤記に限定する規定）を一回限り適用の完了（Case #3839）に伴い完全削除する。対象は REQ-094.md（要件行・ADF-COVERS(implementation) 宣言・frontmatter updated）、traceability/policy.yaml（verification.optional 登録と付随コメント）、traceability/req-094-013-verification.yaml（削除）、docs/reports/req-094-013-one-time-verification.md（削除）、document-type-responsibilities.md（ADF-COVERS(design) 宣言）の 5 ファイルと索引再生成。
- Decision 判断（STEP-5）: Decision 不要。「削除、廃止、移行、統合、再構築、完全削除そのものを主題にした Decision は作成しない」（Decision作成不可条件）に該当し、記録媒体は GitHub の Issue #3838/#3844・PR・commit 履歴に確定済み（2026-10-22 利用者判断）。
- 変更誘発境界リスク分析（5 観点）: dependency boundary（5 ファイルの参照残存リスク → TS-001〜TS-004）、execution boundary（check_integrity・textlint・AUTOGEN の不整合リスク → TS-005〜TS-007）に case-specific risk を導出し検証へ投影済み。client/server・build/runtime・environment propagation の 3 観点は該当なし（対外サービス・ビルド対象・配布物への影響なし。src/ 参照なしを実証済み）。
- adversarial-review（STEP-8）: skip。skip 条件（軽量 Scale・Decision判断対象なし・意味的決定なし）に該当。全意味内容は RU-0245 の利用者確定判断（3 案比較 → 完全削除確定、合意成立 2026-10-22T09:40+09:00）に由来し、本 draft は機械的反映のみ。
