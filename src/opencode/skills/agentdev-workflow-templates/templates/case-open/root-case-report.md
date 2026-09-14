---
name: Case Open Completion Report (Root Case)
about: case-open Root Case flow 完了報告テンプレート
---

✅ case-open 完了

完了コマンド:/agentdev/case-open
対象: Root Case Issue #{N}（{日本語名称}）
結果:
 - Root Case Issue #{N} を作成（状態 open）
 - REQ-{NNNN} を Root Case 本文の対象 REQ セクションへ記録
 - Definition Package を生成し Root Case へ関連付け
 - Draft Definition PR: {作成済み: #{pr_N}（実変更あり） / 不作成（実変更なし）}
 Capture結果: {該当なし省略可 / 以下capture 成果物がある場合のみ}
  - パス: {.agentdev/intake/inbox/*.md または .agentdev/learning/inbox.md への相対パス}
  - 分類: {intake/learning}
  - 保存結果: {成功/失敗（理由）}
検証結果: ✅ OK
git 永続化: {該当なし/ ✅ OK（commit {hash}, push 済み, HEAD = origin/main 同期確認OK）}
次のコマンド: case-ready（Root Case は open。Definition 受入と実行準備完了は case-ready が実行する）
