# .agentdev/ — AgentDevFlow Domain State Directory

AgentDevFlow の永続 domain state を格納するディレクトリ（REQ-0101-022, 023）。

`.agentdev/` は canonical domain state であり、コマンド間で受け渡される永続的な成果物を保持する。`.sisyphus/` は runtime workspace であり、実行時の一時作業領域である。`.sisyphus/drafts/` の working draft は canonical domain state ではない。

## 状態表

| Path | 状態 | Producer | Consumer / Next command | Retention / Removal |
|------|------|----------|------------------------|---------------------|
| `intake/inbox/*.md` | raw item | `intake-capture`, `intake-from-github` | `intake-promote` | `intake-promote` 成功後に `archive/` へ移動 |
| `intake/promoted/*.md` | promoted artifact | `intake-promote` | `backlog-review` | `backlog-save` による RU 化成功後に削除 |
| `intake/archive/rejected/*.md` | 却下（終端） | `intake-review` | なし | 永続（履歴参照） |
| `intake/archive/promoted/*.md` | promote 済み（終端） | `intake-promote` | なし | 永続（履歴参照） |
| `learning/inbox.md` | 未整理エントリ | `learning-capture`（skill） | `learning-promote` | `learning-promote` 成功後にクリア |
| `learning/archive/active.md` | 分類済み living pool | `learning-promote` | `learning-promote` | living pool。prune 対象は削除可 |
| `learning/evaluation-report.md` | 境界 artifact | `learning-promote` | `learning-promote` | 毎回上書き |
| `learning/promoted/*.md` | promoted artifact | `learning-promote` | `backlog-review` | `backlog-save` による RU 化成功後に削除 |
| `backlog/req-units/RU-*.md` | RU（Requirement Unit） | `backlog-save`, session-sourced | `req-define`, `case-open` | `case-open` の Issue 作成 + VERIFY 成功後に削除 |
| `integrity/reports/*.md` | 検証レポート | `integrity-check` | ユーザー参照 | 永続（履歴参照） |

## .agentdev/ と .sisyphus/ の境界

| ディレクトリ | 性質 | 内容 |
|---|---|---|
| `.agentdev/` | 永続 domain state | intake items、learning data、RU、integrity reports |
| `.sisyphus/` | Runtime workspace | 実行計画、証跡、タスク、実行状態、下書き、レポート |

**原則**: `.sisyphus/` の成果物は canonical domain state ではない。`req-define` が生成する working draft（`.sisyphus/drafts/req-draft-*.md`）は canonical ではなく、`req-save` の出力（REQ/ADR ファイル）が canonical である。

## ディレクトリ構成

```
.agentdev/
├── intake/
│   ├── inbox/           ← intake-capture / intake-from-github が raw item を保存
│   ├── promoted/        ← intake-promote が派生 artifact を出力（フラット）
│   └── archive/
│       ├── promoted/    ← promote 済み item の記録
│       └── rejected/    ← 却下 item の記録
├── learning/
│   ├── inbox.md         ← learning-capture が生学びを追記
│   ├── evaluation-report.md ← learning-promote が評価レポートを生成
│   ├── archive/
│   │   └── active.md    ← 分類済み learning entry の living pool
│   └── promoted/        ← learning-promote が staging stub を出力（フラット）
├── backlog/
│   └── req-units/       ← backlog-save が RU を生成
│       └── RU-*.md
└── integrity/
    └── reports/         ← integrity-check が検証結果を保存
```

## 参照

- [REQ-0101](../docs/requirements/REQ-0101.md): 文書・REQ管理基準（017-026）
- [REQ-0105](../docs/requirements/REQ-0105.md): Intake / Learning / Backlog lifecycle
- [ADR-0005](../docs/adr/ADR-0005.md): AgentDevFlow plugin namespace
