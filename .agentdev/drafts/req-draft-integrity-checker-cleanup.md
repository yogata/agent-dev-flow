---
draft_type: req_draft
topic_slug: integrity-checker-cleanup
status: saved
created_at: 2026-06-25T00:00:00+09:00
---

# draft-data

```yaml
work_type: maintenance

scale: large

spec_actions_consumed: true

summary: |
  repo-agentdev-integrity チェックスクリプト（check_integrity.ts）から、意味ベース検査・推論系検査・重複実装・過去リネーム由来の LEGACY パターン・廃止済み bare slash コマンド検出・過渡期の normative marker 検出を削除し、docs-check を REQ-0108-056/254/261 + REQ-0146-008 が既に規定する「機械的・再現可能な整合性検査」に原則復帰させる。意味判断を要する検出は inspect-skills / inspect-docs / agentdev-doc-writing（3層検出構造）へ委譲し、catalog / vocabulary / gate-levels / SKILL.md / guides の参照更新と REQ-0108/0144/0145 の改訂を連動させる。ADR 不要（既存REQへの準拠であり新規方針導入ではない）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      REQ-0108 は docs-check が機械的・再現可能な整合性検査に徹することを既に REQ-0108-056/254/261 で規定しており、意味判断を要する検出は inspect-docs / agentdev-doc-writing が担当する。この既存原則を REQ-0108 の要件行においてより明示的に補強し、docs-check 実装（check_integrity.ts）がこれに違反して意味ベース検査を保持することを禁止する。
  - id: AG-002
    content: |
      REQ-0108-259 を改訂し、IR-044（req-spec-boundary-violation）検査における意味ベース context exemption（isNegationContext / isDelegationContext / isMetaScopeRuleContext / isBehaviorPredicateContext / IR044_STABLE_CONTRACT_PATTERN の5種）を廃止する。IR-044 は機械的パターンマッチングで判定可能な範囲（SPEC 詳細キーワードの混入検出、META 規則行 exemption）のみを検出対象とし、文脈解釈を要する免除は inspect-docs へ委譲する。
  - id: AG-003
    content: |
      REQ-0108-255/256 を改訂し、IR-045（docs 日本語表現・文意整合検査）は docs-check（repo-agentdev-integrity）の検査対象ではなく agentdev-doc-writing スキル配下であることを明確化する。これにより checkDocLanguageQuality 関数を check_integrity.ts から削除する根拠を REQ に与える。REQ-0140 適用範囲は既に IR-045 を明記しており、REQ-0140 側の改訂は不要。
  - id: AG-004
    content: |
      check_integrity.ts 内の重複実装を統合する。checkPatternResidual を checkPatternResidualDetection に、checkReqBacklogResidual を checkReqBacklogResidualDetection に、checkAbolishedSkillReference を checkAbolishedSkillReferences に、それぞれ統合し、main() 内の旧関数呼び出しを削除する。
  - id: AG-005
    content: |
      check_integrity.ts 内の意味ベース・推論系検査（D群）を削除する。削除対象は checkHistoricalNarrative（文体介入）、checkDocLanguageQuality（IR-045、agentdev-doc-writing へ移譲）、checkStrikethroughInDocs（表示判断）、checkFprTraceResidual（文脈判断）、checkBugfixDocsConsistency（REQ 間意味推論）、checkEpicStatusConsistency（語彙存在確認）、checkCrossReqVocabularyConsistency（意味対比）、checkVocabularyCompliance（実質スタブ）、checkReqSpecBoundaryViolation の意味ベース context exemption 部、checkCompletionReportsSsotReference（意味推論）である。
  - id: AG-006
    content: |
      check_integrity.ts 内の LEGACY_PATTERNS（196-299行）のうち、retired 配下でのみ実在が確認されたパターンを削除する。対象は R2（old command paths: .opencode/commands/issue/, .opencode/commands/tips/, commands/issue/, commands/tips/）、R3（old hyphenated skill names: issue-lifecycle, issue-template-manager, tips-pipeline-orchestration, issue-completion-reporting, issue-post-review-routing, issue-work-orchestration）、6j（old data path: docs/tips/）、6k（old terminology: tips プール, refactor時prune, elevate時prune）、snake_case 系（integrity_check, req_define, case_run/open/close）である。exempt path である vocabulary-registry.md, gate-levels.md は維持する。R1（old bare command names）は retired 配下でのみ実在確認済みのため削除対象とする。
  - id: AG-007
    content: |
      check_integrity.ts 内の BARE_SLASH_COMMAND_PATTERNS（2720-2739行）から廃止済みコマンドを削除する。対象は /req-restructure-review（REQ-0115-016 により /agentdev/inspect-docs へ統合済み）、/intake-review（ADR-0022 により intake-promote へ統合済み）、/backlog-save（ADR-0023 により backlog-review 内 RU 生成へ統合済み）、/learning-refine（ADR-0022 により learning-promote へ統合済み）の4種である。これらは Wave2 移行が完了しており、bare slash 検出対象に残存させる根拠がない。
  - id: AG-008
    content: |
      check_integrity.ts 内の checkLegacyNormativeMarkers（R4: `（SHALL）/（SHOULD）/（MAY）/（MUST）` 括弧形式検出）を削除する。REQ-0102-025 が「REQ 要件行における規範語（必達/推奨、任意相当）の使用は任意」と定めており、括弧形式 normative marker の機械検出には根拠がない。RFC2119 完全廃止（REQ-0122 retired）も達成済みである。
  - id: AG-009
    content: |
      vocabulary-registry.md から /repo/semantic-integrity-review（未実装コマンド、REQ-0115 適用範囲外）の記述を削除する。将来実装予定もないため対照表に残す意義がない。
  - id: AG-010
    content: |
      vocabulary-registry.md 内の REQ 範囲表記を「REQ-0101〜REQ-0122（REQ-0111 は retired）」から「REQ-0101〜REQ-0151（REQ-0111/0115/0116/0117/0118/0120/0121/0122 は retired）」に最新化する。現在 2026-06-25 時点で古い記述が残っている。
  - id: AG-011
    content: |
      docs/guides/*.md 内の REQ 範囲表記を実 REQ 最大番号（REQ-0151）に追従させる。REQ-0144-007 が「docs/guides/*.md の REQ 範囲表記は実 REQ 最大番号に追従する（REQ-0143 時点まで反映）」を要求しているが、REQ-0151 時点まで未達である。本要件は REQ-0144-007 の完了条件を「REQ-0151 時点まで反映」に拡張する。
  - id: AG-012
    content: |
      REQ-0144-005 を拡張し、check_integrity.ts の category-to-check-pattern map が削除対象カテゴリも含めて定義済み category を全て網羅することを要求する。関数削除時に map の整合性が保たれることを要件行で担保する。
  - id: AG-013
    content: |
      REQ-0145-002 を改訂し、IR-044 の委譲キーワードマッチ exemption（SPEC 詳細記述内の委譲キーワードを境界ケースとして免除）を廃止する。当該 exemption は文脈判断を要し、機械的パターンマッチの範囲を超えるため inspect-docs へ委譲する。
  - id: AG-014
    content: |
      REQ-0145-012 を整合し、IR-044 の META 規則行 exemption（REQ/SPEC 境界を定義する META 規則行を exempt）は機械的に判定可能な範囲（行構造のパターンマッチ）に限定する。意味判断を要する exemption 条件は含めない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-0108
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008]
    content: |
      REQ-0108 の要件表を以下の通り更新する。

      (1) REQ-0108-056/254/261 を補強し、docs-check 実装が意味ベース検査を保持することを明示的に禁止する（AG-001）。docs-check に実装された検査は全て機械的パターンマッチで判定可能であること、意味判断・文脈解釈・推論を要する検出は inspect-docs / inspect-skills / agentdev-doc-writing（3層検出構造）が担当することを要件行に明記する。

      (2) REQ-0108-259 を改訂する（AG-002）。IR-044（req-spec-boundary-violation）は機械的パターンマッチングで判定可能な範囲（SPEC 詳細キーワードの混入検出、META 規則行 exemption）のみを検出対象とし、文脈解釈を要する context exemption（否定文脈、委譲文脈、メタスコープルール文脈、振る舞い述語文脈、安定契約パターンの5種）は inspect-docs へ委譲する。詳細な検出シグナル、exemption 条件は SPEC（integrity-rule-catalog.md）に配置し、true positive が誤って免除されないことを回帰テストで検証すること。

      (3) REQ-0108-255/256 を改訂する（AG-003）。IR-045（docs 日本語表現・文意整合検査）は docs-check（repo-agentdev-integrity）の検査対象ではなく agentdev-doc-writing スキル配下である。docs-check は IR-045 を機械検出対象としない。識別子として正当に残る場合の区別は agentdev-doc-writing が担う。

      (4) AG-004〜008 を受けて、削除対象の check 関数（重複実装の旧関数、D群の意味ベース検査、LEGACY_PATTERNS の削除対象、廃止 bare slash 検出、R4 normative marker 検出）が docs-check の検査対象外であることを要件行で明示する。個別関数名は SPEC / script に委譲し、要件行に列挙しない。

      REQ-0108-001「checker 個別ルールと対象集合の詳細は integrity rule catalog または対応する SPEC / skill reference / script / tests に委譲すること。個別 path、rule、検出条件の追加、変更は本REQの改定を要しないこと」に従い、本改訂は docs-check の恒久的責務境界（機械化原則）の再確認と意味ベース検査禁止の明示化が主であり、個別ルールの増減は本REQの改定を要しない。
  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: REQ-0144
    source_items: [AG-010, AG-011, AG-012]
    content: |
      REQ-0144 の要件表を以下の通り更新する。

      (1) REQ-0144-007 を更新し、docs/guides/*.md の REQ 範囲表記は実 REQ 最大番号（本要件時点では REQ-0151）に追従すること。従来の「REQ-0143 時点まで反映」を最新化する（AG-011）。

      (2) REQ-0144-005 を拡張し、check_integrity.ts の category-to-check-pattern map は定義済み category を全て網羅することに加え、削除対象 category の整理時にも map の整合性が保たれることを要件に含める（AG-012）。

      (3) AG-010（vocabulary-registry.md の REQ 範囲表記最新化）は REQ-0144-007 の適用対象を vocabulary-registry.md まで拡張する形で反映する。同ファイルは .opencode/skills/repo-agentdev-integrity/references/ 配下にあるが、文書整合性の観点で docs/guides/*.md と同等の追従要件を課す。
  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: REQ-0145
    source_items: [AG-013, AG-014]
    content: |
      REQ-0145 の要件表を以下の通り更新する。

      (1) REQ-0145-002 を改訂する（AG-013）。IR-044 の委譲キーワードマッチにおける「SPEC 詳細記述内の委譲キーワードを境界ケースとして免除する」規定を廃止する。当該 exemption は文脈判断を要し、機械的パターンマッチの範囲を超えるため inspect-docs へ委譲する。これにより IR-044 検査は純粋なパターンマッチベースとなる。

      (2) REQ-0145-012 を整合する（AG-014）。IR-044 の META 規則行 exemption は機械的に判定可能な範囲（行構造のパターンマッチ、REQ-NNNN-MMM 形式 + enum/format 等の列挙パターン）に限定する。意味判断を要する exemption 条件は含めない。詳細な exemption 条件、キーワードは SPEC（integrity-rule-catalog.md）に配置し、true positive が誤って免除されないことを回帰テストで検証すること（REQ-0108-259 準拠）。
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/integrity-rule-catalog.md
    source_items: [AG-005, AG-006, AG-007, AG-008]
    content: |
      integrity-rule-catalog.md のルールエントリを更新する。対象は AG-005（D群削除）に対応する IR エントリ（IR-045 含む）、AG-006（LEGACY_PATTERNS 削除）に対応する IR エントリ、AG-007（廃止 bare slash 削除）に対応する IR エントリ、AG-008（R4 normative marker 削除）に対応する IR エントリである。

      catalog↔実装双方向同期運用手順（REQ-0145-003）に従い、削除時は baseline_status を resolved に変更した上で catalog entry を削除する。新規検出時の復活運用も維持する。AG-002 で改訂される IR-044 の exemption 条件縮小に合わせて IR-044 エントリの detection_method, false_positive_risk, triage_action を更新する。
  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: .opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md
    source_items: [AG-006, AG-007, AG-009, AG-010]
    content: |
      vocabulary-registry.md を更新する。対照表としての機能は維持する。

      (1) /repo/semantic-integrity-review（未実装コマンド）の記述を削除する（AG-009）。

      (2) REQ 範囲表記「REQ-0101〜REQ-0122（REQ-0111 は retired）」を「REQ-0101〜REQ-0151（REQ-0111/0115/0116/0117/0118/0120/0121/0122 は retired）」に最新化する（AG-010）。

      (3) AG-006, AG-007 に対応し、LEGACY_PATTERNS / BARE_SLASH_COMMAND_PATTERNS から削除された項目の検出対象としての言及を整理する。対照表（歴史参照）としては維持し、検出パターンからは除去する。
  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target: .opencode/skills/repo-agentdev-integrity/references/gate-levels.md
    source_items: [AG-005, AG-006, AG-007, AG-008]
    content: |
      gate-levels.md の finding level（strict / heuristic / observation）エントリから、AG-005/006/007/008 で削除される検査に対応するエントリを削除する。3層検出構造（機械=docs-check / 意味=inspect-skills, inspect-docs / 査読=doc-writing）の責務分担表（REQ-0146-008）を維持・補強し、削除された検査の観点が inspect-* / doc-writing に委譲されたことを明示する。
  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target: .opencode/skills/repo-agentdev-integrity/SKILL.md
    source_items: [AG-005, AG-006, AG-007, AG-008]
    content: |
      repo-agentdev-integrity/SKILL.md の検査カテゴリ表から、AG-005/006/007/008 で削除される検査カテゴリの行を削除する。検査カテゴリ表と check_integrity.ts の実装との同期（categoryToCheckPattern map）を維持する。新カテゴリ追加判定フロー（REQ-0145-005）の記述は維持する。
  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target: docs/guides/*.md
    source_items: [AG-011]
    content: |
      docs/guides/*.md 内の REQ 範囲表記を実 REQ 最大番号（REQ-0151）に追従させる（AG-011）。古い表記（REQ-0143 時点等）を含む箇所を抽出し、REQ-0151 時点に更新する。
  - id: ACT-SPEC-006
    artifact: spec
    operation: update
    target: docs/specs/commands/learning-promote.md
    source_items: [AG-007]
    content: |
      docs/specs/commands/learning-promote.md の "learning-refine への依存（G08）" 記述を削除する。learning-refine は ADR-0022 で learning-promote へ統合されて廃止済みであり、現行 SPEC で依存先として言及するのは不適切である（AG-007 の付随修正）。

conflict_resolutions:
  - id: CR-001
    conflict: 今回の docs-check 機械化原則徹底を ADR 化すべきか。
    resolution: |
      ADR 不要。機械化原則は REQ-0108-056（docs-check は機械的・再現可能な整合性検査を担当）、REQ-0108-254（docs-check が意味レビューを代替せず）、REQ-0108-261（意味判断を要する検出は inspect-docs / doc-writing が担当）、REQ-0146-008（3層検出構造の責務分担 SPEC 化）で既に規定済み。check_integrity.ts に意味ベース検査が残存していたのは実装が先行肥大化した仕様違反であり、新規方針導入ではない。REQ-0112-038（ADR化禁止: 仕様変更のみ、運用ルール）に合致する。
  - id: CR-002
    conflict: REQ-0140（文書品質ゲート）の改訂を含めるか。
    resolution: |
      REQ-0140 改訂は不要。REQ-0140 適用範囲は既に「対象: …IR-045」を明記しており、REQ-0140-002（文書種別責務、要件性、文意品質、粒度の査読）、REQ-0140-022（agentdev-doc-writing は査読スキル）により IR-045 が agentdev-doc-writing 配下であることは実質既に示されている。REQ-0108-255/256 の改訂（AG-003）で十分。
  - id: CR-003
    conflict: R4 normative marker（`（SHALL）/（SHOULD）/（MAY）/（MUST）` 括弧形式）検出を削除してよいか。
    resolution: |
      削除可。REQ-0102-025 が「REQ 要件行における規範語（必達/推奨、任意相当）の使用は任意」と定めており、括弧形式 normative marker の機械検出には根拠がない。RFC2119 完全廃止（REQ-0122 retired）も達成済みである。
  - id: CR-004
    conflict: BARE_SLASH_COMMAND_PATTERNS から廃止済みコマンド（/req-restructure-review, /intake-review, /backlog-save, /learning-refine）を削除してよいか。Wave2 移行状況は完結しているか。
    resolution: |
      削除可。Wave2 移行は完了済み。(a) /req-restructure-review は REQ-0115-016（retired）により /agentdev/inspect-docs へ統合済み、docs/guides/glossary.md, diagnostics-and-maintenance.md で「旧称」と明記。(b) /intake-review は ADR-0022 により intake-promote へ統合され廃止。(c) /learning-refine は ADR-0022 により learning-promote へ統合され廃止。(d) /backlog-save は ADR-0023 により backlog-review 内 RU 生成へ統合され廃止。REQ-0129-001（backlog-review）で「backlog-save を経由せず」と現行仕様が反映済み。ただし docs/specs/commands/learning-promote.md に "learning-refine への依存（G08）" の不適切残存があり、ACT-SPEC-006 で修正する。

operation_units:
  - ou_id: OU-001
    target_req: REQ-0108
    operation: update
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs: [REQ-0108]
      operation_mode: UPDATE
      modified_rows: [REQ-0108-056, REQ-0108-254, REQ-0108-255, REQ-0108-256, REQ-0108-259, REQ-0108-261]
      added_rows: [REQ-0108-262]
      source_artifact_action: ACT-REQ-001
      source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008]
      qg1_result: pass
      catalog_entry_status: pending_spec_save
      catalog_note: integrity-rule-catalog.md の IR-044/IR-045 entry 更新は ACT-SPEC-001（spec-save）で処理予定。req-save では記録のみ
      frontmatter_updated: updated=2026-06-25
  - ou_id: OU-002
    target_req: REQ-0144
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs: [REQ-0144]
      operation_mode: UPDATE
      modified_rows: [REQ-0144-005, REQ-0144-007]
      source_artifact_action: ACT-REQ-002
      source_items: [AG-010, AG-011, AG-012]
      qg1_result: pass
      frontmatter_updated: updated=2026-06-25
  - ou_id: OU-003
    target_req: REQ-0145
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs: [REQ-0145]
      operation_mode: UPDATE
      modified_rows: [REQ-0145-002, REQ-0145-012]
      source_artifact_action: ACT-REQ-003
      source_items: [AG-013, AG-014]
      qg1_result: pass
      frontmatter_updated: updated=2026-06-25
  - ou_id: OU-004
    target_spec: docs/specs/integrity-rule-catalog.md
    operation: spec-update
    scale: large
    depends_on: [OU-001, OU-002, OU-003]
    recommended_order: 2
    issue_policy: single
    result:
      saved_spec_docs: [docs/specs/integrity-rule-catalog.md]
      operation_mode: SPEC-UPDATE
      source_artifact_action: ACT-SPEC-001
      source_items: [AG-005, AG-006, AG-007, AG-008]
      changes:
        - IR-045 entry 削除（REQ-0145-003 catalog↔実装同期手順: baseline_status resolved → entry 削除）。tombstone note で agentdev-doc-writing への移譲を明示
        - IR-044 detection_method/false_positive_risk/triage_action 更新（AG-002/013/014 exemption 機械化）
        - IR-044 exemption 条件セクション全文書き換え（META 規則行 exemption のみ残存、文脈免除は inspect-docs 委譲）
        - NG ルール間依存関係マップ整理（checkLegacyNormativeMarkers/checkDocLanguageQuality 削除、checkReqSpecBoundaryViolation 更新）
      req_0108_262_catalog_warn_resolved: true
      qg1_result: pass
  - ou_id: OU-005
    target_spec: .opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result:
      saved_spec_docs: [.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md]
      operation_mode: SPEC-UPDATE
      source_artifact_action: ACT-SPEC-002
      source_items: [AG-006, AG-007, AG-009, AG-010]
      changes:
        - /repo/semantic-integrity-review 行削除（AG-009）
        - REQ 範囲表記 REQ-0151/43件に最新化（AG-010）
        - /agentdev/req-restructure-review 行を統合済みに更新
        - 「検出パターン縮小（REQ-0108-262）」セクション追加（AG-006/007 対照表維持・検出対象除外明示）
      qg1_result: pass
  - ou_id: OU-006
    target_spec: .opencode/skills/repo-agentdev-integrity/references/gate-levels.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result:
      saved_spec_docs: [.opencode/skills/repo-agentdev-integrity/references/gate-levels.md]
      operation_mode: SPEC-UPDATE
      source_artifact_action: ACT-SPEC-003
      source_items: [AG-005, AG-006, AG-007, AG-008]
      changes:
        - heuristic カテゴリから vocabulary-compliance/doc-language-quality 行削除（AG-005）
        - 「3層検出構造の責務分担（REQ-0146-008）」セクション追加・補強
      qg1_result: pass
  - ou_id: OU-007
    target_spec: .opencode/skills/repo-agentdev-integrity/SKILL.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result:
      saved_spec_docs: [.opencode/skills/repo-agentdev-integrity/SKILL.md]
      operation_mode: SPEC-UPDATE
      source_artifact_action: ACT-SPEC-004
      source_items: [AG-005, AG-006, AG-007, AG-008]
      changes:
        - 検査カテゴリ表から 語彙ポリシー/Cross-REQ vocab/docs 日本語表現・文意整合 の3行削除（AG-005）。categoryToCheckPattern map との整合は case-run（Wave3）で実装反映時に担保
      qg1_result: pass
  - ou_id: OU-008
    target_spec: docs/guides/*.md
    operation: spec-update
    scale: standard
    depends_on: [OU-002]
    recommended_order: 2
    issue_policy: single
    result:
      saved_spec_docs: [docs/guides/project-docs-and-specs.md]
      operation_mode: SPEC-UPDATE
      source_artifact_action: ACT-SPEC-005
      source_items: [AG-011]
      changes:
        - project-docs-and-specs.md REQ 範囲表記を REQ-0151/43件に最新化（AG-011）。他の guides ファイルに古い REQ 範囲表記は確認されず
      qg1_result: pass
  - ou_id: OU-009
    target_spec: docs/specs/commands/learning-promote.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result:
      saved_spec_docs: [docs/specs/commands/learning-promote.md]
      operation_mode: SPEC-UPDATE
      source_artifact_action: ACT-SPEC-006
      source_items: [AG-007]
      changes:
        - 「learning-refine への依存（G08）」対象外行削除（AG-007 付随修正、ADR-0022 廃止反映）
        - frontmatter updated=2026-06-25
      qg1_result: pass

test_strategy:
  - id: TS-001
    target_item: AG-004
    verification: |
      check_integrity.ts の main() 関数内で checkPatternResidual, checkReqBacklogResidual, checkAbolishedSkillReference（いずれも Detection なし旧関数）の呼び出しが削除されていることを grep で確認する。併せて checkPatternResidualDetection, checkReqBacklogResidualDetection, checkAbolishedSkillReferences（Detection 付き統合先）の呼び出しが残っていることを確認する。
    pass_criteria: |
      main() 内に旧関数呼び出し（checkPatternResidual(, checkReqBacklogResidual(, checkAbolishedSkillReference(）が 0 件。統合先関数の呼び出しが各1件以上残存。
    on_failure: |
      fix-and-reverify。旧関数の呼び出し残りは実装不良であり、削除して再検証する。
  - id: TS-002
    target_item: AG-005
    verification: |
      check_integrity.ts から D 群の各関数（checkHistoricalNarrative, checkDocLanguageQuality, checkStrikethroughInDocs, checkFprTraceResidual, checkBugfixDocsConsistency, checkEpicStatusConsistency, checkCrossReqVocabularyConsistency, checkVocabularyCompliance, checkReqSpecBoundaryViolation の意味ベース context helper 部分, checkCompletionReportsSsotReference）の定義および main() からの呼び出しが削除されていることを grep で確認する。
    pass_criteria: |
      削除対象関数の定義・呼出しがそれぞれ 0 件。
    on_failure: |
      fix-and-reverify。削除漏れは実装不良であり、削除して再検証する。
  - id: TS-003
    target_item: AG-005
    verification: |
      check_integrity.test.ts を実行し、全件 pass すること。削除対象関数に対応するテストケースも削除されていることを確認する。
    pass_criteria: |
      check_integrity.test.ts が全件 green。deleted 関数の test ケース（describe block, it block）が 0 件。
    on_failure: |
      fix-and-reverify。テスト削除漏れまたは実装削除に伴うコンパイルエラーを修正して再検証する。
  - id: TS-004
    target_item: AG-006
    verification: |
      LEGACY_PATTERNS（196-299行）から削除対象パターン（R2, R3, 6j, 6k, snake_case 系）が削除されていることを grep で確認する。併せて削除対象パターンがリポジトリ内（retired 配下、exempt path 除く）で実在しないことを確認する。
    pass_criteria: |
      check_integrity.ts 内の LEGACY_PATTERNS から削除対象パターンが 0 件。リポジトリ内（retired 配下、vocabulary-registry.md, gate-levels.md 除く）での実在も 0 件。
    on_failure: |
      record-in-findings。実在した場合は case-run 側で別途修正対象となる。本要件のスコープ外として Findings に記録する。
  - id: TS-005
    target_item: AG-007
    verification: |
      BARE_SLASH_COMMAND_PATTERNS（2720-2739行）から廃止済みコマンド（/req-restructure-review, /intake-review, /backlog-save, /learning-refine）が削除されていることを grep で確認する。
    pass_criteria: |
      BARE_SLASH_COMMAND_PATTERNS 内に廃止済みコマンド4種が 0 件。
    on_failure: |
      fix-and-reverify。削除漏れは実装不良。
  - id: TS-006
    target_item: AG-008
    verification: |
      check_integrity.ts から checkLegacyNormativeMarkers 関数の定義および main() からの呼び出しが削除されていることを grep で確認する。
    pass_criteria: |
      checkLegacyNormativeMarkers の定義・呼出が 0 件。
    on_failure: |
      fix-and-reverify。削除漏れは実装不良。
  - id: TS-007
    target_item: AG-002
    verification: |
      check_integrity.ts の checkReqSpecBoundaryViolation（IR-044）から意味ベース context exemption 関数（isNegationContext, isDelegationContext, isMetaScopeRuleContext, isBehaviorPredicateContext, IR044_STABLE_CONTRACT_PATTERN）の定義および呼び出しが削除されていることを grep で確認する。
    pass_criteria: |
      context exemption 関数の定義・呼出が 0 件。
    on_failure: |
      fix-and-reverify。意味ベース exemption 残りは実装不良。
  - id: TS-008
    target_item: AG-010
    verification: |
      vocabulary-registry.md 内の REQ 範囲表記を確認する。「REQ-0101〜REQ-0122」「REQ-0101〜REQ-0143」等の古い表記が 0 件であること。
    pass_criteria: |
      古い REQ 範囲表記が 0 件。「REQ-0101〜REQ-0151」形式に統一されていること。
    on_failure: |
      fix-and-reverify。表記漏れは文書修正不良。
  - id: TS-009
    target_item: AG-011
    verification: |
      docs/guides/*.md 全ファイルを grep し、REQ 範囲表記（REQ-0101〜REQ-NNNN 形式）が実 REQ 最大番号（REQ-0151）に一致していることを確認する。
    pass_criteria: |
      古い REQ 範囲表記（REQ-0143 以前を終端とする）が 0 件。
    on_failure: |
      fix-and-reverify。表記漏れは文書修正不良。
  - id: TS-010
    target_item: AG-012
    verification: |
      check_integrity.ts の categoryToCheckPattern map が、checkSkillCategoryGap 関数が参照する全 category を網羅していることを確認する。関数削除後に map が未更新の category を含まないこと。
    pass_criteria: |
      map の category set と SKILL.md 検査カテゴリ表の category set が完全一致する。
    on_failure: |
      fix-and-reverify。map 不整合は実装不良。
  - id: TS-011
    target_item: AG-013
    verification: |
      REQ-0145-002 の要件文が「SPEC 詳細記述内の委譲キーワードを境界ケースとして免除する」から当該 exemption を廃止する内容に改訂されていることを確認する。
    pass_criteria: |
      REQ-0145-002 に委譲キーワード境界ケース免除の記述が 0 件。
    on_failure: |
      fix-and-reverify。要件文改訂漏れ。
  - id: TS-012
    target_item: AG-all
    verification: |
      draft 保存後、agentdev-quality-gates の QG-1（Definition Integrity Gate）を適用し、REQ/SPEC 分類、ADR ゲート、チェックボックス測可能性、必須フィールド完全性、artifact_actions 構成の妥当性を検証する。
    pass_criteria: |
      QG-1 が pass。
    on_failure: |
      fix-and-reverify。QG-1 の指摘事項を解消して再検証する。

case_open_hints:
  epic_needed: true
  decomposition: |
    scale: large につき Epic 構成を推奨。技術的依存に基づく Wave 構成案:

    Wave 1（REQ 改訂、並行可能）:
    - Issue 1: REQ-0108 UPDATE（OU-001, ACT-REQ-001）。AG-001〜008 を反映。docs-check 機械化原則の徹底、IR-044/IR-045 位置づけ改訂、A/B/B'/C/D 群削除の要件化。
    - Issue 2: REQ-0144 UPDATE（OU-002, ACT-REQ-002）。AG-010〜012 を反映。REQ 範囲表記最新化、category map 網羅性拡張。
    - Issue 3: REQ-0145 UPDATE（OU-003, ACT-REQ-003）。AG-013, AG-014 を反映。IR-044 exemption 機械化。

    Wave 2（SPEC 更新、Wave 1 完了後）:
    - Issue 4: integrity-rule-catalog.md 更新（OU-004, ACT-SPEC-001）。IR エントリの baseline_status 変更・削除、IR-044 detection_method 更新。
    - Issue 5: vocabulary-registry.md 更新（OU-005, ACT-SPEC-002）。/repo/semantic-integrity-review 削除、REQ 範囲表記最新化、対照表維持。
    - Issue 6: gate-levels.md 更新（OU-006, ACT-SPEC-003）。finding level エントリ削除、3層検出構造の責務分担表補強。
    - Issue 7: repo-agentdev-integrity/SKILL.md 更新（OU-007, ACT-SPEC-004）。検査カテゴリ表更新。
    - Issue 8: docs/guides/*.md 更新（OU-008, ACT-SPEC-005）。REQ 範囲表記最新化。
    - Issue 9: docs/specs/commands/learning-promote.md 更新（OU-009, ACT-SPEC-006）。learning-refine 依存記述削除。

    Wave 3（実装、Wave 2 完了後、case-run 責務）:
    - Issue 10: check_integrity.ts / cli_utils.ts / check_integrity.test.ts 編集。AG-004〜008 の実装反映。関数削除、main() 整理、LEGACY_PATTERNS / BARE_SLASH_COMMAND_PATTERNS 縮小、categoryToCheckPattern map 更新、STRICT_CHECKS リスト更新、CHECK_TO_FINDING_CATEGORY map 更新、テスト削除・fixture 更新。
  wave_hints:
    - wave: 1
      issues: [Issue 1, Issue 2, Issue 3]
      rationale: REQ 改訂は並列可能。REQ-0108/0144/0145 は独立関心。
    - wave: 2
      issues: [Issue 4, Issue 5, Issue 6, Issue 7, Issue 8, Issue 9]
      rationale: SPEC 更新は REQ 改訂完了後に実施。catalog/vocabulary/gate/SKILL は関心分離しているが、REQ-0108 改訂内容に依存するため Wave 1 後。
      depends_on: [wave 1]
    - wave: 3
      issues: [Issue 10]
      rationale: 実装作業（check_integrity.ts 編集）は SPEC 更新で catalog/map の整理が完了した後に実施する。実装の正しさは SPEC 定義に依存する。
      depends_on: [wave 2]
```

# summary

本要件は、repo-agentdev-integrity チェックスクリプト（check_integrity.ts）から意味ベース検査・推論系検査・重複実装・過去リネーム由来の LEGACY パターン・廃止済み bare slash コマンド検出・過渡期の normative marker 検出を削除し、docs-check を REQ-0108-056/254/261 + REQ-0146-008 が既に規定する「機械的・再現可能な整合性検査」の原則に復帰させる。

意味判断を要する検出は 3 層検出構造（機械=docs-check / 意味=inspect-skills, inspect-docs / 査読=agentdev-doc-writing）の後続2層へ委譲する。ADR 不要（既存REQへの準拠であり新規方針導入ではない、REQ-0112-038 ADR化禁止に合致）。

scale: large。Epic 構成（Wave 1: REQ 改訂3件、Wave 2: SPEC 更新6件、Wave 3: 実装1件）を case_open_hints に提示する。実装作業（check_integrity.ts / cli_utils.ts / test.ts 編集）は case-run 責務であり、本要件の operation_units には含めない。
