# regression test の fixture copy が新規依存モジュールを取りこぼす問題

## 観測

Issue #898 (RU-1 基盤整備) の実装で、`check_integrity.ts` に新規依存モジュール（`integrity_catalog_parser.ts`, `req_impact_map_parser.ts`, `gate_filter.ts`）を追加したところ、Issue #657 の regression test (`regression_issue616.test.ts` 内の `copyScripts()`) が新規モジュールをコピーせず、テスト実行時に import 解決失敗で新規 failure 4件が発生した。

`copyScripts()` は `check_integrity.ts` と `cli_utils.ts` のみをテンポラリディレクトリへコピーするハードコード実装であったため、新規モジュール追加時に手動でコピー対象へ追加する必要があった。

## 影響

- 新規スクリプトモジュールを `check_integrity.ts` ファミリに追加するたびに、regression test の `copyScripts()` を手動更新する必要がある
- 更新忘れは新規 failure として検知されるため致命的ではないが、ノイズ failure により真正な regression の見逃しリスクが生じる
- 同パターンの「テスト fixture が本物のファイル構成をミラーリングしていない」問題は他のテストファイルでも潜在する可能性がある

## レビューで決めること

- `copyScripts()` を「scripts ディレクトリの全 .ts ファイルをコピー」に一般化するか（本PR #911 で暫定的にそう修正済み）
- 一般化した場合、テスト実行時間への影響（ファイル数増）を許容するか
- 他のテストファイルでも同様の fixture copy パターンがあるか確認し、必要に応じて共通ヘルパーへ抽出するか

## 根拠

- PR #911: https://github.com/yogata/agent-dev-flow/pull/911
- 該当コード: `.opencode/skills/repo-agentdev-integrity/scripts/tests/check_integrity.test.ts` の `copyScripts()`
- Issue #657 regression test がこのパターンを導入
- 本PR で `copyScripts()` を全 .ts ファイルコピーに修正し、新規 failure 4件を解消
