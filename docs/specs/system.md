# System Specification

## コマンドシステム

### issue-*コマンド群

issue-*コマンドは6つのコマンドで構成され、3マクロフェーズの開発ワークフローを提供する。

| コマンド | 役割 | エージェント |
|---|---|---|
| `/issue/issue-req` | 要件定義（壁打ち） | build |
| `/issue/issue-create` | Issue登録 | build |
| `/issue/issue-work` | 実装パイプライン | build |
| `/issue/issue-update` | Issue更新 | build |
| `/issue/issue-close` | 完了処理 | build |
| `/issue/issue-next` | 次コマンド推論 | build |

全コマンドは `agent: build` をfrontmatterに指定し、Buildエージェント（Read+Write+Execute権限）で実行される。これはREQ-0030で導入された。
