# git-worktreeスキルへのWindows環境リトライ記述追加

## 背景

Case #470で`git worktree remove`実行時にPermission deniedエラーが発生した。Windows環境ではファイルハンドルが即座に解放されず、Remove-Item直後のディレクトリ削除でロックが残る。VS Codeのファイルウォッチャーやアンチウイルススキャンが原因の可能性。

## 問題

git-worktreeスキルのworktree削除手順に、Windows環境でのリトライ記述がない。Permission denied発生時の対処方法が定義されていない。

## 望ましい変更

git-worktreeスキルのworktree削除手順に、Permission denied時のリトライ手順（最大2回、短い待機を含む）を追加する。Windows環境でのファイルハンドル解放遅延を考慮した記述とする。

## 対象範囲

### 対象

- `.opencode/skills/agentdev-git-worktree/SKILL.md`（worktree削除手順）

### 対象外

- case-closeコマンド
- 他のスキル

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `.opencode/skills/agentdev-git-worktree/SKILL.md` | worktree削除手順にPermission denied時のリトライ記述を追加 |

## 既存対策確認

- **確認結果**: 既存対策あり
- **該当ファイル**: `.opencode/skills/agentdev-git-worktree/SKILL.md`
- **ギャップ分類**: fix gap
- **ギャップ詳細**: worktree削除手順は存在するが、リトライ・Permission deniedへの言及がない

## 制約

- 既存の削除手順を変更しない
- リトライ手順は追加として挿入
- Windows環境に依存しない汎用的な記述（他OSでも無害なリトライ）

## 受け入れ条件

- [ ] git-worktree SKILL.mdのworktree削除手順にPermission denied時のリトライ手順が追加されている
- [ ] 最大リトライ回数（2回）と待機時間が明記されている
- [ ] 既存の削除手順が変更されていない

## 元learning item / 根拠

- **要約**: Windows環境でのworktree削除時ファイルハンドル解放遅延対策
- **根拠**: Case #470でPermission denied発生。クリーンアップ後の再試行で成功。Windows環境でのファイルハンドル解放遅延が原因
- **再発条件**: Windows環境でディレクトリ削除直後の操作（git worktree remove等）を実行する場合
- **横展開可能性**: 高い。Windows環境の全ディレクトリ操作で発生

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, os-windows
- **関連Issue**: Issue #470
