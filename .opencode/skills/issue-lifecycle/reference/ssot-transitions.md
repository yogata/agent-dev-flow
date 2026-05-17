# SSoT遷移ルール

各マクロフェーズにおけるSingle Source of Truth（SSoT）とdraftライフサイクルを定義する。

## SSoT遷移ルール

各マクロフェーズにおけるSingle Source of Truth（SSoT）を定義する。

| マクロフェーズ       | SSoT                           | 説明                                                       |
| -------------------- | ------------------------------ | ---------------------------------------------------------- |
| ①バイブス壁打ち      | セッション会話 + draft         | 壁打ちで合意形成された要件・分析（Issue未作成のため）     |
| ②構造的実行          | Issue本文 + Work Plan          | 要件doc + 実行計画                                         |
| ③レビュー完了        | PR + レビュー結果              | コードレビュー結果とマージ状態                             |

## draft の定位

draft（`.sisyphus/drafts/req-draft-*.md`）は**①フェーズ内の一時ハンドオフ**であり、②以降のSSoTはIssue本文とWork Planである。

- **ライフサイクル**: `draft` → `saved`（issue-save-req完了）→ `issued` + 削除（issue-create完了）
- **①フェーズの役割**: issue-req → issue-save-req 間の要件引き継ぎ
- **②フェーズ以降**: draftは存在しない（issue-create完了時に削除）。SSoTはIssue本文 + Work Planに完全移行

## フェーズ境界ルール

マクロフェーズ間の境界で満たすべき要件を定義する。

### ①→② 境界（バイブス壁打ち → 構造的実行）

①バイブス壁打ちフェーズ完了時、docs変更（REQファイル、READMEインデックス、ADR等）を**必ずコミット・プッシュ**すること。これにより②構造的実行フェーズのworktreeがdocs変更を継承する。

**義務化の理由**: Issue #32でdocs変更がコミットされず、worktreeに継承されなかった問題を再発防止するため。

**手順**:
1. docs変更の整合性検証（REQ番号の連続性、frontmatterの`id`とファイル名の一致）
2. `conventional-commits` に従ってコミットメッセージを生成
3. mainブランチにpush

## 参照

- **フェーズ体系**: [`reference/phases.md`](./phases.md)
- **アーティファクト責務境界**: [`reference/artifact-boundaries.md`](./artifact-boundaries.md)