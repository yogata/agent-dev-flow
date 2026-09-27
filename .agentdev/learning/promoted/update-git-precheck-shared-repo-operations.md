# 共有主リポジトリ並行操作下の git 前置状態確認（operation in progress・current branch）の前置ガード整備

## 背景

共有主リポジトリを並行プロセスが操作する環境で、(1) main リポジトリに先行セッションの revert 中断残骸が残留した状態で Definition branch 作成を開始しかけた事象（Case #3166）と、(2) case-ready STEP-7 の永続化 commit が並行 case-open の作業 branch へ誤配置された事象（Case #3169）が発生した。(2) では誤配置 commit の修復（reset・cherry-pick）と push 確認を要した。前置確認の欠落は予防策ベースの統合根拠であり、この観点を手順へ前置ガードとして明文化する。

## 問題

- worktree・branch 作成を伴う workflow の前置確認に「長形式 git status の operation in progress 表示確認」が含まれない。porcelain 短形式では revert/rebase/merge 中間状態が表面化しない
- main 永続化 commit を行う工程の前置確認に「commit 前の current branch 確認」が含まれない。共有主リポジトリの current branch は工程実行中に他プロセス（並行 case-open 等）の branch 切替で変化し得る
- case-open 側の worktree 隔離（REQ-030-017）が主ツリーで守られない構造に依存していた

## 望ましい変更

- worktree・branch 作成を伴う workflow の前置確認に「長形式 git status で operation in progress 表示の有無確認」を含める。検出時は porcelain 確認 → abort 判定 → 解除後再確認の順で固定
- main 永続化 commit の前に git branch --show-current で current branch を確認し、main 以外なら主ツリーでの commit を行わず worktree 経由（main checkout）へ切替する前置ガードの標準化

## 対象範囲

### 対象

- agentdev-git-worktree worktree-operations.md（書込み guard 運用指針・前置状態確認）
- case-ready readiness-and-cleanup.md（STEP-7 前置ガード）
- main 永続化を行う全工程（case-close ドメイン状態永続化、learning/intake capture の git 永続化）の手順記述

### 対象外

- revert 残骸発生の根本原因の特定（未特定。観測限界。本成果物は予防策ベースの統合であり原因究明を含まない）
- REQ-030-017 worktree 隔離要件自体の変更

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補であり、req-define が最終的に選択、修正できる。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill reference | src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md | 前置状態確認への「長形式 git status の operation in progress 表示確認」追加 |
| 配布skill reference | src/opencode/skills/agentdev-workflow-case-ready/references/readiness-and-cleanup.md | STEP-7 永続化手順への current branch 前置ガード明文化 |
| 配布skill reference | agentdev-workflow-case-open references（definition-pr-and-idempotency.md「期待値確定前の branch HEAD 実測」節） | branch 作成前の operation in progress 確認の前置手順追加候補 |
| knowledge | docs/knowledge/ 候補 | 並行実行時の git 安全運用（前置ガード集約）の知識化判定対象 |

## 既存対策確認

- **確認結果**: あり（guardrail insufficiency）
- **該当ファイル**: src/opencode/skills/agentdev-git-worktree/references/worktree-operations.md（書込み guard 運用指針）、src/opencode/skills/agentdev-workflow-case-ready/references/readiness-and-cleanup.md
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: 前置状態確認手順に operation in progress 表示確認・current branch 確認が未明文化。近縁 deferred「2026-09-14 case 2805: サブエージェント bash の Windows パス結合不具合」は commit 前の git status --porcelain 確認を前置手順として維持する点で共通予防策だが、該当 deferred エントリなし

## 制約

- porcelain 短形式では中間状態が表面化しないため、前置確認は長形式 git status を用いる
- 誤配置 commit の修復（reset・cherry-pick・worktree 経由 push）は既に自律対応で実施済み。本成果物は再発予防の前置ガードが対象であり、修復手順の変更は対象外
- 並行 branch の push・force push は行わない（誤配置した自工程 commit の正規位置への移動のみ）

## 受け入れ条件

- [ ] 前置状態確認手順に「長形式 git status で operation in progress 表示確認」が追加されること
- [ ] main 永続化 commit 前の current branch 確認（main 以外なら主ツリー commit 不実施・worktree 経由へ切替）が標準手順として明文化されること

## 元 learning item / 根拠

- **要約**: 共有主リポジトリの並行 git 操作下で前置状態確認が欠落すると branch 誤配置・中間状態残留のリスクが顕在化する
- **根拠**: 2観測。
  - inbox「main リポジトリに revert 進行中の中断残骸を検出し Definition branch 作成前に git revert --abort で復旧した」（Case #3166、commit 827c88fd 確認済み HEAD）: git status「Revert currently in progress」を検出。porcelain で staged 空・HEAD = origin/main を確認後 revert --abort で解除。**根本原因は未特定**（先行セッションの revert 操作中断残骸と推定。観測限界）
  - inbox「並行 case-open による主リポジトリ branch 切替下で case-ready STEP-7 の永続化 commit が並行 Definition branch へ誤配置される」（Case #3169・PR #3170）: commit 23593c94 が definition/issue-3171 先頭へ誤配置。reset --hard で並行 branch を復帰し、別 worktree で main checkout → cherry-pick → push origin main（b2001d37）で修復
- **再発条件**: 共有主リポジトリで並行 Case 実行・先行セッション中断後に、別工程が git 操作（branch 作成・main 永続化 commit）を開始する場合
- **横展開可能性**: main 永続化を行う全工程（case-ready STEP-7、case-close ドメイン状態永続化、learning/intake capture の git 永続化）に適用可能。並行実行時の git 安全運用は本プロジェクトの核心的運用知識

## 推奨Issue分類

- **分類**: fix
- **推奨ラベル**: bug, documentation
- **関連Issue**: なし
