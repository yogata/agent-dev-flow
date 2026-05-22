# case-close Git操作順序修正とrename制約追加

## 背景

case-close Step 7 の Git 操作順序が不適切で、`git pull` が `git branch -d` の後に位置しているため「not fully merged」エラーが発生（4件、評価スコア 30/40）。また repo rename 時の remote URL 変更や directory rename 時のセッション制約に関する注意事項が case-close に未記載（2件、評価スコア 20/40）。両クラスとも反映先が case-close コマンドであり統合して反映する。

## 問題

1. **Git 操作順序**: Step 7 で `git pull`（ローカル main 同期）が `git branch -d` の後に位置しているため、PR マージ後の pull 前に branch -d を実行すると「not fully merged」エラーになる
2. **Rename 制約未記載**: repo rename 時は remote URL が即座に変更されるため remote branch delete を rename 前に実行する必要がある。directory rename は OpenCode セッション実行中に不可能。これらの制約が case-close に記載されていない

## 望ましい変更

`case-close.md` に以下を反映:
- Step 7 の操作順序を `worktree remove → prune → git pull → branch -d → remote delete` に修正
- Oracle/検証エージェント起動前に `git rev-parse HEAD` と `origin/main` の同期確認を必須化
- 注意事項セクションに repo rename 時の操作順序制約を追加
- 注意事項セクションに directory rename のセッション制約（手動実行案内）を追加

## 対象範囲

### 対象

- `.opencode/commands/agentdev/case-close.md` Step 7、注意事項セクション
- `.opencode/skills/agentdev-git-worktree/SKILL.md`（remote-sync 検証追加）

### 対象外

- 他のコマンドの Step 構成（case-run 等は別途対応）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command | `.opencode/commands/agentdev/case-close.md` | Step 7 操作順序修正、注意事項に rename 制約追加 |
| skill | `.opencode/skills/agentdev-git-worktree/SKILL.md` | remote-sync 検証手順の追加 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `.opencode/commands/agentdev/case-close.md`, `.opencode/skills/agentdev-git-worktree/SKILL.md`
- **ギャップ分類**: application miss（git pull の順序が不正: pull が cleanup 後に位置）+ fix gap（rename 制約未記載）
- **ギャップ詳細**: case-close Step 7 の git pull が branch -d の後に位置（lines 71-73）。repo/directory rename の操作制約が一切未記載。git-worktree スキルに remote-sync 検証なし

## 制約

- 既存の Guardrail G05/G06 との整合性を維持する
- Step 7 の修正は順序変更のみで、新しい Step を追加しない
- directory rename の手動案内は完了報告ステップに含める

## 受け入れ条件

- [ ] case-close Step 7 の操作順序が `worktree remove → prune → git pull → branch -d → remote delete` に修正されている
- [ ] 検証前の `git rev-parse HEAD` / `origin/main` 同期確認が Guardrail または Step に追加されている
- [ ] repo rename 時の remote branch delete 順序制約が注意事項に記載されている
- [ ] directory rename のセッション制約と手動実行案内が注意事項に記載されている

## 元learning item / 根拠

- **要約**: case-close Step 7 の Git 操作順序不正（4件）と rename 制約未記載（2件）の統合対応
- **根拠**: PR マージ後のローカル main 同期前に branch -d を実行すると not fully merged エラー。worktree 使用中の操作順序も不適切。repo rename は remote URL 即時変更、directory rename はセッション制約あり
- **再発条件**: case-close で worktree・branch 操作・rename を含むケースを実行する場合
- **横展開可能性**: 中（worktree 使用プロジェクト全般）

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug
- **関連Issue**: Issue #266, PR #267, Issue #246, Epic #284, Issue #330, PR #331
