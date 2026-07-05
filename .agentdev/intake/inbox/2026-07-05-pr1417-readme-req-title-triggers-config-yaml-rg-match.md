# docs/requirements/README.md の REQ タイトル行が config.yaml 検索に引っかかる

## 観測

PR #1417（Issue #1416, REQ-0161）の最終検証で、`rg "config\.yaml" docs/` が `docs/requirements/README.md` の REQ-0161 エントリ行にマッチ:

```
| [REQ-0161](REQ-0161.md) | config.yaml および旧 doc-inputs 機構定義の完全削除 | ... |
```

これは REQ タイトル文字列（要件の簡易表現）であり、ファイルパス参照ではない。REQ-0161-004 の検証コマンド `rg "ADR-0133|REQ-0157|project-doc-inputs|config\.yaml" docs/` は正規表現で config.yaml にマッチするため、タイトル文字列が過剰ヒットする。

## 影響

- 検証基準の過剰厳格性。要件のタイトルが削除対象を含むとき、インデックスのタイトル列挙が検索に引っかかる
- README.md の REQ 一覧表記を見直すか（タイトルを一般化）、検証コマンドをパス参照限定へ絞るかの判断が必要

## レビューで決めること

- README.md の REQ タイトル表記を「設定ファイル削除」等の一般化表現へ改めるか（REQ タイトル自体は維持し、インデックス表示のみ抽象化）
- 検証コマンドを「ID 参照（ADR-0133/REQ-0157）とパス参照（project-doc-inputs）に限定し、キーワード（config.yaml）は除外」へ運用変更するか
- F-001（REQ-0161.md 自己参照）と併合して単一 intake で扱うか

## 根拠

PR #1417 Findings/Capture候補 #2（F-002）より。case-close（Todo 6）で回収。REQ-0161 のタイトルは要件の核心（config.yaml 削除）を示すため、タイトル自体の編集は別Issue判断。
