# worktree 実行の check_integrity で reference-path-existence の baseline 未登録 NG が検出される

## 観測
Case #3528 の case-open STEP-4 で、worktree（definition/issue-3528）に対する check_integrity が「Referenced path does not exist: scripts/self/release/wave-composition-purity.test.ts（src/common/skills/agentdev-workflow-case-ready/references/execution-structure.md:47）」の新規 NG 1件（new unmanaged NG、exit code driver）で fail した。対象ファイルは worktree 内に実在し（git tracked、status clean）、変更前 baseline（origin/main HEAD 67c50261）の detach worktree 対照検査でも同一 NG 1件が検出された。main tree での対照実行は履歴系検査の git fatal で JSON 結果取得が不能だった。

## 今回扱わない理由
本 Case の変更（REQ-008.md・artifact-contracts.md 2ファイル4行）に起因しない既知債務（対照検査で差分 0 確認済み）であり、本 Case で検査基盤や baseline を改めることは対象範囲外。

## 影響
worktree 上で check_integrity を実行する工程（case-open STEP-4、case-ready、case-run 等）で、本参照に起因する同一 NG が反復検出され exit 1 となる。原因の対照確認を経ない場合は誤検出として無視されるか、不要な停止を誘発する。

## レビューで決めること
- NG baseline への登録要否、または reference-path-existence の worktree 実行時（junction なし環境）の参照解決修正要否
- scripts/self/ 等の producer 側非配布領域への参照を検査対象から扱う方針
- main tree 実行時に履歴系検査が fatal を出す事象の有無の確認（対照検査経路の安定化）

## 根拠（任意）
- 発生: Case #3528 実行時（2026-10-07）
- 対照検査: origin/main HEAD 67c50261 の detach worktree で同一 NG 1件（差分 0）
- 関連: repo-agentdev-integrity scripts/check_integrity.ts、agentdev-workflow-case-ready references/execution-structure.md:47、Case #3525 / PR #3527 由来の参照行
