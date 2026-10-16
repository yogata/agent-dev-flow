<!-- ADF-COVERS(implementation): REQ-050-014, REQ-005-010, REQ-029-012, REQ-111-013 -->
# agent-dev-flow

AgentDevFlow は AI エージェントによる開発ワークフローを支えるプラグインである。
コマンドのプレフィックスは `/agentdev/*`、スキルのプレフィックスは `agentdev-*`、ドメイン状態ディレクトリは `.agentdev/` である。
要求の形成から Issue 実行、完了までの工程と成果物を一元管理する。

## 最小クイックスタート

```
/agentdev/req-define    # 要件を壁打ちする（手動要求入口）
/agentdev/case-auto     # 要件doc または Root Case から Definition 確定・実装・PR 作成・マージ・クローズまで自走する（標準実行コマンド）
```

要求の継続的な蓄積・整理は `/agentdev/backlog-auto`（要求蓄積入口）から始める。生成された RU 一式は backlog-auto の一気通貫実行で req-define → case-auto へ自動接続され、一式全体の完了判定とパッチリリース作成まで進む（利用者判断境界は維持。手動の `/agentdev/req-define` → `/agentdev/case-auto` 経路も従来どおり利用可能）。
`case-auto` は内部 lifecycle（case-open、case-ready、case-run、case-close、例外経路 case-revise）を駆動し、Definition の保存・確定と実行構造の確定もその内部責務として実行する。
再合意済みの Definition 変更は req-define で再合意した後、`case-auto` が例外経路（case-revise → case-ready）を解決して反映する。

工程駆動実行は、テーマ初回形成（`/agentdev/phase-tasks-create`）、テーマ更新（`/agentdev/phase-tasks-update`）、正規成果物への反映（`/agentdev/phase-artifacts-update`）、独立レビュー（`/agentdev/phase-review`）の4操作と利用者判断による工程遷移（`/agentdev/phase-transition`）からなる経路であり、上記の変更駆動経路と別経路として併存する。後継経路の実現・採用まで現行の変更駆動経路が正であり、変更駆動の実行に工程駆動の操作や遷移を前置しない。

## 開発者セットアップ（textlint 依存の生成）

本リポジトリの `agentdev-textlint-guard` plugin は、third-party 依存の実体を git 管理と配布物に含めず、版固定情報（`package.json` + `bun.lock`）のみを管理する。plugin のテスト実行や最終検査の前に、plugin package 配下で依存成果物を生成する（依存とライセンス種別は [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) を参照）。

```bash
# 本体リポジトリの場合: src/opencode/plugins/agentdev-textlint-guard/ で実行
bun install && bun run build:engine
```

依存実体（`vendor/` 配下）が未生成のまま導入系スクリプトや検査を実行すると、fail-closed で停止し上記手順が案内される。導入形態ごとの実行場所は plugin README「導入時の依存生成手順」を参照する。

## 主要導線

| 対象 | リンク |
|------|--------|
| コマンドの選び方（入口表） | [コマンド選択](docs/guides/command-selection.md) |
| コマンド一覧、入出力リファレンス | [コマンドリファレンス](src/common/commands/agentdev/README.md) |
| ガイド入口 | [ガイド](docs/guides/README.md) |
| 成果物、状態モデル | [成果物、状態モデル](docs/guides/artifacts-and-state.md) |
| 用語集 | [用語集](docs/guides/glossary.md) |
| システム仕様 | [system.md](docs/designs/foundations/system.md) |
| 適用プロジェクトへの導入 | [Consumer Project 導入](docs/guides/consumer-project-setup.md) |

配布コマンドの索引。
詳細な選び方は上表の[コマンド選択](docs/guides/command-selection.md)、各コマンドの入出力は[コマンドリファレンス](src/common/commands/agentdev/README.md)を参照する。

`/agentdev/req-define`、`/agentdev/backlog-auto`、`/agentdev/case-auto`、`/agentdev/intake-capture`、`/agentdev/intake-from-github`、`/agentdev/intake-promote`、`/agentdev/learning-promote`、`/agentdev/backlog-review`、`/agentdev/inspect-docs`、`/agentdev/inspect-skills`、`/agentdev/inspect-promote`、`/agentdev/issue`、`/agentdev/third-party-sync`、`/agentdev/phase-tasks-create`、`/agentdev/phase-tasks-update`、`/agentdev/phase-artifacts-update`、`/agentdev/phase-review`、`/agentdev/phase-transition`
