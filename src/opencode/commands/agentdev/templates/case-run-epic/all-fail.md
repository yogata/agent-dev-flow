❌ case-run 完了（Epic Orchestrator）

完了コマンド: /agentdev/case-run
対象: Epic #{epic_N}
結果:
  | Wave | Issue | 状態 | PR | 備考 |
  |------|-------|------|----|----|
  | 1 | #{child1_N} | ❌ 失敗 | — | {error_summary_1} |
  | 2 | #{child2_N} | ❌ 失敗 | — | {error_summary_2} |

  成功: 0件 / 失敗: {fail_count}件 / スキップ: 0件
検証結果: ❌ NG
git 永続化: 該当なし
次のコマンド: 失敗原因を確認後、再実行: /agentdev/case-run {epic_N}
