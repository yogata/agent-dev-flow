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
    - `docs/requirements/README.md` のインデックスに該当REQが記載されていることを確認。未記載の場合は警告
    - `docs/README.md` ドキュメントハブに該当REQのリンクが記載されていることを確認。未記載の場合は警告
    - `docs/specs/system.md` または `docs/specs/patterns.md` が更新されていることを確認
    - ADRが必要な判断があった場合、`docs/adr/` にADRが作成されていることを確認
    - ADRが作成されている場合、`docs/README.md` にADRセクションが存在し、該当ADRのリンクが記載されていることを確認
    - 不足がある場合: 警告を表示してユーザーの判断を仰ぐ
 4. PRマージ（`gh pr merge`）→ 対応記録をIssueにコメント追記 → テンプレート: `.opencode/commands/issue/templates/issue_comment_feature_implementation.md` または `.opencode/commands/issue/templates/issue_comment_bug_record.md` を Read tool で読み込む
 5. Issue本文のテスト戦略チェックボックス更新:
    - Issue本文を取得し、未チェックのチェックボックス（`- [ ]`）を全て特定
    - 各未チェック項目について、PRの検証結果・実装内容に基づき達成判定:
      - PRまたは実装コメントに検証証拠がある → `[x]` に更新
      - 「手動確認」項目のうち、実動作で証明済みのもの（例: CI通過＝動作証明、マージ成功＝機能動作） → `[x]` に更新（理由を記録）
      - 検証証拠がない → `[ ]` のまま
    - `gh-cli-best-practices` に従い `--body-file` で `gh issue edit` を実行してIssue本文を更新
 6. REQ status 更新（パターンBの場合）:
    - Issue本文からREQ番号を抽出（`REQ-{NNNN}` パターンを検索）
    - 各REQファイルの frontmatter `status` を確認
    - `planned` または `in-progress` → `implemented` に更新
    - `implemented` → 更新不要（スキップ）
    - `deprecated` → 警告表示してスキップ（廃止済みは更新不可）
    - frontmatter `updated` フィールドを現在日時に更新
    - `docs/requirements/README.md` テーブルの該当行の Status を `implemented` に更新
    - ステータス遷移ルールは `req-file-manager` の許容遷移に準拠
 7. Issueクローズ（`gh issue close --reason completed`）→ ブランチ・worktree削除
 8. 親Epic Issue更新:
   - Issue本文からParent Issue番号を特定（`Parent: #{N}` パターンを検索）
   - Parent Issueが存在しない場合 → スキップ
   - Parent Issueの本文を取得
   - ステータストラッキング表から該当Issue番号（#{N}）の行を特定
   - 該当行のステータス列を更新（例: `☐ 未着手` → `✅ 完了`、`🔄 進行中` → `✅ 完了`）
   - 該当Issue番号の詳細セクションがある場合、ステータスとPR情報を更新（例: `✅ 完了`、PR番号追記）
   - `gh-cli-best-practices` に従い `--body-file` で `gh issue edit` を実行してParent Issue本文を更新
   - **Epic自動クローズ判定**（Parent Issue更新後）:
     - 更新後のParent Issue本文から全子Issue番号を抽出（`#{N}` パターンを検索）
     - 各子Issueの状態を `gh issue view {N} --json state` で確認
     - 状態取得に失敗した場合 → 警告表示してスキップ（Epicクローズしない）
     - 全子Issueが "CLOSED" の場合:
       - Epicに完了コメントを追記（「全子Issue完了のため自動クローズ」+ 子Issue一覧）
       - `gh-cli-best-practices` に従い `--body-file` でコメント追記
       - `gh issue close {epic_number} --reason completed` でEpicをクローズ
       - 完了報告に「Epic #{N} を自動クローズ」と表示
     - 1件以上 "OPEN" の子Issueがある場合 → スキップ（完了報告に「Epic #{N}: N件未完了のためスキップ」と表示）
 9. 学びの検知・抽出: `tips-capture` スキルに従い、エージェントが自ら学びの有無を判断する
   - **禁止**: ユーザーに学びの有無を問うこと（「学びはありますか？」等）は禁止。エージェントが判断する
   - エージェントが学びありと判断 → 内容を生成してユーザーに提示し、承認または却下を求める
   - エージェントが学びなしと判断 → ユーザーに何も問わず次のステップへ進む
   - ユーザーが承認した場合 → `docs/tips/inbox.md` に直接追記する（パイプライン内のため/tips-addは使用しない）
10. Plan アーカイブ: `.sisyphus/plans/` から該当Issue番号に関連するplanファイルを検索
   - planファイルが見つかった場合 → `archive-completed-plan` スキルに従ってアーカイブ実行
   - planファイルが見つからない場合 → スキップ（注記付き）
11. 完了報告 → `issue-guide-reports` の完了報告フォーマット

## Guardrails

- PRのCIが通っていることを確認（`gh pr checks`）
- 未完了チェックボックスがある場合はエラー停止
- 未マージPRはクローズしない
- `gh-cli-best-practices` に従って `--body-file` 使用
- パターンBで docs/ 更新がない場合、警告を表示して停止確認
- `tips-capture` スキルのフロー（エージェントが検知・抽出・提示、ユーザーが承認または却下）に従う。ユーザーに学びの有無や内容の入力を求めることは禁止
- `archive-completed-plan` はplan_nameが特定できない場合はスキップ可
- Issue番号省略は同一セッション内で作成済みの場合のみ
- Issue番号の解決に gh issue list / gh issue status 等、gh/gitコマンドでopen issue一覧を取得することは禁止。番号はユーザー入力またはセッション内会話からのみ取得可能
- サブエージェントの最終出力はverbatimで出力する（再フォーマット禁止）
- gh CLI出力を読み取る際は `gh-cli-best-practices` の安全な読み取り手順に従うこと（一時ファイル経由でRead tool使用）
- Pattern分岐の判定基準と固有ルールは `issue-guide-phases` → Pattern Registry を参照
- Issue本文のテスト戦略チェックボックスを必ず更新すること（PR検証結果を反映）
- Epic自動クローズは全子IssueがCLOSEDの場合のみ実行。子Issue状態取得失敗時はEpicクローズしない
