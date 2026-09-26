#### GD-01: req-case-flow.md が内部 lifecycle 段階を「コマンド」と現在形で定義
- **category**: 履歴混在（旧 UX 記述の残存）
- **target**: docs/guides/req-case-flow.md:32（case-open「…を作成するコマンド」）、:42、:52、:62、:91
- **evidence**: 同ファイル 3 行目・127 行目と quickstart.md:30-32、glossary.md:10-14 は「内部 lifecycle 段階であり公開コマンドではない（DEC-033）」と明記する一方、各段階の節冒頭定義文は「〜コマンド」と旧 UX の語彙のまま
- **severity**: low〜medium / **confidence**: high
- **source_of_truth**: DEC-033（内部状態遷移の手動順次実行を公開 UX の標準としない）
- **recommended_route**: intake
- **ng_classification**: pre-existing
- **notes**: 節見出しとしての便宜的呼称という解釈も可能だが、案内層の定義文としては誤導

## 審議記録

- 確定日: 2026-09-27（backlog-auto stage 2 inspect-promote）
- 確定分類: promote（ユーザー承認 / 自律確定）
- review 知見: なし
- 後続: backlog-review による RU 化
