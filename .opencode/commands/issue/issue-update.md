---
description: 既存Issueの本文更新、コメント追加、またはREQファイル更新を行う
agent: sisyphus
load_skills:
  - issue-guide
  - gh-cli-best-practices
  - req-file-manager
---

# Issue更新

既存Issueの本文更新、コメント追加、またはREQファイル更新を行う。主にレビューNG時の対応に使用。

## Input

- Issue番号
- 更新内容（本文更新 or コメント追加 or REQファイル更新）
- 更新種別（`--body` / `--comment` / `--req` / `--review-ng`）

## Output

- 更新されたIssue本文 または 追加されたコメント または 更新されたREQファイル または レビューNGコメント

## Steps

1. 現在のIssue状態を取得 → `issue-guide` のフェーズ体系で現在フェーズを判定
2. 更新内容に応じて分岐:
   - **`--body`**: テンプレートに従って更新 → `gh issue edit`
   - **`--comment`**: テンプレート @.opencode/commands/issue/templates/issue_comment_update.md → `gh issue comment`
   - **`--req`**: REQファイル更新（詳細フロー以下）:
     1. Issue番号から関連REQファイルを特定（Issue本文のREQ番号参照 or `docs/requirements/` から該当ファイル検索）
     2. 更新タイプの判定（APPEND vs UPDATE）:
        - **APPEND**: 既存セクションへの内容追加、新規セクション追加
        - **UPDATE**: 既存セクションの内容修正（テキスト置換、ステータス変更等）
     3. frontmatter `updated` フィールドを現在日時に更新
     4. ステータス変更時は `req-file-manager` の遷移ルールを検証
     5. ファイル書き出し → `gh issue edit` でIssue本文の該当箇所も同期
   - **`--review-ng`**: レビューNG時の専用フロー:
     1. `deviation-check` の乖離報告をパース（影響度・対象・内容・推奨アクション・理由を抽出）
     2. 乖離タイプに基づく自動分岐:
        - `spec-bug`（仕様バグ）→ REQ UPDATE + レビューNGコメント投稿
        - `impl-bug`（実装バグ）→ レビューNGコメント投稿のみ（REQ変更不要）
        - `scope-creep`（スコープ外逸脱）→ REQ UPDATE（スコープ明確化）+ レビューNGコメント投稿
        - テスト不足・品質基準未達 → レビューNGコメント投稿のみ
     3. テンプレート @.opencode/commands/issue/templates/issue_comment_review_ng.md を適用
     4. deviation-check結果をテンプレートの「Deviation Check 結果」セクションに展開
     5. NG理由分類のチェックボックスを自動選択
     6. `gh-cli-best-practices` に従い `--body-file` 経由でコメント投稿
3. 完了報告 → `issue-guide` の完了報告フォーマットで結果出力

## APPEND vs UPDATE 判定基準

| 判定 | 条件 | 例 |
|------|------|----|
| APPEND | 既存セクションへの追加、新規セクション追加 | 受け入れ基準の追加、新規機能要件セクション |
| UPDATE | 既存セクションの内容修正 | テキスト置換、ステータス変更、要件の文言修正 |

## Guardrails

- SSoTの整合性を維持（Issue本文と要件docの不整合を防ぐ）
- `gh-cli-best-practices` に従って `--body-file` 使用
- フェーズは変更なし（現在のフェーズを維持）
- `--review-ng` 時は必ず deviation-check 結果を引用すること
- `--req` のステータス変更時は `req-file-manager` の遷移ルールに従うこと
