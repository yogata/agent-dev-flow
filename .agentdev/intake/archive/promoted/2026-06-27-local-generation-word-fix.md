# local-generation.md の ADR-0131 link mode 語彙 word 修正

## 観察

PR #1195（Issue #1193「ADR-0126 残存語彙を ADR-0131 link mode へ 4 ファイル横断是正 + transform/ 削除」）は、`integrity-rule-catalog.md`、`local-transform.md`、`consumer-project-setup.md`、`glossary.md` の 4 ファイルを ADR-0131 link mode 語彙へ是正した。ただし `local-generation.md` は「既に ADR-0131 link mode 語彙で是正済み」として是正対象外とした一方、SPEC 整合性の観点から「別 Issue で local-generation.md のみ word 修正を検討可能」と残置した。

同 PR の QG-3 報告でも、local-generation.md は「是正対象外（既に ADR-0131 link mode 語彙で是正済み）としているため、本 PR では対象外」と再確認している。

## 修正されなかった理由

local-generation.md は ADR-0126 時代の意図的な履歴ドキュメントとして一部残存し、本 PR（4 ファイルスコープ）の対象外。SPEC 整合性の観点からは word 修正余地があるが、履歴記述の保全との兼ね合いで別 Issue での検討として残置した。

## 課題

- `local-generation.md` のうち履歴参照として保持すべき箇所と、現行 SPEC として是正すべき箇所の境界
- 当該ファイルが意図的な履歴ドキュメントか、現行 SPEC かの位置付け確認（REQ-0112-053「superseded 履歴参照は許容」適用可否）
- 「word 修正」の具体的内容（用語置換か、構造見直しか）

## 根拠

PR #1195 本文（QG-3 報告）より引用:

> Issue #1193 は local-generation.md を是正対象外（既に ADR-0131 link mode 語彙で是正済み）としているため、本 PR では対象外。SPEC 整合性の観点から別 Issue で local-generation.md のみ word 修正を検討可能。

> ### 注意（是正対象外）
> - `docs/specs/local-generation.md`、`docs/specs/local-transform.md` の「変換プロンプト時代」記述は意図的な履歴ドキュメントであり、本 Issue の是正対象外。

## 観測元

- PR #1195
- Issue #1193
