✅ case-close 完了

完了コマンド: /agentdev/case-close
対象: Issue #{N} / PR #{PR_N}
結果:
  - PR #{PR_N} をマージ
  - Issue #{N} をクローズ
  - ブランチ・作業ツリーをクリーンアップ
  - {機能追加の場合: ドキュメント（REQ・specs）を更新済み}
  - {Epic自動クローズの場合: Epic #{epic_N} を自動クローズ（全子Issue完了）}
  - {Epicスキップの場合: Epic #{epic_N}: N件未完了のためスキップ}
  - 検出事項回収: {回収済みN件 / 保存済みN件}（{該当なしの場合は「該当なし」}）
検証結果: ✅ OK（{N}件の書き込み操作を検証済み）
git 永続化: 変更なし（commit/push スキップ）
次のコマンド: なし
