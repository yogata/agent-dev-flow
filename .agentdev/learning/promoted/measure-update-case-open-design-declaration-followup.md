# case-open の Definition PR 作成に Design ヘッダ宣言追随確認と traceability 機械ゲートを前置する

## 背景

case-open が REQ 行追加（REQ-061-034/035、REQ-021-029）と REQ-057-018 行更新を伴う Definition PR（#2955）を作成した際、対象 Design ヘッダの ADF-COVERS(design) 宣言の追随を行わなかった。case-ready STEP-2 の traceability check で missing-design 4 行が検出され、ready へ遷移せず case-open へ差し戻し（Root Case #2954 停止）となった。差し戻し経路で追修正 Definition PR（#2956）を作成し、3 Design の宣言追随を適用、check.ts で missing-design 0 件を機械確認して復旧した。

## 問題

REQ-021-026 は「Design 保存内部責務は当該 Design ヘッダの既存対応宣言ブロックについて更新要否を確認対象に含める」ことを既に要件として定めているが、case-open の Definition PR 作成手順（STEP-4）からこの確認義務が呼び出されていない。REQ 行追加・更新を伴う Definition で宣言ブロック確認を省略すると、case-ready の traceability check で初めて検出され、Case 単位の差し戻し（停止報告 comment・追修正 PR・再検証）という大きい手戻りが生じる。

## 望ましい変更

既存の確認義務（REQ-021-026）を新規要件化するのではなく、case-open の Definition PR 作成手順から参照強化する:

1. draft artifact_actions が REQ 行の追加・更新を含む場合、変更対象 Design ヘッダの ADF-COVERS 宣言ブロック更新要否確認を Definition PR 作成の完了条件へ組込む
2. 確認の機械化として、REQ 行変更を伴う Definition PR 作成前に traceability check（check.ts）の missing-design 0 件を PR 作成前の機械ゲートとして実行する

## 対象範囲

### 対象

- agentdev-workflow-case-open の STEP-4（Definition PR 作成）手順（references/definition-pr-and-idempotency.md または references/root-case-and-definition-package.md）

### 対象外

- REQ-021-026 の要件文自体の変更（確認義務は既存・不変）
- traceability check の実装（check.ts は既存・稼働中）
- case-ready STEP-2 の検証（検出側は既存・正常動作）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | src/opencode/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md | Definition PR 作成の完了条件に「REQ 行追加・更新を伴う場合の Design ヘッダ宣言ブロック確認（REQ-021-026 相当の義務参照）」と「check.ts missing-design 0 件の PR 作成前機械ゲート」を追記 |
| 配布skill | src/opencode/skills/agentdev-workflow-case-open/references/root-case-and-definition-package.md | Definition Package 生成時の ACT-DESIGN 確認観点に宣言追随要否確認を追記する候補 |
| Design | docs/designs/commands/case-open.md（該当 Design） | 完了条件への機械ゲート言及の候補 |

## 既存対策確認

- **確認結果**: あり
- **該当ファイル**: docs/requirements/REQ-021.md（REQ-021-026）、src/opencode/skills/agentdev-traceability/（check.ts・実行契約）、src/opencode/skills/agentdev-workflow-case-ready/（STEP-2 検出側）
- **ギャップ分類**: application miss / fix gap
- **ギャップ詳細**: 確認義務（REQ-021-026）と検出機構（case-ready の traceability check）は存在するが、case-open の Definition PR 作成手順から義務が呼び出されておらず、PR 作成前の機械ゲートも存在しない（case-open skill 全体を grep 検証し宣言追随・check.ts ゲートの手順記述なしを確認済み）

## 制約

- REQ-021-026 の要件文は変更しない（手順からの参照強化のみ）
- traceability check の実行契約（--root、--req 等）は agentdev-traceability の既存契約に従う
- check 実行は checker 実行契約 Design の安定実行経路に従う（Windows 環境の既知制約あり）

## 受け入れ条件

- [ ] case-open の Definition PR 作成手順に、REQ 行追加・更新を伴う場合の Design ヘッダ宣言ブロック更新要否確認が完了条件として記載されていること
- [ ] REQ 行変更を伴う Definition PR 作成前の check.ts missing-design 0 件機械ゲートが手順に記載されていること
- [ ] 「行更新と直結する Design の design 宣言不在」（REQ-057-018 事例型）も同確認で検出可能であることが手順の説明に含まれること

## 元learning item / 根拠

- **要約**: REQ 行追加を伴う Definition PR で Design ヘッダの ADF-COVERS 宣言追随を確認しなかった結果、case-ready の traceability check で missing-design 4 行が検出され Case 差し戻しとなった。宣言追随確認と check.ts 機械ゲートを PR 作成前に前置すべき
- **根拠**: Case #2954（2026-09-18）。Definition PR #2955 で宣言追随 omission → case-ready 差し戻し → 追修正 PR #2956 で 3 Design の宣言追随（case-ready.md / req-define.md の宣言行追記、checker-execution-contracts.md へ ADF-COVERS(design): REQ-057-018 新設）→ check.ts で missing-design 0 件確認
- **再発条件**: REQ 行の追加・更新を伴う Definition 変更で、該当 Design の宣言ブロック確認を省略した場合
- **横展開可能性**: REQ 行変更を伴う Case は常態的に発生する。確認と機械ゲートの前置はすべての当該 Case で差し戻しコストを削減する

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: workflow, verification
- **関連Issue**: Case #2954、PR #2955、PR #2956、issuecomment-5723763427
