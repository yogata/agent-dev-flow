# squash merge 済み判定の branch 構成別手順（git cherry の非等価）

## 背景

case-close STEP-6-1 の branch -D 前の squash merge 済み確認で、branch が複数コミット構成の場合に `git cherry origin/main <branch>` が全コミット `+`（patch 非等価）を返し、squash merge 済みかの判定が非等価になる事象が観測された（Case #3355・branch 2 コミット構成）。

## 問題

branch が複数コミット構成の場合、squash merge 後の合算コミットと個別コミットの patch-id は一致しないため、git cherry の patch-id 等価による一次判定が使えない。

## 望ましい変更

worktree クリーンアップ手順（branch -D 前確認）へ次を明記する: 単一コミット構成のみ git cherry を一次判定に使い、複数コミット構成では「branch 変更範囲の限定確認（分岐点..branch の diff 対象が本 Case ファイルのみ）+ 変更ファイルの内容一致（`git diff origin/main <branch> -- <files>` が空）」で squash merge 済みを判定する。

## 対象範囲

### 対象

- `src/common/skills/agentdev-git-worktree/references/worktree-operations.md`（ブランチクリーンアップ手順）
- case-close 側 branch 削除前確認手順

### 対象外

- squash merge 運用自体の変更

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/common/skills/agentdev-git-worktree/references/worktree-operations.md | branch 構成別の squash merge 済み判定手順の追記 |

## 既存対策確認

- **確認結果**: 既存対策なし（2026-10-05 grep 実測: worktree-operations.md に git cherry 記述なし）
- **該当ファイル**: なし
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 複数コミット構成での判定手順が未記載

## 制約

- branch -D は内容一致確認を経て実行する現行規律は維持

## 受け入れ条件

- [ ] branch 構成別の判定手順（git cherry 一次判定の適用限界と内容一致判定）が明記される

## 元learning item / 根拠

- **要約**: 複数コミット構成 branch の squash merge 済み判定は git cherry の patch-id 等価に依存できない（1件）
- **根拠**: Case #3355 case-close STEP-6-1（2コミット構成で cherry が 2件とも +・diff 空の内容一致で判定して -D）
- **再発条件**: 複数コミット構成の branch に対して git cherry で squash merge 済み判定を行う場合
- **横展開可能性**: squash merge 運用を持つ worktree クリーンアップ全般

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
