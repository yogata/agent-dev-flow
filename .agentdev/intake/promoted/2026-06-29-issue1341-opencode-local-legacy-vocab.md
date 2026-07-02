# src/opencode-local/ 配下に旧語彙が残存

## 観測内容

PR #1344 の調査過程で、Issue #1341 の対象12ファイル外である `src/opencode-local/` 配下の `generation-flow.md`、`agentdev-gh-cli/case-schema/case-file.md` に旧語彙（変換プロンプト等）が存在することを確認した。本 PR #1344 は `src/opencode-local/README.md` のみを対象とし、これら2ファイルは未処理とした。

## 影響

- 実動作への影響なし
- 現行語彙へ未是正

## 課題

- `src/opencode-local/` 配下の旧語彙残存箇所の網羅的 grep（README.md のみでなく配下ファイル全体）
- 旧語彙のうち ADR-0126 / ADR-0131 の歴史経緯引用として保持すべきか、現行語彙へ置換すべきかの分類
- REQ-0141 系以外への影響有無（case-schema 等の別要件との絡み）

## 既存要件との関連

- ADR-0126: link mode 廃止経緯
- ADR-0131: link mode 語彙への移行
- REQ-0141 系: link mode 移行関連
- 本 item は `2026-07-02-issue1355-pr1356-generation-flow-broken-link.md` と関連（同一ディレクトリの語彙残存・broken link 問題）
- link mode / 変換プロンプト legacy vocabulary 残存クラスターに属し、backlog-review での統合を推奨

## 観測元

- PR #1344
- Issue #1341
