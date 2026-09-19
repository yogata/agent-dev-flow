---
name: Case Revise Completion Report (Root Case)
about: case-revise 完了報告テンプレート
---

case-revise 完了

完了段階: case-auto 内部 lifecycle case-revise
対象: Root Case Issue #{N}（{日本語名称}）
結果:
 - Definition Amendment PR: {作成: #{pr_N} / 再利用（既存 PR: #{pr_N}）/ 不作成（実変更なし、case-ready へ引き継ぎ）}
 - 影響再評価: {影響あり（再評価対象）: #{N}, ... / 該当なし。影響なし確認済みの完了済み Issue は維持}
 - Case 関連 Issue 本文更新: {更新済み / 該当なし（テンプレート構造と必須セクション維持）}
 - execution contract / execution structure の再確定は case-ready へ引き継ぎ（case-revise 専用の Case 状態は追加しない）
 Capture結果: {該当なし省略可 / 以下capture 成果物がある場合のみ}
  - パス: {.agentdev/intake/inbox/*.md または .agentdev/learning/inbox.md への相対パス}
  - 分類: {intake/learning}
  - 保存結果: {成功/失敗（理由）}
検証結果: OK
次の段階: case-auto が内部 lifecycle で case-ready へ継続（Amendment PR 受入と execution contract / execution structure 再確定は case-ready 段階が実行する。blocked 時は Root Case の resume_command による再開）
