# domain state の untracked 残留と Form Zero 削除の対の回復（保存時 git 永続化規律）

## 背景

case-ready STEP-7 の draft 削除時に `.agentdev/drafts/req-draft-issue-contract-simplification.md` が untracked で、REQ-061-040 の正規形（`git rm` + 明示パス commit 同一ステップ）を適用できず物理削除のみとなった。同じく `.agentdev/jev-observations/` 62 ファイルも untracked 残留した（REQ-090-006 は観測を git 管理対象の domain state と定義。.gitignore は両者を除外していない）（Root Case #3407・PR #3408）。

## 問題

domain state を保存する工程（req-define の draft 保存、各 workflow の Jev evaluate による観測永続化）が保存時に git 永続化まで完了せず、untracked のまま次工程へ引き継ぐと、成功時の削除契約（git rm 前提の Form Zero）と永続化の対が崩れる。

## 望ましい変更

(a) 保存系 workflow への「保存と同時の明示パス commit」規律の追加候補、または (b) 次工程入口での untracked domain state 検出（learning-promote / intake-promote 等の STEP での `git status --short` 確認）の追加候補。いずれか（または両方）を req-define が選択する。

## 対象範囲

### 対象

- req-define・case-open references の draft 保存手順
- Jev 観測永続化（agentdev_jev）を実行する workflow の観測保存手順注記
- 各 promote workflow（learning-promote / intake-promote）の入口 STEP

### 対象外

- REQ-090-006・REQ-061-040 の現行契約（維持）
- blocked/failed 中断時の draft 保持契約（維持）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | req-define / case-open references（保存手順） | 保存と同時の明示パス commit 規律の追加候補 |
| 配布skill reference | Jev evaluate を持つ workflow references | 観測保存の git 永続化注記候補 |
| 配布skill | learning-promote / intake-promote の入口 STEP | untracked domain state 検出の追加候補 |

## 既存対策確認

- **確認結果**: 既存対策なし（保存時永続化の規律なし）
- **該当ファイル**: なし
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: 保存系 workflow の git 永続化タイミングが規約化されておらず、後続工程の Form Zero 削除と対が崩れる

## 制約

- blocked/failed 中断時は draft 保持が正である現行契約は維持する（残留自体が即違反ではない）

## 受け入れ条件

- [ ] 保存時の git 永続化規律または入口検出のいずれかが手順化される

## 元learning item / 根拠

- **要約**: domain state の untracked 残留で Form Zero（git rm + 明示パス commit）が成立しない事象（1件）
- **根拠**: Root Case #3407・PR #3408（draft untracked で物理削除のみ・jev-observations 62ファイル untracked・git check-ignore で管理対象裏取り）
- **再発条件**: 保存系 workflow が git commit を伴わず domain state を保存し、後続工程の Form Zero 削除・同期確認が実行される場合
- **横展開可能性**: draft・jev-observations・promoted 等の保存 workflow 全般

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, workflow
- **関連Issue**: なし
