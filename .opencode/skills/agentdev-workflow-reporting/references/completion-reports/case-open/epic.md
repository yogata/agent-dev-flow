✅ case-open 完了

完了コマンド: /agentdev/case-open
対象: Epic Issue #{epic_N}（機能追加 Epic）
結果:
  - Epic Issue #{epic_N} を作成
  - REQ-{NNNN} をEpic本文に反映
  - 子Issue: #{child1}, #{child2}, #{child3}（{count}件）
  - Wave構成: {wave_count} Wave（{wave_summary}）
検証結果: ✅ OK
git 永続化: {該当なし / ✅ OK（commit {hash}, push 済み, HEAD = origin/main 同期確認OK）}
次のコマンド: /agentdev/case-run {epic_N}
