# learning deferred エントリの反映先候補実在性確認（不在スキル参照の現行化・廃棄判定）

## 背景
Case #3200（OU-002・語彙レジストリ不在 skill 行削除）完了後、deferred.md に不在スキル
agentdev-doc-writing を反映先候補とする 11 行（9 エントリ）が残留した。learning pipeline に
反映先の実在性を再確認する機構がない。

## 問題
(1) 再評価時に不在反映先へ誘導された 9 エントリの現行化または廃棄判定が未実施。
(2) skill 廃止時に deferred の該当反映先を棚卸しする工程が learning pipeline に存在しない。

## 望ましい変更
(1) learning-promote の deferred 再評価手順へ「反映先候補の実在性確認（grep）と、消滅時の
現行化または廃棄判定」を追加する（agentdev-learning-pipeline / agentdev-workflow-learning-promote）。
(2) skill 廃止系 Case の capture 段階で learning/deferred.md の該当反映先有無確認を案内する。
(3) 今回の 11 行へは「不在スキル参照」の注記を付与する（2026-09-28 実施分は learning-promote が単一 writer として付与済み）。

## 対象範囲
### 対象
- src/opencode/skills/agentdev-learning-pipeline/references/disposition-and-artifact-schema.md（既存対策照合の確認対象に反映先実在性）
- src/opencode/skills/agentdev-workflow-learning-promote/references/analysis-and-review.md（STEP-1/3 の候補読込・照合手順への実在性確認）
- .agentdev/learning/deferred.md（9 エントリへの注記）
### 対象外
- 反映先の新規マッピング確定（req-define の変更影響分析が確定する責務）

## 反映先候補
| 種別 | パス | 変更内容 |
|---|---|---|
| 配布skill reference | 上記 pipeline/workflow reference | 反映先実在性確認手順の追加 |
| ドメイン状態 | deferred.md | 9 エントリへの不在反映先注記 |

## 既存対策確認
- **確認結果**: なし
- **該当ファイル**: なし
- **ギャップ分類**: なし（機構不在）
- **ギャップ詳細**: 反映先実在性の再確認機構が存在しない

## 制約
learning-promote は実現先を選ぶ分類・マッピングを行わない（再マッピングの確定は req-define 委ね）。
履歴記録としての除外明示（TS-006）と living pool の現行性は別問題として扱う。

## 受け入れ条件
- [ ] 再評価手順に反映先実在性確認が組み込まれている
- [ ] 9 エントリに不在反映先の注記が付与されている

## 元learning item / 根拠
- **要約**: 反映先候補スキル廃止後の deferred エントリ残留
- **根拠**: #3200 完了後の repo 全域 grep で deferred.md 反映先候補 11 行を検出（TS-006 再検証）
- **再発条件**: skill 廃止時に deferred の反映先棚卸しが行われない場合
- **横展開可能性**: learning pipeline 固有

## 推奨Issue分類
- **分類**: feature
- **推奨ラベル**: enhancement
- **関連Issue**: Issue #3200・PR #3208・Epic #3197
