# generate_indexes.ts の散文言 REQ 件数更新対象の拡充

処分区分: 5 既存対策の更新（fix gap）

## 背景

`generate_indexes.ts` は docs/README.md の AUTOGEN 生成行（REQ 件数カウント）を更新するが、同一ファイル内の散文で書かれた REQ 件数言及（例: 「NN 件の要件」）を更新しない。REQ 新設の Definition PR で AUTOGEN count 更新後に散文言の手動修正が必要になり、Case #3312 と #3315 の 2 回連続で発生した。

## 問題

- 散文言の更新が自動化対象外で、案内（更新指示）も不十分なため、REQ 件数の陈腐化が README に残存する
- 2 回連続発生（#3312/#3315）しているため、偶発ではなく構造的な更新漏れである

## 望ましい変更

次のいずれか（req-define が選択する）:

1. generate_indexes.ts の更新範囲に docs/README.md の散文言 REQ 件数を追加する
2. req-range-staleness 系の案内文に「散文言 REQ 件数の手動更新」指示を明記する

## 対象範囲

### 対象

- scripts 側 generate_indexes.ts（または該当 index 生成スクリプト）
- docs/README.md の散文言 REQ 件数行
- req-range-staleness 系の案内文

### 対象外

- docs/README.md の自動生成範囲再設計そのもの

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| scripts | generate_indexes.ts | 更新範囲へ散文言 REQ 件数を追加する候補 |
| Design | req-range-staleness 関連 Design / 案内文 | 散文言の手動更新指示を明記する候補 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: generate_indexes.ts（AUTOGEN 対象）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: AUTOGEN 行のみ更新し散文言を更新しない。案内にも散文言の言及なし

## 制約

- 散文言の機械的書換は誤爆リスクがあるため、パターンを限定するか案内文対応に留める

## 受け入れ条件

- [ ] REQ 新設 Definition PR で docs/README.md の REQ 件数（AUTOGEN 行と散文言の双方）が更新される、または案内文で手動更新が強制される

## 元learning item / 根拠

- **要約**: generate_indexes.ts が散文言 REQ 件数を更新しないことによる更新漏れ 2 回連続発生
- **根拠**: 2026-10-02 Case #3314 STEP-4 検査期待値実測: AUTOGEN count 更新後に散文言の手動修正が必要になる構造。Case #3312・#3315 で同種発生
- **再発条件**: REQ 新設を含む Definition PR で docs/README.md 散文言の更新を見落とした場合
- **横展開可能性**: 件数・範囲を散文で記述する README 運用全般

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: documentation, automation
- **関連Issue**: Case #3312, Case #3315, Case #3314
