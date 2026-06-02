⚠️ case-close 完了（部分失敗）

完了コマンド: /agentdev/case-close
対象: Issue #{N} / PR #{PR_N}
結果:
  GitHub側:
    - PR #{PR_N} をマージ: ✅ 成功
    - Issue #{N} をクローズ: ✅ 成功
    - {Epic自動クローズの場合: Epic #{epic_N} を自動クローズ: ✅ 成功}
  .agentdev 永続化:
    - 変更あり: {changed_files}
  ブランチ・worktree:
    - 削除: ✅ 成功
  Findings回収: {回収済みN件 / 保存済みN件}（{該当なしの場合は「該当なし」}）
検証結果: ⚠️ 注意（GitHub完了 / domain state永続化失敗）
git 永続化: commit: {hash}, push: ❌ 失敗
次のコマンド: 手動で `git push` を実行してください
