# traceability 完了判定の横断 durable state 前提（Design 宣言ブロック確認・main 側カタログ新鮮性）

## 背景

case-close QG-4 の traceability check は、Design ヘッダの ADF-COVERS(implementation) 宣言と検証対応要否カタログという、単一 PR の差分に閉じない横断 durable state を判定対象とする。case 2800（PR #2804）と case 2812（PR #2812）で、この横断性に起因する QG-4 差し戻し・誤判定が発生し、マージ停止と再検証の手戻りが生じた。

## 問題

1. 検証対応要否カタログ登録行（missing-verification は pass）の要件であっても、要件実現内容を正規所有する Design へ ADF-COVERS(implementation) 宣言が無いと traceability check の missing-implementation が fail になり case-close がマージを停止する。design-save で Design 本体へ要件を反映した場合、実装対応の宣言先（当該 Design ヘッダの既存宣言ブロック）の確認が手順化されていない。
2. トレーサビリティ check の `--root` を PR HEAD worktree に向けると、ブランチ分岐後に main へ commit された検証対応要否カタログ登録が worktree 側に存在せず、durable state 上は解消済みの対象行が unclassified と誤判定される。誤判定を本変更起因の失敗と区別する手順が未整備。

## 望ましい変更

- design-save 工程（Design 本体へ要件反映時）で、当該 Design ヘッダの既存 ADF-COVERS 宣言ブロックの更新を確認対象に含める。
- QG-4 / case-close の traceability check 実行手順に、worktree root 起点で unclassified 判定が出た場合の取扱を明記する: main 側 root で再実行し、カタログ登録 commit の時系列（ブランチ分岐の前後）を確認してから完了阻止を判断する。

## 対象範囲

### 対象

- QG-4 最終完了判定の検査手順（traceability check 実行時の --root 指定と判定解釈）
- design-save（Design 本体更新）時の宣言ブロック確認手順
- case-close の QG-4 再検査手順

### 対象外

- traceability check の checker 実装変更（--root の意味・検査項目の変更）
- 検証対応要否カタログの schema 変更
- worktree で checker を skip する既定（worktree-operations.md の junction 依存 checker skip。変更しない）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | .opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md | traceability check 実行時の --root 起点と main 側再実行・時系列確認の手順注記 |
| 配布skill | .opencode/skills/agentdev-design-file-manager/（design-save 手順） | Design 本体へ要件反映時の既存宣言ブロック確認項目 |
| 配布skill | .opencode/skills/agentdev-workflow-case-close/（QG-4 再検査） | unclassified 判定時の main 側 root 再実行と時系列確認手順 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分カバー。fix gap / application miss）
- **該当ファイル**: .opencode/skills/agentdev-git-worktree/references/worktree-operations.md（checker skip・読取専用実行）、.opencode/skills/agentdev-traceability/SKILL.md（check の argv 契約・検証対応要否カタログの自動読込）、deferred pool 1783（req-save 側の ADF-COVERS 宣言確認）、deferred pool 1750（宣言網羅性の定量化記録）
- **ギャップ分類**: fix gap / application miss
- **ギャップ詳細**: worktree-operations.md は junction 依存 checker の skip と読取専用実行を扱うが、(a) ブランチ分岐後の main 側カタログ更新による unclassified 誤判定の取扱、(b) design-save 時の Design ヘッダ宣言ブロック確認は未カバー。pool 1783 は req-save（REQ 行是正）側のみで design-save 側の手順化はない。

## 制約

- QG-4 の検査項目自体（missing-implementation / unclassified の検出仕様）は変更しない。判定の解釈・実行手順のみの整備とする。
- 配布 skill 本文はプロジェクト非依存の記述を維持する（具体 Issue 番号等は記載しない）。
- traceability check の安全側既定（カタログ不在時は全要件行を検証対応必須として扱う）を維持する。

## 受け入れ条件

- [ ] design-save で Design 本体へ要件を反映したケースで、当該 Design ヘッダの宣言ブロック更新が確認対象に含まれる
- [ ] worktree root 起点の traceability check で unclassified 判定が出た場合に、main 側 root 再実行とカタログ登録 commit の時系列確認を行う手順が文書化される
- [ ] 本手順により、カタログ登録済み要件行への missing-implementation / unclassified 誤差し戻しが防止できる

## 元learning item / 根拠

- **要約**: QG-4 traceability 完了判定は Design 宣言と検証対応要否カタログという横断 durable state に依存するため、保存工程の宣言確認と main 側最新状態での再判定という前提手順が必要である。
- **根拠**:
  - case 2800（PR #2804、DEL-2800-3）: 検証対応任意行の要件でも Design へ ADF-COVERS(implementation) 宣言がないと missing-implementation fail で case-close がマージ停止。design-save で Design 本体へ要件反映した場合は宣言先（既存宣言ブロック）の確認が必要。
  - case 2805 Wave 1 / case 2812（PR #2812）: --root を PR HEAD worktree に向けると、分岐後 main へ commit されたカタログ登録（RU-0002、commit 4987ea1e）が存在せず、解消済み対象 6 行が unclassified と判定された。
- **再発条件**: design-save で Design 本体へ要件反映するケース、ブランチ分岐後に main 側でカタログ登録・宣言更新が commit された後に QG-4 traceability check を実行するケース。
- **横展開可能性**: 検証対応要否カタログと ADF-COVERS 宣言を利用する運用全般（中。QG-4 実行・mid-Epic 運用で反復）。

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation, workflow
- **関連Issue**: なし（観測元: PR #2804、PR #2812、Issue #2800、Issue #2806）
