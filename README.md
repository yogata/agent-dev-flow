<!-- ADF-COVERS(implementation): REQ-001-055 -->
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
| 要件docがあり、機能追加の場合 | `/agentdev/req-save` | REQ/Decision ファイル |
| REQ/Decision ファイルがあり、Design候補がある場合 | `/agentdev/design-save` | Design ファイル（`docs/designs/`） |
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

機能追加の最小フロー。バグ修正は `/agentdev/req-define` 後に `/agentdev/case-open` に進む。

```
/agentdev/req-define    # 要件を壁打ちする
/agentdev/req-save      # REQ/Decision ファイルとして保存（機能追加のみ）
/agentdev/design-save     # Design候補を docs/designs/ に保存（Design候補がある場合・機能追加のみ）
/agentdev/case-open     # Issue を作成
/agentdev/case-run      # 実装して PR を作成
/agentdev/case-close    # PR をマージして Issue をクローズ
```

最大自走モード。req-define 完了後、後続工程を一括実行する。

```
/agentdev/case-auto     # req-save → design-save → case-open → case-run → case-close を自走（明示指定時のみ）
```

## 適用プロジェクトへの導入

AgentDevFlow を外部プロジェクトに導入する手順。

### 前提: provisioning と install は別軸

導入は2つの独立した軸で構成する。

- **provisioning（チェックアウトの取得）**: 利用者の責務。git clone または GitHub ソース ZIP の展開のいずれかで、`.agentdev-plugin/` に agent-dev-flow のチェックアウトを用意する
- **install（実行時の接続）**: install スクリプトが `.opencode/` 配下を junction で `.agentdev-plugin/src/opencode/` へ接続する（link mode）

install スクリプトは provisioning（clone、fetch、reset）も network access も行わない。どちらの provisioning 形態でも install 手段は link mode に限られ、ZIP 展開による provisioning は配布成果物の実体コピーを伴わない。

> 「source ZIP によるチェックアウト供給」と「release archive projection」（REQ-029 が別途定義する配布と検証の投影）は別の概念である（DEC-014）。本導入手順の ZIP 展開は前者であり、後者を扱わない。

### インストール

通常版（GitHub 版 OpenCode を利用する環境）のインストール。

```powershell
# 1. provisioning: .agentdev-plugin/ にチェックアウトを用意する（どちらか）
git clone https://github.com/yogata/agent-dev-flow.git .agentdev-plugin
# または: GitHub リポジトリの [Code] → [Download ZIP] でソース ZIP を取得し、
# 展開した中身（src/、scripts/ 等）を .agentdev-plugin/ 直下に配置

# 2. install: 導入先リポジトリのルートで実行（junction を作成）
./.agentdev-plugin/scripts/install-consumer-opencode.ps1 -Mode apply
```

ローカル版（ローカル版 OpenCode を利用する環境）のインストール。`-LocalMode` を付けると `agentdev-gh-cli` だけが `src/opencode-local/agentdev-gh-cli/` へ接続され、それ以外の command/skill は通常版と同じ `src/opencode/` 配下へ接続される（REQ-009、DEC-004）。

```powershell
./.agentdev-plugin/scripts/install-consumer-opencode.ps1 -Mode apply -LocalMode
```

> ZIP 展開チェックアウト（`.git` なし）は正規の provisioning 形態だが、サポート対象外の環境である（不具合報告の受け付け対象外）。版の確認など git を前提とする運用には git clone を使う。
>
> スクリプトを `./scripts/` として導入先リポジトリに置く場合は、`.agentdev-plugin/` と同一のチェックアウトからコピーする（スクリプトとチェックアウトの版不一致を防ぐため）。

### 状態確認

```powershell
# インストール状態を確認（リンクモードを自動検出して報告）
./.agentdev-plugin/scripts/check-consumer-opencode.ps1
```

チェックアウトの git リポジトリ性は乖離ではなく情報として報告される。版（commit/branch）は `.git` が存在する場合のみ表示され、ZIP 展開環境では unknown と表示される。

### 更新

更新手順は provisioning 形式に従う。install の apply は冪等であり、再実行で junction 構成を変化させない。

```powershell
# git clone 環境: チェックアウトを更新して再同期
cd .agentdev-plugin && git pull && cd ..
./.agentdev-plugin/scripts/install-consumer-opencode.ps1 -Mode apply

# ZIP 展開環境: ソース ZIP を再取得して .agentdev-plugin/ を差し替えた後、
# 必要に応じて install を再実行する（再実行の要否は利用者の判断）
# ./.agentdev-plugin/scripts/install-consumer-opencode.ps1 -Mode apply

# ローカル版環境の場合は -LocalMode を付けて再実行
# ./.agentdev-plugin/scripts/install-consumer-opencode.ps1 -Mode apply -LocalMode
```

### 推奨 .gitignore 設定

通常版・ローカル版ともに同一。`agentdev-gh-cli` はリンク先が異なるだけなので `.opencode/skills/agentdev-*/` パターンで網羅される。`japanese-tech-writing` は配布物依存スキル（`agentdev-doc-writing` が参照、REQ-002）のため別途 gitignore に含める。runtime workspace ディレクトリの管理は harness 側の責務であり（charter 原則、DEC-001）、本 gitignore 推奨には含めない。

```gitignore
.agentdev-plugin/
.opencode/commands/agentdev/
.opencode/skills/agentdev-*/
.opencode/skills/japanese-tech-writing/
```

> `.agentdev/` は gitignore に**含めない**こと（ドメイン状態として git 管理対象）。
