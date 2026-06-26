# 機械置換ルール（em-dash テーブルセル・中黒 algorithm）の document-type-responsibilities.md SPEC 反映

## 発生源

- Issue: #1106
- PR: #1117 (merged, squash 9d692b8)
- 発生日: 2026-06-24
- 元 item: em-dash 表セル置換ルール候補、中黒許容範囲 algorithm 候補

## 観測内容

PR #1117 で `mechanical-replacement-rules.md` section 1（中黒許容範囲 algorithm、許容条件 4 種）と section 2（em-dash 機械判定）に機械判定アルゴリズムを集約した。しかし対応する SPEC `docs/specs/document-type-responsibilities.md` 側には次が欠けている。

1. em-dash テーブルセルプレースホルダ `| — |` → `| - |` の機械置換ルール（SPEC「em-dash 置換形式」節にテーブルセル専用形式の記載がない）
2. 中黒使用の許容範囲節に、機械適用向けの algorithm 的記述がない（人間向け判定基準のみ）

いずれも既存 accepted SPEC への追記であり、新規 SPEC 昇格ではない。元 Issue は docs_chore で spec-save flow 対象外のため、case-close 判断で見送り intake 化した。

## 影響

- SPEC 側に機械置換ルールがなく、SPEC と skill reference の間で判定基準の二重管理状態が継続
- 読者が SPEC のみを参照するとテーブルセル em-dash 扱い・中黒 algorithm を把握できない

## 課題

- SPEC「em-dash 置換形式」節へテーブルセル `| — |` → `| - |` 機械置換ルールを追記するか
- SPEC「中黒使用の許容範囲」節へ algorithm（許容条件 4 種）の参照または記述を追記するか
- `mechanical-replacement-rules.md` との二重管理を避けるため、SPEC 側を参照先として最小化するか

## 既存要件との関連

- `docs/specs/document-type-responsibilities.md`「em-dash 置換形式」節、「中黒使用の許容範囲」節
- `src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md` section 1, 2

## 対応方針候補

- 別 Issue（docs_chore）として、SPEC 両節へ機械置換ルール・algorithm 参照を追記し、skill reference を SSoT として SPEC 側は参照先化する
