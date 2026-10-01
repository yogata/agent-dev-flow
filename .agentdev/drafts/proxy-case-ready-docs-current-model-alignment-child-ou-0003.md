# proxy-case-ready payload: Child Issue OU-0003

Title（verbatim）:
OU-0003: Design 保存契約現行化の実現面同期（AG-002・RA-001）

Body（verbatim。`#EPIC_SELF` は Epic Issue の番号へ置換して issue_create する）:

```markdown
Parent: #EPIC_SELF

## 概要
<!-- 【必須】 -->

OU-0003（Wave 1・並列・依存なし）: REQ-032-025 更新後の見送り記録保存先契約（当該 Case の Issue への対応記録コメントへ保存し、現在 Design 本文へ作業履歴として新規保存しない）を、design-file-manager および case-close 系の実行時投影（src/opencode/skills/**）へ同期し、Design 履歴混入の再生成経路を実行時投影から遮断する（AG-002・RA-001・RA-002 case-close 系部分）。Definition 面（REQ-032-025 行、docs/designs/skills/agentdev-design-file-manager.md、docs/designs/commands/case-close.md）は Definition PR #3294 として merge 済みであり、本 Issue は実現面のみを扱う。

## 実行識別情報
<!-- 【必須】 -->

- adf_case: #EPIC_SELF（親 Epic Issue）
- adf_execution_unit: standard
- adf_harness_ref: N/A

## 対象範囲
<!-- 【必須】 -->

- src/opencode/skills/agentdev-design-file-manager/SKILL.md
- src/opencode/skills/agentdev-design-file-manager/references/design-lifecycle-application.md
- src/opencode/skills/agentdev-workflow-case-close/SKILL.md
- src/opencode/skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md、cleanup-and-capture.md、epic-wave-close.md、pr-merge-and-conflict.md
- src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_bug_record.md、pr_desc.md（対応記録・見送り記録の保存先文言）
- src/opencode/skills/agentdev-doc-diagnostics/references/diagnostic-categories.md、src/opencode/skills/agentdev-case-run-execution-adapter/references/adversarial-review-integration.md のうち、Design 本文への対応記録・見送り記録保存を要求する記述
- 判定基準: accepted 昇格・見送り処理が Design 本文への対応記録等の作業履歴の新規生成を要求する記述・テンプレート・生成処理のみを変更する。評価の実施、評価結果の確定、追跡可能性の要求自体は維持する

## REQ参照
<!-- 【必須】 -->

REQ-032（REQ-032-025・REQ-032-026。文書種別責務の正は REQ-001-003 / REQ-001-014 / REQ-001-015）

## 提案内容
<!-- 【必須】 -->

- RA-001: src/opencode/skills/agentdev-design-file-manager/ の実行時投影から Design 本文への対応記録新規生成要求を除去し、昇格評価の証跡を既存履歴チャネル（当該 Case の Issue への対応記録コメント）へ保存する手順へ更新する。冪等認定（REQ-032-026 相当）の参照先を履歴チャネルへ同期する
- RA-002（case-close 系部分）: case-close 系 Workflow Skill・reference・テンプレートのうち、見送り記録の Design 本体保存を要求する箇所を、REQ-032-025 更新後の契約と同一の意味（対応記録コメント保存、Design 本体除く、再評価契機を持つ未解決の見送り事項は追跡Issue として育成）へ同期する
- intent: Design 履歴混入の再生成経路を実行時投影から遮断する（AG-002）。Design は現在設計のみを保持し、評価証跡は既存履歴チャネルから復元可能にする
- verification_refs: [TS-003]
- source_items: [AG-002]

## 完了条件
<!-- 【必須】 -->

- [ ] Design 本文への作業履歴新規生成を要求する契約記述・実行時投影・テンプレートの残存が 0 件であること（TS-003 pass_criteria）
- [ ] 評価の実施、評価結果の確定、追跡可能性（REQ-032-024/025/026）、Design status と追跡情報源の整合（REQ-001-026/028）の要求が維持されていること
- [ ] REQ-032-026 の冪等認定の参照先が履歴チャネル（対応記録コメント）の見送り記録へ同期されていること
- [ ] 変更が design-file-manager・case-close 系対象ファイルに限定されており、case-auto 系（OU-0001）・case-ready 系（OU-0002）の対象変更を含まないこと

## テスト戦略
<!-- 【必須】 -->

- id: TS-003
 target_item: AG-002
 verification: |
  src/opencode/skills/agentdev-design-file-manager/（SKILL.md、references/）、src/opencode/skills/agentdev-workflow-case-close/ の全参照ファイル、src/opencode/skills/agentdev-workflow-templates/templates/ を確認し、accepted 昇格・見送り処理が Design 本文への対応記録等の作業履歴の新規生成を要求する記述・テンプレート・生成処理を列挙する。Design 履歴混入を生成する既存テスト・テンプレート（存在する場合）を特定し実行する。
 pass_criteria: |
  Design 本文への作業履歴新規生成を要求する契約記述・実行時投影・テンプレート・テストの残存が 0 件。評価の実施、評価結果の確定、追跡可能性、Design status と追跡情報源の整合の要求が維持されていること。REQ-032-026 の冪等認定の参照先が履歴チャネルの見送り記録へ同期されていること。
  on_failure: |
  fix-and-reverify。保存先契約を履歴チャネルへ修正し再検証する。

## Execution Contract
<!-- 【必須】 -->

### 統合先
- main

### 変更対象成果物
- implementation: src/opencode/skills/agentdev-design-file-manager/SKILL.md
- implementation: src/opencode/skills/agentdev-design-file-manager/references/design-lifecycle-application.md
- implementation: src/opencode/skills/agentdev-workflow-case-close/SKILL.md および references/（docs-and-design-promotion.md、cleanup-and-capture.md、epic-wave-close.md、pr-merge-and-conflict.md）
- implementation: src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_bug_record.md、templates/pr_desc.md
- implementation: 上記対象範囲に挙げた保存先文言関連 reference（検索で検出された分のみ）

### 必須品質統制
- implementation 変更 → Skill 品質査読（構造 lint・Command/Skill 参照妥当性）と targeted docs guard・textlint gate。最終横断検証は親 Epic の TS-008（OU-0008 実施）

### 関連 ADR 拘束条件
- REQ-001 の文書種別責務を正とする（REQ-001-020 の現行要件文書優先）。見送り記録の Design 本体保存を決定した accepted Decision は存在しないため、後継 Decision ではなく既存契約の適用（違反状態解消）として処理する（CR-001 解消済み・Definition merge 済み）
- 新しい恒久文書種別や一時状態は追加しない（AG-002）。既存の履歴チャネル（対応記録コメント、追跡Issue、Git 履歴、PR）を利用する

### scope-affecting impact candidate
- docs/designs/commands/case-ready.md と case-revise.md の `## 対応記録` 見出しの除去は OU-0004（Wave 2）の純化スイープが担当する。本 Issue は実行時投影の再生成防止のみを扱い、Design 本体の編集は行わない
- 保存先変更は case-close の Design 状態評価（REQ-032-024〜026）の動作に影響する。case-close 実行時投影は本 Issue で同期されるため、OU-0004 の純化（Wave 2）以降に実行される case-close から新契約が適用される

### 実現面の変更方針（realization_actions 由来）
<!-- 【必須】 -->

- RA-001: concern「design-file-manager 実行時投影の保存契約同期」、responsibility「src/opencode/skills/agentdev-design-file-manager/ の実行時投影（SKILL.md、references/design-lifecycle-application.md）から Design 本文への対応記録新規生成要求を除去し、昇格評価の証跡を既存履歴チャネルへ保存する手順へ更新する。冪等認定（REQ-032-026 相当）の参照先を履歴チャネルへ同期する」、ownership_hints「src/opencode/skills/agentdev-design-file-manager/SKILL.md、src/opencode/skills/agentdev-design-file-manager/references/design-lifecycle-application.md、docs/designs/skills/agentdev-design-file-manager.md（ACT-DESIGN-004 と同一変更連鎖。Definition merge 済み）」、intent「Design 履歴混入の再生成経路を実行時投影から遮断する（AG-002）。Design は現在設計のみを保持し、評価証跡は既存履歴チャネルから復元可能にする」、verification_refs「TS-003」、source_items「AG-002」
- RA-002（case-close 系部分のみを本 Issue で実施）: concern「case 系 workflow skill・reference の判断境界・見送り記録語彙同期」、responsibility（case-close 系部分）「見送り記録の Design 本体保存を要求する箇所を対応記録コメント保存の契約へ同期する」、ownership_hints（case-close 系）「src/opencode/skills/agentdev-workflow-case-close/SKILL.md、references/docs-and-design-promotion.md、cleanup-and-capture.md、epic-wave-close.md、pr-merge-and-conflict.md、src/opencode/skills/agentdev-workflow-templates/templates/issue_comment_bug_record.md、templates/pr_desc.md、src/opencode/skills/agentdev-doc-diagnostics/references/diagnostic-categories.md、src/opencode/skills/agentdev-case-run-execution-adapter/references/adversarial-review-integration.md」、verification_refs「TS-003」、source_items「AG-002」

### adversarial-review 発動契約（任意）
- 該当なし。ユーザー明示指定なし（Root Case #3293 本文に skip 判定記録済み〔REQ-015-003〕）

## レビュー判断
<!-- 【必須】 -->

本 Issue のレビュー判断は親 Epic Issue #EPIC_SELF の「レビュー判断」セクションを参照すること。

## 補足情報
<!-- 【任意】 -->

- 冪等キー: topic_slug `docs-current-model-alignment-and-compression-foundation` / OU-0003 / Root Case #3293
- work_type: maintenance / scale: standard
- 作業基準版: agent-dev-flow-main-2026-10-01.zip。HEAD が基準より進む場合は既知 finding の現存確認を前置し、解消済み箇所へ古い修正を再適用しない
```
