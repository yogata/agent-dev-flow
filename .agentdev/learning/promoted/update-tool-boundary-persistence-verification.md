# ツール・プロセス境界を跨ぐ編集の永続化漏れの予防

## 背景

bun install・git rebase・Epic Wave close といったツール・プロセス処理の後に必要となる手動編集・追従確認が、永続化・統合フローから漏れる事象が 3 観測されている。いずれも下流（squash merge・main・Wave 境界）で欠落として発覚し、PR #2693 では main が Comment 系操作未定義定数参照の壊れた状態でマージされ、fix コミット（77e2caa4）での修復を要した。

## 問題

- bun install は bun.lock の root workspace name を自動同期せず、package rename 後に旧名が残存する
- rebase コンフリクト解消後の編集が rebase --continue の git add 対象から漏れ、未コミット変更が worktree に残留したまま squash merge される
- 複数 Wave Epic で各子 Issue が独立スコープで参照更新を行い、Wave 境界の横断的残存確認が最終 Wave まで遅延する

## 望ましい変更

境界（ツール処理完了・merge・Wave close）の通過前に機械確認を、通過後に再検証を手順へ明記する:

- rebase 中の解消編集はすべて rebase --continue 前の git add で確定させる。squash merge 前に worktree が clean であること（または squash 内容と worktree の diff が空であること）を確認する
- merge 後は merge 先 main 上で影響テストを再実行する
- package rename 後は bun.lock 内 root workspace name を grep 確認し、旧名残存時は手動更新する
- Wave 完了時に廃止対象キーワードの全文検索を定型チェックとして組み込む

## 対象範囲

### 対象

- case-close の PR マージ・コンフリクト解消（Level 1 rebase）手順
- Epic Wave 境界のクローズ手順
- package rename を伴う Case の検証手順

### 対象外

- git・bun の実装変更
- case-run 委譲内部の作業手順

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| Design | agentdev-workflow-case-close の pr-merge-and-conflict reference（rebase 手順節） | git add 完了・worktree clean 確認・merge 後再検証の手順注記 |
| Design | agentdev-workflow-orchestration（Wave 境界・epic-tracker 関連） | Wave 完了時の廃止キーワード全文検索の定型化 |
| Design | docs/designs/local/runtime-package-boundary.md または REQ-009 系検証手順 | package rename 後の bun.lock name 確認手順 |
| 配布skill | .opencode/skills/agentdev-git-worktree/references/worktree-operations.md | merge 前提の clean 確認手順（既存 stash 運用節との整合） |

## 既存対策確認

- **確認結果**: 既存対策なし（断片的な運用のみ）
- **該当ファイル**: なし（PR #2693 対応記録コメント・learning inbox に事象記録のみ）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: rebase 解消編集の確定タイミング・merge 前 clean 確認・merge 後再検証がいずれも正規手順文書に未規定

## 制約

- Level 1 rebase は case-close の、Level 2/3 は case-auto の責務範囲であり、注記の配置先はこの分担を維持する

## 受け入れ条件

- [ ] rebase 手順に「解消編集は rebase --continue 前 の git add で確定」が明記される
- [ ] squash merge 前の worktree clean 確認（または diff 空確認）が手順化される
- [ ] merge 後の main 上再検証が手順化される
- [ ] Wave 境界での廃止キーワード全文検索が定型チェックとして記載される

## 元learning item / 根拠

- **要約**: ツール自動同期対象外・境界横断の編集が永続化から漏れ、main 破壊・fix コミット・Wave 遅延発覚を生んだ 3 観測
- **根拠**: PR #2684（bun.lock name）、PR #2693（rebase git add 漏れ・77e2caa4 修復）、Epic Wave 運用（2026-06-07 観測）
- **再発条件**: rebase・package rename・複数 Wave Epic で境界通過前の機械確認を省略する場合
- **横展開可能性**: コンフリクト解消・ツール処理後の編集を伴うマージ全般

## 推奨Issue分類

- **分類**: docs_chore（手順文書への注記集約）
- **推奨ラベル**: documentation
- **関連Issue**: なし（Issue #2689 の対応記録追記コメント由来の学びを含む）
