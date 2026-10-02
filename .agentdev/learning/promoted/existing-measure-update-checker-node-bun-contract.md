# checker 実行契約への node/bun 実行系乖離の実機制約追記

処分区分: 5 既存対策の更新（fix gap）

## 背景

Case #3252 case-close で integrity checker を `node --experimental-strip-types` で実行し、`require is not defined` で失敗した。`bun run` 経路への切替で解消した。checker 系スクリプトは bun 前提で書かれており、node 実行系では動作しない実機制約がある。

## 問題

checker 実行契約（checker-execution-contracts.md）の安定実行経路節に、bun 前提スクリプトへの node 実行は `require` 未定義で失敗する旨の実機制約記載がない。node で実行しようとした実行者が同じ失敗を反復する。

## 望ましい変更

checker 実行契約の安定実行経路節に「bun 前提スクリプトへ node 実行は require 未定義で失敗する（bun run 経路を使用する）」実機制約を追記する。

## 対象範囲

### 対象

- checker 実行契約の安定実行経路節（checker-execution-contracts.md 該当節）

### 対象外

- checker スクリプト自体の node 互換化

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| knowledge | checker 実行契約ドキュメント（checker-execution-contracts.md 安定実行経路節） | bun 前提スクリプトへの node 実行制約の追記 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: checker-execution-contracts.md（安定実行経路節）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 実行系（node/bun）の乖離による失敗様相の記載なし

## 制約

- 既存の安定実行経路の指定を変更しない（制約の追記のみ）

## 受け入れ条件

- [ ] 安定実行経路節に node 実行時の失敗様相（require 未定義）と bun run 経路の指定が記載されている

## 元learning item / 根拠

- **要約**: integrity checker の node 実行が require 未定義で失敗した実機事象
- **根拠**: 2026-09-30 Case #3252 case-close: `node --experimental-strip-types` 実行で checker が失敗、bun run 経路切替で解消
- **再発条件**: checker 系スクリプトを node 実行系で実行した場合
- **横展開可能性**: bun 前提で書かれた scripts 全般

## 推奨Issue分類

- **分類**: chore（ドキュメント追記）
- **推奨ラベル**: documentation
- **関連Issue**: Case #3252
