# full suite split 1 の既知欠陥候補（phase_adoption_record_contract 文言不一致）

## 概要

`phase_adoption_record_contract.test.ts`「初回保存経路の workflow skill が非破壊実体化を規定する」が、テスト期待文言 `` `templates/phase-readme.md` ``（backtick が templates の直前）と `agentdev-workflow-phase-{tasks-create,tasks-update,artifacts-update}` SKILL.md の実文（`.opencode/skills/agentdev-phase-theme-collaboration/templates/phase-readme.md` 全体を1つの backtick で囲む）の不一致で不合格になる。worktree 依存でなく repo 本体の既存不整合であり、full integrity suite split 1 を fail させ続ける。

## 根拠

- 観測元: PR #3904 本文 `## Findings / Capture候補`（### intake 第1項）、Issue #3902（case-close 対応記録コメント 6617043300）
- 元テキスト（PR 本文から逐語）:
  - 「**full suite split 1 の既知欠陥候補**: `phase_adoption_record_contract.test.ts`「初回保存経路の workflow skill が非破壊実体化を規定する」が、テスト期待文言 `` `templates/phase-readme.md` ``（backtick が templates の直前）と `agentdev-workflow-phase-{tasks-create,tasks-update,artifacts-update}` SKILL.md の実文（`.opencode/skills/agentdev-phase-theme-collaboration/templates/phase-readme.md` 全体を1つの backtick で囲む）の不一致で不合格。worktree 依存でなく repo 本体の既存不整合。本 Case の対象範囲外のため修正せず記録」
- case-close 実測: merge 直前 HEAD 9680a8eb1 と baseline afd9e0607（detached worktree）の双方で同一 fail を再現（pre-existing 分類）
