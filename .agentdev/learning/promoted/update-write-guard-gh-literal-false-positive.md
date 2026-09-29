# 検証スクリプト内の gh コマンド文字列リテラルによる write guard 誤検出と検証構造の切替

## 背景

Case #3239（PR #3241、case-close、ステージング成果物の機械検証）で、bash 上の node -e 検証スクリプトの文字列リテラルに gh 書込みコマンド（merge コマンド等）の全文を含めると、実際の処理がファイル読取・比較のみであっても agentdev-gh-write-guard が fail-closed でコマンド全体をブロックする事象が観測された。

## 問題

guard はコマンド文字列のパターンマッチで書込みを検出するため、実行対象でないドキュメント文字列・検証スクリプト内のリテラルもブロック対象になる。この事例と回避構成が worktree-operations.md「書込み guard 運用指針」節のブロック事例として記載されていない。

## 望ましい変更

gh コマンド全文の埋込みを要する検証は、ファイルから正規表現で対象行を抽出し、git/GitHub 由来の定数（変数化した期待値）と比較する構成を標準とする。本事例を worktree-operations.md「書込み guard 運用指針」節（workspace 外書込みのブロック事例と切替）のブロック事例として追記する。guard の fail-closed 動作自体は維持し、回避ではなく検証構造の変更で対処する。

## 対象範囲

### 対象

- `src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md`「書込み guard 運用指針」節「workspace 外書込みのブロック事例と切替」（L268〜）への事例追記

### 対象外

- guard（agentdev-gh-write-guard）の検出ロジック変更（fail-closed 維持・仕様変更なし）
- コマンド文字列を含む成果物ファイルの作成手段（write tool 使用は既存規律どおり）

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md | 「書込み guard 運用指針」節へ、検証スクリプト内 gh コマンドリテラルの誤検出事例（rule=gh pr WRITE）と regex 抽出＋定数比較への切替構成を追記 |

## 既存対策確認

- **確認結果**: あり
- **該当ファイル**: src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md:233「書込み guard 運用指針」節、:268「workspace 外書込みのブロック事例と切替」節
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 既存のブロック事例は workspace 外書込み系。gh コマンド文字列リテラルのパターンマッチ誤検出（rule=gh pr WRITE）の事例と、実行対象でないリテラルを含む検証の標準構成（regex 抽出＋定数比較）は未記載

## 制約

- guard の fail-closed 動作は維持する。ブロック解除・迂回ではなく検証構造の変更で対処する
- コマンド文字列を含む成果物ファイルの作成は bash 経由せず write tool を使用する（既存規律）

## 受け入れ条件

- [ ] ブロック事例として gh コマンドリテラルの誤検出（rule=gh pr WRITE、Case #3239 実測）が追記されている
- [ ] regex 抽出＋定数比較の検証構成が標準手順として記載されている

## 元learning item / 根拠

- **要約**: 検証スクリプト内の gh コマンド文字列リテラルは write guard が誤検出する。gh コマンド全文の埋込みを要する検証は、ファイルから regex で対象行を抽出し期待値（変数化した定数）と比較する構成を標準とする
- **根拠**: guard がコマンド文字列のパターンマッチで書込みを検出するため、実行対象でないドキュメント文字列・検証スクリプト内のリテラルも対象になる（Case #3239 / PR #3241、case-close ステージング成果物の機械検証、rule=gh pr WRITE でコマンド全体がブロック）。検証スクリプトから gh コマンドのリテラルを排除し正規表現抽出＋git/GitHub 由来の定数との比較構成へ切替で解消
- **再発条件**: 検証・読取スクリプト内に gh 書込みコマンドの文字列リテラルを含めた場合
- **横展開可能性**: ステージング成果物（Supervisor 適用用のコマンド文書）の検証・作製を行う場面全般

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: なし（Case #3239 の case-close ステージング検証、agentdev-gh-write-guard 由来）
