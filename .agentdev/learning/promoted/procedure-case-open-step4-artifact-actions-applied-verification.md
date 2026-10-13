# case-open STEP-4 受入検査への Design 追記の適用後突合追加

## 背景

Case #3642 / PR #3643 の case-open STEP-4 で、artifact_actions（ACT-DESIGN-001〜004）の Design 追記が節見出し行のみ適用され、合意済み本文段落 7 段落が PR 差分に存在しなかった。PR 本文の検証欄は「artifact_actions の合意済み content を verbatim で適用した」と記載しており、適用実態と検証記録が不一致だった。case-ready の忠実性機械検査（draft の ACT content と PR branch ファイルの verbatim 包含突合）で 4/7 ACT が MISSING と判定され、case-ready 側で復元・再適用・修復 commit 430a1928・受入検査 4 ゲート再実行の上 merge に至った。

## 問題

Definition 適用系 script（prepare_definition_pr）の部分適用モード（anchor 節への追記で見出し行のみを適用し本文段落を欠落させる）が発生しても検出ゲートが存在せず、PR 本文の検証記録が「組立の dry-run 証拠の再確認」ではなく「適用予定内容の記述」になり得る。適用後の成果物への突合が行われないため、適用実態と検証記録の不一致が PR として出荷されうる。

## 望ましい変更

case-open STEP-4 の受入検査へ「artifact_actions の合意済み content と適用後ファイルの verbatim 包含突合」を追加する。代替案として、prepare_definition_pr の報告 JSON へ適用後 file sha256 を含め、case-ready 側が突合できる形にする。

## 対象範囲

### 対象

- case-open STEP-4 機械工程の受入検査手順（definition-pr-and-idempotency.md）
- 代替案: prepare_definition_pr.ts の報告 JSON 契約（適用後 file sha256 の付与）
- 補足: case-ready 忠実性確認の機械手順明文化（definition-acceptance.md）

### 対象外

- case-ready 忠実性検査機構自体の変更（既存の assemble-draft-section.ts target_sha256/edit_sha256 突合は本件検出で機能済み）
- Design 適用機構の全面再設計、DefinitionEdit 入力契約の拡張

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md | STEP-4 機械工程手順への「artifact_actions の content と適用後ファイルの verbatim 包含突合」の追加 |
| 配布script | src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts | 報告 JSON へ適用後 file sha256 の付与（代替案） |
| 配布skill reference | src/common/skills/agentdev-workflow-case-ready/references/definition-acceptance.md | 忠実性確認の機械手順明文化（補足） |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md（L78: 提案本文の意味レビューと verbatim 記録。L43: 検査証拠の stdout/stderr 全文保存）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 適用後成果物への突合手順が規定されていない（2026-10-13 実測: L78 は提案本文の意味レビュー・verbatim 記録のみで、artifact_actions の content と適用後ファイルの突合手順なし。L43 の検査証拠保存は stdout/stderr 全文であり edit 適用後の突合を含まない）

## 制約

- 実害は解消済み（case-ready 忠実性検査で検出、case-ready 側で Design 4 ファイルを事前状態へ復元の上再適用、修復 commit 430a1928 で既存 PR 再利用・4 ゲート再実行の上 merge）。本変更は規定欠落の補完であり、既存契約の変更を伴わない
- 予防策は再適用の毎回コストを増やすため、突合は script 報告の検証工程内で完結する形が望ましい

## 受け入れ条件

- [ ] case-open STEP-4 の受入検査に、artifact_actions の合意済み content と適用後ファイルの verbatim 包含突合手順が規定される
- [ ] 突合不成立時に PR 作成が抑止される（部分適用検出時の fail-closed）
- [ ] 既存の prepare_definition_pr 呼出フロー・冪等再実行と非競合である

## 元learning item / 根拠

- **要約**: prepare_definition_pr が Design 追記の見出しのみを適用し本文段落を欠落させ、PR 検証欄が verbatim 適用を誤主張した事象（Case #3642 / PR #3643）
- **根拠**: PR 差分に合意済み本文 7 段落が不在、PR 本文検証欄が適用実態と不一致、case-ready 忠実性検査で 4/7 ACT が MISSING。git diff で見出し + 空行のみ追加されたことを確認
- **再発条件**: prepare_definition_pr（または同型の Definition 適用 script）が anchor 節への追記で見出し行のみを適用し、適用後突合を行わずに PR を作成するとき。Design 追記系の artifact_action で毎回発生し得る
- **横展開可能性**: Definition 適用系 script の報告・PR 記録は「適用予定」ではなく「適用後成果物の機械突合証跡」でなければならない。verbatim 適用の主張には適用後ファイルへの包含突合（または edit_sha256 再現）を伴う規律は同型 script 全般に適用可能

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug
- **関連Issue**: なし（修復済み PR #3643・commit 430a1928 が参考）
