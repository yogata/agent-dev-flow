#### RQ-07: REQ-034-007/008/009 の行レベル重複定義
- **category**: DUPLICATE（行レベル）
- **target**: docs/requirements/REQ-034.md:25-27（REQ-034-007/008/009）
- **evidence**: 007 と 009 が「case-open/case-ready/case-close を Workflow Skill の委譲契約で委譲・load 指定・実装本体複製禁止」を重複定義。008 と 009 は「内部 lifecycle 段階の public contract の正規文書は Command Design…両者不一致時は Command Design を正とする」を逐語重複
- **severity**: medium / **confidence**: high
- **source_of_truth**: REQ-002-039（同一規範の複数正本禁止）、REQ-002-041（重複解消）
- **recommended_route**: intake
- **ng_classification**: pre-existing

## 審議記録

- 確定日: 2026-09-27（backlog-auto stage 2 inspect-promote）
- 確定分類: promote（ユーザー承認 / 自律確定）
- review 知見: なし
- 後続: backlog-review による RU 化
