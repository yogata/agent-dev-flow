#### RQ-12: 構造 DRIFT（形式の不統一、集約）
- **category**: DRIFT（構造形式）
- **target**: docs/requirements/REQ-082.md:8 / REQ-087.md:8 / REQ-091.md:8（frontmatter 直下の H1 重複）、docs/requirements/REQ-092.md:9,20,30（テンプレートコメント `<!-- 【必須】 -->` 残存）
- **evidence**: 他 52 ファイルは `## 目的` 開始で H1 なし。REQ-092 はテンプレートの必須マーカーを消去せず保存
- **severity**: low / **confidence**: high
- **source_of_truth**: REQ-001-046（標準構成）
- **recommended_route**: intake
- **ng_classification**: pre-existing（H1）／今回修正対象（REQ-092 テンプレートコメントは 2026-09-26 追加ファイル由来）
- **notes**: REQ-008-059 の表行でなくセクション化（REQ-008.md:80-88）は既知 defer（20260901 F-12＝20260925 F-05）のため除外するが、本診断で「baseline ファントム REQ-008-059 の実因はセクション形式化」という説明が確定した点を記録する

## 審議記録

- 確定日: 2026-09-27（backlog-auto stage 2 inspect-promote）
- 確定分類: promote（ユーザー承認 / 自律確定）
- review 知見: REQ-008-059 セクション化は baseline 実因と判明したが既知 defer のため本 promote 対象から除外済み（対象: H1 重複 REQ-082/087/091:8、REQ-092:9,20,30 テンプレートコメント残存）
- 後続: backlog-review による RU 化
