#### DC-03: DEC-040 部分置換（決定4のみ置換・決定1〜3維持）と全体 status superseded の意味乖離が本文で無説明
- **category**: 意味整合（superseded＝履歴扱いの原則と部分維持の両立）
- **target**: docs/decisions/DEC-040.md:4-5、docs/decisions/README.md:56, :124
- **evidence**: DEC-044 は「決定4 観測基盤の部分置換。決定1〜3は本 Decision が維持する」（DEC-044.md:13-14,60,87）と宣言。docs/README.md の DEC-040 行は注記するが、DEC-040 本文には注記がなく、decisions/README の表・ビューも無注記。本文置換注記を持つのは DEC-002/007/029 のみで最新の 040/043 は持たない
- **severity**: low〜medium / **confidence**: medium
- **source_of_truth**: DEC-044 frontmatter（SSoT）
- **recommended_route**: intake
- **ng_classification**: pre-existing
- **notes**: 「superseded＝歴史」と解釈した読者が現行有効な決定1〜3（6系統への適用等）を誤って破棄するリスク

## 審議記録

- 確定日: 2026-09-27（backlog-auto stage 2 inspect-promote）
- 確定分類: promote（ユーザー承認 / 自律確定）
- review 知見: なし
- 後続: backlog-review による RU 化
