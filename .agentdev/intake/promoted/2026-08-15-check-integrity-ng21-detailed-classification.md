# check_integrity.ts 実行時 NG=21 の詳細分類未精査

## 観測内容

check_integrity.ts 実行時の NG=21（broken-file-link 11、index-generation-consistency 4 等）が「参考記録」扱いで未整理のため、remediation 後も exit 1 を返し続け、新規 NG 検出のノイズになっている。

## 影響

- 新規欠陥と既知欠陥の区別がつかず、検査結果が判断に使えない
- exit 1 が常態化し検査の実効性が失われる

## 課題

21件全件の由来分類（legacy / superseded / AUTOGEN / 実欠陥）を独立作業として精査し、分類結果に応じた解消計画（リンク修正、index 再生成、参照更新）を立案する。部分重複する既存 intake（broken references 系、AUTOGEN 系）との統合の扱いは backlog-review で判断する。

## 既存要件・成果物との関連

- 対象: check_integrity.ts の NG=21（内訳: broken-file-link 11、index-generation-consistency 4、他）
- 関連: 既存 intake 系（promoted items: existing-broken-references-legacy、autogen-staleness 等）と部分重複の可能性

## 出典

- 発生日: 2026-08-15
- 取得元: 検査スクリプト実行時の観測
- 元 item: intake-2026-08-15-check-integrity-ng21-detailed-classification.md
- 注記: 21件の精査・解消の粒度（単独か複数 RU か）は backlog-review の統合・分割判定に委ねる（経路C review の限定指摘を反映）
