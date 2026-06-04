# worktree削除時のuntracked-only削除と遅延リトライ強化

## 背景

case-closeのworktree削除ステップで`.sisyphus/`内のtracked file削除による`git worktree remove`失敗と、LSPプロセスロックによるPermission deniedがそれぞれ発生している。2件のlearning entryで確認されたパターンであり、worktreeクリーンアップ手順の改良で再発防止可能。

## 問題

agentdev-git-worktreeのworktree削除手順に以下の問題がある:
1. `.sisyphus/`クリーンアップが`Remove-Item -Recurse -Force`でtracked fileも削除してしまう
2. LSPプロセスロックに対する遅延リトライがmax 2回と少なく、3回以上試行が必要なケースがある
3. worktree削除失敗時のフォールバック手順が不十分

## 望ましい変更

agentdev-git-worktreeのworktree削除手順（references/worktree-operations.md）に以下を追加・修正:
- `.sisyphus/`クリーンアップを`git status --short`でuntracked filesのみ対象に変更
- Permission denied時の遅延リトライをmax 2回 → max 3回に増やし、間隔を5秒に設定
- リトライ全滅時のフォールバック: `git worktree prune`でgit管理から除外し、物理ディレクトリ残存を警告として扱う手順を明記
- worktree削除前に`git checkout .`でtracked fileのrestorationを挟む手順を追加

## 対象範囲

### 対象

- `.opencode/skills/agentdev-git-worktree/references/worktree-operations.md` — worktree削除手順

### 対象外

- case-close.md — 既に「Permission denied時は停止（リトライはskill定義に従う）」とあるため
- 他スキル・コマンド

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `.opencode/skills/agentdev-git-worktree/references/worktree-operations.md` | クリーンアップ手順をuntracked-onlyに変更。リトライ回数・間隔の強化。フォールバック手順の追加 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `.opencode/skills/agentdev-git-worktree/references/worktree-operations.md`
- **ギャップ分類**: fix gap
- **ギャップ詳細**: lines 38-43の`.sisyphus/`クリーンアップが`Remove-Item -Recurse -Force`で全ファイル削除（tracked fileも対象）。line 53のPermission deniedリトライがmax 2回で少ない。`git checkout .`によるrestoration手順がない。

## 制約

- case-close.mdのStep 7（worktree削除）との整合性を維持する
- case-close側は「リトライはskill定義に従う」とあるため、skill側の変更で完結する
- PowerShellコマンドレット（`Start-Sleep`等）のみを使用する
- git worktreeの外部ツールへの依存を追加しない

## 受け入れ条件

- [ ] `.sisyphus/`クリーンアップがuntracked filesのみを対象とする手順に変更されている
- [ ] Permission denied時の遅延リトライがmax 3回、間隔5秒に強化されている
- [ ] worktree削除前に`git checkout .`でtracked file restorationを挟む手順が追加されている
- [ ] リトライ全滅時のフォールバック手順（`git worktree prune` + 物理ディレクトリ残存警告）が明記されている

## 元learning item / 根拠

- **要約**: worktree削除時にtracked file削除とLSPプロセスロックで`git worktree remove`が失敗
- **根拠**: 2件のlearning entryで確認。(1) .sisyphus/plans/plan-513.mdがtracked fileとしてcommitされておりクリーンアップで削除された、(2) TypeScript Language Serverがworktree内ファイルを監視しディレクトリハンドルを解放しなかった
- **再発条件**: (1) worktree内の.sisyphus/以下にtracked fileが存在、(2) LSPがworktree内ファイルを監視中
- **横展開可能性**: case-close全般で発生。TypeScript/Node.jsプロジェクトで特に顕著

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, enhancement
- **関連Issue**: Issue #511, #544
