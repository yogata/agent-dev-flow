# docs/knowledge/README.md「現在の知識文書」一覧の列挙欠落（recursive-copy-root-relative-skip.md）

- **分類**: inspect finding promote（F-10・severity low・confidence high）
- **由来**: inspect-docs finding 20261002T154006Z（backlog-auto stage 1・check_knowledge_docs.ts 機械的検出 REQ-056-010）

## 観測（evidence・機械的検出 + 意味確認済み・実測確認済み）

- `docs/knowledge/README.md` 記載「20件。」+ 列挙20件。実測: `docs/knowledge/` は21件（README 除く）
- `recursive-copy-root-relative-skip.md`（frontmatter title/created/updated 完備の正規知識文書）が列挙されていない

## 影響課題

knowledge 索引からの探索導線欠落。check_knowledge_docs の NG が持続する。

## 対応候補

README「現在の知識文書」一覧へ recursive-copy-root-relative-skip.md を追加（件数表記 20→21 更新含む）。

## 既存要件関連

REQ-056-010（knowledge README 列挙整合）

## 統合注記（backlog-review での統合判定候補）

なし（単独対応・docs-check NG 解消系）。
