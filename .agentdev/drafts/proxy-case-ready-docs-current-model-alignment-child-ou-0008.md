# proxy-case-ready payload: Child Issue OU-0008

Title（verbatim）:
OU-0008: 実装投影・検証の最終同期と最終横断検証（AG-007・RA-003）

Body（verbatim。`#EPIC_SELF` は Epic Issue の番号へ置換して issue_create する）:

```markdown
Parent: #EPIC_SELF

## 概要
<!-- 【必須】 -->

OU-0008（Wave 6・直列・OU-0007 依存・最終 Wave）: 文書修正だけで終了せず、現行実装が新しい現在契約と一致することを確認し、検証資産と AUTOGEN 索引を同期した上で、最終横断検証（TS-008・TS-009）を実行する（AG-007・RA-003・RA-006 の索引再生成部分）。代表ケース（RU §6 作業8 の表）について期待結果と実装の一致を確認する。

## 実行識別情報
<!-- 【必須】 -->

- adf_case: #EPIC_SELF（親 Epic Issue）
- adf_execution_unit: standard
- adf_harness_ref: N/A

## 対象範囲
<!-- 【必須】 -->

- src/opencode/skills/** のうち、OU-0001〜0003 で同期済みの実行時投影の最終確認（残存の横断検索。新規検出分の同期）
- 検証資産: tests/**（docs-check checker・textlint guard・targeted docs guard の期待値）、traceability/ の対応宣言（REQ-096、REQ-001、REQ-032、REQ-034、REQ-061 関連）
- AUTOGEN 索引対象 README 群（差分が必要な場合のみ既存生成器で再生成。手編集しない）
- 判定基準: 機械検索で「一意」「HITL」「v3」「由来」等の一致をゼロ件にすることを目的とせず、残存箇所ごとに現在契約として必要な意味であることを説明できる状態を完了条件とする

## REQ参照
<!-- 【必須】 -->

REQ-034、REQ-061、REQ-032（対象要件行の実現整合。判断アーキテクチャの正は REQ-096 / DEC-048、文書種別責務の正は REQ-001）

## 提案内容
<!-- 【必須】 -->

- RA-003: REQ-096 の判断境界を検証する既存テスト、対応宣言、整合性検査について、更新後の契約と一致するよう期待値と対象を更新する。Design 履歴混入を生成する処理・テンプレート・テスト（存在する場合）を特定して除去または履歴チャネル期待へ更新する
- RA-006（索引再生成部分）: REQ 行追加・Design 新規作成を伴わない AUTOGEN 索引差分は既存生成器で再生成する
- 最終横断検証（TS-008）: (1) /repo/docs-check、(2) /agentdev/inspect-docs による意味整合、(3) 変更ファイルへの targeted docs guard、(4) 影響範囲検出に基づく既存試験、(5) REQ-096 / REQ-001 / REQ-032 / REQ-034 / REQ-061 の対応宣言（ADF-COVERS）確認、(6) AUTOGEN 索引再生成（差分が必要な場合のみ）、(7) textlint 共通基盤検査
- 代表ケース検証（TS-009）: RU 作業8 の代表ケース表（複数実装案の委譲裁量選択、decision context の導出可能性による case-auto 解決、唯一解でない委譲裁量内選択、テスト失敗の修正再検証ループ、証拠不足の証拠再取得、運用前提不足の区別、新規決定の人間判断移送、判断確定と副作用実行承認の分離、draft Design の accepted 昇格）について期待結果を確認する
- intent: 正規文書の現在契約を実行時投影・検証へ同一変更で反映し、最終横断検証を成立させる（AG-007、RU §2.6・§6 作業8/9）
- verification_refs: [TS-008, TS-009]
- source_items: [AG-007]

## 完了条件
<!-- 【必須】 -->

- [ ] docs-check、targeted docs guard、textlint の必要項目が合格していること（AC-14）
- [ ] inspect-docs の検出のうち今回変更起因の未解決が 0 件であること
- [ ] 影響対象試験が合格していること
- [ ] 対応宣言（ADF-COVERS）が更新後の要件行と整合していること
- [ ] AUTOGEN 索引が手編集されていないこと（差分が必要な場合のみ既存生成器で再生成されていること）
- [ ] 既知の基準外警告が残る場合は今回変更起因か既存かが区別され、今回変更起因の未解決 NG が 0 件であること
- [ ] 各代表ケース（TS-009）について期待結果と一致する Design 記述と実行時投影が存在し、確認できる形で実装されていること（AC-13）。特に draft Design の accepted 昇格について、Design 本文へ作業履歴・評価記録を追加せず状態を更新し、評価証跡が既存履歴チャネルに残ること

## テスト戦略
<!-- 【必須】 -->

- id: TS-008
 target_item: AG-007
 verification: |
  最終横断検証として (1) /repo/docs-check を実行する、(2) /agentdev/inspect-docs で意味整合を確認する、(3) 変更ファイルに対して targeted docs guard を実行する、(4) 影響範囲検出に基づき必要な既存試験を実行する、(5) REQ-096、REQ-001、REQ-032、REQ-034、REQ-061 の対応宣言（ADF-COVERS）を確認する、(6) AUTOGEN 索引に差分が必要な場合のみ既存生成器で再生成する、(7) textlint 共通基盤が要求する検査を実行する。
 pass_criteria: |
  docs-check、targeted docs guard、textlint の必要項目が合格していること。inspect-docs の検出のうち今回変更起因の未解決が 0 件であること。影響対象試験が合格していること。対応宣言が更新後の要件行と整合していること。索引が手編集されていないこと。既知の基準外警告が残る場合は今回変更起因か既存かが区別され、今回変更起因の未解決 NG が 0 件であること。
  on_failure: |
  fix-and-reverify。今回変更起因の NG は修正して再検証する。既存起因の警告は out-of-scope として Findings に記録する（record-in-findings）。
- id: TS-009
 target_item: AG-007
 verification: |
  代表ケース検証。RU 作業8 の代表ケース表について、該当する Design 記述・実行時投影・既存テストを確認する。
 pass_criteria: |
  各代表ケースについて期待結果（RU 作業8 表の期待結果列）と一致する Design 記述と実行時投影が存在し、確認できる形で実装されていること。特に draft Design の accepted 昇格について、Design 本文へ作業履歴・評価記録を追加せず状態を更新し、評価証跡が既存履歴チャネルに残ること。
  on_failure: |
  fix-and-reverify。該当箇所を現在契約へ修正し再検証する。

## Execution Contract
<!-- 【必須】 -->

### 統合先
- main

### 変更対象成果物
- implementation: src/opencode/skills/**（残存検出分のみ。OU-0001〜0003 で同期済み分の再変更を含まない）
- tests: tests/**（docs-check checker、textlint guard、targeted docs guard の期待値。影響検出された分のみ）
- traceability: traceability/ の対応宣言（REQ-096、REQ-001、REQ-032、REQ-034、REQ-061 関連。更新後の要件行と不整合がある場合のみ）
- design: AUTOGEN 索引対象 README 群（既存生成器による再生成のみ）

### 必須品質統制
- 本 Issue 自体が最終横断検証（TS-008）を完了条件として実行する。docs-check 全体・inspect-docs・textlint gate・影響試験の結果を本 Issue の検証記録として残す

### 関連 ADR 拘束条件
- DEC-048 / REQ-096 を判断アーキテクチャの正とする。検証資産の更新は旧契約のまま残存することによる偽陽性・偽陰性を防止する目的に限定される
- AUTOGEN 索引は手編集しない（既存生成器のみ）。REQ 行追加・Design 新規作成は行わない

### scope-affecting impact candidate
- 本 Issue は最終 Wave であり、全 OU の変更成果に対する横断検証を担う。他 OU の対象ファイルへの変更は残存解消・期待値更新・索引再生成に限定される
- inspect-docs の検出は実行時点の docs 状態に依存する。今回変更起因と既存起因の区別を検証記録に残す

### 実現面の変更方針（realization_actions 由来）
<!-- 【必須】 -->

- RA-003: concern「検証資産の同期（REQ-096 判断境界検証と履歴混入生成の除去）」、responsibility「REQ-096 の判断境界を検証する既存テスト、対応宣言、整合性検査について、更新後の契約と一致するよう期待値と対象を更新する。Design 履歴混入を生成する処理・テンプレート・テスト（存在する場合）を特定して除去または履歴チャネル期待へ更新する」、ownership_hints「tests/**（docs-check checker、textlint guard、targeted docs guard の期待値を含む）、src/plugins/ 配下の検査資産（該当時）、traceability/ の対応宣言（REQ-096、REQ-001、REQ-032、REQ-034、REQ-061 関連）」、intent「検証資産が旧契約のまま残存することによる偽陽性・偽陰性を防止し、最終横断検証（TS-008）を成立させる（AG-007）」、verification_refs「TS-008, TS-009」、source_items「AG-007」
- RA-006（索引再生成部分のみを本 Issue で実施）: REQ 行追加・Design 新規作成を伴わない AUTOGEN 索引差分は既存生成器で再生成する。ownership_hints「AUTOGEN 索引対象 README 群」

### adversarial-review 発動契約（任意）
- 該当なし。ユーザー明示指定なし（Root Case #3293 本文に skip 判定記録済み〔REQ-015-003〕）

## レビュー判断
<!-- 【必須】 -->

本 Issue のレビュー判断は親 Epic Issue #EPIC_SELF の「レビュー判断」セクションを参照すること。

## 補足情報
<!-- 【任意】 -->

- 冪等キー: topic_slug `docs-current-model-alignment-and-compression-foundation` / OU-0008 / Root Case #3293
- work_type: maintenance / scale: standard
- 作業基準版: agent-dev-flow-main-2026-10-01.zip。HEAD が基準より進む場合は既知 finding の現存確認を前置し、解消済み箇所へ古い修正を再適用しない
- Epic 完了条件（AC-01〜AC-15 の最終確認）は本 Issue の検証記録を根拠として親 Epic Issue で判定する
```
