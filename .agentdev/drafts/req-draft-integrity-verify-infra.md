---
draft_type: requirement
topic_slug: integrity-verify-infra
status: saved
created_at: "2026-07-03"
source_rus:
  - RU-0002
  - RU-0014
  - RU-0015
---

# draft-data

```yaml
work_type: maintenance
scale: standard
summary: |
  docs-check / integrity 検証インフラに関わる3件の品質改善要件。
  (1) check_integrity.test.ts valid fixture が baseline 既知違反の影響で失敗する問題の要件化。
  (2) req-save / spec-save SPEC 記載項目と check_changed_docs.ts profile rules の対応関係が
      明示的でなく、1:1対応が必要か不明な問題の解消。
  (3) check_integrity.ts findRepoRoot が worktree 環境で正しく動作しない問題の要件化。
  3件は integrity 検証インフラの異なる関心だが、docs-check 信頼性向上の共通関心で統合。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      docs-check 回帰テストの valid fixture は、baseline 登録済みの既知違反（CanonicalBoundary /
      CaptureBoundary 等）の影響を受けず、安定して通過する構成であること。
      既知違反と valid fixture のテストデータ分離が不十分な場合は、テストデータ構成を見直すこと。

  - id: AG-002
    content: |
      SPEC 記載項目と check_changed_docs.ts profile rules の対応関係について、
      1:1対応を必須とせず、既存 rule による包括カバーを許容する旨を明記すること。
      SPEC または REQ に「1:1対応を必須としない、包括カバーで充足する」方針を明示し、
      今後の SPEC / rule 追加時の判断基準を提供すること。

  - id: AG-003
    content: |
      check_integrity.ts の root 解決方式は worktree 環境を考慮し、
      CI（check_changed_docs.ts --base-ref）とローカル開発の両方で一貫した検証結果を提供すること。
      findRepoRoot がスクリプト配置位置起点で main repo root を返す現状を踏まえ、
      --root 引数、環境変数、worktree 検出のいずれかで worktree ルートを正しく解決すること。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-0108.md
    target_area: 要件テーブル末尾
    source_items:
      - AG-001
    content: |
      REQ-0108 に以下を append:
      REQ-0108-268: docs-check 回帰テストの valid fixture は baseline 登録済みの既知違反の影響を受けず、安定して通過するテストデータ構成であること。既知違反と valid fixture の分離が不十分な場合はテストデータ構成を見直すこと（REQ-0108-055、REQ-0108-258 関連）

  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-0108.md
    target_area: 要件テーブル末尾
    source_items:
      - AG-002
    content: |
      REQ-0108 に以下を append:
      REQ-0108-269: docs-check の SPEC 記載項目と check_changed_docs.ts profile rules の対応関係は、1:1対応を必須とせず、既存 rule による包括カバーを許容すること。SPEC または integrity-rule-catalog.md に本方針を明記し、今後の SPEC / rule 追加時の判断基準を提供すること

  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: docs/requirements/REQ-0145.md
    target_area: 要件テーブル末尾
    source_items:
      - AG-003
    content: |
      REQ-0145 に以下を append:
      REQ-0145-012: check_integrity.ts の root 解決方式は worktree 環境を考慮し、CI とローカル開発の両方で一貫した検証結果を提供すること。findRepoRoot は --root 引数、環境変数、worktree 検出のいずれかで worktree ルートを正しく解決すること

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0002
    target_req: REQ-0108
    target_spec: null
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_doc: docs/requirements/REQ-0108.md
      saved_requirement_id: REQ-0108-268
      source_agreed_item: AG-001
      artifact_action_id: ACT-REQ-001
      draft_proposed_id: REQ-0108-268
      renumbered: false

  - ou_id: OU-002
    source_ru: RU-0014
    target_req: REQ-0108
    target_spec: null
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_doc: docs/requirements/REQ-0108.md
      saved_requirement_id: REQ-0108-269
      source_agreed_item: AG-002
      artifact_action_id: ACT-REQ-002
      draft_proposed_id: REQ-0108-269
      renumbered: false

  - ou_id: OU-003
    source_ru: RU-0015
    target_req: REQ-0145
    target_spec: null
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result:
      saved_req_doc: docs/requirements/REQ-0145.md
      saved_requirement_id: REQ-0145-014
      source_agreed_item: AG-003
      artifact_action_id: ACT-REQ-003
      draft_proposed_id: REQ-0145-012
      renumbered: true
      renumber_reason: "採番ルール（max+1, 欠番埋め禁止）により 012 → 014 に修正。REQ-0145-012, 013 は既存。"

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      main ブランチで check_integrity.test.ts を実行し、valid fixture 系が全て通過することを確認する。
      CanonicalBoundary / CaptureBoundary の baseline 既知違反が valid fixture に影響していないことを確認する。
    pass_criteria: |
      valid fixture 系の失敗が 0 件であること。
      baseline 既知違反と valid fixture のテストデータが分離されていること。
    on_failure: fix-and-reverify

  - id: TS-002
    target_item: AG-002
    verification: |
      integrity-rule-catalog.md SPEC または REQ-0108 に、
      SPEC 記載項目と profile rules の対応関係について
      「1:1対応を必須とせず、包括カバーを許容する」旨の明記があることを文書確認する。
    pass_criteria: |
      明記があり、今後の SPEC / rule 追加時の判断基準として参照可能であること。
    on_failure: fix-and-reverify

  - id: TS-003
    target_item: AG-003
    verification: |
      worktree 環境内で check_integrity.ts を実行し、
      findRepoRoot が worktree ルートを正しく検出することを確認する。
      CI 環境（check_changed_docs.ts --base-ref）との検証結果一貫性を確認する。
    pass_criteria: |
      worktree 内で root が worktree パスに解決され、
      ローカルと CI で一貫した検証結果が得られること。
    on_failure: fix-and-reverify

case_open_hints:
  epic_needed: false
```

# summary

3件の integrity 検証インフラ品質改善要件を統合。

**RU-0002（valid fixture 失敗）**: check_integrity.test.ts の valid fixture 系が、CanonicalBoundary / CaptureBoundary の baseline 既知違反の影響で main ブランチで失敗（3-6件）。テストデータ構成の見直しにより、既知違反と valid fixture の分離を図る。要件としては REQ-0108-268（回帰テスト安定性）として要件化。

**RU-0014（SPEC と rules 対応関係）**: req-save / spec-save SPEC 記載項目の一部が check_changed_docs.ts profile rules に明示的対応 rule 未実装。実用上は既存 rule が包括カバー（AG-009 MET 判定済）。1:1対応を必須とせず包括カバーを許容する方針を明記し、判断基準を提供する。REQ-0108-269 として要件化。

**RU-0015（findRepoRoot worktree 非対応）**: check_integrity.ts findRepoRoot がスクリプト配置位置起点で main repo root を返し、worktree 内編集結果検証が困難。--root 引数 / 環境変数 / worktree 検出で worktree ルートを正しく解決する。REQ-0145-012 として要件化。

実装詳細（fixture 修正、findRepoRoot 修正）は case-run 実装工程の対象。req-define では要件レベルの変更のみを扱う。
