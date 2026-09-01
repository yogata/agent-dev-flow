# patterns Design の Knowledge 必須セクション機械判定形式の明記候補

## 観測

patterns Design「Knowledge frontmatter 規約」は必須セクション5項目（知識内容、適用条件、適用対象、根拠、関連知識）を規定するが、見出しの機械判定形式（見出しレベル範囲、見出しテキストの一致方式）を明記していない。docs-check 系 checker（check_knowledge_docs.ts、Epic #2497 Issue #2500 実装）は「`#`〜`######` の見出し行テキストと5項目名の trim 後完全一致」を正規形として採用した。

## 影響

checker の採用した機械判定形式が Design 契約上の規定と明示的に紐付かない。知識文書作成者が見出しレベルの自由度をどこまで持てるかの解釈が割れ得る。

## レビューで決めること

- docs/designs/foundations/patterns.md「Knowledge frontmatter 規約」への機械判定形式（見出しレベル範囲、一致方式）の明記要否

## 根拠

- PR #2503 本文「Design確定候補」1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2503 ）
