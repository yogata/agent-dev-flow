# Windows junction worktree 削除時のフォールバック手順追加

## 背景

Windows 環境で junction（ディレクトリシンボリックリンク）ベースの worktree に対して `git worktree remove` を実行したところ "Not a directory" エラーで失敗した。git worktree list では既に prune 対象になっていた。`git worktree prune` + ローカル/リモートブランチ削除は正常に完了した。worktree-operations.md には prune + フォールバック手順が存在するが、junction 特有のエラーパターンが明記されていない。

## 問題

`src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md` の削除手順セクション（行42-67）に、junction 環境での `git worktree remove` 失敗パターンとその対処が明記されていない。Windows + junction 環境で worktree 削除を行う際、エージェントが適切にフォールバックできない可能性がある。

## 望ましい変更

worktree-operations.md の削除手順セクションに、junction 環境特有のエラーパターンを追加する:
- "Not a directory" エラーの発生条件（Windows + junction）
- フォールバック手順: `git worktree prune` → 手動ディレクトリ削除 → ブランチ削除
- install-consumer-opencode.ps1 で junction を使用している点への言及

## 対象範囲

### 対象

- `src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md` — 削除手順セクション

### 対象外

- SKILL.md 本体
- 他の worktree 操作（作成・切替）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill reference | `.opencode/skills/agentdev-git-worktree/references/worktree-operations.md` | junction エラーパターンとフォールバック手順を削除手順に追加 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分的）
- **該当ファイル**: `src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md`（行42-67: prune + フォールバック手順あり）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: junction 特有の "Not a directory" エラーパターンが未記載。prune 手順自体は存在するが、junction で `git worktree remove` が失敗する理由と具体的対処が明示されていない

## 制約

- 既存の prune 手順と整合性を保つこと
- Windows 固有の問題であることを明記すること

## 受け入れ条件

- [ ] worktree-operations.md に junction 環境でのエラーパターンが追記されている
- [ ] フォールバック手順（prune → 手動ディレクトリ削除 → ブランチ削除）が明記されている
- [ ] 既存の prune 手順と矛盾しない

## 元learning item / 根拠

- **要約**: Windows + junction 環境で git worktree remove が "Not a directory" エラーで失敗する問題
- **根拠**: L-20260608-01（Junction worktree の git worktree remove 失敗パターン）。`git worktree prune` で管理情報クリーンアップ後に手動ディレクトリ削除で対応
- **再発条件**: Windows + junction worktree + `git worktree remove` の組み合わせ
- **横展開可能性**: install-consumer-opencode.ps1 で junction を使用する全環境で発生可能性あり

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, windows
- **関連Issue**: Issue #683, PR #687
