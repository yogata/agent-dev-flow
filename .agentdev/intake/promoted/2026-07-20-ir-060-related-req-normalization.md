# IR-060 body 表 `related_req` の正規化

## 観測内容

- 由来 PR #1628、Issue #1623（Wave 1）。発生局面は実装（Wave 1: catalog + rule-ownership GENERATE 化、IR-* 依存）。
- 実装中に `docs/specs/integrity/rules/IR-060.md` の body 表 `related_req` を読み込み、README/日本語混在表記（`REQ-0140（REQ-0140-033, ...）`）を検知。
- Wave 1 の rule-ownership appendix は当該表記をそのまま文字列として抽出・表示し、データ忠实性優先で正規化は別 Issue とした。

## 影響

低〜中。IR-* の機械処理可能性・一貫性を損なう。rule-ownership appendix が文字列として抽出・表示する際にノイズとなる。発生頻度は当該 IR が参照されるたびに潜在化。

## 課題

IR-060 は古い形式（本文表形式）で `related_req` を記載しており、README や日本語を含む説明文が混入。IR-* frontmatter 標準形式（id/title/domain/related_req/related_spec）への移行が未完了。

## 既存要件・仕様との関連

- IR-060: 対象の integrity rule。旧本文表形式から frontmatter 標準形式への移行未完了。
- REQ-0140: IR-060 の関連 REQ（正規化対象の related_req 内容）。

## 対応方針の方向性

IR-060 body 表 `related_req` を正規化し、README 文字列と日本語混在表記を除去する。具体案:

1. README 文字列を削除または別列へ分離。
2. 日本語表記を英語のみに統一。
3. IR-* frontmatter 標準形式（related_req フィールド）への移行。

優先度 medium。Phase E 展開時の一括正規化に含める候補。
