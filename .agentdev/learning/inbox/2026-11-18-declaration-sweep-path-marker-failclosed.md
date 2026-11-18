---
id: learn-20261118-declaration-sweep-path-marker-failclosed
created_at: 2026-11-18
source: case-run deviation capture (Root Case #4150)
status: inbox
---
# 宣言網羅検索のパス限定漏れとアセンブリのマーカー誤一致により機械工程で 3 回の fail-closed 検出を受けた

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
