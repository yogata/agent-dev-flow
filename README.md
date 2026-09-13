<!-- ADF-COVERS(implementation): REQ-050-014 -->
# agent-dev-flow

AgentDevFlow は AI エージェントによる開発ワークフローを支えるプラグインである。
コマンドのプレフィックスは `/agentdev/*`、スキルのプレフィックスは `agentdev-*`、ドメイン状態ディレクトリは `.agentdev/` である。
要求の形成から Issue 実行、完了までの工程と成果物を一元管理する。

## 最小クイックスタート

```
/agentdev/req-define    # 要件を壁打ちする
/agentdev/case-open     # Issue を作成する
/agentdev/case-run      # 実装して PR を作成する
/agentdev/case-close    # PR をマージして Issue をクローズする
```

`req-save` / `design-save` は要件docの保存対象がある場合にのみ挟み込む。
保存対象がない場合は上のフローのとおり `req-define` の直後に `case-open` へ進む。
スキップ条件の詳細は [クイックスタート](docs/guides/quickstart.md) を参照する。

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

`/agentdev/req-define`、`/agentdev/req-save`、`/agentdev/design-save`、`/agentdev/case-open`、`/agentdev/case-run`、`/agentdev/case-update`、`/agentdev/case-close`、`/agentdev/case-auto`、`/agentdev/intake-capture`、`/agentdev/intake-from-github`、`/agentdev/intake-promote`、`/agentdev/learning-promote`、`/agentdev/backlog-review`、`/agentdev/backlog-auto`、`/agentdev/inspect-docs`、`/agentdev/inspect-skills`、`/agentdev/inspect-promote`、`/agentdev/issue`、`/agentdev/third-party-sync`
