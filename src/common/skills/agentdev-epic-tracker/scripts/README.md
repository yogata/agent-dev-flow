# `agentdev-epic-tracker` scripts

Epic 状態追跡テーブルと工程記録の取りまとめ反映（記録契機別 Epic 反映）の決定的エンジン。

## 構成

```
scripts/
├── lib/
│   ├── tracking-table.ts      # 追跡テーブル解析・行特定・べき等な状態置換（新4列/旧4列）
│   └── epic-reflect.ts        # 記録契機別集約マージ、per-Epic 直列化 gate、全体条件評価
└── src/
    └── reflect.ts             # CLI 入口（reflect / closing / overall）
```

## 契約

- 入力は常に「最新の Epic Issue 本文」。呼び出し側（workflow agent またはスクリプト）が最新取得→マージ→更新の規律を遵守し、更新は per-Epic の排他制御 gate の内部で行う
- `applyReflectEntry` は該当子 Issue のエントリのみを更新し、他の子のエントリを保持する（完了順序に依存しない集約。エントリは子 Issue 番号昇順へ正規化）
- `applyClosingStatus` は終了状態のべき等置換。既に終了状態の行は上書きしない
- `evaluateOverallCompletion` は全子終了かつ全体条件全達成のときのみ `overallCompleted=true`。子完了だけでは全体完了にならない
- `createEpicWriteGate` は closing 書き込みと取りまとめ書き込みが同一 gate インスタンスを共有する per-Epic 直列化プリミティブ
- GitHub I/O は行わない（Custom Tool `agentdev_gh` が正規経路）。ユニットテストは producer 側リポジトリの検証スイートが担う
