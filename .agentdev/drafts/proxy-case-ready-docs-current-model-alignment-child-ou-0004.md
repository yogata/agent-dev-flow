# proxy-case-ready payload: Child Issue OU-0004

Title（verbatim）:
OU-0004: docs/designs/** 現在形純化スイープ（AG-003・RA-005）

Body（verbatim。`#EPIC_SELF` は Epic Issue の番号へ置換して issue_create する）:

```markdown
Parent: #EPIC_SELF

## 概要
<!-- 【必須】 -->

OU-0004（Wave 2・直列・OU-0003 依存）: docs/designs/** を横断して現在設計ではない内容（履歴・移行経緯・作業実績）を除去または正規所有先へ移し、現在契約を読むだけで現行動作を解釈できる状態にする（AG-003・RA-005）。OU-0003 の Design 履歴再生成防止契約是正（実行時投影）の完了を前提とし、その後に純化を実行する（履歴再生成経路を遮断してから掃除する順序依存）。Definition 面（docs/designs 7件の該当節）は Definition PR #3294 として merge 済みであり、本 Issue は 7件対象外の横断純化を扱う。

## 実行識別情報
<!-- 【必須】 -->

- adf_case: #EPIC_SELF（親 Epic Issue）
- adf_execution_unit: standard
- adf_harness_ref: N/A

## 対象範囲
<!-- 【必須】 -->

- docs/designs/** 全体（履歴候補表現を持つ 15 ファイル候補〔HEAD 8c471d3e 実測〕。`## 対応記録` 見出しを持つ docs/designs/commands/case-ready.md、docs/designs/commands/case-revise.md の 2 ファイルを含む）
- 除去対象: 第4世代再編時の権威移行条件、完了済み移行前提（「移行段階までは第3世代を正とする」等）、後続段階で置換するという将来予定、旧 Design からの吸収履歴、採用・昇格時の対応記録、Case/PR/RU 等の作業実績の根拠保存、現在動作の理解に不要な「由来」注記
- 判定基準: 全件を機械的削除対象とせず、各記述について現在動作を成立させる契約か、過去経緯・作業履歴かを AG-003 の基準で判定する。履歴文中にのみ存在する現行契約は現在形へ再記述してから履歴部分を除去する。処遇未完了エントリ（crosswalk の living tracking 対象）は処遇記録として保持し削除しない

## REQ参照
<!-- 【必須】 -->

REQ-001（REQ-001-003 / REQ-001-014 / REQ-001-015。Design は現在設計のみを保持する）

## 提案内容
<!-- 【必須】 -->

- RA-005: AG-003 の判定基準に従い、docs/designs/** の履歴候補表現を分類・除去・現在形再記述する。インベントリ結果を検証記録として残す。HEAD が作業基準版から進んでいる場合は既知 finding の現存確認を前置する。Design 本体に実在する見送り記録（再評価契機を持つもの）は、対応記録コメントへの移設を除去に先立ち実施する
- intent: 現行 Design を現在設計のみへ純化し、現在契約を読むだけで現行動作を解釈できる状態にする（AG-003、RU §2.2）。AG-002 の再生成防止契約是正（OU-0003）の後に実施する
- verification_refs: [TS-004]
- source_items: [AG-003]

## 完了条件
<!-- 【必須】 -->

- [ ] 過去経緯・作業履歴と判定された記述が現行 Design 本文から除去済みであること（ゼロ件化ではなく、残存各箇所が現在契約に必要な意味として説明可能であること。TS-004 pass_criteria）
- [ ] 履歴文中にのみ存在した現行契約が現在形の節へ再記述されていること
- [ ] docs/designs/commands/case-ready.md と case-revise.md の `## 対応記録` 見出しが除去されていること
- [ ] 除去対象の記録が Git 履歴・追跡Issue・PR・コメント等の既存履歴手段から復元可能であること
- [ ] Design 本体に実在した見送り記録（再評価契機を持つもの）が当該 Case の Issue への対応記録コメントへ移設済みであること（該当がある場合）

## テスト戦略
<!-- 【必須】 -->

- id: TS-004
 target_item: AG-003
 verification: |
  rg '対応記録|v3 からの吸収|v3 由来|処遇の正本|移行段階|権威移行|再編工程|由来' を docs/designs/ に実行し、残存箇所を列挙する。各残存について、現在動作を成立させる契約か、過去経緯・作業履歴かを AG-003 の基準で分類する。履歴文中にのみ存在する現行契約の有無を確認し、現在形再記述の要否を判定する。`## 対応記録` 見出し（case-ready.md、case-revise.md）の除去後状態を確認する。
 pass_criteria: |
  過去経緯・作業履歴と判定された記述が現行 Design 本文から除去済みであること（残存各箇所が現在契約に必要な意味として説明可能であること）。履歴文中にのみ存在した現行契約が現在形の節へ再記述されていること。除去対象の記録が既存履歴手段から復元可能であること。Design 本体に実在した見送り記録（再評価契機を持つもの）は当該 Case の Issue への対応記録コメントへ移設済みであること。
  on_failure: |
  fix-and-reverify。判定基準（AG-003）に従って除去・再記述し再検証する。意味の判定が困難な箇所は保存し、検証記録に箇所と理由を残す。

## Execution Contract
<!-- 【必須】 -->

### 統合先
- main

### 変更対象成果物
- design: docs/designs/**（履歴候補表現を持つ 15 ファイル候補。`## 対応記録` 見出し 2 ファイルを含む。インベントリ確定時に TS-004 の検索パターンで対象集合を確定する）

### 必須品質統制
- design 変更 → targeted docs guard・textlint gate。docs-check の Design 関連検査。最終横断検証は親 Epic の TS-008（OU-0008 実施）

### 関連 ADR 拘束条件
- REQ-001-003 / REQ-001-014 / REQ-001-015 を基準とする（Design から作業履歴・移行経緯・監査結果を除外）。記録の消失ではなく、既存履歴手段からの復元可能性を確認する
- crosswalk の処遇未完了エントリ（living tracking の対象）は処遇記録として保持し、削除対象にしない（AG-004・ACT-DESIGN-006 と整合）

### scope-affecting impact candidate
- docs/designs/commands/case-ready.md は OU-0002（Wave 1）とファイル重複の可能性があるが、OU-0002 は Wave 1・本 Issue は Wave 2 であり同一 Wave 内重複ではない。Wave 1 → Wave 2 の順序で構造的に回避され、本 Issue は rebase 前提で case-ready.md を編集する（衝突解消担当は本 Issue・後着側）
- 純化は docs/designs/** の幅広いファイルに触れるため、docs-check（check_integrity・AUTOGEN 関連）の検出が増え得る。今回変更起因の NG は本 Issue で解消し、既存起因の警告は out-of-scope として記録する

### 実現面の変更方針（realization_actions 由来）
<!-- 【必須】 -->

- RA-005: concern「docs/designs/** 横断の現在形純化スイープの実行」、responsibility「AG-003 の判定基準に従い、docs/designs/** の履歴候補表現（実測 15 ファイル候補、`## 対応記録` 見出し 2 ファイル）を分類・除去・現在形再記述する。インベントリ結果を検証記録として残す。HEAD が作業基準版から進んでいる場合は既知 finding の現存確認を前置する。Design 本体に実在する見送り記録（再評価契機を持つもの）は、対応記録コメントへの移設を除去に先立ち実施する」、ownership_hints「docs/designs/**（履歴候補表現を持つ 15 ファイル候補。`## 対応記録` 見出し: docs/designs/commands/case-ready.md、docs/designs/commands/case-revise.md）」、intent「現行 Design を現在設計のみへ純化し、現在契約を読むだけで現行動作を解釈できる状態にする（AG-003、RU §2.2）。AG-002 の再生成防止契約是正（OU-0003）の後に実施する」、verification_refs「TS-004」、source_items「AG-003」

### adversarial-review 発動契約（任意）
- 該当なし。ユーザー明示指定なし（Root Case #3293 本文に skip 判定記録済み〔REQ-015-003〕）

## レビュー判断
<!-- 【必須】 -->

本 Issue のレビュー判断は親 Epic Issue #EPIC_SELF の「レビュー判断」セクションを参照すること。

## 補足情報
<!-- 【任意】 -->

- 冪等キー: topic_slug `docs-current-model-alignment-and-compression-foundation` / OU-0004 / Root Case #3293
- work_type: maintenance / scale: standard
- 作業基準版: agent-dev-flow-main-2026-10-01.zip。HEAD が基準より進む場合は既知 finding の現存確認を前置し、解消済み箇所へ古い修正を再適用しない（本 Issue の前置条件。RD-003 のインベントリ実測基準と併せて実施）
```
