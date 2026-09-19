<!-- ADF-COVERS(implementation): REQ-008-010, REQ-008-011 -->
# 成果物、状態モデル

AgentDevFlow を構成する成果物の種別、配置、ライフサイクルを説明する。

## 文書種別の配置

| 種別 | 格納先 |
|------|--------|
| REQ | `docs/requirements/REQ-{NNN}.md` |
| Decision（現行） | `docs/decisions/DEC-{NNN}.md` |
| Design | `docs/designs/**/*.md` |
| Report | `docs/reports/**/*.md` |
| Knowledge | `docs/knowledge/*.md` |
| guides | `docs/guides/*.md` |

各文書種別の役割、文書体系の読み方、優先順位、参照ルールの正は [プロジェクトドキュメントと Design](project-docs-and-specs.md) を参照する。
未解決事項の追跡は追跡Issue（GitHub Issue の管理単位・永続状態）で行い、docs/ 配下に課題ファイルの文書種別は設けない（REQ-049）。

## コマンド、スキル体系

| 成果物 | 格納先 | 役割 |
|--------|--------|------|
| Command | `src/opencode/commands/agentdev/`（実行時: `.opencode/commands/agentdev/`） | 実行手順の一次参照（Step 番号、入出力契約） |
| Skill | `src/opencode/skills/agentdev-*`（実行時: `.opencode/skills/agentdev-*`） | 判定基準、共通知識、宣言的ルールの一次参照 |
| Template | Skill 配下 `templates/` | Issue/PR 本文の出力構造とプレースホルダー |
| Script | Skill 配下 `scripts/` | ガードレール、検査、補助処理の実行可能ロジック |
| リポジトリ専用 Command | `.opencode/commands/repo/`（原本なし、配置先のみ） | AgentDevFlow 本体リポジトリ専用コマンド（DEC-001）。配布対象外 |
| リポジトリ専用 Skill | `.opencode/skills/repo-*/`（原本なし、配置先のみ） | AgentDevFlow 本体リポジトリ専用スキル（DEC-001）。配布対象外 |

Command は判定ロジックを Skill の参照先に委ねる。
Command の Step 番号やファイルパスは Command 側で管理する。
Script は決定的で単体テスト可能な処理に限定する。

### テンプレート配置

| 種別 | 配置先 |
|------|--------|
| Issue/コメント/PR | `agentdev-workflow-templates/templates/` |
| REQ | `agentdev-req-file-manager/templates/` |
| Decision | `agentdev-decision-file-manager/templates/` |

## ディレクトリ構造

### 本体リポジトリ（self-hosting）

```
docs/
requirements/REQ-{NNN}.md     # 要件定義（基準）
  decisions/
    DEC-{NNN}.md            # 現行 Decision（基準）
    README.md               # Decision 索引
  designs/**/*.md                   # 現在設計（commands/skills/workflows の3層 + 基盤6ドメイン、リポジトリ内部の設計文書、基準）
  reports/**/*.md                   # 監査・評価・観測記録（Report、Design とは分離）
  guides/*.md                    # 参照用読み物（案内層、非基準）
.agentdev/
  intake/                        # Intake パイプラインのドメイン状態
    inbox/ promoted/
  learning/                      # Learning パイプラインのドメイン状態
    inbox.md deferred.md evaluation-report.md promoted/
  backlog/req-units/RU-*.md      # Requirement Unit
  integrity/                     # 整合性検証レポート
.opencode/                        # 実行時の配置先（ジャンクション → src/opencode/）
  commands/agentdev/             # Command 定義（AgentDevFlow 配布対象）
  commands/repo/                 # AgentDevFlow 本体リポジトリ専用コマンド（DEC-001、配布対象外）
  skills/agentdev-*/             # Skill 定義（AgentDevFlow 配布対象）
  skills/repo-*/                 # AgentDevFlow 本体リポジトリ専用スキル（DEC-001、配布対象外）
src/opencode/                     # 原本（正規の定義ファイル）
  commands/agentdev/             # Command 原本
  skills/agentdev-*/             # Skill 原本
scripts/
  self-sync.ps1                  # AgentDevFlow 本体リポジトリ用同期スクリプト（self-hosting 向け公開入口）
  install.ps1                    # 適用プロジェクト用公開入口（install・check・dry-run）
  consumer/                      # install.ps1 の内部処理（単体実行しない）
  self/                          # self-hosting 固有の配布・検証・保守処理（単体実行しない）
```

### 適用プロジェクト（consumer-with-agentdev）

```
.agentdev-plugin/                # agent-dev-flow の git clone 先（適用プロジェクト専用）
  src/opencode/                  # 原本（clone 内）
    commands/agentdev/           # Command 原本
    skills/agentdev-*/           # Skill 原本
.agentdev/
  intake/                        # Intake パイプラインのドメイン状態
    inbox/ promoted/
  learning/                      # Learning パイプラインのドメイン状態
  backlog/req-units/RU-*.md      # Requirement Unit
  integrity/                     # 整合性検証レポート
.opencode/                       # 実行時の配置先（ジャンクション → .agentdev-plugin/src/opencode/）
  commands/agentdev/             # ジャンクション → .agentdev-plugin/src/opencode/commands/agentdev/
  commands/{local}/              # プロジェクト独自コマンド（実ディレクトリ）
  skills/agentdev-*/             # ジャンクション → .agentdev-plugin/src/opencode/skills/agentdev-*/
  skills/{local}-*/              # プロジェクト独自スキル（実ディレクトリ）
scripts/
  install.ps1                    # 適用プロジェクト用公開入口（install・check・dry-run）
  consumer/                      # install.ps1 の内部処理（単体実行しない）
```

### ディレクトリ責務の補足

- `.agentdev/`: AgentDevFlow のドメイン状態。Intake / Learning / Backlog / 整合性の永続データを管理する。配布物ではなく、リポジトリの動作状態を保持する（DEC-001）。AgentDevFlow 本体リポジトリ / 適用プロジェクトの双方で使用される。
- `.agentdev-plugin/`: 適用プロジェクトにおける agent-dev-flow のチェックアウト先。AgentDevFlow 本体リポジトリでは直接 `.agentdev/` を使用する。`.gitignore` で管理対象外とする。
- `.agentdev/drafts/`: コマンドワークフローでのみ明示的に定義された作業中ドラフトの引き継ぎに使用する一時領域。

## 成果物ライフサイクル

| 成果物 | 生成 | 読取り | 削除トリガー |
|--------|------|------|-------------|
| 採用済み成果物（Intake） | `/agentdev/intake-promote` | `/agentdev/backlog-review` | RU 化成功時 |
| 採用済み成果物（Learning） | `/agentdev/learning-promote` | `/agentdev/backlog-review` | RU 化成功時 |
| RU | `/agentdev/backlog-review`, セッション由来 | `/agentdev/req-define`, case-open / case-ready（内部 lifecycle 段階） | case-ready（case-auto 駆動）の Definition 確定 + VERIFY 成功時 |
| REQ ファイル | case-ready, case-revise（内部 lifecycle 段階） | case-open, case-run, case-close（内部 lifecycle 段階） | なし（永続） |
| 追跡Issue | `/agentdev/issue`、各 workflow | `/agentdev/issue`、`/agentdev/req-define`（実行確定時の要件化経路） | なし（永続。解決済み、クローズ済みも同一体系内に残置） |
| Case Issue | case-open（case-auto 駆動） | case-run, case-close（内部 lifecycle 段階） | なし（永続） |

流れは以下の通り。
採用済み成果物 / セッション由来 → RU → REQ ファイル / Issue → マージ → クローズ。
RU 削除は case-ready（内部 lifecycle 段階）の Definition 確定 + VERIFY 成功時に行う（case-open は RU を削除しない）。

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

6 マイクロフェーズは説明用ラベルであり、状態管理モデルではない。
AgentDevFlow は全体横断の状態遷移モデルを持たない。
各コマンドの入出力契約とディレクトリ配置が実際の状態表現である。

## 状態モデル制約

以下の制約を AgentDevFlow の状態モデルに適用する。

- REQ / Design の状態管理は Issue ラベル、GitHub Project で行う
- intake promoted の route / status はディレクトリ配置で表現する
- frontmatter や status フィールドによる状態管理は行わず、各段階の進行はディレクトリ構造で追跡する
- Issue / PR の状態を docs に複製しない
- 入口表は次に実行すべきコマンドの案内であり、状態遷移エンジンではない

## .agentdev/ の位置づけ

`.agentdev/` は AgentDevFlow の正規のドメイン状態（永続的な管理情報）である。

- **ドメイン状態**: Intake / Learning / Backlog / 整合性のパイプライン状態を保持する
- **配布物ではない**: 実行時配布物の一部ではなく、リポジトリローカルの作業領域である
- **git 管理対象**: ドメイン状態として git 管理対象とし、コマンド実行時に scoped commit で永続化される
