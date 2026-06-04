⚠️ case-run 完了（Epic Orchestrator）

完了コマンド: /agentdev/case-run
対象: Epic #{epic_N}
結果:
  | Wave | Issue | 状態 | PR | 備考 |
  |------|-------|------|----|----|
  | 1 | #{child1_N} | ✅ 完了 | #{pr1_N} | — |
  | 2 | #{child2_N} | ❌ 失敗 | — | 実装フェーズでエラー |
  | 3 | #{child3_N} | ⏭ スキップ | — | Wave 2 失敗依存 |

  成功: {success_count}件 / 失敗: {fail_count}件 / スキップ: {skip_count}件
検証結果: ⚠️ 注意
git 永続化: 該当なし
次のコマンド:
  - 成功したIssueのレビュー通過後: /agentdev/case-close
  - 失敗したIssueの修正後: /agentdev/case-run {failed_issue_N}
