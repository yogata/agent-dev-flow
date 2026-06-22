# IR-044 isDelegationContext の境界ケース精緻化

## 観測

現状の `isDelegationContext` は単純キーワードマッチ（OR条件）であり、SPEC 詳細の記述そのものに委譲キーワードが含まれるケース（例: 「委譲先 SPEC に fixture の一覧を列挙する」）も免除してしまう。`docs/specs/integrity-rule-catalog.md`「境界ケース」に記載された精緻化は将来課題。

## 影響

- 真の SPEC 詳細記述（委譲キーワードを含む）が warning から免除され、検出漏れとなる可能性。
- catalog に「境界ケース」と明記されているが、実装レベルでの対応優先度が未決定。

## レビューで決めること

- 境界ケース精緻化（文脈構造解析・キーワード組み合わせ判定等）を別 Issue で起票するか。
- 現状のキーワードマッチで許容できる false negative 率をどこに置くか。

## 根拠

- PR #976: https://github.com/yogata/agent-dev-flow/pull/976 (intake candidate に記載)
- 仕様: https://github.com/yogata/agent-dev-flow/blob/main/docs/specs/integrity-rule-catalog.md (IR-044 exemption 境界ケース)
