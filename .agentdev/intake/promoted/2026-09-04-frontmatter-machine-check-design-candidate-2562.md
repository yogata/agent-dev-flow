# Knowledge frontmatter 機械検査形式の Design 追記

## 観測内容
OU-009 の `check_knowledge_docs.ts` 実装で、frontmatter の境界、title/created/updated の必須性、日付妥当性、`updated >= created`、違反種別2種の解釈が確定した。

## 影響
実装で確定した検査契約が patterns Design に記載されず、利用者と checker の期待がずれる。

## 課題
patterns Design の Knowledge frontmatter 規約へ5項目の機械判定形式を追記し、checker 実装との整合を維持する。

## 既存要件・正規成果物との関連
Issue #2562、PR #2581（fff6c98b）、`docs/designs/foundations/patterns.md`。
