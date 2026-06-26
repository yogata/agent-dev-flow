# em-dash + 全角括弧重複パターンの mechanical-replacement-rules.md section 2 反映候補

## 発生源

- Issue: #1176 (Epic #1169 Wave 2 child 2-2)
- PR: #1183 (merged, squash b99c0370)
- Epic: #1169 (CLOSED, E6a route)
- 発生日: 2026-06-25

## 内容

PR #1183 で `src/opencode/skills` 配下 108 件の em-dash 查読是正を実施した際、`mechanical-replacement-rules.md` section 2 の機械判定アルゴリズム（半角空白挟み ` — ` パターン検出）で検出した 95 件のうち、既存の全角括弧「　」に em-dash の挾みが既に存在するケース（learning-capture SKILL.md L56-57、QG-2/3/4 遅延記述等）を処理するため、適用時に判定基準を要した。

採用した judgment rule（PR #1183 Findings「括弧入力子重複」より verbatim 要約）:

> 既存の全角括弧「　」に em-dash の挾みが既に存在するケースでは、括弧の入力子を強調するため範囲外の括弧を唱起点（「、」）へ置換し、「　」で修正を使用

PR では skill reference の section 2 に明文化されていないパターン D（セル内 em-dash、テーブルセル N/A 以外）に隣接する判断基準として適用した。section 2 は「半角空白挟み ` — ` の検出」までで、検出後の文脈判定（括弧内/外、強調/弱点置換/ママ）の判断表が未整備。

## 推奨対応先

別 Issue として切り出すことを推奨。作業候補:

- `src/opencode/skills/agentdev-doc-writing/references/mechanical-replacement-rules.md` section 2 に「検出後の文脈判定表（A: 本格強調 / B: 弱点置換 / C: ママ / D: セル内 / E: 括弧内既存）」を追記
- 判断表の各パターンに機械判定可能な信号（前後文字種、括弧深度、テーブルセル境界）を対応付けるか、查読ループ前提の柔軟判断とするかを SPEC 側で決定
- PR #1183 の Findings 3項目（スケール対応、並列実行パターン、括弧入力子重複）のうち、本項目のみ SPEC 昇格候補。残り 2項目は運用観察のため見送り

## 現在の追跡状態

- PR #1183 SPEC確定候補: 「特になし。mechanical-replacement-rules.md section 2 の検証基準で問題なし」と明記（section 2 は検証基準を満たしている。本候補は section 2 への追記提案であり、section 2 自体の不備ではない）
- 別 Issue 化: 未実施（本 intake が作業候補の起点）

## 備考

PR #1183 で適用した 5 パターンの内訳（PR 本文「代表查読是正パターン」より）:

- Pattern A: label — explanation の本格強調（最多）
- Pattern B: 際句点の em-dash
- Pattern C: 議に本格強調中の em-dash は句点へ（括弧内既存ケース）
- Pattern D: テーブルセル内 em-dash（N/A プレースホルダ以外）
- ママ 13件: code block/YAML/TS リテラル内、機械置換対象外

PR #1184 (Issue #1175, src/opencode/commands) は Findings「特になし」のため本候補の対象外。
