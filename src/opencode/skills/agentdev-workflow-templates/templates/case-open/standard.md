---
name: Case Open Completion Report (Standard)
about: case-open Standard flow 完了報告テンプレート
---

✅ case-open 完了

完了コマンド:/agentdev/case-open
対象: Issue #{N}（{日本語名称}）
結果:
 - Issue #{N} を作成
 - {機能追加の場合: REQ-{NNNN} をIssue本文に反映}
 Capture結果: {該当なし省略可 / 以下capture 成果物がある場合のみ}
  - パス: {.agentdev/intake/inbox/*.md または .agentdev/learning/inbox.md への相対パス}
  - 分類: {intake/learning}
  - 保存結果: {成功/失敗（理由）}
検証結果: ✅ OK
git 永続化: {該当なし/ ✅ OK（commit {hash}, push 済み, HEAD = origin/main 同期確認OK）}
次のコマンド:/agentdev/case-run {N}
