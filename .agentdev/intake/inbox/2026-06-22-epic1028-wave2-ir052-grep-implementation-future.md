# IR-052 完了条件 grep パターン: 実装未対応（design rule のみ）

## 発生源

- Epic: #1028 (Wave 2)
- Issue: #1032 (REQ-0145 / REQ-0145-011)
- PR: #1036 (merged, squash 244ea3b4)
- 発生日: 2026-06-22

## 内容

REQ-0145-011「完了条件 grep パターンは否定文脈・anti-pattern 例示を『未達』として捕捉しない（除外条件・スコープ段階化）」は IR-052 として `docs/specs/integrity-rule-catalog.md` に design rule を追加した。ただし現在の完了条件判定は推論ベース（QG-4 case-close Step 4）であり、grep ベースの実装は存在しない。

将来 grep ベース実装を追加する場合、IR-052 の設計基準（除外条件・スコープ段階化）に従う必要がある。

## 推奨対応先

別途整備 Issue（優先度低）。現在の推論ベース QG-4 で機能しているため、grep 実装は運用上の必要性が顕在化した段階で検討。

## 現在の追跡状態

- `docs/specs/integrity-rule-catalog.md` IR-052 design rule 追加済み（PR #1036）
- 実装ステータス: design only（implementation future）
