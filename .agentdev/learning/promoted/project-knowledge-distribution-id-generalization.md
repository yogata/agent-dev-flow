# 配布物の内部ID一般化

## 背景
配布物referenceへ本体内部IDやDesignパスを記載した変更が配布境界検査に抵触した。

## 問題
配布物側referenceの内部ID、docs/designsパス、括弧付き宣言表記はconsumerで解決不能な参照や検査違反になる。

## 望ましい変更
配布物では「Design一覧」「正規Design文書」などの一般名詞へ置換し、正規宣言は許可された宣言行へ集約する。

## 対象範囲
### 対象
- 配布物側reference・手順・宣言表記
### 対象外
- docs内部正規文書の参照表現

## 反映先候補
| 種別 | パス | 変更内容 |
|---|---|---|
| procedures / guardrails | 配布物実装反映手順 | 内部ID・pathの一般化規則を明記 |

## 既存対策確認
- **確認結果**: 配布依存境界gateは存在、書き換え規則に補完余地
- **該当ファイル**: `docs/designs/integrity/distribution-boundary.md`
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: reference作成者が避ける表記形の明示が不足

## 制約
配布物にREQ/DEC/IR等の本体内部concrete IDやdocs/designsパスを残さない。

## 受け入れ条件
- [ ] 配布物referenceに内部IDがない
- [ ] Designパスを一般名詞へ置換する
- [ ] 配布境界・IR-055・traceability検査を通過する

## 元learning item / 根拠
- **要約**: 配布referenceでの内部ID・パス参照回避
- **根拠**: #17、PR #2760でIR-055と配布依存境界gateの検出・修正を確認
- **再発条件**: 配布物へ内部参照を直接記載する場合
- **横展開可能性**: 配布sourceの全reference

## 推奨Issue分類
- **分類**: chore
- **推奨ラベル**: documentation
- **関連Issue**: #2756
