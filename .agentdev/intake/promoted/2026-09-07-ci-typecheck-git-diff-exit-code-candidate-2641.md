# CI typecheck job での git diff --exit-code 検証の導入検討

## 観測内容
PR #2650（Issue #2641、OU-008）の Capture で、typecheck 後の tsconfig メタデータ書き戻し等による作業ツリー汚染を `git diff --exit-code` で検出する案が記録された。

## 影響
意図しない変更がコミットへ混入するリスクを CI で検出できる。

## 課題
CI typecheck job へ検証を追加するか、incremental/project references の正規書き戻しと誤検出をどう区分するかを検討する。配布物側のコミット前検証との役割分担も明記する。

## 既存要件・正規成果物との関連
Issue #2641、PR #2650（cfbe7864）、agentdev-case-run-execution-adapter のコミット前検証手順。
