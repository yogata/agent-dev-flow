# decisions/README.md Decision Map の後継関係行欠落

- **分類**: inspect finding promote（F-09・severity low・confidence medium・Jev 分類 promote 意見一致。adversarial-review で補正付き支持）
- **由来**: inspect-docs finding 20261006T151122Z（backlog-auto stage 1）。inspect-promote 2026-10-07 自律確定

## 観測（evidence・実測確認済み）

- `docs/decisions/README.md:203-239` Decision Map に DEC-044 supersedes DEC-040/DEC-043 と DEC-051 supersedes DEC-041 の行が存在しない（:236 DEC-033→DEC-029、:237-238 DEC-036→DEC-015/DEC-002 等の現行 DEC 間 supersedes 行は実在）
- 対称性の指摘は成立: 完全置換の DEC-044→DEC-043 欠落は DEC-033→DEC-029 掲載と非対称

## 影響課題

adversarial-review で確認された補正事項（元 finding の主張を修正して採録）:

- **「DEC-044 supersedes DEC-040/DEC-043（完全置換）」は不正確**: DEC-044.md relations（:9-14）によれば DEC-043 に対しては完全置換、DEC-040 に対しては部分置換（決定4のみ。決定1〜3は維持、決定2は DEC-046 が置換）
- **Map 見出し定義の問題**: Map 見出し（:203）は「現行 Decision と過去版 ADR の履歴上の関連」であり、現行 DEC 間 supersedes の掲載は本来の見出し定義の外側。実在する現行 DEC 間行は v3→v4 移行期の作成由来とみられる
- **実害は低い**: DEC-040/043 の superseded 関係と DEC-044 の後継関係は同一 README のトピック別ビュー（:190,:193,:194）と baseline-table 注記で既に可視化済み

## 対応候補

docs 修正候補（二択）:
(a) Decision Map へ後継行を追記（DEC-044→DEC-043〔完全置換〕、DEC-044→DEC-040〔部分置換: 決定4〕、DEC-051→DEC-041〔部分置換: 決定5。F-08 の解消に伴う従属作業〕）
(b) Map 掲載基準の明示（見出し定義に従い現行 DEC 間行を縮小するか、現行 DEC 間を含むことを明記して拡張するかの方針決定）

## 既存要件関連

各 DEC frontmatter relations（DEC-051.md:9-11、DEC-044.md:9-14、DEC-043.md:5、DEC-040.md:5-6）。

## 統合注記（backlog-review での統合判定候補）

F-08 と併合した単一 RU 化を推奨（DEC-051→DEC-041 行は F-08 解消の従属作業。索引注記反映と同時実施が自然）。
