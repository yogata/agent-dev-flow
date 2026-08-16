---
id: BASELINE-IR-AUDIT-PHASE0
title: "REQ-028 IR portfolio audit — Phase 0 現状 baseline（変更前スナップショット）"
status: accepted
created: 2026-08-11
baseline_for: REQ-028 / DEC-013
source_issue: "#2077 (OU-001 Phase 0)"
parent_epic: "#2076 (REQ-028 IR portfolio audit)"
captured_at_head: 4e6937c73dfbe5a47d6fc04f9245103ac312dd15
captured_at_branch: feature/issue-2077
---

# REQ-028 IR portfolio audit — Phase 0 現状 baseline

> **位置づけ**: 本ファイルは REQ-028（IR 体系の実効性監査と存在条件厳格化）および DEC-013（IR 登録モデル簡素化）の監査を実施する前の現状スナップショットである。Phase 1〜6（OU-002..007）での比較基準として固定し、Phase 0（OU-001）では現状記録のみを行い、IR/detector/test/baseline/gate/docs-check の実体を変更しない。

## 取得メタデータ

| 項目 | 値 |
|---|---|
| 取得日 | 2026-08-11 (JST) |
| 対象 HEAD | `4e6937c7` (4e6937c73dfbe5a47d6fc04f9245103ac312dd15) |
| ブランチ | `feature/issue-2077` (worktree: `.worktrees/2077-feature`) |
| ベース | `origin/main` @ 4e6937c7 (case-open 完了時点) |
| 根拠要件 | REQ-028-001..013、REQ-010-053..058（RETIRE/UPDATE 対象）、DEC-013 (accepted) |
| 取得ツール | `check_integrity.ts --json`, `bun` 1.3.10 |

## 1. IR インベントリ（file-backed vs catalog-only）

IR-001..061 の ID 空間の現状:

| 区分 | 件数 | 対象 |
|---|---|---|
| file-backed IR | 59 | docs/specs/integrity/rules/IR-*.md |
| 欠番（ファイル無し） | 2 | IR-017, IR-045 |

**欠番の内訳**:

- IR-017: 採番ギャップ（採番ポリシー上の欠番、物理ファイルなし）
- IR-045: catalog-only（削除済み tombstone、カタログ上のみ存在、物理ファイルなし）。本件は agentdev-doc-writing スキルへ移管済み

**file-backed tombstone（IR-011 型）**:

- IR-011（Mapping table 全件記録）: `lifecycle_state: superseded`, `enforcement_mode: none`, `baseline_status: superseded`。DEC-013 AG-008 で物理削除候補。

## 2. IR 現状属性一覧（全 59件）

各 IR ファイル本文の Field/Value 表から抽出した現状属性。lifecycle_state/enforcement_mode は IR-011 以外は未設定（= active 扱い）。

| IR | title | severity | baseline_status | gate_level | lifecycle_state | enforcement_mode | category | regression_test | related_req |
|---|---|---|---|---|---|---|---|---|---|
| IR-001 | 現行 REQ frontmatter id ↔ ファイル名 | strict | resolved | full-audit | - | - | document-drift | commands_structure.test.ts | [REQ-010-001, REQ-001] |
| IR-002 | 現行 REQ 必須 frontmatter fields | strict | resolved | full-audit | - | - | document-drift | commands_structure.test.ts | [REQ-010-001] |
| IR-003 | Active/廃止 REQ ID 重複 | strict | resolved | full-audit | - | - | canonical-conflict | commands_structure.test.ts | [REQ-010-082] |
| IR-004 | REQ index ↔ 現行 REQ 一致 | strict | resolved | full-audit | - | - | document-drift | commands_structure.test.ts | [REQ-010-003] |
| IR-005 | Decision ↔ REQ 相互参照存在 | strict | resolved | full-audit | - | - | broken-reference | check_integrity.test.ts | [REQ-010-005] |
| IR-006 | Command frontmatter 許可フィールド | strict | resolved | full-audit, delta-guard | - | - | document-drift | command_fixtures.test.ts | [REQ-002-015, REQ-010-046, 095-099, 108, 124, 129] |
| IR-007 | Skill frontmatter name ↔ dir | strict | resolved | full-audit | - | - | document-drift | lint_skills.test.ts | [REQ-010-092] |
| IR-008 | Skill references/ 存在 | strict | resolved | full-audit, delta-guard | - | - | broken-reference | check_reference_paths.test.ts | [REQ-010-110, 115-120, REQ-010-020] |
| IR-009 | 旧 namespace 残存 | strict | resolved | full-audit | - | - | obsolete-structure | commands_e2e.test.ts | [REQ-010-016] |
| IR-010 | ADR status 正規化 | strict | resolved | full-audit | - | - | obsolete-structure | check_integrity.test.ts | [REQ-010-121] |
| IR-011 | Mapping table 全件記録（廃止済み） | - | superseded | - | superseded | none | document-drift | - | [v2:REQ-0108-083〜088] |
| IR-012 | Template 必須セクション | strict | resolved | full-audit, delta-guard | - | - | document-drift | check_templates.test.ts | [REQ-010 (workflow template 構造)] |
| IR-013 | 完了報告種別実在 | strict | resolved | full-audit, delta-guard | - | - | broken-reference | commands_structure.test.ts | [REQ-010-089-091, REQ-010-020] |
| IR-014 | reference/ 残存検出 | strict | resolved | full-audit | - | - | obsolete-structure | lint_skills.test.ts | [REQ-002-013, 039, REQ-010-039, 040, 094] |
| IR-015 | 廃止 REQ 現行参照検出 | heuristic | resolved | full-audit | - | - | canonical-conflict | commands_e2e.test.ts | [REQ-010-070-074, 136] |
| IR-016 | Source/projection 整合性 | strict | known | full-audit, delta-guard | - | - | canonical-conflict | (sync script で検証) | [REQ-002-048-052, REQ-010-143-144] |
| IR-018 | REQ 範囲表記鮮度 | heuristic | resolved | full-audit | - | - | document-drift | (手動確認) | [REQ-010-140] |
| IR-019 | Guide 要件定義、契約記述検出 | heuristic | resolved | full-audit | - | - | canonical-conflict | (手動確認) | [REQ-010-138, REQ-001] |
| IR-020 | 基準既知（baseline-known）と新規 finding の区別 | heuristic | resolved | full-audit, impact-guard | - | - | integrity-rule-gap | (手動確認) | [REQ-010-145, 148] |
| IR-021 | 廃止済み skill 参照検出 | strict | resolved | full-audit | - | - | obsolete-structure | commands_e2e.test.ts | [REQ-010-126-128] |
| IR-022 | REQ 内部整合性 | strict | resolved | full-audit | - | - | canonical-conflict | (手動確認) | [REQ-010-139, 149] |
| IR-023 | Integrity artifact validator drift | heuristic | resolved | full-audit, impact-guard | - | - | integrity-rule-gap | prevention_gates.test.ts | [REQ-010-147] |
| IR-024 | Command README ↔ 実体 | strict | resolved | full-audit | - | - | document-drift | commands_structure.test.ts | [REQ-001-026, REQ-010-003] |
| IR-025 | 廃止 Decision path 規則 | strict | known | full-audit | - | - | obsolete-structure | (未実装) | [REQ-001-047, REQ-001-048] |
| IR-026 | ADR 誤分類兆候検出 | heuristic | known | full-audit | - | - | canonical-conflict | (手動確認) | [REQ-001-043, REQ-001-031, REQ-001-032, REQ-001-033] |
| IR-027 | 廃止 ADR 現行根拠引用検出 | heuristic | known | full-audit | - | - | canonical-conflict | (手動確認) | [REQ-001-048, REQ-001-050] |
| IR-028 | Command 最上位 Step 整数化 | strict | new | full-audit, delta-guard | - | - | obsolete-structure | (未実装) | [REQ-003-005, REQ-003-007, REQ-003-021] |
| IR-029 | Command 英字サブステップ禁止 | strict | new | full-audit, delta-guard | - | - | obsolete-structure | (未実装) | [REQ-003-006, REQ-003-021] |
| IR-030 | Subagent verbatim 条件付き返却 | strict | new | full-audit, delta-guard | - | - | canonical-conflict | (未実装) | [REQ-003-013, REQ-003-021] |
| IR-031 | Findings / Capture候補 見出し統一 | heuristic | new | full-audit, delta-guard | - | - | obsolete-structure | (未実装) | [REQ-003-014, REQ-003-020, REQ-003-021] |
| IR-032 | delegation_type/on_result 必須 envelope 禁止 | strict | new | full-audit, delta-guard | - | - | canonical-conflict | (未実装) | [REQ-003-017, REQ-003-018] |
| IR-033 | lightweight-delegation primary pattern 禁止 | strict | new | full-audit, delta-guard | - | - | canonical-conflict | (未実装) | [REQ-003-015, REQ-003-016] |
| IR-034 | Skill 内部 section / protocol / Step 参照検出 | heuristic | new | full-audit | - | - | canonical-conflict | (未実装) | [REQ-010-244] |
| IR-035 | Skill See Also 検出観点 | heuristic | new | full-audit | - | - | canonical-conflict | (未実装) | [REQ-010-245] |
| IR-036 | Decision-work-means-detection | heuristic | resolved | full-audit | - | - | canonical-conflict | (未実装)。`status: deprecated` Decision が... | [REQ-010-249, REQ-001-043, REQ-001-044, REQ-001-045] |
| IR-037 | retired-ADR-current-baseline-ref | strict | new | full-audit | - | - | canonical-conflict | (未実装) | [REQ-010-250, REQ-001-048] |
| IR-038 | Decision-index-consistency | strict | new | full-audit, delta-guard | - | - | document-drift | (未実装) | [REQ-010-251, REQ-001-047, REQ-001-048] |
| IR-039 | index-req-title-consistency | strict | new | full-audit | - | - | document-drift | (未実装) | [REQ-010-003, REQ-001-063, REQ-001] |
| IR-040 | retired-req-authority-comment | strict | new | full-audit, delta-guard | - | - | canonical-conflict | (未実装) | [REQ-001-063, REQ-010-070] |
| IR-041 | retired-req-broken-link | strict | new | full-audit | - | - | broken-reference | (未実装) | [REQ-010-070, REQ-001-063] |
| IR-042 | hardcoded-req-count | heuristic | new | full-audit | - | - | document-drift | (手動確認) | [REQ-010-140, REQ-001] |
| IR-043 | retired-readme-coverage | strict | new | full-audit | - | - | document-drift | (未実装) | [REQ-010-083, REQ-001] |
| IR-044 | REQ/SPEC 境界違反検出 | heuristic | new | full-audit | - | - | canonical-conflict | `scripts/check_integrity.test.ts` の I... | [REQ-010-259, REQ-010-260, REQ-010-262, REQ-001-067, REQ-001-068, REQ-001-069, REQ-010-002, REQ-010-012, REQ-001-031] |
| IR-046 | consumer-generated リポジトリ種別誤検知防止 | heuristic | new | full-audit | - | - | canonical-conflict | (未実装) | [REQ-009-007, REQ-009-011, REQ-009-014] |
| IR-047 | src/opencode-local/ link 先原本領域ディレクトリ構成 | strict | new | full-audit, delta-guard | - | - | obsolete-structure | (未実装) | [REQ-009-003, REQ-009-004, REQ-009-005, REQ-009] |
| IR-048 | generated_by 識別子整合性 | strict | new | full-audit, delta-guard | - | - | canonical-conflict | (未実装) | [REQ-009-011, REQ-009-012, REQ-009-013] |
| IR-049 | Command file format violation | strict | resolved | full-audit, delta-guard | - | - | document-drift | check_command_format.test.ts | [v2:REQ-0143, REQ-010] |
| IR-050 | load_skills command 誤指定検出 | strict | new | full-audit, delta-guard | - | - | canonical-conflict | (未実装)。既知 true positive として過去の `load_s... | [REQ-010-261, v2:REQ-0140-027, REQ-010-010] |
| IR-051 | 実行主体の skill 表記誤認検出 | heuristic | new | full-audit | - | - | canonical-conflict | (未実装)。既知 true positive として過去の委譲契約バグ周辺... | [REQ-010-261, v2:REQ-0140-027, REQ-010-010] |
| IR-052 | 完了条件 grep パターン設計（REQ-010-011） | observation | new | full-audit | - | - | integrity-rule-gap | (grep 実装追加時) | [REQ-010-011] |
| IR-053 | gh 直接記述検出 | heuristic | new | full-audit, delta-guard | - | - | canonical-conflict | gh 直接呼出しを含む fixture を検出し、標準手続き参照を検出しな... | [REQ-011] |
| IR-054 | draft SPEC 放置検出 | heuristic | new | full-audit | - | - | document-drift | (未実装)。既知 true positive として `updated` ... | [REQ-001-002, REQ-010-150, REQ-010-151] |
| IR-055 | runtime-unresolved-reference（配布物内の導入先未解決参照検出） | strict（REQ/Decision ID、`src/opencode/`、`/repo/*`、`repo-*`）、heuristic または observation（`docs/specs/`、`docs/guides/`、本体 docs URL、line number 付き参照）。パターンごとの分類は後述「IR-055 検出パターンと severity」参照 | new | full-audit, delta-guard, impact-guard | - | - | broken-reference | check_integrity.test.ts。各検出パターン（REQ-N... | [REQ-002-079, REQ-002-080, REQ-002-081, REQ-010-056, REQ-010-263, REQ-010-264] |
| IR-056 | project-extensions-integrity | strict | new | full-audit, delta-guard, impact-guard | - | - | broken-reference | `check_extensions.test.ts`で各検査項目の正常・異... | REQ-002 |
| IR-057 | obsolete-spec-path-after-domain-split | strict | new | full-audit, delta-guard, impact-guard | - | - | broken-reference | (未実装)。`obsolete-path-map.yaml` の全エントリ... | [REQ-010-280, REQ-010-282, REQ-001-006, REQ-009-004, REQ-010-265, REQ-010-024] |
| IR-058 | distribution-untracked-skill-reference | strict | new | full-audit, delta-guard, impact-guard | - | - | integrity-rule-gap | `check_integrity.test.ts` の `IR-058 d... | [REQ-002-001, REQ-002-002, REQ-002-003] |
| IR-059 | distribution-reference-boundary | strict | - | full-audit | - | - | canonical-conflict | 具体ID、具体パス、固定URL、各exemptionの正常・異常fixtu... | REQ-002 |
| IR-060 | forbidden Japanese word detection | heuristic | new | delta-guard | - | - | document-drift | (未実装) | [v2:REQ-0140（v2:REQ-0140-033, v2:REQ-0140-035, v2:REQ-0140-036）, REQ-010（REQ-010-256 文意判断は docs-check 対象外、本ルールは完全一致検出に限定）] |
| IR-061 | 索引類自動生成整合性 | - | - | - | - | - | - | - | - |

### 属性の集計

**severity**:
  - strict: 37
  - heuristic: 18
  - (未設定): 2
  - observation: 1
  - strict（REQ/Decision ID、`src...: 1

**baseline_status**:
  - new: 29
  - resolved: 23
  - known: 4
  - (未設定): 2
  - superseded: 1

**gate_level**:
  - full-audit: 32
  - full-audit, delta-guard: 18
  - full-audit, delta-guard, im...: 4
  - (未設定): 2
  - full-audit, impact-guard: 2
  - delta-guard: 1

**lifecycle_state**:
  - (未設定): 58
  - superseded: 1

**enforcement_mode**:
  - (未設定): 58
  - none: 1

**finding_route**:
  - intake: 43
  - req-define: 7
  - intake+learning: 3
  - (未設定): 2
  - none: 2
  - intake（既知違反の段階解消は別途処理）: 2


## 3. detector 実装状況

### 3.1 check_integrity.ts の check 関数（76 件）

`check_integrity.ts`（280 KB）に定義される check 関数一覧。各関数がどの IR に対応するかは Phase 1（OU-002）で IR→実装の双方向マッピングを実施する。Phase 0 では関数インベントリの記録のみ。

- `checkReqFrontmatterFilename`
- `checkReqRequiredFields`
- `checkReqReadmeIndexSync`
- `checkAdrReqCrossReference`
- `checkSkillAgentdevPrefix`
- `checkCommandReadmeSync`
- `checkExpandedReadmeSync`
- `checkCommandInventory`
- `checkLegacyNamespace`
- `checkNameCollision`
- `checkCompletionReportTemplates`
- `checkVariantExistence`
- `checkInlineCompletionBodyInCommands`
- `checkVariantRequiredFields`
- `checkFragmentPatterns`
- `checkPostCompletionOutput`
- `checkTerminology`
- `checkSpecsExistence`
- `checkLinkIntegrity`
- `checkCanonicalBoundary`
- `checkLifecycleBoundary`
- `checkExpandedLegacyNamespace`
- `checkReqRetiredIndexSync`
- `checkDocMapReqSync`
- `checkDocMapSpecSync`
- `checkDocMapGuideSync`
- `checkAdrReadmeIndexSync`
- `checkCommandMapConsistency`
- `checkSpecReadmeIndexSync`
- `checkObsoleteReferenceDirs`
- `checkBareSlashScoped`
- `checkRetiredFrontmatter`
- `checkVariantPathExistence`
- `checkVariantRegistryRegistered`
- `checkSkillFrontmatter`
- `checkCommandFrontmatterDetailed`
- `checkInlineCompletionReportsStrict`
- `checkAdrStatusNormalization`
- `checkRuidGroundReference`
- `checkWorkflowStatusProhibition`
- `checkAcceptedAdrOnlyCitation`
- `checkNonAcceptedArtifactRefsInFiles`
- `checkNonAcceptedAdrRefsInFile`
- `checkNonAcceptedArtifactRefsInFile`
- `checkPatternResidualDetection`
- `checkReqBacklogResidualDetection`
- `checkAbolishedSkillReferences`
- `checkReqRangeStaleness`
- `checkSkillCategoryGap`
- `checkTemplatePathIntegrity`
- `checkSourceProjectionConsistency`
- `checkDistributionUntrackedSkillReference`
- `checkBrokenJunctions`
- `checkSourceRequiredDirs`
- `checkInstalledProjection`
- `checkDocumentClassificationPolicy`
- `checkUpdateNotesInDocs`
- `checkSummaryReqRangeConsistency`
- `checkOldStatusVocabulary`
- `checkLegacyNamespaceInDocs`
- `checkJunctionScanCoverage`
- `checkAgentdevExclusion`
- `checkReferencesRecursiveScan`
- `checkReportSelfExclusion`
- `checkVocabularyRegistrySync`
- `checkCaptureBoundaryReference`
- `checkPrTemplateCaptureSection`
- `checkCommandCaptureDuties`
- `checkSisyphusJuniorUlwLoopMisclassification`
- `checkReqVerificationBasis`
- `checkReqSpecBoundaryViolation`
- `checkGhDirectInvocation`
- `checkDraftSpecStaleness`
- `checkRuntimeUnresolvedReference`
- `checkObsoleteSpecPath`
- `checkIndexGenerationConsistency`

### 3.2 スタンドアロン checker（check_integrity.ts 配下以外）

| checker ファイル | 対応 IR（カタログ記載ベース） | 役割 |
|---|---|---|
| check_changed_docs.ts | IR-001, IR-002（workflow targeted guard） | req-save/spec-save/case-run/case-close での変更文書限定検査 |
| check_extensions.ts | IR-056 | project extensions 整合性検査 |
| check_distribution_boundary.ts | IR-059 | distribution reference boundary |
| check_command_format.ts | IR-049 | command ファイル形式違反 |
| check_autogen_freshness.ts | IR-061（鮮度 gate 側面） | AUTOGEN ブロック鮮度 |
| check_test_impact.ts | （REQ-019 gate） | テスト影響範囲検出 |
| check_skill_rename_symmetry.ts | IR-（REQ-026） | skill rename 対称性 |
| check_reference_paths.ts | （補助） | 参照パス検査 |
| check_templates.ts | （補助） | template 検査 |
| ir057_history_exemption.ts | IR-057 補助 | IR-057 履歴例外 |
| current_refs.ts | （補助） | 現行参照抽出 |
| generate_indexes.ts | IR-061 | 索引自動生成 |
| lint_skills.ts | （補助） | skill lint |
| cli_utils.ts | （共通） | CLI ユーティリティ |

### 3.3 IR→detector のリテラル ID 参照（部分的、Phase 1 で完全化）

Phase 0 では、checker ソース内にリテラル IR-NNN ID が現れるものを記録する。大部分の check 関数は IR-NNN ID を直接参照せず、関数名と実装で IR に対応する。意味ベースの完全マッピングは Phase 1（OU-002）が担当する。

リテラル IR-NNN 参照が確認できた checker（抜粋）:

- IR-044: check_integrity.ts（checkReqSpecBoundaryViolation）+ check_integrity.test.ts に広範なテストスイート
- IR-046, IR-048: ir057_history_exemption.ts（IR_057_EXEMPT_RULE_FILES 配列で例外登録）
- IR-049: check_command_format.ts
- IR-053: check_integrity.ts（checkGhDirectInvocation）
- IR-054: check_integrity.ts（checkDraftSpecStaleness）
- IR-055: check_integrity.ts（checkRuntimeUnresolvedReference）+ check_integrity.test.ts
- IR-056: check_extensions.ts + check_extensions.test.ts
- IR-057: check_integrity.ts（checkObsoleteSpecPath）+ ir057_history_exemption.ts + regression_ir057_rule_exemption.test.ts
- IR-058: check_integrity.ts（checkDistributionUntrackedSkillReference）+ check_integrity.test.ts
- IR-059: check_distribution_boundary.ts + check_distribution_boundary.test.ts
- IR-061: check_integrity.ts（checkIndexGenerationConsistency）+ generate_indexes.ts

**Phase 1 での確認が必要な IR（リテラル参照なし、意味ベース対応の確認）**: IR-001..043（IR-011除く）、IR-045(catalog-only)、IR-047、IR-050..052、IR-060。これらは check 関数としては存在する可能性が高いが、Phase 0 時点では IR ID による追跡ができない。

## 4. regression test coverage

IR body の regression_test フィールド集計（59 件）:

| 区分 | 件数 | IR |
|---|---|---|
| 実装済み（テストファイル参照） | 26 | IR-001, IR-002, IR-003, IR-004, IR-005, IR-006, IR-007, IR-008, IR-009, IR-010, IR-012, IR-013, IR-014, IR-015, IR-016, IR-021, IR-023, IR-024, IR-044, IR-049, IR-052, IR-053, IR-055, IR-056, IR-058, IR-059 |
| 手動確認 | 7 | IR-018, IR-019, IR-020, IR-022, IR-026, IR-027, IR-042 |
| 未実装（"未実装" 記載） | 24 | IR-025, IR-028, IR-029, IR-030, IR-031, IR-032, IR-033, IR-034, IR-035, IR-036, IR-037, IR-038, IR-039, IR-040, IR-041, IR-043, IR-046, IR-047, IR-048, IR-050, IR-051, IR-054, IR-057, IR-060 |
| フィールドなし | 2 | IR-011, IR-061 |

### 既存テストスクリプト（27 件）

- check_autogen_freshness.test.ts
- check_changed_docs.test.ts
- check_command_format.test.ts
- check_distribution_boundary.test.ts
- check_extensions.test.ts
- check_integrity.test.ts
- check_reference_paths.test.ts
- check_skill_rename_symmetry.test.ts
- check_templates.test.ts
- check_test_impact.test.ts
- cli_utils.test.ts
- command_fixtures.test.ts
- commands_e2e.test.ts
- commands_error_cases.test.ts
- commands_structure.test.ts
- current_refs.test.ts
- generate_indexes.test.ts
- lint_skills.test.ts
- regression_adr_id_width.test.ts
- regression_ir057_rule_exemption.test.ts
- regression_issue616.test.ts
- regression_lifecycle_review_false_positive.test.ts
- regression_mapping_table_contract_removed.test.ts
- regression_req_id_width.test.ts
- regression_req_id_width_generator.test.ts
- skills_structure.test.ts
- templates_structure.test.ts

## 5. docs-check 実行経路と baseline 結果

### 5.1 実行経路（現在の docs-check 起点一覧）

| 起点 | 経路 | 対象 |
|---|---|---|
| /repo/docs-check コマンド | check_integrity.ts（full audit） | 全 IR（full-audit / delta-guard / impact-guard を gate_level で選別） |
| req-save / spec-save / case-run / case-close | check_changed_docs.ts --workflow <wf> --base-ref origin/main | 変更文書限定 targeted guard（IR-001/002 等、workflow 別サブセット） |
| check_extensions.ts（単体） | スタンドアロン | IR-056 |
| check_distribution_boundary.ts（単体） | スタンドアロン | IR-059 |
| check_command_format.ts（単体） | スタンドアロン | IR-049 |
| CI（.github/workflows/） | 本 worktree 時点では integrity 起点の workflow ファイルは未検出（docs-check はローカル /repo コマンド経由が主） | - |

### 5.2 check_integrity.ts 実行結果（本 baseline 時点）

実行コマンド: `bun run .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts --json`

結果サマリ（exit code: 1、NG 検出あり）:

| level | 件数 |
|---|---|
| NG（strict 違反、新規） | 139（new unmanaged NG (delta)） |
| NG（strict 違反、全件） | 87 |
| WARNING（heuristic 違反） | 52 |
| INFO（baseline-known として demote 済み + observation） | 402 |
| baseline-known（demote 対象） | 3 |
| approved additions | 0 |

**主要 NG カテゴリ（report.md の ### ヘッダー）**:

- REQ
- ADR
- Skill
- LinkIntegrity
- Inventory
- Implementation Pattern
- LifecycleBoundary
- Decision
- integrity-rule-gap
- CaptureBoundary
- CanonicalConflict
- RuntimeReference（IR-055 関連、配布物内 src/opencode/ , REQ-NNNN, DEC-NNN, docs/specs/ 参照など）
- IndexGenerationConsistency（IR-061 関連、AUTOGEN ブロック 4 件の不整合）
- ProfileScope

**レポートファイル**: `.agentdev/integrity/reports/2026-08-11-integrity-report.md`（同日内の複数実行で -2..-5 サフィックス付きファイルも生成）。本 baseline で参照するのは最初の実行 `2026-08-11-integrity-report.md`。

**注記**: 本 baseline 時点での NG は REQ-028 監査対象の現状であり、Phase 0 では修正しない。Phase 1..6 で監査・再編後に NG 件数の推移を比較する。

### 5.3 既知の AUTOGEN ブロック不整合（IR-061 関連、Phase 0 時点）

check_integrity.ts 実行で検出された AUTOGEN ブロック不整合（4 件）。いずれも `generate_indexes.ts` の再実行で解消する可能性があるが、Phase 0 では現状記録のみ。

1. `docs/specs/integrity/integrity-rule-catalog.md` の `catalog-ir-entries-pre-045` ブロック: IR-005 の title が "ADR↔REQ" → "Decision↔REQ" への更新未反映
2. `docs/specs/integrity/rule-ownership.md` の `rule-ownership-ir-crossref` ブロック: 同上の IR-005 表記揺れ
3. `docs/specs/quality/req-health-metrics.md` の `req-metrics-measurement-example` ブロック: REQ-006 の要件項目数 109 → 112 への更新未反映
4. `docs/specs/quality/spec-health-metrics.md` の `spec-metrics-measurement-example` ブロック: SPEC 行数・件数の更新未反映

## 6. Phase 1..6 比較基準としての利用

以降の OU（OU-002..007）は本 baseline を変更前の比較基準として使用する。

| Phase | OU | 本 baseline との比較観点 |
|---|---|---|
| Phase 1 | OU-002 #2078 | 全 IR 双方向マッピング実施後、detector 実装有無・配置・回帰性を本 baseline の §3 と比較 |
| Phase 2 | OU-003 #2079 | KEEP/MERGE/IMPLEMENT/DELETE 分類後、IR 件数・構成を本 baseline の §1, §2 と比較 |
| Phase 3 | OU-004 #2080 | 横断的再評価・統合後、check 関数構成を本 baseline の §3.1 と比較 |
| Phase 4 | OU-005 #2081 | IR 属性削除（lifecycle/enforcement/baseline_status）後、§2 の属性テーブルと比較。tombstone 削除後、§1 の IR-011 行と比較 |
| Phase 5 | OU-006 #2082 | checker/test/fixture/baseline/catalog へ分類適用後、§3, §4 と比較 |
| Phase 6 | OU-007 #2083 | 全体検証。本 baseline 時点の §5.2 NG 件数（139 new unmanaged）との推移を確認 |

## 7. Phase 0 で実施しないこと（Phase 1..6 へ委譲）

- IR 属性の変更（lifecycle_state/enforcement_mode/baseline_status の削除は OU-005）
- IR ファイルの物理削除（IR-011 tombstone 削除は OU-005）
- KEEP/MERGE/IMPLEMENT/DELETE 分類（OU-003）
- detector の新規実装・統合（OU-004, OU-006）
- REQ/Decision/SPEC ファイルの内容変更（本 OU では新規 baseline ファイル作成のみ）
- 完了条件チェックボックスの更新（case-close QG-4 責務）

## 8. 観察事項（Findings / Capture 候補）

Phase 0 の記録過程で観察された事項。Phase 1..6 での検討候補として記録し、Phase 0 では対応しない。

- **frontmatter の均一性**: 59 件の file-backed IR のうち 58 件は frontmatter が `status: accepted` のみ。拡張属性（id, title, severity, baseline_status）を持つのは IR-061 のみ。属性は本文 Field/Value 表で管理されており、DEC-013 AG-009 はこの Field/Value 表の属性削除を意味する。
- **IR-011 単独 tombstone**: lifecycle_state/enforcement_mode が設定されている file-backed IR は IR-011 のみ。DEC-013 AG-008 で物理削除候補。
- **gate_level の多様性**: full-audit 単体（31）、full-audit + delta-guard（17）、delta-guard 単体（1、IR-060）、impact-guard 組み合わせ（数件）。Phase 5 での検査適用時に影響。
- **regression_test 未実装 18 件**: IR body の regression_test フィールドで "未実装" と明記された IR は 18 件。Phase 5（OU-006）での検査適用時に実装 or 廃止を判断。
- **IR ID リテラル参照の稀少**: check_integrity.ts の check 関数の大部分は IR-NNN ID を直接参照しない。Phase 1 での意味ベース マッピングが必要。
- **AUTOGEN ブロック不整合 4 件**: IR-061 違反として検出。いずれも generate_indexes.ts 再実行で解消する見込みだが、本 Phase 0 では現状記録のみ。

## 関連情報

- 根拠 Issue: #2077（OU-001 Phase 0）
- 親 Epic: #2076（REQ-028 IR portfolio audit）
- 根拠要件: [REQ-028](../../../requirements/REQ-028.md)
- 根拠 Decision: [DEC-013](../../../decisions/DEC-013.md)
- 整合性契約: [integrity-contracts.md](../integrity-contracts.md)
- ルールカタログ: [integrity-rule-catalog.md](../integrity-rule-catalog.md)
- ルール所有権: [rule-ownership.md](../rule-ownership.md)
