# `agentdev-epic-tracker` scripts

Epic 実行構成表（`| Wave | Issue | 前提 | 状態 |`）への状態反映（記録契機別 Epic 反映）の決定的エンジン。

## 構成

```
scripts/
├── lib/
│   ├── tracking-table.ts      # 実行構成表解析・行特定・べき等な子状態置換（新形式のみ。旧形式の後方互換検出なし）
│   └── epic-reflect.ts        # 実行構成表への状態反映、per-Epic 直列化 gate、再試行 pending 戻し、全体条件評価
└── src/
    └── reflect.ts             # CLI 入口（closing / reset / overall）
```

## 契約

- 入力は常に「最新の Epic Issue 本文」。呼び出し側（workflow agent またはスクリプト）が最新取得→マージ→更新の規律を遵守し、更新は per-Epic の排他制御 gate の内部で行う
- 子状態は `pending` / `completed` / `blocked` / `failed` の4値のみ。PR 番号・URL は状態列に付記しない
- Epic 本文への書き込みは実行構成表の子状態列に限定する。停止理由・再開条件・判定根拠は子 Issue の記録コメントが正であり、Epic 本文へ複製しない
- `applyClosingStatus` は終端子状態のべき等置換。既に終端子状態の行は上書きしない
- `resetChildToPending` は blocked / failed から pending への冪等戻し。completed からの戻しは拒否する（継続条件の成立と旧実行の終了確認は呼び出し側の判断）
- `evaluateOverallCompletion` は全子終端かつ全体条件全達成のときのみ `overallCompleted=true`。子完了だけでは全体完了にならない。評価結果は返却のみで Epic 本文へ保存しない
- `createEpicWriteGate` は closing 書き込みと取りまとめ書き込みが同一 gate インスタンスを共有する per-Epic 直列化プリミティブ
- GitHub I/O は行わない（Custom Tool `agentdev_gh` が正規経路）。ユニットテストは producer 側リポジトリの検証スイートが担う
