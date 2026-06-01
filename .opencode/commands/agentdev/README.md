---
description: agentdev コマンドリファレンス
---

# agentdev コマンドリファレンス

AgentDevFlow の各コマンドの入力・出力・次アクションを一覧化する（REQ-0101-026）。

## コマンド一覧

| Command | Primary Input | Primary Output | Next |
|---------|--------------|----------------|------|
| `/agentdev/req-define` | セッション会話 / RU | 要件doc（draft） | Pattern B: `/agentdev/req-save`、A/C/D: `/agentdev/case-open` |
| `/agentdev/req-save` | 要件doc（Pattern B のみ） | REQ/ADR ファイル | `/agentdev/case-open` |
| `/agentdev/case-open` | REQ ファイル / 要件doc | GitHub Issue | `/agentdev/case-run` |
| `/agentdev/case-run` | Issue | 実装済みブランチ + PR | レビュー後: `/agentdev/case-close` |
| `/agentdev/case-update` | Issue | 更新済み Issue | 継続または `/agentdev/case-close` |
| `/agentdev/case-close` | PR + Issue | マージ済み + クローズ済み | 完了 |
| `/agentdev/intake-capture` | ユーザー手動入力 | `inbox/` item | `/agentdev/intake-review` |
| `/agentdev/intake-from-github` | クローズ済み Issue/PR | `inbox/` item | `/agentdev/intake-review` |
| `/agentdev/intake-review` | `inbox/` item | `accepted/` / `archive/` | `/agentdev/intake-promote` |
| `/agentdev/intake-promote` | `accepted/` item | `promoted/` artifact | `/agentdev/backlog-review` |
| `/agentdev/learning-refine` | `inbox.md` + `archive/active.md` | `evaluation-report.md` | `/agentdev/learning-promote` |
| `/agentdev/learning-promote` | `evaluation-report.md` + `archive/` | `promoted/` artifact | `/agentdev/backlog-review` |
| `/agentdev/backlog-review` | `promoted/` artifact（intake/learning） | review draft | `/agentdev/backlog-save` |
| `/agentdev/backlog-save` | review draft | `RU-*.md` | `/agentdev/req-define` |
| `/agentdev/req-restructure-review` | REQ 体系 | 診断レポート | 必要に応じて `/agentdev/req-define` |
| `/agentdev/integrity-check` | ドキュメント・スキル・コマンド | 検証レポート | 乖離検出時: 該当コマンドで修正 |

## 各コマンドの定義ファイル

- [req-define.md](./req-define.md)
- [req-save.md](./req-save.md)
- [case-open.md](./case-open.md)
- [case-run.md](./case-run.md)
- [case-update.md](./case-update.md)
- [case-close.md](./case-close.md)
- [backlog-review.md](./backlog-review.md)
- [backlog-save.md](./backlog-save.md)
- [intake-capture.md](./intake-capture.md)
- [intake-from-github.md](./intake-from-github.md)
- [intake-review.md](./intake-review.md)
- [intake-promote.md](./intake-promote.md)
- [learning-refine.md](./learning-refine.md)
- [learning-promote.md](./learning-promote.md)
- [integrity-check.md](./integrity-check.md)
- [req-restructure-review.md](./req-restructure-review.md)
