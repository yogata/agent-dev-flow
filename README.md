<!-- ADF-COVERS(implementation): REQ-001-055 -->
<!-- ADF-COVERS(implementation): REQ-050-014 -->
# agent-dev-flow

AgentDevFlow プラグインの設定を管理するリポジトリ。AI エージェントによる開発ワークフローを支えるコマンド・スキル・ドキュメントを一元管理する。

## プラグイン識別

| 項目 | 値 |
|------|------|
| プラグインの表示名 | `AgentDevFlow` |
| 正規の名前空間 | `agentdev` |
| 公開コマンドのプレフィックス | `/agentdev/*` |
| ドメイン状態ディレクトリ | `.agentdev/` |
| スキルのプレフィックス | `agentdev-*` |
| 対象ドメイン | req, case, learning, intake, integrity, issue |

## 入口表

現在の状態から次に実行すべきコマンドを選ぶ。

| 現在の状態 | 次のコマンド | 出力 |
|-----------|-------------|------|
| 要件を整理したい | `/agentdev/req-define` | 要件doc（draft） |
| 要件docに REQ/Decision 対象 artifact_actions がある場合 | `/agentdev/req-save` | REQ/Decision ファイル |
| 要件docに Design 対象 artifact_actions がある場合 | `/agentdev/design-save` | Design ファイル（`docs/designs/`） |
| REQ ファイルまたは要件docがある | `/agentdev/case-open` | GitHub Issue |
| Issue がある | `/agentdev/case-run` | 実装済みブランチ + PR |
| PR がある | `/agentdev/case-close` | マージ済み + クローズ済み |
| Issue の更新・コメント追加が必要 | `/agentdev/case-update` | 更新済み Issue |
| 具体的な作業候補を収集したい | `/agentdev/intake-capture` | inbox 項目 |
| クローズ済み Case Issue/PR から残課題を抽出したい | `/agentdev/intake-from-github` | inbox 項目 |
| inbox に項目がある | `/agentdev/intake-promote` | 採用済み / archive |
| 再発防止知見を蓄積したい | `learning-capture`（スキル） | inbox.md エントリ |
| inbox.md にエントリがある | `/agentdev/learning-promote` | 採用済み成果物 |
| 採用済み成果物（intake/learning/inspect）がある | `/agentdev/backlog-review` | `RU-*.md` |
| RU がある | `/agentdev/req-define` | 要件doc（draft） |
| 未解決事項を課題として追跡したい | `/agentdev/issue` | 追跡Issue（GitHub Issue、Tool 操作契約経由） |
| third-party Skill を宣言（skills.yaml）に基づき取得・同期したい | `/agentdev/third-party-sync` | 取得結果報告（対象一覧、成否、配置パス、管理外衝突検出状況。Tool 操作契約経由） |
| docs 全体の意味整合性を検出したい | `/agentdev/inspect-docs` | 検出事項（finding） |
| Command/Skill 参照妥当性を検出したい | `/agentdev/inspect-skills` | 検出事項（finding） |
| 検出事項を分類したい | `/agentdev/inspect-promote` | 採用済み成果物 |
| ドキュメント整合性を検証したい | `/repo/docs-check` | 検証レポート（自己ホストリポジトリ専用） |
| 要件docがあり、req-saveからcase-closeまで自走させたい | `/agentdev/case-auto` | マージ済み + クローズ済み |
| backlog整理サイクル（検出→昇格→統合）を1回で実行したい | `/agentdev/backlog-auto` | 検出事項、採用済み成果物、`RU-*.md` |

## 参照先

| 対象 | リンク |
|------|--------|
| コマンド一覧・入出力リファレンス | [commands/agentdev/README.md](src/opencode/commands/agentdev/README.md) |
| ガイド入口 | [ガイド](docs/guides/README.md) |
| コマンド選択表 | [コマンド選択](docs/guides/command-selection.md) |
| 成果物・状態モデル | [成果物・状態モデル](docs/guides/artifacts-and-state.md) |
| システム仕様 | [system.md](docs/designs/foundations/system.md) |

## クイックスタート

標準フロー。
`req-save` / `design-save` は要件docの `artifact_actions` に該当対象がある場合のみ実行する。
該当対象がない場合は `/agentdev/req-define` の直後に `/agentdev/case-open` に進む。

```
/agentdev/req-define    # 要件を壁打ちする
/agentdev/req-save      # REQ/Decision ファイルとして保存（REQ/Decision 対象 artifact_actions がある場合）
/agentdev/design-save   # Design を docs/designs/ に保存（Design 対象 artifact_actions がある場合）
/agentdev/case-open     # Issue を作成
/agentdev/case-run      # 実装して PR を作成
/agentdev/case-close    # PR をマージして Issue をクローズ
```

最大自走モード。req-define 完了後、後続工程を一括実行する。

```
/agentdev/case-auto     # req-save → design-save → case-open → case-run → case-close を自走（明示指定時のみ）
```

## 適用プロジェクトへの導入

AgentDevFlow を外部プロジェクトに導入する手順は [Consumer Project 導入](docs/guides/consumer-project-setup.md) を参照する。
