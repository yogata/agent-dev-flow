Parent: #3280

<!-- Parent 配置正規形: 子Issue 本文の先頭行に Parent: #N を配置する（agentdev-epic-tracker 親Epic検出、case-open 不変条件と整合）。 -->

## 概要

Wave 1（前置）: RA-004「トレーサビリティ整合と v4 責務分類語彙の移行」を実装する。REQ-003-055/056 から REQ-096 該当行への参照付け替えに伴う traceability sidecar 群・ADF-COVERS 宣言の追随と、docs/designs/skills 配下 33件 skill Design「v4 責務分類」節の語彙一括移行、正典参照（二分法語彙 → DEC-048/新語彙）の更新を担う。OU-001（REQ-096・DEC-048 正典）の実現面に相当。

## 実行識別情報

<!-- 実行識別情報: v4-durable-state-and-recovery Design「ADF 実行識別情報の記録契約」節に基づく構造化識別情報セクション。
機械的解析は本セクション内の adf_ 接頭辞付き key-value 行を正とし、自由文中に偶然出現する ID に依存しない。
識別情報の一部が取得不能な場合は「N/A」と記録し、workflow を停止しない。
本セクションは新規作成 Issue のみに適用し、既存 Issue への遡及適用は行わない -->
- adf_case: #3280
- adf_execution_unit: standard
- adf_harness_ref: N/A

## 対象範囲

- traceability/ 配下の sidecar 群・policy.yaml の REQ-003-055/056 参照の REQ-096 該当行参照化（policy.yaml の 055/056 エントリ2行削除は Definition PR #3279 済み。残存参照の追随が本対象）
- docs/designs/skills/_template.md の「v4 責務分類」3区分書式の新語彙（意味判断担当〔閉じた意味評価・開いた推論を所有〕/決定的処理委譲先/知識提供）への更改
- docs/designs/skills/ 配下の skill Design 33件の「v4 責務分類」節語彙一括移行（写像の正本は v4-responsibility-boundaries Design「v4 責務分類語彙の後継」節。旧 semantic 6項目・deterministic 11項目列挙の正典参照残存を 0件にする）
- docs/designs/foundations/workflow-skill-model.md・v4-runtime-execution-model.md、docs/designs/integrity/rule-ownership.md、docs/designs/README.md、v4-responsibility-boundaries.md の二分法語彙・正典参照の DEC-048/新語彙への更新
- docs/designs/commands/ 配下の REQ-003-055/056・DEC-036(1) 参照ファイルの参照更新（DEC-036 決定(2)(3) 由来の DEC-036 参照は有効維持のため変更しない）

## REQ参照

REQ-096

関連: REQ-003、DEC-048、v4-responsibility-boundaries Design「v4 責務分類語彙の後継」節

## 提案内容

移管・置換後の参照整合を保ち、dangling 参照と旧語彙の正典参照を残さない。語彙移行は機械的に確定した写像表（v4-responsibility-boundaries Design「v4 責務分類語彙の後継」節）に従う一括変更とし、意味判断を新たに導入しない。33件の一括移行は写像の機械適用であり、個別 skill の意味判断を含まない。トレーサビリティ sidecar 更新後は coverage/check を再実行して整合を確認する。

## 完了条件

<!-- 完了条件: Issue完了判定に使用する条件。テスト戦略は「どう検証するか」、完了条件は「何を満たせば完了か」を定義 -->
- [x] traceability/ 配下の REQ-003-055/056 参照が 0件であり、REQ-096 該当行参照へ置換されていること（See Also 等の参照行・履歴記録・移管記録行は対象外）— case-close QG: TS-021 スライス (a) 独立再実行 pass（traceability/ 配下 REQ-003-055/056 残存 0件・PR head 02e905cb 実測）
- [x] docs/designs/skills/_template.md の3区分書式が新語彙（意味判断担当/決定的処理委譲先/知識提供）へ更改されていること — case-close QG: _template.md 含む skills/ 配下旧語彙ラベル（semantic 担当/deterministic 委譲先）残存 0件実測
- [x] docs/designs/skills/ 配下 33件 skill Design の「v4 責務分類」節が新語彙へ移行され、旧列挙（semantic 6項目・deterministic 11項目）の正典参照が 0件であること — case-close QG: TS-021 スライス (b) 独立再実行 pass（skills/ 配下旧列挙正典参照残存 0件）
- [x] workflow-skill-model.md・v4-runtime-execution-model.md・rule-ownership.md・designs/README.md・v4-responsibility-boundaries.md の二分法語彙・正典参照が DEC-048/新語彙へ更新されていること（DEC-036 決定(2)(3) 由来の DEC-036 参照は維持）— case-close QG: 5文書含む検索スコープで旧語彙正典参照残存 0件実測（移管記録行 2箇所は対象外）
- [x] docs/designs/commands/ 配下の REQ-003-055/056・DEC-036(1) 参照が REQ-096/DEC-048 参照へ更新されていること — case-close QG: commands/ 配下 REQ-003-055/056 参照 0件実測（promote系3 Design は Definition PR #3279 で REQ-096 参照化済み。case-auto.md の DEC-036 参照2箇所は責務体制参照で決定(1) 明示引用なし → PR 本文スコープ5の維持判断どおり）
- [x] 自スコープの TS-004・TS-021 検査 pass（TS-021 は自変更対象パスを対象とするスライス実行。全スコープ残存検索は Wave 3 集約と case-close QG-4）— case-close QG: TS-021 (a)(b) 独立再実行 pass・TS-004 は 055 委任正典参照残存 0件（移管記録行2箇所除く）実測＋PR 本文 pass 記録
- [x] 変更は PR として main へ merge 済みであること（完了証拠: Issue closed・PR merged）— case-close: PR #3285 squash merge 済み（main 統合・merge commit は PR #3285 の mergeCommit 参照）

## テスト戦略

<!-- テスト戦略: case-ready が draft-data の test_strategy を各項目の3要素構造（verification/pass_criteria/on_failure）で埋め込む -->
- id: TS-004
  target_item: AG-002（正典判定表の参照整合スライス）
  verification: |
    REQ-096-005 および v4-responsibility-boundaries Design の人間判断への引き上げ条件（完全一覧）を確認し、本 Issue の変更対象ファイルから判定表・引き上げ条件への参照が DEC-048/REQ-096 正典に整合していることを確認する。
  pass_criteria: |
    引き上げ条件の完全一覧への参照が正典（REQ-096 + v4-responsibility-boundaries Design）に整合し、旧 REQ-003-055 委任参照の残存が 0件であること。
  on_failure: |
    fix-and-reverify: 該当参照を正典参照へ修正して再検証する。
- id: TS-021（自スコープスライス）
  target_item: AG-008（本 Issue 変更対象パス分）
  verification: |
    rg により traceability/・docs/designs/skills/・docs/designs/foundations/{workflow-skill-model,v4-runtime-execution-model}.md・docs/designs/integrity/rule-ownership.md・docs/designs/README.md を検索し、(a) REQ-003-055/056 残存参照、(b) 二分法語彙（semantic 6項目・deterministic 11項目の正典参照）の残存を検出する。See Also 等の参照行・廃止・移管記録行・履歴記録は対象外。
  pass_criteria: |
    (a)(b) の残存が自スコープで 0件であること。
  on_failure: |
    fix-and-reverify: 検出残存を新モデル参照へ置換して再検証する。

## Execution Contract

<!-- Execution Contract: REQ-{NNNN} Issue Execution Contract。
case-ready が新規 Issue 作成時に付与する必須セクション。
本セクションの存在有無が presence-based 判定の識別子となる（AG-{NNN}、REQ-{NNNN}-{NNN}）。
case-run は本セクション存在有無で新旧 Issue を識別する -->
### 統合先
- main

### 変更対象成果物
- document: traceability/*.yaml、traceability/policy.yaml（追随分）、docs/designs/skills/_template.md、docs/designs/skills/ 配下 33件、docs/designs/foundations/workflow-skill-model.md、docs/designs/foundations/v4-runtime-execution-model.md、docs/designs/integrity/rule-ownership.md、docs/designs/README.md、docs/designs/commands/ 配下の REQ-003-055/056・DEC-036(1) 参照ファイル、docs/designs/foundations/v4-responsibility-boundaries.md（語彙移行の参照整合分）

### 必須品質統制
- document 変更: 文書品質査読能力（textlint 共通基盤: agentdev-textlint-guard 標準規則 + プロジェクト用語 prh 辞書）
- トレーサビリティ整合: agentdev-traceability coverage/check 再実行（missing-design 増分 0件・policy-invalid 0件）
- UTF-8 健全性: BOM なし・CR なし・U+FFFD なし（Windows 環境は edit ツールまたは node の明示エンコーディング指定を使用。PowerShell 標準 cmdlet・リダイレクト演算子による一括読み書きをしない）

### 関連 ADR 拘束条件
- DEC-048: 部分置換境界 — DEC-036 決定(2)(3) 由来の参照は DEC-036 のまま維持し、決定(1) 由来の参照のみ DEC-048 へ付け替える
- DEC-039: 判断確定と副作用実行の別契約 — commit/push/merge は既存の安全境界（明示パス指定・workflow 契約）に従う

### scope-affecting impact candidate
- 33件 skill Design の語彙移行に伴い、各 Design の ADF-COVERS 宣言・traceability sidecar の REQ 参照が変化し得る → 変更後に agentdev-traceability check を再実行し、missing-design 増分 0件を確認する（ REQ-096 は findings 非包含を維持）
- _template.md 書式更改は新規 skill Design 生成物へ波及する（既存 33件の移行と書式整合を取る）

### 実現面の変更方針（realization_actions 由来）

<!-- 実現面の変更方針: case-ready が draft-data の realization_actions を本セクションへ投影する（実現面投影契約）。
case-run は本セクションを既確定契約として消費し、実現責務・変更意図・検証方針を再決定せず、範囲内の内部実装方針だけを決定する。 -->

- **RA-004**: concern: トレーサビリティ整合と v4 責務分類語彙の移行。responsibility: REQ-003-055/056 から REQ-096 該当行への参照付け替えに伴い、traceability sidecar 群（traceability/*.yaml、policy.yaml の 055/056 エントリを含む）、ADF-COVERS 宣言、docs/designs/commands/ 配下の promote系 Design 以外の参照更新を担う。DEC-036 決定(1) を引用する design 記述は DEC-048 参照へ、(2)(3) 由来の参照は DEC-036 のまま維持する。あわせて v4 責務分類語彙の移行を担う: docs/designs/skills/_template.md の3区分書式（semantic 担当/deterministic 委譲先/知識提供）を新語彙（意味判断担当〔閉じた意味評価・開いた推論を所有〕/決定的処理委譲先/知識提供）へ更改し、33件の skill Design「v4 責務分類」節の語彙を一括移行する（写像の正本は v4-responsibility-boundaries Design「v4 責務分類語彙の後継」節）。workflow-skill-model.md:97、rule-ownership.md:29-31、designs/README.md:182、v4-responsibility-boundaries.md:23、v4-runtime-execution-model.md:80 の二分法語彙・正典参照を新語彙・DEC-048 参照へ更新する。ownership_hints: traceability/、docs/designs/skills/_template.md、docs/designs/skills/ 配下 33件、docs/designs/commands/ 配下の REQ-003-055/056・DEC-036(1) 参照ファイル、docs/designs/foundations/v4-runtime-execution-model.md、docs/designs/foundations/workflow-skill-model.md、docs/designs/integrity/rule-ownership.md、docs/designs/README.md。intent: 移管・置換後の参照整合を保ち、dangling 参照と旧語彙の正典参照を残さない。verification_refs: TS-021（自スコープ）、TS-004。source_items: AG-008, AG-009, AG-010

### adversarial-review 発動契約（任意）
- 該当なし（ユーザー明示指定なし）

## レビュー判断

<!-- レビュー判断: 本 Issue のレビュー判断は親 Epic Issue の「レビュー判断」セクションを参照。
disposition 明細の重複転記は行わない。「該当なし」は使用しない -->
本 Issue のレビュー判断は親 Epic Issue #3280 の「レビュー判断」セクションを参照すること。

## 補足情報

- 対象 Case: #3278（Root Case）。実行構造: Epic #3280 Wave 1（前置・単独）
- 保護対象: .agentdev/jev-observations/**、.local/**、ADF-COVERS 宣言行は変更時に削除しない（参照先更新のみ）
