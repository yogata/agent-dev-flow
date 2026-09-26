#### DC-01: DEC-007↔DEC-017 置換チェーンが frontmatter で双方向宣言されていない
- **category**: 横断契約矛盾（supersede チェーンの宣言不整合）
- **target**: docs/decisions/DEC-007.md:1-8（superseded_by frontmatter なし）、docs/decisions/DEC-017.md:1-9,52（frontmatter relations なし、supersedes 宣言は本文のみ）
- **evidence**: 他の 8 件の superseded Decision（002/005/015/029/030/040/043）はすべて frontmatter `superseded_by` を持つが、DEC-007 は本文冒頭の「置換注記」（:10-15）のみ。後継の DEC-017 も frontmatter relations を持たず、supersedes→DEC-007 は本文（:52）のみ
- **severity**: medium / **confidence**: high
- **source_of_truth**: docs/designs/foundations/decision-lifecycle.md:46, :76-77（「superseded_by frontmatter で後継を指す」「frontmatter が SSoT」「双方向からの参照整合」）
- **recommended_route**: intake（docs-check route 候補: frontmatter supersedes/superseded_by 双方向整合検査）
- **ng_classification**: pre-existing
- **notes**: 情報自体は双方の本文に欠落なし。frontmatter 集約検査を素通りする前例となる点が実害

## 審議記録

- 確定日: 2026-09-27（backlog-auto stage 2 inspect-promote）
- 確定分類: promote（ユーザー承認 / 自律確定）
- review 知見: なし
- 後続: backlog-review による RU 化
