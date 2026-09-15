# worktree で bun test plugins 分割（.opencode/plugins）が junction 未伝播により不在

## 内容

worktree 環境では `.opencode/plugins` が junction 未伝播のため存在せず、bun test 3 分割正規形の plugins 分割（`bun test ./.opencode/plugins/ ./scripts/`）が `./scripts/` のみ実行となる。動作としては妥当だが、plugins 分割が実行されないことが実行ログから読み取りにくく、検証カバレッジの見落としリスクがある（Case #2831/#2846 で観測）。

## 提案

worktree 実行時の plugins 分割の代替手段（main root から `--root` または cd による plugins 対象の実行等）を bun test 正規形の運用注記に明示するか、worktree 前提での分割正規形の環境差を QG-4 reference に補足する。

## 根拠

- 観測元: PR #2876 本文（Case #2831）、PR #2879 本文（Case #2846）の bun test 3 分割実行記録
- 観測時 commit: PR #2876/#2879 head
- 現状: worktree は `.opencode/plugins` 不在のため plugins 対象 0 件で分割実行が成立（検出自体は main 側 full-audit で担保されている）

## 分類

- 分類: intake（運用注記の明示対象あり）
- 変更種別: docs（bun test 正規形・QG-4 reference の環境差補足）
- 優先度: 低（full-audit 側で plugins 検査は担保済み。再現性・見通しの改善候補）
