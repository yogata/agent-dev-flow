# command-authoring-standards SPEC の Step X-Y 許容基準整理と Step N-0 命名違反是正

## 観測内容
- `case-auto.md`, `case-close.md`, `req-save.md` の既存 `Step N-0` 命名が `check_command_format.test.ts` の `command-format-zero-substep` 検査で違反
- main でも同一の失敗が発生。Issue #1528 のスコープ外として処理された
- PR #1534 の SPEC 確定候補として `command-authoring-standards.md` の Step X-Y 許容基準整理が記録され、case-close で「見送り」選択

## 影響
- `command-format-zero-substep` 検査が恒常的に違反を出す
- SPEC 側（command-authoring-standards.md）で Step X-Y 許容基準が明確でないため、命名リネームか検査基準調整かの判断材料がない

## 課題
- `command-authoring-standards.md` SPEC で Step X-Y 許容基準を整理する
- Step N-0 命名の是正方針（命名リネーム or 検査基準調整）を決定し、3 command の違反を解消する

## 既存要件との関連
- CR-002: SPEC 修正は case-run 都度 spec-save

## 対応方針の方向性
- まず SPEC 整理を行い、Step X-Y が許容される条件を明文化
- SPEC 整理結果に基づき、3 command の Step N-0 を残すかリネームするかを判断
- 検査基準調整の場合は `check_command_format.test.ts` 側の変更。命名リネームの場合は配布本文 + SPEC + 関連スキルの参照更新スコープを整理
- 広範囲 refactor の可能性があるため、影響範囲調査を先行

## 出典
- 元 intake item:
  - intake-2026-07-18-0545-spec-confirmation-candidates-deferred.md（候補2: command-authoring-standards.md Step X-Y 許容基準整理）
  - intake-2026-07-16-0905-command-format-zero-substep.md
