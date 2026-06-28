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
| 対象ドメイン | req, case, learning, intake, integrity |

## 入口表

現在の状態から次に実行すべきコマンドを選ぶ。

| 現在の状態 | 次のコマンド | 出力 |
|-----------|-------------|------|
| 要件を整理したい | `/agentdev/req-define` | 要件doc（draft） |
| 要件docがあり、機能追加の場合 | `/agentdev/req-save` | REQ/ADR ファイル |
| REQ/ADR ファイルがあり、SPEC候補がある場合 | `/agentdev/spec-save` | SPEC ファイル（`docs/specs/`） |
| REQ ファイルまたは要件docがある | `/agentdev/case-open` | GitHub Issue |
| Issue がある | `/agentdev/case-run` | 実装済みブランチ + PR |
| PR がある | `/agentdev/case-close` | マージ済み + クローズ済み |
| Issue の更新・コメント追加が必要 | `/agentdev/case-update` | 更新済み Issue |
| 具体的な作業候補を収集したい | `/agentdev/intake-capture` | inbox 項目 |
| クローズ済み Issue/PR から残課題を抽出したい | `/agentdev/intake-from-github` | inbox 項目 |
| inbox に項目がある | `/agentdev/intake-promote` | 採用済み / archive |
| 再発防止知見を蓄積したい | `learning-capture`（スキル） | inbox.md エントリ |
| inbox.md にエントリがある | `/agentdev/learning-promote` | 採用済み成果物 |
| 採用済み成果物（intake/learning/inspect）がある | `/agentdev/backlog-review` | `RU-*.md` |
| RU がある | `/agentdev/req-define` | 要件doc（draft） |
| docs 全体の意味整合性を検出したい | `/agentdev/inspect-docs` | 検出事項（finding） |
| Command/Skill 参照妥当性を検出したい | `/agentdev/inspect-skills` | 検出事項（finding） |
| 検出事項を分類したい | `/agentdev/inspect-promote` | 採用済み成果物 |
| ドキュメント整合性を検証したい | `/repo/docs-check` | 検証レポート（自己ホストリポジトリ専用） |
| 要件docがあり、req-saveからcase-closeまで自走させたい | `/agentdev/case-auto` | マージ済み + クローズ済み |

## 参照先

| 対象 | リンク |
|------|--------|
| コマンド一覧・入出力リファレンス | [commands/agentdev/README.md](src/opencode/commands/agentdev/README.md) |
| ガイド入口 | [ガイド](docs/guides/README.md) |
| コマンド選択表 | [コマンド選択](docs/guides/command-selection.md) |
| 成果物・状態モデル | [成果物・状態モデル](docs/guides/artifacts-and-state.md) |
| システム仕様 | [system.md](docs/specs/foundations/system.md) |

## クイックスタート

機能追加の最小フロー。バグ修正は `/agentdev/req-define` 後に `/agentdev/case-open` に進む。

```
/agentdev/req-define    # 要件を壁打ちする
/agentdev/req-save      # REQ/ADR ファイルとして保存（機能追加のみ）
/agentdev/spec-save     # SPEC候補を docs/specs/ に保存（SPEC候補がある場合・機能追加のみ）
/agentdev/case-open     # Issue を作成
/agentdev/case-run      # 実装して PR を作成
/agentdev/case-close    # PR をマージして Issue をクローズ
```

最大自走モード。req-define 完了後、後続工程を一括実行する。

```
/agentdev/case-auto     # req-save → spec-save → case-open → case-run → case-close を自走（明示指定時のみ）
```

## 適用プロジェクトへの導入

AgentDevFlow を外部プロジェクトに導入する手順。

### インストール

通常版（GitHub 版 OpenCode を利用する環境）のインストール。

```powershell
# 1. scripts/ を適用先リポジトリにコピー
# 2. インストールを実行（clone + ジャンクション 作成）
./scripts/install-consumer-opencode.ps1 -Mode apply
```

ローカル版（ローカル版 OpenCode を利用する環境）のインストール。`-LocalMode` を付けると `agentdev-gh-cli` だけが `src/opencode-local/agentdev-gh-cli/` へ接続され、それ以外の command/skill は通常版と同じ `src/opencode/` 配下へ接続される（REQ-0103-158、ADR-0131）。

```powershell
./scripts/install-consumer-opencode.ps1 -Mode apply -LocalMode
```

### 状態確認

```powershell
# インストール状態を確認（リンクモードを自動検出して報告）
./scripts/check-consumer-opencode.ps1
```

### 更新

```powershell
# agent-dev-flow の最新を取得して再同期
cd .agentdev-plugin && git pull && cd ..
./scripts/install-consumer-opencode.ps1 -Mode apply
# ローカル版環境の場合は -LocalMode を付けて再実行
# ./scripts/install-consumer-opencode.ps1 -Mode apply -LocalMode
```

### 推奨 .gitignore 設定

通常版・ローカル版ともに同一。`agentdev-gh-cli` はリンク先が異なるだけなので `.opencode/skills/agentdev-*/` パターンで網羅される。

```gitignore
.agentdev-plugin/
.sisyphus/
.opencode/commands/agentdev/
.opencode/skills/agentdev-*/
```

> `.agentdev/` は gitignore に**含めない**こと（ドメイン状態として git 管理対象）。
