# proxy-case-ready payload: Child Issue OU-0006

Title（verbatim）:
OU-0006: 入口文書の現在像統合（AG-005・RA-004）

Body（verbatim。`#EPIC_SELF` は Epic Issue の番号へ置換して issue_create する）:

```markdown
Parent: #EPIC_SELF

## 概要
<!-- 【必須】 -->

OU-0006（Wave 4・直列・OU-0001/0002/0005 依存）: docs/README.md、docs/guides/README.md、docs/guides/charter.md、docs/guides/project-docs-and-specs.md を、現在の正規文書への導線として補正し、入口から現在第4世代の現在像へ到達できるようにする（AG-005・RA-004）。REQ・Design の現行化（Wave 1）と移行文書の現在責務分離（Wave 3）の完了を前提とし、現行化後の現在像への導線を成立させる。Guide に規範本文を複製しない。

## 実行識別情報
<!-- 【必須】 -->

- adf_case: #EPIC_SELF（親 Epic Issue）
- adf_execution_unit: standard
- adf_harness_ref: N/A

## 対象範囲
<!-- 【必須】 -->

- docs/README.md
- docs/guides/README.md
- docs/guides/charter.md
- docs/guides/project-docs-and-specs.md
- 判定基準: 目的は規範の再記述ではなく、現在の読み順を成立させることである。利用者が入口から (1) 憲章と責務境界、(2) 第4世代の三層責務と標準運用モデル、(3) Project Contract の論理ビューと再構成方法、(4) 標準入口 req-define / backlog-auto と標準実行 case-auto、(5) 判断方法と確定権限の分離と人間判断境界、(6) REQ / Decision / Design / Knowledge / Report / Guide の文書責務、へ到達できるようにする

## REQ参照
<!-- 【必須】 -->

REQ-001（REQ-001-005 / REQ-001-006。Guide は正規文書への導線と読み方を提供し規範本文を複製しない）

## 提案内容
<!-- 【必須】 -->

- RA-004: 入口 4 文書を編集し、AG-005 の (1)〜(6) の導線を成立させる。規範本文の複製は行わず、正規文書へのリンクと読み方を提供する。実測（HEAD 8c471d3e）で guides 3 文件は三層責務・Project Contract・REQ-088・v4-operating-model・判断権限モデル・REQ-096・DEC-048 のアンカーをすべて欠いており、docs/README.md は判断権限モデルへの明示導線を欠く。project-docs-and-specs.md の REQ → Decision → Design の説明は文書関係の説明として維持しつつ、それだけが Project Contract 全体ではないことを明示し、REQ-088 と v4 Operating Model の論理ビューへ案内する
- intent: 新しいセッション・別のモデル・別の実行環境から入口経由で現在像（三層責務、Project Contract、判断権限モデル、文書責務）へ到達できるようにする（AG-005、RU §2.4）
- verification_refs: [TS-006]
- source_items: [AG-005]

## 完了条件
<!-- 【必須】 -->

- [ ] 入口 4 文書から AG-005 の (1)〜(6) へ到達できること（リンク切れ 0 件。TS-006 pass_criteria）
- [ ] project-docs-and-specs.md が REQ → Decision → Design だけが Project Contract 全体ではないことを明示し、REQ-088 と v4 Operating Model へ案内していること（AC-10）
- [ ] Guide が基準文書の規範本文を複製していないこと（REQ-001-005/006。AC-09）
- [ ] 変更が入口 4 文書に限定されていること

## テスト戦略
<!-- 【必須】 -->

- id: TS-006
 target_item: AG-005
 verification: |
  docs/README.md、docs/guides/README.md、docs/guides/charter.md、docs/guides/project-docs-and-specs.md の導線リンクをすべて辿り、AG-005 の (1)〜(6) の到達先（憲章、三層責務、Project Contract、標準入口、REQ-096/DEC-048、文書種別責務）が実在することを確認する。Guide 本文と基準文書本文の対照により規範本文の複製有無を確認する。
 pass_criteria: |
  入口から AG-005 の (1)〜(6) へ到達できること（リンク切れ 0 件）。project-docs-and-specs.md が REQ → Decision → Design だけが Project Contract 全体ではないことを明示し REQ-088 と v4 Operating Model へ案内していること。Guide が基準文書の規範本文を複製していないこと（REQ-001-005/006）。
  on_failure: |
  fix-and-reverify。導線と説明を修正し再検証する。

## Execution Contract
<!-- 【必須】 -->

### 統合先
- main

### 変更対象成果物
- guide: docs/README.md
- guide: docs/guides/README.md
- guide: docs/guides/charter.md
- guide: docs/guides/project-docs-and-specs.md

### 必須品質統制
- guide 変更 → docs-check（targeted docs guard・textlint gate）。docs-check の guides 関連検査。最終横断検証は親 Epic の TS-008（OU-0008 実施）

### 関連 ADR 拘束条件
- REQ-088（第4世代基盤・三層責務・Project Contract）、DEC-031・DEC-032・DEC-033（公開運用モデル）、REQ-096 / DEC-048（判断アーキテクチャ）、REQ-001（文書種別責務）を導線の到達先とする。Guide はこれらへの導線と読み方のみを提供する
- Guide に規範本文を複製しない（REQ-001-005 / REQ-001-006）

### scope-affecting impact candidate
- 本 Issue は target_design を持たず、対象パスは RA-004 の ownership_hints が所有する（REQ-061-019 の比較対象は検出不能として報告済み。親 Epic「Wave 重複前置検出」節）
- 他の OU（OU-0001〜0005・0007・0008）は本 Issue の対象 4 文書に触れないため Wave 内重複は発生しない。docs/README.md の配布索引行（コマンド索引）に変更がある場合は AUTOGEN 索引の整合を docs-check で確認する（再生成は OU-0008 が統括）

### 実現面の変更方針（realization_actions 由来）
<!-- 【必須】 -->

- RA-004: concern「入口文書（Guide/README）の現在像への統合編集」、responsibility「docs/README.md、docs/guides/README.md、docs/guides/charter.md、docs/guides/project-docs-and-specs.md を編集し、AG-005 の (1)〜(6) の導線を成立させる。規範本文の複製は行わず、正規文書へのリンクと読み方を提供する」、ownership_hints「docs/README.md、docs/guides/README.md、docs/guides/charter.md、docs/guides/project-docs-and-specs.md」、intent「新しいセッション・別のモデル・別の実行環境から入口経由で現在像（三層責務、Project Contract、判断権限モデル、文書責務）へ到達できるようにする（AG-005、RU §2.4）」、verification_refs「TS-006」、source_items「AG-005」

### adversarial-review 発動契約（任意）
- 該当なし。ユーザー明示指定なし（Root Case #3293 本文に skip 判定記録済み〔REQ-015-003〕）

## レビュー判断
<!-- 【必須】 -->

本 Issue のレビュー判断は親 Epic Issue #EPIC_SELF の「レビュー判断」セクションを参照すること。

## 補足情報
<!-- 【任意】 -->

- 冪等キー: topic_slug `docs-current-model-alignment-and-compression-foundation` / OU-0006 / Root Case #3293
- work_type: maintenance / scale: standard
- 作業基準版: agent-dev-flow-main-2026-10-01.zip。HEAD が基準より進む場合は既知 finding の現存確認を前置し、解消済み箇所へ古い修正を再適用しない
```
