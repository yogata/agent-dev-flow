---
description: agentdev コマンドリファレンス
---

# agentdev コマンドリファレンス

AgentDevFlow の各コマンドの入力・出力・次アクションを一覧化する。

## コマンド一覧

| Command | Primary Input | Primary Output | Next |
|---------|--------------|----------------|------|
| `/agentdev/req-define` | セッション会話 / RU | 要件doc（draft） | feature: `/agentdev/req-save`、bugfix/maintenance/docs_chore: `/agentdev/case-open` |
| `/agentdev/req-save` | 要件doc（feature のみ） | REQ/ADR ファイル | `/agentdev/case-open` |
| `/agentdev/case-open` | REQ ファイル / 要件doc | GitHub Issue | `/agentdev/case-run` |
| `/agentdev/case-run` | Issue | 実装済みブランチ + PR | レビュー後: `/agentdev/case-close` |
| `/agentdev/case-update` | Issue | 更新済み Issue | 継続または `/agentdev/case-close` |
| `/agentdev/case-close` | PR + Issue | マージ済み + クローズ済み | 完了 |
| `/agentdev/case-auto` | 要件doc | マージ済み + クローズ済み（req-save〜case-close自走） | 完了 |
| `/agentdev/intake-capture` | ユーザー手動入力 | `inbox/` item | `/agentdev/intake-promote` |
| `/agentdev/intake-from-github` | クローズ済み Issue/PR | `inbox/` item | `/agentdev/intake-promote` |
| `/agentdev/intake-promote` | `inbox/` item | `promoted/` artifact | `/agentdev/backlog-review` |
| `/agentdev/learning-promote` | `inbox.md` + `archive/` | `promoted/` artifact | `/agentdev/backlog-review` |
| `/agentdev/backlog-review` | `promoted/` artifact（intake/learning） | `RU-*.md` | `/agentdev/req-define` |
| `/agentdev/docs-review` | docs全体（REQ/ADR/SPEC/guides/DOC-MAP） | 診断レポート | 必要に応じて `/agentdev/req-define` |

## 各コマンドの定義ファイル

- [req-define.md](./req-define.md)
- [req-save.md](./req-save.md)
- [case-open.md](./case-open.md)
- [case-run.md](./case-run.md)
- [case-update.md](./case-update.md)
- [case-close.md](./case-close.md)
- [case-auto.md](./case-auto.md)
- [backlog-review.md](./backlog-review.md)
- [intake-capture.md](./intake-capture.md)
- [intake-from-github.md](./intake-from-github.md)
- [intake-promote.md](./intake-promote.md)
- [learning-promote.md](./learning-promote.md)
- [docs-review.md](./docs-review.md)
