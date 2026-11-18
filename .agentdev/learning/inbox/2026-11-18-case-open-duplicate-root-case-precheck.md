---
id: learn-20261118-case-open-duplicate-root-case-precheck
created_at: 2026-11-18
source: case-run deviation capture (Root Case #4150)
status: inbox
---
# case-open 再実行で起票前の冪等検索を実施せず重複 Root Case を起票した

- 問題事象: case-open 再実行において STEP-2 起票前に既存 Root Case の検索（二段検証）を実施せず、先行実行が確立した #4150 と重複する Root Case #4151 を起票した
- 発生局面: case-open STEP-2（Root Case 確立、Case #4150 再開実行）
- 検知方法: STEP-5 冪等検索（主題語「整合性検証」による issue_list）で #4150 を発見
- 根本原因: 起票前の冪等検索を前置規律として実行しなかった（冪等確認が STEP-5 の後段工程にある前提で起票に進んだ）
- 自律対応内容: #4150 を正規 Root Case として再利用し、#4151 へ重複記録コメントを付与した。Case Issue のクローズは case-close 受入記録が必要なため open のまま親オーケストレータへ処置を報告
- ユーザー確認有無: なし
- Decision/REQ/spec 影響: REQ-030-010（冪等再実行）
- 横展開観点: 起票系 STEP（issue workflow、tracking Issue 起票）でも起票前検索を前置すべき
- 再発条件: 中断からの再開時に STEP-2 からやり直した場合
- 予防策候補: references/root-case-and-definition-package.md の起票手順へ起票前の二段検証を前置規律として明記
- 想定反映先: agentdev-workflow-case-open の起票手順 reference
- 関連: Case #4150、#4151
- タグ: 冪等性、重複起票、再開系
