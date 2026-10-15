# case-close Design のリリース手順受け皿を後続検討する

- 出所: inspect-docs 20261015T093252Z DS25（backlog-auto stage 1、系統識別 [inspect-docs]）
- 種別: Design correction candidate（Decision と Design の対応確認）
- 対象: `docs/designs/commands/case-close.md`、`docs/decisions/DEC-059.md`
- 処置: case-close Design が DEC-059 の「case-close のリリース手順」への言及をどう支えるか、後続検討で確認する。現時点では正規成果物を変更しない

## DS25: case-close のリリース手順への参照受け皿

- target: `docs/decisions/DEC-059.md:49` と `docs/designs/commands/case-close.md`
- evidence: accepted DEC-059 は「backlog-auto workflow（stage 7 リリース）と case-close のリリース手順は本規則に従う」とする一方、case-close Design に「リリース」の記述およびリリース手順節がない（finding の grep 実測）
- severity: low / confidence: medium
- source_of_truth: DEC-059（accepted・上位）。ただし「case-close のリリース手順」が後続工程の総称であれば、Design 側の欠落という所見は成立しない可能性がある
- 後続検討: case-close Design にリリース手順の受け皿を置く必要性、または DEC-059 の文言が後続工程の総称・誤記かを確認する。REQ-114 を含む要件・設計の変更はこの候補の範囲に含めない

## 処理記録

- 2026-10-15 backlog-auto stage 2 inspect 系統で採用。通常の promoted artifact として保存し、backlog-review で後続処理する候補とする
- 人間判断: 利用者が後続の case-close Design 検討候補として採用を明示。現段階での修正、Case、Issue の作成は含まない
