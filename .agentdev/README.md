# .agentdev/ — AgentDevFlow Domain State Directory

AgentDevFlow の永続 domain state を格納するディレクトリ（REQ-001、REQ-002）。

`.agentdev/` は canonical domain state であり、コマンド間で受け渡される永続的な成果物を保持する（`integrity/reports/` は例外: 非永続・git管理対象外）。agent-dev-flow が管理するドラフトは `.agentdev/drafts/` に配置する（REQ-002）。

## 状態表

| Path | 状態 | Producer | Consumer / Next command | Retention / Removal |
|------|------|----------|------------------------|---------------------|
| `intake/inbox/*.md` | raw item | `intake-capture`, `intake-from-github` | `intake-promote` | `intake-promote` の分類確定後に削除（採用 item は promoted/ へ保存、却下 item は即時削除） |
| `intake/promoted/*.md` | promoted artifact | `intake-promote`, `inspect-promote`(--auto) | `backlog-review` | `backlog-review` による RU 化成功後に削除 |
| `learning/inbox.md` | 未整理エントリ | `learning-capture`（skill） | `learning-promote` | `learning-promote` 成功後にクリア |
| `learning/deferred.md` | 分類済み living pool | `learning-promote` | `learning-promote` | 多状態 living pool。staged/rejected/duplicate は promote 時 prune、deferred/未処理/再評価対象は保持 |
| `learning/evaluation-report.md` | 境界 artifact | `learning-promote` | `learning-promote` | 毎回上書き |
| `learning/promoted/*.md` | promoted artifact | `learning-promote` | `backlog-review` | `backlog-review` による RU 化成功後に削除 |
| `backlog/req-units/RU-*.md` | RU（Requirement Unit） | `backlog-review`, session-sourced | `req-define`, `case-open` | `case-open` の Issue 作成 + VERIFY 成功後に削除 |
| `drafts/req-draft-*.md` | working draft | `req-define` | `req-save`（feature） / `case-open`（bugfix/maintenance/docs_chore） | `case-open` の Issue 作成 + VERIFY 成功後に削除 |
| `drafts/requirements-review-finding-*.md` | review finding | `req-save`（SPLIT 検出時） | `req-define` | `req-define` の消化後に削除 |
| `integrity/reports/*.md` | 検証レポート（非永続） | `docs-check` | `docs-check`（intake化）・ユーザー参照 | 非永続・git管理対象外（`.gitignore` で除外） |
| `inspect/inbox/*.md` | 未分類 inspect finding | `inspect-docs`, `inspect-skills` | `inspect-promote` | `inspect-promote` の分類後に削除（promote 時は promoted/ へ保存、reject 時は即時削除、defer 時は inbox 残置） |
| `inspect/promoted/*.md` | promoted artifact（採用済み・RU化対象） | `inspect-promote` | `backlog-review` | `backlog-review` による RU 化成功後に削除 |
| `inspect/promoted/auto-promote-log.md` | `--auto` 実行ログ（append-only） | `inspect-promote`(--auto) | ユーザー参照・revoke 手順 | 永続（トレーサビリティ） |
| `issues/issue-*.md` | ローカルIssue（追跡Issue / Case Issue。ローカル版のみ） | `/agentdev/issue`、case-open/run/close（Tool 操作契約経由） | `/agentdev/issue`、`/agentdev/req-define`（実行確定時の要件化経路） | なし（永続。Issue/PR 相当の永続情報として git 管理対象、REQ-009-026） |

## .agentdev/ の性質

| ディレクトリ | 性質 | 内容 |
|---|---|---|
| `.agentdev/` | 永続 domain state（`integrity/reports/` は例外: 非永続・git管理対象外） | intake items、learning data、RU、drafts（req-draft, review finding） |

**原則**: `req-define` が生成する working draft（`.agentdev/drafts/req-draft-*.md`）は command 間ハンドオフ用の中間アーティファクトであり、`req-save` の出力（REQ/ADR ファイル）が canonical である。

## ディレクトリ構成

```
.agentdev/
├── intake/
│   ├── inbox/           ← intake-capture / intake-from-github が raw item を保存
│   └── promoted/        ← intake-promote が派生 artifact を出力（フラット）
├── learning/
│   ├── inbox.md         ← learning-capture が生学びを追記
│   ├── evaluation-report.md ← learning-promote が評価レポートを生成
│   ├── deferred.md      ← 分類済み learning entry の living pool
│   └── promoted/        ← learning-promote が promoted artifact を出力（フラット）
├── backlog/
│   └── req-units/       ← backlog-review が RU を生成
│       └── RU-*.md
├── drafts/              ← req-define が要件ドラフトを保存（req-save/case-open で消費・削除）
├── inspect/
│   ├── inbox/           ← inspect-docs / inspect-skills が未分類 finding を保存
│   └── promoted/        ← inspect-promote が採用済み artifact を出力（フラット）
├── issues/              ← ローカルIssue（ローカル版のみ。Tool 操作契約経由で読み書き）
│   └── issue-{NNNN}.md
└── integrity/
    └── reports/         ← docs-check が検証結果を保存（非永続・git管理対象外）
```

## 参照

- [REQ-001](../docs/requirements/REQ-001.md): 文書体系と持続可能な基準構造（domain state、案内層、基準境界）
- [REQ-002](../docs/requirements/REQ-002.md): 配布成果物の責務境界（drafts 配置、配布境界）
- [REQ-008](../docs/requirements/REQ-008.md): 一時成果物ライフサイクル（intake / learning / backlog lifecycle）
- [DEC-001](../docs/decisions/DEC-001.md): AgentDevFlow 憲章（namespace、基本原則）
- [DEC-005](../docs/decisions/DEC-005.md): Project Extensions Architecture（`.agentdev/extensions/**`）
