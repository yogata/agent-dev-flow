⚠️ case-close 完了（部分失敗）

完了コマンド: /agentdev/case-close
対象: Issue #{N} / PR #{PR_N}
結果:
  GitHub側:
    - PR #{PR_N} をマージ: ✅ 成功
    - Issue #{N} をクローズ: ✅ 成功
  .agentdev 永続化:
    - {変更あり/なし}
    - commit: {hash}, push: {成功/失敗}
  ブランチ・worktree:
    - worktree削除: ❌ 失敗（{reason}）
    - ローカルブランチ削除: {成否}
    - リモートブランチ削除: {成否}
  Findings回収: {回収済みN件 / 保存済みN件}（{該当なしの場合は「該当なし」}）
検証結果: ⚠️ 注意（ブランチ・worktree削除失敗）
git 永続化: {結果}
次のコマンド: worktreeを手動でクリーンアップしてください
