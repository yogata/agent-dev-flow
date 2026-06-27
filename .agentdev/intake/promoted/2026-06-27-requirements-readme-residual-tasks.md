# docs/requirements/README.md の関心対象列 後続課題（要件 2/3/4）

## 観測内容

PR #1085（Issue #1075 OU-005「README 関心対象列の核心契約要約化」）は、`docs/requirements/README.md` の関心対象列を「`・` 区切り多数羅列」から「統合した核心句」へ圧縮する対応（要件 1 および安定契約例外）のみ完了した。要件 2/3/4 は「対象外・後続課題」と明示して本 PR スコープから除外した。

未完了の要件:
- **要件 2**: 各要件行に操作主体（command 名・skill 名・ユーザー・システム）が明示されていること
- **要件 3**: SPEC 相当内容が適切な SPEC に移送済みであること
- **要件 4**: 硬直的固定記述（件数・ファイル名列挙）が排除済みであること（ただし README の件数記載は SPEC/README 側管理として許容）

## 影響

- README 配下の要件行に操作主体が明示されておらず、実行責務が不明確。
- README 配下に SPEC 相当内容が残存し、REQ と SPEC の責務分界が曖昧。
- 件数・ファイル名列挙が硬直的固定記述として残存し、陳腐化リスク。

## 課題

- 要件 2: 39 REQ ファイル全ての要件行に操作主体を付与する作業量と、機械判定可能性の評価。
- 要件 3: README 配下に残存する SPEC 相当内容の特定と移送先 SPEC の選定。
- 要件 4: 件数・ファイル名列挙の機械検出と、README 許容例外の境界明示。
- 本課題は docs/requirements/README.md に限定。docs/requirements/ 配下 39 REQ ファイル全体への横展開は別 promoted artifact（`2026-06-27-req-files-actor-and-count-cleanup.md`）で扱う。両者は「要件行操作主体明示・件数排除・SPEC 相当移送」で課題が共通。

## 既存要件との関連

- 親 Issue: #1075（Wave 1）。
- REQ 参照: REQ-0140-026（文書品質準拠）。
- 関連 promoted artifact: `2026-06-27-req-files-actor-and-count-cleanup.md`（39 REQ ファイル群、課題共通）。

## 観測元

- PR #1085
- 親 Issue: #1075（Wave 1）
