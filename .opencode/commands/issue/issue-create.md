---
description: 要件定義をもとにGitHub Issueを作成する
load_skills:
  - issue-guide
  - decision-log
  - gh-cli-best-practices
---

# Issue登録

要件定義（issue-req）の結果をもとにGitHub Issueを作成する。①バイブス壁打ち→②構造的実行フェーズの境界。

## Input

- issue-reqで生成された要件doc（チェックボックス付き）
- `decisions/` 内の決定エントリ（あれば）

## Output

- GitHub Issue（ラベル付き、要件doc埋め込み）
- `decisions/index.md` 更新（決定エントリのstatus変更）

## Steps

1. 要件docからIssue本文を生成 → テンプレート: `templates/issue_desc_feature.md` or `templates/issue_desc_bug.md`
2. ラベル付与 → `issue-guide` のラベル体系に従って選定
3. 決定エントリのstatus を proposed → accepted に更新 → `decision-log` のライフサイクル参照
4. GitHub Issueを作成（`gh issue create`） → `gh-cli-best-practices` に従って `--body-file` 使用
5. 完了報告 → `issue-guide` の完了報告フォーマットで結果出力

## Guardrails

- issue-req未実行の場合は警告
- 要件docのチェックボックスが空の場合は警告
- 出力先: `$1` 引数で指定
