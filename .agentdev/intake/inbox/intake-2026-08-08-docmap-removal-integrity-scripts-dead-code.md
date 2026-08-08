# intake: DOC-MAP 削除後に .opencode/ integrity スクリプト群へ残存する DOC-MAP 検証ロジック（dead code）

## 発生日

2026-08-08

## 発生元

- Epic: #1952（REQ-013: DOC-MAP 依存除去）
- Issue: #1954（REQ-013 段階4b: 横断 DOC-MAP 参照除去と README ナビゲーション再編）
- PR: #1959
- 取得元: PR #1959 本文「## Findings / Capture候補」セクション

## 問題事象

DOC-MAP.md 本体および配布スキルを #1953 で物理削除し、現行ドキュメント体系から DOC-MAP 参照を #1959 で横断除去した。しかしコードレベルの DOC-MAP 依存（検証ロジック・テスト fixture）は .opencode/ 配下の integrity スクリプト群へ残存しており、DOC-MAP 削除後に dead code となっている。

残存箇所（概数）:

- check_integrity.ts（約40件）
- generate_indexes.ts（約10件）
- check_changed_docs.ts（約5件）
- 各種テスト fixture

これらはドキュメント参照ではなく機能コードの DOC-MAP 検証ロジックであり、#1954 のスコープ（横断 DOC-MAP 参照除去）の対象外とした。

## 影響

- DOC-MAP が存在しないにもかかわらず検証ロジックが DOC-MAP を走査対象に含み続け、dead code として保守負荷を生む
- IndexGenerationConsistency 等の検証カテゴリで DOC-MAP 関連の検査が無意味な NG/ skip を出力し続ける可能性
- 後続の integrity スクリプト改修時に DOC-MAP 関連分岐の存在が誤解を生む

## 発生局面

実装（#1954 横断 DOC-MAP 参照除去完了時。#1953 で DOC-MAP.md 物理削除後に表面化）

## 検知方法

PR #1959 実装者が .opencode/ integrity スクリプト群へ残存する DOC-MAP 検証ロジックを Findings セクションへ自己申告した。

## 想定される対応方向

- 別 Issue を起票し、check_integrity.ts、generate_indexes.ts、check_changed_docs.ts およびテスト fixture から DOC-MAP 検証ロジックを除去する
- 対象は機能コードのリファクタリングであり、ドキュメント編集ではないため REQ-013（DOC-MAP 依存除去）の続編而非ドキュメント横断除去 Issue として扱う
- baseline ファイル（.opencode/skills/repo-agentdev-integrity/scripts/src/integrity-baselines/）の DOC-MAP 関連エントリも併せて確認・整理

## 関連

- Epic: #1952
- Issue: #1953（DOC-MAP 本体削除）、#1954（横断参照除去）
- PR: #1959
- 実装: `.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts`、`generate_indexes.ts`、`check_changed_docs.ts`

## 出典引用

PR #1959 本文「## Findings / Capture候補」より:

> .opencode/ integrity scripts の DOC-MAP 検証ロジック: check_integrity.ts（~40件）、generate_indexes.ts（~10件）、check_changed_docs.ts（~5件）、test fixtures に DOC-MAP 検証ロジックが残存。機能コードのリファクタリングが必要。DOC-MAP.md が #1953 で削除された後、これらの検証関数は dead code となる。別 Issue での対応を推奨。

## タグ

#intake #doc-map #dead-code #integrity-scripts #code-refactoring #issue-1954 #epic-1952
