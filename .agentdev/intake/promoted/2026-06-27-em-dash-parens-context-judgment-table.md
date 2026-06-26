# em-dash + 全角括弧重複パターンの mechanical-replacement-rules.md section 2 文脈判定表反映候補

## 発生源

- Issue: #1176 (Epic #1169 Wave 2 child 2-2)
- PR: #1183 (merged, squash b99c0370)
- Epic: #1169 (CLOSED, E6a route)
- 発生日: 2026-06-25

## 観測内容

PR #1183 で `src/opencode/skills` 配下 108 件の em-dash 查読是正を実施した際、`mechanical-replacement-rules.md` section 2 の機械判定アルゴリズム（半角空白挟み ` — ` パターン検出）で検出した 95 件のうち、既存の全角括弧「　」に em-dash の挾みが既に存在するケースを処理するため、適用時に判定基準を要した。

採用した judgment rule: 既存の全角括弧に em-dash の挾みが既に存在するケースでは、括弧の入力子を強調するため範囲外の括弧を唱起点（「、」）へ置換し、「　」で修正を使用。

section 2 は「半角空白挟み ` — ` の検出」までで、検出後の文脈判定（括弧内/外、強調/弱点置換/ママ）の判断表が未整備。

PR #1183 で適用した 5 パターン: A（label — explanation の本格強調、最多）、B（際句点の em-dash）、C（括弧内既存ケース）、D（テーブルセル内、N/A プレースホルダ以外）、ママ 13件（code block/YAML/TS リテラル内）。

## 影響

- section 2 に文脈判定表がないため、検出後の処理が查読依存で再現性が低い

## 課題

- section 2 に「検出後の文脈判定表（A: 本格強調 / B: 弱点置換 / C: ママ / D: セル内 / E: 括弧内既存）」を追記する
- 判断表の各パターンに機械判定可能な信号（前後文字種、括弧深度、テーブルセル境界）を対応付けるか、查読ループ前提の柔軟判断とするか

## 既存要件との関連

- `src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md` section 2
- 関連: document-type-responsibilities.md「em-dash 置換形式」節へのテーブルセル規則追記（別 bundle B1）

## 対応方針候補

- 別 Issue として section 2 へ文脈判定表を追記する。PR #1183 Findings 3項目のうち本項目のみ SPEC 昇格候補、残り 2項目は運用観察のため見送り
