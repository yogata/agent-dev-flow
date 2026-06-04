# worktree削除時のプロセスロック・tracked file干渉への対策強化

## 背景

case-closeのworktree削除時に、.sisyphus/内のtracked fileがcommitされていることや、LSP/エディタのプロセスロックにより`git worktree remove`が失敗する事象が2件発生した。TypeScript/Node.jsプロジェクトで特に顕著であり、LSP環境下でのworktree操作で高確率に再発する。

## 問題

agentdev-git-worktreeのworktree削除手順に以下の不備がある:
1. .sisyphus/クリーンアップがuntracked filesのみを対象としているかの明記がない
2. worktree削除前に`git checkout .`でrestorationを挟む手順がない
3. 削除失敗時の遅延リトライ（5-10秒後再試行）が定義されていない

## 望ましい変更

agentdev-git-worktreeのworktree削除手順に以下を追加:
1. .sisyphus/クリーンアップはuntracked filesのみ対象とする旨の明記
2. worktree削除前に`git checkout .`でrestorationを挟む手順
3. 削除失敗時の遅延リトライ（5-10秒後再試行、最大3回）
4. case-closeのエラー回復手順にも反映

## 対象範囲

### 対象

- `.opencode/skills/agentdev-git-worktree/references/worktree-operations.md` — 削除手順Section 1-2
- `.opencode/commands/agentdev/case-close.md` — Step 7のworktree削除エラー回復

### 対象外

- agentdev-git-worktreeの作成手順
- ブランチ削除・リモートブランチ削除
- テンプレートファイル

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `.opencode/skills/agentdev-git-worktree/references/worktree-operations.md` | Section 1にuntracked-only削除の明記、Section 2に遅延リトライ強化（5-10秒・最大3回）を追加 |
| command | `.opencode/commands/agentdev/case-close.md` | Step 7にworktree削除失敗時のエラー回復手順を追加 |

## 既存対策確認

- **確認結果**: 既存対策あり（一部）
- **該当ファイル**: `.opencode/skills/agentdev-git-worktree/references/worktree-operations.md` Section 1-2, `.opencode/commands/agentdev/case-close.md` Step 7
- **ギャップ分類**: fix gap
- **ギャップ詳細**: worktree-operations.md Section 1に.sisyphus/クリーンアップの記載はあるが、tracked file（commit済み）の削除を避けるべき旨の明記がない。Section 2にPermission denied時のリトライ（最大2回）はあるが、プロセスロック向けの遅延リトライ（5-10秒）が定義されていない。case-close Step 7には「worktree remove → Permission denied 時は停止」の記載のみ

## 制約

- untracked fileの削除は既存の`Remove-Item -Recurse -Force`で対応可能
- tracked file（commit済み）は`git checkout .`でrestorationするのみとし、`git clean -fd`等は使用しない
- 遅延リトライの待機時間は環境依存（LSPプロセスの解放待ち）のため、5-10秒の範囲で可変
- Permission deniedのリトライ上限は既存（2回）から（3回）に引き上げる

## 受け入れ条件

- [ ] worktree-operations.md Section 1にuntracked-only削除の明記が追加されている
- [ ] worktree-operations.md Section 2に遅延リトライ（5-10秒・最大3回）が追加されている
- [ ] case-close Step 7にworktree削除失敗時のエラー回復手順が追加されている
- [ ] 既存のPermission deniedリトライパターンとの整合性がある

## 元learning item / 根拠

- **要約**: worktree削除時のプロセスロック・tracked file干渉による`git worktree remove`失敗
- **根拠**: .sisyphus/内のtracked fileがcommitされていること、およびLSP/エディタのプロセスロックにより`git worktree remove`が失敗する事象が2件（tracked file干渉1件 + プロセスロック1件）発生
- **再発条件**: (1) LSPがworktree内ファイルを監視中、(2) .sisyphus/内のtracked fileがcommitされている、(3) `git worktree remove`を実行
- **横展開可能性**: case-close全般で発生。TypeScript/Node.jsプロジェクトで特に顕著。LSP環境下でのworktree操作で高確率に発生

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement
- **関連Issue**: なし
