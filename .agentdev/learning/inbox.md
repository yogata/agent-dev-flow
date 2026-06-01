# 学び・教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類・整理して永続的なドキュメントに移動する。

---

## 同一ファイルを変更する兄弟PRの逐次マージ時のコンフリクト対処

- **問題事象**: case-closeでPR #507(Issue #504)を先にsquash mergeした後、PR #508(Issue #503)の `gh pr merge --squash` が失敗。両PRが同一テストファイル `check_integrity.test.ts` の末尾に独立したテストセクション（describe block）を追加しており、main側が更新されたことでfeature/issue-503ブランチがbehindになった
- **発生局面**: 実装（case-close の PRマージステップ）
- **検知方法**: `gh pr merge --squash` の非ゼロ終了コードとエラーメッセージ
- **根本原因**: 兄弟Issue (#503, #504) がEpic #502配下で並列開発され、同一ファイルに追記形の変更を行っていた。一方のマージ後にもう一方のブランチがbaseより古くなり、squash merge不可となった
- **自律対応内容**: (1) `git rebase origin/main` でfeature/issue-503を最新mainにrebase、(2) コンフリクトを解消（両方のテストセクションを保持）、(3) force push、(4) squash merge成功を確認
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 同一Epic配下の並列開発で同一ファイルを変更するパターン全般に適用可能。特にテストファイルの末尾追記型変更で顕著
- **再発条件**: (1) 同一ファイルを変更する2つ以上のPRが存在、(2) それらを逐次マージする場合、(3) 後続PRがrebaseなしでマージを試みた場合
- **予防策候補**: (1) case-closeで複数PRを処理する際、マージ順序で後になるPRほどコンフリクトリスクが高いことを認識する、(2) マージ失敗時はrebase + conflict resolution → force push → retryのワークフローを標準手順とする
- **想定反映先**: case-close コマンドの Step 4（PRマージ）のエラー回復手順として文書化、または case-run の並列開発ガイドライン
- **関連**: Issue #503, #504, PR #507, #508, Epic #502, `tests/check_integrity.test.ts`
- **タグ**: `#merge-conflict` `#case-close` `#parallel-development` `#rebase`

---

## 2026-06-02: 並行PRでの同一正規化変更によるdocs競合の反復発生

- **問題事象**: case-close #511でPR #516をマージ時、#513と#512が先にマージされており、両方でreference/→references/正規化を実施済みのためdocs/guides/artifact-model.mdとdocs/specs/patterns.mdでコンフリクトが発生した
- **発生局面**: 実装（case-closeのPRマージステップ）
- **検知方法**: `git merge origin/main`のCONFLICT出力
- **根本原因**: 3つの並行PR（#511, #512, #513）がすべて同じreference/→references/正規化を独立に実施し、同一ファイルの同じ箇所を変更した
- **自律対応内容**: (1) worktree内でorigin/mainをmerge、(2) 2ファイルの競合を解消（表示テキストの`reference/`を`references/`に統一、コメント表記の"Skill"大文字化を採用）、(3) commit & push、(4) squash merge成功
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし
- **横展開観点**: 複数Issueで共通のpath正規化・名称統一作業を行う場合、最初のPRだけで対応し後続PRでは重複させない設計が必要
- **再発条件**: (1) 複数PRが同一ファイルの同じ箇所を同じ方向に変更する、(2) PRが逐次マージされる、(3) 後続PRのマージ時に先にマージされた変更と競合する
- **予防策候補**: (1) 共通変更（path正規化等）は独立した単独PRとして最初にマージする、(2) 並行PR間で変更ファイルの重複を事前検知する、(3) case-run/case-closeでmerge前に`git merge origin/main --no-commit`で競合の有無を確認する手順を標準化する
- **想定反映先**: agentdev-git-worktree/references/git-common-procedures.mdのPR merge前確認手順、またはagentdev-workflow-orchestrationの並行Wave実行ガイド
- **関連**: Issue #511, #512, #513, PR #516, `docs/guides/artifact-model.md`, `docs/specs/patterns.md`
- **タグ**: `#merge-conflict` `#parallel-pr` `#canonical-path` `#case-close`

---

## 2026-06-02: .sisyphus/内のtracked fileがworktree削除をブロック

- **問題事象**: case-close #511のworktree削除で`git worktree remove`が"contains modified or untracked files"で失敗。原因は.sisyphus/plans/plan-513.mdがfeature branchにcommitされており、.sisyphus/クリーンアップで削除したことでgitがmodified（deleted）と判定した
- **発生局面**: 実装（case-closeのworktree削除ステップ）
- **検知方法**: `git worktree remove`の非ゼロ終了コード
- **根本原因**: (1) .sisyphus/plans/plan-513.mdがfeature branchにcommitされていた（runtime workspaceのファイルがgit管理下にあった）、(2) .sisyphus/クリーンアップがtracked fileも削除してしまった
- **自律対応内容**: (1) `git checkout .`でdeleted fileを復元、(2) `git worktree remove`を再実行して成功
- **ユーザー確認有無**: なし
- **ADR/REQ/spec影響**: なし。AGENTS.mdに「.sisyphus/はruntime workspace」と明記済みだが、実際にはtracked fileが存在した
- **横展開観点**: .sisyphus/内にtracked fileが残存する他のworktreeでも同様に発生しうる
- **再発条件**: (1) worktree内で.sisyphus/以下のファイルがgit commitされている、(2) case-closeの.sisyphus/クリーンアップでtracked fileを削除する、(3) `git worktree remove`がmodified filesを検出する
- **予防策候補**: (1) .sisyphus/クリーンアップ手順を`git status --short`でuntracked filesのみ削除するよう変更、(2) .sisyphus/plans/等のruntime fileをcommitしない運用にする、(3) worktree削除前に`git checkout .`でrestorationを挟む手順を追加
- **想定反映先**: agentdev-git-worktreeのworktree削除手順（SKILL.mdまたはreferences/worktree-operations.md）
- **関連**: Issue #511, `.sisyphus/plans/plan-513.md`, `agentdev-git-worktree/references/worktree-operations.md`
- **タグ**: `#worktree` `#cleanup` `#case-close` `#git`
