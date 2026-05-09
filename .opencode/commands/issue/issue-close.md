---
description: PRをマージし、対応記録を追記し、Issueをクローズしてブランチを削除する
agent: sisyphus
load_skills:
  - issue-guide-phases
  - issue-guide-reports
  - tips-capture
  - archive-completed-plan
  - gh-cli-best-practices
  - git-worktree
  - req-file-manager
---

# 完了処理

PRをマージし、Issueに記録を追記し、クローズ後にworktreeとブランチを削除する。③レビュー完了フェーズ。

## Input

- Issue番号
- PR番号（または自動検出）

## Output

- マージ済みPR
- クローズ済みIssue
- 削除済みブランチ・worktree

## Steps

1. Issue番号解決:
   - ユーザー入力からIssue番号を取得（指定されている場合はそれを使用）
   - 番号が省略された場合、セッション内会話から直近のIssue番号を検索（`issue-work` の完了報告、直前のIssue参照履歴等から抽出）
   - 複数のIssue番号が存在する場合は直近のものを優先し、ユーザーに確認（例: 「Issue #Nで完了処理を行います。よろしいですか？」）
   - 検出できない場合はユーザーに番号の指定を求めて停止
2. 前提確認: チェックボックス全完了確認、PR存在確認
3. docs/ 検証（パターンBの場合）:
   - `docs/requirements/REQ-{NNNN}.md` が作成済みであることを確認
   - `docs/specs/system.md` または `docs/specs/patterns.md` が更新されていることを確認
   - ADRが必要な判断があった場合、`docs/adr/` にADRが作成されていることを確認
   - `docs/README.md` ドキュメントハブに新規エントリが含まれていることを確認
   - 不足がある場合: 警告を表示してユーザーの判断を仰ぐ
4. PRマージ（`gh pr merge`）→ 対応記録をIssueにコメント追記 → テンプレート: `.opencode/commands/issue/templates/issue_comment_feature_implementation.md` または `.opencode/commands/issue/templates/issue_comment_bug_record.md` を Read tool で読み込む
  5. Issueクローズ（`gh issue close --reason completed`）→ ブランチ・worktree削除
6. 学びの抽出: ユーザーに「今回のIssue対応で抽出すべき学びはありますか？」と確認
    - ユーザーが内容を回答した場合 → `tips-capture` スキルのフローに従って学びを抽出（ユーザー確認必須）
    - ユーザーが「ない」「nothing」等と回答した場合 → スキップ
7. Plan アーカイブ: `.sisyphus/plans/` から該当Issue番号に関連するplanファイルを検索
    - planファイルが見つかった場合 → `archive-completed-plan` スキルに従ってアーカイブ実行
    - planファイルが見つからない場合 → スキップ（注記付き）
8. 完了報告 → `issue-guide-reports` の完了報告フォーマット

## Guardrails

- PRのCIが通っていることを確認（`gh pr checks`）
- 未完了チェックボックスがある場合はエラー停止
- 未マージPRはクローズしない
- `gh-cli-best-practices` に従って `--body-file` 使用
- パターンBで docs/ 更新がない場合、警告を表示して停止確認
- `tips-capture` の対話ステップをスキップしない（ユーザー確認が必須）
- `archive-completed-plan` はplan_nameが特定できない場合はスキップ可
- Issue番号省略は同一セッション内で作成済みの場合のみ
- サブエージェントの最終出力はverbatimで出力する（再フォーマット禁止）
- Pattern分岐の判定基準と固有ルールは `issue-guide-phases` → Pattern Registry を参照
