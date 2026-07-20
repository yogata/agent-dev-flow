# IR-060 body 表 `related_req` の正規化

## 問題事象

IR-060 の body 表 `related_req` に README/日本語混在表記（`REQ-0140（REQ-0140-033, ...）`）が含まれる。Wave 1 の rule-ownership appendix はそのまま文字列として抽出・表示し、データ忠实性優先・正規化は別 Issue とした。

## 発生局面

実装（Wave 1: catalog + rule-ownership GENERATE 化、IR-* 依存）

## 検知方法

実装中に IR-060 body 表 `related_req` を読み込み、README/日本語混在表記を検知。

## 根本原因

IR-060 は古い形式（本文表形式）で `related_req` を記載しており、README や日本語を含む説明文が混入している。IR-* frontmatter 標準形式（id/title/domain/related_req/related_spec）への移行未完了。

## 提案内容

IR-060 body 表 `related_req` を正規化し、README や日本語混在表記を除去する。具体案:
- README 文字列を削除または別列へ分離
- 日本語表記を英語のみに統一
- IR-* frontmatter 標準形式へ移行（related_req フィールドへの移行）

## 対象ファイル

- `docs/specs/integrity/rules/IR-060.md`

## 参照

- PR #1628, Issue #1623, Wave 1, IR-060

## 分類

具体的な修正候補（IR-* 正規化）

## 優先度

medium（Phase E 展開時の一括正規化に含める検討）