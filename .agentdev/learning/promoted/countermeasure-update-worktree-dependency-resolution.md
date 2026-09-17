# worktree の外部依存パッケージ未伝播への依存解決2手法の選択基準明文化

## 背景

case-run / case-close で bun test 正規形を git worktree で実行する際、git が node_modules を伝播しないため外部パッケージ依存のテストが環境依存 fail する事象が繰り返し発生している（2026-09-16 Case #2890/PR #2892、2026-09-17 Case #2904/PR #2934）。

## 問題

worktree での依存解決には2つの許容手段（main 側 node_modules への junction 前置、package 単位の bun install --frozen-lockfile）が存在し、実際に両方の先行適用例（PR #2928 で junction、PR #2934 で install）があるが、どちらを選ぶかの基準が既存手順に明文化されていない。作業者は毎回判断に立ち、検証 fail 後に初めて依存解決を思い出すことになる。

## 望ましい変更

worktree 検証手順に依存解決2手法の選択基準を明記する。基準案: 一回限りの検証実行なら main 側 node_modules への junction 前置（検証後に削除）、繰り返し実行する worktree なら package 単位の bun install --frozen-lockfile。

## 対象範囲

### 対象

- worktree で bun test を実行する手順の記述（構造的制約・依存整備節）
- 依存解決失敗（Cannot find package ...）時の復旧手順

### 対象外

- bun test 正規形自体の分割・実行契約
- node_modules をリポジトリ管理化に置く構成変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md | worktree 構造的制約節の依存整備2手段（既存列挙）へ選択基準を追記 |
| 配布skill reference | src/opencode/skills/agentdev-quality-gates/references/qg-4-final-acceptance.md | bun test 正規形の worktree 実行時の依存前置前提への言及追記（候補） |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md（依存整備の正規手段として junction と bun install の2手段を列挙）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 2手段の列挙は存在するが、「一回限り検証なら junction、繰り返し実行なら install」という選択基準が未明文化。先行適用例 #2928 / #2934 の両方が存在し、明文化のみが残る

## 制約

- junction は検証後に削除する運用を維持する（worktree 残骸防止）
- bun install は --frozen-lockfile 指定を維持する（lockfile 改変防止）
- Windows 環境の junction 作成は既存知識（windows 系）に従う

## 受け入れ条件

- [ ] worktree 検証手順に依存解決2手法の選択基準が明文化されている
- [ ] 新規 worktree で bun test を実行する作業者が検証前に依存前置を計画に含められる

## 元learning item / 根拠

- **要約**: worktree の node_modules 未伝播による bun test 環境依存 fail と依存解決手法の選択基準不在
- **根拠**: Case #2890（PR #2892、zod 依存 4 fail を junction 前置で回避）、Case #2904（PR #2934、integrity suite で Cannot find package zod 4 fail を bun install で解消）の2事象。git worktree は gitignore 対象の node_modules を継承せず、bun のモジュール解決は実行 cwd の node_modules を辿る
- **再発条件**: node_modules をリポジトリに持たず外部パッケージに依存するテストを、依存前置なしの worktree で実行した場合（新規 worktree で bun test 正規形を実行する全 case）
- **横展開可能性**: worktree で bun test を実行する全 case で潜在的。プロジェクト固有（worktree 構成・bun 解決仕様依存）

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: Case #2890, Case #2904
