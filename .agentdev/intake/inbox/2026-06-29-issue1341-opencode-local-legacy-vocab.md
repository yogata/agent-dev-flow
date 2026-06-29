# src/opencode-local/ 配下に旧語彙が残存

## 観察

PR #1344 の調査過程で、Issue #1341 の対象12ファイル外である `src/opencode-local/` 配下の以下ファイルに旧語彙（変換プロンプト等）が存在することを確認した:

- `src/opencode-local/generation-flow.md`
- `src/opencode-local/agentdev-gh-cli/case-schema/case-file.md`

本 PR #1344 では `src/opencode-local/README.md` のみを対象とし、これら2ファイルは未処理。

## 修正されなかった理由

Issue #1341 の対象12ファイルリストにこれら2ファイルは含まれない。完了条件の範囲を維持するため、本 Issue では対象外とした。

## 課題

- `src/opencode-local/` 配下の旧語彙残存箇所の網羅的 grep（README.md のみでなく配下ファイル全体）
- 旧語彙のうち ADR-0126 / ADR-0131 の歴史経緯引用として保持すべきか、現行語彙へ置換すべきかの分類
- REQ-0141 系以外への影響有無（case-schema 等の別要件との絡み）

## 根拠

PR #1344 本文「## Findings / Capture候補」より引用:

> intake 候補: `src/opencode-local/generation-flow.md`、`src/opencode-local/agentdev-gh-cli/case-schema/case-file.md` にも旧語彙が存在するが、本 Issue 対象12ファイル外のため未処理。

## 観測元

- PR #1344
- Issue #1341
