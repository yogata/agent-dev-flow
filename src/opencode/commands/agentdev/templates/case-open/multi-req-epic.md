✅ case-open 完了（マルチREQ）

完了コマンド:/agentdev/case-open
対象: Epic Issue #{epic_N}（マルチREQ Epic）
結果:
 - Epic Issue #{epic_N} を作成
 - 対象REQ: {REQ番号リスト}（{req_count}件）
 - 子Issue: #{child1}, #{child2}, #{child3}（{count}件）
 - Wave構成: {wave_count} Wave（{wave_summary}）
 Capture結果: {該当なし省略可 / 以下capture 成果物がある場合のみ}
  - パス: {.agentdev/intake/inbox/*.md または .agentdev/learning/inbox.md への相対パス}
  - 分類: {intake/learning}
  - 保存結果: {成功/失敗（理由）}
検証結果: ✅ OK
git 永続化: {該当なし/ ✅ OK（commit {hash}, push 済み, HEAD = origin/main 同期確認OK）}
次のコマンド:/agentdev/case-run {epic_N}


