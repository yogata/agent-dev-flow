# opencode-config

OpenCodeの設定を管理するリポジトリです。Issue駆動開発ワークフローを支えるコマンド・スキル・ドキュメントを一元管理しています。

## クイックスタート

機能追加（Pattern B）の最小フローを示します。バグ修正（Pattern A）は `/issue/issue-req` 後に `/issue/issue-create` へ進みます。

### 1. 要件を壁打ちする（壁打ちフェーズ）

```
/issue/issue-req
```

AIと対話しながら要件を整理します。完了すると壁打ち成果物が生成されます。

### 2. 要件を保存する（Pattern B のみ）

```
/issue/issue-save-req
```

壁打ち成果物を `docs/requirements/REQ-*.md` と `docs/adr/ADR-*.md` に保存し、コミット・プッシュします。

### 3. Issue を作成する

```
/issue/issue-create
```

REQファイルの内容からGitHub Issueを自動生成します。

### 4. 実装する（構造的実行フェーズ）

```
/issue/issue-work
```

Plan策定から実装、コミットまで一気通貫で実行します。worktreeで作業し、PRも作成されます。

### 5. レビューしてクローズする（レビュー完了フェーズ）

```
/issue/issue-close
```

PRをマージし、対応記録をIssueに追記してクローズ、ブランチを削除します。

## コマンド一覧

### issue コマンド（開発ワークフロー）

| コマンド | 役割 | 対象フェーズ |
|----------|------|-------------|
| `issue-req` | 要件の壁打ち・整理 | 壁打ちフェーズ |
| `issue-save-req` | 壁打ち成果物をREQ/ADRファイルとして保存 | 壁打ちフェーズ |
| `issue-create` | REQファイルからGitHub Issue作成 | 壁打ちフェーズ |
| `issue-work` | 計画立案から実装・コミット・PR作成まで一括実行 | 構造的実行フェーズ |
| `issue-update` | Issue本文の更新やコメント追加 | 構造的実行・レビュー完了 |
| `issue-close` | PRマージ・記録追記・Issueクローズ・ブランチ削除 | レビュー完了フェーズ |
| `issue-backlog` | クローズ済みissue/PRから残課題を抽出・分類しdraftとして保存 | 壁打ちフェーズ |
| `issue-backlog-create` | 承認済みバックログdraftからEpic+子Issueを作成 | 壁打ちフェーズ |
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
| `issue-lifecycle` | フェーズ定義・SSoT遷移・パターン判定基準を提供 |
| `issue-completion-reporting` | 完了報告フォーマットとチェックボックス更新ルールを提供 |
| `issue-post-review-routing` | レビューNG時の対応フローと次コマンド推論ルールを提供 |
| `req-analysis` | 要件分析手法と品質基準、ADR閾値判定を提供 |
| `req-file-manager` | REQファイルの作成・追記・更新を管理 |
| `adr-guidelines` | アーキテクチャ決定のADR要否を評価 |
| `adr-file-manager` | ADRファイルの作成・追記・更新を管理 |
| `spec-compliance` | 実装と要件の乖離を検出する品質ゲート |

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
| spec-compliance | 実装と要件の乖離を検出する品質ゲート手法 |
| conventional-commits | Conventional Commits v1.0.0 に準拠したコミットメッセージ形式 |
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
