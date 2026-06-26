# gh pr merge --delete-branch の worktree 占有エラーに対するガードレール追加

## 背景

case-close Step 4（PR マージ）で `gh pr merge <N> --squash --delete-branch` を実行した際、対象ブランチがアクティブな worktree（`.worktrees/<N>-feature`）に checkout されていると、local branch 削除ステップが `cannot delete branch 'X' used by worktree at '...'` で失敗し、後続の remote branch 削除も巻き込まれて実行されなかった。GitHub 側の PR マージ自体は成功するが、remote branch が残存し手動 cleanup が必要になった。

## 問題

`--delete-branch` は local→remote の順で削除を試みる。local 削除が worktree 占有エラーで失敗すると全体が中断され、remote 削除フェーズに到達しない。case-close Step 4 と Step 7 の手順は正しい順序（Step 4 でマージ、Step 7 で worktree→branch 削除）を規定済みだが、Step 4 で `--delete-branch` を使うと順序が逆転し、Step 7 の worktree 削除より前に branch 削除を試みて失敗する。

## 望ましい変更

case-close の PR マージ手続きを `gh pr merge <N> --squash`（`--delete-branch` なし）に統一し、branch 削除は Step 7 で worktree 削除後に明示実行する運用をガードレールとして明文化する。

## 対象範囲

### 対象

- `src/opencode/commands/agentdev/case-close.md`（Step 4 PR マージ手続き、ガードレール）
- `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md`（PR merge 標準手続き）

### 対象外

- worktree 削除手順自体（Step 7 で既に正しい順序を規定済み）
- `gh pr merge --squash` のマージ機能自体

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command | `src/opencode/commands/agentdev/case-close.md` | Step 4 の PR マージ手続きを `gh pr merge <N> --squash`（`--delete-branch` なし）に明示。`--delete-branch` を worktree 運用環境で使用してはならない旨のガードレールを追加 |
| skill | `src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md` | PR merge 手続きの標準版に「worktree 運用環境では `--delete-branch` を使用せず、branch 削除は worktree 削除後に明示実行する」旨を追記 |

## 既存対策確認

- **確認結果**: 既存対策あり（case-close Step 4/7）
- **該当ファイル**: `src/opencode/commands/agentdev/case-close.md` Step 4/7、`src/opencode/skills/agentdev-gh-cli/references/standard-procedures.md`
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: case-close.md Step 4 と Step 7 の手順は正しい順序（Step 4 でマージ、Step 7 で worktree→branch 削除）を規定済み。本件は Step 4 で `--delete-branch` を使った結果の副作用であり手順違反ではないが、`--delete-branch` 使用の危険性に対するガードレールが不十分。`--delete-branch` なし運用の明示的な推奨がない。

## 制約

- `--delete-branch` なしの場合、Step 7 で `git push origin --delete <branch>` + `git fetch --prune origin` の明示削除が必須（既に Step 7 で規定済みの手順）
- squash merge 後の local branch 削除は `-d` ではなく `-D` が必要（squash merge は fast-forward でないため）。既に自律対応で実績あり。
- マージ失敗時のフォールバック（Step 4-2 rebase）と干渉しないよう、`--delete-branch` なし運用が安全（マージ失敗時に branch が残るため rebase 再試行が可能）

## 受け入れ条件

- [ ] case-close.md Step 4 の PR マージ手続きが `gh pr merge <N> --squash`（`--delete-branch` なし）に明示されている
- [ ] case-close.md に worktree 運用環境で `--delete-branch` を使用してはならない旨のガードレールが追加されている
- [ ] standard-procedures.md の PR merge 手続きに worktree 運用時の `--delete-branch` 使用注意が追記されている
- [ ] Step 7 の branch 明示削除手順（`git push origin --delete` + `git fetch --prune`）との整合性が保たれている

## 元learning item / 根拠

- **要約**: `gh pr merge --delete-branch` が worktree 占有エラーで local branch 削除に失敗し、remote branch 削除を巻き込んで中断。remote branch が残存し手動 cleanup が必要になった。
- **根拠**: case-close Step 4 で `gh pr merge <N> --squash --delete-branch` 実行時、対象ブランチがアクティブ worktree に checkout されていると local branch 削除が `cannot delete branch 'X' used by worktree` で失敗。`--delete-branch` は local→remote の順で削除を試みるため、local 失敗が remote 削除フェーズへの到達を阻害した。GitHub 側のマージは成功したが remote branch が残存（PR #1143、Issue #1141）。自律対応で worktree 削除→remote branch 明示削除→fetch --prune で復旧。
- **再発条件**: case-close Step 4 で `gh pr merge --squash --delete-branch` を実行し、かつ対象ブランチがアクティブ worktree に checkout されている場合。
- **横展開可能性**: worktree 運用 + `gh pr merge --delete-branch` の組み合わせ環境で中程度（3/5）。8軸評価加重合計 26/40。

## 推奨Issue分類

- **分類**: chore
- **推奨ラベル**: enhancement, documentation
- **関連Issue**: なし（新規）
