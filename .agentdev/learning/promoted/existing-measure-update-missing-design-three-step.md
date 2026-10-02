# traceability missing-design の 3 段判定手順の追記

処分区分: 5 既存対策の更新（fix gap）

## 背景

Case #3302 で traceability missing-design 判定（--req 限定実行時に missing-design が出た場合）を 3 段判定で実施した: (1) 既存起因確認（main HEAD との同値比較）、(2) 計上性格判定（本変更起因か既存起因か）、(3) record-in-findings（検出事項としての記録判断）。この手順が check-interpretation.md に明文化されていないため、判定者ごとの解釈揺れが生じ得る。

## 問題

check-interpretation.md に --req 限定実行時の missing-design 判定手順の記載がない。main HEAD 同値比較をせずに「本変更の不備」と即断する、または既存起因を黙殺する、いずれの誤判定リスクもある。

## 望ましい変更

check-interpretation.md に「--req 限定実行時の 3 段判定」を追記する: (1) main HEAD 同値比較で既存起因かを確認、(2) 計上性格判定（本変更起因 / 既存起因 / 環境起因）、(3) record-in-findings での記録要否の確定。

## 対象範囲

### 対象

- src/common/skills/agentdev-traceability/references/check-interpretation.md

### 対象外

- check スクリプトの出力形式変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | src/common/skills/agentdev-traceability/references/check-interpretation.md | --req 限定実行時の 3 段判定手順の追記 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: check-interpretation.md
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 限定実行時の missing-design 判定手順の記載なし

## 制約

- 既存の check 結果解釈規則と矛盾しない追記とする

## 受け入れ条件

- [ ] 3 段判定手順（main HEAD 同値比較→計上性格判定→record-in-findings）が追記されている

## 元learning item / 根拠

- **要約**: traceability missing-design の 3 段判定の運用実績
- **根拠**: 2026-10-01 Case #3302（PR #3309 Findings）: 既存起因確認 → 計上性格判定 → record-in-findings の 3 段判定を実施
- **再発条件**: --req 限定実行で missing-design が検出された場合
- **横展開可能性**: traceability check を利用する全 workflow（case-run 前置 gate、case-close QG）

## 推奨Issue分類

- **分類**: chore（ドキュメント追記）
- **推奨ラベル**: documentation
- **関連Issue**: Case #3302（PR #3309）
