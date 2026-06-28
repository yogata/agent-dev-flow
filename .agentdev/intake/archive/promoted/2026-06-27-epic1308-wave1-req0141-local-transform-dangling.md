# REQ-0141.md に local-transform.md への dangling 参照が残存

## 観察

Phase A（PR #1314 / Issue #1309）で `docs/specs/local/local-transform.md` を削除し、`docs/` 配下の参照を整理した。しかし `docs/requirements/REQ-0141.md` に local-transform.md への参照が残存（line 45: "詳細は SPEC local-transform.md"、line 61: "関連 SPEC: ...local-transform.md..."）。REQ ファイルは本 Issue（docs_chore）の対象外（AG-008）のため未対応。

## 修正されなかった理由

REQ ファイルの変更は docs/specs/ 配下の文書正規化を対象とする Phase A（AG-008 対象外事項）のスコープ外。REQ 更新または独立した cleanup Issue で対応すべきと判断。

## 課題

- REQ-0141.md line 45, 61 の local-transform.md 参照を `local-generation.md` へ更新するか削除
- REQ-0141 自体の記載が現行（local-transform 削除後）でも整合するか確認

## 根拠

PR #1314 本文（Findings / Capture候補）より引用:

> REQ-0141.md 残存参照: `docs/requirements/REQ-0141.md` (line 45: "詳細は SPEC local-transform.md"、line 61: "関連 SPEC: ...local-transform.md...") に local-transform.md への参照が残存。REQ ファイルのため本Issue（docs_chore）の対象外（AG-008）。将来の REQ 更新または独立した cleanup Issue で対応すべき

## 観測元

- PR #1314
- Issue #1309
- Epic #1308（Phase A, Wave 1）
