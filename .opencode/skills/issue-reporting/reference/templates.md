# テンプレート使用ガイド

issue-*コマンドで使用するテンプレートの適用タイミングと方法を定義する。

| テンプレート | 使用コマンド | 使用タイミング | 適用方法 |
|---|---|---|---|
| `pr_desc.md` | `issue-work` | Step 11（PR作成時） | テンプレートを読み込み、変数を置換してPR本文として生成 |
| `report_spec_compliance.md` | `issue-work` | Step 8-9（乖離検出・報告時） | テンプレートを読み込み、乖離内容を埋めて報告 |
| `issue_comment_feature_implementation.md` | `issue-close` | Step 4（PRマージ後コメント） | テンプレートを読み込み、実装記録を埋めてコメント投稿 |
| `issue_comment_bug_record.md` | `issue-close` | Step 4（PRマージ後コメント） | テンプレートを読み込み、バグ修正記録を埋めてコメント投稿 |
| `issue_desc_epic.md` | `issue-create` | Epic Issue作成時 | テンプレートを読み込み、Epic用本文を生成 |
| `issue_desc_child.md` | `issue-create` | 子Issue作成時 | テンプレートを読み込み、子Issue用本文を生成 |
| `issue_desc_backlog_epic.md` | `issue-backlog` | Step 8（Epic Issue作成時） | テンプレートを読み込み、バックログEpic用本文を生成 |
| `issue_desc_backlog_child.md` | `issue-backlog` | Step 9（子Issue作成時） | テンプレートを読み込み、バックログ子Issue用本文を生成 |
| `issue_desc_bug.md` | `issue-create` | バグIssue作成時 | テンプレートを読み込み、バグ用Issue本文を生成 |
| `issue_desc_feature.md` | `issue-create` | 機能追加Issue作成時 | テンプレートを読み込み、機能追加用Issue本文を生成 |
| `issue_comment_update.md` | `issue-update` | Issue本文・コメント更新時 | テンプレートを読み込み、更新内容のコメントを生成 |
| `issue_comment_review_ng.md` | `issue-update` | レビューNG時 | テンプレートを読み込み、レビューNGのコメントを生成 |

## 適用ルール

- テンプレートは Read tool で読み込み、変数部分を置換して使用する
- テンプレートの構造を維持する（セクションの削除・順序変更禁止）
- 変数に該当するデータがない場合、そのセクションに「該当なし」と記載する（セクションごと削除しない）