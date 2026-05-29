# squash merge 後のブランチ削除・自マージ hash チェック改善

## 背景

case-close が PR を squash merge した後、Step 7 の `git branch -d` が「not fully merged」で失敗し、Step 8b の git pull hash check が自マージ由来の hash 不一致で停止する問題が毎回発生している。squash merge はマージコミットを作成しないため git がブランチを「未マージ」と判定し、また case-close 自身が merge した commit が origin/main に存在するため hash が必ず不一致になる。

## 問題

1. squash merge 後の `git branch -d` が「not fully merged」で確実に失敗する（-D は git-worktree skill で禁止）
2. Step 8b の hash check が case-close 自身の PR merge による hash 変更を「外部変更」として扱い停止する
3. agentdev-git-worktree skill の「-D 禁止」ルールに squash merge の例外がない

## 望ましい変更

- case-close Step 7 に squash merge 検出時の条件付き `-D` 許可を追加（PR merge 済みを確認の上）
- case-close Step 8b に自マージ検出ロジックを追加（pull 前 hash を Step 4 で記録し、差分が自マージ由来のみなら継続）
- agentdev-git-worktree skill に squash merge 後のローカルブランチ削除ガイダンスを追加

## 対象範囲

### 対象

- `.opencode/commands/agentdev/case-close.md` Step 7（ブランチ削除）, Step 8b（git pull hash check）
- `.opencode/skills/agentdev-git-worktree/SKILL.md` Section 4（ローカルブランチ削除）

### 対象外

- case-run.md
- 他のコマンドの squash merge 処理

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| command | `.opencode/commands/agentdev/case-close.md` | Step 4 で merge 前 hash を記録。Step 7 に squash merge 検出時の条件付き -D 許可を追加。Step 8b に自マージ検出を追加（Step 4 hash と比較） |
| skill | `.opencode/skills/agentdev-git-worktree/SKILL.md` | Section 4 に squash merge 後のローカルブランチ削除に関する例外条件を追加（PR merge 済み確認時は -D を許可） |

## 既存対策確認

- **確認結果**: 既存対策あり（不十分）
- **該当ファイル**: `.opencode/commands/agentdev/case-close.md` Step 7/8b, `.opencode/skills/agentdev-git-worktree/SKILL.md` Section 4
- **ギャップ分類**: fix gap + guardrail insufficiency
- **ギャップ詳細**: Step 8b の hash check は「外部変更検知」を目的とするが自マージ除外考慮がない。Step 7 の -d は squash merge 環境で必ず失敗する。git-worktree skill の -D 禁止に squash merge 例外がない

## 制約

- `-D` の条件付き許可は「PR がマージ済みであること」の確認を必須とする（`gh pr view` で state=MERGED を確認）
- Step 8b の自マージ検出は、pull 前 hash を Step 4 の直前（merge 前）に記録する必要がある
- merge commit を使用する場合はこの問題は発生しないため、squash merge 時のみの条件分岐とする

## 受け入れ条件

- [ ] case-close Step 4 で merge 前 HEAD hash を記録する
- [ ] case-close Step 7 で squash merge 検出時に PR merge 済み確認の上 -D を許可する
- [ ] case-close Step 8b で pull 後 hash と merge 前 hash を比較し、自マージ由来のみなら継続する
- [ ] agentdev-git-worktree skill Section 4 に squash merge 後の例外条件が記載されている

## 元learning item / 根拠

- **要約**: squash merge 後に case-close Step 7 の git branch -d が必ず失敗し、Step 8b の hash check が自マージで停止する
- **根拠**: 2件の実発生（Issue #342/PR #343, Issue #397/PR #398）。squash merge はマージコミットを作成せず、git がブランチを未マージと判定。自マージによる hash 変更を外部変更と誤検出
- **再発条件**: case-close が PR を squash merge する場合（毎回再発）
- **横展開可能性**: squash merge を使用するプロジェクト全般で発生

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug
- **関連Issue**: #342, #397
