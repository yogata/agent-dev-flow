# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## 採番スクリプトが retired/ を走査せず既存廃止 REQ と重複する番号を割当て得る

- 問題事象: alloc-req-number.ts が REQ 番号採番時に docs/requirements/ 直下のみを走査し、retired/ 配下の廃止 REQ ファイルを考慮せずに REQ-121 を割当てた。retired/REQ-121.md が実在するため、スクリプト結果に従うと廃止識別子の再利用（numbering-policy の禁止行為）になっていた
- 発生局面: case-open STEP-3 の採番衝突検査（Definition Package 組立時の REQ 採番、Case #4150）
- 検知方法: docs/requirements/README.md の廃止済み REQ 表の確認中に REQ-121（retired）の実在を発見
- 根本原因: スクリプトの listMarkdownFiles が非再帰走査であり、numbering-policy「新規採番: 現行ファイル群（retired/ を含む）の最大番号に 1 を加えた値」の規則を未実装
- 自律対応内容: numbering-policy の規則文を正として REQ-122 を採番し、PR #4152 検証欄へ経緯を記録した（スクリプト自体は本 Case では修正していない）
- ユーザー確認有無: なし（policy 規則文の機械的適用）
- Decision/REQ/spec 影響: REQ-010-070（採番スクリプトと欠番レジストリの単一情報源）、docs/designs/foundations/numbering-policy.md
- 横展開観点: alloc-decision-number.ts と alloc-composite-id.ts の同型走査も retired/ を考慮していない疑いがある
- 再発条件: retired/ 配下に現行最大番号帯の廃止 REQ が存在する状態で新規採番する場合
- 予防策候補: 採番スクリプトの retired/ 走査追加、または numbering-policy 既知の欠番レジストリへの廃止識別子反映の恒久化
- 想定反映先: agentdev-req-file-manager の採番スクリプト修正 Case
- 関連: Case #4150、PR #4152 検証欄
- タグ: 採番、検証スクリプト、回避系

## case-open 再実行で起票前の冪等検索を実施せず重複 Root Case を起票した

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

## 宣言網羅検索のパス限定漏れとアセンブリのマーカー誤一致により機械工程で 3 回の fail-closed 検出を受けた

- 問題事象: 廃止要件行の宣言掃除で、最初の網羅検索のパス指定から scripts/ トップレベルが欠落し 2 件の宣言（textlint_guard_project_config.test.ts・textlint-guard-distribution.test.ts）を掃除漏れした。加えて自作アセンブリのセクション置換が covers コメント行内の見出し文字列に誤一致し worktree を一時破壊し、prepare_definition_pr の DefinitionEdit が行追加・1行置換・1行削除のみ表現可能（複数行減少は入力検証で拒否）であることも実行中に判明した
- 発生局面: case-open STEP-4 の機械工程（宣言追随・編集組立・script 呼出、Case #4150）
- 検知方法: prepare_definition_pr の traceability gate と --validate-input の fail-closed 検出
- 根本原因: 網羅検索のパス構成の見落とし、置換マーカーの一意化不足（見出し一致を改行前置で行っていない）、DefinitionEdit 行構造契約の事前把握不足
- 自律対応内容: worktree を HEAD へ復旧し、改行前置マーカーへ修正、git grep による全域再検索で掃除漏れを修正、複数行減少編集を単行編集へ分解して再実行した
- ユーザー確認有無: なし
- Decision/REQ/spec 影響: REQ-030-030（行構造事前確認）、docs/designs/integrity/checker-execution-contracts.md（宣言配置と走査対象方針）
- 横展開観点: 宣言掃除の網羅検索は git grep（全 tracked 領域）で実施する運用へ統一すべき
- 再発条件: 掃除対象行の宣言が docs/src/opencode 以外のパス（scripts/ 等のトップレベル領域）に存在する Definition 変更、および covers 行内に見出し文字列を含む Design へのセクション置換
- 予防策候補: 宣言追随手順の網羅検索コマンドを git grep 全域実行へ統一、セクション置換マーカーの改行前置規律、DefinitionEdit の行構造制約の reference 明記
- 想定反映先: agentdev-workflow-case-open の definition-pr-and-idempotency.md 宣言追随手順
- 関連: PR #4152 検証欄
- タグ: 宣言追随、fail-closed 検出、機械工程

