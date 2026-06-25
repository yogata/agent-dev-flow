# 学び・教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

---

## gh pr merge --delete-branch が worktree 活動中ブランチで local/remote 削除を巻き込み失敗

- **問題事象**: `gh pr merge <N> --squash --delete-branch` 実行時、対象ブランチがアクティブな worktree（`.worktrees/<N>-feature`）に checkout されていると、local branch 削除ステップが `cannot delete branch 'X' used by worktree at '...'` で失敗し、後続の remote branch 削除も巻き込まれて実行されなかった。GitHub 側の PR マージ自体は成功するが、remote branch が GitHub に残存した。
- **発生局面**: レビュー（case-close のブランチ削除ステップ）
- **検知方法**: `gh pr merge` のエラーメッセージと、事後の `gh api repos/.../branches/<branch>` で branch が 404 にならないことによる残存確認
- **根本原因**: `--delete-branch` は local→remote の順で削除を試みる。local 削除が worktree 占有エラーで失敗すると全体が中断され、remote 削除フェーズに到達しない。Step 7 の手順では worktree 削除が branch 削除より前に来るべきだが、`gh pr merge --delete-branch` は Step 4（マージ）で同時に削除を試みるため順序が逆転する。
- **自律対応内容**: worktree を `git worktree remove` で先に削除してから、`git push origin --delete <branch>` で remote branch を明示削除し、`git fetch --prune origin` で remote-tracking ref を整理した。local branch は `git branch -D` で削除済み（squash merge 後のため `-D` 必要）。
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。case-close.md Step 4 と Step 7 の手順は正しい順序（Step 4 でマージ、Step 7 で worktree→branch 削除）を規定済み。本件は `gh pr merge --delete-branch` を Step 4 で使った結果の副作用であり、手順違反ではない。
- **横展開観点**: `gh pr merge --delete-branch` を worktree 運用環境で使う場合、`--delete-branch` を付けず Step 7 で明示削除する方が堅牢。または worktree を先に削除してからマージする順序も検討できるが、マージ失敗時のフォールバック（Step 4-2 rebase）と干渉するため、`--delete-branch` なし運用が安全。
- **再発条件**: case-close Step 4 で `gh pr merge --squash --delete-branch` を実行し、かつ対象ブランチがアクティブ worktree に checkout されている場合。
- **予防策候補**: case-close の PR マージ手続きを `gh pr merge <N> --squash`（`--delete-branch` なし）に統一し、branch 削除は Step 7 で worktree 削除後に明示実行する。
- **想定反映先**: `agentdev-gh-cli` 標準手続き（PR merge）、`case-close` Step 4 の `gh pr merge` 呼び出し箇所
- **関連**: `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md`, `src/opencode/commands/agentdev/case-close.md` Step 4/7, PR #1143, Issue #1141
- **タグ**: `#git` `#gh-cli` `#worktree` `#ワークアラウンド`
