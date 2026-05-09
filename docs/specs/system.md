# System Specification

## コマンドシステム

### issue-*コマンド群

issue-*コマンドは8つのコマンドで構成され、3マクロフェーズの開発ワークフローを提供する。

| コマンド | 役割 | エージェント |
|---|---|---|
| `/issue/issue-req` | 要件定義（壁打ち） | prometheus |
| `/issue/issue-save-req` | 要件定義の保存 | sisyphus |
| `/issue/issue-create` | Issue登録 | sisyphus |
| `/issue/issue-work` | 実装パイプライン（3フェーズ構成: 準備→実装→提出）。複数Issueの並列実行に対応 | sisyphus |
| `/issue/issue-update` | Issue更新 | sisyphus |
| `/issue/issue-close` | 完了処理 | sisyphus |
| `/issue/issue-next` | 次コマンド推論 | sisyphus |
| `/issue/issue-backlog` | バックログ抽出（ショートカット経路） | sisyphus |

コマンドごとに適切なagentをfrontmatterに指定（issue-req: prometheus、それ以外: sisyphus）。

### tips-*コマンド群

tips-*コマンドは3つのコマンドで構成され、学びの3層パイプライン（キャプチャ→分析→昇華）を提供する。

| コマンド | 役割 | 層 |
|---|---|---|
| `/tips/tips-add` | inbox.mdに学びを追加 | キャプチャ層 |
| `/tips/tips-refactor` | セマンティック分析→evaluation-report.md→archive移動 | 分析層 |
| `/tips/tips-elevate` | 昇華判定→stagingスタブ生成 | 昇華層 |

データフロー: `inbox.md` →（tips-refactor）→ `archive.md` + `evaluation-report.md` →（tips-elevate）→ `elevation-staging/`

補助スキル: `tips-capture`（学び検知・追加提案、issue-closeに統合）

### 安全性スキル

`gh-cli-best-practices`: Windows PowerShell環境でのgh CLI使用時の安全性を確保する。WRITE操作（`--body-file`経由）とREAD操作（一時ファイル経由でRead tool使用）の両方をカバーし、文字化けを防止する。

### Epic自動クローズ

`issue-close` Step 8 で親Epic本文更新後、Epic内の全子Issue状態を確認し、全完了時にEpicを自動クローズする。子Issue残存時はスキップし完了報告に状況を表示する。
