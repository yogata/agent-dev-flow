## レビューNG時の対応フロー

レビュー結果がNGの場合、乖離の種類に応じて対応フローを切り替える。

### NG理由の定義と対応フロー

| NG理由 | 定義 | 対応フロー |
| ------ | ---- | ---------- |
| 仕様バグ | 要件定義と実装の間に論理的矛盾がある | `agentdev-spec-compliance` 結果確認 → `/agentdev/case-update {N} --req --review-ng`（該当REQのUPDATE）→ `/agentdev/case-run {N}` |
| 実装バグ | 要件定義は正しいが実装が仕様を満たさない | `agentdev-spec-compliance` 結果確認 → `/agentdev/case-update {N} --comment --review-ng`（レビューNGテンプレート使用）→ `/agentdev/case-run {N}` |
| スコープ外逸脱 | 実装が要件定義の範囲を超えている | `/agentdev/case-update {N} --req --review-ng`（REQの該当セクションUPDATE）→ 不要な実装を削除 → `/agentdev/case-run {N}` |

### `--review-ng` フラグ

`case-update` に `--review-ng` を付与すると、レビューNG専用テンプレート（`issue_comment_review_ng.md`）を使用してコメントを投稿する。
`agentdev-spec-compliance` の報告内容（影響度、対象、内容、推奨アクション、理由）をテンプレートに反映する。