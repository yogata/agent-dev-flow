---
draft_type: req_draft
topic_slug: engine-tree-test-literal-fix
status: draft
created_at: 2026-10-13T12:55:00Z
source_rus:
  - RU-0204
---

# draft-data

```yaml
work_type: bugfix

scale: standard

summary: ENGINE_TREE 検査（workflow_body_contract.test.ts「エンジン配布ファイルに宣言行以外の具体要件行IDが含まれない」）が、共有エンジン配下テスト資産 definition-traceability-gate.test.ts 内の fixture 用 REQ ID リテラル（L58 の REQ-110-001、L107 の REQ-104-001）を誤捕捉し bun test 全体が常時 1 fail となる事象を、検査契約を維持したままテスト資産を producer 側非配布領域へ移動することで解消する。移動後の bun test 全体 fail 0 件を完了条件とする。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      ENGINE_TREE 検査（scripts/self/case-intake-cross-inspection/workflow_body_contract.test.ts の「エンジン配布ファイルに宣言行以外の具体要件行IDが含まれない」テスト、L209〜220）の検査対象定義と除外規則は変更しない。配布エンジン配下（src/common/skills/agentdev-workflow-case-open/scripts/）の ADF-COVERS 宣言行以外から具体要件行 ID（REQ-NNN-MMM 形式）を検出する既存契約を維持する。
  - id: AG-002
    content: |
      テスト資産 src/common/skills/agentdev-workflow-case-open/scripts/tests/definition-traceability-gate.test.ts を producer 側非配布領域 scripts/self/case-intake-cross-inspection/definition-traceability-gate.test.ts へ移動する。移動に合わせて lib の import を実配置相対パス（../../../src/common/skills/agentdev-workflow-case-open/scripts/lib/definition-traceability-gate.ts）へ修正する。テストの検証内容・fixture は変更しない。配置先は同一エンジンの回帰テスト cross_dependency_inspection.test.ts と同一ディレクトリとし、同一の配置契約・import 形式に従う。
  - id: AG-003
    content: |
      移動後、repo root を cwd とする bun test 実行形態（REQ-060）で bun test 全体の fail が 0 件となる。ENGINE_TREE 検査を含む workflow_body_contract.test.ts の全テストが pass する。

conflict_resolutions:
  - id: CR-001
    conflict: 方針選択（検査側の除外規則追加〔テストコード内リテラルを宣言行扱いにする〕とフィクスチャ分離〔リテラルを検査対象外の場所へ移す〕のいずれによる解消か）
    resolution: |
      フィクスチャ分離を採用する。根拠は3点。 (1) case-open scripts の README が「ユニットテスト（実 REQ 行ID を含む fixture を必要とするため producer 側の非配布領域へ配置）は producer 側リポジトリの検証スイートが担う」を配置契約として明記しており、現行の scripts/tests/ 配置が同契約からの逸脱である。 (2) 同一エンジン配下の回帰テスト cross_dependency_inspection.test.ts が同一の理由（実 REQ 行 ID を含む fixture を扱う）で scripts/self/case-intake-cross-inspection/ に配置済みであり、先例と一致する。 (3) 除外規則の追加は配布ツリー内への fixture 用 REQ ID リテラル残置（配布物具体参照排除 RA-003・TS-004 の趣旨と不整合）を恒久化し、ENGINE_TREE 検査のガードを弱める。移動は検査器を改変せず、ガード強度を維持する。

artifact_actions: []
# REQ/Design/Decision 保存操作なし。REQ 操作なし時は artifact: req エントリを生成しない（REQ-004-033）

operation_units: []

test_strategy:
  - id: TS-001
    target_item: AG-002
    verification: |
      repo root を cwd として bun test ./scripts/self/case-intake-cross-inspection/ を実行する。加えて移動元 scripts/tests/definition-traceability-gate.test.ts が存在しないことを確認する。
    pass_criteria: |
      新配置の definition-traceability-gate.test.ts が実行され全テスト pass であること。移動元に当該ファイルが残存しないこと。
    on_failure: |
      fix-and-reverify。import パスまたは配置を修正して再検証する。検査器（workflow_body_contract.test.ts）は修正しない。
  - id: TS-002
    target_item: AG-003
    verification: |
      repo root を cwd として bun test を全体実行する（REQ-060 の実行形態）。
    pass_criteria: |
      fail 0 件であること（ENGINE_TREE 検査を含む全テスト pass）。
    on_failure: |
      fix-and-reverify。本 RU 対象の fail は修正して再検証する。本 RU 非起因の新規 fail が検出された場合は、その起因を切り分けて case-run の障害対応フローへ分離し、本件の緑化判定と混同しない。
  - id: TS-003
    target_item: AG-002
    verification: |
      検索系検証。rg で文字列 scripts/tests/definition-traceability-gate をリポジトリ全体（.ts、.md、.json）から検索する。網羅範囲と修正対象列挙の一致: 修正対象は移動ファイル 1 件のみであり、検索は旧パス参照の残存検出を目的とするため範囲はリポジトリ全体、新パス参照は許容する。
    pass_criteria: |
      旧パス（scripts/tests/definition-traceability-gate）への参照が 0 件であること。
    on_failure: |
      fix-and-reverify。残存参照を新パスへ修正して再検証する。

realization_actions:
  - id: RA-001
    concern: テスト資産の producer 側非配布領域への移動と import 修正
    responsibility: 配布エンジン（case-open scripts）のテスト資産配置契約。scripts/README.md の配置契約（fixture 用実 REQ 行 ID を含む unit test は producer 側非配布領域へ配置）に従い、移動先は scripts/self/case-intake-cross-inspection/ 配下とする。
    ownership_hints:
      - src/common/skills/agentdev-workflow-case-open/scripts/tests/definition-traceability-gate.test.ts（移動元）
      - scripts/self/case-intake-cross-inspection/cross_dependency_inspection.test.ts（配置先ディレクトリの先例・import 形式の参照）
    intent: ENGINE_TREE 検査の fixture 用 REQ ID リテラル誤捕捉を解消し、検査契約を維持したまま bun test 全体を緑化する。
    verification_refs: [TS-001, TS-002, TS-003]
    source_items: [AG-002, AG-003]

decision_judgments:
  - target: new:engine-tree-test-literal-fix
    result: 不要
    applicable_criteria: Decision を作成してはならない条件（仕様変更のみ・既存の設計に基づく不具合修正）、作業手段 Decision 拒否ゲート（検査器の改変か資産移動かの方針選択は作業手段の選択）
    grounds: |
      方針選択（CR-001）は既存の配置契約と先例への適合判断であり、将来の構造・責務境界・運用原則を左右する新しい技術的決定を含まない。Decision 禁止ゲート該当により REQ/Design 更新候補としても整理対象なし（REQ 操作・Design 操作なしの bugfix）。既存 Decision との重複確認: Decision 候補なしのため確認対象なし。Decision要否確認ゲートの architecture-advisory 委譲は Decision 候補・衝突候補・責務境界変更を含まないため適用条件不成立。

review_dispositions:
  - id: RD-001
    source_ru: RU-0204
    source_item: 要件化の方向-方針選択（除外規則の追加かフィクスチャ分離か）
    disposition: covered
    reason_code: resolved_by_evidence
    reason: |
      両案の影響範囲（検査器の改変 vs テスト資産の移動）を配置契約・先例・ガード強度の3点から調査し、フィクスチャ分離へ確定した（CR-001）。証拠は case-open scripts README の配置契約記述と cross_dependency_inspection.test.ts の先例配置。
    evidence:
      path: src/common/skills/agentdev-workflow-case-open/scripts/README.md
      section: 構成・ユニットテスト配置（producer 側非配布領域）
      checked_at_commit: null
    related_removed_items:
      - 検査側除外規則の追加案（CR-001 で棄却）
  - id: RD-002
    source_ru: RU-0204
    source_item: 要件化の方向-bun test 全体緑化を完了条件に含める
    disposition: covered
    reason_code: accepted
    reason: |
      AG-003・TS-002 として受け入れた。RU-0204 の証拠（1731 pass / 1 fail、PR #3667 本文記載）に基づき対象 fail は本件 1 件である。
    evidence:
      path: .agentdev/backlog/req-units/RU-0204.md
      section: Sources
      checked_at_commit: null
    related_removed_items: []

assembly_evidence: []

case_open_hints:
  epic_needed: false
  wave_hints: []
```

# summary

bugfix・standard。artifact_actions なし（REQ・Decision・Design 保存操作なし、Issue 本文で要件管理する direct_case 経路）。operation_units を出力しない（REQ/Design 保存操作を伴わないため。単一 Issue bugfix は case_open_hints.epic_needed: false）。STEP-8 adversarial-review の所見: fixture 用 REQ ID の scripts/self 配置が他の corpus 走査（宣言検出系 check、トレーサビリティ check）へ与える影響を反証した結果、いずれも非宣言リテラルを検査対象としないことを確認して棄却、bun test 全体緑化条件の非起因 fail 区別を on_failure へ追記して受理。未解決のユーザー判断事項なし。
