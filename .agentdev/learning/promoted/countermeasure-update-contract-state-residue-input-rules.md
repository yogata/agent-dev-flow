# contract-state-residue 入力構成規律（範囲導出除外明示・観測形確認前置）

## 背景

case-close pre-merge 機械工程の contract-state-residue-check 入力組み立てで、3 Case（#3969・#3968・#3964 Epic close）で自己終了判定記録（close-acceptance）の扱いを誤り fail-closed 拒否を受けた。(a) contractStatePaths に .agentdev/close-acceptance/ を含めると機械工程自身が書出した終了判定記録が未コミット検出される (b) humanConfirmedPaths を省略形ディレクトリ接頭辞で指定すると untrackedListing のファイル形観測と正確一致せず帰属不能検出に計上される

## 問題

case-close SKILL.md 契約状態記録検査節（L84-95）に「範囲導出は意味判断としてモデルが担当」（L88）と「humanConfirmedPaths の path と確認根拠 basis の実体」（L91）は規定済みだが、(1) 終了判定記録（一時保護記録・git 履歴なし）を範囲導出から除外する明示が不在 (2) humanConfirmedPaths 指定前の untrackedListing 観測形（省略形 vs ファイル形）確認前置が不在

## 望ましい変更

case-close SKILL.md 契約状態記録検査節へ (1) 「終了判定記録（.agentdev/close-acceptance/）は恒久 commit 対象の契約状態記録ではなく一時保護記録であり、contractStatePaths の範囲導出に含めない」明示 (2) 「humanConfirmedPaths 指定前に git ls-files --others --exclude-standard で観測形（省略形ならディレクトリ接頭辞・ファイル形ならファイルパス）を確認する」前置を補記する

## 対象範囲

### 対象

- case-close SKILL.md「完了判定の契約状態記録・未追跡残存検証」節（範囲導出除外明示・観測形確認前置の補記）

### 対象外

- close_mechanical_steps.ts の evaluateContractStateResidue 実装変更（isUnderPath 契約・機械側除外の追加は機構整理候補）
- 終了判定記録の配置・回収契約の変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill SKILL | src/common/skills/agentdev-workflow-case-close/SKILL.md「完了判定の契約状態記録・未追跡残存検証」節 | 終了判定記録の範囲導出除外明示・humanConfirmedPaths 指定前の観測形確認前置の補記 |

## 既存対策確認

- **確認結果**: 対策あり（大部分）
- **該当ファイル**: src/common/skills/agentdev-workflow-case-close/SKILL.md（L88 範囲導出モデル担当・L91 humanConfirmedPaths basis 実体規定は実在）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 終了判定記録の範囲導出除外の明示と humanConfirmedPaths 観測形確認前置の欠落。3 Case で同一の fail-closed 拒否と入力修正の反復

## 制約

- evaluateContractStateResidue の決定的判定契約（正確一致・normalizeRelPath 後）は変更しない
- 範囲導出は意味判断としてモデルが担当する契約を維持し、明示は判断材料の補記にとどめる

## 受け入れ条件

- [ ] 契約状態記録検査節に終了判定記録の範囲導出除外が明示されていること
- [ ] humanConfirmedPaths 指定前の untrackedListing 観測形確認前置が収録されていること
- [ ] 後続 close で contract-state-residue-check の入力誤りによる fail が構造的に発生しないこと

## 元learning item / 根拠

- **要約**: contract-state-residue-check の入力組み立てで終了判定記録の扱いを誤る fail が反復（3 Case）
- **根拠**: case-close SKILL.md L84-95 のファイル読取実測で範囲外明示・観測形一致要件の不在（2026-11-15）・3 Case の fail 観測（#3969/#3968/#3964）
- **再発条件**: 機械工程入力の contractStatePaths に close-acceptance を含める・観測形確認なしで path 形式を仮定する条件
- **横展開可能性**: pre-merge 機械工程を実行する全 close の入力組み立てに適用可能。機械工程入力の範囲導出規律として知見化可能

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation, chore
- **関連Issue**: なし
