# agent-dev-flow

AgentDevFlow plugin の設定を管理するリポジトリ。AI agent-assisted development workflow を支えるコマンド・スキル・ドキュメントを一元管理する。

## Plugin identity

| 項目 | 値 |
|------|------|
| Plugin 表示名 | `AgentDevFlow` |
| Canonical namespace | `agentdev` |
| Public command prefix | `/agentdev/*` |
| Domain state directory | `.agentdev/` |
| Skill prefix | `agentdev-*` |
| Domains | req, case, learning, intake, integrity |

## 入口表

現在の状態から次に実行すべきコマンドを選ぶ。

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
| inbox に item がある | `/agentdev/intake-promote` | promoted / archive |
| 再発防止知見を蓄積したい | `learning-capture`（スキル） | inbox.md エントリ |
| inbox.md にエントリがある | `/agentdev/learning-promote` | promoted artifact |
| promoted artifact（intake/learning）がある | `/agentdev/backlog-review` | `RU-*.md` |
| RU がある | `/agentdev/req-define` | 要件doc（draft） |
| REQ 体系の健全性を診断したい | `/agentdev/req-restructure-review` | 診断レポート |
| ドキュメント整合性を検証したい | `/repo/integrity-check` | 検証レポート（self-hosting repo 専用） |
| 要件docがあり、req-saveからcase-closeまで自走させたい | `/agentdev/case-auto` | マージ済み + クローズ済み |

## 参照先

| 対象 | リンク |
|------|--------|
| コマンド一覧・入出力リファレンス | [commands/agentdev/README.md](src/opencode/commands/agentdev/README.md) |
| ガイド入口 | [ガイド](docs/guides/README.md) |
| コマンド選択表 | [コマンド選択](docs/guides/command-selection.md) |
| 成果物・状態モデル | [成果物・状態モデル](docs/guides/artifacts-and-state.md) |
| システム仕様 | [system.md](docs/specs/system.md) |

## クイックスタート

機能追加の最小フロー。バグ修正は `/agentdev/req-define` 後に `/agentdev/case-open` に進む。

```
/agentdev/req-define    # 要件を壁打ちする
/agentdev/req-save      # REQ/ADR ファイルとして保存（機能追加のみ）
/agentdev/case-open     # Issue を作成
/agentdev/case-run      # 実装して PR を作成
/agentdev/case-close    # PR をマージして Issue をクローズ
```

最大自走モード。req-define 完了後、後続工程を一括実行する。

```
/agentdev/case-auto     # req-save → case-open → case-run → case-close を自走（明示指定時のみ）
```

## Consumer Repository Installation

AgentDevFlow を外部プロジェクトに導入する手順。

### Install

```powershell
# 1. scripts/ を consumer リポジトリにコピー
# 2. インストール実行（clone + junction 作成）
./scripts/install-consumer-opencode.ps1 -Mode apply
```

### Check

```powershell
# インストール状態を確認
./scripts/check-consumer-opencode.ps1
```

### Update

```powershell
# agent-dev-flow の最新を取得して再同期
cd .agentdev-plugin && git pull && cd ..
./scripts/install-consumer-opencode.ps1 -Mode apply
```

### Recommended .gitignore

```gitignore
.agentdev-plugin/
.sisyphus/
.opencode/commands/agentdev/
.opencode/skills/agentdev-*/
```

> `.agentdev/` は gitignore に**含めない**こと（domain state として git 管理対象）。
