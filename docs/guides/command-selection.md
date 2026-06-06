# コマンド選択

現在の状態から、次に実行すべきコマンドを選ぶための入口表。

## 入口表

| 現在の状態 | 次のコマンド | 出力 |
|-----------|-------------|------|
| 要件を整理したい | `/agentdev/req-define` | 要件doc（draft） |
| 要件docがあり、機能追加の場合 | `/agentdev/req-save` | REQ/ADR ファイル |
| REQ ファイルまたは要件docがある | `/agentdev/case-open` | GitHub Issue |
| Issue がある | `/agentdev/case-run` | 実装済みブランチ + PR |
| PR がある | `/agentdev/case-close` | マージ済み + クローズ済み |
| Issue の更新・コメント追加が必要 | `/agentdev/case-update` | 更新済み Issue |
| 具体的な作業候補を収集したい | `/agentdev/intake-capture` | inbox item |
| クローズ済み Issue/PR から残課題を抽出したい | `/agentdev/intake-from-github` | inbox item |
| inbox に item がある | `/agentdev/intake-review` | accepted / archive |
| accepted item がある | `/agentdev/intake-promote` | promoted artifact |
| 再発防止知見を蓄積したい | `learning-capture`（スキル） | inbox.md エントリ |
| inbox.md にエントリがある | `/agentdev/learning-refine` | evaluation-report.md |
| evaluation-report がある | `/agentdev/learning-promote` | promoted artifact |
| promoted artifact（intake/learning）がある | `/agentdev/backlog-review` | review draft |
| review draft がある | `/agentdev/backlog-save` | RU（Requirement Unit） |
| RU がある | `/agentdev/req-define` | 要件doc（draft） |
| REQ 体系の健全性を診断したい | `/agentdev/req-restructure-review` | 診断レポート |
| 要件docがあり、req-saveからcase-closeまで自走させたい | `/agentdev/case-auto` | マージ済み + クローズ済み |

## Repository maintenance（self-hosting repo のみ）

| 現在の状態 | 次のコマンド | 出力 |
|-----------|-------------|------|
| ドキュメント整合性を検証したい | `/repo/integrity-check` | 検証レポート |

> これらのコマンドは repo-local（ADR-0020）であり、AgentDevFlow の consumer 配布対象外。

## 使い方

1. 「現在の状態」の列から今の状況に合う行を探す
2. 「次のコマンド」を実行する
3. 出力された成果物を使って、次の行に進む

## 補足

- 機能追加は `req-define` → `req-save` → `case-open` → `case-run` → `case-close` の5ステップが基本
- バグ修正・保守作業・ドキュメント作業は `req-save` をスキップする
- Intake / Learning パイプラインの詳細は [Intake / Learning / Backlog フロー](intake-learning-backlog-flow.md) を参照
- 各コマンドの入出力の詳細は [要件定義 → Case実行フロー](req-case-flow.md) を参照
- `case-auto` は明示指定時のみ使用する追加入口。標準ワークフローを置き換えない
