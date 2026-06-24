---
draft_type: req_draft
topic_slug: docs-cleanup-batch
status: draft
created_at: 2026-06-24T00:00:00+09:00
source_rus: [RU-0001, RU-0002, RU-0004, RU-0005]
---

# draft-data

```yaml
work_type: docs_chore

spec_actions_consumed:
  status: consumed
  consumed_at: 2026-06-24
  consumed_actions: [ACT-SPEC-001, ACT-SPEC-002, ACT-SPEC-003]
  warnings:
    - id: ACT-SPEC-001
      reason: "status: draft → accepted 変更要請は spec-save G06/G11 により禁止（case-close Step 3 責務）。status 変更をスキップし本文整合性確認のみ実施"

summary: >
  Wave 1〜4 完了後に取り残された文書の整合性ギャップ 4 件を一括で解消する。
  RU-0001 は agentdev-gh-cli SPEC の frontmatter を draft から accepted へ昇格し、
  Wave 2 クローズ後も放置された SPEC lifecycle（ADR-0123）の完結状態を回復する。
  RU-0002 は ADR-0131 の link mode 統一に追随していない 4 箇所（integrity-rule-catalog IR-047、
  DOC-MAP REQ-0141 coverage 列、glossary、consumer-project-setup）を現行語彙へ一括整形し、
  docs-check の誤検知リスクと consumer 導線のミスを除去する。
  RU-0004 は case-run-execution-adapter SKILL.md 内の cross-skill 参照パスを明示表記へ是正し、
  ReferencePath NG と委譲プロンプトの参照解決不能を解消する。
  RU-0005 は DOC-MAP と req-impact-map に欠落した REQ-0142〜0147 の行を補完し、
  REQ カタログの完全性を前提とする docs-check / inspect-docs の基盤を整える。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: >
      docs/specs/skills/agentdev-gh-cli.md の frontmatter は status: accepted であり、
      updated は 2026-06-24 に更新されていること。
      SPEC 本文は ADR-0130 の 6 決定事項、REQ-0149 の全完了条件、および Wave 2 実装結果
      （ローカル版 agentdev-gh-cli、link 先差し替え）と矛盾しない記述であること。
      不足があれば本文も補正されていること。
  - id: AG-002
    content: >
      docs/DOC-MAP.md の agentdev-gh-cli SPEC 行は status: accepted を反映していること。
      RU-0002 が更新する REQ-0141 coverage 列とは行が重複しないこと。
  - id: AG-003
    content: >
      docs/specs/integrity-rule-catalog.md の IR-047 行は ADR-0131 の link mode 語彙で記述され、
      case-schema/ を agentdev-gh-cli 配下のディレクトリとして扱い、
      triage_action は現行構成（link mode、unlink/relink）に整合していること。
  - id: AG-004
    content: >
      docs/DOC-MAP.md の REQ-0141 coverage 列は link mode、agentdev-gh-cli 差し替え、
      unlink/relink の語彙で記述され、generate-and-place 由来の旧語彙
      （ローカル版生成時ソース領域、変換プロンプト、生成安全性制約）を含まないこと。
  - id: AG-005
    content: >
      docs/guides/glossary.md の src/opencode-local/ 定義は link mode 表現であり、
      case-schema/ を agentdev-gh-cli 配下のディレクトリとして記載していること。
  - id: AG-006
    content: >
      docs/guides/consumer-project-setup.md のローカル版導入記述は link mode 導入方式
      （link 設定、unlink/relink による更新）で統一され、生成時ソース領域、変換プロンプトの
      旧語彙を含まないこと。
  - id: AG-007
    content: >
      /repo/docs-check を実行した結果、RU-0002 が対象とする 4 箇所が再検出されないこと。
      併せて inspect-docs でも当該領域の現行整合性が pass であること。
  - id: AG-008
    content: >
      .opencode/skills/agentdev-case-run-execution-adapter/SKILL.md の worktree 内判定ヘルパーへの
      参照パスは明示表記 .opencode/skills/agentdev-git-worktree/references/worktree-operations.md であり、
      スキル内相対表記 references/worktree-operations.md を含まないこと。
  - id: AG-009
    content: >
      bun run .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts を実行した結果、
      ReferencePath NG が 0 件であること。
  - id: AG-010
    content: >
      docs/DOC-MAP.md の現行 REQ テーブルは REQ-0142〜0148 が過不足なく揃っており、
      REQ-0142 の行が REQ-0143〜0148 と同一書式で記載されていること。
  - id: AG-011
    content: >
      docs/specs/req-impact-map.md の Impact Matrix および低影響リストは REQ-0142〜0148 が
      過不足なく揃っており、REQ-0142〜0147 の行が REQ-0148 の追加内容を参考に
      IR 列、commands 列ともに埋められていること。

artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/skills/agentdev-gh-cli.md
    source_items: [AG-001]
    content: |
      frontmatter の status を draft から accepted へ更新する。
      updated を 2026-06-24 に更新する。
      本文が ADR-0130 の 6 決定事項、REQ-0149 の全完了条件、Wave 2 実装結果
      （ローカル版 agentdev-gh-cli、link 先差し替え）と矛盾する場合、本文も補正する。
  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: docs/specs/integrity-rule-catalog.md
    source_items: [AG-003]
    content: |
      IR-047 行の description を ADR-0131 の link mode 語彙へ書き換える。
      case-schema/ を agentdev-gh-cli 配下のディレクトリとして再記述する。
      triage_action を現行構成（link mode、unlink/relink）へ更新する。
  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target: docs/specs/req-impact-map.md
    source_items: [AG-011]
    content: |
      Impact Matrix と低影響リストへ REQ-0142〜0147 の行を追加する。
      REQ-0148 の既存行を参考に IR 列、commands 列を埋める。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_spec: docs/specs/skills/agentdev-gh-cli.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0002
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0004
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-0005
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: single
    result: {}

case_open_hints:
  epic_needed: false
```
