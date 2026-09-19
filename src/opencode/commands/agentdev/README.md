---
description: agentdev コマンドリファレンス
---

# agentdev コマンドリファレンス

AgentDevFlow の各コマンドの入力、出力、次アクションを一覧化する。

公開コマンドは要求入口、標準実行コマンド、補助フロー、検出フロー、リポジトリ内検査のいずれかに分類する。
要求入口は req-define（手動要求入口）と backlog-auto（要求蓄積入口）の2つであり、両経路の実行は case-auto へ合流する。
case-open、case-ready、case-run、case-close、case-revise は公開コマンドではなく内部 lifecycle 段階であり、case-auto が駆動する。
REQ/Decision/Design の保存は内部 lifecycle の case-ready（初回確定時）と case-revise（再合意済み Definition 変更の反映時）の内部責務として実行する。
標準経路は req-define 完了後の case-auto 起動である。

## コマンド一覧

| Command | Primary Input | Primary Output | Next |
|---------|--------------|----------------|------|
| `/agentdev/req-define` | 手動要求入口: 自然言語による機能要求、bug report、エラー・ログ・障害事象、外部課題、設計・調査メモ、診断由来 finding、セッション会話/ RU | 要件doc（draft） | `/agentdev/case-auto` |
| `/agentdev/case-auto` | 標準実行コマンド: 要件doc（引数なし時は drafts 全件処理）/ Issue番号、URL | マージ済み + クローズ済み（内部 lifecycle case-open〜case-close 自走、例外経路 case-revise→case-ready 解決） | 完了 |
| `/agentdev/backlog-auto` | 要求蓄積入口: なし（durable state から解決） | 検出事項、採用済み成果物、`RU-*.md`（backlog整理サイクル一巡） | RU がある場合: `/agentdev/req-define` → `/agentdev/case-auto` |
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

## 廃止コマンドの移行案内

旧コマンドは v4 で公開コマンドから廃止され、alias は残さない。内部 lifecycle 段階として case-auto が駆動する。

- `/agentdev/case-open` → `/agentdev/case-auto`（内部 lifecycle の case-open 段階が駆動）
- `/agentdev/case-ready` → `/agentdev/case-auto`（内部 lifecycle の case-ready 段階が駆動）
- `/agentdev/case-revise` → req-define で再合意後の `/agentdev/case-auto`（例外経路 case-revise → case-ready を解決）
- `/agentdev/case-run` → `/agentdev/case-auto`（内部 lifecycle の case-run 段階が駆動）
- `/agentdev/case-close` → `/agentdev/case-auto`（内部 lifecycle の case-close 段階が駆動）

