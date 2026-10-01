# proxy-case-ready payload: Child Issue OU-0005

Title（verbatim）:
OU-0005: 移行文書の現在責務分離の実現面フォロー（AG-004）

Body（verbatim。`#EPIC_SELF` は Epic Issue の番号へ置換して issue_create する）:

```markdown
Parent: #EPIC_SELF

## 概要
<!-- 【必須】 -->

OU-0005（Wave 3・直列・OU-0004 依存）: v3→v4 移行文書（docs/designs/foundations/v3-v4-crosswalk.md、docs/designs/foundations/v4-migration-and-release.md）について、OU-0004 の純化後の状態で AG-004 の pass_criteria（現在サポートする移行機能の現在形保持・本体再編履歴の除去・「現在の正本」参照の付け替え完了・処遇未完了エントリの保持）を確認し、純化で残った移行文書関連の実現面残存を解消する（AG-004）。Definition 面（両 Design の現在責務定義・履歴分離）は Definition PR #3294 として merge 済みであり、本 Issue は実現面の確認・残存解消を扱う。

## 実行識別情報
<!-- 【必須】 -->

- adf_case: #EPIC_SELF（親 Epic Issue）
- adf_execution_unit: standard
- adf_harness_ref: N/A

## 対象範囲
<!-- 【必須】 -->

- docs/designs/foundations/v3-v4-crosswalk.md（references/crosswalk-inventory.md の参照関係を含む）
- docs/designs/foundations/v4-migration-and-release.md
- docs/designs/** 内の crosswalk・v4-migration-and-release への参照箇所（「現在の正本」としての参照の付け替え確認）
- 判定基準: 現在も利用者へ提供する v3→v4 移行支援機能の契約（3列 schema、処遇実行原則〔living tracking〕、段階割当規則、非破壊移行原則、RC tag 運用、rollback anchor）と、本体再編履歴（段階番号、Sequence、当時の処遇一覧、自己適用経緯）を分類する。処遇未完了エントリは処遇記録として保持する

## REQ参照
<!-- 【必須】 -->

REQ-001（REQ-001-014 / REQ-001-015。移行アーキテクチャの原則の正は DEC-034）

## 提案内容
<!-- 【必須】 -->

- TS-005 の検証を実行し、OU-0004 純化後の両 Design について pass_criteria を確認する。残存が検出された場合は fix-and-reverify で解消する
- rg で docs/designs/ 内の crosswalk・v4-migration-and-release への参照を列挙し、「現在の正本」として参照する箇所が 0 件（付け替え済み）であることを確認する。付け替えが必要な箇所が検出された場合は現在の正規所有者へ付け替える
- intent: 現在サポートする移行機能の入力・前提・出力・安全境界・再実行性・切替条件が現在形で保持され、本体再編履歴が本文から除去された状態を成立させる（AG-004、RU §2.3）
- verification_refs: [TS-005]
- source_items: [AG-004]

## 完了条件
<!-- 【必須】 -->

- [ ] 現在サポートする移行機能の入力・前提・出力・安全境界・再実行性・切替条件が現在形で保持されていること（TS-005 pass_criteria）
- [ ] 本体再編時の段階番号・Sequence・当時の処遇一覧・自己適用経緯が両 Design 本文から除去されていること
- [ ] 現行契約の正規所有を crosswalk に求める「現在の正本」参照が 0 件（付け替え済み）であること
- [ ] 処遇未完了エントリ（living tracking 対象）が保持されており、処遇記録としての参照が維持されていること

## テスト戦略
<!-- 【必須】 -->

- id: TS-005
 target_item: AG-004
 verification: |
  v3-v4-crosswalk.md と v4-migration-and-release.md の全節を確認し、現在提供する移行機能の契約（3列 schema、処遇実行原則、段階割当、非破壊移行原則、RC tag 運用、rollback anchor）と本体再編履歴（段階番号、Sequence、当時の処遇一覧、自己適用経緯）を分類する。rg で docs/designs/ 内の crosswalk・v4-migration-and-release への参照を列挙し、「現在の正本」として参照する箇所を確認する。
 pass_criteria: |
  現在サポートする移行機能の入力・前提・出力・安全境界・再実行性・切替条件が現在形で保持されていること。本体再編時の段階番号・Sequence・当時の処遇一覧・自己適用経緯が本文から除去されていること。現行契約の正規所有を crosswalk に求める「現在の正本」参照が 0 件（付け替え済み）であること。処遇未完了エントリ（living tracking 対象）が保持されており、処遇記録としての参照が維持されていること。
  on_failure: |
  fix-and-reverify。現在責務と履歴を分離し再検証する。

## Execution Contract
<!-- 【必須】 -->

### 統合先
- main

### 変更対象成果物
- design: docs/designs/foundations/v3-v4-crosswalk.md、docs/designs/foundations/v4-migration-and-release.md（残存解消がある場合のみ。確認のみで完了する場合は no-op）
- design: docs/designs/** 内の「現在の正本」参照の付け替え先（検出された場合のみ）

### 必須品質統制
- design 変更 → targeted docs guard・textlint gate。最終横断検証は親 Epic の TS-008（OU-0008 実施）

### 関連 ADR 拘束条件
- DEC-034 が所有する移行アーキテクチャの原則（非破壊移行原則、RC cutover、pilot migration、v3-baseline と rollback anchor）を維持する（ACT-DESIGN-007・Definition merge 済み）
- crosswalk の処遇未完了エントリ（living tracking の対象）は処遇記録として保持し、削除対象にしない（AG-004）

### scope-affecting impact candidate
- 本 Issue は OU-0004（Wave 2）の純化に後続し、同一ファイル群（crosswalk・migration）を再編する。OU-0004 が純化で同ファイルの履歴除去を済ませている前提で実行するため、変更は確認と残存解消に限定される
- 「現在の正本」参照の付け替えは docs/designs/** 内の他 Design に触れ得る。付け替えは参照の付け替えのみであり、参照先 Design の意味変更を行わない

### 実現面の変更方針（realization_actions 由来）
<!-- 【必須】 -->

- RA-006（縮約の前置確認としての重複確認を除く）に相当する専用 RA は合意済み RA 一覧に存在しない（OU-0005 の実現面は Definition 面 merge 済み分の確認・残存解消であり、RA 一覧の横断検証（TS-005）と TS-008（OU-0008）に接続する）。本 Issue は TS-005 の実行と残存解消を責務とする
- concern「移行文書の現在責務分離の実現面フォロー」、intent「現在サポートする移行機能が現在形で保持される状態を成立させる」、verification_refs「TS-005」、source_items「AG-004」

### adversarial-review 発動契約（任意）
- 該当なし。ユーザー明示指定なし（Root Case #3293 本文に skip 判定記録済み〔REQ-015-003〕）

## レビュー判断
<!-- 【必須】 -->

本 Issue のレビュー判断は親 Epic Issue #EPIC_SELF の「レビュー判断」セクションを参照すること。

## 補足情報
<!-- 【任意】 -->

- 冪等キー: topic_slug `docs-current-model-alignment-and-compression-foundation` / OU-0005 / Root Case #3293
- work_type: maintenance / scale: standard
- 作業基準版: agent-dev-flow-main-2026-10-01.zip。HEAD が基準より進む場合は既知 finding の現存確認を前置し、解消済み箇所へ古い修正を再適用しない
```
