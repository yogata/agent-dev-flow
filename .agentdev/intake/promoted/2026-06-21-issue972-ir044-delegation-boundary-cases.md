# IR-044 委譲キーワードマッチの境界ケース精緻化

## 観測

IR-044（REQ/SPEC 境界違反検出）の委譲キーワードマッチが単純 OR 条件のため、境界ケースで SPEC 詳細記述に含まれる委譲キーワードも免除してしまう。例えば「委譲先 SPEC に fixture の一覧を列挙する」といった真の SPEC 詳細記述が warning から免除される検出漏れリスクがある。

## 影響

- 検出漏れ（false negative）のリスク
- catalog に「境界ケース」と明記されているが実装優先度未決定

## 課題

- 境界ケース精緻化（文脈構造解析・キーワード組み合わせ判定等）を別 Issue で起票するか
- 現状の false negative 率が許容範囲内かの判断

## 既存要件との関連

- IR-044（`docs/specs/integrity-rule-catalog.md`）

## 根拠

- 元 inbox item: `2026-06-21-issue972-ir044-delegation-boundary-cases.md`
- Issue #972
