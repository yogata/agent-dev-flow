# integrity-check コマンドの非推奨マーク付き在庫残存

## 観測
integrity-check により、`integrity-check` コマンドが本文中に「非推奨」または「deprecated」の記述を含んでいるにもかかわらず、command README 在庫（`.opencode/commands/agentdev/README.md`）に引き続き掲載されていることが検出された。

## 今回扱わない理由
integrity-check の読み取り専用制約により検出のみ。実際に非推奨とするかの確認が必要。

## 影響
- ユーザーが非推奨コマンドを入口表から選択する可能性がある

## レビューで決めること
- `integrity-check` コマンドを実際に非推奨とするか確認
- 非推奨とする場合は README 在庫から除外する
- 非推奨としない場合は本文の「非推奨」記述を削除する

## 根拠
- integrity-check カテゴリ: Command / cmd-deprecated-in-inventory
- 分類: `workflow-gap`
- ルート: `intake`
- 検出元: `.agentdev/integrity/reports/2026-06-04-integrity-report.md`
