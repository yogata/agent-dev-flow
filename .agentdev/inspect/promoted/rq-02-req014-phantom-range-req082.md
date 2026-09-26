#### RQ-02: REQ-014 の「REQ-082-006〜040」範囲引用がファントム（行空間は 001〜025）
- **category**: REQ参照ID整合性（ファントム範囲引用）
- **target**: docs/requirements/REQ-014.md:14, :50
- **evidence**: REQ-082 の行空間は REQ-082-001〜025 で終端。026〜040 は存在しない。範囲表記（〜）のため機械検査（行 ID 直接照合）は非検出
- **severity**: medium / **confidence**: high
- **source_of_truth**: docs/requirements/REQ-082.md:21-45（最終行 REQ-082-025）
- **recommended_route**: intake（docs-check route 候補: 範囲表記を展開する行 ID 存在検査）
- **ng_classification**: pre-existing
- **notes**: baseline ファントム（REQ-003-030 等）とは別件

## 審議記録

- 確定日: 2026-09-27（backlog-auto stage 2 inspect-promote）
- 確定分類: promote（ユーザー承認 / 自律確定）
- review 知見: なし
- 後続: backlog-review による RU 化
