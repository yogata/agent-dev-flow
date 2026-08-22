# Issue 監査値（backlog-review 時点）と case-run 実測値の乖離と計測基準の記録運用

## 観測

Issue #2388 の対象範囲に記載された監査値（skill SPEC 36ファイル中31ファイル、docs X-4「2ファイル・1ファイル」74行）と case-run 実行時点の main 実測値（35ファイル中6ファイル・8行、31ファイル・76行）の乖離が大きかった。監査値は backlog-review 時点（PR #2275 引き渡し時点の main）の静止画であり、Wave 2/3 マージ（PR #2392〜2397）で大部分が是正済みとなった後の Issue だった。乖離の由緒は PR #2398 本文「監査値（Issue 記載）と現 main 実測値の差異」表に記録済み。

## 今回扱わない理由

計測基準の記録運用は backlog-review〜case-open〜case-run を横断する手続き変更であり、本 case の是正対象（判定規則確定済み様式違反の機械是正）の範囲外。

## 影響

監査時点の静止画を Issue 本文へ転記する現行運用では、先行 Wave や並行マージで盤面が動いた場合に case-run 側で差異説明のコストが発生する。計測基準 commit が Issue に記録されない限り、監査値の鮮度を第三者が検証できない。

## レビューで決めること

- case-open 時点での再計測を必須化するか、Issue 側に計測基準 commit を記録する運用とするか、現状（実測ベース是正＋由緒記録）を継続するか

## 根拠

- PR #2398 本文「Findings / Capture候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2398 ）
