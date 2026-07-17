# Intake Item: REQ-0119 横断是正 残対応（6 command の重複定義解消未対応）

## 発生源

- PR: #1534 (Issue #1532, direct_case / maintenance, REQ-0119 新原則に基づく配布 Command/Skill 横断評価と違反是正)
- 発生 phase: case-close QG-4 (capture 回収)
- capture 分類: intake (具体的修正対象 = 後続 PR で段階対応する重複定義解消)

## 問題

PR #1534 では「正規な定義元が既存であった明確な重複の是正」に限定し、9 箇所の同一契約再定義を解消した。一方で以下の command 群には追加の Step X-Y 細分番号が含まれ、追加是正が可能なまま残っている:

- **case-auto.md**: Step 4-0（委譲起動判定）、Step 4-1（Wave 反復制御）、Step 8-1/8-2（OU処理ループ、並列委譲）、コンフリクト解消モデル Level 2/3 詳細（行 223-259）。workflow-orchestration/epic-tracker 等の skill への切り出し候補。
- **case-open.md**: Step 1-1, 2-1〜2-4, 3-1, 9-1, 12-1, 14-1〜14-3 等。issue-management/workflow-orchestration/quality-gates 等の skill への切り出し候補。
- **req-define.md**: Step 4-1/4-2/5-1〜5-6/6-1〜6-5/7-1〜7-4/11-2/11-6 等。req-analysis/adr-guidelines/quality-gates 等の skill への切り出し候補。
- **req-save.md**: Step 3-1〜3-3/4-0〜4-3/9-1/11-1/11-2 等。req-file-manager/quality-gates/git-worktree 等の skill への切り出し候補。
- **spec-save.md**: Step 5-1 等。req-file-manager/workflow-orchestration 等の skill への切り出し候補。
- **learning-promote.md**: Step 13-1〜13-3, 9-10 等。learning-pipeline への切り出し候補。

一部は command 固有の公開契約に密接し、移動により公開契約の意味が変わるリスクがある（REQ-0119-035）。

## 推奨修正対象

後続 PR で段階的に対応。各 command ごとに個別 case を起案し、「公開契約維持確認」を行った上で参照統合を実施:

1. case-auto.md の workflow-orchestration/epic-tracker skill への切り出し
2. case-open.md の issue-management/workflow-orchestration skill への切り出し
3. req-define.md の req-analysis/adr-guidelines skill への切り出し
4. req-save.md の req-file-manager/quality-gates skill への切り出し
5. spec-save.md の req-file-manager/workflow-orchestration skill への切り出し
6. learning-promote.md の learning-pipeline skill への切り出し

各 case で REQ-0119-035（公開契約維持）を個別確認することが前提。

## 関連

- PR: #1534 (Findings / Capture候補 セクション「重複解消未対応（後続 PR 予定）」)
- Issue: #1532 (REQ-0119, OU-001/RU-20260718-01, maintenance, direct_case)
- 要件: REQ-0119-033/034/035/036
- 関連 Issue: #1533 (OU-002/REQ-0125, inspect-skills skill 新観点反映、別途 case-run 予定)
