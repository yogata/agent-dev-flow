## 観測内容
Phase A（PR #1314 / Issue #1309）で `docs/specs/local/local-transform.md` を削除し、`docs/` 配下の参照を整理した。しかし `docs/requirements/REQ-0141.md` に local-transform.md への参照が残存:
- Line 45: "詳細は SPEC local-transform.md"
- Line 61: "関連 SPEC: ...local-transform.md..."

## 影響
REQ ファイル内の dangling 参照による混乱および文書整合性への影響。

## 課題
- REQ-0141.md line 45, 61 の local-transform.md 参照を `local-generation.md` へ更新するか削除
- REQ-0141 自体の記載が現行（local-transform 削除後）でも整合するか確認

## 既存要件との関連
- AG-008: Phase A（docs/specs/ 配下の文書正規化）スコープ外事項として REQ ファイルの変更を除外
