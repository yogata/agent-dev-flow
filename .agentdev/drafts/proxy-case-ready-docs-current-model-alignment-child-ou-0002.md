# proxy-case-ready payload: Child Issue OU-0002

Title（verbatim）:
OU-0002: case-ready 実行時投影の判断境界現行化（AG-001・RA-002 case-ready 系）

Body（verbatim。`#EPIC_SELF` は Epic Issue の番号へ置換して issue_create する）:

```markdown
Parent: #EPIC_SELF

## 概要
<!-- 【必須】 -->

OU-0002（Wave 1・並列・依存なし）: REQ-061-003 更新後の判断境界（人間に留保された判断〔REQ-096-005〕の新規確定と既存安全境界の操作承認に限定した HITL 境界）を、case-ready 関連の実行時投影（src/opencode/skills/** の Workflow Skill・reference・テンプレート）へ意味的に同期する（AG-001・RA-002 の case-ready 系部分）。Definition 面（REQ-061-003 行、docs/designs/commands/case-ready.md、docs/designs/foundations/system.md の該当節）は Definition PR #3294 として merge 済みであり、本 Issue は実現面のみを扱う。

## 実行識別情報
<!-- 【必須】 -->

- adf_case: #EPIC_SELF（親 Epic Issue）
- adf_execution_unit: standard
- adf_harness_ref: N/A

## 対象範囲
<!-- 【必須】 -->

- src/opencode/skills/agentdev-workflow-case-ready/SKILL.md
- src/opencode/skills/agentdev-workflow-case-ready/references/definition-acceptance.md
- src/opencode/skills/agentdev-workflow-templates/SKILL.md、src/opencode/skills/agentdev-workflow-templates/templates/（case-ready 系のテンプレート文言）
- src/opencode/skills/agentdev-workflow-inspect-promote/SKILL.md、src/opencode/skills/agentdev-quality-gates/references/common-gate-contract.md、src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md、src/opencode/skills/agentdev-workflow-case-run/references/delegation-and-result.md のうち、case-ready の判断境界（Definition 受入・Decision 受理・不整合処理）に対応する旧判断境界語の残存箇所
- 判定基準: 各言及を現行契約上の意味で分類し、旧判断境界を意味として使用する箇所のみ変更する。人間に留保された判断または既存安全境界の操作承認として正当な HITL は維持する。proposed Decision の受理評価は REQ-061-021 の導出ベース判定を維持する

## REQ参照
<!-- 【必須】 -->

REQ-061（REQ-061-003。判断アーキテクチャの正は REQ-096 / DEC-048）

## 提案内容
<!-- 【必須】 -->

- RA-002（case-ready 系部分）: src/opencode の case-ready 関連実行時投影から旧判断境界を、更新後の REQ-061-003・case-ready Design と同一の意味（人間に留保された判断〔REQ-096-005〕の新規確定、または既存の安全境界が要求する操作承認を要する場合に停止し HITL とし、既存の正規契約から導出できる解消と委譲された裁量の範囲内の判断〔作業仮定の明示を含む〕は自律確定とする。人間判断への移送の判定は語の使用だけで行わず REQ-096-005 の留保事項該当性で行う。REQ-096-003、REQ-096-004、REQ-096-006。停止理由は REQ-096-012 の原因分類へ対応）へ同期する
- intent: 正規文書の現在契約を実行時投影へ同一変更で反映し、新旧契約の併存を残さない（AG-001、RU §2.6）
- verification_refs: [TS-001, TS-002]
- source_items: [AG-001]

## 完了条件
<!-- 【必須】 -->

- [ ] src/opencode の case-ready 関連正規文書・配布物において、旧判断境界を意味として使用する残存が 0 件であること（正当な意味として説明できる箇所はその説明を検証記録に残すこと。TS-001 pass_criteria のうち case-ready 系対象）
- [ ] case-ready 実行時投影の Definition 受入・Decision 受理・不整合処理の判断境界が、REQ-096-005 の留保事項該当性で人間判断移送を判定する現行境界と一致すること（AC-03）。判断の難易度・確信度・評価器間の不一致・結果状態・唯一解でないことだけを理由とする移送規則が残っていないこと（AC-01 のうち case-ready 系対象）
- [ ] 変更が case-ready 系対象ファイルに限定されており、case-auto 系（OU-0001）・case-close 系・design-file-manager 系（OU-0003）の対象変更を含まないこと

## テスト戦略
<!-- 【必須】 -->

- id: TS-001
 target_item: AG-001（case-ready 系対象部分）
 verification: |
  rg '一意に回答|一意確定|新しい意味判断|意味判断が必要' を docs/requirements/、docs/designs/、docs/guides/、src/opencode/ に実行し、残存箇所を列挙する。本 Issue では case-ready 系対象ファイル（上記対象範囲）の残存解消を行い、HITL 発動根拠が旧判断モデル依存の箇所も同様に列挙・解消する。
 pass_criteria: |
  case-ready 系修正対象ファイルにおいて、旧判断境界を意味として使用する残存が 0 件。正当な意味として説明できる箇所はその説明を検証記録に残していること。
  on_failure: |
  fix-and-reverify。残存箇所を現行語彙へ修正し再検証する。正当理由の判定は AG-001 の基準に従う。
- id: TS-002
 target_item: AG-001（case-ready Design 対応節）
 verification: |
  src/opencode/skills/agentdev-workflow-case-ready/SKILL.md の Definition 受入・Decision 受理・不整合処理・HITL 停止関連節を、更新後の REQ-061-003 本文および REQ-096-003〜006/010/012/015 と突き合わせる。
 pass_criteria: |
  いずれの節も判断主体、自律確定範囲、人間判断の発動根拠、停止理由の原因分類が REQ-096 と矛盾しないこと。「新しい意味判断が必要なら HITL」「一意に確定できないなら停止」等の旧境界で読み取れる記述が残っていないこと。proposed Decision の受理評価が REQ-061-021 の導出ベース判定として維持されていること。
  on_failure: |
  fix-and-reverify。該当節を REQ-096 語彙へ修正し再検証する。

## Execution Contract
<!-- 【必須】 -->

### 統合先
- main

### 変更対象成果物
- implementation: src/opencode/skills/agentdev-workflow-case-ready/SKILL.md
- implementation: src/opencode/skills/agentdev-workflow-case-ready/references/definition-acceptance.md
- implementation: src/opencode/skills/agentdev-workflow-templates/SKILL.md および templates/ 配下の case-ready 系文言
- implementation: 上記対象範囲に挙げた case-ready 判断境界関連 reference・skill 文言（検索で検出された分のみ）

### 必須品質統制
- implementation 変更 → Skill 品質査読（構造 lint・Command/Skill 参照妥当性）と targeted docs guard・textlint gate。最終横断検証は親 Epic の TS-008（OU-0008 実施）

### 関連 ADR 拘束条件
- DEC-048 / REQ-096 を判断アーキテクチャの正とする。DEC-008 は歴史的判断記録として参照維持し本文を編集しない。DEC-008 frontmatter への相互参照追記は本 Case 対象外・将来 intake（CR-004）

### scope-affecting impact candidate
- docs/designs/foundations/system.md を OU-0001（Wave 1・並列）と共有。system.md の主要編集は Definition PR #3294 で単一実施済みであり、追加修正が生じる場合のみ衝突リスク。重複許容の Wave 1 記録（親 Epic「Wave 重複前置検出」節）に従い、衝突解消担当は後着 merge 側
- src/opencode/skills/agentdev-workflow-case-ready/ は本実行 Case 自身の workflow skill であり、変更は本 lifecycle 以降の実行から有効になる（実行中 lifecycle の動作は開始時に確定済み）
- TS-001 の検索は docs 全体・src/opencode 全体に及ぶが、修正対象は case-ready 系に限定する。横断残存は OU-0001（case-auto 系）・OU-0003（case-close 系）・OU-0008（最終同期）が受け持つ

### 実現面の変更方針（realization_actions 由来）
<!-- 【必須】 -->

- RA-002（case-ready 系部分のみを本 Issue で実施）: concern「case 系 workflow skill・reference の判断境界・見送り記録語彙同期」、responsibility「case-ready に関係する実行時 Workflow Skill・reference・テンプレートのうち旧判断境界語を使用する箇所を、更新後の REQ・Design 契約と同一の意味へ同期する。各言及を現行契約上の意味で分類し、Design 本文書き込みを要求する箇所のみ変更する」、ownership_hints（case-ready 系）「src/opencode/skills/agentdev-workflow-case-ready/SKILL.md、src/opencode/skills/agentdev-workflow-case-ready/references/definition-acceptance.md、src/opencode/skills/agentdev-workflow-templates/SKILL.md、src/opencode/skills/agentdev-workflow-templates/templates/、src/opencode/skills/agentdev-workflow-inspect-promote/SKILL.md、src/opencode/skills/agentdev-quality-gates/references/common-gate-contract.md、src/opencode/skills/agentdev-issue-management/references/issue-operation-safety.md、src/opencode/skills/agentdev-workflow-case-run/references/delegation-and-result.md」、intent「正規文書の現在契約を実行時投影へ同一変更で反映し、新旧契約の併存を残さない」、verification_refs「TS-001, TS-002」、source_items「AG-001」

### adversarial-review 発動契約（任意）
- 該当なし。ユーザー明示指定なし（Root Case #3293 本文に skip 判定記録済み〔REQ-015-003〕）

## レビュー判断
<!-- 【必須】 -->

本 Issue のレビュー判断は親 Epic Issue #EPIC_SELF の「レビュー判断」セクションを参照すること。

## 補足情報
<!-- 【任意】 -->

- 冪等キー: topic_slug `docs-current-model-alignment-and-compression-foundation` / OU-0002 / Root Case #3293
- work_type: maintenance / scale: standard
- 作業基準版: agent-dev-flow-main-2026-10-01.zip。HEAD が基準より進む場合は既知 finding の現存確認を前置し、解消済み箇所へ古い修正を再適用しない
```
