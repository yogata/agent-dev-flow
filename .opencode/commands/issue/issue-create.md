---
description: 要件定義をもとにGitHub Issueを作成する
agent: sisyphus
load_skills:
  - issue-guide-phases
  - issue-guide-reports
  - gh-cli-best-practices
  - req-file-manager
  - req-analysis
  - adr-file-manager
---

# Issue登録

要件定義（issue-req）の結果をもとにGitHub Issueを作成する。①バイブス壁打ち→②構造的実行フェーズの境界。

## Input

- issue-reqで生成された要件doc（チェックボックス付き）

## Output

- GitHub Issue（ラベル付き、要件doc埋め込み）

## Steps

1. `docs/specs/system.md` と `docs/specs/patterns.md` を読み込み、現在のシステム仕様と実装パターンを把握する
2. 要件docからIssue本文を生成:
   - `docs/requirements/REQ-{NNNN}.md` が存在する場合: REQ内容を読み取り、Issue本文に反映
   - 存在しない場合: セッション内の要件docから直接生成
   - テンプレート: `.opencode/commands/issue/templates/issue_desc_feature.md` または `.opencode/commands/issue/templates/issue_desc_bug.md` を Read tool で読み込む
3. `docs/adr/README.md` を読み込み、要件と関連するADRを「対象領域」と「決定内容」でマッチングして特定する。関連ADRがあれば個別に読み込む
4. ラベル付与 → `issue-guide-phases` のラベル体系に従って選定
5. GitHub Issueを作成（`gh issue create`） → `gh-cli-best-practices` に従って `--body-file` 使用
6. Issue作成後にコメント追加 → テンプレート: `.opencode/commands/issue/templates/issue_comment_bug_analysis.md`（パターンA）または `.opencode/commands/issue/templates/issue_comment_feature_technical.md`（パターンB）を Read tool で読み込む
7. 完了報告 → `issue-guide-reports` の完了報告フォーマットで結果出力

## Guardrails

- issue-req未実行の場合は警告
- 要件docのチェックボックスが空の場合は警告
- パターンBの場合、対応するREQファイルが存在することを確認
- ADR・specsの内容はIssue本文の生成に反映すること
- サブエージェントの最終出力はverbatimで出力する（再フォーマット禁止）
- gh CLI出力を読み取る際は `gh-cli-best-practices` の安全な読み取り手順に従うこと（一時ファイル経由でRead tool使用）
- Pattern分岐の判定基準と固有ルールは `issue-guide-phases` → Pattern Registry を参照
