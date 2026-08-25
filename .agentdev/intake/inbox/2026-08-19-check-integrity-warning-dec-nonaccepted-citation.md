# check_integrity WARNING の DEC non-accepted citation 3件残存（docs 側 pre-existing）

## 観測

PR 2280 の full suite 実行時に check_integrity が WARNING 14件を報告した。main と同一 delta の pre-existing であり、本 PR 由来の新規ではない。

- REQ-028 retired 参照 11件: 既存 intake item（retired-req-warn-prefix-match）の対象（階層 ID 前置一致の誤検出を含む）と重複するため本 item では参照のみ
- DEC-017・DEC-005 の non-accepted citation 3件: 既存 intake item で未カバーの残部

## 今回扱わない理由

docs/ 側は Issue 2237（OU-0016）の編集対象外（配布物プレースホルダ表記がスコープ）。WARNING は配布物検証に阻害を与えない（NG 0）。

## 影響

check_integrity の WARNING が docs 側で恒常的に出続ける。NG ではないため gate 阻害はないが、警告ノイズとして残る。

## レビューで決めること

- DEC-017・DEC-005 が proposed / superseded であることに由来する citation 警告を許容運用とするか、参照側表記を是正するか

## 根拠

- PR 2280 本文「Findings / Capture候補」3件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2280）
- 重複参照先: .agentdev/intake/inbox/2026-08-18-retired-req-warn-prefix-match.md（REQ-028 11件系）
