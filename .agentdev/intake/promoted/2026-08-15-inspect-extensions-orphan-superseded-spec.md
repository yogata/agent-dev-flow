# inspect-extensions 孤児 superseded SPEC の保持ポリシー選定

## 観測内容

DEC-006 により superseded 済みの docs/specs/commands/inspect-extensions.md が、16 Command のいずれにも対応するコマンドが存在しない孤児 SPEC として残存している。superseded 文書の保持ポリシーが明示されていない。SPEC 一覧上は登録済みのため docs-check の検出漏れはない。

## 影響

- remediation 移行での SPEC 同期対象選定時にノイズになる可能性がある
- superseded SPEC の扱い（残置/アーカイブ）が規定外のまま

## 課題

(a) superseded SPEC の歴史参照残置を明文化する、または (b) アーカイブ運用を導入する、のいずれかを選定する。選定は backlog-review で判断する（item 明記）。

## 既存要件・成果物との関連

- 対象: docs/specs/commands/inspect-extensions.md
- 関連: DEC-006、superseded 文書の保持ポリシー

## 出典

- 発生日: 2026-08-14
- 取得元: inspect 系診断・観測
- 元 item: intake-2026-08-14-inspect-extensions-orphan-superseded-spec.md
- 注記: intake-promote 経路C review の一貫性指摘（backlog-review 選定明記 item との基準統一）により保留から採用へ変更
