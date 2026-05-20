# opencode-config

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

## クイックスタート

機能追加（Pattern B）の最小フローを示します。バグ修正（Pattern A）は `/agentdev/req-define` 後に `/agentdev/case-open` へ進みます。

### 1. 要件を壁打ちする（壁打ちフェーズ）

```
/agentdev/req-define
```

AIと対話しながら要件を整理します。完了すると壁打ち成果物が生成されます。

### 2. 要件を保存する（Pattern B のみ）

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

## コマンド一覧

### agentdev コマンド（開発ワークフロー）

| コマンド | 役割 | 対象フェーズ |
|----------|------|-------------|
| `req-define` | 要件の壁打ち・整理 | 壁打ちフェーズ |
| `req-save` | 壁打ち成果物をREQ/ADRファイルとして保存 | 壁打ちフェーズ |
| `case-open` | REQファイルからGitHub Issue作成 | 壁打ちフェーズ |
| `case-run` | 計画立案から実装・コミット・PR作成まで一括実行 | 構造的実行フェーズ |
| `case-update` | Issue本文の更新やコメント追加 | 構造的実行・レビュー完了 |
| `case-close` | PRマージ・記録追記・Issueクローズ・ブランチ削除 | レビュー完了フェーズ |

### issue コマンド（補助ワークフロー）

| コマンド | 役割 | 対象フェーズ |
|----------|------|-------------|
| `issue-backlog` | クローズ済みissue/PRから残課題を抽出・分類しdraftとして保存 | 壁打ちフェーズ |
| `issue-next` | 現在の状態から次に実行すべきコマンドを推論 | 全フェーズ |

### tips コマンド（学びの蓄積）

| コマンド | 役割 |
|----------|------|
| `tips-add` | 学びを inbox.md に追記 |
| `tips-refactor` | inbox をセマンティック分析し評価レポートを出力して archive へ移動 |
| `tips-elevate` | 評価レポートから昇華判定を行い staging 領域にスタブ生成 |

## スキル一覧

| スキル | 役割 |
|--------|------|
| `agentdev-workflow-lifecycle` | フェーズ定義・SSoT遷移・パターン判定基準を提供 |
| `agentdev-workflow-reporting` | 完了報告フォーマットとチェックボックス更新ルールを提供 |
| `agentdev-workflow-routing` | レビューNG時の対応フローと次コマンド推論ルールを提供 |
| `agentdev-req-analysis` | 要件分析手法と品質基準、ADR閾値判定を提供 |
| `agentdev-req-file-manager` | REQファイルの作成・追記・更新を管理 |
| `agentdev-adr-guidelines` | アーキテクチャ決定のADR要否を評価 |
| `agentdev-adr-file-manager` | ADRファイルの作成・追記・更新を管理 |
| `agentdev-spec-compliance` | 実装と要件の乖離を検出する品質ゲート |

## 用語集

| 用語 | 定義 |
|------|------|
| 壁打ちフェーズ | AIと対話し要件・設計を固めるフェーズ |
| 構造的実行フェーズ | Planに沿って実装しコミットするフェーズ |
| レビュー完了フェーズ | PRマージ・Issueクローズ・事後処理を行うフェーズ |
| REQ | Requirement。要件定義書。`docs/requirements/REQ-*.md` に格納 |
| ADR | Architecture Decision Record。設計判断の記録。`docs/adr/ADR-*.md` に格納 |
| SSoT | Single Source of Truth。情報の唯一の正しい源。フェーズごとに遷移: 壁打ちフェーズ=セッション会話+draft、構造的実行フェーズ=Issue本文+Work Plan、レビュー完了フェーズ=PR+レビュー結果 |
| Worktree | git worktree。メインワーキングツリーとは別の作業ディレクトリで並行開発に使用 |
| agentdev-spec-compliance | 実装と要件の乖離を検出する品質ゲート手法 |
| agentdev-conventional-commits | Conventional Commits v1.0.0 に準拠したコミットメッセージ形式 |
| specs | 仕様書。`docs/specs/` に格納されるシステム仕様と実装パターン |
| drafts | Planの下書き。`.sisyphus/drafts/` に格納 |
| archives | 完了したPlanのアーカイブ。`.sisyphus/archives/` に移動 |

## ドキュメント構造

```
docs/
  specs/           # システム仕様・実装パターン
    system.md      # コマンドシステムの構成定義
    patterns.md    # コード規約と実装パターン
    design-principles.md # 設計原則
  requirements/    # 要件定義書（REQ-*.md）
  adr/             # アーキテクチャ決定記録（ADR-*.md）
.sisyphus/
  plans/           # 開発計画（plan名.md）
  drafts/          # 計画の下書き
  evidence/        # 実行の証跡
  execution/       # 実行状態
  notepads/        # 作業メモ（plan名/）
  tasks/           # タスク定義
  reports/         # レポート出力
  archives/         # 完了済みPlanのアーカイブ
.opencode/
  commands/        # カスタムコマンド定義
  skills/          # スキル定義（SKILL.md）
```
