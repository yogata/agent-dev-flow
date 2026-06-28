---
draft_type: req_draft
topic_slug: runtime-unresolved-reference-detection
status: saved
spec_actions_consumed: true
created_at: 2026-06-28T09:30:00+09:00
source_rus:
  - RU-20260628-01
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: |
  AgentDevFlow 配布物内の導入先未解決参照（REQ/ADR ID、src/opencode/、docs/specs/、
  /repo/* 等）を検出する docs-check / integrity rule（IR-055 runtime-unresolved-reference）
  を新設する。REQ-0103-079/080/081 の既存原則を機械的検出により持続可能にし、
  full audit → baseline → delta guard → baseline 0 到達後 fail gate 化の段階導入で運用する。
  既存 SPEC「配布物整合性検査は check_integrity.ts に追加しない」の文言を、
  機械的検出と意味的診断の境界明確化のために UPDATE する。
  意味的診断（文意保持・構文健全性・責務整合）は inspect-* skills の責務であり、
  本ルールの対象外とする（3層検出構造 integrity-contracts.md 準拠）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      runtime-unresolved-reference 検出ルール（IR-055）を docs-check / integrity check
      （.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts）に追加する。
      検出対象は src/opencode/commands/agentdev/**/*.md、
      src/opencode/skills/agentdev-*/**/*.md（references/ 配下、SKILL.md 含む）。
      本ルールは REQ-0103-079/080/081 で既に要件化された
      「配布物は導入先で解決可能な参照のみを含む」原則の機械的検出であり、
      新規原則の創出ではない。
      意味的診断（文意保持・構文健全性・責務整合）は inspect-* skills の責務であり、
      本ルールの対象外とする（3層検出構造: integrity-contracts.md、REQ-0108-056 機械化原則）。

  - id: AG-002
    content: |
      検出パターンは以下とし、severity をパターンごとに分類する。
      severity の最終分類は SPEC IR-055 で定義する。
      strict（原則違反、即 NG）:
        - REQ-NNNN、REQ-NNNN-NNN、ADR-NNNN（REQ/ADR ID 固定参照）
        - src/opencode/（原本側パス参照）
        - /repo/*（repo-local command 参照）
        - repo-*（repo-local skill 参照）
      heuristic または observation（baseline 対象、warning）:
        - docs/specs/、docs/guides/（本体内部 docs 参照）
        - 本体 docs への GitHub URL
        - line number 付き内部参照（file.md#L20 等）

  - id: AG-003
    content: |
      段階導入（full audit → baseline → delta guard → baseline 0 到達後 fail gate 化）
      を採用する。既存違反が多数存在するため、full audit を即 fail gate 化せず、
      baseline 既知違反と新規違反を区別する。
      baseline 0 到達後に full audit を fail gate 化できる状態にする。
      本運用は REQ-0108-145（基準既知と新規検出の区別）、
      REQ-0108-153（3層 guard: full audit / delta guard / impact guard）の延長である。

  - id: AG-004
    content: |
      既存 SPEC docs/specs/integrity/integrity-rule-catalog.md の
      「配布物に対する決定論的検出（IR ルール）は既存カテゴリで網羅」という記述を、
      REQ-0103-079/080/081 に基づく機械検出（IR-055）を含むよう UPDATE する。
      また「配布物整合性検査（REQ-0142-006/007）は check_integrity.ts に追加しない」が
      REQ-0142-006/007 の意味的観点（文意保持・構文健全性・責務整合）に限定されることを
      文言明確化する。
      本 UPDATE は ADR-0106（repo-local docs-check）、ADR-0103/0104（実行時独立性）、
      3層検出構造（integrity-contracts.md）の枠内であり、新規 ADR は不要とする
      （oracle 助言 Step 5-4、高確信度）。

  - id: AG-005
    content: |
      check_integrity.ts に新検出関数を追加し、cli_utils.ts の
      STRICT_CHECKS / CHECK_TO_FINDING_CATEGORY / route 連携に接続する。
      report は file / line / evidence / expected / route の5フィールドを出力する。
      新規カテゴリ追加は REQ-0145-005「新規カテゴリ追加判定フロー」6ステップ
      （既存NGへの副作用評価、catalog エントリ追加、実装、test データ更新、
      vocabulary-registry 同期、categoryToCheckPattern map 更新）に従う。

  - id: AG-006
    content: |
      regression test / fixture を追加し、少なくとも strict severity のパターン
      （REQ-NNNN、ADR-NNNN、src/opencode/、/repo/*、repo-*）の検出を確認する。
      drift detection smoke test が通ることを確認する
      （REQ-0108-258、有効なテストデータが新ルールで NG とならない）。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-0108
    source_items: [AG-001, AG-003]
    content: |
      REQ-0108-NNN: docs-check は配布物（src/opencode/commands/agentdev/**/*.md、
      src/opencode/skills/agentdev-*/**/*.md、references/ 配下、SKILL.md 含む）内の
      導入先未解決参照（REQ/ADR ID、src/opencode/、docs/specs/、docs/guides/、
      /repo/*、repo-*、本体 docs URL、line number 付き内部参照）を機械的パターンマッチングで
      検出すること。検出ルールの詳細（検出パターン、severity、exemption、false_positive_risk）
      は SPEC integrity-rule-catalog.md の IR-055 および rules/IR-055-*.md に配置する。
      本検出は REQ-0103-079/080/081 に基づく機械検出であり、
      意味的診断（文意保持・構文健全性・責務整合）は inspect-* skills の責務とする。

      REQ-0108-NNN: runtime-unresolved-reference 検出ルールは段階導入
      （full audit → baseline → delta guard → baseline 0 到達後 fail gate 化）で運用すること。
      既存違反が多数存在する場合は full audit を即 fail gate 化せず、
      baseline 既知違反と新規違反を区別し（REQ-0108-145）、
      baseline 0 到達後に full audit を fail gate 化できる状態にすること。

  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/integrity/integrity-rule-catalog.md
    target_area: |
      ### ルールインデックス
      （IR-054 の次に IR-055 エントリを追加）
      ※ 併せて「docs-check バックエンド適用範囲（REQ-0145-004）」セクションの
      L202-203 文言を明確化
    source_items: [AG-001, AG-002, AG-004]
    content: |
      [ルールインデックスへの追加]
      - [IR-055: runtime-unresolved-reference（配布物内の導入先未解決参照検出）](rules/IR-055-runtime-unresolved-reference.md)

      [docs-check バックエンド適用範囲セクションの文言明確化]
      更新前:
      > **配布物整合性検査（REQ-0142-006/007）は `check_integrity.ts` に追加しない**。
      > 配布物に対する決定論的検出（IR ルール）は既存カテゴリで網羅し、
      > 意味的診断は inspect-* skills に集約する。

      更新後:
      > **配布物整合性検査（REQ-0142-006/007: 文意保持・構文健全性・責務整合などの
      > 意味的観点）は `check_integrity.ts` に追加せず、inspect-* skills に集約する**。
      > 配布物に対する決定論的検出（IR ルール）は既存カテゴリおよび
      > REQ-0103-079/080/081 に基づく機械検出（IR-055 runtime-unresolved-reference）で構成し、
      > 機械的検出層（docs-check + IR）と意味的診断層（inspect-* skills）の責務境界は
      > 3層検出構造（integrity-contracts.md）に従う。

  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-create
    target: new:runtime-unresolved-reference
    source_items: [AG-001, AG-002, AG-005]
    content: |
      ---
      rule_id: IR-055
      description: |
        配布物（src/opencode/commands/agentdev/**/*.md、
        src/opencode/skills/agentdev-*/**/*.md、references/ 配下、SKILL.md 含む）内の
        導入先未解決参照（REQ/ADR ID、src/opencode/、docs/specs/、docs/guides/、
        /repo/*、repo-*、本体 docs URL、line number 付き内部参照）を
        機械的パターンマッチングで検出する。
        REQ-0103-079/080/081 で既に要件化された「配布物は導入先で解決可能な参照のみを含む」
        原則の機械検出であり、意味的診断は対象外（3層検出構造: integrity-contracts.md）。
      severity: strict（REQ/ADR ID、src/opencode/、/repo/*、repo-*）、
      heuristic または observation（docs/specs/、docs/guides/、本体 docs URL、line number 付き参照）
      category: broken-reference
      detection_method: 正規表現パターンマッチング（walkMarkdown / collectAgentdevSkillMarkdown による走査）
      affected_artifacts:
        - src/opencode/commands/agentdev/**/*.md
        - src/opencode/skills/agentdev-*/**/*.md
        - src/opencode/skills/agentdev-*/references/**/*.md
        - src/opencode/skills/agentdev-*/SKILL.md
      related_req: [REQ-0103-079, REQ-0103-080, REQ-0103-081, REQ-0108-056]
      related_spec:
        - docs/specs/integrity/integrity-rule-catalog.md
        - docs/specs/integrity/integrity-contracts.md
      gate_level: full-audit / delta-guard / impact-guard
      false_positive_risk: |
        code block 内部、template placeholder（{xxx}）、vocabulary-registry.md 等の
        正当使用例外パスは exemption 対象とする。
        integrity-rule-catalog.md 自身のルール記述も exemption 対象とする。
      regression_test: (未実装)
      baseline_status: new
      finding_route: intake（既知違反の段階解消は RU-20260628-02 で別途処理）
      triage_action: |
        新規検出時は baseline に追加し、delta guard で新規増加を fail 対象とする。
        既存違反の段階解消は docs-check report / intake / backlog 経由で処理する。
      last_verified: (未実装)

conflict_resolutions:
  - id: CR-001
    conflict: |
      既存 SPEC docs/specs/integrity/integrity-rule-catalog.md の
      「配布物整合性検査（REQ-0142-006/007）は check_integrity.ts に追加しない。
      配布物に対する決定論的検出（IR ルール）は既存カテゴリで網羅し、
      意味的診断は inspect-* skills に集約する」
      という記述と、RU-01 の「配布物内の導入先未解決参照を check_integrity.ts に追加する」
      方針が表面的に衝突した。
    resolution: |
      oracle 相談（Step 5-4、高確信度）により以下を確定:
      (A) 既存 SPEC の禁止は REQ-0142-006/007 の意味的観点
      （文意保持・構文健全性・責務整合）に限定される。
      REQ-0142-006「だけでなく」は機械的検出を否定せず拡張を求める表現。
      RU-01 の機械的検出（正規表現による存在検出）は禁止対象外。
      根拠: 3層検出構造（integrity-contracts.md）が責務境界を既定義、
      REQ-0108-056 機械化原則に合致、REQ-0103-079/080/081 の既存原則の機械検出化。
      新規 ADR 不要、既存 SPEC UPDATE（ACT-SPEC-001）で対応する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-20260628-01
    target_req: REQ-0108
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-002
    source_ru: RU-20260628-01
    target_spec: docs/specs/integrity/integrity-rule-catalog.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}

  - ou_id: OU-003
    source_ru: RU-20260628-01
    target_spec: new:runtime-unresolved-reference
    operation: spec-create
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      check_integrity.ts に runtime-unresolved-reference 検出関数が実装されていることを
      関数存在確認で検証する。catalog（integrity-rule-catalog.md）に IR-055 エントリが
      baseline_status: new で15フィールド以上で追加されていることを確認する。
    pass_criteria: |
      検出関数が存在し、catalog に IR-055 エントリが15フィールド以上で追加されている。
      検出対象が src/opencode/commands/agentdev/**/*.md、
      src/opencode/skills/agentdev-*/**/*.md（references/ 配下、SKILL.md 含む）を含む。
    on_failure: |
      fix-and-reverify。実装不良の場合、検出関数または catalog エントリを修正して再検証する。

  - id: TS-002
    target_item: AG-002
    verification: |
      各検出パターン（REQ-NNNN、REQ-NNNN-NNN、ADR-NNNN、src/opencode/、docs/specs/、
      docs/guides/、/repo/*、repo-*、本体 docs URL、line number 付き参照）を含む
      fixture を用意し、検出されることを回帰テストで検証する。
      severity 分類がパターンごとに正しいことを確認する。
    pass_criteria: |
      全パターンが検出され、severity が SPEC IR-055 の定義と一致する。
      file / line / evidence / expected が report される。
    on_failure: |
      fix-and-reverify。検出漏れまたは severity 誤分類の場合、
      検出パターンまたは severity 定義を修正して再検証する。

  - id: TS-003
    target_item: AG-003
    verification: |
      full audit / baseline / delta guard の各層で runtime-unresolved-reference が
      実行されることを検証する。baseline 既知違反と新規違反が区別されることを確認する。
    pass_criteria: |
      3層 guard（REQ-0108-153）でルールが実行され、baseline 既知と新規検出が
      REQ-0108-145 に基づき区別される。delta guard で新規増加が fail 対象となる。
    on_failure: |
      fix-and-reverify。段階導入の実装不良の場合、baseline または delta guard の
      実装を修正して再検証する。

  - id: TS-004
    target_item: AG-004
    verification: |
      docs/specs/integrity/integrity-rule-catalog.md の
      「配布物に対する決定論的検出（IR ルール）は既存カテゴリで網羅」が
      REQ-0103-079/080/081 機械検出（IR-055）を含むよう UPDATE されていることを確認する。
      「配布物整合性検査（REQ-0142-006/007）は check_integrity.ts に追加しない」が
      意味的観点に限定されることが文言明確化されていることを確認する。
    pass_criteria: |
      両文言の UPDATE が実施され、機械的検出と意味的診断の境界が明確化されている。
      既存 SPEC の他の記述と矛盾しない。
    on_failure: |
      fix-and-reverify。文言明確化が不十分な場合、UPDATE 内容を修正して再検証する。

  - id: TS-005
    target_item: AG-005
    verification: |
      STRICT_CHECKS / CHECK_TO_FINDING_CATEGORY / route 連携に新ルールが接続されていることを
      検証する。report に file / line / evidence / expected / route の5フィールドが
      出力されることを確認する。
    pass_criteria: |
      新ルールの finding が正しい category（broken-reference または workflow-gap）に
      分類され、route が決定される。report に全フィールドが出力される。
    on_failure: |
      fix-and-reverify。連携実装不良の場合、cli_utils.ts の接続を修正して再検証する。

  - id: TS-006
    target_item: AG-006
    verification: |
      regression test / fixture が追加され、strict severity のパターン
      （REQ-NNNN、ADR-NNNN、src/opencode/、/repo/*、repo-*）の検出が確認される。
      drift detection smoke test が通る。
    pass_criteria: |
      全 strict パターンの検出が確認され、有効なテストデータが新ルールで NG とならない
      （REQ-0108-258）。
    on_failure: |
      fix-and-reverify。テストデータまたは検出ロジックを修正して再検証する。

  - id: TS-007
    target_item: AG-001
    verification: |
      check_integrity.ts の既存検出関数を精査し、対象9パターン
      （REQ-NNNN、REQ-NNNN-NNN、ADR-NNNN、src/opencode/、docs/specs/、docs/guides/、
      /repo/*、repo-*、本体 docs URL、line number 付き参照）が
      既存 IR-001〜054 で検出されるか確認する。
      これは oracle 相談（Step 5-4）で指摘されたブロッカー事項の検証である。
    pass_criteria: |
      対象パターンが既存 IR で検出されないことを確認する。
      既存 IR で検出されるパターンがある場合、当該パターンを RU-01 の対象から除外する。
    on_failure: |
      record-in-findings。既存 IR で網羅されているパターンは RU-01 のスコープ外として
      Findings に out-of-scope として記録する。RU-01 全体が不要となる場合は
      case-close で記録し、要件を閉じる。

case_open_hints:
  epic_needed: false
  decomposition:
  wave_hints: []
```

# summary

AgentDevFlow 配布物内の導入先未解決参照を検出する docs-check / integrity rule（IR-055 runtime-unresolved-reference）を新設する要件。REQ-0103-079/080/081 の既存原則を機械的検出により持続可能にし、full audit → baseline → delta guard → baseline 0 到達後 fail gate 化の段階導入で運用する。

oracle 相談（Step 5-4）により、既存 SPEC「配布物整合性検査は check_integrity.ts に追加しない」と RU-01 の方針の衝突は (A) 解釈（機械的検出は禁止対象外）で解消した。REQ-0142-006「だけでなく」は機械的検出を否定せず拡張を求める表現であり、3層検出構造（integrity-contracts.md）が責務境界を既定義、REQ-0108-056 機械化原則に合致する。新規 ADR 不要、既存 SPEC UPDATE（ACT-SPEC-001）で対応する。

RU-02（既存違反の段階解消）は別ドラフトとして順次処理する。本ドラフトは検出ルールの新設のみを扱い、既存違反の修正は対象外。
