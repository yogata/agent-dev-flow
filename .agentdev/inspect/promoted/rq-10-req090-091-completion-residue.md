#### RQ-10: 一回限りの Case 完了条件・作業記録が恒続要件行として残存
- **category**: RETIRE 相当（作業完了条件の残存）
- **target**: docs/requirements/REQ-090.md:24-25（REQ-090-007/008）、docs/requirements/REQ-091.md（REQ-091-006）、docs/requirements/REQ-090.md:42（適用範囲）
- **evidence**: REQ-090-007「特定 Design ファイル 6箇所の修正完了状態」、REQ-090-008「Jev 実装開始直前の最新 main に v4.0.2 tag が存在すること」、REQ-091-006「当該 Case の完了報告への検証結果包含」、適用範囲「REQ-089 欠番に伴う採番整合（欠番記録3ファイル、採番スクリプトの最小修正、新規 REQ は REQ-090）」。恒常状態として検証不能な作業履歴
- **severity**: medium / **confidence**: high
- **source_of_truth**: REQ-001-002（作業手順は対象外）、REQ-001-065（事実記録は Report）
- **recommended_route**: intake
- **ng_classification**: pre-existing

## 審議記録

- 確定日: 2026-09-27（backlog-auto stage 2 inspect-promote）
- 確定分類: promote（ユーザー承認 / 自律確定）
- review 知見: ユーザー承認 (HITL Q2)。対象全文: REQ-090-007/008（:22-23）+ REQ-091-006（:29）+ REQ-090 適用範囲:42。REQ-090-007 前半の case-ready 所有者宣言は恒常契約として記録分離で保全する前提
- 後続: backlog-review による RU 化
