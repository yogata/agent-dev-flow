# 成果物、状態モデル

AgentDevFlow を構成する成果物の種別、配置、ライフサイクルを説明する。

## 文書種別

| 種別 | 格納先 | 役割 |
|------|--------|------|
| REQ | `docs/requirements/REQ-{NNNN}.md` | 要件定義の永続基準 |
| ADR（現行） | `docs/adr/ADR-01XX.md` | 現行基準の技術判断記録 |
| ADR（廃止済み） | `docs/adr/retired/ADR-00XX.md` | 再編前の履歴番号帯。履歴参照用である |
| SPEC | `docs/specs/*.md` | 実装者が参照する現在仕様 |
| DOC-MAP | `docs/DOC-MAP.md` | 文書探索、参照経路の入口（索引） |
| guides | `docs/guides/*.md` | 利用者向けの参照用読み物 |

**優先順位**: REQ > ADR > SPEC。DOC-MAP と guides は基準への導線を提供する。基準文書と矛盾する記述がある場合は基準を優先する。

### 参照ルール

- REQ → ADR、ADR → ADR、Issue → ADR の参照を許可
- ADR → Issue の逆参照は不可
- 文書間矛盾時は REQ を優先

## コマンド、スキル体系

| 成果物 | 格納先 | 役割 |
|--------|--------|------|
| Command | `src/opencode/commands/agentdev/`（実行時: `.opencode/commands/agentdev/`） | 実行手順の一次参照（Step 番号、入出力契約） |
| Skill | `src/opencode/skills/agentdev-*`（実行時: `.opencode/skills/agentdev-*`） | 判定基準、共通知識、宣言的ルールの一次参照 |
| Template | Skill 配下 `templates/` | Issue/PR 本文の出力構造とプレースホルダー |
| Script | Skill 配下 `scripts/` | ガードレール、検査、補助処理の実行可能ロジック |
| リポジトリ専用 Command | `.opencode/commands/repo/`（原本なし、配置先のみ） | AgentDevFlow 本体リポジトリ専用コマンド（ADR-0106）。配布対象外 |
| リポジトリ専用 Skill | `.opencode/skills/repo-*/`（原本なし、配置先のみ） | AgentDevFlow 本体リポジトリ専用スキル（ADR-0106）。配布対象外 |

Command は判定ロジックを Skill の参照先に委ねる。Skill は Command の Step 番号やファイルパスは Command 側で管理する。Script は決定的で単体テスト可能な処理に限定する。

### テンプレート配置

| 種別 | 配置先 |
|------|--------|
| Issue/コメント/PR | `agentdev-workflow-templates/templates/` |
| REQ | `agentdev-req-file-manager/templates/` |
| ADR | `agentdev-adr-file-manager/templates/` |

## ディレクトリ構造

### 本体リポジトリ（self-hosting）

```
docs/
  requirements/REQ-{NNNN}.md    # 要件定義（基準）
  adr/
    ADR-01XX.md              # 現行基準の ADR（基準）
    retired/
      ADR-00XX.md            # 再編前 ADR（履歴、現行根拠ではない）
    README.md                # ADR 索引
  specs/*.md                     # 現在仕様（リポジトリ内部の設計文書、基準）
  DOC-MAP.md                     # 文書探索入口（非基準）
  guides/*.md                    # 参照用読み物（案内層、非基準）
.agentdev/
  intake/                        # Intake パイプラインのドメイン状態
    inbox/ promoted/ archive/
  learning/                      # Learning パイプラインのドメイン状態
    inbox.md archive/active.md evaluation-report.md promoted/
  backlog/req-units/RU-*.md      # Requirement Unit
  integrity/                     # 整合性検証レポート
.opencode/                        # 実行時の配置先（ジャンクション → src/opencode/）
  commands/agentdev/             # Command 定義（AgentDevFlow 配布対象）
  commands/repo/                 # AgentDevFlow 本体リポジトリ専用コマンド（ADR-0106、配布対象外）
  skills/agentdev-*/             # Skill 定義（AgentDevFlow 配布対象）
  skills/repo-*/                 # AgentDevFlow 本体リポジトリ専用スキル（ADR-0106、配布対象外）
src/opencode/                     # 原本（正規の定義ファイル）
  commands/agentdev/             # Command 原本
  skills/agentdev-*/             # Skill 原本
scripts/
  sync-self-opencode.ps1         # AgentDevFlow 本体リポジトリ用同期スクリプト
  install-consumer-opencode.ps1  # 適用プロジェクト用インストールスクリプト
  check-consumer-opencode.ps1    # 適用プロジェクト用状態確認スクリプト
.sisyphus/                       # 一時的な実行時作業領域（ドメイン状態ではない、ADR-0104）
  drafts/                        # コマンドワークフローの作業用一時領域（明示的な引き継ぎ時のみ使用）
```

### 適用プロジェクト（consumer-with-agentdev）

```
.agentdev-plugin/                # agent-dev-flow の git clone 先（適用プロジェクト専用）
  src/opencode/                  # 原本（clone 内）
    commands/agentdev/           # Command 原本
    skills/agentdev-*/           # Skill 原本
.agentdev/
  intake/                        # Intake パイプラインのドメイン状態
    inbox/ promoted/ archive/
  learning/                      # Learning パイプラインのドメイン状態
  backlog/req-units/RU-*.md      # Requirement Unit
  integrity/                     # 整合性検証レポート
.opencode/                       # 実行時の配置先（ジャンクション → .agentdev-plugin/src/opencode/）
  commands/agentdev/             # ジャンクション → .agentdev-plugin/src/opencode/commands/agentdev/
  commands/{local}/              # プロジェクト独自コマンド（実ディレクトリ）
  skills/agentdev-*/             # ジャンクション → .agentdev-plugin/src/opencode/skills/agentdev-*/
  skills/{local}-*/              # プロジェクト独自スキル（実ディレクトリ）
scripts/
  install-consumer-opencode.ps1  # 適用プロジェクト用インストールスクリプト
  check-consumer-opencode.ps1    # 適用プロジェクト用状態確認スクリプト
.sisyphus/                       # 一時的な実行時作業領域
```

### ディレクトリ責務の補足

- `.agentdev/`: AgentDevFlow のドメイン状態。Intake / Learning / Backlog / 整合性の永続データを管理する。配布物ではなく、リポジトリの動作状態を保持する（ADR-0103）。AgentDevFlow 本体リポジトリ / 適用プロジェクトの双方で使用される。
- `.agentdev-plugin/`: 適用プロジェクトにおける agent-dev-flow の git clone 先（REQ-0103-072~077）。AgentDevFlow 本体リポジトリでは直接 `.agentdev/` を使用する。`.gitignore` で管理対象外とする。
- `.sisyphus/`: 実行時の一時作業領域。ドメイン状態ではなく、`.gitignore` で管理対象外とする（ADR-0104）。
- `.agentdev/drafts/`: コマンドワークフローでのみ明示的に定義された作業中ドラフトの引き継ぎに使用する一時領域。

## 成果物ライフサイクル

| 成果物 | 生成 | 読取り | 削除トリガー |
|--------|------|------|-------------|
| 採用済み成果物（Intake） | `/agentdev/intake-promote` | `/agentdev/backlog-review` | RU 化成功時 |
| 採用済み成果物（Learning） | `/agentdev/learning-promote` | `/agentdev/backlog-review` | RU 化成功時 |
| RU | `/agentdev/backlog-review`, セッション由来 | `/agentdev/req-define`, `/agentdev/req-save`, `/agentdev/case-open` | `/agentdev/case-open` の Issue 作成 + VERIFY 成功時 |
| REQ ファイル | `/agentdev/req-save` | `/agentdev/case-open`, `/agentdev/case-run`, `/agentdev/case-close` | なし（永続） |
| Issue | `/agentdev/case-open` | `/agentdev/case-run`, `/agentdev/case-close` | なし（永続） |

流れは以下の通り。採用済み成果物 / セッション由来 → RU → REQ ファイル / Issue → マージ → クローズ。RU 削除は `/agentdev/case-open` の永続化成功に限定する。

## フェーズ体系

ワークフローは3つのマクロフェーズで構成される。

| マクロフェーズ | 対応マイクロフェーズ | SSoT 境界 |
|---------------|---------------------|---------|
| 壁打ち | `requirement` → `analyzed` | docs 変更を commit/push |
| 構造的実行 | `created` → `in_progress` | Issue 本文が SSoT |
| レビュー完了 | `review` → `done` | PR + Issue が SSoT |

| マイクロフェーズ | 状態 | マクロフェーズ |
|-----------------|------|---------------|
| `requirement` | 要件定義中 | 壁打ち |
| `analyzed` | 分析完了、Issue 未作成 | 壁打ち |
| `created` | Issue 作成済み、作業前 | 構造的実行 |
| `in_progress` | 実装中 | 構造的実行 |
| `review` | PR 作成済み、レビュー中 | レビュー完了 |
| `done` | 完了（post-run capture 含む） | レビュー完了 |

6 マイクロフェーズは説明用ラベルであり、AgentDevFlow は全体横断の状態遷移モデルではなく、各コマンドの入出力契約とディレクトリ配置が実際の状態表現である（REQ-0112-023）。

## 状態モデル制約（REQ-0112）

以下の制約を AgentDevFlow の状態モデルに適用する。

- REQ / SPEC の状態管理は Issue ラベル、GitHub Project で行う（REQ-0112-027）
- intake promoted の route / status はディレクトリ配置で表現する（REQ-0112-028）
- Issue / PR の状態を docs に複製しない（REQ-0112-029）
- command-map を状態遷移エンジン化しない（REQ-0112-030）

## .agentdev/ の位置づけ

`.agentdev/` は AgentDevFlow の正規のドメイン状態（永続的な管理情報）である（REQ-0112-024）。

- **ドメイン状態**: Intake / Learning / Backlog / 整合性のパイプライン状態を保持する
- **配布物ではない**: 実行時配布物の一部ではなく、agent-dev-flow リポジトリ内の作業領域である
- **git 管理対象**: コマンド実行時に scoped commit で永続化される
- `.sisyphus/` は実行時作業領域であり、ドメイン状態ではない
