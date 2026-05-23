# agent-dev-flow

AgentDevFlow plugin の設定を管理するリポジトリです。AI agent-assisted development workflow を支えるコマンド・スキル・ドキュメントを一元管理しています。

## AgentDevFlow Plugin

| 項目 | 値 |
|------|------|
| Plugin 表示名 | `AgentDevFlow` |
| Canonical namespace | `agentdev` |
| Public command prefix | `/agentdev/*` |
| Domain state directory | `.agentdev/` |
| Skill prefix | `agentdev-*` |
| Domains | req, case, learning, intake, integrity |

詳細は [ADR-0005](docs/adr/ADR-0005.md) および [REQ-0017](docs/requirements/REQ-0017.md) を参照。

## ワークフローの入口

AgentDevFlow には3つの系統があり、それぞれ目的と入口コマンドが異なります。

| 系統 | 目的 | 入口コマンド | 流れ |
|------|------|-------------|------|
| 通常開発 | 機能追加・バグ修正 | `/agentdev/req-define` | req-define → req-save → case-open → case-run → case-close |
| Learning 起点 | 再発防止知見の蓄積・昇華 | `/agentdev/learning-refine` | learning-capture（スキル）→ learning-refine → learning-promote → req-define に合流 |
| Intake 起点 | 具体的な作業候補の収集・促進 | `/agentdev/intake-capture` | intake-capture → intake-review → intake-promote → req-define または intake-open |

各系統の domain state（ファイル・ディレクトリ）がどの状態を表すかは [domain state lifecycle](docs/guides/domain-state-lifecycle.md) を参照。

## クイックスタート

機能追加の最小フローを示します。バグ修正は `/agentdev/req-define` 後に `/agentdev/case-open` へ進みます。

### 1. 要件を壁打ちする（壁打ちフェーズ）

```
/agentdev/req-define
```

AIと対話しながら要件を整理します。完了すると壁打ち成果物が生成されます。

### 2. 要件を保存する（機能追加のみ）

```
/agentdev/req-save
```

壁打ち成果物を `docs/requirements/REQ-*.md` と `docs/adr/ADR-*.md` に保存し、コミット・プッシュします。

### 3. Issue を作成する

```
/agentdev/case-open
```

REQファイルの内容からGitHub Issueを自動生成します。

### 4. 実装する（構造的実行フェーズ）

```
/agentdev/case-run
```

Plan策定から実装、コミットまで一気通貫で実行します。worktreeで作業し、PRも作成されます。

### 5. レビューしてクローズする（レビュー完了フェーズ）

```
/agentdev/case-close
```

PRをマージし、対応記録をIssueに追記してクローズ、ブランチを削除します。

## コマンド・スキル・用語

コマンド・スキルの詳細は以下を参照:
- コマンド一覧・基本フロー: [commands/agentdev/README.md](.opencode/commands/agentdev/README.md)
- コマンド関連マップ・データフロー: [command-map.md](.opencode/skills/agentdev-workflow-lifecycle/reference/command-map.md)
- システム仕様: [system.md](docs/specs/system.md)

## ドキュメント構造

```
docs/
  specs/           # システム仕様・実装パターン
    system.md      # コマンドシステムの構成定義
    patterns.md    # コード規約と実装パターン
    design-principles.md # 設計原則
  guides/          # 利用者向けガイド
  requirements/    # 要件定義書（REQ-*.md）
  adr/             # アーキテクチャ決定記録（ADR-*.md）
.agentdev/         # AgentDevFlow domain state
  intake/          # 気づき・課題の収集・レビュー・促進（inbox/, accepted/, promoted/, archive/）
  learning/        # 学びの蓄積・昇華（inbox.md, archive.md, evaluation-report.md, elevation-staging/）
  integrity/       # 整合性検証レポート
.sisyphus/         # Sisyphus 作業領域（詳細は system.md 参照）
.opencode/
  commands/agentdev/  # AgentDevFlow コマンド定義
  skills/            # スキル定義（SKILL.md）
```
