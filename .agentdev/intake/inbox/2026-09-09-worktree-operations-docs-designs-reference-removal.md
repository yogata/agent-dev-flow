# intake: 配布物からの docs/designs/ 参照除去（worktree-operations.md L146）

- **発生源**: PR #2745（Issue #2735 / Epic #2734 W1）の Findings を回収。PR #2749（Issue #2737 / Epic #2734 W3）・PR #2750（Issue #2738 / Epic #2734 W4）の Findings も同一対象のため本 item へ統合（W3/W4 境界 case-close、delegation DEL-2734-close-w34）
- **capture 元**: case-close Epic Wave 1（Epic #2734、delegation DEL-2734-close-w1）、同 Wave 3/4 境界（delegation DEL-2734-close-w34）
- **captured_at**: 2026-09-09（W3/W4 追記: 2026-09-10）

## 内容

IR-055 既出違反: `src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md` L146 が `docs/designs/` を参照している（runtime-unresolved-reference、heuristic/warning、IR-055 delta from baseline）。main（aa904f57）でも同一内容で再現する既出であり Issue #2735 の差分起因ではない。W3/W4 の QG-4 bun test でも同一 1 件として検出継続（merge 後 main HEAD edec3024 で機械確認、merge 前後で該当ファイル diff なし）。配布物からの `docs/designs/` 参照除去の是正候補。

## 補足

- 是正の要否・優先度は intake-promote の review で判定すること
- W4 実行記録（req-053-textlint-wave4-src-correction.md）の取り扱い: 修復（参照形式の是正または baseline 登録）は W4 の src 変更禁止により未実施。Wave 5（REQ-057-024、IR-055 baseline 再生成の主責任 Wave）での baseline 登録判断の対象として引き継ぎ済み
