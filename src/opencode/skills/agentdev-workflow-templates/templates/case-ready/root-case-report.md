---
name: Case Ready Completion Report (Root Case)
about: case-ready 完了報告テンプレート
---

case-ready 完了

完了コマンド:/agentdev/case-ready
対象: Root Case Issue #{N}（{日本語名称}）
結果:
 - Definition PR: {merge 済み: #{pr_N}（追加承認なしで自動確定） / 不存在（実変更なし）}
 - canonical Definition を再取得し以降の処理基準に反映
 - Decision 受理評価: {accepted 遷移: DEC-{N}, ... / 評価対象なし}
 - execution contract を Root Case 本文へ確定
 - 実行構造: {Standard（単一 execution unit）/ Epic（Epic Issue #{N}、Child Issue、Wave / 依存構造）}
 - 検証対応要否の最終ゲート: OK（未分類 0 件）
 - Root Case を ready へ遷移
 - draft / RU 削除: {削除済み / 保持（{理由}）}
 Capture結果: {該当なし省略可 / 以下capture 成果物がある場合のみ}
  - パス: {.agentdev/intake/inbox/*.md または .agentdev/learning/inbox.md への相対パス}
  - 分類: {intake/learning}
  - 保存結果: {成功/失敗（理由）}
検証結果: OK
git 永続化: {該当なし/ ✅ OK（commit {hash}, push 済み, HEAD = origin/main 同期確認OK）}
次のコマンド: case-run（Root Case は ready。実装実行は case-run が実行する）
