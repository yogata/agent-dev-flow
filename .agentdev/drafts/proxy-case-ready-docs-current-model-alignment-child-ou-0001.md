# proxy-case-ready payload: Child Issue OU-0001

Title（verbatim）:
OU-0001: case-auto 実行時投影の判断境界現行化（AG-001・RA-002 case-auto 系）

Body（verbatim。`#EPIC_SELF` は Epic Issue の番号へ置換して issue_create する）:

```markdown
Parent: #EPIC_SELF

## 概要
<!-- 【必須】 -->

OU-0001（Wave 1・並列・依存なし）: REQ-034-032 更新後の判断境界（REQ-096 確定権限3分類ベースの自律解決境界）を、case-auto 関連の実行時投影（src/opencode/skills/** の Workflow Skill・reference・テンプレート）へ意味的に同期する（AG-001・RA-002 の case-auto 系部分）。Definition 面（REQ-034-032 行、docs/designs/commands/case-auto.md、docs/designs/foundations/system.md の該当節）は Definition PR #3294 として merge 済みであり、本 Issue は実現面のみを扱う。

## 実行識別情報
<!-- 【必須】 -->

- adf_case: #EPIC_SELF（親 Epic Issue）
- adf_execution_unit: standard
- adf_harness_ref: N/A

## 対象範囲
<!-- 【必須】 -->

- src/opencode/skills/agentdev-workflow-case-auto/SKILL.md
- case-auto・case-revise に関係する実行時 Workflow Skill・reference・テンプレートのうち、旧判断境界語（一意に回答、一意確定、新しい意味判断、意味判断が必要、HITL 発動根拠の旧モデル依存）を自律確定境界として使用する箇所
- 判定基準: 各言及を現行契約上の意味で分類し、旧判断境界を意味として使用する箇所のみ変更する。「HITL」という語のうち人間に留保された判断または既存安全境界の操作承認として正当なものは維持する。Design 本文への書き込みを要求する箇所は対象外（AG-002・OU-0003 の責務）

## REQ参照
<!-- 【必須】 -->

REQ-034（REQ-034-032。判断アーキテクチャの正は REQ-096 / DEC-048）

## 提案内容
<!-- 【必須】 -->

- RA-002（case-auto 系部分）: src/opencode の case-auto 関連実行時投影から旧判断境界を、更新後の REQ-034-032・case-auto Design と同一の意味（正規契約からの導出〔REQ-096-003〕、委譲された裁量〔REQ-096-015〕の範囲を自律解決範囲とし、判断の難易度・確信度・評価器間の不一致・結果状態・唯一解でないことを人間判断の発動根拠としない〔REQ-096-004〕、人間に留保された判断〔REQ-096-005〕と既存安全境界の操作承認は既存停止経路に従う、停止理由は REQ-096-012 の8原因分類へ対応）へ同期する
- intent: 正規文書の現在契約を実行時投影へ同一変更で反映し、新旧契約の併存を残さない（AG-001、RU §2.6）
- verification_refs: [TS-001, TS-002]
- source_items: [AG-001]

## 完了条件
<!-- 【必須】 -->

- [ ] src/opencode の case-auto 関連正規文書・配布物において、旧判断境界を意味として使用する残存が 0 件であること（残存語のうち正当な意味〔定義・用語注記・歴史・引用〕として説明できる箇所はその説明を検証記録に残すこと。TS-001 pass_criteria のうち case-auto 系対象）
- [ ] 変更した各節の判断主体・自律確定範囲・人間判断の発動根拠・停止理由の原因分類が REQ-096-003〜006/010/012/015 と矛盾しないこと（TS-002 pass_criteria のうち case-auto Design 対応節）
- [ ] 変更が case-auto・case-revise 系対象ファイルに限定されており、case-ready 系（OU-0002）・case-close 系・design-file-manager 系（OU-0003）の対象変更を含まないこと

## テスト戦略
<!-- 【必須】 -->

- id: TS-001
 target_item: AG-001（case-auto 系対象部分）
 verification: |
  rg '一意に回答|一意確定|新しい意味判断|意味判断が必要' を docs/requirements/、docs/designs/、docs/guides/、src/opencode/ に実行し、残存箇所を列挙する。各残存について REQ-096 自身の定義・用語注記、歴史文書、引用・禁止例示のいずれかに該当するかを判定する。See Also 等の純参照行と retired/ 配下は除外する。本 Issue では case-auto・case-revise 系対象ファイルの残存解消と、全領域の残存列挙（検証記録として保存し OU-0007・OU-0008 の最終同期へ引き継ぐ）を行う。
 pass_criteria: |
  case-auto 系修正対象ファイル（src/opencode 正規文書・配布物）において、旧判断境界を意味として使用する残存が 0 件。残存語のうち正当な意味として説明できる箇所はその説明を検証記録に残していること。
  on_failure: |
  fix-and-reverify。残存箇所を現行語彙へ修正し再検証する。正当理由の判定は AG-001 の基準（HITL 語の維持条件を含む）に従う。
- id: TS-002
 target_item: AG-001（case-auto Design 対応節）
 verification: |
  src/opencode/skills/agentdev-workflow-case-auto/SKILL.md の bounded parent decision resolution・承認/HITL 境界・停止理由分類関連節を、更新後の REQ-034-032 本文および REQ-096-003〜006/010/012/015 と突き合わせる。
 pass_criteria: |
  いずれの節も判断主体、自律確定範囲、人間判断の発動根拠、停止理由の原因分類が REQ-096 と矛盾しないこと。「一意に回答可能」「新しい意味判断が必要なら HITL」等の旧境界で読み取れる記述が残っていないこと。
  on_failure: |
  fix-and-reverify。該当節を REQ-096 語彙へ修正し再検証する。

## Execution Contract
<!-- 【必須】 -->

### 統合先
- main

### 変更対象成果物
- implementation: src/opencode/skills/agentdev-workflow-case-auto/SKILL.md
- implementation: case-auto・case-revise に関係する Workflow Skill・reference・テンプレート（RA-002 ownership_hints のうち case-auto・case-revise 系。検索で検出された分のみ）

### 必須品質統制
- implementation 変更 → Skill 品質査読（構造 lint・Command/Skill 参照妥当性）と targeted docs guard・textlint gate。最終横断検証は親 Epic の TS-008（OU-0008 実施）

### 関連 ADR 拘束条件
- DEC-048 / REQ-096 を判断アーキテクチャの正とする。DEC-008 は歴史的判断記録として参照維持し本文を編集しない（CR-003 解消済み・Definition merge 済み）。DEC-008 frontmatter への相互参照追記は本 Case 対象外・将来 intake（CR-004）

### scope-affecting impact candidate
- docs/designs/foundations/system.md を OU-0002（Wave 1・並列）と共有。system.md の主要編集は Definition PR #3294 で単一実施済みであり、追加修正が生じる場合のみ衝突リスク。重複許容の Wave 1 記録（親 Epic「Wave 重複前置検出」節）に従い、衝突解消担当は後着 merge 側
- TS-001 の検索は docs 全体・src/opencode 全体に及ぶが、修正対象は case-auto・case-revise 系に限定する。横断残存は OU-0002（case-ready 系）・OU-0003（case-close 系）・OU-0008（最終同期）が受け持つ

### 実現面の変更方針（realization_actions 由来）
<!-- 【必須】 -->

- RA-002（case-auto 系部分のみを本 Issue で実施）: concern「case 系 workflow skill・reference の判断境界・見送り記録語彙同期」、responsibility「case-auto・case-revise に関係する実行時 Workflow Skill・reference・テンプレートのうち旧判断境界語を使用する箇所を、更新後の REQ・Design 契約と同一の意味へ同期する。各言及を現行契約上の意味で分類し、Design 本文書き込みを要求する箇所のみ変更する」、ownership_hints（case-auto・case-revise 系）「src/opencode/skills/agentdev-workflow-case-auto/SKILL.md、src/opencode/skills/agentdev-workflow-case-revise/references/handoff-and-update.md」、intent「正規文書の現在契約を実行時投影へ同一変更で反映し、新旧契約の併存を残さない」、verification_refs「TS-001, TS-002」、source_items「AG-001」

### adversarial-review 発動契約（任意）
- 該当なし。ユーザー明示指定なし（Root Case #3293 本文に skip 判定記録済み〔REQ-015-003〕）

## レビュー判断
<!-- 【必須】 -->

本 Issue のレビュー判断は親 Epic Issue #EPIC_SELF の「レビュー判断」セクションを参照すること。

## 補足情報
<!-- 【任意】 -->

- 冪等キー: topic_slug `docs-current-model-alignment-and-compression-foundation` / OU-0001 / Root Case #3293
- work_type: maintenance / scale: standard
- 作業基準版: agent-dev-flow-main-2026-10-01.zip。HEAD が基準より進む場合は既知 finding の現存確認を前置し、解消済み箇所へ古い修正を再適用しない
```
