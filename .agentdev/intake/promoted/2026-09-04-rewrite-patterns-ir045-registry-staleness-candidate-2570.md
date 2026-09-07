# rewrite-patterns と IR-045 語彙レジストリの現行化判断

## 観測内容
`rewrite-patterns.md` の IR-045 許容表現が、`.opencode` 側の語彙レジストリ実体と一体の検出器語彙として残っている。

## 影響
本文だけを現行化すると検出器語彙、baseline、機械置換ルールの定義が乖離する。

## 課題
語彙レジストリ実体と対照表を同期して現行化するか、検出器語彙として恒久除外するかを判断し、変更時は関連する検出器と baseline の整合を確認する。

## 既存要件・正規成果物との関連
PR #2593、Issue #2570、`docs/designs/authoring/vocabulary-registry.md`、IR-045。
