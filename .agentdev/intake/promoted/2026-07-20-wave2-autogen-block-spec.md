# Wave 2 AUTOGEN block 仕様（ID 命名パターンと検査ヘルパー）

## 観測内容

Wave 2（PR #1629）で ADR README、REQ README、DOC-MAP の AUTOGEN 化を実施した際、2つの SPEC 確定候補が判明した。

1. AG-008/009/013 AUTOGEN block ID 命名パターン: `{target}-{section}-{subsection}` 形式（`adr-status-accepted`, `req-active-table`, `docmap-inventory`, `adr-baseline-count`, `adr-retired-table` 等）。Wave 1（catalog/rule-ownership）の `catalog-ir-entries-pre-045`, `rule-ownership-ir-crossref` と整合する命名規則である。SC-002 SPEC の生成規則として確定候補。
2. verifyAutogenBlocksInFile 共通ヘルパー: check_integrity.ts の IR-061 検査 `checkIndexGenerationConsistency` で、ファイル内の複数 AUTOGEN block の検証を一括処理するヘルパー関数。Wave 1 の catalog/rule-ownership 個別検証コードも本関数へリファクタリング可能。

Wave 1 では catalog/rule-ownership の2対象に個別対応し、命名パターンと検査ロジックを個別実装していた。Wave 2 で対象が5ファイルに増加した結果、命名パターンの標準化と検査ヘルパーの共通化が保守性・拡張性の観点から必要と判明した。

- 由来 PR: #1629
- 由来 Issue: #1624
- Epic: #1622 Wave 2
- Wave 1: PR #1628, Issue #1623（catalog/rule-ownership GENERATE 化、命名パターンと検査ロジックの原型）

## 影響

重要度: medium。新規 AUTOGEN block 追加時に命名パターンと検査ヘルパーの扱いが暗黙依存となる。Wave 1 個別実装コードが残置されたまま共通化されておらず、保守性が低下する。動作自体は正しい。

## 課題

AUTOGEN block ID 命名パターンが SC-002 SPEC で明文化されていない。verifyAutogenBlocksInFile ヘルパーの汎用化と Wave 1 個別コードの統合が未実施である。

## 既存要件・仕様との関連

- SC-002（`docs/specs/integrity/index-auto-generation.md`）: AUTOGEN 生成規約の SPEC。命名パターン `{target}-{section}-{subsection}` が未明文化（差分）。
- IR-061（`docs/specs/integrity/rules/IR-061-index-generation-consistency.md`、検査カテゴリ `index-generation-consistency`）: verifyAutogenBlocksInFile ヘルパーが検査で使用。
- AG-002 docs-check G01 原則: generate_indexes.ts の生成関数と check_integrity.ts の検査関数の論理的同一性保持。

## 対応方針の方向性

1. SC-002 SPEC へ AUTOGEN block ID 命名パターン `{target}-{section}-{subsection}` を明文化。target（`adr`, `req`, `docmap`, `catalog`, `rule-ownership` 等）、section（`baseline`, `status`, `active`, `retired`, `ir-entries`, `ir-crossref` 等）、subsection（`count`, `table`, `accepted`, `proposed`, `superseded`, `deprecated`, `pre-045`, `post-045` 等）。Wave 1/2 採用 ID を参考例として記載。
2. check_integrity.ts の verifyAutogenBlocksInFile ヘルパーを汎用化。Wave 1 の catalog/rule-ownership 個別検証コードを本関数へリファクタリング。スコープごとの case で検証を実行し、結果を ok/ng/count で報告。findFirstMismatch で期待値と実測の最初の不一致を特定。
3. 新規 AUTOGEN block 追加時のチェックリスト化: 命名パターン準拠、verifyAutogenBlocksInFile 検査対象追加、生成関数と検査関数の論理的同一性確認（AG-002 docs-check G01 原則）。

Wave 5 Phase E 全索引展開時に一括評価、または別 Issue で個別対応。Wave 3/4 で新規 AUTOGEN block を追加する際は、本候補の命名パターンとヘルパーを仮採用して進行可能。
