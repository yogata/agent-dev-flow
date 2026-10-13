---
draft_type: req_draft
topic_slug: local-test-asset-import-fix
status: draft
created_at: 2026-10-13T12:55:00Z
source_rus:
  - RU-0205
---

# draft-data

```yaml
work_type: bugfix

scale: standard

summary: src/common/tools/agentdev-gh/local/tests/existing-asset-compat.test.ts L17 の type-only import が存在しない ../../../runner.ts を参照し、local package の typecheck（tsc --noEmit）が常時 1 エラー（TS2307）となる事象を、import パスの ../../runner.ts（src/common/tools/agentdev-gh/runner.ts、実在を実測済み）への 1 行修正で解消する。tsconfig 二重管理の統合と typecheck の品質ゲート組込みは対象外（RU-0206 で別 draft）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      src/common/tools/agentdev-gh/local/tests/existing-asset-compat.test.ts L17 の import パスを ../../../runner.ts から ../../runner.ts へ修正する。対象は type-only import（import type）1 行であり、テストの検証内容は変更しない。修正先 src/common/tools/agentdev-gh/runner.ts の実在を実測済み。
  - id: AG-002
    content: |
      local package の typecheck（bun run typecheck = tsc --noEmit、cwd: src/common/tools/agentdev-gh/local）が 0 エラーで完了する。本 RU のスコープは L17 の import パス 1 行修正に限定し、tsconfig 二重管理の統合・参照共有、typecheck の品質ゲート組込みは含めない（RU-0206）。

conflict_resolutions: []

artifact_actions: []
# REQ/Design/Decision 保存操作なし。REQ 操作なし時は artifact: req エントリを生成しない（REQ-004-033）

operation_units: []

test_strategy:
  - id: TS-001
    target_item: AG-002
    verification: |
      bun run typecheck を cwd: src/common/tools/agentdev-gh/local で実行する（package.json の typecheck script = tsc --noEmit を実測済み）。
    pass_criteria: |
      エラー 0 件で完了すること。
    on_failure: |
      fix-and-reverify。import パスを修正して再検証する。
  - id: TS-002
    target_item: AG-001
    verification: |
      検索系検証。rg でパターン \.\./\.\./\.\./runner を対象 src/common/tools/agentdev-gh/local/tests/ から検索し、rg で \.\./\.\./runner\.ts の参照が existing-asset-compat.test.ts に存在することを確認する。網羅範囲と修正対象列挙の一致: 修正対象は同ファイル L17 のみであり、検索範囲（local/tests/ 配下）は修正対象ファイルを含む。
    pass_criteria: |
      誤パス（../../../runner）の参照が 0 件であること。修正後の参照（../../runner.ts）が同ファイルに 1 件存在すること。
    on_failure: |
      fix-and-reverify。import パスを修正して再検証する。
  - id: TS-003
    target_item: AG-001
    verification: |
      bun test を cwd: src/common/tools/agentdev-gh/local で実行し、type-only import の修正が実行時挙動へ影響しないことを回帰確認する。
    pass_criteria: |
      fail 0 件であること（修正前も bun test は正当に成立していた状態を維持する）。
    on_failure: |
      fix-and-reverify。import の type-only 性と実体参照を確認して修正し再検証する。

realization_actions:
  - id: RA-001
    concern: local テスト資産の誤 import 1 行修正
    responsibility: local ツール package（src/common/tools/agentdev-gh/local/）のテスト資産。同種修正の実績 commit 19cfa730 を参照。
    ownership_hints:
      - src/common/tools/agentdev-gh/local/tests/existing-asset-compat.test.ts L17（修正対象）
      - src/common/tools/agentdev-gh/runner.ts（正しい参照先）
    intent: local package の typecheck を 0 エラーに戻し、pre-existing 破損を解消する。
    verification_refs: [TS-001, TS-002, TS-003]
    source_items: [AG-001, AG-002]

decision_judgments:
  - target: new:local-test-asset-import-fix
    result: 不要
    applicable_criteria: Decision を作成してはならない条件（既存の設計に基づいた不具合修正）、作業手段 Decision 拒否ゲート
    grounds: |
      import パス 1 行の誤り修正であり、アーキテクチャ上の重要判断・長期的影響・逆転困難性のいずれもない。tsconfig 二重管理の統合は RU-0206 として分離済みであり、本 draft には技術方針の決定を含まない。既存 Decision との重複確認: Decision 候補なしのため確認対象なし。

review_dispositions:
  - id: RD-001
    source_ru: RU-0205
    source_item: Source Summary-スコープ限定（tsconfig 二重管理の統合は別扱い）
    disposition: covered
    reason_code: accepted
    reason: |
      accepted finding 注記とバッチ分割方針どおり、主スコープを import パス 1 行修正に限定した（AG-002）。RU-0205（1: N 分割の主側）の取り込み範囲に一致する。
    evidence:
      path: .agentdev/backlog/req-units/RU-0205.md
      section: Source Summary・統合理由
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0205
    source_item: tsconfig 二重管理の統合・typecheck 品質ゲート組込み
    disposition: rejected
    reason_code: out_of_scope
    reason: |
      RU-0205 は 1: N 分割の主側であり、当該項目は RU-0206 として分離済み（別バッチ別 draft）。本 draft の対象外とする。
    evidence:
      path: null
      section: null
      checked_at_commit: null
    related_removed_items:
      - RU-0206 対応範囲（tsconfig 二重管理統合、typecheck gate 組込み）

assembly_evidence: []

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

bugfix・standard。artifact_actions なし（REQ・Decision・Design 保存操作なし、Issue 本文で要件管理する direct_case 経路）。operation_units を出力しない（REQ/Design 保存操作を伴わないため。単一 Issue bugfix は case_open_hints.epic_needed: false）。STEP-8 adversarial-review の所見: typecheck 実行手段の実在（local package.json の typecheck script）を実測して確定、スコープ限定（RU-0206 分離）の再確認を受理。未解決のユーザー判断事項なし。
