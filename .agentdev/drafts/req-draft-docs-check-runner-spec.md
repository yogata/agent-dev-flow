---
draft_type: requirement
topic_slug: docs-check-runner-spec
status: saved
created_at: "2026-07-03"
source_rus:
  - RU-0005
---

# draft-data

```yaml
work_type: fix
scale: standard
summary: |
  docs-check が依存する check_read_contracts.ts は Bun 実行前提で実装されているが、
  command 定義（docs-check.md）および対応する SPEC（inspect-read-contracts.md）に
  実行ランナーの明記がない。利用者が node 等の別ランナーで実行し ESM エラーが発生する。
  REQ-0108-054「実行環境は再現可能」にランナー明記義務を追加し、
  SPEC レベルで実行ランナーを明示することで再発を防止する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      docs-check 依存 script の実行に必要なランナーを、command 定義および対応する SPEC に明記すること。
      具体的なランナー名（Bun 等）の指定は SPEC および command 定義の詳細であり、
      要件行では「依存 script の実行ランナーを明記すること」を義務付ける。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-0108.md
    target_area: REQ-0108-054
    source_items:
      - AG-001
    content: |
      REQ-0108-054 を以下の通り更新:
      現行: 「docs-check の実行環境は repository 内で再現可能であること」
      更新後: 「docs-check の実行環境は repository 内で再現可能であり、依存 script の実行に必要なランナーを command 定義および対応する SPEC に明記すること」

  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/inspect-read-contracts.md
    target_area: 実行ランナー
    target_spec:
      operation: spec-update
      domain: commands
      slug: inspect-read-contracts
    source_items:
      - AG-001
    content: |
      inspect-read-contracts.md に実行ランナー規約を追加。
      check_read_contracts.ts は Bun 実行前提（ESM import 構文使用）であり、
      node 等の他ランナーでは ESM エラーが発生する。
      SPEC 本文に「実行ランナー: Bun」を明記し、command 定義側でも同様に明記することを SPEC から要求する。

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0005
    target_req: REQ-0108
    target_spec:
      operation: spec-update
      domain: commands
      slug: inspect-read-contracts
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_reqs:
        - req_id: REQ-0108
          operation: update
          file: docs/requirements/REQ-0108.md
          updated_rows:
            - REQ-0108-054
      spec_actions:
        - action_id: ACT-SPEC-001
          status: skipped
          reason: target_file_not_found_ENOENT
          target: docs/specs/commands/inspect-read-contracts.md
          recommendation: rerun spec-save with operation=spec-create or correct target path

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs-check command 定義（src/opencode/commands/agentdev/docs-check.md）および
      inspect-read-contracts SPEC（docs/specs/commands/inspect-read-contracts.md）の両文書で、
      check_read_contracts.ts の実行ランナー（Bun）が明記されていることを文書確認する。
      併せて Bun 以外のランナー（node）で check_read_contracts.ts を実行し ESM エラーが再現することを確認する。
    pass_criteria: |
      両文書に実行ランナー（Bun）の記述が存在し、
      Bun 以外のランナー実行で ESM エラーが発生することが確認できること。
    on_failure: fix-and-reverify

case_open_hints:
  epic_needed: false
spec_actions_consumed: true
spec_actions_status: partial
spec_actions_followups:
  - action_id: ACT-SPEC-001
    target: docs/specs/commands/inspect-read-contracts.md
    reason: target_file_not_found_ENOENT
    recommendation: rerun spec-save with operation=spec-create, or correct target path to an existing SPEC
```

# summary

RU-0005 は check_read_contracts.ts が Bun 実行前提にも関わらず、command 定義・SPEC にランナー明記がないため、利用者が node 等で実行し ESM エラーに遭遇する問題。

REQ-0108-054「実行環境は再現可能」はランナー明記を含意していなかったため、UPDATE で「依存 script の実行に必要なランナーを明記する」義務を追加する。具体的なランナー名（Bun）は SPEC・command 定義の詳細。

docs-check.md（command定義）への「Bun実行」明記は配布物（src/opencode/commands/agentdev/）の変更であり case-run 実装工程の対象。req-define では要件・SPEC レベルの変更のみを扱う。
