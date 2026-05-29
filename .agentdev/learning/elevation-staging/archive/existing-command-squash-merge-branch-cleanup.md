# Squash merge 後のブランチ強制削除対応

## 背景

`gh pr merge --squash` でPRをマージした後、`git branch -d`（非強制）でブランチ削除を試みると「the branch is not fully merged」エラーが発生する。squash merge は新しいコミットを main に作成するが元のブランチのコミットSHAは含まれないため、git がブランチを未マージと判定する。5件中3件（#790, #793, #794）で発生し、毎回手動で `-D` の許可を求める必要がある。

## 問題

case-close Step 7 と agentdev-git-worktree skill に squash merge 済みブランチに対する強制削除許可条件が存在しない。現状は一律「未マージブランチの強制削除（`-D`）は禁止」ルールのみで、squash merge という正当な例外ケースを扱えていない。

## 望ましい変更

1. **case-close Step 7**: `git branch -d` が失敗した場合、`gh pr view` で該当PRの MERGED 状態を確認し、MERGED であれば自動的に `-D` を適用するフォールバックロジックを追加
2. **agentdev-git-worktree skill**: 「未マージブランチの強制削除禁止」ルールに例外条件を追加: squash merge 済みブランチ（PR が MERGED 状態）の場合は `-D` を許可

## 対象範囲

### 対象

- `.opencode/commands/agentdev/case-close.md` Step 7（ブランチ・worktree削除）
- `.opencode/skills/agentdev-git-worktree/SKILL.md`（worktree削除手順・強制削除ルール）

### 対象外

- case-run コマンド（ブランチ削除は case-close の責務）
- リモートブランチ削除（既に `git push origin --delete` で対応済み）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command | `.opencode/commands/agentdev/case-close.md` | Step 7 に squash merge 時の `-D` フォールバックロジックを追加 |
| skill | `.opencode/skills/agentdev-git-worktree/SKILL.md` | 強制削除禁止ルールに squash merge 例外条件を追加 |

## 既存対策確認

- **確認結果**: 既存対策あり（fix gap）
- **該当ファイル**: `.opencode/commands/agentdev/case-close.md` Step 7, `.opencode/skills/agentdev-git-worktree/SKILL.md`
- **ギャップ分類**: fix gap
- **ギャップ詳細**: case-close は `git branch -d` のみ使用し `-D` フォールバックなし。git-worktree skill は「未マージブランチの強制削除禁止」の一律ルールのみで、squash merge 済みブランチの例外条件が記載されていない

## 制約

- `gh pr view` で MERGED 状態を確認してから `-D` を適用（安全確認必須）
- ユーザー確認なしに自動適用（MERGED 確認が安全ゲートの役割）
- 既存の worktree クリーンアップ手順（`.sisyphus/` 削除）は維持

## 受け入れ条件

- [ ] case-close Step 7 に `git branch -d` 失敗時のフォールバックロジックが追加されている
- [ ] フォールバックは `gh pr view` で MERGED 確認後に `-D` を適用する
- [ ] agentdev-git-worktree skill に squash merge 例外条件が追加されている
- [ ] 既存の強制削除禁止ルール（未マージブランチ）は維持されている

## 元learning item / 根拠

- **要約**: squash merge 後に `git branch -d` が失敗する問題が3件連続で発生
- **根拙**: Issue #790, #793, #794 の3件で同一エラー。`gh pr merge --squash` は新しいコミットを main に作成するが元のコミットSHAは含まれない
- **再発条件**: squash merge を使用してPRをマージした後、`git branch -d` を実行した場合にほぼ確実に発生（再発可能性 5/5）
- **横展開可能性**: squash merge を使用する全プロジェクト・全チームで発生する汎用問題（横展開性 5/5）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, enhancement
- **関連Issue**: Issue #790, #793, #794, Epic #789
