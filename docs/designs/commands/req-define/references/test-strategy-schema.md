---
title: draft-data test_strategy フィールドスキーマ
status: accepted
created: "2026-11-19"
updated: "2026-11-19"
---

<!-- 親: docs/designs/commands/req-define.md から参照される詳細仕様（遅延読み込み）。 -->

# draft-data test_strategy フィールドスキーマ

## draft-data test_strategy フィールドスキーマ

要件定義で test_strategy（テスト戦略）を定義する場合のシリアライズ形式を定義する。

### test_strategy 項目構造

各 test strategy 項目は以下の5属性を持つ:

| 属性 | 型 | 説明 | 例 |
|------|------|------|----|
| id | string | TS-NNN 形式（NNNは3桁ゼロ埋め連番） | `TS-001` |
| target_item | string | AG-* への参照 | `AG-NNN` |
| verification | string | 検証手順 | `検証エンジン cli.ts --changed を実行する` |
| pass_criteria | string | 合格基準 | `エラー 0 件で完了すること` |
| on_failure | string | 不合格時の処置 | `実装を修正して再検証する` |

### YAML 表現形式

```yaml
test_strategy:
  - id: TS-001
    target_item: AG-NNN
    verification: |
      検証手順の記述
    pass_criteria: |
      合格基準の記述
    on_failure: |
      不合格時の処置の記述
```

### on_failure アクション種別

| 種別 | 説明 | 選択基準 |
|------|------|---------|
| fix-and-reverify | 実装を修正して再検証する | 修正可能な実装不良の場合 |
| record-in-findings | Findings に out-of-scope として記録する | スコープ外または修正困難な事象の場合 |
