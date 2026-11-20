<!-- ADF-COVERS(implementation): REQ-102-001, REQ-102-002, REQ-102-003, REQ-102-004, REQ-122-002 -->
# AGENTS.md

AgentDevFlow を編集するエージェント向けのリポジトリガイドレール。

## 最上位制約 — Minimal-by-Default 5原則

本節は他の規則に優先する。

1. **Working Tree ＝「現在の姿」**: リポジトリ内の文書・コード・DEC に過去の経緯・旧構成との比較・手順書・廃止理由・保留記録を書かない。歴史は Git ログが唯一の正本である。
2. **Zero-Base Filter**: すべてのファイル・機能・ルール・テストに「今日この姿を知った上で一から作るなら作るか」を問い、不要なものは既存ごと削除する。
3. **Rewrite over Patch**: 複雑化したモジュールや設計書に例外分岐・防衛的な分岐を追加せず、最小構成で書き直す。
4. **Clean Deletion**: 削除した資産の不在証明テスト・番号記録・代替経路の分岐を残さない。削除後の参照は Git ログで解決する。
5. **配布物ゼロ汚染**: 利用プロジェクトへ配布される領域（`src/` のコマンド・スキル・スクリプト等）に `REQ-ID`・`docs/` 参照・開発用トレーサビリティ情報を 1 文字も混入させない。

機械強制: `scripts/git-hooks/minimal-gate.mjs` が物理バジェット（領域別ファイル数・容量・単一ファイル上限）と歴史堆積語彙の追加行をブロックし、pre-push が `.agentdev/` 配下の未処理キュー（inbox）滞留をブロックする。

## 基本規則

- 基本言語は日本語であり、思考・出力とも日本語で行う。中国語での出力を禁止する。
- 文章表層品質の参照語彙は `agentdev-textlint-guard` Plugin（配布資産）の標準規則と用語 prh 辞書とする。
- 文書種別の配置基準と用語政策（英字許容リスト、訳語表）は `docs/designs/responsibilities/document-type-responsibilities.md` を参照する。
- req-define に構造化された要件が渡された場合は別エージェントでの使用を想定し、AskUserQuestion を使用せずに質問する。
- 本リポジトリは AgentDevFlow プラグインを管理する。

## Windows 環境のファイル入出力規律

- 既存 UTF-8（BOM なし）ファイルの編集は edit ツール（per-line string replace）を優先し、Write ツール（全面上書き）は新規ファイル作成時に限定する。
- PowerShell 標準 cmdlet（Get-Content / Set-Content）・リダイレクト演算子（`>` / `>>` / `*>`）・パイプ経由の既存 UTF-8/LF ファイル読み書きは cp932 再符号化によりファイルを破壊し得るため行わない。標準手段は edit ツール、node の readFileSync/writeFileSync、[System.IO.File] の明示エンコーディング指定である（詳細: `docs/knowledge/windows-powershell-bulk-io-corruption.md`）。
- 同一ファイルへの複数 edit は相互非依存の oldString 選択または順次実行に限定する。書込み guard によるブロック後は grep 等で現在状態を確認してから oldString を組み立てて再適用する（guard の解除・迂回は行わない。`src/common/skills/agentdev-git-worktree/references/worktree-operations.md` 参照）。

## ハーネス選定と Git

- oh-my-openagent を導入済みである。
- Git 操作（push を含む）の認証は非対話経路で設定済みであり、対話認証の待機なしに完了する。認証失敗・対話要求・タイムアウトを検出した場合は待機を反復せず失敗として報告する。資格情報の値を解析証拠やログへ出力しない（詳細: `docs/knowledge/git-noninteractive-auth.md`）。
- ローカルコミットは `scripts/git-hooks/`（pre-commit・pre-push・minimal-gate.mjs）の検証ゲート下で行う。
