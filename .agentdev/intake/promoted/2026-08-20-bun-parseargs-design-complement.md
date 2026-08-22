# Bun 実行環境の parseArgs 実装約束の checker-execution-contracts Design への補完

## 観測
PR #2356（node:util.parseArgs 移行）の実装と審議で、Bun 実行環境固有の実装約束が確定した。docs/designs/integrity/checker-execution-contracts.md「再帰ファイル探索と CLI 引数解析の標準API移行」に未記載の補完候補:

- (a) 位置引数トークンの kind は Bun 実装では `"positional"`（Node の型定義上は `"argument"`）。移行実装は Bun 実装に合わせ `"positional"` で判別
- (b) strict:false では値欠落の文字列オプションがエラーにならず `values.opt === true` になる（Bun・Node 共通）。トークンの `value === undefined` での判別が必要（回帰テストで固定済み）
- (c) `--opt=value` 形式・短縮クラスタ（`-hx` 等）は旧契約維持のため非採用とする判定表（標準 API が受理できる形式の新規公開仕様化をしない、REQ-044-003）
- 旧実装が `--` を終端として扱わない3対象の差（cli_utils=不活性、cli.ts=未知引数拒否、query_graph=サブコマンド候補）を各 Design の CLI 契約節へ正規記載するか
- bun 自身の CLI がスクリプト argv 先頭の `--` を削除する（非先頭は保持）。「先頭 `--`」は実 CLI 表面から観測不可能で、テストは非先頭位置で固定した（標準 API 移行とは独立の実行基盤挙動）

## 今回扱わない理由
PR #2356 は3対象の実装移行がスコープで、Design への約束の正規記載は含まれていない。PR 本文の Design確定候補として case-close の Design 確定チェックでの判断を提案する旨が記録されていた（処理パターン (c) 見送り、後続へ委譲）。

## 影響
約束が Design に正規記載されない限り、後続の parseArgs 移行（ OU-002 再帰探索移行後の CLI、その他 checker）で同一の踏み抜き（token kind 判別、値欠落判別、inlineValue 非採用）が再発生する可能性がある。現行実装・テストは PR #2356 で固定済みで機能影響なし。

## レビューで決めること
- checker-execution-contracts Design「再帰ファイル探索と CLI 引数解析の標準API移行」へ (a)(b)(c) を実装約束として追記するか
- 3対象の `--` 意味論差分の正規記載先（同 Design か各 CLI 契約節か）と記載可否
- bun の argv 先頭 `--` 削除の実行基盤挙動を Design またはテスト運用の注記に含めるか

## 根拠
- PR 2356 本文「Findings / Capture候補」1〜3件目および「Design確定候補」1・2（回収元: https://github.com/yogata/agent-dev-flow/pull/2356）
