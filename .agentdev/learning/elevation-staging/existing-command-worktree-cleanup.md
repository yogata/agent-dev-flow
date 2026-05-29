# worktree 削除時の残存ファイル対策強化

## 背景

case-close Step 7 で worktree を削除する際、case-run が残した未コミット変更や一時ファイルにより `git worktree remove` が「contains modified or untracked files」で失敗する問題が 3 回発生した。現在 case-close Step 7 には `.sisyphus/` クリーンアップが存在するが、サブエージェントの未コミット変更（ソースファイル等）とプロセスロックによるディレクトリ削除失敗には対処していない。

## 問題

1. case-run のサブエージェントがソースファイルに未コミット変更を残して終了し、worktree remove が失敗する
2. IDE・シェルのプロセスロックにより worktree ディレクトリ自体が削除できない（Permission denied）
3. case-run に完了後のクリーンアップ Step が存在しない

## 望ましい変更

- case-close Step 7 に worktree 削除前の `git status --short` による未コミット変更検出を追加
- 未コミット変更検出時の対処（破棄または警告）を明記
- プロセスロックによるディレクトリ削除失敗時の個別ハンドリング（IDE・ターミナルへの案内）を追加
- case-run の完了 Step（Step 12）の前に worktree クリーンアップ Step を追加（.sisyphus/ 削除 + git status 確認）

## 対象範囲

### 対象

- `.opencode/commands/agentdev/case-close.md` Step 7（worktree・ブランチ削除）
- `.opencode/commands/agentdev/case-run.md` Step 11-12 間（完了前クリーンアップ追加）

### 対象外

- agentdev-git-worktree/SKILL.md（別 stub で対応）
- 他のコマンドの worktree 処理

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command | `.opencode/commands/agentdev/case-close.md` | Step 7 に git status --short による未コミット変更検出・対処を追加。プロセスロック時の個別案内を追加 |
| command | `.opencode/commands/agentdev/case-run.md` | Step 11-12 間に worktree クリーンアップ Step（.sisyphus/ 削除 + git status 確認 + 未コミット変更のコミット/破棄）を追加 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分的）
- **該当ファイル**: `.opencode/commands/agentdev/case-close.md` Step 7 line 114
- **ギャップ分類**: fix gap
- **ギャップ詳細**: .sisyphus/ クリーンアップは存在するが、(1) サブエージェントの未コミット変更（ソースファイル等）の検出・対処がない、(2) プロセスロック時の個別案内がない、(3) case-run 側に完了前クリーンアップがない

## 制約

- case-run のクリーンアップ Step は再開ポイント（.sisyphus/plans/）を保持する必要がある場合、.sisyphus/ の完全削除ではなく選択的削除を検討する
- 未コミット変更の「破棄」は、変更内容が既に squash merge 済みであることを確認した上でのみ実行可能
- プロセスロックの解消はユーザー手動操作に依存する（自動強制削除は不可）

## 受け入れ条件

- [ ] case-close Step 7 で worktree 削除前に `git status --short` を実行し未コミット変更を検出する
- [ ] 未コミット変更検出時の対処フロー（確認→破棄または警告）が Step 7 に記載されている
- [ ] プロセスロック（Permission denied）時の個別案内メッセージが Step 7 に記載されている
- [ ] case-run に完了前のクリーンアップ Step が追加されている

## 元learning item / 根拠

- **要約**: case-run が worktree 内に一時ファイル・未コミット変更を残し、case-close の worktree 削除が失敗する
- **根拠**: 3件の実発生（Issue #344/PR #346, Issue #381, Issue #389/PR #390）。case-run が .sisyphus/ や未コミット変更を残し、case-close Step 7 の git worktree remove が失敗
- **再発条件**: case-run で worktree を使用し、case-close で worktree を削除する全ケース
- **横展開可能性**: worktree を使用するプロジェクト全般で発生可能

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, enhancement
- **関連Issue**: #344, #381, #389
