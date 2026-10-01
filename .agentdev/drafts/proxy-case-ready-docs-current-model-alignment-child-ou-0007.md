# proxy-case-ready payload: Child Issue OU-0007

Title（verbatim）:
OU-0007: 規範重複の限定的縮約（AG-006・RA-006 縮約）

Body（verbatim。`#EPIC_SELF` は Epic Issue の番号へ置換して issue_create する）:

```markdown
Parent: #EPIC_SELF

## 概要
<!-- 【必須】 -->

OU-0007（Wave 5・直列・OU-0003/0006 依存）: AG-001〜AG-005 の意味整合（Wave 1〜4）が成立した後に、今回の是正で直接確認できた同一意味の重複所有を限定的に縮約する（AG-006・RA-006 の縮約部分）。正規所有者を一つに寄せ、他は参照または実行時投影へ変更する。大規模な文書再編を先行させず、この段階で新しい抽象層を追加しない。

## 実行識別情報
<!-- 【必須】 -->

- adf_case: #EPIC_SELF（親 Epic Issue）
- adf_execution_unit: standard
- adf_harness_ref: N/A

## 対象範囲
<!-- 【必須】 -->

- docs/** のうち、Wave 1〜4 の実施で確認された同一意味の重複所有箇所（同一判断境界が REQ・Design・Guide・Skill・実行時 command に独立した規則として重複している箇所、Guide が基準文書の本文を複製している箇所、Design が履歴や採用理由を保持することで Decision・Issue・Report と意味重複している箇所、旧規則検出のためだけの記述や検査が正規記述の単純化によって不要になっている箇所）
- 判定基準: 対象は今回の是正で直接確認できた同一意味の重複所有に限定する。縮約は現在契約の意味を変えない範囲で実施する。意味変更が必要になる場合は本 Case 内で独自決定せず、既存の判断境界に従う（record-in-findings）

## REQ参照
<!-- 【必須】 -->

REQ-001（文書種別責務と正規所有者の一元化。REQ-048 / DEC-027 の統制縮小原則）

## 提案内容
<!-- 【必須】 -->

- RA-006（縮約部分）: AG-006 の判定基準で確認できた同一意味の重複について、正規所有者への一元化・参照化・実行時投影化を実施する。REQ 行追加・Design 新規作成を伴わない範囲に限定する
- intent: 今後の変更で同期すべき規範箇所を減らす（AG-006、RU §2.5）。意味を変えない範囲に限定する
- verification_refs: [TS-007]
- source_items: [AG-006]

## 完了条件
<!-- 【必須】 -->

- [ ] 今回直接確認できた同一意味の重複について正規所有者が 1 つに定まり、他が参照または実行時投影として扱われていること（AC-11。TS-007 pass_criteria）
- [ ] 新しい抽象層・新規統制・新しい恒久文書種別が追加されていないこと
- [ ] 意味変更が必要になった箇所が検出された場合は、本 Case の対象外として既存の判断境界に従い、検証記録へ記録されていること（record-in-findings）

## テスト戦略
<!-- 【必須】 -->

- id: TS-007
 target_item: AG-006
 verification: |
  AG-001〜AG-005 の実施で確認した同一規範の重複所有（同一判断境界・同一保存契約・Guide による本文複製・旧規則検出専用の記述や検査）を列挙し、正規所有者への一元化・参照化・実行時投影化の状態を確認する。
 pass_criteria: |
  今回直接確認できた同一意味の重複について正規所有者が 1 つに定まり、他が参照または実行時投影として扱われていること。新しい抽象層・新規統制・新しい恒久文書種別が追加されていないこと。
  on_failure: |
  意味を変えない範囲の重複解消は fix-and-reverify で実施する。意味変更が必要な場合は record-in-findings とし、本 Case の対象外として既存の判断境界に従う（RU §2.5 の方針）。

## Execution Contract
<!-- 【必須】 -->

### 統合先
- main

### 変更対象成果物
- design: docs/**（AG-006 の判定で確認された重複箇所。実施時にインベントリを確定する）
- guide: docs/guides/**（本文複製の参照化がある場合のみ）

### 必須品質統制
- design・guide 変更 → targeted docs guard・textlint gate。docs-check。最終横断検証は親 Epic の TS-008（OU-0008 実施）

### 関連 ADR 拘束条件
- DEC-001（憲章。統制追加抑制の上位原則）、REQ-048 / DEC-027（統制縮小。整合完了後の限定的統合・削減判断）
- 縮約は現在契約の意味を変えない範囲に限定する。REQ 行追加・Design 新規作成を伴わない

### scope-affecting impact candidate
- 本 Issue は target_design を持たず、対象パスは RA-006 の ownership_hints が所有する（REQ-061-019 の比較対象は検出不能として報告済み）
- Wave 1〜4 で変更されたファイル群と重複し得るが、同一 Wave 内重複ではなく、前 Wave 完了後の rebase 前提で実行する
- 旧規則検出専用の記述・検査の縮約は、検証資産（tests/**・scripts/**）に触れ得る。テスト更新は実現面の変更であり、対象範囲の変更を要求しない限り本 Issue 内で完了させる。範囲拡大が必要な場合は停止し理由を報告する

### 実現面の変更方針（realization_actions 由来）
<!-- 【必須】 -->

- RA-006（縮約部分のみを本 Issue で実施。AUTOGEN 索引再生成は OU-0008）: concern「規範重複の限定的縮約の実行と索引再生成」、responsibility（縮約部分）「AG-006 の判定基準で確認できた同一意味の重複について、正規所有者への一元化・参照化・実行時投影化を実施する」、ownership_hints（縮約部分）「docs/**（AG-006 で確認された重複箇所）」、intent「今後の変更で同期すべき規範箇所を減らす（AG-006、RU §2.5）。意味を変えない範囲に限定する」、verification_refs「TS-007」、source_items「AG-006」

### adversarial-review 発動契約（任意）
- 該当なし。ユーザー明示指定なし（Root Case #3293 本文に skip 判定記録済み〔REQ-015-003〕）

## レビュー判断
<!-- 【必須】 -->

本 Issue のレビュー判断は親 Epic Issue #EPIC_SELF の「レビュー判断」セクションを参照すること。

## 補足情報
<!-- 【任意】 -->

- 冪等キー: topic_slug `docs-current-model-alignment-and-compression-foundation` / OU-0007 / Root Case #3293
- work_type: maintenance / scale: standard
- 作業基準版: agent-dev-flow-main-2026-10-01.zip。HEAD が基準より進む場合は既知 finding の現存確認を前置し、解消済み箇所へ古い修正を再適用しない
- AC-12（accepted Decision と Report の履歴保持）は本 Issue の縮約操作において「現在像への整合を理由として accepted Decision の過去判断内容や既存 Report / 観測事実を書き換えない」ことの確認対象である
```
