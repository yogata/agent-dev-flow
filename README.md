<!-- ADF-COVERS(implementation): REQ-050-014, REQ-005-010 -->
# agent-dev-flow

AgentDevFlow は AI エージェントによる開発ワークフローを支えるプラグインである。
コマンドのプレフィックスは `/agentdev/*`、スキルのプレフィックスは `agentdev-*`、ドメイン状態ディレクトリは `.agentdev/` である。
要求の形成から Issue 実行、完了までの工程と成果物を一元管理する。

## 最小クイックスタート

```
/agentdev/req-define    # 要件を壁打ちする（手動要求入口）
/agentdev/case-auto     # 要件doc または Root Case から Definition 確定・実装・PR 作成・マージ・クローズまで自走する（標準実行コマンド）
```

要求の継続的な蓄積・整理は `/agentdev/backlog-auto`（要求蓄積入口）から始め、生成された RU を req-define に渡す。
`case-auto` は内部 lifecycle（case-open、case-ready、case-run、case-close、例外経路 case-revise）を駆動し、Definition の保存・確定と実行構造の確定もその内部責務として実行する。
再合意済みの Definition 変更は req-define で再合意した後、`case-auto` が例外経路（case-revise → case-ready）を解決して反映する。

## 主要導線

| 対象 | リンク |
|------|--------|
| コマンドの選び方（入口表） | [コマンド選択](docs/guides/command-selection.md) |
| コマンド一覧、入出力リファレンス | [コマンドリファレンス](src/opencode/commands/agentdev/README.md) |
| ガイド入口 | [ガイド](docs/guides/README.md) |
| 成果物、状態モデル | [成果物、状態モデル](docs/guides/artifacts-and-state.md) |
| 用語集 | [用語集](docs/guides/glossary.md) |
| システム仕様 | [system.md](docs/designs/foundations/system.md) |
| 適用プロジェクトへの導入 | [Consumer Project 導入](docs/guides/consumer-project-setup.md) |

配布コマンドの索引。
詳細な選び方は上表の[コマンド選択](docs/guides/command-selection.md)、各コマンドの入出力は[コマンドリファレンス](src/opencode/commands/agentdev/README.md)を参照する。

`/agentdev/req-define`、`/agentdev/backlog-auto`、`/agentdev/case-auto`、`/agentdev/intake-capture`、`/agentdev/intake-from-github`、`/agentdev/intake-promote`、`/agentdev/learning-promote`、`/agentdev/backlog-review`、`/agentdev/inspect-docs`、`/agentdev/inspect-skills`、`/agentdev/inspect-promote`、`/agentdev/issue`、`/agentdev/third-party-sync`
