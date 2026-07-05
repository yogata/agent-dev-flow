# REQ-0161.md 自己参照により REQ-0161-004/005 の strict pass が不可能

## 観測

PR #1417（Issue #1416, REQ-0161）で config.yaml および旧 doc-inputs 機構定義の完全削除を実施。削除対象を定義する要件文書 REQ-0161.md 自身が `docs/` 配下にあり、削除対象 ID（ADR-0133, REQ-0157）と検証コマンド（`rg "ADR-0133|REQ-0157|project-doc-inputs|config\.yaml" docs/`）をリテラル文字列として埋め込むため、以下が発生:

- REQ-0161-004（`rg ... docs/` が 0件）: REQ-0161.md 自身がマッチするため、自身を削除しない限り 0件到達不能
- REQ-0161-005（check_integrity.ts exit 0）: REQ-0161.md が REQ-0157/ADR-0133 への unique ref を保持するため broken-req-ref / broken-adr-ref / adr-req-crossref の 3 NG が発生し exit 1 となる

マージ後 main での最終検証結果:
- `rg "ADR-0133|REQ-0157|project-doc-inputs" docs/ src/ .opencode/`: REQ-0161.md 内のみ（ADR-0133: 3件, REQ-0157: 4件, project-doc-inputs: 3件）。src/ .opencode/ は 0件
- check_integrity.ts: 計 59 NG（うち 3件が REQ-0161.md 自己参照、残り 56件は既存 baseline）
- check_extensions.ts: exit 0, ok=true

## 影響

- 「削除対象を名指しする要件文書」と「削除対象を検索する検証コマンド」が同一 docs/ 配下に共存する構造的矛盾。要件定義の必然性（何を削除するか明記）と検証の厳格性（0件到達）が両立しない
- check_integrity.ts は作業前から baseline-failing（exit 1、56件の既存 NG）。本 PR のデルタは自己参照 3件のみだが、strict pass 基準 REQ-0161-005 は構造的に到達不能
- case-close QG-4 では「自己参照を除外すれば 0件」「baseline-failing の改善として評価」で PASS 判定したが、判定基準が ad-hoc になり機械化できない

## レビューで決めること

- 要件文書が削除対象 ID をリテラル含むことの例外扱いを、check_integrity.ts または REQ-0161 側で明示的に仕組み化するか（例: 自己参照の baseline 除外ロジック、要件文書の検証対象外指定）
- REQ-0161-004/005 の完了条件記述を「自己参照を除く」等の修飾へ改めるか（要件文書自体の編集は 別Issue 化）
- 検証コマンド `rg ... docs/` を要件文書に埋め込む運用を見直すか（コマンドは SPEC/runner 側へ分離し、要件文書は成果物状態のみ記述）

## 根拠

PR #1417 Findings/Capture候補 #1（F-001）より。case-close（Todo 6）で回収。Task MUST NOT DO「REQ-0161.md を編集しない（要件doc は確定済み）」により本 PR では編集せず intake 化。
