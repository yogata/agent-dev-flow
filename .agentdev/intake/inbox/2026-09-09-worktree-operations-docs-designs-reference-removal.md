# intake: 配布物からの docs/designs/ 参照除去（worktree-operations.md L146）

- **発生源**: PR #2745（Issue #2735 / Epic #2734 W1）の Findings を回収
- **capture 元**: case-close Epic Wave 1（Epic #2734、delegation DEL-2734-close-w1）
- **captured_at**: 2026-09-09

## 内容

IR-055 既出違反: `src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md` L146 が `docs/designs/` を参照している（runtime-unresolved-reference、heuristic/warning、IR-055 delta from baseline）。main（aa904f57）でも同一内容で再現する既出であり Issue #2735 の差分起因ではない。配布物からの `docs/designs/` 参照除去の是正候補。

## 補足

- 是正の要否・優先度は intake-promote の review で判定すること
