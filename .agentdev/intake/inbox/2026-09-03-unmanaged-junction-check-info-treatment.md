# install-script-usability Design の状態分類への管理物判定不能 junction の check 扱い追記

## 観測

REQ-058-008 pass_criteria の「check がこれらを ADF 管理下の乖離として報告しないこと（または管理対象外として扱うこと）」の後者に対し、実装（PR #2541）では `[INFO] Junction not managed by AgentDevFlow (left untouched)` として管理対象外を明示し、乖離に数えない（終了コードへ反映しない）実装解釈を取った。この扱いは install-script-usability Design の状態分類（1〜4）には明記されていない。

## 今回扱わない理由

本 Case（Issue #2540）は実装 Case であり、Design 本文への追記は設計確定作業として別途行うべき。

## 影響

check の出力解釈（[INFO] 行が乖離検出に数えないこと）が Design に記載されないままのため、出力を解析する利用者・後続ツールが [INFO] を失敗判定に含める誤実装のリスク。

## レビューで決めること

- install-script-usability Design の状態分類（1〜4）への「管理物判定不能物の [INFO] 報告（乖離に数えない）」の追記
- check の終了コード規約への [INFO] 非反映の明記

## 根拠

- PR #2541 本文「Design確定候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2541 ）
