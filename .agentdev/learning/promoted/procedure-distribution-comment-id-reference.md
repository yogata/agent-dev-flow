# 配布ソースコメントの対応宣言集約

## 背景
配布ソースコメントへREQ/Design IDを記載すると、consumerで解決不能な内部参照になる。

## 問題
配布物本文のconcrete IDはdistribution-boundary検査の対象であり、内部契約の直接参照として残せない。

## 望ましい変更
対応関係はADF-COVERS宣言行へ集約し、本文コメントは設計契約や節名などの一般化表現にする。

## 対象範囲
### 対象
- 配布sourceのコメントと対応宣言
### 対象外
- 正規成果物側の内部ID宣言

## 反映先候補
| 種別 | パス | 変更内容 |
|---|---|---|
| procedures / guardrails | 配布source編集手順 | concrete IDを本文へ書かず宣言へ集約する規則を明記 |

## 既存対策確認
- **確認結果**: 配布依存境界gateは存在
- **該当ファイル**: `docs/designs/integrity/distribution-boundary.md`
- **ギャップ分類**: application miss
- **ギャップ詳細**: コメント作成時の正規配置パターンが明示不足

## 制約
配布sourceにconsumerが解決できない内部IDを残さない。

## 受け入れ条件
- [ ] 本文コメントに内部concrete IDがない
- [ ] 対応宣言が許可位置にある
- [ ] 配布依存境界検査を通過する

## 元learning item / 根拠
- **要約**: 配布ソースコメントのID参照集約
- **根拠**: #8、PR #2745のcase-close gate違反と宣言集約による是正
- **再発条件**: 配布コメントへREQ/Design IDを直接記載する場合
- **横展開可能性**: 配布sourceの全コメント

## 推奨Issue分類
- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: #2735
