# opencode-config

OpenCodeの設定を管理するリポジトリです。Issue駆動開発ワークフローを支えるコマンド・スキル・ドキュメントを一元管理しています。

## クイックスタート

機能追加（Pattern B）の最小フローを示します。バグ修正（Pattern A）は `/issue/issue-req` 後に `/issue/issue-create` へ進みます。

### 1. 要件を壁打ちする（Phase 1）

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

### 4. 実装する（Phase 2）

```
/issue/issue-work
```

Plan策定から実装、コミットまで一気通貫で実行します。worktreeで作業し、PRも作成されます。

### 5. レビューしてクローズする（Phase 3）

```
/issue/issue-close
```

PRをマージし、対応記録をIssueに追記してクローズ、ブランチを削除します。

## コマンド一覧

### issue コマンド（開発ワークフロー）

| コマンド | 役割 | 対象フェーズ |
|----------|------|-------------|
| `issue-req` | 要件の壁打ち・整理 | Phase 1 |
| `issue-save-req` | 壁打ち成果物をREQ/ADRファイルとして保存 | Phase 1 |
| `issue-create` | REQファイルからGitHub Issue作成 | Phase 1 |
| `issue-work` | 計画立案から実装・コミット・PR作成まで一括実行 | Phase 2 |
| `issue-update` | Issue本文の更新やコメント追加 | Phase 2-3 |
| `issue-close` | PRマージ・記録追記・Issueクローズ・ブランチ削除 | Phase 3 |
| `issue-backlog` | クローズ済みissue/PRから残課題を抽出しEpic+子Issueを作成 | Phase 1 |
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
| `issue-reporting` | 完了報告フォーマットとチェックボックス更新ルールを提供 |
| `issue-review-routing` | レビューNG時の対応フローと次コマンド推論ルールを提供 |
| `req-analysis` | 要件分析手法と品質基準、ADR閾値判定を提供 |
| `req-file-manager` | REQファイルの作成・追記・更新を管理 |
| `adr-guidelines` | アーキテクチャ決定のADR要否を評価 |
| `adr-file-manager` | ADRファイルの作成・追記・更新を管理 |
| `spec-compliance` | 実装と要件の乖離を検出する品質ゲート |

## 用語集

| 用語 | 定義 |
|------|------|
| Phase 1 | バイブス壁打ちフェーズ。AIと対話し要件・設計を固める |
| Phase 2 | 構造的実行フェーズ。Planに沿って実装しコミットする |
| Phase 3 | レビュー完了フェーズ。PRマージ・Issueクローズ・事後処理 |
| Pattern A | バグ修正パターン。issue-req → issue-create と短い流れ |
| Pattern B | 機能追加パターン。issue-req → issue-save-req → issue-create と段階を踏む |
| REQ | Requirement。要件定義書。`docs/requirements/REQ-*.md` に格納 |
| ADR | Architecture Decision Record。設計判断の記録。`docs/adr/ADR-*.md` に格納 |
| SSoT | Single Source of Truth。情報の唯一の正しい源。Issue本文がSSoT |
| Worktree | git worktree。メインワーキングツリーとは別の作業ディレクトリで並行開発に使用 |
| Boulder | Sisyphusフレームワークの作業単位。Plan内の個別タスク |
| Sisyphus | 本リポジトリの開発フレームワーク名。Plan管理とタスク実行を統括 |
| Prometheus | SisyphusフレームワークのPlan策定エージェント |
| Metis | 知恵・戦略を司るエージェント。要件分析や判断を支援 |
| Momus | 批評・レビューを担当するエージェント |
| Librarian | 情報検索・整理を担当するエージェント |
| Oracle | 知識ベースへの問い合わせを行うエージェント |
| Explore | コードベース探索を担当するエージェント |
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
