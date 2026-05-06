---
description: 要件定義をもとにGitHub Issueを作成する
load_skills:
  - issue-guide
  - gh-cli-best-practices
---

# Issue登録

要件定義（issue-req）の結果をもとにGitHub Issueを作成する。①バイブス壁打ち→②構造的実行フェーズの境界。

## Input

- issue-reqで生成された要件doc（チェックボックス付き）

## Output

- GitHub Issue（ラベル付き、要件doc埋め込み）

## Steps

1. 要件docからIssue本文を生成:
   - `docs/requirements/REQ-{NNNN}-{slug}.md` が存在する場合: REQ内容を読み取り、Issue本文に反映
   - 存在しない場合: セッション内の要件docから直接生成
   - テンプレート: @.opencode/commands/issue/templates/issue_desc_feature.md or @.opencode/commands/issue/templates/issue_desc_bug.md
2. ラベル付与 → `issue-guide` のラベル体系に従って選定
3. GitHub Issueを作成（`gh issue create`） → `gh-cli-best-practices` に従って `--body-file` 使用
4. Issue作成後にコメント追加 → テンプレート: @.opencode/commands/issue/templates/issue_comment_bug_analysis.md (パターンA) or @.opencode/commands/issue/templates/issue_comment_feature_technical.md (パターンB)
5. 完了報告 → `issue-guide` の完了報告フォーマットで結果出力

## Guardrails

- issue-req未実行の場合は警告
- 要件docのチェックボックスが空の場合は警告
- パターンBの場合、対応するREQファイルが存在することを確認
