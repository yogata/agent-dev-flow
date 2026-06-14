# .agentdev/ — AgentDevFlow Domain State Directory

AgentDevFlow の永続 domain state を格納するディレクトリ（REQ-0101-022, 023）。

`.agentdev/` は canonical domain state であり、コマンド間で受け渡される永続的な成果物を保持する（`integrity/reports/` は例外: 非永続・git管理対象外）。`.sisyphus/` は runtime workspace であり、実行時の一時作業領域である。agent-dev-flow が管理するドラフトは `.agentdev/drafts/` に配置する（REQ-0103-126〜128）。`.sisyphus/` はドラフトの生成先・保存先・入力元・受け渡し先として使用しない。

## 状態表

| Path | 状態 | Producer | Consumer / Next command | Retention / Removal |
|------|------|----------|------------------------|---------------------|
| `intake/inbox/*.md` | raw item | `intake-capture`, `intake-from-github` | `intake-promote` | `intake-promote` 成功後に `archive/` へ移動 |
| `intake/promoted/*.md` | promoted artifact | `intake-promote` | `backlog-review` | `backlog-review` による RU 化成功後に削除 |
| `intake/archive/rejected/*.md` | 却下（終端） | `intake-promote` | なし | 永続（履歴参照） |
| `intake/archive/promoted/*.md` | promote 済み（終端） | `intake-promote` | なし | 永続（履歴参照） |
| `learning/inbox.md` | 未整理エントリ | `learning-capture`（skill） | `learning-promote` | `learning-promote` 成功後にクリア |
| `learning/archive/active.md` | 分類済み living pool | `learning-promote` | `learning-promote` | living pool。prune 対象は削除可 |
| `learning/evaluation-report.md` | 境界 artifact | `learning-promote` | `learning-promote` | 毎回上書き |
| `learning/promoted/*.md` | promoted artifact | `learning-promote` | `backlog-review` | `backlog-review` による RU 化成功後に削除 |
| `backlog/req-units/RU-*.md` | RU（Requirement Unit） | `backlog-review`, session-sourced | `req-define`, `case-open` | `case-open` の Issue 作成 + VERIFY 成功後に削除 |
| `drafts/req-draft-*.md` | working draft | `req-define` | `req-save` | `case-open` の Issue 作成 + VERIFY 成功後に削除 |
| `drafts/skill-review-finding-*.md` | finding draft | `skill-review` | `req-define` | `req-define` の消化後に削除 |
| `drafts/requirements-review-finding-*.md` | review finding | `req-save`（SPLIT 検出時） | `req-define` | `req-define` の消化後に削除 |
| `integrity/reports/*.md` | 検証レポート（非永続） | `docs-check` | `docs-check`（intake化）・ユーザー参照 | 非永続・git管理対象外（`.gitignore` で除外） |

## .agentdev/ と .sisyphus/ の境界

| ディレクトリ | 性質 | 内容 |
|---|---|---|
| `.agentdev/` | 永続 domain state（`integrity/reports/` は例外: 非永続・git管理対象外） | intake items、learning data、RU、drafts（req-draft, review finding） |
| `.sisyphus/` | Runtime workspace | 実行計画、証跡、タスク、実行状態、レポート |

**原則**: `.sisyphus/` の成果物は canonical domain state ではない。`req-define` が生成する working draft（`.agentdev/drafts/req-draft-*.md`）は command 間ハンドオフ用の中間アーティファクトであり、`req-save` の出力（REQ/ADR ファイル）が canonical である。

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
│   └── promoted/        ← learning-promote が promoted artifact を出力（フラット）
├── backlog/
│   └── req-units/       ← backlog-review が RU を生成
│       └── RU-*.md
├── drafts/              ← req-define が要件ドラフト、skill-review が診断 finding を保存（req-save/case-open/req-define で消費・削除）
└── integrity/
    └── reports/         ← docs-check が検証結果を保存（非永続・git管理対象外）
```

## 参照

- [REQ-0101](../docs/requirements/REQ-0101.md): 文書・REQ管理基準（017-026）
- [REQ-0103](../docs/requirements/REQ-0103.md): Artifact責任分界（drafts配置: 126-128）
- [REQ-0105](../docs/requirements/REQ-0105.md): Intake / Learning / Backlog lifecycle
- [ADR-0005](../docs/adr/ADR-0005.md): AgentDevFlow plugin namespace
