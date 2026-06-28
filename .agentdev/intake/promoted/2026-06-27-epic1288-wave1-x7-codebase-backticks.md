## 観測内容
PR #1296（Issue #1289「X-7 backticks SPEC残作業完了確認」）において、X-7 SPEC 本体の自己適合性是正を実施し、SPEC files 内の X-2/X-7 違反を 0 件にした。しかし codebase 全体（7 ディレクトリ）に存在する unbacked skill names 189 件候補は、AG-012（Issue #1118）により X-7 の finding 0 件適用対象外として本 Issue の完了条件から明示的に除外された。

## 影響
技術債として残存する 189 件の unbacked skill names が、コードベース全体の一貫性に影響。

## 課題
- 189 件の unbacked skill names の機械的 backticks 付与（codebase 全体横断是正）
- ADR prose 内の skill name 参照（189 件候補の内訳確認）
- inspect-docs で X-7 を finding 対象とするか、機械横断是正ツールを新設するかの判断

## 既存要件との関連
- AG-012（Issue #1118）: 「X-7 は SPEC 詳細基準の確定も併せて完了条件とし、finding 0 件は X-7 には適用しないことを明示」を規定
- X-7 SPEC: 2026-06-25 に accepted 確定済み
