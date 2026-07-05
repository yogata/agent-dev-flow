---
draft_type: req_draft
topic_slug: commit-autoclose-avoidance-guideline
status: saved
created_at: 2026-07-05T12:00:00+09:00
saved_at: 2026-07-05T13:57:00+09:00
source_rus:
  - RU-0025
agentdev_handoff: true
---

# draft-data

```yaml
work_type: docs_chore

scale: standard

summary: |
  agentdev コミットメッセージ規約の慣習「(case-close #N)」等の括弧内コマンド名+issue番号表記で、GitHub が "close" を auto-close キーワード（close/closes/closed/fix/fixes/fixed/resolve/resolves/resolved）の部分文字列として認識し、意図せず Issue がクローズされる事象が発生（commit ecfd327a、Epic #1403 が残 Wave #1406/#1407 を残したまま自動クローズ）。本件は conventional-commits skill への auto-close 回避ガイドライン追加と、case-close Step 11 の留意点明記で対応する。既存の意図的クローズ表記（"fixes #123" 等）の運用は維持する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      agentdev-conventional-commits skill に GitHub auto-close 回避ガイドラインを追加する。対象リスクは「auto-close キーワードを含む複合語（case-close 等）と #N issue 番号の近接併存」。回避策として以下を明記する:
      - コマンド名と issue 番号を分離し # 記号を避ける（例: "case-close for Epic 1403"）
      - 括弧内のコマンド名+issue番号表記では複合語内の auto-close キーワード有無を確認する
      ガイドラインは「複合語内の部分文字列認識リスク」と「# 省略による回避策」を明記すること。

  - id: AG-002
    content: |
      case-close command（src/opencode/commands/agentdev/case-close.md）の commit message を生成するステップ（Step 11 等）に、auto-close 回避の留意点を明記する。留意点は AG-001 のガイドラインを参照し、case-close コマンド名自体が "close" を含む複合語であるため特に注意を促す。

  - id: AG-003
    content: |
      既存の意図的クローズ表記（"fixes #123" 等）の運用を維持し、破壊しない。auto-close 回避は「auto-close キーワードを含む複合語と #N の近接併存」のみを対象とし、通常の意図的クローズ表記は対象外とする。pre-commit hook / commit lint による機械検出は将来拡張候補とし、本件の必須要件とはしない（規約追記を優先）。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-0131.md
    source_items: [AG-002]
    content: |
      REQ-0131（case-close）への要件追加候補。case-close command が生成する commit message は、GitHub auto-close キーワード（close/closes/closed/fix/fixes/fixed/resolve/resolves/resolved）を含む複合語（case-close 等）と #N issue 番号の近接併存を回避すること。
      ※本要件は conventional-commits skill ガイドライン（AG-001）と重複する側面があるため、REQ-0131 への追加必須か否かは case-open で判断する。skill ガイドライン単独で十分な場合は REQ 更新をスキップ可能。

  - id: ACT-SKILL-001
    artifact: skill
    operation: update
    target: src/opencode/skills/agentdev-conventional-commits/SKILL.md
    source_items: [AG-001]
    content: |
      agentdev-conventional-commits/SKILL.md に「GitHub auto-close 回避ガイドライン」セクションを追加する。複合語内の部分文字列認識リスク、# 省略による回避策、意図的クローズ表記の維持を明記する。

  - id: ACT-CMD-001
    artifact: command
    operation: update
    target: src/opencode/commands/agentdev/case-close.md
    source_items: [AG-002]
    content: |
      case-close command の commit message 生成ステップ（Step 11 等）に auto-close 回避の留意点を追記する。

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0025
    target_req: REQ-0131
    target_skill: agentdev-conventional-commits
    target_command: case-close
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_files: []
      saved_adr_files: []
      artifact_action_results:
        - action_id: ACT-REQ-001
          artifact: req
          operation: update
          target: docs/requirements/REQ-0131.md
          status: deferred_to_case_open
          reason: |
            draft 本文（ACT-REQ-001 content, summary）が REQ-0131 への追加必須か否かの判断を case-open に明示委譲している。RU-0025 も「REQ-0131 への UPDATE または conventional-commits skill 単独のガイドライン追記で対応可能」と2択を提示。req-save は REQ-0131 を更新しない。
          case_open_input: |
            case-open は ACT-REQ-001 content（REQ-0131 への要件追加候補）を評価し、ACT-SKILL-001（conventional-commits skill ガイドライン）単独で十分か否かを判断すること。skill のみで十分な場合は REQ-0131 更新をスキップし、Issue には ACT-SKILL-001/ACT-CMD-001 のみを含めること。
        - action_id: ACT-SKILL-001
          artifact: skill
          operation: update
          target: src/opencode/skills/agentdev-conventional-commits/SKILL.md
          status: not_req_save_scope
          reason: implementation target (case-run scope)
        - action_id: ACT-CMD-001
          artifact: command
          operation: update
          target: src/opencode/commands/agentdev/case-close.md
          status: not_req_save_scope
          reason: implementation target (case-run scope)
      source_ru_mapping:
        RU-0025: OU-001

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      src/opencode/skills/agentdev-conventional-commits/SKILL.md に auto-close 回避ガイドラインセクションが存在し、複合語内の部分文字列認識リスクと # 省略による回避策が記述されていることを確認する。
    pass_criteria: |
      ガイドラインセクションが上記2点を含むこと。
    on_failure: |
      fix-and-reverify。ガイドラインを修正して再確認する。

  - id: TS-002
    target_item: AG-002
    verification: |
      src/opencode/commands/agentdev/case-close.md の commit message 生成ステップに auto-close 回避の留意点が記述されていることを確認する。
    pass_criteria: |
      留意点が記述され、agentdev-conventional-commits skill を参照していること。
    on_failure: |
      fix-and-reverify。留意点を修正して再確認する。

  - id: TS-003
    target_item: AG-003
    verification: |
      agentdev-conventional-commits/SKILL.md が意図的クローズ表記（"fixes #123" 等）の運用維持を明記していることを確認する。
    pass_criteria: |
      意図的クローズ表記が対象外である旨の記述が存在すること。
    on_failure: |
      fix-and-reverify。記述を修正して再確認する。

case_open_hints:
  epic_needed: false
  decomposition: |
    単一OU、単一PR、依存関係なし。Standard flow で完結する。conventional-commits skill ガイドライン追加が主軸、case-close command の留意点追記が従。
```

# summary

commit message の "(case-close #N)" 等の表記で GitHub が "close" を auto-close キーワードとして認識し、意図せず Issue クローズされる事象への対応。conventional-commits skill に auto-close 回避ガイドラインを追加し、case-close Step 11 に留意点を明記する。既存の意図的クローズ表記は維持する。REQ-0131 UPDATEは case-open で要否判断。
