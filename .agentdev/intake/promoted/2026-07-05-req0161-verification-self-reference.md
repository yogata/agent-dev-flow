# REQ-0161 検証の構造的到達不能: 自己参照とタイトル過剰ヒット

## 観測内容

PR #1417（Issue #1416, REQ-0161）で config.yaml および旧 doc-inputs 機構定義の完全削除を実施。削除対象を定義する要件文書 REQ-0161.md 自身が `docs/` 配下にあり、削除対象 ID と検証コマンドをリテラル文字列として埋め込むため、2つの構造的課題が発生した。

### 課題1: REQ-0161.md 自己参照により strict pass が不可能

- REQ-0161-004（`rg ... docs/` が 0件）: REQ-0161.md 自身がマッチするため、自身を削除しない限り 0件到達不能
- REQ-0161-005（check_integrity.ts exit 0）: REQ-0161.md が REQ-0157/ADR-0133 への unique ref を保持するため broken-req-ref / broken-adr-ref / adr-req-crossref の 3 NG が発生し exit 1 となる

マージ後 main での最終検証結果:
- `rg "ADR-0133|REQ-0157|project-doc-inputs" docs/ src/ .opencode/`: REQ-0161.md 内のみ（ADR-0133: 3件, REQ-0157: 4件, project-doc-inputs: 3件）。src/ .opencode/ は 0件
- check_integrity.ts: 計 59 NG（うち 3件が REQ-0161.md 自己参照、残り 56件は既存 baseline）
- check_extensions.ts: exit 0, ok=true

### 課題2: README.md の REQ タイトル行が config.yaml 検索に過剰ヒット

`rg "config\.yaml" docs/` が `docs/requirements/README.md` の REQ-0161 エントリ行にマッチ:

```
| [REQ-0161](REQ-0161.md) | config.yaml および旧 doc-inputs 機構定義の完全削除 | ... |
```

これは REQ タイトル文字列（要件の簡易表現）であり、ファイルパス参照ではない。REQ-0161-004 の検証コマンドの正規表現が config.yaml にマッチするため、タイトル文字列が過剰ヒットする。

## 影響

- 「削除対象を名指しする要件文書」と「削除対象を検索する検証コマンド」が同一 docs/ 配下に共存する構造的矛盾。要件定義の必然性（何を削除するか明記）と検証の厳格性（0件到達）が両立しない
- check_integrity.ts は作業前から baseline-failing（exit 1、56件の既存 NG）。strict pass 基準 REQ-0161-005 は構造的に到達不能
- case-close QG-4 では「自己参照を除外すれば 0件」「baseline-failing の改善として評価」で PASS 判定したが、判定基準が ad-hoc になり機械化できない
- 検証基準の過剰厳格性。要件のタイトルが削除対象を含むとき、インデックスのタイトル列挙が検索に引っかかる

## 課題

- 要件文書が削除対象 ID をリテラル含むことの例外扱いを、check_integrity.ts または REQ-0161 側で明示的に仕組み化するか（例: 自己参照の baseline 除外ロジック、要件文書の検証対象外指定）
- REQ-0161-004/005 の完了条件記述を「自己参照を除く」等の修飾へ改めるか
- 検証コマンド `rg ... docs/` を要件文書に埋め込む運用を見直すか（コマンドは SPEC/runner 側へ分離し、要件文書は成果物状態のみ記述）
- README.md の REQ タイトル表記を「設定ファイル削除」等の一般化表現へ改めるか（REQ タイトル自体は維持し、インデックス表示のみ抽象化）
- 検証コマンドを「ID 参照とパス参照に限定し、キーワード（config.yaml）は除外」へ運用変更するか

## 既存要件との関連

- REQ-0161（config.yaml および旧 doc-inputs 機構定義の完全削除）
- REQ-0161-004（`rg ... docs/` が 0件）、REQ-0161-005（check_integrity.ts exit 0）
- check_integrity.ts（baseline-failing 59 NG）
- PR #1417 Findings/Capture候補 #1（F-001）、#2（F-002）
