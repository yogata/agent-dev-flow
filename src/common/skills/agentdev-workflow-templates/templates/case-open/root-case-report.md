---
name: Case Open Completion Report (Root Case)
about: case-open Root Case flow 完了報告テンプレート
---

✅ case-open 完了

完了段階: case-auto 内部 lifecycle case-open
対象: Root Case Issue #{N}（{日本語名称}）
結果:
 - Root Case Issue #{N} を作成（状態 open）
 - REQ-{NNNN} を Root Case 本文の対象 REQ セクションへ記録
 - Definition Package を生成し Root Case へ関連付け
 - Definition PR: {作成済み: #{pr_N}（実変更あり） / 不作成（実変更なし）}
 Capture結果: {該当なし省略可 / 以下capture 成果物がある場合のみ}
  - パス: {.agentdev/intake/inbox/*.md または .agentdev/learning/inbox.md への相対パス}
  - 分類: {intake/learning}
  - 保存結果: {成功/失敗（理由）}
検証結果: ✅ OK
git 永続化: {該当なし/ ✅ OK（commit {hash}, push 済み, HEAD = origin/main 同期確認OK）}
次の段階: case-auto が内部 lifecycle で case-ready へ継続（Root Case は open。Definition 受入と実行準備完了は case-ready 段階が実行する。blocked 時は Root Case の resume_command による再開）
