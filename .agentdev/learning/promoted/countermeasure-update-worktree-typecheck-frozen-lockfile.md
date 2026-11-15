# worktree typecheck の bun install --frozen-lockfile 前置明記と bun run PATH 解決補記

## 背景

worktree の node_modules 未伝播構造により、bun run --cwd による tsc 実行が package 直下 node_modules/.bin 解決に失敗する事象が反復（Case #4005・#3970・#3971・前回 deferred 2 件）。依存整備の前置は worktree-operations.md「bun test 実行の環境前提」節（L138-176）に詳細に整備されているが、lockfile 不変の機械保証（--frozen-lockfile）の明記と bun run 特有の PATH 解決要件が欠落している

## 問題

(1) worktree-operations.md の依存整備手順に bun install --frozen-lockfile の文言が不在（前回 2026-11-07 grep 実測 + 今回再確認・src/common/skills 配下で 0 件）により、bun install が bun.lock を意図せず更新する汚染リスクが手順上防げない (2) bun run --cwd の .bin 解決要件と、tsc 依存未整備環境で bun run tsc が PATH 解決失敗でヘルプ出力を表示し検証が通過扱いに見える問題（node_modules/.bin/tsc 直接起動が確実）の知見が手順に不在

## 望ましい変更

worktree-operations.md「bun test 实行の環境前提」節へ (1) bun install --frozen-lockfile 前置の明記（lockfile 不変の機械保証）(2) bun run --cwd は package 直下 node_modules/.bin 解決を要求すること・tsc PATH 解決失敗時は node_modules/.bin/tsc 直接起動を用いることの補記を行う

## 対象範囲

### 対象

- worktree-operations.md「bun test 実行の環境前提」節（--frozen-lockfile 明記・bun run PATH 解決補記）
- （正規配置先の判断対象）agentdev-quality-gates QG-4 の依存パッケージ前置節（L143 が QG-4 参照の正規形とする構造上、--frozen-lockfile 規律を QG-4 側へ配置する選択肢あり）

### 対象外

- bun install 自体の動作変更
- worktree の node_modules 伝播機構の変更（構造的制約）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-git-worktree/references/worktree-operations.md「bun test 実行の環境前提」節 | bun install --frozen-lockfile 前置明記・bun run --cwd PATH 解決要件・node_modules/.bin/tsc 直接起動フォールバックの補記 |
| 配布skill reference | src/common/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md 依存パッケージ前置節（正規配置先の候補） | --frozen-lockfile 規律の配置先としての検討 |

## 既存対策確認

- **確認結果**: 対策あり（大部分）
- **該当ファイル**: src/common/skills/agentdev-git-worktree/references/worktree-operations.md（L138-176・bun install 前置・tsc 型解決前提 L145・整備手段・選択基準は実在）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: --frozen-lockfile 規律の明記欠落（前回+今回+review で 3 度の grep 実測で不在確認）・bun run --cwd PATH 解決要件の補記欠落

## 制約

- bun.lock を変更する Case（依存定義の変更を伴う実装）では --frozen-lockfile を付与しない判断が必要
- 検証結果の再現性が依存状態に依存する検証では bun install 直実行を選択する既存の選択基準（L173）を維持

## 受け入れ条件

- [ ] worktree 依存整備手順（正規配置先）に bun install --frozen-lockfile の前置が明記されていること
- [ ] bun run --cwd の .bin 解決要件と tsc PATH 解決失敗時の node_modules/.bin/tsc 直接起動フォールバックが補記されていること
- [ ] 後続 worktree 実行で typecheck が bun install 前置後の正規形で成立すること

## 元learning item / 根拠

- **要約**: worktree の typecheck・tsc 実行が node_modules 未伝播と bun run PATH 解決で失敗する（統合後 5 件）
- **根拠**: worktree-operations.md L138-176 のファイル読取実測で --frozen-lockfile 文言不在（3 度の grep 実測）・L145 に tsc 型解決前提（bun install 復元）実在を確認。deferred L4381-4399（前回統合追記・promote 判定の実測前置完了済み）を統合
- **再発条件**: worktree 新規作成または node_modules 未整備 package で bun run --cwd typecheck を実行する条件
- **横展開可能性**: worktree での bun run・tsc・typecheck を含む検証手順の委譲・機械工程全般で同型の前置が必要になり得る

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation, chore
- **関連Issue**: なし
