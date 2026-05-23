---
route: intake-open
status: promoted
---

# case-close Step 7 に worktree 削除前の .sisyphus/ クリーンアップを追加

## 概要

case-close Step 7 で `git worktree remove` を実行する際、case-run が worktree 内に作成した `.sisyphus/` 一時ファイル（実行計画・証跡等）が未追跡ファイルとして残存し、「contains modified or untracked files」エラーで失敗する。`--force` で回避可能だが、削除前に明示的なクリーンアップを行うべき。

## 対象範囲

- `.opencode/commands/agentdev/case-close.md` Step 7: worktree 削除前に `.sisyphus/` ディレクトリの削除ステップを追加
- `agentdev-git-worktree` スキル側の手順確認（クリーンアップ手順の整合性）

## 完了条件

- [ ] case-close Step 7 に `.sisyphus/` ディレクトリ削除ステップが追加されている
- [ ] `git worktree remove` が `--force` なしで成功するようになっている
- [ ] agentdev-git-worktree スキルと手順の整合性が確認されている

## 備考

- 優先度: 低〜中
- `.sisyphus/` は worktree 内の一時作業領域。メインリポの `.sisyphus/` には影響しない
- 元 item: `.agentdev/intake/accepted/2026-05-23-worktree-sisyphus-cleanup.md`
- 根拠: case-close #344
