# llm-expression-patterns.md 第3節の冗長性・データ欠損・head word 補充

## 発生源

- Issue: #1166
- PR: #1168 (merged, squash 7f3bc191)
- 発生日: 2026-06-25
- 元 item: L57 書き換え列冗長性、第3節体系的データ欠損調査、復元不能 head word 補充

## 観測内容

`src/opencode/skills/agentdev-doc-writing/references/llm-expression-patterns.md` 第3節「空虚な形容・副詞」テーブル（lines 52-67 周辺）に 3 つの残課題がある。

1. **L57 書き換え列の冗長性**: 検出パターン `` `主要な〜` `` の書き換え先に同語 `` `主要な〜` `` を含み、書き換え辞書としての実用性を損なう。PR #1168 は解説括弧欠損の補完のみで書き換え列は既存仕様として維持。
2. **第3節の体系的データ欠損**: lines 54-60 で検出パターン列 head word と解説列「」括弧内引用語が同時に欠損。PR #1168 は欠損セル補充または N/A 明示まで完了したが、根本原因（regex/script 事故疑い）は未調査。
3. **復元不能 head word（lines 54/55/59/60）**: PR #1168 では明示的 `N/A` + 理由明示とした。本来の表現が判明すれば backtick 付き表現へ補充でき、検出辞書の網羅性が向上する。

## 影響

- 同語変換を含む書き換え辞書の実用性低下
- 体系的欠損の根本原因が未特定で、他 skill reference での同種事故発生リスクが不明
- 復元不能 head word により検出辞書の網羅性に穴が残る

## 課題

- L57 の書き換え列から同語 `` `主要な〜` `` を削除し `` `中心となる〜` または必要性説明 `` に整理するか。他節（第1/2/4節）で同種の同語変換がないか精査するか
- 当該ファイルの git blame で lines 54-60 周辺の削除経緯を特定するか。同ディレクトリ他 reference ファイルで同種の体系的欠損がないか検査するか
- 過去の doc-writing 関連 Issue/PR（#1106, #1117, #1122 等）から本来の表現を特定し、復元できる細胞のみ backtick 付き表現へ置換するか

## 既存要件との関連

- `src/opencode/skills/agentdev-doc-writing/references/llm-expression-patterns.md` 第3節
- `mechanical-replacement-rules.md` との整合性確認

## 対応方針候補

- 別 Issue として、L57 冗長性是正 + git blame 調査 + head word 補充を一括して扱う。改善結果を機械判定辞書との整合性にも影響しないか確認する
