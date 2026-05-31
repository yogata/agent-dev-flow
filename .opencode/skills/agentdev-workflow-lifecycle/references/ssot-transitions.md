# SSoT遷移ルール

各マクロフェーズにおけるSingle Source of Truth（SSoT）とdraftライフサイクルを定義する。

## SSoT遷移ルール

各マクロフェーズにおけるSingle Source of Truth（SSoT）を定義する。

| マクロフェーズ       | SSoT                           | 説明                                                       |
| -------------------- | ------------------------------ | ---------------------------------------------------------- |
| 壁打ち      | セッション会話 + draft         | 壁打ちで合意形成された要件・分析（Issue未作成のため）     |
| 構造的実行          | Issue本文 + Work Plan          | 要件doc + 実行計画                                         |
| レビュー完了        | PR + レビュー結果              | コードレビュー結果とマージ状態                             |

## draft の定位

draft（`.sisyphus/drafts/req-draft-*.md`）は**壁打ちフェーズ内の一時ハンドオフ**であり、構造的実行以降のSSoTはIssue本文とWork Planである。

- **ライフサイクル**: `draft` → `saved`（req-save完了）→ `issued` + 削除（case-open完了）
- **壁打ちフェーズの役割**: req-define → req-save 間の要件引き継ぎ
- **構造的実行フェーズ以降**: draftは存在しない（case-open完了時に削除）。SSoTはIssue本文 + Work Planに完全移行

## フェーズ境界ルール

マクロフェーズ間の境界で満たすべき要件を定義する。

### 壁打ち→構造的実行の境界

壁打ちフェーズ完了時、docs変更（REQファイル、READMEインデックス、ADR等）を**必ずコミット・プッシュ**すること。これにより構造的実行フェーズのworktreeがdocs変更を継承する。

**義務化の理由**: Issue #32でdocs変更がコミットされず、worktreeに継承されなかった問題を再発防止するため。

**手順**:
1. docs変更の整合性検証（REQ番号の連続性、frontmatterの`id`とファイル名の一致）
2. `agentdev-conventional-commits` に従ってコミットメッセージを生成
3. mainブランチにpush

## 参照

- **フェーズ体系**: [`reference/phases.md`](./phases.md)
- **アーティファクト責務境界**: [`reference/artifact-boundaries.md`](./artifact-boundaries.md)