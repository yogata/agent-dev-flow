# 配布手順本文の内部ID一般化

## 背景
配布手順本文へREQ/DEC等のconcrete IDを記載した変更が配布依存境界gateで検出された。

## 問題
配布物本文の内部IDはconsumer側で解決できず、配布依存境界違反になる。

## 望ましい変更
本文では具体IDを記載せず、Design節名と内容説明へ集約する。正規の対応宣言は許可された宣言行に置く。

## 対象範囲
### 対象
- 配布手順・reference本文のREQ/DEC/IR参照
### 対象外
- docs内部正規文書のID参照

## 反映先候補
| 種別 | パス | 変更内容 |
|---|---|---|
| procedures / guardrails | 配布手順・reference編集手順 | concrete IDをDesign節名へ一般化する規則を追加 |

## 既存対策確認
- **確認結果**: 配布依存境界gateは存在、書き換え手順に補完余地
- **該当ファイル**: `docs/designs/integrity/distribution-boundary.md`
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: 配布手順本文で避ける表記の正規例が不足

## 制約
配布物に本体内部IDやdocs/designsパスを残さない。

## 受け入れ条件
- [ ] 配布手順本文にconcrete IDがない
- [ ] Design節名または一般名詞へ置換する
- [ ] 配布依存境界検査を通過する

## 元learning item / 根拠
- **要約**: 配布手順本文のconcrete ID回避
- **根拠**: #9、PR #2748で11件置換し、PR #2761でも同種違反を再経験
- **再発条件**: 配布手順へREQ/DEC/IRの具体IDを記載する場合
- **横展開可能性**: 配布物側の全手順・reference

## 推奨Issue分類
- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: #2743/#2756
