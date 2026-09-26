#### RQ-01: REQ-003 が廃止済み REQ-016 を現行所有者として無注記で列挙
- **category**: REQ参照ID整合性（廃止REQの現行参照）／現行廃止境界
- **target**: docs/requirements/REQ-003.md:12, :67
- **evidence**: 「caller 統合契約は REQ-014/015/016 が所有する」。REQ-016 は 2026-09-20 RETIRE 済み。REQ-014.md:12 と REQ-015.md:18 は「廃止済み REQ-016」と注記するが、REQ-003（updated: 2026-08-19、RETIRE 前のまま）は無注記
- **severity**: medium / **confidence**: high
- **source_of_truth**: retired/REQ-016.md:39-43（移行先宣言）
- **recommended_route**: intake
- **ng_classification**: pre-existing

## 審議記録

- 確定日: 2026-09-27（backlog-auto stage 2 inspect-promote）
- 確定分類: promote（ユーザー承認 / 自律確定）
- review 知見: なし
- 後続: backlog-review による RU 化
