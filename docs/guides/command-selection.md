# コマンド選択

現在の状態から、次に実行すべきコマンドを選ぶための入口表。

## 入口表

| 現在の状態 | 次のコマンド | 出力 |
|-----------|-------------|------|
| 要件を整理したい | `/agentdev/req-define` | 要件doc（draft） |
| 要件docがあり、REQ/ADR 対象 artifact_actions がある場合 | `/agentdev/req-save` | REQ/ADR ファイル |
| REQ/ADR ファイルがあり、SPEC対象 artifact_actions がある場合 | `/agentdev/spec-save` | SPEC ファイル（`docs/specs/`） |
| REQ ファイルまたは要件docがある | `/agentdev/case-open` | GitHub Issue |
| Issue がある | `/agentdev/case-run` | 実装済みブランチ + PR |
| PR がある | `/agentdev/case-close` | マージ済み + クローズ済み |
| Issue の更新・コメント追加が必要 | `/agentdev/case-update` | 更新済み Issue |
| 具体的な作業候補を収集したい | `/agentdev/intake-capture` | inbox 項目 |
| クローズ済み Issue/PR から残課題を抽出したい | `/agentdev/intake-from-github` | inbox 項目 |
| inbox に項目がある | `/agentdev/intake-promote` | 採用済み / archive |
| 再発防止知見を蓄積したい | `learning-capture`（スキル） | inbox.md エントリ |
| inbox.md にエントリがある | `/agentdev/learning-promote` | 採用済み成果物 |
| 採用済み成果物（intake/learning）がある | `/agentdev/backlog-review` | `RU-*.md` |
| RU がある | `/agentdev/req-define` | 要件doc（draft） |
| REQ 体系の健全性を検出したい | `/agentdev/inspect-docs` | 検出レポート |
| 要件docがあり req-saveからcase-closeまで自走させたい / Issue番号・URL があり case-run〜case-close を自走させたい | `/agentdev/case-auto` | マージ済み + クローズ済み |

## リポジトリメンテナンス（AgentDevFlow 本体リポジトリのみ）

| 現在の状態 | 次のコマンド | 出力 |
|-----------|-------------|------|
| ドキュメント整合性を検証したい | `/repo/docs-check` | 検証レポート |

> これらのコマンドは配布対象外（ADR-0106）であり、AgentDevFlow 本体リポジトリでのみ利用する。

## 使い方

1. 「現在の状態」の列から今の状況に合う行を探す
2. 「次のコマンド」を実行する
3. 出力された成果物を使って、次の行に進む

## 補足

- 工程分岐は `work_type` 固定分岐ではなく req_draft の `artifact_actions` 存在で動的判定する（REQ-0138, ADR-0124）。REQ/ADR 対象 artifact_actions があれば req-save、SPEC 対象 artifact_actions があれば spec-save を実行する
- Intake / Learning パイプラインの詳細は [Intake / Learning / Backlog フロー](intake-learning-backlog-flow.md) を参照
- 各コマンドの入出力の詳細は [要件定義 → Case実行フロー](req-case-flow.md) を参照
- `/agentdev/case-auto` は明示指定時のみ使用する追加入口。標準ワークフローを置き換えない
