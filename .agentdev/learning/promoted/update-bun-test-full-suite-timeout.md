# bun test scripts/ 全体実行の timeout は 300〜600 秒を明示指定する

## 背景
Case #3199（OU-004）で scripts/ 全体（2628 tests・約190秒・Windows）を既定 120 秒 timeout で
実行し途中打ち切りとなった。再実行（timeout 延長）と case-close 独立再検証（600 秒指定）で合格。

## 問題
bun test 実行形態の記載（delegation-and-result.md・harness-delegation.md の120秒保護記述）に、
scripts/ 全体実行向けの timeout 延長指定が含まれていない。

## 望ましい変更
case-run / case-close の検証実行 reference・agentdev-quality-gates の QG 実行手順へ
「bun test scripts/ 全体実行を含む検証の委譲プロンプト・実行指示は timeout 300〜600 秒を明示指定する」を追記する。

## 対象範囲
### 対象
- src/opencode/skills/agentdev-workflow-case-run/references/delegation-and-result.md（bun test 実行形態）
- src/opencode/skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md（独立再検証）
- src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md（bun test フル suite 正規形）
### 対象外
- テスト本体の timeout 設定（別知見）

## 反映先候補
| 種別 | パス | 変更内容 |
|---|---|---|
| 配布skill reference | 上記3ファイル | timeout 300〜600 秒明示指定の追記 |

## 既存対策確認
- **確認結果**: あり
- **該当ファイル**: delegation-and-result.md L44-46・harness-delegation.md L44/L113
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 120 秒既定の記載はあるが全体実行向け延長指定の指示が未記載

## 制約
REQ-010-068 契約（checker 変更→bun test 合格）は不変。

## 受け入れ条件
- [ ] 委譲プロンプト・再検証手順に timeout 指定が明記されている

## 元learning item / 根拠
- **要約**: scripts/ 全体実行の所要時間が既定 timeout を超える規模に達した
- **根拠**: #3199（188.64 秒所要・120 秒で打ち切り→延長再実行 2628 pass・case-close 600 秒指定 177.10 秒合格）
- **再発条件**: scripts/ 全体を timeout 指定なしで実行する全 checker 系 Case・case-close 再検証
- **横展開可能性**: REQ-010-068 契約に基づく検証全般

## 推奨Issue分類
- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: Issue #3199・PR #3204・Epic #3197
