# DEC-041 に部分置換（DEC-051）の superseded_by / supersede_note 欠落

- **分類**: inspect finding promote（F-08・severity high・confidence high・Jev 分類 promote 意見一致。adversarial-review で全主張実証確認）
- **由来**: inspect-docs finding 20261006T151122Z（backlog-auto stage 1）。inspect-promote 2026-10-07 自律確定

## 観測（evidence・実測確認済み）

- DEC-051.md:9-11 relations「supersedes DEC-041（決定5: Wave 収束と依存充足の二条件 gate を依存充足ゲート単独条件へ置換）。決定1〜4は維持」
- これに対し被置換側 DEC-041.md は: frontmatter（:8-18）に superseded_by/supersede_note なし、updated は 2026-09-23 のまま、決定5（:32「次 Wave の開始は両方の成立を条件とする」）が置換注記なしで現行契約の形で残存
- 様式先例（adversarial-review で全文実証）: DEC-036.md:8-9（superseded_by: DEC-048 + 部分置換 supersede_note）、DEC-040.md:5-6、DEC-043.md:5-6 はいずれも保持。DEC-050.md:42 承認記録は「DEC-045 への部分置換関係記録」を受理確認事項化した先例
- 非対称の実証: DEC-051.md:40-42 承認記録に DEC-041 側への supersede_note 反映確認の記載なし
- 索引波及: `decisions/README.md:57`（decision-baseline-table DEC-041 行・注記なし）と `docs/README.md:143`（DEC-041 行・注記なし）。対照的に DEC-040/043 行は〔superseded by DEC-044…〕注記付き
- docs/README.md には部分置換注記様式の先例あり（:130 DEC-028、:138 DEC-036、:147 DEC-045）

## 影響課題

DEC-041 決定5 の Wave 収束二条件 gate が現行根拠として読まれ、DEC-051 の依存充足ゲート単独条件と矛盾した解釈（Wave 収束待ち復活）を生じるリスク。承認済み Decision の置換関係が被置換側から読み取れない。

## 対応候補

docs 修正（DEC-050 承認時と同一経路）:
1. DEC-041.md へ superseded_by: DEC-051 + supersede_note（決定5のみ置換、決定1〜4維持）を追記
2. Decision 索引（decisions/README.md・docs/README.md）の DEC-041 行へ注記反映（AUTOGEN 再生成または手動追記）
3. DEC-051.md 承認記録への「DEC-041 側反映確認」記録（DEC-050:42 先例準拠、任意）

status は decision-lifecycle「部分置換では status 維持」により accepted のまま（DEC-036/045 先例と同じ扱い）。

docs-check route 候補: 置換側 relations と被置換側注記の対称性検査（機械検査化）。

## 既存要件関連

DEC-051 relations（SSoT）、decision-lifecycle Design（部分置換様式）、index-auto-generation Design。

## 統合注記（backlog-review での統合判定候補）

F-09（Decision Map 行欠落）のうち DEC-051→DEC-041 行は本件の解消時に必然的に生じる従属作業。F-09 と併合した単一 RU 化を推奨。
