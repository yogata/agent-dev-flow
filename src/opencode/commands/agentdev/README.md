---
description: agentdev コマンドリファレンス
---

# agentdev コマンドリファレンス

AgentDevFlow の各コマンドの入力、出力、次アクションを一覧化する。

## コマンド一覧

| Command | Primary Input | Primary Output | Next |
|---------|--------------|----------------|------|
| `/agentdev/req-define` | セッション会話/ RU | 要件doc（draft） | feature: `/agentdev/req-save`、bugfix/maintenance/docs_chore: `/agentdev/case-open` |
| `/agentdev/req-save` | 要件doc（feature のみ） | REQ/Decision ファイル | `/agentdev/design-save`（Design候補がある場合）/ `/agentdev/case-open` |
| `/agentdev/design-save` | 要件doc（feature のみ、Design候補あり） | Design ファイル（`docs/designs/`） | `/agentdev/case-open` |
| `/agentdev/case-open` | REQ ファイル/ 要件doc | GitHub Issue | `/agentdev/case-run` |
| `/agentdev/case-run` | Issue | 実装済みブランチ + PR | レビュー後: `/agentdev/case-close` |
| `/agentdev/case-update` | Issue | 更新済み Issue | 継続または `/agentdev/case-close` |
| `/agentdev/case-close` | PR + Issue | マージ済み + クローズ済み | 完了 |
| `/agentdev/case-auto` | 要件doc/ Issue番号、URL | マージ済み + クローズ済み（req-save〜design-save〜case-close自走） | 完了 |
| `/agentdev/backlog-auto` | なし（durable state から解決） | 検出事項、採用済み成果物、`RU-*.md`（backlog整理サイクル一巡） | RU がある場合: `/agentdev/req-define` |
| `/agentdev/intake-capture` | ユーザー手動入力 | `inbox/` item | `/agentdev/intake-promote` |
| `/agentdev/intake-from-github` | クローズ済み Case Issue/PR | `inbox/` item | `/agentdev/intake-promote` |
| `/agentdev/intake-promote` | `inbox/` item | `promoted/` 成果物 | `/agentdev/backlog-review` |
| `/agentdev/issue` | 自然言語による課題管理の指示 | 追跡Issue の作成・更新・検索・参照（Tool 操作契約経由） | 継続利用または完了 |
| `/agentdev/third-party-sync` | 対象 Skill 名（省略時は全件）、dry-run 指定 | 取得結果報告: 対象一覧、取得成否、配置パス、管理外衝突の検出状況（Tool 操作契約経由） | 継続利用または完了 |
| `/agentdev/learning-promote` | `inbox.md` + `deferred.md` | `promoted/` 成果物 | `/agentdev/backlog-review` |
| `/agentdev/backlog-review` | `promoted/` 成果物（intake/learning） | `RU-*.md` | `/agentdev/req-define` |
| `/agentdev/inspect-docs` | docs全体の意味整合検出 | 検出事項 | `/agentdev/inspect-promote` → `/agentdev/backlog-review` |
| `/agentdev/inspect-skills` | Command/Skill 参照妥当性検出 | 検出事項 | `/agentdev/inspect-promote` → `/agentdev/backlog-review` |
| `/agentdev/inspect-promote` | 検出事項の分類、採用（`--auto` で高確信度の検出事項を intake/promoted/ へ自動投入） | 採用済み成果物 | `/agentdev/backlog-review` |

## 各コマンドの定義ファイル

- [req-define.md](./req-define.md)
- [req-save.md](./req-save.md)
- [design-save.md](./design-save.md)
- [case-open.md](./case-open.md)
- [case-run.md](./case-run.md)
- [case-update.md](./case-update.md)
- [case-close.md](./case-close.md)
- [case-auto.md](./case-auto.md)
- [backlog-auto.md](./backlog-auto.md)
- [backlog-review.md](./backlog-review.md)
- [intake-capture.md](./intake-capture.md)
- [intake-from-github.md](./intake-from-github.md)
- [intake-promote.md](./intake-promote.md)
- [issue.md](./issue.md)
- [third-party-sync.md](./third-party-sync.md)
- [learning-promote.md](./learning-promote.md)
- [inspect-docs.md](./inspect-docs.md)
- [inspect-skills.md](./inspect-skills.md)
- [inspect-promote.md](./inspect-promote.md)

