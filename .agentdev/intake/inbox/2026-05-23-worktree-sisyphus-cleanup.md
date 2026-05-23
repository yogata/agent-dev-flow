---
captured_at: 2026-05-23
source: case-close #344
type: improvement
scope: case-close
severity: low
---

# case-close Step 7 の worktree 削除前に .sisyphus/ クリーンアップを追加

## 観測

case-close Step 7 で `git worktree remove` を実行した際、case-run が worktree 内に作成した `.sisyshus/` 一時ファイル（実行計画・証跡等）が未追跡ファイルとして残存しており、「contains modified or untracked files」エラーで失敗した。`--force` で回避可能だが、本来は削除前にクリーンアップすべき。

## 具体的修正対象

- `.opencode/commands/agentdev/case-close.md` Step 7: worktree 削除前に `.sisyphus/` ディレクトリの削除を追加

## 期待される効果

全 case-close で `git worktree remove` が `--force` なしで成功するようになる。
